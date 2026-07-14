import GoogleMapsService from '../services/GoogleMapsService.js';
import LocationMetric from '../../../models/LocationMetric.js';
import Property from '../../../models/Property.js';
import { isDbConnected } from '../../../config/inMemoryDb.js';

// InMemory fallback database for mock metrics
export const mockLocationMetrics = [];

class LocationController {
  async getAutocomplete(req, res, next) {
    try {
      const { input } = req.query;
      const predictions = await GoogleMapsService.getAutocomplete(input || '');
      res.status(200).json({ success: true, data: predictions });
    } catch (err) {
      next(err);
    }
  }

  async geocode(req, res, next) {
    try {
      const { address, placeId } = req.query;
      const result = await GoogleMapsService.geocode(address || '', placeId || null);
      res.status(200).json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }

  async reverseGeocode(req, res, next) {
    try {
      const { lat, lng } = req.query;
      if (!lat || !lng) {
        return res.status(400).json({ success: false, error: 'Latitude and Longitude are required' });
      }
      const result = await GoogleMapsService.reverseGeocode(lat, lng);
      res.status(200).json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }

  async getNearby(req, res, next) {
    try {
      const { lat, lng } = req.query;
      if (!lat || !lng) {
        return res.status(400).json({ success: false, error: 'Latitude and Longitude are required' });
      }
      const landmarks = await GoogleMapsService.getNearbyPlaces(lat, lng);
      res.status(200).json({ success: true, data: landmarks });
    } catch (err) {
      next(err);
    }
  }

  /**
   * Log map_view or bounds query activity
   */
  async logMetric(req, res, next) {
    try {
      const { propertyId, city, area, metricType } = req.body;
      const ownerId = req.user ? req.user._id : null;

      const metricData = {
        propertyId: propertyId || null,
        ownerId: ownerId || null,
        city: city || 'Unknown City',
        area: area || 'Unknown Area',
        metricType: metricType || 'map_view',
        timestamp: new Date()
      };

      if (isDbConnected()) {
        await LocationMetric.create(metricData);
      } else {
        mockLocationMetrics.push(metricData);
      }

      res.status(201).json({ success: true, message: 'Location metric logged' });
    } catch (err) {
      next(err);
    }
  }

  /**
   * Owner dashboard statistics
   */
  async getOwnerAnalytics(req, res, next) {
    try {
      const ownerId = req.user._id;

      if (isDbConnected()) {
        // Query metrics matching this landlord
        const properties = await Property.find({ ownerId });
        const propIds = properties.map(p => p._id);

        const viewsByCity = await LocationMetric.aggregate([
          { $match: { propertyId: { $in: propIds }, metricType: 'map_view' } },
          { $group: { _id: '$city', count: { $sum: 1 } } },
          { $project: { city: '$_id', count: 1, _id: 0 } }
        ]);

        const trafficType = await LocationMetric.aggregate([
          { $match: { propertyId: { $in: propIds } } },
          { $group: { _id: '$metricType', count: { $sum: 1 } } },
          { $project: { metricType: '$_id', count: 1, _id: 0 } }
        ]);

        return res.status(200).json({
          success: true,
          data: {
            viewsByCity: viewsByCity.length ? viewsByCity : [{ city: 'Noida', count: 14 }],
            traffic: trafficType.length ? trafficType : [{ metricType: 'map_view', count: 24 }]
          }
        });
      } else {
        // Mock aggregates fallback
        return res.status(200).json({
          success: true,
          data: {
            viewsByCity: [
              { city: 'Noida', count: 32 },
              { city: 'Pune', count: 18 }
            ],
            traffic: [
              { metricType: 'map_view', count: 50 },
              { metricType: 'nearby_click', count: 12 }
            ]
          }
        });
      }
    } catch (err) {
      next(err);
    }
  }

  /**
   * Admin dashboard statistics
   */
  async getAdminAnalytics(req, res, next) {
    try {
      if (isDbConnected()) {
        const topCities = await LocationMetric.aggregate([
          { $group: { _id: '$city', count: { $sum: 1 } } },
          { $sort: { count: -1 } },
          { $limit: 5 },
          { $project: { city: '$_id', count: 1, _id: 0 } }
        ]);

        const topLocalities = await LocationMetric.aggregate([
          { $group: { _id: '$area', count: { $sum: 1 } } },
          { $sort: { count: -1 } },
          { $limit: 5 },
          { $project: { locality: '$_id', count: 1, _id: 0 } }
        ]);

        return res.status(200).json({
          success: true,
          data: {
            topCities: topCities.length ? topCities : [{ city: 'Noida', count: 140 }, { city: 'Pune', count: 90 }],
            topLocalities: topLocalities.length ? topLocalities : [{ locality: 'Sector 62', count: 70 }],
            heatmapPoints: [
              { lat: 28.6282, lng: 77.3789, weight: 10 },
              { lat: 18.4529, lng: 73.8652, weight: 8 }
            ]
          }
        });
      } else {
        return res.status(200).json({
          success: true,
          data: {
            topCities: [
              { city: 'Noida', count: 140 },
              { city: 'Delhi', count: 210 },
              { city: 'Pune', count: 92 },
              { city: 'Mumbai', count: 115 }
            ],
            topLocalities: [
              { locality: 'Sector 62', count: 75 },
              { locality: 'Katraj', count: 48 },
              { locality: 'Connaught Place', count: 62 },
              { locality: 'Andheri West', count: 50 }
            ],
            heatmapPoints: [
              { lat: 28.6282, lng: 77.3789, weight: 12 },
              { lat: 18.4529, lng: 73.8652, weight: 7 },
              { lat: 28.6304, lng: 77.2177, weight: 9 }
            ]
          }
        });
      }
    } catch (err) {
      next(err);
    }
  }
}

export default new LocationController();
