import React, { useEffect } from 'react';
import { usePlatform } from '../context/PlatformContext';
import { MetricChart } from '../components/PlatformWidgets';
import SEOHead from '../components/SEOHead';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { AlertTriangle, Clock, Activity, AlertCircle, RefreshCw } from 'lucide-react';

export const PerformancePage = () => {
  const { 
    performanceLogs, errorLogs, analytics, fetchPerformance, fetchErrors, fetchAnalytics, loading 
  } = usePlatform();

  useEffect(() => {
    fetchPerformance();
    fetchErrors();
    fetchAnalytics();
  }, [fetchPerformance, fetchErrors, fetchAnalytics]);

  const slowLogs = performanceLogs.filter(log => log.responseTime > 100).slice(0, 10);
  const criticalErrors = errorLogs.slice(0, 10);

  return (
    <div className="space-y-8">
      <SEOHead 
        title="Performance & Monitoring Dashboard" 
        description="Inspect API response latency, cache performance, and server unhandled error traces." 
      />

      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-secondary-100 dark:border-secondary-900 pb-4 gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-secondary-900 dark:text-white">Observability & Monitoring</h1>
          <p className="text-xs text-secondary-450 mt-0.5">Track API speeds, cache hit rates, and application error logs</p>
        </div>
        
        <button 
          onClick={() => { fetchPerformance(); fetchErrors(); fetchAnalytics(); }}
          className="p-2 border border-secondary-200 rounded-[12px] hover:bg-secondary-50 transition-colors cursor-pointer w-fit self-end md:self-auto"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Observability Metric Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <MetricChart 
          title="Daily Active Users (DAU)" 
          value={analytics?.dailyActiveUsers || '0'} 
          points={[10, 24, 45, 52, 85, 110, analytics?.dailyActiveUsers || 142]} 
        />
        <MetricChart 
          title="API Avg Response Time" 
          value="42.5 ms" 
          points={[62, 54, 48, 51, 44, 40, 42.5]} 
        />
        <MetricChart 
          title="Cache Hit Rate" 
          value="84.2%" 
          points={[55, 62, 70, 78, 80, 82, 84.2]} 
        />
      </div>

      {/* Latency and Error Log Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Slow Endpoints List */}
        <Card className="p-6 border-secondary-200/50 dark:border-secondary-900 bg-white dark:bg-secondary-900 space-y-4 shadow-premium-sm">
          <div className="border-b border-secondary-100 dark:border-secondary-900 pb-3 flex items-center justify-between">
            <div>
              <h3 className="text-[13px] font-extrabold text-secondary-900 dark:text-white uppercase tracking-wider flex items-center">
                <Clock className="h-4 w-4 mr-2 text-warning-500" /> Slow Endpoints
              </h3>
              <p className="text-[10px] text-secondary-400">Routes taking longer than 100ms</p>
            </div>
            <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-warning-50 text-warning-600">
              {slowLogs.length} Warns
            </span>
          </div>

          {slowLogs.length === 0 ? (
            <p className="text-xs text-secondary-400 text-center py-8 font-semibold">No slow endpoint metrics recorded.</p>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
              {slowLogs.map((log, idx) => (
                <div key={idx} className="flex justify-between items-center p-3 bg-secondary-50/30 rounded-xl border border-secondary-100/50">
                  <div className="space-y-0.5">
                    <span className="bg-secondary-100 text-[9px] font-black uppercase font-mono px-2 py-0.5 rounded text-secondary-900">
                      {log.method}
                    </span>
                    <span className="text-xs font-semibold text-secondary-800 ml-2 font-mono truncate max-w-[200px] inline-block align-middle">
                      {log.path}
                    </span>
                  </div>
                  <span className="text-xs font-extrabold text-error-650">
                    {log.responseTime} ms
                  </span>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Centralized Error Logs List */}
        <Card className="p-6 border-secondary-200/50 dark:border-secondary-900 bg-white dark:bg-secondary-900 space-y-4 shadow-premium-sm">
          <div className="border-b border-secondary-100 dark:border-secondary-900 pb-3 flex items-center justify-between">
            <div>
              <h3 className="text-[13px] font-extrabold text-secondary-900 dark:text-white uppercase tracking-wider flex items-center">
                <AlertTriangle className="h-4 w-4 mr-2 text-error-500" /> Exception Trace logs
              </h3>
              <p className="text-[10px] text-secondary-400">Centralized caught exceptions trail</p>
            </div>
            <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-error-50 text-error-600">
              {criticalErrors.length} Errors
            </span>
          </div>

          {criticalErrors.length === 0 ? (
            <p className="text-xs text-secondary-400 text-center py-8 font-semibold">Clean sheet! No server errors captured.</p>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
              {criticalErrors.map((err, idx) => (
                <div key={idx} className="p-3 bg-error-50/10 rounded-xl border border-error-100/20 space-y-2">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center space-x-2">
                      <span className="bg-error-100 text-error-600 text-[8px] font-black uppercase font-mono px-2 py-0.5 rounded">
                        {err.method || 'GET'}
                      </span>
                      <span className="text-xs font-bold text-secondary-900 dark:text-white truncate max-w-[200px]">
                        {err.route}
                      </span>
                    </div>
                    <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded ${
                      err.severity === 'critical' ? 'bg-error-500 text-white' :
                      err.severity === 'high' ? 'bg-error-50 text-error-600' :
                      'bg-warning-50 text-warning-600'
                    }`}>
                      {err.severity}
                    </span>
                  </div>
                  
                  <p className="text-[11px] font-semibold text-secondary-700 dark:text-secondary-300">
                    {err.message}
                  </p>

                  <div className="text-[9px] text-secondary-400 font-semibold flex justify-between">
                    <span>IP: {err.ipAddress}</span>
                    <span>{new Date(err.timestamp).toLocaleTimeString()}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

      </div>
    </div>
  );
};

export default PerformancePage;
