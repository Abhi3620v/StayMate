import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Bell, KeyRound, CheckCircle, ShieldAlert, UserPlus, UserCheck, UserX, 
  Home, AlertTriangle, Calendar, CalendarCheck, CalendarX, Clock, Star, 
  MessageSquare, ThumbsUp, ArrowRight, History
} from 'lucide-react';

const iconMap = {
  key: KeyRound,
  'check-circle': CheckCircle,
  'shield-alert': ShieldAlert,
  'user-plus': UserPlus,
  'user-check': UserCheck,
  'user-x': UserX,
  home: Home,
  'triangle-alert': AlertTriangle,
  calendar: Calendar,
  'calendar-check': CalendarCheck,
  'calendar-x': CalendarX,
  clock: Clock,
  star: Star,
  'message-square': MessageSquare,
  'thumbs-up': ThumbsUp,
  bell: Bell,
};

const getGroupLabel = (dateStr) => {
  const date = new Date(dateStr);
  const today = new Date();
  
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  
  const startOfWeek = new Date();
  startOfWeek.setDate(today.getDate() - 7);

  if (date.toDateString() === today.toDateString()) {
    return 'Today';
  } else if (date.toDateString() === yesterday.toDateString()) {
    return 'Yesterday';
  } else if (date >= startOfWeek) {
    return 'This Week';
  } else {
    return 'Older';
  }
};

export const ActivityTimeline = ({ items = [] }) => {
  const navigate = useNavigate();

  if (!items || items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 text-center space-y-3 bg-white dark:bg-secondary-900 border border-secondary-100 dark:border-secondary-900 rounded-3xl">
        <div className="h-14 w-14 rounded-2xl bg-secondary-50 dark:bg-secondary-800 flex items-center justify-center text-secondary-400">
          <History className="h-6 w-6" />
        </div>
        <div className="space-y-1">
          <h5 className="text-xs font-bold text-secondary-900 dark:text-white">No activity logged</h5>
          <p className="text-[10px] text-secondary-450 dark:text-secondary-500 max-w-xs">
            Events will automatically populate here as actions occur across the platform.
          </p>
        </div>
      </div>
    );
  }

  // Group items
  const groups = {};
  items.forEach(item => {
    const label = getGroupLabel(item.createdAt);
    if (!groups[label]) {
      groups[label] = [];
    }
    groups[label].push(item);
  });

  const orderedLabels = ['Today', 'Yesterday', 'This Week', 'Older'].filter(l => groups[l] && groups[l].length > 0);

  const getCategoryBorder = (category) => {
    switch (category) {
      case 'auth': return 'border-amber-400 dark:border-amber-500';
      case 'property': return 'border-emerald-400 dark:border-emerald-500';
      case 'roommate': return 'border-violet-400 dark:border-violet-500';
      case 'visit': return 'border-blue-400 dark:border-blue-500';
      case 'chat': return 'border-sky-400 dark:border-sky-500';
      case 'review': return 'border-indigo-400 dark:border-indigo-500';
      case 'admin': return 'border-rose-400 dark:border-rose-500';
      default: return 'border-secondary-400 dark:border-secondary-600';
    }
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'auth': return 'text-amber-500 bg-amber-50 dark:bg-amber-950/20';
      case 'property': return 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/20';
      case 'roommate': return 'text-violet-500 bg-violet-50 dark:bg-violet-950/20';
      case 'visit': return 'text-blue-500 bg-blue-50 dark:bg-blue-950/20';
      case 'chat': return 'text-sky-500 bg-sky-50 dark:bg-sky-950/20';
      case 'review': return 'text-indigo-500 bg-indigo-50 dark:bg-indigo-950/20';
      case 'admin': return 'text-rose-500 bg-rose-50 dark:bg-rose-950/20';
      default: return 'text-secondary-500 bg-secondary-50 dark:bg-secondary-900';
    }
  };

  const handleActionClick = (url) => {
    if (url) navigate(url);
  };

  return (
    <div className="relative pl-6 sm:pl-8 border-l border-secondary-200 dark:border-secondary-800 space-y-8 max-w-3xl mx-auto py-2">
      {orderedLabels.map(label => (
        <div key={label} className="space-y-6">
          {/* Group Header Label */}
          <div className="relative -ml-[31px] sm:-ml-[39px] flex items-center gap-3">
            <div className="h-[11px] w-[11px] rounded-full bg-secondary-300 dark:bg-secondary-700 ring-4 ring-secondary-50 dark:ring-secondary-950" />
            <span className="text-[10px] font-bold text-secondary-450 uppercase tracking-widest bg-secondary-50/60 dark:bg-secondary-950 px-2 rounded">
              {label}
            </span>
          </div>

          {/* Activities list in group */}
          <div className="space-y-6">
            {groups[label].map(act => {
              const IconComponent = iconMap[act.icon] || Bell;
              const formattedTime = new Date(act.createdAt).toLocaleTimeString('en-IN', {
                hour: 'numeric',
                minute: '2-digit',
                hour12: true
              });

              return (
                <div key={act._id} className="relative flex flex-col sm:flex-row gap-4 items-start group">
                  {/* Timeline icon node */}
                  <div className={`absolute -left-[45px] sm:-left-[53px] h-9 w-9 rounded-full flex items-center justify-center bg-white dark:bg-secondary-950 border-2 ${getCategoryBorder(act.category)} ring-4 ring-secondary-50 dark:ring-secondary-950 group-hover:scale-110 transition-transform duration-300 z-10`}>
                    <IconComponent className={`h-4 w-4 ${getCategoryColor(act.category).split(' ')[0]}`} />
                  </div>

                  {/* Activity Detail Card */}
                  <div className="w-full bg-white dark:bg-secondary-900 border border-secondary-100 dark:border-secondary-900/60 rounded-2xl p-4 shadow-premium-sm hover:shadow-premium group-hover:-translate-y-0.5 transition-all duration-300 space-y-2">
                    <div className="flex justify-between items-start gap-4">
                      <span className="text-[9px] font-bold text-secondary-400 flex items-center gap-1 uppercase tracking-wide">
                        {act.category} • {formattedTime}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <h6 className="text-[11px] font-bold text-secondary-900 dark:text-white leading-tight">
                        {act.title}
                      </h6>
                      <p className="text-[10px] font-medium text-secondary-600 dark:text-secondary-450 leading-relaxed">
                        {act.message}
                      </p>
                    </div>

                    {act.description && (
                      <p className="text-[9px] text-secondary-450 dark:text-secondary-500 leading-normal border-l-2 border-secondary-200 dark:border-secondary-800 pl-2 py-0.5 italic">
                        {act.description}
                      </p>
                    )}

                    {act.actionUrl && (
                      <button
                        onClick={() => handleActionClick(act.actionUrl)}
                        className="text-[9px] font-bold text-primary-650 hover:text-primary-500 uppercase tracking-widest flex items-center gap-1 pt-1 transition-colors"
                      >
                        Navigate <ArrowRight className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ActivityTimeline;
