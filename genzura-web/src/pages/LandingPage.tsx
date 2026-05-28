import React from 'react';
import {
  ShieldCheck,
  Scale,
  BarChart3,
  Clock,
  ChevronRight,
  CheckCircle2,
  ArrowRight,
  Menu,
  X,
  FileText,
  Users,
  Calendar,
  Zap,
  TrendingUp,
  Lock,
  Bell,
  FolderOpen,
  Sparkles
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Add animation styles
const animationStyles = `
  @keyframes float {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-20px); }
  }

  @keyframes slideInUp {
    from {
      opacity: 0;
      transform: translateY(30px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes slideInLeft {
    from {
      opacity: 0;
      transform: translateX(-30px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }

  @keyframes slideInRight {
    from {
      opacity: 0;
      transform: translateX(30px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }

  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  @keyframes scaleIn {
    from {
      opacity: 0;
      transform: scale(0.9);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
  }

  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }

  @keyframes shimmer {
    0% { background-position: -1000px 0; }
    100% { background-position: 1000px 0; }
  }

  @keyframes bounce-slow {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-10px); }
  }

  @keyframes bounce {
    0%, 100% {
      transform: translateY(0);
    }
    10%, 30%, 50%, 70%, 90% {
      transform: translateY(-8px);
    }
    20%, 40%, 60%, 80% {
      transform: translateY(0);
    }
  }

  @keyframes rotate {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }

  .animate-float {
    animation: float 6s ease-in-out infinite;
  }

  .animate-slide-up {
    animation: slideInUp 0.6s ease-out forwards;
  }

  .animate-slide-left {
    animation: slideInLeft 0.6s ease-out forwards;
  }

  .animate-slide-right {
    animation: slideInRight 0.6s ease-out forwards;
  }

  .animate-fade-in {
    animation: fadeIn 0.8s ease-out forwards;
  }

  .animate-scale-in {
    animation: scaleIn 0.5s ease-out forwards;
  }

  .animate-pulse-slow {
    animation: pulse 3s ease-in-out infinite;
  }

  .animate-shimmer {
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
    background-size: 1000px 100%;
    animation: shimmer 2s infinite;
  }

  .animate-bounce-slow {
    animation: bounce-slow 2s ease-in-out infinite;
  }

  .animate-bounce {
    animation: bounce 1s ease-in-out;
  }

  .animate-rotate {
    animation: rotate 20s linear infinite;
  }

  .stagger-1 { animation-delay: 0.1s; }
  .stagger-2 { animation-delay: 0.2s; }
  .stagger-3 { animation-delay: 0.3s; }
  .stagger-4 { animation-delay: 0.4s; }
  .stagger-5 { animation-delay: 0.5s; }
  .stagger-6 { animation-delay: 0.6s; }

  .hover-lift {
    transition: transform 0.3s ease, box-shadow 0.3s ease;
  }

  .hover-lift:hover {
    transform: translateY(-8px);
    box-shadow: 0 20px 40px rgba(0,0,0,0.15);
  }
`;

// Add style tag to document
if (typeof document !== 'undefined') {
  const styleTag = document.createElement('style');
  styleTag.innerHTML = animationStyles;
  document.head.appendChild(styleTag);
}

const Navbar = () => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [logoKey, setLogoKey] = React.useState(0);

  const handleLogoClick = () => {
    // Trigger bounce animation on click
    setLogoKey(prev => prev + 1);
  };

  return (
    <nav className="fixed top-0 w-full z-50 bg-white/95 backdrop-blur-sm border-b border-black/5 shadow-sm">
      <div className="max-w-7xl mx-auto px-6 h-[120px] flex items-center justify-between">
        <div className="flex items-center">
          <Link to="/" onClick={handleLogoClick} className="block">
            <img
              key={logoKey}
              src="/Genzura website header.png"
              alt="Genzura"
              className="h-24 w-auto object-contain cursor-pointer hover:scale-110 transition-transform animate-bounce"
            />
          </Link>
        </div>

        <div className="hidden md:flex items-center gap-8">
          <a href="#features" className="text-sm font-medium text-text-secondary hover:text-brand-blue transition-colors">Features</a>
          <Link to="/pricing" className="text-sm font-medium text-text-secondary hover:text-brand-blue transition-colors">Pricing</Link>
          <a href="#how-it-works" className="text-sm font-medium text-text-secondary hover:text-brand-blue transition-colors">How It Works</a>
          <a href="#testimonials" className="text-sm font-medium text-text-secondary hover:text-brand-blue transition-colors">Reviews</a>
          <Link to="/login" className="text-sm font-medium text-text-secondary hover:text-brand-blue transition-colors">Sign in</Link>
          <Link to="/register" className="bg-brand-blue text-white btn-premium py-2 px-6 text-sm no-underline">
            Start Free Trial
          </Link>
        </div>

        <button className="md:hidden" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X /> : <Menu />}
        </button>
      </div>

      {isOpen && (
        <div className="md:hidden bg-white border-b p-6 flex flex-col gap-4 animate-in slide-in-from-top duration-300">
          <a href="#features" className="font-medium" onClick={() => setIsOpen(false)}>Features</a>
          <Link to="/pricing" className="font-medium" onClick={() => setIsOpen(false)}>Pricing</Link>
          <a href="#how-it-works" className="font-medium" onClick={() => setIsOpen(false)}>How It Works</a>
          <a href="#testimonials" className="font-medium" onClick={() => setIsOpen(false)}>Reviews</a>
          <Link to="/login" className="font-medium" onClick={() => setIsOpen(false)}>Sign in</Link>
          <Link to="/register" className="bg-brand-blue text-white py-3 rounded-button text-center no-underline" onClick={() => setIsOpen(false)}>Start Free Trial</Link>
        </div>
      )}
    </nav>
  );
};

