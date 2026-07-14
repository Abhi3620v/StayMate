import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import propertyService from '@/services/propertyService';
import {
  DashboardHeader, DashboardStats, MetricCard, SectionHeader,
  DataTable, EmptyState, StatusBadge, ActivityFeed,
  AnalyticsCard, QuickActions
} from '@/components/dashboard/index';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Avatar from '@/components/ui/Avatar';
import {
  Eye, Heart, Calendar, Plus, Home, Trash2, Copy, Play,
  Share2, FileText, MapPin, CheckSquare, Upload, ShieldCheck, Send,
  CreditCard, BarChart3, Shield
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '@/context/AuthContext';
import axios from 'axios';

const OwnerDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [properties, setProperties] = useState([]);
  const [visits, setVisits] = useState([]);
  const [reputation, setReputation] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [propsData, visitsData] = await Promise.all([
        propertyService.getOwnerProperties(),
        propertyService.getVisits(),
      ]);
      setProperties(propsData || []);
      setVisits(visitsData || []);
      
      const token = localStorage.getItem('accessToken');
      const repResponse = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000'}/api/v1/reviews/reputation/${user?.id || user?._id}`,
        { headers: { Authorization: token ? `Bearer ${token}` : '' } }
      );
      setReputation(repResponse.data.data);
    } catch (err) {
      // Silently handle - dashboard will show empty states
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { 
    if (user) {
      fetchDashboardData(); 
    }
  }, [user]);

  const totalViews = properties.reduce((s, p) => s + (p.statistics?.views || 0), 0);
  const totalFavorites = properties.reduce((s, p) => s + (p.statistics?.favorites || 0), 0);
  const activeCount = properties.filter((p) => p.status === 'published').length;
  const pendingVisits = visits.filter((v) => v.status === 'pending');

  /* ── Actions ── */
  const handlePublish = async (p) => {
    try {
      await propertyService.updateProperty(p._id || p.id, { ...p, status: 'published' });
      toast.success('Listing published!');
      fetchDashboardData();
    } catch { toast.error('Failed to publish.'); }
  };
  const handleDuplicate = async (id) => {
    try {
      await propertyService.duplicateProperty(id);
      toast.success('Listing duplicated.');
      fetchDashboardData();
    } catch { toast.error('Failed to duplicate.'); }
  };
  const handleArchive = async (id) => {
    if (!window.confirm('Archive this listing?')) return;
    try {
      await propertyService.deleteProperty(id);
      toast.success('Listing archived.');
      fetchDashboardData();
    } catch { toast.error('Failed to archive.'); }
  };
  const handleVisitAction = async (id, status) => {
    try {
      await propertyService.updateVisit(id, { status });
      toast.success(`Visit ${status}.`);
      fetchDashboardData();
    } catch { toast.error('Update failed.'); }
  };

  /* ── Greeting ── */
  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Welcome back';
    if (h < 17) return 'Welcome back';
    return 'Welcome back';
  };

  const lastLogin = new Date().toLocaleDateString('en-IN', {
    weekday: 'short', year: 'numeric', month: 'short', day: 'numeric',
  });

  const quickActions = [
    { label: 'Add Property',    icon: Plus,       onClick: () => navigate('/owner/properties/create') },
    { label: 'My Properties',   icon: Home,       onClick: () => navigate('/owner/properties') },
    { label: 'Payments',        icon: CreditCard, onClick: () => navigate('/payments/history') },
    { label: 'Analytics',       icon: BarChart3,  onClick: () => navigate('/owner/analytics') },
  ];

  const activities = [
    { description: 'Listing views reached 1,200 milestone',   time: '1 hr ago', icon: <Eye className="h-3.5 w-3.5" /> },
    { description: `You have ${properties.length} total listings.`, time: 'Today',     icon: <Home className="h-3.5 w-3.5" /> },
    { description: 'Tenant scheduled site tour.',               time: 'Yesterday', icon: <Calendar className="h-3.5 w-3.5" /> },
  ];

  const headers = ['Cover', 'Title / Location', 'Status', 'Views / Saves', 'Actions'];
  const visitHeaders = ['Visitor', 'Requested Date', 'Status', 'Actions'];
  const hasListings = properties.length > 0;

  /* ── Loading skeleton ── */
  if (loading) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="h-[72px] bg-secondary-100 dark:bg-secondary-900 rounded-[18px]" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
          {[...Array(5)].map((_, i) => <div key={i} className="h-[128px] bg-secondary-100 dark:bg-secondary-900 rounded-[18px]" />)}
        </div>
        <div className="h-48 bg-secondary-100 dark:bg-secondary-900 rounded-[18px]" />
      </div>
    );
  }

  return (
    <div className="space-y-8">

      {/* ═══ Section 1: Header ═══ */}
      <DashboardHeader
        title={`Welcome back, ${user?.name || 'Landlord'}`}
        subtitle={`Track your properties, tour schedules, and listings statistics.`}
        roleBadge="Owner Console"
        breadcrumbs={['Console', 'Owner Dashboard']}
        actions={
          <Button variant="primary" className="font-bold text-[13px] h-11 px-5 rounded-xl" onClick={() => navigate('/owner/properties/create')}>
            <Plus className="h-4 w-4 mr-2" /> Add Property
          </Button>
        }
      />

      {/* ═══ Section 2: Metrics (one horizontal row) ═══ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        <MetricCard title="Listings"       value={properties.length} change={`${activeCount} active`}        trend="neutral" desc="Total properties listed" icon={<Home     className="h-5 w-5 text-primary-650" />} />
        <MetricCard title="Total Views"    value={totalViews.toLocaleString()} change="+12%" trend="increase" desc="Views milestone" icon={<Eye      className="h-5 w-5 text-primary-650" />} />
        <MetricCard title="Favorites"      value={totalFavorites.toString()}    desc="Saved by tenants"   trend="neutral" icon={<Heart    className="h-5 w-5 text-error-500" />} />
        <MetricCard title="Visit Requests" value={visits.length}                change={`${pendingVisits.length} pending`} trend="neutral" desc="Tour requests" icon={<Calendar className="h-5 w-5 text-primary-650" />} />
        <MetricCard
          title="Reputation Score"
          value={reputation ? `${reputation.score}/100` : 'Calculating...'}
          desc={reputation ? `${reputation.level} Trust Level` : 'Calculating trust'}
          trend="neutral"
          icon={<Shield className="h-5 w-5 text-success-500" />}
        />
      </div>

      {/* ═══ Section 3: Quick Actions (compact tiles) ═══ */}
      <QuickActions actions={quickActions} />

      {/* ═══ Conditional: 0 listings → Getting Started Checklist ═══ */}
      {!hasListings ? (
        <Card className="p-8 border border-secondary-200/50 rounded-[18px] bg-white dark:bg-secondary-900 max-w-2xl mx-auto">
          <h3 className="text-[22px] font-extrabold text-secondary-900 dark:text-white mb-1">Getting Started</h3>
          <p className="text-[13px] text-secondary-500 mb-6">Complete these steps to publish your first listing.</p>
          <div className="space-y-4">
            {[
              { icon: <Home className="h-4.5 w-4.5" />,        label: 'Create your first listing',   done: false },
              { icon: <Upload className="h-4.5 w-4.5" />,      label: 'Upload property photos',      done: false },
              { icon: <ShieldCheck className="h-4.5 w-4.5" />, label: 'Complete owner verification',  done: false },
              { icon: <Send className="h-4.5 w-4.5" />,        label: 'Publish property live',        done: false },
            ].map((step, i) => (
              <div key={i} className="flex items-center space-x-4 p-3 rounded-xl border border-secondary-100 dark:border-secondary-900 hover:bg-secondary-50/50 dark:hover:bg-secondary-900/40 transition-colors">
                <div className="p-2 rounded-lg bg-secondary-50 dark:bg-secondary-950 text-secondary-400">{step.icon}</div>
                <span className="text-[14px] font-semibold text-secondary-800 dark:text-secondary-300 flex-1">{step.label}</span>
                <CheckSquare className="h-5 w-5 text-secondary-300" />
              </div>
            ))}
          </div>
          <div className="mt-6 text-center">
            <Button variant="primary" className="font-bold text-[13px] h-11 px-6 rounded-xl" onClick={() => navigate('/owner/properties/create')}>
              Create Your First Listing
            </Button>
          </div>
        </Card>
      ) : (
        <>
          {/* ═══ Section 5: 50/50 Split — Recent Listings + Upcoming Visits ═══ */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left: Recent Listings */}
            <div className="space-y-4">
              <SectionHeader 
                title="Recent Listings" 
                badge={properties.length} 
                description="Manage your published properties and drafts"
              />
              <DataTable
                headers={headers}
                data={properties.slice(0, 5)}
                emptyState={
                  <EmptyState 
                    title="No listings found" 
                    description="You haven't listed any properties yet. Start by publishing your first property." 
                    action={
                      <Button variant="outline" size="sm" onClick={() => navigate('/owner/properties/create')}>
                        Create listing
                      </Button>
                    }
                  />
                }
                renderRow={(prop) => {
                  const cover = prop.images?.[0]?.url || 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=300&q=80';
                  return (
                    <tr key={prop._id || prop.id} className="hover:bg-secondary-50/50 dark:hover:bg-secondary-900/40 transition-colors duration-150">
                      <td className="px-5 py-3">
                        <div className="h-10 w-14 rounded-lg bg-secondary-100 dark:bg-secondary-800 overflow-hidden">
                          <img src={cover} alt="" className="h-full w-full object-cover" />
                        </div>
                      </td>
                      <td className="px-5 py-3">
                        <Link to={`/properties/${prop._id || prop.id}`} className="hover:text-primary-650 transition-colors">
                          <span className="font-bold text-[13px] text-secondary-900 dark:text-white line-clamp-1 block">{prop.title}</span>
                        </Link>
                        <span className="text-[11px] text-secondary-400 font-medium flex items-center mt-0.5">
                          <MapPin className="h-3 w-3 mr-0.5" /> {prop.location?.area}, {prop.location?.city}
                        </span>
                      </td>
                      <td className="px-5 py-3"><StatusBadge status={prop.status} /></td>
                      <td className="px-5 py-3 text-[12px] text-secondary-600 font-semibold">
                        {prop.statistics?.views || 0} / {prop.statistics?.favorites || 0}
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center space-x-1.5">
                          {prop.status === 'draft' && (
                            <button onClick={() => handlePublish(prop)} className="p-1.5 rounded-lg border border-secondary-200 text-secondary-500 hover:text-success-600 hover:border-success-200 transition-colors" title="Publish"><Play className="h-3.5 w-3.5 fill-current" /></button>
                          )}
                          <button onClick={() => handleDuplicate(prop._id || prop.id)} className="p-1.5 rounded-lg border border-secondary-200 text-secondary-500 hover:text-primary-600 hover:border-primary-200 transition-colors" title="Duplicate"><Copy className="h-3.5 w-3.5" /></button>
                          <button onClick={() => handleArchive(prop._id || prop.id)} className="p-1.5 rounded-lg border border-secondary-200 text-secondary-500 hover:text-error-600 hover:border-error-200 transition-colors" title="Archive"><Trash2 className="h-3.5 w-3.5" /></button>
                        </div>
                      </td>
                    </tr>
                  );
                }}
              />
            </div>

            {/* Right: Upcoming Visits */}
            <div className="space-y-4">
              <SectionHeader 
                title="Upcoming Visits" 
                badge={pendingVisits.length} 
                description="Tour requests submitted by interested tenants"
              />
              {pendingVisits.length === 0 ? (
                <EmptyState 
                  title="No pending visits" 
                  description="You don't have any tour requests waiting for host review." 
                />
              ) : (
                <DataTable
                  headers={visitHeaders}
                  data={pendingVisits.slice(0, 5)}
                  renderRow={(v) => (
                    <tr key={v.id || v._id} className="hover:bg-secondary-50/50 dark:hover:bg-secondary-900/40 transition-colors duration-150">
                      <td className="px-5 py-3">
                        <div className="flex items-center space-x-2.5">
                          <Avatar src={v.tenantId?.avatar} name={v.tenantId?.name} size="sm" />
                          <span className="font-bold text-[13px] text-secondary-900 dark:text-white">{v.tenantId?.name}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-[12px] text-secondary-600 font-semibold">
                        {new Date(v.date).toLocaleDateString()} at {v.time}
                      </td>
                      <td className="px-5 py-3"><StatusBadge status={v.status} /></td>
                      <td className="px-5 py-3">
                        <div className="flex items-center space-x-1.5">
                          <button onClick={() => handleVisitAction(v.id || v._id, 'accepted')} className="px-2.5 py-1 rounded-lg bg-success-50 text-success-700 text-[10px] font-bold hover:bg-success-100 transition-colors">Approve</button>
                          <button onClick={() => handleVisitAction(v.id || v._id, 'rejected')} className="px-2.5 py-1 rounded-lg bg-error-50 text-error-700 text-[10px] font-bold hover:bg-error-100 transition-colors">Decline</button>
                        </div>
                      </td>
                    </tr>
                  )}
                />
              )}
            </div>
          </div>

          {/* ═══ Section 6: Analytics — horizontal row of sparklines ═══ */}
          <div className="space-y-4">
            <SectionHeader 
              title="Performance Overview" 
              description="Analytics graphs tracking user engagement milestones"
            />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <AnalyticsCard title="Views"     currentVal={`${totalViews}`}     change="+12%"  points={[60, 95, 120, 190, 210, 240, totalViews || 280]} description="Daily view counts across stays" timePeriod="Last 7 Days" />
              <AnalyticsCard title="Favorites"  currentVal={`${totalFavorites}`}  change="+6%"   points={[4, 9, 14, 21, 28, 35, totalFavorites || 42]} description="Saves count by interested tenants" timePeriod="Last 7 Days" />
              <AnalyticsCard title="Bookings"   currentVal={`${visits.length}`}   change="+18%"  points={[2, 5, 8, 12, 15, 18, visits.length || 20]} description="Scheduled tours by prospective roommate applicants" timePeriod="Last 7 Days" />
              <AnalyticsCard title="Inquiries"  currentVal="34"                    change="+8%"   points={[8, 12, 18, 22, 26, 30, 34]} description="Incoming contact questions from matching tenants" timePeriod="Last 7 Days" />
            </div>
          </div>

          {/* ═══ Section 7: Recent Activity ═══ */}
          <div className="space-y-4">
            <SectionHeader 
              title="Recent Activity" 
              description="Real-time timeline logs of listing metrics and visitor appointments"
            />
            <ActivityFeed items={activities} />
          </div>
        </>
      )}
    </div>
  );
};

export default OwnerDashboard;
