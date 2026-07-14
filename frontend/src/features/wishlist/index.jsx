import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import propertyService from '@/services/propertyService';
import roommateService from '@/services/roommateService';
import RoommateCard from '@/features/roommate/components/RoommateCard';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { MapPin, Bed, Bath, Trash2, Heart, Home, Users } from 'lucide-react';
import toast from 'react-hot-toast';

const Wishlist = () => {
  const [wishlist, setWishlist] = useState([]);
  const [roommateWishlist, setRoommateWishlist] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('properties');

  const fetchWishlist = async () => {
    setIsLoading(true);
    try {
      const [propertiesData, roommatesData] = await Promise.all([
        propertyService.getWishlist(),
        roommateService.getFavorites().catch(() => [])
      ]);
      setWishlist(propertiesData || []);
      setRoommateWishlist(roommatesData || []);
      setError(null);
    } catch (err) {
      setError(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, []);

  const handleRemoveWishlist = async (id, e) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await propertyService.toggleWishlist(id);
      toast.success('Listing removed from wishlist.');
      fetchWishlist();
    } catch (err) {
      toast.error('Failed to update wishlist.');
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 md:px-6 py-6 space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-xl md:text-2xl font-black text-secondary-900 dark:text-white flex items-center tracking-tight">
          <Heart className="h-5.5 w-5.5 text-error-500 mr-2" />
          My Wishlist
        </h1>
        <p className="text-xs text-secondary-450 dark:text-secondary-400 mt-1 font-semibold">
          Review and manage stays and roommate profiles you have saved.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex space-x-6 border-b border-secondary-250/60 dark:border-secondary-800 pb-3">
        <button
          onClick={() => setActiveTab('properties')}
          className={`flex items-center space-x-2 text-xs font-bold transition-all select-none ${
            activeTab === 'properties'
              ? 'text-primary-600 dark:text-primary-400 border-b-2 border-primary-600 dark:border-primary-400 pb-3 -mb-3.5'
              : 'text-secondary-400 hover:text-secondary-600 pb-3'
          }`}
        >
          <Home className="h-4.5 w-4.5" />
          <span>Saved Properties ({wishlist.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('roommates')}
          className={`flex items-center space-x-2 text-xs font-bold transition-all select-none ${
            activeTab === 'roommates'
              ? 'text-primary-600 dark:text-primary-400 border-b-2 border-primary-600 dark:border-primary-400 pb-3 -mb-3.5'
              : 'text-secondary-400 hover:text-secondary-600 pb-3'
          }`}
        >
          <Users className="h-4.5 w-4.5" />
          <span>Saved Roommates ({roommateWishlist.length})</span>
        </button>
      </div>

      {/* Loading & Errors */}
      {isLoading ? (
        <div className="py-12 text-center text-xs text-secondary-400 font-semibold animate-pulse">
          Loading saved items...
        </div>
      ) : error ? (
        <div className="p-4 bg-error-500/10 text-error-750 text-xs font-bold rounded-xl">
          Failed to load wishlist items. Please try again.
        </div>
      ) : (
        <div className="pt-2">
          {/* TAB 1: PROPERTIES */}
          {activeTab === 'properties' && (
            wishlist.length === 0 ? (
              <Card className="py-16 text-center space-y-4 max-w-md mx-auto border-secondary-200/50">
                <div className="p-4 bg-secondary-100 dark:bg-secondary-900 rounded-full w-fit mx-auto animate-bounce">
                  <Home className="h-8 w-8 text-secondary-400" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-secondary-900 dark:text-white">No properties saved</h3>
                  <p className="text-xs text-secondary-450 dark:text-secondary-400 mt-1 max-w-[280px] mx-auto">
                    Save properties you like while exploring stays to see them here.
                  </p>
                </div>
                <Link to="/properties">
                  <Button variant="primary" size="sm" className="font-bold mt-2">
                    Explore Stays
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
            )
          )}

          {/* TAB 2: ROOMMATES */}
          {activeTab === 'roommates' && (
            roommateWishlist.length === 0 ? (
              <Card className="py-16 text-center space-y-4 max-w-md mx-auto border-secondary-200/50">
                <div className="p-4 bg-secondary-100 dark:bg-secondary-900 rounded-full w-fit mx-auto animate-bounce">
                  <Users className="h-8 w-8 text-secondary-400" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-secondary-900 dark:text-white">No roommates saved</h3>
                  <p className="text-xs text-secondary-450 dark:text-secondary-400 mt-1 max-w-[280px] mx-auto">
                    Save roommate profiles you like while searching compatibility to see them here.
                  </p>
                </div>
                <Link to="/roommates">
                  <Button variant="primary" size="sm" className="font-bold mt-2">
                    Explore Roommates
                  </Button>
                </Link>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
                {roommateWishlist.map((rm) => {
                  const rmProfile = {
                    id: rm._id,
                    user: {
                      name: rm.userId?.name || 'Roommate User',
                      avatar: rm.profilePicture || rm.userId?.avatar || '',
                    },
                    age: rm.basicInfo?.age || 20,
                    gender: rm.basicInfo?.gender || 'male',
                    occupation: rm.basicInfo?.occupation || 'student',
                    budget: rm.budget?.monthlyRent || 0,
                    foodPreference: rm.lifestyle?.foodPreference || 'any',
                    smoking: !!rm.lifestyle?.smoking,
                    drinking: !!rm.lifestyle?.drinking,
                    compatibilityScore: rm.completionPercentage || 98,
                    languages: rm.languagesSpoken || [],
                    sleepSchedule: rm.lifestyle?.sleepingSchedule || 'flexible',
                    bio: rm.basicInfo?.bio || '',
                    isVerified: !!rm.isVerified,
                  };
                  return <RoommateCard key={rm._id} profile={rmProfile} />;
                })}
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
};

export default Wishlist;
