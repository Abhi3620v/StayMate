import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '@/context/AuthContext';
import { useNotification } from '@/modules/notification/context/NotificationContext';
import authService from '@/services/authService';
import userService from '@/services/userService';
import Card from '@/components/ui/Card';
import Avatar from '@/components/ui/Avatar';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Textarea from '@/components/ui/Textarea';
import ProgressBar from '@/components/ui/ProgressBar';
import Alert from '@/components/ui/Alert';
import Skeleton from '@/components/ui/Skeleton';
import EmptyState from '@/components/ui/EmptyState';
import { 
  Settings, User, KeyRound, ShieldAlert, Monitor, Palette, Bell, Languages, ShieldCheck, 
  Trash2, Eye, EyeOff, Upload, Chrome, Fingerprint, Lock, ShieldAlert as WarningIcon, RefreshCw,
  PlusCircle, Edit3, CheckCircle, Smartphone, MoreVertical, Star, Camera, Sparkles
} from 'lucide-react';
import { cn } from '@/utils/cn';
import toast from 'react-hot-toast';
import axios from 'axios';

const profileSchema = z.object({
  name: z.string().trim().min(2, 'Name must contain at least 2 characters'),
  username: z.string().trim().min(3, 'Username must contain at least 3 characters'),
  phone: z.string().trim().regex(/^\+?[0-9]{10,14}$/, 'Please provide a valid 10-14 digit phone number').or(z.literal('')),
  bio: z.string().max(300, 'Bio cannot exceed 300 characters').optional(),
  avatar: z.string().or(z.literal('')),
  preferences: z.object({
    theme: z.enum(['light', 'dark', 'system']),
    language: z.string(),
  }),
});

