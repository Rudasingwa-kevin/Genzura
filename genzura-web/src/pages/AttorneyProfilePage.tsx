import { useState, useEffect } from 'react';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Building2,
  Briefcase,
  Award,
  TrendingUp,
  Scale,
  CheckCircle2,
  Star,
  BarChart3,
  FileText,
  Download,
  GraduationCap,
  BadgeCheck,
  Calendar,
} from 'lucide-react';
import { toast } from 'react-hot-toast';

interface AttorneyDocument {
  id: string;
  type: string;
  title: string;
  description: string | null;
  fileUrl: string;
  fileName: string;
  fileSize: number | null;
  mimeType: string | null;
  issuedDate: string | null;
  expiryDate: string | null;
  issuer: string | null;
  uploadedAt: string;
}

interface AttorneyProfile {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  company: string | null;
  location: string;
  jobTitle: string;
  avatarUrl: string | null;
  role: string;
  language: string | null;
  bio: string | null;
  education: string | null;
  barNumber: string | null;
  specializations: string[];
  professionalDocuments: AttorneyDocument[];
  statistics: {
    totalCases: number;
    activeCases: number;
    pendingCases: number;
    resolvedCases: number;
    archivedCases: number;
    successRate: number;
    specializations: Array<{
      type: string;
      count: number;
      percentage: number;
    }>;
  };
}

const CASE_TYPE_LABELS: Record<string, string> = {
  Litigation: 'Litigation',
  Corporate: 'Corporate Law',
  Compliance: 'Compliance',
  IP: 'Intellectual Property',
  Employment: 'Employment Law',
  MA: 'Mergers & Acquisitions',
  Real_Estate: 'Real Estate',
};

