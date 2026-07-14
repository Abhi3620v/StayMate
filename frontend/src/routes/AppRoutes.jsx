import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { RoommateProvider } from '@/context/RoommateContext';
import { NotificationProvider } from '@/modules/notification/context/NotificationContext';
import MainLayout from '@/layouts/MainLayout';
import AuthLayout from '@/layouts/AuthLayout';
import DashboardLayout from '@/layouts/DashboardLayout';
import ErrorLayout from '@/layouts/ErrorLayout';
import PageLoader from '@/components/shared/PageLoader';
import ErrorBoundary from '@/components/shared/ErrorBoundary';
import NotFoundPage from '@/components/shared/NotFoundPage';
import PublicRoute from '@/components/shared/PublicRoute';

// Lazy loading feature views
const Home = lazy(() => import('@/features/home/index'));
const Properties = lazy(() => import('@/features/property/index'));
const PropertyDetails = lazy(() => import('@/features/property/details'));
const Roommates = lazy(() => import('@/features/roommate/index'));
const RoommateDashboard = lazy(() => import('@/features/roommate/dashboard'));
const RoommateDetails = lazy(() => import('@/features/roommate/details'));
const Login = lazy(() => import('@/features/auth/login'));
const Register = lazy(() => import('@/features/auth/register'));
const ForgotPassword = lazy(() => import('@/features/auth/forgot-password'));
const ResetPassword = lazy(() => import('@/features/auth/reset-password'));
const VerifyEmail = lazy(() => import('@/features/auth/verify-email'));
const Profile = lazy(() => import('@/features/profile/index'));
const Wishlist = lazy(() => import('@/features/wishlist/index'));
const Chat = lazy(() => import('@/features/chat/index'));
const OwnerDashboard = lazy(() => import('@/features/owner/index'));
const OwnerProperties = lazy(() => import('@/features/owner/properties'));
const OwnerAnalytics = lazy(() => import('@/features/owner/analytics'));
const OwnerReviews = lazy(() => import('@/features/owner/reviews'));
const TenantDashboard = lazy(() => import('@/features/tenant/Dashboard'));
const AdminDashboard = lazy(() => import('@/features/admin/index'));
const CreateProperty = lazy(() => import('@/features/property/create'));
import { 
  OwnerListPage, 
  CreateWizardPage, 
  EditPage, 
  PreviewPage, 
  AnalyticsPage, 
  AdminListPage, 
  AdminReviewPage,
  AdminAnalyticsPage
} from '@/modules/property/routes/propertyRoutes.jsx';
const VisitRequests = lazy(() => import('@/features/property/visits'));

// Notifications Module Pages
const NotificationsPage = lazy(() => import('@/modules/notification/pages/NotificationsPage'));
const ActivityPage = lazy(() => import('@/modules/notification/pages/ActivityPage'));

// Platform Module Pages
const SystemHealthPage = lazy(() => import('@/modules/platform/pages/SystemHealthPage'));
const AuditManagementPage = lazy(() => import('@/modules/platform/pages/AuditManagementPage'));
const PerformancePage = lazy(() => import('@/modules/platform/pages/PerformancePage'));
const GlobalSearchPage = lazy(() => import('@/modules/platform/pages/GlobalSearchPage'));

// Payment Module Pages
const PaymentHistoryPage = lazy(() => import('@/modules/payment/pages/PaymentHistoryPage'));
const PaymentAnalyticsPage = lazy(() => import('@/modules/payment/pages/PaymentAnalyticsPage'));

import { PlatformProvider } from '@/modules/platform/context/PlatformContext';
import { PaymentProvider } from '@/modules/payment/context/PaymentContext';
import { LocationProvider } from '@/modules/location/context/LocationContext';

/**
 * Access Control Protected Route Guard.
 * Evaluates both RBAC (Roles) and PBAC (Permissions).
 */
