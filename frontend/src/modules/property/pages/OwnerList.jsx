import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  Grid, List, Search, SlidersHorizontal, Plus, MoreVertical,
  Eye, Heart, Calendar, CalendarRange, Clock, Settings2,
  Trash2, Archive, RefreshCw, Copy, CheckCircle, FileEdit,
  X, AlertTriangle, CloudLightning, ShieldAlert, BadgeInfo
} from 'lucide-react';

import { useProperties } from '../hooks/useProperties.js';
import { usePropertyContext } from '../context/PropertyContext.jsx';
import { PROPERTY_STATUS, PROPERTY_TYPES, LISTING_TYPES } from '../constants/propertyConstants.js';

import Card from '../../../components/ui/Card.jsx';
import Button from '../../../components/ui/Button.jsx';
import Input from '../../../components/ui/Input.jsx';
import Select from '../../../components/ui/Select.jsx';
import Badge from '../../../components/ui/Badge.jsx';
import Skeleton from '../../../components/ui/Skeleton.jsx';
import Drawer from '../../../components/ui/Drawer.jsx';
import Tabs from '../../../components/ui/Tabs.jsx';

import { PropertyStatusBadge } from '../components/index.jsx';

export const OwnerList = () => {
  const navigate = useNavigate();
  const {
    properties,
    stats,
    filters,
    setFilters,
    viewMode,
    toggleViewMode,
    selectedProperties,
    setSelectedProperties,
    toggleSelect,
    selectAll,
    isLoading,
    bulkOperating,
    fetchProperties,
    duplicateProperty,
    discardDraft,
    restoreProperty,
    bulkArchive,
    bulkRestore,
    bulkDelete,
    bulkSubmit
  } = useProperties();

  const {
    drawerOpen,
    setDrawerOpen,
    drawerProperty,
    setDrawerProperty,
    timelineLogs,
    fetchPropertyTimeline,
    updateAvailability
  } = usePropertyContext();

  const [activeTab, setActiveTab] = useState('overview');
  const [availabilityStatus, setAvailabilityStatus] = useState('available');
  const [minStay, setMinStay] = useState(1);
  const [maxStay, setMaxStay] = useState(12);

  // Load properties on mount
  useEffect(() => {
    fetchProperties();
  }, [fetchProperties]);

  // Sync drawer availability states when property loads
  useEffect(() => {
    if (drawerProperty) {
      setAvailabilityStatus(drawerProperty.availability?.availabilityStatus || 'available');
      setMinStay(drawerProperty.availability?.minimumStay || 1);
      setMaxStay(drawerProperty.availability?.maximumStay || 12);
    }
  }, [drawerProperty]);

  // Handle row selection click
  const handleSelectAllChange = (e) => {
    selectAll(e.target.checked);
  };

  const handleSearchChange = (e) => {
    setFilters(prev => ({ ...prev, searchQuery: e.target.value }));
  };

  const handleFilterChange = (key, val) => {
    setFilters(prev => ({ ...prev, [key]: val }));
  };

  // Duplicate Listing
  const handleDuplicate = async (id) => {
    try {
      await duplicateProperty(id);
      toast.success('Listing duplicated successfully as draft.');
    } catch (err) {
      toast.error('Failed to duplicate listing.');
    }
  };

  // Discard draft or soft delete listing
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to move this listing to soft deleted?')) {
      try {
        await discardDraft(id);
        toast.success('Listing moved to soft deleted.');
      } catch (err) {
        toast.error('Failed to delete listing.');
      }
    }
  };

  // Restore listing
  const handleRestore = async (id) => {
    try {
      await restoreProperty(id);
      toast.success('Listing restored successfully as draft.');
    } catch (err) {
      toast.error('Failed to restore listing.');
    }
  };

  // Trigger detailed drawer slide-in
  const openPropertyDrawer = async (property) => {
    setDrawerProperty(property);
    setDrawerOpen(true);
    setActiveTab('overview');
    if (property._id) {
      await fetchPropertyTimeline(property._id);
    }
  };

  // Update Availability details from drawer tab
  const handleSaveAvailability = async () => {
    if (!drawerProperty?._id) return;
    try {
      await updateAvailability(drawerProperty._id, {
        availabilityStatus,
        minimumStay: minStay,
        maximumStay: maxStay
      });
      toast.success('Availability parameters updated.');
    } catch (err) {
      toast.error('Failed to save availability.');
    }
  };

  return (
    <div className="space-y-8 pb-32">
      {/* 1. Header Row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-secondary-900 dark:text-white leading-tight">My Properties</h1>
          <p className="text-sm text-secondary-400 font-medium mt-1">Manage and track your flat listings.</p>
        </div>
        <Button variant="primary" onClick={() => navigate('/owner/properties/create')}>
          <Plus className="h-4.5 w-4.5 mr-2" /> Add Property
        </Button>
      </div>

      {/* 2. KPI Cards Row */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { label: 'Total Listings', val: stats.total, color: 'border-secondary-200' },
          { label: 'Published / Active', val: stats.published, color: 'border-success-200' },
          { label: 'Drafts', val: stats.drafts, color: 'border-secondary-200' },
          { label: 'In Review', val: stats.inReview, color: 'border-warning-200' },
          { label: 'Total Views', val: stats.views, color: 'border-primary-200' }
        ].map((card, idx) => (
          <Card key={idx} className={`p-5 border-l-4 ${card.color} rounded-[18px]`}>
            <span className="text-xs font-bold text-secondary-400 uppercase tracking-wider block">{card.label}</span>
            <span className="text-2xl font-black text-secondary-900 dark:text-white mt-2 block">{card.val}</span>
          </Card>
        ))}
      </div>

      {/* 3. Search & Filter Action Bar */}
      <Card className="p-4 rounded-2xl border border-secondary-200/50 dark:border-secondary-900 flex flex-col items-center gap-4">
        {/* Search */}
        <div className="relative w-full max-w-[450px] sm:max-w-[596px]">
          <input
            type="text"
            placeholder="Search by title, city, or area..."
            value={filters.searchQuery || ''}
            onChange={handleSearchChange}
            className="w-full text-xs font-bold pl-5 pr-11 py-2 bg-secondary-50/50 hover:bg-secondary-100 dark:bg-secondary-950 dark:hover:bg-secondary-900 border border-secondary-200/60 dark:border-secondary-900 rounded-full focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 text-secondary-800 dark:text-secondary-100 placeholder-secondary-450 transition-all duration-200 h-[36px]"
          />
          <div className="absolute right-1 top-[4px] h-[28px] w-[28px] rounded-full bg-primary-500 flex items-center justify-center">
            <Search className="h-3.5 w-3.5 text-secondary-900 stroke-[3]" />
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center justify-center gap-3 w-full">
          <div className="w-[140px]">
            <Select
              value={filters.status || ''}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="h-[36px] text-[11px] py-0"
            >
              <option value="">All Statuses</option>
              {Object.entries(PROPERTY_STATUS).map(([key, val]) => (
                <option key={key} value={val}>{key.replace('_', ' ')}</option>
              ))}
            </Select>
          </div>

          <div className="w-[140px]">
            <Select
              value={filters.propertyType || ''}
              onChange={(e) => handleFilterChange('propertyType', e.target.value)}
              className="h-[36px] text-[11px] py-0"
            >
              <option value="">All Types</option>
              {Object.entries(PROPERTY_TYPES).map(([key, val]) => (
                <option key={key} value={val}>{key.replace('_', ' ')}</option>
              ))}
            </Select>
          </div>

          <div className="w-[140px]">
            <Select
              value={filters.sortBy || 'newest'}
              onChange={(e) => handleFilterChange('sortBy', e.target.value)}
              className="h-[36px] text-[11px] py-0"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="highest_rent">Highest Price</option>
              <option value="lowest_rent">Lowest Price</option>
              <option value="most_viewed">Most Viewed</option>
              <option value="most_favorited">Most Saves</option>
              <option value="recently_updated">Recently Updated</option>
            </Select>
          </div>

          {/* View Toggle */}
          <div className="w-[140px] flex border border-secondary-200 dark:border-secondary-800 rounded-xl overflow-hidden h-[36px] items-center shrink-0">
            <button
              onClick={() => toggleViewMode()}
              className={`w-1/2 h-full transition-colors flex items-center justify-center ${viewMode === 'grid' ? 'bg-secondary-100 dark:bg-secondary-900 text-primary-600' : 'bg-transparent text-secondary-400'}`}
              title="Grid View"
            >
              <Grid className="h-4 w-4" />
            </button>
            <button
              onClick={() => toggleViewMode()}
              className={`w-1/2 h-full transition-colors flex items-center justify-center ${viewMode === 'table' ? 'bg-secondary-100 dark:bg-secondary-900 text-primary-600' : 'bg-transparent text-secondary-400'}`}
              title="List View"
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>
      </Card>

      {/* 4. Listings Layout view */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {Array(4).fill(0).map((_, idx) => (
            <Card key={idx} className="p-0 overflow-hidden">
              <Skeleton className="aspect-[4/3] w-full" />
              <div className="p-5 space-y-3">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3.5 w-1/2" />
                <Skeleton className="h-5 w-1/3 mt-3" />
              </div>
            </Card>
          ))}
        </div>
      ) : properties.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-secondary-200 dark:border-secondary-800 rounded-3xl space-y-4">
          <div className="p-4 bg-secondary-50 dark:bg-secondary-950 rounded-2xl w-fit mx-auto text-secondary-400">
            <BadgeInfo className="h-8 w-8" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-secondary-800 dark:text-secondary-200">No properties found</h3>
            <p className="text-sm text-secondary-400 mt-1">Try resetting filters or draft a new flat listing.</p>
          </div>
        </div>
      ) : viewMode === 'grid' ? (
        /* GRID VIEW */
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {properties.map((property) => (
            <Card
              key={property._id}
              onClick={() => openPropertyDrawer(property)}
              className="overflow-hidden border border-secondary-200/50 dark:border-secondary-900 rounded-[18px] hover:-translate-y-0.5 hover:shadow-premium-md transition-all duration-200 cursor-pointer p-0 group"
            >
              <div className="aspect-[4/3] w-full bg-secondary-100 dark:bg-secondary-900 relative">
                {property.images && property.images[0] ? (
                  <img src={property.images[0].url} alt={property.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-secondary-450">No Cover Photo</div>
                )}
                <div className="absolute top-3 left-3">
                  <input
                    type="checkbox"
                    checked={selectedProperties.includes(property._id)}
                    onChange={(e) => {
                      e.stopPropagation();
                      toggleSelect(property._id);
                    }}
                    className="rounded border-secondary-300 text-primary-600 focus:ring-primary-500 h-5 w-5 bg-white shadow"
                  />
                </div>
                <div className="absolute top-3 right-3">
                  <PropertyStatusBadge status={property.status} />
                </div>
              </div>
              
              <div className="p-5 space-y-3">
                <div>
                  <h4 className="text-base font-bold text-secondary-900 dark:text-white line-clamp-1 group-hover:text-primary-600 transition-colors">
                    {property.title || property.basicInfo?.title}
                  </h4>
                  <p className="text-xs text-secondary-400 font-semibold mt-0.5 line-clamp-1">
                    {property.location?.area}, {property.location?.city}
                  </p>
                </div>

                <div className="flex justify-between items-center pt-2 border-t border-secondary-100 dark:border-secondary-900">
                  <span className="text-sm font-black text-primary-600">
                    ₹{property.pricing?.monthlyRent}/mo
                  </span>
                  <div className="flex space-x-2 text-[10px] font-bold text-secondary-400">
                    <span className="flex items-center"><Eye className="h-3 w-3 mr-1" /> {property.statistics?.views || 0}</span>
                    <span className="flex items-center"><Heart className="h-3 w-3 mr-1" /> {property.statistics?.favorites || 0}</span>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        /* TABLE VIEW */
        <Card className="overflow-hidden border border-secondary-200/50 dark:border-secondary-900 rounded-[18px] p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-secondary-50/50 dark:bg-secondary-900/30 border-b border-secondary-200 dark:border-secondary-800 text-xs font-bold text-secondary-400 uppercase tracking-wider">
                  <th className="py-4 px-5 w-12">
                    <input
                      type="checkbox"
                      checked={selectedProperties.length === properties.length && properties.length > 0}
                      onChange={handleSelectAllChange}
                      className="rounded border-secondary-300 text-primary-600 focus:ring-primary-500 h-5 w-5 bg-white"
                    />
                  </th>
                  <th className="py-4 px-5">Title</th>
                  <th className="py-4 px-5">Location</th>
                  <th className="py-4 px-5">Price</th>
                  <th className="py-4 px-5">Status</th>
                  <th className="py-4 px-5">Stats</th>
                  <th className="py-4 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-secondary-200/40 dark:divide-secondary-900">
                {properties.map((property) => (
                  <tr
                    key={property._id}
                    onClick={() => openPropertyDrawer(property)}
                    className="hover:bg-secondary-50/30 dark:hover:bg-secondary-900/10 cursor-pointer text-sm"
                  >
                    <td className="py-4 px-5" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={selectedProperties.includes(property._id)}
                        onChange={() => toggleSelect(property._id)}
                        className="rounded border-secondary-300 text-primary-600 focus:ring-primary-500 h-5 w-5 bg-white"
                      />
                    </td>
                    <td className="py-4 px-5">
                      <div className="flex items-center space-x-3">
                        <div className="h-10 w-10 rounded-xl bg-secondary-100 dark:bg-secondary-800 overflow-hidden shrink-0">
                          {property.images && property.images[0] ? (
                            <img src={property.images[0].url} alt="" className="h-full w-full object-cover" />
                          ) : null}
                        </div>
                        <span className="font-bold text-secondary-900 dark:text-white line-clamp-1">{property.title || property.basicInfo?.title}</span>
                      </div>
                    </td>
                    <td className="py-4 px-5 text-secondary-400 font-semibold">
                      {property.location?.area}, {property.location?.city}
                    </td>
                    <td className="py-4 px-5 font-extrabold text-primary-650">₹{property.pricing?.monthlyRent}</td>
                    <td className="py-4 px-5"><PropertyStatusBadge status={property.status} /></td>
                    <td className="py-4 px-5 text-xs text-secondary-400 font-semibold space-x-3">
                      <span>{property.statistics?.views || 0} views</span>
                      <span>{property.statistics?.favorites || 0} saves</span>
                    </td>
                    <td className="py-4 px-5 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex justify-end space-x-2">
                        <Button size="xs" variant="ghost" onClick={() => navigate(`/owner/properties/${property._id}/edit`)}>
                          <FileEdit className="h-3.5 w-3.5" />
                        </Button>
                        <Button size="xs" variant="ghost" onClick={() => handleDuplicate(property._id)}>
                          <Copy className="h-3.5 w-3.5" />
                        </Button>
                        {property.status === 'soft_deleted' ? (
                          <Button size="xs" variant="ghost" onClick={() => handleRestore(property._id)}>
                            <RefreshCw className="h-3.5 w-3.5" />
                          </Button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleDelete(property._id)}
                            className="p-1 text-secondary-400 hover:text-error-600 transition-colors"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* 5. Floating Bulk Action Bar (at bottom) */}
      {selectedProperties.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 px-6 py-4 rounded-3xl bg-secondary-900 text-white shadow-premium-lg border border-secondary-800 z-50 flex items-center justify-between gap-6 min-w-[500px]">
          <span className="text-xs font-bold text-secondary-300">{selectedProperties.length} items selected</span>
          <div className="flex space-x-2">
            <Button size="xs" variant="outline" className="border-secondary-750 text-white hover:bg-secondary-800" onClick={() => bulkArchive(selectedProperties)}>
              Archive
            </Button>
            <Button size="xs" variant="outline" className="border-secondary-750 text-white hover:bg-secondary-800" onClick={() => bulkRestore(selectedProperties)}>
              Restore
            </Button>
            <Button size="xs" variant="primary" className="bg-primary-600" onClick={() => bulkSubmit(selectedProperties)}>
              Submit for Review
            </Button>
            <button
              onClick={() => bulkDelete(selectedProperties)}
              className="p-2 rounded-xl bg-error-600 text-white hover:bg-error-750 transition-colors"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* 6. Property Detail Slide-In Side Drawer */}
      <Drawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title={drawerProperty?.title || 'Listing Details'}
        placement="right"
        size="md"
      >
        {drawerProperty && (
          <div className="space-y-6">
            {/* Tabs */}
            <div className="flex border-b border-secondary-200/40">
              {['overview', 'availability', 'timeline'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 text-xs font-bold uppercase tracking-wider border-b-2 transition-colors ${
                    activeTab === tab
                      ? 'border-primary-600 text-primary-600'
                      : 'border-transparent text-secondary-400 hover:text-secondary-600'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Tab content */}
            {activeTab === 'overview' && (
              <div className="space-y-5">
                {/* Images */}
                <div className="aspect-[4/3] rounded-2xl bg-secondary-100 overflow-hidden">
                  {drawerProperty.images?.[0] ? (
                    <img src={drawerProperty.images[0].url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-secondary-400">No photos</div>
                  )}
                </div>

                <div className="flex justify-between items-center">
                  <h4 className="text-lg font-black text-secondary-900 dark:text-white">{drawerProperty.title}</h4>
                  <PropertyStatusBadge status={drawerProperty.status} />
                </div>

                {drawerProperty.status === 'published' && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full text-xs font-bold py-2 border-secondary-200"
                    onClick={() => {
                      setDrawerOpen(false);
                      navigate(`/properties/${drawerProperty._id || drawerProperty.id}`);
                    }}
                  >
                    <Eye className="h-4 w-4 mr-2 text-primary-500" /> View Public Listing
                  </Button>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <Card className="p-4">
                    <span className="text-[10px] font-bold text-secondary-400 block uppercase">Monthly Rent</span>
                    <span className="text-lg font-extrabold text-primary-600">₹{drawerProperty.pricing?.monthlyRent}/mo</span>
                  </Card>
                  <Card className="p-4">
                    <span className="text-[10px] font-bold text-secondary-400 block uppercase">Views & Saves</span>
                    <span className="text-base font-extrabold text-secondary-700 dark:text-white">
                      👁️ {drawerProperty.statistics?.views || 0} • ❤️ {drawerProperty.statistics?.favorites || 0}
                    </span>
                  </Card>
                </div>

                <div className="space-y-1">
                  <span className="text-xs font-bold text-secondary-400 uppercase tracking-wider block">Description</span>
                  <p className="text-xs text-secondary-600 dark:text-secondary-400 leading-relaxed italic">"{drawerProperty.description}"</p>
                </div>
              </div>
            )}

            {/* Availability */}
            {activeTab === 'availability' && (
              <div className="space-y-6">
                <div className="space-y-4">
                  <Select
                    label="Availability Status"
                    value={availabilityStatus}
                    onChange={(e) => setAvailabilityStatus(e.target.value)}
                  >
                    <option value="available">Available / Renting</option>
                    <option value="unavailable">Unavailable / Hidden</option>
                    <option value="occupied">Occupied</option>
                    <option value="reserved">Reserved</option>
                  </Select>

                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      type="number"
                      label="Minimum Stay (Months)"
                      value={minStay}
                      onChange={(e) => setMinStay(Number(e.target.value))}
                    />
                    <Input
                      type="number"
                      label="Maximum Stay (Months)"
                      value={maxStay}
                      onChange={(e) => setMaxStay(Number(e.target.value))}
                    />
                  </div>
                  
                  <Button variant="primary" onClick={handleSaveAvailability} className="w-full">
                    Save Changes
                  </Button>
                </div>
              </div>
            )}

            {/* Timeline */}
            {activeTab === 'timeline' && (
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-secondary-500 uppercase tracking-wider">Activity History</h4>
                <div className="relative border-l-2 border-secondary-200 dark:border-secondary-800 pl-4 ml-2 space-y-5">
                  {timelineLogs.map((log, idx) => (
                    <div key={log.id || idx} className="relative">
                      <div className="absolute -left-6.5 top-1.5 h-3.5 w-3.5 rounded-full border-2 border-primary-500 bg-white" />
                      <div className="space-y-1 text-xs">
                        <span className="font-extrabold text-secondary-800 dark:text-secondary-200 capitalize">{log.action.replace('property:', '').replace(':', ' ')}</span>
                        <div className="flex space-x-2 text-[10px] text-secondary-405">
                          <span>By {log.user?.name || 'Owner'}</span>
                          <span>•</span>
                          <span>{new Date(log.timestamp).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                  {timelineLogs.length === 0 && (
                    <div className="text-xs text-secondary-400 italic">No history logs parsed yet.</div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </Drawer>
    </div>
  );
};

export default OwnerList;
