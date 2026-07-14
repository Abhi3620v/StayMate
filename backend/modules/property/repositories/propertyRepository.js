import mongoose from 'mongoose';
import Property from '../../../models/Property.js';
import { mockProperties } from '../../../config/inMemoryDb.js';

const isDbConnected = () => mongoose.connection.readyState === 1;

import { haversineDistance } from '../../location/services/GoogleMapsService.js';

class PropertyRepository {
  async create(data) {
    if (isDbConnected()) {
      const property = new Property(data);
      return await property.save();
    } else {
      const mockProp = {
        _id: new mongoose.Types.ObjectId().toString(),
        ...data,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      mockProperties.push(mockProp);
      return mockProp;
    }
  }

  async findById(id, includeSoftDeleted = false) {
    if (isDbConnected()) {
      const query = Property.findById(id);
      if (!includeSoftDeleted) {
        query.where({ status: { $ne: 'soft_deleted' } });
      }
      return await query.populate('ownerId', 'name email avatar');
    } else {
      const prop = mockProperties.find(p => String(p._id) === String(id));
      if (!prop) return null;
      if (prop.status === 'soft_deleted' && !includeSoftDeleted) return null;
      return prop;
    }
  }

  async findByIdAndUpdate(id, data, modifierId = null) {
    const updateData = { ...data };
    
    // Automatically increment version metadata and stamp editors if updating
    if (modifierId) {
      updateData.$inc = updateData.$inc || {};
      updateData.$inc['version.versionNumber'] = 1;
      updateData['version.lastModifiedBy'] = modifierId;
      updateData['version.lastModifiedAt'] = new Date();
      updateData['metadata.updatedBy'] = modifierId;
      updateData['metadata.lastEditedAt'] = new Date();
    }

    if (isDbConnected()) {
      return await Property.findByIdAndUpdate(
        id,
        updateData,
        { new: true, runValidators: true }
      ).populate('ownerId', 'name email avatar');
    } else {
      const idx = mockProperties.findIndex(p => String(p._id) === String(id));
      if (idx === -1) return null;

      // Handle mock increments
      const currentVal = mockProperties[idx];
      const versionNumber = (currentVal.version?.versionNumber || 1) + (modifierId ? 1 : 0);

      mockProperties[idx] = {
        ...currentVal,
        ...data,
        version: {
          versionNumber,
          lastModifiedBy: modifierId || currentVal.version?.lastModifiedBy,
          lastModifiedAt: new Date()
        },
        metadata: {
          ...currentVal.metadata,
          updatedBy: modifierId || currentVal.metadata?.updatedBy,
          lastEditedAt: new Date()
        },
        updatedAt: new Date()
      };
      return mockProperties[idx];
    }
  }

  async find(filters = {}, options = {}, includeSoftDeleted = false) {
    const { sort = { createdAt: -1 }, limit = 20, skip = 0 } = options;
    const finalFilters = { ...filters };

    // Extract geo filtering options
    const geoLat = finalFilters.lat ? Number(finalFilters.lat) : null;
    const geoLng = finalFilters.lng ? Number(finalFilters.lng) : null;
    const geoRadius = finalFilters.radius ? Number(finalFilters.radius) : null;
    delete finalFilters.lat;
    delete finalFilters.lng;
    delete finalFilters.radius;

    if (!includeSoftDeleted) {
      finalFilters.status = finalFilters.status || { $ne: 'soft_deleted' };
    }

    if (isDbConnected()) {
      let query = Property.find(finalFilters).populate('ownerId', 'name email avatar');
      
      // Fetch all to perform Haversine filtration if radius search is active
      if (geoLat && geoLng && geoRadius) {
        let results = await query.sort(sort);
        results = results.filter(p => {
          const lat = p.location?.latitude;
          const lng = p.location?.longitude;
          if (!lat || !lng) return false;
          return haversineDistance(geoLat, geoLng, lat, lng) * 1000 <= geoRadius;
        });
        return results.slice(skip, skip + limit);
      }

      return await query.sort(sort).skip(skip).limit(limit);
    } else {
      let results = [...mockProperties];
      if (!includeSoftDeleted) {
        results = results.filter(p => p.status !== 'soft_deleted');
      }
      Object.keys(finalFilters).forEach(key => {
        if (key === 'status' && typeof finalFilters[key] === 'object') {
          return;
        }
        results = results.filter(p => String(p[key]) === String(finalFilters[key]));
      });

      if (geoLat && geoLng && geoRadius) {
        results = results.filter(p => {
          const lat = p.location?.latitude || p.latitude;
          const lng = p.location?.longitude || p.longitude;
          if (!lat || !lng) return false;
          return haversineDistance(geoLat, geoLng, lat, lng) * 1000 <= geoRadius;
        });
      }

      return results.slice(skip, skip + limit);
    }
  }

  async countDocuments(filters = {}, includeSoftDeleted = false) {
    const finalFilters = { ...filters };
    if (!includeSoftDeleted) {
      finalFilters.status = finalFilters.status || { $ne: 'soft_deleted' };
    }

    if (isDbConnected()) {
      return await Property.countDocuments(finalFilters);
    } else {
      let results = [...mockProperties];
      if (!includeSoftDeleted) {
        results = results.filter(p => p.status !== 'soft_deleted');
      }
      Object.keys(finalFilters).forEach(key => {
        if (key === 'status' && typeof finalFilters[key] === 'object') return;
        results = results.filter(p => String(p[key]) === String(finalFilters[key]));
      });
      return results.length;
    }
  }

  async incrementViews(id) {
    if (isDbConnected()) {
      return await Property.findByIdAndUpdate(
        id, 
        { 
          $inc: { 'statistics.views': 1 },
          $set: { 'metadata.lastViewedAt': new Date() }
        }, 
        { new: true }
      );
    } else {
      const prop = mockProperties.find(p => String(p._id) === String(id));
      if (prop) {
        prop.statistics = prop.statistics || {};
        prop.statistics.views = (prop.statistics.views || 0) + 1;
        prop.metadata = prop.metadata || {};
        prop.metadata.lastViewedAt = new Date();
      }
      return prop;
    }
  }

  // Soft delete wrapper
  async softDelete(id, userId) {
    const update = {
      status: 'soft_deleted',
      'metadata.deletedAt': new Date(),
      'metadata.deletedBy': userId
    };
    return await this.findByIdAndUpdate(id, update, userId);
  }

  // Hard delete (permanent, admin only)
  async hardDelete(id) {
    if (isDbConnected()) {
      return await Property.findByIdAndDelete(id);
    } else {
      const idx = mockProperties.findIndex(p => String(p._id) === String(id));
      if (idx !== -1) {
        return mockProperties.splice(idx, 1)[0];
      }
      return null;
    }
  }
}

export default new PropertyRepository();
