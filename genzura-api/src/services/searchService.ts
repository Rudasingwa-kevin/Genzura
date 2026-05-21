import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class SearchService {
  static async globalSearch(query: string, userId?: string) {
    const q = query.toLowerCase().trim();
    if (!q || q.length < 2) return { cases: [], users: [], documents: [] };

    // If no userId, return empty results
    if (!userId) return { cases: [], users: [], documents: [] };

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
                { title:       { contains: q, mode: 'insensitive' } },
                { client:      { name: { contains: q, mode: 'insensitive' } } },
                { client:      { company: { contains: q, mode: 'insensitive' } } },
                { description: { contains: q, mode: 'insensitive' } },
              ]
            }
          ]
        },
        select: { id: true, title: true, client: true, status: true, priority: true },
        take: 5,
      }),
      // Users search can be open (for collaboration purposes)
      prisma.user.findMany({
        where: {
          OR: [
            { name:  { contains: q, mode: 'insensitive' } },
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

    return { cases, users, documents };
  }
}
