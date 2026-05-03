import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft, Clock, Calendar, AlertTriangle, User, Mail, Phone,
  FileText, Download, Paperclip, MessageSquare, Send, CheckCircle2,
  Edit3, Archive, Share2, Flag,
} from 'lucide-react';
import AppLayout from '../components/AppLayout';
import {
  getCaseById, STATUS_STYLES, STATUS_DOT, PRIORITY_STYLES,
  type TimelineEvent, type CaseDocument, type CaseNote,
} from '../data/cases';

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

const SectionCard = ({ title, children, action }: { title: string; children: React.ReactNode; action?: React.ReactNode }) => (
  <div className="bg-white rounded-[1.75rem] border border-border-base shadow-sm overflow-hidden">
    <div className="px-7 py-5 border-b border-border-base flex items-center justify-between">
      <h3 className="font-bold text-brand-dark">{title}</h3>
      {action}
    </div>
    <div className="p-7">{children}</div>
  </div>
);

const TimelineItem = ({ event, isLast }: { event: TimelineEvent; isLast: boolean }) => {
  const { icon: Icon, bg, color } = timelineIcon(event.type);
  return (
    <div className="flex gap-4">
      <div className="flex flex-col items-center">
        <div className={`w-9 h-9 rounded-xl ${bg} ${color} flex items-center justify-center shrink-0 z-10`}>
          <Icon size={16} />
        </div>
        {!isLast && <div className="w-px flex-1 bg-border-base mt-2" />}
      </div>
      <div className={`pb-6 ${isLast ? '' : ''}`}>
        <p className="text-sm text-brand-dark font-medium leading-snug">{event.description}</p>
        <div className="flex items-center gap-2 mt-1.5">
          <span className="text-xs font-semibold text-brand-blue">{event.author}</span>
          <span className="text-xs text-text-muted">·</span>
          <span className="text-xs text-text-muted">{event.timestamp}</span>
        </div>
      </div>
    </div>
  );
};

