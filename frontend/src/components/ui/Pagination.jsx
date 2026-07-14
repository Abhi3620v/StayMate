import React from 'react';
import { cn } from '@/utils/cn';
import Button from './Button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

/**
 * Reusable list pagination component
 */
const Pagination = ({
  className,
  currentPage = 1,
  totalPages = 1,
  onPageChange,
  siblingCount = 1,
}) => {
  if (totalPages <= 1) return null;

  const range = (start, end) => {
    return Array.from({ length: end - start + 1 }, (_, idx) => idx + start);
  };

  const getPageNumbers = () => {
    const totalNumbers = siblingCount * 2 + 5;
    const totalBlocks = totalNumbers + 2;

    if (totalPages > totalBlocks) {
      const startPage = Math.max(2, currentPage - siblingCount);
      const endPage = Math.min(totalPages - 1, currentPage + siblingCount);

      let pages = range(startPage, endPage);

      const hasLeftSpill = startPage > 2;
      const hasRightSpill = totalPages - endPage > 1;
      const spillOffset = totalNumbers - (pages.length + 1);

      switch (true) {
        case hasLeftSpill && !hasRightSpill: {
          const extraPages = range(startPage - spillOffset, startPage - 1);
          pages = ['...', ...extraPages, ...pages];
          break;
        }
        case !hasLeftSpill && hasRightSpill: {
          const extraPages = range(endPage + 1, endPage + spillOffset);
          pages = [...pages, ...extraPages, '...'];
          break;
        }
        case hasLeftSpill && hasRightSpill:
        default: {
          pages = ['...', ...pages, '...'];
          break;
        }
      }

      return [1, ...pages, totalPages];
    }

    return range(1, totalPages);
  };

  const pages = getPageNumbers();

  return (
    <nav
      className={cn('flex items-center justify-center space-x-1.5 py-4', className)}
      aria-label="Pagination Navigation"
    >
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="px-2"
        aria-label="Previous page"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      {pages.map((page, idx) => {
        const isSpill = page === '...';
        const isActive = page === currentPage;
        
        if (isSpill) {
          return (
            <span
              key={idx}
              className="px-3 py-1.5 text-sm text-secondary-400 select-none cursor-default"
            >
              &#8230;
            </span>
          );
        }

        return (
          <Button
            key={idx}
            variant={isActive ? 'primary' : 'outline'}
            size="sm"
            onClick={() => onPageChange(page)}
            className={cn('min-w-[36px] px-2.5', isActive && 'shadow-none')}
            aria-label={`Page ${page}`}
            aria-current={isActive ? 'page' : undefined}
          >
            {page}
          </Button>
        );
      })}

      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="px-2"
        aria-label="Next page"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </nav>
  );
};

export default Pagination;
  
