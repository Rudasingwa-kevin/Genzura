/**
 * Public Controller
 * Handles public-facing endpoints that don't require authentication
 */
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
/**
 * GET /api/public/attorneys
 * Get all active attorneys for public directory
 */
export async function getPublicAttorneys(req, res) {
    try {
        const { search, location, caseType, limit = '50', offset = '0', } = req.query;
        const where = {
            status: 'Active',
            role: {
                in: ['Attorney', 'Senior_Attorney'],
            },
        };
        // Search by name or company
        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { company: { contains: search, mode: 'insensitive' } },
                { jobTitle: { contains: search, mode: 'insensitive' } },
            ];
        }
        // Filter by location
        if (location) {
            where.location = { contains: location, mode: 'insensitive' };
        }
        // Get attorneys
        const attorneys = await prisma.user.findMany({
            where,
            select: {
                id: true,
                name: true,
                email: true, // Will be hidden/obfuscated in response
                phone: true,
                company: true,
                location: true,
                jobTitle: true,
                avatarUrl: true,
                role: true,
                createdAt: true,
                // Include case statistics
                _count: {
                    select: {
                        cases: true,
                    },
                },
                cases: {
                    select: {
                        type: true,
                        status: true,
                    },
                    take: 100, // For calculating statistics
                },
            },
            skip: parseInt(offset),
            take: parseInt(limit),
            orderBy: {
                createdAt: 'desc',
            },
        });
        // Format response with statistics and obfuscated contact info
        const formattedAttorneys = attorneys.map((attorney) => {
            // Calculate case type expertise
            const caseTypes = attorney.cases.reduce((acc, c) => {
                acc[c.type] = (acc[c.type] || 0) + 1;
                return acc;
            }, {});
            // Calculate success rate (resolved cases)
            const resolvedCases = attorney.cases.filter((c) => c.status === 'Resolved').length;
            const totalCases = attorney.cases.length;
            const successRate = totalCases > 0 ? Math.round((resolvedCases / totalCases) * 100) : 0;
            // Get top 3 specializations
            const specializations = Object.entries(caseTypes)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 3)
                .map(([type]) => type);
            return {
                id: attorney.id,
                name: attorney.name,
                // Obfuscate email for privacy (show domain only until contact)
                emailDomain: attorney.email.split('@')[1],
                phone: attorney.phone, // Will be shown with "Contact" button
                company: attorney.company,
                location: attorney.location || 'Kigali, Rwanda',
                jobTitle: attorney.jobTitle || 'Attorney at Law',
                avatarUrl: attorney.avatarUrl,
                role: attorney.role,
                statistics: {
                    totalCases: attorney._count.cases,
                    activeCases: attorney.cases.filter((c) => c.status === 'Active')
                        .length,
                    resolvedCases,
                    successRate,
                    specializations,
                },
            };
        });
        // Get total count for pagination
        const total = await prisma.user.count({ where });
        return res.status(200).json({
            success: true,
            data: formattedAttorneys,
            pagination: {
                total,
                limit: parseInt(limit),
                offset: parseInt(offset),
                hasMore: parseInt(offset) + formattedAttorneys.length < total,
            },
        });
    }
    catch (error) {
        console.error('Error fetching public attorneys:', error);
        return res.status(500).json({
            error: 'Failed to fetch attorneys',
            details: error instanceof Error ? error.message : 'Unknown error',
        });
    }
}
/**
 * GET /api/public/attorneys/:id
 * Get detailed information about a specific attorney
 */
