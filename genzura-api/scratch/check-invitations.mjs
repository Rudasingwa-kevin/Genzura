import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  console.log('\n📊 Checking invitation tokens in database:\n');
  
  const users = await prisma.user.findMany({
    where: {
      OR: [
        { invitationToken: { not: null } },
        { status: 'Invited' }
      ]
    },
    select: {
      email: true,
      name: true,
      role: true,
      status: true,
      invitationToken: true,
      invitationExpiry: true
    }
  });

  if (users.length === 0) {
    console.log('❌ No pending invitations found in database');
    return;
  }

  console.log(`Found ${users.length} users with pending/stored invitations:\n`);

  users.forEach((user, i) => {
    console.log(`${i+1}. ${user.name} (${user.email})`);
    console.log(`   Status: ${user.status}`);
    console.log(`   Token: ${user.invitationToken}`);
    console.log(`   Expiry: ${user.invitationExpiry}`);
    console.log(`   Accept URL: http://localhost:5173/accept-invitation?token=${user.invitationToken}`);
    console.log(`   Prod Accept URL: https://genzura.vercel.app/accept-invitation?token=${user.invitationToken}`);
    console.log('');
  });
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
