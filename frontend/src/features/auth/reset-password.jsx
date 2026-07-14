import React, { useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import authService from '@/services/authService';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Alert from '@/components/ui/Alert';
import ProgressBar from '@/components/ui/ProgressBar';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';

const schema = z
  .object({
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

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();
  const [errorMsg, setErrorMsg] = useState('');

  const { register, handleSubmit, control, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(schema),
  });

  const passwordVal = useWatch({ control, name: 'password', defaultValue: '' });

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
    setErrorMsg('');
    if (!token) {
      setErrorMsg('Verification token is missing. Please check your reset link.');
      return;
    }

    try {
      await authService.resetPassword({ token, password: data.password });
      toast.success('Password reset successful! Please log in.');
      navigate('/login');
    } catch (err) {
      setErrorMsg(err.response?.data?.error?.message || 'Failed to reset password.');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl md:text-2xl font-black tracking-tight text-secondary-900 dark:text-white">
          Reset Password
        </h2>
        <p className="mt-1.5 text-xs text-secondary-500 dark:text-secondary-400 font-semibold">
          Create a strong, unique password to secure your account.
        </p>
      </div>

      {!token && (
        <Alert variant="danger" icon={<ShieldAlert className="h-5 w-5" />}>
          Invalid Password Reset Token. Verify your console link and try again.
        </Alert>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {errorMsg && (
          <Alert variant="danger" icon={<ShieldAlert className="h-5 w-5" />}>
            {errorMsg}
          </Alert>
        )}

        <div className="space-y-2">
          <Input
            type="password"
            label="New Password"
            placeholder="••••••••"
            required
            error={errors.password?.message}
            {...register('password')}
          />

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

        <div className="flex flex-col gap-3 pt-2">
          <Button type="submit" variant="primary" className="w-full py-2.5 font-bold rounded-xl" isLoading={isSubmitting} disabled={!token}>
            Update Password
          </Button>
          <Link
            to="/login"
            className="inline-flex items-center justify-center text-xs font-extrabold text-secondary-500 hover:text-secondary-750 dark:hover:text-secondary-200 transition-colors mt-2"
          >
            <ArrowLeft className="h-4 w-4 mr-1.5" />
            Back to Login
          </Link>
        </div>
      </form>
    </div>
  );
};

export default ResetPassword;
