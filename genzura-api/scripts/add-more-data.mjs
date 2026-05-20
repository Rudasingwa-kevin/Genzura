import { PrismaClient } from '@prisma/client';
import bcryptjs from 'bcryptjs';

const prisma = new PrismaClient();

/**
 * This script adds additional sample data to supplement the seed data
 * Run it when you need more test data for development
 */

async function addMoreData() {
  console.log('🌱 Adding additional sample data...\n');

  try {
    const passwordHash = await bcryptjs.hash('Genzura2026!', 10);

    // Add more clients
    console.log('🏢 Adding more clients...');
    const newClients = [
      {
        name: 'Irembo Services',
        email: 'legal@irembo.rw',
        phone: '+250 788 111 222',
        company: 'Irembo Ltd',
        industry: 'E-Government',
        address: 'KG 9 Ave, Kigali',
        idNumber: 'TIN-101012345',
      },
      {
        name: 'Rwanda Tourism Board',
        email: 'legal@rwandatourism.rw',
        phone: '+250 788 222 333',
        company: 'RTB',
        industry: 'Tourism',
        address: 'KN 2 Ave, Kigali',
        idNumber: 'TIN-101123456',
      },
    ];

    for (const client of newClients) {
      await prisma.client.upsert({
        where: { email: client.email },
        update: {},
        create: client,
      });
      console.log(`   ✓ ${client.name}`);
    }

    // Add more feedback
    console.log('\n💬 Adding feedback entries...');
    const feedback = [
      {
        userId: 'U-101',
        subject: 'Feature Request: Case Templates',
        category: 'Feature Request',
        message: 'It would be helpful to have templates for common case types to speed up case creation.',
        status: 'Pending',
      },
      {
        userId: 'U-103',
        subject: 'Bug: Document Upload Issue',
        category: 'Bug Report',
        message: 'Sometimes the document upload fails for files larger than 10MB.',
        status: 'In_Progress',
      },
      {
        userId: 'U-106',
        subject: 'Suggestion: Calendar Integration',
        category: 'Enhancement',
        message: 'Would love to see Google Calendar integration for court dates.',
        status: 'Reviewed',
      },
    ];

    for (const fb of feedback) {
      await prisma.feedback.create({
        data: fb,
      });
      console.log(`   ✓ ${fb.subject}`);
    }

    // Add more notifications for different users
    console.log('\n🔔 Adding more notifications...');
    const notifications = [
      {
        userId: 'U-103',
        type: 'deadline',
        title: 'Compliance Deadline Approaching',
        body: 'COMP-2026-0891 deadline is in 5 days',
        read: false,
      },
      {
        userId: 'U-105',
        type: 'case',
        title: 'New Team Member Added',
        body: 'Elena Rodriguez joined CORP-2026-0012',
        read: false,
      },
      {
        userId: 'U-106',
        type: 'document',
        title: 'Document Review Required',
        body: 'Patent application draft needs your review',
        read: false,
      },
      {
        userId: 'U-110',
        type: 'alert',
        title: 'Survey Results Available',
        body: 'Property survey for RE-2026-0324 has been completed',
        read: false,
      },
    ];

    for (const notif of notifications) {
      await prisma.notification.create({
        data: notif,
      });
      console.log(`   ✓ ${notif.title}`);
    }

    // Add more case notes
    console.log('\n📝 Adding more case notes...');
    const cases = await prisma.case.findMany({
      take: 5,
    });

    const moreNotes = [
      'Reviewed all evidence documents. Case is solid and we have strong grounds.',
      'Client expressed concerns about timeline. Need to manage expectations.',
      'Opposing counsel is willing to negotiate. Scheduling mediation session.',
      'Filed motion for summary judgment. Waiting for court response.',
      'Discovery phase completed successfully. Moving to depositions.',
    ];

    for (let i = 0; i < Math.min(cases.length, moreNotes.length); i++) {
      await prisma.caseNote.create({
        data: {
          caseId: cases[i].id,
          authorId: cases[i].attorneyId,
          text: moreNotes[i],
        },
      });
      console.log(`   ✓ Added note to ${cases[i].caseNumber}`);
    }

    // Add event reminders
    console.log('\n⏰ Adding event reminders...');
    const upcomingEvents = await prisma.calendarEvent.findMany({
      where: {
        startDate: {
          gte: new Date(),
        },
      },
      take: 3,
    });

    for (const event of upcomingEvents) {
      // Add reminder 24 hours before
      const reminderTime = new Date(event.startDate);
      reminderTime.setHours(reminderTime.getHours() - 24);

      await prisma.eventReminder.create({
        data: {
          eventId: event.id,
          reminderTime,
          method: 'Email',
          sent: false,
        },
      });
      console.log(`   ✓ Reminder added for ${event.title}`);
    }

    // Summary
    console.log('\n📊 Summary:');
    console.log(`   - ${newClients.length} new clients added`);
    console.log(`   - ${feedback.length} feedback entries added`);
    console.log(`   - ${notifications.length} new notifications added`);
    console.log(`   - ${moreNotes.length} case notes added`);
    console.log(`   - ${upcomingEvents.length} event reminders added`);

    console.log('\n✅ Additional data added successfully!');
  } catch (error) {
    console.error('❌ Error adding data:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

addMoreData();
