import { PrismaClient } from '@prisma/client';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const email = 'admin@genzura.com';
  console.log(`🔑 Resetting password for ${email}...`);
  
  const user = await prisma.user.findUnique({
    where: { email }
  });

  if (!user) {
    console.log(`❌ User ${email} not found`);
    return;
  }

  const newHash = await bcrypt.hash('Genzura2026!', 10);
  await prisma.user.update({
    where: { email },
    data: { passwordHash: newHash }
  });

  console.log(`✅ Password successfully reset to "Genzura2026!" for ${email}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
