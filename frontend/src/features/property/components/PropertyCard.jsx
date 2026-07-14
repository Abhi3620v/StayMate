import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { 
  Heart, Star, MapPin, ShieldCheck, Sparkles, Calendar, ArrowRight, 
  Bed, Bath, Compass, User, Eye, Layers 
} from 'lucide-react';
import { cn } from '@/utils/cn';
import toast from 'react-hot-toast';
import propertyService from '@/services/propertyService';

const PropertyCard = ({
  property = {},
  onWishlistToggle,
  isWishlistedInit = false,
}) => {
  const navigate = useNavigate();
  const [isWishlisted, setIsWishlisted] = useState(isWishlistedInit || property.statistics?.favorites > 0);

  const id = property._id || property.id || 'mock-id';
  const title = property.title || 'Spacious Student Accommodation';
  const price = property.pricing?.monthlyRent || property.price || 5000;
  const propertyType = property.propertyType || property.type || 'Flat';
  const address = property.location ? `${property.location.area || ''}, ${property.location.city || ''}` : (property.address || 'Noida, Sector 62');
  const isVerified = property.verification === 'verified' || property.isVerified;
  const isOwnerVerified = property.verification === 'verified' || property.isOwnerVerified;
  
  const roomDetails = property.roomDetails || {};
  const bedrooms = roomDetails.bedrooms || 1;
  const bathrooms = roomDetails.bathrooms || 1;
  const areaSqFt = roomDetails.areaSqFt || 180;
  const furnishing = roomDetails.furnishing || 'Semi-Furnished';
  
  const availability = property.availableFrom || 'Immediately';
  const gender = property.genderPreference || 'Any';
  const viewsCount = property.statistics?.views || 24;

  const imagesList = property.images || [];
  const coverUrl = imagesList[0]?.url || 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=500&q=80';

  const handleWishlistClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const res = await propertyService.toggleWishlist(id);
      setIsWishlisted(!isWishlisted);
      toast.success(res.message || 'Saved successfully');
      if (onWishlistToggle) onWishlistToggle(id, !isWishlisted);
    } catch (err) {
      toast.error('Log in to save property listings.');
    }
  };

  const handleBookVisit = (e) => {
    e.preventDefault();
    e.stopPropagation();
    navigate(`/properties/${id}?schedule=true`);
  };

  return (
    <Card hoverable className="group flex flex-col h-full bg-white dark:bg-secondary-900 border border-secondary-200/50 dark:border-secondary-800/80 rounded-[20px] overflow-hidden shadow-premium-sm hover:shadow-premium-lg transition-all duration-300 ease-out">
      <Link to={`/properties/${id}`} className="flex flex-col h-full justify-between">
        
        {/* Cover Image Frame */}
        <div className="relative aspect-[16/11] w-full overflow-hidden bg-secondary-100 dark:bg-secondary-800 shrink-0 select-none">
          <img
            src={coverUrl}
            alt={title}
            className="h-full w-full object-cover transition-transform duration-700 ease-in-out group-hover:scale-105"
            loading="lazy"
          />

          {/* Image Count and Views info */}
          <div className="absolute bottom-3 right-3 z-10 flex space-x-1.5">
            <span className="backdrop-blur-md bg-secondary-950/70 text-white text-[8px] font-black px-2 py-0.5 rounded-full">
              {imagesList.length || 1} PICS
            </span>
            <span className="backdrop-blur-md bg-secondary-950/70 text-white text-[8px] font-black px-2 py-0.5 rounded-full flex items-center">
              <Eye className="h-2.5 w-2.5 mr-0.5 text-secondary-300" /> {viewsCount} VIEWS
            </span>
          </div>

          {/* Overlays badges */}
          <div className="absolute top-4 left-4 z-10 flex flex-col gap-1.5 items-start">
            {isVerified && (
              <Badge variant="success" size="sm" className="backdrop-blur-md bg-success-500/90 text-white border-none shadow-premium-sm flex items-center font-bold px-2 py-0.5">
                <ShieldCheck className="h-3.5 w-3.5 mr-1 shrink-0 stroke-[1.8]" />
                Verified Stay
              </Badge>
            )}
            {isOwnerVerified && (
              <Badge className="backdrop-blur-md bg-primary-500/95 text-secondary-900 border-none shadow-premium-sm flex items-center font-extrabold px-2 py-0.5">
                <User className="h-3.5 w-3.5 mr-1 shrink-0" />
                Verified Host
              </Badge>
            )}
          </div>

          {/* Compatibility score placeholder */}
          <div className="absolute bottom-3 left-3 z-10 flex items-center bg-secondary-950/70 backdrop-blur-md text-white font-extrabold text-[9px] px-2 py-0.5 rounded-full">
            <Sparkles className="h-3 w-3 mr-0.5 text-primary-500 animate-pulse" />
            92% Match
          </div>

          {/* Wishlist Heart */}
          <button
            type="button"
            onClick={handleWishlistClick}
            className="absolute top-4 right-4 z-10 p-2.5 rounded-full bg-white dark:bg-secondary-900 border border-secondary-150 dark:border-secondary-800 shadow-md hover:scale-110 active:scale-90 transition-all duration-200 text-secondary-700 hover:text-error-500 dark:text-secondary-250 dark:hover:text-error-400"
            aria-label="Toggle wishlist"
          >
            <Heart
              className={cn(
                'h-5 w-5 transition-all duration-200 stroke-[2.2]',
                isWishlisted ? 'fill-error-500 text-error-500 scale-105' : 'text-secondary-700 dark:text-secondary-300'
              )}
            />
          </button>
        </div>

        {/* Content detail panel */}
        <div className="p-4 flex-1 flex flex-col justify-between space-y-3.5">
          <div className="space-y-2">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[8px] font-black uppercase tracking-wider text-primary-750 dark:text-primary-400">
                  {propertyType?.replace('_', ' ')} • {furnishing?.replace('_', ' ')}
                </span>
                <div className="flex items-center space-x-0.5 text-[9px] font-extrabold text-secondary-700 dark:text-secondary-300">
                  <Star className="h-3 w-3 fill-amber-400 text-amber-400 shrink-0" />
                  <span>{property.rating || property.statistics?.averageRating || '5.0'}</span>
                </div>
              </div>
              <h4 className="font-extrabold text-sm text-secondary-900 dark:text-white line-clamp-1 group-hover:text-primary-600 transition-colors leading-snug mt-0.5">
                {title}
              </h4>
            </div>

            {/* Address */}
            <p className="flex items-center text-[10px] font-bold text-secondary-450 dark:text-secondary-400 truncate">
              <MapPin className="h-3.5 w-3.5 mr-1 shrink-0 text-secondary-400" />
              <span className="truncate">{address}</span>
            </p>

            {/* Rooms Info stats row */}
            <div className="grid grid-cols-3 gap-2 py-2 border-t border-b border-secondary-100/60 dark:border-secondary-900/60 text-[9px] font-bold text-secondary-500">
              <span className="flex items-center justify-center"><Bed className="h-3.5 w-3.5 mr-1 text-secondary-450" /> {bedrooms} BHK</span>
              <span className="flex items-center justify-center border-l border-r border-secondary-100/60 dark:border-secondary-900/60"><Bath className="h-3.5 w-3.5 mr-1 text-secondary-450" /> {bathrooms} Bath</span>
              <span className="flex items-center justify-center"><Layers className="h-3.5 w-3.5 mr-1 text-secondary-450" /> {areaSqFt} sqft</span>
            </div>

            {/* Availability details & Gender */}
            <div className="flex items-center justify-between text-[9px] text-secondary-450 pt-0.5 font-bold">
              <span className="flex items-center">
                <Calendar className="h-3 w-3 mr-1" />
                Available: {availability}
              </span>
              <span>Prefers: <span className="text-secondary-700 capitalize">{gender}</span></span>
            </div>
          </div>

          <div className="pt-2 border-t border-secondary-100/60 dark:border-secondary-800/80 space-y-3 shrink-0">
            {/* Rent price display */}
            <div className="flex items-baseline justify-between">
              <span className="text-[10px] text-secondary-400 dark:text-secondary-500 font-bold uppercase">Monthly Rent</span>
              <div>
                <span className="text-base font-black text-secondary-900 dark:text-white">
                  ₹{price.toLocaleString()}
                </span>
                <span className="text-[10px] text-secondary-500 font-bold">/mo</span>
              </div>
            </div>

            {/* CTA action buttons */}
            <div className="grid grid-cols-2 gap-2 pt-0.5">
              <Button
                variant="outline"
                size="sm"
                onClick={handleBookVisit}
                className="w-full text-[10px] font-bold py-1.5 border-secondary-200 hover:shadow-premium-sm"
              >
                Book Tour
              </Button>
              <Button
                variant="primary"
                size="sm"
                className="w-full text-[10px] font-bold py-1.5"
                onClick={() => navigate(`/properties/${id}`)}
                rightIcon={<ArrowRight className="h-3.5 w-3.5" />}
              >
                Explore
              </Button>
            </div>
          </div>
        </div>
      </Link>
    </Card>
  );
};

export default PropertyCard;
