import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  console.log('\n📊 Current users in database:\n');
  
  const users = await prisma.user.findMany({
    select: {
      email: true,
      name: true,
      role: true,
      subscriptionPlan: true,
      subscriptionEndDate: true,
      _count: {
        select: { cases: true, uploadedDocs: true }
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  if (users.length === 0) {
    console.log('❌ No users found in database');
    return;
  }

  console.log(`Found ${users.length} users\n`);

  users.forEach((user, i) => {
    const now = new Date();
    const endDate = user.subscriptionEndDate ? new Date(user.subscriptionEndDate) : null;
    let status = 'No expiry';
    
    if (endDate) {
      const daysUntil = Math.ceil((endDate - now) / (1000 * 60 * 60 * 24));
      if (daysUntil < -3) status = `⛔ EXPIRED ${Math.abs(daysUntil)} days ago (should downgrade)`;
      else if (daysUntil < 0) status = `⚠️  In grace period (expired ${Math.abs(daysUntil)} days ago)`;
      else if (daysUntil === 0) status = '⏰ Expires TODAY';
      else if (daysUntil === 1) status = '🔴 Expires TOMORROW';
      else if (daysUntil <= 7) status = `🟡 Expires in ${daysUntil} days`;
      else status = `🟢 Expires in ${daysUntil} days`;
    }
    
    console.log(`${i+1}. ${user.name} (${user.email}) [${user.role}]`);
    console.log(`   Plan: ${user.subscriptionPlan} | Status: ${status}`);
    console.log(`   Cases: ${user._count.cases} | Docs: ${user._count.uploadedDocs}`);
    if (endDate) console.log(`   End Date: ${endDate.toISOString().split('T')[0]}`);
    console.log('');
  });
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
