# Attorney/User Invitation Feature

## Overview
Complete implementation of the user invitation system allowing admins to invite team members to join Genzura.

## Features

### Backend (API)
- ✅ Invitation token generation and validation
- ✅ Secure 7-day expiration on invitation tokens
- ✅ Branded invitation emails with Genzura styling
- ✅ Token verification endpoint
- ✅ Invitation acceptance with password setup
- ✅ Automatic user activation after acceptance
- ✅ Admin-only invitation sending

### Frontend (Web)
- ✅ Enhanced invite modal with full form fields
- ✅ Beautiful invitation acceptance page
- ✅ Real-time password validation
- ✅ Automatic login after acceptance
- ✅ User list refresh after sending invitation
- ✅ Toast notifications for success/error states

## Database Schema Changes

### User Model
Added two new fields to support invitations:

```prisma
invitationToken   String?   @unique
invitationExpiry  DateTime?
```

## API Endpoints

### POST /api/users/invite
**Auth:** Admin only  
**Description:** Send an invitation to a new user

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "role": "Attorney",
  "phone": "+250 788 123 456",
  "location": "Kigali, Rwanda",
  "jobTitle": "Attorney"
}
```

**Response:**
```json
{
  "message": "Invitation sent successfully",
  "user": {
    "id": "...",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "Attorney",
    "status": "Invited"
  }
}
```

### GET /api/auth/verify-invitation/:token
**Auth:** None  
**Description:** Verify invitation token and get user info

**Response:**
```json
{
  "id": "...",
  "name": "John Doe",
  "email": "john@example.com",
  "role": "Attorney"
}
```

### POST /api/auth/accept-invitation
**Auth:** None  
**Description:** Accept invitation and set password

**Request Body:**
```json
{
  "token": "invitation_token_here",
  "password": "SecurePassword123"
}
```

**Response:**
```json
{
  "message": "Invitation accepted successfully",
  "user": { /* user object */ },
  "token": "jwt_token_for_immediate_login"
}
```

## User Flow

### 1. Admin Sends Invitation
1. Admin goes to `/admin/users`
2. Clicks "Add Team Member" button
3. Fills out the invitation form:
   - Full Name (required)
   - Email Address (required)
   - Role (required) - Senior Attorney, Attorney, Paralegal, Support
   - Phone (optional)
4. Clicks "Send Invitation"
5. System creates user with status "Invited"
6. Invitation email is sent

### 2. User Receives Email
Email includes:
- Personalized greeting with user's name
- Who invited them
- Their assigned role
- List of platform features
- "Accept Invitation & Set Password" button
- 7-day expiration notice

### 3. User Accepts Invitation
1. Clicks link in email (goes to `/accept-invitation?token=...`)
2. System verifies token and shows user info
3. User creates password (minimum 8 characters)
4. Confirms password
5. Clicks "Complete Setup"
6. Account activated, automatically logged in
7. Redirected to dashboard

## Email Template

The invitation email features:
- Genzura branding with logo
- Gradient header with "Welcome to the Team!" message
- User information (name, email, role)
- Feature highlights in styled box
- Prominent CTA button
- Expiration warning
- Support contact information
- Branded footer

## Security Features

1. **Secure Token Generation**
   - Uses `crypto.randomBytes(32)` for token generation
   - Tokens are 64-character hex strings

2. **Token Expiration**
   - All tokens expire after 7 days
   - Expired tokens cannot be used

3. **One-Time Use**
   - Tokens are cleared after acceptance
   - Cannot be reused

4. **Status Validation**
   - Only users with "Invited" status can accept
   - Prevents duplicate acceptances

5. **Password Validation**
   - Minimum 8 characters required
   - Client and server-side validation

6. **Admin-Only Invitations**
   - Only Admin users can send invitations
   - Protected by authorization middleware

## Testing the Feature

### Manual Testing Steps

1. **Start the servers:**
   ```bash
   # Terminal 1 - API
   cd genzura-api
   npm run dev

   # Terminal 2 - Web
   cd genzura-web
   npm run dev
   ```

2. **Send an invitation:**
   - Login as admin: `s.miller@genzura.law` / `Genzura2026!`
   - Go to Admin → User Management
   - Click "Add Team Member"
   - Fill in the form and submit

3. **Check email:**
   - Check the inbox for the invitation email
   - Should have Genzura branding and invitation link

4. **Accept invitation:**
   - Click the link in the email
   - Should see AcceptInvitationPage with user info
   - Create a password and confirm
   - Should be logged in and redirected to dashboard

5. **Verify user activation:**
   - Check User Management page
   - New user should have "Active" status
   - Can now log in with email/password

### API Testing with curl

```bash
# 1. Send invitation (requires admin token)
curl -X POST http://localhost:5000/api/users/invite \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "role": "Attorney",
    "phone": "+250 788 123 456"
  }'

