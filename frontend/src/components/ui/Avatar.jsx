import React, { useState, useEffect } from 'react';
import { cn } from '@/utils/cn';

/**
 * User Profile Avatar component with initials fallback.
 */
const Avatar = ({
  src,
  alt = 'User Avatar',
  name = '',
  size = 'md',
  className,
  ...props
}) => {
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setHasError(false);
  }, [src]);

  const getInitials = (fullName) => {
    if (!fullName) return '?';
    const parts = fullName.split(' ');
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  };

  const sizes = {
    xs: { width: '24px', height: '24px', fontSize: '12px' },
    sm: { width: '32px', height: '32px', fontSize: '14px' },
    md: { width: '40px', height: '40px', fontSize: '16px' },
    lg: { width: '48px', height: '48px', fontSize: '18px' },
    xl: { width: '64px', height: '64px', fontSize: '20px' },
    '2xl': { width: '96px', height: '96px', fontSize: '28px' },
  };

  return (
    <div
      style={sizes[size] || sizes.md}
      className={cn(
        'relative inline-flex items-center justify-center rounded-full bg-secondary-200 dark:bg-secondary-800 text-secondary-600 dark:text-secondary-400 font-semibold overflow-hidden shrink-0 border border-secondary-200 dark:border-secondary-750',
        className
      )}
      {...props}
    >
      {src && !hasError ? (
        <img
          src={src}
          alt={alt}
          onError={() => setHasError(true)}
          className="h-full w-full object-cover"
        />
      ) : (
        <span>{getInitials(name)}</span>
      )}
    </div>
  );
};

export default Avatar;
