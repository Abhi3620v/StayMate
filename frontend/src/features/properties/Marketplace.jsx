import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useSearchParams } from 'react-router-dom';
import propertyService from '@/services/propertyService';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Badge from '@/components/ui/Badge';
import { 
  Search, SlidersHorizontal, Grid, List, MapPin, Bed, Bath, ShieldCheck, 
  Sparkles, Check, X, RefreshCw, ChevronLeft, ChevronRight, Eye, Heart
} from 'lucide-react';
import toast from 'react-hot-toast';

const AMENITIES_LIST = [
  { key: 'wifi', label: 'WiFi' },
  { key: 'ac', label: 'AC' },
  { key: 'parking', label: 'Parking' },
  { key: 'powerBackup', label: 'Power Backup' },
  { key: 'kitchen', label: 'Kitchen' },
  { key: 'foodIncluded', label: 'Food Included' }
];

const PROPERTY_TYPES = [
  { label: 'Apartment', value: 'apartment' },
  { label: 'Flat', value: 'flat' },
  { label: 'PG / Co-Living', value: 'pg' },
  { label: 'Hostel', value: 'hostel' },
  { label: 'Villa', value: 'villa' },
  { label: 'Studio', value: 'studio' },
  { label: 'Room', value: 'room' }
];

const FURNISHING_TYPES = [
  { label: 'Unfurnished', value: 'unfurnished' },
  { label: 'Semi-Furnished', value: 'semi_furnished' },
  { label: 'Fully-Furnished', value: 'fully_furnished' }
];

const OCCUPANCY_TYPES = [
  { label: 'Single', value: 'single' },
  { label: 'Double', value: 'double' },
  { label: 'Triple', value: 'triple' },
  { label: 'Shared', value: 'four_sharing' }
];

