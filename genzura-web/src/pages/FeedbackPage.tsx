import { useState, useEffect } from 'react';
import { 
  MessageSquare, 
  Send, 
  History, 
  Sparkles, 
  AlertCircle, 
  CheckCircle2, 
  Clock,
  ArrowRight
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import AppLayout from '../components/AppLayout';
import { 
  FEEDBACK_CATEGORIES, 
  STATUS_COLORS,
  type FeedbackCategory 
} from '../data/feedback';
import { feedbackService } from '../api/services/feedback.service';

export default function FeedbackPage() {
  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState<FeedbackCategory>('General Suggestion');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [history, setHistory] = useState<any[]>([]);

  const fetchHistory = async () => {
    try {
      const data = await feedbackService.getMyFeedback();
      setHistory(data);
    } catch (error) {
      console.error('Failed to fetch feedback history', error);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject || !message) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);

    try {
      await feedbackService.submitFeedback({
        subject,
        category,
        message
      });
      
      setSubject('');
      setMessage('');
      setCategory('General Suggestion');
      fetchHistory();
      
      toast.success('Feedback submitted! The system owner will review it soon.', {
        icon: '🚀',
        style: {
          borderRadius: '1rem',
          background: '#1e293b',
          color: '#fff',
          fontWeight: 'bold'
        }
      });
    } catch (error) {
      toast.error('Failed to submit feedback');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AppLayout title="Feedback & Suggestions">
      <div className="max-w-6xl mx-auto space-y-12 pb-20">
        
        {/* Hero Section */}
        <div className="text-center space-y-4 animate-in fade-in slide-in-from-top-4 duration-700">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-blue/5 border border-brand-blue/10 text-brand-blue text-[10px] font-bold uppercase tracking-widest shadow-sm">
            <Sparkles size={14} /> Shape the Future of Genzura
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-brand-dark tracking-tight">Your Voice Matters</h1>
          <p className="text-text-secondary max-w-2xl mx-auto text-lg font-medium">
            Have an idea for a new feature? Found a bug? Or just want to share your opinion? 
            Our product team reviews every single submission.
          </p>
        </div>

        <div className="grid lg:grid-cols-5 gap-10 items-start">
          
          {/* Submission Form */}
          <div className="lg:col-span-3 space-y-8 animate-in-up">
            <div className="glass-card rounded-[2.5rem] p-10 border border-border-base shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-10 opacity-[0.03] pointer-events-none group-hover:scale-110 transition-transform duration-1000">
                <MessageSquare size={200} />
              </div>
              
              <h3 className="text-xl font-bold text-brand-dark mb-8 flex items-center gap-3">
                <div className="w-1.5 h-6 bg-brand-blue rounded-full" />
                New Feedback
              </h3>

              <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest ml-1">Category</label>
                    <select 
                      value={category}
                      onChange={(e) => setCategory(e.target.value as FeedbackCategory)}
                      className="w-full h-14 px-5 rounded-2xl bg-page-bg border border-transparent focus:bg-white focus:border-brand-blue outline-none transition-all font-bold text-brand-dark appearance-none cursor-pointer"
                    >
                      {FEEDBACK_CATEGORIES.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest ml-1">Subject</label>
                    <input 
                      type="text"
                      placeholder="Brief title of your feedback"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      className="w-full h-14 px-5 rounded-2xl bg-page-bg border border-transparent focus:bg-white focus:border-brand-blue outline-none transition-all font-bold text-brand-dark"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest ml-1">Message</label>
                  <textarea 
                    rows={6}
                    placeholder="Describe your idea or the issue you encountered in detail..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full p-6 rounded-2xl bg-page-bg border border-transparent focus:bg-white focus:border-brand-blue outline-none transition-all font-medium text-brand-dark resize-none"
                  />
                </div>

                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="w-full h-16 bg-brand-blue text-white rounded-2xl font-bold shadow-xl shadow-brand-blue/20 hover:shadow-2xl hover:-translate-y-1 transition-all active:scale-95 flex items-center justify-center gap-3 disabled:opacity-70 disabled:translate-y-0"
                >
                  {isSubmitting ? (
                    <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      Submit Feedback <Send size={20} />
                    </>
                  )}
                </button>

                <p className="text-[10px] text-text-muted text-center font-medium opacity-60 uppercase tracking-widest pt-2">
                  Responses are typically handled within 48 business hours
                </p>
              </form>
            </div>
          </div>

          {/* History / Status Side */}
          <div className="lg:col-span-2 space-y-8 animate-in-right">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-brand-dark uppercase tracking-[0.2em] flex items-center gap-2">
                  <History size={16} className="text-brand-blue" /> Previous Submissions
                </h3>
                <span className="text-[10px] font-bold text-text-muted bg-page-bg px-2.5 py-1 rounded-lg">
                  {history.length} Total
                </span>
              </div>

              <div className="space-y-4">
                {history.map((item, idx) => (
                  <div 
                    key={item.id} 
                    className="glass-card rounded-3xl p-6 border border-border-base hover:border-brand-blue/30 transition-all group animate-in-up"
                    style={{ animationDelay: `${idx * 100}ms` }}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="space-y-1">
                        <span className="text-[9px] font-black text-brand-blue/60 uppercase tracking-widest">{item.id}</span>
                        <h4 className="font-bold text-brand-dark text-sm group-hover:text-brand-blue transition-colors truncate max-w-[180px]">
                          {item.subject}
                        </h4>
                      </div>
                      <span className={`text-[9px] font-bold uppercase px-2.5 py-1 rounded-full border border-current/10 ${STATUS_COLORS[item.status]}`}>
                        {item.status}
                      </span>
                    </div>
                    
                    <p className="text-xs text-text-secondary line-clamp-2 mb-4 font-medium leading-relaxed">
                      {item.message}
                    </p>

                    <div className="flex items-center justify-between pt-4 border-t border-border-base/50">
                      <div className="flex items-center gap-2 text-text-muted">
                        <Clock size={12} />
                        <span className="text-[10px] font-bold">{new Date(item.createdAt).toLocaleDateString()}</span>
                      </div>
                      <div className="text-[10px] font-bold text-text-muted uppercase tracking-wider flex items-center gap-1 group-hover:text-brand-blue transition-colors cursor-pointer">
                        Details <ArrowRight size={12} />
                      </div>
                    </div>
                  </div>
                ))}

                {history.length === 0 && (
                  <div className="text-center py-12 px-6 border-2 border-dashed border-border-base rounded-[2.5rem]">
                    <div className="w-16 h-16 bg-page-bg rounded-full flex items-center justify-center mx-auto mb-4 text-text-muted">
                      <MessageSquare size={24} />
                    </div>
                    <p className="text-sm font-bold text-brand-dark">No feedback yet</p>
                    <p className="text-xs text-text-muted mt-1">Start by filling out the form on the left.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Support Card */}
            <div className="bg-brand-dark rounded-[2rem] p-8 text-white relative overflow-hidden group shadow-2xl">
              <div className="absolute -right-6 -bottom-6 opacity-10 group-hover:scale-125 transition-transform duration-1000 rotate-12">
                <AlertCircle size={140} />
              </div>
              <div className="relative z-10 space-y-6">
                <div>
                  <h4 className="font-bold text-lg mb-2">Need urgent help?</h4>
                  <p className="text-sm text-white/60 font-medium">If you are experiencing a system-wide outage, please contact our emergency support line.</p>
                </div>
                <button className="w-full py-4 bg-white/10 hover:bg-white text-white hover:text-brand-dark rounded-2xl font-bold text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2">
                  <CheckCircle2 size={16} /> Contact Support
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
