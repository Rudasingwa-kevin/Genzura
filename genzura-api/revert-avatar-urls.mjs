import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
dotenv.config();

const prisma = new PrismaClient();

async function revertAvatarUrls() {
  // Find all users with a full S3 URL avatarUrl
  const users = await prisma.user.findMany({
    where: { avatarUrl: { startsWith: 'https://' } },
    select: { id: true, name: true, email: true, avatarUrl: true }
  });

  if (users.length === 0) {
    console.log('No users with S3 avatarUrl found.');
    await prisma.$disconnect();
    return;
  }

  for (const user of users) {
    // Extract the S3 key after .amazonaws.com/ and make it a relative path
    const parts = (user.avatarUrl || '').split('.amazonaws.com/');
    const key = parts.length > 1 ? parts[1] : null;
    if (!key) {
      console.log('Skipping ' + user.name + ' - could not parse key from: ' + user.avatarUrl);
      continue;
    }

    const relativePath = '/' + key; // e.g. /uploads/avatars/avatar-xxx.png

    await prisma.user.update({
      where: { id: user.id },
      data: { avatarUrl: relativePath }
    });

    console.log('Reverted ' + user.name + ' (' + user.email + ')');
    console.log('  Old: ' + user.avatarUrl);
    console.log('  New: ' + relativePath);
  }

  console.log('\nDone. Now the API presigned URL redirect will handle serving images.');
  await prisma.$disconnect();
}

revertAvatarUrls().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
});
