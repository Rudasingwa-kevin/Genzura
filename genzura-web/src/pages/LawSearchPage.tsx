import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Search, Scale, Filter, ChevronRight, BookOpen,
  ExternalLink, X, Loader2, FileText, Tag
} from 'lucide-react';
import { lawService } from '../api/services/law.service';

const LAW_TYPE_LABELS: Record<string, string> = {
  Penal_Code: 'Penal Code',
  Commercial_Code: 'Commercial Code',
  Labor_Code: 'Labor Code',
  Land_Code: 'Land Code',
  Intellectual_Property: 'Intellectual Property',
  Civil_Code: 'Civil Code',
  Family_Code: 'Family Code',
  Tax_Code: 'Tax Code',
  Environmental_Code: 'Environmental Law',
  Administrative_Code: 'Administrative Law',
  Corporate_Law: 'Corporate Law',
  Banking_Law: 'Banking & Finance',
  Insurance_Law: 'Insurance Law',
  Constitution: 'Constitution',
  Other: 'Other',
};

const LAW_TYPE_COLORS: Record<string, string> = {
  Penal_Code: 'bg-red-50 text-red-600 border-red-200',
  Commercial_Code: 'bg-blue-50 text-blue-600 border-blue-200',
  Labor_Code: 'bg-amber-50 text-amber-600 border-amber-200',
  Land_Code: 'bg-emerald-50 text-emerald-600 border-emerald-200',
  Intellectual_Property: 'bg-violet-50 text-violet-600 border-violet-200',
  Civil_Code: 'bg-cyan-50 text-cyan-600 border-cyan-200',
  Family_Code: 'bg-pink-50 text-pink-600 border-pink-200',
  Tax_Code: 'bg-orange-50 text-orange-600 border-orange-200',
  Constitution: 'bg-indigo-50 text-indigo-600 border-indigo-200',
};

