import { PrismaClient, AuditAction, AuditStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding audit logs...');

  const users = await prisma.user.findMany({ take: 5 });

  if (users.length === 0) {
    console.log('No users found. Please seed users first.');
    return;
  }

  const auditLogs = [
    {
      action: AuditAction.SETTINGS_CHANGE,
      description: 'Updated system branding settings',
      userId: users[0]?.id,
      userName: users[0]?.name || 'Admin',
      userRole: users[0]?.role || 'Admin',
      ipAddress: '192.168.1.1',
      status: AuditStatus.Success,
    },
    {
      action: AuditAction.USER_INVITE,
      description: 'Bulk user invitation sent',
      userId: users[1]?.id,
      userName: users[1]?.name || 'Manager',
      userRole: users[1]?.role || 'Senior_Attorney',
      ipAddress: '192.168.1.42',
      status: AuditStatus.Success,
    },
    {
      action: AuditAction.LOGIN,
      description: 'Unauthorized login attempt',
      userName: 'Unknown',
      userRole: 'External',
      ipAddress: '45.12.99.12',
      status: AuditStatus.Failed,
    },
    {
      action: AuditAction.EXPORT,
      description: 'Exported case analytics report',
      userId: users[2]?.id,
      userName: users[2]?.name || 'Attorney',
      userRole: users[2]?.role || 'Attorney',
      ipAddress: '192.168.1.15',
      status: AuditStatus.Success,
    },
    {
      action: AuditAction.SETTINGS_CHANGE,
      description: 'Modified practice area settings',
      userId: users[0]?.id,
      userName: users[0]?.name || 'Admin',
      userRole: users[0]?.role || 'Admin',
      ipAddress: '192.168.1.1',
      status: AuditStatus.Success,
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    },
    {
      action: AuditAction.DELETE,
      description: 'Deleted document: Case-CZ-102-Final-Brief.pdf',
      userId: users[3]?.id,
      userName: users[3]?.name || 'Paralegal',
      userRole: users[3]?.role || 'Paralegal',
      ipAddress: '192.168.1.8',
      status: AuditStatus.Success,
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
    },
    {
      action: AuditAction.CREATE,
      description: 'System backup initiated',
      userName: 'System',
      userRole: 'System',
      ipAddress: 'localhost',
      status: AuditStatus.Success,
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
    },
    {
      action: AuditAction.LOGIN,
      description: 'User logged in successfully',
      userId: users[0]?.id,
      userName: users[0]?.name || 'User',
      userRole: users[0]?.role || 'Attorney',
      ipAddress: '192.168.1.100',
      status: AuditStatus.Success,
      createdAt: new Date(Date.now() - 10 * 60 * 1000), // 10 minutes ago
    },
  ];

  for (const log of auditLogs) {
    await prisma.auditLog.create({
      data: log,
    });
  }

  console.log(`✓ Created ${auditLogs.length} audit log entries`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
