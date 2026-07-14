import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import propertyService from '@/services/propertyService';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Badge from '@/components/ui/Badge';
import Alert from '@/components/ui/Alert';
import Avatar from '@/components/ui/Avatar';
import { 
  MapPin, Bed, Bath, ShieldCheck, Heart, Share2, Calendar, Clock, 
  Map, User, MessageSquare, Phone, Info, Wifi, ParkingCircle, CheckCircle, Flame
} from 'lucide-react';
import toast from 'react-hot-toast';

const PropertyDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeImageIdx, setActiveImageIdx] = useState(0);

  // Visit Request Scheduling States
  const [showVisitModal, setShowVisitModal] = useState(false);
  const [visitDate, setVisitDate] = useState('');
  const [visitTime, setVisitTime] = useState('11:00');
  const [visitNote, setVisitNote] = useState('');
  const [schedulingLoading, setSchedulingLoading] = useState(false);

  // Fetch listing details
  const { data: prop, isLoading, error, refetch } = useQuery({
    queryKey: ['properties', 'detail', id],
    queryFn: () => propertyService.getProperty(id),
    staleTime: 5 * 60 * 1000, // 5 minutes stale details
  });

  const handleToggleWishlist = async () => {
    try {
      const res = await propertyService.toggleWishlist(id);
      toast.success(res.message);
      refetch();
    } catch (err) {
      toast.error('Log in to save property listings.');
    }
  };

  const handleScheduleVisit = async (e) => {
    e.preventDefault();
    if (!visitDate) {
      toast.error('Select a date for your visit request.');
      return;
    }

    setSchedulingLoading(true);
    try {
      await propertyService.requestVisit({
        propertyId: id,
        date: visitDate,
        time: visitTime,
        note: visitNote,
      });
      toast.success('Tour request sent to landlord!');
      setShowVisitModal(false);
      // Refresh to update statistics
      refetch();
    } catch (err) {
      toast.error(err.response?.data?.error?.message || 'Failed to submit tour request.');
    } finally {
      setSchedulingLoading(false);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Listing link copied to clipboard!');
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-12 text-center text-xs text-secondary-400">
        Retrieving listing data...
      </div>
    );
  }

  if (error || !prop) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-6">
        <Alert variant="error" className="font-bold">
          Listing details could not be found. It may have been archived by the owner.
        </Alert>
      </div>
    );
  }

  const imagesList = prop.images || [];
  const primaryImg = imagesList[activeImageIdx]?.url || 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80';

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-6 py-6 space-y-8">
      
      {/* 1. Navigation Breadcrumb & Actions */}
      <div className="flex justify-between items-center">
        <Link to="/marketplace" className="text-xs font-bold text-primary-650 flex items-center hover:underline">
          ← Back to Search feed
        </Link>

        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" className="font-bold text-xs" onClick={handleCopyLink}>
            <Share2 className="h-3.5 w-3.5 mr-1.5" />
            Share
          </Button>
          <Button variant="outline" size="sm" className="font-bold text-xs" onClick={handleToggleWishlist}>
            <Heart className={`h-3.5 w-3.5 mr-1.5 ${prop.statistics?.favorites > 0 ? 'fill-error-500 text-error-500' : ''}`} />
            {prop.statistics?.favorites > 0 ? 'Saved' : 'Wishlist'}
          </Button>
        </div>
      </div>

      {/* 2. Headline Headers */}
      <div>
        <div className="flex flex-wrap gap-2 items-center">
          <Badge variant="primary" className="capitalize px-3 font-extrabold">{prop.propertyType?.replace('_', ' ')}</Badge>
          <Badge variant="secondary" className="capitalize px-3 font-extrabold">{prop.listingType} Listing</Badge>
          {prop.verification === 'verified' && (
            <Badge variant="success" className="px-3 font-black flex items-center shadow-sm">
              <ShieldCheck className="h-3.5 w-3.5 mr-1 text-success-600" />
              VERIFIED
            </Badge>
          )}
        </div>
        <h1 className="text-xl md:text-2xl font-black text-secondary-900 dark:text-white mt-3 leading-tight">{prop.title}</h1>
        <p className="text-xs text-secondary-500 flex items-center mt-2 font-semibold">
          <MapPin className="h-4 w-4 mr-1 text-secondary-400" />
          {prop.location?.street}, {prop.location?.area}, {prop.location?.city}, {prop.location?.state} - {prop.location?.pinCode}
        </p>
      </div>

      {/* 3. Media Gallery Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Main large viewer */}
        <div className="md:col-span-3 h-[300px] md:h-[420px] rounded-[16px] overflow-hidden bg-secondary-100 relative">
          <img src={primaryImg} alt={prop.title} className="w-full h-full object-cover" />
        </div>

        {/* Vertical thumbnail strips */}
        <div className="md:col-span-1 flex md:flex-col gap-3 overflow-x-auto md:overflow-x-visible pb-2 md:pb-0 h-fit">
          {imagesList.map((img, idx) => (
            <button
              key={img.publicId || idx}
              onClick={() => setActiveImageIdx(idx)}
              className={`w-20 md:w-full h-16 md:h-[70px] rounded-[10px] overflow-hidden bg-secondary-50 shrink-0 border-2 transition-all ${idx === activeImageIdx ? 'border-primary-500 scale-98' : 'border-transparent opacity-80'}`}
            >
              <img src={img.url} alt="thumbnail" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      </div>

      {/* 4. Details Description vs Sticky Sidebar Pricing */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* Left Column: Details details */}
        <div className="lg:col-span-2 space-y-8">
          {/* Essential stats */}
          <Card className="p-4 border-secondary-200/50 flex justify-around text-center">
            <div>
              <p className="text-[10px] font-bold text-secondary-400 uppercase">Bedrooms</p>
              <p className="text-sm font-extrabold text-secondary-800 dark:text-white mt-1 flex items-center justify-center">
                <Bed className="h-4 w-4 text-primary-500 mr-1.5" />
                {prop.roomDetails?.bedrooms} BHK
              </p>
            </div>
            <div className="border-r border-secondary-100 dark:border-secondary-900" />
            <div>
              <p className="text-[10px] font-bold text-secondary-400 uppercase">Bathrooms</p>
              <p className="text-sm font-extrabold text-secondary-800 dark:text-white mt-1 flex items-center justify-center">
                <Bath className="h-4 w-4 text-primary-500 mr-1.5" />
                {prop.roomDetails?.bathrooms} Bath
              </p>
            </div>
            <div className="border-r border-secondary-100 dark:border-secondary-900" />
            <div>
              <p className="text-[10px] font-bold text-secondary-400 uppercase">Furnishing</p>
              <p className="text-xs font-extrabold text-secondary-800 dark:text-white mt-2 capitalize">
                {prop.roomDetails?.furnishing?.replace('_', ' ')}
              </p>
            </div>
            <div className="border-r border-secondary-100 dark:border-secondary-900" />
            <div>
              <p className="text-[10px] font-bold text-secondary-400 uppercase">Area Size</p>
              <p className="text-xs font-extrabold text-secondary-800 dark:text-white mt-2">
                {prop.roomDetails?.areaSqFt} sq.ft
              </p>
            </div>
          </Card>

          {/* Description */}
          <div className="space-y-3">
            <h3 className="text-base font-extrabold text-secondary-900 dark:text-white">Listing Description</h3>
            <p className="text-xs text-secondary-650 dark:text-secondary-450 leading-relaxed whitespace-pre-wrap">
              {prop.description}
            </p>
          </div>

          {/* Amenities checklist grid */}
          <div className="space-y-4">
            <h3 className="text-base font-extrabold text-secondary-900 dark:text-white">Amenities Offered</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {Object.entries(prop.amenities || {}).map(([key, val]) => {
                if (!val) return null;
                return (
                  <div key={key} className="flex items-center space-x-2 text-xs font-semibold text-secondary-700 dark:text-secondary-300">
                    <CheckCircle className="h-4 w-4 text-success-550 shrink-0" />
                    <span className="capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* OpenStreetMap Mockup layout (Section 11) */}
          <div className="space-y-4">
            <h3 className="text-base font-extrabold text-secondary-900 dark:text-white">Listing Location map</h3>
            <Card className="h-48 border-secondary-200/50 bg-secondary-50 dark:bg-secondary-900 relative overflow-hidden flex items-center justify-center">
              <div className="absolute inset-0 opacity-40 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:16px_16px] dark:bg-[radial-gradient(#334155_1px,transparent_1px)]" />
              <div className="z-10 text-center space-y-2">
                <Map className="h-8 w-8 text-primary-500 mx-auto stroke-[1.5]" />
                <span className="text-xs font-bold text-secondary-700 dark:text-secondary-300 block">Noida Sector 62 Location Map</span>
                <span className="text-[10px] text-secondary-400 block">Coordinates: {prop.location?.latitude}, {prop.location?.longitude}</span>
              </div>
            </Card>
          </div>
        </div>

        {/* Right Column: Sticky Rent Card & Landlord panel */}
        <div className="lg:col-span-1 space-y-6 lg:sticky lg:top-24">
          <Card className="p-6 border-secondary-200/50 space-y-6">
            <div>
              <span className="text-2xl font-black text-secondary-900 dark:text-white">₹{prop.pricing?.monthlyRent?.toLocaleString()}</span>
              <span className="text-xs text-secondary-450 ml-1">/ month</span>
            </div>

            {/* Financial breakdown details */}
            <div className="space-y-3.5 text-xs border-t border-b border-secondary-100 dark:border-secondary-900 py-4 font-bold text-secondary-600">
              <div className="flex justify-between">
                <span>Security Deposit</span>
                <span className="text-secondary-800 dark:text-secondary-200">₹{prop.pricing?.securityDeposit?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Maintenance Charges</span>
                <span className="text-secondary-800 dark:text-secondary-200">₹{prop.pricing?.maintenanceCharges?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Brokerage Charges</span>
                <span className="text-secondary-800 dark:text-secondary-200">₹{prop.pricing?.brokerage?.toLocaleString()}</span>
              </div>
            </div>

            <div className="space-y-2">
              <Button onClick={() => setShowVisitModal(true)} variant="primary" className="w-full font-bold">
                <Calendar className="h-4 w-4 mr-2" />
                Schedule Site Visit Tour
              </Button>
            </div>
          </Card>

          {/* Owner details card */}
          {prop.ownerId && (
            <Card className="p-5 border-secondary-200/50 space-y-4">
              <div className="flex items-center space-x-3.5">
                <Avatar src={prop.ownerId.avatar} name={prop.ownerId.name} size="sm" />
                <div>
                  <h4 className="text-xs font-extrabold text-secondary-900 dark:text-white">{prop.ownerId.name}</h4>
                  <span className="text-[9px] font-black text-primary-600 tracking-wider uppercase">LISTING OWNER</span>
                </div>
              </div>

              <div className="space-y-2 text-xs font-semibold text-secondary-650">
                <div className="flex items-center">
                  <Phone className="h-4 w-4 text-secondary-400 mr-2 shrink-0" />
                  <span>{prop.ownerId.phone || 'Contact number locked'}</span>
                </div>
                <div className="flex items-center">
                  <User className="h-4 w-4 text-secondary-400 mr-2 shrink-0" />
                  <span>{prop.ownerId.email}</span>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* 5. Schedule Visit Modal (Section 9) */}
      {showVisitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/45 backdrop-blur-xs" onClick={() => setShowVisitModal(false)} />
          <Card className="relative z-10 w-full max-w-md p-6 m-4 space-y-5 animate-fade-in">
            <div className="flex justify-between items-center border-b border-secondary-100 dark:border-secondary-900 pb-3">
              <h3 className="font-extrabold text-sm text-secondary-900 dark:text-white flex items-center">
                <Calendar className="h-4.5 w-4.5 text-primary-500 mr-2" />
                Schedule Property Tour
              </h3>
              <button onClick={() => setShowVisitModal(false)} className="text-secondary-450 hover:text-secondary-650">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleScheduleVisit} className="space-y-4">
              <Input
                type="date"
                label="Choose Tour Date"
                required
                value={visitDate}
                onChange={(e) => setVisitDate(e.target.value)}
              />

              <Input
                type="time"
                label="Choose Tour Time"
                required
                value={visitTime}
                onChange={(e) => setVisitTime(e.target.value)}
              />

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-secondary-400 uppercase tracking-wider">Note to Owner (optional)</label>
                <textarea
                  placeholder="Introduce yourself or write specific requests..."
                  className="w-full text-xs p-3 rounded-lg border border-secondary-200 focus:outline-none focus:ring-1 focus:ring-primary-500"
                  rows={3}
                  value={visitNote}
                  onChange={(e) => setVisitNote(e.target.value)}
                />
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <Button variant="ghost" className="font-bold text-xs" onClick={() => setShowVisitModal(false)}>Cancel</Button>
                <Button type="submit" variant="primary" className="font-bold text-xs" isLoading={schedulingLoading}>Send Tour Request</Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
};

export default PropertyDetails;
