#!/usr/bin/env node
/**
 * Test script for the invitation flow
 * Tests sending an invitation and verifying the token
 */

import fetch from 'node-fetch';

const API_URL = process.env.API_URL || 'http://localhost:5000';
const ADMIN_EMAIL = 's.miller@genzura.law';
const ADMIN_PASSWORD = 'Genzura2026!';

async function testInvitationFlow() {
  console.log('🧪 Testing Invitation Flow...\n');

  try {
    // Step 1: Login as admin
    console.log('1️⃣ Logging in as admin...');
    const loginResponse = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD
      })
    });

    if (!loginResponse.ok) {
      throw new Error('Login failed');
    }

    const { token: adminToken } = await loginResponse.json();
    console.log('✅ Admin logged in successfully\n');

    // Step 2: Send invitation
    console.log('2️⃣ Sending invitation...');
    const testEmail = `test.attorney.${Date.now()}@genzura.law`;
    const inviteResponse = await fetch(`${API_URL}/api/users/invite`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify({
        name: 'Test Attorney',
        email: testEmail,
        role: 'Attorney',
        phone: '+250 788 999 888',
        location: 'Kigali, Rwanda',
        jobTitle: 'Test Attorney'
      })
    });

    if (!inviteResponse.ok) {
      const error = await inviteResponse.json();
      throw new Error(`Invitation failed: ${error.error}`);
    }

    const inviteData = await inviteResponse.json();
    console.log('✅ Invitation sent successfully');
    console.log(`   Email: ${testEmail}`);
    console.log(`   User ID: ${inviteData.user.id}`);
    console.log(`   Status: ${inviteData.user.status}\n`);

    // Step 3: Get invitation token from database
    console.log('3️⃣ Retrieving invitation token from database...');
    const { PrismaClient } = await import('@prisma/client');
    const prisma = new PrismaClient();

    const user = await prisma.user.findUnique({
      where: { email: testEmail },
      select: { invitationToken: true, invitationExpiry: true }
    });

    if (!user || !user.invitationToken) {
      throw new Error('Invitation token not found in database');
    }

    console.log('✅ Token retrieved from database');
    console.log(`   Token: ${user.invitationToken.substring(0, 20)}...`);
    console.log(`   Expires: ${user.invitationExpiry}\n`);

    // Step 4: Verify invitation token
    console.log('4️⃣ Verifying invitation token...');
    const verifyResponse = await fetch(
      `${API_URL}/api/auth/verify-invitation/${user.invitationToken}`
    );

    if (!verifyResponse.ok) {
      const error = await verifyResponse.json();
      throw new Error(`Verification failed: ${error.error}`);
    }

    const verifyData = await verifyResponse.json();
    console.log('✅ Token verified successfully');
    console.log(`   Name: ${verifyData.name}`);
    console.log(`   Email: ${verifyData.email}`);
    console.log(`   Role: ${verifyData.role}\n`);

    // Step 5: Accept invitation
    console.log('5️⃣ Accepting invitation...');
    const acceptResponse = await fetch(`${API_URL}/api/auth/accept-invitation`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        token: user.invitationToken,
        password: 'TestPassword123!'
      })
    });

    if (!acceptResponse.ok) {
      const error = await acceptResponse.json();
      throw new Error(`Acceptance failed: ${error.error}`);
    }

    const acceptData = await acceptResponse.json();
    console.log('✅ Invitation accepted successfully');
    console.log(`   User Status: ${acceptData.user.status}`);
    console.log(`   JWT Token: ${acceptData.token.substring(0, 20)}...\n`);

    // Step 6: Verify user can login
    console.log('6️⃣ Testing login with new credentials...');
    const newLoginResponse = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        password: 'TestPassword123!'
      })
    });

    if (!newLoginResponse.ok) {
      throw new Error('New user login failed');
    }

    console.log('✅ New user can login successfully\n');

    // Cleanup
    console.log('🧹 Cleaning up test user...');
    await prisma.user.delete({
      where: { email: testEmail }
    });
    console.log('✅ Test user deleted\n');

    await prisma.$disconnect();

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🎉 ALL TESTS PASSED!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\n✅ Invitation flow is working correctly!');
    console.log('\nNext steps:');
    console.log('  1. Start the frontend: cd ../genzura-web && npm run dev');
    console.log('  2. Login as admin: s.miller@genzura.law / Genzura2026!');
    console.log('  3. Go to Admin → User Management');
    console.log('  4. Click "Add Team Member" and send a real invitation');
    console.log('  5. Check email and accept the invitation\n');

  } catch (error) {
    console.error('\n❌ TEST FAILED:', error.message);
    console.error('\nTroubleshooting:');
    console.error('  1. Make sure the API server is running: cd genzura-api && npm run dev');
    console.error('  2. Check database connection in .env file');
    console.error('  3. Verify email service is configured');
    console.error('  4. Check API logs: tail -f dev.log\n');
    process.exit(1);
  }
}

testInvitationFlow();
