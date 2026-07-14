import React, { useState, useRef, useEffect } from 'react';
import { MoreVertical, Edit3, Trash2, ShieldAlert } from 'lucide-react';

export const MessageMenu = ({
  isMe,
  onEdit,
  onDelete,
  onReport,
  isDeleted,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (isDeleted) return null;

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-1 rounded-lg text-secondary-400 hover:text-secondary-650 hover:bg-secondary-100 dark:hover:bg-secondary-800 transition-colors focus:outline-none"
        aria-label="Message options"
      >
        <MoreVertical className="h-4 w-4" />
      </button>

      {isOpen && (
        <div className="absolute right-0 z-30 mt-1 w-32 rounded-xl bg-white dark:bg-secondary-900 border border-secondary-200/60 dark:border-secondary-800 shadow-premium-md py-1.5 text-xs text-secondary-700 dark:text-secondary-300 font-semibold select-none">
          {isMe ? (
            <>
              {onEdit && (
                <button
                  onClick={() => {
                    setIsOpen(false);
                    onEdit();
                  }}
                  className="w-full text-left px-3 py-2 hover:bg-secondary-50 dark:hover:bg-secondary-800 flex items-center space-x-2"
                >
                  <Edit3 className="h-3.5 w-3.5" />
                  <span>Edit</span>
                </button>
              )}
              {onDelete && (
                <button
                  onClick={() => {
                    setIsOpen(false);
                    onDelete();
                  }}
                  className="w-full text-left px-3 py-2 text-error-600 hover:bg-error-50 dark:hover:bg-error-950/20 flex items-center space-x-2"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>Delete</span>
                </button>
              )}
            </>
          ) : (
            onReport && (
              <button
                onClick={() => {
                  setIsOpen(false);
                  onReport();
                }}
                className="w-full text-left px-3 py-2 text-warning-605 hover:bg-warning-50 dark:hover:bg-warning-950/20 flex items-center space-x-2"
              >
                <ShieldAlert className="h-3.5 w-3.5" />
                <span>Report</span>
              </button>
            )
          )}
        </div>
      )}
    </div>
  );
};

export default MessageMenu;
