import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import propertyService from '@/services/propertyService';
import PropertyCard from './components/PropertyCard';
import { UnifiedSearch } from '@/components/dashboard/index';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Badge from '@/components/ui/Badge';
import { 
  Search, SlidersHorizontal, Grid, List, MapPin, Bed, Bath, ShieldCheck, 
  Sparkles, Check, X, ChevronLeft, ChevronRight, Heart, Home, GraduationCap, Building2, Flame,
  Compass, Map as MapIcon
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useLocation } from '@/modules/location/context/LocationContext';
import { GoogleMap, RadiusSelector } from '@/modules/location/components/MapComponents';

const AMENITIES_LIST = [
  { key: 'wifi', label: 'WiFi' },
  { key: 'ac', label: 'AC' },
  { key: 'parking', label: 'Parking' },
  { key: 'powerBackup', label: 'Power Backup' },
  { key: 'kitchen', label: 'Kitchen' },
  { key: 'foodIncluded', label: 'Food Included' }
];

const PROPERTY_TYPES = [
  { label: 'Apartment', value: 'apartment', desc: 'Private flats & condos' },
  { label: 'Flat', value: 'flat', desc: 'Shared flat rooms' },
  { label: 'PG / Co-Living', value: 'pg', desc: 'Meals & wifi included' },
  { label: 'Villa', value: 'villa', desc: 'Independent villa stays' },
  { label: 'Studio', value: 'studio', desc: 'Cozy single studios' }
];

