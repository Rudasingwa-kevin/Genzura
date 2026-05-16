/// <reference types="node" />
import { PrismaClient, UserRole, UserStatus, CaseStatus, CasePriority, CaseType } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const USERS = [
  { id: 'U-101', name: 'James Wilson', email: 'j.wilson@genzura.law', role: 'Senior_Attorney', status: 'Active', initials: 'JW' },
  { id: 'U-102', name: 'Sarah Miller', email: 's.miller@genzura.law', role: 'Admin', status: 'Active', initials: 'SM' },
  { id: 'U-103', name: 'David Chen', email: 'd.chen@genzura.law', role: 'Attorney', status: 'Active', initials: 'DC' },
  { id: 'U-104', name: 'Elena Rodriguez', email: 'e.rodriguez@genzura.law', role: 'Paralegal', status: 'Active', initials: 'ER' },
];

const CASES = [
  {
    caseNumber: 'CV-2026-0482',
    title: 'Alpha Corp v. Beta Inc',
    client: 'Alpha Corporation',
    clientEmail: 'legal@alphacorp.com',
    clientPhone: '+1 (555) 010-2030',
    clientCompany: 'Alpha Corp',
    attorneyId: 'U-101',
    status: 'Active' as CaseStatus,
    priority: 'High' as CasePriority,
    type: 'Litigation' as CaseType,
    deadline: '2026-08-15T00:00:00Z',
    description: 'Complex commercial litigation regarding breach of contract and intellectual property infringement.',
  },
  {
    caseNumber: 'IP-2026-7712',
    title: 'Tech Innovations Patent Filing',
    client: 'Tech Innovations LLC',
    clientEmail: 'ip@techinnovations.io',
    clientPhone: '+1 (555) 020-3040',
    clientCompany: 'Tech Innovations',
    attorneyId: 'U-103',
    status: 'Pending' as CaseStatus,
    priority: 'Medium' as CasePriority,
    type: 'IP' as CaseType,
    deadline: '2026-09-20T00:00:00Z',
    description: 'Filing of three utility patents for new semiconductor manufacturing processes.',
  },
  {
    caseNumber: 'CORP-2026-0012',
    title: 'Apex Global Merger',
    client: 'Apex Global Inc',
    clientEmail: 'm&a@apex.com',
    clientPhone: '+1 (555) 030-4050',
    clientCompany: 'Apex Global',
    attorneyId: 'U-101',
    status: 'Active' as CaseStatus,
    priority: 'High' as CasePriority,
    type: 'Corporate' as CaseType,
    deadline: '2026-11-05T00:00:00Z',
    description: 'Regulatory review and contract negotiation for the acquisition of Z-Tech Systems.',
  },
];

async function main() {
  console.log('🌱 Seeding database with government case numbers...');

  const passwordHash = await bcrypt.hash('Genzura2026!', 10);

  // Users
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

  // Cases
  for (const c of CASES) {
    await prisma.case.upsert({
      where: { caseNumber: c.caseNumber },
      update: {},
      create: {
        ...c,
        filedDate: new Date(),
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
