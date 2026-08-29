import { useState, useEffect } from 'react';
import {
  Search, Scale, Filter, ChevronRight, BookOpen,
  X, Loader2, Tag
} from 'lucide-react';
import { lawService } from '../api/services/law.service';
import AppLayout from '../components/AppLayout';

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
    <AppLayout title="Rwandan Legal Database">
      <div className="space-y-6">

        {/* Search & Filters Bar */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" />
            <input
              type="text"
              placeholder="Search by keyword, article number, or legal concept..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-12 pl-11 pr-10 rounded-2xl bg-white border border-border-base focus:border-brand-blue focus:ring-4 focus:ring-brand-blue/5 outline-none transition-all font-bold text-sm"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted hover:text-brand-dark transition-colors"
              >
                <X size={16} />
              </button>
            )}
          </div>
          <div className="relative">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl border font-bold text-sm transition-all ${
                showFilters || selectedType
                  ? 'bg-brand-blue text-white border-brand-blue shadow-lg shadow-brand-blue/20'
                  : 'bg-white text-text-secondary border-border-base hover:border-brand-blue/30'
              }`}
            >
              <Filter size={16} />
              Filters
              {selectedType && (
                <span className="bg-white/20 text-white text-[10px] px-2 py-0.5 rounded-full">
                  {LAW_TYPE_LABELS[selectedType]}
                </span>
              )}
            </button>

            {showFilters && (
              <div className="absolute top-full right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-border-base p-4 z-50 animate-in fade-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold text-brand-dark text-sm">Filters</h3>
                  <button onClick={() => setShowFilters(false)} className="text-text-muted hover:text-brand-dark">
                    <X size={16} />
                  </button>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-text-muted uppercase tracking-wider mb-2">Law Type</label>
                  <select
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value)}
                    className="w-full px-3 py-2.5 border border-border-base rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-blue text-sm font-bold"
                  >
                    <option value="">All Types</option>
                    {Object.entries(LAW_TYPE_LABELS).map(([key, label]) => (
                      <option key={key} value={key}>{label}</option>
                    ))}
                  </select>
                </div>
                {selectedType && (
                  <button
                    onClick={() => setSelectedType('')}
                    className="mt-3 text-xs font-bold text-brand-blue hover:text-brand-dark"
                  >
                    Clear filter
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Results Count */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-text-secondary">
            {loading ? (
              'Loading laws...'
            ) : (
              <>
                <span className="font-bold text-brand-dark">{articles.length}</span>
                {' '}{articles.length === 1 ? 'article' : 'articles'} found
                {searchTerm && <span> for "<span className="font-medium">{searchTerm}</span>"</span>}
              </>
            )}
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-center justify-between">
            <p className="text-sm font-bold text-red-600">{error}</p>
            <button onClick={fetchArticles} className="text-sm font-bold text-brand-blue hover:text-brand-dark">
              Retry
            </button>
          </div>
        )}

        {/* Loading Skeleton */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white rounded-2xl border border-border-base p-6 animate-pulse">
                <div className="h-4 bg-page-bg rounded w-1/3 mb-3"></div>
                <div className="h-5 bg-page-bg rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-page-bg rounded w-full mb-2"></div>
                <div className="h-3 bg-page-bg rounded w-2/3"></div>
              </div>
            ))}
          </div>
        ) : articles.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 rounded-[2rem] bg-brand-blue/5 flex items-center justify-center mx-auto mb-6">
              <Scale size={36} className="text-brand-blue" />
            </div>
            <h3 className="text-lg font-bold text-brand-dark mb-2">No articles found</h3>
            <p className="text-sm text-text-secondary max-w-md mx-auto mb-6">
              Try adjusting your search terms or filters to find relevant legal articles.
            </p>
            <button
              onClick={() => { setSearchTerm(''); setSelectedType(''); }}
              className="text-sm font-bold text-brand-blue hover:text-brand-dark"
            >
              Clear all filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {articles.map((article) => (
              <div
                key={article.id}
                className="bg-white rounded-2xl border border-border-base hover:shadow-lg hover:border-brand-blue/20 transition-all group overflow-hidden"
              >
                <div className="p-6">
                  {/* Type Badge */}
                  <div className="flex items-center gap-2 mb-3">
                    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border ${LAW_TYPE_COLORS[article.legalCode?.type] || 'bg-gray-50 text-gray-600 border-gray-200'}`}>
                      {LAW_TYPE_LABELS[article.legalCode?.type] || article.legalCode?.type}
                    </span>
                    <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider font-mono">
                      Art. {article.articleNumber}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="text-base font-bold text-brand-dark mb-2 group-hover:text-brand-blue transition-colors">
                    {article.title || `Article ${article.articleNumber}`}
                  </h3>

                  {/* Source */}
                  <p className="text-xs text-text-muted mb-3 flex items-center gap-1.5">
                    <BookOpen size={12} className="text-brand-blue" />
                    <span className="font-bold">{article.legalCode?.shortName}</span>
                    {article.legalCode?.lawNumber && <span className="font-mono opacity-60">({article.legalCode.lawNumber})</span>}
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
                      <div className="flex flex-wrap items-center gap-4 text-xs text-red-700">
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
    </AppLayout>
  );
}
