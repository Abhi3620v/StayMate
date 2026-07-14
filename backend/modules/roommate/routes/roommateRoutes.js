import express from 'express';
import roommateController from '../controllers/roommateController.js';
import { protect, checkAccess } from '../../../middlewares/authMiddleware.js';

const router = express.Router();

// Apply auth middleware to protect roommate actions
router.use(protect);

// Admin Moderation Endpoints (Prioritized before detail routes)
router.get('/reports', checkAccess({ roles: ['admin', 'moderator'] }), roommateController.getReports);
router.post('/reports/:id/resolve', checkAccess({ roles: ['admin', 'moderator'] }), roommateController.resolveReport);

// Profile CRUD
router.get('/me', roommateController.getMyProfile);
router.post('/', roommateController.createProfile);
router.put('/', roommateController.updateProfile);
router.delete('/', roommateController.deleteProfile);

// Discovery matches feed
router.get('/', roommateController.discoverMatches);

// Requests workflow
router.get('/requests', roommateController.getMatchesDashboard);
router.post('/requests', roommateController.sendRequest);
router.post('/requests/:id/accept', roommateController.acceptRequest);
router.post('/requests/:id/reject', roommateController.rejectRequest);
router.post('/requests/:id/cancel', roommateController.cancelRequest);
router.delete('/requests/:id', roommateController.removeMatch);

// Favorites and Recent views
router.get('/favorites', roommateController.getFavorites);
router.post('/favorites/:id', roommateController.toggleFavorite);
router.get('/views', roommateController.getRecentViews);

// Submit report
router.post('/reports', roommateController.reportProfile);

// Get detailed roommate profile by profile ID
router.get('/:id', roommateController.getProfileById);

export default router;
