import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function resetPassword() {
  try {
    const admins = await prisma.user.findMany({
      where: {
        role: 'Admin',
      }
    });

    if (admins.length === 0) {
      console.log('No admin users found.');
      return;
    }

    console.log(`Found ${admins.length} admin(s):`);
    
    const newPassword = 'Password123!';
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    for (const admin of admins) {
      await prisma.user.update({
        where: { id: admin.id },
        data: { passwordHash: hashedPassword }
      });
      console.log(`- Reset password for: ${admin.email} (Role: ${admin.role})`);
    }

    console.log(`\nAll admin passwords have been reset to: ${newPassword}`);
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

resetPassword();
