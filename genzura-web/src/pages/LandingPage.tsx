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
  X
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const Navbar = () => {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <nav className="fixed top-0 w-full z-50 bg-white border-b border-black/5 shadow-sm">
      <div className="max-w-7xl mx-auto px-6 h-[120px] flex items-center justify-between">
        <div className="flex items-center">
          <img src="/Genzura website header.png" alt="Genzura" className="h-24 w-auto object-contain" />
        </div>

        <div className="hidden md:flex items-center gap-8">
          <a href="#features" className="text-sm font-medium text-text-secondary hover:text-brand-blue transition-colors">Features</a>
          <a href="#about" className="text-sm font-medium text-text-secondary hover:text-brand-blue transition-colors">About</a>
          <a href="#solutions" className="text-sm font-medium text-text-secondary hover:text-brand-blue transition-colors">Solutions</a>
          <Link to="/login" className="text-sm font-medium text-text-secondary hover:text-brand-blue transition-colors">Sign in</Link>
          <Link to="/register" className="bg-brand-blue text-white btn-premium py-2 px-6 text-sm no-underline">
            Get Started
          </Link>
        </div>

        <button className="md:hidden" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-white border-b p-6 flex flex-col gap-4 animate-in slide-in-from-top duration-300">
          <a href="#features" className="font-medium" onClick={() => setIsOpen(false)}>Features</a>
          <a href="#about" className="font-medium" onClick={() => setIsOpen(false)}>About</a>
          <a href="#solutions" className="font-medium" onClick={() => setIsOpen(false)}>Solutions</a>
          <Link to="/login" className="font-medium" onClick={() => setIsOpen(false)}>Sign in</Link>
          <Link to="/register" className="bg-brand-blue text-white py-3 rounded-button text-center no-underline" onClick={() => setIsOpen(false)}>Get Started</Link>
        </div>
      )}
    </nav>
  );
};

const FeatureCard = ({ icon: Icon, title, description }: { icon: React.ElementType, title: string, description: string }) => (
  <div className="bg-white p-8 rounded-card shadow-card border border-border-base hover:shadow-xl transition-all group">
    <div className="w-12 h-12 rounded-xl bg-brand-light flex items-center justify-center text-brand-blue mb-6 group-hover:scale-110 transition-transform">
      <Icon size={24} />
    </div>
    <h3 className="text-xl font-bold mb-3 text-brand-dark">{title}</h3>
    <p className="text-text-secondary leading-relaxed">{description}</p>
  </div>
);