# 2. Verify token
curl http://localhost:5000/api/auth/verify-invitation/TOKEN_FROM_EMAIL

# 3. Accept invitation
curl -X POST http://localhost:5000/api/auth/accept-invitation \
  -H "Content-Type: application/json" \
  -d '{
    "token": "TOKEN_FROM_EMAIL",
    "password": "SecurePass123"
  }'
```

## Error Handling

### Common Errors

| Error | Status | Solution |
|-------|--------|----------|
| "A user with this email already exists" | 500 | Use a different email or manage existing user |
| "Invalid invitation token" | 400 | Token is incorrect or user doesn't exist |
| "Invitation has expired" | 400 | Request a new invitation |
| "Invitation has already been accepted" | 400 | User is already active, use login |
| "Password must be at least 8 characters" | 400 | Use a longer password |
| "Failed to send invitation email" | 500 | Check email service configuration |

## Environment Variables Required

```env
# Email Service (Required for invitations)
BREVO_SMTP_USER=your_brevo_email
BREVO_SMTP_KEY=your_brevo_smtp_key
SENDER_EMAIL=noreply@genzura.rw
SENDER_NAME=Genzura Legal

# Frontend URL (for invitation links)
FRONTEND_URL=http://localhost:5173

# JWT Secret (for authentication)
JWT_SECRET=your_secret_key
```

## File Changes

### Backend Files
- `prisma/schema.prisma` - Added invitation fields
- `src/services/emailService.ts` - Added sendInvitationEmail method
- `src/services/userService.ts` - Added inviteUser, verifyInvitationToken, acceptInvitation
- `src/controllers/userController.ts` - Added inviteUser controller
- `src/controllers/authController.ts` - Added verifyInvitation, acceptInvitation
- `src/routes/userRoutes.ts` - Added POST /invite route
- `src/routes/authRoutes.ts` - Added invitation routes

### Frontend Files
- `src/api/services/user.service.ts` - Added inviteUser method
- `src/pages/admin/UserManagement.tsx` - Enhanced InviteUserModal
- `src/pages/AcceptInvitationPage.tsx` - New invitation acceptance page
- `src/App.tsx` - Added /accept-invitation route

## Future Enhancements

Potential improvements:
- [ ] Resend invitation functionality
- [ ] Bulk invite multiple users
- [ ] Custom invitation messages
- [ ] Invitation analytics (sent, accepted, expired)
- [ ] Email template customization in admin panel
- [ ] Role-based invitation limits
- [ ] SMS invitation option
- [ ] Invitation approval workflow

## Troubleshooting

### Emails not sending
1. Check BREVO_SMTP_USER and BREVO_SMTP_KEY in `.env`
2. Verify email service is configured correctly
3. Check API logs for email errors

### Token verification fails
1. Ensure token hasn't expired (7 days)
2. Check database for invitation token
3. Verify URL encoding of token

### User not activating
1. Check if invitation was accepted successfully
2. Verify status changed from "Invited" to "Active"
3. Check database directly if needed

## Support

For issues or questions:
- Check API logs: `genzura-api/dev.log`
- Review email service status
- Test email configuration: `npm run test:email`
- Contact: support@genzura.rw
