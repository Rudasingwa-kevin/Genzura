import { PrismaClient, UserRole, UserStatus } from '@prisma/client';
import { createRequire } from 'module';
import crypto from 'crypto';
import { EmailService } from './emailService.js';

const require = createRequire(import.meta.url);
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

export class UserService {
  static async createUser(data: {
    name: string;
    email: string;
    password?: string;
    role: UserRole;
    initials: string;
    phone?: string;
    organization?: string;
  }) {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email }
    });

    if (existingUser) {
      throw new Error('An account with this email already exists');
    }

    const passwordHash = await bcrypt.hash(data.password || 'Genzura2026!', 10);

    return prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        role: data.role,
        initials: data.initials,
        passwordHash,
        phone: data.phone,
        company: data.organization,
      },
    });
  }

  static async getUserByEmail(email: string) {
    return prisma.user.findUnique({
      where: { email },
    });
  }

  static async getUserById(id: string) {
    return prisma.user.findUnique({
      where: { id },
    });
  }

  static async getAllUsers() {
    return prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Get active users for case collaboration (accessible to all authenticated users)
   */
  static async getActiveUsers() {
    return prisma.user.findMany({
      where: {
        status: UserStatus.Active,
        // Exclude soft-deleted / anonymized accounts
        NOT: { email: { startsWith: 'deleted_' } },
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        initials: true,
        status: true,
        phone: true,
        location: true,
        jobTitle: true,
      },
      orderBy: { name: 'asc' },
    });
  }

  static async updateStatus(id: string, status: any) {
    return prisma.user.update({
      where: { id },
      data: { status },
    });
  }

  static async getUserAnalytics() {
    const users = await prisma.user.findMany({
      include: {
        _count: {
          select: { cases: true, teamMemberships: true, uploadedDocs: true, timelineEvents: true }
        },
        cases: {
          select: { id: true, title: true, status: true, priority: true }
        }
      }
    });

    const recentActivity = await prisma.timelineEvent.findMany({
      take: 20,
      orderBy: { timestamp: 'desc' },
      include: { author: { select: { id: true, name: true, initials: true } }, case: { select: { id: true, title: true } } }
    });

    return {
      workload: users.map(u => ({
        id: u.id,
        name: u.name,
        initials: u.initials,
        role: u.role,
        totalCases: u._count.cases + u._count.teamMemberships,
        activeCases: u.cases.filter(c => c.status === 'Active' || c.status === 'Pending').length,
        resolvedCases: u.cases.filter(c => c.status === 'Resolved' || c.status === 'Archived').length,
        docsUploaded: u._count.uploadedDocs,
        timelineEvents: u._count.timelineEvents
      })).sort((a, b) => b.totalCases - a.totalCases),
      recentActivity
    };
  }

  static async updatePassword(id: string, passwordHash: string) {
    return prisma.user.update({
      where: { id },
      data: { passwordHash },
    });
  }

  /**
   * Delete user account (soft delete - marks as inactive)
   */
  static async deleteAccount(id: string) {
    // Soft delete: Suspend and anonymize the user instead of hard-deleting
    // This preserves data integrity (case history, timeline events, etc.)
    return prisma.user.update({
      where: { id },
      data: {
        status: UserStatus.Suspended,              // Use a valid enum value
        email: `deleted_${id}@deleted.genzura.law`, // Anonymize email (also used as exclusion marker)
        name: 'Deleted User',
        phone: null,
        avatarUrl: null,
      },
    });
  }

  static async updateProfile(id: string, data: {
    name?: string;
    phone?: string;
    location?: string;
    jobTitle?: string;
    language?: string;
    avatarUrl?: string;
  }) {
    return prisma.user.update({
      where: { id },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.phone !== undefined && { phone: data.phone }),
        ...(data.location !== undefined && { location: data.location }),
        ...(data.jobTitle !== undefined && { jobTitle: data.jobTitle }),
        ...(data.language && { language: data.language }),
        ...(data.avatarUrl !== undefined && { avatarUrl: data.avatarUrl }),
      },
    });
  }

  /**
   * Invite a new user to the platform
   */
  static async inviteUser(data: {
    name: string;
    email: string;
    role: UserRole;
    phone?: string;
    location?: string;
    jobTitle?: string;
    invitedBy: string; // Name of the person inviting
  }) {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email }
    });

    if (existingUser) {
      throw new Error('A user with this email already exists');
    }

    // Generate invitation token (valid for 7 days)
    const invitationToken = crypto.randomBytes(32).toString('hex');
    const invitationExpiry = new Date();
    invitationExpiry.setDate(invitationExpiry.getDate() + 7);

    // Generate initials from name
    const nameParts = data.name.trim().split(' ');
    const initials = nameParts.length >= 2
      ? `${nameParts[0][0]}${nameParts[nameParts.length - 1][0]}`.toUpperCase()
      : nameParts[0].substring(0, 2).toUpperCase();

    // Create temporary password hash (will be replaced when user accepts invitation)
    const tempPasswordHash = await bcrypt.hash(crypto.randomBytes(32).toString('hex'), 10);

    // Create user with Invited status
    const newUser = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        role: data.role,
        status: UserStatus.Invited,
        initials,
        passwordHash: tempPasswordHash,
        phone: data.phone,
        location: data.location,
        jobTitle: data.jobTitle || data.role,
        invitationToken,
        invitationExpiry,
      },
    });

    // Send invitation email
    try {
      await EmailService.sendInvitationEmail(
        data.email,
        data.name,
        data.role,
        invitationToken,
        data.invitedBy
      );
    } catch (emailError) {
      // If email fails, delete the user and throw error
      await prisma.user.delete({ where: { id: newUser.id } });
      throw new Error('Failed to send invitation email. Please try again.');
    }

    // Return user without sensitive data
    const { passwordHash, invitationToken: token, ...userWithoutSensitiveData } = newUser;
    return userWithoutSensitiveData;
  }

  /**
   * Verify invitation token
   */
  static async verifyInvitationToken(token: string) {
    const user = await prisma.user.findUnique({
      where: { invitationToken: token }
    });

    if (!user) {
      throw new Error('Invalid invitation token');
    }

    if (!user.invitationExpiry || user.invitationExpiry < new Date()) {
      throw new Error('Invitation has expired');
    }

    if (user.status !== UserStatus.Invited) {
      throw new Error('Invitation has already been accepted');
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    };
  }

  /**
   * Accept invitation and set password
   */
  static async acceptInvitation(token: string, password: string) {
    // Verify token first
    const userInfo = await this.verifyInvitationToken(token);

    // Hash the new password
    const passwordHash = await bcrypt.hash(password, 10);

    // Update user: set password, clear token, activate account
    const updatedUser = await prisma.user.update({
      where: { id: userInfo.id },
      data: {
        passwordHash,
        status: UserStatus.Active,
        invitationToken: null,
        invitationExpiry: null,
      },
    });

    // Return user without password
    const { passwordHash: _, ...userWithoutPassword } = updatedUser;
    return userWithoutPassword;
  }
}