const DocumentRow = ({ doc }: { doc: CaseDocument }) => (
  <div className="flex items-center gap-4 py-4 border-b border-border-base last:border-0 group">
    <div className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider shrink-0 ${docTypeStyle[doc.type]}`}>
      {doc.type}
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-sm font-semibold text-brand-dark truncate group-hover:text-brand-blue transition-colors cursor-pointer">{doc.name}</p>
      <p className="text-xs text-text-muted mt-0.5">{doc.size} · Uploaded by {doc.uploadedBy} · {doc.uploadedAt}</p>
    </div>
    <button className="p-2 rounded-xl hover:bg-brand-light text-text-muted hover:text-brand-blue transition-all shrink-0">
      <Download size={15} />
    </button>
  </div>
);

const NoteCard = ({ note }: { note: CaseNote }) => (
  <div className="flex gap-4">
    <div className={`w-9 h-9 rounded-xl ${note.color} text-white font-bold text-xs flex items-center justify-center shrink-0`}>
      {note.initials}
    </div>
    <div className="flex-1 bg-page-bg rounded-2xl p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-bold text-brand-dark">{note.author}</span>
        <span className="text-xs text-text-muted">{note.timestamp}</span>
      </div>
      <p className="text-sm text-text-secondary leading-relaxed">{note.text}</p>
    </div>
  </div>
);

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function CaseDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [newNote, setNewNote] = useState('');
  const [activeTab, setActiveTab] = useState<'timeline' | 'documents' | 'notes'>('timeline');

  const caseData = getCaseById(id ?? '');

  // Not found state
  if (!caseData) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center py-32 text-center">
          <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center text-red-400 mb-6">
            <AlertTriangle size={32} />
          </div>
          <h2 className="text-2xl font-bold text-brand-dark mb-2">Case Not Found</h2>
          <p className="text-text-secondary mb-8">The case <span className="font-bold text-brand-dark">{id}</span> does not exist.</p>
          <Link to="/cases" className="bg-brand-blue text-white px-6 py-3 rounded-xl font-bold hover:opacity-90 transition-all no-underline">
            Back to Cases
          </Link>
        </div>
      </AppLayout>
    );
  }

  const daysOpen = Math.floor(
    (new Date().getTime() - new Date(caseData.filedDate).getTime()) / (1000 * 60 * 60 * 24)
  );

  const actionBar = (
    <div className="flex items-center gap-2">
      <button className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-border-base text-sm font-semibold text-text-secondary hover:bg-page-bg transition-all">
        <Share2 size={14} /> Share
      </button>
      <button className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-border-base text-sm font-semibold text-text-secondary hover:bg-page-bg transition-all">
        <Archive size={14} /> Archive
      </button>
      <button className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-brand-blue text-white text-sm font-bold hover:opacity-90 transition-all whitespace-nowrap">
        <Edit3 size={14} /> Edit Case
      </button>
    </div>
  );

  return (
    <AppLayout action={actionBar}>
      {/* Back + Header */}
      <div>
        <button
          onClick={() => navigate('/cases')}
          className="flex items-center gap-2 text-sm font-semibold text-text-muted hover:text-brand-blue transition-colors mb-6 group"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          Back to Cases
        </button>

        {/* Case title row */}
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-3 flex-wrap">
              <span className="bg-brand-light text-brand-blue font-bold text-xs px-3 py-1 rounded-lg tracking-wider">
                {caseData.id}
              </span>
              <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${STATUS_STYLES[caseData.status]}`}>
                <div className={`w-1.5 h-1.5 rounded-full ${STATUS_DOT[caseData.status]}`} />
                {caseData.status}
              </div>
              <span className={`text-xs font-bold uppercase px-2.5 py-1 rounded-full ${PRIORITY_STYLES[caseData.priority]}`}>
                {caseData.priority} Priority
              </span>
              <span className="text-xs font-semibold text-text-muted bg-slate-100 px-2.5 py-1 rounded-full">
                {caseData.type}
              </span>
            </div>
            <h1 className="text-3xl font-bold text-brand-dark tracking-tight">{caseData.title}</h1>
            <p className="text-text-secondary text-sm">
              Filed {caseData.filedDate} · Last updated {caseData.updated}
            </p>
          </div>
        </div>
      </div>

      {/* Quick stats bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Days Open',   value: daysOpen,                    icon: Clock,       color: 'text-brand-blue',    bg: 'bg-brand-light'   },
          { label: 'Deadline',    value: caseData.deadline,           icon: Calendar,    color: 'text-amber-600',     bg: 'bg-amber-50'      },
          { label: 'Documents',   value: caseData.documents.length,   icon: Paperclip,   color: 'text-violet-600',    bg: 'bg-violet-50'     },
          { label: 'Team Members',value: caseData.team.length,        icon: User,        color: 'text-emerald-600',   bg: 'bg-emerald-50'    },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-2xl border border-border-base p-5 flex items-center gap-4">
            <div className={`p-3 rounded-xl ${s.bg} ${s.color} shrink-0`}><s.icon size={18} /></div>
            <div className="min-w-0">
              <p className="text-lg font-bold text-brand-dark truncate">{s.value}</p>
              <p className="text-[10px] font-bold uppercase tracking-wider text-text-muted">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Main 2-col layout */}
      <div className="grid lg:grid-cols-3 gap-6 items-start">

        {/* ── Left column (2/3) ── */}
        <div className="lg:col-span-2 space-y-6">

          {/* Overview */}
          <SectionCard title="Case Overview">
            <p className="text-text-secondary leading-relaxed text-sm">{caseData.description}</p>
          </SectionCard>

          {/* Tab bar for Timeline / Documents / Notes */}
          <div className="bg-white rounded-[1.75rem] border border-border-base shadow-sm overflow-hidden">
            {/* Tabs */}
            <div className="px-7 py-4 border-b border-border-base flex gap-1 bg-page-bg/30">
              {(['timeline', 'documents', 'notes'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold capitalize transition-all ${
                    activeTab === tab
                      ? 'bg-white text-brand-blue shadow-sm border border-border-base'
                      : 'text-text-muted hover:text-brand-dark'
                  }`}
                >
                  {tab}
                  <span className="ml-2 text-[10px] font-bold bg-page-bg px-1.5 py-0.5 rounded-md text-text-muted">
                    {tab === 'timeline' ? caseData.timeline.length : tab === 'documents' ? caseData.documents.length : caseData.notes.length}
                  </span>
                </button>
              ))}
            </div>

            <div className="p-7">
              {/* Timeline */}
              {activeTab === 'timeline' && (
                <div className="space-y-0">
                  {caseData.timeline.map((event, i) => (
                    <TimelineItem
                      key={event.id}
                      event={event}
                      isLast={i === caseData.timeline.length - 1}
                    />
                  ))}
                </div>
              )}

              {/* Documents */}
              {activeTab === 'documents' && (
                <div>
                  {caseData.documents.length === 0 ? (
                    <p className="text-sm text-text-muted text-center py-8">No documents uploaded yet.</p>
                  ) : (
                    caseData.documents.map((doc) => <DocumentRow key={doc.id} doc={doc} />)
                  )}
                  <button className="mt-5 flex items-center gap-2 text-sm font-bold text-brand-blue hover:underline underline-offset-4">
                    <Paperclip size={15} /> Upload Document
                  </button>
                </div>
              )}

              {/* Notes */}
              {activeTab === 'notes' && (
                <div className="space-y-5">
                  {caseData.notes.map((note) => (
                    <NoteCard key={note.id} note={note} />
                  ))}

                  {/* Add note input */}
                  <div className="flex gap-3 pt-3 border-t border-border-base">
                    <div className="w-9 h-9 rounded-xl bg-brand-blue text-white font-bold text-xs flex items-center justify-center shrink-0">JW</div>
                    <div className="flex-1 relative">
                      <textarea
                        rows={3}
                        value={newNote}
                        onChange={(e) => setNewNote(e.target.value)}
                        placeholder="Add a note or comment..."
                        className="w-full px-4 py-3 rounded-2xl border border-border-base focus:border-brand-blue outline-none transition-all resize-none text-sm pr-12 bg-page-bg/50 focus:bg-white"
                      />
                      <button
                        disabled={!newNote.trim()}
                        className="absolute bottom-3 right-3 p-2 rounded-xl bg-brand-blue text-white hover:opacity-90 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        <Send size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Right sidebar (1/3) ── */}
        <div className="space-y-5">

          {/* Case Details */}
          <SectionCard title="Case Details">
            <div className="space-y-4">
              {[
                { label: 'Case ID',    value: caseData.id              },
                { label: 'Type',       value: caseData.type            },
                { label: 'Filed Date', value: caseData.filedDate       },
                { label: 'Deadline',   value: caseData.deadline        },
              ].map((row) => (
                <div key={row.label} className="flex justify-between items-center py-2 border-b border-border-base last:border-0">
                  <span className="text-xs font-bold text-text-muted uppercase tracking-wider">{row.label}</span>
                  <span className="text-sm font-semibold text-brand-dark">{row.value}</span>
                </div>
              ))}
            </div>
          </SectionCard>

          {/* Client Info */}
          <SectionCard title="Client">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-brand-blue text-white font-bold text-sm flex items-center justify-center">
                  {caseData.client.split(' ').map(w => w[0]).join('').slice(0, 2)}
                </div>
                <div>
                  <p className="font-bold text-brand-dark text-sm">{caseData.client}</p>
                  <p className="text-xs text-text-muted">{caseData.clientCompany}</p>
                </div>
              </div>
              <div className="space-y-2 pt-2 border-t border-border-base">
                <div className="flex items-center gap-2 text-sm text-text-secondary">
                  <Mail size={13} className="text-text-muted shrink-0" />
                  <span className="truncate">{caseData.clientEmail}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-text-secondary">
                  <Phone size={13} className="text-text-muted shrink-0" />
                  <span>{caseData.clientPhone}</span>
                </div>
              </div>
            </div>
          </SectionCard>

          {/* Assigned Team */}
          <SectionCard title="Assigned Team">
            <div className="space-y-3">
              {caseData.team.map((member) => (
                <div key={member.name} className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-brand-dark text-white font-bold text-xs flex items-center justify-center shrink-0">
                    {member.initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-brand-dark truncate">{member.name}</p>
                    <p className="text-xs text-text-muted">{member.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>

          {/* Related Actions */}
          <div className="bg-white rounded-[1.75rem] border border-border-base p-6 space-y-2">
            <h3 className="font-bold text-brand-dark mb-4">Quick Actions</h3>
            {[
              { label: 'Schedule Meeting',    icon: Calendar    },
              { label: 'Upload Document',     icon: Paperclip   },
              { label: 'Add Team Member',     icon: User        },
              { label: 'Set Milestone',       icon: Flag        },
            ].map((action) => (
              <button
                key={action.label}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-page-bg text-sm font-semibold text-text-secondary hover:text-brand-blue transition-all text-left"
              >
                <action.icon size={16} className="shrink-0" />
                {action.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