export default function LawSearchPage() {
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [expandedArticle, setExpandedArticle] = useState<string | null>(null);

  useEffect(() => {
    fetchArticles();
  }, [searchTerm, selectedType]);

  const fetchArticles = async () => {
    try {
      setLoading(true);
      setError(null);
      const params: any = {};
      if (searchTerm) params.q = searchTerm;
      if (selectedType) params.type = selectedType;

      const result = await lawService.searchLaws(params);
      setArticles(result.data || []);
    } catch (err) {
      console.error('Error fetching laws:', err);
      setError('Failed to load legal database. Please try again.');
      setArticles([]);
    } finally {
      setLoading(false);
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
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 text-white text-xs font-bold uppercase tracking-wider mb-6 border border-white/20">
              <Scale size={14} /> Rwandan Legal Database
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Search Applicable Laws
            </h1>
            <p className="text-xl text-brand-light mb-8 max-w-2xl mx-auto">
              Browse and search through Rwandan legal codes, statutes, and articles.
              Find the laws that apply to your case.
            </p>

            {/* Search Bar */}
            <div className="max-w-3xl mx-auto">
              <div className="bg-white rounded-card shadow-card p-2 flex flex-col md:flex-row gap-2">
                <div className="flex-1 flex items-center gap-2 px-3 py-2 bg-page-bg rounded-button">
                  <Search className="w-5 h-5 text-text-muted" />
                  <input
                    type="text"
                    placeholder="Search by keyword, article number, or legal concept..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="flex-1 bg-transparent border-none focus:outline-none text-text-primary placeholder-text-muted"
                  />
                  {searchTerm && (
                    <button onClick={() => setSearchTerm('')} className="text-text-muted hover:text-text-secondary">
                      <X size={16} />
                    </button>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="flex items-center gap-2 px-4 py-2 bg-page-bg text-text-secondary rounded-button hover:bg-brand-light transition-colors"
                  >
                    <Filter className="w-4 h-4" />
                    Filters
                    {selectedType && (
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
                    <button onClick={() => setShowFilters(false)} className="text-text-muted hover:text-text-secondary">
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-text-secondary mb-1">Law Type</label>
                      <select
                        value={selectedType}
                        onChange={(e) => setSelectedType(e.target.value)}
                        className="w-full px-3 py-2 border border-border-base rounded-button focus:outline-none focus:ring-2 focus:ring-brand-blue text-text-primary"
                      >
                        <option value="">All Types</option>
                        {Object.entries(LAW_TYPE_LABELS).map(([key, label]) => (
                          <option key={key} value={key}>{label}</option>
                        ))}
                      </select>
                    </div>
                    {selectedType && (
                      <button onClick={() => setSelectedType('')} className="text-sm text-brand-blue hover:text-brand-dark">
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
        <div className="mb-6">
          <p className="text-text-secondary">
            {loading ? (
              'Loading laws...'
            ) : (
              <>
                <span className="font-semibold text-text-primary">{articles.length}</span>
                {' '}{articles.length === 1 ? 'article' : 'articles'} found
                {searchTerm && <span> for "<span className="font-medium">{searchTerm}</span>"</span>}
                {selectedType && <span> in <span className="font-medium">{LAW_TYPE_LABELS[selectedType]}</span></span>}
              </>
            )}
          </p>
        </div>

        {error && (
          <div className="bg-danger-bg border border-red-300 rounded-card p-4 mb-6">
            <p className="text-danger-text font-medium">{error}</p>
            <button onClick={fetchArticles} className="mt-2 text-brand-blue hover:text-brand-dark font-medium">
              Try again
            </button>
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white rounded-card shadow-card p-6 animate-pulse">
                <div className="h-4 bg-page-bg rounded w-1/3 mb-3"></div>
                <div className="h-5 bg-page-bg rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-page-bg rounded w-full mb-2"></div>
                <div className="h-3 bg-page-bg rounded w-2/3"></div>
              </div>
            ))}
          </div>
        ) : articles.length === 0 ? (
          <div className="text-center py-12">
            <Scale className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No articles found</h3>
            <p className="text-gray-600 mb-4">Try adjusting your search or filters</p>
            <button
              onClick={() => { setSearchTerm(''); setSelectedType(''); }}
              className="text-brand-blue hover:text-brand-dark font-medium"
            >
              Clear all filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {articles.map((article) => (
              <div
                key={article.id}
                className="bg-white rounded-card shadow-card hover:shadow-xl transition-all border border-border-base hover:-translate-y-1 overflow-hidden"
              >
                <div className="p-6">
                  {/* Type Badge */}
                  <div className="flex items-center gap-2 mb-3">
                    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border ${LAW_TYPE_COLORS[article.legalCode?.type] || 'bg-gray-50 text-gray-600 border-gray-200'}`}>
                      {LAW_TYPE_LABELS[article.legalCode?.type] || article.legalCode?.type}
                    </span>
                    <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">
                      Art. {article.articleNumber}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="text-lg font-bold text-brand-dark mb-2">
                    {article.title || `Article ${article.articleNumber}`}
                  </h3>

                  {/* Source */}
                  <p className="text-xs text-text-muted mb-3 flex items-center gap-1">
                    <BookOpen size={12} />
                    {article.legalCode?.shortName}
                    {article.legalCode?.lawNumber && <span className="font-mono">({article.legalCode.lawNumber})</span>}
                  </p>

                  {/* Article Text */}
                  <div className={`text-sm text-text-secondary leading-relaxed mb-3 ${expandedArticle !== article.id ? 'line-clamp-3' : ''}`}>
                    {article.textEN || article.summary || 'No text available'}
                  </div>

                  {article.textEN && article.textEN.length > 200 && (
                    <button
                      onClick={() => setExpandedArticle(expandedArticle === article.id ? null : article.id)}
                      className="text-xs font-bold text-brand-blue hover:text-brand-dark mb-3 flex items-center gap-1"
                    >
                      {expandedArticle === article.id ? 'Show less' : 'Read more'} <ChevronRight size={12} />
                    </button>
                  )}

                  {/* Keywords */}
                  {article.keywords && article.keywords.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {article.keywords.slice(0, expandedArticle === article.id ? undefined : 5).map((kw: string) => (
                        <span key={kw} className="px-2 py-0.5 rounded-md bg-page-bg text-[10px] font-bold text-text-muted border border-border-base/50 flex items-center gap-1">
                          <Tag size={8} /> {kw}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Penalties */}
                  {(article.penaltyMin || article.fineMin) && (
                    <div className="bg-red-50 rounded-xl p-3 mt-3 border border-red-100">
                      <p className="text-[10px] font-bold text-red-600 uppercase tracking-wider mb-1">Penalties</p>
                      <div className="flex items-center gap-4 text-xs text-red-700">
                        {article.penaltyMin && (
                          <span>Imprisonment: <span className="font-bold">{article.penaltyMin} – {article.penaltyMax}</span></span>
                        )}
                        {article.fineMin && (
                          <span>Fine: <span className="font-bold">RWF {article.fineMin.toLocaleString()}{article.fineMax ? ` – ${article.fineMax.toLocaleString()}` : ''}</span></span>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Section/Chapter Info */}
                {(article.section || article.chapter) && (
                  <div className="px-6 py-3 bg-page-bg/50 border-t border-border-base text-[10px] font-bold text-text-muted uppercase tracking-wider flex items-center gap-2">
                    {article.chapter && <span>{article.chapter}</span>}
                    {article.chapter && article.section && <span>·</span>}
                    {article.section && <span>{article.section}</span>}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
