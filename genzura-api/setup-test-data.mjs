import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  console.log('\n🔧 Setting up test subscription data...\n');
  
  const now = new Date();
  
  // Scenario 1: Expires in 7 days
  await prisma.user.update({
    where: { email: 'e.rodriguez@genzura.law' },
    data: {
      subscriptionPlan: 'Intango',
      subscriptionStartDate: new Date(now.getTime() - 83 * 24 * 60 * 60 * 1000),
      subscriptionEndDate: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
    }
  });
  console.log('✅ Elena Rodriguez → Intango (expires in 7 days)');
  
  // Scenario 2: Expires tomorrow
  await prisma.user.update({
    where: { email: 'd.chen@genzura.law' },
    data: {
      subscriptionPlan: 'Intango',
      subscriptionStartDate: new Date(now.getTime() - 89 * 24 * 60 * 60 * 1000),
      subscriptionEndDate: new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000)
    }
  });
  console.log('✅ David Chen → Intango (expires tomorrow)');
  
  // Scenario 3: Expired 5 days ago (should downgrade)
  await prisma.user.update({
    where: { email: 'j.wilson@genzura.law' },
    data: {
      subscriptionPlan: 'Inkingi',
      subscriptionStartDate: new Date(now.getTime() - 370 * 24 * 60 * 60 * 1000),
      subscriptionEndDate: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000)
    }
  });
  console.log('✅ James Wilson → Inkingi (expired 5 days ago - should downgrade)');
  
  console.log('\n✅ Test data setup complete!\n');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
