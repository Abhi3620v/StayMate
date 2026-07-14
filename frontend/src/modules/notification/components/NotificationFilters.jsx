import React from 'react';
import { Search, Filter, RefreshCw } from 'lucide-react';

export const NotificationFilters = ({ 
  filters, 
  setFilters, 
  searchQuery, 
  setSearchQuery,
  onReset
}) => {
  const categories = [
    { label: 'All Categories', value: '' },
    { label: 'Security & Auth', value: 'auth' },
    { label: 'Stays & Property', value: 'property' },
    { label: 'Roommate Matches', value: 'roommate' },
    { label: 'Visits & Tours', value: 'visit' },
    { label: 'Chat Messaging', value: 'chat' },
    { label: 'Reviews & Feedback', value: 'review' },
    { label: 'System Announcements', value: 'admin' },
  ];

  const priorities = [
    { label: 'All Priorities', value: '' },
    { label: 'Critical Alert', value: 'critical' },
    { label: 'High Priority', value: 'high' },
    { label: 'Medium Priority', value: 'medium' },
    { label: 'Low Priority', value: 'low' },
  ];

  return (
    <div className="bg-white dark:bg-secondary-900 border border-secondary-100 dark:border-secondary-900 rounded-3xl p-5 shadow-premium-sm space-y-4">
      {/* Search and reset row */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-secondary-400">
            <Search className="h-4 w-4" />
          </span>
          <input
            type="text"
            placeholder="Search alerts by title or content..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs font-semibold rounded-2xl bg-secondary-50 dark:bg-secondary-950 border-secondary-200/50 dark:border-secondary-900 text-secondary-900 dark:text-white placeholder-secondary-400 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 focus:outline-none transition-all"
          />
        </div>

        {onReset && (
          <button
            onClick={onReset}
            className="px-4 py-2 text-xs font-bold text-secondary-650 dark:text-secondary-400 border border-secondary-200/60 dark:border-secondary-900 rounded-2xl hover:bg-secondary-50 dark:hover:bg-secondary-800 flex items-center justify-center gap-1.5 transition-all shrink-0"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Reset
          </button>
        )}
      </div>

      {/* Select Dropdowns Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Read Status tab pills */}
        <div className="bg-secondary-50 dark:bg-secondary-950 rounded-2xl p-1 flex border border-secondary-200/30 dark:border-secondary-900">
          {['all', 'false', 'true'].map(status => (
            <button
              key={status}
              onClick={() => setFilters(prev => ({ ...prev, readStatus: status }))}
              className={`flex-1 py-1.5 text-[10px] font-bold rounded-xl transition-all capitalize ${
                filters.readStatus === status
                  ? 'bg-white dark:bg-secondary-800 text-primary-650 dark:text-primary-400 shadow-sm'
                  : 'text-secondary-500 hover:text-secondary-800 dark:hover:text-secondary-300'
              }`}
            >
              {status === 'all' ? 'All' : status === 'false' ? 'Unread' : 'Read'}
            </button>
          ))}
        </div>

        {/* Category dropdown */}
        <div className="relative">
          <select
            value={filters.category}
            onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
            className="w-full text-xs font-semibold px-4 py-2 rounded-2xl bg-secondary-50 dark:bg-secondary-950 border-secondary-200/50 dark:border-secondary-900 text-secondary-800 dark:text-secondary-300 focus:outline-none focus:ring-1 focus:ring-primary-500 appearance-none cursor-pointer"
          >
            {categories.map(c => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-secondary-400">
            <Filter className="h-3 w-3" />
          </div>
        </div>

        {/* Priority dropdown */}
        <div className="relative">
          <select
            value={filters.priority}
            onChange={(e) => setFilters(prev => ({ ...prev, priority: e.target.value }))}
            className="w-full text-xs font-semibold px-4 py-2 rounded-2xl bg-secondary-50 dark:bg-secondary-950 border-secondary-200/50 dark:border-secondary-900 text-secondary-800 dark:text-secondary-300 focus:outline-none focus:ring-1 focus:ring-primary-500 appearance-none cursor-pointer"
          >
            {priorities.map(p => (
              <option key={p.value} value={p.value}>{p.label}</option>
            ))}
          </select>
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-secondary-400">
            <Filter className="h-3 w-3" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationFilters;
