import { PrismaClient, CaseType, CaseStatus, CasePriority } from '@prisma/client';

const prisma = new PrismaClient();

const CASES = [
  {
    title: 'Alpha Corp v. Beta Inc',
    client: 'John Doe',
    clientEmail: 'john@alphacorp.com',
    clientPhone: '555-0100',
    clientCompany: 'Alpha Corp',
    type: CaseType.Litigation,
    status: CaseStatus.Active,
    priority: CasePriority.High,
    description: 'Breach of contract regarding the 2024 supply agreement.',
  },
  {
    title: 'Estate of Smith',
    client: 'Jane Smith',
    clientEmail: 'jane@smithfamily.org',
    clientPhone: '555-0101',
    clientCompany: 'N/A',
    type: CaseType.Real_Estate,
    status: CaseStatus.Pending,
    priority: CasePriority.Medium,
    description: 'Property dispute over the coastal estate.',
  },
  {
    title: 'Tech Innovations Patent Filing',
    client: 'Bob Roberts',
    clientEmail: 'bob@techinnovations.io',
    clientPhone: '555-0102',
    clientCompany: 'Tech Innovations',
    type: CaseType.IP,
    status: CaseStatus.Active,
    priority: CasePriority.Low,
    description: 'Filing for the new AI algorithm patent.',
  },
  {
    title: 'Gamma LLC Merger',
    client: 'Alice Cooper',
    clientEmail: 'alice@gammallc.net',
    clientPhone: '555-0103',
    clientCompany: 'Gamma LLC',
    type: CaseType.MA,
    status: CaseStatus.Resolved,
    priority: CasePriority.High,
    description: 'Acquisition of Delta startup.',
  },
  {
    title: 'Employee Dispute: Doe v. MegaCorp',
    client: 'Michael Doe',
    clientEmail: 'michael@doe.com',
    clientPhone: '555-0104',
    clientCompany: 'MegaCorp',
    type: CaseType.Employment,
    status: CaseStatus.Active,
    priority: CasePriority.Medium,
    description: 'Wrongful termination lawsuit.',
  }
];

async function main() {
  console.log('Fetching an attorney to assign cases...');
  const user = await prisma.user.findFirst({
    where: { role: 'Attorney' }
  });

  if (!user) {
    console.error('No attorney found in the database. Please create a user first.');
    return;
  }

  console.log(`Assigning cases to ${user.name}...`);

  for (const caseData of CASES) {
    await prisma.case.create({
      data: {
        ...caseData,
        attorneyId: user.id,
        deadline: new Date(new Date().setMonth(new Date().getMonth() + 3)), // 3 months from now
      }
    });
  }

  console.log('✅ Successfully created 5 cases!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