const Marketplace = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [showFiltersMobile, setShowFiltersMobile] = useState(false);
  const [searchVal, setSearchVal] = useState(searchParams.get('search') || '');

  // Parse filters from search parameters
  const page = parseInt(searchParams.get('page')) || 1;
  const city = searchParams.get('city') || '';
  const propertyType = searchParams.get('propertyType') || '';
  const rentMin = searchParams.get('rentMin') || '';
  const rentMax = searchParams.get('rentMax') || '';
  const bedrooms = searchParams.get('bedrooms') || '';
  const furnishing = searchParams.get('furnishing') || '';
  const verified = searchParams.get('verified') || '';
  const sort = searchParams.get('sort') || 'newest';

  // Amenities filters
  const selectedAmenities = {};
  AMENITIES_LIST.forEach(({ key }) => {
    selectedAmenities[key] = searchParams.get(key) === 'true';
  });

  const queryParams = {
    page,
    limit: 8,
    search: searchParams.get('search') || '',
    city,
    propertyType,
    rentMin,
    rentMax,
    bedrooms,
    furnishing,
    verified,
    sort,
    ...selectedAmenities
  };

  // React Query fetch catalog properties
  const { data, isLoading, error, refetch, isFetching } = useQuery({
    queryKey: ['properties', 'list', queryParams],
    queryFn: () => propertyService.getProperties(queryParams),
    staleTime: 3 * 60 * 1000, // 3 minutes stale cache
  });

  // Debounce search input update
  useEffect(() => {
    const handler = setTimeout(() => {
      const current = Object.fromEntries(searchParams);
      if (searchVal) {
        current.search = searchVal;
      } else {
        delete current.search;
      }
      current.page = '1';
      setSearchParams(current);
    }, 400);

    return () => clearTimeout(handler);
  }, [searchVal]);

  const updateParam = (key, val) => {
    const current = Object.fromEntries(searchParams);
    if (val) {
      current[key] = val;
    } else {
      delete current[key];
    }
    current.page = '1'; // reset pagination
    setSearchParams(current);
  };

  const toggleAmenity = (key) => {
    const current = Object.fromEntries(searchParams);
    if (current[key] === 'true') {
      delete current[key];
    } else {
      current[key] = 'true';
    }
    current.page = '1';
    setSearchParams(current);
  };

  const handleResetFilters = () => {
    setSearchParams({});
    setSearchVal('');
  };

  const handlePageChange = (newPage) => {
    const current = Object.fromEntries(searchParams);
    current.page = newPage.toString();
    setSearchParams(current);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Wishlist actions
  const handleToggleWishlist = async (id, e) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const res = await propertyService.toggleWishlist(id);
      toast.success(res.message);
      refetch();
    } catch (err) {
      toast.error('Log in to save property listings.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 space-y-6">
      
      {/* 1. Header & Search Row */}
      <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-secondary-900 dark:text-white flex items-center">
            <Sparkles className="h-5 w-5 text-primary-500 mr-2 shrink-0 animate-pulse" />
            Discover Verified Stays
          </h1>
          <p className="text-xs text-secondary-450 dark:text-secondary-400 mt-1">
            Browse fully furnished apartments, shared rooms, and co-living PGs near you.
          </p>
        </div>

        {/* View Toggle and Sorting */}
        <div className="flex items-center space-x-2 shrink-0">
          <div className="bg-secondary-100 dark:bg-secondary-900 p-0.5 rounded-[12px] flex items-center">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-[10px] transition-colors ${viewMode === 'grid' ? 'bg-white dark:bg-secondary-800 text-primary-650' : 'text-secondary-500'}`}
            >
              <Grid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-[10px] transition-colors ${viewMode === 'list' ? 'bg-white dark:bg-secondary-800 text-primary-650' : 'text-secondary-500'}`}
            >
              <List className="h-4 w-4" />
            </button>
          </div>

          <Select
            value={sort}
            onChange={(e) => updateParam('sort', e.target.value)}
            className="text-xs font-bold py-2 bg-secondary-50 border-secondary-200/50 rounded-[12px]"
            options={[
              { label: 'Sort: Newest', value: 'newest' },
              { label: 'Sort: Oldest', value: 'oldest' },
              { label: 'Price: Low to High', value: 'price_asc' },
              { label: 'Price: High to Low', value: 'price_desc' },
              { label: 'Sort: Popularity', value: 'popularity' },
            ]}
          />

          <Button
            variant="outline"
            className="lg:hidden flex items-center text-xs font-bold"
            onClick={() => setShowFiltersMobile(true)}
          >
            <SlidersHorizontal className="h-4 w-4 mr-2" />
            Filters
          </Button>
        </div>
      </div>

      {/* 2. Global Search Input bar */}
      <div className="relative">
        <Input
          placeholder="Search by city, landmark, area, or property name..."
          value={searchVal}
          onChange={(e) => setSearchVal(e.target.value)}
          className="pl-11 pr-4 py-3 bg-secondary-50 border-secondary-200/80 rounded-[14px]"
        />
        <Search className="absolute left-4 top-3.5 h-4.5 w-4.5 text-secondary-400" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* 3. Filtering Sidebar (Desktop Only) */}
        <div className="hidden lg:block lg:col-span-1 space-y-5">
          <Card className="p-5 border-secondary-200/50 space-y-5 sticky top-24">
            <div className="flex justify-between items-center border-b border-secondary-100 dark:border-secondary-900 pb-3">
              <span className="font-extrabold text-sm text-secondary-900 dark:text-white flex items-center">
                <SlidersHorizontal className="h-4 w-4 text-primary-500 mr-2" />
                Advanced Filters
              </span>
              <button onClick={handleResetFilters} className="text-[10px] font-extrabold text-primary-600 hover:text-primary-500 uppercase tracking-wider">
                Reset All
              </button>
            </div>

            {/* City parameter selector */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-secondary-400 uppercase tracking-wider">Target City</label>
              <Input
                placeholder="e.g. Noida, Delhi"
                value={city}
                onChange={(e) => updateParam('city', e.target.value)}
                className="py-2 text-xs"
              />
            </div>

            {/* Rent Range parameters */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-secondary-400 uppercase tracking-wider">Monthly Rent Bracket</label>
              <div className="grid grid-cols-2 gap-2">
                <Input placeholder="Min" type="number" value={rentMin} onChange={(e) => updateParam('rentMin', e.target.value)} className="py-2 text-xs" />
                <Input placeholder="Max" type="number" value={rentMax} onChange={(e) => updateParam('rentMax', e.target.value)} className="py-2 text-xs" />
              </div>
            </div>

            {/* Property Types */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-secondary-400 uppercase tracking-wider">Property Type</label>
              <Select
                value={propertyType}
                onChange={(e) => updateParam('propertyType', e.target.value)}
                className="py-2 text-xs"
                options={[{ label: 'Any Property', value: '' }, ...PROPERTY_TYPES]}
              />
            </div>

            {/* Bed Count */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-secondary-400 uppercase tracking-wider">Min Bedrooms</label>
              <Input
                type="number"
                placeholder="e.g. 1, 2"
                value={bedrooms}
                onChange={(e) => updateParam('bedrooms', e.target.value)}
                className="py-2 text-xs"
              />
            </div>

            {/* Furnishing */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-secondary-400 uppercase tracking-wider">Furnishing</label>
              <Select
                value={furnishing}
                onChange={(e) => updateParam('furnishing', e.target.value)}
                className="py-2 text-xs"
                options={[{ label: 'Any Furnishing', value: '' }, ...FURNISHING_TYPES]}
              />
            </div>

            {/* Amenities Checkbox options */}
            <div className="space-y-2 pt-2 border-t border-secondary-100 dark:border-secondary-900">
              <label className="text-[10px] font-bold text-secondary-400 uppercase tracking-wider">Key Amenities</label>
              <div className="space-y-2">
                {AMENITIES_LIST.map(({ key, label }) => (
                  <label key={key} className="flex items-center text-xs text-secondary-650 dark:text-secondary-400 select-none font-bold cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedAmenities[key]}
                      onChange={() => toggleAmenity(key)}
                      className="mr-2 rounded border-secondary-200 text-primary-600 focus:ring-primary-500"
                    />
                    {label}
                  </label>
                ))}
              </div>
            </div>

            {/* Verified Only */}
            <div className="pt-2 border-t border-secondary-100 dark:border-secondary-900">
              <label className="flex items-center text-xs text-secondary-650 dark:text-secondary-400 select-none font-extrabold cursor-pointer">
                <input
                  type="checkbox"
                  checked={verified === 'true'}
                  onChange={(e) => updateParam('verified', e.target.checked ? 'true' : '')}
                  className="mr-2 rounded border-secondary-200 text-primary-600 focus:ring-primary-500"
                />
                Show Verified Listings Only
              </label>
            </div>
          </Card>
        </div>

        {/* 4. Listing Grid Columns */}
        <div className="lg:col-span-3 space-y-6">
          {isLoading ? (
            // Shimmer Loading Skeletons
            <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 gap-6' : 'space-y-4'}>
              {[...Array(4)].map((_, i) => (
                <Card key={i} className="animate-pulse border-secondary-150 overflow-hidden">
                  <div className="bg-secondary-200 dark:bg-secondary-800 h-48 w-full" />
                  <div className="p-4 space-y-3">
                    <div className="h-4 bg-secondary-250 dark:bg-secondary-800 rounded w-2/3" />
                    <div className="h-3 bg-secondary-200 dark:bg-secondary-800 rounded w-1/3" />
                    <div className="flex justify-between pt-2">
                      <div className="h-4 bg-secondary-200 dark:bg-secondary-800 rounded w-1/4" />
                      <div className="h-4 bg-secondary-200 dark:bg-secondary-800 rounded w-1/5" />
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : error ? (
            // Error state banner
            <Alert variant="error" className="py-6 font-bold">
              Failed to load properties. Please check your network connection or reload filters.
            </Alert>
          ) : data?.properties?.length === 0 ? (
            // Empty state helper
            <Card className="py-16 text-center space-y-4 max-w-md mx-auto border-secondary-200/50">
              <div className="p-4 bg-secondary-100 dark:bg-secondary-900 rounded-full w-fit mx-auto">
                <X className="h-8 w-8 text-secondary-400" />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-secondary-900 dark:text-white">No stays found</h3>
                <p className="text-xs text-secondary-450 dark:text-secondary-400 mt-1 max-w-[280px] mx-auto">
                  Try widening your price range boundaries or selecting fewer specific amenities.
                </p>
              </div>
              <Button onClick={handleResetFilters} variant="primary" size="sm" className="font-bold">
                Reset Search Filters
              </Button>
            </Card>
          ) : (
            // List Feed View
            <div className="space-y-6">
              <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 gap-6' : 'space-y-4'}>
                {data.properties.map((prop) => {
                  const primaryImg = prop.images?.find((img) => img.isPrimary)?.url || prop.images?.[0]?.url || 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=600&q=80';
                  
                  return (
                    <Link to={`/properties/${prop._id || prop.id}`} key={prop._id || prop.id}>
                      <Card className={`group hover:shadow-lg hover:border-primary-150 transition-all overflow-hidden border-secondary-200/50 flex ${viewMode === 'list' ? 'flex-col md:flex-row' : 'flex-col'}`}>
                        {/* Image Header with tags */}
                        <div className={`relative bg-secondary-100 ${viewMode === 'list' ? 'w-full md:w-56 h-48 md:h-full min-h-[160px]' : 'h-48'}`}>
                          <img src={primaryImg} alt={prop.title} className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-350" loading="lazy" />
                          
                          {/* Saved Wishlist Heart trigger */}
                          <button
                            onClick={(e) => handleToggleWishlist(prop._id || prop.id, e)}
                            className="absolute top-3 right-3 p-2 bg-white/95 dark:bg-secondary-950/80 rounded-full hover:bg-white text-secondary-600 hover:text-error-550 transition-colors shadow-sm"
                          >
                            <Heart className={`h-4 w-4 ${prop.statistics?.favorites > 0 ? 'fill-error-500 text-error-500' : ''}`} />
                          </button>

                          {/* Verification verification badge */}
                          {prop.verification === 'verified' && (
                            <span className="absolute bottom-3 left-3 flex items-center bg-white/95 dark:bg-secondary-950/90 text-success-650 text-[9px] font-black px-2.5 py-1 rounded-full shadow-sm border border-success-100/50">
                              <ShieldCheck className="h-3 w-3 mr-1 text-success-500" />
                              VERIFIED
                            </span>
                          )}
                        </div>

                        {/* Card metadata body */}
                        <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                          <div>
                            <div className="flex justify-between items-start">
                              <span className="text-[9px] font-black tracking-wider uppercase text-primary-600">{prop.propertyType?.replace('_', ' ')} • {prop.listingType}</span>
                              <span className="text-sm font-black text-secondary-900 dark:text-white">₹{prop.pricing?.monthlyRent?.toLocaleString()}<span className="text-[10px] font-normal text-secondary-400">/mo</span></span>
                            </div>

                            <h3 className="font-extrabold text-sm text-secondary-800 dark:text-white mt-1 group-hover:text-primary-600 transition-colors leading-tight line-clamp-1">
                              {prop.title}
                            </h3>

                            <p className="text-[10px] text-secondary-450 flex items-center mt-2 font-semibold">
                              <MapPin className="h-3.5 w-3.5 text-secondary-400 mr-1 shrink-0" />
                              {prop.location?.area}, {prop.location?.city}
                            </p>
                          </div>

                          <div className="flex items-center justify-between border-t border-secondary-100 dark:border-secondary-900 pt-3 text-[10px] font-bold text-secondary-500">
                            <div className="flex items-center space-x-3">
                              <span className="flex items-center"><Bed className="h-3.5 w-3.5 mr-1 text-secondary-450" /> {prop.roomDetails?.bedrooms} BHK</span>
                              <span className="flex items-center"><Bath className="h-3.5 w-3.5 mr-1 text-secondary-450" /> {prop.roomDetails?.bathrooms} Bath</span>
                            </div>
                            <span className="capitalize">{prop.roomDetails?.furnishing?.replace('_', ' ')}</span>
                          </div>
                        </div>
                      </Card>
                    </Link>
                  );
                })}
              </div>

              {/* 5. Pagination row */}
              {data.pagination && data.pagination.pages > 1 && (
                <div className="flex justify-center items-center space-x-3 pt-6 border-t border-secondary-150/50">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page === 1 || isFetching}
                    onClick={() => handlePageChange(page - 1)}
                    className="p-2"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-xs font-bold text-secondary-500">
                    Page {page} of {data.pagination.pages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page === data.pagination.pages || isFetching}
                    onClick={() => handlePageChange(page + 1)}
                    className="p-2"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 6. Mobile Slide-over Filter Drawer (Section 13) */}
      {showFiltersMobile && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div className="fixed inset-0 bg-black/45 backdrop-blur-xs" onClick={() => setShowFiltersMobile(false)} />
          <div className="relative ml-auto w-full max-w-sm bg-white dark:bg-secondary-950 h-full flex flex-col justify-between p-6 shadow-2xl animate-slide-in-right overflow-y-auto">
            <div className="space-y-6">
              <div className="flex justify-between items-center border-b pb-3">
                <span className="font-extrabold text-sm text-secondary-900">Filters</span>
                <button onClick={() => setShowFiltersMobile(false)} className="text-secondary-400 hover:text-secondary-600">
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Duplicate Sidebar items */}
              <div className="space-y-4">
                <Input label="Target City" value={city} onChange={(e) => updateParam('city', e.target.value)} />
                
                <div className="space-y-1">
                  <label className="text-xs font-bold text-secondary-500">Rent Range</label>
                  <div className="grid grid-cols-2 gap-2">
                    <Input placeholder="Min" type="number" value={rentMin} onChange={(e) => updateParam('rentMin', e.target.value)} />
                    <Input placeholder="Max" type="number" value={rentMax} onChange={(e) => updateParam('rentMax', e.target.value)} />
                  </div>
                </div>

                <Select
                  label="Property Type"
                  value={propertyType}
                  onChange={(e) => updateParam('propertyType', e.target.value)}
                  options={[{ label: 'Any Property', value: '' }, ...PROPERTY_TYPES]}
                />

                <Input label="Min Bedrooms" type="number" value={bedrooms} onChange={(e) => updateParam('bedrooms', e.target.value)} />
                
                <Select
                  label="Furnishing"
                  value={furnishing}
                  onChange={(e) => updateParam('furnishing', e.target.value)}
                  options={[{ label: 'Any Furnishing', value: '' }, ...FURNISHING_TYPES]}
                />
              </div>
            </div>

            <div className="pt-6 border-t mt-6 flex gap-3">
              <Button variant="outline" className="w-full font-bold" onClick={handleResetFilters}>Reset</Button>
              <Button variant="primary" className="w-full font-bold" onClick={() => setShowFiltersMobile(false)}>Apply</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Marketplace;
