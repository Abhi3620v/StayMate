import React, { useState, useRef, useEffect } from 'react';
import { Smile } from 'lucide-react';

const COMMON_EMOJIS = [
  '😀', '😂', '🤣', '😍', '🥰', '😎', '😜', '🤔', '🙄', '😭',
  '👍', '👎', '❤️', '🔥', '👏', '🎉', '🙌', '🙏', '✨', '💡',
  '🏠', '🔑', '🛌', '🤝', '✔️', '❌', '👀', '💬', '📞', '📅'
];

export const EmojiPicker = ({
  onEmojiSelect,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const pickerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={pickerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-lg text-secondary-400 hover:text-secondary-650 hover:bg-secondary-100 dark:hover:bg-secondary-800 transition-colors focus:outline-none"
        title="Choose emoji"
      >
        <Smile className="h-5 w-5" />
      </button>

      {isOpen && (
        <div className="absolute bottom-12 left-0 z-35 p-3 w-56 rounded-2xl bg-white dark:bg-secondary-900 border border-secondary-200/60 dark:border-secondary-800 shadow-premium-lg animate-fade-in select-none">
          <p className="text-[10px] font-black uppercase tracking-wider text-secondary-400 mb-2">Recent Emojis</p>
          <div className="grid grid-cols-6 gap-2 text-center text-lg">
            {COMMON_EMOJIS.map((emoji) => (
              <button
                key={emoji}
                type="button"
                onClick={() => {
                  onEmojiSelect(emoji);
                  setIsOpen(false);
                }}
                className="hover:scale-125 hover:bg-secondary-50 dark:hover:bg-secondary-800 rounded-lg transition-transform focus:outline-none"
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default EmojiPicker;
