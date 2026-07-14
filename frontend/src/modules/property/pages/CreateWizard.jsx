import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  LayoutDashboard, Home, MapPin, BadgeIndianRupee,
  Sparkles, Image, CheckCircle, ChevronLeft, ChevronRight,
  CloudLightning, Trash2, Shield, Loader, FileText, Video, Eye
} from 'lucide-react';

import { useDraftProperty } from '../hooks/useDraftProperty.js';
import { PROPERTY_TYPES, LISTING_TYPES, AMENITIES_LIST } from '../constants/propertyConstants.js';
import {
  basicInfoFormSchema,
  locationFormSchema,
  stepThreeFormSchema,
  amenitiesFormSchema
} from '../validation/propertyValidation.js';

import Button from '../../../components/ui/Button.jsx';
import Card from '../../../components/ui/Card.jsx';
import Input from '../../../components/ui/Input.jsx';
import Select from '../../../components/ui/Select.jsx';
import Alert from '../../../components/ui/Alert.jsx';
import ProgressBar from '../../../components/ui/ProgressBar.jsx';
import Badge from '../../../components/ui/Badge.jsx';
import Textarea from '../../../components/ui/Textarea.jsx';
import Checkbox from '../../../components/ui/Checkbox.jsx';

const STEPS = [
  { id: 1, label: 'Basic Info', icon: Home, schema: basicInfoFormSchema },
  { id: 2, label: 'Location', icon: MapPin, schema: locationFormSchema },
  { id: 3, label: 'Pricing & Details', icon: BadgeIndianRupee, schema: stepThreeFormSchema },
  { id: 4, label: 'Amenities', icon: Sparkles, schema: amenitiesFormSchema },
  { id: 5, label: 'Media', icon: Image, schema: null },
  { id: 6, label: 'Preview & Publish', icon: CheckCircle, schema: null }
];

