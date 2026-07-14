import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import authService from '@/services/authService';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Alert from '@/components/ui/Alert';
import PageLoader from '@/components/shared/PageLoader';
import { Mail, CheckCircle2, ShieldAlert, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const emailHint = searchParams.get('email');
  const navigate = useNavigate();

  const [loading, setLoading] = useState(!!token);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [resendEmail, setResendEmail] = useState(emailHint || '');
  const [resendLoading, setResendLoading] = useState(false);

  useEffect(() => {
    const executeVerification = async () => {
      if (!token) return;
      try {
        await authService.verifyEmail(token);
        setSuccess(true);
        toast.success('Email verified! You can now log in.');
      } catch (err) {
        setErrorMsg(err.response?.data?.error?.message || 'Verification link is invalid or has expired.');
      } finally {
        setLoading(false);
      }
    };
    executeVerification();
  }, [token]);

  const handleResend = async (e) => {
    e.preventDefault();
    if (!resendEmail) {
      toast.error('Please enter your email address.');
      return;
    }
    setResendLoading(true);
    try {
      await authService.resendVerification(resendEmail);
      toast.success('Verification link resent. Please check your email inbox.');
    } catch (err) {
      toast.error(err.response?.data?.error?.message || 'Failed to resend verification.');
    } finally {
      setResendLoading(false);
    }
  };

  if (loading) {
    return <PageLoader />;
  }

  return (
    <div className="space-y-6">
      {token ? (
        // Auto Verification Results View
        <div className="text-center space-y-5">
          {success ? (
            <>
              <div className="flex justify-center">
                <CheckCircle2 className="h-16 w-16 text-success-500 animate-bounce" />
              </div>
              <h2 className="text-xl md:text-2xl font-black tracking-tight text-secondary-900 dark:text-white">
                Email Verified!
              </h2>
              <p className="text-sm text-secondary-500 max-w-sm mx-auto leading-relaxed">
                Thank you. Your account verification has been processed and you are now cleared to log in.
              </p>
              <Button onClick={() => navigate('/login')} className="w-full py-2.5 font-bold rounded-xl mt-4">
                Proceed to Login
              </Button>
            </>
          ) : (
            <>
              <div className="flex justify-center">
                <ShieldAlert className="h-16 w-16 text-error-500" />
              </div>
              <h2 className="text-xl md:text-2xl font-black tracking-tight text-secondary-900 dark:text-white">
                Verification Failed
              </h2>
              <Alert variant="danger">
                {errorMsg}
              </Alert>
              <p className="text-xs text-secondary-500 mt-2">
                Verification tokens expire after 24 hours. Request a new verification link below.
              </p>
              <Link to="/verify-email" className="inline-flex items-center text-xs font-extrabold text-primary-600 dark:text-primary-450 hover:text-primary-500 mt-4">
                Request New Link
              </Link>
            </>
          )}
        </div>
      ) : (
        // Default Inbox Instructions View & Resend Forms
        <div className="space-y-6">
          <div className="text-center space-y-3">
            <div className="flex justify-center">
              <div className="p-4 bg-primary-50 dark:bg-primary-950/20 text-primary-600 dark:text-primary-400 rounded-full">
                <Mail className="h-10 w-10 stroke-[1.8]" />
              </div>
            </div>
            <h2 className="text-xl md:text-2xl font-black tracking-tight text-secondary-900 dark:text-white">
              Verify Your Email
            </h2>
            <p className="text-xs text-secondary-500 leading-relaxed max-w-sm mx-auto">
              We have printed a secure activation link to the backend developer terminal console logs. Please retrieve it to verify your account.
            </p>
          </div>

          <form onSubmit={handleResend} className="space-y-4 pt-4 border-t border-secondary-200/60 dark:border-secondary-800">
            <p className="text-xs font-bold text-secondary-650 dark:text-secondary-400">
              Didn't receive the email? Resend details:
            </p>
            
            <Input
              type="email"
              placeholder="name@example.com"
              value={resendEmail}
              onChange={(e) => setResendEmail(e.target.value)}
              required
            />

            <Button type="submit" variant="primary" className="w-full font-bold rounded-xl" isLoading={resendLoading}>
              Resend Activation Link
            </Button>

            <Link
              to="/login"
              className="inline-flex items-center justify-center w-full text-xs font-extrabold text-secondary-500 hover:text-secondary-750 dark:hover:text-secondary-200 mt-2"
            >
              <ArrowLeft className="h-4 w-4 mr-1.5" />
              Back to Login
            </Link>
          </form>
        </div>
      )}
    </div>
  );
};

export default VerifyEmail;
