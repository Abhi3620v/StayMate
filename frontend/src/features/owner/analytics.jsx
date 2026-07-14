import React, { useState, useEffect } from 'react';
import propertyService from '@/services/propertyService';
import {
  DashboardHeader, DashboardStats, MetricCard, SectionHeader, AnalyticsCard
} from '@/components/dashboard/index';
import Card from '@/components/ui/Card';
import {
  Eye, Heart, Calendar, BarChart3, TrendingUp, Clock, Target, Users
} from 'lucide-react';
import toast from 'react-hot-toast';

const OwnerAnalytics = () => {
  const [properties, setProperties] = useState([]);
  const [visits, setVisits] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [propsData, visitsData] = await Promise.all([
          propertyService.getOwnerProperties(),
          propertyService.getVisits(),
        ]);
        setProperties(propsData || []);
        setVisits(visitsData || []);
      } catch {
        // silently fail
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const totalViews = properties.reduce((s, p) => s + (p.statistics?.views || 0), 0);
  const totalFavorites = properties.reduce((s, p) => s + (p.statistics?.favorites || 0), 0);
  const totalBookings = visits.length;
  const publishedCount = properties.filter(p => p.status === 'published').length;

  if (loading) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="h-20 bg-secondary-100 dark:bg-secondary-900 rounded-[18px]" />
        <div className="grid grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => <div key={i} className="h-[130px] bg-secondary-100 dark:bg-secondary-900 rounded-[18px]" />)}
        </div>
        <div className="grid grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => <div key={i} className="h-40 bg-secondary-100 dark:bg-secondary-900 rounded-[18px]" />)}
        </div>
      </div>
    );
  }

  // Top performing property
  const topProperty = properties.reduce((best, p) => {
    const views = p.statistics?.views || 0;
    return views > (best?.statistics?.views || 0) ? p : best;
  }, properties[0]);

  return (
    <div className="space-y-8">
      <DashboardHeader
        title="Analytics"
        subtitle={`Tracking performance across ${properties.length} properties.`}
        breadcrumbs={['Console', 'Analytics']}
      />

      {/* Summary KPIs */}
      <DashboardStats>
        <MetricCard title="Total Views"     value={totalViews.toLocaleString()} change="+12% this week" trend="increase" icon={<Eye      className="h-5 w-5 text-primary-600" />} />
        <MetricCard title="Total Favorites"  value={totalFavorites.toString()}    change="+6% this week"  trend="increase" icon={<Heart    className="h-5 w-5 text-error-500" />} />
        <MetricCard title="Tour Bookings"    value={totalBookings.toString()}     change={`${visits.filter(v => v.status === 'pending').length} pending`} trend="neutral" icon={<Calendar className="h-5 w-5 text-primary-600" />} />
        <MetricCard title="Active Listings"  value={publishedCount.toString()}    change={`of ${properties.length} total`} trend="neutral" icon={<BarChart3 className="h-5 w-5 text-primary-600" />} />
      </DashboardStats>

      {/* Trend Charts — horizontal row */}
      <div className="space-y-4">
        <SectionHeader title="Performance Trends" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <AnalyticsCard title="Views"     currentVal={`${totalViews}`}     change="+12%" points={[60, 95, 120, 190, 210, 240, totalViews || 280]} />
          <AnalyticsCard title="Favorites"  currentVal={`${totalFavorites}`}  change="+6%"  points={[4, 9, 14, 21, 28, 35, totalFavorites || 42]} />
          <AnalyticsCard title="Bookings"   currentVal={`${totalBookings}`}   change="+18%" points={[2, 5, 8, 12, 15, 18, totalBookings || 20]} />
          <AnalyticsCard title="Inquiries"  currentVal="34"                    change="+8%"  points={[8, 12, 18, 22, 26, 30, 34]} />
        </div>
      </div>

      {/* Property-level Insights */}
      <div className="space-y-4">
        <SectionHeader title="Property Insights" />
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <Card className="p-4 border border-secondary-200/50 dark:border-secondary-900 rounded-[18px] bg-white dark:bg-secondary-900 text-center hover:-translate-y-0.5 hover:shadow-premium-md transition-all duration-200">
            <span className="text-[12px] font-semibold text-secondary-400 block">Views</span>
            <span className="text-[22px] font-black text-secondary-900 dark:text-white block mt-1">{totalViews}</span>
          </Card>
          <Card className="p-4 border border-secondary-200/50 dark:border-secondary-900 rounded-[18px] bg-white dark:bg-secondary-900 text-center hover:-translate-y-0.5 hover:shadow-premium-md transition-all duration-200">
            <span className="text-[12px] font-semibold text-secondary-400 block">Favorites</span>
            <span className="text-[22px] font-black text-secondary-900 dark:text-white block mt-1">{totalFavorites}</span>
          </Card>
          <Card className="p-4 border border-secondary-200/50 dark:border-secondary-900 rounded-[18px] bg-white dark:bg-secondary-900 text-center hover:-translate-y-0.5 hover:shadow-premium-md transition-all duration-200">
            <span className="text-[12px] font-semibold text-secondary-400 block">Bookings</span>
            <span className="text-[22px] font-black text-secondary-900 dark:text-white block mt-1">{totalBookings}</span>
          </Card>
          <Card className="p-4 border border-secondary-200/50 dark:border-secondary-900 rounded-[18px] bg-white dark:bg-secondary-900 text-center hover:-translate-y-0.5 hover:shadow-premium-md transition-all duration-200">
            <span className="text-[12px] font-semibold text-secondary-400 block">CTR</span>
            <span className="text-[22px] font-black text-secondary-900 dark:text-white block mt-1">4.8%</span>
          </Card>
          <Card className="p-4 border border-secondary-200/50 dark:border-secondary-900 rounded-[18px] bg-white dark:bg-secondary-900 text-center hover:-translate-y-0.5 hover:shadow-premium-md transition-all duration-200">
            <span className="text-[12px] font-semibold text-secondary-400 block">Occupancy</span>
            <span className="text-[22px] font-black text-secondary-900 dark:text-white block mt-1">92%</span>
          </Card>
          <Card className="p-4 border border-secondary-200/50 dark:border-secondary-900 rounded-[18px] bg-white dark:bg-secondary-900 text-center hover:-translate-y-0.5 hover:shadow-premium-md transition-all duration-200">
            <span className="text-[12px] font-semibold text-secondary-400 block">Avg Response</span>
            <span className="text-[22px] font-black text-secondary-900 dark:text-white block mt-1">2h</span>
          </Card>
        </div>
      </div>

      {/* Top Performing listing */}
      {topProperty && (
        <div className="space-y-4">
          <SectionHeader title="Top Performing Listing" />
          <Card className="p-6 border border-secondary-200/50 dark:border-secondary-900 rounded-[18px] bg-white dark:bg-secondary-900 flex items-center space-x-6">
            <div className="h-24 w-24 bg-secondary-100 dark:bg-secondary-800 overflow-hidden shrink-0" style={{ borderRadius: '12px' }}>
              <img
                src={topProperty.images?.[0]?.url || 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=300&q=80'}
                alt=""
                className="h-full w-full object-cover"
                style={{ borderRadius: '12px' }}
              />
            </div>
            <div className="flex-1">
              <h4 className="text-[16px] font-bold text-secondary-900 dark:text-white">{topProperty.title}</h4>
              <p className="text-[13px] text-secondary-500 mt-0.5">{topProperty.location?.area}, {topProperty.location?.city}</p>
              <div className="flex items-center space-x-4 mt-3 text-[13px] font-semibold text-secondary-600">
                <span className="flex items-center"><Eye className="h-4 w-4 mr-1 text-primary-500" />{topProperty.statistics?.views || 0} views</span>
                <span className="flex items-center"><Heart className="h-4 w-4 mr-1 text-error-500" />{topProperty.statistics?.favorites || 0} saves</span>
                <span className="flex items-center"><TrendingUp className="h-4 w-4 mr-1 text-success-600" />Top rated</span>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default OwnerAnalytics;
