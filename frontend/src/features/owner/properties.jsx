import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import propertyService from '@/services/propertyService';
import {
  DashboardHeader, SectionHeader, DataTable, EmptyState, StatusBadge
} from '@/components/dashboard/index';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import {
  Plus, MapPin, Eye, Heart, Play, Copy, Trash2, ExternalLink, Home
} from 'lucide-react';
import toast from 'react-hot-toast';

const OwnerProperties = () => {
  const navigate = useNavigate();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchProperties = async () => {
    setLoading(true);
    try {
      const data = await propertyService.getOwnerProperties();
      setProperties(data || []);
    } catch {
      toast.error('Failed to load your properties.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProperties(); }, []);

  const handlePublish = async (prop) => {
    try {
      await propertyService.updateProperty(prop._id || prop.id, { ...prop, status: 'published' });
      toast.success('Property published!');
      fetchProperties();
    } catch { toast.error('Publish failed.'); }
  };

  const handleDuplicate = async (id) => {
    try {
      await propertyService.duplicateProperty(id);
      toast.success('Listing duplicated to draft.');
      fetchProperties();
    } catch { toast.error('Duplicate failed.'); }
  };

  const handleArchive = async (id) => {
    if (!window.confirm('Archive this listing?')) return;
    try {
      await propertyService.deleteProperty(id);
      toast.success('Listing archived.');
      fetchProperties();
    } catch { toast.error('Archive failed.'); }
  };

  const headers = ['Cover', 'Title / Location', 'Type', 'Rent', 'Status', 'Views / Saves', 'Actions'];

  if (loading) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="h-20 bg-secondary-100 dark:bg-secondary-900 rounded-[18px]" />
        <div className="h-64 bg-secondary-100 dark:bg-secondary-900 rounded-[18px]" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <DashboardHeader
        title="My Properties"
        subtitle={`${properties.length} total listings · ${properties.filter(p => p.status === 'published').length} active · ${properties.filter(p => p.status === 'draft').length} drafts`}
        breadcrumbs={['Console', 'My Properties']}
        actions={
          <Button variant="primary" className="font-bold text-[13px] h-11 px-5 rounded-xl" onClick={() => navigate('/owner/properties/create')}>
            <Plus className="h-4 w-4 mr-2" /> Add Property
          </Button>
        }
      />

      {properties.length === 0 ? (
        <EmptyState
          icon={<Home className="h-6 w-6" />}
          title="No Properties Listed"
          description="You haven't listed any properties yet. Create your first listing to start receiving tour requests."
          action={
            <Button variant="primary" className="font-bold text-[13px] h-11 px-5 rounded-xl" onClick={() => navigate('/owner/properties/create')}>
              Create Your First Listing
            </Button>
          }
        />
      ) : (
        <DataTable
          headers={headers}
          data={properties}
          renderRow={(prop) => {
            const cover = prop.images?.[0]?.url || 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=300&q=80';
            const rent = prop.pricing?.monthlyRent || prop.price || 0;
            return (
              <tr key={prop._id || prop.id} className="hover:bg-secondary-50/50 dark:hover:bg-secondary-900/40 transition-colors duration-150">
                <td className="px-5 py-3">
                  <div className="h-11 w-16 rounded-lg bg-secondary-100 dark:bg-secondary-800 overflow-hidden">
                    <img src={cover} alt="" className="h-full w-full object-cover" />
                  </div>
                </td>
                <td className="px-5 py-3">
                  <Link to={`/properties/${prop._id || prop.id}`} className="hover:text-primary-600 transition-colors">
                    <span className="font-bold text-[13px] text-secondary-900 dark:text-white line-clamp-1 block">{prop.title}</span>
                  </Link>
                  <span className="text-[11px] text-secondary-400 font-medium flex items-center mt-0.5">
                    <MapPin className="h-3 w-3 mr-0.5 shrink-0" /> {prop.location?.area}, {prop.location?.city}
                  </span>
                </td>
                <td className="px-5 py-3">
                  <Badge variant="secondary" className="text-[9px] font-bold capitalize px-2 py-0.5 rounded">
                    {prop.propertyType?.replace('_', ' ') || 'Flat'}
                  </Badge>
                </td>
                <td className="px-5 py-3 text-[13px] font-bold text-secondary-900 dark:text-white">
                  ₹{rent.toLocaleString()}<span className="text-[10px] text-secondary-400 font-medium">/mo</span>
                </td>
                <td className="px-5 py-3"><StatusBadge status={prop.status} /></td>
                <td className="px-5 py-3">
                  <div className="flex items-center space-x-3 text-[12px] text-secondary-600 font-semibold">
                    <span className="flex items-center"><Eye className="h-3.5 w-3.5 mr-1 text-secondary-400" />{prop.statistics?.views || 0}</span>
                    <span className="flex items-center"><Heart className="h-3.5 w-3.5 mr-1 text-secondary-400" />{prop.statistics?.favorites || 0}</span>
                  </div>
                </td>
                <td className="px-5 py-3">
                  <div className="flex items-center space-x-1.5">
                    <Link to={`/properties/${prop._id || prop.id}`} className="p-1.5 rounded-lg border border-secondary-200 text-secondary-500 hover:text-primary-600 hover:border-primary-200 transition-colors" title="Preview">
                      <ExternalLink className="h-3.5 w-3.5" />
                    </Link>
                    {prop.status === 'draft' && (
                      <button onClick={() => handlePublish(prop)} className="p-1.5 rounded-lg border border-secondary-200 text-secondary-500 hover:text-success-600 hover:border-success-200 transition-colors" title="Publish">
                        <Play className="h-3.5 w-3.5 fill-current" />
                      </button>
                    )}
                    <button onClick={() => handleDuplicate(prop._id || prop.id)} className="p-1.5 rounded-lg border border-secondary-200 text-secondary-500 hover:text-primary-600 hover:border-primary-200 transition-colors" title="Duplicate">
                      <Copy className="h-3.5 w-3.5" />
                    </button>
                    <button onClick={() => handleArchive(prop._id || prop.id)} className="p-1.5 rounded-lg border border-secondary-200 text-secondary-500 hover:text-error-600 hover:border-error-200 transition-colors" title="Archive">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            );
          }}
        />
      )}
    </div>
  );
};

export default OwnerProperties;