export default function AttorneyProfilePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [attorney, setAttorney] = useState<AttorneyProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchAttorney();
    }
  }, [id]);

  const fetchAttorney = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/public/attorneys/${id}`);
      const data = await response.json();

      if (data.success) {
        setAttorney(data.data);
      } else {
        toast.error('Attorney not found');
        navigate('/attorneys');
      }
    } catch (error) {
      console.error('Error fetching attorney:', error);
      toast.error('Failed to load attorney profile');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-page-bg flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-blue mx-auto mb-4"></div>
          <p className="text-text-secondary">Loading attorney profile...</p>
        </div>
      </div>
    );
  }

  if (!attorney) {
    return (
      <div className="min-h-screen bg-page-bg flex items-center justify-center">
        <div className="text-center">
          <p className="text-text-secondary mb-4">Attorney not found</p>
          <Link
            to="/attorneys"
            className="text-brand-blue hover:text-brand-dark font-medium"
          >
            Back to directory
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-page-bg">
      {/* Header */}
      <header className="bg-white border-b border-border-base sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-navbar flex items-center justify-between">
          <Link to="/" className="flex items-center">
            <img
              src="/Genzura website header.png"
              alt="Genzura"
              className="h-24 w-auto object-contain"
            />
          </Link>
          <div className="flex items-center gap-4">
            <Link
              to="/attorneys"
              className="text-text-secondary hover:text-brand-blue font-medium flex items-center gap-2 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              All Attorneys
            </Link>
          </div>
        </div>
      </header>

      {/* Profile Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Header Card */}
        <div className="bg-white rounded-card shadow-card overflow-hidden mb-6">
          {/* Cover */}
          <div className="h-32 bg-gradient-to-r from-brand-blue to-brand-dark"></div>

          <div className="px-6 pb-6">
            {/* Avatar and Name */}
            <div className="flex flex-col md:flex-row md:justify-between -mt-16 mb-4">
              <div className="flex items-start gap-5">
                {/* Avatar - fixed size, flex-shrink-0 prevents squishing */}
                <div className="flex-shrink-0">
                  {attorney.avatarUrl ? (
                    <img
                      src={attorney.avatarUrl}
                      alt={attorney.name}
                      onError={(e) => {
                        // Replace broken image with initials fallback
                        const target = e.currentTarget;
                        const parent = target.parentElement;
                        if (parent) {
                          const initials = attorney.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
                          const fallback = document.createElement('div');
                          fallback.className = 'w-32 h-32 rounded-card bg-gradient-to-br from-brand-blue to-brand-dark flex items-center justify-center text-white font-bold text-3xl border-4 border-white shadow-xl';
                          fallback.textContent = initials;
                          parent.replaceChild(fallback, target);
                        }
                      }}
                      className="w-32 h-32 rounded-card object-cover border-4 border-white shadow-xl"
                    />
                  ) : (
                    <div className="w-32 h-32 rounded-card bg-gradient-to-br from-brand-blue to-brand-dark flex items-center justify-center text-white font-bold text-3xl border-4 border-white shadow-xl">
                      {attorney.name
                        .split(' ')
                        .map((n) => n[0])
                        .join('')
                        .toUpperCase()
                        .slice(0, 2)}
                    </div>
                  )}
                </div>

                {/* Name & Title - pushed down so it aligns with the visible portion below cover */}
                <div className="mt-[4.5rem] min-w-0">
                  <h1 className="text-3xl font-bold text-text-primary mb-1 truncate">
                    {attorney.name}
                  </h1>
                  <p className="text-lg text-text-secondary mb-2">
                    {attorney.jobTitle}
                  </p>
                  {attorney.role === 'Senior_Attorney' && (
                    <span className="inline-flex items-center gap-1 text-sm bg-warning-bg text-warning-text px-3 py-1 rounded-full">
                      <Star className="w-4 h-4" />
                      Senior Attorney
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Contact Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 pt-6 border-t border-border-base">
              {attorney.company && (
                <div className="flex items-center gap-3">
                  <Building2 className="w-5 h-5 text-text-muted" />
                  <div>
                    <p className="text-xs text-text-muted">Law Firm</p>
                    <p className="font-medium text-text-primary">
                      {attorney.company}
                    </p>
                  </div>
                </div>
              )}
              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-text-muted" />
                <div>
                  <p className="text-xs text-text-muted">Location</p>
                  <p className="font-medium text-text-primary">
                    {attorney.location}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Bio Section */}
            {attorney.bio && (
              <div className="bg-white rounded-card shadow-card p-6">
                <h2 className="text-xl font-bold text-text-primary mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-brand-blue" />
                  About
                </h2>
                <p className="text-text-secondary whitespace-pre-line leading-relaxed">
                  {attorney.bio}
                </p>
              </div>
            )}

            {/* Statistics */}
            <div className="bg-white rounded-card shadow-card p-6">
              <h2 className="text-xl font-bold text-text-primary mb-4 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-brand-blue" />
                Case Statistics
              </h2>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <StatCard
                  label="Total Cases"
                  value={attorney.statistics.totalCases}
                  icon={Briefcase}
                  color="blue"
                />
                <StatCard
                  label="Active Cases"
                  value={attorney.statistics.activeCases}
                  icon={TrendingUp}
                  color="green"
                />
                <StatCard
                  label="Resolved"
                  value={attorney.statistics.resolvedCases}
                  icon={CheckCircle2}
                  color="purple"
                />
                <StatCard
                  label="Success Rate"
                  value={`${attorney.statistics.successRate}%`}
                  icon={Award}
                  color="amber"
                />
              </div>

              {/* Case Status Breakdown */}
              <div className="pt-4 border-t border-border-base">
                <h3 className="text-sm font-semibold text-text-secondary mb-3">
                  Case Status Distribution
                </h3>
                <div className="space-y-2">
                  <StatusBar
                    label="Active"
                    count={attorney.statistics.activeCases}
                    total={attorney.statistics.totalCases}
                    color="green"
                  />
                  <StatusBar
                    label="Pending"
                    count={attorney.statistics.pendingCases}
                    total={attorney.statistics.totalCases}
                    color="yellow"
                  />
                  <StatusBar
                    label="Resolved"
                    count={attorney.statistics.resolvedCases}
                    total={attorney.statistics.totalCases}
                    color="blue"
                  />
                  <StatusBar
                    label="Archived"
                    count={attorney.statistics.archivedCases}
                    total={attorney.statistics.totalCases}
                    color="gray"
                  />
                </div>
              </div>
            </div>

            {/* Specializations */}
            <div className="bg-white rounded-card shadow-card p-6">
              <h2 className="text-xl font-bold text-text-primary mb-4 flex items-center gap-2">
                <Scale className="w-5 h-5 text-brand-blue" />
                Areas of Expertise
              </h2>

              {attorney.statistics.specializations.length > 0 ? (
                <div className="space-y-4">
                  {attorney.statistics.specializations.map((spec) => (
                    <div key={spec.type}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-text-primary">
                          {CASE_TYPE_LABELS[spec.type] || spec.type}
                        </span>
                        <span className="text-sm text-text-secondary">
                          {spec.count} cases ({spec.percentage}%)
                        </span>
                      </div>
                      <div className="w-full bg-page-bg rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-brand-blue to-brand-dark h-2 rounded-full transition-all"
                          style={{ width: `${spec.percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-text-secondary">
                  No specialization data available yet.
                </p>
              )}
            </div>

            {/* Professional Documents */}
            {attorney.professionalDocuments && attorney.professionalDocuments.length > 0 && (
              <div className="bg-white rounded-card shadow-card p-6">
                <h2 className="text-xl font-bold text-text-primary mb-4 flex items-center gap-2">
                  <GraduationCap className="w-5 h-5 text-brand-blue" />
                  Credentials & Documents
                </h2>
                <div className="space-y-3">
                  {attorney.professionalDocuments.map((doc) => (
                    <DocumentCard key={doc.id} document={doc} />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contact Card */}
            <div className="bg-white rounded-card shadow-card p-6">
              <h3 className="text-lg font-bold text-text-primary mb-4">
                Contact Information
              </h3>
              <div className="space-y-3">
                <a
                  href={`mailto:${attorney.email}`}
                  className="flex items-center gap-3 text-text-secondary hover:text-brand-blue transition-colors"
                >
                  <Mail className="w-5 h-5" />
                  <span className="text-sm break-all">{attorney.email}</span>
                </a>
                {attorney.phone && (
                  <a
                    href={`tel:${attorney.phone}`}
                    className="flex items-center gap-3 text-text-secondary hover:text-brand-blue transition-colors"
                  >
                    <Phone className="w-5 h-5" />
                    <span className="text-sm">{attorney.phone}</span>
                  </a>
                )}
              </div>
            </div>

            {/* Education & Credentials */}
            {(attorney.education || attorney.barNumber) && (
              <div className="bg-white rounded-card shadow-card p-6">
                <h3 className="text-lg font-bold text-text-primary mb-4">
                  Education & Credentials
                </h3>
                <div className="space-y-3 text-sm">
                  {attorney.education && (
                    <div>
                      <div className="flex items-start gap-2 mb-1">
                        <GraduationCap className="w-4 h-4 text-brand-blue mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-xs text-text-muted mb-1">Education</p>
                          <p className="text-text-primary">{attorney.education}</p>
                        </div>
                      </div>
                    </div>
                  )}
                  {attorney.barNumber && (
                    <div>
                      <div className="flex items-start gap-2 mb-1">
                        <BadgeCheck className="w-4 h-4 text-brand-blue mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-xs text-text-muted mb-1">Bar Number</p>
                          <p className="text-text-primary">{attorney.barNumber}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Quick Facts */}
            <div className="bg-gradient-to-br from-brand-light to-page-bg rounded-card p-6 border border-brand-light">
              <h3 className="text-lg font-bold text-text-primary mb-4">
                Quick Facts
              </h3>
              <div className="space-y-3 text-sm">
                {attorney.language && (
                  <div className="flex items-center justify-between">
                    <span className="text-text-secondary">Languages</span>
                    <span className="font-medium text-text-primary">
                      {attorney.language}
                    </span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-text-secondary">Availability</span>
                  <span className="inline-flex items-center gap-1 text-brand-green font-medium">
                    <div className="w-2 h-2 bg-brand-green rounded-full"></div>
                    Available
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper Components
function StatCard({
  label,
  value,
  icon: Icon,
  color,
}: {
  label: string;
  value: string | number;
  icon: any;
  color: string;
}) {
  const colorClasses: Record<string, string> = {
    blue: 'bg-brand-light text-brand-blue',
    green: 'bg-brand-green-light text-brand-green',
    purple: 'bg-purple-50 text-purple-600',
    amber: 'bg-warning-bg text-warning-text',
  };

  return (
    <div className="text-center">
      <div
        className={`${colorClasses[color]} w-12 h-12 rounded-button flex items-center justify-center mx-auto mb-2`}
      >
        <Icon className="w-6 h-6" />
      </div>
      <div className="text-2xl font-bold text-text-primary">{value}</div>
      <div className="text-xs text-text-muted">{label}</div>
    </div>
  );
}

function DocumentCard({ document }: { document: AttorneyDocument }) {
  const getDocumentIcon = (type: string) => {
    switch (type) {
      case 'CV':
        return FileText;
      case 'Certificate':
      case 'Award':
        return Award;
      case 'BarLicense':
        return BadgeCheck;
      case 'Education':
        return GraduationCap;
      default:
        return FileText;
    }
  };

  const getDocumentColor = (type: string) => {
    switch (type) {
      case 'CV':
        return 'bg-brand-light text-brand-blue';
      case 'Certificate':
      case 'Award':
        return 'bg-warning-bg text-warning-text';
      case 'BarLicense':
        return 'bg-brand-green-light text-brand-green';
      case 'Education':
        return 'bg-purple-50 text-purple-600';
      default:
        return 'bg-page-bg text-text-secondary';
    }
  };

  const Icon = getDocumentIcon(document.type);
  const colorClass = getDocumentColor(document.type);

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
    });
  };

  return (
    <a
      href={document.fileUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-start gap-3 p-3 border border-border-base rounded-button hover:bg-page-bg transition-colors group"
    >
      <div className={`${colorClass} p-2 rounded-button flex-shrink-0`}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-text-primary group-hover:text-brand-blue transition-colors truncate">
              {document.title}
            </h4>
            {document.description && (
              <p className="text-sm text-text-muted mt-1 line-clamp-2">
                {document.description}
              </p>
            )}
            <div className="flex items-center gap-3 mt-2 text-xs text-text-muted">
              {document.issuer && <span>{document.issuer}</span>}
              {document.issuedDate && (
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {formatDate(document.issuedDate)}
                </span>
              )}
              {document.fileSize && <span>{formatFileSize(document.fileSize)}</span>}
            </div>
          </div>
          <Download className="w-4 h-4 text-text-muted group-hover:text-brand-blue transition-colors flex-shrink-0" />
        </div>
      </div>
    </a>
  );
}

function StatusBar({
  label,
  count,
  total,
  color,
}: {
  label: string;
  count: number;
  total: number;
  color: string;
}) {
  const percentage = total > 0 ? Math.round((count / total) * 100) : 0;

  const colorClasses: Record<string, string> = {
    green: 'bg-brand-green',
    yellow: 'bg-yellow-500',
    blue: 'bg-brand-blue',
    gray: 'bg-text-muted',
  };

  return (
    <div>
      <div className="flex items-center justify-between text-sm mb-1">
        <span className="text-text-secondary">{label}</span>
        <span className="text-text-primary font-medium">
          {count} ({percentage}%)
        </span>
      </div>
      <div className="w-full bg-page-bg rounded-full h-1.5">
        <div
          className={`${colorClasses[color]} h-1.5 rounded-full transition-all`}
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  );
}
