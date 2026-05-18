import { X } from 'lucide-react';
import PricingPage from '../pages/PricingPage';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  limitType?: 'cases' | 'documents';
}

export default function UpgradeModal({ isOpen, onClose, limitType }: UpgradeModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-7xl bg-page-bg rounded-[3rem] shadow-2xl animate-in-fade">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-8 right-8 z-10 w-12 h-12 rounded-full bg-white border-2 border-border-base hover:bg-red-50 hover:border-red-200 transition-all flex items-center justify-center group"
          >
            <X size={20} className="text-text-muted group-hover:text-red-500 transition-colors" />
          </button>

          {/* Content */}
          <div className="p-8 max-h-[90vh] overflow-y-auto">
            <PricingPage variant="limit-reached" limitType={limitType} />
          </div>
        </div>
      </div>
    </div>
  );
}
