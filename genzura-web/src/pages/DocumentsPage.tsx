import { useState } from 'react';
import { 
  FileText, 
  Search, 
  Filter, 
  Upload, 
  MoreHorizontal, 
  File as FileIcon,
  Image as ImageIcon,
  FileSpreadsheet
} from 'lucide-react';
import AppLayout from '../components/AppLayout';
import { DOCUMENTS, type DocType } from '../data/documents';

export default function DocumentsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<DocType | 'All'>('All');

  // Filter logic
  const filteredDocs = DOCUMENTS.filter((doc) => {
    const matchesSearch = doc.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (doc.caseId && doc.caseId.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesType = typeFilter === 'All' || doc.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const getFileIcon = (type: DocType) => {
    switch (type) {
      case 'PDF': return <FileText size={18} className="text-red-500" />;
      case 'DOCX': return <FileText size={18} className="text-blue-500" />;
      case 'XLSX': return <FileSpreadsheet size={18} className="text-green-500" />;
      case 'JPG': return <ImageIcon size={18} className="text-purple-500" />;
      default: return <FileIcon size={18} className="text-slate-500" />;
    }
  };

  return (
    <AppLayout 
      title="Documents"
      action={
        <button className="flex items-center gap-2 bg-brand-blue text-white px-4 py-2.5 rounded-xl font-bold shadow-lg shadow-brand-blue/30 hover:shadow-xl hover:-translate-y-0.5 transition-all">
          <Upload size={18} /> Upload Document
        </button>
      }
    >
      <div className="bg-white rounded-[2rem] border border-border-base p-8 shadow-sm">
        
        {/* Filters and Search */}
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center mb-8">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={20} />
            <input 
              type="text" 
              placeholder="Search files or case IDs..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-12 pl-12 pr-4 bg-page-bg border border-transparent focus:border-brand-blue rounded-xl outline-none transition-all font-medium text-brand-dark focus:bg-white focus:ring-4 focus:ring-brand-blue/10"
            />
          </div>
          
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="flex items-center gap-2 bg-page-bg px-4 py-3 rounded-xl border border-transparent font-semibold text-brand-dark">
              <Filter size={18} className="text-text-muted" />
              <select 
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value as DocType | 'All')}
                className="bg-transparent border-none outline-none font-bold cursor-pointer"
              >
                <option value="All">All Types</option>
                <option value="PDF">PDF</option>
                <option value="DOCX">Word</option>
                <option value="XLSX">Excel</option>
                <option value="JPG">Images</option>
              </select>
            </div>
          </div>
        </div>

        {/* Documents Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b-2 border-page-bg">
                <th className="pb-4 px-6 text-xs font-bold text-text-muted uppercase tracking-wider">Name</th>
                <th className="pb-4 px-6 text-xs font-bold text-text-muted uppercase tracking-wider">Size</th>
                <th className="pb-4 px-6 text-xs font-bold text-text-muted uppercase tracking-wider">Relation</th>
                <th className="pb-4 px-6 text-xs font-bold text-text-muted uppercase tracking-wider">Uploaded Date</th>
                <th className="pb-4 px-6 text-xs font-bold text-text-muted uppercase tracking-wider text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredDocs.length > 0 ? (
                filteredDocs.map((doc, i) => (
                  <tr 
                    key={doc.id} 
                    className="border-b border-border-base hover:bg-page-bg/50 transition-colors group animate-in-fade"
                    style={{ animationDelay: `${(i % 15) * 40 + 200}ms` }}
                  >
                    <td className="py-5 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-white border border-border-base flex items-center justify-center shadow-sm">
                          {getFileIcon(doc.type)}
                        </div>
                        <div>
                          <p className="font-bold text-brand-dark text-sm group-hover:text-brand-blue transition-colors cursor-pointer truncate max-w-[300px]">
                            {doc.name}
                          </p>
                          <p className="text-xs text-text-muted mt-0.5">Uploaded by {doc.uploader}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-5 px-6 text-sm font-semibold text-text-secondary">
                      {doc.size}
                    </td>
                    <td className="py-5 px-6">
                      <div className="flex flex-col gap-1">
                        {doc.caseId && (
                          <span className="inline-flex w-fit items-center px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-brand-light text-brand-blue tracking-wider">
                            {doc.caseId}
                          </span>
                        )}
                        {doc.clientName && (
                          <span className="text-xs font-semibold text-text-secondary">
                            {doc.clientName}
                          </span>
                        )}
                        {!doc.caseId && !doc.clientName && (
                          <span className="text-xs text-text-muted italic">General</span>
                        )}
                      </div>
                    </td>
                    <td className="py-5 px-6 text-sm text-text-secondary">
                      {new Date(doc.uploadDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td className="py-5 px-6 text-center">
                      <button className="p-2 rounded-xl hover:bg-white hover:shadow-sm border border-transparent hover:border-border-base text-text-muted hover:text-brand-blue transition-all">
                        <MoreHorizontal size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-12 text-center">
                    <div className="w-16 h-16 bg-page-bg rounded-2xl flex items-center justify-center mx-auto mb-4 text-text-muted">
                      <FileIcon size={24} />
                    </div>
                    <h3 className="text-lg font-bold text-brand-dark mb-1">No documents found</h3>
                    <p className="text-text-secondary">Adjust your search or filter to find what you're looking for.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

      </div>
    </AppLayout>
  );
}
