import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import {
  Search, SlidersHorizontal, Eye, Heart, Calendar,
  CheckCircle2, XCircle, AlertTriangle, Shield, ShieldAlert,
  ArrowRight, ShieldCheck, Clock, Trash2, Archive, RefreshCw,
  FolderOpen, User, BookOpen, ScrollText, CheckSquare, BadgeInfo
} from 'lucide-react';

import { useProperties } from '../hooks/useProperties.js';
import { usePropertyContext } from '../context/PropertyContext.jsx';
import { PROPERTY_STATUS, PROPERTY_TYPES } from '../constants/propertyConstants.js';

import Card from '../../../components/ui/Card.jsx';
import Button from '../../../components/ui/Button.jsx';
import Select from '../../../components/ui/Select.jsx';
import Badge from '../../../components/ui/Badge.jsx';
import Skeleton from '../../../components/ui/Skeleton.jsx';
import Drawer from '../../../components/ui/Drawer.jsx';
import Alert from '../../../components/ui/Alert.jsx';

import { PropertyStatusBadge } from '../components/index.jsx';

export const AdminList = () => {
  const {
    reviewQueue,
    adminStats,
    ownerHistory,
    fetchReviewQueue,
    fetchModerationStats,
    fetchOwnerHistory,
    reviewPropertyListing,
    bulkReviewListings,
    selectedProperties,
    setSelectedProperties,
    toggleSelect,
    selectAll,
    isFetchingQueue,
    bulkOperating
  } = useProperties();

  const {
    drawerOpen,
    setDrawerOpen,
    drawerProperty,
    setDrawerProperty,
    timelineLogs,
    fetchPropertyTimeline
  } = usePropertyContext();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  const [activeTab, setActiveTab] = useState('review');
  const [rejectReason, setRejectReason] = useState('incomplete_info');
  const [modNotes, setModNotes] = useState('');

  // Load moderation data
  useEffect(() => {
    fetchReviewQueue();
    fetchModerationStats();
  }, [fetchReviewQueue, fetchModerationStats]);

  const handleSelectAllChange = (e) => {
    selectAll(e.target.checked, true);
  };

  // Filtered queue calculation
  const filteredQueue = reviewQueue.filter(p => {
    const title = (p.title || p.basicInfo?.title || '').toLowerCase();
    const city = (p.location?.city || '').toLowerCase();
    const query = searchQuery.toLowerCase().trim();

    const matchesSearch = title.includes(query) || city.includes(query);
    const matchesStatus = statusFilter ? p.status === statusFilter : true;
    const matchesType = typeFilter ? p.propertyType === typeFilter : true;

    return matchesSearch && matchesStatus && matchesType;
  });

  // Open moderation review drawer
  const openReviewDrawer = async (property) => {
    setDrawerProperty(property);
    setDrawerOpen(true);
    setActiveTab('review');
    setModNotes('');
    if (property._id) {
      await fetchPropertyTimeline(property._id);
      if (property.ownerId) {
        const ownerId = property.ownerId._id || property.ownerId;
        await fetchOwnerHistory(ownerId);
      }
    }
  };

  // Submit moderation decision
  const handleReviewAction = async (action) => {
    if (!drawerProperty?._id) return;
    if (['reject', 'suspend'].includes(action) && !modNotes.trim()) {
      toast.error('Moderator comments are required for rejection or suspension.');
      return;
    }

    try {
      await reviewPropertyListing(drawerProperty._id, action, {
        reason: rejectReason,
        notes: modNotes
      });
      toast.success(`Listing successfully ${action}ed`);
      setDrawerOpen(false);
    } catch (err) {
      toast.error(err.message || 'Failed to complete review action');
    }
  };

  // Bulk actions handlers
  const handleBulkApprove = async () => {
    if (window.confirm('Are you sure you want to approve all selected listings?')) {
      try {
        await bulkReviewListings(selectedProperties, 'approve');
        toast.success('Approved selected listings successfully');
      } catch (err) {
        toast.error('Bulk approval failed');
      }
    }
  };

  const handleBulkReject = async () => {
    const notes = window.prompt('Enter rejection comments for selected listings (Required):');
    if (notes === null) return;
    if (!notes.trim()) {
      toast.error('Comments are required for bulk rejection.');
      return;
    }

    try {
      await bulkReviewListings(selectedProperties, 'reject', { notes, reason: 'policy_violation' });
      toast.success('Rejected selected listings');
    } catch (err) {
      toast.error('Bulk rejection failed');
    }
  };

  return (
    <div className="space-y-8 pb-32">
      {/* 1. Header Row */}
      <div>
        <h1 className="text-3xl font-black text-secondary-900 dark:text-white leading-tight">Property Moderation</h1>
        <p className="text-sm text-secondary-400 font-medium mt-1">Review, approve, and verify marketplace listings.</p>
      </div>

      {/* 2. Admin KPI stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Pending Review', val: adminStats.pendingReviews, color: 'border-warning-200' },
          { label: 'Published properties', val: adminStats.publishedProperties, color: 'border-success-200' },
          { label: 'Suspended properties', val: adminStats.suspendedProperties, color: 'border-danger-200' },
          { label: 'Approval Rate', val: `${adminStats.approvalRate}%`, color: 'border-primary-200' }
        ].map((card, idx) => (
          <Card key={idx} className={`p-5 border-l-4 ${card.color} rounded-[18px]`}>
            <span className="text-xs font-bold text-secondary-400 uppercase tracking-wider block">{card.label}</span>
            <span className="text-2xl font-black text-secondary-900 dark:text-white mt-2 block">{card.val}</span>
          </Card>
        ))}
      </div>

      {/* 3. Filtering and Searching Toolbar */}
      <Card className="p-4 rounded-2xl border border-secondary-200/50 dark:border-secondary-900 flex flex-col items-center gap-4">
        <div className="relative w-full max-w-[450px]">
          <input
            type="text"
            placeholder="Search by title, city..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs font-bold pl-5 pr-11 py-2 bg-secondary-50/50 hover:bg-secondary-100 dark:bg-secondary-950 dark:hover:bg-secondary-900 border border-secondary-200/60 dark:border-secondary-900 rounded-full focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 text-secondary-800 dark:text-secondary-100 placeholder-secondary-450 transition-all duration-200 h-[36px]"
          />
          <div className="absolute right-1 top-[4px] h-[28px] w-[28px] rounded-full bg-primary-500 flex items-center justify-center">
            <Search className="h-3.5 w-3.5 text-secondary-900 stroke-[3]" />
          </div>
        </div>

        <div className="flex items-center justify-center gap-3">
          <div className="w-[130px]">
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-[32px] text-[11px] py-0"
            >
              <option value="">All Statuses</option>
              <option value="pending_review">Pending Review</option>
              <option value="published">Published / Active</option>
              <option value="suspended">Suspended</option>
              <option value="rejected">Rejected</option>
            </Select>
          </div>

          <div className="w-[130px]">
            <Select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="h-[32px] text-[11px] py-0"
            >
              <option value="">All Types</option>
              {Object.entries(PROPERTY_TYPES).map(([key, val]) => (
                <option key={key} value={val}>{key.replace('_', ' ')}</option>
              ))}
            </Select>
          </div>
        </div>
      </Card>

      {/* 4. Moderation Table */}
      {isFetchingQueue ? (
        <Card className="p-0 overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-secondary-50 dark:bg-secondary-900 border-b border-secondary-200 dark:border-secondary-800 py-3">
                {Array(6).fill(0).map((_, idx) => (
                  <th key={idx} className="p-4"><Skeleton className="h-4 w-20" /></th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Array(4).fill(0).map((_, idx) => (
                <tr key={idx} className="border-b border-secondary-100 dark:border-secondary-900">
                  {Array(6).fill(0).map((_, colIdx) => (
                    <td key={colIdx} className="p-4"><Skeleton className="h-4 w-24" /></td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      ) : filteredQueue.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-secondary-200 dark:border-secondary-800 rounded-3xl space-y-4">
          <div className="p-4 bg-secondary-50 dark:bg-secondary-950 rounded-2xl w-fit mx-auto text-secondary-400">
            <CheckSquare className="h-8 w-8" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-secondary-800 dark:text-secondary-200">Moderation Queue Clear!</h3>
            <p className="text-sm text-secondary-400 mt-1">No listing requests pending moderator approvals.</p>
          </div>
        </div>
      ) : (
        <Card className="overflow-hidden border border-secondary-200/50 dark:border-secondary-900 rounded-[18px] p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-secondary-50/50 dark:bg-secondary-900/30 border-b border-secondary-200 dark:border-secondary-800 text-xs font-bold text-secondary-400 uppercase tracking-wider">
                  <th className="py-4 px-5 w-12">
                    <input
                      type="checkbox"
                      checked={selectedProperties.length === filteredQueue.length && filteredQueue.length > 0}
                      onChange={handleSelectAllChange}
                      className="rounded border-secondary-300 text-primary-600 focus:ring-primary-500 h-5 w-5 bg-white"
                    />
                  </th>
                  <th className="py-4 px-5">Listing Title</th>
                  <th className="py-4 px-5">Landlord Owner</th>
                  <th className="py-4 px-5">Area & City</th>
                  <th className="py-4 px-5">Monthly Rent</th>
                  <th className="py-4 px-5">Status</th>
                  <th className="py-4 px-5 text-right">Review Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-secondary-200/40 dark:divide-secondary-900">
                {filteredQueue.map((property) => (
                  <tr
                    key={property._id}
                    onClick={() => openReviewDrawer(property)}
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
                    <td className="py-4 px-5 text-secondary-500 font-semibold">
                      {property.ownerId?.name || 'Unknown Owner'}
                    </td>
                    <td className="py-4 px-5 text-secondary-400 font-semibold">
                      {property.location?.area}, {property.location?.city}
                    </td>
                    <td className="py-4 px-5 font-extrabold text-primary-650">₹{property.pricing?.monthlyRent}</td>
                    <td className="py-4 px-5"><div className="w-[120px]"><PropertyStatusBadge status={property.status} /></div></td>
                    <td className="py-4 px-5 text-right" onClick={(e) => e.stopPropagation()}>
                      <Button size="xs" variant="primary" className="w-[120px] justify-center" onClick={() => openReviewDrawer(property)}>
                        Review Listing
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* 5. Bulk Moderation Bar (appears when rows are selected) */}
      {selectedProperties.length > 0 && (
        <div className="fixed bottom-6 left-4 right-4 sm:left-1/2 sm:right-auto sm:-translate-x-1/2 px-5 py-3 rounded-2xl bg-secondary-900 text-white shadow-premium-lg border border-secondary-800 z-50 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-6">
          <span className="text-xs font-bold text-secondary-300">{selectedProperties.length} items selected</span>
          <div className="flex gap-2">
            <Button size="xs" variant="outline" className="border-secondary-750 text-white hover:bg-secondary-800 w-[120px] justify-center" onClick={handleBulkApprove}>
              Bulk Approve
            </Button>
            <Button size="xs" variant="primary" className="bg-error-600 hover:bg-error-750 border-none w-[120px] justify-center" onClick={handleBulkReject}>
              Bulk Reject
            </Button>
          </div>
        </div>
      )}

      {/* 6. Admin Property Review Drawer */}
      <Drawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title={drawerProperty?.title || 'Moderation Review Panel'}
        placement="right"
        size="md"
      >
        {drawerProperty && (
          <div className="space-y-6">
            {/* Drawer Tabs */}
            <div className="flex border-b border-secondary-200/40">
              {[
                { id: 'review', label: 'Moderation', icon: Shield },
                { id: 'owner', label: 'Owner History', icon: User },
                { id: 'timeline', label: 'Activity Logs', icon: ScrollText }
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center space-x-2 px-4 py-3.5 text-xs font-bold uppercase tracking-wider border-b-2 transition-colors ${
                      activeTab === tab.id
                        ? 'border-primary-600 text-primary-600'
                        : 'border-transparent text-secondary-400 hover:text-secondary-600'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Moderation Controls Tab */}
            {activeTab === 'review' && (
              <div className="space-y-6">
                {/* Visual Cover Photo */}
                <div className="aspect-[4/3] rounded-2xl bg-secondary-100 overflow-hidden relative border border-secondary-200/50 dark:border-secondary-900">
                  {drawerProperty.images?.[0] ? (
                    <img src={drawerProperty.images[0].url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-secondary-400">No Image</div>
                  )}
                  <div className="absolute top-3 right-3">
                    <PropertyStatusBadge status={drawerProperty.status} />
                  </div>
                </div>

                {/* Details Overview */}
                <div className="space-y-4 bg-secondary-50/50 dark:bg-secondary-950 p-4 border border-secondary-200/40 dark:border-secondary-900 rounded-2xl">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-base font-extrabold text-secondary-900 dark:text-white">{drawerProperty.title}</h4>
                      <span className="text-xs text-secondary-400 font-semibold mt-1 block">
                        {drawerProperty.location?.area}, {drawerProperty.location?.city}
                      </span>
                    </div>
                    <span className="text-base font-black text-primary-650">₹{drawerProperty.pricing?.monthlyRent}/mo</span>
                  </div>
                  
                  <div className="border-t border-secondary-200/40 dark:border-secondary-900 pt-3 flex space-x-4 text-xs font-semibold text-secondary-500">
                    <span>Rooms: {drawerProperty.roomDetails?.bedrooms} BHK</span>
                    <span>•</span>
                    <span>Furnishing: {drawerProperty.roomDetails?.furnishing.replace('_', ' ')}</span>
                  </div>
                </div>

                {/* Reject Option details */}
                <div className="space-y-4 border-t border-secondary-200/40 dark:border-secondary-900 pt-4">
                  <h5 className="text-sm font-bold text-secondary-800 dark:text-secondary-200">Rejection Reason Code (Optional)</h5>
                  <Select value={rejectReason} onChange={(e) => setRejectReason(e.target.value)}>
                    <option value="incomplete_info">Incomplete Information</option>
                    <option value="fake_listing">Fake Listing</option>
                    <option value="poor_images">Poor Images</option>
                    <option value="incorrect_pricing">Incorrect Pricing</option>
                    <option value="policy_violation">Policy Violation</option>
                    <option value="spam">Spam / Scam</option>
                  </Select>

                  <div>
                    <label className="text-xs font-bold text-secondary-500 uppercase tracking-wider block mb-1">Moderator Comments</label>
                    <textarea
                      rows={3}
                      placeholder="Explain why this decision is made..."
                      value={modNotes}
                      onChange={(e) => setModNotes(e.target.value)}
                      className="w-full px-4 py-3 text-xs rounded-xl border border-secondary-200 dark:border-secondary-800 bg-transparent text-secondary-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none"
                    />
                  </div>

                  {/* Actions Grid */}
                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <Button variant="outline" className="border-error-500/20 text-error-600 hover:bg-error-50/10" onClick={() => handleReviewAction('reject')}>
                      Reject Listing
                    </Button>
                    <Button variant="outline" className="border-warning-500/20 text-warning-600 hover:bg-warning-50/10" onClick={() => handleReviewAction('changes_requested')}>
                      Request Changes
                    </Button>
                    <Button variant="outline" className="border-secondary-500/20 text-secondary-600 hover:bg-secondary-50/10 col-span-2" onClick={() => handleReviewAction('suspend')}>
                      Suspend Listing
                    </Button>
                    <Button variant="primary" className="col-span-2 py-3" onClick={() => handleReviewAction('approve')}>
                      Approve & Verify Listing
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Owner History Tab */}
            {activeTab === 'owner' && (
              <div className="space-y-6">
                <div className="p-4 border border-secondary-200/50 dark:border-secondary-900 rounded-2xl bg-secondary-50/50 dark:bg-secondary-950 flex items-center space-x-3">
                  <div className="h-10 w-10 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center font-bold">
                    {drawerProperty.ownerId?.name?.charAt(0) || 'U'}
                  </div>
                  <div>
                    <h5 className="text-sm font-bold text-secondary-900 dark:text-white">{drawerProperty.ownerId?.name || 'Owner Profile'}</h5>
                    <span className="text-xs text-secondary-400 font-semibold">{drawerProperty.ownerId?.email}</span>
                  </div>
                </div>

                {ownerHistory ? (
                  <div className="space-y-4">
                    <h5 className="text-xs font-bold text-secondary-500 uppercase tracking-wider">Owner Account Performance</h5>
                    <div className="grid grid-cols-2 gap-3 text-center">
                      <Card className="p-4">
                        <span className="text-2xl font-black text-secondary-800 dark:text-white">{ownerHistory.totalListings}</span>
                        <span className="text-[10px] font-bold text-secondary-405 block uppercase mt-1">Total listings</span>
                      </Card>
                      <Card className="p-4">
                        <span className="text-2xl font-black text-success-650">{ownerHistory.approvedListings}</span>
                        <span className="text-[10px] font-bold text-secondary-405 block uppercase mt-1">Approved</span>
                      </Card>
                      <Card className="p-4">
                        <span className="text-2xl font-black text-error-600">{ownerHistory.rejectedListings}</span>
                        <span className="text-[10px] font-bold text-secondary-405 block uppercase mt-1">Rejected</span>
                      </Card>
                      <Card className="p-4">
                        <span className="text-2xl font-black text-warning-600">{ownerHistory.suspendedListings}</span>
                        <span className="text-[10px] font-bold text-secondary-405 block uppercase mt-1">Suspended</span>
                      </Card>
                    </div>
                  </div>
                ) : (
                  <Skeleton className="h-24 w-full rounded-2xl" />
                )}
              </div>
            )}

            {/* Timeline logs */}
            {activeTab === 'timeline' && (
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-secondary-500 uppercase tracking-wider">Listing Event Trail</h4>
                <div className="relative border-l-2 border-secondary-200 dark:border-secondary-800 pl-4 ml-2 space-y-5">
                  {timelineLogs.map((log, idx) => (
                    <div key={log.id || idx} className="relative">
                      <div className="absolute -left-6.5 top-1.5 h-3.5 w-3.5 rounded-full border-2 border-primary-500 bg-white" />
                      <div className="space-y-1 text-xs">
                        <span className="font-extrabold text-secondary-800 dark:text-secondary-200 capitalize">{log.action.replace('property:', '').replace(':', ' ')}</span>
                        {log.details?.reason && (
                          <p className="text-[11px] text-secondary-500 font-medium italic mt-0.5">Reason: {log.details.reason}</p>
                        )}
                        <div className="flex space-x-2 text-[10px] text-secondary-405">
                          <span>By {log.user?.name || 'Landlord'}</span>
                          <span>•</span>
                          <span>{new Date(log.timestamp).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                  {timelineLogs.length === 0 && (
                    <div className="text-xs text-secondary-400 italic">No timeline entries recorded.</div>
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

export default AdminList;
