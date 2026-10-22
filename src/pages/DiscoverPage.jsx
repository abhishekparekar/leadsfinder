import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  MapPin, 
  Globe, 
  Phone, 
  Star, 
  List, 
  Map, 
  Plus, 
  Check, 
  Sparkles, 
  Database,
  ArrowRight,
  ExternalLink,
  MessageCircle,
  Download,
  CheckSquare,
  Square,
  BookmarkCheck,
  Store,
  Navigation,
  X,
  Tag,
  Building2,
  Trash2,
  SlidersHorizontal,
  MapPinned,
  Activity,
  Dumbbell,
  Utensils,
  GraduationCap,
  HeartPulse,
  Microscope,
  Scissors,
  Stethoscope,
  Laptop,
  Car,
  Palette,
  Briefcase,
  Layers,
  Compass
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { PriorityBadge } from '../components/common/Badge';
import { ScorePill } from '../components/common/ScorePill';
import { LeadMapView } from '../components/discovery/LeadMapView';
import { DuplicateReviewModal } from '../components/leads/DuplicateReviewModal';
import { LeadDetailModal } from '../components/leads/LeadDetailModal';

const DEFAULT_CATEGORIES = [
  'All',
  'Dental Clinic',
  'Gym & Fitness',
  'Restaurant & Cafe',
  'Skin, Hair & Aesthetics',
  'Real Estate & Realtors',
  'Coaching & Education',
  'Physiotherapy & Orthopedic',
  'Diagnostic Center & Labs',
  'Salons & Luxury Spas',
  'Hospitals & Healthcare',
  'IT & Software Agency',
  'Car Care & Auto Detailing',
  'Interior Designers'
];

export function getCategoryIcon(cat, className = "w-3.5 h-3.5") {
  switch (cat) {
    case 'Dental Clinic':
      return <Activity className={className} />;
    case 'Gym & Fitness':
      return <Dumbbell className={className} />;
    case 'Restaurant & Cafe':
      return <Utensils className={className} />;
    case 'Skin, Hair & Aesthetics':
      return <Sparkles className={className} />;
    case 'Real Estate & Realtors':
      return <Building2 className={className} />;
    case 'Coaching & Education':
      return <GraduationCap className={className} />;
    case 'Physiotherapy & Orthopedic':
      return <HeartPulse className={className} />;
    case 'Diagnostic Center & Labs':
      return <Microscope className={className} />;
    case 'Salons & Luxury Spas':
      return <Scissors className={className} />;
    case 'Hospitals & Healthcare':
      return <Stethoscope className={className} />;
    case 'IT & Software Agency':
      return <Laptop className={className} />;
    case 'Car Care & Auto Detailing':
      return <Car className={className} />;
    case 'Interior Designers':
      return <Palette className={className} />;
    case 'All':
      return <Layers className={className} />;
    default:
      return <Briefcase className={className} />;
  }
}


