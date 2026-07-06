// @ts-nocheck
import {
  PrismaClient,
  UserRole,
  UserStatus,
  CaseStatus,
  CasePriority,
  CaseType,
  TimelineEventType,
  DocumentType,
  NotificationType,
  CalendarEventType
} from '@prisma/client';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

const USERS = [
  { id: 'U-101', name: 'James Wilson', email: 'j.wilson@genzura.law', role: 'Senior_Attorney', status: 'Active', initials: 'JW', phone: '+250 788 123 456', location: 'Kigali, Rwanda', jobTitle: 'Senior Attorney' },
  { id: 'U-102', name: 'Sarah Miller', email: 's.miller@genzura.law', role: 'Admin', status: 'Active', initials: 'SM', phone: '+250 788 234 567', location: 'Kigali, Rwanda', jobTitle: 'System Administrator' },
  { id: 'U-103', name: 'David Chen', email: 'd.chen@genzura.law', role: 'Attorney', status: 'Active', initials: 'DC', phone: '+250 788 345 678', location: 'Kigali, Rwanda', jobTitle: 'Attorney' },
  { id: 'U-104', name: 'Elena Rodriguez', email: 'e.rodriguez@genzura.law', role: 'Paralegal', status: 'Active', initials: 'ER', phone: '+250 788 456 789', location: 'Kigali, Rwanda', jobTitle: 'Paralegal' },
  { id: 'U-105', name: 'Michael Uwimana', email: 'm.uwimana@genzura.law', role: 'Attorney', status: 'Active', initials: 'MU', phone: '+250 788 567 890', location: 'Kigali, Rwanda', jobTitle: 'Corporate Attorney' },
  { id: 'U-106', name: 'Grace Mugisha', email: 'g.mugisha@genzura.law', role: 'Senior_Attorney', status: 'Active', initials: 'GM', phone: '+250 788 678 901', location: 'Kigali, Rwanda', jobTitle: 'Senior Attorney - IP' },
  { id: 'U-107', name: 'Patrick Nkurunziza', email: 'p.nkurunziza@genzura.law', role: 'Paralegal', status: 'Active', initials: 'PN', phone: '+250 788 789 012', location: 'Kigali, Rwanda', jobTitle: 'Senior Paralegal' },
  { id: 'U-108', name: 'Alice Kayitesi', email: 'a.kayitesi@genzura.law', role: 'Attorney', status: 'Invited', initials: 'AK', phone: '+250 788 890 123', location: 'Kigali, Rwanda', jobTitle: 'Employment Attorney' },
  { id: 'U-109', name: 'Robert Habimana', email: 'r.habimana@genzura.law', role: 'Support', status: 'Active', initials: 'RH', phone: '+250 788 901 234', location: 'Kigali, Rwanda', jobTitle: 'Legal Support Specialist' },
  { id: 'U-110', name: 'Diana Umutesi', email: 'd.umutesi@genzura.law', role: 'Attorney', status: 'Active', initials: 'DU', phone: '+250 788 012 345', location: 'Kigali, Rwanda', jobTitle: 'Real Estate Attorney' },
];

const CLIENTS = [
  { id: 'C-001', name: 'Alpha Corporation Legal', email: 'legal@alphacorp.com', phone: '+250 788 100 200', company: 'Alpha Corp', industry: 'Technology', address: 'KG 11 Ave, Kigali', idNumber: 'TIN-100234567' },
  { id: 'C-002', name: 'Tech Innovations IP Dept', email: 'ip@techinnovations.io', phone: '+250 788 200 300', company: 'Tech Innovations', industry: 'Semiconductors', address: 'KN 5 Rd, Kigali', idNumber: 'TIN-100345678' },
  { id: 'C-003', name: 'Apex Global M&A', email: 'ma@apex.com', phone: '+250 788 300 400', company: 'Apex Global', industry: 'Finance', address: 'KG 7 Ave, Kigali', idNumber: 'TIN-100456789' },
  { id: 'C-004', name: 'Green Valley Properties', email: 'legal@greenvalley.rw', phone: '+250 788 400 500', company: 'Green Valley Ltd', industry: 'Real Estate', address: 'Kimihurura, Kigali', idNumber: 'TIN-100567890' },
  { id: 'C-005', name: 'Rwanda Coffee Exports', email: 'export@rwandacoffee.rw', phone: '+250 788 500 600', company: 'Rwanda Coffee Exports', industry: 'Agriculture', address: 'Nyarugenge, Kigali', idNumber: 'TIN-100678901' },
  { id: 'C-006', name: 'Digital Finance Rwanda', email: 'legal@digitalfinance.rw', phone: '+250 788 600 700', company: 'Digital Finance', industry: 'Fintech', address: 'Kacyiru, Kigali', idNumber: 'TIN-100789012' },
  { id: 'C-007', name: 'BuildRight Construction', email: 'contracts@buildright.rw', phone: '+250 788 700 800', company: 'BuildRight Ltd', industry: 'Construction', address: 'Remera, Kigali', idNumber: 'TIN-100890123' },
  { id: 'C-008', name: 'HealthCare Plus', email: 'legal@healthcareplus.rw', phone: '+250 788 800 900', company: 'HealthCare Plus', industry: 'Healthcare', address: 'Nyarutarama, Kigali', idNumber: 'TIN-100901234' },
];

