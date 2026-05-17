export interface Client {
  id: number;
  name: string;
  company: string;
  email: string;
  phone: string;
  address?: string;
  industry: string;
  cases: number;
  activeCases: number;
  lastActivity: string;
  initials: string;
  color: string;
  since: string;
  recentCases: { id: string; title: string; status: string; date: string }[];
  notes: { id: string; text: string; author: string; date: string }[];
}

// ──────────────────────────────────────────────────────────────────────────────
// NOTE: Mock data has been removed. All client data is now fetched from the API.
// See: genzura-web/src/api/services/client.service.ts
// ──────────────────────────────────────────────────────────────────────────────
