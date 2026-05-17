import { PrismaClient, UserRole, UserStatus, CaseStatus, CasePriority, CaseType } from '@prisma/client';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

const USERS = [
  { id: 'U-101', name: 'James Wilson', email: 'j.wilson@genzura.law', role: 'Senior_Attorney', status: 'Active', initials: 'JW' },
  { id: 'U-102', name: 'Sarah Miller', email: 's.miller@genzura.law', role: 'Admin', status: 'Active', initials: 'SM' },
  { id: 'U-103', name: 'David Chen', email: 'd.chen@genzura.law', role: 'Attorney', status: 'Active', initials: 'DC' },
  { id: 'U-104', name: 'Elena Rodriguez', email: 'e.rodriguez@genzura.law', role: 'Paralegal', status: 'Active', initials: 'ER' },
];

const CLIENTS = [
  { id: 'C-001', name: 'Alpha Corporation Legal', email: 'legal@alphacorp.com', phone: '+1 (555) 010-2030', company: 'Alpha Corp', industry: 'Technology' },
  { id: 'C-002', name: 'Tech Innovations IP Dept', email: 'ip@techinnovations.io', phone: '+1 (555) 020-3040', company: 'Tech Innovations', industry: 'Semiconductors' },
  { id: 'C-003', name: 'Apex Global M&A', email: 'ma@apex.com', phone: '+1 (555) 030-4050', company: 'Apex Global', industry: 'Finance' },
];

const CASES = [
  {
    caseNumber: 'CV-2026-0482',
    title: 'Alpha Corp v. Beta Inc',
    clientId: 'C-001',
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
    clientId: 'C-002',
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
    clientId: 'C-003',
    attorneyId: 'U-101',
    status: 'Active' as CaseStatus,
    priority: 'High' as CasePriority,
    type: 'Corporate' as CaseType,
    deadline: '2026-11-05T00:00:00Z',
    description: 'Regulatory review and contract negotiation for the acquisition of Z-Tech Systems.',
  },
];

async function main() {
  console.log('🌱 Starting seed process...');
  
  try {
    const passwordHash = await bcrypt.hash('Genzura2026!', 10);
    console.log('🔑 Password hash generated.');

    // Users
    console.log('👥 Seeding users...');
    for (const user of USERS) {
      console.log(`   - Upserting user: ${user.email}`);
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

    // Clients
    console.log('🏢 Seeding clients...');
    for (const client of CLIENTS) {
      console.log(`   - Upserting client: ${client.email}`);
      await prisma.client.upsert({
        where: { email: client.email },
        update: {},
        create: client,
      });
    }

    // Cases
    console.log('📂 Seeding cases...');
    for (const c of CASES) {
      console.log(`   - Upserting case: ${c.caseNumber}`);
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
  } catch (error) {
    console.error('❌ Error during seeding:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
