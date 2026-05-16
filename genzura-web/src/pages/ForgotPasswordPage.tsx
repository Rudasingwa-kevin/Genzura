import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Mail, ArrowRight, CheckCircle2, Lock } from 'lucide-react';
import apiClient from '../api/client';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setError('');
    
    setIsLoading(true);
    try {
      await apiClient.post('/auth/forgot-password', { email });
      setIsSubmitted(true);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <div className="min-h-screen flex font-sans">
      {/* Left Panel */}
      <div className="w-full lg:w-1/2 flex flex-col px-8 py-10 lg:px-24 justify-between bg-page-bg">
        <Link to="/" className="inline-block hover:opacity-80 transition-opacity w-fit">
          <img src="/Genzura website header.png" alt="Genzura" className="h-[90px] w-auto -ml-4" />
        </Link>
        
        <div className="w-full max-w-md mx-auto my-auto py-12">
          {/* Back button */}
          <Link to="/login" className="inline-flex items-center gap-2 text-sm font-semibold text-text-muted hover:text-brand-blue transition-colors mb-8 group">
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            Back to login
          </Link>

          {!isSubmitted ? (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h1 className="text-4xl font-bold text-brand-dark tracking-tight mb-3">Forgot password?</h1>
              <p className="text-text-secondary mb-10 text-lg leading-relaxed">
                No worries, we'll send you reset instructions. Please enter the email address associated with your account.
              </p>
              
              <form className="space-y-6" onSubmit={handleSubmit}>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-brand-dark ml-1 flex items-center gap-2">
                    <Mail size={14} className="text-brand-blue" /> Email Address
                  </label>
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full h-14 px-4 rounded-xl border border-border-base focus:border-brand-blue outline-none transition-all focus:ring-4 focus:ring-brand-blue/10 bg-white"
                    placeholder="name@company.com"
                    autoComplete="email"
                    autoFocus
                  />
                </div>
                
                {error && (
                  <p className="text-red-500 text-sm font-medium ml-1 animate-in fade-in">{error}</p>
                )}
                
                <button 
                  type="submit"
                  disabled={isLoading || !email}
                  className="w-full bg-brand-blue text-white h-14 rounded-xl font-bold text-lg shadow-lg shadow-brand-blue/30 hover:shadow-xl transform hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 group disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {isLoading ? 'Sending...' : 'Send reset instructions'}
                  {!isLoading && <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />}
                </button>
              </form>
            </div>
          ) : (
            <div className="animate-in zoom-in-95 duration-500 text-center py-8">
              <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                <CheckCircle2 size={40} className="text-emerald-500" />
              </div>
              <h2 className="text-3xl font-bold text-brand-dark mb-4">Check your email</h2>
              <p className="text-text-secondary text-lg mb-8 leading-relaxed">
                We've sent a password reset link to <br/><span className="font-bold text-brand-dark">{email}</span>
              </p>
              
              <div className="space-y-4">
                <button 
                  onClick={() => setIsSubmitted(false)}
                  className="text-sm font-bold text-brand-blue hover:underline"
                >
                  Didn't receive the email? Click to resend
                </button>
                <div className="pt-4 flex justify-center">
                  <Link to="/login" className="inline-flex items-center gap-2 text-sm font-bold text-text-muted hover:text-brand-dark transition-colors group">
                    <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                    Back to login
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Empty div for flex spacing */}
        <div />
      </div>

      {/* Right Side - Branding/Stats (Copied from Login/Register) */}
      <div className="hidden lg:flex w-1/2 bg-brand-blue relative flex-col items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>
        <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-br from-brand-blue via-brand-blue to-indigo-900 opacity-90"></div>
        
        <div className="relative z-10 p-12 max-w-lg text-center text-white">
          <div className="bg-white/10 backdrop-blur-md p-10 rounded-3xl border border-white/20 shadow-2xl">
            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-xl mx-auto mb-8">
              <Lock size={32} className="text-brand-blue" />
            </div>
            <h2 className="text-4xl font-bold mb-6 tracking-tight leading-tight">Secure Account Recovery</h2>
            <p className="text-blue-100 text-lg leading-relaxed italic mb-8">
              "Genzura's enterprise-grade security ensures your data remains protected at all times. We utilize state-of-the-art encryption for all account operations."
            </p>
            <div className="flex items-center justify-center gap-3">
              <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
              <p className="font-semibold text-sm tracking-wider uppercase text-blue-50">System Status: Online</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
