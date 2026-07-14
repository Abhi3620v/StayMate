import React, { lazy } from 'react';

// Lazy load route shells
export const MarketplacePage = lazy(() => import('../pages/Marketplace.jsx').catch(() => ({ default: () => <div>Marketplace Stub</div> })));
export const DetailPage = lazy(() => import('../pages/Detail.jsx').catch(() => ({ default: () => <div>Listing Details Stub</div> })));
export const OwnerListPage = lazy(() => import('../pages/OwnerList.jsx').catch(() => ({ default: () => <div>Owner Property List Stub</div> })));
export const CreateWizardPage = lazy(() => import('../pages/CreateWizard.jsx').catch(() => ({ default: () => <div>Create Property Wizard Stub</div> })));
export const EditPage = lazy(() => import('../pages/Edit.jsx').catch(() => ({ default: () => <div>Edit Listing Stub</div> })));
export const PreviewPage = lazy(() => import('../pages/Preview.jsx').catch(() => ({ default: () => <div>Listing Live Preview Stub</div> })));
export const AnalyticsPage = lazy(() => import('../pages/Analytics.jsx').catch(() => ({ default: () => <div>Listing Analytics Stub</div> })));

export const AdminListPage = lazy(() => import('../pages/AdminList.jsx'));
export const AdminReviewPage = lazy(() => import('../pages/AdminReview.jsx'));
export const AdminAnalyticsPage = lazy(() => import('../pages/AdminAnalytics.jsx'));

/**
 * Standardized routing constants mapping clean URL conventions
 */
export const PROPERTY_MODULE_ROUTES = {
  // Public
  MARKETPLACE: '/properties',
  DETAIL: '/properties/:slug',
  
  // Owner Console (Standardized: modular prefix removed)
  OWNER_LIST: '/owner/properties',
  OWNER_CREATE: '/owner/properties/create',
  OWNER_DETAIL: '/owner/properties/:id',
  OWNER_EDIT: '/owner/properties/:id/edit',
  OWNER_PREVIEW: '/owner/properties/:id/preview',
  OWNER_ANALYTICS: '/owner/properties/:id/analytics',

  // Admin Console (Standardized: modular prefix removed)
  ADMIN_LIST: '/admin/properties',
  ADMIN_PENDING: '/admin/properties/pending',
  ADMIN_DETAIL: '/admin/properties/:id',
  ADMIN_REVIEW: '/admin/properties/:id/review'
};
export default PROPERTY_MODULE_ROUTES;
