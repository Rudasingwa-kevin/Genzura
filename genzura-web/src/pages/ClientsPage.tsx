import { useState } from 'react';
import { Plus, Search as SearchIcon, X, Mail, Phone, Briefcase, Calendar, ChevronRight } from 'lucide-react';
import AppLayout from '../components/AppLayout';

// ─── Types ───────────────────────────────────────────────────────────────────
interface Client {
  id: number;
  name: string;
  company: string;
  email: string;
  phone: string;
  industry: string;
  cases: number;
  activeCases: number;
  lastActivity: string;
  initials: string;
  color: string;
  recentCases: { id: string; title: string; status: string }[];
}

// ─── Mock Data ────────────────────────────────────────────────────────────────
const CLIENTS: Client[] = [
  {
    id: 1, name: 'Apex Global Inc.', company: 'Apex Global', email: 'contact@apex.com', phone: '+1 (555) 010-2030',
    industry: 'Corporate', cases: 6, activeCases: 3, lastActivity: '2 hours ago', initials: 'AG', color: 'bg-blue-500',
    recentCases: [
      { id: 'CZ-882', title: 'Corporate Restructuring', status: 'Active' },
      { id: 'CZ-870', title: 'IP Licensing Deal', status: 'Resolved' },
    ],
  },
  {
    id: 2, name: 'NextGen Systems', company: 'NextGen Systems', email: 'legal@nextgen.io', phone: '+1 (555) 020-3040',
    industry: 'Technology', cases: 3, activeCases: 1, lastActivity: '5 hours ago', initials: 'NS', color: 'bg-violet-500',
    recentCases: [
      { id: 'CZ-879', title: 'Intellectual Property Audit', status: 'Pending' },
    ],
  },
  {
    id: 3, name: 'Horizon Partners', company: 'Horizon Partners LLP', email: 'info@horizon.com', phone: '+1 (555) 030-4050',
    industry: 'Finance', cases: 5, activeCases: 2, lastActivity: 'Yesterday', initials: 'HP', color: 'bg-emerald-500',
    recentCases: [
      { id: 'CZ-875', title: 'Compliance Verification', status: 'Active' },
      { id: 'CZ-860', title: 'Fund Audit', status: 'Resolved' },
    ],
  },
  {
    id: 4, name: 'Silverline Law', company: 'Silverline Law Firm', email: 'partners@silverline.law', phone: '+1 (555) 040-5060',
    industry: 'Legal', cases: 8, activeCases: 0, lastActivity: '2 days ago', initials: 'SL', color: 'bg-slate-500',
    recentCases: [
      { id: 'CZ-871', title: 'Litigation Strategy', status: 'Resolved' },
    ],
  },
  {
    id: 5, name: 'Estate Mgmt Co.', company: 'Estate Management Co.', email: 'ops@estatemgmt.com', phone: '+1 (555) 050-6070',
    industry: 'Real Estate', cases: 4, activeCases: 2, lastActivity: '3 days ago', initials: 'EM', color: 'bg-amber-500',
    recentCases: [
      { id: 'CZ-868', title: 'Asset Recovery Plan', status: 'Active' },
    ],
  },
  {
    id: 6, name: 'TechVenture Ltd.', company: 'TechVenture Ltd.', email: 'hello@techventure.co', phone: '+1 (555) 060-7080',
    industry: 'Technology', cases: 2, activeCases: 1, lastActivity: '4 days ago', initials: 'TV', color: 'bg-rose-500',
    recentCases: [
      { id: 'CZ-861', title: 'Merger & Acquisition Review', status: 'Pending' },
    ],
  },
];

