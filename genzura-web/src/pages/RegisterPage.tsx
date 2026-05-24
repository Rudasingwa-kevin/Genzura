import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { ArrowLeft, User, Mail, Lock, Building, ShieldCheck, ArrowRight, Eye, EyeOff, CheckCircle2, XCircle, AlertCircle, Phone, Send, CheckCheck } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-hot-toast';
import { authService } from '../api/services/auth.service';

// Password strength calculator
const calculatePasswordStrength = (password: string) => {
  let score = 0;
  const feedback: string[] = [];

  if (password.length === 0) return { score: 0, label: '', color: '', feedback: [] };
  if (password.length < 8) return { score: 0, label: 'Too Short', color: 'bg-red-500', feedback: ['At least 8 characters required'] };

  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[^a-zA-Z0-9]/.test(password)) score++;

  // Penalize common patterns
  if (/^password/i.test(password) || /^123456/.test(password) || /^qwerty/i.test(password)) {
    score = Math.max(0, score - 2);
    feedback.push('Avoid common patterns');
  }

  const labels = ['Weak', 'Fair', 'Good', 'Strong'];
  const colors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-emerald-500'];

  return {
    score: Math.min(score, 4),
    label: labels[Math.min(score - 1, 3)] || 'Weak',
    color: colors[Math.min(score - 1, 3)] || 'bg-red-500',
    feedback
  };
};

// Email validation
const validateEmail = (email: string) => {
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  return emailRegex.test(email);
};