const CASES = [
  {
    caseNumber: 'CV-2026-0482',
    title: 'Alpha Corp v. Beta Inc',
    clientId: 'C-001',
    attorneyId: 'U-101',
    status: 'Active' as CaseStatus,
    priority: 'High' as CasePriority,
    type: 'Litigation' as CaseType,
    deadline: '2026-08-15T00:00:00Z',
    description: 'Complex commercial litigation regarding breach of contract and intellectual property infringement.',
  },
  {
    caseNumber: 'IP-2026-7712',
    title: 'Tech Innovations Patent Filing',
    clientId: 'C-002',
    attorneyId: 'U-106',
    status: 'Pending' as CaseStatus,
    priority: 'Medium' as CasePriority,
    type: 'IP' as CaseType,
    deadline: '2026-09-20T00:00:00Z',
    description: 'Filing of three utility patents for new semiconductor manufacturing processes.',
  },
  {
    caseNumber: 'CORP-2026-0012',
    title: 'Apex Global Merger',
    clientId: 'C-003',
    attorneyId: 'U-105',
    status: 'Active' as CaseStatus,
    priority: 'High' as CasePriority,
    type: 'Corporate' as CaseType,
    deadline: '2026-11-05T00:00:00Z',
    description: 'Regulatory review and contract negotiation for the acquisition of Z-Tech Systems.',
  },
  {
    caseNumber: 'RE-2026-0324',
    title: 'Green Valley Land Dispute',
    clientId: 'C-004',
    attorneyId: 'U-110',
    status: 'Active' as CaseStatus,
    priority: 'High' as CasePriority,
    type: 'Real_Estate' as CaseType,
    deadline: '2026-07-30T00:00:00Z',
    description: 'Property boundary dispute resolution and title verification for commercial development project.',
  },
  {
    caseNumber: 'COMP-2026-0891',
    title: 'Rwanda Coffee Regulatory Compliance',
    clientId: 'C-005',
    attorneyId: 'U-103',
    status: 'Pending' as CaseStatus,
    priority: 'Medium' as CasePriority,
    type: 'Compliance' as CaseType,
    deadline: '2026-06-30T00:00:00Z',
    description: 'Ensuring export compliance with new international trade regulations.',
  },
  {
    caseNumber: 'EMP-2026-0156',
    title: 'Digital Finance Employment Case',
    clientId: 'C-006',
    attorneyId: 'U-108',
    status: 'Active' as CaseStatus,
    priority: 'Low' as CasePriority,
    type: 'Employment' as CaseType,
    deadline: '2026-08-01T00:00:00Z',
    description: 'Employment contract dispute and wrongful termination claim defense.',
  },
  {
    caseNumber: 'LIT-2026-0723',
    title: 'BuildRight Contract Dispute',
    clientId: 'C-007',
    attorneyId: 'U-101',
    status: 'Resolved' as CaseStatus,
    priority: 'Medium' as CasePriority,
    type: 'Litigation' as CaseType,
    deadline: '2026-05-15T00:00:00Z',
    description: 'Construction contract breach claim successfully settled out of court.',
  },
  {
    caseNumber: 'CORP-2026-0445',
    title: 'HealthCare Plus Incorporation',
    clientId: 'C-008',
    attorneyId: 'U-105',
    status: 'Archived' as CaseStatus,
    priority: 'Low' as CasePriority,
    type: 'Corporate' as CaseType,
    deadline: '2026-03-20T00:00:00Z',
    description: 'Corporate restructuring and subsidiary incorporation completed.',
  },
  {
    caseNumber: 'MA-2026-0598',
    title: 'Tech Innovations Acquisition',
    clientId: 'C-002',
    attorneyId: 'U-105',
    status: 'Active' as CaseStatus,
    priority: 'High' as CasePriority,
    type: 'MA' as CaseType,
    deadline: '2026-10-15T00:00:00Z',
    description: 'Mergers and acquisitions due diligence and negotiation for startup acquisition.',
  },
  {
    caseNumber: 'IP-2026-0834',
    title: 'Alpha Corp Trademark Registration',
    clientId: 'C-001',
    attorneyId: 'U-106',
    status: 'Pending' as CaseStatus,
    priority: 'Medium' as CasePriority,
    type: 'IP' as CaseType,
    deadline: '2026-07-10T00:00:00Z',
    description: 'International trademark registration across East African Community member states.',
  },
];

