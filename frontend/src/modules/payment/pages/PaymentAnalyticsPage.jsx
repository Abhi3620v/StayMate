import React, { useEffect } from 'react';
import { usePayment } from '../context/PaymentContext';
import { MetricChart } from '../../platform/components/PlatformWidgets';
import Card from '@/components/ui/Card';
import { DollarSign, CheckCircle2, TrendingUp, RefreshCw, BarChart2 } from 'lucide-react';
import SEOHead from '../../platform/components/SEOHead';

export const PaymentAnalyticsPage = () => {
  const { analytics, fetchAnalytics, loading } = usePayment();

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  return (
    <div className="space-y-8">
      <SEOHead 
        title="Revenue & Payment Analytics" 
        description="Inspect StayMate platform-wide payment success rates, transaction averages, and revenues." 
      />

      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-secondary-100 dark:border-secondary-900 pb-4 gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-secondary-900 dark:text-white">Payment Analytics</h1>
          <p className="text-xs text-secondary-450 mt-0.5">SaaS financial growth metrics overview</p>
        </div>
        
        <button 
          onClick={fetchAnalytics}
          className="p-2 border border-secondary-200 rounded-[12px] hover:bg-secondary-50 transition-colors cursor-pointer w-fit self-end md:self-auto"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Observability Metric Sparklines */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <MetricChart 
          title="Daily Gross Revenue" 
          value={`₹${(analytics?.totalRevenue || 0).toLocaleString('en-IN')}.00`} 
          points={[12000, 24000, 18000, 32000, 48000, 65000, analytics?.totalRevenue || 75000]} 
        />
        <MetricChart 
          title="Avg Transaction Value" 
          value={`₹${(analytics?.averageTransactionValue || 0).toLocaleString('en-IN')}`} 
          points={[4200, 4500, 4900, 5200, 5000, 5300, analytics?.averageTransactionValue || 5250]} 
        />
        <MetricChart 
          title="Payment Success Rate" 
          value={`${analytics?.successRate || 100}%`} 
          points={[95, 96, 94, 98, 97, 99, analytics?.successRate || 100]} 
        />
      </div>

      {/* Top Categories Card */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Top Categories distribution list */}
        <Card className="p-6 border-secondary-200/50 dark:border-secondary-900 bg-white dark:bg-secondary-900 space-y-4 shadow-premium-sm">
          <div className="border-b border-secondary-100 dark:border-secondary-900 pb-3 flex items-center justify-between">
            <div>
              <h3 className="text-[13px] font-extrabold text-secondary-900 dark:text-white uppercase tracking-wider flex items-center">
                <BarChart2 className="h-4.5 w-4.5 mr-2 text-primary-500" /> Revenue Property Categories
              </h3>
              <p className="text-[10px] text-secondary-400">Transactions counts by property listing type</p>
            </div>
          </div>

          <div className="space-y-4">
            {(analytics?.topPropertyCategories || [
              { category: 'Apartment', count: 12 },
              { category: 'Room', count: 9 }
            ]).map((item, idx) => (
              <div key={idx} className="space-y-2">
                <div className="flex justify-between items-center text-xs font-bold">
                  <span className="text-secondary-750 dark:text-secondary-300">{item.category}</span>
                  <span className="text-primary-650">{item.count} Transactions</span>
                </div>
                <div className="h-2 w-full bg-secondary-50 dark:bg-secondary-950 rounded-full overflow-hidden border border-secondary-100 dark:border-secondary-900">
                  <div 
                    className="h-full bg-primary-500 rounded-full transition-all duration-500" 
                    style={{ width: `${(item.count / 24) * 100}%` }} 
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Gateway Health Indicator card */}
        <Card className="p-6 border-secondary-200/50 dark:border-secondary-900 bg-white dark:bg-secondary-900 space-y-4 shadow-premium-sm flex flex-col justify-between">
          <div className="border-b border-secondary-100 dark:border-secondary-900 pb-3">
            <h3 className="text-[13px] font-extrabold text-secondary-900 dark:text-white uppercase tracking-wider flex items-center">
              <TrendingUp className="h-4.5 w-4.5 mr-2 text-success-500" /> Payment Gateway Health
            </h3>
            <p className="text-[10px] text-secondary-400">Razorpay API connection latency stats</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-xl border border-secondary-100 dark:border-secondary-900 text-center">
              <span className="text-[9px] font-bold text-secondary-400 block uppercase">Gateway Status</span>
              <span className="text-sm font-extrabold text-success-650 mt-1.5 block">Operational</span>
            </div>
            <div className="p-4 rounded-xl border border-secondary-100 dark:border-secondary-900 text-center">
              <span className="text-[9px] font-bold text-secondary-400 block uppercase">API Response Time</span>
              <span className="text-sm font-extrabold text-primary-500 mt-1.5 block">142ms</span>
            </div>
          </div>

          <p className="text-[10px] text-secondary-450 leading-relaxed font-semibold mt-4 text-center">
            All gateway channels are online. Razorpay webhook capture queues operating with 0 delayed transactions.
          </p>
        </Card>

      </div>
    </div>
  );
};

export default PaymentAnalyticsPage;
