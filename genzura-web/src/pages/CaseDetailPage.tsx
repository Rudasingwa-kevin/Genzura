import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import {
  ArrowLeft, Clock, Calendar, AlertTriangle, User, Mail, Phone,
  FileText, Download, Paperclip, MessageSquare, Send, CheckCircle2,
  Edit3, Archive, Share2, Flag, MoreHorizontal, Plus, Search,
  Filter, ChevronRight, History, X, Copy, Trash2, FileDown,
  Loader2, Briefcase
} from 'lucide-react';
import AppLayout from '../components/AppLayout';
import {
  STATUS_STYLES, STATUS_DOT, PRIORITY_STYLES,
  type TimelineEvent, type CaseDocument, type CaseNote
} from '../data/cases';
import { caseService } from '../api/services/case.service';
import { documentService } from '../api/services/document.service';
import { userService } from '../api/services/user.service';
import { useAuth } from '../contexts/AuthContext';
import EmptyState from '../components/EmptyState';
import { CaseSummaryPDF } from '../components/CaseSummaryPDF';

// ─── Timeline icon map ────────────────────────────────────────────────────────
const timelineIcon = (type: TimelineEvent['type']) => {
  switch (type) {
    case 'filed':     return { icon: Flag,           bg: 'bg-brand-light',   color: 'text-brand-blue'    };
    case 'status':    return { icon: CheckCircle2,   bg: 'bg-emerald-50',    color: 'text-emerald-600'   };
    case 'meeting':   return { icon: User,           bg: 'bg-violet-50',     color: 'text-violet-600'    };
    case 'document':  return { icon: FileText,       bg: 'bg-amber-50',      color: 'text-amber-600'     };
    case 'note':      return { icon: MessageSquare,  bg: 'bg-slate-100',     color: 'text-slate-600'     };
    case 'milestone': return { icon: AlertTriangle,  bg: 'bg-brand-green-light', color: 'text-brand-green' };
  }
};

// ─── Doc type colors ──────────────────────────────────────────────────────────
const docTypeStyle: Record<string, string> = {
  PDF:  'bg-red-50 text-red-600',
  DOCX: 'bg-blue-50 text-blue-600',
  XLSX: 'bg-emerald-50 text-emerald-600',
  IMG:  'bg-violet-50 text-violet-600',
};

// ─── Sub-components ───────────────────────────────────────────────────────────

const SectionCard = ({ title, children, action, className = "" }: { title: string; children: React.ReactNode; action?: React.ReactNode; className?: string }) => (
  <div className={`glass-card rounded-[2.5rem] shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-700 premium-border ${className}`}>
    <div className="px-10 py-8 border-b border-border-base/50 flex items-center justify-between bg-white/40">
      <h3 className="font-bold text-brand-dark tracking-tight text-lg">{title}</h3>
      {action}
    </div>
    <div className="p-10">{children}</div>
  </div>
);

