import { Search, Bell, FileText, Sparkles } from 'lucide-react';

export function SearchIllustration() {
  return (
    <div className="relative w-48 h-48 flex items-center justify-center">
      {/* Background shapes */}
      <div className="absolute top-4 left-4 w-32 h-32 bg-brand-blue/5 rounded-[2.5rem] rotate-12 animate-pulse" />
      <div className="absolute bottom-4 right-4 w-28 h-28 bg-emerald-500/5 rounded-full -rotate-12 animate-pulse delay-700" />
      
      {/* Document silhouettes */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-32 bg-white border border-border-base rounded-2xl shadow-sm rotate-[-8deg] opacity-40 transition-transform group-hover:rotate-[-12deg] duration-700">
        <div className="p-4 space-y-2">
          <div className="w-full h-1.5 bg-slate-100 rounded-full" />
          <div className="w-2/3 h-1.5 bg-slate-100 rounded-full" />
          <div className="w-full h-1.5 bg-slate-100 rounded-full" />
        </div>
      </div>
      
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-32 bg-white border border-border-base rounded-2xl shadow-md rotate-[4deg] transition-transform group-hover:rotate-[8deg] duration-700">
        <div className="p-4 space-y-2">
          <div className="w-full h-1.5 bg-slate-100 rounded-full" />
          <div className="w-full h-1.5 bg-slate-100 rounded-full" />
          <div className="w-3/4 h-1.5 bg-slate-100 rounded-full" />
        </div>
      </div>

      {/* Main Icon */}
      <div className="relative z-10 w-20 h-20 bg-brand-blue text-white rounded-3xl flex items-center justify-center shadow-2xl shadow-brand-blue/30 transform transition-transform duration-700 group-hover:scale-110 group-hover:rotate-3">
        <Search size={36} strokeWidth={2.5} />
      </div>
    </div>
  );
}

export function NotificationsIllustration() {
  return (
    <div className="relative w-48 h-48 flex items-center justify-center">
      {/* Radiating circles */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-40 h-40 border-2 border-emerald-500/10 rounded-full animate-ping duration-[3s]" />
        <div className="absolute w-32 h-32 border-2 border-brand-blue/10 rounded-full animate-ping duration-[2s] delay-1000" />
      </div>

      {/* Sparkles */}
      <div className="absolute top-8 right-8 text-amber-400 animate-bounce duration-[4s]">
        <Sparkles size={24} />
      </div>
      <div className="absolute bottom-12 left-10 text-emerald-400 animate-pulse delay-500">
        <Sparkles size={16} />
      </div>

      {/* Main Icon */}
      <div className="relative z-10 w-20 h-20 bg-emerald-500 text-white rounded-[2rem] flex items-center justify-center shadow-2xl shadow-emerald-500/30 transform transition-transform duration-700 group-hover:scale-110 group-hover:-rotate-3">
        <Bell size={36} strokeWidth={2.5} />
      </div>
    </div>
  );
}

export function GenericIllustration() {
  return (
    <div className="relative w-48 h-48 flex items-center justify-center">
      {/* Background grid/dots pattern */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none overflow-hidden rounded-full bg-[radial-gradient(#185FA5_1px,transparent_1px)] [background-size:16px_16px]" />
      
      {/* Floating elements */}
      <div className="absolute top-10 right-12 w-10 h-10 bg-brand-blue/10 rounded-xl rotate-45 animate-bounce duration-[6s]" />
      <div className="absolute bottom-12 left-12 w-8 h-8 bg-slate-200 rounded-lg -rotate-12 animate-pulse" />

      {/* Main Icon container */}
      <div className="relative z-10 w-24 h-24">
        <div className="absolute inset-0 bg-brand-dark rounded-3xl rotate-6 opacity-5 group-hover:rotate-12 transition-transform duration-700" />
        <div className="absolute inset-0 bg-brand-dark rounded-3xl -rotate-3 opacity-5 group-hover:-rotate-6 transition-transform duration-700" />
        <div className="relative z-10 w-full h-full bg-white border-2 border-border-base rounded-3xl flex items-center justify-center shadow-xl transform transition-transform duration-700 group-hover:translate-y-[-8px]">
          <FileText size={40} className="text-brand-blue" strokeWidth={1.5} />
        </div>
      </div>
    </div>
  );
}
