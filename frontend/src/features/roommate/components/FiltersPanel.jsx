import React from 'react';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Button from '@/components/ui/Button';
import { SlidersHorizontal, RotateCcw } from 'lucide-react';

export const FiltersPanel = ({
  filters,
  onFilterChange,
  onReset,
  onApply,
}) => {
  const handleSelectChange = (name, value) => {
    onFilterChange({ [name]: value });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    onFilterChange({ [name]: value });
  };

  const genderOptions = [
    { label: 'All Genders', value: '' },
    { label: 'Male', value: 'male' },
    { label: 'Female', value: 'female' },
    { label: 'Other', value: 'other' },
  ];

  const occupationOptions = [
    { label: 'All Occupations', value: '' },
    { label: 'Student', value: 'student' },
    { label: 'Professional', value: 'professional' },
  ];

  const foodOptions = [
    { label: 'Any Diet', value: '' },
    { label: 'Vegetarian', value: 'veg' },
    { label: 'Non-Vegetarian', value: 'non-veg' },
  ];

  const booleanOptions = [
    { label: 'Any Preference', value: '' },
    { label: 'Yes', value: 'true' },
    { label: 'No', value: 'false' },
  ];

  const compatibilityOptions = [
    { label: 'Any Compatibility', value: '' },
    { label: '70% & above', value: '70' },
    { label: '80% & above', value: '80' },
    { label: '90% & above', value: '90' },
  ];

  const sortOptions = [
    { label: 'Highest Compatibility', value: 'compatibility' },
    { label: 'Newest', value: 'newest' },
    { label: 'Closest Budget', value: 'nearest_budget' },
    { label: 'Cheapest Rent', value: 'budget' },
    { label: 'Move-in Date', value: 'move_in_date' },
  ];

  return (
    <div className="space-y-6">
      {/* Title block */}
      <div className="flex items-center justify-between pb-4 border-b border-secondary-200/60 dark:border-secondary-800">
        <div className="flex items-center space-x-2 text-secondary-900 dark:text-white font-extrabold text-sm tracking-tight">
          <SlidersHorizontal className="h-4.5 w-4.5 text-primary-650" />
          <span>Search Filters</span>
        </div>
        <button
          onClick={onReset}
          className="text-xs font-bold text-secondary-400 hover:text-primary-650 transition-colors flex items-center space-x-1"
          type="button"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          <span>Reset</span>
        </button>
      </div>

      {/* Forms body */}
      <div className="space-y-6">
        {/* SECTION 1: BUDGET & LOCATION */}
        <div className="space-y-4">
          <h5 className="text-[10px] font-black text-primary-600 dark:text-primary-400 uppercase tracking-widest border-b border-secondary-100 dark:border-secondary-800/80 pb-2">
            Budget & Location
          </h5>
          <div className="space-y-3.5">
            <div className="space-y-1.5 text-xs font-semibold text-secondary-500 dark:text-secondary-400">
              <label className="text-[9.5px] font-extrabold text-secondary-400 uppercase tracking-wider block">Preferred City</label>
              <Input
                placeholder="e.g. Noida, Delhi"
                name="city"
                value={filters.city || ''}
                onChange={handleInputChange}
                className="text-xs"
              />
            </div>
            <div className="space-y-1.5 text-xs font-semibold text-secondary-500 dark:text-secondary-400">
              <label className="text-[9.5px] font-extrabold text-secondary-400 uppercase tracking-wider block">Max Monthly Rent (INR)</label>
              <Input
                type="number"
                placeholder="e.g. 15000"
                name="maxRent"
                value={filters.maxRent || ''}
                onChange={handleInputChange}
                min="0"
                className="text-xs"
              />
            </div>
            <div className="space-y-1.5 text-xs font-semibold text-secondary-500 dark:text-secondary-400">
              <label className="text-[9.5px] font-extrabold text-secondary-400 uppercase tracking-wider block">Sort results by</label>
              <Select
                value={filters.sort || 'compatibility'}
                onChange={(e) => handleSelectChange('sort', e.target.value)}
                options={sortOptions}
                className="text-xs"
              />
            </div>
          </div>
        </div>

        {/* SECTION 2: OCCUPATION & DEMOGRAPHICS */}
        <div className="space-y-4">
          <h5 className="text-[10px] font-black text-primary-600 dark:text-primary-400 uppercase tracking-widest border-b border-secondary-100 dark:border-secondary-800/80 pb-2">
            Occupation & Demographics
          </h5>
          <div className="space-y-3.5">
            <div className="space-y-1.5 text-xs font-semibold text-secondary-500 dark:text-secondary-400">
              <label className="text-[9.5px] font-extrabold text-secondary-400 uppercase tracking-wider block">Gender</label>
              <Select
                value={filters.gender || ''}
                onChange={(e) => handleSelectChange('gender', e.target.value)}
                options={genderOptions}
                className="text-xs"
              />
            </div>
            <div className="space-y-1.5 text-xs font-semibold text-secondary-500 dark:text-secondary-400">
              <label className="text-[9.5px] font-extrabold text-secondary-400 uppercase tracking-wider block">Occupation Status</label>
              <Select
                value={filters.occupation || ''}
                onChange={(e) => handleSelectChange('occupation', e.target.value)}
                options={occupationOptions}
                className="text-xs"
              />
            </div>
          </div>
        </div>

        {/* SECTION 3: LIFESTYLE & HABITS */}
        <div className="space-y-4">
          <h5 className="text-[10px] font-black text-primary-600 dark:text-primary-400 uppercase tracking-widest border-b border-secondary-100 dark:border-secondary-800/80 pb-2">
            Lifestyle & Habits
          </h5>
          <div className="space-y-3.5">
            <div className="space-y-1.5 text-xs font-semibold text-secondary-500 dark:text-secondary-400">
              <label className="text-[9.5px] font-extrabold text-secondary-400 uppercase tracking-wider block">Diet Preference</label>
              <Select
                value={filters.foodPreference || ''}
                onChange={(e) => handleSelectChange('foodPreference', e.target.value)}
                options={foodOptions}
                className="text-xs"
              />
            </div>
            <div className="space-y-1.5 text-xs font-semibold text-secondary-500 dark:text-secondary-400">
              <label className="text-[9.5px] font-extrabold text-secondary-400 uppercase tracking-wider block">Smoking allowed</label>
              <Select
                value={filters.smoking || ''}
                onChange={(e) => handleSelectChange('smoking', e.target.value)}
                options={booleanOptions}
                className="text-xs"
              />
            </div>
            <div className="space-y-1.5 text-xs font-semibold text-secondary-500 dark:text-secondary-400">
              <label className="text-[9.5px] font-extrabold text-secondary-400 uppercase tracking-wider block">Drinking allowed</label>
              <Select
                value={filters.drinking || ''}
                onChange={(e) => handleSelectChange('drinking', e.target.value)}
                options={booleanOptions}
                className="text-xs"
              />
            </div>
            <div className="space-y-1.5 text-xs font-semibold text-secondary-500 dark:text-secondary-400">
              <label className="text-[9.5px] font-extrabold text-secondary-400 uppercase tracking-wider block">Pets allowed</label>
              <Select
                value={filters.pets || ''}
                onChange={(e) => handleSelectChange('pets', e.target.value)}
                options={booleanOptions}
                className="text-xs"
              />
            </div>
          </div>
        </div>

        {/* SECTION 4: COMPATIBILITY SETTINGS */}
        <div className="space-y-4">
          <h5 className="text-[10px] font-black text-primary-600 dark:text-primary-400 uppercase tracking-widest border-b border-secondary-100 dark:border-secondary-800/80 pb-2">
            Compatibility settings
          </h5>
          <div className="space-y-3.5">
            <div className="space-y-1.5 text-xs font-semibold text-secondary-500 dark:text-secondary-400">
              <label className="text-[9.5px] font-extrabold text-secondary-400 uppercase tracking-wider block">Minimum Score</label>
              <Select
                value={filters.minCompatibility || ''}
                onChange={(e) => handleSelectChange('minCompatibility', e.target.value)}
                options={compatibilityOptions}
                className="text-xs"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Apply actions */}
      {onApply && (
        <div className="pt-4 border-t border-secondary-200/60 dark:border-secondary-800">
          <Button variant="primary" size="sm" className="w-full font-bold py-2.5 shadow-premium-sm text-xs rounded-xl" onClick={onApply}>
            Apply Filters
          </Button>
        </div>
      )}
    </div>
  );
};

export default FiltersPanel;
