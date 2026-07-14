import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Link } from 'react-router-dom';
import authService from '@/services/authService';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Alert from '@/components/ui/Alert';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

const schema = z.object({
  email: z.string().trim().email('Please enter a valid email address'),
});

const ForgotPassword = () => {
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data) => {
    setErrorMsg('');
    try {
      await authService.forgotPassword(data.email);
      setSuccess(true);
    } catch (err) {
      setErrorMsg(err.response?.data?.error?.message || 'Failed to request reset link.');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl md:text-2xl font-black tracking-tight text-secondary-900 dark:text-white">
          Forgot Password?
        </h2>
        <p className="mt-1.5 text-xs text-secondary-500 dark:text-secondary-400 font-semibold">
          Enter your email address and we will print a recovery link to the server console.
        </p>
      </div>

      {success ? (
        <div className="space-y-6">
          <Alert variant="success" title="Link Sent!">
            A password reset link was printed to the developer terminal. Please retrieve the token from the backend logs to proceed.
          </Alert>
          <Link
            to="/login"
            className="inline-flex items-center text-xs font-extrabold text-primary-600 dark:text-primary-450 hover:text-primary-500 dark:hover:text-primary-400 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-1.5" />
            Back to Login
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {errorMsg && (
            <Alert variant="danger" icon={<ShieldAlert className="h-5 w-5" />}>
              {errorMsg}
            </Alert>
          )}

          <Input
            type="email"
            label="Email Address"
            placeholder="example@staymate.com"
            required
            error={errors.email?.message}
            {...register('email')}
          />

          <div className="flex flex-col gap-3 pt-2">
            <Button type="submit" variant="primary" className="w-full py-2.5 font-bold rounded-xl" isLoading={isSubmitting}>
              Send Reset Link
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
      )}
    </div>
  );
};

export default ForgotPassword;