export function DiscoverPage({ onOpenOutreach }) {
  const { currentUser } = useAuth();
  
  // Custom categories state with localStorage persistence
  const [customCategories, setCustomCategories] = useState(() => {
    try {
      const saved = localStorage.getItem('leadpilot_custom_categories');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  // Search parameters
  const [keyword, setKeyword] = useState('');
  const [category, setCategory] = useState('All');
  const [location, setLocation] = useState('Chhatrapati Sambhajinagar');
  const [radius, setRadius] = useState(10);
  const [websiteFilter, setWebsiteFilter] = useState('all'); // 'all', 'with_website', 'without_website'
  const [phoneFilter, setPhoneFilter] = useState('all');
  const [minRating, setMinRating] = useState(0);

  // UI helpers & Modals
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
  const [newCatInput, setNewCatInput] = useState('');

  // View mode & selection
  const [viewMode, setViewMode] = useState('list'); // 'list' | 'map'
  const [results, setResults] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [bulkSaving, setBulkSaving] = useState(false);
  const [engineStatus, setEngineStatus] = useState(null);
  const [searchMeta, setSearchMeta] = useState(null);

  useEffect(() => {
    api.getHealth().then(h => {
      if (h && h.provider) setEngineStatus(h.provider);
    }).catch(() => {});
  }, []);

  // Modals
  const [savingMap, setSavingMap] = useState({});
  const [duplicateModalOpen, setDuplicateModalOpen] = useState(false);
  const [candidateLead, setCandidateLead] = useState(null);
  const [existingLeadMatch, setExistingLeadMatch] = useState(null);
  const [selectedLeadId, setSelectedLeadId] = useState(null);

  // Merge default and custom categories
  const allCategories = [
    ...DEFAULT_CATEGORIES,
    ...customCategories.filter(c => !DEFAULT_CATEGORIES.includes(c))
  ];

  const handleAddCategory = (catName) => {
    const trimmed = (catName || newCatInput).trim();
    if (!trimmed) return;
    if (!allCategories.map(c => c.toLowerCase()).includes(trimmed.toLowerCase())) {
      const updated = [...customCategories, trimmed];
      setCustomCategories(updated);
      try {
        localStorage.setItem('leadpilot_custom_categories', JSON.stringify(updated));
      } catch (e) {}
    }
    setCategory(trimmed);
    setNewCatInput('');
    setShowAddCategoryModal(false);
    handleSearch(null, trimmed);
  };

  const handleRemoveCustomCategory = (catToRemove, e) => {
    if (e) e.stopPropagation();
    const updated = customCategories.filter(c => c !== catToRemove);
    setCustomCategories(updated);
    try {
      localStorage.setItem('leadpilot_custom_categories', JSON.stringify(updated));
    } catch (e) {}
    if (category === catToRemove) {
      setCategory('All');
    }
  };

  const handleSearch = async (e, overrideCategory, overrideLocation) => {
    if (e && e.preventDefault) e.preventDefault();
    const activeCat = overrideCategory !== undefined ? overrideCategory : category;
    const activeLoc = overrideLocation !== undefined ? overrideLocation : location;
    try {
      setLoading(true);
      setHasSearched(true);
      setSelectedIds([]);
      const res = await api.searchBusinesses({
        query: keyword,
        category: activeCat === 'All' ? '' : activeCat,
        location: activeLoc,
        radius,
        websiteFilter,
        phoneFilter,
        minRating
      });
      setResults(res.results || []);
      setSearchMeta({
        sourceName: res.sourceName,
        isLiveGoogle: res.isLiveGoogle,
        attribution: res.attribution,
        totalResults: res.totalResults
      });
    } catch (err) {
      alert('Search failed: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveLead = async (item, force = false) => {
    try {
      setSavingMap(prev => ({ ...prev, [item.sourceRecordId]: true }));
      const saved = await api.saveLead(item, currentUser?.uid, force);
      
      // Update local result status
      setResults(prev => prev.map(r => {
        if (r.sourceRecordId === item.sourceRecordId) {
          return { ...r, isSaved: true, savedLeadId: saved.id, savedStage: saved.pipelineStage };
        }
        return r;
      }));
    } catch (err) {
      if (err.message && err.message.includes('DUPLICATE')) {
        const dupCheck = await api.checkDuplicate(item.businessName, item.businessPhone, item.businessWebsite);
        setCandidateLead(item);
        setExistingLeadMatch(dupCheck.duplicateLead);
        setDuplicateModalOpen(true);
      } else {
        alert('Failed to save lead: ' + err.message);
      }
    } finally {
      setSavingMap(prev => ({ ...prev, [item.sourceRecordId]: false }));
    }
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === results.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(results.map(r => r.sourceRecordId));
    }
  };

  const toggleSelect = (id) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(i => i !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleSaveSelected = async () => {
    const toSave = results.filter(r => selectedIds.includes(r.sourceRecordId) && !r.isSaved);
    if (toSave.length === 0) return;
    try {
      setBulkSaving(true);
      for (const item of toSave) {
        try {
          const saved = await api.saveLead(item, currentUser?.uid, true);
          setResults(prev => prev.map(r => r.sourceRecordId === item.sourceRecordId ? { ...r, isSaved: true, savedLeadId: saved.id, savedStage: saved.pipelineStage } : r));
        } catch (e) {
          console.error(e);
        }
      }
      setSelectedIds([]);
    } finally {
      setBulkSaving(false);
    }
  };

  const handleExportSearchResults = () => {
    const targetResults = selectedIds.length > 0 
      ? results.filter(r => selectedIds.includes(r.sourceRecordId)) 
      : results;
    
    if (targetResults.length === 0) return;

    const headers = ['Business Name', 'Category', 'Phone', 'Website', 'Address', 'Rating', 'Reviews', 'Opportunities'];
    const rows = targetResults.map(r => [
      `"${(r.businessName || '').replace(/"/g, '""')}"`,
      `"${(r.category || '').replace(/"/g, '""')}"`,
      `"${(r.businessPhone || '').replace(/"/g, '""')}"`,
      `"${(r.businessWebsite || '').replace(/"/g, '""')}"`,
      `"${(r.address || '').replace(/"/g, '""')}"`,
      r.rating || '',
      r.reviewCount || 0,
      `"${(r.opportunityTypes || []).join('; ')}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map(row => row.join(','))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `leads_search_${location.replace(/[^a-z0-9]/gi, '_')}_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4 pb-12">
      {/* Google Maps Style Unified Search & Filter Command Center */}
      <div className="space-y-3">
        <form onSubmit={handleSearch} className="p-3 sm:p-4 rounded-2xl bg-slate-900 border border-slate-700/80 shadow-2xl space-y-3">
          {/* Main Google Maps Style Search Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-2.5 items-center">
            
            {/* Field 1: Service / Business Category with + Add Category button */}
            <div className="sm:col-span-1 lg:col-span-5 relative flex items-center bg-slate-950 rounded-xl border border-slate-800 hover:border-slate-700 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 transition px-3 py-2 gap-2">
              <Store className="w-4 h-4 text-cyan-400 shrink-0" />
              <div className="flex-1 min-w-0">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Business Category
                </label>
                <select
                  value={category}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === '__ADD_NEW__') {
                      setShowAddCategoryModal(true);
                    } else {
                      setCategory(val);
                    }
                  }}
                  className="w-full bg-transparent text-xs text-white font-medium focus:outline-none cursor-pointer appearance-none truncate pr-4"
                >
                  {allCategories.map(c => (
                    <option key={c} value={c} className="bg-slate-900 text-slate-200">
                      {c} {customCategories.includes(c) ? '(Custom)' : ''}
                    </option>
                  ))}
                  <option value="__ADD_NEW__" className="bg-slate-900 text-cyan-400 font-bold">
                    + Add Custom Category...
                  </option>
                </select>
              </div>

              {/* Dedicated + Add Category action trigger */}
              <button
                type="button"
                onClick={() => setShowAddCategoryModal(true)}
                className="shrink-0 flex items-center gap-1 px-2.5 py-1 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-[11px] font-bold transition shadow-sm hover:scale-105 active:scale-95"
                title="Add a custom business category"
              >
                <Plus className="w-3 h-3 text-cyan-400" />
                <span>+ Add Category</span>
              </button>
            </div>

            {/* Field 2: Open Location Field (Any City, State, or Region Worldwide) */}
            <div className="sm:col-span-1 lg:col-span-5 relative flex items-center bg-slate-950 rounded-xl border border-slate-800 hover:border-slate-700 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 transition px-3 py-2 gap-2">
              <MapPin className="w-4 h-4 text-rose-500 fill-rose-500/20 shrink-0" />
              <div className="flex-1 min-w-0">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Target Location (City / Region)
                </label>
                <input
                  type="text"
                  placeholder="Enter any City, Town, or Region (e.g. Pune, Mumbai, Sambhajinagar, All)..."
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none font-medium truncate"
                />
              </div>

              {location && (
                <button
                  type="button"
                  onClick={() => setLocation('')}
                  className="text-slate-500 hover:text-slate-300 p-1"
                  title="Clear location (Search All)"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Google Maps Search Action Button */}
            <div className="col-span-1 sm:col-span-2 lg:col-span-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 active:scale-95 text-white text-xs font-extrabold rounded-xl shadow-lg shadow-blue-600/30 transition flex items-center justify-center gap-1.5"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <Search className="w-4 h-4" />
                )}
                <span>{loading ? 'Searching...' : 'Search'}</span>
              </button>
            </div>
          </div>

          {/* Quick Filters & Keyword Refinement */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2.5 border-t border-slate-800 text-xs">
            <div className="flex flex-wrap items-center gap-2.5 text-slate-400">
              {/* Optional Keyword filter */}
              <div className="flex items-center gap-1.5 bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800">
                <Search className="w-3.5 h-3.5 text-slate-500" />
                <input
                  type="text"
                  placeholder="Filter keywords (e.g. Laser, Luxury)..."
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  className="bg-transparent text-xs text-slate-200 placeholder-slate-500 focus:outline-none w-36 sm:w-48"
                />
              </div>

              {/* Website Filter */}
              <div className="flex items-center gap-1.5 bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800">
                <Globe className="w-3.5 h-3.5 text-cyan-400" />
                <select
                  value={websiteFilter}
                  onChange={(e) => setWebsiteFilter(e.target.value)}
                  className="bg-transparent text-xs text-slate-300 focus:outline-none"
                >
                  <option value="all">Website: All</option>
                  <option value="without_website">Missing Website (Opportunity)</option>
                  <option value="with_website">Has Website</option>
                </select>
              </div>

              {/* Phone Filter */}
              <div className="flex items-center gap-1.5 bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800">
                <Phone className="w-3.5 h-3.5 text-emerald-400" />
                <select
                  value={phoneFilter}
                  onChange={(e) => setPhoneFilter(e.target.value)}
                  className="bg-transparent text-xs text-slate-300 focus:outline-none"
                >
                  <option value="all">Phone: All</option>
                  <option value="with_phone">Has Verified Phone</option>
                  <option value="without_phone">Missing Phone</option>
                </select>
              </div>

              {/* Min Rating */}
              <div className="flex items-center gap-1.5 bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800">
                <Star className="w-3.5 h-3.5 text-amber-400" />
                <select
                  value={minRating}
                  onChange={(e) => setMinRating(Number(e.target.value))}
                  className="bg-transparent text-xs text-slate-300 focus:outline-none"
                >
                  <option value={0}>Rating: Any</option>
                  <option value={4.0}>4.0+ Stars</option>
                  <option value={4.5}>4.5+ Stars</option>
                </select>
              </div>

              {/* View Toggle (List View / Map View) */}
              <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 sm:ml-auto">
                <button
                  type="button"
                  onClick={() => setViewMode('list')}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition ${
                    viewMode === 'list'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                  }`}
                >
                  <List className="w-3.5 h-3.5" />
                  <span>List View</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('map')}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition ${
                    viewMode === 'map'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                  }`}
                >
                  <Map className="w-3.5 h-3.5" />
                  <span>Map View</span>
                </button>
              </div>
            </div>

          </div>
        </form>

        {/* Google Maps Style Category Pills Bar (Under Search) */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1.5 scrollbar-thin scrollbar-thumb-slate-800 touch-pan-x">
          {/* Prominent + Add Category Chip */}
          <button
            type="button"
            onClick={() => setShowAddCategoryModal(true)}
            className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500/20 to-blue-500/20 hover:from-cyan-500/30 hover:to-blue-500/30 text-cyan-300 border border-cyan-400/50 hover:border-cyan-300 text-xs font-bold transition shadow-sm active:scale-95"
          >
            <Plus className="w-3.5 h-3.5 text-cyan-400" />
            <span>+ Add Category</span>
          </button>

          {/* Quick Categories with Lucide SVG Icons */}
          {allCategories.map((cat) => {
            const isSelected = category === cat;
            const isCustom = customCategories.includes(cat);
            return (
              <div key={cat} className="shrink-0 flex items-center">
                <button
                  type="button"
                  onClick={() => {
                    setCategory(cat);
                    handleSearch(null, cat);
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition border ${
                    isSelected
                      ? 'bg-blue-600 text-white border-blue-500 shadow-md shadow-blue-600/30 font-bold'
                      : 'bg-slate-900/90 hover:bg-slate-800 text-slate-300 hover:text-white border-slate-800'
                  }`}
                >
                  <span className={isSelected ? 'text-white' : 'text-cyan-400'}>
                    {getCategoryIcon(cat, "w-3.5 h-3.5")}
                  </span>
                  <span>{cat}</span>
                  {isCustom && (
                    <span 
                      onClick={(e) => handleRemoveCustomCategory(cat, e)}
                      className="ml-1 text-slate-400 hover:text-rose-400 p-0.5 rounded-full hover:bg-slate-800"
                      title="Remove custom category"
                    >
                      <X className="w-3 h-3" />
                    </span>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* View Switch: Map or List */}
      {viewMode === 'map' ? (
        <LeadMapView
          results={results}
          onSaveLead={handleSaveLead}
          onViewLead={(id) => setSelectedLeadId(id)}
          savingMap={savingMap}
        />
      ) : (
        /* Results Cards Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {loading ? (
            <div className="col-span-full py-20 text-center text-slate-500 text-sm">
              <div className="inline-block w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mb-3"></div>
              <p>Searching prospective businesses in {location}...</p>
            </div>
          ) : !hasSearched ? (
            <div className="col-span-full py-16 px-4 text-center rounded-2xl bg-slate-900/40 border border-slate-800/80">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-tr from-blue-600/20 to-cyan-500/20 border border-blue-500/30 flex items-center justify-center mb-4 text-cyan-400">
                <Search className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-bold text-white mb-1">Search for B2B Prospects</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto mb-6">
                Enter keywords or choose a target business category above and click Search Businesses to find prospective leads.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-2 max-w-xl mx-auto">
                <span className="text-xs text-slate-500 mr-1 flex items-center gap-1">
                  <Tag className="w-3.5 h-3.5 text-slate-400" />
                  Popular Niches:
                </span>
                {['Dental Clinic', 'Gym & Fitness', 'Restaurant & Cafe', 'Skin, Hair & Aesthetics', 'Real Estate & Realtors', 'Physiotherapy & Orthopedic'].map(cat => (
                  <button
                    key={cat}
                    onClick={() => {
                      setCategory(cat);
                      handleSearch(null, cat);
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-xs font-semibold text-slate-300 hover:text-white border border-slate-700 transition"
                  >
                    <span className="text-cyan-400">{getCategoryIcon(cat, "w-3.5 h-3.5")}</span>
                    <span>{cat}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : results.length === 0 ? (
            <div className="col-span-full py-16 text-center rounded-2xl bg-slate-900/40 border border-slate-800/80 text-slate-400 text-xs">
              <p className="font-semibold text-slate-300 text-sm mb-1">No matching businesses found</p>
              <p>Try broadening your keywords, increasing radius, or adjusting your filter criteria.</p>
            </div>
          ) : (
            <>
              {/* Results Action Bar */}
              <div className="col-span-full flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl bg-slate-900 border border-slate-800 text-xs">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={toggleSelectAll}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 font-semibold transition"
                  >
                    {selectedIds.length === results.length && results.length > 0 ? (
                      <CheckSquare className="w-4 h-4 text-cyan-400" />
                    ) : (
                      <Square className="w-4 h-4 text-slate-500" />
                    )}
                    <span>Select All ({results.length})</span>
                  </button>
                  <span className="text-slate-400 font-mono text-xs">
                    {selectedIds.length} selected
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {selectedIds.length > 0 && (
                    <button
                      type="button"
                      onClick={handleSaveSelected}
                      disabled={bulkSaving}
                      className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-bold transition shadow-md shadow-blue-600/30"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>{bulkSaving ? 'Saving...' : `Save Selected (${selectedIds.length})`}</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={handleExportSearchResults}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold transition shadow-sm"
                    title="Download current search results directly as CSV"
                  >
                    <Download className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Download CSV {selectedIds.length > 0 ? `(${selectedIds.length})` : `(${results.length})`}</span>
                  </button>
                </div>
              </div>

              {results.map((item) => {
                const isSelected = selectedIds.includes(item.sourceRecordId);
                const cleanPhone = item.businessPhone ? item.businessPhone.replace(/[^0-9]/g, '') : '';
                return (
                  <div
                    key={item.sourceRecordId}
                    className={`p-5 rounded-2xl bg-slate-900 border transition shadow-lg flex flex-col justify-between space-y-4 group ${
                      isSelected ? 'border-cyan-500/60 bg-slate-900/90 shadow-cyan-500/10' : 'border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    {/* Header */}
                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => toggleSelect(item.sourceRecordId)}
                            className="text-slate-400 hover:text-white"
                          >
                            {isSelected ? (
                              <CheckSquare className="w-4 h-4 text-cyan-400" />
                            ) : (
                              <Square className="w-4 h-4 text-slate-600" />
                            )}
                          </button>
                          <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-cyan-400 bg-cyan-950/40 px-2 py-0.5 rounded-md border border-cyan-800/40">
                            {getCategoryIcon(item.category, "w-3 h-3 text-cyan-400")}
                            <span>{item.category}</span>
                          </span>
                        </div>
                        <ScorePill score={item.score} size="sm" />
                      </div>

                      <h3 className="font-bold text-white text-base leading-snug group-hover:text-blue-400 transition">
                        {item.businessName}
                      </h3>

                      <p className="text-xs text-slate-400 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                        <span>{item.address || `${item.locality}, ${item.city}`}</span>
                      </p>

                      {/* Rating & Reviews */}
                      <div className="flex items-center gap-3 text-xs text-slate-400 pt-1">
                        <span className="flex items-center gap-1 text-amber-400 font-semibold">
                          <Star className="w-3.5 h-3.5 fill-amber-400" />
                          {item.rating || '4.5'}
                        </span>
                        <span>({item.reviewCount || 24} reviews)</span>
                      </div>

                      {/* Contact Presence */}
                      <div className="pt-2 border-t border-slate-800/80 space-y-1.5 text-xs">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2 min-w-0">
                            <Phone className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                            {item.businessPhone ? (
                              <span className="font-mono text-slate-300 truncate">{item.businessPhone}</span>
                            ) : (
                              <span className="text-slate-500 italic">No phone in registry</span>
                            )}
                          </div>
                          {cleanPhone && (
                            <a
                              href={`https://wa.me/${cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone}`}
                              target="_blank"
                              rel="noreferrer"
                              className="px-2 py-0.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold flex items-center gap-1"
                              title="Chat on WhatsApp"
                            >
                              <MessageCircle className="w-3 h-3" />
                              <span>WhatsApp</span>
                            </a>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          <Globe className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                          {item.businessWebsite ? (
                            <a
                              href={item.businessWebsite}
                              target="_blank"
                              rel="noreferrer"
                              className="text-blue-400 hover:underline truncate"
                            >
                              {item.businessWebsite.replace('https://', '')}
                            </a>
                          ) : (
                            <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/25">
                              Website missing
                            </span>
                          )}
                        </div>

                        {/* Direct Google Maps Navigation */}
                        {item.googleMapsUri && (
                          <div className="flex items-center justify-between pt-1.5 border-t border-slate-800/60 text-[11px]">
                            <a
                              href={item.googleMapsUri}
                              target="_blank"
                              rel="noreferrer"
                              className="text-cyan-400 hover:text-cyan-300 hover:underline flex items-center gap-1 font-medium"
                              title="Open in Google Maps"
                            >
                              <ExternalLink className="w-3 h-3 text-cyan-400 shrink-0" />
                              <span>View on Google Maps</span>
                            </a>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              item.sourceName?.includes('Google')
                                ? 'bg-blue-500/15 text-blue-300 border border-blue-500/30'
                                : 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                            }`}>
                              {item.sourceName?.includes('Google') ? 'Google Verified' : 'Directory Verified'}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Identified Opportunities */}
                      {item.opportunityTypes && item.opportunityTypes.length > 0 && (
                        <div className="pt-2">
                          <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                            <Sparkles className="w-3 h-3 text-amber-400" /> Opportunity:
                          </p>
                          <div className="flex flex-wrap gap-1">
                            {item.opportunityTypes.slice(0, 2).map((opp, idx) => (
                              <span
                                key={idx}
                                className="px-2 py-0.5 rounded text-[10px] font-medium bg-blue-950/80 text-blue-300 border border-blue-900"
                              >
                                {opp}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Footer Action */}
                    <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                      <PriorityBadge priority={item.priority} />

                      {item.isSaved ? (
                        <Link
                          to="/saved"
                          className="px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-semibold flex items-center gap-1.5 transition"
                          title="Click to view in Saved Leads"
                        >
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Saved in CRM</span>
                        </Link>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleSaveLead(item)}
                          disabled={savingMap[item.sourceRecordId]}
                          className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md shadow-blue-600/25 transition flex items-center gap-1.5 active:scale-95"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>{savingMap[item.sourceRecordId] ? 'Saving...' : 'Save Lead'}</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </>
          )}
        </div>
      )}

      {/* Add Custom Category Modal */}
      {showAddCategoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-md shadow-2xl p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2 text-white">
                <div className="p-2 rounded-xl bg-cyan-500/15 text-cyan-400 border border-cyan-500/30">
                  <Store className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Add Business Category</h3>
                  <p className="text-xs text-slate-400">Search leads in any custom niche or service</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowAddCategoryModal(false);
                  setNewCatInput('');
                }}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleAddCategory();
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Category Name
                </label>
                <input
                  type="text"
                  autoFocus
                  placeholder="e.g. Interior Designers, Solar Panels, Law Firms..."
                  value={newCatInput}
                  onChange={(e) => setNewCatInput(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-cyan-500 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                />
              </div>

              <div>
                <span className="text-[11px] font-semibold text-slate-400 block mb-2">
                  Popular Categories to Add:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    'Interior Designers',
                    'Solar Energy & Panels',
                    'Chartered Accountants',
                    'Lawyers & Advocates',
                    'Event & Wedding Planners',
                    'Boutiques & Fashion',
                    'Pet Clinics & Vets',
                    'Architecture & Construction'
                  ].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setNewCatInput(preset)}
                      className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-cyan-950 hover:text-cyan-300 hover:border-cyan-500/40 border border-slate-700 text-[11px] text-slate-300 transition"
                    >
                      + {preset}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddCategoryModal(false);
                    setNewCatInput('');
                  }}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!newCatInput.trim()}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 disabled:opacity-50 text-white text-xs font-bold transition shadow-md shadow-blue-600/30 flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add & Search Leads</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Duplicate Review Modal */}
      <DuplicateReviewModal
        isOpen={duplicateModalOpen}
        newLead={candidateLead}
        existingLead={existingLeadMatch}
        onClose={() => setDuplicateModalOpen(false)}
        onForceSave={() => handleSaveLead(candidateLead, true)}
        onViewExisting={(id) => setSelectedLeadId(id)}
      />

      {/* Lead Detail Modal */}
      {selectedLeadId && (
        <LeadDetailModal
          leadId={selectedLeadId}
          onClose={() => setSelectedLeadId(null)}
          onLeadUpdated={() => handleSearch()}
          onOpenOutreach={onOpenOutreach}
        />
      )}
    </div>
  );
}