const passwordSchema = z
  .object({
    oldPassword: z.string().min(1, 'Current password is required'),
    newPassword: z
      .string()
      .min(6, 'Password must be at least 6 characters')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
      .regex(/[0-9]/, 'Password must contain at least one number'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

const Profile = () => {
  const { user, completeness, updateProfile, deleteAccount, logout } = useAuth();
  const { preferences, updatePreferences } = useNotification();
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'personal'); // 'personal', 'security', 'sessions', 'devices', 'appearance', 'danger', 'notifications', 'reviews'

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  // Security Form States
  const [passwordsLoading, setPasswordsLoading] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState('');

  // Active Sessions States
  const [sessions, setSessions] = useState([]);
  const [sessionsLoading, setSessionsLoading] = useState(false);

  // Trusted Devices States
  const [devices, setDevices] = useState([]);
  const [devicesLoading, setDevicesLoading] = useState(false);
  const [editingDeviceId, setEditingDeviceId] = useState(null);
  const [editDeviceName, setEditDeviceName] = useState('');

  // Cloudinary Uploader States
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Fetch sessions
  const fetchActiveSessions = async () => {
    setSessionsLoading(true);
    try {
      const data = await authService.getSessions();
      setSessions(data || []);
    } catch (err) {
      toast.error('Failed to retrieve active sessions.');
    } finally {
      setSessionsLoading(false);
    }
  };

  // Reviews & Reputation States
  const [reviewsList, setReviewsList] = useState([]);
  const [reviewsListLoading, setReviewsListLoading] = useState(false);
  const [reputationScore, setReputationScore] = useState(null);

  useEffect(() => {
    const fetchReviewsData = async () => {
      if (activeTab !== 'reviews') return;
      setReviewsListLoading(true);
      try {
        const token = localStorage.getItem('accessToken');
        const baseUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
        
        const [repRes, reviewsRes] = await Promise.all([
          axios.get(`${baseUrl}/api/v1/reviews/reputation/${user?.id || user?._id}`, {
            headers: { Authorization: token ? `Bearer ${token}` : '' }
          }),
          axios.get(`${baseUrl}/api/v1/reviews?targetType=user&targetId=${user?.id || user?._id}`, {
            headers: { Authorization: token ? `Bearer ${token}` : '' }
          })
        ]);
        
        setReputationScore(repRes.data.data);
        setReviewsList(reviewsRes.data.data || []);
      } catch (err) {
        console.warn('Failed to retrieve reviews/reputation data:', err.message);
      } finally {
        setReviewsListLoading(false);
      }
    };
    fetchReviewsData();
  }, [activeTab, user]);

  // Fetch trusted devices
  const fetchTrustedDevices = async () => {
    setDevicesLoading(true);
    try {
      const data = await authService.getDevices();
      setDevices(data || []);
    } catch (err) {
      toast.error('Failed to retrieve trusted devices.');
    } finally {
      setDevicesLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'sessions') {
      fetchActiveSessions();
    } else if (activeTab === 'devices') {
      fetchTrustedDevices();
    }
  }, [activeTab]);

  // Profile form
  const {
    register: registerProfile,
    handleSubmit: handleProfileSubmit,
    setValue: setProfileValue,
    formState: { errors: profileErrors, isSubmitting: profileSubmitting },
  } = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || '',
      username: user?.username || `user_${user?.id?.slice(-6) || ''}`,
      phone: user?.phone || '',
      bio: user?.bio || '',
      avatar: user?.avatar || '',
      preferences: {
        theme: user?.preferences?.theme || 'light',
        language: user?.preferences?.language || 'en',
      },
    },
  });

  // Password form
  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    control: passwordControl,
    reset: resetPasswordForm,
    formState: { errors: passwordErrors },
  } = useForm({
    resolver: zodResolver(passwordSchema),
  });

  const newPasswordVal = useWatch({ control: passwordControl, name: 'newPassword', defaultValue: '' });

  const getPasswordStrength = (pass) => {
    if (!pass) return { score: 0, text: 'No Password', color: 'bg-secondary-200' };
    let score = 0;
    if (pass.length >= 6) score += 20;
    if (pass.length >= 10) score += 20;
    if (/[A-Z]/.test(pass)) score += 20;
    if (/[a-z]/.test(pass)) score += 20;
    if (/[0-9]/.test(pass)) score += 20;

    let text = 'Weak';
    let color = 'bg-error-500';
    if (score >= 80) {
      text = 'Strong';
      color = 'bg-success-500';
    } else if (score >= 60) {
      text = 'Good';
      color = 'bg-primary-500';
    } else if (score >= 40) {
      text = 'Fair';
      color = 'bg-warning-500';
    }

    return { score, text, color };
  };

  const strength = getPasswordStrength(newPasswordVal);

  const getTabClass = (tabName) => {
    const isActive = activeTab === tabName;
    return cn(
      "flex items-center space-x-3 px-4 py-3 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer w-full select-none active:scale-[0.98] duration-normal",
      isActive
        ? "bg-primary-50/50 text-primary-700 dark:bg-primary-950/20 dark:text-primary-450 border-b-2 border-primary-500 lg:border-b-0 lg:border-l-4 lg:border-primary-500 lg:rounded-l-none rounded-b-none pl-4 lg:pl-3"
        : "text-secondary-600 dark:text-secondary-450 hover:bg-secondary-100/50 dark:hover:bg-secondary-800/40 hover:text-secondary-900 dark:hover:text-white"
    );
  };

  const onProfileSave = async (data) => {
    try {
      const cleanedData = { ...data };
      if (!cleanedData.avatar || cleanedData.avatar.trim() === '') {
        cleanedData.avatar = null;
      }
      if (!cleanedData.phone || cleanedData.phone.trim() === '') {
        cleanedData.phone = null;
      }
      if (!cleanedData.bio || cleanedData.bio.trim() === '') {
        cleanedData.bio = null;
      }
      await updateProfile(cleanedData);
    } catch (err) {
      // Handled by context
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Only image uploads are allowed.');
      return;
    }

    const formData = new FormData();
    formData.append('image', file);

    setUploadingImage(true);
    setUploadProgress(20);

    try {
      const interval = setInterval(() => {
        setUploadProgress((prev) => (prev >= 90 ? 90 : prev + 15));
      }, 150);

      const data = await userService.uploadProfilePicture(formData);
      clearInterval(interval);
      setUploadProgress(100);

      setProfileValue('avatar', data.avatar);
      await updateProfile({ avatar: data.avatar });
      toast.success('Profile picture updated successfully!');
    } catch (err) {
      toast.error(err.response?.data?.error?.message || 'Failed to upload image.');
    } finally {
      setTimeout(() => {
        setUploadingImage(false);
        setUploadProgress(0);
      }, 500);
    }
  };

  const onPasswordChange = async (data) => {
    setPasswordsLoading(true);
    try {
      await authService.changePassword({
        oldPassword: data.oldPassword,
        newPassword: data.newPassword,
      });
      toast.success('Password updated successfully! Sessions rotated.');
      resetPasswordForm();
    } catch (err) {
      toast.error(err.response?.data?.error?.message || 'Verification failed.');
    } finally {
      setPasswordsLoading(false);
    }
  };

  const handleRevokeSession = async (id) => {
    try {
      await authService.revokeSession(id);
      toast.success('Session terminated.');
      setSessions((prev) => prev.filter((s) => s.id !== id));
    } catch (err) {
      toast.error('Failed to revoke session.');
    }
  };

  const handleRevokeAllSessions = async () => {
    if (window.confirm('Log out of all other devices?')) {
      try {
        await authService.revokeAllSessions();
        toast.success('All other sessions terminated.');
        await logout();
      } catch (err) {
        toast.error('Failed to revoke sessions.');
      }
    }
  };

  // Trusted Devices Actions
  const handleTrustDevice = async (id) => {
    try {
      await authService.trustDevice(id);
      toast.success('Device added to trusted list.');
      setDevices((prev) =>
        prev.map((d) => (d.id === id ? { ...d, trustedStatus: 'trusted' } : d))
      );
    } catch (err) {
      toast.error('Failed to trust device.');
    }
  };

  const handleStartEditDevice = (device) => {
    setEditingDeviceId(device.id);
    setEditDeviceName(device.deviceName);
  };

  const handleSaveDeviceName = async (id) => {
    if (!editDeviceName.trim()) return;
    try {
      await authService.renameDevice(id, editDeviceName);
      toast.success('Device renamed.');
      setDevices((prev) =>
        prev.map((d) => (d.id === id ? { ...d, deviceName: editDeviceName } : d))
      );
      setEditingDeviceId(null);
    } catch (err) {
      toast.error('Failed to rename device.');
    }
  };

  const handleRemoveDevice = async (id) => {
    if (window.confirm('Remove this device from trusted list?')) {
      try {
        await authService.removeDevice(id);
        toast.success('Device removed.');
        setDevices((prev) => prev.filter((d) => d.id !== id));
      } catch (err) {
        toast.error('Failed to remove device.');
      }
    }
  };

  const onDeleteConfirm = async () => {
    if (deleteConfirm !== 'DELETE') {
      toast.error("Type 'DELETE' to authorize termination.");
      return;
    }
    if (window.confirm('Delete account permanently? Irreversible.')) {
      try {
        await deleteAccount();
      } catch (err) {
        // Handled
      }
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[50vh] px-4">
        <Card className="p-8 text-center max-w-md w-full border-secondary-200/50 shadow-xl rounded-3xl bg-white dark:bg-secondary-900">
          <div className="h-12 w-12 bg-secondary-100 dark:bg-secondary-800 rounded-full flex items-center justify-center text-secondary-400 mx-auto mb-4">
            <Lock className="h-5 w-5" />
          </div>
          <p className="text-sm font-bold text-secondary-700 dark:text-secondary-300">Log in to edit settings.</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-6xl mx-auto px-4 md:px-6 py-8 animate-fade-in">
      {/* Premium Profile Header Card */}
      <Card className="relative overflow-hidden border-secondary-200/50 dark:border-secondary-800/80 bg-white dark:bg-secondary-900 shadow-premium-md">
        {/* Cover Photo / Banner Gradient */}
        <div className="h-32 sm:h-44 md:h-48 w-full bg-gradient-to-r from-primary-400 via-primary-500 to-secondary-800 relative">
          <div className="absolute inset-0 bg-black/10 dark:bg-black/20" />
          <div className="absolute top-4 right-4 flex items-center space-x-2">
            <span className="text-[10px] md:text-xs font-bold text-white/80 bg-white/10 dark:bg-black/25 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-primary-300 animate-pulse" />
              StayMate Premium Profile
            </span>
          </div>
        </div>

        {/* Profile Info Bar */}
        <div className="px-6 pb-6 pt-16 md:pt-6 relative flex flex-col md:flex-row md:items-end justify-between gap-6">
          {/* Left Side: Avatar and Details */}
          <div className="flex flex-col md:flex-row items-center md:items-end text-center md:text-left gap-4 md:gap-6 -mt-20 md:-mt-24 z-10">
            <div className="relative group rounded-full border-4 border-white dark:border-secondary-900 shadow-xl bg-white dark:bg-secondary-900 shrink-0 overflow-hidden cursor-pointer">
              {/* Avatar Image Wrapper */}
              <div className="relative transition-transform duration-normal group-hover:scale-105">
                <Avatar 
                  src={user.avatar} 
                  name={user.name} 
                  style={{ width: '112px', height: '112px', fontSize: '32px' }} 
                  className="rounded-full"
                />
              </div>

              {/* Upload Hover Overlay */}
              <label className="absolute inset-0 flex flex-col items-center justify-center bg-secondary-950/60 backdrop-blur-xs text-white opacity-0 group-hover:opacity-100 transition-opacity duration-normal cursor-pointer z-20">
                <Camera className="h-5 w-5 mb-1 text-white" />
                <span className="text-[9px] font-extrabold tracking-wider uppercase">Update</span>
                <input 
                  type="file" 
                  onChange={handleImageUpload} 
                  className="hidden" 
                  accept="image/*" 
                  disabled={uploadingImage} 
                />
              </label>

              {/* Uploading Progress Overlay */}
              {uploadingImage && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-secondary-950/80 backdrop-blur-xs text-white z-30">
                  <div className="relative flex items-center justify-center">
                    <svg className="animate-spin h-10 w-10 text-primary-500" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span className="absolute text-[9px] font-extrabold">{uploadProgress}%</span>
                  </div>
                  <span className="text-[8px] font-bold text-secondary-300 uppercase tracking-widest mt-1.5">Uploading</span>
                </div>
              )}
            </div>

            {/* User Meta Data */}
            <div className="flex flex-col items-center md:items-start pt-2 md:pt-0">
              <div className="flex items-center flex-wrap justify-center md:justify-start gap-2">
                <h3 className="font-extrabold text-xl md:text-2xl text-secondary-900 dark:text-white leading-tight">
                  {user.name}
                </h3>
                {user.status === 'active' ? (
                  <div className="flex items-center space-x-1 bg-success-50 text-success-700 dark:bg-success-950/30 dark:text-success-450 border border-success-200/50 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold">
                    <ShieldCheck className="h-3.5 w-3.5 text-success-500" />
                    <span>Verified Member</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-1 bg-warning-50 text-warning-700 dark:bg-warning-950/30 dark:text-warning-450 border border-warning-200/50 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold">
                    <ShieldAlert className="h-3.5 w-3.5 text-warning-500" />
                    <span>Pending Verification</span>
                  </div>
                )}
              </div>

              <p className="text-xs text-secondary-500 dark:text-secondary-400 mt-1.5 flex flex-wrap items-center justify-center md:justify-start gap-x-2 gap-y-1 font-medium">
                <span>@{user.username}</span>
                <span className="h-1 w-1 bg-secondary-300 dark:bg-secondary-700 rounded-full hidden sm:inline-block" />
                <span>{user.email}</span>
              </p>

              <div className="flex items-center gap-2 mt-3">
                <Badge variant="primary" size="sm" className="capitalize font-extrabold px-3 py-1 bg-primary-100 text-primary-800 dark:bg-primary-950/40 dark:text-primary-350 border border-primary-200/10">
                  {user.role}
                </Badge>
                {user.googleId && (
                  <Badge variant="secondary" size="sm" className="font-extrabold px-3 py-1 flex items-center bg-secondary-100 text-secondary-700 dark:bg-secondary-800 dark:text-secondary-300 border border-secondary-200/50 dark:border-secondary-700/50">
                    <Chrome className="h-3.5 w-3.5 mr-1 text-error-500" />
                    Google Identity
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* Right Side: Profile Completeness Widget */}
          {completeness && (
            <div className="w-full md:w-64 bg-secondary-50/50 dark:bg-secondary-900/40 border border-secondary-200/40 dark:border-secondary-800/80 p-4 rounded-[20px] shrink-0 self-stretch md:self-end flex flex-col justify-between shadow-premium-sm">
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-xs font-bold">
                  <span className="text-secondary-600 dark:text-secondary-300 uppercase tracking-wider text-[9px]">Account Strength</span>
                  <span className="text-primary-600 dark:text-primary-400 font-extrabold">{completeness.percentage}%</span>
                </div>
                <ProgressBar value={completeness.percentage} className="h-1.5 bg-secondary-200 dark:bg-secondary-800" barClassName="bg-gradient-to-r from-primary-400 to-primary-600" />
              </div>

              <div className="mt-3 pt-2.5 border-t border-secondary-200/40 dark:border-secondary-800/60 flex items-center">
                {completeness.missingInformation && completeness.missingInformation.length > 0 ? (
                  <div className="flex items-start gap-2 w-full">
                    <PlusCircle className="h-4 w-4 text-primary-500 shrink-0 mt-0.5" />
                    <div className="text-[10px] leading-tight">
                      <span className="font-extrabold text-secondary-400 block uppercase tracking-wider text-[8px]">Suggested action</span>
                      <span className="font-bold text-secondary-700 dark:text-secondary-200">{completeness.suggestedNextAction}</span>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-success-600 dark:text-success-400 w-full justify-center">
                    <CheckCircle className="h-4 w-4 text-success-500 shrink-0" />
                    <span className="text-xs font-extrabold">All details completed!</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Mobile Tab Selector */}
      <div className="lg:hidden mb-6">
        <label className="text-[10px] font-black text-secondary-400 dark:text-secondary-500 uppercase tracking-widest block mb-2">
          Section Profile
        </label>
        <div className="relative">
          <select
            value={activeTab}
            onChange={(e) => setActiveTab(e.target.value)}
            className="w-full text-sm font-bold bg-white dark:bg-secondary-900 border border-secondary-200 dark:border-secondary-800 rounded-[14px] px-4 py-3.5 text-secondary-900 dark:text-white shadow-premium-sm focus:outline-none focus:ring-2 focus:ring-primary-500 appearance-none"
          >
            <option value="personal">👤 Profile Details</option>
            <option value="security">🔑 Credentials</option>
            <option value="sessions">💻 Active Sessions</option>
            <option value="devices">📱 Trusted Devices</option>
            <option value="appearance">🎨 Preferences</option>
            <option value="notifications">🔔 Notifications</option>
            <option value="danger">⚠️ Danger Zone</option>
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-secondary-500">
            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
              <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Grid splits into left sidebar (Tabs) and right content panel (Active Forms) */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Navigation Sidebar */}
        <div className="lg:col-span-1">
          <Card className="hidden lg:flex lg:flex-col p-2 border-secondary-200/50 dark:border-secondary-800/80 bg-white dark:bg-secondary-900 shadow-premium-sm justify-start gap-1 overflow-x-auto lg:overflow-x-visible" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            <button
              onClick={() => setActiveTab('personal')}
              className={getTabClass('personal')}
            >
              <User className="h-4.5 w-4.5" />
              <span className="whitespace-nowrap">Profile Details</span>
            </button>

            <button
              onClick={() => setActiveTab('security')}
              className={getTabClass('security')}
            >
              <KeyRound className="h-4.5 w-4.5" />
              <span className="whitespace-nowrap">Credentials</span>
            </button>

            <button
              onClick={() => setActiveTab('sessions')}
              className={getTabClass('sessions')}
            >
              <Monitor className="h-4.5 w-4.5" />
              <span className="whitespace-nowrap">Active Sessions</span>
            </button>

            <button
              onClick={() => setActiveTab('devices')}
              className={getTabClass('devices')}
            >
              <Smartphone className="h-4.5 w-4.5" />
              <span className="whitespace-nowrap">Trusted Devices</span>
            </button>

            <button
              onClick={() => setActiveTab('appearance')}
              className={getTabClass('appearance')}
            >
              <Palette className="h-4.5 w-4.5" />
              <span className="whitespace-nowrap">Preferences</span>
            </button>

            <button
              onClick={() => setActiveTab('notifications')}
              className={getTabClass('notifications')}
            >
              <Bell className="h-4.5 w-4.5" />
              <span className="whitespace-nowrap">Notifications</span>
            </button>

            <button
              onClick={() => setActiveTab('danger')}
              className={cn(
                "flex items-center space-x-3 px-4 py-3 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer w-full select-none active:scale-[0.98] duration-normal text-error-500",
                activeTab === 'danger'
                  ? 'bg-error-50/50 text-error-700 dark:bg-error-950/20 dark:text-error-450 border-b-2 border-error-500 lg:border-b-0 lg:border-l-4 lg:border-error-500 lg:rounded-l-none rounded-b-none pl-4 lg:pl-3'
                  : 'hover:bg-error-50/30 dark:hover:bg-error-950/10'
              )}
            >
              <ShieldAlert className="h-4.5 w-4.5" />
              <span className="whitespace-nowrap">Danger Zone</span>
            </button>
          </Card>
        </div>

        {/* Details Panel Container */}
        <div className="lg:col-span-3">
          {/* TAB 1: Personal Details */}
          {activeTab === 'personal' && (
            <Card className="p-6 md:p-8 border-secondary-200/50 dark:border-secondary-800/80 bg-white dark:bg-secondary-900 shadow-premium-sm space-y-6">
              <div className="border-b border-secondary-100 dark:border-secondary-800/60 pb-4">
                <h3 className="text-base font-extrabold text-secondary-900 dark:text-white flex items-center gap-2">
                  <User className="h-5 w-5 text-primary-500" />
                  Personal Information
                </h3>
                <p className="text-xs text-secondary-500 dark:text-secondary-400 mt-1">Update your personal identification, public bio, and phone contact information</p>
              </div>

              <form onSubmit={handleProfileSubmit(onProfileSave)} className="space-y-6">
                <div className="space-y-4">
                  <h4 className="text-xs font-bold text-secondary-400 dark:text-secondary-500 uppercase tracking-wider">Identity Details</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Input label="Full Name" error={profileErrors.name?.message} {...registerProfile('name')} />
                    <Input label="Username" error={profileErrors.username?.message} {...registerProfile('username')} />
                  </div>
                </div>

                <div className="h-px bg-secondary-100 dark:bg-secondary-800/60" />

                <div className="space-y-4">
                  <h4 className="text-xs font-bold text-secondary-400 dark:text-secondary-500 uppercase tracking-wider">Contact Details</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Input label="Email Address" value={user.email} disabled helperText="Email address cannot be changed (locked identity)" />
                    <Input label="Phone Number" error={profileErrors.phone?.message} placeholder="+1234567890" {...registerProfile('phone')} />
                  </div>
                </div>

                <div className="h-px bg-secondary-100 dark:bg-secondary-800/60" />

                <div className="space-y-4">
                  <h4 className="text-xs font-bold text-secondary-400 dark:text-secondary-500 uppercase tracking-wider">Biography</h4>
                  <Textarea label="About Me / Bio" placeholder="Tell other members about yourself, your habits, preferred living locations..." error={profileErrors.bio?.message} {...registerProfile('bio')} />
                </div>

                <div className="pt-4 flex justify-end border-t border-secondary-100 dark:border-secondary-800/60">
                  <Button type="submit" variant="primary" className="px-6 font-bold hover:shadow-premium-md" isLoading={profileSubmitting}>
                    Save Changes
                  </Button>
                </div>
              </form>
            </Card>
          )}

          {/* TAB 2: Credentials & Security */}
          {activeTab === 'security' && (
            <div className="space-y-6 animate-fade-in">
              {/* Linked Provider details */}
              <Card className="p-6 md:p-8 border-secondary-200/50 dark:border-secondary-800/80 bg-white dark:bg-secondary-900 shadow-premium-sm space-y-4">
                <div className="border-b border-secondary-100 dark:border-secondary-800/60 pb-4">
                  <h3 className="text-base font-extrabold text-secondary-900 dark:text-white flex items-center gap-2">
                    <KeyRound className="h-5 w-5 text-primary-500" />
                    Authentication Method
                  </h3>
                  <p className="text-xs text-secondary-500 dark:text-secondary-400 mt-1">Manage password credentials and active identity providers connected to your account</p>
                </div>

                {user.googleId ? (
                  <div className="flex items-center space-x-4 p-5 bg-secondary-50/50 dark:bg-secondary-950/20 border border-secondary-200/60 dark:border-secondary-800 rounded-2xl">
                    <div className="p-3 bg-white dark:bg-secondary-900 shadow-sm border border-secondary-200/50 dark:border-secondary-800 rounded-full flex items-center justify-center">
                      <Chrome className="h-6 w-6 text-error-500" />
                    </div>
                    <div>
                      <h4 className="text-sm font-extrabold text-secondary-900 dark:text-white">Google OAuth Authentication</h4>
                      <p className="text-xs text-secondary-500 dark:text-secondary-450 mt-1 leading-normal">Your account is connected via Google OAuth. Passwords changes are disabled, as authentication is handled securely by Google identity management systems.</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center space-x-4 p-5 bg-secondary-50/50 dark:bg-secondary-950/20 border border-secondary-200/60 dark:border-secondary-800 rounded-2xl">
                    <div className="p-3 bg-white dark:bg-secondary-900 shadow-sm border border-secondary-200/50 dark:border-secondary-800 rounded-full flex items-center justify-center text-primary-500">
                      <Lock className="h-6 w-6" />
                    </div>
                    <div>
                      <h4 className="text-sm font-extrabold text-secondary-900 dark:text-white">Native Hashed Credentials</h4>
                      <p className="text-xs text-secondary-500 dark:text-secondary-455 mt-1 leading-normal">Standard email and cryptographically hashed password security identity verification.</p>
                    </div>
                  </div>
                )}
              </Card>

              {/* Password update form */}
              {!user.googleId && (
                <Card className="p-6 md:p-8 border-secondary-200/50 dark:border-secondary-800/80 bg-white dark:bg-secondary-900 shadow-premium-sm space-y-6">
                  <div className="border-b border-secondary-100 dark:border-secondary-800/60 pb-4">
                    <h3 className="text-base font-extrabold text-secondary-900 dark:text-white">Update Credentials</h3>
                    <p className="text-xs text-secondary-500 dark:text-secondary-400 mt-1">Change password parameters. Note that this action will revoke and log out all other active sessions for this identity.</p>
                  </div>

                  <form onSubmit={handlePasswordSubmit(onPasswordChange)} className="space-y-6">
                    <Input
                      type="password"
                      label="Current Password"
                      placeholder="••••••••"
                      required
                      error={passwordErrors.oldPassword?.message}
                      {...registerPassword('oldPassword')}
                    />

                    <div className="h-px bg-secondary-100 dark:bg-secondary-800/60" />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Input
                          type="password"
                          label="New Password"
                          placeholder="••••••••"
                          required
                          error={passwordErrors.newPassword?.message}
                          {...registerPassword('newPassword')}
                        />

                        {newPasswordVal && (
                          <div className="space-y-2 px-1 py-1 bg-secondary-50/50 dark:bg-secondary-950/20 rounded-xl p-3 border border-secondary-200/30 dark:border-secondary-800/30">
                            <div className="flex justify-between items-center text-[10px] font-extrabold">
                              <span className="text-secondary-400 uppercase tracking-wider">Complexity Score:</span>
                              <span className={cn(
                                "font-extrabold",
                                strength.text === 'Strong' ? 'text-success-600' : strength.text === 'Good' ? 'text-primary-650' : strength.text === 'Fair' ? 'text-warning-600' : 'text-error-600'
                              )}>
                                {strength.text} ({strength.score}%)
                              </span>
                            </div>
                            <ProgressBar value={strength.score} className="h-1.5 bg-secondary-200 dark:bg-secondary-800" barClassName={strength.color} />
                          </div>
                        )}
                      </div>

                      <Input
                        type="password"
                        label="Confirm New Password"
                        placeholder="••••••••"
                        required
                        error={passwordErrors.confirmPassword?.message}
                        {...registerPassword('confirmPassword')}
                      />
                    </div>

                    <div className="pt-4 flex justify-end border-t border-secondary-100 dark:border-secondary-800/60">
                      <Button type="submit" variant="primary" className="px-6 font-bold hover:shadow-premium-md" isLoading={passwordsLoading}>
                        Update Password
                      </Button>
                    </div>
                  </form>
                </Card>
              )}
            </div>
          )}

          {/* TAB 3: Active Device Sessions */}
          {activeTab === 'sessions' && (
            <Card className="p-6 md:p-8 border-secondary-200/50 dark:border-secondary-800/80 bg-white dark:bg-secondary-900 shadow-premium-sm space-y-6">
              <div className="border-b border-secondary-100 dark:border-secondary-800/60 pb-4 flex justify-between items-center">
                <div>
                  <h3 className="text-base font-extrabold text-secondary-900 dark:text-white flex items-center gap-2">
                    <Monitor className="h-5 w-5 text-primary-500" />
                    Active Device Sessions
                  </h3>
                  <p className="text-xs text-secondary-500 dark:text-secondary-400 mt-1">Review and manage connected computers, mobiles, and browsers currently signed in</p>
                </div>
                <Button onClick={fetchActiveSessions} variant="outline" size="sm" className="rounded-full h-8 w-8 p-0" disabled={sessionsLoading}>
                  <RefreshCw className={cn("h-3.5 w-3.5", sessionsLoading ? 'animate-spin' : '')} />
                </Button>
              </div>

              {sessionsLoading ? (
                <div className="space-y-4">
                  {[1, 2].map((i) => (
                    <div key={i} className="p-5 border border-secondary-200/50 dark:border-secondary-800/80 rounded-2xl flex items-center justify-between">
                      <div className="flex items-center space-x-3.5 w-2/3">
                        <Skeleton variant="circle" className="h-10 w-10 bg-secondary-200 dark:bg-secondary-800" />
                        <div className="space-y-2 w-full">
                          <Skeleton variant="text" className="h-4 w-1/3 bg-secondary-200 dark:bg-secondary-800" />
                          <Skeleton variant="text" className="h-3 w-2/3 bg-secondary-200 dark:bg-secondary-800" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : sessions.length === 0 ? (
                <EmptyState
                  title="No Active Sessions"
                  description="There are no other active sessions currently registered for this account."
                  icon={<Monitor className="h-8 w-8 text-secondary-400" />}
                />
              ) : (
                <div className="space-y-6">
                  <div className="flex justify-end">
                    <Button variant="outline" size="sm" className="text-error-500 border-error-100 hover:bg-error-50/10 font-bold px-4 py-1.5 rounded-xl transition-all" onClick={handleRevokeAllSessions}>
                      Revoke Other Sessions
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    {sessions.map((sess) => (
                      <div key={sess.id} className={cn(
                        "p-5 border rounded-2xl flex items-center justify-between transition-all hover:shadow-premium-sm duration-normal",
                        sess.isCurrent 
                          ? 'bg-primary-50/10 dark:bg-primary-950/10 border-primary-200/80 dark:border-primary-900/60 shadow-premium-sm' 
                          : 'border-secondary-200/50 dark:border-secondary-800/80 bg-white dark:bg-secondary-900'
                      )}>
                        <div className="flex items-center space-x-4">
                          <div className={cn(
                            "p-3 rounded-full flex items-center justify-center shadow-sm",
                            sess.isCurrent 
                              ? 'bg-primary-100/50 text-primary-650 dark:bg-primary-950/40 dark:text-primary-405' 
                              : 'bg-secondary-50 text-secondary-500 dark:bg-secondary-800 dark:text-secondary-400'
                          )}>
                            <Monitor className="h-5 w-5" />
                          </div>
                          <div>
                            <div className="flex items-center flex-wrap gap-2">
                              <h4 className="text-xs font-extrabold text-secondary-900 dark:text-white capitalize">{sess.deviceName} ({sess.operatingSystem})</h4>
                              {sess.isCurrent && (
                                <Badge variant="success" size="sm" className="font-extrabold text-[8px] py-0.5 px-2.5 bg-success-50 text-success-700 dark:bg-success-950/30 dark:text-success-400 border border-success-200/40">
                                  Current Device
                                </Badge>
                              )}
                            </div>
                            <p className="text-[10px] text-secondary-500 dark:text-secondary-400 mt-1.5 leading-none">{sess.browser} • IP: {sess.ipAddress}</p>
                            <p className="text-[9px] text-secondary-400 dark:text-secondary-500 mt-2 font-bold uppercase tracking-wider">Last Sync: {new Date(sess.lastActivity).toLocaleString()}</p>
                          </div>
                        </div>

                        {!sess.isCurrent && (
                          <Button variant="outline" size="sm" className="text-xs text-secondary-700 hover:text-primary-650 border-secondary-200 hover:border-primary-200 dark:border-secondary-800 hover:bg-secondary-50/50 dark:hover:bg-secondary-800/60 font-bold px-4 py-1.5 rounded-xl transition-all" onClick={() => handleRevokeSession(sess.id)}>
                            Disconnect
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </Card>
          )}

          {/* TAB 4: Trusted Devices */}
          {activeTab === 'devices' && (
            <Card className="p-6 md:p-8 border-secondary-200/50 dark:border-secondary-800/80 bg-white dark:bg-secondary-900 shadow-premium-sm space-y-6">
              <div className="border-b border-secondary-100 dark:border-secondary-800/60 pb-4 flex justify-between items-center">
                <div>
                  <h3 className="text-base font-extrabold text-secondary-900 dark:text-white flex items-center gap-2">
                    <Smartphone className="h-5 w-5 text-primary-500" />
                    Trusted Browsers & Devices
                  </h3>
                  <p className="text-xs text-secondary-500 dark:text-secondary-400 mt-1">Machines registered during logins which bypass secondary multi-factor checks</p>
                </div>
                <Button onClick={fetchTrustedDevices} variant="outline" size="sm" className="rounded-full h-8 w-8 p-0" disabled={devicesLoading}>
                  <RefreshCw className={cn("h-3.5 w-3.5", devicesLoading ? 'animate-spin' : '')} />
                </Button>
              </div>

              {devicesLoading ? (
                <div className="space-y-4">
                  {[1, 2].map((i) => (
                    <div key={i} className="p-5 border border-secondary-200/50 dark:border-secondary-800/80 rounded-2xl flex items-center justify-between">
                      <div className="flex items-center space-x-3.5 w-2/3">
                        <Skeleton variant="circle" className="h-10 w-10 bg-secondary-200 dark:bg-secondary-800" />
                        <div className="space-y-2 w-full">
                          <Skeleton variant="text" className="h-4 w-1/3 bg-secondary-200 dark:bg-secondary-800" />
                          <Skeleton variant="text" className="h-3 w-2/3 bg-secondary-200 dark:bg-secondary-800" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : devices.length === 0 ? (
                <EmptyState
                  title="No Trusted Devices"
                  description="You have not registered any trusted devices yet. Log in to register the current device."
                  icon={<Smartphone className="h-8 w-8 text-secondary-400" />}
                />
              ) : (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 gap-4">
                    {devices.map((device) => (
                      <div key={device.id} className="p-5 border border-secondary-200/50 dark:border-secondary-800/80 bg-white dark:bg-secondary-900 rounded-2xl flex items-center justify-between transition-all hover:shadow-premium-sm duration-normal">
                        <div className="flex items-center space-x-4 w-full mr-4">
                          <div className={cn(
                            "p-3 rounded-full flex items-center justify-center shadow-sm",
                            device.trustedStatus === 'trusted' 
                              ? 'bg-success-50 text-success-600 dark:bg-success-950/20 dark:text-success-400' 
                              : 'bg-warning-50 text-warning-600 dark:bg-warning-950/20 dark:text-warning-400'
                          )}>
                            <ShieldCheck className="h-5 w-5" />
                          </div>
                          
                          <div className="w-full">
                            {editingDeviceId === device.id ? (
                              <div className="flex items-center space-x-2">
                                <input
                                  type="text"
                                  className="text-xs font-bold px-3 py-1.5 border border-secondary-200 dark:border-secondary-800 bg-secondary-50/50 dark:bg-secondary-900/40 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 w-full max-w-[200px]"
                                  value={editDeviceName}
                                  onChange={(e) => setEditDeviceName(e.target.value)}
                                  onKeyDown={(e) => e.key === 'Enter' && handleSaveDeviceName(device.id)}
                                />
                                <Button variant="primary" size="sm" className="py-1 px-3 text-xs" onClick={() => handleSaveDeviceName(device.id)}>Save</Button>
                                <Button variant="ghost" size="sm" className="py-1 px-3 text-secondary-500 text-xs" onClick={() => setEditingDeviceId(null)}>Cancel</Button>
                              </div>
                            ) : (
                              <div className="flex items-center flex-wrap gap-2">
                                <h4 className="text-xs font-extrabold text-secondary-900 dark:text-white capitalize">{device.deviceName}</h4>
                                <button onClick={() => handleStartEditDevice(device)} className="text-secondary-400 hover:text-secondary-655 transition-colors">
                                  <Edit3 className="h-3 w-3" />
                                </button>
                                <Badge variant={device.trustedStatus === 'trusted' ? 'success' : 'warning'} size="sm" className="text-[8px] py-0.5 px-2 bg-opacity-70">
                                  {device.trustedStatus === 'trusted' ? 'Trusted' : 'Pending Action'}
                                </Badge>
                              </div>
                            )}
                            <p className="text-[10px] text-secondary-500 dark:text-secondary-400 mt-1.5 leading-none">{device.browser} • OS: {device.operatingSystem}</p>
                            <p className="text-[9px] text-secondary-400 dark:text-secondary-500 mt-2 font-bold uppercase tracking-wider">Last Utilized: {new Date(device.lastUsed).toLocaleString()}</p>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2 shrink-0">
                          {device.trustedStatus !== 'trusted' && (
                            <Button variant="outline" size="sm" className="text-xs text-success-650 border-success-100 hover:bg-success-50/10 font-bold px-3 py-1.5 rounded-xl transition-all" onClick={() => handleTrustDevice(device.id)}>
                              Trust
                            </Button>
                          )}
                          <Button variant="outline" size="sm" className="text-xs text-error-550 border-error-100 hover:bg-error-50/10 font-bold px-3 py-1.5 rounded-xl transition-all" onClick={() => handleRemoveDevice(device.id)}>
                            Revoke
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Advanced Security coming soon indicators */}
              <div className="border-t border-secondary-100 dark:border-secondary-800/60 pt-6 space-y-4">
                <h4 className="text-xs font-bold text-secondary-800 dark:text-secondary-200">Advanced Trusted Browser features</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-5 border border-dashed border-secondary-300 dark:border-secondary-850 rounded-2xl bg-secondary-50/30 dark:bg-secondary-900/10 opacity-75 hover:opacity-100 hover:border-secondary-400 dark:hover:border-secondary-650 transition-all flex flex-col justify-between">
                    <div className="flex flex-col gap-2">
                      <Lock className="h-5 w-5 text-secondary-400 dark:text-secondary-600" />
                      <span className="text-xs font-extrabold text-secondary-800 dark:text-secondary-200">Secure Sandboxed Sessions</span>
                    </div>
                    <span className="text-[8px] font-extrabold bg-secondary-100 dark:bg-secondary-800 text-secondary-500 dark:text-secondary-400 uppercase px-2.5 py-0.5 rounded-full mt-4 w-fit tracking-wider">Coming Soon</span>
                  </div>
                  <div className="p-5 border border-dashed border-secondary-300 dark:border-secondary-850 rounded-2xl bg-secondary-50/30 dark:bg-secondary-900/10 opacity-75 hover:opacity-100 hover:border-secondary-400 dark:hover:border-secondary-650 transition-all flex flex-col justify-between">
                    <div className="flex flex-col gap-2">
                      <Fingerprint className="h-5 w-5 text-secondary-400 dark:text-secondary-600" />
                      <span className="text-xs font-extrabold text-secondary-800 dark:text-secondary-200">Automatic 2FA Trust</span>
                    </div>
                    <span className="text-[8px] font-extrabold bg-secondary-100 dark:bg-secondary-800 text-secondary-500 dark:text-secondary-400 uppercase px-2.5 py-0.5 rounded-full mt-4 w-fit tracking-wider">Coming Soon</span>
                  </div>
                  <div className="p-5 border border-dashed border-secondary-300 dark:border-secondary-850 rounded-2xl bg-secondary-50/30 dark:bg-secondary-900/10 opacity-75 hover:opacity-100 hover:border-secondary-400 dark:hover:border-secondary-650 transition-all flex flex-col justify-between">
                    <div className="flex flex-col gap-2">
                      <Settings className="h-5 w-5 text-secondary-400 dark:text-secondary-600" />
                      <span className="text-xs font-extrabold text-secondary-800 dark:text-secondary-200">Fingerprint Auditing</span>
                    </div>
                    <span className="text-[8px] font-extrabold bg-secondary-100 dark:bg-secondary-800 text-secondary-500 dark:text-secondary-400 uppercase px-2.5 py-0.5 rounded-full mt-4 w-fit tracking-wider">Coming Soon</span>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* TAB 5: Preferences */}
          {activeTab === 'appearance' && (
            <Card className="p-6 md:p-8 border-secondary-200/50 dark:border-secondary-800/80 bg-white dark:bg-secondary-900 shadow-premium-sm space-y-6">
              <div className="border-b border-secondary-100 dark:border-secondary-800/60 pb-4">
                <h3 className="text-base font-extrabold text-secondary-900 dark:text-white flex items-center gap-2">
                  <Palette className="h-5 w-5 text-primary-500" />
                  System Preferences
                </h3>
                <p className="text-xs text-secondary-500 dark:text-secondary-400 mt-1">Configure your workspace themes, translations, and localization interfaces</p>
              </div>

              <form onSubmit={handleProfileSubmit(onProfileSave)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Select
                    label="Theme Mode"
                    options={[
                      { label: 'Light Mode', value: 'light' },
                      { label: 'Dark Mode', value: 'dark' },
                      { label: 'System Defaults', value: 'system' },
                    ]}
                    {...registerProfile('preferences.theme')}
                  />
                  <Select
                    label="Interface Language"
                    options={[
                      { label: 'English (US)', value: 'en' },
                      { label: 'Hindi (India)', value: 'hi' },
                      { label: 'Spanish (ES)', value: 'es' },
                    ]}
                    {...registerProfile('preferences.language')}
                  />
                </div>

                <div className="h-px bg-secondary-100 dark:bg-secondary-800/60" />

                <div className="space-y-4">
                  <div>
                    <h4 className="text-xs font-bold text-secondary-800 dark:text-secondary-200 flex items-center">
                      <Bell className="h-5 w-5 mr-2 text-primary-500" />
                      Email Alerts Preferences
                    </h4>
                    <p className="text-[10px] text-secondary-450 dark:text-secondary-500 mt-1 leading-normal">Control when StayMate dispatches email telemetry alerts to your inbox.</p>
                  </div>

                  <div className="space-y-3 p-4 bg-secondary-50/50 dark:bg-secondary-950/20 border border-secondary-200/50 dark:border-secondary-800/60 rounded-2xl">
                    <label className="flex items-center text-xs text-secondary-700 dark:text-secondary-350 select-none font-bold cursor-pointer hover:text-secondary-900 dark:hover:text-white transition-colors">
                      <input type="checkbox" defaultChecked className="h-4.5 w-4.5 rounded-[6px] border-secondary-250 dark:border-secondary-800 bg-white dark:bg-secondary-900 text-primary-500 focus:ring-2 focus:ring-primary-500/25 transition-all cursor-pointer mr-3 shadow-premium-sm" />
                      Notify me of matching roommate listings nearby
                    </label>
                    <label className="flex items-center text-xs text-secondary-700 dark:text-secondary-350 select-none font-bold cursor-pointer hover:text-secondary-900 dark:hover:text-white transition-colors">
                      <input type="checkbox" defaultChecked className="h-4.5 w-4.5 rounded-[6px] border-secondary-250 dark:border-secondary-800 bg-white dark:bg-secondary-900 text-primary-500 focus:ring-2 focus:ring-primary-500/25 transition-all cursor-pointer mr-3 shadow-premium-sm" />
                      Notify me when landlords approve/reject scheduling visits
                    </label>
                  </div>
                </div>

                <div className="pt-4 flex justify-end border-t border-secondary-100 dark:border-secondary-800/60">
                  <Button type="submit" variant="primary" className="px-6 font-bold hover:shadow-premium-md" isLoading={profileSubmitting}>
                    Save Preferences
                  </Button>
                </div>
              </form>
            </Card>
          )}

          {/* TAB: Notification Settings */}
          {activeTab === 'notifications' && preferences && (
            <Card className="p-6 md:p-8 border-secondary-200/50 dark:border-secondary-800/80 bg-white dark:bg-secondary-900 shadow-premium-sm space-y-6">
              <div className="border-b border-secondary-100 dark:border-secondary-800/60 pb-4">
                <h3 className="text-base font-extrabold text-secondary-900 dark:text-white flex items-center gap-2">
                  <Bell className="h-5 w-5 text-primary-500" />
                  Detailed Notification Settings
                </h3>
                <p className="text-xs text-secondary-500 dark:text-secondary-400 mt-1">Fine-tune in-app center dispatches and email broadcasts for specific category triggers</p>
              </div>

              <div className="space-y-4">
                {Object.entries(preferences.categories || {}).map(([catKey, channels]) => {
                  const labelMap = {
                    property: 'Stays & Property Updates',
                    roommate: 'Roommate Match Requests',
                    visit: 'Visit & Tour Bookings',
                    chat: 'Direct Messages & Mentions',
                    review: 'Reviews & Feedback Ratings',
                    security: 'Security Alerts & Actions',
                    announcements: 'System Announcements & Broadcasts',
                  };

                  return (
                    <div key={catKey} className="flex flex-col sm:flex-row sm:items-center justify-between p-5 border border-secondary-150 dark:border-secondary-800/80 rounded-2xl bg-secondary-50/20 dark:bg-secondary-950/10 gap-4 hover:border-secondary-300 dark:hover:border-secondary-700 transition-colors duration-normal">
                      <div>
                        <h4 className="text-xs font-extrabold text-secondary-900 dark:text-white">
                          {labelMap[catKey] || catKey}
                        </h4>
                        <p className="text-[10px] text-secondary-450 dark:text-secondary-500 mt-1 leading-none">
                          Configure delivery for this category
                        </p>
                      </div>

                      <div className="flex items-center space-x-6">
                        <label className="flex items-center space-x-2.5 text-[10px] font-extrabold text-secondary-700 dark:text-secondary-350 cursor-pointer select-none hover:text-secondary-950 dark:hover:text-white transition-colors">
                          <input
                            type="checkbox"
                            checked={channels.inApp}
                            onChange={(e) => {
                              const updated = { ...preferences.categories };
                              updated[catKey] = { ...updated[catKey], inApp: e.target.checked };
                              updatePreferences({ categories: updated });
                            }}
                            className="h-4.5 w-4.5 rounded-[6px] border-secondary-200 dark:border-secondary-800 bg-white dark:bg-secondary-900 text-primary-500 focus:ring-2 focus:ring-primary-500/25 transition-all cursor-pointer shadow-premium-sm"
                          />
                          <span>In-App Center</span>
                        </label>

                        <label className="flex items-center space-x-2.5 text-[10px] font-extrabold text-secondary-700 dark:text-secondary-350 cursor-pointer select-none hover:text-secondary-950 dark:hover:text-white transition-colors">
                          <input
                            type="checkbox"
                            checked={channels.email}
                            onChange={(e) => {
                              const updated = { ...preferences.categories };
                              updated[catKey] = { ...updated[catKey], email: e.target.checked };
                              updatePreferences({ categories: updated });
                            }}
                            className="h-4.5 w-4.5 rounded-[6px] border-secondary-200 dark:border-secondary-800 bg-white dark:bg-secondary-900 text-primary-500 focus:ring-2 focus:ring-primary-500/25 transition-all cursor-pointer shadow-premium-sm"
                          />
                          <span>Email Alerts</span>
                        </label>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          )}

          {/* TAB 6: Danger Zone */}
          {activeTab === 'danger' && (
            <Card className="p-6 md:p-8 border-error-200/50 dark:border-error-900/40 bg-error-50/5 dark:bg-error-950/5 space-y-6 animate-fade-in rounded-[24px]">
              <div className="border-b border-error-100 dark:border-error-900/50 pb-4 flex items-center space-x-2">
                <WarningIcon className="h-5 w-5 text-error-500" />
                <h3 className="text-base font-extrabold text-error-700 dark:text-error-450">Terminate Account</h3>
              </div>

              <div className="p-4 bg-error-500/10 border border-error-200/30 rounded-2xl text-xs text-error-800 dark:text-error-400 leading-relaxed font-semibold">
                WARNING: Deleting your StayMate account will immediately and permanently erase all personal details, properties listings, roommate cards, and chat histrories in compliance with privacy guidelines. This action is final and completely irreversible.
              </div>

              <div className="space-y-4 pt-2">
                <Input
                  label="Please type 'DELETE' to confirm authorization:"
                  placeholder="DELETE"
                  value={deleteConfirm}
                  onChange={(e) => setDeleteConfirm(e.target.value)}
                  className="max-w-md"
                />
                
                <div className="pt-2 flex justify-start">
                  <Button
                    onClick={onDeleteConfirm}
                    variant="danger"
                    className="flex items-center space-x-2 font-bold px-6 py-3 rounded-xl hover:shadow-premium-md text-sm"
                    disabled={deleteConfirm !== 'DELETE'}
                  >
                    <Trash2 className="h-4.5 w-4.5 mr-1.5" />
                    Terminate Account Permanently
                  </Button>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