const TimelineItem = ({ event, isLast, index }: { event: TimelineEvent; isLast: boolean; index: number }) => {
  const { icon: Icon, bg, color } = timelineIcon(event.type);
  return (
    <div className="flex gap-8 group animate-in-up" style={{ animationDelay: `${index * 100}ms` }}>
      <div className="flex flex-col items-center">
        <div className={`w-12 h-12 rounded-2xl ${bg} ${color} flex items-center justify-center shrink-0 z-10 shadow-lg border-4 border-white transition-all duration-500 group-hover:scale-110 group-hover:rotate-6`}>
          <Icon size={20} />
        </div>
        {!isLast && <div className="w-0.5 flex-1 bg-gradient-to-b from-border-base/50 via-border-base/20 to-transparent my-3" />}
      </div>
      <div className="pb-10 pt-1.5 flex-1">
        <div className="flex items-center justify-between gap-4 mb-2">
          <p className="text-[15px] font-bold text-brand-dark leading-snug group-hover:text-brand-blue transition-colors">{event.description}</p>
          <span className="text-[10px] font-bold text-text-muted uppercase tracking-[0.2em] whitespace-nowrap bg-page-bg px-2 py-1 rounded-md">
            {new Date(event.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-page-bg/50 border border-border-base/50 hover:border-brand-blue/30 transition-colors cursor-default">
            <div className="w-5 h-5 rounded-lg bg-brand-blue text-white flex items-center justify-center text-[9px] font-black shadow-sm">
              {typeof event.author === 'object' ? (event.author?.initials || event.author?.name?.split(' ').map((n: string) => n[0]).join('')) : event.author?.split(' ').map(n => n[0]).join('')}
            </div>
            <span className="text-xs font-bold text-brand-dark/70">{typeof event.author === 'object' ? event.author?.name : event.author}</span>
          </div>
          <span className="text-xs text-text-muted font-medium opacity-60 tracking-tight">
            {new Date(event.timestamp).toLocaleDateString()}
          </span>
        </div>
      </div>
    </div>
  );
};

const DocumentRow = ({ doc, index }: { doc: CaseDocument & { fileUrl?: string }; index: number }) => {
  const handleDownload = () => {
    if (doc.fileUrl) {
      const baseUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';
      window.open(`${baseUrl}${doc.fileUrl}`, '_blank');
    } else {
      toast.error('Download link not available');
    }
  };

  return (
    <div className="flex items-center gap-5 py-5 border-b border-border-base last:border-0 group animate-in-up" style={{ animationDelay: `${index * 50}ms` }}>
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 transition-all duration-500 group-hover:scale-110 group-hover:rotate-3 shadow-sm border border-white ${docTypeStyle[doc.type]}`}>
        <FileText size={24} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-3">
          <p className="text-[15px] font-bold text-brand-dark truncate group-hover:text-brand-blue transition-colors cursor-pointer">{doc.name}</p>
          <span className="px-2 py-0.5 rounded-lg bg-page-bg text-[9px] font-black text-text-muted border border-border-base/50 uppercase tracking-wider">
            {doc.type}
          </span>
        </div>
        <p className="text-xs text-text-muted mt-1.5 font-medium opacity-70">
          <span className="font-bold">{doc.size}</span> · Uploaded <span className="font-bold">{new Date(doc.uploadedAt).toLocaleDateString()}</span>
        </p>
      </div>
      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0 transition-all duration-300">
        <button 
          onClick={handleDownload}
          className="p-3 rounded-xl bg-page-bg/50 hover:bg-brand-blue/5 text-text-muted hover:text-brand-blue transition-all premium-border" title="Download"
        >
          <Download size={18} />
        </button>
        <button className="p-3 rounded-xl bg-page-bg/50 hover:bg-brand-blue/5 text-text-muted hover:text-brand-blue transition-all premium-border" title="Share">
          <Share2 size={18} />
        </button>
      </div>
    </div>
  );
};

const NoteCard = ({ note, index }: { note: CaseNote; index: number }) => (
  <div className="flex gap-4 group animate-in-up" style={{ animationDelay: `${index * 100}ms` }}>
    <div className={`w-10 h-10 rounded-2xl bg-brand-blue text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-lg shadow-brand-blue/10`}>
      {typeof note.author === 'object' ? (note.author?.initials || note.author?.name?.split(' ').map((n: string) => n[0]).join('')) : (note.initials || note.author?.split(' ').map(n => n[0]).join(''))}
    </div>
    <div className="flex-1 bg-white border border-border-base rounded-[1.5rem] p-5 hover:border-brand-blue/30 hover:shadow-md transition-all">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-bold text-brand-dark">{typeof note.author === 'object' ? note.author?.name : note.author}</span>
        <span className="text-xs font-bold text-text-muted tracking-tight">{new Date(note.timestamp).toLocaleString()}</span>
      </div>
      <p className="text-sm text-text-secondary leading-relaxed font-medium">{note.text}</p>
      <div className="flex items-center gap-3 mt-4 pt-4 border-t border-border-base/50">
        <button className="text-[10px] font-bold text-text-muted hover:text-brand-blue flex items-center gap-1 uppercase tracking-wider transition-colors">
          <MessageSquare size={12} /> Reply
        </button>
        <button className="text-[10px] font-bold text-text-muted hover:text-brand-blue flex items-center gap-1 uppercase tracking-wider transition-colors">
          <CheckCircle2 size={12} /> Resolve
        </button>
      </div>
    </div>
  </div>
);



function EditCaseModal({ caseData, onClose, onSave }: { caseData: any; onClose: () => void; onSave: (updated: any) => void }) {
  const [caseNumber, setCaseNumber] = useState(caseData.caseNumber);
  const [title, setTitle] = useState(caseData.title);
  const [description, setDescription] = useState(caseData.description);
  const [status, setStatus] = useState(caseData.status);
  const [priority, setPriority] = useState(caseData.priority);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-brand-dark/20 backdrop-blur-sm animate-in fade-in duration-300" onClick={onClose} />
      <div className="relative bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl border border-border-base p-8 animate-in zoom-in-95 fade-in duration-300 overflow-y-auto max-h-[90vh]">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-xl font-bold text-brand-dark">Edit Case: {caseData.id}</h2>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-page-bg text-text-muted transition-colors">
            <X size={20} />
          </button>
        </div>
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-text-muted uppercase tracking-wider mb-2">Government Case #</label>
              <input
                type="text" value={caseNumber} onChange={e => setCaseNumber(e.target.value)}
                className="w-full h-12 px-4 rounded-xl bg-page-bg border border-transparent focus:bg-white focus:border-brand-blue outline-none transition-all font-bold text-sm"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-text-muted uppercase tracking-wider mb-2">Case Title</label>
              <input
                type="text" value={title} onChange={e => setTitle(e.target.value)}
                className="w-full h-12 px-4 rounded-xl bg-page-bg border border-transparent focus:bg-white focus:border-brand-blue outline-none transition-all font-bold text-sm"
              />
            </div>
          </div>
          <div>
            <label className="block text-[10px] font-bold text-text-muted uppercase tracking-wider mb-2">Description</label>
            <textarea
              rows={4} value={description} onChange={e => setDescription(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-page-bg border border-transparent focus:bg-white focus:border-brand-blue outline-none transition-all font-medium text-sm"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-text-muted uppercase tracking-wider mb-2">Status</label>
              <select
                value={status} onChange={e => setStatus(e.target.value)}
                className="w-full h-12 px-4 rounded-xl bg-page-bg border border-transparent focus:bg-white focus:border-brand-blue outline-none transition-all font-bold text-sm"
              >
                <option value="Active">Active</option>
                <option value="Pending">Pending</option>
                <option value="Resolved">Resolved</option>
                <option value="Archived">Archived</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-text-muted uppercase tracking-wider mb-2">Priority</label>
              <select
                value={priority} onChange={e => setPriority(e.target.value)}
                className="w-full h-12 px-4 rounded-xl bg-page-bg border border-transparent focus:bg-white focus:border-brand-blue outline-none transition-all font-bold text-sm"
              >
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>
          </div>
          <div className="flex gap-3 pt-4">
            <button onClick={onClose} className="flex-1 h-14 rounded-2xl border border-border-base font-bold text-brand-dark hover:bg-page-bg transition-all">
              Cancel
            </button>
            <button
              onClick={() => { 
                const updatedData = {
                  ...caseData,
                  caseNumber,
                  title,
                  description,
                  status,
                  priority,
                  deadline: caseData.deadline ? new Date(caseData.deadline).toISOString() : null
                };
                onSave(updatedData); 
                onClose(); 
              }}
              className="flex-1 h-14 bg-brand-blue text-white rounded-2xl font-bold shadow-lg shadow-brand-blue/20 hover:shadow-xl hover:-translate-y-0.5 transition-all"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function CaseDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [newNote, setNewNote] = useState('');
  const [activeTab, setActiveTab] = useState<'timeline' | 'documents' | 'notes'>('timeline');
  const [currentCase, setCurrentCase] = useState<any>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const pdfRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchCase = async () => {
      if (!id) return;
      try {
        const data = await caseService.getById(id);
        setCurrentCase(data);
      } catch (error) {
        console.error('Failed to fetch case:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCase();
  }, [id]);

  const caseData = currentCase;

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center py-32">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-blue"></div>
        </div>
      </AppLayout>
    );
  }

  if (!caseData) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center py-32 text-center animate-in fade-in zoom-in-95 duration-500">
          <div className="w-20 h-20 rounded-[2rem] bg-red-50 flex items-center justify-center text-red-500 mb-8 shadow-xl shadow-red-100">
            <AlertTriangle size={40} />
          </div>
          <h2 className="text-3xl font-bold text-brand-dark mb-4 tracking-tight">Case File Not Found</h2>
          <p className="text-text-secondary max-w-md mx-auto mb-10 text-lg">
            We couldn't locate the file for <span className="font-bold text-brand-dark">{id}</span>. It may have been archived or deleted.
          </p>
          <Link to="/cases" className="bg-brand-blue text-white px-8 py-4 rounded-2xl font-bold hover:shadow-xl hover:-translate-y-1 transition-all no-underline flex items-center gap-2">
            <ArrowLeft size={20} /> Back to Case Manager
          </Link>
        </div>
      </AppLayout>
    );
  }

  const daysOpen = Math.floor(
    (new Date().getTime() - new Date(caseData.filedDate).getTime()) / (1000 * 60 * 60 * 24)
  );

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Case link copied to clipboard!', {
      style: { borderRadius: '1rem', background: '#1e293b', color: '#fff', fontWeight: 'bold' }
    });
  };

  const handleArchive = async () => {
    toast.promise(
      caseService.updateStatus(caseData.id, 'Archived'),
      {
        loading: 'Archiving case...',
        success: (data) => {
          setCurrentCase(data);
          setTimeout(() => navigate('/cases'), 500);
          return 'Case archived successfully!';
        },
        error: 'Failed to archive case.',
      },
      { style: { borderRadius: '1rem' } }
    );
  };


  const handleExport = async () => {
    if (!pdfRef.current) return;
    setIsExporting(true);
    const toastId = toast.loading('Generating PDF summary...', { style: { borderRadius: '1rem', background: '#1e293b', color: '#fff', fontWeight: 'bold' } });
    try {
      const html2canvas = (await import('html2canvas')).default;
      const jsPDF = (await import('jspdf')).default;

      const canvas = await html2canvas(pdfRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        windowWidth: 1200,
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      // Multi-page support
      const pageHeight = pdf.internal.pageSize.getHeight();
      let heightLeft = pdfHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
      heightLeft -= pageHeight;

      while (heightLeft > 0) {
        position = heightLeft - pdfHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`Case_Summary_${caseData.id}.pdf`);
      toast.success('PDF downloaded successfully!', { id: toastId, icon: '📄', style: { borderRadius: '1rem', background: '#1e293b', color: '#fff', fontWeight: 'bold' } });
    } catch (error) {
      console.error('PDF generation failed:', error);
      toast.error('Failed to generate PDF. Please try again.', { id: toastId });
    } finally {
      setIsExporting(false);
    }
  };

  const handleDelete = () => {
    toast((t) => (
      <div className="flex flex-col gap-3">
        <p className="font-bold text-brand-dark">Are you sure you want to delete this case?</p>
        <p className="text-xs text-text-muted">This action is permanent and cannot be undone.</p>
        <div className="flex gap-2">
          <button 
            onClick={async () => {
              toast.dismiss(t.id);
              const loadId = toast.loading('Deleting case...');
              try {
                await caseService.delete(caseData.id);
                toast.success('Case deleted successfully', { id: loadId });
                navigate('/cases');
              } catch (error) {
                toast.error('Failed to delete case', { id: loadId });
              }
            }}
            className="bg-red-500 text-white px-3 py-1.5 rounded-lg font-bold text-xs"
          >
            Yes, Delete
          </button>
          <button onClick={() => toast.dismiss(t.id)} className="bg-page-bg text-brand-dark px-3 py-1.5 rounded-lg font-bold text-xs">Cancel</button>
        </div>
      </div>
    ), { duration: 5000, style: { borderRadius: '1.25rem', padding: '1rem' } });
  };

  const actionBar = (
    <div className="flex items-center gap-3">
      <div className="hidden md:flex items-center gap-1.5 p-1 bg-page-bg rounded-xl border border-border-base mr-2 relative">
        <button 
          onClick={handleShare}
          className="p-2 rounded-lg text-text-muted hover:text-brand-blue hover:bg-white transition-all"
          title="Share Link"
        >
          <Share2 size={16} />
        </button>
        <button 
          onClick={handleArchive}
          className="p-2 rounded-lg text-text-muted hover:text-brand-blue hover:bg-white transition-all"
          title="Archive Case"
        >
          <Archive size={16} />
        </button>
        <div className="relative">
          <button 
            onClick={() => setShowMoreMenu(!showMoreMenu)}
            className={`p-2 rounded-lg transition-all ${showMoreMenu ? 'bg-white text-brand-blue shadow-sm' : 'text-text-muted hover:text-brand-blue hover:bg-white'}`}
          >
            <MoreHorizontal size={16} />
          </button>
          
          {showMoreMenu && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowMoreMenu(false)} />
              <div className="absolute top-full right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-border-base p-2 z-50 animate-in fade-in zoom-in-95 duration-200">
                <button onClick={() => { setShowMoreMenu(false); handleExport(); }} disabled={isExporting} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-page-bg text-sm font-bold text-text-secondary hover:text-brand-blue transition-all disabled:opacity-60">
                  {isExporting ? <Loader2 size={16} className="animate-spin" /> : <FileDown size={16} />} Export PDF Summary
                </button>
                <button onClick={() => { setShowMoreMenu(false); toast.success('Case duplicated'); }} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-page-bg text-sm font-bold text-text-secondary hover:text-brand-blue transition-all">
                  <Copy size={16} /> Duplicate Case
                </button>
                <div className="my-1 border-t border-border-base/50" />
                <button onClick={() => { setShowMoreMenu(false); handleDelete(); }} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-red-50 text-sm font-bold text-red-500 transition-all">
                  <Trash2 size={16} /> Delete Case
                </button>
              </div>
            </>
          )}
        </div>
      </div>
      <button
        onClick={handleExport}
        disabled={isExporting}
        className="flex items-center gap-2 px-6 py-3 rounded-2xl border border-border-base bg-white text-brand-dark font-bold hover:shadow-md hover:-translate-y-0.5 transition-all active:scale-95 disabled:opacity-60"
      >
        {isExporting ? <Loader2 size={18} className="animate-spin" /> : <FileDown size={18} />}
        {isExporting ? 'Generating...' : 'Export PDF'}
      </button>
      <button
        onClick={() => setShowInviteModal(true)}
        className="flex items-center gap-2 px-6 py-3 rounded-2xl border-2 border-brand-blue text-brand-blue font-bold hover:bg-brand-blue hover:text-white hover:shadow-lg hover:shadow-brand-blue/20 hover:-translate-y-0.5 transition-all active:scale-95"
      >
        <Plus size={18} /> Invite Attorney
      </button>
      <button 
        onClick={() => setShowEditModal(true)}
        className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-brand-blue text-white font-bold shadow-lg shadow-brand-blue/30 hover:shadow-xl hover:-translate-y-0.5 transition-all active:scale-95"
      >
        <Edit3 size={18} /> Edit Case
      </button>
    </div>
  );

  return (
    <AppLayout action={actionBar} breadcrumbLabel={caseData.caseNumber}>
      {showEditModal && (
        <EditCaseModal
          caseData={caseData}
          onClose={() => setShowEditModal(false)}
          onSave={async (updated) => {
            const loadId = toast.loading('Updating case...');
            try {
              const data = await caseService.update(caseData.id, updated);
              setCurrentCase(data);
              toast.success('Case updated successfully!', { id: loadId });
            } catch (error) {
              toast.error('Failed to update case', { id: loadId });
            }
          }}
        />
      )}

      {/* Hidden PDF render target */}
      <CaseSummaryPDF ref={pdfRef} caseData={caseData} />

      <div className="space-y-10 pb-12">
        
        {/* Header Section */}
        <div className="animate-in fade-in slide-in-from-top-4 duration-500">
          <button
            onClick={() => navigate('/cases')}
            className="flex items-center gap-2 text-sm font-bold text-text-muted hover:text-brand-blue transition-all mb-8 group"
          >
            <ArrowLeft size={18} className="group-hover:-translate-x-1.5 transition-transform" />
            <span className="uppercase tracking-widest text-[11px]">Back to Litigation View</span>
          </button>

          <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-10">
            <div className="space-y-8 flex-1">
              <div className="flex items-center gap-4 flex-wrap">
                <span className="bg-brand-blue/5 text-brand-blue font-bold text-[10px] px-4 py-2 rounded-xl tracking-[0.15em] border border-brand-blue/10 shadow-sm backdrop-blur-sm">
                  {caseData.caseNumber}
                </span>
                <div className={`inline-flex items-center gap-2.5 px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-[0.15em] border ${STATUS_STYLES[caseData.status]} border-current/10 shadow-sm backdrop-blur-sm`}>
                  <div className={`w-2 h-2 rounded-full ${STATUS_DOT[caseData.status]} animate-pulse`} />
                  {caseData.status}
                </div>
                <span className={`text-[10px] font-bold uppercase tracking-[0.15em] px-4 py-2 rounded-full border border-current/10 shadow-sm backdrop-blur-sm ${PRIORITY_STYLES[caseData.priority]}`}>
                  {caseData.priority} Priority
                </span>
                <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-text-muted bg-white/50 border border-border-base/50 px-4 py-2 rounded-full shadow-sm backdrop-blur-sm">
                  {caseData.type}
                </span>
              </div>
              
              <div className="space-y-4">
                <h1 className="text-4xl md:text-5xl font-bold text-brand-dark tracking-tight leading-[1.1] max-w-4xl">
                  {caseData.title}
                </h1>
                <div className="flex flex-wrap items-center gap-x-8 gap-y-4 pt-2">
                  <div className="flex items-center gap-2.5 text-text-secondary group cursor-help">
                    <div className="w-8 h-8 rounded-lg bg-brand-blue/5 flex items-center justify-center text-brand-blue transition-colors group-hover:bg-brand-blue group-hover:text-white">
                      <History size={16} />
                    </div>
                    <span className="text-sm font-semibold">Opened {new Date(caseData.filedDate).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-text-secondary group cursor-help">
                    <div className="w-8 h-8 rounded-lg bg-brand-blue/5 flex items-center justify-center text-brand-blue transition-colors group-hover:bg-brand-blue group-hover:text-white">
                      <Clock size={16} />
                    </div>
                    <span className="text-sm font-semibold">Updated {new Date(caseData.updatedAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-text-secondary group cursor-help">
                    <div className="w-8 h-8 rounded-lg bg-brand-blue/5 flex items-center justify-center text-brand-blue transition-colors group-hover:bg-brand-blue group-hover:text-white">
                      <User size={16} />
                    </div>
                    <span className="text-sm font-semibold">Client: <span className="text-brand-dark">{caseData.client?.name || 'Unassigned'}</span></span>
                  </div>
                  <div className="flex items-center gap-2.5 text-text-secondary group cursor-help">
                    <div className="w-8 h-8 rounded-lg bg-brand-blue/5 flex items-center justify-center text-brand-blue transition-colors group-hover:bg-brand-blue group-hover:text-white">
                      <Briefcase size={16} />
                    </div>
                    <span className="text-sm font-semibold">Lead: <span className="text-brand-dark">{typeof caseData.attorney === 'object' ? caseData.attorney?.name : caseData.attorney}</span></span>
                  </div>
                </div>
              </div>

              {/* Team Avatar Stack */}
              <div 
                onClick={() => document.getElementById('case-team-widget')?.scrollIntoView({ behavior: 'smooth' })}
                className="flex items-center gap-3 pt-2 cursor-pointer group w-fit"
              >
                <div className="flex -space-x-3 overflow-hidden">
                  {(caseData.team || []).map((member: any, i: number) => (
                    <div 
                      key={member.user?.name || i}
                      className="inline-block h-8 w-8 rounded-full ring-2 ring-white bg-brand-dark text-white text-[10px] font-bold flex items-center justify-center transition-transform group-hover:translate-y-[-2px]"
                      style={{ zIndex: 10 - i }}
                      title={`${member.user?.name} - ${member.role}`}
                    >
                      {member.user?.initials || member.user?.name?.split(' ').map((n: string) => n[0]).join('')}
                    </div>
                  ))}
                </div>
                <span className="text-xs font-bold text-text-muted group-hover:text-brand-blue transition-colors">
                  {caseData.team.length} Team Members
                </span>
              </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 gap-5 shrink-0">
              {[
                { label: 'Days Active',   value: daysOpen === 0 ? 'Today' : daysOpen, icon: Clock, color: 'text-brand-blue', bg: 'bg-brand-blue/5' },
                { label: 'Next Deadline', value: caseData.deadline ? new Date(caseData.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'None', icon: Calendar, color: 'text-red-500', bg: 'bg-red-500/5' },
              ].map((s) => (
                <div key={s.label} className="glass-card rounded-[2.5rem] p-6 min-w-[160px] hover:shadow-xl hover:-translate-y-1 transition-all duration-500 group premium-border">
                  <div className={`w-14 h-14 rounded-2xl ${s.bg} ${s.color} flex items-center justify-center mb-6 shadow-inner transition-transform group-hover:scale-110`}>
                    <s.icon size={28} />
                  </div>
                  <p className="text-3xl font-bold text-brand-dark tracking-tight mb-1">{s.value}</p>
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-text-muted">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Dynamic Navigation Tabs */}
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          
          {/* ── Left Column: Activity & Files ── */}
          <div className="flex-1 space-y-8 w-full">
            
            {/* Overview Widget */}
            <div className="bg-white rounded-[2.5rem] border border-border-base p-10 shadow-sm relative overflow-hidden animate-in-fade">
              <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none">
                <FileText size={120} />
              </div>
              <h3 className="text-lg font-bold text-brand-dark mb-6 flex items-center gap-3">
                <div className="w-1.5 h-6 bg-brand-blue rounded-full" />
                Case Summary
              </h3>
              <p className="text-text-secondary text-lg leading-relaxed font-medium">
                {caseData.description}
              </p>
            </div>

            {/* Interactive Tabbed Interface */}
            <div className="bg-white rounded-[2.5rem] border border-border-base shadow-sm overflow-hidden min-h-[600px] flex flex-col">
              <div className="px-10 py-8 border-b border-border-base flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white sticky top-0 z-20">
                <div className="flex gap-2 p-1.5 bg-page-bg rounded-2xl border border-border-base w-fit">
                  {(['timeline', 'documents', 'notes'] as const).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all duration-300 flex items-center gap-2 ${
                        activeTab === tab
                          ? 'bg-white text-brand-blue shadow-lg shadow-brand-blue/5 border border-border-base translate-y-[-1px]'
                          : 'text-text-muted hover:text-brand-dark'
                      }`}
                    >
                      {tab === 'timeline' && <History size={14} />}
                      {tab === 'documents' && <Paperclip size={14} />}
                      {tab === 'notes' && <MessageSquare size={14} />}
                      {tab}
                      <span className={`ml-1 text-[10px] font-bold px-2 py-0.5 rounded-lg border ${
                        activeTab === tab ? 'bg-brand-blue text-white border-brand-blue' : 'bg-white text-text-muted border-border-base'
                      }`}>
                        {tab === 'timeline' ? caseData.timeline.length : tab === 'documents' ? caseData.documents.length : caseData.notes.length}
                      </span>
                    </button>
                  ))}
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" />
                    <input 
                      type="text" 
                      placeholder="Search records..." 
                      className="pl-11 pr-4 py-2.5 rounded-xl bg-page-bg border border-transparent focus:border-brand-blue focus:bg-white transition-all text-sm font-bold w-full md:w-[240px]"
                    />
                  </div>
                  <button className="p-2.5 rounded-xl bg-page-bg border border-transparent hover:border-border-base text-text-muted hover:text-brand-blue transition-all">
                    <Filter size={18} />
                  </button>
                </div>
              </div>

              <div className="p-10 flex-1">
                {/* Timeline Content */}
                {activeTab === 'timeline' && (
                  <div className="relative">
                    <div className="absolute left-5 top-0 bottom-0 w-px bg-border-base opacity-50" />
                    <div className="space-y-4">
                      {caseData.timeline.map((event, i) => (
                        <TimelineItem
                          key={event.id}
                          event={event}
                          isLast={i === caseData.timeline.length - 1}
                          index={i}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Documents Content */}
                {activeTab === 'documents' && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between mb-6">
                      <h4 className="text-sm font-bold text-brand-dark uppercase tracking-widest">Case Documents ({caseData.documents.length})</h4>
                      <label className="text-xs font-bold text-brand-blue flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-brand-light transition-all cursor-pointer">
                        <Plus size={14} /> Upload New
                        <input
                          type="file"
                          className="hidden"
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            
                            const loadId = toast.loading('Uploading document...');
                            try {
                              const newDoc = await documentService.upload(caseData.id, file);
                              setCurrentCase({
                                ...caseData,
                                documents: [newDoc, ...caseData.documents]
                              });
                              toast.success('Document uploaded successfully', { id: loadId });
                            } catch (error) {
                              toast.error('Upload failed', { id: loadId });
                            }
                          }}
                        />
                      </label>
                    </div>
                    <div className="grid gap-2">
                      {caseData.documents.length === 0 ? (
                        <EmptyState 
                          illustration="generic"
                          title="No Documents"
                          description="This case doesn't have any documents yet. Upload files to get started."
                          action={
                            <button className="text-xs font-bold text-brand-blue flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-brand-light hover:shadow-md transition-all">
                              <Plus size={14} /> Upload First Document
                            </button>
                          }
                        />
                      ) : (
                        caseData.documents.map((doc, i) => <DocumentRow key={doc.id} doc={doc} index={i} />)
                      )}
                    </div>
                  </div>
                )}

                {/* Notes Content */}
                {activeTab === 'notes' && (
                  <div className="space-y-8 max-w-2xl">
                    <div className="space-y-6">
                      {caseData.notes.length === 0 ? (
                        <EmptyState 
                          illustration="generic"
                          title="No Internal Notes"
                          description="Keep track of case observations and legal strategy by posting your first note below."
                        />
                      ) : (
                        caseData.notes.map((note, i) => (
                          <NoteCard key={note.id} note={note} index={i} />
                        ))
                      )}
                    </div>

                    {/* Enhanced Post Note */}
                    <div className="bg-page-bg/50 rounded-[2rem] p-6 border border-border-base mt-8">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-8 h-8 rounded-xl bg-brand-blue text-white font-bold text-xs flex items-center justify-center">
                          {user?.initials || '??'}
                        </div>
                        <span className="text-xs font-bold text-brand-dark uppercase tracking-widest">New Case Note</span>
                      </div>
                      <div className="relative">
                        <textarea
                          rows={4}
                          value={newNote}
                          onChange={(e) => setNewNote(e.target.value)}
                          placeholder="Type case observations, next steps, or internal legal notes..."
                          className="w-full px-6 py-5 rounded-2xl border border-border-base focus:border-brand-blue outline-none transition-all resize-none text-sm font-medium bg-white shadow-sm"
                        />
                        <button
                          disabled={!newNote.trim()}
                          onClick={async () => {
                            try {
                              const note = await caseService.addNote(caseData.id, newNote);
                              setCurrentCase({
                                ...caseData,
                                notes: [note, ...caseData.notes]
                              });
                              setNewNote('');
                              toast.success('Note posted successfully');
                            } catch (error) {
                              toast.error('Failed to post note');
                            }
                          }}
                          className="absolute bottom-4 right-4 bg-brand-blue text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:shadow-lg transition-all disabled:opacity-40 disabled:scale-100 active:scale-95 shadow-md shadow-brand-blue/20"
                        >
                          Post Note <Send size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ── Right Column: Insights & Team ── */}
          <div className="w-full lg:w-[420px] space-y-8 animate-in-right">
            
            {/* Team Widget */}
            <div id="case-team-widget">
              <SectionCard title="Case Team">
                <div className="space-y-6">
                  {(caseData.team || []).map((member: any, i: number) => (
                    <div key={member.user?.id || i} className="flex items-center gap-5 group animate-in-up" style={{ animationDelay: `${i * 100}ms` }}>
                      <div className="relative">
                        <div className="w-14 h-14 rounded-[1.25rem] bg-brand-dark text-white font-bold text-base flex items-center justify-center shrink-0 shadow-xl shadow-brand-dark/20 group-hover:scale-110 transition-all duration-500 premium-border">
                          {member.user?.initials || member.user?.name?.split(' ').map((n: string) => n[0]).join('')}
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-lg bg-emerald-500 border-2 border-white shadow-sm" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[15px] font-bold text-brand-dark truncate group-hover:text-brand-blue transition-colors">{member.user?.name}</p>
                        <p className="text-[10px] font-bold text-text-muted uppercase tracking-[0.15em] mt-1">{member.role}</p>
                      </div>
                      <button className="p-3 rounded-xl bg-page-bg/50 hover:bg-brand-blue/5 text-text-muted hover:text-brand-blue transition-all premium-border opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0">
                        <Mail size={18} />
                      </button>
                    </div>
                  ))}
                  <button 
                    onClick={() => setShowInviteModal(true)}
                    className="w-full py-5 mt-4 rounded-[1.5rem] border-2 border-dashed border-border-base/60 text-xs font-bold text-text-muted hover:border-brand-blue hover:text-brand-blue hover:bg-brand-blue/5 transition-all flex items-center justify-center gap-3 shimmer"
                  >
                    <Plus size={18} /> Add Collaborator
                  </button>
                </div>
              </SectionCard>
            </div>
          </div>

            {/* Client Context Card */}
            <SectionCard title="Client Overview">
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-[1.25rem] bg-brand-blue/10 text-brand-blue font-bold text-lg flex items-center justify-center shadow-inner border border-brand-blue/5">
                    {caseData.client.split(' ').map(w => w[0]).join('').slice(0, 2)}
                  </div>
                  <div>
                    <p className="font-bold text-brand-dark text-lg leading-tight">{caseData.client}</p>
                    <p className="text-xs font-bold text-text-muted uppercase tracking-widest mt-1">{caseData.clientCompany}</p>
                  </div>
                </div>
                
                <div className="grid gap-3 pt-6 border-t border-border-base">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-page-bg/50 border border-border-base group hover:border-brand-blue/30 transition-all cursor-pointer">
                    <div className="flex items-center gap-3">
                      <Mail size={16} className="text-brand-blue" />
                      <span className="text-sm font-bold text-brand-dark truncate">{caseData.clientEmail}</span>
                    </div>
                    <ChevronRight size={14} className="text-text-muted group-hover:text-brand-blue" />
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-xl bg-page-bg/50 border border-border-base group hover:border-brand-blue/30 transition-all cursor-pointer">
                    <div className="flex items-center gap-3">
                      <Phone size={16} className="text-brand-blue" />
                      <span className="text-sm font-bold text-brand-dark">{caseData.clientPhone}</span>
                    </div>
                    <ChevronRight size={14} className="text-text-muted group-hover:text-brand-blue" />
                  </div>
                </div>
                
                <button 
                  onClick={() => navigate(`/clients/${caseData.client.replace(/\s+/g, '-').toLowerCase()}`)}
                  className="w-full py-4 bg-brand-dark text-white rounded-2xl font-bold text-xs uppercase tracking-[0.2em] shadow-lg shadow-brand-dark/20 hover:shadow-xl hover:-translate-y-0.5 transition-all"
                >
                  Full Client Profile
                </button>
              </div>
            </SectionCard>

            {/* Quick Actions Panel */}
            <div className="glass-dark rounded-[2.5rem] p-10 text-white shadow-2xl relative overflow-hidden group premium-shadow">
              <div className="absolute -right-6 -bottom-6 opacity-20 group-hover:scale-125 transition-transform duration-1000 rotate-12">
                <Flag size={180} />
              </div>
              <div className="relative z-10">
                <h3 className="font-bold text-lg uppercase tracking-[0.25em] mb-8 text-white/90">Execution</h3>
                <div className="space-y-4">
                  {[
                    { label: 'File Motion',    icon: FileText    },
                    { label: 'Schedule Depo',  icon: Calendar    },
                    { label: 'Export Brief',   icon: Download, onClick: handleExport },
                  ].map((action) => (
                    <button
                      key={action.label}
                      onClick={action.onClick}
                      className="w-full flex items-center justify-between px-6 py-5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all duration-300 text-sm font-bold group/btn active:scale-95"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center group-hover/btn:bg-brand-blue group-hover/btn:text-white transition-colors">
                          <action.icon size={18} />
                        </div>
                        <span className="tracking-wide">{action.label}</span>
                      </div>
                      <Plus size={18} className="opacity-40 group-hover/btn:opacity-100 transition-opacity" />
                    </button>
                  ))}
                </div>
              </div>
            </div>

        </div>
      </div>
      {/* Invite Modal */}
      <InviteCollaboratorModal 
        isOpen={showInviteModal} 
        onClose={() => setShowInviteModal(false)}
        existingTeam={caseData.team}
        onInvite={async (userId) => {
          try {
            const updatedCase = await caseService.addTeamMember(caseData.id, userId);
            setCurrentCase(updatedCase);
            setShowInviteModal(false);
            toast.success('Team member added successfully');
          } catch (error) {
            toast.error('Failed to add team member');
          }
        }}
      />
    </AppLayout>
  );
}

