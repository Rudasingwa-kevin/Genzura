import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

async function diagnoseAvatars() {
  try {
    const users = await prisma.user.findMany({
      where: { avatarUrl: { not: null } },
      select: { id: true, name: true, email: true, avatarUrl: true }
    });

    if (users.length === 0) {
      console.log('No users with avatarUrl found in the database.');
      return;
    }

    console.log(`Found ${users.length} user(s) with an avatarUrl:\n`);

    for (const user of users) {
      console.log(`User: ${user.name} (${user.email})`);
      console.log(`  avatarUrl in DB: "${user.avatarUrl}"`);

      // Check if it's an absolute HTTP URL (e.g. S3)
      if (user.avatarUrl?.startsWith('http')) {
        console.log(`  Type: Absolute URL (S3 or external)`);
        console.log(`  Status: Cannot check file existence for remote URLs`);
      } else {
        // Relative path — check if file exists locally
        const localPath = path.join(process.cwd(), user.avatarUrl || '');
        const exists = fs.existsSync(localPath);
        console.log(`  Type: Relative path`);
        console.log(`  Expected local file: ${localPath}`);
        console.log(`  File exists locally: ${exists ? '✅ YES' : '❌ NO — FILE MISSING!'}`);
      }
      console.log('');
    }

    // Also check if uploads/avatars directory exists
    const uploadsDir = path.join(process.cwd(), 'uploads/avatars');
    console.log(`uploads/avatars directory exists: ${fs.existsSync(uploadsDir) ? '✅ YES' : '❌ NO'}`);
    if (fs.existsSync(uploadsDir)) {
      const files = fs.readdirSync(uploadsDir);
      console.log(`Files in uploads/avatars: ${files.length === 0 ? '(empty)' : files.join(', ')}`);
    }

    // Check env vars
    console.log('\nEnvironment:');
    console.log(`  AWS_S3_BUCKET: ${process.env.AWS_S3_BUCKET ? '✅ SET' : '❌ NOT SET'}`);
    console.log(`  AWS_ACCESS_KEY_ID: ${process.env.AWS_ACCESS_KEY_ID ? '✅ SET' : '❌ NOT SET'}`);
    console.log(`  S3 configured: ${(process.env.AWS_S3_BUCKET && process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) ? 'YES' : 'NO'}`);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

diagnoseAvatars();
