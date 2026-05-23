import { useState, useEffect } from 'react';
import {
  MessageSquare,
  Filter,
  Search,
  Clock,
  User,
  Mail,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Eye
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import AppLayout from '../../components/AppLayout';
import { STATUS_COLORS, type FeedbackStatus } from '../../data/feedback';
import { feedbackService } from '../../api/services/feedback.service';

export default function FeedbackManagement() {
  const [feedback, setFeedback] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'All' | FeedbackStatus>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFeedback, setSelectedFeedback] = useState<any>(null);

  const fetchFeedback = async () => {
    try {
      const data = await feedbackService.getAllFeedback();
      setFeedback(data);
    } catch (error) {
      console.error('Failed to fetch feedback:', error);
      toast.error('Failed to load feedback');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedback();
  }, []);

  const handleStatusUpdate = async (id: string, newStatus: FeedbackStatus) => {
    const loadId = toast.loading('Updating status...');
    try {
      await feedbackService.updateStatus(id, newStatus);
      setFeedback(feedback.map(f => f.id === id ? { ...f, status: newStatus } : f));
      if (selectedFeedback?.id === id) {
        setSelectedFeedback({ ...selectedFeedback, status: newStatus });
      }
      toast.success('Status updated successfully', { id: loadId });
    } catch (error) {
      toast.error('Failed to update status', { id: loadId });
    }
  };

  const filteredFeedback = feedback.filter(f => {
    const matchesStatus = statusFilter === 'All' || f.status === statusFilter;
    const matchesSearch =
      f.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.user?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.user?.email.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const stats = [
    { label: 'Total', count: feedback.length, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Pending', count: feedback.filter(f => f.status === 'Pending').length, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'In Progress', count: feedback.filter(f => f.status === 'In_Progress').length, color: 'text-violet-600', bg: 'bg-violet-50' },
    { label: 'Resolved', count: feedback.filter(f => f.status === 'Resolved').length, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  ];

  return (
    <AppLayout>
      <div className="space-y-8 pb-12">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-brand-dark">Feedback Management</h1>
            <p className="text-text-muted mt-1">Review and respond to user feedback</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-6">
          {stats.map((stat, i) => (
            <div key={i} className="bg-white p-6 rounded-2xl border border-border-base shadow-sm">
              <div className={`w-12 h-12 rounded-xl ${stat.bg} ${stat.color} flex items-center justify-center mb-4`}>
                <MessageSquare size={24} />
              </div>
              <p className="text-2xl font-bold text-brand-dark">{stat.count}</p>
              <p className="text-xs font-bold text-text-muted uppercase tracking-wider mt-1">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl border border-border-base p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" />
              <input
                type="text"
                placeholder="Search by subject, message, user name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-12 pl-12 pr-4 rounded-xl bg-page-bg border border-transparent focus:bg-white focus:border-brand-blue outline-none transition-all"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter size={16} className="text-text-muted" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="h-12 px-4 rounded-xl bg-page-bg border border-transparent focus:bg-white focus:border-brand-blue outline-none transition-all font-bold"
              >
                <option value="All">All Status</option>
                <option value="Pending">Pending</option>
                <option value="Reviewed">Reviewed</option>
                <option value="In_Progress">In Progress</option>
                <option value="Resolved">Resolved</option>
              </select>
            </div>
          </div>
        </div>

        {/* Feedback List */}
        <div className="bg-white rounded-2xl border border-border-base shadow-sm overflow-hidden">
          {isLoading ? (
            <div className="p-20 text-center">
              <Loader2 className="w-12 h-12 animate-spin text-brand-blue mx-auto" />
            </div>
          ) : filteredFeedback.length === 0 ? (
            <div className="p-20 text-center">
              <MessageSquare size={48} className="text-text-muted mx-auto mb-4" />
              <h3 className="text-lg font-bold text-brand-dark">No feedback found</h3>
              <p className="text-text-muted mt-2">Try adjusting your filters</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-page-bg/50 border-b border-border-base">
                  <tr>
                    <th className="text-left py-4 px-6 text-xs font-bold text-text-muted uppercase tracking-wider">User</th>
                    <th className="text-left py-4 px-6 text-xs font-bold text-text-muted uppercase tracking-wider">Subject</th>
                    <th className="text-left py-4 px-6 text-xs font-bold text-text-muted uppercase tracking-wider">Category</th>
                    <th className="text-left py-4 px-6 text-xs font-bold text-text-muted uppercase tracking-wider">Status</th>
                    <th className="text-left py-4 px-6 text-xs font-bold text-text-muted uppercase tracking-wider">Date</th>
                    <th className="text-left py-4 px-6 text-xs font-bold text-text-muted uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-base">
                  {filteredFeedback.map((item) => (
                    <tr key={item.id} className="hover:bg-page-bg/30 transition-colors">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-brand-blue text-white font-bold text-sm flex items-center justify-center">
                            {item.user?.initials || item.user?.name?.split(' ').map((n: string) => n[0]).join('').toUpperCase()}
                          </div>
                          <div>
                            <p className="font-bold text-sm text-brand-dark">{item.user?.name}</p>
                            <p className="text-xs text-text-muted">{item.user?.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <p className="font-bold text-sm text-brand-dark max-w-xs truncate">{item.subject}</p>
                        <p className="text-xs text-text-muted mt-1 line-clamp-1">{item.message}</p>
                      </td>
                      <td className="py-4 px-6">
                        <span className="text-xs font-bold text-text-secondary bg-page-bg px-2 py-1 rounded-lg">
                          {item.category}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <select
                          value={item.status}
                          onChange={(e) => handleStatusUpdate(item.id, e.target.value as FeedbackStatus)}
                          className={`text-xs font-bold px-3 py-1.5 rounded-full border border-current/10 outline-none cursor-pointer ${STATUS_COLORS[item.status]}`}
                        >
                          <option value="Pending">Pending</option>
                          <option value="Reviewed">Reviewed</option>
                          <option value="In_Progress">In Progress</option>
                          <option value="Resolved">Resolved</option>
                        </select>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2 text-text-muted">
                          <Clock size={14} />
                          <span className="text-xs font-medium">{new Date(item.createdAt).toLocaleDateString()}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <button
                          onClick={() => setSelectedFeedback(item)}
                          className="p-2 rounded-lg hover:bg-brand-blue/5 text-text-muted hover:text-brand-blue transition-all"
                        >
                          <Eye size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Feedback Details Modal */}
      {selectedFeedback && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-dark/40 backdrop-blur-sm" onClick={() => setSelectedFeedback(null)}>
          <div className="bg-white rounded-[2.5rem] max-w-2xl w-full p-8 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-brand-blue text-white font-bold text-lg flex items-center justify-center">
                  {selectedFeedback.user?.initials || selectedFeedback.user?.name?.split(' ').map((n: string) => n[0]).join('').toUpperCase()}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-brand-dark">{selectedFeedback.subject}</h3>
                  <p className="text-sm text-text-muted">From {selectedFeedback.user?.name}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedFeedback(null)}
                className="p-2 rounded-xl hover:bg-page-bg transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-page-bg rounded-xl p-4">
                  <p className="text-xs font-bold text-text-muted uppercase tracking-wider mb-1">Category</p>
                  <p className="text-sm font-bold text-brand-dark">{selectedFeedback.category}</p>
                </div>
                <div className="bg-page-bg rounded-xl p-4">
                  <p className="text-xs font-bold text-text-muted uppercase tracking-wider mb-1">Status</p>
                  <select
                    value={selectedFeedback.status}
                    onChange={(e) => handleStatusUpdate(selectedFeedback.id, e.target.value as FeedbackStatus)}
                    className={`text-xs font-bold px-3 py-1.5 rounded-full border border-current/10 outline-none cursor-pointer ${STATUS_COLORS[selectedFeedback.status]}`}
                  >
                    <option value="Pending">Pending</option>
                    <option value="Reviewed">Reviewed</option>
                    <option value="In_Progress">In Progress</option>
                    <option value="Resolved">Resolved</option>
                  </select>
                </div>
              </div>

              <div>
                <p className="text-xs font-bold text-text-muted uppercase tracking-wider mb-3">Message</p>
                <div className="bg-page-bg rounded-xl p-6">
                  <p className="text-sm text-brand-dark leading-relaxed whitespace-pre-wrap">{selectedFeedback.message}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 pt-4 border-t border-border-base">
                <User size={16} className="text-text-muted" />
                <span className="text-sm text-text-muted">
                  Submitted by <span className="font-bold text-brand-dark">{selectedFeedback.user?.email}</span>
                </span>
                <Clock size={16} className="text-text-muted ml-auto" />
                <span className="text-sm text-text-muted">{new Date(selectedFeedback.createdAt).toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