// ─── Sub-components ──────────────────────────────────────────────────────────

const InviteCollaboratorModal = ({ 
  isOpen, 
  onClose, 
  onInvite, 
  existingTeam 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  onInvite: (userId: string) => void;
  existingTeam: any[];
}) => {
  const [users, setUsers] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const fetchUsers = async () => {
        setIsLoading(true);
        try {
          const allUsers = await userService.getAll();
          // Filter out users already in the team
          const filtered = allUsers.filter((u: any) => !existingTeam.find(m => m.id === u.id));
          setUsers(filtered);
        } catch (error) {
          console.error('Failed to fetch users:', error);
        } finally {
          setIsLoading(false);
        }
      };
      fetchUsers();
    }
  }, [isOpen, existingTeam]);

  if (!isOpen) return null;

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(search.toLowerCase()) || 
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-brand-dark/40 backdrop-blur-md animate-in-fade" onClick={onClose} />
      <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl relative z-10 overflow-hidden animate-in-up premium-border">
        <div className="p-8 border-b border-border-base">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xl font-bold text-brand-dark">Invite Collaborator</h3>
            <button onClick={onClose} className="p-2 rounded-xl hover:bg-page-bg text-text-muted transition-colors">
              <X size={20} />
            </button>
          </div>
          <p className="text-xs font-bold text-text-muted uppercase tracking-widest">Add an attorney or paralegal to this case</p>
        </div>

        <div className="p-8 space-y-6">
          <div className="relative group">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-brand-blue transition-colors" />
            <input 
              autoFocus
              type="text" 
              placeholder="Search by name or email..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-12 pl-12 pr-5 rounded-2xl border border-border-base focus:border-brand-blue focus:ring-4 focus:ring-brand-blue/5 outline-none transition-all font-medium text-sm"
            />
          </div>

          <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
            {isLoading ? (
              <div className="py-10 text-center"><Loader2 className="animate-spin mx-auto text-brand-blue" /></div>
            ) : filteredUsers.length === 0 ? (
              <div className="py-10 text-center text-text-muted font-bold text-xs uppercase tracking-widest">No users found</div>
            ) : (
              filteredUsers.map(user => (
                <div 
                  key={user.id} 
                  onClick={() => onInvite(user.id)}
                  className="flex items-center gap-4 p-4 rounded-2xl hover:bg-brand-light/50 border border-transparent hover:border-brand-blue/10 transition-all cursor-pointer group"
                >
                  <div className="w-10 h-10 rounded-xl bg-brand-dark text-white font-bold text-xs flex items-center justify-center group-hover:scale-110 transition-transform">
                    {user.initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-brand-dark text-sm truncate group-hover:text-brand-blue transition-colors">{user.name}</p>
                    <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest">{user.role}</p>
                  </div>
                  <button className="text-[10px] font-black text-brand-blue uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">Invite</button>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="p-8 bg-page-bg/30 flex justify-end">
          <button onClick={onClose} className="px-6 py-2.5 rounded-xl font-bold text-xs text-text-muted uppercase tracking-widest hover:text-brand-dark transition-colors">Cancel</button>
        </div>
      </div>
    </div>
  );
};
