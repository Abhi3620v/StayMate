import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, Clock, Sparkles } from 'lucide-react';

export const SearchBar = ({ initialValue = '', initialCategory = 'all', placeholder = 'Search across StayMate...' }) => {
  const navigate = useNavigate();
  const [query, setQuery] = useState(initialValue);
  const [category, setCategory] = useState(initialCategory);
  const [showOverlay, setShowOverlay] = useState(false);
  const [recentSearches, setRecentSearches] = useState([]);
  const containerRef = useRef(null);

  const suggestions = [
    { text: 'Pune', type: 'location' },
    { text: 'Rajesh', type: 'user' },
    { text: 'Mumbai', type: 'location' },
    { text: 'Review', type: 'action' },
    { text: 'Visit Request', type: 'visit' }
  ];

  useEffect(() => {
    // Load recent searches from localStorage
    const saved = localStorage.getItem('sm_recent_searches');
    if (saved) {
      try {
        setRecentSearches(JSON.parse(saved));
      } catch (e) {
        setRecentSearches([]);
      }
    }

    // Handle clicking outside to close suggestions dropdown overlay
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setShowOverlay(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (searchQuery, searchCategory = category) => {
    const trimmed = searchQuery.trim();
    if (!trimmed) return;

    // Save search query to recent searches
    const updated = [trimmed, ...recentSearches.filter(s => s !== trimmed)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem('sm_recent_searches', JSON.stringify(updated));

    setShowOverlay(false);
    navigate(`/search?q=${encodeURIComponent(trimmed)}&category=${searchCategory}`);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearchSubmit(query);
    }
  };

  const clearSearch = () => {
    setQuery('');
  };

  const removeRecentSearch = (e, term) => {
    e.stopPropagation();
    const updated = recentSearches.filter(s => s !== term);
    setRecentSearches(updated);
    localStorage.setItem('sm_recent_searches', JSON.stringify(updated));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleSearchSubmit(query);
  };

  return (
    <form ref={containerRef} onSubmit={handleSubmit} className="relative w-full max-w-xl z-35">
      {/* Search Input Box */}
      <div className="relative group">
        <input
          type="text"
          value={query}
          onFocus={() => setShowOverlay(true)}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className="w-full text-xs font-bold pl-5 pr-20 bg-secondary-50/50 hover:bg-secondary-100 dark:bg-secondary-950 dark:hover:bg-secondary-900 border border-secondary-200/60 dark:border-secondary-900 rounded-full focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 text-secondary-800 dark:text-secondary-100 placeholder-secondary-450 transition-all duration-200 h-[36px]"
        />

        <div className="absolute right-1 top-[4px] flex items-center space-x-1">
          {query && (
            <button 
              type="button" 
              onClick={clearSearch} 
              className="p-1 hover:bg-secondary-100 dark:hover:bg-secondary-900 rounded-full transition-colors"
            >
              <X className="h-3.5 w-3.5 text-secondary-400 hover:text-secondary-650" />
            </button>
          )}
          <button
            type="submit"
            className="h-[28px] w-[28px] rounded-full bg-primary-500 hover:bg-primary-600 flex items-center justify-center text-secondary-900 hover:scale-105 active:scale-95 transition-all shadow-premium-sm"
            title="Search"
          >
            <Search className="h-3.5 w-3.5 text-secondary-900 stroke-[3]" />
          </button>
        </div>
      </div>

      {/* Autocomplete & Suggestions Overlay Dropdown */}
      {showOverlay && (
        <div className="absolute top-full left-0 w-full mt-2 bg-white dark:bg-secondary-950 border border-secondary-100 dark:border-secondary-900 rounded-[24px] shadow-premium-lg p-5 space-y-4 animate-fade-in">
          
          {/* Category Pill Filters */}
          <div className="space-y-2">
            <span className="text-[10px] font-bold text-secondary-400 uppercase tracking-widest block">Filter Category</span>
            <div className="flex flex-wrap gap-2">
              {[
                { label: 'All Entities', value: 'all' },
                { label: 'Properties', value: 'properties' },
                { label: 'Users', value: 'users' },
                { label: 'Roommates', value: 'roommates' },
                { label: 'Reviews', value: 'reviews' },
                { label: 'Visit Requests', value: 'visitRequests' },
                { label: 'Audit Logs', value: 'auditLogs' }
              ].map((pill) => (
                <button
                  key={pill.value}
                  onClick={() => {
                    setCategory(pill.value);
                    if (query.trim()) {
                      handleSearchSubmit(query, pill.value);
                    }
                  }}
                  className={`px-3 py-1.5 rounded-[12px] text-[10px] font-bold transition-all border ${
                    category === pill.value
                      ? 'bg-primary-50 text-primary-650 border-primary-200 dark:bg-primary-950/20 dark:text-primary-400 dark:border-primary-900'
                      : 'bg-transparent text-secondary-600 border-secondary-200/50 hover:bg-secondary-50 dark:text-secondary-400 dark:border-secondary-900 dark:hover:bg-secondary-900'
                  }`}
                >
                  {pill.label}
                </button>
              ))}
            </div>
          </div>

          {/* Recent Searches */}
          {recentSearches.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-secondary-100 dark:border-secondary-900">
              <span className="text-[10px] font-bold text-secondary-400 uppercase tracking-widest block">Recent Searches</span>
              <div className="space-y-1">
                {recentSearches.map((term, idx) => (
                  <div
                    key={idx}
                    onClick={() => {
                      setQuery(term);
                      handleSearchSubmit(term);
                    }}
                    className="flex items-center justify-between px-3 py-2 hover:bg-secondary-50 dark:hover:bg-secondary-900 rounded-[14px] cursor-pointer group transition-colors"
                  >
                    <div className="flex items-center space-x-2.5">
                      <Clock className="h-3.5 w-3.5 text-secondary-400" />
                      <span className="text-xs font-semibold text-secondary-750 dark:text-secondary-300">{term}</span>
                    </div>
                    <button
                      onClick={(e) => removeRecentSearch(e, term)}
                      className="p-1 opacity-0 group-hover:opacity-100 hover:bg-secondary-100 dark:hover:bg-secondary-800 rounded-full transition-all"
                    >
                      <X className="h-3 w-3 text-secondary-450" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Suggested Keyword Searches */}
          <div className="space-y-2 pt-2 border-t border-secondary-100 dark:border-secondary-900">
            <span className="text-[10px] font-bold text-secondary-400 uppercase tracking-widest block">Suggested Keywords</span>
            <div className="flex flex-wrap gap-2">
              {suggestions.map((sug, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setQuery(sug.text);
                    handleSearchSubmit(sug.text);
                  }}
                  className="flex items-center space-x-1.5 px-3 py-1.5 bg-secondary-50 dark:bg-secondary-900 hover:bg-secondary-100 dark:hover:bg-secondary-850 rounded-[14px] text-xs font-semibold text-secondary-700 dark:text-secondary-350 transition-colors"
                >
                  <Sparkles className="h-3 w-3 text-primary-500" />
                  <span>{sug.text}</span>
                </button>
              ))}
            </div>
          </div>

        </div>
      )}
    </form>
  );
};

export default SearchBar;
