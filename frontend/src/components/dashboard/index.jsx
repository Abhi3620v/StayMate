import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { 
  ArrowUpRight, ArrowDownRight, Search, 
  ChevronLeft, ChevronRight, AlertCircle, Sparkles, CheckCircle2,
  ArrowLeft
} from 'lucide-react';
import { cn } from '@/utils/cn';

/**
 * Page Header Component
 * Page Title: 32px (text-[32px])
 */
export const DashboardHeader = ({ title, subtitle, breadcrumbs = [], actions, roleBadge }) => {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-secondary-200/50 dark:border-secondary-900 pb-5 mb-8">
      <div className="space-y-1">
        <div className="flex items-center space-x-2.5">
          {breadcrumbs.length > 0 && (
            <div className="flex items-center space-x-2 text-[10px] font-bold text-secondary-400 uppercase tracking-widest">
              {breadcrumbs.map((b, i) => (
                <React.Fragment key={i}>
                  <span>{b}</span>
                  {i < breadcrumbs.length - 1 && <span className="text-secondary-300">/</span>}
                </React.Fragment>
              ))}
            </div>
          )}
          {roleBadge && (
            <span className="text-[9px] font-bold text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-950/40 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              {roleBadge}
            </span>
          )}
        </div>
        <h1 className="text-[32px] font-black text-secondary-900 dark:text-white leading-none tracking-tight mt-1 flex items-center gap-2">
          {title}
        </h1>
        <p className="text-[13px] text-secondary-500 font-semibold mt-1">
          {subtitle}
        </p>
      </div>
      {actions && <div className="flex items-center space-x-3 shrink-0">{actions}</div>}
    </div>
  );
};

/**
 * Metric Stats Wrapper Grid (24px gap = gap-6)
 */
export const DashboardStats = ({ children }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
    {children}
  </div>
);

/**
 * KPI Metric Card Component
 * Height: 130px (h-[130px])
 * Card Padding: 24px (p-6)
 * Card Border Radius: 18px (rounded-[18px])
 * Hover: Slight translation (-2px) & shadow increase
 */
export const MetricCard = ({ title, value, change, icon, trend = 'neutral', desc, onClick }) => {
  const isClickable = !!onClick;
  return (
    <Card 
      onClick={onClick}
      className={cn(
        "h-[128px] p-5 border border-secondary-200/50 dark:border-secondary-900 rounded-[18px] flex items-start justify-between relative overflow-hidden group select-none bg-white dark:bg-secondary-900/60 backdrop-blur-sm shadow-premium-sm transition-all duration-300",
        isClickable && "hover:-translate-y-1 hover:shadow-premium-md hover:border-primary-400 dark:hover:border-primary-500 cursor-pointer"
      )}
    >
      <div className="flex flex-col justify-between h-full">
        <span className="text-[11px] font-bold text-secondary-400 dark:text-secondary-500 uppercase tracking-widest block">{title}</span>
        <h3 className="text-3xl font-black text-secondary-950 dark:text-white leading-none tracking-tight">
          {value}
        </h3>
        <div className="flex items-center space-x-1.5 text-[11px] font-semibold">
          {change && (
            <span className={cn(
              "font-extrabold px-1.5 py-0.5 rounded text-[10px]",
              trend === 'increase' && "text-success-700 bg-success-50 dark:bg-success-950/30",
              trend === 'decrease' && "text-error-750 bg-error-50 dark:bg-error-950/30",
              trend === 'neutral' && "text-secondary-500 bg-secondary-50 dark:bg-secondary-950"
            )}>
              {change}
            </span>
          )}
          {desc && <span className="text-secondary-400 dark:text-secondary-500">{desc}</span>}
        </div>
      </div>
      <div className="p-2.5 bg-secondary-50 dark:bg-secondary-950 text-secondary-500 dark:text-secondary-400 rounded-[12px] group-hover:scale-105 transition-transform duration-300 shrink-0 ml-4">
        {icon}
      </div>
    </Card>
  );
};

/**
 * Quick Action compact buttons row
 */
export const QuickActions = ({ actions = [] }) => (
  <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
    {actions.map((act, i) => {
      const Icon = act.icon;
      return (
        <button
          key={i}
          onClick={act.onClick}
          className="p-5 bg-white dark:bg-secondary-900 border border-secondary-200/50 dark:border-secondary-900/60 rounded-[18px] flex flex-col items-center justify-center text-center space-y-2.5 hover:border-primary-500 dark:hover:border-primary-500 hover:shadow-premium-md group transition-all duration-200"
        >
          <div className="p-3 bg-secondary-50 dark:bg-secondary-950 rounded-[12px] text-primary-600 group-hover:scale-105 transition-transform duration-200">
            <Icon className="h-5 w-5 stroke-[1.8]" />
          </div>
          <span className="text-[14px] font-black text-secondary-700 dark:text-secondary-300 group-hover:text-primary-600 transition-colors">
            {act.label}
          </span>
        </button>
      );
    })}
  </div>
);

