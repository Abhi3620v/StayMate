import React from 'react';
import { useTheme } from '@/context/ThemeContext';
import { Sun, Moon } from 'lucide-react';
import Button from '../ui/Button';

/**
 * Navigation Bar light/dark theme switch control
 */
const ThemeToggle = ({ className, ...props }) => {
  const { isDark, toggleTheme } = useTheme();

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleTheme}
      className={className}
      aria-label="Toggle theme mode"
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      {...props}
    >
      {isDark ? (
        <Sun className="h-5 w-5 text-warning-500 animate-pulse" />
      ) : (
        <Moon className="h-5 w-5 text-secondary-600 hover:text-secondary-900" />
      )}
    </Button>
  );
};

export default ThemeToggle;
