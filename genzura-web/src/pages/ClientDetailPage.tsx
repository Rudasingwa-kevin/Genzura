import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft, Mail, Phone, MapPin, Briefcase,
  FileText, MessageSquare, ExternalLink, AlertCircle, Plus, Clock
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import AppLayout from '../components/AppLayout';
import { clientService } from '../api/services/client.service';
import { documentService } from '../api/services/document.service';
import { CardSkeleton } from '../components/Skeleton';

type TabKey = 'cases' | 'documents' | 'notes';

const statusBadge: Record<string, string> = {
  Active:   'bg-emerald-100/60 text-emerald-700',
  Pending:  'bg-amber-100/60  text-amber-700',
  Resolved: 'bg-slate-100/60  text-slate-600',
};
const statusDot: Record<string, string> = {
  Active: 'bg-emerald-500', Pending: 'bg-amber-500', Resolved: 'bg-slate-400',
};

export default function ClientDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabKey>('cases');
  const [client, setClient] = useState<any>(null);
  const [clientDocs, setClientDocs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const fetchClientData = async () => {
      if (!id) return;

      try {
        setIsLoading(true);
        const [clientData, documents] = await Promise.all([
          clientService.getById(id),
          documentService.getAll()
        ]);

        setClient(clientData);
        // Filter documents for this client
        setClientDocs(documents.filter((d: any) => d.caseId && clientData.cases?.some((c: any) => c.id === d.caseId)));
      } catch (error) {
        console.error('Failed to fetch client:', error);
        setNotFound(true);
        toast.error('Failed to load client details');
      } finally {
        setIsLoading(false);
      }
    };

    fetchClientData();
  }, [id]);

  if (isLoading) {
    return (
      <AppLayout>
        <div className="space-y-6">
          <CardSkeleton />
          <CardSkeleton />
        </div>
      </AppLayout>
    );
  }

  if (notFound || !client) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center py-32 text-center">
          <div className="w-20 h-20 bg-page-bg rounded-3xl flex items-center justify-center mb-6">
            <AlertCircle size={32} className="text-text-muted" />
          </div>
          <h2 className="text-2xl font-bold text-brand-dark mb-2">Client Not Found</h2>
          <p className="text-text-secondary mb-8">The client you're looking for doesn't exist or has been removed.</p>
          <button onClick={() => navigate('/clients')} className="bg-brand-blue text-white px-6 py-3 rounded-xl font-bold">
            Back to Clients
          </button>
        </div>
      </AppLayout>
    );
  }

  const tabs: { key: TabKey; label: string; icon: React.ElementType; count: number }[] = [
    { key: 'cases',     label: 'Cases',     icon: Briefcase,    count: client.cases?.length || 0 },
    { key: 'documents', label: 'Documents', icon: FileText,     count: clientDocs.length },
    { key: 'notes',     label: 'Notes',     icon: MessageSquare, count: 0 },
  ];

  return (
    <AppLayout breadcrumbLabel={client.name}>
      {/* Back nav */}
      <button
        onClick={() => navigate('/clients')}
        className="inline-flex items-center gap-2 text-sm font-semibold text-text-muted hover:text-brand-blue transition-colors group mb-2"
      >
        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Back to Clients
      </button>

      {/* ── Profile Header ── */}
      <div className="bg-white rounded-[2rem] border border-border-base p-8 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center gap-6">
          <div className="w-20 h-20 rounded-[1.25rem] bg-brand-blue text-white font-bold text-2xl flex items-center justify-center shadow-xl shrink-0">
            {client.name?.substring(0, 2).toUpperCase() || 'CL'}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-3 mb-1">
              <h1 className="text-3xl font-bold text-brand-dark">{client.name}</h1>
              {client.industry && (
                <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-brand-light text-brand-blue">
                  {client.industry}
                </span>
              )}
              {client.cases?.filter((c: any) => c.status === 'Active').length > 0 && (
                <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700">
                  {client.cases.filter((c: any) => c.status === 'Active').length} Active Case{client.cases.filter((c: any) => c.status === 'Active').length > 1 ? 's' : ''}
                </span>
              )}
            </div>
            <p className="text-text-secondary">{client.company || client.name} · Client since {new Date(client.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
          </div>
          <div className="flex gap-3 shrink-0">
            <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border-base text-sm font-bold text-brand-dark hover:bg-page-bg transition-colors">
              Edit Profile
            </button>
            <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-blue text-white text-sm font-bold shadow-lg shadow-brand-blue/30 hover:shadow-xl hover:-translate-y-0.5 transition-all">
              <Plus size={16} /> New Case
            </button>
          </div>
        </div>
      </div>

      {/* ── Main Content ── */}
      <div className="flex flex-col xl:flex-row gap-6 items-start">

        {/* Left Sidebar */}
        <div className="w-full xl:w-[320px] space-y-5 shrink-0">

          {/* Contact Info */}
          <div className="bg-white rounded-[1.75rem] border border-border-base p-6 shadow-sm">
            <h3 className="text-xs font-bold uppercase tracking-wider text-text-muted mb-5">Contact Details</h3>
            <div className="space-y-4">
              {[
                { icon: Mail,    value: client.email },
                { icon: Phone,   value: client.phone },
                { icon: MapPin,  value: client.address || 'Address not on file' },
              ].map(({ icon: Icon, value }) => (
                <div key={value} className="flex items-start gap-3 text-sm text-text-secondary">
                  <div className="w-9 h-9 rounded-xl bg-brand-light flex items-center justify-center text-brand-blue shrink-0">
                    <Icon size={15} />
                  </div>
                  <span className="mt-2 leading-tight">{value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Case Stats */}
          <div className="bg-white rounded-[1.75rem] border border-border-base p-6 shadow-sm">
            <h3 className="text-xs font-bold uppercase tracking-wider text-text-muted mb-5">Case Overview</h3>
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Total', value: client.cases?.length || 0 },
                { label: 'Active', value: client.cases?.filter((c: any) => c.status === 'Active').length || 0 },
                { label: 'Resolved', value: client.cases?.filter((c: any) => c.status === 'Resolved').length || 0 },
              ].map((s) => (
                <div key={s.label} className="text-center bg-page-bg rounded-xl py-4">
                  <p className="text-2xl font-bold text-brand-dark">{s.value}</p>
                  <p className="text-[10px] font-semibold text-text-muted uppercase tracking-wider mt-1">{s.label}</p>
                </div>
              ))}
            </div>
          </div>


        </div>

        {/* Right Main Area */}
        <div className="flex-1 min-w-0">
          <div className="bg-white rounded-[2rem] border border-border-base shadow-sm overflow-hidden">

            {/* Tabs */}
            <div className="flex border-b border-border-base px-6 pt-2">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`flex items-center gap-2 px-4 py-4 text-sm font-bold border-b-2 transition-colors -mb-px mr-2 ${
                      activeTab === tab.key
                        ? 'border-brand-blue text-brand-blue'
                        : 'border-transparent text-text-muted hover:text-brand-dark'
                    }`}
                  >
                    <Icon size={16} />
                    {tab.label}
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ml-1 ${
                      activeTab === tab.key ? 'bg-brand-light text-brand-blue' : 'bg-page-bg text-text-muted'
                    }`}>
                      {tab.count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Cases Tab */}
            {activeTab === 'cases' && (
              <div className="p-6">
                {client.cases && client.cases.length > 0 ? (
                  <div className="space-y-3">
                    {client.cases.map((rc: any) => {
                      const routeId = rc.caseNumber || rc.id;
                      return (
                        <Link
                          key={rc.id}
                          to={`/cases/${routeId}`}
                        className="flex items-center justify-between p-5 bg-page-bg rounded-2xl hover:bg-brand-light/40 hover:border-brand-blue/20 border border-transparent transition-all group"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-white border border-border-base text-brand-blue font-bold text-[9px] flex items-center justify-center shadow-sm">
                            {rc.caseNumber || rc.id.slice(0, 6)}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-brand-dark group-hover:text-brand-blue transition-colors">{rc.title}</p>
                            <p className="text-xs text-text-muted flex items-center gap-1 mt-0.5">
                              <Clock size={11} /> {new Date(rc.filedDate || rc.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${statusBadge[rc.status]}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${statusDot[rc.status]}`} />
                            {rc.status}
                          </span>
                          <ExternalLink size={14} className="text-text-muted opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      </Link>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-12 text-text-muted">No cases found for this client.</div>
                )}
              </div>
            )}

            {/* Documents Tab */}
            {activeTab === 'documents' && (
              <div className="p-6">
                {clientDocs.length > 0 ? (
                  <div className="space-y-3">
                    {clientDocs.map((doc) => (
                      <div key={doc.id} className="flex items-center justify-between p-5 bg-page-bg rounded-2xl border border-transparent hover:border-brand-blue/20 transition-all group">
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs shadow-sm ${
                            doc.type === 'PDF'  ? 'bg-red-50 text-red-600 border border-red-100' :
                            doc.type === 'DOCX' ? 'bg-blue-50 text-blue-600 border border-blue-100' :
                            doc.type === 'XLSX' ? 'bg-green-50 text-green-600 border border-green-100' :
                                                  'bg-purple-50 text-purple-600 border border-purple-100'
                          }`}>
                            {doc.type}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-brand-dark group-hover:text-brand-blue transition-colors truncate max-w-[280px]">{doc.name}</p>
                            <p className="text-xs text-text-muted mt-0.5">{doc.size} · Uploaded {new Date(doc.uploadedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                          </div>
                        </div>
                        {doc.caseId && (
                          <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-brand-light text-brand-blue">
                            Case Doc
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-text-muted">No documents uploaded for this client yet.</div>
                )}
              </div>
            )}

            {/* Notes Tab */}
            {activeTab === 'notes' && (
              <div className="p-6">
                <div className="flex justify-end mb-5">
                  <button className="flex items-center gap-2 text-sm font-bold text-brand-blue hover:underline">
                    <Plus size={16} /> Add Note
                  </button>
                </div>
                <div className="text-center py-12 text-text-muted">No notes yet. Add a note to keep track of important details.</div>
              </div>
            )}

          </div>
        </div>
      </div>
    </AppLayout>
  );
}
