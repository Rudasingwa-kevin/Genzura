import { PrismaClient } from '@prisma/client';
import { emitToAll } from '../socket.js';
import { NotificationService } from './notificationService.js';
import { DateService } from '../utils/dateUtils.js';
const prisma = new PrismaClient();
export class CaseService {
    static async getAllCases(userId) {
        // All users (including admins) only see cases they're assigned to
        if (userId) {
            return prisma.case.findMany({
                where: {
                    OR: [
                        { attorneyId: userId },
                        {
                            team: {
                                some: {
                                    userId: userId
                                }
                            }
                        }
                    ]
                },
                include: {
                    attorney: true,
                    client: true,
                    team: {
                        include: { user: true }
                    }
                },
                orderBy: { updatedAt: 'desc' }
            });
        }
        // If no userId provided, return empty array (no unauthorized access)
        return [];
    }
    static async getCaseById(idOrCaseNumber, userId, userRole) {
        // Try to find by caseNumber first (if it matches the pattern), then by ID
        // Flexible pattern: PREFIX-NUMBERS (e.g., CV-2025-003, CV-2026-0482, IP-2024-1234)
        // Matches both PREFIX-NUMBERS (e.g. CV-0098) and PREFIX-NUMBERS-NUMBERS (e.g. CV-2025-003)
        const isCaseNumber = /^[A-Z]+-\d+(-\d+)?(-COPY\d*)?$/.test(idOrCaseNumber);
        const whereClause = isCaseNumber
            ? { caseNumber: idOrCaseNumber }
            : { id: idOrCaseNumber };
        const caseData = await prisma.case.findUnique({
            where: whereClause,
            include: {
                attorney: true,
                client: true,
                team: {
                    include: { user: true }
                },
                timeline: {
                    include: { author: true },
                    orderBy: { timestamp: 'desc' }
                },
                documents: {
                    include: { uploadedBy: true }
                },
                notes: {
                    include: { author: true },
                    orderBy: { timestamp: 'desc' }
                }
            }
        });
        // If no case found, return null
        if (!caseData)
            return null;
        // Check if user has access (is attorney or team member)
        // Admins and SuperAdmins can view any case
        if (userId) {
            const isAdmin = userRole === 'Admin' || userRole === 'SuperAdmin';
            const hasAccess = isAdmin ||
                caseData.attorneyId === userId ||
                caseData.team.some(member => member.userId === userId);
            if (!hasAccess) {
                throw new Error('You do not have permission to access this case');
            }
        }
        return caseData;
    }
    static async createCase(data) {
        return prisma.case.create({
            data: {
                ...data,
                filedDate: DateService.now(),
            }
        });
    }
    static async updateCaseStatus(idOrCaseNumber, status, userId) {
        // Support updating by case number or ID
        const isCaseNumber = /^[A-Z]+-\d+(-\d+)?(-COPY\d*)?$/.test(idOrCaseNumber);
        const whereClause = isCaseNumber
            ? { caseNumber: idOrCaseNumber }
            : { id: idOrCaseNumber };
        // Get old status
        const oldCase = await prisma.case.findUnique({ where: whereClause });
        const oldStatus = oldCase?.status;
        const updatedCase = await prisma.case.update({
            where: whereClause,
            data: { status }
        });
        // Create timeline entry for status change
        if (userId && oldStatus !== status) {
            await prisma.timelineEvent.create({
                data: {
                    caseId: updatedCase.id,
                    authorId: userId,
                    type: 'status',
                    description: `Status changed from ${oldStatus} to ${status}`,
                    timestamp: DateService.now()
                }
            });
        }
        const notification = await NotificationService.createNotification({
            userId: updatedCase.attorneyId,
            type: 'case',
            title: 'Case Status Updated',
            body: `Case ${updatedCase.title} is now ${status}`,
            link: `/cases/${updatedCase.caseNumber || updatedCase.id}`
        });
        emitToAll('new_notification', notification);
        emitToAll('case_status_updated', updatedCase);
        return updatedCase;
    }
    static async addNote(caseId, authorId, text) {
        const note = await prisma.caseNote.create({
            data: {
                caseId,
                authorId,
                text,
            }
        });
        const caseObj = await prisma.case.findUnique({ where: { id: caseId } });
        if (caseObj) {
            const notification = await NotificationService.createNotification({
                userId: caseObj.attorneyId,
                type: 'case',
                title: 'New Case Note',
                body: `A new note was added to case ${caseObj.title}.`,
                link: `/cases/${caseObj.caseNumber || caseObj.id}`
            });
            emitToAll('new_notification', notification);
        }
        emitToAll('new_case_note', { caseId, note });
        return note;
    }
    static async getAnalytics(userId) {
        // Build where clause to filter by user assignment
        const whereClause = userId ? {
            OR: [
                { attorneyId: userId },
                { team: { some: { userId: userId } } }
            ]
        } : {};
        const totalCases = await prisma.case.count({ where: whereClause });
        const statusCounts = await prisma.case.groupBy({
            by: ['status'],
            _count: true,
            where: whereClause
        });
        const priorityCounts = await prisma.case.groupBy({
            by: ['priority'],
            _count: true,
            where: whereClause
        });
        // Get all cases with dates for calculations
        const allCases = await prisma.case.findMany({
            where: whereClause,
            select: {
                id: true,
                status: true,
                createdAt: true,
                updatedAt: true,
                filedDate: true,
                attorneyId: true
            }
        });
        // Calculate average resolution days (for resolved cases)
        const resolvedCases = allCases.filter(c => c.status === 'Resolved' || c.status === 'Archived');
        const avgResolutionDays = resolvedCases.length > 0
            ? Math.round(resolvedCases.reduce((sum, c) => {
                const days = Math.floor((c.updatedAt.getTime() - c.filedDate.getTime()) / (1000 * 60 * 60 * 24));
                return sum + days;
            }, 0) / resolvedCases.length)
            : 0;
        // Calculate win rate (resolved vs total closed)
        const closedCases = allCases.filter(c => c.status === 'Resolved' || c.status === 'Archived');
        const successfulCases = allCases.filter(c => c.status === 'Resolved');
        const winRate = closedCases.length > 0
            ? Math.round((successfulCases.length / closedCases.length) * 100)
            : 0;
        // Case volume by month (current year)
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const currentYear = new Date().getFullYear();
        const volumeByMonth = months.map((month, index) => ({
            month,
            count: allCases.filter(c => c.createdAt.getFullYear() === currentYear &&
                c.createdAt.getMonth() === index).length
        }));
        // Calculate trends (compare last 30 days vs previous 30 days)
        const now = new Date();
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);
        const casesLast30Days = allCases.filter(c => c.createdAt >= thirtyDaysAgo);
        const casesPrevious30Days = allCases.filter(c => c.createdAt >= sixtyDaysAgo && c.createdAt < thirtyDaysAgo);
        const openedTrend = casesPrevious30Days.length > 0
            ? Math.round(((casesLast30Days.length - casesPrevious30Days.length) / casesPrevious30Days.length) * 100)
            : 0;
        const resolvedLast30 = casesLast30Days.filter(c => c.status === 'Resolved').length;
        const resolvedPrevious30 = casesPrevious30Days.filter(c => c.status === 'Resolved').length;
        const closedTrend = resolvedPrevious30 > 0
            ? Math.round(((resolvedLast30 - resolvedPrevious30) / resolvedPrevious30) * 100)
            : 0;
        // Attorney leaderboard - Only show attorneys who work on cases the user has access to
        let attorneyStats = [];
        if (userId) {
            // For regular users: Only show yourself in the leaderboard
            const currentUser = await prisma.user.findUnique({
                where: { id: userId },
                select: {
                    id: true,
                    name: true,
                    initials: true,
                    role: true,
                    cases: {
                        where: whereClause,
                        select: { status: true }
                    },
                    teamMemberships: {
                        where: {
                            case: whereClause
                        },
                        select: {
                            case: {
                                select: { status: true }
                            }
                        }
                    }
                }
            });
            if (currentUser && ['Attorney', 'Senior_Attorney'].includes(currentUser.role)) {
                const leadCases = currentUser.cases;
                const teamCases = currentUser.teamMemberships.map(tm => tm.case);
                const allAttorneyCases = [...leadCases, ...teamCases];
                const totalCases = allAttorneyCases.length;
                const resolved = allAttorneyCases.filter(c => c.status === 'Resolved').length;
                const rate = totalCases > 0 ? Math.round((resolved / totalCases) * 100) : 0;
                attorneyStats = [{
                        name: currentUser.name,
                        initials: currentUser.initials,
                        cases: totalCases,
                        resolved,
                        rate
                    }];
            }
        }
        else {
            // For admin/system view (no userId): Show all attorneys with their stats
            const attorneys = await prisma.user.findMany({
                where: {
                    role: { in: ['Attorney', 'Senior_Attorney'] }
                },
                select: {
                    id: true,
                    name: true,
                    initials: true,
                    cases: {
                        select: { status: true }
                    },
                    teamMemberships: {
                        select: {
                            case: {
                                select: { status: true }
                            }
                        }
                    }
                }
            });
            attorneyStats = attorneys.map(attorney => {
                const leadCases = attorney.cases;
                const teamCases = attorney.teamMemberships.map(tm => tm.case);
                const allAttorneyCases = [...leadCases, ...teamCases];
                const totalCases = allAttorneyCases.length;
                const resolved = allAttorneyCases.filter(c => c.status === 'Resolved').length;
                const rate = totalCases > 0 ? Math.round((resolved / totalCases) * 100) : 0;
                return {
                    name: attorney.name,
                    initials: attorney.initials,
                    cases: totalCases,
                    resolved,
                    rate
                };
            }).filter(a => a.cases > 0) // Only show attorneys with cases
                .sort((a, b) => b.rate - a.rate)
                .slice(0, 10); // Top 10
        }
        return {
            totalCases,
            statusCounts,
            priorityCounts,
            volumeByMonth,
            avgResolutionDays,
            winRate,
            trends: {
                opened: openedTrend,
                closed: closedTrend,
                avgDays: 0, // Would need historical data to calculate
                winRate: 0 // Would need historical data to calculate
            },
            attorneyStats
        };
    }
    static async addTeamMember(caseId, userId, addedBy) {
        // Get user info for timeline
        const user = await prisma.user.findUnique({ where: { id: userId } });
        // Create the team member
        await prisma.caseTeam.create({
            data: {
                caseId,
                userId,
                role: 'Collaborator' // Default role
            }
        });
        // Create timeline entry
        if (addedBy && user) {
            await prisma.timelineEvent.create({
                data: {
                    caseId,
                    authorId: addedBy,
                    type: 'team_added',
                    description: `${user.name} was added to the case team`,
                    timestamp: DateService.now()
                }
            });
        }
        // Return the full updated case with all relationships
        const updatedCase = await prisma.case.findUnique({
            where: { id: caseId },
            include: {
                client: true,
                attorney: true,
                team: {
                    include: {
                        user: true
                    }
                },
                timeline: {
                    include: {
                        author: true
                    },
                    orderBy: { timestamp: 'desc' }
                },
                documents: {
                    include: {
                        uploadedBy: true
                    },
                    orderBy: { uploadedAt: 'desc' }
                },
                notes: {
                    include: {
                        author: true
                    },
                    orderBy: { timestamp: 'desc' }
                }
            }
        });
        emitToAll('case_team_updated', { caseId, case: updatedCase });
        return updatedCase;
    }
    static async updateCase(idOrCaseNumber, data, userId) {
        // Support updating by case number or ID
        const isCaseNumber = /^[A-Z]+-\d+(-\d+)?(-COPY\d*)?$/.test(idOrCaseNumber);
        const whereClause = isCaseNumber
            ? { caseNumber: idOrCaseNumber }
            : { id: idOrCaseNumber };
        // Get the old case data to track changes
        const oldCase = await prisma.case.findUnique({
            where: whereClause,
            include: { attorney: true, client: true }
        });
        if (!oldCase) {
            throw new Error('Case not found');
        }
        // Update the case
        const updatedCase = await prisma.case.update({
            where: whereClause,
            data: {
                ...data,
                updatedAt: DateService.now()
            },
            include: {
                attorney: true,
                client: true,
                team: {
                    include: { user: true }
                },
                timeline: {
                    include: { author: true },
                    orderBy: { timestamp: 'desc' }
                },
                documents: {
                    include: { uploadedBy: true }
                },
                notes: {
                    include: { author: true },
                    orderBy: { timestamp: 'desc' }
                }
            }
        });
        // Track changes in timeline
        if (userId) {
            const changes = [];
            // Define field labels for better readability
            const fieldLabels = {
                title: 'Title',
                description: 'Description',
                status: 'Status',
                priority: 'Priority',
                type: 'Type',
                courtName: 'Court Name',
                courtLocation: 'Court Location',
                clientId: 'Client',
                attorneyId: 'Attorney',
                filingDate: 'Filing Date',
                hearingDate: 'Hearing Date',
                estimatedValue: 'Estimated Value'
            };
            // Check each field for changes
            for (const [field, label] of Object.entries(fieldLabels)) {
                if (data[field] !== undefined && oldCase[field] !== data[field]) {
                    const oldValue = oldCase[field];
                    const newValue = data[field];
                    // Format values for display
                    let oldDisplay = oldValue?.toString() || 'None';
                    let newDisplay = newValue?.toString() || 'None';
                    // Special formatting for specific fields
                    if (field === 'clientId') {
                        oldDisplay = oldCase.client?.name || 'None';
                        newDisplay = updatedCase.client?.name || 'None';
                    }
                    else if (field === 'attorneyId') {
                        oldDisplay = oldCase.attorney?.name || 'None';
                        newDisplay = updatedCase.attorney?.name || 'None';
                    }
                    else if (field.includes('Date') && newValue) {
                        newDisplay = new Date(newValue).toLocaleDateString();
                        if (oldValue)
                            oldDisplay = new Date(oldValue).toLocaleDateString();
                    }
                    else if (field === 'estimatedValue' && newValue) {
                        newDisplay = `$${Number(newValue).toLocaleString()}`;
                        if (oldValue)
                            oldDisplay = `$${Number(oldValue).toLocaleString()}`;
                    }
                    changes.push(`${label}: ${oldDisplay} → ${newDisplay}`);
                }
            }
            // Create timeline entry if there are changes
            if (changes.length > 0) {
                await prisma.timelineEvent.create({
                    data: {
                        caseId: updatedCase.id,
                        authorId: userId,
                        type: 'updated',
                        description: changes.join('\n'),
                        timestamp: DateService.now()
                    }
                });
            }
        }
        emitToAll('case_updated', updatedCase);
        return updatedCase;
    }
    static async duplicateCase(idOrCaseNumber, requestingUserId) {
        // Find the original case
        const original = await this.getCaseById(idOrCaseNumber, requestingUserId);
        if (!original)
            throw new Error('Case not found');
        // Generate a unique case number based on the original's number
        const baseNumber = original.caseNumber.replace(/-COPY(\d*)$/, '');
        const existingSuffixes = await prisma.case.findMany({
            where: { caseNumber: { startsWith: `${baseNumber}-COPY` } },
            select: { caseNumber: true }
        });
        const nextIndex = existingSuffixes.length + 1;
        const newCaseNumber = `${baseNumber}-COPY${nextIndex > 1 ? nextIndex : ''}`;
        const newCase = await prisma.case.create({
            data: {
                caseNumber: newCaseNumber,
                title: `${original.title} (Copy)`,
                description: original.description,
                type: original.type,
                priority: original.priority,
                status: 'Pending',
                deadline: original.deadline,
                clientId: original.clientId,
                attorneyId: requestingUserId, // Assign to the duplicating attorney
                filedDate: DateService.now(),
            },
            include: {
                attorney: true,
                client: true,
                team: { include: { user: true } },
                timeline: { include: { author: true }, orderBy: { timestamp: 'desc' } },
                documents: { include: { uploadedBy: true } },
                notes: { include: { author: true }, orderBy: { timestamp: 'desc' } }
            }
        });
        // Add an initial timeline event
        await prisma.timelineEvent.create({
            data: {
                caseId: newCase.id,
                authorId: requestingUserId,
                type: 'filed',
                description: `Case duplicated from ${original.caseNumber}`,
                timestamp: DateService.now()
            }
        });
        emitToAll('case_created', newCase);
        return newCase;
    }
    static async deleteCase(idOrCaseNumber) {
        // Support deleting by case number or ID
        const isCaseNumber = /^[A-Z]+-\d+(-\d+)?(-COPY\d*)?$/.test(idOrCaseNumber);
        // First find the case to get its actual ID for related records
        const caseToDelete = await this.getCaseById(idOrCaseNumber);
        if (!caseToDelete) {
            throw new Error('Case not found');
        }
        // Delete related records first if not handled by cascade
        await prisma.caseTeam.deleteMany({ where: { caseId: caseToDelete.id } });
        await prisma.timelineEvent.deleteMany({ where: { caseId: caseToDelete.id } });
        await prisma.caseDocument.deleteMany({ where: { caseId: caseToDelete.id } });
        await prisma.caseNote.deleteMany({ where: { caseId: caseToDelete.id } });
        const whereClause = isCaseNumber
            ? { caseNumber: idOrCaseNumber }
            : { id: idOrCaseNumber };
        const deletedCase = await prisma.case.delete({
            where: whereClause
        });
        emitToAll('case_deleted', { id: caseToDelete.id });
        return deletedCase;
    }
    static async removeTeamMember(caseId, userId, removedBy) {
        // Get user info for timeline before deletion
        const user = await prisma.user.findUnique({ where: { id: userId } });
        // Delete the team member
        await prisma.caseTeam.deleteMany({
            where: {
                caseId,
                userId
            }
        });
        // Create timeline entry
        if (removedBy && user) {
            await prisma.timelineEvent.create({
                data: {
                    caseId,
                    authorId: removedBy,
                    type: 'team_removed',
                    description: `${user.name} was removed from the case team`,
                    timestamp: DateService.now()
                }
            });
        }
        // Return the updated case with all relationships
        const updatedCase = await prisma.case.findUnique({
            where: { id: caseId },
            include: {
                client: true,
                attorney: true,
                team: {
                    include: {
                        user: true
                    }
                },
                timeline: {
                    include: {
                        author: true
                    },
                    orderBy: { timestamp: 'desc' }
                },
                documents: {
                    include: {
                        uploadedBy: true
                    },
                    orderBy: { uploadedAt: 'desc' }
                },
                notes: {
                    include: {
                        author: true
                    },
                    orderBy: { timestamp: 'desc' }
                }
            }
        });
        emitToAll('case_team_updated', { caseId, case: updatedCase });
        return updatedCase;
    }
}
//# sourceMappingURL=caseService.js.map