/**
 * Section Header
 * Section Title: 22px (text-[22px])
 */
export const SectionHeader = ({ title, badge, actions, description }) => (
  <div className="border-b border-secondary-100 dark:border-secondary-900/60 pb-3 mb-6">
    <div className="flex justify-between items-center">
      <div className="flex items-center space-x-2">
        <h3 className="font-extrabold text-[20px] text-secondary-850 dark:text-secondary-200 tracking-tight leading-none">{title}</h3>
        {badge !== undefined && (
          <Badge variant="primary" className="text-[10px] font-black px-1.5 py-0.5 rounded-md">
            {badge}
          </Badge>
        )}
      </div>
      {actions && <div className="flex items-center space-x-2">{actions}</div>}
    </div>
    {description && <p className="text-[11px] text-secondary-450 dark:text-secondary-400 mt-1.5 font-bold leading-normal">{description}</p>}
  </div>
);

export const UnifiedSearch = ({ placeholder = "Search...", value, onChange, onSubmit, disabled = false, className }) => {
  const [isFocused, setIsFocused] = useState(false);

  const handleSubmit = (e) => {
    if (onSubmit) {
      e.preventDefault();
      onSubmit(e);
    }
  };

  return (
    <form 
      onSubmit={handleSubmit} 
      className={cn(
        "relative w-full max-w-[450px] group transition-all duration-300",
        disabled && "opacity-50 pointer-events-none",
        className
      )}
    >
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        disabled={disabled}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        className="w-full text-xs font-bold pl-5 pr-11 py-2 bg-secondary-50/50 hover:bg-secondary-100 dark:bg-secondary-950 dark:hover:bg-secondary-900 border border-secondary-200/60 dark:border-secondary-900 rounded-full focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 text-secondary-800 dark:text-secondary-100 placeholder-secondary-450 transition-all duration-200 h-[36px]"
      />
      <button
        type="submit"
        disabled={disabled}
        className="absolute right-1 top-[4px] h-[28px] w-[28px] rounded-full bg-primary-500 hover:bg-primary-600 flex items-center justify-center text-secondary-900 hover:scale-105 active:scale-95 transition-all shadow-premium-sm"
        title="Search"
      >
        <Search className="h-3.5 w-3.5 text-secondary-900 stroke-[3]" />
      </button>
    </form>
  );
};

/**
 * Reusable DataTable with search and pagination support
 */
