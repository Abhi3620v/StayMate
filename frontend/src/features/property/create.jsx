import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import propertyService from '@/services/propertyService';
import userService from '@/services/userService';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import ProgressBar from '@/components/ui/ProgressBar';
import Alert from '@/components/ui/Alert';
import { 
  Building, MapPin, BadgeIndianRupee, Bed, HelpCircle, Image, CheckCircle2, 
  ChevronLeft, ChevronRight, Upload, X, Star
} from 'lucide-react';
import toast from 'react-hot-toast';
import { PlaceAutocomplete, GoogleMap } from '@/modules/location/components/MapComponents';
import locationService from '@/modules/location/services/locationService';

const STEPS = [
  { label: 'Basic Info', icon: Building },
  { label: 'Location', icon: MapPin },
  { label: 'Pricing', icon: BadgeIndianRupee },
  { label: 'Room Details', icon: Bed },
  { label: 'Amenities', icon: HelpCircle },
  { label: 'Media Uploads', icon: Image },
  { label: 'Review & Publish', icon: CheckCircle2 }
];

const CreateProperty = () => {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [uploadingMedia, setUploadingMedia] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const methods = useForm({
    defaultValues: {
      title: '',
      description: '',
      propertyType: 'apartment',
      listingType: 'rent',
      occupancy: 'single',
      location: {
        country: 'India',
        state: '',
        city: '',
        area: '',
        landmark: '',
        pinCode: '',
        latitude: 28.6139,
        longitude: 77.2090,
      },
      pricing: {
        monthlyRent: 0,
        securityDeposit: 0,
        maintenanceCharges: 0,
        brokerage: 0,
        electricityIncluded: false,
        waterIncluded: false,
        internetIncluded: false,
      },
      roomDetails: {
        bedrooms: 1,
        bathrooms: 1,
        balcony: false,
        floor: 0,
        totalFloors: 0,
        areaSqFt: 0,
        furnishing: 'unfurnished',
      },
      amenities: {
        ac: false,
        wifi: false,
        powerBackup: false,
        parking: false,
        lift: false,
        laundry: false,
        kitchen: false,
        gym: false,
        swimmingPool: false,
        security: false,
        cctv: false,
        housekeeping: false,
        foodIncluded: false,
      },
      images: [],
      status: 'draft',
    },
  });

  const { watch, setValue, trigger, handleSubmit, formState: { isSubmitting } } = methods;
  const images = watch('images') || [];

  const handleSelectAutocompleteAddress = (addressDetails) => {
    setValue('location.street', addressDetails.street || '');
    setValue('location.area', addressDetails.area || '');
    setValue('location.city', addressDetails.city || '');
    setValue('location.state', addressDetails.state || '');
    setValue('location.pinCode', addressDetails.pinCode || '');
    setValue('location.latitude', addressDetails.latitude);
    setValue('location.longitude', addressDetails.longitude);
    setValue('location.googlePlaceId', addressDetails.placeId);
  };

  const handleMarkerDragEnd = async (coords) => {
    setValue('location.latitude', coords.lat);
    setValue('location.longitude', coords.lng);
    try {
      const res = await locationService.reverseGeocode(coords.lat, coords.lng);
      if (res && res.success) {
        const details = res.data;
        setValue('location.street', details.street || watch('location.street'));
        setValue('location.area', details.area || watch('location.area'));
        setValue('location.city', details.city || watch('location.city'));
        setValue('location.state', details.state || watch('location.state'));
        setValue('location.pinCode', details.pinCode || watch('location.pinCode'));
      }
    } catch (err) {
      console.warn('Reverse geocoding failed on drag end:', err.message);
    }
  };

  const handleMediaUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setUploadingMedia(true);
    setUploadProgress(10);

    try {
      const interval = setInterval(() => {
        setUploadProgress((prev) => (prev >= 90 ? 90 : prev + 15));
      }, 150);

      const uploadedImages = [...images];
      for (const file of files) {
        const formData = new FormData();
        formData.append('image', file);
        
        const data = await userService.uploadProfilePicture(formData);
        
        uploadedImages.push({
          publicId: `upload_${Date.now()}`,
          url: data.avatar,
          isPrimary: uploadedImages.length === 0,
        });
      }

      clearInterval(interval);
      setUploadProgress(100);
      setValue('images', uploadedImages);
      toast.success('Photos uploaded successfully!');
    } catch (err) {
      toast.error('Image uploads failed. Verify sizes are below 5MB.');
    } finally {
      setTimeout(() => {
        setUploadingMedia(false);
        setUploadProgress(0);
      }, 400);
    }
  };

  const handleRemoveImage = (idx) => {
    const updated = [...images];
    updated.splice(idx, 1);
    if (updated.length > 0 && !updated.some(img => img.isPrimary)) {
      updated[0].isPrimary = true;
    }
    setValue('images', updated);
  };

  const handleSetPrimary = (idx) => {
    const updated = images.map((img, i) => ({ ...img, isPrimary: i === idx }));
    setValue('images', updated);
  };

  const handleNextStep = async () => {
    let fieldsToValidate = [];
    if (activeStep === 0) fieldsToValidate = ['title', 'description', 'propertyType', 'listingType'];
    else if (activeStep === 1) fieldsToValidate = ['location.state', 'location.city', 'location.area', 'location.pinCode'];
    else if (activeStep === 2) fieldsToValidate = ['pricing.monthlyRent'];
    else if (activeStep === 3) fieldsToValidate = ['roomDetails.bedrooms', 'roomDetails.bathrooms'];
    else if (activeStep === 5) fieldsToValidate = ['images'];

    const isValid = fieldsToValidate.length > 0 ? await trigger(fieldsToValidate) : true;
    if (isValid) {
      setActiveStep((prev) => prev + 1);
    } else {
      toast.error('Please complete all mandatory fields correctly.');
    }
  };

  const handlePrevStep = () => {
    setActiveStep((prev) => prev - 1);
  };

  const onSaveDraft = async () => {
    const data = methods.getValues();
    data.status = 'draft';
    try {
      await propertyService.createProperty(data);
      toast.success('Listing saved in drafts successfully.');
      navigate('/properties');
    } catch (err) {
      toast.error('Draft save failed.');
    }
  };

  const onSubmitListing = async (data) => {
    data.status = 'published';
    try {
      await propertyService.createProperty(data);
      toast.success('Listing published successfully!');
      navigate('/properties');
    } catch (err) {
      toast.error(err.response?.data?.error?.message || 'Publishing failed.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 md:px-6 py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-secondary-900 dark:text-white">List Your Property</h1>
          <p className="text-xs text-secondary-450 dark:text-secondary-400 mt-1">Complete the steps below to post a rental stay on StayMate.</p>
        </div>
        <Button onClick={onSaveDraft} variant="outline" size="sm" className="font-bold text-xs">
          Save Draft
        </Button>
      </div>

      <div className="flex justify-between items-center bg-secondary-50 dark:bg-secondary-900/50 p-4 rounded-[16px] overflow-x-auto gap-3">
        {STEPS.map((step, idx) => {
          const Icon = step.icon;
          const isActive = idx === activeStep;
          const isCompleted = idx < activeStep;
          return (
            <div key={step.label} className="flex items-center space-x-2 shrink-0">
              <div className={`p-2 rounded-full text-xs font-bold transition-all ${isActive ? 'bg-primary-500 text-white scale-102' : isCompleted ? 'bg-success-100 text-success-700' : 'bg-secondary-200 text-secondary-555'}`}>
                <Icon className="h-4.5 w-4.5 stroke-[1.8]" />
              </div>
              <span className={`text-[10px] font-bold ${isActive ? 'text-primary-650' : 'text-secondary-450'}`}>{step.label}</span>
              {idx < STEPS.length - 1 && <span className="text-secondary-300">→</span>}
            </div>
          );
        })}
      </div>

      <Card className="p-6 border-secondary-200/50 space-y-6">
        <FormProvider {...methods}>
          <form onSubmit={handleSubmit(onSubmitListing)} className="space-y-6">
            
            {activeStep === 0 && (
              <div className="space-y-4">
                <Input label="Listing Title" placeholder="e.g. Spacious 2 BHK Apartment in Sector 62 Noida" required {...methods.register('title')} />
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Select
                    label="Property Type"
                    options={[
                      { label: 'Apartment', value: 'apartment' },
                      { label: 'Flat', value: 'flat' },
                      { label: 'PG / Co-living', value: 'pg' },
                      { label: 'Hostel Room', value: 'hostel' },
                      { label: 'Independent Villa', value: 'villa' },
                      { label: 'Studio Room', value: 'studio' },
                    ]}
                    {...methods.register('propertyType')}
                  />

                  <Select
                    label="Listing Type"
                    options={[
                      { label: 'Rent', value: 'rent' },
                      { label: 'Lease', value: 'lease' },
                      { label: 'Shared Flat', value: 'shared' },
                    ]}
                    {...methods.register('listingType')}
                  />

                  <Select
                    label="Occupancy Scope"
                    options={[
                      { label: 'Single Occupancy', value: 'single' },
                      { label: 'Double Occupancy', value: 'double' },
                      { label: 'Triple Occupancy', value: 'triple' },
                      { label: 'Four Sharing', value: 'four_sharing' },
                    ]}
                    {...methods.register('occupancy')}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-secondary-400 uppercase tracking-wider">Detailed Description</label>
                  <textarea
                    placeholder="Describe amenities, roommates preferences, public metro connectivity, and other details..."
                    className="w-full text-xs p-3 rounded-lg border border-secondary-200 focus:outline-none focus:ring-1 focus:ring-primary-500 w-full"
                    rows={5}
                    {...methods.register('description')}
                  />
                </div>
              </div>
            )}

            {activeStep === 1 && (
              <div className="space-y-4 font-bold text-secondary-650 text-xs">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-secondary-400 uppercase tracking-wider block">Search Location Address (Google Autocomplete)</label>
                  <PlaceAutocomplete onSelectAddress={handleSelectAutocompleteAddress} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input label="Street Name / Building number" placeholder="e.g. Sector 62 Road B" required {...methods.register('location.street')} />
                  <Input label="Area / Locality" placeholder="e.g. Sector 62" required {...methods.register('location.area')} />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Input label="City" placeholder="Noida" required {...methods.register('location.city')} />
                  <Input label="State" placeholder="Uttar Pradesh" required {...methods.register('location.state')} />
                  <Input label="PIN Code" placeholder="201301" required {...methods.register('location.pinCode')} />
                </div>

                <Input label="Landmark (Optional)" placeholder="e.g. Near Metro Station Noida" {...methods.register('location.landmark')} />

                <div className="space-y-1.5 pt-2">
                  <label className="text-[10px] font-bold text-secondary-400 uppercase tracking-wider block">Fine-tune Exact Marker Position (Drag Marker)</label>
                  <div className="h-64 rounded-2xl overflow-hidden border border-secondary-200">
                    <GoogleMap 
                      center={{ 
                        lat: watch('location.latitude') || 28.6282, 
                        lng: watch('location.longitude') || 77.3789 
                      }}
                      zoom={14}
                      draggableMarker={true}
                      onMarkerDragEnd={handleMarkerDragEnd}
                    />
                  </div>
                </div>
              </div>
            )}

            {activeStep === 2 && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input label="Monthly Rent (₹)" type="number" required {...methods.register('pricing.monthlyRent', { valueAsNumber: true })} />
                  <Input label="Security Deposit (₹)" type="number" {...methods.register('pricing.securityDeposit', { valueAsNumber: true })} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input label="Maintenance Charges (₹/mo)" type="number" {...methods.register('pricing.maintenanceCharges', { valueAsNumber: true })} />
                  <Input label="Brokerage Fees (₹)" type="number" {...methods.register('pricing.brokerage', { valueAsNumber: true })} />
                </div>

                <div className="border-t border-secondary-100 dark:border-secondary-900 pt-4 space-y-3">
                  <label className="text-[10px] font-bold text-secondary-400 uppercase tracking-wider block">Bills Inclusion</label>
                  <div className="flex flex-wrap gap-4">
                    <label className="flex items-center text-xs font-bold text-secondary-650 cursor-pointer">
                      <input type="checkbox" className="mr-2 rounded border-secondary-200 text-primary-600 focus:ring-primary-500" {...methods.register('pricing.electricityIncluded')} />
                      Electricity Bill Included
                    </label>
                    <label className="flex items-center text-xs font-bold text-secondary-650 cursor-pointer">
                      <input type="checkbox" className="mr-2 rounded border-secondary-200 text-primary-600 focus:ring-primary-500" {...methods.register('pricing.waterIncluded')} />
                      Water Bill Included
                    </label>
                    <label className="flex items-center text-xs font-bold text-secondary-650 cursor-pointer">
                      <input type="checkbox" className="mr-2 rounded border-secondary-200 text-primary-600 focus:ring-primary-500" {...methods.register('pricing.internetIncluded')} />
                      Internet Included
                    </label>
                  </div>
                </div>
              </div>
            )}

            {activeStep === 3 && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input label="Bedrooms Count (BHK)" type="number" required {...methods.register('roomDetails.bedrooms', { valueAsNumber: true })} />
                  <Input label="Bathrooms Count" type="number" required {...methods.register('roomDetails.bathrooms', { valueAsNumber: true })} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Select
                    label="Furnishing Status"
                    options={[
                      { label: 'Unfurnished', value: 'unfurnished' },
                      { label: 'Semi-Furnished', value: 'semi_furnished' },
                      { label: 'Fully-Furnished', value: 'fully_furnished' },
                    ]}
                    {...methods.register('roomDetails.furnishing')}
                  />
                  <Input label="Floor Number" type="number" {...methods.register('roomDetails.floor', { valueAsNumber: true })} />
                  <Input label="Listing Area Size (sq.ft)" type="number" {...methods.register('roomDetails.areaSqFt', { valueAsNumber: true })} />
                </div>

                <div className="pt-2">
                  <label className="flex items-center text-xs font-bold text-secondary-650 cursor-pointer">
                    <input type="checkbox" className="mr-2 rounded border-secondary-200 text-primary-600" {...methods.register('roomDetails.balcony')} />
                    Listing features active balcony decks
                  </label>
                </div>
              </div>
            )}

            {activeStep === 4 && (
              <div className="space-y-4">
                <div className="border-b border-secondary-100 dark:border-secondary-900 pb-2">
                  <label className="text-[10px] font-bold text-secondary-400 uppercase tracking-wider">Select Available Amenities</label>
                </div>
                
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-2">
                  {['ac', 'wifi', 'powerBackup', 'parking', 'lift', 'laundry', 'kitchen', 'gym', 'swimmingPool', 'security', 'cctv', 'housekeeping', 'foodIncluded'].map((amenity) => (
                    <label key={amenity} className="flex items-center text-xs font-bold text-secondary-650 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        className="mr-2 rounded border-secondary-200 text-primary-600 focus:ring-primary-500"
                        {...methods.register(`amenities.${amenity}`)}
                      />
                      <span className="capitalize">{amenity.replace(/([A-Z])/g, ' $1')}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {activeStep === 5 && (
              <div className="space-y-6">
                <div>
                  <label className="text-[10px] font-bold text-secondary-400 uppercase tracking-wider">Upload Property Images</label>
                  <p className="text-[10px] text-secondary-450 mt-1">Please upload at least 1 primary cover photo. Max file size: 5MB.</p>
                </div>

                <div className="border-2 border-dashed border-secondary-200 dark:border-secondary-900 rounded-[16px] p-8 text-center bg-secondary-50/50 hover:bg-secondary-50 transition-colors relative">
                  <Upload className="h-8 w-8 text-secondary-400 mx-auto stroke-[1.5]" />
                  <span className="text-xs font-bold text-secondary-700 block mt-2.5">Drag and drop images, or browse files</span>
                  <input type="file" multiple onChange={handleMediaUpload} className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" disabled={uploadingMedia} />
                </div>

                {uploadingMedia && (
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-secondary-400">Uploading photos: {uploadProgress}%</span>
                    <ProgressBar value={uploadProgress} className="h-1.5" barClassName="bg-primary-500" />
                  </div>
                )}

                {images.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {images.map((img, idx) => (
                      <div key={img.publicId || idx} className="relative group rounded-[12px] overflow-hidden border border-secondary-200 h-28 bg-secondary-100">
                        <img src={img.url} alt="preview" className="w-full h-full object-cover" />
                        
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(idx)}
                          className="absolute top-2 right-2 p-1.5 bg-black/60 hover:bg-black/85 rounded-full text-white transition-colors"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleSetPrimary(idx)}
                          className={`absolute bottom-2 left-2 p-1.5 rounded-full transition-colors ${img.isPrimary ? 'bg-primary-500 text-white' : 'bg-black/60 text-secondary-300 hover:text-white'}`}
                          title="Set as Primary cover"
                        >
                          <Star className="h-3 w-3 fill-current" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeStep === 6 && (
              <div className="space-y-6">
                <div className="border-b border-secondary-100 dark:border-secondary-900 pb-2">
                  <h4 className="text-xs font-bold text-secondary-800 dark:text-secondary-200">Review Listing Summary</h4>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-semibold text-secondary-650">
                  <div>
                    <span className="text-[9px] text-secondary-400 uppercase block">Title</span>
                    <span className="text-secondary-850 dark:text-white font-extrabold">{watch('title') || 'None'}</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-secondary-400 uppercase block">Monthly Rent</span>
                    <span className="text-secondary-850 dark:text-white font-extrabold">₹{watch('pricing.monthlyRent')?.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-secondary-400 uppercase block">Location</span>
                    <span>{watch('location.area')}, {watch('location.city')}</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-secondary-400 uppercase block">Rooms specs</span>
                    <span>{watch('roomDetails.bedrooms')} BHK • {watch('roomDetails.bathrooms')} Bath</span>
                  </div>
                </div>

                <Alert variant="info" className="py-3 leading-relaxed font-bold">
                  Your listing will undergo verification review before gaining a public verified badge tag.
                </Alert>
              </div>
            )}

            <div className="pt-6 border-t border-secondary-100 dark:border-secondary-900 flex justify-between">
              {activeStep > 0 ? (
                <Button type="button" onClick={handlePrevStep} variant="ghost" className="font-bold text-xs flex items-center">
                  <ChevronLeft className="h-4 w-4 mr-1.5" />
                  Previous Step
                </Button>
              ) : (
                <div />
              )}

              {activeStep < STEPS.length - 1 ? (
                <Button type="button" onClick={handleNextStep} variant="primary" className="font-bold text-xs flex items-center px-5 py-2.5">
                  Next Step
                  <ChevronRight className="h-4 w-4 ml-1.5" />
                </Button>
              ) : (
                <Button type="submit" variant="primary" className="font-bold text-xs px-6 py-2.5" isLoading={isSubmitting}>
                  Publish Listing
                </Button>
              )}
            </div>

          </form>
        </FormProvider>
      </Card>
    </div>
  );
};

export default CreateProperty;
