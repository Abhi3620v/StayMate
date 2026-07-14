import React from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/utils/cn';
import { ChevronRight, Home } from 'lucide-react';

/**
 * Accessible Breadcrumbs locator navigation path
 */
const Breadcrumbs = ({
  items = [], // Array of { label, path }
  className,
}) => {
  return (
    <nav
      className={cn('flex items-center space-x-2 text-xs text-secondary-500 dark:text-secondary-400 py-2', className)}
      aria-label="Breadcrumb"
    >
      <ol className="inline-flex items-center space-x-1.5 md:space-x-2">
        <li className="inline-flex items-center">
          <Link
            to="/"
            className="inline-flex items-center hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
          >
            <Home className="mr-1.5 h-3.5 w-3.5" />
            Home
          </Link>
        </li>
        {items.map((item, idx) => {
          const isLast = idx === items.length - 1;
          return (
            <li key={idx} className="flex items-center">
              <ChevronRight className="h-3 w-3 text-secondary-400 shrink-0 mx-1" />
              {isLast ? (
                <span
                  className="font-medium text-secondary-800 dark:text-secondary-200 select-none max-w-[120px] md:max-w-xs truncate"
                  aria-current="page"
                >
                  {item.label}
                </span>
              ) : (
                <Link
                  to={item.path}
                  className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors max-w-[120px] md:max-w-xs truncate"
                >
                  {item.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default Breadcrumbs;
