import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ArrowRight, Lock, Mail, Scale } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const from = location.state?.from?.pathname || '/dashboard';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await login(email || 'user@genzura.com');
      navigate(from, { replace: true });
    } catch (error) {
      console.error('Failed to login', error);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-white">
      {/* Left Side - Form */}
      <div className="flex items-center justify-center p-8 lg:p-24 relative">
        <Link to="/" className="absolute top-8 left-8 flex items-center gap-2 text-sm font-medium text-text-muted hover:text-brand-blue transition-colors">
          <ArrowRight size={16} className="rotate-180" /> Back to site
        </Link>

        <div className="w-full max-w-md space-y-8">
          <div className="space-y-6">
            <div className="flex items-center mb-6">
              <img src="/Genzura Logo.png" alt="Genzura" className="h-24 w-auto object-contain" />
            </div>
            <div className="space-y-2">
              <h1 className="text-4xl font-bold text-brand-dark tracking-tight">Welcome back</h1>
              <p className="text-text-secondary">Enter your credentials to access your dashboard.</p>
            </div>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label className="text-sm font-bold text-brand-dark ml-1 flex items-center gap-2">
                <Mail size={14} className="text-brand-blue" /> Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                className="w-full h-14 px-4 rounded-xl border border-border-base focus:border-brand-blue outline-none transition-all bg-page-bg/50"
                placeholder="name@company.com"
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-sm font-bold text-brand-dark ml-1 flex items-center gap-2">
                  <Lock size={14} className="text-brand-blue" /> Password
                </label>
                <Link to="/forgot-password" className="text-xs font-bold text-brand-blue hover:underline">Forgot password?</Link>
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                className="w-full h-14 px-4 rounded-xl border border-border-base focus:border-brand-blue outline-none transition-all bg-page-bg/50"
                placeholder="••••••••"
              />
            </div>

            <div className="flex items-center gap-2 ml-1">
              <input type="checkbox" id="remember" className="rounded border-border-base text-brand-blue focus:ring-brand-blue" />
              <label htmlFor="remember" className="text-sm text-text-secondary">Remember me for 30 days</label>
            </div>

            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full bg-brand-blue text-white h-14 rounded-xl font-bold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
            >
              {isLoading ? 'Signing in...' : 'Sign In'} <ArrowRight size={18} />
            </button>
          </form>

          <p className="text-center text-sm text-text-secondary">
            Don't have an account? <Link to="/register" className="font-bold text-brand-blue hover:underline">Create an account</Link>
          </p>
        </div>
      </div>

      {/* Right Side - Branding */}
      <div className="hidden lg:flex bg-brand-dark relative items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-blue/30 to-transparent" />
        <div className="relative z-10 text-center p-12 space-y-8 max-w-lg">
          <div className="bg-white/10 backdrop-blur-2xl p-12 rounded-[2.5rem] border border-white/10 shadow-2xl space-y-8">
            <div className="flex justify-center items-center gap-3">
              <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-brand-blue shadow-lg">
                <Scale size={28} />
              </div>
              <span className="text-3xl font-bold text-white tracking-tighter">Genzura</span>
            </div>
            <h2 className="text-3xl font-bold text-white tracking-tight">Precision Case Management</h2>
            <p className="text-brand-light/70 leading-relaxed">
              "Genzura has fundamentally changed how our legal team operates. The clarity and control we have now is exactly what we needed."
            </p>
            <div className="pt-4">
              <p className="text-white font-bold">James Wilson</p>
              <p className="text-brand-light/50 text-sm">Head of Compliance, Apex Group</p>
            </div>
          </div>
        </div>

        {/* Abstract shapes */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-blue/20 blur-[100px] rounded-full -mr-32 -mt-32" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-brand-blue/20 blur-[100px] rounded-full -ml-32 -mb-32" />
      </div>
    </div>
  );
};

export default LoginPage;
