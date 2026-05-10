import type { ReactNode } from 'react';
import { SearchIllustration, NotificationsIllustration, GenericIllustration } from './Illustrations';

interface EmptyStateProps {
  title: string;
  description: string;
  illustration: 'search' | 'notifications' | 'generic';
  action?: ReactNode;
}

export default function EmptyState({ title, description, illustration, action }: EmptyStateProps) {
  const Illustration = {
    search: SearchIllustration,
    notifications: NotificationsIllustration,
    generic: GenericIllustration,
  }[illustration];

  return (
    <div className="flex flex-col items-center justify-center py-20 px-6 text-center animate-in fade-in zoom-in-95 duration-700">
      <div className="relative mb-8 group">
        {/* Glow effect */}
        <div className="absolute inset-0 bg-brand-blue/10 blur-[60px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
        
        <div className="relative z-10 transform transition-transform duration-700 group-hover:scale-105">
          <Illustration />
        </div>
      </div>
      
      <h3 className="text-2xl font-bold text-brand-dark mb-3 tracking-tight">
        {title}
      </h3>
      
      <p className="text-text-secondary max-w-sm mx-auto mb-8 font-medium leading-relaxed">
        {description}
      </p>
      
      {action && (
        <div className="animate-in fade-in slide-in-from-bottom-4 delay-300 fill-mode-both">
          {action}
        </div>
      )}
    </div>
  );
}
