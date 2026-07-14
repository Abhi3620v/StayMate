import React, { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/utils/cn';
import {
  LayoutDashboard, Home, Calendar, Heart, Settings, LogOut, HelpCircle,
  ChevronLeft, ChevronRight, ShieldCheck, ShieldAlert, Users,
  MessageSquare, FileText, Database, Compass, BarChart3, Image, Star,
  Flag, Cog, ScrollText, Activity, Mail, CreditCard
} from 'lucide-react';
import Tooltip from '../ui/Tooltip';

/**
 * Plus icon inline SVG (avoids importing lucide Plus which may conflict)
 */
const PlusIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={props.className}>
    <path d="M5 12h14" /><path d="M12 5v14" />
  </svg>
);

const Sidebar = ({ className, onItemClick }) => {
  const { user, logout } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(
    localStorage.getItem('sidebar_collapsed') === 'true'
  );

  const toggleCollapse = () => {
    const next = !isCollapsed;
    setIsCollapsed(next);
    localStorage.setItem('sidebar_collapsed', next.toString());
    window.dispatchEvent(new Event('resize'));
  };

  if (!user) return null;

  /* ─────────────────────────────────────────────
   * Role-specific navigation configurations
   * ───────────────────────────────────────────── */

  const tenantMain = [
    { label: 'Dashboard',         path: '/tenant/dashboard',   icon: LayoutDashboard },
    { label: 'Browse Properties', path: '/properties',         icon: Compass },
    { label: 'Wishlist',          path: '/tenant/wishlist',    icon: Heart },
    { label: 'Visit Requests',    path: '/tenant/visits',      icon: Calendar },
    { label: 'Payments',          path: '/payments/history',   icon: CreditCard },
    { label: 'Chats',             path: '/tenant/chat',        icon: MessageSquare },
    { label: 'Roommate',          path: '/roommates',          icon: Users },
  ];

  const ownerMain = [
    { label: 'Dashboard',         path: '/owner/dashboard',    icon: LayoutDashboard },
    { label: 'List Property',      path: '/owner/properties/create', icon: PlusIcon },
    { label: 'Properties',        path: '/owner/properties',   icon: Home },
    { label: 'Bookings',          path: '/owner/visits',       icon: Calendar },
    { label: 'Payments',          path: '/payments/history',   icon: CreditCard },
    { label: 'Analytics',         path: '/owner/analytics',    icon: BarChart3 },
    { label: 'Reviews',           path: '/owner/reviews',      icon: Star },
    { label: 'Messages',          path: '/owner/chat',         icon: MessageSquare },
  ];

  const adminMain = [
    { label: 'Dashboard',         path: '/admin/dashboard',    icon: LayoutDashboard },
    { label: 'Users',             path: '/admin/users',        icon: Users },
    { label: 'Properties',        path: '/admin/properties',   icon: Home },
    { label: 'Moderation',        path: '/admin/verifications',icon: ShieldCheck },
    { label: 'Reports',           path: '/admin/reports',      icon: Flag },
    { label: 'Payments',          path: '/payments/history',   icon: CreditCard },
    { label: 'Analytics',         path: '/admin/analytics',    icon: BarChart3 },
    { label: 'Audit Logs',        path: '/admin/audit-logs',   icon: ScrollText },
    { label: 'Platform Health',   path: '/admin/system-health',icon: Database },
  ];

  const moderatorMain = [
    { label: 'Dashboard',         path: '/admin/dashboard',    icon: LayoutDashboard },
    { label: 'Moderation Queue',  path: '/admin/verifications',icon: ShieldAlert },
    { label: 'Reports',           path: '/admin/reports',      icon: Flag },
    { label: 'Reviews',           path: '/admin/reviews',      icon: Star },
    { label: 'Property Review',   path: '/admin/properties',   icon: ShieldCheck },
  ];

  const getMainLinks = () => {
    if (user.role === 'admin') return adminMain;
    if (user.role === 'moderator') return moderatorMain;
    if (user.role === 'owner') return ownerMain;
    return tenantMain;
  };

  const accountLinks = [
    { label: 'Settings',          path: '/profile',            icon: Settings },
    { label: 'Help Center',       path: '/profile',            icon: HelpCircle },
  ];

  /* ─────────────────────────────────────────────
   * Render a single nav link with SaaS styling
   * Active  → blue bg, white text
   * Inactive → white bg, dark text, light-blue hover
   * ───────────────────────────────────────────── */
  const renderLink = (link) => {
    const Icon = link.icon;
    const content = (
      <NavLink
        to={link.path}
        end
        onClick={onItemClick}
        className={({ isActive }) =>
          cn(
            'flex items-center px-3 py-2.5 rounded-xl text-[13px] font-semibold transition-all duration-200 relative group select-none',
            isActive
              ? 'bg-primary-500 text-secondary-900 shadow-md font-bold'
              : 'text-secondary-700 dark:text-secondary-400 bg-white dark:bg-transparent hover:bg-primary-50 dark:hover:bg-secondary-900/60 hover:text-primary-700 dark:hover:text-primary-400'
          )
        }
      >
        <Icon className={cn('h-[18px] w-[18px] shrink-0 stroke-[1.8] transition-transform duration-200 group-hover:scale-110', isCollapsed && 'mx-auto')} />
        {!isCollapsed && <span className="ml-3 truncate">{link.label}</span>}
      </NavLink>
    );

    if (isCollapsed) {
      return (
        <Tooltip key={link.label} content={link.label} position="right">
          {content}
        </Tooltip>
      );
    }
    return <div key={link.label}>{content}</div>;
  };

  return (
    <aside
      className={cn(
        'bg-white dark:bg-secondary-950 border-r border-secondary-200/60 dark:border-secondary-900 flex flex-col h-full transition-all duration-300 select-none shrink-0',
        isCollapsed ? 'w-16' : 'w-[280px]',
        className
      )}
    >
      {/* ── Brand ── */}
      <div className="h-[72px] flex items-center px-5 border-b border-secondary-100 dark:border-secondary-900 shrink-0">
        <Link to="/" onClick={onItemClick} className="flex items-center space-x-3">
          <div className="h-9 w-9 rounded-xl bg-primary-500 flex items-center justify-center text-secondary-900 font-black text-lg shadow-md shrink-0">
            S
          </div>
          {!isCollapsed && (
            <span className="font-extrabold text-[15px] tracking-tight text-secondary-900 dark:text-white">
              Stay<span className="text-primary-700">Mate</span>
            </span>
          )}
        </Link>
      </div>

      {/* ── Navigation ── */}
      <nav className="flex-1 px-3 py-5 space-y-6 overflow-y-auto scrollbar-none">
        {/* MAIN group */}
        <div className="space-y-1">
          {!isCollapsed && (
            <span className="text-[10px] font-bold text-secondary-400 uppercase tracking-widest px-3 pb-1 block">
              Main
            </span>
          )}
          {getMainLinks().map(renderLink)}
        </div>

        {/* ACCOUNT group */}
        <div className="space-y-1">
          {!isCollapsed && (
            <span className="text-[10px] font-bold text-secondary-400 uppercase tracking-widest px-3 pb-1 block">
              Account
            </span>
          )}
          {accountLinks.map(renderLink)}

          {/* Logout */}
          {isCollapsed ? (
            <Tooltip content="Logout" position="right">
              <button
                onClick={() => { logout(); if (onItemClick) onItemClick(); }}
                className="w-full flex items-center justify-center px-3 py-2.5 rounded-xl text-[13px] font-semibold text-error-600 hover:bg-error-50 dark:hover:bg-error-950/20 transition-all duration-200"
              >
                <LogOut className="h-[18px] w-[18px] stroke-[1.8]" />
              </button>
            </Tooltip>
          ) : (
            <button
              onClick={() => { logout(); if (onItemClick) onItemClick(); }}
              className="w-full flex items-center px-3 py-2.5 rounded-xl text-[13px] font-semibold text-error-600 hover:bg-error-50 dark:hover:bg-error-950/20 transition-all duration-200"
            >
              <LogOut className="h-[18px] w-[18px] stroke-[1.8]" />
              <span className="ml-3">Logout</span>
            </button>
          )}
        </div>
      </nav>

      <div className="p-3 border-t border-secondary-100 dark:border-secondary-900 flex justify-center shrink-0">
        <button
          onClick={toggleCollapse}
          className="w-9 h-9 shrink-0 rounded-xl bg-secondary-50 hover:bg-primary-500 hover:text-secondary-900 dark:bg-secondary-900 border border-secondary-200/60 dark:border-secondary-800 text-secondary-500 dark:text-secondary-400 dark:hover:bg-primary-500 dark:hover:text-secondary-900 hover:scale-105 active:scale-95 transition-all duration-200 shadow-premium-sm flex items-center justify-center p-0"
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? <ChevronRight className="h-4.5 w-4.5 stroke-[2.5]" /> : <ChevronLeft className="h-4.5 w-4.5 stroke-[2.5]" />}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
