import express from 'express';
import { protect, checkAccess } from '../../../middlewares/authMiddleware.js';
import locationController from '../controllers/locationController.js';

const router = express.Router();

// Public MapREST query routes
router.get('/autocomplete', locationController.getAutocomplete);
router.get('/geocode', locationController.geocode);
router.get('/reverse-geocode', locationController.reverseGeocode);
router.get('/nearby', locationController.getNearby);

// Protected loggers and dashboards
router.post('/analytics/log', protect, locationController.logMetric);

router.get(
  '/analytics/owner',
  protect,
  checkAccess({ roles: ['owner', 'admin'] }),
  locationController.getOwnerAnalytics
);

router.get(
  '/analytics/admin',
  protect,
  checkAccess({ roles: ['admin'] }),
  locationController.getAdminAnalytics
);

export default router;
