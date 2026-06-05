import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
dotenv.config();

const prisma = new PrismaClient();

async function fixAvatarUrls() {
  const bucket = process.env.AWS_S3_BUCKET;
  const region = process.env.AWS_REGION || 'us-east-1';

  if (!bucket) {
    console.error('❌ AWS_S3_BUCKET not set in .env — cannot build S3 URLs.');
    return;
  }

  // Find all users with a relative avatarUrl (starts with /uploads/)
  const users = await prisma.user.findMany({
    where: {
      avatarUrl: { startsWith: '/uploads/' }
    },
    select: { id: true, name: true, email: true, avatarUrl: true }
  });

  if (users.length === 0) {
    console.log('✅ No users with relative avatarUrl found. Nothing to fix.');
    return;
  }

  console.log(`Found ${users.length} user(s) with relative avatarUrl. Migrating to full S3 URLs...\n`);

  for (const user of users) {
    // Strip leading slash to get the S3 key: "uploads/avatars/filename.png"
    const s3Key = (user.avatarUrl || '').replace(/^\//, '');
    const fullS3Url = `https://${bucket}.s3.${region}.amazonaws.com/${s3Key}`;

    await prisma.user.update({
      where: { id: user.id },
      data: { avatarUrl: fullS3Url }
    });

    console.log(`✅ ${user.name} (${user.email})`);
    console.log(`   Old: ${user.avatarUrl}`);
    console.log(`   New: ${fullS3Url}\n`);
  }

  console.log('Migration complete! Re-upload your avatar from the Settings page to verify the new flow works end-to-end.');
  await prisma.$disconnect();
}

fixAvatarUrls().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
});