async function main() {
  console.log('🌱 Starting seed process...');

  try {
    const passwordHash = await bcrypt.hash('Genzura2026!', 10);
    console.log('🔑 Password hash generated.');

    // Clear existing data to prevent duplicates (order matters due to foreign keys)
    console.log('🧹 Cleaning existing seed data...');
    await prisma.eventAttendee.deleteMany({});
    await prisma.calendarEvent.deleteMany({});
    await prisma.notification.deleteMany({});
    await prisma.caseNote.deleteMany({});
    await prisma.caseDocument.deleteMany({});
    await prisma.timelineEvent.deleteMany({});
    await prisma.caseTeam.deleteMany({});
    await prisma.case.deleteMany({});
    await prisma.client.deleteMany({});
    await prisma.feedback.deleteMany({}); // Delete feedback before users
    await prisma.user.deleteMany({});
    console.log('✅ Cleanup complete.');

    // Users
    console.log('👥 Seeding users...');
    for (const user of USERS) {
      console.log(`   - Creating user: ${user.email}`);

      await prisma.user.create({
        data: {
          id: user.id,
          name: user.name,
          email: user.email,
          passwordHash,
          role: user.role as UserRole,
          status: user.status as UserStatus,
          initials: user.initials,
          phone: user.phone,
          location: user.location,
          jobTitle: user.jobTitle,
        },
      });
    }

    // Clients
    console.log('🏢 Seeding clients...');
    for (const client of CLIENTS) {
      console.log(`   - Creating client: ${client.email}`);
      await prisma.client.create({
        data: client,
      });
    }

    // Cases
    console.log('📂 Seeding cases...');
    for (const c of CASES) {
      console.log(`   - Creating case: ${c.caseNumber}`);
      await prisma.case.create({
        data: {
          ...c,
          filedDate: new Date(),
        },
      });
    }

    // Case Teams
    console.log('👥 Seeding case teams...');
    const caseTeams = [
      { caseNumber: 'CV-2026-0482', userId: 'U-104', role: 'Paralegal Support' },
      { caseNumber: 'CV-2026-0482', userId: 'U-103', role: 'Associate Attorney' },
      { caseNumber: 'IP-2026-7712', userId: 'U-107', role: 'IP Paralegal' },
      { caseNumber: 'CORP-2026-0012', userId: 'U-101', role: 'Senior Counsel' },
      { caseNumber: 'CORP-2026-0012', userId: 'U-104', role: 'Document Specialist' },
      { caseNumber: 'RE-2026-0324', userId: 'U-107', role: 'Research Assistant' },
      { caseNumber: 'MA-2026-0598', userId: 'U-106', role: 'IP Consultant' },
    ];

    for (const team of caseTeams) {
      const caseRecord = await prisma.case.findUnique({ where: { caseNumber: team.caseNumber } });
      if (caseRecord) {
        await prisma.caseTeam.upsert({
          where: {
            caseId_userId: {
              caseId: caseRecord.id,
              userId: team.userId
            }
          },
          update: {},
          create: {
            caseId: caseRecord.id,
            userId: team.userId,
            role: team.role,
          },
        });
      }
    }

    // Timeline Events
    console.log('📅 Seeding timeline events...');
    const timelineEvents = [
      { caseNumber: 'CV-2026-0482', type: 'filed' as TimelineEventType, description: 'Case filed in commercial court', authorId: 'U-101' },
      { caseNumber: 'CV-2026-0482', type: 'status' as TimelineEventType, description: 'Status updated to Active', authorId: 'U-101' },
      { caseNumber: 'CV-2026-0482', type: 'document' as TimelineEventType, description: 'Initial complaint filed', authorId: 'U-104' },
      { caseNumber: 'IP-2026-7712', type: 'meeting' as TimelineEventType, description: 'Initial client consultation completed', authorId: 'U-106' },
      { caseNumber: 'CORP-2026-0012', type: 'milestone' as TimelineEventType, description: 'Due diligence phase completed', authorId: 'U-105' },
      { caseNumber: 'RE-2026-0324', type: 'note' as TimelineEventType, description: 'Site inspection scheduled for next week', authorId: 'U-110' },
      { caseNumber: 'LIT-2026-0723', type: 'status' as TimelineEventType, description: 'Settlement agreement reached', authorId: 'U-101' },
    ];

    for (const event of timelineEvents) {
      const caseRecord = await prisma.case.findUnique({ where: { caseNumber: event.caseNumber } });
      if (caseRecord) {
        await prisma.timelineEvent.create({
          data: {
            caseId: caseRecord.id,
            type: event.type,
            description: event.description,
            authorId: event.authorId,
          },
        });
      }
    }

    // Case Documents
    console.log('📄 Seeding case documents...');
    const documents = [
      { caseNumber: 'CV-2026-0482', name: 'Initial Complaint.pdf', type: 'PDF' as DocumentType, size: '2.4 MB', uploadedById: 'U-104' },
      { caseNumber: 'CV-2026-0482', name: 'Evidence Package.pdf', type: 'PDF' as DocumentType, size: '15.7 MB', uploadedById: 'U-104' },
      { caseNumber: 'IP-2026-7712', name: 'Patent Application Draft.docx', type: 'DOCX' as DocumentType, size: '856 KB', uploadedById: 'U-107' },
      { caseNumber: 'CORP-2026-0012', name: 'Merger Agreement.pdf', type: 'PDF' as DocumentType, size: '3.2 MB', uploadedById: 'U-105' },
      { caseNumber: 'RE-2026-0324', name: 'Property Survey.pdf', type: 'PDF' as DocumentType, size: '5.1 MB', uploadedById: 'U-110' },
      { caseNumber: 'RE-2026-0324', name: 'Title Deed Copy.pdf', type: 'PDF' as DocumentType, size: '1.8 MB', uploadedById: 'U-107' },
    ];

    for (const doc of documents) {
      const caseRecord = await prisma.case.findUnique({ where: { caseNumber: doc.caseNumber } });
      if (caseRecord) {
        await prisma.caseDocument.create({
          data: {
            caseId: caseRecord.id,
            name: doc.name,
            type: doc.type,
            size: doc.size,
            uploadedById: doc.uploadedById,
          },
        });
      }
    }

    // Case Notes
    console.log('📝 Seeding case notes...');
    const notes = [
      { caseNumber: 'CV-2026-0482', authorId: 'U-101', text: 'Client meeting went well. They are prepared for a lengthy litigation process.' },
      { caseNumber: 'CV-2026-0482', authorId: 'U-104', text: 'All discovery documents have been organized and indexed.' },
      { caseNumber: 'IP-2026-7712', authorId: 'U-106', text: 'Patent search completed. No conflicting patents found in the database.' },
      { caseNumber: 'CORP-2026-0012', authorId: 'U-105', text: 'Regulatory approval expected within 30 days. All documents submitted.' },
      { caseNumber: 'RE-2026-0324', authorId: 'U-110', text: 'Survey results show a 2-meter discrepancy. Meeting with surveyor scheduled.' },
    ];

    for (const note of notes) {
      const caseRecord = await prisma.case.findUnique({ where: { caseNumber: note.caseNumber } });
      if (caseRecord) {
        await prisma.caseNote.create({
          data: {
            caseId: caseRecord.id,
            authorId: note.authorId,
            text: note.text,
          },
        });
      }
    }

    // Notifications
    console.log('🔔 Seeding notifications...');
    const notifications = [
      { userId: 'U-101', type: 'deadline' as NotificationType, title: 'Deadline Approaching', body: 'CV-2026-0482 deadline in 3 days', link: '/cases/CV-2026-0482' },
      { userId: 'U-106', type: 'document' as NotificationType, title: 'New Document Uploaded', body: 'Patent Application Draft uploaded to IP-2026-7712', link: '/cases/IP-2026-7712' },
      { userId: 'U-105', type: 'case' as NotificationType, title: 'Case Status Update', body: 'CORP-2026-0012 moved to Active status', link: '/cases/CORP-2026-0012' },
      { userId: 'U-110', type: 'alert' as NotificationType, title: 'Court Date Scheduled', body: 'Hearing scheduled for RE-2026-0324 on June 15', link: '/cases/RE-2026-0324' },
      { userId: 'U-101', type: 'resolved' as NotificationType, title: 'Case Resolved', body: 'LIT-2026-0723 successfully settled', link: '/cases/LIT-2026-0723', read: true },
    ];

    for (const notif of notifications) {
      await prisma.notification.create({
        data: notif,
      });
    }

    // Calendar Events
    console.log('📆 Seeding calendar events...');
    const calendarEvents = [
      {
        title: 'Court Hearing - Alpha Corp Case',
        description: 'Initial hearing for breach of contract claim',
        eventType: 'Hearing' as CalendarEventType,
        startDate: new Date('2026-06-15T09:00:00Z'),
        endDate: new Date('2026-06-15T11:00:00Z'),
        location: 'Commercial Court, Kigali',
        caseNumber: 'CV-2026-0482',
        createdById: 'U-101',
        attendees: ['U-101', 'U-104'],
      },
      {
        title: 'Client Meeting - Tech Innovations',
        description: 'Review patent application documents',
        eventType: 'ClientMeeting' as CalendarEventType,
        startDate: new Date('2026-05-25T14:00:00Z'),
        endDate: new Date('2026-05-25T15:30:00Z'),
        location: 'Genzura Offices',
        caseNumber: 'IP-2026-7712',
        createdById: 'U-106',
        attendees: ['U-106', 'U-107'],
      },
      {
        title: 'Filing Deadline - Merger Documents',
        description: 'Submit merger approval documents to RDB',
        eventType: 'Filing' as CalendarEventType,
        startDate: new Date('2026-06-01T16:00:00Z'),
        location: 'Rwanda Development Board',
        caseNumber: 'CORP-2026-0012',
        createdById: 'U-105',
        attendees: ['U-105', 'U-104'],
      },
      {
        title: 'Property Site Visit',
        description: 'On-site inspection with surveyor',
        eventType: 'Meeting' as CalendarEventType,
        startDate: new Date('2026-05-28T10:00:00Z'),
        endDate: new Date('2026-05-28T12:00:00Z'),
        location: 'Green Valley Property Site',
        caseNumber: 'RE-2026-0324',
        createdById: 'U-110',
        attendees: ['U-110', 'U-107'],
      },
    ];

    for (const event of calendarEvents) {
      let caseId: string | undefined;
      if (event.caseNumber) {
        const caseRecord = await prisma.case.findUnique({ where: { caseNumber: event.caseNumber } });
        caseId = caseRecord?.id;
      }

      const calendarEvent = await prisma.calendarEvent.create({
        data: {
          title: event.title,
          description: event.description,
          eventType: event.eventType,
          startDate: event.startDate,
          endDate: event.endDate,
          location: event.location,
          caseId,
          createdById: event.createdById,
        },
      });

      // Add attendees
      for (const userId of event.attendees) {
        await prisma.eventAttendee.create({
          data: {
            eventId: calendarEvent.id,
            userId,
          },
        });
      }
    }

    // System Settings
    console.log('⚙️ Seeding system settings...');
    const systemSettings = [
      { key: 'app_name', value: 'Genzura Litigation Management', category: 'general' },
      { key: 'max_file_upload_size', value: '50', category: 'files' },
      { key: 'notification_email', value: 'notifications@genzura.law', category: 'notifications' },
      { key: 'timezone', value: 'Africa/Kigali', category: 'general' },
      { key: 'date_format', value: 'DD/MM/YYYY', category: 'general' },
    ];

    for (const setting of systemSettings) {
      await prisma.systemSetting.upsert({
        where: { key: setting.key },
        update: { value: setting.value },
        create: setting,
      });
    }

    console.log('✅ Seed complete.');
    console.log('📊 Summary:');
    console.log(`   - ${USERS.length} users created`);
    console.log(`   - ${CLIENTS.length} clients created`);
    console.log(`   - ${CASES.length} cases created`);
    console.log(`   - ${caseTeams.length} case team memberships created`);
    console.log(`   - ${timelineEvents.length} timeline events created`);
    console.log(`   - ${documents.length} documents created`);
    console.log(`   - ${notes.length} case notes created`);
    console.log(`   - ${notifications.length} notifications created`);
    console.log(`   - ${calendarEvents.length} calendar events created`);
    console.log(`   - ${systemSettings.length} system settings created`);
  } catch (error) {
    console.error('❌ Error during seeding:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
