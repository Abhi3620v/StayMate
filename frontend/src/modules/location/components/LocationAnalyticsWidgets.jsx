import React from 'react';
import Card from '@/components/ui/Card';
import { BarChart3, Compass, Map, Landmark } from 'lucide-react';

/**
 * 1. LocationDemandCard
 */
export const LocationDemandCard = ({ title, description, items = [], labelKey = 'city', countKey = 'count' }) => {
  const maxVal = items.length ? Math.max(...items.map(item => item[countKey])) : 10;

  return (
    <Card className="p-6 border-secondary-200/50 dark:border-secondary-900 bg-white dark:bg-secondary-900 space-y-4 shadow-premium-sm">
      <div className="border-b border-secondary-100 dark:border-secondary-900 pb-3 flex items-center justify-between">
        <div>
          <h3 className="text-[13px] font-extrabold text-secondary-900 dark:text-white uppercase tracking-wider flex items-center">
            <Compass className="h-4.5 w-4.5 mr-2 text-primary-500" /> {title}
          </h3>
          <p className="text-[10px] text-secondary-400">{description}</p>
        </div>
      </div>

      <div className="space-y-4">
        {items.length === 0 ? (
          <div className="text-xs text-secondary-450 italic py-4 text-center">
            No location metrics loaded yet.
          </div>
        ) : (
          items.map((item, idx) => {
            const val = item[countKey];
            const pct = maxVal > 0 ? (val / maxVal) * 100 : 0;
            return (
              <div key={idx} className="space-y-2">
                <div className="flex justify-between items-center text-xs font-bold">
                  <span className="text-secondary-750 dark:text-secondary-300">{item[labelKey] || 'Other'}</span>
                  <span className="text-primary-650">{val} Queries</span>
                </div>
                <div className="h-2 w-full bg-secondary-50 dark:bg-secondary-950 rounded-full overflow-hidden border border-secondary-100 dark:border-secondary-900">
                  <div 
                    className="h-full bg-primary-500 rounded-full transition-all duration-550" 
                    style={{ width: `${pct}%` }} 
                  />
                </div>
              </div>
            );
          })
        )}
      </div>
    </Card>
  );
};

/**
 * 2. MapHeatmapLegend
 */
export const MapHeatmapLegend = () => {
  const regions = [
    { name: 'Noida Sector 62', traffic: 'High Demand (75 views)' },
    { name: 'Katraj, Pune', traffic: 'Moderate (48 views)' },
    { name: 'Connaught Place', traffic: 'High Demand (62 views)' },
    { name: 'Andheri West', traffic: 'Moderate (50 views)' }
  ];

  return (
    <Card className="p-6 border-secondary-200/50 dark:border-secondary-900 bg-white dark:bg-secondary-900 space-y-4 shadow-premium-sm flex flex-col justify-between">
      <div className="border-b border-secondary-100 dark:border-secondary-900 pb-3">
        <h3 className="text-[13px] font-extrabold text-secondary-900 dark:text-white uppercase tracking-wider flex items-center">
          <Map className="h-4.5 w-4.5 mr-2 text-success-500" /> Geographic Hotspots
        </h3>
        <p className="text-[10px] text-secondary-400">Heat map distribution counts by locality</p>
      </div>

      <div className="divide-y divide-secondary-100 dark:divide-secondary-900 text-xs font-semibold text-secondary-600">
        {regions.map((reg, idx) => (
          <div key={idx} className="flex justify-between items-center py-2.5">
            <span className="text-secondary-800 dark:text-secondary-200 font-extrabold">{reg.name}</span>
            <span className="text-[10px] font-black text-success-650 bg-success-50 px-2 py-0.5 rounded-md">
              {reg.traffic}
            </span>
          </div>
        ))}
      </div>

      <p className="text-[10px] text-secondary-450 leading-relaxed font-semibold mt-4 text-center">
        Heat map signals verify high traffic hubs clustered around co-living and student university centers.
      </p>
    </Card>
  );
};