const RegisterPage = () => {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [organization, setOrganization] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [emailTouched, setEmailTouched] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);
  const [confirmPasswordTouched, setConfirmPasswordTouched] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(calculatePasswordStrength(''));
  const [termsAccepted, setTermsAccepted] = useState(false);

  // OTP verification states
  const [showOtpVerification, setShowOtpVerification] = useState(false);
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);

  useEffect(() => {
    setPasswordStrength(calculatePasswordStrength(password));
  }, [password]);

  const isEmailValid = validateEmail(email);
  const isPasswordStrong = passwordStrength.score >= 3;
  const doPasswordsMatch = password === confirmPassword && confirmPassword.length > 0;

  const handleSendOtp = async () => {
    if (!isEmailValid) {
      toast.error('Please enter a valid email address');
      return;
    }

    setIsSendingOtp(true);
    try {
      const response = await authService.sendOtp(email.trim().toLowerCase());

      setOtpSent(true);
      setShowOtpVerification(true);

      // Show success message
      toast.success('Verification code sent to your email! Please check your inbox.');

      // Additional message about checking spam
      setTimeout(() => {
        toast('Check your spam folder if you don\'t see the email', {
          icon: '📧',
          duration: 5000
        });
      }, 2000);
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Failed to send verification code';
      toast.error(errorMessage);
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (otp.length !== 6) {
      toast.error('Please enter the 6-digit verification code');
      return;
    }

    setIsVerifyingOtp(true);
    try {
      await authService.verifyOtp(email.trim().toLowerCase(), otp);

      setEmailVerified(true);
      setShowOtpVerification(false);
      setOtp('');
      toast.success('Email verified successfully!');
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Invalid verification code';
      toast.error(errorMessage);
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Mark fields as touched
    setEmailTouched(true);
    setPasswordTouched(true);
    setConfirmPasswordTouched(true);

    // Validation
    if (!firstName.trim() || !lastName.trim()) {
      toast.error('Please enter your full name');
      return;
    }

    if (!isEmailValid) {
      toast.error('Please enter a valid email address');
      return;
    }

    if (!emailVerified) {
      toast.error('Please verify your email address');
      return;
    }

    if (!phone.trim()) {
      toast.error('Please enter your phone number');
      return;
    }

    if (!isPasswordStrong) {
      toast.error('Please use a stronger password');
      return;
    }

    if (!doPasswordsMatch) {
      toast.error('Passwords do not match');
      return;
    }

    if (!termsAccepted) {
      toast.error('Please accept the Terms of Service and Privacy Policy');
      return;
    }

    setIsLoading(true);
    try {
      const response = await register({
        name: `${firstName.trim()} ${lastName.trim()}`,
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        organization: organization.trim(),
        password
      });

      // Show warnings if any
      if (response?.warnings && response.warnings.length > 0) {
        response.warnings.forEach((warning: string) => toast(warning, { icon: '⚠️' }));
      }

      toast.success('Account created successfully!');
      navigate('/dashboard', { replace: true });
    } catch (error: any) {
      console.error('Failed to register', error);
      const errorMessage = error.response?.data?.error || 'Failed to create account';

      // Show password strength feedback if available
      if (error.response?.data?.passwordStrength) {
        const strength = error.response.data.passwordStrength;
        if (strength.feedback && strength.feedback.length > 0) {
          toast.error(`Password issue: ${strength.feedback.join(', ')}`);
        } else {
          toast.error(errorMessage);
        }
      } else {
        toast.error(errorMessage);
      }

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
                <Mail size={14} className="text-brand-blue" /> Email Address *
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onBlur={() => setEmailTouched(true)}
                  autoComplete="email"
                  required
                  disabled={emailVerified}
                  className={`w-full h-12 pl-4 pr-24 rounded-xl border outline-none transition-all bg-page-bg/50 ${
                    emailVerified
                      ? 'border-emerald-500 bg-emerald-50'
                      : emailTouched
                      ? isEmailValid
                        ? 'border-emerald-500 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20'
                        : 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20'
                      : 'border-border-base focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20'
                  }`}
                  placeholder="name@company.com"
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2">
                  {emailVerified ? (
                    <div className="flex items-center gap-1 text-emerald-600 text-xs font-bold">
                      <CheckCheck size={18} />
                      Verified
                    </div>
                  ) : isEmailValid && !otpSent ? (
                    <button
                      type="button"
                      onClick={handleSendOtp}
                      disabled={isSendingOtp}
                      className="px-3 py-1.5 bg-brand-blue text-white rounded-lg text-xs font-bold hover:bg-brand-blue/90 transition-colors flex items-center gap-1"
                    >
                      {isSendingOtp ? 'Sending...' : (
                        <>
                          <Send size={12} /> Verify
                        </>
                      )}
                    </button>
                  ) : emailTouched && email && (
                    <>
                      {isEmailValid ? (
                        <CheckCircle2 size={18} className="text-emerald-500" />
                      ) : (
                        <XCircle size={18} className="text-red-500" />
                      )}
                    </>
                  )}
                </div>
              </div>
              {emailTouched && email && !isEmailValid && (
                <p className="text-xs text-red-500 ml-1 flex items-center gap-1">
                  <AlertCircle size={12} /> Please enter a valid email address
                </p>
              )}
              {emailVerified && (
                <p className="text-xs text-emerald-600 ml-1 flex items-center gap-1">
                  <CheckCircle2 size={12} /> Email verified successfully
                </p>
              )}
            </div>

            {/* OTP Verification Modal */}
            {showOtpVerification && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl">
                  <h3 className="text-2xl font-bold text-brand-dark mb-2">Verify Your Email</h3>
                  <p className="text-sm text-text-secondary mb-6">
                    We've sent a 6-digit verification code to <span className="font-bold text-brand-blue">{email}</span>.
                    Please check your email inbox (and spam folder).
                  </p>

                  <div className="space-y-4">
                    <input
                      type="text"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      maxLength={6}
                      placeholder="000000"
                      className="w-full h-14 px-4 text-center text-2xl tracking-widest rounded-xl border-2 border-border-base focus:border-brand-blue outline-none transition-all"
                    />

                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() => setShowOtpVerification(false)}
                        className="flex-1 py-3 rounded-xl border-2 border-border-base text-brand-dark font-bold hover:bg-page-bg transition-all"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={handleVerifyOtp}
                        disabled={otp.length !== 6 || isVerifyingOtp}
                        className="flex-1 py-3 rounded-xl bg-brand-blue text-white font-bold hover:bg-brand-blue/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                      >
                        {isVerifyingOtp ? 'Verifying...' : 'Verify'}
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={handleSendOtp}
                      disabled={isSendingOtp}
                      className="w-full text-sm text-brand-blue hover:underline font-medium"
                    >
                      {isSendingOtp ? 'Resending...' : 'Resend code'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-bold text-brand-dark ml-1 flex items-center gap-2">
                <Phone size={14} className="text-brand-blue" /> Phone Number *
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                autoComplete="tel"
                required
                className="w-full h-12 px-4 rounded-xl border border-border-base focus:border-brand-blue outline-none transition-all bg-page-bg/50"
                placeholder="+250 788 000 000"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-brand-dark ml-1 flex items-center gap-2">
                <Building size={14} className="text-brand-blue" /> Organization Name (Optional)
              </label>
              <input
                type="text"
                value={organization}
                onChange={(e) => setOrganization(e.target.value)}
                autoComplete="organization"
                className="w-full h-12 px-4 rounded-xl border border-border-base focus:border-brand-blue outline-none transition-all bg-page-bg/50"
                placeholder="Apex Legal Group"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-brand-dark ml-1 flex items-center gap-2">
                <Lock size={14} className="text-brand-blue" /> Password *
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onBlur={() => setPasswordTouched(true)}
                  autoComplete="new-password"
                  required
                  className={`w-full h-12 pl-4 pr-12 rounded-xl border outline-none transition-all bg-page-bg/50 ${
                    passwordTouched && password
                      ? passwordStrength.score >= 3
                        ? 'border-emerald-500 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20'
                        : 'border-orange-500 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20'
                      : 'border-border-base focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20'
                  }`}
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

              {/* Password Strength Indicator */}
              {password && (
                <div className="space-y-2 mt-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-text-muted font-medium">Password Strength</span>
                    <span className={`font-bold ${passwordStrength.score >= 3 ? 'text-emerald-600' : 'text-orange-600'}`}>
                      {passwordStrength.label}
                    </span>
                  </div>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4].map((level) => (
                      <div
                        key={level}
                        className={`h-1.5 flex-1 rounded-full transition-all ${
                          level <= passwordStrength.score ? passwordStrength.color : 'bg-gray-200'
                        }`}
                      />
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-2 text-xs">
                    {[
                      { label: '8+ chars', check: password.length >= 8 },
                      { label: 'Uppercase', check: /[A-Z]/.test(password) },
                      { label: 'Lowercase', check: /[a-z]/.test(password) },
                      { label: 'Number', check: /\d/.test(password) },
                      { label: 'Special', check: /[^a-zA-Z0-9]/.test(password) },
                    ].map((req) => (
                      <span
                        key={req.label}
                        className={`flex items-center gap-1 px-2 py-0.5 rounded-md ${
                          req.check ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-500'
                        }`}
                      >
                        {req.check ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                        {req.label}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-brand-dark ml-1 flex items-center gap-2">
                <Lock size={14} className="text-brand-blue" /> Confirm Password *
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  onBlur={() => setConfirmPasswordTouched(true)}
                  autoComplete="new-password"
                  required
                  className={`w-full h-12 pl-4 pr-12 rounded-xl border outline-none transition-all bg-page-bg/50 ${
                    confirmPasswordTouched && confirmPassword
                      ? doPasswordsMatch
                        ? 'border-emerald-500 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20'
                        : 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20'
                      : 'border-border-base focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20'
                  }`}
                  placeholder="Re-enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted hover:text-brand-blue transition-colors"
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {confirmPasswordTouched && confirmPassword && (
                <p className={`text-xs ml-1 flex items-center gap-1 ${doPasswordsMatch ? 'text-emerald-600' : 'text-red-500'}`}>
                  {doPasswordsMatch ? (
                    <>
                      <CheckCircle2 size={12} /> Passwords match
                    </>
                  ) : (
                    <>
                      <AlertCircle size={12} /> Passwords do not match
                    </>
                  )}
                </p>
              )}
            </div>

            <div className="flex items-start gap-2 ml-1 pt-2">
              <input
                type="checkbox"
                id="terms"
                checked={termsAccepted}
                onChange={(e) => setTermsAccepted(e.target.checked)}
                required
                className="mt-1 rounded border-border-base text-brand-blue focus:ring-brand-blue cursor-pointer"
              />
              <label htmlFor="terms" className="text-sm text-text-secondary leading-tight cursor-pointer">
                I agree to the <Link to="/legal/terms" className="font-bold text-brand-blue hover:underline" target="_blank" rel="noopener noreferrer">Terms of Service</Link> and <Link to="/legal/privacy" className="font-bold text-brand-blue hover:underline" target="_blank" rel="noopener noreferrer">Privacy Policy</Link>. *
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
