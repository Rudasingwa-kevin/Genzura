import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search, X, Briefcase, Users, FileText, ArrowRight,
  Loader2, Command, Hash, ChevronRight
} from 'lucide-react';
import apiClient from '../api/client';

// ─── Types ────────────────────────────────────────────────────────────────────

interface SearchResults {
  cases: Array<{ id: string; title: string; client: string; status: string; priority: string }>;
  users: Array<{ id: string; name: string; email: string; role: string; initials: string }>;
  documents: Array<{ id: string; name: string; type: string; caseId: string }>;
}

// ─── Status / Priority color maps ─────────────────────────────────────────────

const STATUS_COLOR: Record<string, string> = {
  Active:   'bg-emerald-100 text-emerald-700',
  Pending:  'bg-amber-100 text-amber-700',
  Resolved: 'bg-slate-100 text-slate-600',
  Archived: 'bg-slate-100 text-slate-500',
};

const PRIORITY_DOT: Record<string, string> = {
  High:   'bg-red-500',
  Medium: 'bg-amber-400',
  Low:    'bg-emerald-400',
};

// ─── Command Palette ──────────────────────────────────────────────────────────

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CommandPalette({ isOpen, onClose }: CommandPaletteProps) {
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResults>({ cases: [], users: [], documents: [] });
  const [isLoading, setIsLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setQuery('');
      setResults({ cases: [], users: [], documents: [] });
      setActiveIndex(0);
    }
  }, [isOpen]);

  // Debounced search
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!query.trim() || query.trim().length < 2) {
      setResults({ cases: [], users: [], documents: [] });
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const { data } = await apiClient.get(`/search?q=${encodeURIComponent(query)}`);
        setResults(data);
        setActiveIndex(0);
      } catch {
        setResults({ cases: [], users: [], documents: [] });
      } finally {
        setIsLoading(false);
      }
    }, 300);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [query]);

  // All navigable items flattened for keyboard nav
  const allItems = [
    ...results.cases.map(c => ({ type: 'case' as const, data: c })),
    ...results.users.map(u => ({ type: 'user' as const, data: u })),
    ...results.documents.map(d => ({ type: 'document' as const, data: d })),
  ];

  const handleNavigate = useCallback((item: typeof allItems[0]) => {
    if (item.type === 'case')     navigate(`/cases/${item.data.id}`);
    if (item.type === 'user')     navigate(`/users`);
    if (item.type === 'document') navigate(`/cases/${(item.data as any).caseId}`);
    onClose();
  }, [navigate, onClose]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { onClose(); return; }
      if (e.key === 'ArrowDown') { e.preventDefault(); setActiveIndex(i => Math.min(i + 1, allItems.length - 1)); }
      if (e.key === 'ArrowUp')   { e.preventDefault(); setActiveIndex(i => Math.max(i - 1, 0)); }
      if (e.key === 'Enter' && allItems[activeIndex]) { handleNavigate(allItems[activeIndex]); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, allItems, activeIndex, handleNavigate, onClose]);

  const totalResults = allItems.length;
  const hasResults = totalResults > 0;
  const showEmpty = query.trim().length >= 2 && !isLoading && !hasResults;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-start justify-center pt-[12vh] px-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-brand-dark/50 backdrop-blur-md"
        onClick={onClose}
      />

      {/* Palette */}
      <div
        className="relative w-full max-w-2xl bg-white rounded-[2rem] shadow-2xl border border-border-base overflow-hidden"
        style={{ animation: 'slideDown 0.18s cubic-bezier(0.16, 1, 0.3, 1)' }}
      >
        {/* Search Input */}
        <div className="flex items-center gap-4 px-6 py-5 border-b border-border-base">
          {isLoading
            ? <Loader2 size={22} className="text-brand-blue animate-spin shrink-0" />
            : <Search size={22} className="text-brand-blue shrink-0" />
          }
          <input
            ref={inputRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search cases, users, documents..."
            className="flex-1 text-lg font-semibold text-brand-dark placeholder:text-text-muted outline-none bg-transparent"
          />
          <div className="flex items-center gap-2 shrink-0">
            {query && (
              <button onClick={() => setQuery('')} className="p-1.5 rounded-lg hover:bg-page-bg text-text-muted transition-colors">
                <X size={16} />
              </button>
            )}
            <kbd className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1.5 bg-page-bg border border-border-base rounded-lg text-[11px] font-bold text-text-muted">
              ESC
            </kbd>
          </div>
        </div>

        {/* Results */}
        <div className="max-h-[60vh] overflow-y-auto overscroll-contain">

          {/* Empty prompt */}
          {!query.trim() && (
            <div className="px-6 py-10 text-center">
              <div className="w-14 h-14 rounded-2xl bg-brand-blue/5 flex items-center justify-center mx-auto mb-4">
                <Command size={28} className="text-brand-blue" />
              </div>
              <p className="font-bold text-brand-dark text-base mb-1">Search Everything</p>
              <p className="text-sm text-text-muted font-medium">Type to search across cases, attorneys, and documents</p>
              <div className="flex items-center justify-center gap-4 mt-6 flex-wrap">
                {[
                  { icon: Briefcase, label: 'Cases' },
                  { icon: Users,     label: 'Attorneys' },
                  { icon: FileText,  label: 'Documents' },
                ].map(({ icon: Icon, label }) => (
                  <span key={label} className="flex items-center gap-2 text-[11px] font-bold text-text-muted uppercase tracking-widest px-3 py-1.5 bg-page-bg rounded-lg border border-border-base">
                    <Icon size={13} /> {label}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* No results */}
          {showEmpty && (
            <div className="px-6 py-12 text-center">
              <p className="font-bold text-brand-dark mb-1">No results for &ldquo;{query}&rdquo;</p>
              <p className="text-sm text-text-muted">Try a different name, case ID, or document</p>
            </div>
          )}

          {/* Cases */}
          {results.cases.length > 0 && (
            <ResultSection label="Cases" icon={Briefcase}>
              {results.cases.map((c, i) => {
                const globalIdx = i;
                return (
                  <ResultItem
                    key={c.id}
                    isActive={activeIndex === globalIdx}
                    onClick={() => handleNavigate({ type: 'case', data: c })}
                    onHover={() => setActiveIndex(globalIdx)}
                  >
                    <div className="w-10 h-10 rounded-xl bg-brand-blue/5 flex items-center justify-center shrink-0">
                      <Hash size={14} className="text-brand-blue" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-brand-dark text-sm truncate">{c.title}</p>
                      <p className="text-xs text-text-muted truncate">{c.client}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${STATUS_COLOR[c.status] || 'bg-slate-100 text-slate-600'}`}>
                        {c.status}
                      </span>
                      <div className={`w-2 h-2 rounded-full ${PRIORITY_DOT[c.priority] || 'bg-slate-400'}`} title={c.priority} />
                    </div>
                  </ResultItem>
                );
              })}
            </ResultSection>
          )}

          {/* Users */}
          {results.users.length > 0 && (
            <ResultSection label="Attorneys & Staff" icon={Users}>
              {results.users.map((u, i) => {
                const globalIdx = results.cases.length + i;
                return (
                  <ResultItem
                    key={u.id}
                    isActive={activeIndex === globalIdx}
                    onClick={() => handleNavigate({ type: 'user', data: u })}
                    onHover={() => setActiveIndex(globalIdx)}
                  >
                    <div className="w-10 h-10 rounded-xl bg-brand-dark text-white font-bold text-xs flex items-center justify-center shrink-0">
                      {u.initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-brand-dark text-sm truncate">{u.name}</p>
                      <p className="text-xs text-text-muted truncate">{u.email}</p>
                    </div>
                    <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider shrink-0">
                      {u.role.replace(/_/g, ' ')}
                    </span>
                  </ResultItem>
                );
              })}
            </ResultSection>
          )}

          {/* Documents */}
          {results.documents.length > 0 && (
            <ResultSection label="Documents" icon={FileText}>
              {results.documents.map((d, i) => {
                const globalIdx = results.cases.length + results.users.length + i;
                return (
                  <ResultItem
                    key={d.id}
                    isActive={activeIndex === globalIdx}
                    onClick={() => handleNavigate({ type: 'document', data: d })}
                    onHover={() => setActiveIndex(globalIdx)}
                  >
                    <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center shrink-0">
                      <FileText size={16} className="text-amber-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-brand-dark text-sm truncate">{d.name}</p>
                      <p className="text-xs text-text-muted">Attached to case · {d.type}</p>
                    </div>
                    <ChevronRight size={16} className="text-text-muted shrink-0" />
                  </ResultItem>
                );
              })}
            </ResultSection>
          )}
        </div>

        {/* Footer */}
        {hasResults && (
          <div className="flex items-center justify-between px-6 py-3 border-t border-border-base bg-page-bg/50">
            <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest">
              {totalResults} result{totalResults !== 1 ? 's' : ''}
            </p>
            <div className="flex items-center gap-3 text-[10px] font-bold text-text-muted">
              <span className="flex items-center gap-1"><kbd className="px-1.5 py-0.5 bg-white border border-border-base rounded text-[9px]">↑↓</kbd> Navigate</span>
              <span className="flex items-center gap-1"><kbd className="px-1.5 py-0.5 bg-white border border-border-base rounded text-[9px]">↵</kbd> Open</span>
              <span className="flex items-center gap-1"><kbd className="px-1.5 py-0.5 bg-white border border-border-base rounded text-[9px]">ESC</kbd> Close</span>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-16px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0)    scale(1);    }
        }
      `}</style>
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function ResultSection({ label, icon: Icon, children }: { label: string; icon: React.ElementType; children: React.ReactNode }) {
  return (
    <div>
      <div className="flex items-center gap-2 px-6 py-2.5 bg-page-bg/60 border-b border-border-base/50">
        <Icon size={13} className="text-text-muted" />
        <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest">{label}</span>
      </div>
      <div>{children}</div>
    </div>
  );
}

function ResultItem({
  isActive, onClick, onHover, children
}: {
  isActive: boolean;
  onClick: () => void;
  onHover: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      onMouseEnter={onHover}
      className={`w-full flex items-center gap-4 px-6 py-3.5 transition-all text-left group ${
        isActive ? 'bg-brand-blue text-white' : 'hover:bg-page-bg/80'
      }`}
    >
      {children}
      <ArrowRight size={14} className={`ml-auto shrink-0 transition-opacity ${isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-40'}`} />
    </button>
  );
}
