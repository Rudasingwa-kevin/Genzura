/**
 * fix-notification-links.mjs
 *
 * One-time migration: finds all notifications whose `link` points to
 * /cases/<something> where <something> is NOT a caseNumber (CV-0098 style)
 * or a UUID, and replaces it with the correct /cases/<caseNumber>.
 *
 * Run once after deploying the API fix:
 *   node fix-notification-links.mjs
 */

import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
dotenv.config();

const prisma = new PrismaClient();

// Pattern that matches a valid caseNumber (e.g. CV-0098, CV-2025-003)
const CASE_NUMBER_RE = /^[A-Z]+-\d+(-\d+)?$/;
// UUID v4 pattern
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

async function main() {
  console.log('🔍 Scanning notifications for bad case links...');

  // Fetch all notifications that have a /cases/ link
  const notifications = await prisma.notification.findMany({
    where: {
      link: { startsWith: '/cases/' },
    },
    select: { id: true, link: true },
  });

  console.log(`   Found ${notifications.length} notifications with /cases/ links`);

  let fixed = 0;
  let skipped = 0;
  let failed = 0;

  for (const notif of notifications) {
    const segment = notif.link.replace('/cases/', '').split('/')[0];

    // Already valid — skip
    if (CASE_NUMBER_RE.test(segment) || UUID_RE.test(segment)) {
      skipped++;
      continue;
    }

    // Bad link — try to find the case by title (the broken pattern)
    console.log(`   ⚠️  Bad link detected: ${notif.link} (segment: "${segment}")`);

    try {
      const matchedCase = await prisma.case.findFirst({
        where: {
          title: { equals: decodeURIComponent(segment), mode: 'insensitive' },
        },
        select: { id: true, caseNumber: true },
      });

      if (matchedCase) {
        const newLink = `/cases/${matchedCase.caseNumber || matchedCase.id}`;
        await prisma.notification.update({
          where: { id: notif.id },
          data: { link: newLink },
        });
        console.log(`   ✅  Fixed: "${notif.link}" → "${newLink}"`);
        fixed++;
      } else {
        console.log(`   ❌  Could not find case for segment "${segment}" — deleting notification`);
        await prisma.notification.delete({ where: { id: notif.id } });
        failed++;
      }
    } catch (err) {
      console.error(`   ❌  Error processing notification ${notif.id}:`, err.message);
      failed++;
    }
  }

  console.log('\n📊 Summary:');
  console.log(`   ✅  Fixed: ${fixed}`);
  console.log(`   ⏭️  Skipped (already valid): ${skipped}`);
  console.log(`   🗑️  Deleted (no matching case): ${failed}`);
  await prisma.$disconnect();
}

main().catch((e) => { console.error(e); process.exit(1); });
