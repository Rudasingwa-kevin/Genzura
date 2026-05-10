import { 
  Save, 
  CheckCircle2, 
  Layout, 
  FileText,
  Lock,
  Workflow,
  Clock,
  Building,
  Globe,
  Palette,
  Shield,
  Database,
  Link as LinkIcon,
  ExternalLink,
  RefreshCw,
  Mail,
  Box,
  Cloud,
  FileCheck
} from 'lucide-react';
import AdminLayout from '../../components/AdminLayout';
import { useState } from 'react';
import { toast } from 'react-hot-toast';

type Tab = 'branding' | 'practice' | 'security' | 'integrations' | 'infra';

export default function SystemSettings() {
  const [activeTab, setActiveTab] = useState<Tab>('branding');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      toast.success('System configurations updated firm-wide.', {
        icon: '⚙️',
        style: { borderRadius: '1.25rem', fontWeight: 'bold' }
      });
    }, 1200);
  };

  return (
    <AdminLayout title="System Configuration">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div>
          <h1 className="text-3xl font-bold text-brand-dark tracking-tight">System Configuration</h1>
          <p className="text-sm text-text-muted mt-1">Manage global firm policies, branding, and practice area definitions.</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-2 px-8 py-3 rounded-xl bg-brand-blue text-white font-bold hover:shadow-xl hover:-translate-y-0.5 transition-all shadow-lg shadow-brand-blue/20 disabled:opacity-70"
        >
          {isSaving ? <Workflow className="animate-spin" size={18} /> : <Save size={18} />}
          Save All Changes
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-10">
        {/* Navigation Rail */}
        <aside className="lg:w-72 shrink-0">
          <div className="bg-white rounded-[2rem] border border-border-base p-4 space-y-2 shadow-sm">
            {[
              { id: 'branding',     label: 'Firm Branding',    icon: Palette },
              { id: 'practice',     label: 'Practice Areas',   icon: Layout },
              { id: 'security',     label: 'Global Security',  icon: Shield },
              { id: 'integrations', label: 'Integration Hub',  icon: LinkIcon },
              { id: 'infra',        label: 'Infrastructure',   icon: Database },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as Tab)}
                className={`w-full flex items-center gap-3.5 px-5 py-4 rounded-2xl transition-all font-bold text-sm ${
                  activeTab === tab.id 
                    ? 'bg-brand-blue text-white shadow-xl shadow-brand-blue/20 translate-x-1' 
                    : 'text-text-secondary hover:bg-page-bg hover:text-brand-blue'
                }`}
              >
                <tab.icon size={20} />
                {tab.label}
              </button>
            ))}
          </div>

          <div className="mt-8 p-6 rounded-[2rem] bg-brand-dark text-white shadow-2xl relative overflow-hidden group">
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-brand-blue/20 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-1000" />
            <Shield className="mb-4 text-brand-blue" size={32} />
            <p className="font-bold text-lg mb-2">Audit Status</p>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">Your firm compliance audit is currently at 100%. All security protocols are active.</p>
            <div className="flex items-center gap-2 text-[10px] font-bold text-brand-blue uppercase tracking-widest">
              <CheckCircle2 size={12} /> Last Verified Today
            </div>
          </div>
        </aside>

        {/* Content Area */}
        <main className="flex-1">
          <div className="bg-white rounded-[2.5rem] border border-border-base p-10 shadow-sm animate-in-up">
            {activeTab === 'branding' && (
              <div className="space-y-10">
                <section>
                  <h3 className="text-xl font-bold text-brand-dark mb-6 flex items-center gap-3">
                    <Building className="text-brand-blue" size={24} /> Identity Settings
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-brand-dark uppercase tracking-widest ml-1">Legal Entity Name</label>
                      <input type="text" defaultValue="Genzura Litigation Group" className="w-full h-14 px-6 rounded-2xl bg-page-bg border border-transparent focus:bg-white focus:border-brand-blue outline-none transition-all font-bold text-brand-dark" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-brand-dark uppercase tracking-widest ml-1">Support Email</label>
                      <input type="email" defaultValue="admin@genzura.law" className="w-full h-14 px-6 rounded-2xl bg-page-bg border border-transparent focus:bg-white focus:border-brand-blue outline-none transition-all font-bold text-brand-dark" />
                    </div>
                  </div>
                </section>

                <section>
                  <label className="text-[10px] font-bold text-brand-dark uppercase tracking-widest ml-1 block mb-4">Firm Logo</label>
                  <div className="flex items-center gap-8 p-8 rounded-3xl border-2 border-dashed border-border-base bg-page-bg/30">
                    <div className="w-24 h-24 bg-white rounded-2xl border border-border-base flex items-center justify-center p-4">
                      <img src="/Genzura website header.png" alt="Logo" className="w-full h-auto" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-brand-dark mb-1">Upload Corporate Logo</p>
                      <p className="text-xs text-text-muted mb-4">SVG or PNG recommended. Max 2MB.</p>
                      <button className="px-4 py-2 bg-white border border-border-base rounded-xl text-xs font-bold text-brand-blue hover:bg-brand-blue hover:text-white transition-all shadow-sm">Replace Asset</button>
                    </div>
                  </div>
                </section>
              </div>
            )}

            {activeTab === 'practice' && (
              <div className="space-y-8">
                <h3 className="text-xl font-bold text-brand-dark mb-6 flex items-center gap-3">
                  <Layout className="text-brand-blue" size={24} /> Taxonomy & Classification
                </h3>
                <p className="text-sm text-text-muted mb-8 leading-relaxed">Configure the available practice areas and classification tags available during case initialization across your firm.</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {['Civil Litigation', 'Corporate Law', 'Intellectual Property', 'Employment Law', 'Family Law', 'Criminal Defense'].map(p => (
                    <div key={p} className="flex items-center justify-between p-5 rounded-2xl border border-border-base bg-page-bg/50 group hover:bg-white hover:shadow-md transition-all">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-white border border-border-base flex items-center justify-center text-brand-blue">
                          <FileText size={18} />
                        </div>
                        <span className="font-bold text-brand-dark">{p}</span>
                      </div>
                      <button className="text-[10px] font-bold text-text-muted hover:text-rose-500 uppercase tracking-widest transition-colors opacity-0 group-hover:opacity-100">Remove</button>
                    </div>
                  ))}
                  <button className="p-5 rounded-2xl border-2 border-dashed border-border-base text-brand-blue font-bold text-sm hover:bg-brand-blue/5 transition-all flex items-center justify-center gap-2">
                    <Workflow size={18} /> Add New Practice Area
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'security' && (
              <div className="space-y-10">
                <h3 className="text-xl font-bold text-brand-dark mb-6 flex items-center gap-3">
                  <Shield className="text-brand-blue" size={24} /> Security Protocols
                </h3>
                
                <div className="space-y-6">
                  {[
                    { label: 'Multi-Factor Authentication (MFA)', desc: 'Enforce 2FA for all team members upon login.', icon: Lock, active: true },
                    { label: 'Session Timeout', desc: 'Automatically logout users after 30 minutes of inactivity.', icon: Clock, active: true },
                    { label: 'IP Access Restriction', desc: 'Limit dashboard access to known office IP ranges.', icon: Globe, active: false },
                  ].map(sec => (
                    <div key={sec.label} className="flex items-start justify-between p-6 rounded-3xl border border-border-base hover:bg-page-bg/30 transition-all">
                      <div className="flex gap-5">
                        <div className="p-3 rounded-2xl bg-brand-light text-brand-blue"><sec.icon size={22} /></div>
                        <div>
                          <p className="font-bold text-brand-dark mb-1">{sec.label}</p>
                          <p className="text-xs text-text-muted font-medium">{sec.desc}</p>
                        </div>
                      </div>
                      <div className={`w-12 h-6 rounded-full relative cursor-pointer transition-colors ${sec.active ? 'bg-brand-blue' : 'bg-slate-200'}`}>
                        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${sec.active ? 'left-7' : 'left-1'}`} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'integrations' && (
              <div className="space-y-10">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-brand-dark flex items-center gap-3">
                    <LinkIcon className="text-brand-blue" size={24} /> External Integration Hub
                  </h3>
                  <button className="flex items-center gap-2 text-xs font-bold text-brand-blue hover:underline">
                    <RefreshCw size={14} /> Refresh All Connections
                  </button>
                </div>
                
                <p className="text-sm text-text-muted leading-relaxed max-w-2xl">
                  Connect your litigation command center with the industry's leading tools. Once connected, these integrations will be available firm-wide to all authorized staff.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[
                    { name: 'DocuSign', category: 'E-Signatures', desc: 'Securely sign and send legal documents.', icon: FileCheck, color: 'text-blue-600', bg: 'bg-blue-50', connected: true },
                    { name: 'Office 365', category: 'Productivity', desc: 'Sync calendars and Outlook correspondence.', icon: Mail, color: 'text-orange-500', bg: 'bg-orange-50', connected: true },
                    { name: 'Dropbox Business', category: 'Cloud Storage', desc: 'Direct file sync with matter folders.', icon: Box, color: 'text-indigo-600', bg: 'bg-indigo-50', connected: false },
                    { name: 'Clio Manage', category: 'Practice Management', desc: 'Sync matter data and client billing.', icon: Cloud, color: 'text-brand-blue', bg: 'bg-brand-light', connected: false },
                  ].map(app => (
                    <div key={app.name} className="p-6 rounded-[2rem] border border-border-base bg-white hover:shadow-lg transition-all group flex flex-col justify-between h-full">
                      <div>
                        <div className="flex items-center justify-between mb-6">
                          <div className={`w-12 h-12 rounded-2xl ${app.bg} ${app.color} flex items-center justify-center shadow-sm`}>
                            <app.icon size={24} />
                          </div>
                          {app.connected ? (
                            <span className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-bold uppercase rounded-lg border border-emerald-100">
                              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Connected
                            </span>
                          ) : (
                            <span className="px-3 py-1 bg-slate-50 text-slate-400 text-[10px] font-bold uppercase rounded-lg border border-slate-100">
                              Disconnected
                            </span>
                          )}
                        </div>
                        <h4 className="font-bold text-brand-dark mb-1">{app.name}</h4>
                        <p className="text-[10px] font-bold text-brand-blue uppercase tracking-widest mb-3">{app.category}</p>
                        <p className="text-xs text-text-muted leading-relaxed mb-6">{app.desc}</p>
                      </div>
                      
                      <button className={`w-full py-3 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 ${
                        app.connected 
                          ? 'bg-slate-50 text-text-secondary hover:bg-slate-100 border border-slate-200' 
                          : 'bg-brand-blue text-white shadow-lg shadow-brand-blue/20 hover:shadow-xl hover:-translate-y-0.5'
                      }`}>
                        {app.connected ? 'Configure Settings' : 'Initialize Connection'}
                        <ExternalLink size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'infra' && (
              <div className="py-20 text-center">
                <Database className="mx-auto mb-6 text-brand-blue opacity-20" size={64} />
                <h4 className="text-xl font-bold text-brand-dark mb-2">Infrastructure Connectivity</h4>
                <p className="text-sm text-text-muted max-w-xs mx-auto font-medium">Database and API configurations are managed by the core Genzura DevOps team.</p>
                <button className="mt-8 text-sm font-bold text-brand-blue hover:underline">Request Infrastructure Keys</button>
              </div>
            )}
          </div>
        </main>
      </div>
    </AdminLayout>
  );
}
