import { 
  Search, 
  Filter, 
  MoreHorizontal, 
  UserPlus, 
  Mail, 
  Clock,
  X,
  Loader2,
  Zap,
  ShieldCheck,
  Award
} from 'lucide-react';
import AdminLayout from '../../components/AdminLayout';
import { TableSkeleton } from '../../components/Skeleton';
import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';

import { userService } from '../../api/services/user.service';
import { type UserRole, type UserStatus } from '../../data/users';

const ROLE_STYLES: Record<UserRole, string> = {
  'Admin': 'text-brand-blue bg-brand-light',
  'Senior Attorney': 'text-violet-600 bg-violet-50',
  'Attorney': 'text-emerald-600 bg-emerald-50',
  'Paralegal': 'text-amber-600 bg-amber-50',
  'Support': 'text-slate-500 bg-slate-100',
};

const STATUS_DOT: Record<UserStatus, string> = {
  Active: 'bg-emerald-500',
  Invited: 'bg-brand-blue',
  Suspended: 'bg-rose-500',
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function InviteUserModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [isSending, setIsSending] = useState(false);
  
  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSending(true);
    setTimeout(() => {
      setIsSending(false);
      toast.success('Invitation dispatched to team member!', {
        icon: '📨',
        style: { borderRadius: '1.25rem', fontWeight: 'bold' }
      });
      onClose();
    }, 1500);
  };

  return (
    <>
      <div className={`fixed inset-0 z-[100] bg-brand-dark/20 backdrop-blur-sm transition-opacity duration-500 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={onClose} />
      <div className={`fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white z-[110] rounded-[2.5rem] shadow-2xl p-10 transition-all duration-500 ${isOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}`}>
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-brand-dark tracking-tight">Invite Member</h2>
          <button onClick={onClose} className="p-3 rounded-2xl hover:bg-page-bg text-text-muted transition-all"><X size={24} /></button>
        </div>
        <form onSubmit={handleInvite} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-brand-dark uppercase tracking-widest ml-1">Email Address</label>
            <div className="relative">
              <Mail size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-text-muted" />
              <input required type="email" placeholder="attorney@genzura.law" className="w-full h-14 pl-14 pr-6 rounded-2xl bg-page-bg border border-transparent focus:bg-white focus:border-brand-blue outline-none transition-all font-bold text-brand-dark" />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-brand-dark uppercase tracking-widest ml-1">Assigned Role</label>
            <select className="w-full h-14 px-6 rounded-2xl bg-page-bg border border-transparent focus:bg-white focus:border-brand-blue outline-none transition-all font-bold text-brand-dark text-sm appearance-none cursor-pointer">
              <option>Senior Attorney</option>
              <option>Attorney</option>
              <option>Paralegal</option>
              <option>Support Staff</option>
            </select>
          </div>
          <button type="submit" disabled={isSending} className="w-full h-14 bg-brand-blue text-white rounded-2xl font-bold shadow-xl shadow-brand-blue/20 hover:shadow-2xl hover:-translate-y-1 transition-all active:scale-95 flex items-center justify-center gap-3 disabled:opacity-70 mt-4">
            {isSending ? <Loader2 size={20} className="animate-spin" /> : <Zap size={20} />}
            Send Invitation
          </button>
        </form>
      </div>
    </>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function UserManagement() {
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const data = await userService.getAll();
        setUsers(data);
      } catch (error) {
        console.error('Failed to fetch users:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const filtered = users.filter(t => 
    t.name.toLowerCase().includes(search.toLowerCase()) || 
    t.email.toLowerCase().includes(search.toLowerCase()) ||
    t.role.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AdminLayout title="User Management">
      <InviteUserModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div>
          <h1 className="text-3xl font-bold text-brand-dark tracking-tight">User Management</h1>
          <p className="text-sm text-text-muted mt-1">Manage firm personnel, roles, and system access.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-brand-blue text-white font-bold hover:shadow-xl hover:-translate-y-0.5 transition-all shadow-lg shadow-brand-blue/20"
        >
          <UserPlus size={18} /> Add Team Member
        </button>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-border-base shadow-sm overflow-hidden animate-in-fade">
        <div className="p-6 border-b border-border-base flex flex-wrap items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" />
            <input 
              type="text" 
              placeholder="Search by name, email or role..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full h-11 pl-11 pr-4 rounded-xl bg-page-bg border border-transparent focus:bg-white focus:border-brand-blue/30 outline-none text-sm font-bold transition-all"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border-base font-bold text-xs text-text-secondary hover:bg-page-bg transition-all">
            <Filter size={14} /> Advanced Filter
          </button>
        </div>

        {isLoading ? (
          <TableSkeleton rows={8} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-page-bg/30 border-b border-border-base">
                  <th className="px-8 py-4 text-[10px] font-bold text-text-muted uppercase tracking-widest">Team Member</th>
                  <th className="px-8 py-4 text-[10px] font-bold text-text-muted uppercase tracking-widest">Role</th>
                  <th className="px-8 py-4 text-[10px] font-bold text-text-muted uppercase tracking-widest text-center">Status</th>
                  <th className="px-8 py-4 text-[10px] font-bold text-text-muted uppercase tracking-widest">Last Active</th>
                  <th className="px-8 py-4 w-10"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((member) => (
                  <tr key={member.id} className="group border-b border-border-base last:border-0 hover:bg-page-bg/40 transition-all cursor-pointer">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-brand-light flex items-center justify-center text-[13px] font-bold text-brand-blue border border-brand-blue/5 shadow-inner">
                          {member.initials}
                        </div>
                        <div>
                          <p className="font-bold text-brand-dark group-hover:text-brand-blue transition-colors flex items-center gap-2">
                            {member.name}
                            {member.role === 'Admin' && <ShieldCheck size={14} className="text-brand-blue" />}
                            {member.role === 'Senior Attorney' && <Award size={14} className="text-violet-500" />}
                          </p>
                          <p className="text-xs text-text-muted font-medium">{member.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className={`text-[10px] font-bold uppercase px-3 py-1.5 rounded-full border border-current/10 ${ROLE_STYLES[member.role]}`}>
                        {member.role}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex justify-center">
                        <div className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest border border-slate-200 bg-white shadow-sm`}>
                          <div className={`w-1.5 h-1.5 rounded-full ${STATUS_DOT[member.status]}`} />
                          {member.status}
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2 text-sm text-text-secondary font-bold">
                        <Clock size={14} className="text-text-muted" />
                        {member.lastActive}
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <button className="p-2.5 rounded-xl hover:bg-white text-text-muted hover:text-brand-blue transition-all shadow-sm group-hover:border border-border-base">
                        <MoreHorizontal size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
