export type UserRole = 'Admin' | 'Senior Attorney' | 'Attorney' | 'Paralegal' | 'Support';
export type UserStatus = 'Active' | 'Invited' | 'Suspended';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  lastActive: string;
  initials: string;
}

// ──────────────────────────────────────────────────────────────────────────────
// NOTE: Mock data has been removed. All user data is now fetched from the API.
// See: genzura-web/src/api/services/user.service.ts
// ──────────────────────────────────────────────────────────────────────────────
