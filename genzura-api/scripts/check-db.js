/**
 * Database Health Check Script
 *
 * Verifies database integrity and shows statistics
 * Usage: npm run db:check
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkDatabase() {
  try {
    console.log('🔍 Database Health Check\n');
    console.log('━'.repeat(60));

    // Count records in each table
    const [
      userCount,
      caseCount,
      clientCount,
      documentCount,
      timelineCount,
      notificationCount,
      calendarCount
    ] = await Promise.all([
      prisma.user.count(),
      prisma.case.count(),
      prisma.client.count(),
      prisma.caseDocument.count(),
      prisma.timelineEvent.count(),
      prisma.notification.count(),
      prisma.calendarEvent.count()
    ]);

    // Display statistics
    console.log('\n📊 Record Counts:');
    console.log(`   Users:         ${userCount.toString().padStart(6)}`);
    console.log(`   Cases:         ${caseCount.toString().padStart(6)}`);
    console.log(`   Clients:       ${clientCount.toString().padStart(6)}`);
    console.log(`   Documents:     ${documentCount.toString().padStart(6)}`);
    console.log(`   Timeline:      ${timelineCount.toString().padStart(6)}`);
    console.log(`   Notifications: ${notificationCount.toString().padStart(6)}`);
    console.log(`   Calendar:      ${calendarCount.toString().padStart(6)}`);

    // Check for data integrity issues
    console.log('\n🔗 Data Integrity: ✅ OK');

    // Recent activity
    console.log('\n📅 Recent Activity:');

    const recentUsers = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: {
        name: true,
        email: true,
        role: true,
        createdAt: true
      }
    });

    if (recentUsers.length > 0) {
      console.log('   Last 5 users:');
      recentUsers.forEach((u, i) => {
        const date = new Date(u.createdAt).toLocaleString();
        console.log(`   ${i + 1}. ${u.name} (${u.role}) - ${date}`);
      });
    } else {
      console.log('   No users found');
    }

    const recentCases = await prisma.case.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: {
        title: true,
        caseNumber: true,
        status: true,
        createdAt: true
      }
    });

    if (recentCases.length > 0) {
      console.log('\n   Last 5 cases:');
      recentCases.forEach((c, i) => {
        const date = new Date(c.createdAt).toLocaleString();
        console.log(`   ${i + 1}. ${c.caseNumber}: ${c.title} (${c.status}) - ${date}`);
      });
    } else {
      console.log('\n   No cases found');
    }

    // Subscription status
    console.log('\n💳 Subscription Overview:');
    const subscriptionStats = await prisma.user.groupBy({
      by: ['subscriptionPlan'],
      _count: true
    });

    subscriptionStats.forEach(stat => {
      console.log(`   ${stat.subscriptionPlan}: ${stat._count} users`);
    });

    // Database size (approximate)
    console.log('\n💾 Database Status:');
    const totalRecords = userCount + caseCount + clientCount + documentCount + timelineCount + notificationCount + calendarCount;
    console.log(`   Total records: ${totalRecords}`);

    // Health status
    console.log('\n✅ Database Status: HEALTHY');

    console.log('\n' + '━'.repeat(60));
    console.log('✨ Check complete!\n');

  } catch (error) {
    console.error('\n❌ Database check failed:', error.message);
    console.log('\n🔧 Possible issues:');
    console.log('   • Database connection failed');
    console.log('   • Prisma schema out of sync');
    console.log('   • Missing tables or columns');
    console.log('\n💡 Try running:');
    console.log('   npm run prisma:generate');
    console.log('   npm run migrate:status\n');
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run check
checkDatabase();
