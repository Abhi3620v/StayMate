import React from 'react';
import Card from '../../../components/ui/Card.jsx';
import Badge from '../../../components/ui/Badge.jsx';
import Spinner from '../../../components/ui/Spinner.jsx';
import Button from '../../../components/ui/Button.jsx';
import Skeleton from '../../../components/ui/Skeleton.jsx';

/**
 * Reusable Status Badge for property listings
 */
export const PropertyStatusBadge = ({ status }) => {
  const statusConfig = {
    draft: { variant: 'secondary', label: 'Draft' },
    pending_review: { variant: 'warning', label: 'In Review' },
    published: { variant: 'success', label: 'Active' },
    archived: { variant: 'secondary', label: 'Archived' },
    rejected: { variant: 'danger', label: 'Rejected' },
    suspended: { variant: 'danger', label: 'Suspended' },
    deleted: { variant: 'danger', label: 'Deleted' },
    expired: { variant: 'warning', label: 'Expired' }
  }[status] || { variant: 'secondary', label: status || 'Unknown' };

  return (
    <Badge variant={statusConfig.variant} className="text-[10px] font-bold px-2 py-0.5 rounded">
      {statusConfig.label}
    </Badge>
  );
};

/**
 * Card Component to display individual property details
 */
export const PropertyCard = ({ property, onAction }) => {
  if (!property) return null;
  return (
    <Card className="overflow-hidden border border-secondary-200/50 dark:border-secondary-900 rounded-[18px] hover:-translate-y-0.5 hover:shadow-premium-md transition-all duration-200">
      <div className="aspect-[4/3] w-full bg-secondary-100 dark:bg-secondary-900 relative">
        {property.images && property.images[0] ? (
          <img src={property.images[0].url} alt={property.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-secondary-400">No Image</div>
        )}
        <div className="absolute top-3 right-3">
          <PropertyStatusBadge status={property.status} />
        </div>
      </div>
      <div className="p-5 space-y-2">
        <h4 className="text-base font-bold text-secondary-900 dark:text-white line-clamp-1">{property.title}</h4>
        <p className="text-xs text-secondary-400 font-medium line-clamp-1">
          {property.location?.area}, {property.location?.city}
        </p>
        <div className="flex justify-between items-center pt-2">
          <span className="text-sm font-extrabold text-primary-600">
            ₹{property.pricing?.monthlyRent}/mo
          </span>
          {onAction && (
            <Button size="xs" variant="outline" onClick={() => onAction(property)}>
              Manage
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
};

/**
 * Image gallery component placeholder
 */
export const PropertyGallery = ({ images }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {images?.map((img, idx) => (
        <div key={img.publicId || idx} className="aspect-square bg-secondary-100 dark:bg-secondary-800 rounded-xl overflow-hidden">
          <img src={img.url} alt={`Gallery ${idx + 1}`} className="w-full h-full object-cover" />
        </div>
      ))}
      {(!images || images.length === 0) && (
        <div className="col-span-full h-32 flex items-center justify-center border border-dashed border-secondary-200 dark:border-secondary-800 rounded-xl text-secondary-400">
          No Images Available
        </div>
      )}
    </div>
  );
};

/**
 * Display layout of pricing values
 */
export const PropertyPrice = ({ pricing }) => {
  if (!pricing) return null;
  return (
    <div className="flex items-baseline space-x-2">
      <span className="text-2xl font-black text-secondary-900 dark:text-white">₹{pricing.monthlyRent}</span>
      <span className="text-xs text-secondary-400">/ month</span>
    </div>
  );
};

/**
 * Display layout of property geographic location
 */
export const PropertyLocation = ({ location }) => {
  if (!location) return null;
  return (
    <span className="text-sm text-secondary-600 dark:text-secondary-400 font-medium">
      {location.area}, {location.landmark ? `${location.landmark}, ` : ''}{location.city}, {location.state} {location.pinCode}
    </span>
  );
};

/**
 * Display grid layout of boolean amenities
 */
export const PropertyAmenities = ({ amenities }) => {
  if (!amenities) return null;
  const activeAmenities = Object.entries(amenities)
    .filter(([_, value]) => value === true)
    .map(([key]) => key);

  return (
    <div className="flex flex-wrap gap-2">
      {activeAmenities.map(amenity => (
        <Badge key={amenity} variant="secondary" className="capitalize text-[10px] py-1 px-2 rounded-lg">
          {amenity}
        </Badge>
      ))}
      {activeAmenities.length === 0 && (
        <span className="text-xs text-secondary-400">No amenities checked.</span>
      )}
    </div>
  );
};

/**
 * Grid list of bedroom/bathroom counts
 */
export const PropertyFeatures = ({ roomDetails }) => {
  if (!roomDetails) return null;
  return (
    <div className="flex space-x-4 text-xs text-secondary-500 font-semibold">
      <span>{roomDetails.bedrooms} Bedrooms</span>
      <span>•</span>
      <span>{roomDetails.bathrooms} Bathrooms</span>
      <span>•</span>
      <span>{roomDetails.furnishing.replace('_', ' ')}</span>
    </div>
  );
};

export const PropertyActions = ({ actions }) => {
  return (
    <div className="flex space-x-2">
      {actions?.map((act, idx) => (
        <Button key={idx} size="sm" variant={act.variant || 'outline'} onClick={act.handler}>
          {act.label}
        </Button>
      ))}
    </div>
  );
};

export const PropertyTable = ({ properties, columns, onAction }) => {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-secondary-200 dark:border-secondary-900 text-xs text-secondary-400 font-bold uppercase">
            {columns?.map((col, idx) => (
              <th key={idx} className="pb-3 px-4">{col.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {properties?.map((prop, idx) => (
            <tr key={prop._id || idx} className="border-b border-secondary-100 dark:border-secondary-900 text-sm hover:bg-secondary-50/50 dark:hover:bg-secondary-900/20">
              <td className="py-3 px-4 font-bold">{prop.title}</td>
              <td className="py-3 px-4 capitalize">{prop.propertyType}</td>
              <td className="py-3 px-4 font-semibold text-primary-600">₹{prop.pricing?.monthlyRent}</td>
              <td className="py-3 px-4"><PropertyStatusBadge status={prop.status} /></td>
              <td className="py-3 px-4">
                <Button size="xs" variant="ghost" onClick={() => onAction(prop)}>Edit</Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export const PropertyEmptyState = ({ title = 'No properties found', description }) => {
  return (
    <div className="text-center p-8 border border-dashed border-secondary-200 dark:border-secondary-800 rounded-2xl">
      <h5 className="text-base font-bold text-secondary-700 dark:text-secondary-300">{title}</h5>
      {description && <p className="text-xs text-secondary-400 mt-1">{description}</p>}
    </div>
  );
};

export const PropertySkeleton = () => {
  return (
    <Card className="overflow-hidden border border-secondary-200/50 dark:border-secondary-900 rounded-[18px] p-0">
      <div className="aspect-[4/3] w-full">
        <Skeleton className="w-full h-full" />
      </div>
      <div className="p-5 space-y-3">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
        <Skeleton className="h-5 w-1/4 mt-4" />
      </div>
    </Card>
  );
};

export const PropertyHeader = ({ title, subtitle }) => {
  return (
    <div className="space-y-1">
      <h2 className="text-2xl font-black text-secondary-900 dark:text-white">{title}</h2>
      {subtitle && <p className="text-xs text-secondary-400">{subtitle}</p>}
    </div>
  );
};

export const PropertyFilters = ({ onFilterChange }) => {
  return (
    <div className="flex space-x-3">
      <Skeleton className="h-10 w-32 rounded-xl" />
      <Skeleton className="h-10 w-32 rounded-xl" />
    </div>
  );
};

export const PropertySearchBar = ({ onSearch }) => {
  return (
    <Skeleton className="h-11 w-full max-w-md rounded-xl" />
  );
};

export const PropertyPagination = ({ current, total, onChange }) => {
  return (
    <div className="flex justify-between items-center pt-4">
      <span className="text-xs text-secondary-400">Page {current} of {total}</span>
      <div className="flex space-x-2">
        <Button size="xs" disabled={current <= 1} onClick={() => onChange(current - 1)}>Prev</Button>
        <Button size="xs" disabled={current >= total} onClick={() => onChange(current + 1)}>Next</Button>
      </div>
    </div>
  );
};
