import React, { useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import Sidebar from '@/components/shared/Sidebar';
import ThemeToggle from '@/components/shared/ThemeToggle';
import Avatar from '@/components/ui/Avatar';
import Drawer from '@/components/ui/Drawer';
import { UnifiedSearch } from '@/components/dashboard/index';
import { Menu, Globe, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';

// Notifications Module Imports
import { NotificationProvider, useNotification } from '@/modules/notification/context/NotificationContext';
import NotificationBadge from '@/modules/notification/components/NotificationBadge';
import NotificationDropdown from '@/modules/notification/components/NotificationDropdown';

const DashboardLayoutContent = () => {
  const { user, logout } = useAuth();
  const { unreadCount } = useNotification();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);

  if (!user) {
    navigate('/login');
    return null;
  }

  // Role-specific search placeholder
  const getSearchPlaceholder = () => {
    if (user.role === 'admin') return 'Search users, listings, reports...';
    if (user.role === 'owner') return 'Search my properties...';
    return 'Search stays...';
  };

  const handleGlobalSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}&category=all`);
      setSearchQuery('');
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-secondary-50/60 dark:bg-secondary-950 text-secondary-900 dark:text-secondary-100 transition-colors">
      {/* Desktop Sidebar */}
      <Sidebar className="hidden lg:flex" />

      {/* Mobile Drawer */}
      <Drawer
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        title={`${user.role} workspace`}
        placement="left"
        size="xs"
      >
        <Sidebar className="w-full border-none h-auto bg-transparent py-0" onItemClick={() => setSidebarOpen(false)} />
      </Drawer>

      {/* Main frame */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        {/* ── Top Navigation Bar: 72px, sticky, backdrop blur ── */}
        <header className="h-[72px] bg-white/95 dark:bg-secondary-900/95 backdrop-blur-sm border-b border-secondary-200/60 dark:border-secondary-900/60 flex items-center justify-between px-6 lg:px-8 shrink-0 sticky top-0 z-20">
          {/* Left: hamburger + logo/workspace title + View Website */}
          <div className="flex items-center space-x-[12px] shrink-0">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-xl text-secondary-500 hover:bg-secondary-50 dark:hover:bg-secondary-800 transition-colors"
              aria-label="Open sidebar"
            >
              <Menu className="h-5 w-5" />
            </button>

            {/* StayMate mobile logo */}
            <Link to="/" className="lg:hidden flex items-center space-x-[8px] shrink-0">
              <span className="h-[36px] w-[36px] rounded-[12px] bg-primary-500 flex items-center justify-center text-secondary-900 font-extrabold text-[15px] shadow-sm">
                S
              </span>
              <span className="text-base font-extrabold tracking-tight text-secondary-900 dark:text-white hidden xs:inline">
                StayMate
              </span>
            </Link>

            {/* View Website action (Owners, Admins, Moderators only) */}
            {user && (user.role === 'owner' || user.role === 'admin' || user.role === 'moderator') && (
              <Link
                to="/"
                className="inline-flex items-center px-3 py-1.5 text-xs font-bold text-secondary-500 hover:text-primary-600 dark:hover:text-primary-400 bg-secondary-100/50 hover:bg-secondary-100 dark:bg-secondary-800/40 dark:hover:bg-secondary-800/70 rounded-lg transition-all duration-200 border border-secondary-200/20 dark:border-secondary-800/30"
                title="View Website"
              >
                <Globe className="h-3.5 w-3.5 mr-1.5 shrink-0" />
                <span className="hidden sm:inline">View Website</span>
              </Link>
            )}
          </div>

          {/* Center: Unified Search Component - Center Aligned */}
          <div className="hidden lg:flex justify-center items-center flex-grow mx-4">
            <UnifiedSearch
              placeholder={getSearchPlaceholder()}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onSubmit={handleGlobalSearch}
            />
          </div>

          {/* Right: actions */}
          <div className="flex items-center space-x-4 shrink-0">
            {user.role === 'tenant' && (
              <Link
                to="/"
                className="text-[13px] font-semibold text-secondary-600 hover:text-primary-600 transition-colors flex items-center"
              >
                <Globe className="h-4 w-4 mr-1.5 shrink-0" />
                <span className="hidden sm:inline">Main Website</span>
              </Link>
            )}

            <ThemeToggle />

            {/* Notification bell and dropdown popup */}
            <div className="relative">
              <NotificationBadge
                count={unreadCount}
                onClick={() => setShowNotifications(!showNotifications)}
              />

              {showNotifications && (
                <NotificationDropdown onClose={() => setShowNotifications(false)} />
              )}
            </div>

            {/* Profile */}
            <div className="flex items-center space-x-3 border-l pl-4 border-secondary-200/60 dark:border-secondary-900/60">
              <Avatar src={user.avatar} name={user.name} size="sm" />
              <div className="hidden lg:block text-left select-none">
                <p className="text-[13px] font-bold text-secondary-900 dark:text-white leading-tight">
                  {user.name}
                </p>
                <p className="text-[10px] text-secondary-450 dark:text-secondary-500 font-semibold capitalize mt-0.5">
                  {user.role}
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* ── Scrollable main content ── */}
        <main className="flex-1 overflow-y-auto transition-colors">
          <div className="max-w-[1600px] mx-auto px-4 sm:px-8 py-4 sm:py-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};
const DashboardLayout = () => (
  <DashboardLayoutContent />
);

export default DashboardLayout;

