import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

const routeConfig: Record<string, string> = {
  dashboard: 'Dashboard',
  cases: 'Cases',
  calendar: 'Calendar',
  documents: 'Documents',
  clients: 'Clients',
  analytics: 'Analytics',
  settings: 'Settings',
};

export default function Breadcrumbs({ customLabel }: { customLabel?: string }) {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter((x) => x);

  // Don't show breadcrumbs on landing/auth pages if they don't have a path
  if (pathnames.length === 0) return null;

  return (
    <nav className="flex items-center gap-2 animate-in fade-in slide-in-from-left-4 duration-500">
      <Link
        to="/dashboard"
        className="flex items-center justify-center w-8 h-8 rounded-lg bg-white border border-border-base text-text-muted hover:text-brand-blue hover:border-brand-blue/30 transition-all shadow-sm"
      >
        <Home size={14} />
      </Link>

      {pathnames.map((value, index) => {
        const last = index === pathnames.length - 1;
        const to = `/${pathnames.slice(0, index + 1).join('/')}`;
        let label = routeConfig[value] || value.toUpperCase();
        if (last && customLabel) label = customLabel;

        return (
          <div key={to} className="flex items-center gap-2">
            <ChevronRight size={14} className="text-text-muted/40" />
            {last ? (
              <span className="text-xs font-bold text-brand-blue bg-brand-light/50 px-3 py-1.5 rounded-lg border border-brand-blue/10">
                {label}
              </span>
            ) : (
              <Link
                to={to}
                className="text-xs font-bold text-text-muted hover:text-brand-dark transition-colors"
              >
                {label}
              </Link>
            )}
          </div>
        );
      })}
    </nav>
  );
}
