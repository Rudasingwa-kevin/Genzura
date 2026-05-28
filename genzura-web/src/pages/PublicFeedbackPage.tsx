import React, { useState } from 'react';
import {
  MessageSquare,
  Send,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  Bell,
  Shield,
  LogIn
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';

export default function PublicFeedbackPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState('General Suggestion');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const categories = [
    'General Suggestion',
    'Feature Request',
    'Bug Report',
    'User Experience',
    'Documentation',
    'Performance Issue',
    'Security Concern',
    'Other'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !email || !subject || !message) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);

    try {
      // Send feedback to API (public endpoint)
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/feedback/public`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, subject, category, message })
      });

      if (!response.ok) throw new Error('Failed to submit feedback');

      setName('');
      setEmail('');
      setSubject('');
      setMessage('');
      setCategory('General Suggestion');

      toast.success('Thank you! Your feedback has been submitted successfully.', {
        icon: '🚀',
        duration: 5000,
        style: {
          borderRadius: '1rem',
          background: '#1e293b',
          color: '#fff',
          fontWeight: 'bold'
        }
      });
    } catch (error) {
      toast.error('Failed to submit feedback. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-page-bg via-white to-brand-light/30">
      {/* Header */}
      <header className="border-b border-border-base bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <img
              src="/Genzura website header.png"
              alt="Genzura"
              className="h-16 w-auto object-contain hover:scale-105 transition-transform"
            />
          </Link>
          <div className="flex items-center gap-4">
            <Link
              to="/login"
              className="text-sm font-bold text-text-secondary hover:text-brand-blue transition-colors flex items-center gap-2"
            >
              <LogIn size={16} /> Sign In
            </Link>
            <Link
              to="/register"
              className="px-6 py-3 bg-brand-blue text-white rounded-xl font-bold hover:shadow-lg transition-all text-sm"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-6 py-16 space-y-12">

        {/* Hero Section */}
        <div className="text-center space-y-4 animate-in fade-in slide-in-from-top-4 duration-700">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-blue/5 border border-brand-blue/10 text-brand-blue text-[10px] font-bold uppercase tracking-widest shadow-sm">
            <Sparkles size={14} /> We Value Your Input
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-brand-dark tracking-tight">Share Your Feedback</h1>
          <p className="text-text-secondary max-w-2xl mx-auto text-lg font-medium">
            Help us improve Genzura by sharing your ideas, reporting issues, or telling us what's working well.
            Every submission is reviewed by our product team.
          </p>
        </div>

        {/* Important Notice */}
        <div className="bg-amber-50 border-l-4 border-amber-500 p-6 rounded-lg">
          <div className="flex items-start gap-3">
            <Bell className="text-amber-600 shrink-0 mt-1" size={20} />
            <div>
              <p className="text-sm font-bold text-brand-dark mb-1">Important: Email Support</p>
              <p className="text-sm text-text-secondary">
                Our system emails are automated and unmonitored. Please do not reply to system emails.
                Use this feedback form for all support requests, bug reports, and general inquiries.
              </p>
            </div>
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid lg:grid-cols-3 gap-8">

          {/* Feedback Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-[2.5rem] p-8 lg:p-10 border border-border-base shadow-lg">
              <h3 className="text-xl font-bold text-brand-dark mb-6 flex items-center gap-3">
                <div className="w-1.5 h-6 bg-brand-blue rounded-full" />
                Submit Your Feedback
              </h3>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest ml-1">Your Name *</label>
                    <input
                      type="text"
                      placeholder="John Doe"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full h-14 px-5 rounded-2xl bg-page-bg border border-transparent focus:bg-white focus:border-brand-blue outline-none transition-all font-bold text-brand-dark"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest ml-1">Email Address *</label>
                    <input
                      type="email"
                      placeholder="john@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full h-14 px-5 rounded-2xl bg-page-bg border border-transparent focus:bg-white focus:border-brand-blue outline-none transition-all font-bold text-brand-dark"
                      required
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest ml-1">Category</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full h-14 px-5 rounded-2xl bg-page-bg border border-transparent focus:bg-white focus:border-brand-blue outline-none transition-all font-bold text-brand-dark appearance-none cursor-pointer"
                    >
                      {categories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest ml-1">Subject *</label>
                    <input
                      type="text"
                      placeholder="Brief title of your feedback"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      className="w-full h-14 px-5 rounded-2xl bg-page-bg border border-transparent focus:bg-white focus:border-brand-blue outline-none transition-all font-bold text-brand-dark"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest ml-1">Message *</label>
                  <textarea
                    rows={8}
                    placeholder="Describe your idea or the issue you encountered in detail..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full p-6 rounded-2xl bg-page-bg border border-transparent focus:bg-white focus:border-brand-blue outline-none transition-all font-medium text-brand-dark resize-none"
                    required
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
                  We typically respond within 48 business hours
                </p>
              </form>
            </div>
          </div>

          {/* Side Information */}
          <div className="space-y-6">
            {/* What We Accept */}
            <div className="bg-white rounded-2xl p-6 border border-border-base shadow-sm">
              <h4 className="text-sm font-bold text-brand-dark mb-4 uppercase tracking-wider">What We Accept</h4>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="text-brand-green shrink-0 mt-0.5" size={16} />
                  <span className="text-sm text-text-secondary">Feature requests & suggestions</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="text-brand-green shrink-0 mt-0.5" size={16} />
                  <span className="text-sm text-text-secondary">Bug reports & technical issues</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="text-brand-green shrink-0 mt-0.5" size={16} />
                  <span className="text-sm text-text-secondary">User experience improvements</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="text-brand-green shrink-0 mt-0.5" size={16} />
                  <span className="text-sm text-text-secondary">General comments & testimonials</span>
                </li>
              </ul>
            </div>

            {/* Have an Account */}
            <div className="bg-gradient-to-br from-brand-blue to-brand-dark rounded-2xl p-6 text-white">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-4">
                <Shield size={24} />
              </div>
              <h4 className="font-bold text-lg mb-2">Have an Account?</h4>
              <p className="text-sm text-white/80 mb-4">
                Sign in to access your feedback history and track the status of your submissions.
              </p>
              <Link
                to="/login"
                className="w-full py-3 bg-white text-brand-blue rounded-xl font-bold text-sm hover:shadow-lg transition-all flex items-center justify-center gap-2 no-underline"
              >
                Sign In <ArrowRight size={16} />
              </Link>
            </div>

            {/* Privacy Note */}
            <div className="bg-page-bg rounded-2xl p-6 border border-border-base">
              <h4 className="text-xs font-bold text-text-muted uppercase tracking-wider mb-3">Privacy Notice</h4>
              <p className="text-xs text-text-secondary leading-relaxed">
                Your feedback is used solely to improve Genzura. We will never share your contact information with third parties.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-border-base py-12 bg-white mt-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-text-muted">
              &copy; 2026 Genzura Inc. All rights reserved.
            </p>
            <div className="flex gap-6">
              <Link to="/" className="text-sm text-text-muted hover:text-brand-blue transition-colors">Home</Link>
              <Link to="/login" className="text-sm text-text-muted hover:text-brand-blue transition-colors">Sign In</Link>
              <Link to="/register" className="text-sm font-bold text-brand-blue hover:underline">Start Free Trial</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