const FeatureCard = ({ icon: Icon, title, description }: { icon: React.ElementType, title: string, description: string }) => (
  <div className="bg-white p-8 rounded-card shadow-card border border-border-base hover:shadow-xl transition-all group hover-lift animate-fade-in cursor-pointer relative overflow-hidden">
    {/* Hover effect background */}
    <div className="absolute inset-0 bg-gradient-to-br from-brand-blue/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>

    <div className="relative z-10">
      <div className="w-12 h-12 rounded-xl bg-brand-light flex items-center justify-center text-brand-blue mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all">
        <Icon size={24} />
      </div>
      <h3 className="text-xl font-bold mb-3 text-brand-dark group-hover:text-brand-blue transition-colors">{title}</h3>
      <p className="text-text-secondary leading-relaxed">{description}</p>
    </div>
  </div>
);

const CountUpNumber = ({ value }: { value: string }) => {
  const [count, setCount] = React.useState(0);
  const hasAnimated = React.useRef(false);
  const elementRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;

          // Extract number from value string
          const numMatch = value.match(/\d+/);
          if (numMatch) {
            const targetNumber = parseInt(numMatch[0]);
            const duration = 2000; // 2 seconds
            const steps = 60;
            const increment = targetNumber / steps;
            let current = 0;

            const timer = setInterval(() => {
              current += increment;
              if (current >= targetNumber) {
                setCount(targetNumber);
                clearInterval(timer);
              } else {
                setCount(Math.floor(current));
              }
            }, duration / steps);

            return () => clearInterval(timer);
          }
        }
      },
      { threshold: 0.5 }
    );

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    return () => observer.disconnect();
  }, [value]);

  // Replace number in value with animated count
  const displayValue = value.replace(/\d+/, count.toString());

  return <div ref={elementRef}>{displayValue}</div>;
};

const StatCard = ({ value, label }: { value: string, label: string }) => (
  <div className="text-center group cursor-default">
    <div className="text-4xl lg:text-5xl font-bold text-brand-blue mb-2 group-hover:scale-110 transition-transform animate-scale-in">
      <CountUpNumber value={value} />
    </div>
    <div className="text-sm text-text-muted font-medium uppercase tracking-wider group-hover:text-brand-blue transition-colors">{label}</div>
  </div>
);

