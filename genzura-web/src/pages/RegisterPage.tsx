import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { ArrowLeft, User, Mail, Lock, Building, ShieldCheck, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-hot-toast';

const RegisterPage = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await register({
        name: `${firstName} ${lastName}`,
        email,
        password
      });
      toast.success('Account created successfully!');
      navigate('/dashboard', { replace: true });
    } catch (error: any) {
      console.error('Failed to register', error);
      toast.error(error.response?.data?.error || 'Failed to create account');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-white font-sans">
      {/* Left Side - Form */}
      <div className="flex items-center justify-center p-8 lg:p-24 relative overflow-y-auto">
        <Link to="/" className="absolute top-8 left-8 flex items-center gap-2 text-sm font-medium text-text-muted hover:text-brand-blue transition-colors no-underline">
          <ArrowLeft size={16} /> Back to site
        </Link>

        <div className="w-full max-w-md space-y-8 py-12">
          <div className="space-y-6">
            <div className="flex items-center mb-6">
              <img src="/Genzura Logo.png" alt="Genzura" className="h-24 w-auto object-contain" />
            </div>
            <div className="space-y-2">
              <h1 className="text-4xl font-bold text-brand-dark tracking-tight">Join Genzura</h1>
              <p className="text-text-secondary">Start your 14-day free trial. No credit card required.</p>
            </div>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-bold text-brand-dark ml-1 flex items-center gap-2">
                  <User size={14} className="text-brand-blue" /> First Name
                </label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  autoComplete="given-name"
                  className="w-full h-12 px-4 rounded-xl border border-border-base focus:border-brand-blue outline-none transition-all bg-page-bg/50"
                  placeholder="John"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-brand-dark ml-1 flex items-center gap-2">
                  Last Name
                </label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  autoComplete="family-name"
                  className="w-full h-12 px-4 rounded-xl border border-border-base focus:border-brand-blue outline-none transition-all bg-page-bg/50"
                  placeholder="Doe"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-brand-dark ml-1 flex items-center gap-2">
                <Building size={14} className="text-brand-blue" /> Organization Name
              </label>
              <input
                type="text"
                autoComplete="organization"
                className="w-full h-12 px-4 rounded-xl border border-border-base focus:border-brand-blue outline-none transition-all bg-page-bg/50"
                placeholder="Apex Legal Group"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-brand-dark ml-1 flex items-center gap-2">
                <Mail size={14} className="text-brand-blue" /> Corporate Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                className="w-full h-12 px-4 rounded-xl border border-border-base focus:border-brand-blue outline-none transition-all bg-page-bg/50"
                placeholder="name@company.com"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-brand-dark ml-1 flex items-center gap-2">
                <Lock size={14} className="text-brand-blue" /> Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="new-password"
                  className="w-full h-12 pl-4 pr-12 rounded-xl border border-border-base focus:border-brand-blue outline-none transition-all bg-page-bg/50"
                  placeholder="At least 8 characters"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted hover:text-brand-blue transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="flex items-start gap-2 ml-1 pt-2">
              <input type="checkbox" id="terms" className="mt-1 rounded border-border-base text-brand-blue focus:ring-brand-blue" />
              <label htmlFor="terms" className="text-sm text-text-secondary leading-tight">
                I agree to the <Link to="/legal/terms" className="font-bold text-brand-blue hover:underline" target="_blank" rel="noopener noreferrer">Terms of Service</Link> and <Link to="/legal/privacy" className="font-bold text-brand-blue hover:underline" target="_blank" rel="noopener noreferrer">Privacy Policy</Link>.
              </label>
            </div>

            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full bg-brand-blue text-white h-14 rounded-xl font-bold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 mt-4"
            >
              {isLoading ? 'Creating Account...' : 'Create My Account'} <ArrowRight size={18} />
            </button>
          </form>

          <p className="text-center text-sm text-text-secondary">
            Already have an account? <Link to="/login" className="font-bold text-brand-blue hover:underline">Sign in</Link>
          </p>
        </div>
      </div>

      {/* Right Side - Branding/Stats */}
      <div className="hidden lg:flex bg-page-bg relative items-center justify-center overflow-hidden border-l border-border-base">
        <div className="relative z-10 p-12 space-y-12 max-w-lg">
          <div className="space-y-6">
            <div className="w-16 h-16 bg-brand-blue rounded-2xl flex items-center justify-center shadow-xl mb-8">
              <ShieldCheck size={32} className="text-white" />
            </div>
            <h2 className="text-4xl font-bold text-brand-dark tracking-tight">Built for Scale and Security</h2>
            <p className="text-text-secondary text-lg leading-relaxed">
              Genzura is the industry standard for high-fidelity case management. Join over 5,000 professionals who trust our platform daily.
            </p>
          </div>

          <div className="grid gap-6">
            <div className="bg-white p-6 rounded-2xl border border-border-base shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 bg-brand-light rounded-xl flex items-center justify-center text-brand-blue">
                <ShieldCheck size={24} />
              </div>
              <div>
                <p className="font-bold text-brand-dark">ISO 27001 Certified</p>
                <p className="text-sm text-text-muted">Enterprise-grade security standards</p>
              </div>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-border-base shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 bg-brand-light rounded-xl flex items-center justify-center text-brand-blue">
                <Building size={24} />
              </div>
              <div>
                <p className="font-bold text-brand-dark">99.9% Uptime SLA</p>
                <p className="text-sm text-text-muted">Reliable performance you can count on</p>
              </div>
            </div>
          </div>
        </div>

        {/* Background elements */}
        <div className="absolute top-0 right-0 w-full h-full opacity-[0.03] pointer-events-none">
          <div className="grid grid-cols-10 gap-8 rotate-12 -translate-y-20">
            {Array.from({ length: 100 }).map((_, i) => (
              <div key={i} className="w-24 h-24 border border-brand-dark rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
