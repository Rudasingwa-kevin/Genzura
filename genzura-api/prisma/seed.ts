import { PrismaClient, UserRole, UserStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const USERS = [
  { id: 'U-101', name: 'James Wilson', email: 'j.wilson@genzura.law', role: 'Senior_Attorney', status: 'Active', initials: 'JW' },
  { id: 'U-102', name: 'Sarah Miller', email: 's.miller@genzura.law', role: 'Admin', status: 'Active', initials: 'SM' },
  { id: 'U-103', name: 'David Chen', email: 'd.chen@genzura.law', role: 'Attorney', status: 'Active', initials: 'DC' },
  { id: 'U-104', name: 'Elena Rodriguez', email: 'e.rodriguez@genzura.law', role: 'Paralegal', status: 'Active', initials: 'ER' },
  { id: 'U-105', name: 'Marcus Wright', email: 'm.wright@genzura.law', role: 'Attorney', status: 'Invited', initials: 'MW' },
  { id: 'U-106', name: 'Laura Knight', email: 'l.knight@genzura.law', role: 'Support', status: 'Active', initials: 'LK' },
  { id: 'U-107', name: 'Kevin Thorne', email: 'k.thorne@genzura.law', role: 'Senior_Attorney', status: 'Suspended', initials: 'KT' },
];

async function main() {
  console.log('🌱 Seeding database...');

  const passwordHash = await bcrypt.hash('Genzura2026!', 10);

  for (const user of USERS) {
    await prisma.user.upsert({
      where: { email: user.email },
      update: {},
      create: {
        id: user.id,
        name: user.name,
        email: user.email,
        passwordHash,
        role: user.role as UserRole,
        status: user.status as UserStatus,
        initials: user.initials,
      },
    });
  }

  console.log('✅ Seed complete.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
