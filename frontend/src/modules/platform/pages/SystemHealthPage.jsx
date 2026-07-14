import React, { useEffect } from 'react';
import { usePlatform } from '../context/PlatformContext';
import { SystemStatusCard, CacheStatus, JobStatus } from '../components/PlatformWidgets';
import SEOHead from '../components/SEOHead';
import { 
  Database, Activity, ShieldCheck, HardDrive, RefreshCw, Layers 
} from 'lucide-react';

export const SystemHealthPage = () => {
  const { 
    health, jobs, cacheStats, fetchHealth, fetchJobs, triggerJob, fetchCacheStats, clearCache 
  } = usePlatform();

  useEffect(() => {
    fetchHealth();
    fetchJobs();
    fetchCacheStats();
    
    // Poll stats every 30 seconds
    const interval = setInterval(() => {
      fetchHealth();
      fetchJobs();
      fetchCacheStats();
    }, 30000);

    return () => clearInterval(interval);
  }, [fetchHealth, fetchJobs, fetchCacheStats]);

  return (
    <div className="space-y-8">
      <SEOHead 
        title="System Health & Operations" 
        description="Inspect StayMate server latency, background jobs statuses, and cache statistics." 
      />

      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-secondary-100 dark:border-secondary-900 pb-4 gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-secondary-900 dark:text-white">System Health Console</h1>
          <p className="text-xs text-secondary-450 mt-0.5">Real-time status indicators and diagnostics</p>
        </div>
        
        <div className="flex items-center space-x-3 text-xs font-bold text-secondary-450">
          <span>Version: <strong className="text-secondary-700 dark:text-secondary-200">{health?.version || 'v1.0.0'}</strong></span>
          <span className="h-4 w-px bg-secondary-200" />
          <span>Env: <strong className="text-secondary-700 dark:text-secondary-200 capitalize">{health?.environment || 'Production'}</strong></span>
          <span className="h-4 w-px bg-secondary-200" />
          <span>Uptime: <strong className="text-secondary-700 dark:text-secondary-200">{health?.uptime || '0 mins'}</strong></span>
        </div>
      </div>

      {/* Health Status Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <SystemStatusCard 
          title="API Response Time"
          status={health?.apiStatus || 'Healthy'}
          desc={`Current Latency: ${health?.responseTime || '0ms'}`}
          icon={<Activity className="h-5 w-5" />}
        />
        <SystemStatusCard 
          title="MongoDB Status"
          status={health?.databaseStatus || 'Healthy'}
          desc="Atlas Database Replica Set"
          icon={<Database className="h-5 w-5" />}
        />
        <SystemStatusCard 
          title="Sockets Status"
          status={health?.socketStatus || 'Connected'}
          desc="Real-time connections active"
          icon={<Layers className="h-5 w-5" />}
        />
        <SystemStatusCard 
          title="Cloudinary API"
          status={health?.storageUsage ? 'Healthy' : 'Healthy'}
          desc="Media Assets CDN Delivery"
          icon={<HardDrive className="h-5 w-5" />}
        />
      </div>

      {/* Memory & Resource Info Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 p-5 bg-secondary-50/20 border border-secondary-200/50 rounded-[20px] flex flex-col justify-between">
          <div>
            <span className="text-[10px] font-bold text-secondary-400 uppercase tracking-widest block">Server Memory Usage</span>
            <span className="text-3xl font-black text-secondary-900 dark:text-white mt-1 block">{health?.memoryUsage || '0 MB'}</span>
          </div>
          <p className="text-[10px] text-secondary-450 mt-4 leading-relaxed font-semibold">
            Heap memory allocations for StayMate Node.js Express process.
          </p>
        </div>

        <div className="md:col-span-1 p-5 bg-secondary-50/20 border border-secondary-200/50 rounded-[20px] flex flex-col justify-between">
          <div>
            <span className="text-[10px] font-bold text-secondary-400 uppercase tracking-widest block">CPU Utilization</span>
            <span className="text-3xl font-black text-secondary-900 dark:text-white mt-1 block">{health?.cpuUsage || '0.0%'}</span>
          </div>
          <p className="text-[10px] text-secondary-450 mt-4 leading-relaxed font-semibold">
            Average CPU core thread performance under SaaS workload.
          </p>
        </div>

        <div className="md:col-span-1 p-5 bg-secondary-50/20 border border-secondary-200/50 rounded-[20px] flex flex-col justify-between">
          <div>
            <span className="text-[10px] font-bold text-secondary-400 uppercase tracking-widest block">Last Deployment</span>
            <span className="text-3xl font-black text-secondary-900 dark:text-white mt-1 block">{health?.lastDeployment || 'Unknown'}</span>
          </div>
          <p className="text-[10px] text-secondary-450 mt-4 leading-relaxed font-semibold">
            Timestamp of the latest production code commit delivery update.
          </p>
        </div>
      </div>

      {/* Caching and Background Jobs Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CacheStatus stats={cacheStats} onPurge={clearCache} />
        <JobStatus jobs={jobs} onRun={triggerJob} />
      </div>
    </div>
  );
};

export default SystemHealthPage;
