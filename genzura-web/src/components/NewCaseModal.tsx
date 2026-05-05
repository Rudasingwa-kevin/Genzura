import { X } from 'lucide-react';

export default function NewCaseModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-[2rem] shadow-2xl p-6 md:p-10 w-full max-w-lg mx-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-brand-dark">New Case</h2>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-page-bg transition-colors text-text-muted">
            <X size={20} />
          </button>
        </div>
        <form className="space-y-5" onSubmit={(e) => { e.preventDefault(); onClose(); }}>
          <div className="space-y-2">
            <label className="text-sm font-bold text-brand-dark ml-1">Case Title</label>
            <input type="text" className="w-full h-12 px-4 rounded-xl border border-border-base focus:border-brand-blue outline-none transition-all" placeholder="e.g. Corporate Restructuring" autoFocus />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-bold text-brand-dark ml-1">Client Name</label>
              <input type="text" className="w-full h-12 px-4 rounded-xl border border-border-base focus:border-brand-blue outline-none transition-all" placeholder="Apex Global Inc." />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-brand-dark ml-1">Priority</label>
              <select className="w-full h-12 px-4 rounded-xl border border-border-base focus:border-brand-blue outline-none transition-all bg-white appearance-none">
                <option>High</option>
                <option>Medium</option>
                <option>Low</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-bold text-brand-dark ml-1">Assigned Attorney</label>
              <select className="w-full h-12 px-4 rounded-xl border border-border-base focus:border-brand-blue outline-none transition-all bg-white appearance-none">
                <option>J. Wilson</option>
                <option>S. Owens</option>
                <option>A. Torres</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-brand-dark ml-1">Deadline</label>
              <input type="date" className="w-full h-12 px-4 rounded-xl border border-border-base focus:border-brand-blue outline-none transition-all" />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-brand-dark ml-1">Description</label>
            <textarea rows={3} className="w-full px-4 py-3 rounded-xl border border-border-base focus:border-brand-blue outline-none transition-all resize-none" placeholder="Brief summary of the case..." />
          </div>
          <button type="submit" className="w-full bg-brand-blue text-white h-12 rounded-xl font-bold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all">
            Create Case
          </button>
        </form>
      </div>
    </div>
  );
}
