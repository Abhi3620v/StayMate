import React, { useState, useEffect, useRef } from 'react';
import { Chrome } from 'lucide-react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Button from '@/components/ui/Button';
import ProgressBar from '@/components/ui/ProgressBar';

const registerSchema = z
  .object({
    name: z.string().trim().min(2, 'Name must contain at least 2 characters'),
    email: z.string().trim().email('Please enter a valid email address'),
    role: z.enum(['tenant', 'owner'], { errorMap: () => ({ message: 'Please select your role' }) }),
    password: z
      .string()
      .min(6, 'Password must be at least 6 characters')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
      .regex(/[0-9]/, 'Password must contain at least one number'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

  const Register = () => {
  const { register: registerUser, googleLogin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [googleLoading, setGoogleLoading] = useState(false);

  const googleButtonRef = useRef(null);
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  const isGoogleConfigured = clientId && !clientId.includes('placeholder') && clientId.length > 20;

  const searchParams = new URLSearchParams(location.search);
  const queryRole = searchParams.get('role') || 'tenant';

  const { register, handleSubmit, control, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      role: queryRole
    }
  });

  const selectedRole = useWatch({ control, name: 'role', defaultValue: 'tenant' });

  useEffect(() => {
    if (!isGoogleConfigured) return;

    const loadGsi = () => {
      if (window.google && googleButtonRef.current) {
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: async (response) => {
            setGoogleLoading(true);
            try {
              const loggedUser = await googleLogin(response.credential, selectedRole, true);
              if (loggedUser.role === 'admin') {
                navigate('/admin/dashboard');
              } else if (loggedUser.role === 'owner') {
                navigate('/owner/dashboard');
              } else {
                navigate('/');
              }
            } catch (err) {
              // Handled globally by AuthContext toast
            } finally {
              setGoogleLoading(false);
            }
          },
          ux_mode: 'popup'
        });

        window.google.accounts.id.renderButton(googleButtonRef.current, {
          theme: 'outline',
          size: 'large',
          text: 'signup_with',
          shape: 'rectangular',
          width: 328,
        });
      }
    };

    if (window.google) {
      loadGsi();
    } else {
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = loadGsi;
      document.body.appendChild(script);
    }
  }, [isGoogleConfigured, selectedRole]);

  const handleGoogleSignUp = async () => {
    setGoogleLoading(true);
    try {
      const mockPayload = {
        email: `google-${selectedRole}-demo@staymate.com`,
        name: `Google ${selectedRole.charAt(0).toUpperCase() + selectedRole.slice(1)} Demo`,
        picture: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80',
        sub: `google_demo_${selectedRole}_sub_123`,
      };
      const base64Payload = btoa(JSON.stringify(mockPayload));
      const mockIdToken = `mock-${base64Payload}`;

      const loggedUser = await googleLogin(mockIdToken, selectedRole, true);
      if (loggedUser.role === 'admin') {
        navigate('/admin/dashboard');
      } else if (loggedUser.role === 'owner') {
        navigate('/owner/dashboard');
      } else {
        navigate('/');
      }
    } catch (err) {
      // Handled globally
    } finally {
      setGoogleLoading(false);
    }
  };

  const passwordVal = useWatch({ control, name: 'password', defaultValue: '' });

  // Calculate password strength score (0 to 100)
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
    if (score >= 100) {
      text = 'Strong';
      color = 'bg-success-600';
    } else if (score >= 60) {
      text = 'Good';
      color = 'bg-primary-500';
    } else if (score >= 40) {
      text = 'Fair';
      color = 'bg-warning-500';
    }
    return { score, text, color };
  };

  const strength = getPasswordStrength(passwordVal);

  const onSubmit = async (data) => {
    try {
      await registerUser(data.name, data.email, data.password, data.role);
      // Redirect to verification screen with email hint
      navigate(`/verify-email?email=${encodeURIComponent(data.email)}`);
    } catch (err) {
      // Errors handled by context toast
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl md:text-2xl font-black tracking-tight text-secondary-900 dark:text-white">
          Create a StayMate Account
        </h2>
        <p className="mt-1.5 text-xs text-secondary-500 dark:text-secondary-400 font-semibold">
          Already have an account?{' '}
          <Link to="/login" className="text-primary-600 dark:text-primary-450 hover:text-primary-500 dark:hover:text-primary-400 font-extrabold transition-colors">
            Sign in
          </Link>
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <Input
          type="text"
          label="Full Name"
          placeholder="John Doe"
          required
          error={errors.name?.message}
          {...register('name')}
        />
        
        <Input
          type="email"
          label="Email Address"
          placeholder="example@staymate.com"
          required
          error={errors.email?.message}
          {...register('email')}
        />
        
        <Select
          label="I want to register as a"
          required
          error={errors.role?.message}
          options={[
            { label: 'Tenant (Looking for Room/Roommates)', value: 'tenant' },
            { label: 'Property Owner (Adding Rooms/Flats)', value: 'owner' },
          ]}
          {...register('role')}
        />
        
        <div className="space-y-2">
          <Input
            type="password"
            label="Password"
            placeholder="••••••••"
            required
            error={errors.password?.message}
            {...register('password')}
          />

          {/* Password Strength Meter */}
          {passwordVal && (
            <div className="space-y-1 px-1">
              <div className="flex justify-between items-center text-[10px] font-extrabold uppercase tracking-wider">
                <span className="text-secondary-400">Password Strength:</span>
                <span className={strength.text === 'Strong' ? 'text-success-600 dark:text-success-400' : strength.text === 'Good' ? 'text-primary-600 dark:text-primary-400' : strength.text === 'Fair' ? 'text-warning-600 dark:text-warning-400' : 'text-error-600 dark:text-error-450'}>
                  {strength.text}
                </span>
              </div>
              <ProgressBar value={strength.score} className="h-1.5" barClassName={strength.color} />
            </div>
          )}
        </div>

        <Input
          type="password"
          label="Confirm Password"
          placeholder="••••••••"
          required
          error={errors.confirmPassword?.message}
          {...register('confirmPassword')}
        />

        <Button type="submit" variant="primary" className="w-full mt-6 py-2.5 font-bold rounded-xl animate-fade-in" isLoading={isSubmitting}>
          Create Account
        </Button>
      </form>

      <div className="relative my-6 select-none">
        <div className="absolute inset-0 flex items-center" aria-hidden="true">
          <div className="w-full border-t border-secondary-200 dark:border-secondary-800" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-white dark:bg-secondary-900 px-3 text-[10px] font-extrabold text-secondary-400 uppercase tracking-wider">
            Or continue with
          </span>
        </div>
      </div>

      {isGoogleConfigured ? (
        <div className="group relative w-full h-11">
          <Button
            variant="secondary"
            className="w-full h-full flex items-center justify-center space-x-2 border border-secondary-200 dark:border-secondary-800 group-hover:bg-secondary-50 dark:group-hover:bg-secondary-900/40 rounded-xl font-bold transition-all"
            isLoading={googleLoading}
            leftIcon={<Chrome className="h-4.5 w-4.5 text-error-500 mr-2" />}
          >
            Sign up with Google
          </Button>
          <div 
            ref={googleButtonRef} 
            className="absolute inset-0 w-full h-full opacity-[0.01] z-10 cursor-pointer overflow-hidden rounded-xl [&_iframe]:w-full [&_iframe]:h-full" 
          />
        </div>
      ) : (
        <Button
          variant="secondary"
          className="w-full flex items-center justify-center space-x-2 border border-secondary-200 dark:border-secondary-800 hover:bg-secondary-50 dark:hover:bg-secondary-800/30 rounded-xl font-bold py-2.5"
          onClick={handleGoogleSignUp}
          isLoading={googleLoading}
          leftIcon={<Chrome className="h-4.5 w-4.5 text-error-500 mr-2" />}
        >
          Sign up with Google (Sandbox Demo)
        </Button>
      )}
    </div>
  );
};

export default Register;
