import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Lock, ArrowRight, CheckCircle2 } from 'lucide-react';

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }
    
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    
    setIsLoading(true);
    // Simulate API call to reset password
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsLoading(false);
    setIsSubmitted(true);
    
    // Auto-redirect to login after success
    setTimeout(() => {
      navigate('/login');
    }, 3000);
  };

  return (
    <div className="min-h-screen flex font-sans">
      {/* Left Panel */}
      <div className="w-full lg:w-1/2 flex flex-col px-8 py-10 lg:px-24 justify-between bg-page-bg">
        <Link to="/" className="inline-block hover:opacity-80 transition-opacity w-fit">
          <img src="/Genzura website header.png" alt="Genzura" className="h-[90px] w-auto -ml-4" />
        </Link>
        
        <div className="w-full max-w-md mx-auto my-auto py-12">
          {!isSubmitted ? (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h1 className="text-4xl font-bold text-brand-dark tracking-tight mb-3">Set new password</h1>
              <p className="text-text-secondary mb-10 text-lg leading-relaxed">
                Your new password must be different from previously used passwords.
              </p>
              
              <form className="space-y-6" onSubmit={handleSubmit}>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-brand-dark ml-1 flex items-center gap-2">
                    <Lock size={14} className="text-brand-blue" /> New Password
                  </label>
                  <input 
                    type="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full h-14 px-4 rounded-xl border border-border-base focus:border-brand-blue outline-none transition-all focus:ring-4 focus:ring-brand-blue/10 bg-white"
                    placeholder="At least 8 characters"
                    autoComplete="new-password"
                    autoFocus
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-bold text-brand-dark ml-1 flex items-center gap-2">
                    <Lock size={14} className="text-brand-blue" /> Confirm Password
                  </label>
                  <input 
                    type="password" 
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className={`w-full h-14 px-4 rounded-xl border outline-none transition-all focus:ring-4 focus:ring-brand-blue/10 bg-white ${
                      error ? 'border-red-400 focus:border-red-500 focus:ring-red-500/10' : 'border-border-base focus:border-brand-blue'
                    }`}
                    placeholder="Must match new password"
                    autoComplete="new-password"
                  />
                  {error && (
                    <p className="text-red-500 text-sm font-medium ml-1 mt-1 animate-in fade-in">{error}</p>
                  )}
                </div>
                
                <button 
                  type="submit"
                  disabled={isLoading || !password || !confirmPassword}
                  className="w-full bg-brand-blue text-white h-14 rounded-xl font-bold text-lg shadow-lg shadow-brand-blue/30 hover:shadow-xl transform hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 group disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none mt-8"
                >
                  {isLoading ? 'Resetting password...' : 'Reset password'}
                  {!isLoading && <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />}
                </button>
              </form>
            </div>
          ) : (
            <div className="animate-in zoom-in-95 duration-500 text-center py-8">
              <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                <CheckCircle2 size={40} className="text-emerald-500" />
              </div>
              <h2 className="text-3xl font-bold text-brand-dark mb-4">Password reset</h2>
              <p className="text-text-secondary text-lg mb-8 leading-relaxed">
                Your password has been successfully reset. <br/>You will be redirected to the login page shortly.
              </p>
              
              <div className="pt-4 flex justify-center">
                <Link to="/login" className="inline-flex items-center gap-2 text-sm font-bold text-brand-blue hover:underline group">
                  Continue to login
                  <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          )}
        </div>
        
        {/* Empty div for flex spacing */}
        <div />
      </div>

      {/* Right Side - Branding/Stats */}
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