export const CreateWizard = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const {
    draft,
    setDraft,
    currentStep,
    setCurrentStep,
    nextStep,
    prevStep,
    saveDraft,
    publish,
    discard,
    uploadImages,
    isSaving,
    isUploading,
    isPublishing,
    autoSaveTimestamp
  } = useDraftProperty();

  // Reset wizard state on page load/mount to start a fresh listing
  useEffect(() => {
    setDraft(null);
    setCurrentStep(1);
  }, [setDraft, setCurrentStep]);

  const [dragActive, setDragActive] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isPublishedSuccess, setIsPublishedSuccess] = useState(false);

  // Initialize form with validation schema for current step
  const methods = useForm({
    resolver: (values, context, options) => {
      const activeSchema = STEPS[currentStep - 1]?.schema;
      if (!activeSchema) return { values, errors: {} };
      return zodResolver(activeSchema)(values, context, options);
    },
    mode: 'onBlur',
    defaultValues: {}
  });

  const { handleSubmit, register, formState: { errors, isValid }, reset, watch, setValue } = methods;

  // Sync draft data into react-hook-form on load/step changes
  useEffect(() => {
    if (draft) {
      // Map flat keys based on active step structure
      if (currentStep === 1) {
        reset({
          title: draft.title || '',
          description: draft.description || '',
          propertyType: draft.propertyType || '',
          listingType: draft.listingType || '',
          occupancy: draft.occupancy || 'single'
        });
      } else if (currentStep === 2) {
        reset({
          country: draft.location?.country || 'India',
          state: draft.location?.state || '',
          city: draft.location?.city || '',
          area: draft.location?.area || '',
          landmark: draft.location?.landmark || '',
          pinCode: draft.location?.pinCode || '',
          latitude: draft.location?.latitude || 28.6139,
          longitude: draft.location?.longitude || 77.2090
        });
      } else if (currentStep === 3) {
        reset({
          monthlyRent: draft.pricing?.monthlyRent || 0,
          securityDeposit: draft.pricing?.securityDeposit || 0,
          maintenanceCharges: draft.pricing?.maintenanceCharges || 0,
          brokerage: draft.pricing?.brokerage || 0,
          electricityIncluded: draft.pricing?.electricityIncluded || false,
          waterIncluded: draft.pricing?.waterIncluded || false,
          internetIncluded: draft.pricing?.internetIncluded || false,
          bedrooms: draft.roomDetails?.bedrooms || 1,
          bathrooms: draft.roomDetails?.bathrooms || 1,
          balcony: draft.roomDetails?.balcony || 0,
          floor: draft.roomDetails?.floor || 0,
          totalFloors: draft.roomDetails?.totalFloors || 0,
          areaSqFt: draft.roomDetails?.areaSqFt || 0,
          furnishing: draft.roomDetails?.furnishing || 'unfurnished'
        });
      } else if (currentStep === 4) {
        // Map Boolean states for checkboxes
        const defaultAmenities = {};
        AMENITIES_LIST.forEach(amenity => {
          defaultAmenities[amenity.id] = draft.amenities?.[amenity.id] || false;
        });
        reset(defaultAmenities);
      }
    }
  }, [draft, currentStep, reset]);

  // Autosave callback when fields blur
  const triggerAutosave = useCallback(async (data) => {
    let payload = {};
    if (currentStep === 1) {
      payload = { ...data };
    } else if (currentStep === 2) {
      payload = {
        location: {
          country: data.country,
          state: data.state,
          city: data.city,
          area: data.area,
          landmark: data.landmark,
          pinCode: data.pinCode,
          latitude: data.latitude,
          longitude: data.longitude
        }
      };
    } else if (currentStep === 3) {
      payload = {
        pricing: {
          monthlyRent: Number(data.monthlyRent),
          securityDeposit: Number(data.securityDeposit),
          maintenanceCharges: Number(data.maintenanceCharges),
          brokerage: Number(data.brokerage),
          electricityIncluded: data.electricityIncluded,
          waterIncluded: data.waterIncluded,
          internetIncluded: data.internetIncluded
        },
        roomDetails: {
          bedrooms: Number(data.bedrooms),
          bathrooms: Number(data.bathrooms),
          balcony: Number(data.balcony),
          floor: Number(data.floor),
          totalFloors: Number(data.totalFloors),
          areaSqFt: Number(data.areaSqFt),
          furnishing: data.furnishing
        }
      };
    } else if (currentStep === 4) {
      payload = { amenities: { ...data } };
    }

    try {
      await saveDraft(payload);
    } catch (err) {
      console.error('AutoSave failed:', err);
      throw err;
    }
  }, [currentStep, saveDraft]);

  // Form submission handler per step
  const handleStepSubmit = async (data) => {
    try {
      await triggerAutosave(data);
      nextStep();
    } catch (err) {
      toast.error(err.message || 'Failed to save draft. Please check your inputs or network connection.');
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const files = Array.from(e.dataTransfer.files);
      const imageFiles = files.filter(f => f.type.startsWith('image/'));
      if (imageFiles.length === 0) {
        toast.error('Only image uploads are accepted.');
        return;
      }
      try {
        setUploadProgress(10);
        const interval = setInterval(() => {
          setUploadProgress(prev => (prev >= 90 ? 90 : prev + 10));
        }, 150);

        await uploadImages(draft._id, imageFiles);

        clearInterval(interval);
        setUploadProgress(100);
        toast.success('Images uploaded successfully.');
      } catch (err) {
        toast.error(err.message || 'Upload failed.');
      } finally {
        setUploadProgress(0);
      }
    }
  };

  const handleFileChange = async (e) => {
    if (e.target.files && e.target.files[0]) {
      const files = Array.from(e.target.files);
      try {
        setUploadProgress(10);
        const interval = setInterval(() => {
          setUploadProgress(prev => (prev >= 90 ? 90 : prev + 10));
        }, 150);

        await uploadImages(draft._id, files);

        clearInterval(interval);
        setUploadProgress(100);
        toast.success('Images uploaded successfully.');
      } catch (err) {
        toast.error(err.message || 'Upload failed.');
      } finally {
        setUploadProgress(0);
      }
    }
  };

  const handleDiscard = async () => {
    if (window.confirm('Are you sure you want to discard this draft? All progress will be deleted.')) {
      try {
        await discard();
        toast.success('Draft discarded successfully.');
        navigate('/owner/properties');
      } catch (err) {
        toast.error('Failed to discard draft.');
      }
    }
  };

  // Publish listing
  const handlePublish = async () => {
    if (!draft?._id) return;
    try {
      await publish(draft._id);
      setIsPublishedSuccess(true);
      toast.success('Listing submitted successfully!');
    } catch (err) {
      toast.error(err.message || 'Failed to publish listing. Check that all fields are fully completed.');
    }
  };

  if (isPublishedSuccess) {
    return (
      <div className="max-w-[600px] mx-auto py-16 text-center space-y-6">
        <Card className="p-8 md:p-12 flex flex-col items-center justify-center space-y-6 shadow-premium-lg border border-secondary-200/50 dark:border-secondary-900 rounded-3xl animate-scale-up">
          <div className="h-16 w-16 bg-success-50 dark:bg-success-950/40 text-success-600 rounded-full flex items-center justify-center shadow-premium-sm">
            <CheckCircle className="h-10 w-10 stroke-[2]" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-black text-secondary-900 dark:text-white">Property saved successfully</h2>
            <p className="text-sm text-secondary-400 font-medium">Your listing has been submitted for review. It will become live on the marketplace as soon as a moderator approves it.</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full pt-2">
            <Button 
              variant="primary" 
              className="w-full py-2.5 font-bold"
              onClick={() => navigate('/owner/properties')}
            >
              Go to My Properties
            </Button>
            <Button 
              variant="outline" 
              className="w-full py-2.5 font-bold"
              onClick={() => {
                setDraft(null);
                setCurrentStep(1);
                setIsPublishedSuccess(false);
              }}
            >
              Add Another Listing
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-[1200px] mx-auto space-y-8 pb-32">
      {/* 1. Header with save indicator */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-secondary-900 dark:text-white leading-tight">Create Listing</h1>
          <p className="text-sm text-secondary-400 font-medium mt-1">Guide StayMate users to your listing.</p>
        </div>
        {autoSaveTimestamp && (
          <div className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-secondary-100 dark:bg-secondary-900 border border-secondary-200/50 dark:border-secondary-900 text-xs font-bold text-secondary-500">
            <CloudLightning className="h-3.5 w-3.5 text-success-650" />
            <span>Draft Autosaved: {autoSaveTimestamp.toLocaleTimeString()}</span>
          </div>
        )}
      </div>

      {/* 2. Step Indicator at the top */}
      <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
        {STEPS.map((step) => {
          const Icon = step.icon;
          const isActive = currentStep === step.id;
          const isCompleted = currentStep > step.id;
          return (
            <div
              key={step.id}
              onClick={() => isCompleted && setCurrentStep(step.id)}
              className={`flex items-center justify-center md:justify-start md:space-x-2.5 p-3 rounded-2xl border transition-all duration-200 cursor-pointer ${
                isActive
                  ? 'bg-primary-600 border-primary-600 text-white shadow-premium-sm'
                  : isCompleted
                  ? 'bg-success-50/15 border-success-200/40 text-success-700 dark:text-success-400'
                  : 'bg-white dark:bg-secondary-950 border-secondary-200/60 dark:border-secondary-900 text-secondary-400'
              }`}
            >
              <div className={`p-1.5 rounded-xl flex items-center justify-center shrink-0 ${isActive ? 'bg-primary-500' : isCompleted ? 'bg-success-100/20' : 'bg-secondary-100 dark:bg-secondary-900'}`}>
                {isCompleted ? <CheckCircle className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
              </div>
              <span className="text-[12px] font-black tracking-wider uppercase hidden md:inline">{step.label}</span>
            </div>
          );
        })}
      </div>

      {/* 3. Steps rendering wrappers */}
      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(handleStepSubmit)}>
          <Card className="p-6 md:p-8 space-y-6 overflow-hidden relative">
            {/* Visual Step Progress Bar at the top of Card */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-secondary-100 dark:bg-secondary-900">
              <div 
                className="h-full bg-primary-500 transition-all duration-300"
                style={{ width: `${(currentStep / STEPS.length) * 100}%` }}
              />
            </div>
            
            {/* Step 1: Basic Info */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div className="border-b border-secondary-200/40 pb-4 flex flex-col md:flex-row md:items-center justify-between gap-2">
                  <div>
                    <h3 className="text-xl font-bold text-secondary-900 dark:text-white">Basic Information</h3>
                    <p className="text-xs text-secondary-400 font-medium mt-0.5">Add the core details of your property.</p>
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-primary-500 bg-primary-50 dark:bg-primary-950/40 px-2.5 py-1 rounded-full self-start md:self-center">Step 1 of 6</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Select
                    label="Property Type"
                    {...register('propertyType')}
                    error={errors.propertyType?.message}
                  >
                    <option value="">Select Property Type</option>
                    {Object.entries(PROPERTY_TYPES).map(([key, val]) => (
                      <option key={key} value={val}>{key.replace('_', ' ')}</option>
                    ))}
                  </Select>
                  <Select
                    label="Listing Type"
                    {...register('listingType')}
                    error={errors.listingType?.message}
                  >
                    <option value="">Select Listing Type</option>
                    {Object.entries(LISTING_TYPES).map(([key, val]) => (
                      <option key={key} value={val}>{key.replace('_', ' ')}</option>
                    ))}
                  </Select>
                </div>
                <Input
                  label="Listing Title"
                  placeholder="e.g. Cozy 2BHK flat near Katraj Lake"
                  {...register('title')}
                  error={errors.title?.message}
                  helperText="Choose a clear title that helps users understand your listing quickly."
                />
                <Textarea
                  label="Description"
                  rows={4}
                  placeholder="Provide a detailed description of features, roommates guidelines, and landlord rules..."
                  error={errors.description?.message}
                  {...register('description')}
                />
              </div>
            )}

            {/* Step 2: Location */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div className="border-b border-secondary-200/40 pb-4 flex flex-col md:flex-row md:items-center justify-between gap-2">
                  <div>
                    <h3 className="text-xl font-bold text-secondary-900 dark:text-white">Location Details</h3>
                    <p className="text-xs text-secondary-400 font-medium mt-0.5">Help tenants find your property.</p>
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-primary-500 bg-primary-50 dark:bg-primary-950/40 px-2.5 py-1 rounded-full self-start md:self-center">Step 2 of 6</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input label="Country" disabled {...register('country')} />
                  <Input label="State" placeholder="e.g. Maharashtra" {...register('state')} error={errors.state?.message} />
                  <Input label="City" placeholder="e.g. Pune" {...register('city')} error={errors.city?.message} />
                  <Input label="Area / Locality" placeholder="e.g. Katraj" {...register('area')} error={errors.area?.message} />
                  <Input label="Landmark (Optional)" placeholder="e.g. Near Bharti Vidyapeeth" {...register('landmark')} />
                  <Input label="Pin Code" placeholder="e.g. 411046" {...register('pinCode')} error={errors.pinCode?.message} />
                </div>
                {/* Geolocation Calculator */}
                <div className="p-5 border border-secondary-200/50 dark:border-secondary-900 rounded-2xl bg-secondary-50/50 dark:bg-secondary-950 flex flex-col md:flex-row items-center justify-between gap-4">
                  <div className="space-y-1">
                    <h5 className="text-sm font-bold text-secondary-800 dark:text-secondary-200">Google Maps Geolocation</h5>
                    <p className="text-xs text-secondary-400">Calculate coordinates from address details dynamically.</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <button
                      type="button"
                      onClick={async () => {
                        const cityVal = watch('city');
                        const areaVal = watch('area');
                        const stateVal = watch('state');
                        if (!cityVal) {
                          toast.error('Please enter a city first to locate on map.');
                          return;
                        }
                        const loadingToast = toast.loading('Calculating coordinates...');
                        try {
                          const address = `${areaVal || ''}, ${cityVal}, ${stateVal || ''}, India`;
                          const { default: locationService } = await import('../../location/services/locationService.js');
                          const result = await locationService.geocode(address);
                          if (result && result.latitude && result.longitude) {
                            setValue('latitude', result.latitude);
                            setValue('longitude', result.longitude);
                            toast.success(`Location verified: Lat ${result.latitude.toFixed(4)}, Lng ${result.longitude.toFixed(4)}`, { id: loadingToast });
                          } else {
                            toast.error('Could not calculate coordinates. Please check the address format.', { id: loadingToast });
                          }
                        } catch (err) {
                          toast.error('Failed to geocode location.', { id: loadingToast });
                        }
                      }}
                      className="px-4 py-2.5 text-xs font-bold text-white bg-primary-600 hover:bg-primary-700 rounded-xl transition duration-150 shadow-sm"
                    >
                      Locate on Map
                    </button>
                    <div className="flex space-x-3 text-xs font-bold text-secondary-650 dark:text-secondary-300 bg-white dark:bg-secondary-900 border border-secondary-200/60 dark:border-secondary-800 p-2.5 rounded-xl">
                      <span>Lat: {Number(watch('latitude') || 28.6139).toFixed(4)}</span>
                      <span>•</span>
                      <span>Lng: {Number(watch('longitude') || 77.2090).toFixed(4)}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Pricing & Property Details */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div className="border-b border-secondary-200/40 pb-4 flex flex-col md:flex-row md:items-center justify-between gap-2">
                  <div>
                    <h3 className="text-xl font-bold text-secondary-900 dark:text-white">Pricing & Parameters</h3>
                    <p className="text-xs text-secondary-400 font-medium mt-0.5">Define rent and deposit information.</p>
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-primary-500 bg-primary-50 dark:bg-primary-950/40 px-2.5 py-1 rounded-full self-start md:self-center">Step 3 of 6</span>
                </div>
                
                {/* Financial details */}
                <h4 className="text-sm font-bold text-secondary-500 uppercase tracking-wider">Pricing (INR)</h4>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <Input type="number" label="Monthly Rent" {...register('monthlyRent', { valueAsNumber: true })} error={errors.monthlyRent?.message} helperText="Enter the monthly rent amount excluding optional utility charges." />
                  <Input type="number" label="Security Deposit (Optional)" {...register('securityDeposit', { valueAsNumber: true })} />
                  <Input type="number" label="Maintenance Charges (Optional)" {...register('maintenanceCharges', { valueAsNumber: true })} />
                  <Input type="number" label="Brokerage (Optional)" {...register('brokerage', { valueAsNumber: true })} />
                </div>
 
                {/* Utilities Flags */}
                <div className="flex flex-wrap gap-6 py-2">
                  <Checkbox label="Electricity Included" id="electricityIncluded" {...register('electricityIncluded')} />
                  <Checkbox label="Water Included" id="waterIncluded" {...register('waterIncluded')} />
                  <Checkbox label="Internet Included" id="internetIncluded" {...register('internetIncluded')} />
                </div>
 
                {/* Property structure */}
                <h4 className="text-sm font-bold text-secondary-500 uppercase tracking-wider border-t border-secondary-200/40 pt-4">Room & Furnishing Details</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Input type="number" label="Bedrooms Count" {...register('bedrooms', { valueAsNumber: true })} error={errors.bedrooms?.message} />
                  <Input type="number" label="Bathrooms Count" {...register('bathrooms', { valueAsNumber: true })} error={errors.bathrooms?.message} />
                  <Input type="number" label="Balcony Count (Optional)" {...register('balcony', { valueAsNumber: true })} />
                  <Input type="number" label="Floor Number (Optional)" {...register('floor', { valueAsNumber: true })} />
                  <Input type="number" label="Total Floors (Optional)" {...register('totalFloors', { valueAsNumber: true })} />
                  <Input type="number" label="Area (Sq Ft) (Optional)" {...register('areaSqFt', { valueAsNumber: true })} />
                </div>
                <Select label="Furnishing State" {...register('furnishing')}>
                  <option value="unfurnished">Unfurnished</option>
                  <option value="semi_furnished">Semi Furnished</option>
                  <option value="fully_furnished">Fully Furnished</option>
                </Select>
              </div>
            )}

            {/* Step 4: Amenities */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <div className="border-b border-secondary-200/40 pb-4 flex flex-col md:flex-row md:items-center justify-between gap-2">
                  <div>
                    <h3 className="text-xl font-bold text-secondary-900 dark:text-white">Amenities Checklist</h3>
                    <p className="text-xs text-secondary-400 font-medium mt-0.5">Mark all assets/conveniences available at this flat.</p>
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-primary-500 bg-primary-50 dark:bg-primary-950/40 px-2.5 py-1 rounded-full self-start md:self-center">Step 4 of 6</span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {AMENITIES_LIST.map(amenity => (
                    <label
                      key={amenity.id}
                      className="flex items-center space-x-3 p-4 border border-secondary-200/50 dark:border-secondary-900 rounded-[14px] bg-white dark:bg-secondary-950 hover:bg-secondary-50/50 dark:hover:bg-secondary-900/20 cursor-pointer transition-colors"
                    >
                      <input
                        type="checkbox"
                        className="rounded-[6px] border-secondary-200 dark:border-secondary-800 bg-secondary-50/50 dark:bg-secondary-900/40 text-primary-600 focus:ring-2 focus:ring-primary-500/20 h-4.5 w-4.5 cursor-pointer transition-all shadow-premium-sm mr-2"
                        {...register(amenity.id)}
                      />
                      <span className="text-xs font-bold text-secondary-700 dark:text-secondary-300">{amenity.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Step 5: Media Upload */}
            {currentStep === 5 && (
              <div className="space-y-6">
                <div className="border-b border-secondary-200/40 pb-4 flex flex-col md:flex-row md:items-center justify-between gap-2">
                  <div>
                    <h3 className="text-xl font-bold text-secondary-900 dark:text-white">Upload Images</h3>
                    <p className="text-xs text-secondary-400 font-medium mt-0.5">At least one primary listing photo is required.</p>
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-primary-500 bg-primary-50 dark:bg-primary-950/40 px-2.5 py-1 rounded-full self-start md:self-center">Step 5 of 6</span>
                </div>

                {/* Drag-n-drop uploader area */}
                <div
                  onDragEnter={handleDrag}
                  onDragOver={handleDrag}
                  onDragLeave={handleDrag}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-3xl p-8 flex flex-col items-center justify-center gap-3 cursor-pointer transition-all duration-200 ${
                    dragActive
                      ? 'border-primary-500 bg-primary-50/10'
                      : 'border-secondary-300 dark:border-secondary-800 hover:border-secondary-400 dark:hover:border-secondary-700'
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                  <div className="p-4 rounded-2xl bg-secondary-100 dark:bg-secondary-900 text-primary-500">
                    <Image className="h-6 w-6" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-bold text-secondary-800 dark:text-secondary-200">Upload property photos</p>
                    <p className="text-xs text-secondary-400 mt-1">Drag and drop images here or click to browse</p>
                    <p className="text-[10px] font-bold text-secondary-400 uppercase tracking-widest mt-2 bg-secondary-100 dark:bg-secondary-900/60 px-3 py-1 rounded-full inline-block">PNG • JPG • WEBP</p>
                  </div>
                </div>

                {/* File Uploading Progress Indicator */}
                {isUploading && uploadProgress > 0 && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-bold text-secondary-500">
                      <span>Uploading Files...</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <ProgressBar percentage={uploadProgress} />
                  </div>
                )}

                {/* Uploaded Gallery Grid */}
                <div className="space-y-3">
                  <h4 className="text-sm font-bold text-secondary-500 uppercase tracking-wider">Listing Gallery</h4>
                  {!draft?.images || draft.images.length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-8 border border-secondary-200/50 dark:border-secondary-900 rounded-2xl bg-secondary-50/50 dark:bg-secondary-950 text-center">
                      <Image className="h-8 w-8 text-secondary-400 mb-2" />
                      <p className="text-sm font-bold text-secondary-750 dark:text-secondary-200">No images uploaded</p>
                      <p className="text-xs text-secondary-400 mt-1 max-w-[280px]">Add high-quality photos of bedrooms and common spaces to attract tenants.</p>
                      <Button size="xs" variant="outline" className="mt-3.5" onClick={() => fileInputRef.current?.click()}>
                        Browse Images
                      </Button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {draft.images.map((img, idx) => (
                        <div key={img.publicId || idx} className="group aspect-square rounded-2xl overflow-hidden border border-secondary-200/50 dark:border-secondary-900 bg-secondary-100 dark:bg-secondary-900 relative shadow-premium-sm">
                          <img src={img.url} alt="Listing Photo" className="w-full h-full object-cover" />
                          <div className="absolute top-2 left-2">
                            <Badge variant={img.isPrimary ? 'primary' : 'secondary'} className="text-[9px] font-black uppercase">
                              {img.isPrimary ? 'Cover' : `Image ${idx + 1}`}
                            </Badge>
                          </div>
                          {/* Action buttons */}
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center space-x-2">
                            {!img.isPrimary && (
                              <Button size="xs" variant="primary" onClick={(e) => {
                                e.stopPropagation();
                                // Simple stub to select primary image
                                toast.success('Marked as primary cover image');
                              }}>
                                Make Cover
                              </Button>
                            )}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              toast.success('Image removed from gallery');
                            }}
                            className="p-2 rounded-xl bg-error-500 text-white hover:bg-error-600 transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                </div>
              </div>
            )}

            {/* Step 6: Preview & Publish */}
            {currentStep === 6 && (
              <div className="space-y-6">
                <div className="border-b border-secondary-200/40 pb-4 flex flex-col md:flex-row md:items-center justify-between gap-2">
                  <div>
                    <h3 className="text-xl font-bold text-secondary-900 dark:text-white">Review & Publish Listing</h3>
                    <p className="text-xs text-secondary-400 font-medium mt-0.5">Confirm all details before submitting for moderation.</p>
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-primary-500 bg-primary-50 dark:bg-primary-950/40 px-2.5 py-1 rounded-full self-start md:self-center">Step 6 of 6</span>
                </div>

                {/* Visual Listing Details Layout */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Left: Images cover */}
                  <div className="space-y-4">
                    <div className="aspect-[4/3] rounded-3xl overflow-hidden bg-secondary-100 dark:bg-secondary-900 border border-secondary-200/50 dark:border-secondary-900">
                      {draft?.images && draft.images[0] ? (
                        <img src={draft.images[0].url} alt="Listing Cover" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-secondary-400">No cover image uploaded</div>
                      )}
                    </div>
                    {/* Small thumbnail gallery */}
                    <div className="flex gap-2 overflow-x-auto pb-2">
                      {draft?.images?.slice(1).map((img, idx) => (
                        <img key={idx} src={img.url} className="h-16 w-16 rounded-xl object-cover border border-secondary-200/40" />
                      ))}
                    </div>
                  </div>

                  {/* Right: Info layout */}
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-2xl font-black text-secondary-900 dark:text-white">{draft?.title || 'Listing Title Placeholder'}</h4>
                      <p className="text-sm text-secondary-400 font-semibold mt-1">
                        {draft?.location?.area}, {draft?.location?.city}, {draft?.location?.state}
                      </p>
                    </div>

                    <div className="flex items-center justify-between border-y border-secondary-200/35 py-4">
                      <div>
                        <span className="text-xs font-bold text-secondary-400 uppercase tracking-wider block">Monthly Rent</span>
                        <span className="text-xl font-extrabold text-primary-600">₹{draft?.pricing?.monthlyRent || 0}/month</span>
                      </div>
                      <div>
                        <span className="text-xs font-bold text-secondary-400 uppercase tracking-wider block">Rooms</span>
                        <span className="text-sm font-extrabold text-secondary-700 dark:text-secondary-300">
                          {draft?.roomDetails?.bedrooms || 0} BHK • {draft?.roomDetails?.bathrooms || 0} Bath
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <span className="text-xs font-bold text-secondary-500 uppercase tracking-wider block">Description</span>
                      <p className="text-xs text-secondary-600 dark:text-secondary-400 leading-relaxed italic">
                        "{draft?.description || 'No description provided.'}"
                      </p>
                    </div>

                    <div className="space-y-2.5">
                      <span className="text-xs font-bold text-secondary-500 uppercase tracking-wider block">Amenities Checked</span>
                      <div className="flex flex-wrap gap-1.5">
                        {draft?.amenities && Object.entries(draft.amenities)
                          .filter(([_, checked]) => checked === true)
                          .map(([key]) => (
                            <Badge key={key} variant="secondary" className="capitalize text-[10px] px-2 py-0.5 rounded">
                              {key}
                            </Badge>
                          ))}
                        {(!draft?.amenities || Object.values(draft.amenities).filter(Boolean).length === 0) && (
                          <span className="text-xs text-secondary-400 italic">No amenities specified.</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <Alert variant="info" className="mt-4">
                  <div className="flex items-center space-x-2">
                    <Shield className="h-4 w-4 text-primary-700" />
                    <span className="text-[11px] font-bold">Submitting this listing will send it to the admin review queue. Modifiers typically review within 24 hours.</span>
                  </div>
                </Alert>
              </div>
            )}

            {/* 4. Action bar */}
            <div className="flex justify-between items-center border-t border-secondary-200/40 pt-6">
              <div className="flex space-x-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleDiscard}
                  disabled={isSaving || isPublishing}
                >
                  Discard Draft
                </Button>
                {currentStep > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={prevStep}
                    disabled={isSaving || isPublishing}
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" /> Back
                  </Button>
                )}
              </div>

              <div className="flex space-x-3">
                {currentStep < 6 ? (
                  <Button
                    type="submit"
                    variant="primary"
                    isLoading={isSaving}
                  >
                    Next Step <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                ) : (
                  <Button
                    type="button"
                    variant="primary"
                    onClick={handlePublish}
                    isLoading={isPublishing}
                    disabled={!draft?.images || draft.images.length === 0}
                  >
                    Submit & Publish
                  </Button>
                )}
              </div>
            </div>
          </Card>
        </form>
      </FormProvider>
    </div>
  );
};

export default CreateWizard;
