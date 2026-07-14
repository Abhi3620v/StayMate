import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  TrendingUp, Award, Clock, AlertTriangle, ShieldCheck,
  Building, MapPin, Users, HelpCircle, Layers
} from 'lucide-react';
import { useProperties } from '../hooks/useProperties.js';
import Card from '../../../components/ui/Card.jsx';
import Skeleton from '../../../components/ui/Skeleton.jsx';
import SEOHead from '../../platform/components/SEOHead';

export const AdminAnalytics = () => {
  const navigate = useNavigate();
  const {
    platformAnalytics,
    fetchPlatformAnalytics,
    isFetchingAnalytics
  } = useProperties();

  useEffect(() => {
    fetchPlatformAnalytics();
  }, [fetchPlatformAnalytics]);

  return (
    <div className="space-y-8 pb-20 animate-fade-in">
      <SEOHead 
        title="Platform Insights & Analytics" 
        description="Inspect StayMate platform-wide listing distributions, landlord leaderboards, and moderation metrics." 
      />

      {/* 1. Header */}
      <div className="border-b border-secondary-100 dark:border-secondary-900 pb-4">
        <h1 className="text-[32px] font-black text-secondary-900 dark:text-white leading-none tracking-tight">Platform Insights</h1>
        <p className="text-xs text-secondary-450 mt-1.5">Platform-wide listings distributions and moderation metrics.</p>
      </div>

      {isFetchingAnalytics || !platformAnalytics ? (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Array(4).fill(0).map((_, idx) => (
              <Skeleton key={idx} className="h-24 w-full rounded-2xl" />
            ))}
          </div>
          <Skeleton className="h-64 w-full rounded-3xl" />
        </div>
      ) : (
        <>
          {/* 2. Platform KPIs */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Total Listings Created', val: platformAnalytics.kpi.totalListings, icon: Layers, color: 'text-primary-655' },
              { label: 'Active Listings', val: platformAnalytics.kpi.publishedListings, icon: Building, color: 'text-success-650' },
              { label: 'Pending Moderation', val: platformAnalytics.kpi.pendingReviews, icon: Clock, color: 'text-warning-600' },
              { label: 'Suspended Listings', val: platformAnalytics.kpi.suspendedListings, icon: AlertTriangle, color: 'text-error-500' }
            ].map((card, idx) => {
              const Icon = card.icon;
              return (
                <Card key={idx} className="p-5 rounded-[18px] border border-secondary-200/50 dark:border-secondary-900">
                  <div className="flex justify-between items-start text-secondary-400">
                    <span className="text-[10px] font-bold uppercase tracking-wider">{card.label}</span>
                    <Icon className={`h-4.5 w-4.5 ${card.color}`} />
                  </div>
                  <span className="text-2xl font-black text-secondary-900 dark:text-white mt-3 block">{card.val}</span>
                </Card>
              );
            })}
          </div>

          {/* 3. Distributions Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left: City Listings Distribution */}
            <Card className="p-6 rounded-3xl space-y-6 border border-secondary-200/50 dark:border-secondary-900">
              <div>
                <h3 className="text-base font-bold text-secondary-900 dark:text-white">City Listing Counts</h3>
                <p className="text-xs text-secondary-450">Count distribution of flat listings across major cities.</p>
              </div>

              {/* Vertical SVG-based bar graph */}
              <div className="space-y-4 pt-2">
                {platformAnalytics.distributions.cityDistribution.map((city, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between text-xs font-bold text-secondary-750 dark:text-secondary-300">
                      <span>{city.name}</span>
                      <span>{city.value} listings</span>
                    </div>
                    {/* Progress indicator */}
                    <div className="w-full bg-secondary-50 dark:bg-secondary-950 h-2.5 rounded-full overflow-hidden border border-secondary-100 dark:border-secondary-900">
                      <div
                        className="bg-primary-500 h-full rounded-full transition-all duration-300"
                        style={{ width: `${Math.min((city.value / platformAnalytics.kpi.totalListings) * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                ))}
                {platformAnalytics.distributions.cityDistribution.length === 0 && (
                  <div className="text-xs text-secondary-400 italic">No geographic data recorded.</div>
                )}
              </div>
            </Card>

            {/* Right: Moderation Insights & Type Distribution */}
            <Card className="p-6 rounded-3xl space-y-6 border border-secondary-200/50 dark:border-secondary-900">
              <div>
                <h3 className="text-base font-bold text-secondary-900 dark:text-white">Moderation Speed & Score</h3>
                <p className="text-xs text-secondary-450">Moderator response benchmarks and flag details.</p>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center p-4 border border-secondary-100 dark:border-secondary-900 bg-secondary-50/50 dark:bg-secondary-950/20 rounded-2xl">
                  <div className="flex items-center space-x-3 text-secondary-650 dark:text-secondary-400">
                    <Clock className="h-5 w-5 text-warning-605" />
                    <span className="text-xs font-bold uppercase tracking-wider">Avg Review Time</span>
                  </div>
                  <span className="text-sm font-black text-secondary-800 dark:text-white">{platformAnalytics.moderation.avgReviewTime}</span>
                </div>

                <div className="flex justify-between items-center p-4 border border-secondary-100 dark:border-secondary-900 bg-secondary-50/50 dark:bg-secondary-950/20 rounded-2xl">
                  <div className="flex items-center space-x-3 text-secondary-650 dark:text-secondary-400">
                    <AlertTriangle className="h-5 w-5 text-error-500" />
                    <span className="text-xs font-bold uppercase tracking-wider">Top Reject Reason</span>
                  </div>
                  <span className="text-xs font-black text-secondary-800 dark:text-white max-w-[200px] text-right truncate">
                    {platformAnalytics.moderation.commonRejectionReason}
                  </span>
                </div>
              </div>

              {/* Quick Type Lists */}
              <div className="border-t border-secondary-100 dark:border-secondary-900 pt-4 space-y-3">
                <h4 className="text-[10px] font-bold text-secondary-455 uppercase tracking-wider">Property Type Distribution</h4>
                <div className="flex flex-wrap gap-2">
                  {platformAnalytics.distributions.typeDistribution.map((type, idx) => (
                    <div key={idx} className="flex items-center space-x-1.5 px-3 py-1 bg-secondary-100 dark:bg-secondary-900 text-xs font-bold text-secondary-700 dark:text-secondary-300 rounded-full">
                      <span>{type.name}:</span>
                      <span className="text-primary-650">{type.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </div>

          {/* 4. Owner Leaderboard */}
          <Card className="p-6 rounded-3xl space-y-6 border border-secondary-200/50 dark:border-secondary-900">
            <div>
              <h3 className="text-base font-bold text-secondary-900 dark:text-white">Active Landlords Leaderboard</h3>
              <p className="text-xs text-secondary-450">List of owners with the most listings created in the marketplace.</p>
            </div>

            <div className="overflow-x-auto border border-secondary-200/60 dark:border-secondary-900 rounded-2xl">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-secondary-50/50 dark:bg-secondary-900/30 border-b border-secondary-200 dark:border-secondary-800 text-[10px] font-bold text-secondary-450 uppercase tracking-wider">
                    <th className="p-4">Landlord Name</th>
                    <th className="p-4">Created Listings</th>
                    <th className="p-4">Verification Status</th>
                    <th className="p-4">Account Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-secondary-200/40 dark:divide-secondary-900 font-semibold text-secondary-700 dark:text-secondary-300 text-xs">
                  {platformAnalytics.leaderboard.map((owner, idx) => (
                    <tr key={idx} className="hover:bg-secondary-50/20 dark:hover:bg-secondary-950/20 transition-all">
                      <td className="p-4 flex items-center space-x-2">
                        <Users className="h-4 w-4 text-secondary-400" />
                        <span>{owner.name}</span>
                      </td>
                      <td className="p-4 font-black">{owner.listings} flats</td>
                      <td className="p-4">
                        <div className="flex items-center space-x-1.5">
                          <ShieldCheck className={`h-4 w-4 ${owner.verified ? 'text-success-650' : 'text-secondary-450'}`} />
                          <span>{owner.verified ? 'Verified' : 'Pending'}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="inline-block h-1.5 w-1.5 rounded-full bg-success-650 mr-2" />
                        <span>Active</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </>
      )}
    </div>
  );
};

export default AdminAnalytics;
