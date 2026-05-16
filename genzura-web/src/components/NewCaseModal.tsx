import { useState, useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';
import { caseService } from '../api/services/case.service';
import { userService } from '../api/services/user.service';
import { toast } from 'react-hot-toast';

export default function NewCaseModal({ onClose }: { onClose: () => void }) {
  const [isLoading, setIsLoading] = useState(false);
  const [users, setUsers] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    caseNumber: '',
    title: '',
    client: '',
    clientEmail: '',
    clientPhone: '',
    clientCompany: '',
    attorneyId: '',
    priority: 'Medium',
    type: 'Litigation',
    deadline: '',
    description: '',
  });

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const allUsers = await userService.getAll();
        setUsers(allUsers);
        if (allUsers.length > 0) {
          setFormData(prev => ({ ...prev, attorneyId: allUsers[0].id }));
        }
      } catch (error) {
        console.error('Failed to fetch users:', error);
      }
    };
    fetchUsers();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.caseNumber || !formData.title || !formData.client) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsLoading(true);
    try {
      // Ensure date is valid ISO or null
      const processedData = {
        ...formData,
        deadline: formData.deadline ? new Date(formData.deadline).toISOString() : null,
        filedDate: new Date().toISOString(),
      };
      
      await caseService.create(processedData);
      toast.success('Case created successfully!');
      onClose();
      // Optionally refresh page or cases list
      window.location.reload();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to create case');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-brand-dark/40 backdrop-blur-md animate-in-fade" onClick={onClose} />
      <div className="relative bg-white rounded-[2.5rem] shadow-2xl p-8 md:p-10 w-full max-w-2xl mx-auto animate-in-up duration-500 overflow-y-auto max-h-[90vh] premium-border">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-brand-dark">New Case Entry</h2>
            <p className="text-xs font-bold text-text-muted uppercase tracking-widest mt-1">Register a new litigation or corporate matter</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-page-bg transition-colors text-text-muted">
            <X size={24} />
          </button>
        </div>

        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest ml-1">Government Case #</label>
              <input 
                required
                type="text" 
                value={formData.caseNumber}
                onChange={e => setFormData({ ...formData, caseNumber: e.target.value })}
                className="w-full h-12 px-5 rounded-2xl border border-border-base focus:border-brand-blue focus:ring-4 focus:ring-brand-blue/5 outline-none transition-all font-bold text-sm bg-page-bg/30" 
                placeholder="e.g. CV-2026-0482" 
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest ml-1">Case Title</label>
              <input 
                required
                type="text" 
                value={formData.title}
                onChange={e => setFormData({ ...formData, title: e.target.value })}
                className="w-full h-12 px-5 rounded-2xl border border-border-base focus:border-brand-blue focus:ring-4 focus:ring-brand-blue/5 outline-none transition-all font-bold text-sm bg-page-bg/30" 
                placeholder="e.g. Alpha Corp v. Beta Inc" 
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest ml-1">Client Name</label>
              <input 
                required
                type="text" 
                value={formData.client}
                onChange={e => setFormData({ ...formData, client: e.target.value })}
                className="w-full h-12 px-5 rounded-2xl border border-border-base focus:border-brand-blue focus:ring-4 focus:ring-brand-blue/5 outline-none transition-all font-bold text-sm bg-page-bg/30" 
                placeholder="Apex Global Inc." 
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest ml-1">Lead Attorney</label>
              <select 
                value={formData.attorneyId}
                onChange={e => setFormData({ ...formData, attorneyId: e.target.value })}
                className="w-full h-12 px-5 rounded-2xl border border-border-base focus:border-brand-blue focus:ring-4 focus:ring-brand-blue/5 outline-none transition-all font-bold text-sm bg-white appearance-none cursor-pointer"
              >
                {users.map(u => (
                  <option key={u.id} value={u.id}>{u.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest ml-1">Type</label>
              <select 
                value={formData.type}
                onChange={e => setFormData({ ...formData, type: e.target.value })}
                className="w-full h-12 px-5 rounded-2xl border border-border-base focus:border-brand-blue outline-none transition-all font-bold text-sm bg-white"
              >
                <option value="Litigation">Litigation</option>
                <option value="Corporate">Corporate</option>
                <option value="IP">IP</option>
                <option value="Compliance">Compliance</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest ml-1">Priority</label>
              <select 
                value={formData.priority}
                onChange={e => setFormData({ ...formData, priority: e.target.value })}
                className="w-full h-12 px-5 rounded-2xl border border-border-base focus:border-brand-blue outline-none transition-all font-bold text-sm bg-white"
              >
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest ml-1">Deadline</label>
              <input 
                type="date" 
                value={formData.deadline}
                onChange={e => setFormData({ ...formData, deadline: e.target.value })}
                className="w-full h-12 px-5 rounded-2xl border border-border-base focus:border-brand-blue outline-none transition-all font-bold text-sm bg-page-bg/30" 
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest ml-1">Case Description</label>
            <textarea 
              rows={4} 
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-5 py-4 rounded-2xl border border-border-base focus:border-brand-blue outline-none transition-all resize-none font-medium text-sm bg-page-bg/30" 
              placeholder="Provide a detailed summary of the legal matter..." 
            />
          </div>

          <div className="flex gap-4 pt-4">
            <button 
              type="button"
              onClick={onClose}
              className="flex-1 h-14 rounded-2xl border border-border-base font-bold text-brand-dark hover:bg-page-bg transition-all uppercase tracking-widest text-xs"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={isLoading}
              className="flex-1 h-14 bg-brand-blue text-white rounded-2xl font-bold shadow-lg shadow-brand-blue/20 hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 uppercase tracking-widest text-xs disabled:opacity-50"
            >
              {isLoading ? <Loader2 className="animate-spin" size={20} /> : 'Register Case'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
