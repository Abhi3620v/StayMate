import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import roommateService from '@/services/roommateService';
import {
  DashboardHeader, DashboardStats, MetricCard, SectionHeader,
  DataTable, EmptyState, ActivityFeed, AnalyticsCard, QuickActions
} from '@/components/dashboard/index';
import { useAuth } from '@/context/AuthContext';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import {
  Shield, UserCheck, Activity, Database, Mail, CloudLightning,
  Users, Home, ShieldAlert, Layers, Flag, BarChart3, Star
} from 'lucide-react';
import toast from 'react-hot-toast';
import axios from 'axios';
import notificationService from '@/modules/notification/services/notificationService';

const AdminDashboard = () => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [roommateReports, setRoommateReports] = useState([]);
  const [chatReports, setChatReports] = useState([]);
  const [reviewReports, setReviewReports] = useState([]);
  const [reportsTab, setReportsTab] = useState('properties');
  const [platformStats, setPlatformStats] = useState({
    totalUsers: 1482,
    totalProperties: 412
  });

  // Broadcast & Analytics State
  const [broadcastData, setBroadcastData] = useState({ title: '', message: '', priority: 'medium', icon: 'bell' });
  const [analytics, setAnalytics] = useState(null);
  const [broadcastLoading, setBroadcastLoading] = useState(false);

  const fetchPlatformStats = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL || (import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace(/\/api\/v1\/?$/, '') : 'http://localhost:5000')}/api/v1/properties/admin/analytics`,
        { headers: { Authorization: token ? `Bearer ${token}` : '' } }
      );
      if (response.data?.success && response.data?.data) {
        const kpi = response.data.data.kpi || {};
        setPlatformStats({
          totalUsers: kpi.totalUsers || 0,
          totalProperties: kpi.totalListings || 0
        });
      }
    } catch (err) {
      console.warn('Failed to retrieve platform stats:', err.message);
    }
  };

  const fetchNotificationAnalytics = async () => {
    try {
      const res = await notificationService.getAnalyticsSummary();
      setAnalytics(res.data || null);
    } catch (err) {
      console.warn('Failed to retrieve notification analytics:', err.message);
    }
  };

  const fetchRoommateReports = async () => {
    try {
      const data = await roommateService.getReports();
      setRoommateReports(data || []);
    } catch (err) {
      // Handle silently
    }
  };

  const fetchChatReports = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL || (import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace(/\/api\/v1\/?$/, '') : 'http://localhost:5000')}/api/v1/chat/reports`,
        { headers: { Authorization: token ? `Bearer ${token}` : '' } }
      );
      setChatReports(response.data.data || []);
    } catch (err) {
      // Handle silently
    }
  };

  const fetchReviewReports = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL || (import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace(/\/api\/v1\/?$/, '') : 'http://localhost:5000')}/api/v1/reviews/reports`,
        { headers: { Authorization: token ? `Bearer ${token}` : '' } }
      );
      setReviewReports(response.data.data || []);
    } catch (err) {
      // Handle silently
    }
  };

  useEffect(() => {
    fetchPlatformStats();
    if (pathname.includes('/reports')) {
      fetchRoommateReports();
      fetchChatReports();
    }
    if (pathname.includes('/reviews')) {
      fetchReviewReports();
    }
    if (pathname.includes('/broadcast')) {
      fetchNotificationAnalytics();
    }
  }, [pathname]);

  const handleResolveRoommateReport = async (id, status) => {
    const notes = window.prompt(`Enter resolution notes for report status ${status}:`);
    if (notes === null) return;
    try {
      await roommateService.resolveReport(id, { status, resolutionNotes: notes || 'Handled by admin.' });
      toast.success(`Report marked as ${status}.`);
      fetchRoommateReports();
    } catch (err) {
      toast.error('Failed to resolve report.');
    }
  };

  const handleResolveChatReport = async (id) => {
    if (!window.confirm('Mark this chat report as resolved?')) return;
    try {
      const token = localStorage.getItem('accessToken');
      await axios.post(
        `${import.meta.env.VITE_BACKEND_URL || (import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace(/\/api\/v1\/?$/, '') : 'http://localhost:5000')}/api/v1/chat/reports/${id}/resolve`,
        {},
        { headers: { Authorization: token ? `Bearer ${token}` : '' } }
      );
      toast.success('Report resolved successfully.');
      fetchChatReports();
    } catch (err) {
      toast.error('Failed to resolve report.');
    }
  };

  const [pendingKYC, setPendingKYC] = useState([
    { id: 'kyc-1', name: 'Rajesh Malhotra', email: 'rajesh.owner@gmail.com', docs: 'Aadhaar Card & Land Deeds', date: '2026-07-03' },
    { id: 'kyc-2', name: 'Sanjay Dutt', email: 'sanjay.dutt@gmail.com', docs: 'Passport & Electricity Bill', date: '2026-07-02' },
  ]);
  const [reportedListings, setReportedListings] = useState([
    { id: 'rep-1', title: 'Single Shared Room Katraj', owner: 'Suresh Kumar', reason: 'Incorrect price details', date: '2026-07-01' },
  ]);

  const users = [
    { id: 'usr-1', name: 'Priya Sharma', email: 'priya.sharma@mail.com', role: 'tenant', status: 'Active', joined: '2026-07-03' },
    { id: 'usr-2', name: 'Rajesh Malhotra', email: 'rajesh.owner@gmail.com', role: 'owner', status: 'KYC Pending', joined: '2026-07-02' },
    { id: 'usr-3', name: 'Aman Verma', email: 'aman.verma@mail.com', role: 'tenant', status: 'Active', joined: '2026-07-01' },
  ];

  const handleApproveKYC = (id) => { toast.success('KYC approved.'); setPendingKYC((p) => p.filter((k) => k.id !== id)); };
  const handleRejectKYC = (id) => { toast.success('KYC rejected.'); setPendingKYC((p) => p.filter((k) => k.id !== id)); };
  const handleDismissFlag = (id) => { toast.success('Flag dismissed.'); setReportedListings((p) => p.filter((r) => r.id !== id)); };
  const handleBlockFlag = (id) => { toast.success('Listing blocked.'); setReportedListings((p) => p.filter((r) => r.id !== id)); };

  const systemHealth = [
    { name: 'Database', status: 'Healthy', icon: <Database className="h-4 w-4 text-success-600" /> },
    { name: 'API', status: 'Active (42ms)', icon: <Activity className="h-4 w-4 text-success-600" /> },
    { name: 'Cloudinary', status: 'Healthy', icon: <CloudLightning className="h-4 w-4 text-success-600" /> },
    { name: 'Email', status: 'Healthy', icon: <Mail className="h-4 w-4 text-success-600" /> },
    { name: 'Storage', status: 'Healthy', icon: <Layers className="h-4 w-4 text-success-600" /> },
    { name: 'Jobs', status: 'Healthy', icon: <Shield className="h-4 w-4 text-success-600" /> },
  ];

  const adminActivities = [
    { description: 'User registered: priya.sharma@mail.com', time: '30 min ago', icon: <Users className="h-3.5 w-3.5" /> },
    { description: 'Property "Downtown Studio" approved', time: '1 hr ago', icon: <Home className="h-3.5 w-3.5" /> },
    { description: 'Moderator blocked listing #4821', time: '2 hrs ago', icon: <ShieldAlert className="h-3.5 w-3.5" /> },
    { description: 'KYC verification completed for Karan Johar', time: 'Yesterday', icon: <UserCheck className="h-3.5 w-3.5" /> },
    { description: 'Report #12 resolved - no action needed', time: '2 days ago', icon: <Flag className="h-3.5 w-3.5" /> },
  ];

  const currentSection = pathname.split('/').pop();
  const sectionMeta = {
    dashboard: {
      title: 'Platform Control Center',
      subtitle: `Pending Verifications: ${pendingKYC.length} - Open Reports: ${reportedListings.length} - System: Healthy`,
      breadcrumb: 'Admin Dashboard',
    },
    users: {
      title: 'User Management',
      subtitle: 'Review platform users, roles, and account status.',
      breadcrumb: 'User Management',
    },
    verifications: {
      title: 'Owner Verification',
      subtitle: `${pendingKYC.length} owner KYC requests waiting for review.`,
      breadcrumb: 'Owner Verification',
    },
    moderation: {
      title: 'Property Moderation',
      subtitle: 'Inspect flagged listings and take moderation action.',
      breadcrumb: 'Property Moderation',
    },
    reports: {
      title: 'Reports & Flags',
      subtitle: `${reportedListings.length} open reports need admin attention.`,
      breadcrumb: 'Reports & Flags',
    },
    'audit-logs': {
      title: 'Audit Logs',
      subtitle: 'Recent admin, moderation, and platform activity.',
      breadcrumb: 'Audit Logs',
    },
    'system-health': {
      title: 'System Health',
      subtitle: 'Operational status for platform services.',
      breadcrumb: 'System Health',
    },
    reviews: {
      title: 'Review Moderation Center',
      subtitle: `${reviewReports.length} pending review reports need audit.`,
      breadcrumb: 'Review Moderation',
    },
    broadcast: {
      title: 'Platform Announcement Broadcast',
      subtitle: 'Compose alerts and verify delivery logs.',
      breadcrumb: 'Broadcast Alerts',
    },
  }[currentSection] || {
    title: 'Platform Control Center',
    subtitle: 'Admin command center overview.',
    breadcrumb: 'Admin Dashboard',
  };

  const kycHeaders = ['Name / Email', 'Documents', 'Submitted', 'Actions'];
  const reportHeaders = ['Listing / Owner', 'Report Reason', 'Reported', 'Actions'];
  const userHeaders = ['User', 'Role', 'Status', 'Joined', 'Actions'];

  const renderUsers = () => (
    <div className="space-y-4">
      <SectionHeader title="User Management" badge={users.length} />
      <DataTable
        headers={userHeaders}
        data={users}
        renderRow={(user) => (
          <tr key={user.id} className="hover:bg-secondary-50/50 dark:hover:bg-secondary-900/40 transition-colors duration-150">
            <td className="px-5 py-3">
              <span className="font-bold text-[13px] text-secondary-900 dark:text-white block">{user.name}</span>
              <span className="text-[11px] text-secondary-400 font-medium">{user.email}</span>
            </td>
            <td className="px-5 py-3">
              <Badge variant="secondary" className="text-[9px] font-bold capitalize px-2 py-0.5 rounded">{user.role}</Badge>
            </td>
            <td className="px-5 py-3 text-[12px] text-secondary-600 font-semibold">{user.status}</td>
            <td className="px-5 py-3 text-[12px] text-secondary-500 font-semibold">{user.joined}</td>
            <td className="px-5 py-3">
              <button onClick={() => toast.success(`Opened ${user.name}'s profile.`)} className="px-2.5 py-1 rounded-lg bg-primary-50 text-primary-700 text-[10px] font-bold hover:bg-primary-100 transition-colors">
                View
              </button>
            </td>
          </tr>
        )}
      />
    </div>
  );

  const renderVerification = () => (
    <div className="space-y-4">
      <SectionHeader title="Owner Verification Queue" badge={pendingKYC.length} />
      {pendingKYC.length === 0 ? (
        <EmptyState title="Queue empty" description="All KYC requests have been processed." />
      ) : (
        <DataTable
          headers={kycHeaders}
          data={pendingKYC}
          renderRow={(kyc) => (
            <tr key={kyc.id} className="hover:bg-secondary-50/50 dark:hover:bg-secondary-900/40 transition-colors duration-150">
              <td className="px-5 py-3">
                <span className="font-bold text-[13px] text-secondary-900 dark:text-white block">{kyc.name}</span>
                <span className="text-[11px] text-secondary-400 font-medium">{kyc.email}</span>
              </td>
              <td className="px-5 py-3 text-[12px] text-secondary-600 font-semibold">{kyc.docs}</td>
              <td className="px-5 py-3 text-[12px] text-secondary-500 font-semibold">{kyc.date}</td>
              <td className="px-5 py-3">
                <div className="flex items-center space-x-1.5">
                  <button onClick={() => handleApproveKYC(kyc.id)} className="px-2.5 py-1 rounded-lg bg-success-50 text-success-700 text-[10px] font-bold hover:bg-success-100 transition-colors">Verify</button>
                  <button onClick={() => handleRejectKYC(kyc.id)} className="px-2.5 py-1 rounded-lg bg-error-50 text-error-700 text-[10px] font-bold hover:bg-error-100 transition-colors">Reject</button>
                </div>
              </td>
            </tr>
          )}
        />
      )}
    </div>
  );

  const renderPropertyListingsReports = (title) => (
    <div className="space-y-4">
      <SectionHeader title={title || "Property Moderation Queue"} badge={reportedListings.length} />
      {reportedListings.length === 0 ? (
        <EmptyState title="No flags" description="No items flagged for moderation." />
      ) : (
        <DataTable
          headers={reportHeaders}
          data={reportedListings}
          renderRow={(rep) => (
            <tr key={rep.id} className="hover:bg-secondary-50/50 dark:hover:bg-secondary-900/40 transition-colors duration-150">
              <td className="px-5 py-3">
                <span className="font-bold text-[13px] text-secondary-900 dark:text-white block">{rep.title}</span>
                <span className="text-[11px] text-secondary-400 font-medium">Owner: {rep.owner}</span>
              </td>
              <td className="px-5 py-3 text-[12px] text-secondary-600 font-semibold italic">"{rep.reason}"</td>
              <td className="px-5 py-3 text-[12px] text-secondary-500 font-semibold">{rep.date}</td>
              <td className="px-5 py-3">
                <div className="flex items-center space-x-1.5">
                  <button onClick={() => handleDismissFlag(rep.id)} className="px-2.5 py-1 rounded-lg bg-secondary-50 text-secondary-700 text-[10px] font-bold hover:bg-secondary-100 transition-colors">Dismiss</button>
                  <button onClick={() => handleBlockFlag(rep.id)} className="px-2.5 py-1 rounded-lg bg-error-50 text-error-700 text-[10px] font-bold hover:bg-error-100 transition-colors">Block</button>
                </div>
              </td>
            </tr>
          )}
        />
      )}
    </div>
  );

  const renderRoommateProfilesReports = () => (
    <div className="space-y-4">
      <SectionHeader title="Reported Roommate Profiles" badge={roommateReports.length} />
      {roommateReports.length === 0 ? (
        <EmptyState title="No flags" description="No roommate profiles flagged for moderation." />
      ) : (
        <DataTable
          headers={['Reported User', 'Reporter', 'Reason', 'Status', 'Actions']}
          data={roommateReports}
          renderRow={(rep) => {
            const reportedName = rep.roommateId?.userId?.name || 'Reported User';
            const reportedEmail = rep.roommateId?.userId?.email || 'N/A';
            const reporterName = rep.reporterId?.name || 'Reporter';
            const reporterEmail = rep.reporterId?.email || 'N/A';

            return (
              <tr key={rep._id} className="hover:bg-secondary-50/55 dark:hover:bg-secondary-900/40 transition-colors duration-150 text-[12px]">
                <td className="px-5 py-3">
                  <span className="font-bold text-secondary-900 dark:text-white block">{reportedName}</span>
                  <span className="text-[10px] text-secondary-400 font-medium">{reportedEmail}</span>
                </td>
                <td className="px-5 py-3">
                  <span className="font-bold text-secondary-700 dark:text-secondary-300 block">{reporterName}</span>
                  <span className="text-[10px] text-secondary-400 font-medium">{reporterEmail}</span>
                </td>
                <td className="px-5 py-3 font-semibold">
                  <span className="text-secondary-800 dark:text-secondary-200 block font-bold">{rep.reason}</span>
                  <span className="text-[10px] text-secondary-400 italic">"{rep.description || 'No description'}"</span>
                </td>
                <td className="px-5 py-3">
                  <Badge variant={rep.status === 'pending' ? 'warning' : rep.status === 'resolved' ? 'success' : 'secondary'} className="text-[9px] font-bold capitalize">
                    {rep.status}
                  </Badge>
                </td>
                <td className="px-5 py-3">
                  {rep.status === 'pending' ? (
                    <div className="flex items-center space-x-1.5">
                      <button
                        onClick={() => handleResolveRoommateReport(rep._id, 'resolved')}
                        className="px-2 py-1 rounded bg-success-50 text-success-700 text-[9px] font-bold hover:bg-success-100 transition-colors"
                      >
                        Resolve/Block
                      </button>
                      <button
                        onClick={() => handleResolveRoommateReport(rep._id, 'dismissed')}
                        className="px-2 py-1 rounded bg-secondary-50 text-secondary-700 text-[9px] font-bold hover:bg-secondary-100 transition-colors"
                      >
                        Dismiss
                      </button>
                    </div>
                  ) : (
                    <span className="text-[10px] text-secondary-400 font-semibold italic">Resolved</span>
                  )}
                </td>
              </tr>
            );
          }}
        />
      )}
    </div>
  );

  const renderChatReports = () => (
    <div className="space-y-4">
      <SectionHeader title="Reported Conversations & Messages" badge={chatReports.length} />
      {chatReports.length === 0 ? (
        <EmptyState title="No flags" description="No chat threads flagged for moderation." />
      ) : (
        <DataTable
          headers={['Reporter', 'Reason & Details', 'Message Content', 'Status', 'Actions']}
          data={chatReports}
          renderRow={(rep) => {
            const reporterName = rep.reporterId?.name || 'Reporter';
            const reporterEmail = rep.reporterId?.email || 'N/A';
            const messageText = rep.messageId?.text || '(Entire conversation thread)';

            return (
              <tr key={rep._id} className="hover:bg-secondary-50/55 dark:hover:bg-secondary-900/40 transition-colors duration-150 text-[12px]">
                <td className="px-5 py-3">
                  <span className="font-bold text-secondary-900 dark:text-white block">{reporterName}</span>
                  <span className="text-[10px] text-secondary-400 font-medium">{reporterEmail}</span>
                </td>
                <td className="px-5 py-3 font-semibold">
                  <span className="text-secondary-800 dark:text-secondary-200 block font-bold capitalize">{rep.reason}</span>
                  <span className="text-[10px] text-secondary-450 italic">"{rep.explanation || 'No notes'}"</span>
                </td>
                <td className="px-5 py-3 text-secondary-600 dark:text-secondary-400 max-w-xs truncate">
                  {messageText}
                </td>
                <td className="px-5 py-3">
                  <Badge variant={rep.status === 'pending' ? 'warning' : 'success'} className="text-[9px] font-bold capitalize">
                    {rep.status}
                  </Badge>
                </td>
                <td className="px-5 py-3">
                  {rep.status === 'pending' ? (
                    <button
                      onClick={() => handleResolveChatReport(rep._id)}
                      className="px-2 py-1 rounded bg-success-50 text-success-700 text-[9px] font-bold hover:bg-success-100 transition-colors"
                    >
                      Resolve
                    </button>
                  ) : (
                    <span className="text-[10px] text-secondary-400 font-semibold italic">Resolved</span>
                  )}
                </td>
              </tr>
            );
          }}
        />
      )}
    </div>
  );

  const renderReports = (title = 'Reports & Flags') => {
    const isGeneralReports = title === 'Reports & Flags';
    if (isGeneralReports) {
      return (
        <div className="space-y-6">
          {/* Sub-tabs */}
          <div className="flex space-x-4 border-b border-secondary-100 dark:border-secondary-800 pb-2">
            <button
              onClick={() => setReportsTab('properties')}
              className={`text-xs font-bold pb-2 select-none ${
                reportsTab === 'properties'
                  ? 'border-b-2 border-primary-600 text-primary-600 dark:text-primary-400 dark:border-primary-400'
                  : 'text-secondary-400 hover:text-secondary-600'
              }`}
            >
              Property Listings
            </button>
            <button
              onClick={() => setReportsTab('roommates')}
              className={`text-xs font-bold pb-2 select-none ${
                reportsTab === 'roommates'
                  ? 'border-b-2 border-primary-600 text-primary-600 dark:text-primary-400 dark:border-primary-400'
                  : 'text-secondary-400 hover:text-secondary-600'
              }`}
            >
              Roommate Profiles
            </button>
            <button
              onClick={() => setReportsTab('chats')}
              className={`text-xs font-bold pb-2 select-none ${
                reportsTab === 'chats'
                  ? 'border-b-2 border-primary-600 text-primary-600 dark:text-primary-400 dark:border-primary-400'
                  : 'text-secondary-400 hover:text-secondary-600'
              }`}
            >
              Reported Chats
            </button>
          </div>

          {reportsTab === 'properties'
            ? renderPropertyListingsReports("Flagged Property Listings")
            : reportsTab === 'roommates'
            ? renderRoommateProfilesReports()
            : renderChatReports()}
        </div>
      );
    }

    return renderPropertyListingsReports(title);
  };

  const handleResolveReviewReport = async (reviewId, reportId, status, action) => {
    const confirmMsg = status === 'dismissed' 
      ? 'Dismiss this report flag? Review will remain active.' 
      : 'Resolve report and hide this review?';
      
    if (!window.confirm(confirmMsg)) return;

    try {
      const token = localStorage.getItem('accessToken');
      await axios.post(
        `${import.meta.env.VITE_BACKEND_URL || (import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace(/\/api\/v1\/?$/, '') : 'http://localhost:5000')}/api/v1/reviews/reports/${reviewId}/resolve/${reportId}`,
        { status, action },
        { headers: { Authorization: token ? `Bearer ${token}` : '' } }
      );
      toast.success(status === 'dismissed' ? 'Flag dismissed.' : 'Review hidden and report resolved.');
      fetchReviewReports();
    } catch (err) {
      toast.error('Failed to update report resolution.');
    }
  };

  const renderReviewModeration = () => (
    <div className="space-y-4">
      <SectionHeader title="Review Reports Queue" badge={reviewReports.length} />
      {reviewReports.length === 0 ? (
        <EmptyState title="No review reports" description="Flagged reviews needing moderation will appear here." />
      ) : (
        <DataTable
          headers={['Author / Category', 'Review Content', 'Flag Reason / Detail', 'Actions']}
          data={reviewReports}
          renderRow={(rep) => (
            <tr key={rep._id} className="hover:bg-secondary-50/50 dark:hover:bg-secondary-900/40 transition-colors duration-150 text-xs">
              <td className="px-5 py-3">
                <span className="font-bold text-secondary-900 dark:text-white block">
                  {rep.reviewAuthor?.name || 'Anonymous'}
                </span>
                <span className="text-[10px] text-secondary-400 capitalize font-semibold block mt-0.5">
                  Category: {rep.category}
                </span>
              </td>
              <td className="px-5 py-3 max-w-xs">
                <div className="flex items-center space-x-1 mb-1">
                  <span className="font-extrabold text-[11px] text-amber-500">{rep.rating} ★</span>
                </div>
                <p className="text-secondary-650 dark:text-secondary-400 line-clamp-2 italic font-semibold">
                  "{rep.reviewContent}"
                </p>
              </td>
              <td className="px-5 py-3">
                <Badge variant="error" className="text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-lg mb-1">
                  {rep.reason?.replace('_', ' ')}
                </Badge>
                <p className="text-[11px] text-secondary-500 line-clamp-1">{rep.explanation}</p>
              </td>
              <td className="px-5 py-3">
                <div className="flex items-center space-x-2">
                  <Button
                    size="xs"
                    variant="outline"
                    className="text-success-650 border-success-200 hover:bg-success-50 text-[10px] font-bold py-1.5 px-3 rounded-lg"
                    onClick={() => handleResolveReviewReport(rep.reviewId, rep._id, 'dismissed')}
                  >
                    Dismiss
                  </Button>
                  <Button
                    size="xs"
                    variant="outline"
                    className="text-error-600 border-error-200 hover:bg-error-50 text-[10px] font-bold py-1.5 px-3 rounded-lg"
                    onClick={() => handleResolveReviewReport(rep.reviewId, rep._id, 'resolved', 'hide')}
                  >
                    Hide Review
                  </Button>
                </div>
              </td>
            </tr>
          )}
        />
      )}
    </div>
  );

  const renderBroadcast = () => {
    const handleSendBroadcast = async (e) => {
      e.preventDefault();
      if (!broadcastData.title || !broadcastData.message) {
        toast.error('Title and message are required.');
        return;
      }
      setBroadcastLoading(true);
      try {
        await notificationService.broadcastAnnouncement(broadcastData);
        toast.success('Announcement broadcasted successfully to verified users!');
        setBroadcastData({ title: '', message: '', priority: 'medium', icon: 'bell' });
        fetchNotificationAnalytics();
      } catch (err) {
        toast.error('Failed to dispatch broadcast.');
      } finally {
        setBroadcastLoading(false);
      }
    };

    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Composition Form Panel */}
        <div className="lg:col-span-2">
          <Card className="p-6 border-secondary-200/50 space-y-6">
            <div className="border-b border-secondary-100 dark:border-secondary-900 pb-3 flex justify-between items-center">
              <div>
                <h3 className="text-base font-extrabold text-secondary-900 dark:text-white">Compose Global Alert</h3>
                <p className="text-xs text-secondary-450 mt-0.5">Send a real-time notification to all active verified seekers and owners</p>
              </div>
            </div>

            <form onSubmit={handleSendBroadcast} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-secondary-500 uppercase tracking-wider mb-2">Title</label>
                <input
                  type="text"
                  required
                  value={broadcastData.title}
                  onChange={(e) => setBroadcastData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g. Scheduled System Upgrade"
                  className="w-full text-xs font-semibold px-4 py-2.5 rounded-2xl bg-secondary-50 dark:bg-secondary-950 border border-secondary-200/50 dark:border-secondary-900 text-secondary-900 dark:text-white placeholder-secondary-400 focus:outline-none focus:ring-1 focus:ring-primary-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-secondary-500 uppercase tracking-wider mb-2">Message</label>
                <textarea
                  required
                  value={broadcastData.message}
                  onChange={(e) => setBroadcastData(prev => ({ ...prev, message: e.target.value }))}
                  placeholder="Provide message details..."
                  rows={4}
                  className="w-full text-xs font-semibold px-4 py-2.5 rounded-2xl bg-secondary-50 dark:bg-secondary-950 border border-secondary-200/50 dark:border-secondary-900 text-secondary-900 dark:text-white placeholder-secondary-400 focus:outline-none focus:ring-1 focus:ring-primary-500 transition-all"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-secondary-500 uppercase tracking-wider mb-2">Priority Level</label>
                  <select
                    value={broadcastData.priority}
                    onChange={(e) => setBroadcastData(prev => ({ ...prev, priority: e.target.value }))}
                    className="w-full text-xs font-semibold px-4 py-2.5 rounded-2xl bg-secondary-50 dark:bg-secondary-950 border border-secondary-200/50 dark:border-secondary-900 text-secondary-800 dark:text-secondary-300 focus:outline-none focus:ring-1 focus:ring-primary-500 cursor-pointer"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-secondary-500 uppercase tracking-wider mb-2">Alert Icon</label>
                  <select
                    value={broadcastData.icon}
                    onChange={(e) => setBroadcastData(prev => ({ ...prev, icon: e.target.value }))}
                    className="w-full text-xs font-semibold px-4 py-2.5 rounded-2xl bg-secondary-50 dark:bg-secondary-950 border border-secondary-200/50 dark:border-secondary-900 text-secondary-800 dark:text-secondary-300 focus:outline-none focus:ring-1 focus:ring-primary-500 cursor-pointer"
                  >
                    <option value="bell">Default Bell</option>
                    <option value="shield-alert">Security Shield</option>
                    <option value="calendar">Calendar Booking</option>
                    <option value="star">Rating Feedback</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <Button type="submit" variant="primary" className="px-5 font-bold" isLoading={broadcastLoading}>
                  Send Announcement
                </Button>
              </div>
            </form>
          </Card>
        </div>

        {/* Analytics Statistics Panel */}
        <div>
          <Card className="p-6 border-secondary-200/50 space-y-6 bg-secondary-50/20">
            <div>
              <h3 className="text-base font-extrabold text-secondary-900 dark:text-white">Delivery Statistics</h3>
              <p className="text-xs text-secondary-450 mt-0.5">Real-time alerts metrics summary</p>
            </div>

            {analytics ? (
              <div className="space-y-4">
                <div className="p-4 border border-secondary-100 dark:border-secondary-900 rounded-2xl bg-white dark:bg-secondary-900 space-y-1">
                  <span className="text-[10px] font-bold text-secondary-450 uppercase tracking-wider">Total Alerts Sent</span>
                  <div className="text-2xl font-black text-secondary-900 dark:text-white">{analytics.totalSent}</div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-4 border border-secondary-100 dark:border-secondary-900 rounded-2xl bg-white dark:bg-secondary-900 space-y-1">
                    <span className="text-[10px] font-bold text-secondary-450 uppercase tracking-wider">Read Rate</span>
                    <div className="text-lg font-black text-success-600">{analytics.readRate}%</div>
                  </div>
                  <div className="p-4 border border-secondary-100 dark:border-secondary-900 rounded-2xl bg-white dark:bg-secondary-900 space-y-1">
                    <span className="text-[10px] font-bold text-secondary-450 uppercase tracking-wider">Click Rate</span>
                    <div className="text-lg font-black text-primary-650">{analytics.clickThroughRate}%</div>
                  </div>
                </div>

                <div className="p-4 border border-secondary-100 dark:border-secondary-900 rounded-2xl bg-white dark:bg-secondary-900 space-y-3">
                  <span className="text-[10px] font-bold text-secondary-450 uppercase tracking-wider block">Most Common Types</span>
                  <div className="space-y-2">
                    {analytics.mostCommonTypes?.map((t, idx) => (
                      <div key={idx} className="flex justify-between items-center text-[10px] font-bold">
                        <span className="text-secondary-650 dark:text-secondary-400 capitalize">{t.type.replace('_', ' ')}</span>
                        <span className="bg-secondary-50 dark:bg-secondary-800 text-secondary-800 dark:text-white px-2 py-0.5 rounded">{t.count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-xs text-secondary-400 italic">No delivery statistics recorded yet.</p>
            )}
          </Card>
        </div>
      </div>
    );
  };

  const renderSystemHealth = () => (
    <div className="space-y-4">
      <SectionHeader title="System Health" />
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {systemHealth.map((sys) => (
          <Card key={sys.name} className="p-4 border border-secondary-200/50 dark:border-secondary-900 rounded-[18px] bg-white dark:bg-secondary-900 hover:-translate-y-0.5 hover:shadow-premium-md transition-all duration-200 flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              {sys.icon}
              <span className="text-[13px] font-semibold text-secondary-700 dark:text-secondary-400">{sys.name}</span>
            </div>
            <Badge variant="success" className="text-[9px] font-bold px-2 py-0.5 rounded-lg">
              {sys.status}
            </Badge>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderAuditLogs = () => (
    <div className="space-y-4">
      <SectionHeader title="Audit Activity" badge={adminActivities.length} />
      <ActivityFeed items={adminActivities} />
    </div>
  );

  const renderAnalytics = () => (
    <div className="space-y-4">
      <SectionHeader title="Platform Trends" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <AnalyticsCard title="User Growth" currentVal="+184" change="+22%" points={[25, 40, 60, 90, 110, 150, 184]} />
        <AnalyticsCard title="Property Growth" currentVal="412" change="+9%" points={[310, 330, 340, 360, 380, 395, 412]} />
        <AnalyticsCard title="Reports" currentVal="12" change="-15%" points={[20, 18, 16, 14, 13, 12, 12]} />
        <AnalyticsCard title="Verification Rate" currentVal="96%" change="+3%" points={[88, 90, 91, 93, 94, 95, 96]} />
      </div>
    </div>
  );

  const renderSection = () => {
    if (currentSection === 'users') return renderUsers();
    if (currentSection === 'verifications') return renderVerification();
    if (currentSection === 'moderation') return renderReports('Property Moderation Queue');
    if (currentSection === 'reports') return renderReports();
    if (currentSection === 'reviews') return renderReviewModeration();
    if (currentSection === 'broadcast') return renderBroadcast();
    if (currentSection === 'audit-logs') return renderAuditLogs();
    if (currentSection === 'system-health') return renderSystemHealth();

    // Default dashboard view – only platform trends, full width
    return renderAnalytics();
  };

  const isAdmin = user?.role === 'admin';
  const roleBadge = isAdmin ? 'Admin Console' : 'Moderator Console';

  const quickActions = isAdmin ? [
    { label: 'User Management',     icon: Users,        onClick: () => navigate('/admin/users') },
    { label: 'Property Moderation',  icon: UserCheck,    onClick: () => navigate('/admin/verifications') },
    { label: 'Reports & Flags',      icon: Flag,         onClick: () => navigate('/admin/reports') },
    { label: 'Analytics Insights',  icon: BarChart3,    onClick: () => navigate('/admin') },
  ] : [
    { label: 'Review Moderation',   icon: Star,         onClick: () => navigate('/admin/reviews') },
    { label: 'Reports Queue',       icon: Flag,         onClick: () => navigate('/admin/reports') },
    { label: 'Property Moderation',  icon: ShieldAlert,  onClick: () => navigate('/admin/verifications') },
  ];

  const welcomeTitle = currentSection === 'dashboard' || !currentSection
    ? `Welcome back, ${user?.name || (isAdmin ? 'Admin' : 'Moderator')}`
    : sectionMeta.title;

  const welcomeSubtitle = currentSection === 'dashboard' || !currentSection
    ? (isAdmin
        ? 'Manage platform users, property verifications, broadcasts, and system health.'
        : 'Moderation workspace: review flagged listings, roommate profiles, and chat logs.')
    : sectionMeta.subtitle;

  return (
    <div className="space-y-8">
      <DashboardHeader
        title={welcomeTitle}
        subtitle={welcomeSubtitle}
        roleBadge={roleBadge}
        breadcrumbs={['Console', sectionMeta.breadcrumb]}
      />

      <DashboardStats>
        <MetricCard title="Users" value={String(platformStats.totalUsers)} change="+84" trend="increase" desc="This month" icon={<Users className="h-5 w-5 text-primary-600" />} />
        <MetricCard title="Properties" value={String(platformStats.totalProperties)} change="Active Listings" trend="neutral" desc="Total properties" icon={<Home className="h-5 w-5 text-primary-600" />} />
        <MetricCard title="Pending KYC" value={String(pendingKYC.length)} change="Needs review" trend="neutral" desc="KYC queue backlog" icon={<UserCheck className="h-5 w-5 text-warning-600" />} />
        <MetricCard title="Open Reports" value={String(reportedListings.length)} change="Flagged items" trend="neutral" desc="Moderation flags" icon={<ShieldAlert className="h-5 w-5 text-error-500" />} />
      </DashboardStats>

      {(currentSection === 'dashboard' || !currentSection) && (
        <div className="space-y-4 mb-8">
          <SectionHeader 
            title="Quick Shortcuts" 
            description="Expose shortcuts to the most frequently used console features"
          />
          <QuickActions actions={quickActions} />
        </div>
      )}

      {renderSection()}
    </div>
  );
};

export default AdminDashboard;
