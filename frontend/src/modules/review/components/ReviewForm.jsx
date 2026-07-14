import React, { useState } from 'react';
import RatingStars from './RatingStars';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { useReview } from '../context/ReviewContext';
import { Camera, Trash2, Eye, HelpCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import axios from 'axios';

export const ReviewForm = ({
  category,
  targetId,
  interactionId, // visitId or matchId
  onSuccess,
  onCancel,
}) => {
  const { submitReview } = useReview();
  const [rating, setRating] = useState(5);
  
  // Resolve category star rating factors
  const categoryFactors = {
    property: ['Cleanliness', 'Location', 'Amenities', 'Value for Money', 'Safety', 'Maintenance'],
    owner: ['Communication', 'Professionalism', 'Response Time', 'Transparency', 'Overall Experience'],
    roommate: ['Cleanliness', 'Respectfulness', 'Communication', 'Lifestyle Compatibility', 'Reliability']
  }[category] || [];

  // Initialize scores object
  const [factorScores, setFactorScores] = useState(
    categoryFactors.reduce((acc, factor) => {
      acc[factor.replace(/\s+/g, '')] = 5;
      return acc;
    }, {})
  );

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [images, setImages] = useState([]); // [{ url, caption }]
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [recommend, setRecommend] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Uploader states
  const [uploading, setUploading] = useState(false);

  const handleFactorChange = (factorKey, score) => {
    setFactorScores(prev => ({
      ...prev,
      [factorKey]: score
    }));
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    
    if (images.length + files.length > 5) {
      toast.error('You can upload at most 5 images.');
      return;
    }

    setUploading(true);
    const formData = new FormData();
    files.forEach(file => {
      formData.append('images', file);
    });

    try {
      const token = localStorage.getItem('accessToken');
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000'}/api/v1/uploads/review-attachment`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: token ? `Bearer ${token}` : '',
          },
        }
      );

      const uploaded = response.data.data || [];
      setImages(prev => [
        ...prev,
        ...uploaded.map(u => ({ url: u.url, caption: '' }))
      ]);
      toast.success('Images uploaded successfully!');
    } catch (err) {
      toast.error(err.response?.data?.error?.message || 'File upload failed.');
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = (idx) => {
    setImages(prev => prev.filter((_, i) => i !== idx));
  };

  const handleCaptionChange = (idx, text) => {
    setImages(prev => prev.map((img, i) => i === idx ? { ...img, caption: text } : img));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (content.length < 5) {
      toast.error('Please write a detailed review of at least 5 characters.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        category,
        rating,
        ratings: factorScores,
        content,
        isAnonymous,
        images,
      };

      if (category === 'property') {
        payload.propertyId = targetId;
        payload.visitId = interactionId;
        payload.title = title;
        payload.recommend = recommend;
      } else if (category === 'owner') {
        payload.ownerId = targetId;
        payload.visitId = interactionId;
      } else if (category === 'roommate') {
        payload.roommateId = targetId;
        payload.matchId = interactionId;
      }

      await submitReview(payload);
      if (onSuccess) onSuccess();
    } catch (err) {
      // toast shown in context
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 text-xs font-semibold text-secondary-700 dark:text-secondary-400">
      
      {/* 1. Overall Stars Score */}
      <div className="space-y-1.5">
        <label className="text-[10px] font-black uppercase tracking-wider text-secondary-400 dark:text-secondary-500 block">
          Overall rating
        </label>
        <RatingStars rating={rating} interactive={true} onChange={setRating} size="lg" />
      </div>

      {/* 2. Extensible Category Factor Star sliders */}
      {categoryFactors.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-secondary-50/50 dark:bg-secondary-950/20 p-4 border border-secondary-200/50 dark:border-secondary-900 rounded-2xl">
          {categoryFactors.map((factor) => {
            const factorKey = factor.replace(/\s+/g, '');
            const score = factorScores[factorKey] || 5;

            return (
              <div key={factor} className="flex justify-between items-center bg-white dark:bg-secondary-900/40 p-3 rounded-xl border border-secondary-200/20">
                <span className="font-bold text-secondary-800 dark:text-secondary-300">{factor}</span>
                <RatingStars
                  rating={score}
                  interactive={true}
                  onChange={(val) => handleFactorChange(factorKey, val)}
                  size="sm"
                />
              </div>
            );
          })}
        </div>
      )}

      {/* 3. Recommendation switcher (Property Review only) */}
      {category === 'property' && (
        <div className="flex items-center justify-between border-t border-b border-secondary-100 dark:border-secondary-900 py-3.5 select-none">
          <div>
            <h4 className="font-extrabold text-secondary-900 dark:text-white">Do you recommend this property stay?</h4>
            <p className="text-[10px] text-secondary-400 font-medium">Would you advise your friends to sign a lease here?</p>
          </div>
          <div className="flex border border-secondary-200/60 dark:border-secondary-800 rounded-xl overflow-hidden font-black uppercase text-[10px]">
            <button
              type="button"
              onClick={() => setRecommend(true)}
              className={`px-4 py-2 transition-colors ${
                recommend 
                  ? 'bg-success-550 text-white' 
                  : 'bg-transparent text-secondary-550 hover:bg-secondary-50 dark:hover:bg-secondary-900'
              }`}
            >
              Yes
            </button>
            <button
              type="button"
              onClick={() => setRecommend(false)}
              className={`px-4 py-2 transition-colors ${
                !recommend 
                  ? 'bg-error-550 text-white' 
                  : 'bg-transparent text-secondary-550 hover:bg-secondary-50 dark:hover:bg-secondary-900'
              }`}
            >
              No
            </button>
          </div>
        </div>
      )}

      {/* 4. Title Input (Property only) */}
      {category === 'property' && (
        <Input
          type="text"
          label="Review Title"
          placeholder="Summarize your experience (e.g. Beautiful flat, helpful owner)"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      )}

      {/* 5. Detailed Content Box */}
      <div className="space-y-1.5">
        <label className="text-[10px] font-black uppercase tracking-wider text-secondary-400 dark:text-secondary-500 block">
          Detailed review feedback
        </label>
        <textarea
          required
          rows={5}
          placeholder="Share details of your experience to help others make informed decisions. Respect privacy and use polite language."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full text-xs p-3.5 border border-secondary-200 dark:border-secondary-800 rounded-2xl bg-secondary-50/50 dark:bg-secondary-950 focus:outline-none focus:ring-1 focus:ring-primary-500 text-secondary-900 dark:text-white font-medium"
        />
      </div>

      {/* 6. Cloudinary-integrated Multiple Image Uploader */}
      <div className="space-y-3">
        <label className="text-[10px] font-black uppercase tracking-wider text-secondary-400 dark:text-secondary-500 block">
          Add photos (optional, max 5)
        </label>
        
        {/* Upload Button */}
        <div className="flex items-center space-x-3">
          <label className="flex items-center justify-center border border-dashed border-secondary-300 dark:border-secondary-700 hover:border-primary-500 rounded-2xl h-16 w-16 cursor-pointer group transition-colors">
            <input
              type="file"
              multiple
              accept="image/*"
              className="hidden"
              onChange={handleImageUpload}
              disabled={uploading || images.length >= 5}
            />
            <Camera className="h-5 w-5 text-secondary-400 group-hover:text-primary-500 transition-colors" />
          </label>
          {uploading && (
            <span className="text-[10px] font-bold text-secondary-450 animate-pulse">Uploading review photos...</span>
          )}
        </div>

        {/* Preview List & Captions */}
        {images.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
            {images.map((img, idx) => (
              <div key={idx} className="flex space-x-2.5 p-2 bg-secondary-50 dark:bg-secondary-950/40 border border-secondary-200/40 rounded-xl relative group">
                <img
                  src={img.url}
                  alt="Review preview"
                  className="h-14 w-14 rounded-lg object-cover border"
                />
                <div className="flex-1 space-y-1">
                  <span className="text-[9px] text-secondary-400 block uppercase font-bold">Image #{idx + 1}</span>
                  <input
                    type="text"
                    placeholder="Short caption (optional)"
                    value={img.caption}
                    onChange={(e) => handleCaptionChange(idx, e.target.value)}
                    className="w-full text-[10px] px-2 py-1 border border-secondary-200/60 dark:border-secondary-800 rounded bg-white dark:bg-secondary-900 focus:outline-none focus:ring-1 focus:ring-primary-500"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveImage(idx)}
                  className="p-1 rounded bg-error-50 hover:bg-error-100 text-error-600 absolute right-2 top-2 focus:outline-none"
                  aria-label="Remove photo"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 7. Anonymous Toggle */}
      <div className="flex items-center justify-between border-t border-secondary-100 dark:border-secondary-900 pt-4 select-none">
        <div>
          <h4 className="font-extrabold text-secondary-900 dark:text-white">Review anonymously</h4>
          <p className="text-[10px] text-secondary-400 font-medium">Keep your identity hidden from the general public</p>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={isAnonymous}
            onChange={(e) => setIsAnonymous(e.target.checked)}
            className="sr-only peer"
          />
          <div className="w-9 h-5 bg-secondary-250 dark:bg-secondary-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-secondary-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary-600" />
        </label>
      </div>

      {/* 8. Controls */}
      <div className="flex items-center justify-end space-x-3 pt-4 border-t border-secondary-100 dark:border-secondary-900">
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={submitting}
            className="font-bold py-2.5 px-5 text-[11px] rounded-xl border-secondary-200"
          >
            Cancel
          </Button>
        )}
        <Button
          type="submit"
          variant="primary"
          isLoading={submitting}
          className="font-bold py-2.5 px-6 text-[11px] rounded-xl"
        >
          Submit Review
        </Button>
      </div>
    </form>
  );
};

export default ReviewForm;
