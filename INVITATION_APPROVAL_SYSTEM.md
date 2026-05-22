# Case Invitation Approval System

## Overview

The system now implements an **approval workflow** for case team invitations instead of directly adding users to cases. When someone invites an attorney to join a case, the invitee receives a notification and must approve or reject the invitation before being added to the team.

## How It Works

### 1. Sending an Invitation

When you click **"Invite Attorney"** on a case detail page and select a user:
- An **invitation record** is created with status `Pending`
- The invitee receives a **notification** about the invitation
- The invitation includes:
  - Case information (case number, title)
  - Who sent the invitation
  - Role in the case (default: "Team Member")
  - Optional message

### 2. Receiving an Invitation

The invited user sees a notification:
- **Title**: "Case Invitation"
- **Body**: "[Inviter Name] invited you to join case [Case Number]: [Case Title]"
- **Actions**: Approve or Reject

### 3. Responding to Invitations

**To Approve:**
- User clicks "Approve" in their notifications
- System adds them to the case team
- Original inviter receives a notification: "Invitation Accepted"
- User can now access the case

**To Reject:**
- User clicks "Reject" in their notifications
- Invitation status changes to `Rejected`
- Original inviter receives a notification: "Invitation Declined"
- User is NOT added to the team

## Database Schema

### New Models

#### `CaseInvitation`
```prisma
model CaseInvitation {
  id           String           @id @default(cuid())
  caseId       String
  inviteeId    String           // User being invited
  inviterId    String           // User who sent the invitation
  role         String           // Role in the case
  status       InvitationStatus @default(Pending)
  message      String?          @db.Text
  createdAt    DateTime         @default(now())
  respondedAt  DateTime?
}

enum InvitationStatus {
  Pending
  Approved
  Rejected
}
```

#### Updated `Notification` Model
```prisma
model Notification {
  // ... existing fields
  metadata  Json?  // Now includes invitation details
}

enum NotificationType {
  // ... existing types
  invitation  // New type for invitations
}
```

## API Endpoints

### Invitation Management

```http
GET /api/invitations/my-invitations
# Get all pending invitations for the logged-in user

POST /api/invitations/:invitationId/approve
# Approve an invitation (adds user to case team)

POST /api/invitations/:invitationId/reject
# Reject an invitation

GET /api/invitations/case/:caseId
# Get all invitations for a specific case (admin/case owner)
```

### Modified Endpoint

```http
POST /api/cases/:id/team
# Now sends invitation instead of directly adding user
# Body: { userId: string, message?: string }
# Returns: { message: string, invitation: Invitation }
```

## Frontend Integration

### Notification Component

The notification system should display:

1. **Invitation notifications** with special styling
2. **Approve/Reject buttons** inline in the notification
3. **Real-time updates** when invitation status changes

### Case Detail Page

When inviting a user:
- Show confirmation: "Invitation sent successfully"
- Display pending invitations in the case team section
- Show invitation status (Pending/Approved/Rejected)

## Benefits

### Security & Privacy
- ✅ Users control which cases they join
- ✅ No unauthorized access to case data
- ✅ Clear audit trail of who invited whom

### User Experience
- ✅ Professional workflow (like LinkedIn/Slack invites)
- ✅ Users won't be surprised by unexpected case assignments
- ✅ Clear communication between team members

### Compliance
- ✅ Documented consent for data access
- ✅ Audit trail for regulatory requirements
- ✅ Users explicitly opt-in to case collaboration

## Example Flow

```
┌─────────────┐
│ Attorney A  │  Invites Attorney B to Case #CV-2026-0482
└──────┬──────┘
       │
       ▼
┌─────────────────────────────────────────┐
│ System creates CaseInvitation          │
│ Status: Pending                         │
└──────┬──────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────┐
│ Attorney B receives notification        │
│ "Attorney A invited you to join..."     │
└──────┬──────────────────────────────────┘
       │
       ├─── Approve ───┐
       │               ▼
       │        ┌─────────────────────┐
       │        │ Added to case team  │
       │        │ Can access case     │
       │        └─────────────────────┘
       │
       └─── Reject ────┐
                       ▼
                ┌─────────────────────┐
                │ NOT added to team   │
                │ Inviter notified    │
                └─────────────────────┘
```

## Migration Notes

### Existing Team Members
- ✅ Not affected - already on the team
- ✅ No invitations created retroactively

### Future Invitations
- ✅ All new invitations require approval
- ✅ Applies to all user roles (Attorney, Paralegal, etc.)

## Testing

To test the invitation system:

1. **Send an invitation**
   ```bash
   curl -X POST http://localhost:5000/api/cases/{caseId}/team \
     -H "Authorization: Bearer {token}" \
     -H "Content-Type: application/json" \
     -d '{"userId": "U-103", "message": "Please join this case"}'
   ```

2. **View invitations**
   ```bash
   curl -X GET http://localhost:5000/api/invitations/my-invitations \
     -H "Authorization: Bearer {token}"
   ```

3. **Approve invitation**
   ```bash
   curl -X POST http://localhost:5000/api/invitations/{invitationId}/approve \
     -H "Authorization: Bearer {token}"
   ```

## Next Steps

### Frontend Implementation
- [ ] Update notification UI to show Approve/Reject buttons
- [ ] Add invitation list page
- [ ] Show pending invitations count in navigation
- [ ] Add toast notifications for invitation events

### Backend Enhancements
- [ ] Add invitation expiry (auto-reject after 7 days)
- [ ] Email notifications for invitations
- [ ] Bulk invitation support
- [ ] Invitation history tracking

---

**Implemented**: 2026-05-22
**Status**: ✅ Backend Complete | 🚧 Frontend Pending
