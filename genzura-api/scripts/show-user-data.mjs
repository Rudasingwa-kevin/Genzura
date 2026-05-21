import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function showUserData() {
  console.log('📊 USER DATA SUMMARY\n');
  console.log('='.repeat(80));

  const users = await prisma.user.findMany({
    include: {
      cases: {
        select: { caseNumber: true, title: true, status: true }
      },
      teamMemberships: {
        include: {
          case: {
            select: { caseNumber: true, title: true, status: true }
          }
        }
      },
      notifications: {
        select: { id: true }
      }
    },
    orderBy: { name: 'asc' }
  });

  for (const user of users) {
    console.log(`\n👤 ${user.name} (${user.email})`);
    console.log(`   Role: ${user.role} | Status: ${user.status}`);

    // Lead attorney on these cases
    if (user.cases.length > 0) {
      console.log(`   📂 Lead Attorney on ${user.cases.length} case(s):`);
      user.cases.forEach(c => {
        console.log(`      - ${c.caseNumber}: ${c.title} [${c.status}]`);
      });
    }

    // Team member on these cases
    if (user.teamMemberships.length > 0) {
      console.log(`   👥 Team Member on ${user.teamMemberships.length} case(s):`);
      user.teamMemberships.forEach(tm => {
        console.log(`      - ${tm.case.caseNumber}: ${tm.case.title} [${tm.case.status}]`);
      });
    }

    if (user.cases.length === 0 && user.teamMemberships.length === 0) {
      console.log(`   ℹ️  No cases assigned yet`);
    }

    console.log(`   🔔 ${user.notifications.length} notification(s)`);
  }

  console.log('\n' + '='.repeat(80));
  console.log('\n✅ Summary complete\n');
}

showUserData()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
