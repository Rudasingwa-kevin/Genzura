import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class SearchService {
  static async globalSearch(query: string) {
    const q = query.toLowerCase().trim();
    if (!q || q.length < 2) return { cases: [], users: [], documents: [] };

    const [cases, users, documents] = await Promise.all([
      prisma.case.findMany({
        where: {
          OR: [
            { title:       { contains: q, mode: 'insensitive' } },
            { client:      { contains: q, mode: 'insensitive' } },
            { description: { contains: q, mode: 'insensitive' } },
          ],
        },
        select: { id: true, title: true, client: true, status: true, priority: true },
        take: 5,
      }),
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
      prisma.caseDocument.findMany({
        where: {
          name: { contains: q, mode: 'insensitive' },
        },
        select: { id: true, name: true, type: true, caseId: true },
        take: 5,
      }),
    ]);

    return { cases, users, documents };
  }
}
