import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  console.log('\n📧 Setting up test email for kevincracker02@gmail.com...\n');
  
  // Check if user exists
  let user = await prisma.user.findUnique({
    where: { email: 'kevincracker02@gmail.com' }
  });
  
  const now = new Date();
  
  if (!user) {
    // Create test user
    const bcrypt = await import('bcryptjs');
    const passwordHash = await bcrypt.default.hash('TestPassword123!', 10);
    
    user = await prisma.user.create({
      data: {
        name: 'Kevin Rudasingwa',
        email: 'kevincracker02@gmail.com',
        passwordHash,
        role: 'Attorney',
        initials: 'KR',
        subscriptionPlan: 'Intango',
        subscriptionStartDate: new Date(now.getTime() - 86 * 24 * 60 * 60 * 1000),
        subscriptionEndDate: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000)
      }
    });
    console.log('✅ Created new test user');
  } else {
    // Update existing user
    user = await prisma.user.update({
      where: { email: 'kevincracker02@gmail.com' },
      data: {
        subscriptionPlan: 'Intango',
        subscriptionStartDate: new Date(now.getTime() - 86 * 24 * 60 * 60 * 1000),
        subscriptionEndDate: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000)
      }
    });
    console.log('✅ Updated existing user');
  }
  
  const endDate = new Date(user.subscriptionEndDate);
  
  console.log('\n📋 User Details:');
  console.log(`   Name: ${user.name}`);
  console.log(`   Email: ${user.email}`);
  console.log(`   Plan: ${user.subscriptionPlan}`);
  console.log(`   Expires: ${endDate.toISOString().split('T')[0]}`);
  console.log(`   Status: Expires in 3 days (will send 3-day warning)`);
  console.log('\n✅ Ready to send test email!\n');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