// ─── Client Card ─────────────────────────────────────────────────────────────
const ClientCard = ({ client, onSelect }: { client: Client; onSelect: (c: Client) => void }) => (
  <div
    onClick={() => onSelect(client)}
    className="bg-white rounded-[1.5rem] border border-border-base p-6 hover:shadow-xl hover:border-brand-blue/20 transition-all cursor-pointer group"
  >
    <div className="flex items-start justify-between mb-5">
      <div className={`w-14 h-14 rounded-2xl ${client.color} text-white font-bold text-lg flex items-center justify-center shadow-lg`}>
        {client.initials}
      </div>
      <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-brand-light text-brand-blue">
        {client.industry}
      </span>
    </div>
    <h3 className="font-bold text-brand-dark text-base group-hover:text-brand-blue transition-colors">{client.name}</h3>
    <p className="text-xs text-text-muted mt-0.5 mb-5">{client.company}</p>
    <div className="flex items-center justify-between text-xs border-t border-border-base pt-4">
      <div className="flex items-center gap-1.5 text-text-secondary">
        <Briefcase size={13} className="text-text-muted" />
        <span><span className="font-bold text-brand-dark">{client.cases}</span> cases</span>
      </div>
      <div className="flex items-center gap-1.5 text-text-secondary">
        <Calendar size={13} className="text-text-muted" />
        <span>{client.lastActivity}</span>
      </div>
      <div className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${client.activeCases > 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
        {client.activeCases > 0 ? `${client.activeCases} active` : 'No active'}
      </div>
    </div>
  </div>
);

// ─── Client Drawer ────────────────────────────────────────────────────────────
const statusDot: Record<string, string> = {
  Active: 'bg-emerald-500', Pending: 'bg-amber-500', Resolved: 'bg-slate-400',
};
const statusText: Record<string, string> = {
  Active: 'text-emerald-700 bg-emerald-100/50', Pending: 'text-amber-700 bg-amber-100/50', Resolved: 'text-slate-700 bg-slate-100/50',
};

const ClientDrawer = ({ client, onClose }: { client: Client; onClose: () => void }) => (
  <div className="fixed inset-0 z-50 flex justify-end">
    <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={onClose} />
    <div className="relative bg-white w-full max-w-md h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
      {/* Header */}
      <div className="p-8 border-b border-border-base">
        <div className="flex items-center justify-between mb-6">
          <span className="text-xs font-bold uppercase tracking-wider text-text-muted">Client Profile</span>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-page-bg transition-colors text-text-muted">
            <X size={18} />
          </button>
        </div>
        <div className="flex items-center gap-5">
          <div className={`w-16 h-16 rounded-2xl ${client.color} text-white font-bold text-xl flex items-center justify-center shadow-lg`}>
            {client.initials}
          </div>
          <div>
            <h2 className="text-xl font-bold text-brand-dark">{client.name}</h2>
            <p className="text-sm text-text-muted">{client.company}</p>
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-brand-light text-brand-blue mt-1 inline-block">
              {client.industry}
            </span>
          </div>
        </div>
      </div>

      {/* Contact Info */}
      <div className="p-8 border-b border-border-base space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-text-muted">Contact Details</h3>
        <div className="flex items-center gap-3 text-sm text-text-secondary">
          <div className="w-9 h-9 rounded-xl bg-brand-light flex items-center justify-center text-brand-blue"><Mail size={16}/></div>
          <span>{client.email}</span>
        </div>
        <div className="flex items-center gap-3 text-sm text-text-secondary">
          <div className="w-9 h-9 rounded-xl bg-brand-light flex items-center justify-center text-brand-blue"><Phone size={16}/></div>
          <span>{client.phone}</span>
        </div>
      </div>

      {/* Stats */}
      <div className="p-8 border-b border-border-base grid grid-cols-3 gap-4">
        {[
          { label: 'Total Cases', value: client.cases },
          { label: 'Active', value: client.activeCases },
          { label: 'Resolved', value: client.cases - client.activeCases },
        ].map((s) => (
          <div key={s.label} className="text-center bg-page-bg rounded-2xl py-4">
            <p className="text-2xl font-bold text-brand-dark">{s.value}</p>
            <p className="text-[10px] font-semibold text-text-muted uppercase tracking-wider mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Recent Cases */}
      <div className="p-8 flex-1 overflow-y-auto">
        <h3 className="text-xs font-bold uppercase tracking-wider text-text-muted mb-4">Recent Cases</h3>
        <div className="space-y-3">
          {client.recentCases.map((rc) => (
            <div key={rc.id} className="flex items-center justify-between p-4 bg-page-bg rounded-xl hover:bg-brand-light/30 transition-colors cursor-pointer group">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-brand-light text-brand-blue font-bold text-[9px] flex items-center justify-center">{rc.id}</div>
                <span className="text-sm font-semibold text-brand-dark group-hover:text-brand-blue transition-colors">{rc.title}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${statusText[rc.status]}`}>
                  <div className={`w-1.5 h-1.5 rounded-full ${statusDot[rc.status]}`} />
                  {rc.status}
                </div>
                <ChevronRight size={14} className="text-text-muted" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function ClientsPage() {
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Client | null>(null);

  const filtered = CLIENTS.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.company.toLowerCase().includes(search.toLowerCase()) ||
    c.industry.toLowerCase().includes(search.toLowerCase())
  );

  const action = (
    <button className="bg-brand-blue text-white px-5 py-2 rounded-xl text-sm font-bold flex items-center gap-2 hover:opacity-90 transition-all active:scale-95 whitespace-nowrap">
      <Plus size={18} /> Add Client
    </button>
  );

  return (
    <>
      {selected && <ClientDrawer client={selected} onClose={() => setSelected(null)} />}
      <AppLayout action={action}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-brand-dark">Clients</h1>
            <p className="text-sm text-text-muted mt-1">{CLIENTS.length} clients on record</p>
          </div>
          <div className="relative">
            <SearchIcon size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search clients..."
              className="h-9 pl-9 pr-4 rounded-xl bg-white border border-border-base focus:border-brand-blue/40 outline-none text-sm transition-all"
            />
          </div>
        </div>

        {/* Summary stats */}
        <div className="grid grid-cols-3 gap-6">
          {[
            { label: 'Total Clients', value: CLIENTS.length },
            { label: 'With Active Cases', value: CLIENTS.filter(c=>c.activeCases>0).length },
            { label: 'Total Cases Managed', value: CLIENTS.reduce((s,c)=>s+c.cases,0) },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-2xl border border-border-base p-6">
              <p className="text-3xl font-bold text-brand-dark">{s.value}</p>
              <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Client Grid */}
        {filtered.length === 0 ? (
          <div className="text-center py-20 text-text-muted">No clients found.</div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((c) => (
              <ClientCard key={c.id} client={c} onSelect={setSelected} />
            ))}
          </div>
        )}
      </AppLayout>
    </>
  );
}
