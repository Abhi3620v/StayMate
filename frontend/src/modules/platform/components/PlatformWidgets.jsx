import React, { useState } from 'react';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { 
  Database, Activity, ShieldAlert, Cpu, HardDrive, RefreshCw, 
  Trash2, Mail, Bell, Key, Play, AlertCircle, FileText, ChevronRight
} from 'lucide-react';

/**
 * 1. HealthIndicator pulsing status dot
 */
export const HealthIndicator = ({ status }) => {
  const getColors = () => {
    const s = String(status).toLowerCase();
    if (s.includes('healthy') || s.includes('active') || s.includes('connected')) {
      return { dot: 'bg-success-500 animate-pulse', text: 'text-success-600' };
    }
    if (s.includes('connecting') || s.includes('warning') || s.includes('idle')) {
      return { dot: 'bg-warning-500', text: 'text-warning-600' };
    }
    return { dot: 'bg-error-500', text: 'text-error-600' };
  };

  const colors = getColors();

  return (
    <div className="flex items-center space-x-2">
      <span className={`h-2.5 w-2.5 rounded-full ${colors.dot}`} />
      <span className={`text-[11px] font-bold capitalize ${colors.text}`}>{status}</span>
    </div>
  );
};

/**
 * 2. SystemStatusCard dashboard widgets
 */
export const SystemStatusCard = ({ title, status, icon, desc }) => {
  return (
    <Card className="p-5 border-secondary-200/50 dark:border-secondary-900 bg-white dark:bg-secondary-900 flex items-center justify-between shadow-premium-sm hover:-translate-y-0.5 transition-all">
      <div className="flex items-center space-x-3.5">
        <div className="h-10 w-10 rounded-xl bg-secondary-50 dark:bg-secondary-950 flex items-center justify-center text-primary-500">
          {icon}
        </div>
        <div>
          <h4 className="text-[13px] font-bold text-secondary-850 dark:text-secondary-200">{title}</h4>
          <p className="text-[10px] text-secondary-400 mt-0.5">{desc}</p>
        </div>
      </div>
      <HealthIndicator status={status} />
    </Card>
  );
};

/**
 * 3. CacheStatus progress statistics
 */
export const CacheStatus = ({ stats, onPurge }) => {
  const size = stats?.size || 0;
  const hits = stats?.hits || 0;
  const misses = stats?.misses || 0;
  const hitRate = stats?.hitRate || 0;

  return (
    <Card className="p-6 border-secondary-200/50 dark:border-secondary-900 bg-white dark:bg-secondary-900 space-y-6 shadow-premium-sm">
      <div className="flex justify-between items-center border-b border-secondary-100 dark:border-secondary-900 pb-3">
        <div>
          <h3 className="text-[13px] font-extrabold text-secondary-900 dark:text-white uppercase tracking-wider">Memory Cache Stats</h3>
          <p className="text-[10px] text-secondary-400">Manage temporary storage limits</p>
        </div>
        <Button onClick={onPurge} size="sm" variant="outline" className="text-error-650 hover:bg-error-50 text-[10px] font-bold py-1 px-3">
          <Trash2 className="h-3.5 w-3.5 mr-1" /> Purge Cache
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="p-4 rounded-xl border border-secondary-100 dark:border-secondary-900 text-center">
          <span className="text-[9px] font-bold text-secondary-400 block uppercase">Cache Items</span>
          <span className="text-xl font-black text-secondary-900 dark:text-white mt-1 block">{size}</span>
        </div>
        <div className="p-4 rounded-xl border border-secondary-100 dark:border-secondary-900 text-center">
          <span className="text-[9px] font-bold text-secondary-400 block uppercase">Hits</span>
          <span className="text-xl font-black text-success-650 mt-1 block">{hits}</span>
        </div>
        <div className="p-4 rounded-xl border border-secondary-100 dark:border-secondary-900 text-center">
          <span className="text-[9px] font-bold text-secondary-400 block uppercase">Misses</span>
          <span className="text-xl font-black text-error-650 mt-1 block">{misses}</span>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between items-center text-[10px] font-bold">
          <span className="text-secondary-500">CACHE HIT RATE</span>
          <span className="text-primary-650">{hitRate}%</span>
        </div>
        <div className="h-2 w-full bg-secondary-100 dark:bg-secondary-800 rounded-full overflow-hidden">
          <div className="h-full bg-primary-500 rounded-full transition-all duration-500" style={{ width: `${hitRate}%` }} />
        </div>
      </div>
    </Card>
  );
};

