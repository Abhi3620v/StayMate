import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import propertyService from '@/services/propertyService';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Avatar from '@/components/ui/Avatar';
import Badge from '@/components/ui/Badge';
import { Calendar, Clock, MapPin, Check, X } from 'lucide-react';
import toast from 'react-hot-toast';

const VisitRequests = () => {
  const { user } = useAuth();
  const isOwner = user?.role === 'owner';

  // State values instead of useQuery
  const [visits, setVisits] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchVisits = async () => {
    setIsLoading(true);
    try {
      const res = await propertyService.getVisits();
      setVisits(res);
      setError(null);
    } catch (err) {
      setError(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchVisits();
  }, []);

  const handleUpdateStatus = async (id, status) => {
    try {
      await propertyService.updateVisit(id, { status });
      toast.success(`Visit request ${status} successfully.`);
      fetchVisits();
    } catch (err) {
      toast.error('Failed to update visit status.');
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 md:px-6 py-6 space-y-6">
      <div>
        <h1 className="text-xl md:text-2xl font-black text-secondary-900 dark:text-white flex items-center">
          <Calendar className="h-5.5 w-5.5 text-primary-500 mr-2" />
          {isOwner ? 'Incoming Visit Tours' : 'My Tour Bookings'}
        </h1>
        <p className="text-xs text-secondary-450 dark:text-secondary-400 mt-1">
          {isOwner
            ? 'Manage scheduler requests submitted by prospective tenants to tour your listings.'
            : 'Track the status of scheduled visits and tours you requested.'}
        </p>
      </div>

      {isLoading ? (
        <div className="py-12 text-center text-xs text-secondary-400">Loading visit requests...</div>
      ) : error ? (
        <div className="p-4 bg-error-500/10 text-error-750 text-xs font-bold rounded-xl">
          Failed to load visit requests.
        </div>
      ) : visits?.length === 0 ? (
        <Card className="py-16 text-center space-y-4 max-w-md mx-auto border-secondary-200/50">
          <div className="p-4 bg-secondary-100 dark:bg-secondary-900 rounded-full w-fit mx-auto">
            <Calendar className="h-8 w-8 text-secondary-400" />
          </div>
          <div>
            <h3 className="font-extrabold text-base text-secondary-900 dark:text-white">No visit requests</h3>
            <p className="text-xs text-secondary-450 dark:text-secondary-400 mt-1 max-w-[280px] mx-auto">
              {isOwner
                ? 'Your listings have no tour requests scheduled yet.'
                : 'You have not scheduled any rental property visits.'}
            </p>
          </div>
        </Card>
      ) : (
        <div className="space-y-4 animate-fade-in">
          {visits.map((visit) => {
            const prop = visit.propertyId || { title: 'Unknown Property', location: {} };
            const counterparty = isOwner ? visit.tenantId : visit.ownerId;
            const formattedDate = new Date(visit.date).toLocaleDateString(undefined, {
              weekday: 'short',
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            });

            return (
              <Card key={visit.id || visit._id} className="p-5 border-secondary-200/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
                  <div className="space-y-1">
                    <h4 className="text-xs font-extrabold text-secondary-900 dark:text-white leading-tight">{prop.title}</h4>
                    <p className="text-[10px] text-secondary-450 flex items-center font-semibold mt-1">
                      <MapPin className="h-3 w-3 mr-1 text-secondary-450" />
                      {prop.location?.area || 'Sector 62'}, {prop.location?.city || 'Noida'}
                    </p>
                    
                    <div className="flex items-center space-x-3 text-[10px] font-bold text-secondary-500 pt-2">
                      <span className="flex items-center"><Calendar className="h-3.5 w-3.5 mr-1 text-primary-500" /> {formattedDate}</span>
                      <span className="flex items-center"><Clock className="h-3.5 w-3.5 mr-1 text-primary-500" /> {visit.time}</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap md:flex-nowrap items-center justify-between md:justify-end gap-4 border-t md:border-t-0 pt-3 md:pt-0">
                  {counterparty && (
                    <div className="flex items-center space-x-2.5 mr-4">
                      <Avatar src={counterparty.avatar} name={counterparty.name} size="sm" />
                      <div>
                        <span className="text-[9px] text-secondary-400 uppercase tracking-wider block font-bold">{isOwner ? 'Tenant' : 'Landlord'}</span>
                        <span className="text-xs font-extrabold text-secondary-800 dark:text-white leading-none">{counterparty.name}</span>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center space-x-3">
                    <Badge
                      variant={visit.status === 'accepted' ? 'success' : visit.status === 'rejected' ? 'danger' : 'warning'}
                      className="capitalize font-black px-2.5 text-[10px]"
                    >
                      {visit.status}
                    </Badge>

                    {isOwner && visit.status === 'pending' && (
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-success-650 border-success-100 hover:bg-success-50/10 p-1.5"
                          onClick={() => handleUpdateStatus(visit.id || visit._id, 'accepted')}
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-error-650 border-error-100 hover:bg-error-50/10 p-1.5"
                          onClick={() => handleUpdateStatus(visit.id || visit._id, 'rejected')}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default VisitRequests;
