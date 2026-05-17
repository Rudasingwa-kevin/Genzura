import { useState, useEffect } from 'react';
import { X, Loader2, CheckCircle2, User } from 'lucide-react';
import { caseService } from '../api/services/case.service';
import { clientService } from '../api/services/client.service';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-hot-toast';

export default function NewCaseModal({ onClose }: { onClose: () => void }) {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [clients, setClients] = useState<any[]>([]);
  const [useNewClient, setUseNewClient] = useState(true); // Default to creating new client
  const [formData, setFormData] = useState({
    caseNumber: '',
    title: '',
    clientId: '',
    priority: 'Medium',
    type: 'Litigation',
    deadline: '',
    description: '',
    // New client fields
    clientName: '',
    clientEmail: '',
    clientPhone: '',
    clientCompany: '',
    clientAddress: '',
    clientIdNumber: '',
    clientIndustry: '',
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const allClients = await clientService.getAll();
        setClients(allClients);
      } catch (error) {
        console.error('Failed to fetch clients:', error);
      }
    };
    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.caseNumber || !formData.title) {
      toast.error('Case number and title are required');
      return;
    }

    if (useNewClient) {
      if (!formData.clientName || !formData.clientEmail) {
        toast.error('Client name and email are required');
        return;
      }
    } else {
      if (!formData.clientId) {
        toast.error('Please select a client');
        return;
      }
    }

    setIsLoading(true);
    try {
      let clientId = formData.clientId;

      // Create new client if needed
      if (useNewClient) {
        // Validate Rwanda phone format if provided
        if (formData.clientPhone && !formData.clientPhone.match(/^(\+250|0)?[7][0-9]{8}$/)) {
          toast.error('Invalid phone number. Rwanda format: +250 7XX XXX XXX or 07XX XXX XXX');
          setIsLoading(false);
          return;
        }

        const newClient = await clientService.create({
          name: formData.clientName,
          email: formData.clientEmail,
          phone: formData.clientPhone || null,
          company: formData.clientCompany || null,
          address: formData.clientAddress || null,
          idNumber: formData.clientIdNumber || null,
          industry: formData.clientIndustry || null,
        });
        clientId = newClient.id;
      }

      const processedData = {
        caseNumber: formData.caseNumber,
        title: formData.title,
        clientId,
        // attorneyId is automatically set by backend from logged-in user
        priority: formData.priority,
        type: formData.type,
        description: formData.description,
        deadline: formData.deadline ? new Date(formData.deadline).toISOString() : null,
      };

      await caseService.create(processedData);
      toast.success('Case created successfully!');
      onClose();
      window.location.reload();
    } catch (error: any) {
      console.error('Create case error:', error);
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

          {/* Client Selection Toggle */}
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-page-bg rounded-2xl border border-border-base">
              <div>
                <p className="text-sm font-bold text-brand-dark">Client Information</p>
                <p className="text-xs text-text-muted mt-0.5">Choose how to add client details</p>
              </div>
              <div className="flex gap-2 bg-white p-1.5 rounded-xl border border-border-base">
                <button
                  type="button"
                  onClick={() => setUseNewClient(true)}
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                    useNewClient ? 'bg-brand-blue text-white shadow-sm' : 'text-text-muted hover:text-brand-dark'
                  }`}
                >
                  New Client
                </button>
                <button
                  type="button"
                  onClick={() => setUseNewClient(false)}
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                    !useNewClient ? 'bg-brand-blue text-white shadow-sm' : 'text-text-muted hover:text-brand-dark'
                  }`}
                >
                  Existing Client
                </button>
              </div>
            </div>

            {useNewClient ? (
              // New Client Fields
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-5 bg-brand-light/30 rounded-2xl border border-brand-blue/20">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest ml-1">Full Name *</label>
                  <input
                    required
                    type="text"
                    value={formData.clientName}
                    onChange={e => setFormData({ ...formData, clientName: e.target.value })}
                    className="w-full h-12 px-5 rounded-2xl border border-border-base focus:border-brand-blue focus:ring-4 focus:ring-brand-blue/5 outline-none transition-all font-bold text-sm bg-white"
                    placeholder="e.g. MUGISHA Jean"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest ml-1">Email Address *</label>
                  <input
                    required
                    type="email"
                    value={formData.clientEmail}
                    onChange={e => setFormData({ ...formData, clientEmail: e.target.value })}
                    className="w-full h-12 px-5 rounded-2xl border border-border-base focus:border-brand-blue focus:ring-4 focus:ring-brand-blue/5 outline-none transition-all font-bold text-sm bg-white"
                    placeholder="client@example.com"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest ml-1">Phone Number (Rwanda)</label>
                  <div className="relative">
                    <input
                      type="tel"
                      value={formData.clientPhone}
                      onChange={e => setFormData({ ...formData, clientPhone: e.target.value })}
                      className="w-full h-12 px-5 pr-12 rounded-2xl border border-border-base focus:border-brand-blue focus:ring-4 focus:ring-brand-blue/5 outline-none transition-all font-bold text-sm bg-white"
                      placeholder="+250 788 XXX XXX"
                    />
                    {formData.clientPhone && formData.clientPhone.match(/^(\+250|0)?[7][0-9]{8}$/) && (
                      <CheckCircle2 size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-emerald-500" />
                    )}
                  </div>
                  <p className="text-[9px] text-text-muted ml-1">Format: +250 7XX XXX XXX or 07XX XXX XXX</p>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest ml-1">National ID / TIN</label>
                  <input
                    type="text"
                    value={formData.clientIdNumber}
                    onChange={e => setFormData({ ...formData, clientIdNumber: e.target.value })}
                    className="w-full h-12 px-5 rounded-2xl border border-border-base focus:border-brand-blue focus:ring-4 focus:ring-brand-blue/5 outline-none transition-all font-bold text-sm bg-white"
                    placeholder="1XXXXXXXXXXXXXXX"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest ml-1">Company/Organization</label>
                  <input
                    type="text"
                    value={formData.clientCompany}
                    onChange={e => setFormData({ ...formData, clientCompany: e.target.value })}
                    className="w-full h-12 px-5 rounded-2xl border border-border-base focus:border-brand-blue focus:ring-4 focus:ring-brand-blue/5 outline-none transition-all font-bold text-sm bg-white"
                    placeholder="Optional"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest ml-1">Industry/Sector</label>
                  <select
                    value={formData.clientIndustry}
                    onChange={e => setFormData({ ...formData, clientIndustry: e.target.value })}
                    className="w-full h-12 px-5 rounded-2xl border border-border-base focus:border-brand-blue focus:ring-4 focus:ring-brand-blue/5 outline-none transition-all font-bold text-sm bg-white appearance-none cursor-pointer"
                  >
                    <option value="">Select...</option>
                    <option value="Agriculture">Agriculture</option>
                    <option value="Banking">Banking & Finance</option>
                    <option value="Construction">Construction</option>
                    <option value="Education">Education</option>
                    <option value="Healthcare">Healthcare</option>
                    <option value="Technology">Technology</option>
                    <option value="Manufacturing">Manufacturing</option>
                    <option value="Real Estate">Real Estate</option>
                    <option value="Retail">Retail & Trade</option>
                    <option value="Tourism">Tourism & Hospitality</option>
                    <option value="Transport">Transport & Logistics</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest ml-1">Physical Address</label>
                  <input
                    type="text"
                    value={formData.clientAddress}
                    onChange={e => setFormData({ ...formData, clientAddress: e.target.value })}
                    className="w-full h-12 px-5 rounded-2xl border border-border-base focus:border-brand-blue focus:ring-4 focus:ring-brand-blue/5 outline-none transition-all font-bold text-sm bg-white"
                    placeholder="e.g. KG 11 Ave, Kigali"
                  />
                </div>
              </div>
            ) : (
              // Existing Client Dropdown
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest ml-1">Select Client</label>
                <select
                  required
                  value={formData.clientId}
                  onChange={e => setFormData({ ...formData, clientId: e.target.value })}
                  className="w-full h-12 px-5 rounded-2xl border border-border-base focus:border-brand-blue focus:ring-4 focus:ring-brand-blue/5 outline-none transition-all font-bold text-sm bg-white appearance-none cursor-pointer"
                >
                  <option value="" disabled>Choose a client...</option>
                  {clients.map(c => (
                    <option key={c.id} value={c.id}>{c.name} ({c.company || 'Private'})</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Lead Attorney Info */}
          <div className="p-4 bg-emerald-50/50 rounded-2xl border border-emerald-200/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-sm">
                <User size={20} />
              </div>
              <div>
                <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Lead Attorney (Auto-assigned)</p>
                <p className="text-sm font-bold text-brand-dark">{user?.name || 'Current User'}</p>
              </div>
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