/**
 * 4. JobStatus Background scheduler list
 */
export const JobStatus = ({ jobs, onRun }) => {
  return (
    <Card className="p-6 border-secondary-200/50 dark:border-secondary-900 bg-white dark:bg-secondary-900 shadow-premium-sm">
      <div className="border-b border-secondary-100 dark:border-secondary-900 pb-3 mb-4">
        <h3 className="text-[13px] font-extrabold text-secondary-900 dark:text-white uppercase tracking-wider">Scheduled Background Jobs</h3>
        <p className="text-[10px] text-secondary-400">Inspect worker queues status logs</p>
      </div>

      <div className="divide-y divide-secondary-100 dark:divide-secondary-900">
        {jobs.map((job) => (
          <div key={job.name} className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-0.5">
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold text-secondary-800 dark:text-white capitalize">{job.name.replace(/_/g, ' ')}</span>
                <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full ${
                  job.status === 'completed' ? 'bg-success-50 text-success-600' :
                  job.status === 'failed' ? 'bg-error-50 text-error-600' :
                  'bg-secondary-100 text-secondary-600'
                }`}>
                  {job.status}
                </span>
              </div>
              <p className="text-[10px] text-secondary-400">
                Last Run: {job.lastRun ? new Date(job.lastRun).toLocaleString() : 'Never'} | Duration: {job.lastDuration || 0}ms | Runs: {job.runCount || 0}
              </p>
              {job.error && (
                <p className="text-[9px] text-secondary-450 italic mt-1 bg-secondary-50 p-1.5 rounded border border-dashed border-secondary-200">
                  {job.error}
                </p>
              )}
            </div>

            <Button
              onClick={() => onRun(job.name)}
              size="sm"
              variant="outline"
              className="text-[10px] font-bold py-1 px-3 w-fit"
            >
              <Play className="h-3 w-3 mr-1 text-primary-500 fill-primary-500" /> Run Job
            </Button>
          </div>
        ))}
      </div>
    </Card>
  );
};

/**
 * 5. MetricChart spark lines
 */
export const MetricChart = ({ title, value, points = [] }) => {
  const width = 500;
  const height = 150;
  const maxVal = Math.max(...points, 1);
  const minVal = Math.min(...points, 0);
  const spread = maxVal - minVal;

  const svgPoints = points.map((p, idx) => {
    const x = (idx / (points.length - 1)) * width;
    const y = height - ((p - minVal) / spread) * (height - 30) - 15;
    return `${x},${y}`;
  }).join(' ');

  return (
    <Card className="p-6 border-secondary-200/50 dark:border-secondary-900 bg-white dark:bg-secondary-900 shadow-premium-sm">
      <div className="flex justify-between items-start">
        <div className="space-y-0.5">
          <span className="text-[10px] font-bold text-secondary-400 uppercase tracking-widest block">{title}</span>
          <h2 className="text-2xl font-black text-secondary-900 dark:text-white leading-none">{value}</h2>
        </div>
      </div>

      <div className="h-36 w-full pt-4 relative">
        <svg className="w-full h-full overflow-visible" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
          <defs>
            <linearGradient id="metricGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="rgba(59, 130, 246, 0.25)" />
              <stop offset="100%" stopColor="rgba(59, 130, 246, 0)" />
            </linearGradient>
          </defs>
          
          {/* Spark area */}
          <polygon
            points={`0,${height} ${svgPoints} ${width},${height}`}
            fill="url(#metricGrad)"
          />

          {/* Stroke path */}
          <polyline
            fill="none"
            stroke="rgb(59, 130, 246)"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            points={svgPoints}
          />
        </svg>
      </div>
    </Card>
  );
};

/**
 * 6. AuditTable grid row list
 */
export const AuditTable = ({ logs }) => {
  const [selectedDetails, setSelectedDetails] = useState(null);

  const formatBrowser = (browser) => {
    if (!browser) return 'Unknown';
    if (browser.includes('Chrome')) return 'Google Chrome';
    if (browser.includes('Firefox')) return 'Firefox';
    return browser;
  };

  return (
    <div className="overflow-x-auto rounded-[20px] border border-secondary-200/50 dark:border-secondary-900 bg-white dark:bg-secondary-900 shadow-premium-sm">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-secondary-50 dark:bg-secondary-950 text-secondary-450 text-[10px] uppercase font-bold border-b border-secondary-100 dark:border-secondary-900">
            <th className="px-5 py-4">Action</th>
            <th className="px-5 py-4">User</th>
            <th className="px-5 py-4">Timestamp</th>
            <th className="px-5 py-4">IP Address</th>
            <th className="px-5 py-4">Device / Browser</th>
            <th className="px-5 py-4 text-right">Details</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-secondary-100 dark:divide-secondary-900 text-xs">
          {logs.map((log, idx) => (
            <tr key={idx} className="hover:bg-secondary-50/30 dark:hover:bg-secondary-900/20 transition-all font-semibold text-secondary-800 dark:text-secondary-300">
              <td className="px-5 py-3">
                <span className="bg-secondary-100 dark:bg-secondary-800 text-[10px] font-bold px-2 py-0.5 rounded uppercase font-mono tracking-tight text-secondary-900 dark:text-white">
                  {log.action}
                </span>
              </td>
              <td className="px-5 py-3">
                {log.userId ? (
                  <div>
                    <span className="block font-extrabold text-secondary-900 dark:text-white">{log.userId.name}</span>
                    <span className="text-[10px] text-secondary-400 font-medium block">{log.userId.email}</span>
                  </div>
                ) : (
                  <span className="text-secondary-450 italic">Guest</span>
                )}
              </td>
              <td className="px-5 py-3 text-secondary-650">
                {new Date(log.timestamp).toLocaleString()}
              </td>
              <td className="px-5 py-3 font-mono text-[11px] text-secondary-600">
                {log.ip}
              </td>
              <td className="px-5 py-3">
                <span className="block truncate max-w-[150px]">{log.device}</span>
                <span className="text-[10px] text-secondary-400 block">{formatBrowser(log.browser)}</span>
              </td>
              <td className="px-5 py-3 text-right">
                {log.details ? (
                  <button 
                    onClick={() => setSelectedDetails(log.details)}
                    className="text-primary-500 hover:text-primary-650 hover:underline inline-flex items-center text-[11px] font-bold"
                  >
                    Inspect <ChevronRight className="h-3 w-3 ml-0.5" />
                  </button>
                ) : (
                  <span className="text-secondary-400">-</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Audit Logs Inspector Modal */}
      {selectedDetails && (
        <div className="fixed inset-0 bg-secondary-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md p-6 bg-white dark:bg-secondary-950 border border-secondary-100 dark:border-secondary-900 rounded-[24px] shadow-premium-lg animate-scale-up space-y-4">
            <div className="flex justify-between items-center border-b border-secondary-100 dark:border-secondary-900 pb-3">
              <h3 className="text-xs font-extrabold text-secondary-900 dark:text-white uppercase tracking-wider flex items-center">
                <FileText className="h-4 w-4 mr-2 text-primary-500" /> Event Details
              </h3>
              <button 
                onClick={() => setSelectedDetails(null)}
                className="text-secondary-400 hover:text-secondary-650 p-1 hover:bg-secondary-50 dark:hover:bg-secondary-900 rounded-full transition-colors"
              >
                <X className="h-4.5 w-4.5" />
              </button>
            </div>
            <pre className="text-[10px] font-mono p-4 bg-secondary-50 dark:bg-secondary-950 border border-secondary-150 dark:border-secondary-900 rounded-xl overflow-auto max-h-60 text-secondary-850 dark:text-secondary-300">
              {JSON.stringify(selectedDetails, null, 2)}
            </pre>
          </Card>
        </div>
      )}
    </div>
  );
};

const X = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={props.className}>
    <path d="M18 6 6 18" /><path d="m6 6 12 12" />
  </svg>
);
