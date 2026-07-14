import React, { useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { usePlatform } from '../context/PlatformContext';
import { SearchBar } from '../components/SearchBar';
import SEOHead from '../components/SEOHead';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { 
  Building, User, Users, Star, Clipboard, AlertCircle, 
  ArrowRight, FileText, HelpCircle, ShieldAlert 
} from 'lucide-react';

export const GlobalSearchPage = () => {
  const location = useLocation();
  const { searchResults, performSearch, loading } = usePlatform();

  const queryParams = new URLSearchParams(location.search);
  const q = queryParams.get('q') || '';
  const category = queryParams.get('category') || 'all';

  useEffect(() => {
    if (q) {
      performSearch(q, category);
    }
  }, [q, category, performSearch]);

  const hasResults = Object.values(searchResults).some(arr => arr && arr.length > 0);

  return (
    <div className="space-y-8">
      <SEOHead 
        title={`Search results for "${q}"`} 
        description={`Find properties, users, roommates, reviews, and alerts matching "${q}" on StayMate.`} 
      />

      <div className="space-y-4">
        <div>
          <h1 className="text-xl font-extrabold text-secondary-900 dark:text-white">Global Platform Search</h1>
          <p className="text-xs text-secondary-450 mt-0.5">Explore matching items across all platform records</p>
        </div>

        {/* Big Search Input Container */}
        <div className="p-6 bg-secondary-50/20 border border-secondary-200/50 rounded-[24px] flex items-center justify-center">
          <SearchBar initialValue={q} initialCategory={category} />
        </div>
      </div>

      {loading ? (
        <div className="h-64 flex items-center justify-center">
          <div className="flex flex-col items-center space-y-3">
            <div className="h-8 w-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
            <span className="text-xs text-secondary-400 font-bold">Querying databases...</span>
          </div>
        </div>
      ) : !q ? (
        <div className="p-12 text-center border border-dashed border-secondary-200 rounded-[24px]">
          <HelpCircle className="h-10 w-10 text-secondary-300 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-secondary-750">Start Searching</h3>
          <p className="text-xs text-secondary-450 mt-1">Enter a keyword above to lookup records, stays, or audit activities.</p>
        </div>
      ) : !hasResults ? (
        <div className="p-12 text-center border border-dashed border-secondary-200 rounded-[24px]">
          <HelpCircle className="h-10 w-10 text-secondary-300 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-secondary-750">No Results Found</h3>
          <p className="text-xs text-secondary-450 mt-1">No database rows match your query: "{q}". Try expanding your filter categories.</p>
        </div>
      ) : (
        <div className="space-y-8">
          
          {/* Properties Section */}
          {searchResults.properties?.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-[13px] font-extrabold text-secondary-900 dark:text-white uppercase tracking-wider flex items-center">
                <Building className="h-4.5 w-4.5 mr-2 text-primary-500" /> Properties ({searchResults.properties.length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {searchResults.properties.map((p) => (
                  <Card key={p._id} className="p-5 border-secondary-200/50 hover:shadow-premium-md hover:-translate-y-0.5 transition-all flex flex-col justify-between h-full bg-white dark:bg-secondary-900 rounded-[18px]">
                    <div className="space-y-2">
                      <span className="text-[9px] font-black uppercase tracking-wider bg-primary-50 text-primary-650 px-2 py-0.5 rounded">
                        {p.location?.city || 'Stay'}
                      </span>
                      <h4 className="text-xs font-bold text-secondary-900 dark:text-white line-clamp-1">{p.title}</h4>
                      <p className="text-[10px] text-secondary-450 line-clamp-2 leading-relaxed">{p.description}</p>
                    </div>
                    <Link to={`/properties/${p._id}`} className="mt-4 flex items-center justify-between text-[11px] font-bold text-primary-500 hover:text-primary-650 pt-3 border-t border-secondary-100 dark:border-secondary-900">
                      <span>View listing</span> <ArrowRight className="h-3 w-3" />
                    </Link>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Roommates Profiles Section */}
          {searchResults.roommates?.length > 0 && (
            <div className="space-y-4 pt-4 border-t border-secondary-100 dark:border-secondary-900">
              <h3 className="text-[13px] font-extrabold text-secondary-900 dark:text-white uppercase tracking-wider flex items-center">
                <Users className="h-4.5 w-4.5 mr-2 text-success-500" /> Roommate Profiles ({searchResults.roommates.length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {searchResults.roommates.map((r) => (
                  <Card key={r._id} className="p-5 border-secondary-200/50 flex items-start space-x-4 bg-white dark:bg-secondary-900 rounded-[18px]">
                    <div className="h-10 w-10 rounded-full bg-success-50/20 text-success-600 flex items-center justify-center shrink-0">
                      <User className="h-5 w-5" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-xs font-bold text-secondary-900 dark:text-white capitalize">Roommate Listing</h4>
                      <p className="text-[10px] text-secondary-450 line-clamp-2 leading-relaxed">{r.bio}</p>
                      <div className="flex flex-wrap gap-1.5 pt-2">
                        {r.hobbies?.slice(0, 3).map((h, idx) => (
                          <span key={idx} className="text-[8px] font-bold bg-secondary-100 text-secondary-600 px-2 py-0.5 rounded">
                            {h}
                          </span>
                        ))}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Users Section */}
          {searchResults.users?.length > 0 && (
            <div className="space-y-4 pt-4 border-t border-secondary-100 dark:border-secondary-900">
              <h3 className="text-[13px] font-extrabold text-secondary-900 dark:text-white uppercase tracking-wider flex items-center">
                <User className="h-4.5 w-4.5 mr-2 text-primary-500" /> Users & Accounts ({searchResults.users.length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {searchResults.users.map((u) => (
                  <Card key={u._id} className="p-4 border-secondary-200/50 flex items-center space-x-3 bg-white dark:bg-secondary-900 rounded-[16px]">
                    <div className="h-9 w-9 rounded-full bg-secondary-100 dark:bg-secondary-800 text-secondary-600 flex items-center justify-center shrink-0 font-bold text-xs uppercase">
                      {u.name?.slice(0, 2)}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-secondary-900 dark:text-white leading-tight">{u.name}</h4>
                      <span className="text-[9px] font-bold text-secondary-400">{u.email}</span>
                      <span className="block text-[8px] font-black uppercase text-primary-500 mt-0.5">{u.role}</span>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Reviews Section */}
          {searchResults.reviews?.length > 0 && (
            <div className="space-y-4 pt-4 border-t border-secondary-100 dark:border-secondary-900">
              <h3 className="text-[13px] font-extrabold text-secondary-900 dark:text-white uppercase tracking-wider flex items-center">
                <Star className="h-4.5 w-4.5 mr-2 text-warning-500" /> Reviews & Ratings ({searchResults.reviews.length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {searchResults.reviews.map((rev) => (
                  <Card key={rev._id} className="p-5 border-secondary-200/50 bg-white dark:bg-secondary-900 rounded-[18px] space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-[9px] font-black uppercase tracking-wider bg-warning-50 text-warning-600 px-2 py-0.5 rounded">
                        Rating: {rev.rating}/5
                      </span>
                      <span className="text-[9px] text-secondary-400 font-semibold">{new Date(rev.createdAt).toLocaleDateString()}</span>
                    </div>
                    <p className="text-[11px] text-secondary-750 dark:text-secondary-300 font-semibold italic">"{rev.content}"</p>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* System Notifications/Alerts Section */}
          {searchResults.notifications?.length > 0 && (
            <div className="space-y-4 pt-4 border-t border-secondary-100 dark:border-secondary-900">
              <h3 className="text-[13px] font-extrabold text-secondary-900 dark:text-white uppercase tracking-wider flex items-center">
                <ShieldAlert className="h-4.5 w-4.5 mr-2 text-error-500" /> System Alerts ({searchResults.notifications.length})
              </h3>
              <div className="space-y-3">
                {searchResults.notifications.map((notif) => (
                  <div key={notif._id} className="p-4 bg-secondary-50/20 border border-secondary-200/60 rounded-[16px] flex items-center space-x-3">
                    <div className="h-8 w-8 rounded-full bg-primary-50 text-primary-500 flex items-center justify-center shrink-0">
                      <FileText className="h-4 w-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-secondary-900 dark:text-white">{notif.title}</h4>
                      <p className="text-[10px] text-secondary-450 mt-0.5 leading-relaxed">{notif.message}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      )}
    </div>
  );
};

export default GlobalSearchPage;
