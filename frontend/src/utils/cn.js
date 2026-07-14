import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Utility to merge dynamic Tailwind class names cleanly.
 * Combines clsx for conditional class execution and tailwind-merge to avoid style duplication conflicts.
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}