const POPULAR_CITIES = [
  { name: 'Noida', count: '148 stays', query: 'Noida', img: 'https://images.unsplash.com/photo-1595658658481-d53d3f999875?auto=format&fit=crop&w=300&q=80' },
  { name: 'Delhi', count: '210 stays', query: 'Delhi', img: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=300&q=80' },
  { name: 'Pune', count: '92 stays', query: 'Pune', img: 'https://images.unsplash.com/photo-1585543805890-6051f7829f98?auto=format&fit=crop&w=300&q=80' },
  { name: 'Mumbai', count: '115 stays', query: 'Mumbai', img: 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?auto=format&fit=crop&w=300&q=80' }
];

const Properties = () => {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [viewMode, setViewMode] = useState('grid');
  const [showFiltersMobile, setShowFiltersMobile] = useState(false);
  const [searchVal, setSearchVal] = useState(searchParams.get('search') || '');

  // Parse filters
  const page = parseInt(searchParams.get('page')) || 1;
  const city = searchParams.get('city') || '';
  const propertyType = searchParams.get('propertyType') || '';
  const rentMin = searchParams.get('rentMin') || '';
  const rentMax = searchParams.get('rentMax') || '';
  const bedrooms = searchParams.get('bedrooms') || '';
  const furnishing = searchParams.get('furnishing') || '';
  const verified = searchParams.get('verified') || '';
  const sort = searchParams.get('sort') || 'newest';

  const selectedAmenities = {};
  AMENITIES_LIST.forEach(({ key }) => {
    selectedAmenities[key] = searchParams.get(key) === 'true';
  });

  const queryParams = {
    page,
    limit: 12,
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

  const [data, setData] = useState({ properties: [], pagination: {} });
  const [allProperties, setAllProperties] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Maps and geolocators states
  const { getCurrentBrowserLocation } = useLocation();
  const [selectedMarkerId, setSelectedMarkerId] = useState(null);
  const [radiusFilter, setRadiusFilter] = useState(searchParams.get('radius') ? Number(searchParams.get('radius')) : null);
  const [mapCenter, setMapCenter] = useState({
    lat: searchParams.get('lat') ? Number(searchParams.get('lat')) : 28.6282,
    lng: searchParams.get('lng') ? Number(searchParams.get('lng')) : 77.3789
  });

  const handleUseMyLocation = async () => {
    const coords = await getCurrentBrowserLocation();
    if (coords) {
      setMapCenter(coords);
      const current = Object.fromEntries(searchParams);
      current.lat = coords.lat.toString();
      current.lng = coords.lng.toString();
      setSearchParams(current, { replace: true });
    }
  };

  const handleRadiusChange = (val) => {
    setRadiusFilter(val);
    const current = Object.fromEntries(searchParams);
    if (val) {
      current.radius = val.toString();
      current.lat = (current.lat || mapCenter.lat).toString();
      current.lng = (current.lng || mapCenter.lng).toString();
    } else {
      delete current.radius;
      delete current.lat;
      delete current.lng;
    }
    current.page = '1';
    setSearchParams(current, { replace: true });
  };

  const fetchProperties = async () => {
    setIsLoading(true);
    try {
      const res = await propertyService.getProperties(queryParams);
      setData({
        properties: res.data || [],
        pagination: res.pagination || {}
      });
      
      // Also fetch a wider list for discovery rows categorization
      const allRes = await propertyService.getProperties({ limit: 40 });
      setAllProperties(allRes?.data || []);
      
      setError(null);
    } catch (err) {
      setError(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, [
    page, city, propertyType, rentMin, rentMax, bedrooms, furnishing, verified, sort, 
    searchParams.get('search'), searchParams.get('lat'), searchParams.get('lng'), searchParams.get('radius')
  ]);

  // Auto-scroll to search results when filters are applied
  useEffect(() => {
    if (hasSearchOrFilter) {
      setTimeout(() => {
        const element = document.getElementById('search-results-section');
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    }
  }, [
    city, propertyType, rentMin, rentMax, bedrooms, furnishing, verified, sort, 
    searchParams.get('search'), searchParams.get('lat'), searchParams.get('lng'), searchParams.get('radius')
  ]);

  useEffect(() => {
    if (showFiltersMobile) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [showFiltersMobile]);

  useEffect(() => {
    const handler = setTimeout(() => {
      const current = Object.fromEntries(searchParams);
      if (searchVal) {
        current.search = searchVal;
      } else {
        delete current.search;
      }
      current.page = '1';
      setSearchParams(current, { replace: true });
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
    current.page = '1';
    setSearchParams(current, { replace: true });
  };

  const toggleAmenity = (key) => {
    const current = Object.fromEntries(searchParams);
    if (current[key] === 'true') {
      delete current[key];
    } else {
      current[key] = 'true';
    }
    current.page = '1';
    setSearchParams(current, { replace: true });
  };

  const handleResetFilters = () => {
    setSearchParams({}, { replace: true });
    setSearchVal('');
  };

  const handlePageChange = (newPage) => {
    const current = Object.fromEntries(searchParams);
    current.page = newPage.toString();
    setSearchParams(current, { replace: true });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Categorize listings for discovery carousels
  const featuredStays = allProperties.filter(p => p.verification === 'verified').slice(0, 4);
  const budgetStays = allProperties.filter(p => (p.pricing?.monthlyRent || p.price) <= 8000).slice(0, 4);
  const premiumStays = allProperties.filter(p => (p.pricing?.monthlyRent || p.price) >= 15000).slice(0, 4);
  const trendingStays = allProperties.slice(0, 4); // fallbacks

  const hasSearchOrFilter = queryParams.search || city || propertyType || rentMin || rentMax || bedrooms || furnishing || verified || Object.values(selectedAmenities).some(Boolean);

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 space-y-12">
      
      {/* 1. Hero Search Section */}
      <div className="relative rounded-[20px] overflow-hidden bg-gradient-to-r from-primary-100 to-primary-50/50 dark:from-secondary-900 dark:to-secondary-950/80 text-secondary-900 dark:text-white p-8 md:p-12 border border-secondary-200 dark:border-secondary-800 shadow-premium-md">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#C6B2B7_1.2px,transparent_1.2px)] dark:bg-[radial-gradient(#ffffff_1.2px,transparent_1.2px)] [background-size:16px_16px]" />
        <div className="max-w-2xl space-y-4 relative z-10">
          <Badge className="bg-primary-500 text-secondary-900 font-extrabold uppercase text-[10px] tracking-widest px-3 py-1 border-none shadow-sm">
            ⚡ Platform Launching
          </Badge>
          <h1 className="text-3xl md:text-4xl font-black tracking-tight leading-tight text-secondary-900 dark:text-white">
            Find Your Next Perfect Stay, <br />Hassle-Free.
          </h1>
          <p className="text-xs md:text-sm text-secondary-650 dark:text-secondary-300 font-medium">
            Search verified co-living spaces, rooms, and shared apartments near top universities and tech hubs.
          </p>

          <div className="pt-2 max-w-xl text-secondary-900">
            <UnifiedSearch
              placeholder="Enter landmark, street, area, or listing name..."
              value={searchVal}
              onChange={(e) => setSearchVal(e.target.value)}
              buttonText="Filter"
            />
          </div>
          
          <div className="flex flex-wrap items-center gap-2 pt-1 text-[10px] font-bold text-secondary-500 dark:text-secondary-400">
            <span>Trending locations:</span>
            {['Noida Sector 62', 'Katraj Pune', 'North Campus Delhi'].map((loc) => (
              <button
                key={loc}
                onClick={() => setSearchVal(loc)}
                className="bg-white dark:bg-secondary-900 hover:bg-secondary-100 dark:hover:bg-secondary-800 px-2.5 py-1 rounded-full transition-all border border-secondary-200 dark:border-secondary-800 text-secondary-700 dark:text-secondary-300 hover:scale-102 active:scale-98"
              >
                {loc}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 2. Popular Cities Row */}
      <div className="space-y-4">
        <div>
          <h3 className="text-base font-extrabold text-secondary-900 dark:text-white flex items-center">
            <MapPin className="h-4.5 w-4.5 text-primary-500 mr-2" /> Explore Popular Cities
          </h3>
          <p className="text-xs text-secondary-450 dark:text-secondary-400 mt-1 font-semibold">Stays and flat shares in top hubs.</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {POPULAR_CITIES.map((c) => (
            <button
              key={c.name}
              onClick={() => updateParam('city', c.query)}
              className="group relative h-28 rounded-[20px] overflow-hidden text-left border border-secondary-200/50 dark:border-secondary-800 shadow-premium-sm hover:shadow-premium-md hover:-translate-y-0.5 transition-all duration-355 select-none"
            >
              <img src={c.img} alt={c.name} className="absolute inset-0 h-full w-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent" />
              <div className="absolute bottom-4 left-4 z-10">
                <span className="text-sm font-black text-white">{c.name}</span>
                <span className="text-[10px] text-secondary-300 font-bold block mt-0.5">{c.count}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* 3. Browse by Property Type */}
      <div className="space-y-4">
        <div>
          <h3 className="text-base font-extrabold text-secondary-900 dark:text-white flex items-center">
            <Home className="h-4.5 w-4.5 text-primary-500 mr-2" /> Browse by Property Type
          </h3>
          <p className="text-xs text-secondary-450 dark:text-secondary-400 mt-1 font-semibold">Select the rental layout that matches your choice.</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
          {PROPERTY_TYPES.map((t) => {
            const isSelected = propertyType === t.value;
            return (
              <button
                key={t.value}
                onClick={() => updateParam('propertyType', t.value)}
                className={`p-4 rounded-[14px] text-center border transition-all duration-200 shadow-premium-sm hover:shadow-premium-md hover:-translate-y-0.5 ${
                  isSelected 
                    ? 'bg-primary-100/60 dark:bg-primary-950/20 border-primary-500 text-secondary-900 dark:text-white font-black' 
                    : 'bg-white dark:bg-secondary-900 border-secondary-200 dark:border-secondary-800 text-secondary-700 dark:text-secondary-300 hover:border-primary-400 dark:hover:border-primary-500'
                }`}
              >
                <span className="text-xs font-black block capitalize">{t.label}</span>
                <span className="text-[9px] text-secondary-400 dark:text-secondary-500 block mt-1 font-bold">{t.desc}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Conditional Discovery Rows vs Search Catalog list */}
      {!hasSearchOrFilter ? (
        <div className="space-y-12">
          
          {/* Featured Stays */}
          {featuredStays.length > 0 && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-base font-extrabold text-secondary-850 dark:text-secondary-100 flex items-center">
                    <ShieldCheck className="h-4.5 w-4.5 text-success-500 mr-2" /> Featured Verified Stays
                  </h3>
                  <p className="text-xs text-secondary-400 mt-1">Listings audited and verified by the StayMate compliance team.</p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 justify-items-center">
                {featuredStays.map(p => <PropertyCard key={p._id || p.id} property={p} />)}
              </div>
            </div>
          )}

          {/* Budget Friendly */}
          {budgetStays.length > 0 && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-base font-extrabold text-secondary-850 dark:text-secondary-100 flex items-center">
                    <GraduationCap className="h-4.5 w-4.5 text-primary-500 mr-2" /> Budget-Friendly Student PGs
                  </h3>
                  <p className="text-xs text-secondary-400 mt-1">Affordable rental stays listed under ₹8,000 per month.</p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 justify-items-center">
                {budgetStays.map(p => <PropertyCard key={p._id || p.id} property={p} />)}
              </div>
            </div>
          )}

          {/* Trending This Week */}
          {trendingStays.length > 0 && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-base font-extrabold text-secondary-850 dark:text-secondary-100 flex items-center">
                    <Flame className="h-4.5 w-4.5 text-primary-500 mr-2" /> Trending Stays This Week
                  </h3>
                  <p className="text-xs text-secondary-400 mt-1">Properties gathering the highest view count traffic.</p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 justify-items-center">
                {trendingStays.map(p => <PropertyCard key={p._id || p.id} property={p} />)}
              </div>
            </div>
          )}

          {/* Premium Properties */}
          {premiumStays.length > 0 && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-base font-extrabold text-secondary-850 dark:text-secondary-100 flex items-center">
                    <Building2 className="h-4.5 w-4.5 text-primary-500 mr-2" /> Premium Independent Properties
                  </h3>
                  <p className="text-xs text-secondary-400 mt-1">Luxurious flats and villas featuring premium furnishings.</p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 justify-items-center">
                {premiumStays.map(p => <PropertyCard key={p._id || p.id} property={p} />)}
              </div>
            </div>
          )}

        </div>
      ) : (
        /* Search results feed */
        <div id="search-results-section" className="space-y-6">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center border-b border-secondary-200/60 dark:border-secondary-900 pb-3 gap-3">
            <div>
              <span className="text-sm font-black text-secondary-900 dark:text-white">
                Search Results ({data.properties?.length || 0})
              </span>
              <button onClick={handleResetFilters} className="text-xs text-primary-600 hover:text-primary-500 font-bold ml-3 underline">
                Clear all filters
              </button>
            </div>

            <div className="flex items-center space-x-2 w-full md:w-auto overflow-x-auto scrollbar-none py-0.5 justify-between md:justify-end shrink-0">
              <div className="bg-secondary-100/80 dark:bg-secondary-900/50 p-1 rounded-[14px] flex items-center space-x-1 shadow-inner shrink-0 h-[48px]">
                <button onClick={() => setViewMode('grid')} className={`p-2 rounded-[10px] transition-all flex items-center space-x-1.5 h-full ${viewMode === 'grid' ? 'bg-white dark:bg-secondary-950 text-primary-650 shadow-sm' : 'text-secondary-500 hover:text-secondary-700'}`}>
                  <Grid className="h-4.5 w-4.5 stroke-[2.2]" />
                  <span className="text-[10px] font-black uppercase tracking-wider hidden sm:inline">Grid</span>
                </button>
                <button onClick={() => setViewMode('list')} className={`p-2 rounded-[10px] transition-all flex items-center space-x-1.5 h-full ${viewMode === 'list' ? 'bg-white dark:bg-secondary-950 text-primary-650 shadow-sm' : 'text-secondary-500 hover:text-secondary-700'}`}>
                  <List className="h-4.5 w-4.5 stroke-[2.2]" />
                  <span className="text-[10px] font-black uppercase tracking-wider hidden sm:inline">List</span>
                </button>
                <button onClick={() => setViewMode('map')} className={`p-2 rounded-[10px] transition-all flex items-center space-x-1.5 h-full ${viewMode === 'map' ? 'bg-white dark:bg-secondary-950 text-primary-650 shadow-sm animate-pulse' : 'text-secondary-500 hover:text-secondary-700'}`}>
                  <MapIcon className="h-4.5 w-4.5 stroke-[2.2] text-primary-500" />
                  <span className="text-[10px] font-black uppercase tracking-wider hidden sm:inline">Map View</span>
                </button>
              </div>

              <Select
                value={sort}
                onChange={(e) => updateParam('sort', e.target.value)}
                className="text-xs font-bold py-0 h-[48px] bg-secondary-50 dark:bg-secondary-800 rounded-[12px] shrink-0"
                options={[
                  { label: 'Sort: Newest', value: 'newest' },
                  { label: 'Sort: Oldest', value: 'oldest' },
                  { label: 'Price: Low to High', value: 'price_asc' },
                  { label: 'Price: High to Low', value: 'price_desc' },
                ]}
              />

              <Button variant="outline" className="lg:hidden text-xs font-bold shrink-0 py-0 h-[48px]" onClick={() => setShowFiltersMobile(true)}>
                <SlidersHorizontal className="h-4 w-4 mr-1.5" /> Filters
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Filters sidebar */}
            <div className="hidden lg:block lg:col-span-1">
              <Card className="p-5 border-secondary-200/50 space-y-5 sticky top-24">
                <div className="flex justify-between items-center border-b pb-3">
                  <span className="font-extrabold text-sm text-secondary-900">Advanced Filters</span>
                  <button onClick={handleResetFilters} className="text-[10px] font-black text-primary-600 uppercase">Reset</button>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-secondary-400 uppercase">City</label>
                  <Input placeholder="Noida" value={city} onChange={(e) => updateParam('city', e.target.value)} className="py-2 text-xs" />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-secondary-400 uppercase">Rent Bracket</label>
                  <div className="grid grid-cols-2 gap-2">
                    <Input placeholder="Min" type="number" value={rentMin} onChange={(e) => updateParam('rentMin', e.target.value)} className="py-2 text-xs" />
                    <Input placeholder="Max" type="number" value={rentMax} onChange={(e) => updateParam('rentMax', e.target.value)} className="py-2 text-xs" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-secondary-400 uppercase">Property Type</label>
                  <Select
                    value={propertyType}
                    onChange={(e) => updateParam('propertyType', e.target.value)}
                    className="py-2 text-xs"
                    options={[{ label: 'Any Property', value: '' }, ...PROPERTY_TYPES]}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-secondary-400 uppercase">Bedrooms</label>
                  <Input type="number" placeholder="BHK count" value={bedrooms} onChange={(e) => updateParam('bedrooms', e.target.value)} className="py-2 text-xs" />
                </div>

                <div className="space-y-2 pt-2 border-t">
                  <label className="text-[10px] font-bold text-secondary-400 uppercase">Amenities</label>
                  <div className="space-y-2">
                    {AMENITIES_LIST.map(({ key, label }) => (
                      <label key={key} className="flex items-center text-xs text-secondary-650 cursor-pointer font-bold">
                        <input type="checkbox" checked={selectedAmenities[key]} onChange={() => toggleAmenity(key)} className="mr-2 rounded text-primary-650" />
                        {label}
                      </label>
                    ))}
                  </div>
                </div>

                <div className="pt-2 border-t">
                  <label className="flex items-center text-xs text-secondary-650 cursor-pointer font-bold">
                    <input type="checkbox" checked={verified === 'true'} onChange={(e) => updateParam('verified', e.target.checked ? 'true' : '')} className="mr-2 rounded text-primary-650" />
                    Verified Listings Only
                  </label>
                </div>

                <div className="space-y-3 pt-2 border-t font-semibold">
                  <RadiusSelector 
                    selectedRadius={radiusFilter} 
                    onRadiusChange={handleRadiusChange} 
                  />
                  <Button 
                    type="button"
                    onClick={handleUseMyLocation}
                    variant="outline" 
                    size="sm" 
                    className="w-full text-[10px] font-black py-2 justify-center"
                  >
                    <Compass className="h-4 w-4 mr-1.5 text-primary-500 animate-spin-slow" /> Use My Location
                  </Button>
                </div>
              </Card>
            </div>

            {/* Results Grid / Split Map View */}
            <div className={viewMode === 'map' ? 'lg:col-span-3 grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-[650px] h-[75vh]' : 'lg:col-span-3'}>
              {viewMode === 'map' ? (
                <>
                  {/* Left: Scrollable Property Cards List */}
                  <div className="overflow-y-auto pr-2 space-y-4 h-full">
                    {isLoading ? (
                      <div className="space-y-4">
                        {[...Array(3)].map((_, i) => (
                          <Card key={i} className="group flex flex-col h-full bg-white dark:bg-secondary-900 border border-secondary-200/50 dark:border-secondary-800/80 rounded-[20px] overflow-hidden shadow-premium-sm">
                            <div className="aspect-[16/11] w-full bg-secondary-200 dark:bg-secondary-800 animate-pulse" />
                            <div className="p-4 space-y-3">
                              <div className="h-4 w-3/4 bg-secondary-200 dark:bg-secondary-800 rounded animate-pulse" />
                              <div className="h-3 w-1/2 bg-secondary-200 dark:bg-secondary-800 rounded animate-pulse" />
                            </div>
                          </Card>
                        ))}
                      </div>
                    ) : data.properties?.length === 0 ? (
                      <Card className="py-16 text-center space-y-4 border-secondary-200 dark:border-secondary-800 rounded-[20px] bg-white dark:bg-secondary-900 shadow-premium-sm">
                        <div className="p-4 bg-secondary-100 dark:bg-secondary-950 rounded-full w-fit mx-auto text-secondary-500">
                          <Search className="h-6 w-6" />
                        </div>
                        <div className="space-y-1 px-4">
                          <h4 className="font-extrabold text-sm text-secondary-900 dark:text-white">No stays match your radius bounds</h4>
                          <p className="text-xs text-secondary-550 dark:text-secondary-450 mt-1 max-w-[240px] mx-auto leading-relaxed">Try selecting a larger search radius, adjusting filters, or clearing selections.</p>
                        </div>
                        <div className="pt-2">
                          <Button variant="outline" size="sm" onClick={handleResetFilters} className="font-bold text-xs rounded-full px-5 py-2">
                            Reset Filters
                          </Button>
                        </div>
                      </Card>
                    ) : (
                      data.properties.map(p => (
                        <div 
                          key={p._id || p.id}
                          id={`property-card-${p._id || p.id}`}
                          onMouseEnter={() => setSelectedMarkerId(p._id || p.id)}
                          onMouseLeave={() => setSelectedMarkerId(null)}
                          className={`transition-all duration-200 rounded-[20px] ${selectedMarkerId === (p._id || p.id) ? 'ring-2 ring-primary-500 scale-[0.99]' : ''}`}
                        >
                          <PropertyCard property={p} />
                        </div>
                      ))
                    )}
                  </div>
                  {/* Right: Map Container */}
                  <div className="h-full rounded-[24px] overflow-hidden border border-secondary-200/60 dark:border-secondary-900">
                    <GoogleMap 
                      center={mapCenter}
                      zoom={12}
                      properties={data.properties}
                      selectedPropertyId={selectedMarkerId}
                      onMarkerClick={(propId) => {
                        setSelectedMarkerId(propId);
                        const el = document.getElementById(`property-card-${propId}`);
                        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                      }}
                    />
                  </div>
                </>
              ) : (
                /* Regular Grid/List View */
                isLoading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 justify-items-center">
                    {[...Array(4)].map((_, i) => (
                      <Card key={i} className="group flex flex-col h-full bg-white dark:bg-secondary-900 border border-secondary-200/50 dark:border-secondary-800/80 rounded-[20px] overflow-hidden shadow-premium-sm">
                        <div className="aspect-[16/11] w-full bg-secondary-200 dark:bg-secondary-800 animate-pulse" />
                        <div className="p-4 flex-grow space-y-4">
                          <div className="flex justify-between items-center">
                            <div className="h-2.5 w-1/3 bg-secondary-200 dark:bg-secondary-800 rounded animate-pulse" />
                            <div className="h-2.5 w-10 bg-secondary-200 dark:bg-secondary-800 rounded animate-pulse" />
                          </div>
                          <div className="h-4 w-3/4 bg-secondary-200 dark:bg-secondary-800 rounded animate-pulse" />
                          <div className="h-3 w-1/2 bg-secondary-200 dark:bg-secondary-800 rounded animate-pulse" />
                          <div className="h-8 w-full bg-secondary-200 dark:bg-secondary-800 rounded-[14px] animate-pulse" />
                        </div>
                      </Card>
                    ))}
                  </div>
                ) : data.properties?.length === 0 ? (
                  <Card className="py-16 text-center space-y-4 max-w-md mx-auto border-secondary-200 dark:border-secondary-800 rounded-[20px] bg-white dark:bg-secondary-900 shadow-premium-sm">
                    <div className="p-4 bg-secondary-100 dark:bg-secondary-950 rounded-full w-fit mx-auto text-secondary-500">
                      <Search className="h-6 w-6" />
                    </div>
                    <div className="space-y-1 px-4">
                      <h4 className="font-extrabold text-sm text-secondary-900 dark:text-white">No properties match your filter</h4>
                      <p className="text-xs text-secondary-500 dark:text-secondary-450 mt-1 max-w-[280px] mx-auto leading-relaxed">
                        We couldn't find any stays matching your filters. Try widening your search radius, adjusting your rent budget, or resetting your filter options.
                      </p>
                    </div>
                    <div className="pt-2">
                      <Button variant="outline" size="sm" onClick={handleResetFilters} className="font-bold text-xs rounded-full px-5 py-2">
                        Reset Filters
                      </Button>
                    </div>
                  </Card>
                ) : (
                  <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 gap-6 justify-items-center' : 'space-y-4'}>
                    {data.properties.map(p => (
                      <PropertyCard key={p._id || p.id} property={p} />
                    ))}
                  </div>
                )
              )}
            </div>

              {/* Pagination controls */}
              {data.pagination && data.pagination.pages > 1 && (
                <div className="flex justify-center items-center space-x-3 pt-8 border-t border-secondary-100 mt-8">
                  <Button variant="outline" size="sm" disabled={page === 1} onClick={() => handlePageChange(page - 1)} className="p-2">
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-xs font-bold text-secondary-500">Page {page} of {data.pagination.pages}</span>
                  <Button variant="outline" size="sm" disabled={page === data.pagination.pages} onClick={() => handlePageChange(page + 1)} className="p-2">
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}

      {/* Mobile Filters drawer rendered at root level via React Portal */}
      {showFiltersMobile && createPortal(
        <div className="fixed inset-0 z-[100] lg:hidden flex justify-end">
          <div className="fixed inset-0 bg-black/45 backdrop-blur-xs" onClick={() => setShowFiltersMobile(false)} />
          <div className="relative w-full sm:max-w-sm bg-white dark:bg-secondary-900 border-l border-secondary-200 dark:border-secondary-800 text-secondary-900 dark:text-secondary-100 h-full flex flex-col justify-between shadow-2xl overflow-hidden">
            
            {/* Header: Fixed */}
            <div className="flex justify-between items-center border-b border-secondary-100 dark:border-secondary-800 p-6 pb-3 shrink-0">
              <span className="font-extrabold text-sm text-secondary-900 dark:text-white">Filters</span>
              <button 
                onClick={() => setShowFiltersMobile(false)} 
                className="text-secondary-500 hover:text-secondary-700 dark:text-secondary-400 dark:hover:text-secondary-200 p-2 -mr-2 rounded-lg transition-colors"
                aria-label="Close filters"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Scrollable Filters Body */}
            <div className="flex-1 overflow-y-auto py-6 px-6 space-y-6 scrollbar-none">
              {/* City */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-secondary-400 dark:text-secondary-500 uppercase">Target City</label>
                <Input placeholder="Noida" value={city} onChange={(e) => updateParam('city', e.target.value)} className="py-2 text-xs" />
              </div>

              {/* Rent Bracket */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-secondary-400 dark:text-secondary-500 uppercase">Rent Bracket</label>
                <div className="grid grid-cols-2 gap-2">
                  <Input placeholder="Min" type="number" value={rentMin} onChange={(e) => updateParam('rentMin', e.target.value)} className="py-2 text-xs" />
                  <Input placeholder="Max" type="number" value={rentMax} onChange={(e) => updateParam('rentMax', e.target.value)} className="py-2 text-xs" />
                </div>
              </div>

              {/* Property Type */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-secondary-400 dark:text-secondary-500 uppercase">Property Type</label>
                <Select
                  value={propertyType}
                  onChange={(e) => updateParam('propertyType', e.target.value)}
                  className="py-2 text-xs"
                  options={[{ label: 'Any Property', value: '' }, ...PROPERTY_TYPES]}
                />
              </div>

              {/* Bedrooms */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-secondary-400 dark:text-secondary-500 uppercase">Bedrooms</label>
                <Input type="number" placeholder="BHK count" value={bedrooms} onChange={(e) => updateParam('bedrooms', e.target.value)} className="py-2 text-xs" />
              </div>

              {/* Amenities */}
              <div className="space-y-2 pt-2 border-t border-secondary-100 dark:border-secondary-800">
                <label className="text-[10px] font-bold text-secondary-400 dark:text-secondary-500 uppercase">Amenities</label>
                <div className="grid grid-cols-2 gap-2">
                  {AMENITIES_LIST.map(({ key, label }) => (
                    <label key={key} className="flex items-center text-xs text-secondary-650 dark:text-secondary-300 cursor-pointer font-bold">
                      <input type="checkbox" checked={selectedAmenities[key]} onChange={() => toggleAmenity(key)} className="mr-2 rounded text-primary-650" />
                      {label}
                    </label>
                  ))}
                </div>
              </div>

              {/* Verified */}
              <div className="pt-2 border-t border-secondary-100 dark:border-secondary-800">
                <label className="flex items-center text-xs text-secondary-650 dark:text-secondary-300 cursor-pointer font-bold">
                  <input type="checkbox" checked={verified === 'true'} onChange={(e) => updateParam('verified', e.target.checked ? 'true' : '')} className="mr-2 rounded text-primary-650" />
                  Verified Listings Only
                </label>
              </div>

              {/* Radius Filter & Location */}
              <div className="space-y-3 pt-2 border-t border-secondary-100 dark:border-secondary-800 font-semibold">
                <RadiusSelector 
                  selectedRadius={radiusFilter} 
                  onRadiusChange={handleRadiusChange} 
                />
                <Button 
                  type="button"
                  onClick={handleUseMyLocation}
                  variant="outline" 
                  size="sm" 
                  className="w-full text-[10px] font-black py-2 justify-center"
                >
                  <Compass className="h-4 w-4 mr-1.5 text-primary-500 animate-spin-slow" /> Use My Location
                </Button>
              </div>
            </div>

            {/* Footer: Fixed buttons */}
            <div className="p-6 pt-4 border-t border-secondary-100 dark:border-secondary-800 shrink-0 flex gap-3">
              <Button variant="outline" className="w-full font-bold py-2" onClick={handleResetFilters}>Reset</Button>
              <Button variant="primary" className="w-full font-bold py-2" onClick={() => setShowFiltersMobile(false)}>Apply</Button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default Properties;