const LandingPage = () => {
  return (
    <div className="min-height-screen">
      <Navbar />

      {/* Hero Section */}
      <section className="pt-48 pb-20 overflow-hidden">
        <div className="section-container grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-green-light text-brand-green text-xs font-bold uppercase tracking-wider">
              <ShieldCheck size={14} />
              Trusted Case Management
            </div>
            <h1 className="text-5xl lg:text-7xl font-bold leading-[1.1] text-brand-dark">
              Stay in <span className="gradient-text">Control</span> of Every Case.
            </h1>
            <p className="text-lg text-text-secondary max-w-lg leading-relaxed">
              Empowering professionals with the tools to manage, track, and resolve cases with unparalleled precision and efficiency.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/register" className="bg-brand-blue text-white btn-premium flex items-center gap-2 no-underline">
                Get Started <ArrowRight size={18} />
              </Link>
              <button className="bg-white text-brand-dark border border-border-base btn-premium">
                Watch Demo
              </button>
            </div>
            <div className="flex items-center gap-8 pt-4">
              <div className="flex -space-x-3">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-slate-200 overflow-hidden">
                    <img src={`https://i.pravatar.cc/150?u=${i}`} alt="User" />
                  </div>
                ))}
              </div>
              <p className="text-sm text-text-muted">
                Joined by <span className="text-text-primary font-bold">500+</span> firms worldwide
              </p>
            </div>
          </div>

          <div className="relative">
            <div className="absolute -inset-4 bg-gradient-to-tr from-brand-blue/20 to-transparent blur-3xl -z-10 rounded-full" />
            <img
              src="/Genzura website header.png"
              alt="Genzura Interface"
              className="w-full h-auto rounded-2xl shadow-2xl animate-float"
            />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="bg-white py-24">
        <div className="section-container">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <h2 className="text-3xl lg:text-5xl font-bold text-brand-dark">Efficiency Redefined</h2>
            <p className="text-text-secondary text-lg">
              Designed for high-stakes environments where every detail matters. Genzura streamlines your workflow so you can focus on results.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard
              icon={Scale}
              title="Intelligent Tracking"
              description="Monitor every stage of your case lifecycle with real-time updates and automated milestone tracking."
            />
            <FeatureCard
              icon={BarChart3}
              title="Advanced Analytics"
              description="Gain deep insights into case performance, team productivity, and outcomes with customizable dashboards."
            />
            <FeatureCard
              icon={Clock}
              title="Seamless Compliance"
              description="Automated auditing and document management ensure your firm stays compliant with zero manual effort."
            />
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-24 bg-page-bg">
        <div className="section-container grid lg:grid-cols-2 gap-16 items-center">
          <div className="relative order-2 lg:order-1">
            <div className="bg-brand-blue/5 rounded-[2rem] p-8 aspect-square flex items-center justify-center">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-6">
                  <div className="bg-white p-6 rounded-2xl shadow-sm border border-border-base transform -rotate-3">
                    <p className="text-sm font-bold text-brand-blue">Est. 2018</p>
                    <p className="text-xs text-text-muted">A legacy of precision</p>
                  </div>
                  <div className="bg-white p-6 rounded-2xl shadow-sm border border-border-base transform rotate-2">
                    <p className="text-sm font-bold text-brand-blue">Global Scale</p>
                    <p className="text-xs text-text-muted">Trusted across borders</p>
                  </div>
                </div>
                <div className="pt-12 space-y-6">
                  <div className="bg-white p-6 rounded-2xl shadow-sm border border-border-base transform rotate-3">
                    <p className="text-sm font-bold text-brand-blue">AI Driven</p>
                    <p className="text-xs text-text-muted">Next-gen intelligence</p>
                  </div>
                  <div className="bg-brand-blue p-6 rounded-2xl shadow-lg transform -rotate-2 text-white">
                    <p className="text-sm font-bold">Excellence</p>
                    <p className="text-xs opacity-80">Our core standard</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-8 order-1 lg:order-2">
            <h2 className="text-3xl lg:text-5xl font-bold text-brand-dark leading-tight">
              Crafted for the <span className="gradient-text">Elite</span>, Built for Results.
            </h2>
            <p className="text-lg text-text-secondary leading-relaxed">
              Genzura was born out of a simple necessity: the need for absolute clarity in complex case environments. We combine sophisticated engineering with an intuitive user experience to provide a platform that doesn't just manage cases—it masterfully resolves them.
            </p>
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-full bg-brand-blue/10 flex items-center justify-center text-brand-blue shrink-0">
                  <CheckCircle2 size={24} />
                </div>
                <div>
                  <h4 className="font-bold text-brand-dark">Our Mission</h4>
                  <p className="text-text-secondary">To eliminate complexity and empower professionals with high-fidelity case intelligence.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Solutions Section */}
      <section id="solutions" className="py-24 bg-white border-t border-border-base">
        <div className="section-container">
          <div className="flex flex-col md:flex-row justify-between items-end gap-8 mb-16">
            <div className="max-w-2xl space-y-4">
              <h2 className="text-3xl lg:text-5xl font-bold text-brand-dark">Tailored Solutions</h2>
              <p className="text-text-secondary text-lg">
                Genzura adapts to your industry's unique demands, providing specialized tools for every sector.
              </p>
            </div>
            <button className="text-brand-blue font-bold flex items-center gap-2 hover:gap-3 transition-all underline decoration-brand-blue/30 underline-offset-8">
              Explore All Industries <ArrowRight size={20} />
            </button>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                title: "Legal & Litigation",
                description: "Complete case lifecycle management with integrated discovery and legal research tools.",
                icon: Scale,
                color: "bg-blue-500"
              },
              {
                title: "Corporate Compliance",
                description: "Streamline regulatory tracking and internal audits with automated reporting and alerts.",
                icon: ShieldCheck,
                color: "bg-emerald-500"
              },
              {
                title: "Financial Auditing",
                description: "High-precision case tracking for complex financial investigations and risk assessment.",
                icon: BarChart3,
                color: "bg-amber-500"
              }
            ].map((solution, i) => (
              <div key={i} className="group relative bg-page-bg/50 rounded-[2rem] p-8 border border-transparent hover:border-brand-blue/20 hover:bg-white transition-all duration-500 shadow-sm hover:shadow-xl">
                <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center text-white mb-8 shadow-lg", solution.color)}>
                  <solution.icon size={28} />
                </div>
                <h3 className="text-2xl font-bold text-brand-dark mb-4">{solution.title}</h3>
                <p className="text-text-secondary leading-relaxed mb-8">
                  {solution.description}
                </p>
                <Link to="/register" className="inline-flex items-center gap-2 text-sm font-bold text-brand-blue group-hover:gap-3 transition-all">
                  Learn more <ChevronRight size={16} />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 bg-brand-dark text-white overflow-hidden relative">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-brand-blue via-transparent to-transparent" />
        </div>
        <div className="section-container relative z-10 text-center space-y-12">
          <h2 className="text-3xl font-bold opacity-80 uppercase tracking-widest text-sm">Trusted by Industry Leaders</h2>
          <div className="max-w-4xl mx-auto">
            <p className="text-2xl lg:text-4xl font-medium italic leading-relaxed">
              "Genzura transformed the way our firm handles multi-year litigations. The precision and tracking capabilities are simply unmatched in the current market."
            </p>
            <div className="mt-8 flex flex-col items-center gap-4">
              <div className="w-16 h-16 rounded-full border-2 border-brand-blue p-1">
                <img src="https://i.pravatar.cc/150?u=9" className="w-full h-full rounded-full object-cover" alt="Sarah Jenkins" />
              </div>
              <div>
                <p className="font-bold text-lg">Sarah Jenkins</p>
                <p className="text-brand-light/60 text-sm">Managing Partner, Global Legal Group</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-24 border-t border-border-base bg-brand-light/30">
        <div className="section-container grid lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-brand-dark">Why Professionals Choose Genzura</h2>
            <ul className="space-y-4">
              {[
                "End-to-end encrypted case data",
                "Intuitive interface with zero learning curve",
                "Global support available 24/7",
                "Seamless integration with existing tools"
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-3 text-text-secondary font-medium">
                  <CheckCircle2 className="text-brand-blue" size={20} />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-border-base text-center">
              <p className="text-4xl font-bold text-brand-blue mb-2">99%</p>
              <p className="text-sm text-text-muted font-medium uppercase tracking-wider">Success Rate</p>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-border-base text-center mt-8">
              <p className="text-4xl font-bold text-brand-blue mb-2">10k+</p>
              <p className="text-sm text-text-muted font-medium uppercase tracking-wider">Cases Resolved</p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-24 bg-white">
        <div className="section-container grid lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-8">
            <h2 className="text-3xl lg:text-6xl font-bold text-brand-dark">Ready for a <span className="gradient-text">Higher Standard?</span></h2>
            <p className="text-lg text-text-secondary leading-relaxed">
              Speak with our specialists to see how Genzura can be tailored to your specific workflow and objectives.
            </p>
            <div className="space-y-4 pt-4">
              <div className="flex items-center gap-4 text-text-secondary">
                <div className="w-10 h-10 rounded-full bg-brand-light flex items-center justify-center text-brand-blue shrink-0">
                  <CheckCircle2 size={20} />
                </div>
                <span>Dedicated deployment specialist for every client</span>
              </div>
              <div className="flex items-center gap-4 text-text-secondary">
                <div className="w-10 h-10 rounded-full bg-brand-light flex items-center justify-center text-brand-blue shrink-0">
                  <CheckCircle2 size={20} />
                </div>
                <span>Custom integration with your existing legacy systems</span>
              </div>
            </div>
          </div>

          <div className="bg-page-bg p-8 lg:p-12 rounded-[2.5rem] border border-border-base shadow-xl">
            <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-brand-dark ml-1">First Name</label>
                  <input type="text" className="w-full h-12 px-4 rounded-xl border border-border-base focus:border-brand-blue outline-none transition-all bg-white" placeholder="John" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-brand-dark ml-1">Last Name</label>
                  <input type="text" className="w-full h-12 px-4 rounded-xl border border-border-base focus:border-brand-blue outline-none transition-all bg-white" placeholder="Doe" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-brand-dark ml-1">Corporate Email</label>
                <input type="email" className="w-full h-12 px-4 rounded-xl border border-border-base focus:border-brand-blue outline-none transition-all bg-white" placeholder="john@company.com" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-brand-dark ml-1">Industry</label>
                <select className="w-full h-12 px-4 rounded-xl border border-border-base focus:border-brand-blue outline-none transition-all bg-white appearance-none">
                  <option>Legal</option>
                  <option>Healthcare</option>
                  <option>Finance</option>
                  <option>Other</option>
                </select>
              </div>
              <button className="w-full bg-brand-blue text-white py-4 rounded-xl font-bold shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all">
                Book My Discovery Call
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-page-bg">
        <div className="section-container">
          <div className="bg-brand-dark rounded-[2.5rem] p-12 lg:p-20 text-white text-center relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 w-64 h-64 bg-brand-blue/20 blur-[100px] rounded-full" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-brand-blue/20 blur-[100px] rounded-full" />

            <div className="relative z-10 space-y-8">
              <h2 className="text-4xl lg:text-6xl font-bold max-w-4xl mx-auto leading-tight">
                Ready to take control of your workload?
              </h2>
              <p className="text-brand-light/80 text-xl max-w-2xl mx-auto">
                Join thousands of experts who trust Genzura for their most critical operations.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Link to="/register" className="bg-white text-brand-dark btn-premium font-bold no-underline">
                  Start Your Free Trial
                </Link>
                <button className="bg-brand-blue text-white btn-premium flex items-center gap-2">
                  Request a Demo <ChevronRight size={18} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border-base py-12 bg-white">
        <div className="section-container flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center">
            <img src="/Genzura website header.png" alt="Genzura" className="h-24 w-auto object-contain" />
          </div>
          <div className="flex gap-8 text-sm text-text-muted font-medium">
            <Link to="/legal/privacy" className="hover:text-brand-blue transition-colors">Privacy Policy</Link>
            <Link to="/legal/terms" className="hover:text-brand-blue transition-colors">Terms of Service</Link>
            <Link to="/legal/security" className="hover:text-brand-blue transition-colors">Security</Link>
          </div>
          <p className="text-sm text-text-muted">
            &copy; 2026 Genzura Inc. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
