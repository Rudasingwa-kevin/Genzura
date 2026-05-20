import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkData() {
  console.log('📊 Checking Database Seed Data...\n');

  try {
    // Count records
    const userCount = await prisma.user.count();
    const clientCount = await prisma.client.count();
    const caseCount = await prisma.case.count();
    const teamCount = await prisma.caseTeam.count();
    const timelineCount = await prisma.timelineEvent.count();
    const documentCount = await prisma.caseDocument.count();
    const noteCount = await prisma.caseNote.count();
    const notificationCount = await prisma.notification.count();
    const calendarCount = await prisma.calendarEvent.count();

    console.log('📈 Record Counts:');
    console.log(`   Users: ${userCount}`);
    console.log(`   Clients: ${clientCount}`);
    console.log(`   Cases: ${caseCount}`);
    console.log(`   Case Teams: ${teamCount}`);
    console.log(`   Timeline Events: ${timelineCount}`);
    console.log(`   Documents: ${documentCount}`);
    console.log(`   Notes: ${noteCount}`);
    console.log(`   Notifications: ${notificationCount}`);
    console.log(`   Calendar Events: ${calendarCount}\n`);

    // Show users
    console.log('👥 Users:');
    const users = await prisma.user.findMany({
      select: {
        name: true,
        email: true,
        role: true,
        status: true,
        subscriptionPlan: true,
      },
    });
    users.forEach(user => {
      console.log(`   - ${user.name} (${user.email})`);
      console.log(`     Role: ${user.role}, Status: ${user.status}, Plan: ${user.subscriptionPlan}`);
    });

    // Show cases by status
    console.log('\n📂 Cases by Status:');
    const casesByStatus = await prisma.case.groupBy({
      by: ['status'],
      _count: true,
    });
    casesByStatus.forEach(group => {
      console.log(`   ${group.status}: ${group._count} cases`);
    });

    // Show recent cases
    console.log('\n📋 Recent Cases:');
    const recentCases = await prisma.case.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        client: true,
        attorney: true,
      },
    });
    recentCases.forEach(c => {
      console.log(`   - ${c.caseNumber}: ${c.title}`);
      console.log(`     Client: ${c.client.name}`);
      console.log(`     Attorney: ${c.attorney.name}`);
      console.log(`     Status: ${c.status}, Priority: ${c.priority}, Type: ${c.type}\n`);
    });

    // Show notifications
    console.log('🔔 Recent Notifications:');
    const notifications = await prisma.notification.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        user: true,
      },
    });
    notifications.forEach(notif => {
      console.log(`   - ${notif.title}`);
      console.log(`     For: ${notif.user.name}`);
      console.log(`     Read: ${notif.read ? '✓' : '✗'}\n`);
    });

    // Show calendar events
    console.log('📆 Upcoming Calendar Events:');
    const events = await prisma.calendarEvent.findMany({
      where: {
        startDate: {
          gte: new Date(),
        },
      },
      orderBy: { startDate: 'asc' },
      include: {
        case: true,
        createdBy: true,
      },
    });
    events.forEach(event => {
      console.log(`   - ${event.title}`);
      console.log(`     Date: ${event.startDate.toLocaleDateString()}`);
      console.log(`     Type: ${event.eventType}`);
      console.log(`     Location: ${event.location || 'N/A'}\n`);
    });

    console.log('✅ Data check complete!');
  } catch (error) {
    console.error('❌ Error checking data:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

checkData();
