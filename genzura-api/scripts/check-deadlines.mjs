import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

function getKigaliStartOfDay(date) {
  const options = { timeZone: 'Africa/Kigali', year: 'numeric', month: 'numeric', day: 'numeric' };
  const formatter = new Intl.DateTimeFormat('en-US', options);
  const parts = formatter.formatToParts(date);
  const year = parseInt(parts.find(p => p.type === 'year').value);
  const month = parseInt(parts.find(p => p.type === 'month').value) - 1;
  const day = parseInt(parts.find(p => p.type === 'day').value);
  
  return new Date(year, month, day).getTime();
}

function calculateDaysDifference(targetDate, baseDate) {
  const d1Start = getKigaliStartOfDay(targetDate);
  const d2Start = getKigaliStartOfDay(baseDate);
  return Math.round((d1Start - d2Start) / (1000 * 60 * 60 * 24));
}

async function main() {
  const now = new Date();
  console.log(`Current Time (UTC): ${now.toISOString()}`);
  console.log(`Current Time (Kigali local date): ${new Date(getKigaliStartOfDay(now)).toDateString()}`);
  
  const cases = await prisma.case.findMany({
    where: {
      status: {
        in: ['Active', 'Pending']
      },
      deadline: {
        not: null
      }
    },
    include: {
      attorney: true
    }
  });

  console.log(`\nActive/Pending cases with deadlines in DB: ${cases.length}\n`);

  for (const kase of cases) {
    const deadlineDate = new Date(kase.deadline);
    const daysUntil = calculateDaysDifference(deadlineDate, now);
    const milestoneMatch = [-1, 0, 1, 3, 7].includes(daysUntil);

    console.log(`Case: ${kase.caseNumber} - ${kase.title}`);
    console.log(`  Status: ${kase.status}`);
    console.log(`  Deadline: ${kase.deadline.toISOString()}`);
    console.log(`  Days Until: ${daysUntil}`);
    console.log(`  Matches Alert Milestone: ${milestoneMatch ? 'YES ✅' : 'NO ❌'}`);
    console.log(`  Attorney: ${kase.attorney ? `${kase.attorney.name} (${kase.attorney.email})` : 'NONE'}`);
    console.log('');
  }

  await prisma.$disconnect();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
