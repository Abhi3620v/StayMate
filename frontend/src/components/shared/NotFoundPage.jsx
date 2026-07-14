import React from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../ui/Button';
import { AlertCircle } from 'lucide-react';

/**
 * 404 Not Found Page Component
 */
const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center text-center p-8 max-w-md mx-auto my-16">
      <div className="h-16 w-16 rounded-full bg-error-50 dark:bg-error-950/20 flex items-center justify-center text-error-600 dark:text-error-400 mb-4 animate-bounce">
        <AlertCircle className="h-8 w-8" />
      </div>
      <h1 className="text-4xl font-extrabold text-secondary-900 dark:text-white mb-2">404</h1>
      <h3 className="text-lg font-bold text-secondary-900 dark:text-white mb-2">
        Page Not Found
      </h3>
      <p className="text-xs md:text-sm text-secondary-500 dark:text-secondary-400 mb-6">
        Sorry, the page you are looking for does not exist or has been moved to another path directory.
      </p>
      <Button variant="primary" onClick={() => navigate('/')}>
        Go to Home
      </Button>
    </div>
  );
};

export default NotFoundPage;