const ProtectedRoute = ({ children, allowedRoles, allowedPermissions }) => {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) return <PageLoader />;

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // 1. Evaluate allowed roles
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  // 2. Evaluate allowed permissions
  if (allowedPermissions) {
    const GUEST_PERMISSIONS = ['property:view', 'roommate:view'];
    const TENANT_PERMISSIONS = [...GUEST_PERMISSIONS, 'wishlist:create', 'wishlist:delete', 'chat:send', 'review:create', 'review:update', 'report:create', 'visit:create', 'dashboard:view', 'user:update'];
    const OWNER_PERMISSIONS = [...TENANT_PERMISSIONS, 'property:create', 'property:update', 'property:delete', 'visit:approve', 'visit:reject', 'analytics:view'];
    const MODERATOR_PERMISSIONS = [...OWNER_PERMISSIONS, 'chat:delete', 'chat:moderate', 'review:delete', 'report:review', 'report:resolve', 'property:suspend', 'user:suspend'];
    const ADMIN_PERMISSIONS = [...MODERATOR_PERMISSIONS, 'property:verify', 'property:feature', 'user:verify', 'role:update', 'settings:update', 'notification:send', 'notification:delete'];

    const rolePermissionsMap = {
      guest: GUEST_PERMISSIONS,
      tenant: TENANT_PERMISSIONS,
      owner: OWNER_PERMISSIONS,
      moderator: MODERATOR_PERMISSIONS,
      admin: ADMIN_PERMISSIONS,
    };

    const rolePermissions = rolePermissionsMap[user.role.toLowerCase()] || [];
    const customPermissions = user.customPermissions || [];
    const userPermissionsUnion = new Set([...rolePermissions, ...customPermissions]);

    const hasPermission = allowedPermissions.some((p) => userPermissionsUnion.has(p));
    if (!hasPermission) {
      return <Navigate to="/" replace />;
    }
  }

  return children;
};

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <ErrorBoundary>
        <Suspense fallback={<PageLoader />}>
          <PlatformProvider>
            <PaymentProvider>
              <LocationProvider>
                <RoommateProvider>
                  <NotificationProvider>
                <Routes>
                  {/* Public/Protected Main Site Layout */}
                  <Route element={<MainLayout />}>
                    <Route path="/" element={<Home />} />
                    <Route path="/properties" element={<Properties />} />
                    <Route path="/properties/:id" element={<PropertyDetails />} />
                    <Route path="/roommates" element={<Roommates />} />
                    <Route path="/roommates/dashboard" element={
                      <ProtectedRoute>
                        <RoommateDashboard />
                      </ProtectedRoute>
                    } />
                    <Route path="/roommates/:id" element={
                      <ProtectedRoute>
                        <RoommateDetails />
                      </ProtectedRoute>
                    } />
                    
                    {/* Authenticated user routes */}
                    <Route path="/profile" element={
                      <ProtectedRoute>
                        <Profile />
                      </ProtectedRoute>
                    } />
                    <Route path="/wishlist" element={
                      <ProtectedRoute>
                        <Wishlist />
                      </ProtectedRoute>
                    } />
                    <Route path="/properties/create" element={
                      <ProtectedRoute>
                        <CreateProperty />
                      </ProtectedRoute>
                    } />
                    <Route path="/properties/visits" element={
                      <ProtectedRoute>
                        <VisitRequests />
                      </ProtectedRoute>
                    } />
                    <Route path="/chat" element={
                      <ProtectedRoute>
                        <Chat />
                      </ProtectedRoute>
                    } />
                    <Route path="/search" element={
                      <ProtectedRoute>
                        <GlobalSearchPage />
                      </ProtectedRoute>
                    } />
                  </Route>

                  {/* Shared Notifications and Activity Dashboard routes */}
                  <Route element={
                    <ProtectedRoute allowedRoles={['tenant', 'owner', 'admin']}>
                      <DashboardLayout />
                    </ProtectedRoute>
                  }>
                    <Route path="/notifications" element={<NotificationsPage />} />
                    <Route path="/activity" element={<ActivityPage />} />
                    <Route path="/payments/history" element={<PaymentHistoryPage />} />
                  </Route>

                  {/* Auth split layout */}
                  <Route element={<AuthLayout />}>
                    <Route path="/login" element={
                      <PublicRoute>
                        <Login />
                      </PublicRoute>
                    } />
                    <Route path="/register" element={
                      <PublicRoute>
                        <Register />
                      </PublicRoute>
                    } />
                    <Route path="/forgot-password" element={
                      <PublicRoute>
                        <ForgotPassword />
                      </PublicRoute>
                    } />
                    <Route path="/reset-password" element={
                      <PublicRoute>
                        <ResetPassword />
                      </PublicRoute>
                    } />
                    <Route path="/verify-email" element={<VerifyEmail />} />
                  </Route>

                  {/* Owner Landlord console */}
                  <Route path="/owner" element={
                    <ProtectedRoute allowedRoles={['owner', 'moderator', 'admin']}>
                      <DashboardLayout />
                    </ProtectedRoute>
                  }>
                    <Route path="dashboard" element={<OwnerDashboard />} />
                    {/* Standardized Property Management Routes */}
                    <Route path="properties" element={<OwnerListPage />} />
                    <Route path="properties/create" element={<CreateWizardPage />} />
                    <Route path="properties/:id/edit" element={<EditPage />} />
                    <Route path="properties/:id/preview" element={<PreviewPage />} />
                    <Route path="properties/:id/analytics" element={<AnalyticsPage />} />
                    <Route path="analytics" element={<OwnerAnalytics />} />
                    <Route path="reviews" element={<OwnerReviews />} />
                    <Route path="visits" element={<VisitRequests />} />
                    <Route path="chat" element={<Chat />} />
                  </Route>

                  {/* Tenant Console */}
                  <Route path="/tenant" element={
                    <ProtectedRoute allowedRoles={['tenant', 'moderator', 'admin']}>
                      <DashboardLayout />
                    </ProtectedRoute>
                  }>
                    <Route path="dashboard" element={<TenantDashboard />} />
                    <Route path="wishlist" element={<Wishlist />} />
                    <Route path="visits" element={<VisitRequests />} />
                    <Route path="chat" element={<Chat />} />
                  </Route>

                  {/* Admin Console */}
                  <Route path="/admin" element={
                    <ProtectedRoute allowedRoles={['admin', 'moderator']}>
                      <DashboardLayout />
                    </ProtectedRoute>
                  }>
                    <Route path="dashboard" element={<AdminDashboard />} />
                    <Route path="users" element={<AdminDashboard />} />
                    <Route path="verifications" element={<AdminDashboard />} />
                    <Route path="moderation" element={<AdminDashboard />} />
                    <Route path="reports" element={<AdminDashboard />} />
                    <Route path="reviews" element={<AdminDashboard />} />
                    <Route path="broadcast" element={<AdminDashboard />} />
                    <Route path="audit-logs" element={<AuditManagementPage />} />
                    <Route path="system-health" element={<SystemHealthPage />} />
                    <Route path="performance" element={<PerformancePage />} />
                    {/* Standardized Admin Property Moderation Routes */}
                    <Route path="properties" element={<AdminListPage />} />
                    <Route path="properties/:id/review" element={<AdminReviewPage />} />
                    <Route path="analytics" element={<AdminAnalyticsPage />} />
                    <Route path="property-analytics" element={<AdminAnalyticsPage />} />
                    <Route path="payment-analytics" element={<PaymentAnalyticsPage />} />
                  </Route>

                  {/* System/Error handling fallback routes */}
                  <Route element={<ErrorLayout />}>
                    <Route path="500" element={<div>Server Error page</div>} />
                    <Route path="*" element={<NotFoundPage />} />
                  </Route>
                </Routes>
                  </NotificationProvider>
                </RoommateProvider>
              </LocationProvider>
            </PaymentProvider>
          </PlatformProvider>
      </Suspense>
    </ErrorBoundary>
  </BrowserRouter>
  );
};

export default AppRoutes;
