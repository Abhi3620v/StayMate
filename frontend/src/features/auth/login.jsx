import React, { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Checkbox from '@/components/ui/Checkbox';
import { Chrome } from 'lucide-react';
import toast from 'react-hot-toast';

const loginSchema = z.object({
  email: z.string().trim().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

const Login = () => {
  const { login, googleLogin } = useAuth();
  const navigate = useNavigate();
  const [googleLoading, setGoogleLoading] = useState(false);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(loginSchema),
  });

  const redirectAfterLogin = (usr) => {
    if (!usr) return;
    if (usr.role === 'admin' || usr.role === 'moderator') {
      navigate('/admin/dashboard');
    } else if (usr.role === 'owner') {
      navigate('/owner/dashboard');
    } else {
      navigate('/');
    }
  };

  const onSubmit = async (data) => {
    try {
      const loggedUser = await login(data.email, data.password);
      redirectAfterLogin(loggedUser);
    } catch (err) {
      // Errors handled globally by context toast
    }
  };

  const googleButtonRef = useRef(null);
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  const isGoogleConfigured = clientId && !clientId.includes('placeholder') && clientId.length > 20;

  useEffect(() => {
    if (!isGoogleConfigured) return;

    const loadGsi = () => {
      if (window.google && googleButtonRef.current) {
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: async (response) => {
            setGoogleLoading(true);
            try {
              const loggedUser = await googleLogin(response.credential);
              redirectAfterLogin(loggedUser);
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
          text: 'signin_with',
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
  }, [isGoogleConfigured]);

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    try {
      // Simulate/Generate Google ID token payload for rapid sandbox verification
      const mockPayload = {
        email: 'google.tenant@gmail.com',
        name: 'Google Tenant',
        picture: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80',
        sub: 'google_id_102030',
      };
      const base64Payload = btoa(JSON.stringify(mockPayload));
      const mockIdToken = `mock-${base64Payload}`;

      const loggedUser = await googleLogin(mockIdToken);
      redirectAfterLogin(loggedUser);
    } catch (err) {
      // Errors handled by context toast
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl md:text-2xl font-black tracking-tight text-secondary-900 dark:text-white">
          Sign in to StayMate
        </h2>
        <p className="mt-1.5 text-xs text-secondary-500 dark:text-secondary-400 font-semibold">
          Or{' '}
          <Link to="/register" className="text-primary-600 dark:text-primary-450 hover:text-primary-500 dark:hover:text-primary-400 font-extrabold transition-colors">
            create a new account
          </Link>
        </p>
      </div>

      <div className="space-y-4">
        {/* Native Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <Input
            type="email"
            label="Email Address"
            placeholder="example@staymate.com"
            required
            error={errors.email?.message}
            {...register('email')}
          />
          
          <Input
            type="password"
            label="Password"
            placeholder="••••••••"
            required
            error={errors.password?.message}
            {...register('password')}
          />

          <div className="flex items-center justify-between text-xs font-semibold">
            <Checkbox
              label="Remember me"
              id="rememberMe"
            />
            <Link to="/forgot-password" className="text-primary-600 dark:text-primary-450 hover:text-primary-500 dark:hover:text-primary-400 font-extrabold transition-colors">
              Forgot password?
            </Link>
          </div>

          <Button type="submit" variant="primary" className="w-full mt-4 py-2.5 font-bold rounded-xl" isLoading={isSubmitting}>
            Sign In
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

        {/* Social logins */}
        {isGoogleConfigured ? (
          <div className="group relative w-full h-11">
            <Button
              variant="secondary"
              className="w-full h-full flex items-center justify-center space-x-2 border border-secondary-200 dark:border-secondary-800 group-hover:bg-secondary-50 dark:group-hover:bg-secondary-900/40 rounded-xl font-bold transition-all"
              isLoading={googleLoading}
              leftIcon={<Chrome className="h-4.5 w-4.5 text-error-500 mr-2" />}
            >
              Sign in with Google
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
            onClick={handleGoogleSignIn}
            isLoading={googleLoading}
            leftIcon={<Chrome className="h-4.5 w-4.5 text-error-500 mr-2" />}
          >
            Sign in with Google (Sandbox Demo)
          </Button>
        )}
      </div>
    </div>
  );
};

export default Login;