const LandingPage = () => {
  const [showFloatingCTA, setShowFloatingCTA] = React.useState(false);

  React.useEffect(() => {
    const handleScroll = () => {
      // Show floating CTA after scrolling 500px
      setShowFloatingCTA(window.scrollY > 500);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-height-screen">
      <Navbar />

      {/* Floating CTA Button */}
      {showFloatingCTA && (
        <div className="fixed bottom-8 right-8 z-50 animate-slide-up">
          <Link
            to="/register"
            className="bg-brand-blue text-white px-6 py-4 rounded-full shadow-2xl hover:shadow-3xl flex items-center gap-2 no-underline font-bold hover:scale-110 transition-all group animate-bounce-slow"
          >
            <Sparkles size={20} className="animate-pulse" />
            Start Free Trial
            <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      )}

      {/* Hero Section */}
      <section className="pt-48 pb-20 overflow-hidden bg-gradient-to-b from-brand-light/30 to-white relative">
        {/* Animated background elements */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-brand-blue/5 rounded-full blur-3xl animate-pulse-slow"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-brand-green/5 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }}></div>

        <div className="section-container grid lg:grid-cols-2 gap-12 items-center relative z-10">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-green-light text-brand-green text-xs font-bold uppercase tracking-wider animate-slide-left shadow-sm">
              <Scale size={16} className="animate-bounce-slow" />
              Built for Legal Professionals
            </div>
            <h1 className="text-5xl lg:text-7xl font-bold leading-[1.1] text-brand-dark animate-slide-up">
              Your Law Firm, <span className="gradient-text relative">
                Simplified.
                <Sparkles className="absolute -top-6 -right-6 text-brand-blue animate-pulse" size={24} />
              </span>
            </h1>
            <p className="text-xl text-text-secondary max-w-lg leading-relaxed animate-slide-up stagger-1">
              Stop drowning in deadlines and documents. Genzura helps attorneys manage cases, track time, and deliver results—without the chaos.
            </p>

            <div className="bg-white border-2 border-brand-blue/20 rounded-2xl p-6 space-y-3 animate-slide-up stagger-2 shadow-lg hover:shadow-2xl transition-shadow">
              <div className="flex items-center gap-3 animate-slide-left stagger-3">
                <CheckCircle2 className="text-brand-green shrink-0 animate-scale-in" size={20} />
                <span className="text-text-primary font-medium">Never miss a court deadline again</span>
              </div>
              <div className="flex items-center gap-3 animate-slide-left stagger-4">
                <CheckCircle2 className="text-brand-green shrink-0 animate-scale-in" size={20} />
                <span className="text-text-primary font-medium">Find any document in under 10 seconds</span>
              </div>
              <div className="flex items-center gap-3 animate-slide-left stagger-5">
                <CheckCircle2 className="text-brand-green shrink-0 animate-scale-in" size={20} />
                <span className="text-text-primary font-medium">Save 10+ hours per week on admin work</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-4 animate-slide-up stagger-3">
              <Link to="/register" className="bg-brand-blue text-white btn-premium flex items-center gap-2 no-underline text-lg px-8 py-4 hover:scale-105 transition-transform shadow-lg hover:shadow-2xl group">
                Start Free Trial <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link to="/pricing" className="bg-white text-brand-dark border-2 border-brand-blue btn-premium text-lg px-8 py-4 no-underline hover:bg-brand-light transition-all hover:scale-105 shadow-md hover:shadow-xl">
                View Pricing
              </Link>
            </div>

            <div className="flex items-center gap-6 pt-4">
              <div className="flex items-center gap-2 text-sm text-text-muted">
                <CheckCircle2 size={16} className="text-brand-green" />
                <span>No credit card required</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-text-muted">
                <CheckCircle2 size={16} className="text-brand-green" />
                <span>Free 20 cases forever</span>
              </div>
            </div>
          </div>

          <div className="relative animate-slide-right">
            <div className="absolute -inset-8 bg-gradient-to-tr from-brand-blue/20 via-brand-blue/10 to-transparent blur-3xl -z-10 rounded-full animate-pulse-slow" />

            {/* Floating animated circles with bounce */}
            <div className="absolute -top-4 -right-4 w-20 h-20 bg-brand-blue/10 rounded-full animate-float shadow-lg">
              <div className="w-full h-full rounded-full bg-brand-blue/20 animate-pulse"></div>
            </div>
            <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-brand-green/10 rounded-full animate-float shadow-lg" style={{ animationDelay: '1s' }}>
              <div className="w-full h-full rounded-full bg-brand-green/20 animate-pulse"></div>
            </div>

            <div className="bg-white rounded-2xl shadow-2xl p-6 border border-border-base hover:shadow-3xl transition-shadow animate-scale-in relative overflow-hidden">
              {/* Shimmer effect on hover */}
              <div className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity">
                <div className="absolute inset-0 animate-shimmer"></div>
              </div>

              <div className="space-y-4 relative">
                <div className="flex items-center justify-between pb-4 border-b border-border-base animate-slide-up">
                  <h3 className="font-bold text-brand-dark">Active Cases</h3>
                  <span className="text-brand-blue font-bold animate-pulse">24</span>
                </div>
                <div className="space-y-3">
                  {[
                    { name: 'Johnson v. State Corp', status: 'Discovery', deadline: '3 days', priority: 'high' },
                    { name: 'Estate of Williams', status: 'Motion Filed', deadline: '1 week', priority: 'medium' },
                    { name: 'Martinez Contract Dispute', status: 'Settlement', deadline: '2 weeks', priority: 'low' }
                  ].map((caseItem, i) => (
                    <div
                      key={i}
                      className={cn(
                        "flex items-center justify-between p-4 bg-page-bg rounded-xl hover:shadow-md transition-all hover-lift cursor-pointer animate-slide-left",
                        `stagger-${i + 2}`
                      )}
                    >
                      <div className="flex-1">
                        <div className="font-bold text-sm text-brand-dark mb-1">{caseItem.name}</div>
                        <div className="text-xs text-text-muted">{caseItem.status}</div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "px-3 py-1 rounded-full text-xs font-bold transition-all hover:scale-110 animate-scale-in",
                          caseItem.priority === 'high' && "bg-red-100 text-red-700 animate-pulse-slow",
                          caseItem.priority === 'medium' && "bg-amber-100 text-amber-700",
                          caseItem.priority === 'low' && "bg-green-100 text-green-700"
                        )}>
                          {caseItem.deadline}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white border-y border-border-base relative overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0 bg-gradient-to-r from-brand-blue/5 via-transparent to-brand-green/5 animate-shimmer"></div>

        <div className="section-container relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="animate-slide-up stagger-1"><StatCard value="10hrs" label="Time Saved Weekly" /></div>
            <div className="animate-slide-up stagger-2"><StatCard value="100%" label="Deadline Compliance" /></div>
            <div className="animate-slide-up stagger-3"><StatCard value="<10sec" label="Document Retrieval" /></div>
            <div className="animate-slide-up stagger-4"><StatCard value="24/7" label="Access Anywhere" /></div>
          </div>
        </div>
      </section>

      {/* Pain Points Section */}
      <section className="py-24 bg-page-bg relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute top-0 left-1/4 w-64 h-64 bg-red-100/30 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-amber-100/30 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>

        <div className="section-container relative z-10">
          <div className="max-w-3xl mx-auto text-center mb-16 space-y-4">
            <h2 className="text-4xl lg:text-5xl font-bold text-brand-dark animate-slide-up">
              Tired of Legal Practice <span className="gradient-text relative">
                Chaos?
                <Zap className="absolute -top-8 -right-8 text-amber-500 animate-bounce-slow" size={28} />
              </span>
            </h2>
            <p className="text-xl text-text-secondary animate-slide-up stagger-1">
              You're not alone. Every attorney faces the same frustrations daily.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div className="bg-white p-8 rounded-2xl border-2 border-red-200 hover-lift animate-scale-in stagger-1 group cursor-pointer relative overflow-hidden">
              <div className="absolute inset-0 bg-red-50/50 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative z-10">
                <div className="w-14 h-14 rounded-xl bg-red-100 flex items-center justify-center text-red-600 mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all">
                  <Clock size={28} className="group-hover:animate-pulse" />
                </div>
                <h3 className="text-xl font-bold text-brand-dark mb-3">Missed Deadlines = Malpractice</h3>
                <p className="text-text-secondary leading-relaxed">
                  Court dates buried in emails. Filing deadlines on sticky notes. One missed date can cost your license.
                </p>
              </div>
            </div>

            <div className="bg-white p-8 rounded-2xl border-2 border-amber-200 hover-lift animate-scale-in stagger-2 group cursor-pointer relative overflow-hidden">
              <div className="absolute inset-0 bg-amber-50/50 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative z-10">
                <div className="w-14 h-14 rounded-xl bg-amber-100 flex items-center justify-center text-amber-600 mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all">
                  <FileText size={28} className="group-hover:animate-bounce-slow" />
                </div>
                <h3 className="text-xl font-bold text-brand-dark mb-3">Document Chaos</h3>
                <p className="text-text-secondary leading-relaxed">
                  "Where's the Smith deposition?" Searching through folders, emails, and drives wastes hours every day.
                </p>
              </div>
            </div>

            <div className="bg-white p-8 rounded-2xl border-2 border-orange-200 hover-lift animate-scale-in stagger-3 group cursor-pointer relative overflow-hidden">
              <div className="absolute inset-0 bg-orange-50/50 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative z-10">
                <div className="w-14 h-14 rounded-xl bg-orange-100 flex items-center justify-center text-orange-600 mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all">
                  <Users size={28} className="group-hover:animate-pulse" />
                </div>
                <h3 className="text-xl font-bold text-brand-dark mb-3">Client Communication Breakdown</h3>
                <p className="text-text-secondary leading-relaxed">
                  Clients calling for updates you don't have. Partners asking about cases you're not on. Total confusion.
                </p>
              </div>
            </div>
          </div>

          <div className="text-center animate-slide-up stagger-4">
            <p className="text-2xl font-bold text-brand-dark mb-6">
              There's a better way. <span className="text-brand-blue animate-pulse">Genzura fixes all of this.</span>
            </p>
            <Link to="/register" className="bg-brand-blue text-white btn-premium inline-flex items-center gap-2 no-underline text-lg px-8 py-4 hover:scale-110 transition-transform shadow-xl hover:shadow-2xl group animate-bounce-slow">
              Try It Free <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform" />
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="bg-white py-24">
        <div className="section-container">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <h2 className="text-4xl lg:text-5xl font-bold text-brand-dark">
              Everything You Need to Run Your Practice
            </h2>
            <p className="text-xl text-text-secondary">
              From client intake to case closure, Genzura handles it all—so you can focus on practicing law.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard
              icon={Scale}
              title="Complete Case Management"
              description="Track every case from intake to resolution. Organize by practice area, status, priority, and deadlines. See your entire caseload at a glance."
            />
            <FeatureCard
              icon={Bell}
              title="Smart Deadline Alerts"
              description="Never miss a court date, filing deadline, or statute of limitations. Automatic reminders via email, SMS, and in-app notifications."
            />
            <FeatureCard
              icon={FolderOpen}
              title="Lightning-Fast Document Search"
              description="Upload pleadings, discovery, contracts, and evidence. Find any document instantly with powerful search. No more digging through folders."
            />
            <FeatureCard
              icon={Users}
              title="Client Portal & Communication"
              description="Clients can view case updates, documents, and messages 24/7. Reduce 'status update' calls by 80%."
            />
            <FeatureCard
              icon={Calendar}
              title="Integrated Calendar"
              description="Court dates, depositions, meetings, and deadlines all in one place. Sync with Google Calendar and Outlook."
            />
            <FeatureCard
              icon={BarChart3}
              title="Practice Analytics"
              description="See which cases are profitable, track your win rate, monitor workload distribution. Make data-driven decisions."
            />
            <FeatureCard
              icon={Zap}
              title="Team Collaboration"
              description="Assign tasks, share notes, and coordinate with paralegals and associates. Everyone stays on the same page."
            />
            <FeatureCard
              icon={Lock}
              title="Bank-Level Security"
              description="AES-256 encryption, regular backups, and SOC 2 compliance. Your client data is protected like Fort Knox."
            />
            <FeatureCard
              icon={TrendingUp}
              title="Workflow Automation"
              description="Auto-create tasks when cases are filed. Send automated client updates. Template your intake process. Work smarter, not harder."
            />
          </div>

          <div className="mt-16 text-center">
            <Link to="/register" className="bg-brand-blue text-white btn-premium inline-flex items-center gap-2 no-underline text-lg px-8 py-4">
              Start Your Free Trial <ArrowRight size={20} />
            </Link>
            <p className="text-sm text-text-muted mt-4">20 cases free forever. No credit card required.</p>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-24 bg-page-bg">
        <div className="section-container">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <h2 className="text-4xl lg:text-5xl font-bold text-brand-dark">
              Up and Running in <span className="gradient-text">Minutes</span>
            </h2>
            <p className="text-xl text-text-secondary">
              No complicated setup. No training required. Start managing cases today.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="relative">
              <div className="bg-white p-8 rounded-2xl shadow-card border border-border-base">
                <div className="w-16 h-16 rounded-full bg-brand-blue text-white flex items-center justify-center text-2xl font-bold mb-6">
                  1
                </div>
                <h3 className="text-2xl font-bold text-brand-dark mb-4">Sign Up Free</h3>
                <p className="text-text-secondary leading-relaxed">
                  Create your account in 60 seconds. Add your firm details and invite your team.
                </p>
              </div>
              <div className="hidden md:block absolute top-1/2 -right-4 w-8 h-0.5 bg-brand-blue/30" />
            </div>

            <div className="relative">
              <div className="bg-white p-8 rounded-2xl shadow-card border border-border-base">
                <div className="w-16 h-16 rounded-full bg-brand-blue text-white flex items-center justify-center text-2xl font-bold mb-6">
                  2
                </div>
                <h3 className="text-2xl font-bold text-brand-dark mb-4">Add Your Cases</h3>
                <p className="text-text-secondary leading-relaxed">
                  Import existing cases or start fresh. Upload documents, set deadlines, assign attorneys.
                </p>
              </div>
              <div className="hidden md:block absolute top-1/2 -right-4 w-8 h-0.5 bg-brand-blue/30" />
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-card border border-border-base">
              <div className="w-16 h-16 rounded-full bg-brand-blue text-white flex items-center justify-center text-2xl font-bold mb-6">
                3
              </div>
              <h3 className="text-2xl font-bold text-brand-dark mb-4">Focus on Law</h3>
              <p className="text-text-secondary leading-relaxed">
                Let Genzura handle the admin. Get alerts, find documents instantly, update clients automatically.
              </p>
            </div>
          </div>

          <div className="mt-12 text-center">
            <Link to="/register" className="bg-brand-blue text-white btn-premium inline-flex items-center gap-2 no-underline text-lg px-8 py-4">
              Get Started Now <ArrowRight size={20} />
            </Link>
          </div>
        </div>
      </section>

      {/* What Attorneys Need */}
      <section id="testimonials" className="py-24 bg-brand-dark text-white overflow-hidden relative">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-brand-blue via-transparent to-transparent" />
        </div>
        <div className="section-container relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">What Attorneys Tell Us They Need</h2>
            <p className="text-brand-light/70 text-lg">Common challenges we help legal professionals solve</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white/10 backdrop-blur-sm p-8 rounded-2xl border border-white/20">
              <div className="w-12 h-12 rounded-full bg-brand-blue/30 flex items-center justify-center text-white mb-6">
                <Clock size={24} />
              </div>
              <p className="text-lg mb-4 font-semibold">
                "I need a system that prevents me from ever missing a court deadline"
              </p>
              <p className="text-sm text-brand-light/70">
                Automated deadline tracking with multiple reminder methods ensures you're always prepared for court dates, filing deadlines, and statute of limitations.
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm p-8 rounded-2xl border border-white/20">
              <div className="w-12 h-12 rounded-full bg-brand-blue/30 flex items-center justify-center text-white mb-6">
                <FileText size={24} />
              </div>
              <p className="text-lg mb-4 font-semibold">
                "I spend too much time searching for documents instead of practicing law"
              </p>
              <p className="text-sm text-brand-light/70">
                Lightning-fast document search across all cases. Upload pleadings, discovery, evidence, and contracts—find anything in seconds, not hours.
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm p-8 rounded-2xl border border-white/20">
              <div className="w-12 h-12 rounded-full bg-brand-blue/30 flex items-center justify-center text-white mb-6">
                <Users size={24} />
              </div>
              <p className="text-lg mb-4 font-semibold">
                "My clients constantly call asking for case updates I don't have on hand"
              </p>
              <p className="text-sm text-brand-light/70">
                Centralized case information and client portal keeps everyone informed. Reduce status update calls and give clients 24/7 access to their case details.
              </p>
            </div>
          </div>

          <div className="mt-12 text-center">
            <p className="text-brand-light/80 text-lg mb-6">Sound familiar? You're not alone.</p>
            <Link to="/register" className="bg-white text-brand-dark btn-premium font-bold no-underline inline-flex items-center gap-2">
              Try Genzura Free <ArrowRight size={20} />
            </Link>
          </div>
        </div>
      </section>

      {/* Feature Showcase */}
      <section className="py-24 bg-white">
        <div className="section-container">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <h2 className="text-4xl lg:text-5xl font-bold text-brand-dark">
              See Genzura in <span className="gradient-text">Action</span>
            </h2>
            <p className="text-xl text-text-secondary">
              A complete view of how Genzura transforms your daily legal practice
            </p>
          </div>

          <div className="space-y-24">
            {/* Dashboard Showcase */}
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-blue/10 text-brand-blue text-sm font-bold">
                  <BarChart3 size={16} />
                  Dashboard
                </div>
                <h3 className="text-3xl font-bold text-brand-dark">Your Practice at a Glance</h3>
                <p className="text-lg text-text-secondary leading-relaxed">
                  See active cases, upcoming deadlines, recent documents, and team activity all on one screen. Start every morning knowing exactly what needs your attention.
                </p>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="text-brand-green shrink-0 mt-1" size={20} />
                    <span className="text-text-secondary">Real-time case status across all practice areas</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="text-brand-green shrink-0 mt-1" size={20} />
                    <span className="text-text-secondary">Upcoming deadline warnings with priority indicators</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="text-brand-green shrink-0 mt-1" size={20} />
                    <span className="text-text-secondary">Team workload distribution and performance metrics</span>
                  </li>
                </ul>
              </div>
              <div className="relative">
                <div className="absolute -inset-4 bg-gradient-to-tr from-brand-blue/20 to-transparent blur-3xl -z-10" />
                <div className="bg-page-bg rounded-2xl shadow-2xl border border-border-base p-6">
                  <div className="bg-white rounded-xl p-6 space-y-4">
                    <div className="flex items-center justify-between pb-4 border-b">
                      <h4 className="font-bold text-brand-dark">My Dashboard</h4>
                      <span className="text-xs text-text-muted">Today</span>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <div className="text-2xl font-bold text-brand-blue">24</div>
                        <div className="text-xs text-text-muted">Active Cases</div>
                      </div>
                      <div className="bg-amber-50 p-4 rounded-lg">
                        <div className="text-2xl font-bold text-amber-600">5</div>
                        <div className="text-xs text-text-muted">Due This Week</div>
                      </div>
                      <div className="bg-green-50 p-4 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">12</div>
                        <div className="text-xs text-text-muted">Completed</div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="text-xs font-bold text-text-muted uppercase">Urgent Deadlines</div>
                      <div className="bg-red-50 border-l-4 border-red-500 p-3 rounded">
                        <div className="text-sm font-bold text-brand-dark">Motion to Dismiss - Johnson v. State</div>
                        <div className="text-xs text-text-muted">Due in 2 days</div>
                      </div>
                      <div className="bg-amber-50 border-l-4 border-amber-500 p-3 rounded">
                        <div className="text-sm font-bold text-brand-dark">Discovery Response - Martinez LLC</div>
                        <div className="text-xs text-text-muted">Due in 5 days</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Case Management Showcase */}
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="order-2 lg:order-1 relative">
                <div className="absolute -inset-4 bg-gradient-to-tl from-brand-green/20 to-transparent blur-3xl -z-10" />
                <div className="bg-page-bg rounded-2xl shadow-2xl border border-border-base p-6">
                  <div className="bg-white rounded-xl p-6 space-y-4">
                    <div className="flex items-center justify-between pb-4 border-b">
                      <div>
                        <h4 className="font-bold text-brand-dark">Johnson v. State Corp</h4>
                        <div className="text-xs text-text-muted">Civil Litigation • Case #2026-CV-1234</div>
                      </div>
                      <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold">Active</span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <div className="text-xs text-text-muted mb-1">Attorney</div>
                        <div className="font-medium">Sarah Johnson</div>
                      </div>
                      <div>
                        <div className="text-xs text-text-muted mb-1">Next Deadline</div>
                        <div className="font-medium text-red-600">Mar 15, 2026</div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="text-xs font-bold text-text-muted uppercase">Timeline</div>
                      <div className="space-y-3">
                        <div className="flex gap-3">
                          <div className="w-2 h-2 rounded-full bg-brand-blue mt-2 shrink-0"></div>
                          <div className="flex-1">
                            <div className="text-sm font-medium">Motion to Dismiss filed</div>
                            <div className="text-xs text-text-muted">2 hours ago</div>
                          </div>
                        </div>
                        <div className="flex gap-3">
                          <div className="w-2 h-2 rounded-full bg-gray-300 mt-2 shrink-0"></div>
                          <div className="flex-1">
                            <div className="text-sm font-medium">Discovery documents uploaded</div>
                            <div className="text-xs text-text-muted">Yesterday</div>
                          </div>
                        </div>
                        <div className="flex gap-3">
                          <div className="w-2 h-2 rounded-full bg-gray-300 mt-2 shrink-0"></div>
                          <div className="flex-1">
                            <div className="text-sm font-medium">Initial client meeting</div>
                            <div className="text-xs text-text-muted">5 days ago</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="space-y-6 order-1 lg:order-2">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-green-light text-brand-green text-sm font-bold">
                  <Scale size={16} />
                  Case Management
                </div>
                <h3 className="text-3xl font-bold text-brand-dark">Every Detail, Perfectly Organized</h3>
                <p className="text-lg text-text-secondary leading-relaxed">
                  Track every case from intake to resolution. See client details, assigned attorneys, documents, deadlines, and activity timeline all in one place.
                </p>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="text-brand-green shrink-0 mt-1" size={20} />
                    <span className="text-text-secondary">Complete case lifecycle tracking with status workflows</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="text-brand-green shrink-0 mt-1" size={20} />
                    <span className="text-text-secondary">Automatic activity timeline for every action taken</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="text-brand-green shrink-0 mt-1" size={20} />
                    <span className="text-text-secondary">Team collaboration with role-based permissions</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Document Management Showcase */}
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-blue/10 text-brand-blue text-sm font-bold">
                  <FolderOpen size={16} />
                  Documents
                </div>
                <h3 className="text-3xl font-bold text-brand-dark">Find Anything in Seconds</h3>
                <p className="text-lg text-text-secondary leading-relaxed">
                  Upload pleadings, discovery, contracts, evidence, and more. Powerful search finds any document instantly—no more digging through folders.
                </p>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="text-brand-green shrink-0 mt-1" size={20} />
                    <span className="text-text-secondary">Search by filename, case, date, or document type</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="text-brand-green shrink-0 mt-1" size={20} />
                    <span className="text-text-secondary">Secure cloud storage with automatic backups</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="text-brand-green shrink-0 mt-1" size={20} />
                    <span className="text-text-secondary">Version history and download tracking</span>
                  </li>
                </ul>
              </div>
              <div className="relative">
                <div className="absolute -inset-4 bg-gradient-to-br from-brand-blue/20 to-transparent blur-3xl -z-10" />
                <div className="bg-page-bg rounded-2xl shadow-2xl border border-border-base p-6">
                  <div className="bg-white rounded-xl p-6 space-y-4">
                    <div className="flex items-center gap-3 pb-4 border-b">
                      <input
                        type="text"
                        placeholder="Search documents..."
                        className="flex-1 px-4 py-2 rounded-lg border border-border-base text-sm"
                        disabled
                      />
                      <button className="px-4 py-2 bg-brand-blue text-white rounded-lg text-sm font-medium">
                        Search
                      </button>
                    </div>
                    <div className="space-y-2">
                      {[
                        { name: 'Motion_to_Dismiss.pdf', case: 'Johnson v. State', size: '2.4 MB', type: 'PDF' },
                        { name: 'Discovery_Response.docx', case: 'Martinez LLC', size: '856 KB', type: 'DOCX' },
                        { name: 'Settlement_Agreement.pdf', case: 'Williams Estate', size: '1.2 MB', type: 'PDF' },
                        { name: 'Evidence_Photos.zip', case: 'Johnson v. State', size: '15.3 MB', type: 'ZIP' }
                      ].map((doc, i) => (
                        <div key={i} className="flex items-center gap-3 p-3 bg-page-bg rounded-lg hover:bg-blue-50 transition-colors">
                          <div className={cn(
                            "w-10 h-10 rounded flex items-center justify-center text-xs font-bold shrink-0",
                            doc.type === 'PDF' && "bg-red-100 text-red-700",
                            doc.type === 'DOCX' && "bg-blue-100 text-blue-700",
                            doc.type === 'ZIP' && "bg-purple-100 text-purple-700"
                          )}>
                            {doc.type}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium text-brand-dark truncate">{doc.name}</div>
                            <div className="text-xs text-text-muted">{doc.case} • {doc.size}</div>
                          </div>
                          <button className="text-brand-blue hover:text-brand-dark">
                            <ChevronRight size={20} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Calendar Showcase */}
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="order-2 lg:order-1 relative">
                <div className="absolute -inset-4 bg-gradient-to-tr from-amber-500/20 to-transparent blur-3xl -z-10" />
                <div className="bg-page-bg rounded-2xl shadow-2xl border border-border-base p-6">
                  <div className="bg-white rounded-xl p-6 space-y-4">
                    <div className="flex items-center justify-between pb-4 border-b">
                      <h4 className="font-bold text-brand-dark">This Week</h4>
                      <span className="text-xs text-brand-blue font-medium">March 10-16, 2026</span>
                    </div>
                    <div className="space-y-3">
                      <div className="flex gap-3 p-3 bg-blue-50 border-l-4 border-brand-blue rounded">
                        <div className="text-center shrink-0">
                          <div className="text-xs text-text-muted">MON</div>
                          <div className="text-lg font-bold text-brand-dark">10</div>
                        </div>
                        <div className="flex-1">
                          <div className="text-sm font-bold text-brand-dark">Court Hearing - Johnson v. State</div>
                          <div className="text-xs text-text-muted">9:00 AM • Superior Court Room 3A</div>
                        </div>
                      </div>
                      <div className="flex gap-3 p-3 bg-purple-50 border-l-4 border-purple-500 rounded">
                        <div className="text-center shrink-0">
                          <div className="text-xs text-text-muted">WED</div>
                          <div className="text-lg font-bold text-brand-dark">12</div>
                        </div>
                        <div className="flex-1">
                          <div className="text-sm font-bold text-brand-dark">Client Deposition - Martinez</div>
                          <div className="text-xs text-text-muted">2:00 PM • Conference Room B</div>
                        </div>
                      </div>
                      <div className="flex gap-3 p-3 bg-green-50 border-l-4 border-green-500 rounded">
                        <div className="text-center shrink-0">
                          <div className="text-xs text-text-muted">FRI</div>
                          <div className="text-lg font-bold text-brand-dark">14</div>
                        </div>
                        <div className="flex-1">
                          <div className="text-sm font-bold text-brand-dark">Settlement Conference</div>
                          <div className="text-xs text-text-muted">10:30 AM • Mediation Center</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="space-y-6 order-1 lg:order-2">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-100 text-amber-700 text-sm font-bold">
                  <Calendar size={16} />
                  Calendar
                </div>
                <h3 className="text-3xl font-bold text-brand-dark">Never Miss a Commitment</h3>
                <p className="text-lg text-text-secondary leading-relaxed">
                  Court dates, depositions, client meetings, and deadlines all in one calendar. Automatic reminders ensure you're always prepared.
                </p>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="text-brand-green shrink-0 mt-1" size={20} />
                    <span className="text-text-secondary">Automatic deadline calculation from case filing dates</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="text-brand-green shrink-0 mt-1" size={20} />
                    <span className="text-text-secondary">Multi-channel reminders (email, SMS, in-app)</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="text-brand-green shrink-0 mt-1" size={20} />
                    <span className="text-text-secondary">Sync with Google Calendar and Outlook</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div className="mt-16 text-center">
            <p className="text-2xl font-bold text-brand-dark mb-6">Ready to transform your practice?</p>
            <Link to="/register" className="bg-brand-blue text-white btn-premium inline-flex items-center gap-2 no-underline text-lg px-8 py-4">
              Start Free Trial <ArrowRight size={20} />
            </Link>
          </div>
        </div>
      </section>

      {/* Practice Areas */}
      <section className="py-24 bg-white">
        <div className="section-container">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <h2 className="text-4xl lg:text-5xl font-bold text-brand-dark">
              Built for Every Practice Area
            </h2>
            <p className="text-xl text-text-secondary">
              Whether you're a solo practitioner or a 50-attorney firm, Genzura adapts to your practice.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { title: "Criminal Defense", description: "Court dates, discovery, plea negotiations" },
              { title: "Family Law", description: "Divorce, custody, support calculations" },
              { title: "Personal Injury", description: "Medical records, settlement tracking" },
              { title: "Estate Planning", description: "Wills, trusts, probate administration" },
              { title: "Real Estate", description: "Closings, title work, contracts" },
              { title: "Corporate Law", description: "Contracts, compliance, transactions" },
              { title: "Immigration", description: "Applications, deadlines, documentation" },
              { title: "Litigation", description: "Discovery, motions, trial preparation" }
            ].map((area, i) => (
              <div key={i} className="bg-page-bg p-6 rounded-xl border border-border-base hover:border-brand-blue hover:shadow-lg transition-all group">
                <div className="w-10 h-10 rounded-lg bg-brand-blue/10 flex items-center justify-center text-brand-blue mb-4 group-hover:bg-brand-blue group-hover:text-white transition-colors">
                  <Scale size={20} />
                </div>
                <h3 className="font-bold text-brand-dark mb-2">{area.title}</h3>
                <p className="text-sm text-text-muted">{area.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-24 bg-page-bg">
        <div className="section-container">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <h2 className="text-4xl lg:text-5xl font-bold text-brand-dark">
              Trusted. Secure. <span className="gradient-text">Attorney-Approved.</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-border-base text-center">
              <Lock className="w-12 h-12 text-brand-blue mx-auto mb-4" />
              <h3 className="font-bold text-brand-dark mb-2">Bank-Level Encryption</h3>
              <p className="text-sm text-text-muted">AES-256 encryption for all client data</p>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-border-base text-center">
              <ShieldCheck className="w-12 h-12 text-brand-blue mx-auto mb-4" />
              <h3 className="font-bold text-brand-dark mb-2">GDPR Compliant</h3>
              <p className="text-sm text-text-muted">Full compliance with data protection laws</p>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-border-base text-center">
              <Clock className="w-12 h-12 text-brand-blue mx-auto mb-4" />
              <h3 className="font-bold text-brand-dark mb-2">Daily Backups</h3>
              <p className="text-sm text-text-muted">Your data is safe, always recoverable</p>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-border-base text-center">
              <Users className="w-12 h-12 text-brand-blue mx-auto mb-4" />
              <h3 className="font-bold text-brand-dark mb-2">24/7 Support</h3>
              <p className="text-sm text-text-muted">Real humans, always here to help</p>
            </div>
          </div>
        </div>
      </section>

      {/* Feedback Section */}
      <section className="py-24 bg-gradient-to-br from-page-bg to-white">
        <div className="section-container">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-blue/10 text-brand-blue text-sm font-bold animate-slide-up">
              <Sparkles size={16} />
              We're Listening
            </div>
            <h2 className="text-4xl lg:text-5xl font-bold text-brand-dark animate-slide-up stagger-1">
              Help Us Build the Perfect Platform for You
            </h2>
            <p className="text-lg text-text-secondary max-w-2xl mx-auto animate-slide-up stagger-2">
              Your feedback shapes Genzura. Share your ideas, report issues, or tell us what's working well.
            </p>

            <div className="bg-white rounded-3xl shadow-2xl p-8 lg:p-12 border border-border-base animate-scale-in stagger-3">
              <div className="grid md:grid-cols-2 gap-8">
                <div className="text-left space-y-4">
                  <h3 className="text-xl font-bold text-brand-dark">Share Your Feedback</h3>
                  <p className="text-sm text-text-muted">
                    We read every submission. Your input helps us prioritize features and improvements that matter most to attorneys like you.
                  </p>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-3">
                      <CheckCircle2 className="text-brand-green shrink-0 mt-1" size={18} />
                      <span className="text-sm text-text-secondary">Feature requests & suggestions</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle2 className="text-brand-green shrink-0 mt-1" size={18} />
                      <span className="text-sm text-text-secondary">Bug reports & technical issues</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle2 className="text-brand-green shrink-0 mt-1" size={18} />
                      <span className="text-sm text-text-secondary">User experience improvements</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle2 className="text-brand-green shrink-0 mt-1" size={18} />
                      <span className="text-sm text-text-secondary">General comments & testimonials</span>
                    </li>
                  </ul>
                </div>

                <div className="flex flex-col justify-center items-center space-y-4 bg-gradient-to-br from-brand-blue/5 to-brand-green-light/30 rounded-2xl p-8">
                  <div className="w-20 h-20 bg-brand-blue rounded-2xl flex items-center justify-center animate-bounce-slow">
                    <Sparkles className="text-white" size={40} />
                  </div>
                  <h4 className="text-lg font-bold text-brand-dark">Ready to Share?</h4>
                  <Link
                    to="/feedback"
                    className="bg-brand-blue text-white px-8 py-4 rounded-xl font-bold hover:shadow-xl hover:-translate-y-1 transition-all shadow-lg shadow-brand-blue/20 inline-flex items-center gap-2 group no-underline"
                  >
                    Submit Feedback
                    <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform" />
                  </Link>
                  <p className="text-xs text-text-muted">Sign in to submit feedback • Takes 2 minutes</p>
                </div>
              </div>
            </div>

            <div className="bg-amber-50 border-l-4 border-amber-500 p-6 rounded-lg max-w-2xl mx-auto text-left animate-slide-up stagger-4">
              <div className="flex items-start gap-3">
                <Bell className="text-amber-600 shrink-0 mt-1" size={20} />
                <div>
                  <p className="text-sm font-bold text-brand-dark mb-1">Important: Email Support</p>
                  <p className="text-sm text-text-secondary">
                    Our system emails are automated and unmonitored. Please do not reply to system emails.
                    Use the feedback form above for all support requests, bug reports, and general inquiries.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-24 bg-white relative overflow-hidden">
        {/* Animated background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-full h-full">
            {[...Array(20)].map((_, i) => (
              <div
                key={i}
                className="absolute w-2 h-2 bg-brand-blue rounded-full animate-float"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 3}s`,
                  animationDuration: `${3 + Math.random() * 3}s`
                }}
              />
            ))}
          </div>
        </div>

        <div className="section-container relative z-10">
          <div className="bg-gradient-to-br from-brand-dark to-brand-blue rounded-[2.5rem] p-12 lg:p-20 text-white text-center relative overflow-hidden shadow-2xl animate-scale-in">
            <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 blur-[120px] rounded-full animate-float" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/10 blur-[120px] rounded-full animate-float" style={{ animationDelay: '1.5s' }} />

            {/* Floating icons */}
            <Scale className="absolute top-10 left-10 text-white/20 animate-float" size={40} style={{ animationDelay: '0.5s' }} />
            <FileText className="absolute top-20 right-20 text-white/20 animate-float" size={40} style={{ animationDelay: '1s' }} />
            <Users className="absolute bottom-20 left-20 text-white/20 animate-float" size={40} style={{ animationDelay: '1.5s' }} />
            <Calendar className="absolute bottom-10 right-10 text-white/20 animate-float" size={40} style={{ animationDelay: '2s' }} />

            <div className="relative z-10 space-y-8 max-w-4xl mx-auto">
              <h2 className="text-4xl lg:text-6xl font-bold leading-tight animate-slide-up">
                Ready to Reclaim Your Time?
              </h2>
              <p className="text-xl text-white/90 max-w-2xl mx-auto animate-slide-up stagger-1">
                Join hundreds of attorneys who've already said goodbye to chaos. Start your free trial today—no credit card required.
              </p>

              <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-8 max-w-2xl mx-auto animate-scale-in stagger-2 hover:bg-white/15 transition-colors">
                <div className="grid md:grid-cols-3 gap-6 mb-8">
                  <div className="animate-slide-up stagger-3 group cursor-default">
                    <div className="text-3xl font-bold mb-2 group-hover:scale-110 transition-transform">20 Cases</div>
                    <div className="text-sm text-white/70">Free Forever</div>
                  </div>
                  <div className="animate-slide-up stagger-4 group cursor-default">
                    <div className="text-3xl font-bold mb-2 group-hover:scale-110 transition-transform">No Card</div>
                    <div className="text-sm text-white/70">Required to Start</div>
                  </div>
                  <div className="animate-slide-up stagger-5 group cursor-default">
                    <div className="text-3xl font-bold mb-2 group-hover:scale-110 transition-transform">2 Minutes</div>
                    <div className="text-sm text-white/70">To Get Started</div>
                  </div>
                </div>

                <Link to="/register" className="bg-white text-brand-dark btn-premium font-bold no-underline inline-flex items-center gap-2 text-lg px-10 py-5 hover:scale-110 transition-transform shadow-2xl group animate-bounce-slow">
                  Start Your Free Trial <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform" />
                </Link>
              </div>

              <div className="flex flex-wrap justify-center gap-8 text-sm text-white/80 pt-4">
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={16} />
                  <span>Setup in 2 minutes</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={16} />
                  <span>Cancel anytime</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={16} />
                  <span>Free tier forever</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border-base py-12 bg-white">
        <div className="section-container">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div className="animate-slide-up">
              <Link to="/" className="block">
                <img
                  src="/Genzura website header.png"
                  alt="Genzura"
                  className="h-20 w-auto object-contain mb-4 hover:scale-110 transition-transform cursor-pointer hover:animate-bounce"
                />
              </Link>
              <p className="text-sm text-text-muted">
                Modern practice management for modern attorneys.
              </p>
            </div>

            <div>
              <h4 className="font-bold text-brand-dark mb-4">Product</h4>
              <div className="space-y-2">
                <a href="#features" className="block text-sm text-text-muted hover:text-brand-blue transition-colors">Features</a>
                <Link to="/pricing" className="block text-sm text-text-muted hover:text-brand-blue transition-colors">Pricing</Link>
                <a href="#how-it-works" className="block text-sm text-text-muted hover:text-brand-blue transition-colors">How It Works</a>
              </div>
            </div>

            <div>
              <h4 className="font-bold text-brand-dark mb-4">Company</h4>
              <div className="space-y-2">
                <a href="#testimonials" className="block text-sm text-text-muted hover:text-brand-blue transition-colors">Reviews</a>
                <Link to="/feedback" className="block text-sm text-text-muted hover:text-brand-blue transition-colors">Feedback</Link>
                <Link to="/legal/security" className="block text-sm text-text-muted hover:text-brand-blue transition-colors">Security</Link>
              </div>
            </div>

            <div>
              <h4 className="font-bold text-brand-dark mb-4">Legal</h4>
              <div className="space-y-2">
                <Link to="/legal/privacy" className="block text-sm text-text-muted hover:text-brand-blue transition-colors">Privacy Policy</Link>
                <Link to="/legal/terms" className="block text-sm text-text-muted hover:text-brand-blue transition-colors">Terms of Service</Link>
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-border-base flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-text-muted">
              &copy; 2026 Genzura Inc. All rights reserved.
            </p>
            <div className="flex gap-6">
              <Link to="/login" className="text-sm text-text-muted hover:text-brand-blue transition-colors">Sign In</Link>
              <Link to="/register" className="text-sm font-bold text-brand-blue hover:underline">Start Free Trial</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
