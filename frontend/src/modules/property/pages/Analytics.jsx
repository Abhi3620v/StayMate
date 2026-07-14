import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  ArrowLeft, Eye, Heart, Calendar, Share2, ShieldCheck,
  TrendingUp, Activity, Award, CheckCircle, HelpCircle,
  FileSpreadsheet, FileText, ChevronDown, RefreshCw
} from 'lucide-react';

import { useProperties } from '../hooks/useProperties.js';
import Card from '../../../components/ui/Card.jsx';
import Button from '../../../components/ui/Button.jsx';
import Select from '../../../components/ui/Select.jsx';
import Skeleton from '../../../components/ui/Skeleton.jsx';
import Badge from '../../../components/ui/Badge.jsx';

export const Analytics = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    singlePropertyAnalytics,
    fetchSinglePropertyAnalytics,
    isFetchingAnalytics,
    properties,
    fetchProperties
  } = useProperties();

  const [timeRange, setTimeRange] = useState('7_days');
  const [comparePropertyId, setComparePropertyId] = useState('');
  const [showExportMenu, setShowExportMenu] = useState(false);

  // Load analytics details
  useEffect(() => {
    if (id) {
      fetchSinglePropertyAnalytics(id);
    }
    fetchProperties(); // load listings list for comparisons
  }, [id, fetchSinglePropertyAnalytics, fetchProperties]);

  const handleExport = (format) => {
    toast.success(`Exporting analytics report as ${format}...`);
    setShowExportMenu(false);
  };

  const compareProperty = properties.find(p => p._id === comparePropertyId);

  return (
    <div className="space-y-8 pb-32">
      {/* 1. Header with back link */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-2">
          <button
            onClick={() => navigate('/owner/properties')}
            className="flex items-center text-xs font-bold text-secondary-500 hover:text-primary-600 transition-colors uppercase tracking-wider"
          >
            <ArrowLeft className="h-4 w-4 mr-1.5" /> Back to listings
          </button>
          <h1 className="text-3xl font-black text-secondary-900 dark:text-white leading-tight">Property Performance</h1>
          {singlePropertyAnalytics && (
            <p className="text-sm text-secondary-400 font-medium">{singlePropertyAnalytics.title}</p>
          )}
        </div>

        {/* Toolbar */}
        <div className="flex items-center space-x-3 self-end md:self-auto">
          <Select value={timeRange} onChange={(e) => setTimeRange(e.target.value)} className="w-36">
            <option value="7_days">Last 7 Days</option>
            <option value="30_days">Last 30 Days</option>
            <option value="90_days">Last 90 Days</option>
            <option value="1_year">Last Year</option>
          </Select>

          {/* Export Menu */}
          <div className="relative">
            <Button variant="outline" onClick={() => setShowExportMenu(!showExportMenu)}>
              Export <ChevronDown className="h-4 w-4 ml-1.5" />
            </Button>
            {showExportMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-secondary-950 border border-secondary-200 dark:border-secondary-900 rounded-2xl shadow-premium-lg z-50 p-2 space-y-1">
                <button
                  onClick={() => handleExport('CSV')}
                  className="flex items-center w-full px-3 py-2.5 text-xs font-bold text-secondary-700 dark:text-secondary-300 hover:bg-secondary-50 dark:hover:bg-secondary-900 rounded-xl"
                >
                  <FileSpreadsheet className="h-4 w-4 mr-2 text-success-650" /> Export CSV Sheet
                </button>
                <button
                  onClick={() => handleExport('PDF')}
                  className="flex items-center w-full px-3 py-2.5 text-xs font-bold text-secondary-700 dark:text-secondary-300 hover:bg-secondary-50 dark:hover:bg-secondary-900 rounded-xl"
                >
                  <FileText className="h-4 w-4 mr-2 text-error-500" /> Export PDF Report
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {isFetchingAnalytics || !singlePropertyAnalytics ? (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Array(4).fill(0).map((_, idx) => (
              <Skeleton key={idx} className="h-24 w-full rounded-2xl" />
            ))}
          </div>
          <Skeleton className="h-64 w-full rounded-3xl" />
        </div>
      ) : (
        <>
          {/* 2. KPI Cards row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Total Views', val: singlePropertyAnalytics.stats.totalViews, icon: Eye, change: '+12% vs last week' },
              { label: 'Wishlist Saves', val: singlePropertyAnalytics.stats.wishlistSaves, icon: Heart, change: '+4% vs last week' },
              { label: 'Visit Requests', val: singlePropertyAnalytics.stats.visitRequests, icon: Calendar, change: '+8% vs last week' },
              { label: 'Conversion Rate', val: `${singlePropertyAnalytics.stats.conversionRate}%`, icon: TrendingUp, change: 'Optimal Conversion' }
            ].map((card, idx) => {
              const Icon = card.icon;
              return (
                <Card key={idx} className="p-5 rounded-[18px] border border-secondary-200/50 dark:border-secondary-900">
                  <div className="flex justify-between items-start text-secondary-400">
                    <span className="text-xs font-bold uppercase tracking-wider">{card.label}</span>
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="text-2xl font-black text-secondary-900 dark:text-white mt-3 block">{card.val}</span>
                  <span className="text-[10px] font-bold text-success-650 mt-1 block">{card.change}</span>
                </Card>
              );
            })}
          </div>

          {/* 3. Charts & Health Score Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Left/Middle: Views trend line */}
            <Card className="md:col-span-2 p-6 rounded-3xl space-y-6">
              <div>
                <h3 className="text-lg font-bold text-secondary-900 dark:text-white">Views Trend</h3>
                <p className="text-xs text-secondary-400">Chronological daily view traffic over time.</p>
              </div>

              {/* SVG-based Line Chart */}
              <div className="h-56 w-full relative flex items-end">
                <svg className="w-full h-full" viewBox="0 0 600 200" preserveAspectRatio="none">
                  {/* Grid Lines */}
                  <line x1="0" y1="50" x2="600" y2="50" stroke="rgba(226, 232, 240, 0.3)" strokeDasharray="4" />
                  <line x1="0" y1="100" x2="600" y2="100" stroke="rgba(226, 232, 240, 0.3)" strokeDasharray="4" />
                  <line x1="0" y1="150" x2="600" y2="150" stroke="rgba(226, 232, 240, 0.3)" strokeDasharray="4" />

                  {/* Gradient area */}
                  <defs>
                    <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#2563eb" stopOpacity="0.25" />
                      <stop offset="100%" stopColor="#2563eb" stopOpacity="0" />
                    </linearGradient>
                  </defs>

                  {/* Path coordinates */}
                  <path
                    d={`M 0,${200 - singlePropertyAnalytics.trends.viewsOverTime[0].count * 5}
                       L 100,${200 - singlePropertyAnalytics.trends.viewsOverTime[1].count * 5}
                       L 200,${200 - singlePropertyAnalytics.trends.viewsOverTime[2].count * 5}
                       L 300,${200 - singlePropertyAnalytics.trends.viewsOverTime[3].count * 5}
                       L 400,${200 - singlePropertyAnalytics.trends.viewsOverTime[4].count * 5}
                       L 500,${200 - singlePropertyAnalytics.trends.viewsOverTime[5].count * 5}
                       L 600,${200 - singlePropertyAnalytics.trends.viewsOverTime[6].count * 5}
                       L 600,200 L 0,200 Z`}
                    fill="url(#chartGrad)"
                  />

                  {/* Line */}
                  <path
                    d={`M 0,${200 - singlePropertyAnalytics.trends.viewsOverTime[0].count * 5}
                       L 100,${200 - singlePropertyAnalytics.trends.viewsOverTime[1].count * 5}
                       L 200,${200 - singlePropertyAnalytics.trends.viewsOverTime[2].count * 5}
                       L 300,${200 - singlePropertyAnalytics.trends.viewsOverTime[3].count * 5}
                       L 400,${200 - singlePropertyAnalytics.trends.viewsOverTime[4].count * 5}
                       L 500,${200 - singlePropertyAnalytics.trends.viewsOverTime[5].count * 5}
                       L 600,${200 - singlePropertyAnalytics.trends.viewsOverTime[6].count * 5}`}
                    fill="none"
                    stroke="#2563eb"
                    strokeWidth="3.5"
                  />
                </svg>

                {/* Legend Labels */}
                <div className="absolute bottom-0 left-0 right-0 flex justify-between px-2 text-[9px] font-bold text-secondary-400">
                  {singlePropertyAnalytics.trends.viewsOverTime.map((pt, idx) => (
                    <span key={idx}>{pt.date}</span>
                  ))}
                </div>
              </div>
            </Card>

            {/* Right: Health Score Card */}
            <Card className="p-6 rounded-3xl space-y-6">
              <div>
                <h3 className="text-lg font-bold text-secondary-900 dark:text-white">Listing Health</h3>
                <p className="text-xs text-secondary-400">Check suggestions to increase your booking score.</p>
              </div>

              {/* Progress bar */}
              <div className="flex items-center justify-between bg-secondary-50/50 dark:bg-secondary-950 p-4 border border-secondary-200/40 dark:border-secondary-900 rounded-2xl">
                <div className="space-y-1">
                  <span className="text-xs font-bold text-secondary-400 uppercase tracking-wider block">Health Score</span>
                  <span className="text-2xl font-black text-secondary-900 dark:text-white">{singlePropertyAnalytics.health.score}/100</span>
                </div>
                <Badge variant={singlePropertyAnalytics.health.score >= 80 ? 'success' : 'warning'} className="capitalize font-black">
                  {singlePropertyAnalytics.health.status}
                </Badge>
              </div>

              {/* Suggestions */}
              <div className="space-y-3">
                <h4 className="text-xs font-black text-secondary-500 uppercase tracking-wider">Recommendations</h4>
                <div className="space-y-2">
                  {singlePropertyAnalytics.health.suggestions.map((suggestion, idx) => (
                    <div key={idx} className="flex items-start space-x-2 text-xs font-medium text-secondary-600 dark:text-secondary-400 leading-relaxed">
                      <HelpCircle className="h-4.5 w-4.5 text-warning-600 shrink-0 mt-0.5" />
                      <span>{suggestion}</span>
                    </div>
                  ))}
                  {singlePropertyAnalytics.health.suggestions.length === 0 && (
                    <div className="flex items-center space-x-2 text-xs font-bold text-success-650 bg-success-50/15 p-3 rounded-xl">
                      <CheckCircle className="h-4 w-4" />
                      <span>Listing is optimized and complete!</span>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          </div>

          {/* 4. Comparison Section */}
          <Card className="p-6 rounded-3xl space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold text-secondary-900 dark:text-white">Compare Properties</h3>
                <p className="text-xs text-secondary-400">Evaluate listing performance side-by-side.</p>
              </div>
              <Select
                value={comparePropertyId}
                onChange={(e) => setComparePropertyId(e.target.value)}
                className="w-64"
              >
                <option value="">Compare with another property</option>
                {properties
                  .filter(p => p._id !== id)
                  .map(p => (
                    <option key={p._id} value={p._id}>{p.title || p.basicInfo?.title}</option>
                  ))}
              </Select>
            </div>

            {compareProperty ? (
              <div className="overflow-x-auto border border-secondary-200/40 dark:border-secondary-900 rounded-2xl">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="bg-secondary-50/50 dark:bg-secondary-900/30 border-b border-secondary-200 dark:border-secondary-800 text-xs font-bold text-secondary-405 uppercase tracking-wider">
                      <th className="p-4">Metric</th>
                      <th className="p-4">{singlePropertyAnalytics.title} (This)</th>
                      <th className="p-4">{compareProperty.title || compareProperty.basicInfo?.title}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-secondary-200/40 dark:divide-secondary-900 font-semibold text-secondary-700 dark:text-secondary-300">
                    <tr>
                      <td className="p-4 text-secondary-405">Monthly Rent</td>
                      <td className="p-4 font-black">₹{singlePropertyAnalytics.stats.totalViews > 0 ? (properties.find(p => p._id === id)?.pricing?.monthlyRent || 0) : 0}</td>
                      <td className="p-4 font-black">₹{compareProperty.pricing?.monthlyRent}</td>
                    </tr>
                    <tr>
                      <td className="p-4 text-secondary-405">Marketplace Views</td>
                      <td className="p-4">{singlePropertyAnalytics.stats.totalViews}</td>
                      <td className="p-4">{compareProperty.statistics?.views || 0}</td>
                    </tr>
                    <tr>
                      <td className="p-4 text-secondary-405">Wishlist Saves</td>
                      <td className="p-4">{singlePropertyAnalytics.stats.wishlistSaves}</td>
                      <td className="p-4">{compareProperty.statistics?.favorites || 0}</td>
                    </tr>
                    <tr>
                      <td className="p-4 text-secondary-405">Visit Requests</td>
                      <td className="p-4">{singlePropertyAnalytics.stats.visitRequests}</td>
                      <td className="p-4">{compareProperty.statistics?.visitRequests || 0}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 border border-dashed border-secondary-200/40 dark:border-secondary-850 rounded-2xl text-xs text-secondary-400 font-bold italic">
                Select a listing from the dropdown menu to compare key statistics.
              </div>
            )}
          </Card>
        </>
      )}
    </div>
  );
};

export default Analytics;
