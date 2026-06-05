import { useState, useEffect } from 'react';
import { resolveAssetUrl } from '../utils/assetUrl';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search,
  MapPin,
  Filter,
  Building2,
  ChevronRight,
  Users,
  Star,
  X,
} from 'lucide-react';

interface Attorney {
  id: string;
  name: string;
  emailDomain: string;
  phone: string | null;
  company: string | null;
  location: string;
  jobTitle: string;
  avatarUrl: string | null;
  role: string;
  statistics: {
    totalCases: number;
    activeCases: number;
    resolvedCases: number;
    successRate: number;
    specializations: string[];
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

export default function AttorneyDirectoryPage() {
  const [attorneys, setAttorneys] = useState<Attorney[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [locations, setLocations] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  // Fetch attorneys
  useEffect(() => {
    fetchAttorneys();
    fetchLocations();
  }, [searchTerm, selectedLocation]);

  const fetchAttorneys = async () => {
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (selectedLocation) params.append('location', selectedLocation);

      const response = await fetch(`${API_BASE_URL}/public/attorneys?${params}`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        setAttorneys(data.data);
      } else {
        setError('Failed to load attorneys');
      }
    } catch (error) {
      console.error('Error fetching attorneys:', error);
      setError('Failed to load attorneys. Please check your connection and try again.');
      setAttorneys([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchLocations = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/public/attorney-locations`);
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setLocations(data.data);
        }
      }
    } catch (error) {
      console.error('Error fetching locations:', error);
    }
  };

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
              to="/login"
              className="text-text-secondary hover:text-brand-blue font-medium transition-colors"
            >
              Sign In
            </Link>
            <Link
              to="/register"
              className="bg-brand-blue text-white px-6 py-2 rounded-button hover:bg-brand-dark font-medium transition-colors"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-brand-blue to-brand-dark text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Find Your Legal Expert
            </h1>
            <p className="text-xl text-brand-light mb-8 max-w-2xl mx-auto">
              Connect with experienced attorneys across Rwanda. Browse profiles,
              view expertise, and find the right lawyer for your case.
            </p>

            {/* Search Bar */}
            <div className="max-w-3xl mx-auto">
              <div className="bg-white rounded-card shadow-card p-2 flex flex-col md:flex-row gap-2">
                <div className="flex-1 flex items-center gap-2 px-3 py-2 bg-page-bg rounded-button">
                  <Search className="w-5 h-5 text-text-muted" />
                  <input
                    type="text"
                    placeholder="Search by name, firm, or expertise..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="flex-1 bg-transparent border-none focus:outline-none text-text-primary placeholder-text-muted"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="flex items-center gap-2 px-4 py-2 bg-page-bg text-text-secondary rounded-button hover:bg-brand-light transition-colors"
                  >
                    <Filter className="w-4 h-4" />
                    Filters
                    {selectedLocation && (
                      <span className="bg-brand-blue text-white text-xs px-2 py-0.5 rounded-full">
                        1
                      </span>
                    )}
                  </button>
                </div>
              </div>

              {/* Filters Dropdown */}
              {showFilters && (
                <div className="mt-4 bg-white rounded-card shadow-card p-4 text-left">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-text-primary">Filters</h3>
                    <button
                      onClick={() => setShowFilters(false)}
                      className="text-text-muted hover:text-text-secondary"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-text-secondary mb-1">
                        Location
                      </label>
                      <select
                        value={selectedLocation}
                        onChange={(e) => setSelectedLocation(e.target.value)}
                        className="w-full px-3 py-2 border border-border-base rounded-button focus:outline-none focus:ring-2 focus:ring-brand-blue text-text-primary"
                      >
                        <option value="">All Locations</option>
                        {locations.map((loc) => (
                          <option key={loc} value={loc}>
                            {loc}
                          </option>
                        ))}
                      </select>
                    </div>
                    {selectedLocation && (
                      <button
                        onClick={() => setSelectedLocation('')}
                        className="text-sm text-brand-blue hover:text-brand-dark"
                      >
                        Clear filters
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Results Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Results Count */}
        <div className="mb-6">
          <p className="text-text-secondary">
            {loading ? (
              'Loading attorneys...'
            ) : (
              <>
                <span className="font-semibold text-text-primary">
                  {attorneys.length}
                </span>{' '}
                {attorneys.length === 1 ? 'attorney' : 'attorneys'} found
                {searchTerm && (
                  <span>
                    {' '}
                    for "<span className="font-medium">{searchTerm}</span>"
                  </span>
                )}
                {selectedLocation && (
                  <span>
                    {' '}
                    in <span className="font-medium">{selectedLocation}</span>
                  </span>
                )}
              </>
            )}
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-danger-bg border border-red-300 rounded-card p-4 mb-6">
            <p className="text-danger-text font-medium">{error}</p>
            <button
              onClick={() => fetchAttorneys()}
              className="mt-2 text-brand-blue hover:text-brand-dark font-medium"
            >
              Try again
            </button>
          </div>
        )}

        {/* Attorney Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="bg-white rounded-card shadow-card p-6 animate-pulse"
              >
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 bg-page-bg rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-page-bg rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-page-bg rounded w-1/2"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-text-muted mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-text-primary mb-2">
              Failed to load attorneys
            </h3>
            <p className="text-text-secondary mb-4">
              Please check your connection and try again
            </p>
          </div>
        ) : attorneys.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No attorneys found
            </h3>
            <p className="text-gray-600 mb-4">
              Try adjusting your search or filters
            </p>
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedLocation('');
              }}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Clear all filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {attorneys.map((attorney) => (
              <AttorneyCard key={attorney.id} attorney={attorney} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Attorney Card Component
function AttorneyCard({ attorney }: { attorney: Attorney }) {
  const navigate = useNavigate();

  return (
    <div className="bg-white rounded-card shadow-card hover:shadow-xl transition-all p-6 cursor-pointer border border-border-base hover:-translate-y-1">
      <div className="flex items-start gap-4 mb-4">
        {/* Avatar */}
        {attorney.avatarUrl ? (
          <img
            src={resolveAssetUrl(attorney.avatarUrl)}
            alt={attorney.name}
            onError={(e) => {
              // Replace broken image with initials fallback
              const target = e.currentTarget;
              const parent = target.parentElement;
              if (parent) {
                const initials = attorney.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
                const fallback = document.createElement('div');
                fallback.className = 'w-16 h-16 rounded-full bg-gradient-to-br from-brand-blue to-brand-dark flex items-center justify-center text-white font-bold text-lg border-2 border-brand-light';
                fallback.textContent = initials;
                parent.replaceChild(fallback, target);
              }
            }}
            className="w-16 h-16 rounded-full object-cover border-2 border-brand-light"
          />
        ) : (
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-brand-blue to-brand-dark flex items-center justify-center text-white font-bold text-lg border-2 border-brand-light">
            {attorney.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
          </div>
        )}

        {/* Info */}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-lg text-text-primary truncate">
            {attorney.name}
          </h3>
          <p className="text-sm text-text-secondary truncate">{attorney.jobTitle}</p>
          {attorney.role === 'Senior_Attorney' && (
            <span className="inline-flex items-center gap-1 text-xs bg-warning-bg text-warning-text px-2 py-0.5 rounded-full mt-1">
              <Star className="w-3 h-3" />
              Senior Attorney
            </span>
          )}
        </div>
      </div>

      {/* Company & Location */}
      <div className="space-y-2 mb-4 text-sm text-text-secondary">
        {attorney.company && (
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-text-muted flex-shrink-0" />
            <span className="truncate">{attorney.company}</span>
          </div>
        )}
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-text-muted flex-shrink-0" />
          <span>{attorney.location}</span>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-3 gap-3 mb-4 pb-4 border-b border-border-base">
        <div className="text-center">
          <div className="text-lg font-bold text-text-primary">
            {attorney.statistics.totalCases}
          </div>
          <div className="text-xs text-text-muted">Cases</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-brand-green">
            {attorney.statistics.successRate}%
          </div>
          <div className="text-xs text-text-muted">Success</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-brand-blue">
            {attorney.statistics.activeCases}
          </div>
          <div className="text-xs text-text-muted">Active</div>
        </div>
      </div>

      {/* Specializations */}
      {attorney.statistics.specializations.length > 0 && (
        <div className="mb-4">
          <p className="text-xs font-medium text-text-secondary mb-2">
            Specializations:
          </p>
          <div className="flex flex-wrap gap-1">
            {attorney.statistics.specializations.map((spec) => (
              <span
                key={spec}
                className="text-xs bg-brand-light text-brand-blue px-2 py-1 rounded-full"
              >
                {CASE_TYPE_LABELS[spec] || spec}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* View Profile Button */}
      <button
        onClick={() => navigate(`/attorneys/${attorney.id}`)}
        className="w-full bg-brand-blue text-white py-2 rounded-button hover:bg-brand-dark transition-colors flex items-center justify-center gap-2 font-medium"
      >
        View Profile
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}
