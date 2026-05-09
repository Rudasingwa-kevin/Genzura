import { useState } from 'react';
import { 
  FileText, 
  Search as SearchIcon, 
  Filter, 
  Upload, 
  File as FileIcon,
  Image as ImageIcon,
  FileSpreadsheet,
  X,
  Download,
  Share2,
  Trash2,
  Plus,
  Clock
} from 'lucide-react';
import AppLayout from '../components/AppLayout';
import { DOCUMENTS, type DocType } from '../data/documents';

// ─── Sub-components ───────────────────────────────────────────────────────────

const UploadModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const [files, setFiles] = useState<{ name: string; size: string; progress: number; status: 'uploading' | 'complete' }[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  const simulateUpload = (fileName: string, size: string) => {
    const newFile = { name: fileName, size, progress: 0, status: 'uploading' as const };
    setFiles(prev => [...prev, newFile]);

    let p = 0;
    const interval = setInterval(() => {
      p += Math.random() * 30;
      if (p >= 100) {
        p = 100;
        clearInterval(interval);
        setFiles(prev => prev.map(f => f.name === fileName ? { ...f, progress: 100, status: 'complete' } : f));
      } else {
        setFiles(prev => prev.map(f => f.name === fileName ? { ...f, progress: p } : f));
      }
    }, 400);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const fileName = "Legal_Brief_Draft.pdf"; // Mock file name
    simulateUpload(fileName, "2.4 MB");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-brand-dark/40 backdrop-blur-sm animate-in fade-in duration-300" onClick={onClose} />
      <div className="relative bg-white w-full max-w-xl rounded-[2.5rem] shadow-2xl border border-border-base p-10 animate-in slide-in-from-bottom-20 fade-in duration-500 ease-out">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-brand-dark tracking-tight">Upload Documents</h2>
            <p className="text-text-secondary font-medium text-sm mt-1">Add new files to your legal workspace.</p>
          </div>
          <button onClick={onClose} className="p-2.5 rounded-2xl hover:bg-page-bg text-text-muted transition-all">
            <X size={20} />
          </button>
        </div>

        {/* Drag & Drop Area */}
        <div 
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          className={`relative border-2 border-dashed rounded-[2rem] p-12 text-center transition-all ${
            isDragging ? 'border-brand-blue bg-brand-light/50 scale-[0.99]' : 'border-border-base bg-page-bg/30 hover:border-brand-blue/30'
          }`}
        >
          <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm border border-border-base">
            <Upload className={`transition-all duration-500 ${isDragging ? 'text-brand-blue -translate-y-1' : 'text-text-muted'}`} size={32} />
          </div>
          <h3 className="text-lg font-bold text-brand-dark mb-2">Drag & drop files here</h3>
          <p className="text-sm text-text-secondary font-medium mb-8">Maximum file size 50MB. Supported: PDF, DOCX, XLSX, JPG</p>
          <button className="bg-white border border-border-base px-6 py-2.5 rounded-xl text-sm font-bold text-brand-dark hover:bg-page-bg transition-all shadow-sm">
            Or select files
          </button>
        </div>

        {/* File Progress List */}
        {files.length > 0 && (
          <div className="mt-8 space-y-4 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
            {files.map((file, idx) => (
              <div key={idx} className="bg-page-bg/50 rounded-2xl p-4 border border-border-base/50 flex items-center gap-4 animate-in slide-in-from-top-2 duration-300">
                <div className="w-10 h-10 rounded-xl bg-white border border-border-base flex items-center justify-center shadow-sm">
                  <FileText size={18} className="text-brand-blue" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1.5">
                    <p className="text-xs font-bold text-brand-dark truncate">{file.name}</p>
                    <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">{file.status === 'complete' ? 'Success' : `${Math.round(file.progress)}%`}</span>
                  </div>
                  <div className="w-full h-1.5 bg-white rounded-full overflow-hidden border border-border-base/30">
                    <div className="h-full bg-brand-blue transition-all duration-300" style={{ width: `${file.progress}%` }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-10 flex gap-3">
          <button onClick={onClose} className="flex-1 h-12 rounded-xl border border-border-base font-bold text-text-muted hover:bg-page-bg transition-all">Cancel</button>
          <button onClick={onClose} className="flex-1 h-12 rounded-xl bg-brand-blue text-white font-bold shadow-lg shadow-brand-blue/20 hover:shadow-xl hover:-translate-y-0.5 transition-all">Done</button>
        </div>
      </div>
    </div>
  );
};

const DocumentDrawer = ({ doc, isOpen, onClose }: { doc: any; isOpen: boolean; onClose: () => void }) => {
  if (!doc) return null;

  return (
    <>
      <div className={`fixed inset-0 z-[110] bg-brand-dark/20 backdrop-blur-sm transition-opacity duration-500 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={onClose} />
      <div className={`fixed top-0 right-0 bottom-0 w-full max-w-lg bg-white z-[120] shadow-[-20px_0_60px_rgba(0,0,0,0.1)] transition-transform duration-500 ease-out p-10 flex flex-col ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex items-center justify-between mb-10">
          <button onClick={onClose} className="p-3 rounded-2xl hover:bg-page-bg text-text-muted hover:text-brand-dark transition-all">
            <X size={24} />
          </button>
          <div className="flex items-center gap-3">
            <button className="p-3 rounded-2xl hover:bg-page-bg text-text-muted transition-all"><Share2 size={20} /></button>
            <button className="p-3 rounded-2xl bg-brand-blue text-white shadow-lg shadow-brand-blue/20 hover:-translate-y-0.5 transition-all"><Download size={20} /></button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto space-y-10 pr-2 custom-scrollbar">
          <div className="flex flex-col items-center text-center">
            <div className="w-24 h-24 rounded-3xl bg-brand-light text-brand-blue flex items-center justify-center mb-6 shadow-inner border border-brand-blue/5">
              <FileText size={48} />
            </div>
            <h3 className="text-2xl font-bold text-brand-dark tracking-tight leading-tight px-4">{doc.name}</h3>
            <div className="flex items-center gap-2 mt-4">
              <span className="px-3 py-1 rounded-full bg-page-bg border border-border-base text-xs font-bold text-text-muted">{doc.type}</span>
              <span className="px-3 py-1 rounded-full bg-page-bg border border-border-base text-xs font-bold text-text-muted">{doc.size}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-6 rounded-[2rem] bg-page-bg/50 border border-border-base">
              <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-1">Uploaded</p>
              <p className="text-sm font-bold text-brand-dark">{doc.uploadDate}</p>
            </div>
            <div className="p-6 rounded-[2rem] bg-page-bg/50 border border-border-base">
              <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-1">Author</p>
              <p className="text-sm font-bold text-brand-dark">{doc.uploader}</p>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-xs font-bold text-brand-dark uppercase tracking-widest ml-1">Document Preview</h4>
            <div className="aspect-[3/4] w-full bg-page-bg rounded-[2rem] border-2 border-dashed border-border-base flex items-center justify-center p-12 text-center">
              <div>
                <FileIcon size={40} className="mx-auto text-text-muted mb-4 opacity-30" />
                <p className="text-sm font-bold text-text-muted">Preview not available for this file type</p>
                <button className="mt-4 text-xs font-bold text-brand-blue hover:underline">Download to view</button>
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-border-base">
            <button className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl bg-red-50 text-red-600 font-bold text-xs uppercase tracking-widest hover:bg-red-100 transition-all">
              <Trash2 size={16} /> Delete Permanently
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function DocumentsPage() {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<DocType | 'All'>('All');
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<any>(null);

  const filteredDocs = DOCUMENTS.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(search.toLowerCase()) || 
                         (doc.caseId && doc.caseId.toLowerCase().includes(search.toLowerCase()));
    const matchesFilter = filter === 'All' || doc.type === filter;
    return matchesSearch && matchesFilter;
  });

  const getIcon = (type: DocType) => {
    switch (type) {
      case 'PDF': return <FileText className="text-red-500" />;
      case 'DOCX': return <FileIcon className="text-blue-500" />;
      case 'XLSX': return <FileSpreadsheet className="text-emerald-500" />;
      case 'JPG': return <ImageIcon className="text-violet-500" />;
    }
  };

  return (
    <AppLayout>
      <UploadModal isOpen={isUploadOpen} onClose={() => setIsUploadOpen(false)} />
      <DocumentDrawer doc={selectedDoc} isOpen={!!selectedDoc} onClose={() => setSelectedDoc(null)} />

      <div className="space-y-8 pb-12">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 animate-in-fade">
          <div>
            <h1 className="text-3xl font-bold text-brand-dark tracking-tight">Documents</h1>
            <p className="text-sm text-text-muted mt-1">Manage and preview litigation files across all cases</p>
          </div>
          <button 
            onClick={() => setIsUploadOpen(true)}
            className="flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-brand-blue text-white font-bold shadow-lg shadow-brand-blue/20 hover:shadow-xl hover:-translate-y-0.5 transition-all group"
          >
            <Plus size={20} className="group-hover:rotate-90 transition-transform duration-300" />
            Upload New
          </button>
        </div>

        {/* Toolbar */}
        <div className="bg-white p-4 rounded-[2rem] border border-border-base flex flex-col lg:flex-row lg:items-center gap-4 shadow-sm">
          <div className="relative flex-1">
            <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
            <input 
              type="text" 
              placeholder="Search by file name or case ID..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-12 pl-12 pr-4 rounded-xl bg-page-bg border border-transparent focus:bg-white focus:border-brand-blue/30 outline-none transition-all text-sm font-bold text-brand-dark"
            />
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex p-1 bg-page-bg rounded-xl border border-border-base">
              {(['All', 'PDF', 'DOCX', 'XLSX', 'JPG'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setFilter(t)}
                  className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    filter === t ? 'bg-white text-brand-blue shadow-sm' : 'text-text-muted hover:text-brand-dark'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
            <button className="p-3 rounded-xl border border-border-base hover:bg-page-bg text-text-muted hover:text-brand-blue transition-all">
              <Filter size={18} />
            </button>
          </div>
        </div>

        {/* Documents Grid/Table */}
        <div className="bg-white rounded-[2rem] border border-border-base shadow-sm overflow-hidden animate-in-up">
          <div className="overflow-x-auto">
            <table className="w-full text-left whitespace-nowrap">
              <thead>
                <tr className="bg-page-bg/40 border-b border-border-base">
                  <th className="px-8 py-4 text-[10px] font-bold text-text-muted uppercase tracking-widest">Document</th>
                  <th className="px-8 py-4 text-[10px] font-bold text-text-muted uppercase tracking-widest">Case Association</th>
                  <th className="px-8 py-4 text-[10px] font-bold text-text-muted uppercase tracking-widest">Last Updated</th>
                  <th className="px-8 py-4 text-[10px] font-bold text-text-muted uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-base/50">
                {filteredDocs.length > 0 ? (
                  filteredDocs.map((doc, i) => (
                    <tr 
                      key={doc.id} 
                      className="group hover:bg-page-bg/30 transition-all cursor-pointer animate-in-up" 
                      style={{ animationDelay: `${i * 50}ms` }}
                      onClick={() => setSelectedDoc(doc)}
                    >
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-page-bg flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                            {getIcon(doc.type)}
                          </div>
                          <div>
                            <p className="font-bold text-brand-dark text-sm leading-tight group-hover:text-brand-blue transition-colors">{doc.name}</p>
                            <p className="text-xs text-text-muted mt-1 font-medium">{doc.size} · {doc.type}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-1 rounded-lg bg-brand-light text-brand-blue text-[10px] font-bold border border-brand-blue/10">
                            {doc.caseId || 'Personal'}
                          </span>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-2 text-xs text-text-secondary font-medium">
                          <Clock size={14} className="text-text-muted" />
                          {doc.uploadDate}
                        </div>
                      </td>
                      <td className="px-8 py-5" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button className="p-2.5 rounded-xl hover:bg-white hover:shadow-sm text-text-muted hover:text-brand-blue transition-all" title="Download">
                            <Download size={16} />
                          </button>
                          <button className="p-2.5 rounded-xl hover:bg-white hover:shadow-sm text-text-muted hover:text-brand-blue transition-all" title="Share">
                            <Share2 size={16} />
                          </button>
                          <div className="w-px h-4 bg-border-base mx-1" />
                          <button className="p-2.5 rounded-xl hover:bg-red-50 text-text-muted hover:text-red-500 transition-all" title="Delete">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="py-20 text-center">
                      <div className="w-16 h-16 bg-page-bg rounded-2xl flex items-center justify-center mx-auto mb-4 border border-dashed border-border-base">
                        <FileText size={24} className="text-text-muted opacity-30" />
                      </div>
                      <p className="text-sm font-bold text-text-muted">No documents matching your search</p>
                      <button onClick={() => { setSearch(''); setFilter('All'); }} className="mt-4 text-xs font-bold text-brand-blue hover:underline">Clear all filters</button>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
