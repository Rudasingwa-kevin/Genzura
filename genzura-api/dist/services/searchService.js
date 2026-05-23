import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
export class SearchService {
    static async globalSearch(query, userId) {
        try {
            const q = query.toLowerCase().trim();
            if (!q || q.length < 2)
                return { cases: [], users: [], documents: [] };
            // If no userId, return empty results
            if (!userId)
                return { cases: [], users: [], documents: [] };
            const [cases, users, documents] = await Promise.all([
                // Only search in cases the user has access to
                prisma.case.findMany({
                    where: {
                        AND: [
                            {
                                OR: [
                                    { attorneyId: userId },
                                    { team: { some: { userId: userId } } }
                                ]
                            },
                            {
                                OR: [
                                    { title: { contains: q, mode: 'insensitive' } },
                                    { caseNumber: { contains: q, mode: 'insensitive' } },
                                    { client: { name: { contains: q, mode: 'insensitive' } } },
                                    { client: { company: { contains: q, mode: 'insensitive' } } },
                                    { description: { contains: q, mode: 'insensitive' } },
                                ]
                            }
                        ]
                    },
                    select: {
                        id: true,
                        caseNumber: true,
                        title: true,
                        status: true,
                        priority: true,
                        client: {
                            select: {
                                name: true,
                            }
                        }
                    },
                    take: 5,
                }),
                // Users search can be open (for collaboration purposes)
                prisma.user.findMany({
                    where: {
                        OR: [
                            { name: { contains: q, mode: 'insensitive' } },
                            { email: { contains: q, mode: 'insensitive' } },
                        ],
                    },
                    select: { id: true, name: true, email: true, role: true, initials: true },
                    take: 5,
                }),
                // Only search documents from cases the user has access to
                prisma.caseDocument.findMany({
                    where: {
                        AND: [
                            {
                                case: {
                                    OR: [
                                        { attorneyId: userId },
                                        { team: { some: { userId: userId } } }
                                    ]
                                }
                            },
                            {
                                name: { contains: q, mode: 'insensitive' }
                            }
                        ]
                    },
                    select: { id: true, name: true, type: true, caseId: true },
                    take: 5,
                }),
            ]);
            // Transform cases to match frontend expected format
            const transformedCases = cases.map(c => ({
                id: c.id,
                caseNumber: c.caseNumber,
                title: c.title,
                client: c.client?.name || 'Unknown Client',
                status: c.status,
                priority: c.priority,
            }));
            return {
                cases: transformedCases,
                users,
                documents
            };
        }
        catch (error) {
            console.error('Search error:', error);
            // Return empty results on error instead of throwing
            return { cases: [], users: [], documents: [] };
        }
    }
}
//# sourceMappingURL=searchService.js.map