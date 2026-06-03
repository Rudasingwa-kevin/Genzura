import { useState, useEffect } from 'react';
import { X, AlertTriangle, Calendar, Clock, ArrowRight } from 'lucide-react';
import { caseService } from '../api/services/case.service';
import { useAuth } from '../contexts/AuthContext';

interface CaseDeadline {
  id: string;
  caseNumber: string;
  title: string;
  deadline: string;
  status: string;
  attorneyId: string;
}

export default function CaseDeadlineWarningBanner() {
  const { user } = useAuth();
  const [urgentCase, setUrgentCase] = useState<CaseDeadline | null>(null);
  const [otherCount, setOtherCount] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (user?.id) {
      checkDeadlines();
    }
  }, [user]);

  const checkDeadlines = async () => {
    try {
      const cases: CaseDeadline[] = await caseService.getAll();
      
      const now = new Date();
      now.setHours(0, 0, 0, 0);

      // Filter active/pending cases assigned to this attorney with a deadline
      const activeUserCases = cases.filter(c => 
        c.attorneyId === user?.id &&
        c.deadline &&
        ['Active', 'Pending'].includes(c.status)
      );

      // Calculate days remaining and identify urgent/expired ones (<= 3 days)
      const urgentCasesWithDays = activeUserCases
        .map(c => {
          const deadline = new Date(c.deadline);
          deadline.setHours(0, 0, 0, 0);
          const diffTime = deadline.getTime() - now.getTime();
          const daysRemaining = Math.round(diffTime / (1000 * 60 * 60 * 24));
          return { case: c, daysRemaining };
        })
        .filter(item => item.daysRemaining <= 3) // 3, 2, 1, 0, -1, -2, etc.
        .sort((a, b) => a.daysRemaining - b.daysRemaining); // Most urgent/overdue first

      if (urgentCasesWithDays.length > 0) {
        const primary = urgentCasesWithDays[0];
        
        // Check if user dismissed this specific case banner for this session
        const dismissedKey = `dismissed-deadline-banner-${primary.case.caseNumber}`;
        if (!sessionStorage.getItem(dismissedKey)) {
          setUrgentCase(primary.case);
          setOtherCount(urgentCasesWithDays.length - 1);
          setIsVisible(true);
        } else {
          setIsVisible(false);
        }
      } else {
        setIsVisible(false);
      }
    } catch (error) {
      console.error('Failed to load case deadlines for banner:', error);
      setIsVisible(false);
    }
  };

  const handleDismiss = () => {
    if (urgentCase) {
      sessionStorage.setItem(`dismissed-deadline-banner-${urgentCase.caseNumber}`, 'true');
    }
    setIsVisible(false);
  };

  if (!isVisible || !urgentCase) return null;

  const deadlineDate = new Date(urgentCase.deadline);
  deadlineDate.setHours(0, 0, 0, 0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diffDays = Math.round((deadlineDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  const isExpired = diffDays < 0;
  const isDueToday = diffDays === 0;
  const isDueTomorrow = diffDays === 1;

  // Choose style based on urgency level
  const isCritical = isExpired || isDueToday || isDueTomorrow;
  
  const colors = isCritical
    ? {
        bg: 'bg-gradient-to-r from-red-50 to-orange-50',
        border: 'border-red-300',
        text: 'text-red-950',
        accent: 'text-red-600',
        iconBg: 'bg-red-100',
        button: 'bg-red-600 hover:bg-red-700 shadow-red-200'
      }
    : {
        bg: 'bg-gradient-to-r from-amber-50 to-orange-50',
        border: 'border-amber-300',
        text: 'text-amber-950',
        accent: 'text-amber-600',
        iconBg: 'bg-amber-100',
        button: 'bg-amber-600 hover:bg-amber-700 shadow-amber-200'
      };

  const getUrgencyText = () => {
    if (isExpired) {
      const absDays = Math.abs(diffDays);
      return `EXPIRED ${absDays} ${absDays === 1 ? 'day' : 'days'} ago`;
    }
    if (isDueToday) return 'DUE TODAY';
    if (isDueTomorrow) return 'DUE TOMORROW';
    return `DUE IN ${diffDays} DAYS`;
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className={`${colors.bg} border-2 ${colors.border} rounded-2xl p-6 mb-6 shadow-md relative overflow-hidden animate-in fade-in slide-in-from-top-4 duration-500`}>
      {/* Micro-animation glow */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 animate-pulse bg-gradient-to-r from-transparent via-white to-transparent" />
      </div>

      {/* Dismiss Button */}
      <button
        onClick={handleDismiss}
        className={`absolute top-4 right-4 p-2 rounded-lg hover:bg-white/50 ${colors.text} transition-all z-10 opacity-60 hover:opacity-100`}
        aria-label="Dismiss temporarily"
      >
        <X size={18} />
      </button>

      <div className="relative z-10">
        <div className="flex items-start gap-4">
          {/* Animated Icon */}
          <div className={`w-14 h-14 rounded-2xl ${colors.iconBg} flex items-center justify-center shrink-0 ${isCritical ? 'animate-pulse' : ''}`}>
            <AlertTriangle size={28} className={colors.accent} />
          </div>

          {/* Content */}
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2 flex-wrap">
              <h3 className={`text-lg font-extrabold ${colors.text}`}>
                {isExpired ? 'Critical Action Required: Case Deadline Expired!' : 'Urgent Reminder: Case Deadline Approaching!'}
              </h3>
              <span className={`inline-flex items-center gap-1 text-[10px] font-extrabold px-3 py-1 rounded-full text-white shadow-sm tracking-wider ${isCritical ? 'bg-red-500 animate-pulse' : 'bg-amber-500'}`}>
                <Clock size={10} />
                {getUrgencyText()}
              </span>
              {otherCount > 0 && (
                <span className="inline-flex items-center text-[10px] font-bold px-2.5 py-1 rounded-full bg-white/80 border border-border-base text-text-secondary">
                  +{otherCount} other urgent {otherCount === 1 ? 'case' : 'cases'}
                </span>
              )}
            </div>

            <p className={`text-sm ${colors.text} opacity-90 mb-4 leading-relaxed max-w-3xl`}>
              {isExpired 
                ? `The deadline for case **${urgentCase.caseNumber} - ${urgentCase.title}** has expired. Please review and update the status, upload necessary case documents, or contact the court as soon as possible.`
                : `You have an approaching deadline on **${formatDate(deadlineDate)}** for case **${urgentCase.caseNumber} - ${urgentCase.title}**. Make sure to finalize all filings before then.`
              }
            </p>

            {/* Quick Facts Card */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 mb-4 max-w-2xl">
              <div className="bg-white/60 backdrop-blur-sm rounded-xl p-3 border border-white/50">
                <div className="flex items-center gap-2 mb-1">
                  <Calendar size={14} className={colors.accent} />
                  <span className={`text-[10px] font-bold uppercase tracking-wider ${colors.text} opacity-60`}>
                    Deadline Date
                  </span>
                </div>
                <p className={`text-sm font-bold ${colors.text}`}>
                  {formatDate(deadlineDate)}
                </p>
              </div>

              <div className="bg-white/60 backdrop-blur-sm rounded-xl p-3 border border-white/50">
                <div className="flex items-center gap-2 mb-1">
                  <Clock size={14} className={colors.accent} />
                  <span className={`text-[10px] font-bold uppercase tracking-wider ${colors.text} opacity-60`}>
                    Urgency
                  </span>
                </div>
                <p className={`text-sm font-bold ${colors.text}`}>
                  {getUrgencyText().toLowerCase()}
                </p>
              </div>
            </div>

            {/* CTA */}
            <div className="flex items-center gap-3">
              <a
                href={`/cases/${urgentCase.caseNumber}`}
                className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-white font-extrabold text-xs shadow-md transition-all transform hover:scale-[1.03] active:scale-95 ${colors.button}`}
              >
                View Case Details
                <ArrowRight size={14} />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
