import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import propertyService from '@/services/propertyService';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Avatar from '@/components/ui/Avatar';
import Badge from '@/components/ui/Badge';
import { MapPin, Bed, Bath, Trash2, Heart, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';

const Wishlist = () => {
  // Fetch wishlist
  const { data: wishlist, isLoading, error, refetch } = useQuery({
    queryKey: ['properties', 'wishlist'],
    queryFn: () => propertyService.getWishlist(),
  });

  const handleRemoveWishlist = async (id, e) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await propertyService.toggleWishlist(id);
      toast.success('Listing removed from wishlist.');
      refetch();
    } catch (err) {
      toast.error('Failed to update wishlist.');
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 md:px-6 py-6 space-y-6">
      <div>
        <h1 className="text-xl md:text-2xl font-black text-secondary-900 dark:text-white flex items-center">
          <Heart className="h-5.5 w-5.5 text-error-500 mr-2" />
          My Saved Properties
        </h1>
        <p className="text-xs text-secondary-450 dark:text-secondary-400 mt-1">
          Review and compare listings you have saved across your devices.
        </p>
      </div>

      {isLoading ? (
        <div className="py-12 text-center text-xs text-secondary-400">Loading saved items...</div>
      ) : error ? (
        <div className="p-4 bg-error-500/10 text-error-750 text-xs font-bold rounded-xl">
          Failed to load wishlist items. Please try again.
        </div>
      ) : wishlist?.length === 0 ? (
        <Card className="py-16 text-center space-y-4 max-w-md mx-auto border-secondary-200/50">
          <div className="p-4 bg-secondary-100 dark:bg-secondary-900 rounded-full w-fit mx-auto">
            <Heart className="h-8 w-8 text-secondary-400" />
          </div>
          <div>
            <h3 className="font-extrabold text-base text-secondary-900 dark:text-white">Your wishlist is empty</h3>
            <p className="text-xs text-secondary-450 dark:text-secondary-400 mt-1 max-w-[280px] mx-auto">
              Save properties you like while exploring Noida stays to see them here.
            </p>
          </div>
          <Link to="/marketplace">
            <Button variant="primary" size="sm" className="font-bold mt-2">
              Explore Properties
            </Button>
          </Link>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
          {wishlist.map((prop) => {
            const primaryImg = prop.images?.[0]?.url || 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=600&q=80';
            return (
              <Link to={`/properties/${prop._id || prop.id}`} key={prop._id || prop.id}>
                <Card className="group hover:shadow-lg transition-all border-secondary-200/50 overflow-hidden relative">
                  <div className="h-44 bg-secondary-100 relative">
                    <img src={primaryImg} alt={prop.title} className="w-full h-full object-cover" />
                    
                    <button
                      onClick={(e) => handleRemoveWishlist(prop._id || prop.id, e)}
                      className="absolute top-3 right-3 p-2 bg-white/95 rounded-full text-error-500 hover:bg-white transition-colors shadow-sm"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>

                    {prop.verification === 'verified' && (
                      <span className="absolute bottom-3 left-3 bg-white/95 text-success-650 text-[9px] font-black px-2.5 py-1 rounded-full shadow-sm">
                        VERIFIED
                      </span>
                    )}
                  </div>

                  <div className="p-4 space-y-3">
                    <div className="flex justify-between items-start">
                      <span className="text-[9px] font-black tracking-wider uppercase text-primary-650">{prop.propertyType?.replace('_', ' ')}</span>
                      <span className="text-sm font-black text-secondary-900 dark:text-white">₹{prop.pricing?.monthlyRent?.toLocaleString()}/mo</span>
                    </div>

                    <h3 className="font-extrabold text-sm text-secondary-800 dark:text-white line-clamp-1 leading-tight group-hover:text-primary-600 transition-colors">
                      {prop.title}
                    </h3>

                    <p className="text-[10px] text-secondary-450 flex items-center font-semibold">
                      <MapPin className="h-3.5 w-3.5 text-secondary-400 mr-1 shrink-0" />
                      {prop.location?.area}, {prop.location?.city}
                    </p>

                    <div className="flex items-center space-x-3 pt-2.5 border-t text-[10px] font-bold text-secondary-500">
                      <span className="flex items-center"><Bed className="h-3.5 w-3.5 mr-1 text-secondary-450" /> {prop.roomDetails?.bedrooms} BHK</span>
                      <span className="flex items-center"><Bath className="h-3.5 w-3.5 mr-1 text-secondary-450" /> {prop.roomDetails?.bathrooms} Bath</span>
                    </div>
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Wishlist;