export const DataTable = ({ headers = [], data = [], renderRow, onSearch, emptyState }) => {
  return (
    <Card className="border border-secondary-200/50 dark:border-secondary-900 overflow-hidden shadow-premium-sm bg-white dark:bg-secondary-900 rounded-[18px]">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-secondary-50/40 dark:bg-secondary-950/20 border-b border-secondary-200/60 dark:border-secondary-900/60">
              {headers.map((h, i) => (
                <th key={i} className="px-5 py-3 text-[10px] font-bold text-secondary-400 uppercase tracking-widest whitespace-nowrap">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-secondary-100 dark:divide-secondary-900/60">
            {data.map((item, idx) => renderRow(item, idx))}
          </tbody>
        </table>
      </div>
    </Card>
  );
};

/**
 * Compact Empty State (Reduced vertical height)
 */
export const EmptyState = ({ icon, title = 'No results found', description, action }) => (
  <Card className="py-6 px-4 text-center space-y-3.5 max-w-sm mx-auto border-dashed border-secondary-200/50 bg-transparent shadow-none">
    <div className="p-3 bg-secondary-50 dark:bg-secondary-950 rounded-full w-fit mx-auto text-secondary-400">
      {icon || <AlertCircle className="h-5 w-5" />}
    </div>
    <div className="space-y-1">
      <h4 className="font-extrabold text-xs text-secondary-900 dark:text-white uppercase tracking-wider">{title}</h4>
      <p className="text-[10px] text-secondary-450 dark:text-secondary-400 max-w-[240px] mx-auto leading-relaxed">
        {description}
      </p>
    </div>
    {action && <div className="pt-1">{action}</div>}
  </Card>
);

/**
 * Styled StatusBadge Component
 */
export const StatusBadge = ({ status }) => {
  const map = {
    active: { variant: 'success', label: 'Active' },
    published: { variant: 'success', label: 'Published' },
    accepted: { variant: 'success', label: 'Accepted' },
    approved: { variant: 'success', label: 'Approved' },
    pending: { variant: 'warning', label: 'Pending' },
    draft: { variant: 'secondary', label: 'Draft' },
    archived: { variant: 'danger', label: 'Archived' },
    rejected: { variant: 'danger', label: 'Rejected' },
  };

  const current = map[status] || { variant: 'secondary', label: status };
  return (
    <Badge variant={current.variant} className="text-[8px] font-black tracking-widest px-2 py-0.5 rounded uppercase">
      {current.label}
    </Badge>
  );
};

/**
 * Timeline log activity feed list
 */
export const ActivityFeed = ({ items = [] }) => {
  if (items.length === 0) {
    return <p className="text-[10px] text-secondary-400 italic">No activity logs recorded.</p>;
  }

  return (
    <Card className="p-5 border border-secondary-200/50 dark:border-secondary-900 space-y-4 max-h-[300px] overflow-y-auto bg-white dark:bg-secondary-900 rounded-[18px]">
      <div className="flow-root">
        <ul className="-mb-8">
          {items.map((item, idx) => (
            <li key={idx}>
              <div className="relative pb-6">
                {idx !== items.length - 1 && (
                  <span className="absolute top-3.5 left-3.5 -ml-px h-full w-0.5 bg-secondary-100 dark:bg-secondary-900" aria-hidden="true" />
                )}
                <div className="relative flex space-x-3 items-start">
                  <div className="h-7 w-7 rounded-full bg-secondary-50 dark:bg-secondary-950 flex items-center justify-center text-primary-500 border border-secondary-200/20 shrink-0 animate-fade-in">
                    {item.icon || <AlertCircle className="h-3.5 w-3.5" />}
                  </div>
                  <div className="flex-1 min-w-0 pt-1 flex justify-between space-x-4">
                    <p className="text-[11px] text-secondary-650 dark:text-secondary-400 font-bold">
                      {item.description}
                    </p>
                    <span className="text-[9px] text-secondary-400 whitespace-nowrap font-bold">
                      {item.time}
                    </span>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </Card>
  );
};

/**
 * Compact Notifications widget panel
 */
export const NotificationPanel = ({ items = [], onDismiss }) => {
  if (items.length === 0) return null;

  return (
    <Card className="p-4 border-warning-100/40 bg-warning-50/5 dark:bg-warning-950/5 space-y-2.5 rounded-[12px] mb-6 shadow-premium-sm">
      <div className="flex justify-between items-center text-[10px] font-black text-warning-650 uppercase tracking-widest border-b pb-1.5 border-warning-100/20">
        <span className="flex items-center"><AlertCircle className="h-3.5 w-3.5 mr-1" /> Active Alerts ({items.length})</span>
      </div>
      <div className="space-y-2">
        {items.map((item, idx) => (
          <div key={idx} className="flex justify-between items-center text-[10px] text-secondary-655 dark:text-secondary-450 font-bold border-b border-secondary-100/10 pb-1.5 last:border-0 last:pb-0">
            <span>{item.message}</span>
            <button className="text-secondary-400 hover:text-secondary-600 font-black uppercase text-[8px] tracking-wider" onClick={() => onDismiss?.(idx)}>
              Dismiss
            </button>
          </div>
        ))}
      </div>
    </Card>
  );
};

/**
 * Analytics Trend Spark line card
 */
export const AnalyticsCard = ({ title, currentVal, change, points = [30, 45, 35, 60, 50, 75, 70], description, timePeriod = 'Last 7 Days' }) => {
  const width = 360;
  const height = 75;
  const maxVal = Math.max(...points);
  const minVal = Math.min(...points);
  const spread = maxVal - minVal || 1;

  const svgPoints = points.map((p, idx) => {
    const x = (idx / (points.length - 1)) * width;
    const y = height - ((p - minVal) / spread) * (height - 15) - 8;
    return `${x},${y}`;
  }).join(' ');

  return (
    <Card className="p-5 border border-secondary-200/50 dark:border-secondary-900 rounded-[18px] bg-white dark:bg-secondary-900 shadow-premium-sm hover:shadow-premium-md transition-all duration-300">
      <div className="flex justify-between items-start">
        <div className="space-y-1">
          <span className="text-[11px] font-bold text-secondary-400 dark:text-secondary-500 uppercase tracking-widest block">{title}</span>
          <h4 className="text-2xl font-black text-secondary-900 dark:text-white leading-tight">{currentVal}</h4>
          {description && <p className="text-[10px] text-secondary-450 dark:text-secondary-500 font-semibold">{description}</p>}
        </div>
        <div className="flex flex-col items-end space-y-1">
          {change && (
            <span className="text-success-700 dark:text-success-400 text-[9px] font-extrabold bg-success-50 dark:bg-success-950/30 px-2 py-0.5 rounded border border-success-100/10">
              {change}
            </span>
          )}
          <span className="text-[9px] font-bold text-secondary-400 dark:text-secondary-550">{timePeriod}</span>
        </div>
      </div>

      <div className="h-16 w-full relative pt-2">
        <svg className="w-full h-full overflow-visible" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
          <defs>
            <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="rgb(59, 130, 246)" stopOpacity="0.15" />
              <stop offset="100%" stopColor="rgb(59, 130, 246)" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d={`M 0,${height} L ${svgPoints} L ${width},${height} Z`} fill="url(#chartGrad)" />
          <polyline fill="none" stroke="rgb(59, 130, 246)" strokeWidth="2.2" points={svgPoints} />
        </svg>
      </div>
    </Card>
  );
};
export default MetricCard;