export async function getPublicAttorneyById(req, res) {
    try {
        const { id } = req.params;
        const attorney = await prisma.user.findFirst({
            where: {
                id,
                status: 'Active',
                role: {
                    in: ['Attorney', 'Senior_Attorney'],
                },
            },
            select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                company: true,
                location: true,
                jobTitle: true,
                avatarUrl: true,
                role: true,
                language: true,
                bio: true,
                education: true,
                barNumber: true,
                specializations: true,
                createdAt: true,
                _count: {
                    select: {
                        cases: true,
                    },
                },
                cases: {
                    select: {
                        type: true,
                        status: true,
                        priority: true,
                        createdAt: true,
                    },
                },
                professionalDocuments: {
                    where: {
                        isPublic: true,
                    },
                    select: {
                        id: true,
                        type: true,
                        title: true,
                        description: true,
                        fileUrl: true,
                        fileName: true,
                        fileSize: true,
                        mimeType: true,
                        issuedDate: true,
                        expiryDate: true,
                        issuer: true,
                        uploadedAt: true,
                    },
                    orderBy: {
                        displayOrder: 'asc',
                    },
                },
            },
        });
        if (!attorney) {
            return res.status(404).json({ error: 'Attorney not found' });
        }
        // Calculate detailed statistics
        const casesByType = attorney.cases.reduce((acc, c) => {
            acc[c.type] = (acc[c.type] || 0) + 1;
            return acc;
        }, {});
        const casesByStatus = attorney.cases.reduce((acc, c) => {
            acc[c.status] = (acc[c.status] || 0) + 1;
            return acc;
        }, {});
        const resolvedCases = casesByStatus['Resolved'] || 0;
        const totalCases = attorney.cases.length;
        const successRate = totalCases > 0 ? Math.round((resolvedCases / totalCases) * 100) : 0;
        // Get specializations with case counts
        const specializations = Object.entries(casesByType)
            .sort((a, b) => b[1] - a[1])
            .map(([type, count]) => ({
            type,
            count,
            percentage: Math.round((count / totalCases) * 100),
        }));
        const formattedAttorney = {
            id: attorney.id,
            name: attorney.name,
            email: attorney.email, // Full email shown on detail page
            phone: attorney.phone,
            company: attorney.company,
            location: attorney.location || 'Kigali, Rwanda',
            jobTitle: attorney.jobTitle || 'Attorney at Law',
            avatarUrl: attorney.avatarUrl,
            role: attorney.role,
            language: attorney.language,
            bio: attorney.bio,
            education: attorney.education,
            barNumber: attorney.barNumber,
            specializations: attorney.specializations || [],
            professionalDocuments: attorney.professionalDocuments,
            statistics: {
                totalCases: attorney._count.cases,
                activeCases: casesByStatus['Active'] || 0,
                pendingCases: casesByStatus['Pending'] || 0,
                resolvedCases,
                archivedCases: casesByStatus['Archived'] || 0,
                successRate,
                specializations,
            },
        };
        return res.status(200).json({
            success: true,
            data: formattedAttorney,
        });
    }
    catch (error) {
        console.error('Error fetching attorney details:', error);
        return res.status(500).json({
            error: 'Failed to fetch attorney details',
            details: error instanceof Error ? error.message : 'Unknown error',
        });
    }
}
/**
 * GET /api/public/attorney-locations
 * Get list of unique locations for filtering
 */
export async function getAttorneyLocations(req, res) {
    try {
        const attorneys = await prisma.user.findMany({
            where: {
                status: 'Active',
                role: {
                    in: ['Attorney', 'Senior_Attorney'],
                },
                location: {
                    not: null,
                },
            },
            select: {
                location: true,
            },
            distinct: ['location'],
        });
        const locations = attorneys
            .map((a) => a.location)
            .filter((l) => !!l)
            .sort();
        return res.status(200).json({
            success: true,
            data: locations,
        });
    }
    catch (error) {
        console.error('Error fetching locations:', error);
        return res.status(500).json({
            error: 'Failed to fetch locations',
        });
    }
}
/**
 * POST /api/public/contact-attorney
 * Send a contact request to an attorney
 */
export async function contactAttorney(req, res) {
    try {
        const { attorneyId, name, email, phone, message, caseType } = req.body;
        // Validate inputs
        if (!attorneyId || !name || !email || !message) {
            return res.status(400).json({
                error: 'Missing required fields: attorneyId, name, email, message',
            });
        }
        // Verify attorney exists
        const attorney = await prisma.user.findFirst({
            where: {
                id: attorneyId,
                status: 'Active',
                role: {
                    in: ['Attorney', 'Senior_Attorney'],
                },
            },
        });
        if (!attorney) {
            return res.status(404).json({ error: 'Attorney not found' });
        }
        // Store contact request as feedback
        const contactRequest = await prisma.feedback.create({
            data: {
                subject: `New Client Inquiry - ${caseType || 'General'}`,
                category: 'Client Inquiry',
                message: `
From: ${name}
Email: ${email}
Phone: ${phone || 'Not provided'}
Case Type: ${caseType || 'Not specified'}

Message:
${message}
        `.trim(),
                status: 'Pending',
                userId: attorneyId, // Link to attorney
            },
        });
        // TODO: Send email notification to attorney
        // You can use your emailService here
        return res.status(200).json({
            success: true,
            message: 'Contact request sent successfully',
            data: {
                id: contactRequest.id,
            },
        });
    }
    catch (error) {
        console.error('Error sending contact request:', error);
        return res.status(500).json({
            error: 'Failed to send contact request',
            details: error instanceof Error ? error.message : 'Unknown error',
        });
    }
}
//# sourceMappingURL=publicController.js.map