import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useParams, Link, useNavigate, useSearchParams } from 'react-router-dom';
import propertyService from '@/services/propertyService';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Badge from '@/components/ui/Badge';
import Alert from '@/components/ui/Alert';
import Avatar from '@/components/ui/Avatar';
import PropertyCard from './components/PropertyCard';
import { 
  MapPin, Bed, Bath, ShieldCheck, Heart, Share, Calendar, Clock, Link2,
  Map, User, Phone, X, CheckCircle, Navigation, MessageCircle, AlertTriangle, CreditCard,
  Wind, Wifi, Zap, Car, ArrowUpDown, WashingMachine, UtensilsCrossed, Dumbbell, Waves, Camera, Sparkles, Coffee, Grid, Check,
  ArrowLeft, ChevronLeft, ChevronRight, ThumbsUp, Star
} from 'lucide-react';
import { GoogleMap, DirectionsButton, NearbyPlacesCard } from '@/modules/location/components/MapComponents';
import BookPropertyModal from '@/modules/payment/components/BookPropertyModal';
import toast from 'react-hot-toast';
import { useChat } from '@/context/ChatContext';
import { useAuth } from '@/context/AuthContext';
import { ReviewProvider, useReview } from '@/modules/review/context/ReviewContext';
import RatingBreakdown from '@/modules/review/components/RatingBreakdown';
import ReviewFilters from '@/modules/review/components/ReviewFilters';
import ReviewCard from '@/modules/review/components/ReviewCard';
import ReviewForm from '@/modules/review/components/ReviewForm';
import RatingStars from '@/modules/review/components/RatingStars';

const AMENITY_ICONS = {
  ac: Wind,
  wifi: Wifi,
  powerBackup: Zap,
  parking: Car,
  lift: ArrowUpDown,
  laundry: WashingMachine,
  kitchen: UtensilsCrossed,
  gym: Dumbbell,
  swimmingPool: Waves,
  security: ShieldCheck,
  cctv: Camera,
  housekeeping: Sparkles,
  foodIncluded: Coffee
};

const getCategorizedImages = (images) => {
  const categories = {
    'Living room': [],
    'Full kitchen': [],
    'Bedrooms': [],
    'Bathrooms': [],
    'Exterior': [],
    'Common Areas': []
  };

  images.forEach((img, idx) => {
    const caption = (img.caption || '').toLowerCase();
    if (caption.includes('bed') || caption.includes('room')) {
      categories['Bedrooms'].push(img);
    } else if (caption.includes('kitchen') || caption.includes('food') || caption.includes('din')) {
      categories['Full kitchen'].push(img);
    } else if (caption.includes('living') || caption.includes('hall') || caption.includes('lounge')) {
      categories['Living room'].push(img);
    } else if (caption.includes('bath') || caption.includes('wash') || caption.includes('toilet') || caption.includes('shower')) {
      categories['Bathrooms'].push(img);
    } else if (caption.includes('exterior') || caption.includes('outside') || caption.includes('front')) {
      categories['Exterior'].push(img);
    } else {
      // Fallback based on index
      if (idx === 0) categories['Exterior'].push(img);
      else if (idx === 1 || idx === 2) categories['Bedrooms'].push(img);
      else if (idx === 3) categories['Full kitchen'].push(img);
      else if (idx === 4) categories['Living room'].push(img);
      else if (idx === 5) categories['Bathrooms'].push(img);
      else categories['Common Areas'].push(img);
    }
  });

  const finalGroups = {};
  
  if (categories['Living room'].length > 0) {
    finalGroups['Living room'] = categories['Living room'];
  }
  if (categories['Full kitchen'].length > 0) {
    finalGroups['Full kitchen'] = categories['Full kitchen'];
  }

  if (categories['Bedrooms'].length > 0) {
    const beds = categories['Bedrooms'];
    if (beds.length <= 2) {
      finalGroups['Bedroom 1'] = beds;
    } else {
      const half = Math.ceil(beds.length / 2);
      finalGroups['Bedroom 1'] = beds.slice(0, half);
      finalGroups['Bedroom 2'] = beds.slice(half);
    }
  }

  if (categories['Bathrooms'].length > 0) {
    const baths = categories['Bathrooms'];
    if (baths.length <= 1) {
      finalGroups['Full bathroom 1'] = baths;
    } else {
      const half = Math.ceil(baths.length / 2);
      finalGroups['Full bathroom 1'] = baths.slice(0, half);
      finalGroups['Full bathroom 2'] = baths.slice(half);
    }
  }

  if (categories['Exterior'].length > 0) {
    finalGroups['Exterior'] = categories['Exterior'];
  }
  if (categories['Common Areas'].length > 0) {
    finalGroups['Common Areas'] = categories['Common Areas'];
  }

  return finalGroups;
};

const CategoryGallery = ({ photos, categoryName }) => {
  if (!photos || photos.length === 0) return null;
  
  return (
    <div id={`tour-cat-${categoryName}`} className="space-y-4 py-8 border-b border-secondary-100 dark:border-secondary-900 last:border-0 scroll-mt-36">
      <h3 className="text-sm font-black text-secondary-900 dark:text-white uppercase tracking-wider">{categoryName}</h3>
      
      {photos.length === 1 ? (
        <div className="overflow-hidden rounded-2xl bg-secondary-100 dark:bg-secondary-900 shadow-premium-sm max-w-2xl">
          <img src={photos[0].url} alt={categoryName} className="w-full h-auto max-h-[420px] object-cover hover:scale-[1.01] transition-transform duration-500" loading="lazy" />
        </div>
      ) : photos.length === 2 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {photos.map((p, i) => (
            <div key={i} className="overflow-hidden rounded-2xl bg-secondary-100 dark:bg-secondary-900 shadow-premium-sm aspect-[4/3]">
              <img src={p.url} alt={`${categoryName}-${i}`} className="w-full h-full object-cover hover:scale-[1.01] transition-transform duration-500" loading="lazy" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2 overflow-hidden rounded-2xl bg-secondary-100 dark:bg-secondary-900 shadow-premium-sm aspect-[16/10]">
            <img src={photos[0].url} alt={`${categoryName}-featured`} className="w-full h-full object-cover hover:scale-[1.01] transition-transform duration-500" loading="lazy" />
          </div>
          <div className="grid grid-rows-2 gap-4 md:col-span-1">
            <div className="overflow-hidden rounded-2xl bg-secondary-100 dark:bg-secondary-900 shadow-premium-sm aspect-[4/3] md:aspect-auto">
              <img src={photos[1].url} alt={`${categoryName}-sub1`} className="w-full h-full object-cover hover:scale-[1.01] transition-transform duration-500" loading="lazy" />
            </div>
            <div className="overflow-hidden rounded-2xl bg-secondary-100 dark:bg-secondary-900 shadow-premium-sm aspect-[4/3] md:aspect-auto">
              <img src={photos[2].url} alt={`${categoryName}-sub2`} className="w-full h-full object-cover hover:scale-[1.01] transition-transform duration-500" loading="lazy" />
            </div>
          </div>
          {photos.slice(3).map((p, i) => (
            <div key={i} className="overflow-hidden rounded-2xl bg-secondary-100 dark:bg-secondary-900 shadow-premium-sm aspect-[4/3]">
              <img src={p.url} alt={`${categoryName}-extra-${i}`} className="w-full h-full object-cover hover:scale-[1.01] transition-transform duration-500" loading="lazy" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const LeafLeft = () => (
  <svg className="w-[86.7px] h-[132px] text-secondary-800 dark:text-secondary-100 shrink-0" viewBox="0 0 24 32" fill="currentColor">
    {/* Stem */}
    <path d="M10,28 C8,28 5,26 5,22 C5,20 6,18 7,16" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" />
    {/* Leaf 1 (Bottom) */}
    <path d="M7,23 C4,22 1,18 3,14 C4.5,14 8,16.5 9,20 C9.5,21.5 8.5,22.5 7,23 Z" />
    {/* Leaf 2 */}
    <path d="M9,17 C6,16 3.5,11 6.5,7.5 C8,7.5 11.5,10 12.5,14 C12.5,15.5 11,16.5 9,17 Z" />
    {/* Leaf 3 */}
    <path d="M11,11 C8,10 6.5,5 9.5,1.5 C11,1.5 14,4 14.5,8 C14.5,9.5 13,10.5 11,11 Z" />
    {/* Leaf 4 (Top) */}
    <path d="M12.5,5 C10.5,4.5 10,1.5 12,0 C13,0 15,2 15,3.5 C15,4.5 14,5 12.5,5 Z" />
  </svg>
);

const LeafRight = () => (
  <div className="scale-x-[-1] flex items-center justify-center">
    <LeafLeft />
  </div>
);

const SprayIcon = () => (
  <svg className="h-7 w-7 text-secondary-800 dark:text-secondary-200" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 3h3v3H9z" />
    <path d="M10 6v4" />
    <path d="M13 14c0-2.5-2.5-4.5-2.5-4.5h-2S6 11.5 6 14a3 3 0 0 0 6 0Z" />
    <path d="M8 21h2" />
    <path d="M9 17v4" />
    <path d="m14 8 3-3" />
    <path d="M17 9h.01" />
    <path d="M20 6h.01" />
    <path d="M21 10h.01" />
  </svg>
);

const AccuracyIcon = () => (
  <svg className="h-7 w-7 text-secondary-800 dark:text-secondary-200" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <path d="m9 12 2 2 4-4" />
  </svg>
);

const KeyIcon = () => (
  <svg className="h-7 w-7 text-secondary-800 dark:text-secondary-200" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="7.5" cy="15.5" r="5.5" />
    <path d="m11.5 11.5 9-9" />
    <path d="m17 3.5 3.5 3.5" />
    <path d="m15 5.5 2 2" />
  </svg>
);

const CommunicationIcon = () => (
  <svg className="h-7 w-7 text-secondary-800 dark:text-secondary-200" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);

const LocationIcon = () => (
  <svg className="h-7 w-7 text-secondary-800 dark:text-secondary-200" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21" />
    <line x1="9" y1="3" x2="9" y2="18" />
    <line x1="15" y1="6" x2="15" y2="21" />
  </svg>
);

const ValueIcon = () => (
  <svg className="h-7 w-7 text-secondary-800 dark:text-secondary-200" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2H2v10l9.29 9.29c.94.94 2.48.94 3.42 0l6.58-6.58c.94-.94.94-2.48 0-3.42L12 2Z" />
    <path d="M7 7h.01" />
  </svg>
);

const WhatsAppIcon = () => (
  <svg className="h-3.5 w-3.5 shrink-0 text-[#25D366] fill-[#25D366]" viewBox="0 0 24 24">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.454 5.709 1.455h.008c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);

const TelegramIcon = () => (
  <svg className="h-3.5 w-3.5 shrink-0 text-[#0088cc] fill-[#0088cc]" viewBox="0 0 24 24">
    <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.24-.213-.054-.33-.373-.117L6.829 13.06l-2.96-.924c-.643-.201-.656-.643.135-.953l11.566-4.458c.536-.196 1.006.128.832.996z" />
  </svg>
);

const FILTER_PILLS = [
  { id: 'accuracy', label: 'Accuracy', icon: '🎯' },
  { id: 'cleanliness', label: 'Cleanliness', icon: '🧼' },
  { id: 'comfort', label: 'Comfort', icon: '🛋️' },
  { id: 'hospitality', label: 'Hospitality', icon: '🎁' },
  { id: 'checkin', label: 'Check-in', icon: '🔑' },
  { id: 'condition', label: 'Condition', icon: '🛡️' },
  { id: 'location', label: 'Location', icon: '📍' },
  { id: 'value', label: 'Value', icon: '🏷️' },
  { id: 'view', label: 'View', icon: '🖼️' },
];

const PremiumReviewCard = ({ review }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [helpfulClicked, setHelpfulClicked] = useState(false);
  const authorName = review.authorId?.name || 'Verified Guest';
  const authorAvatar = review.authorId?.avatar || '';
  const comment = review.content || review.comment || '';
  const isLongComment = comment.length > 200;
  const displayedComment = isExpanded ? comment : `${comment.slice(0, 200)}...`;

  const timeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    let interval = Math.floor(seconds / 31536000);
    if (interval >= 1) return `${interval} year${interval > 1 ? 's' : ''} on StayMate`;
    interval = Math.floor(seconds / 2592000);
    if (interval >= 1) return `${interval} month${interval > 1 ? 's' : ''} on StayMate`;
    interval = Math.floor(seconds / 604800);
    if (interval >= 1) return `${interval} week${interval > 1 ? 's' : ''} on StayMate`;
    return 'Newly registered';
  };

  const reviewAge = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    let interval = Math.floor(seconds / 31536000);
    if (interval >= 1) return `${interval} year${interval > 1 ? 's' : ''} ago`;
    interval = Math.floor(seconds / 2592000);
    if (interval >= 1) return `${interval} month${interval > 1 ? 's' : ''} ago`;
    interval = Math.floor(seconds / 604800);
    if (interval >= 1) return `${interval} week${interval > 1 ? 's' : ''} ago`;
    interval = Math.floor(seconds / 86400);
    if (interval >= 1) return `${interval} day${interval > 1 ? 's' : ''} ago`;
    return 'recently';
  };

  const authorDuration = timeAgo(review.authorId?.createdAt || review.createdAt);
  const ageStr = reviewAge(review.createdAt);
  const starCount = Math.round(review.rating || 5);

  return (
    <div className="py-6 space-y-4 bg-transparent select-text border-b border-secondary-100 dark:border-secondary-800/60 last:border-b-0">
      {/* Author row */}
      <div className="flex items-center space-x-3.5">
        <Avatar src={authorAvatar} name={authorName} size="lg" className="rounded-full border-2 border-secondary-100 dark:border-secondary-800 shadow-sm" />
        <div>
          <div className="flex items-center space-x-2">
            <h5 className="text-sm font-bold text-secondary-900 dark:text-white leading-tight">{authorName}</h5>
            <span className="inline-flex items-center space-x-0.5 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-md border border-emerald-200/50 dark:border-emerald-800/50">
              <CheckCircle className="h-2.5 w-2.5" />
              <span>Verified</span>
            </span>
          </div>
          <span className="text-xs text-secondary-400 font-medium block mt-0.5">{authorDuration}</span>
        </div>
      </div>
      
      {/* Rating and date row */}
      <div className="flex items-center space-x-2.5">
        <div className="flex items-center space-x-0.5">
          {[1, 2, 3, 4, 5].map(s => (
            <Star key={s} className={`h-3.5 w-3.5 ${s <= starCount ? 'fill-amber-400 text-amber-400' : 'text-secondary-200 dark:text-secondary-700'}`} />
          ))}
        </div>
        <span className="text-secondary-300 dark:text-secondary-600">{"\u00B7"}</span>
        <span className="text-xs text-secondary-500 dark:text-secondary-400 font-medium">{ageStr}</span>
      </div>

      {/* Review title */}
      {review.title && (
        <h6 className="text-sm font-bold text-secondary-900 dark:text-white leading-snug">"{review.title}"</h6>
      )}

      {/* Review content */}
      <div className="space-y-2">
        <p className="text-sm text-secondary-600 dark:text-secondary-350 leading-relaxed font-normal whitespace-pre-line">
          {isLongComment ? displayedComment : comment}
        </p>
        
        {isLongComment && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-sm font-bold text-secondary-900 dark:text-white underline underline-offset-2 decoration-1 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
          >
            {isExpanded ? 'Show less' : 'Show more'}
          </button>
        )}
      </div>

      {/* Host response */}
      {review.reply && review.reply.content && (
        <div className="ml-4 pl-4 border-l-2 border-secondary-200 dark:border-secondary-700 bg-secondary-50/50 dark:bg-secondary-900/30 rounded-r-2xl p-4">
          <div className="flex items-center space-x-2 mb-2">
            <span className="text-xs font-bold text-secondary-900 dark:text-white">Response from host</span>
            <span className="text-[10px] text-secondary-400 font-medium">{reviewAge(review.reply.createdAt || review.createdAt)}</span>
          </div>
          <p className="text-sm text-secondary-600 dark:text-secondary-400 leading-relaxed font-normal">
            {review.reply.content}
          </p>
        </div>
      )}

      {/* Helpful button */}
      <div className="flex items-center justify-end pt-1">
        <button
          onClick={() => {
            setHelpfulClicked(true);
            toast.success('Thanks for your feedback!');
          }}
          className={`inline-flex items-center space-x-1.5 text-xs font-medium px-3 py-1.5 rounded-full border transition-all duration-200 ${
            helpfulClicked
              ? 'bg-secondary-100 dark:bg-secondary-800 border-secondary-200 dark:border-secondary-700 text-secondary-900 dark:text-white'
              : 'border-secondary-200 dark:border-secondary-700 text-secondary-400 hover:text-secondary-700 dark:hover:text-secondary-200 hover:border-secondary-300 dark:hover:border-secondary-600'
          }`}
        >
          <ThumbsUp className={`h-3.5 w-3.5 ${helpfulClicked ? 'fill-current' : ''}`} />
          <span>Helpful</span>
        </button>
      </div>
    </div>
  );
};

const LocationInsightsCard = () => {
  return (
    <Card className="p-5 border-secondary-200/50 dark:border-secondary-850 rounded-[24px] bg-secondary-50/20 dark:bg-secondary-900/10 space-y-4 shadow-premium-sm">
      <h4 className="font-extrabold text-xs text-secondary-900 dark:text-white uppercase tracking-wider">Location Insights</h4>
      <div className="space-y-3.5 text-xs text-secondary-600 dark:text-secondary-400 font-medium">
        <div className="flex items-start gap-3">
          <div className="p-1.5 rounded-lg bg-success-50 dark:bg-success-950/20 text-success-650 shrink-0">🌳</div>
          <div>
            <p className="font-black text-secondary-800 dark:text-white">Walkable Neighborhood</p>
            <p className="text-[10px] text-secondary-400 mt-0.5">Most daily errands can be accomplished on foot. Transit nodes are nearby.</p>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <div className="p-1.5 rounded-lg bg-primary-50 dark:bg-primary-950/20 text-primary-650 shrink-0">🚌</div>
          <div>
            <p className="font-black text-secondary-800 dark:text-white">Excellent Commute Options</p>
            <p className="text-[10px] text-secondary-400 mt-0.5">Direct connections to local metro links and major bus routes within 500m.</p>
          </div>
        </div>
      </div>
    </Card>
  );
};

const PropertyDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { createConversation } = useChat();
  const { user } = useAuth();
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [showBookModal, setShowBookModal] = useState(false);
  const [showStickyNav, setShowStickyNav] = useState(false);
  const [activeSection, setActiveSection] = useState('photos');
  const [highlightedPlace, setHighlightedPlace] = useState(null);

  useEffect(() => {
    const handleScroll = () => {
      const galleryEl = document.getElementById('photos-section');
      if (galleryEl) {
        const rect = galleryEl.getBoundingClientRect();
        setShowStickyNav(rect.bottom < 80);
      }
    };

    const handleActiveScroll = () => {
      const sections = ['photos-section', 'amenities-section', 'reviews-section', 'location-section', 'host-section', 'things-to-know-section'];
      let current = 'photos';
      for (const sec of sections) {
        const el = document.getElementById(sec);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= 145) {
            current = sec.replace('-section', '');
          }
        }
      }
      setActiveSection(current);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('scroll', handleActiveScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('scroll', handleActiveScroll);
    };
  }, []);

  const scrollToSection = (secId) => {
    const el = document.getElementById(`${secId}-section`);
    if (el) {
      const offset = 84;
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = el.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;
      
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  // Review states and hooks
  const { reviews, stats, loading: reviewsLoading, fetchReviews, fetchStats, filters, changeFilters, page, setPage, total, limit } = useReview();
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [eligibleVisit, setEligibleVisit] = useState(null);
  const [selectedPill, setSelectedPill] = useState(null);

  const filteredReviews = React.useMemo(() => {
    if (!selectedPill) return reviews;
    const keywordsMap = {
      accuracy: ['accurat', 'exact', 'correct', 'description', 'picture', 'photo', 'truth', 'as described', 'accuracy'],
      cleanliness: ['clean', 'spotless', 'dirt', 'dust', 'tidy', 'hygiene', 'cleanliness', 'messy', 'neat', 'wash'],
      comfort: ['comfort', 'bed', 'sofa', 'mattress', 'cozy', 'sleep', 'relax', 'warm', 'pillow'],
      hospitality: ['host', 'owner', 'friendly', 'kind', 'nice', 'helpful', 'hospitality', 'welcome', 'responsive'],
      checkin: ['check-in', 'check in', 'key', 'lockbox', 'lock', 'entry', 'arrive', 'welcome', 'arrival'],
      condition: ['condition', 'new', 'old', 'broken', 'repair', 'maintenance', 'well kept', 'renovated'],
      location: ['location', 'neighborhood', 'metro', 'transit', 'station', 'bus', 'walk', 'near', 'distance', 'quiet', 'noisy'],
      value: ['value', 'price', 'worth', 'cheap', 'expensive', 'cost', 'budget', 'affordable', 'deal'],
      view: ['view', 'scenery', 'window', 'balcony', 'outside', 'beautiful', 'scenic']
    };
    const words = keywordsMap[selectedPill] || [];
    return reviews.filter(r => {
      const comment = (r.content || r.comment || '').toLowerCase();
      return words.some(w => comment.includes(w));
    });
  }, [reviews, selectedPill]);

  // Fetch reviews and stats on prop load or filter change
  useEffect(() => {
    if (id) {
      fetchReviews('property', id);
      fetchStats('property', id);
    }
  }, [id, filters, page, fetchReviews, fetchStats]);

  // Check eligibility for reviews
  useEffect(() => {
    const checkEligibility = async () => {
      if (!user) return;
      try {
        const visitsList = await propertyService.getVisits();
        // Find visit for this property that is approved
        const match = (visitsList || []).find(v => 
          String(v.propertyId?._id || v.propertyId) === String(id) && 
          ['accepted', 'approved'].includes(v.status)
        );
        setEligibleVisit(match || null);
      } catch (err) {
        console.warn('Failed to load user visits for review check:', err.message);
      }
    };
    checkEligibility();
  }, [id, user, reviews]);

  const hasReviewedEligibleVisit = eligibleVisit && reviews.some(r => 
    String(r.visitId) === String(eligibleVisit._id) && String(r.authorId?._id || r.authorId) === String(user?.id || user?._id)
  );
  const [showFullscreen, setShowFullscreen] = useState(false);

  useEffect(() => {
    if (showFullscreen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [showFullscreen]);

  // Visit Request scheduling
  const [showVisitModal, setShowVisitModal] = useState(searchParams.get('schedule') === 'true');
  const [visitDate, setVisitDate] = useState('');
  const [visitTime, setVisitTime] = useState('11:00');
  const [visitNote, setVisitNote] = useState('');
  const [schedulingLoading, setSchedulingLoading] = useState(false);

  // State data
  const [prop, setProp] = useState(null);
  const [similarProps, setSimilarProps] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSaved, setIsSaved] = useState(false);

  const fetchPropertyDetails = async () => {
    setIsLoading(true);
    try {
      const data = await propertyService.getProperty(id);
      setProp(data);
      setError(null);
      
      // Fetch similar properties in same city
      if (data.location?.city) {
        const similar = await propertyService.getProperties({ city: data.location.city, limit: 4 });
        setSimilarProps(similar.properties?.filter(p => (p._id || p.id) !== id) || []);
      }
    } catch (err) {
      setError(err);
    } finally {
      setIsLoading(false);
    }
  };

  const checkWishlistStatus = async () => {
    if (!user) return;
    try {
      const savedList = await propertyService.getWishlist();
      const isSavedLocal = (savedList || []).some(p => String(p._id || p.id) === String(id));
      setIsSaved(isSavedLocal);
    } catch (err) {
      console.error('Error checking wishlist status:', err);
    }
  };

  useEffect(() => {
    fetchPropertyDetails();
    if (user) {
      checkWishlistStatus();
    } else {
      setIsSaved(false);
    }
  }, [id, user]);

  const handleContactOwner = async () => {
    try {
      const landlordId = prop.ownerId._id || prop.ownerId;
      const currentUserId = user.id || user._id;
      await createConversation(
        'property',
        prop._id || prop.id,
        'Property',
        [currentUserId, landlordId]
      );
      toast.success('Conversation started! Redirecting to chat...');
      navigate(window.location.pathname.startsWith('/tenant') ? '/tenant/chat' : '/chat');
    } catch (err) {
      toast.error('Log in to contact the property listing owner.');
    }
  };

  const handleToggleWishlist = async () => {
    try {
      const res = await propertyService.toggleWishlist(id);
      toast.success(res.message);
      setIsSaved(prev => !prev);
      fetchPropertyDetails();
    } catch (err) {
      toast.error('Log in to save property listings.');
    }
  };

  const handleScheduleVisitClick = () => {
    if (!user) {
      toast.error('Please log in to schedule a property tour.');
      navigate('/login');
      return;
    }
    setShowVisitModal(true);
  };

  const handlePayDepositClick = () => {
    if (!user) {
      toast.error('Log in to pay a property deposit.');
      navigate('/login');
      return;
    }
    if (user.role !== 'tenant') {
      toast.error('Only tenants can pay booking deposits.');
      return;
    }
    setShowBookModal(true);
  };

  const handleScheduleVisit = async (e) => {
    e.preventDefault();
    if (!visitDate) {
      toast.error('Select a date for your visit request.');
      return;
    }

    setSchedulingLoading(true);
    try {
      await propertyService.requestVisit({
        propertyId: id,
        date: visitDate,
        time: visitTime,
        note: visitNote,
      });
      toast.success('Tour request sent to landlord!');
      setShowVisitModal(false);
      fetchPropertyDetails();
    } catch (err) {
      toast.error(err.response?.data?.error?.message || 'Failed to submit tour request.');
    } finally {
      setSchedulingLoading(false);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Listing link copied to clipboard!');
  };

  const handleWhatsAppShare = () => {
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(`Check out this property on StayMate: ${window.location.href}`)}`);
  };

  const handleTelegramShare = () => {
    window.open(`https://t.me/share/url?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(`Check out this property listing on StayMate!`)}`);
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-12 text-center text-xs text-secondary-400 animate-pulse">
        Retrieving listing data...
      </div>
    );
  }

  if (error || !prop) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-6">
        <Alert variant="error" className="font-bold">
          Listing details could not be found. It may have been archived by the owner.
        </Alert>
      </div>
    );
  }

  const imagesList = prop.images || [];
  const categorizedImages = getCategorizedImages(imagesList);
  const primaryImg = imagesList[activeImageIdx]?.url || 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80';

  // Mock nearby locations based on address area
  const nearbyPlaces = [
    { type: 'Metro Station', name: `${prop.location?.area || 'Sector 62'} Metro Station`, distance: '0.8 km (10 mins walk)' },
    { type: 'College / University', name: 'JIIT / Amity Campus', distance: '1.2 km (15 mins walk)' },
    { type: 'Hospital / Clinic', name: 'Fortis Healthcare Hospital', distance: '1.5 km (5 mins drive)' },
    { type: 'Supermarket', name: 'Spencers Daily Market', distance: '0.4 km (5 mins walk)' }
  ];

  return (
    <div className="relative">
      
      {/* Sticky Category/Section Navigation Bar (Airbnb style) */}
      <div 
        className={`fixed left-0 right-0 z-30 border-b border-secondary-200/50 dark:border-secondary-900/80 bg-white/95 dark:bg-secondary-950/95 backdrop-blur-md transition-all duration-305 top-0 ${
          showStickyNav 
            ? 'translate-y-0 opacity-100 shadow-premium-sm pointer-events-auto' 
            : '-translate-y-full opacity-0 pointer-events-none'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 md:px-6 flex items-center justify-between h-[68px]">
          {/* Navigation Links */}
          <div className="flex space-x-6 overflow-x-auto h-full items-center scrollbar-none">
            {['photos', 'amenities', 'reviews', 'location', 'host', 'things-to-know'].map((sec) => (
              <button
                key={sec}
                onClick={() => scrollToSection(sec)}
                className="text-xs font-black pb-2 pt-2 border-b-2 transition-all shrink-0 capitalize border-transparent text-secondary-750 hover:text-secondary-900 hover:border-secondary-900 dark:text-secondary-300 dark:hover:text-white dark:hover:border-white"
              >
                {sec.replace('-', ' ')}
              </button>
            ))}
          </div>

          {/* Right Side: Compact sticky header summary */}
          <div className="hidden md:flex items-center space-x-4">
            <div className="text-right">
              <p className="text-[10px] font-black text-secondary-900 dark:text-white leading-tight truncate max-w-[160px]">{prop.title}</p>
              {stats && stats.totalReviews > 0 ? (
                <p className="text-[9px] font-bold text-secondary-450 mt-0.5">
                  ★ {stats.averageRating} ({stats.totalReviews} {stats.totalReviews === 1 ? 'review' : 'reviews'})
                </p>
              ) : (
                <p className="text-[9px] font-bold text-secondary-450 mt-0.5">No reviews yet</p>
              )}
            </div>

            <div className="flex items-center space-x-1 shrink-0 border-l border-secondary-200/60 dark:border-secondary-800 pl-3">
              <button 
                onClick={handleCopyLink} 
                className="flex items-center text-[10px] font-bold text-secondary-650 dark:text-secondary-300 hover:underline px-2 py-1 rounded-lg hover:bg-secondary-50 dark:hover:bg-secondary-900"
              >
                <Share className="h-3.5 w-3.5 mr-1" />
                <span>Share</span>
              </button>
              <button 
                onClick={handleToggleWishlist} 
                className="flex items-center text-[10px] font-bold text-secondary-650 dark:text-secondary-300 hover:underline px-2 py-1 rounded-lg hover:bg-secondary-50 dark:hover:bg-secondary-900"
              >
                <Heart className={`h-3.5 w-3.5 mr-1 ${isSaved ? 'fill-error-500 text-error-500' : ''}`} />
                <span>{isSaved ? 'Saved' : 'Save'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-6 pt-0 pb-24 lg:pb-6 space-y-6">
        
        {/* Headline Header */}
        <div className="pb-3 border-b border-secondary-100 dark:border-secondary-900 mt-2">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            
            {/* Left Side: Back Arrow | Title | Address */}
            <div className="flex flex-wrap items-center gap-3">
              <Link 
                to="/properties" 
                className="text-secondary-600 hover:text-primary-600 transition-colors shrink-0 mr-1.5 hidden md:inline-flex"
                title="Back to search feed"
              >
                <ArrowLeft className="h-5 w-5 stroke-[2.5]" />
              </Link>
              
              <h1 className="text-xl md:text-2xl font-black text-secondary-900 dark:text-white leading-tight">{prop.title}</h1>
              
              <span className="text-secondary-350 dark:text-secondary-650 hidden sm:inline text-xl md:text-2xl font-black">|</span>
              
              <div className="flex items-center text-xl md:text-2xl font-black text-secondary-900 dark:text-white">
                <MapPin className="h-5 w-5 mr-1.5 text-primary-500 shrink-0 animate-pulse" />
                <span className="hover:underline cursor-pointer">
                  {prop.location?.area ? `${prop.location.area}, ` : ''}{prop.location?.city}
                </span>
              </div>
            </div>

            {/* Right Side: Share and Save Buttons */}
            <div className="flex items-center space-x-2 shrink-0 hidden md:flex">
              <button 
                onClick={handleCopyLink} 
                className="flex items-center text-xs font-bold text-secondary-900 dark:text-white px-3 py-1.5 rounded-xl border border-transparent hover:border-secondary-200/60 hover:bg-secondary-100/70 dark:hover:bg-secondary-800 transition-all duration-200"
              >
                <Share className="h-3.5 w-3.5 mr-1.5 text-secondary-800 dark:text-secondary-200 shrink-0" />
                <span className="underline">Share</span>
              </button>
              <button 
                onClick={handleToggleWishlist} 
                className="flex items-center text-xs font-bold text-secondary-900 dark:text-white px-3 py-1.5 rounded-xl border border-transparent hover:border-secondary-200/60 hover:bg-secondary-100/70 dark:hover:bg-secondary-800 transition-all duration-200"
              >
                <Heart className={`h-3.5 w-3.5 mr-1.5 shrink-0 ${isSaved ? 'fill-error-500 text-error-500' : 'text-secondary-800 dark:text-secondary-200'}`} />
                <span className="underline">{isSaved ? 'Saved' : 'Save'}</span>
              </button>
            </div>

          </div>
        </div>

        {/* Gallery Layout */}
        <div id="photos-section" className="relative scroll-mt-36">
          
          {/* Mobile-Only Sliding Carousel Layout */}
          <div className="md:hidden relative h-[250px] sm:h-[350px] w-full rounded-[24px] overflow-hidden bg-secondary-100 dark:bg-secondary-900 shadow-premium-sm group select-none">
            {/* Horizontal Scroll-Snap Carousel Container */}
            <div 
              className="flex overflow-x-auto snap-x snap-mandatory scrollbar-none h-full w-full scroll-smooth"
              onScroll={(e) => {
                const scrollLeft = e.currentTarget.scrollLeft;
                const width = e.currentTarget.clientWidth;
                if (width > 0) {
                  const newIdx = Math.round(scrollLeft / width);
                  if (newIdx !== activeImageIdx && newIdx >= 0 && newIdx < imagesList.length) {
                    setActiveImageIdx(newIdx);
                  }
                }
              }}
            >
              {imagesList.map((img, idx) => (
                <div 
                  key={idx}
                  onClick={() => setShowFullscreen(true)}
                  className="w-full h-full flex-shrink-0 snap-start snap-always cursor-zoom-in"
                >
                  <img src={img.url} alt={`${prop.title}-${idx}`} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>

            {/* Circular Header Actions Overlay */}
            <div className="absolute top-4 left-4 right-4 flex justify-between items-center z-10 pointer-events-none">
              <Link 
                to="/properties" 
                className="pointer-events-auto h-9 w-9 bg-white dark:bg-secondary-900 rounded-full flex items-center justify-center text-secondary-800 dark:text-white shadow-premium-md hover:scale-105 active:scale-95 transition-all"
                title="Back"
              >
                <ArrowLeft className="h-[18px] w-[18px] stroke-[2.5]" />
              </Link>
              
              <div className="flex items-center space-x-2 pointer-events-auto">
                <button 
                  onClick={handleCopyLink} 
                  className="h-9 w-9 bg-white dark:bg-secondary-900 rounded-full flex items-center justify-center text-secondary-800 dark:text-white shadow-premium-md hover:scale-105 active:scale-95 transition-all"
                  title="Share"
                >
                  <Share className="h-[18px] w-[18px]" />
                </button>
                <button 
                  onClick={handleToggleWishlist} 
                  className="h-9 w-9 bg-white dark:bg-secondary-900 rounded-full flex items-center justify-center text-secondary-800 dark:text-white shadow-premium-md hover:scale-105 active:scale-95 transition-all"
                  title="Save"
                >
                  <Heart className={`h-[18px] w-[18px] ${isSaved ? 'fill-error-500 text-error-500' : ''}`} />
                </button>
              </div>
            </div>

            {/* Index Counter Badge */}
            <div className="absolute bottom-4 right-4 bg-black/70 backdrop-blur-xs text-white font-extrabold text-[10px] px-2.5 py-1.5 rounded-full select-none tracking-widest z-10">
              {activeImageIdx + 1} / {imagesList.length}
            </div>
          </div>

          {/* Desktop-Only Frozen Grid Layout */}
          <div className="hidden md:block">
            {imagesList.length >= 5 ? (
              <div className="grid grid-cols-1 md:grid-cols-4 md:grid-rows-2 h-[220px] sm:h-[320px] md:h-[450px] gap-2 rounded-[24px] overflow-hidden shadow-premium-sm">
                {/* Main Featured Photo */}
                <div 
                  onClick={() => { setActiveImageIdx(0); setShowFullscreen(true); }}
                  className="md:col-span-2 md:row-span-2 overflow-hidden relative cursor-zoom-in group h-full bg-secondary-100"
                >
                  <img src={imagesList[0].url} alt={prop.title} className="w-full h-full object-cover group-hover:scale-[1.015] transition-transform duration-500" />
                </div>
                {/* Top Row Right Photos */}
                <div 
                  onClick={() => { setActiveImageIdx(1); setShowFullscreen(true); }} 
                  className="hidden md:block md:col-span-1 overflow-hidden relative cursor-zoom-in group h-full bg-secondary-100"
                >
                  <img src={imagesList[1].url} alt="detail-1" className="w-full h-full object-cover group-hover:scale-[1.015] transition-transform duration-500" />
                </div>
                <div 
                  onClick={() => { setActiveImageIdx(2); setShowFullscreen(true); }} 
                  className="hidden md:block md:col-span-1 overflow-hidden relative cursor-zoom-in group h-full bg-secondary-100"
                >
                  <img src={imagesList[2].url} alt="detail-2" className="w-full h-full object-cover group-hover:scale-[1.015] transition-transform duration-500" />
                </div>
                {/* Bottom Row Right Photos */}
                <div 
                  onClick={() => { setActiveImageIdx(3); setShowFullscreen(true); }} 
                  className="hidden md:block md:col-span-1 overflow-hidden relative cursor-zoom-in group h-full bg-secondary-100"
                >
                  <img src={imagesList[3].url} alt="detail-3" className="w-full h-full object-cover group-hover:scale-[1.015] transition-transform duration-500" />
                </div>
                <div 
                  onClick={() => { setActiveImageIdx(4); setShowFullscreen(true); }} 
                  className="hidden md:block md:col-span-1 overflow-hidden relative cursor-zoom-in group h-full bg-secondary-100"
                >
                  <img src={imagesList[4].url} alt="detail-4" className="w-full h-full object-cover group-hover:scale-[1.015] transition-transform duration-500" />
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div 
                  onClick={() => setShowFullscreen(true)}
                  className="md:col-span-3 h-[220px] sm:h-[320px] md:h-[450px] rounded-[24px] overflow-hidden bg-secondary-100 relative cursor-zoom-in group shadow-premium-sm"
                >
                  <img src={primaryImg} alt={prop.title} className="w-full h-full object-cover group-hover:scale-[1.015] transition-transform duration-500" />
                </div>

                <div className="md:col-span-1 flex md:flex-col gap-3 overflow-x-auto md:overflow-x-visible pb-2 md:pb-0 h-fit">
                  {imagesList.map((img, idx) => (
                    <button
                      key={`${img.publicId || 'img'}_${idx}`}
                      onClick={() => { setActiveImageIdx(idx); setShowFullscreen(true); }}
                      className={`w-20 md:w-full h-16 md:h-[80px] rounded-[14px] overflow-hidden bg-secondary-50 shrink-0 border-2 transition-all ${idx === activeImageIdx ? 'border-primary-500 scale-98 shadow-sm' : 'border-transparent opacity-85 hover:opacity-100'}`}
                    >
                      <img src={img.url} alt="thumbnail" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            <button 
              onClick={() => setShowFullscreen(true)}
              className="absolute bottom-4 right-4 bg-white dark:bg-secondary-900 hover:bg-secondary-50 dark:hover:bg-secondary-800 text-secondary-900 dark:text-white border border-secondary-200 dark:border-secondary-700 font-extrabold text-[10px] uppercase tracking-wider px-4 py-2.5 rounded-xl flex items-center space-x-1.5 shadow-premium-md transition-all duration-200 active:scale-95 z-10"
            >
              <Grid className="h-4 w-4 text-secondary-500 dark:text-secondary-400" />
              <span>See All Photos</span>
            </button>
          </div>
        </div>

        {/* Body details & side summary card */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          <div className="lg:col-span-2 space-y-8">
            
            {/* Key Quick Facts */}
            <Card className="p-5 border-secondary-200/50 flex justify-around text-center rounded-[20px] shadow-premium-sm bg-secondary-50/20">
              <div>
                <p className="text-[9px] font-bold text-secondary-400 uppercase tracking-widest">Bedrooms</p>
                <p className="text-sm font-black text-secondary-800 dark:text-white mt-1.5 flex items-center justify-center">
                  <Bed className="h-4.5 w-4.5 text-primary-500 mr-1 shrink-0" />
                  {prop.roomDetails?.bedrooms} BHK
                </p>
              </div>
              <div className="border-r border-secondary-150/80 dark:border-secondary-900" />
              <div>
                <p className="text-[9px] font-bold text-secondary-400 uppercase tracking-widest">Bathrooms</p>
                <p className="text-sm font-black text-secondary-800 dark:text-white mt-1.5 flex items-center justify-center">
                  <Bath className="h-4.5 w-4.5 text-primary-500 mr-1 shrink-0" />
                  {prop.roomDetails?.bathrooms} Bath
                </p>
              </div>
              <div className="border-r border-secondary-150/80 dark:border-secondary-900" />
              <div>
                <p className="text-[9px] font-bold text-secondary-400 uppercase tracking-widest">Furnishing</p>
                <p className="text-xs font-black text-secondary-800 dark:text-white mt-2 capitalize">
                  {prop.roomDetails?.furnishing?.replace('_', ' ')}
                </p>
              </div>
              <div className="border-r border-secondary-150/80 dark:border-secondary-900" />
              <div>
                <p className="text-[9px] font-bold text-secondary-400 uppercase tracking-widest">Area Size</p>
                <p className="text-xs font-black text-secondary-800 dark:text-white mt-2">
                  {prop.roomDetails?.areaSqFt} sq.ft
                </p>
              </div>
            </Card>

            {/* Description */}
            <div className="space-y-3">
              <h3 className="text-base font-extrabold text-secondary-900 dark:text-white">Listing Description</h3>
              <p className="text-xs text-secondary-650 dark:text-secondary-450 leading-relaxed whitespace-pre-wrap">
                {prop.description}
              </p>
            </div>

            {/* Amenities checklist */}
            <div id="amenities-section" className="space-y-4 pt-6 border-t scroll-mt-36">
              <h3 className="text-base font-extrabold text-secondary-900 dark:text-white">Amenities Offered</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {Object.entries(prop.amenities || {}).map(([key, val]) => {
                  if (!val) return null;
                  const IconComponent = AMENITY_ICONS[key] || CheckCircle;
                  return (
                    <div key={key} className="flex items-center space-x-3 p-3.5 border border-secondary-200/50 dark:border-secondary-800 rounded-2xl bg-secondary-50/20 text-xs font-bold text-secondary-800 dark:text-secondary-250 shadow-premium-sm">
                      <IconComponent className="h-5 w-5 text-primary-500 shrink-0" />
                      <span className="capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Nearby distances location guide */}
            <div className="space-y-4 pt-6 border-t font-semibold text-xs text-secondary-650 scroll-mt-36">
              <h3 className="text-base font-extrabold text-secondary-900 dark:text-white">Transit & Neighborhood Distance</h3>
              <NearbyPlacesCard 
                latitude={prop.location?.latitude || 28.6282} 
                longitude={prop.location?.longitude || 77.3789}
                onPlaceClick={(place) => {
                  setHighlightedPlace(place);
                  const mapEl = document.getElementById('location-section');
                  if (mapEl) mapEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }}
              />
            </div>

            {/* Location Map Block */}
            <div id="location-section" className="space-y-4 pt-6 border-t scroll-mt-36">
              <div className="flex justify-between items-start gap-3">
                <div>
                  <h3 className="text-xl font-bold text-secondary-900 dark:text-white">Where you'll be</h3>
                  <p className="text-sm font-semibold text-secondary-750 dark:text-secondary-300 mt-1">
                    {prop.location?.city || 'Noida'}, {prop.location?.state || 'Uttar Pradesh'}, India
                  </p>
                </div>
                <Button 
                  onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${prop.location?.latitude || 28.6282},${prop.location?.longitude || 77.3789}`, '_blank')}
                  variant="outline" 
                  size="sm" 
                  className="font-black text-xs py-2.5 px-4 border-secondary-200 dark:border-secondary-800 rounded-full hover:bg-secondary-50 dark:hover:bg-secondary-900 flex items-center space-x-1.5 whitespace-nowrap shadow-premium-sm"
                >
                  <Navigation className="h-3.5 w-3.5 text-primary-500 shrink-0" />
                  <span>Get Directions</span>
                </Button>
              </div>

              {highlightedPlace && (
                <div className="flex items-center justify-between bg-primary-50 dark:bg-primary-950/20 border border-primary-200 dark:border-primary-800 rounded-2xl px-4 py-3 animate-fade-in">
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4 text-primary-500 shrink-0" />
                    <span className="text-xs font-extrabold text-primary-700 dark:text-primary-300">{highlightedPlace.name}</span>
                    <span className="text-[10px] font-bold text-primary-500">{highlightedPlace.distance}</span>
                  </div>
                  <button 
                    onClick={() => setHighlightedPlace(null)} 
                    className="text-primary-400 hover:text-primary-600 text-xs font-bold"
                  >
                    Clear
                  </button>
                </div>
              )}

              <div className="p-1 bg-white dark:bg-secondary-900 border border-secondary-200/60 dark:border-secondary-800 rounded-[24px] shadow-premium-sm overflow-hidden w-full">
                <div className="h-[380px] rounded-[20px] overflow-hidden">
                  <GoogleMap 
                    center={highlightedPlace?.lat && highlightedPlace?.lng
                      ? { lat: highlightedPlace.lat, lng: highlightedPlace.lng }
                      : { lat: prop.location?.latitude || 28.6282, lng: prop.location?.longitude || 77.3789 }
                    }
                    zoom={highlightedPlace ? 16 : 14}
                    properties={[prop]}
                  />
                </div>
              </div>

              <span className="text-xs text-secondary-750 dark:text-secondary-300 font-bold block mt-2 select-none">
                Exact location will be provided after booking.
              </span>
            </div>

            {/* Reviews & Ratings Section */}
            <div id="reviews-section" className="space-y-8 pt-8 border-t border-secondary-100 dark:border-secondary-800 scroll-mt-36">
              {/* Section Header */}
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center space-x-2.5">
                    <h3 className="text-2xl font-bold text-secondary-900 dark:text-white tracking-tight">
                      Reviews & Ratings
                    </h3>
                  </div>
                  {stats && stats.totalReviews > 0 ? (
                    <div className="flex items-center space-x-2 mt-2">
                      <div className="flex items-center space-x-0.5">
                        {[1,2,3,4,5].map(s => (
                          <Star key={s} className={`h-3.5 w-3.5 ${s <= Math.round(stats.averageRating || 5) ? 'fill-amber-400 text-amber-400' : 'text-secondary-200'}`} />
                        ))}
                      </div>
                      <span className="text-sm font-semibold text-secondary-600 dark:text-secondary-400">
                        {stats.averageRating} · {stats.totalReviews} review{stats.totalReviews !== 1 ? 's' : ''}
                      </span>
                    </div>
                  ) : (
                    <p className="text-sm text-secondary-400 mt-1.5 font-medium">Real feedback from verified visitors.</p>
                  )}
                </div>
                {eligibleVisit && !hasReviewedEligibleVisit && !showReviewForm && (
                  <Button
                    size="sm"
                    variant="primary"
                    className="font-bold py-2.5 px-5 text-xs rounded-full"
                    onClick={() => setShowReviewForm(true)}
                  >
                    Write a Review
                  </Button>
                )}
              </div>

              {/* Review Form */}
              {showReviewForm && eligibleVisit && (
                <Card className="p-6 border border-primary-100 bg-primary-50/5 dark:bg-secondary-950/20 rounded-3xl">
                  <h4 className="font-bold text-base text-secondary-900 dark:text-white mb-5">Submit Verified Review</h4>
                  <ReviewForm
                    category="property"
                    targetId={id}
                    interactionId={eligibleVisit._id}
                    onSuccess={() => setShowReviewForm(false)}
                    onCancel={() => setShowReviewForm(false)}
                  />
                </Card>
              )}

              {/* Premium Guest Favourite Dashboard */}
              {stats && stats.totalReviews > 0 ? (
                <div className="space-y-8">
                  
                  {/* — Hero: Rating + Wreath + Stats — */}
                  <div className="text-center py-5">
                    <div className="w-[280px] h-[100px] mx-auto flex items-center justify-between select-none">
                      <LeafLeft />
                      <span className="flex items-center justify-center text-[64px] leading-none font-black text-secondary-900 dark:text-white tracking-tighter">
                        {(stats.averageRating || 5.0).toFixed(1)}
                      </span>
                      <LeafRight />
                    </div>
                    <h4 className="text-base font-bold text-secondary-900 dark:text-white mt-2">Guest favourite</h4>
                    <p className="text-sm text-secondary-500 max-w-md mx-auto mt-1 font-normal leading-relaxed">
                      {stats.totalReviews} verified review{stats.totalReviews !== 1 ? 's' : ''} · {Math.min(100, Math.round(((stats.distribution?.[4] || 0) + (stats.distribution?.[5] || 0)) / (stats.totalReviews || 1) * 100))}% guests recommend
                    </p>
                    <p className="text-xs text-secondary-400 max-w-sm mx-auto mt-1 font-normal">
                      One of the most loved homes on StayMate based on ratings, reviews and reliability
                    </p>
                  </div>

                  {/* — Rating Distribution + Category Metrics Grid — */}
                  <div className="grid grid-cols-1 md:grid-cols-7 gap-6 py-6 border-y border-secondary-100 dark:border-secondary-800 select-none">
                    
                    {/* Rating Distribution Column */}
                    <div className="md:col-span-2 space-y-3">
                      <span className="text-xs font-bold text-secondary-900 dark:text-white uppercase tracking-wider block">Overall rating</span>
                      <div className="space-y-2.5">
                        {[5, 4, 3, 2, 1].map(stars => {
                          const count = stats.distribution?.[stars] || 0;
                          const pct = Math.round((count / (stats.totalReviews || 1)) * 100);
                          return (
                            <div key={stars} className="flex items-center space-x-3 text-xs font-medium text-secondary-500">
                              <div className="flex items-center space-x-0.5 w-[68px] shrink-0">
                                {[1,2,3,4,5].map(s => (
                                  <Star key={s} className={`h-2.5 w-2.5 ${s <= stars ? 'fill-secondary-800 text-secondary-800 dark:fill-white dark:text-white' : 'text-secondary-200 dark:text-secondary-700'}`} />
                                ))}
                              </div>
                              <div className="flex-1 h-2 rounded-full bg-secondary-100 dark:bg-secondary-800 overflow-hidden">
                                <div 
                                  style={{ width: `${pct}%`, transition: 'width 0.8s cubic-bezier(0.4, 0, 0.2, 1)' }} 
                                  className="h-full rounded-full bg-secondary-900 dark:bg-white" 
                                />
                              </div>
                              <span className="w-9 text-right text-xs font-semibold text-secondary-400">{pct}%</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Category Metric Cards */}
                    <div className="md:col-span-5 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                      {[
                        { label: 'Cleanliness', icon: <SprayIcon />, rating: Math.min(5.0, Number(((stats.averageRating || 5.0) - 0.1).toFixed(1))) },
                        { label: 'Accuracy', icon: <AccuracyIcon />, rating: Math.min(5.0, Number(((stats.averageRating || 5.0) + 0.1).toFixed(1))) },
                        { label: 'Check-in', icon: <KeyIcon />, rating: Math.min(5.0, Number(((stats.averageRating || 5.0) - 0.2).toFixed(1))) },
                        { label: 'Communication', icon: <CommunicationIcon />, rating: Math.min(5.0, Number(((stats.averageRating || 5.0)).toFixed(1))) },
                        { label: 'Location', icon: <LocationIcon />, rating: Math.min(5.0, Number(((stats.averageRating || 5.0) + 0.2).toFixed(1))) },
                        { label: 'Value', icon: <ValueIcon />, rating: Math.min(5.0, Number(((stats.averageRating || 5.0) + 0.1).toFixed(1))) },
                      ].map(metric => {
                        const quality = metric.rating >= 4.8 ? 'Exceptional' : metric.rating >= 4.5 ? 'Excellent' : metric.rating >= 4.0 ? 'Great' : metric.rating >= 3.5 ? 'Very Good' : 'Good';
                        return (
                          <div 
                            key={metric.label}
                            className="flex flex-col items-center text-center p-4 rounded-2xl border border-secondary-100 dark:border-secondary-800 bg-white dark:bg-secondary-900/50 hover:-translate-y-0.5 hover:shadow-lg transition-all duration-200 cursor-default"
                          >
                            <span className="text-[10px] font-bold text-secondary-900 dark:text-white uppercase tracking-wider">{metric.label}</span>
                            <span className="text-xl font-black text-secondary-900 dark:text-white mt-2">{metric.rating}</span>
                            <span className="text-[10px] font-medium text-secondary-400 mt-0.5">{quality}</span>
                            <div className="mt-2">{metric.icon}</div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* — Category Filter Pills — */}
                  <div className="relative py-4 border-b border-secondary-100 dark:border-secondary-900">
                    <div className="flex items-center space-x-2 overflow-x-auto scrollbar-none py-1.5 px-0.5">
                      {FILTER_PILLS.map(pill => (
                        <button
                          key={pill.id}
                          type="button"
                          onClick={() => setSelectedPill(prev => prev === pill.id ? null : pill.id)}
                          className={`flex items-center space-x-2 px-4 py-2 border rounded-full text-xs font-black transition-all shrink-0 hover:bg-secondary-50 dark:hover:bg-secondary-900/50 shadow-premium-sm ${
                            selectedPill === pill.id
                              ? "border-secondary-950 bg-secondary-50 text-secondary-950 dark:border-white dark:bg-secondary-900 dark:text-white"
                              : "border-secondary-200 dark:border-secondary-800 text-secondary-650 dark:text-secondary-300 bg-transparent"
                          }`}
                        >
                          <span className="text-sm select-none">{pill.icon}</span>
                          <span>{pill.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 border border-dashed border-secondary-200 dark:border-secondary-800 rounded-3xl">
                  <div className="text-4xl mb-3">💬</div>
                  <p className="text-sm text-secondary-500 font-medium">No reviews yet for this listing.</p>
                  <p className="text-xs text-secondary-400 mt-1">Be the first to leave a review after your visit tour!</p>
                </div>
              )}

              {stats && stats.totalReviews > 0 && (
                <>
                  {/* Filters */}
                  <ReviewFilters filters={filters} onChange={changeFilters} />

                  {/* List of Reviews */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-0">
                    {reviewsLoading ? (
                      [1, 2, 3, 4].map(i => (
                        <div key={i} className="py-6 space-y-4 animate-pulse border-b border-secondary-100 dark:border-secondary-800/60">
                          <div className="flex items-center space-x-3.5">
                            <div className="h-12 w-12 bg-secondary-200 dark:bg-secondary-800 rounded-full" />
                            <div className="space-y-2">
                              <div className="h-3.5 w-32 bg-secondary-200 dark:bg-secondary-800 rounded-md" />
                              <div className="h-2.5 w-20 bg-secondary-150 dark:bg-secondary-800/70 rounded-md" />
                            </div>
                          </div>
                          <div className="flex space-x-1">
                            {[1,2,3,4,5].map(s => (
                              <div key={s} className="h-3.5 w-3.5 bg-secondary-200 dark:bg-secondary-800 rounded-sm" />
                            ))}
                          </div>
                          <div className="space-y-2.5">
                            <div className="h-3.5 w-full bg-secondary-200 dark:bg-secondary-800 rounded-md" />
                            <div className="h-3.5 w-5/6 bg-secondary-150 dark:bg-secondary-800/70 rounded-md" />
                            <div className="h-3.5 w-3/4 bg-secondary-100 dark:bg-secondary-800/50 rounded-md" />
                          </div>
                        </div>
                      ))
                    ) : filteredReviews.length > 0 ? (
                      filteredReviews.map(review => (
                        <PremiumReviewCard
                          key={review._id}
                          review={review}
                        />
                      ))
                    ) : (
                      <div className="col-span-2 text-center py-16 border border-dashed border-secondary-200 dark:border-secondary-800 rounded-3xl">
                        <div className="text-3xl mb-3">🔍</div>
                        <p className="text-sm text-secondary-500 font-medium">
                          No reviews found matching "{FILTER_PILLS.find(p => p.id === selectedPill)?.label}".
                        </p>
                        <button 
                          onClick={() => setSelectedPill(null)}
                          className="mt-3 text-sm text-primary-500 font-bold underline hover:text-primary-600 transition-colors"
                        >
                          Clear Filter
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Pagination */}
                  {total > limit && (
                    <div className="flex justify-center items-center space-x-3 pt-4">
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={page === 1}
                        onClick={() => setPage(page - 1)}
                        className="rounded-full px-5 font-bold text-xs"
                      >
                        Previous
                      </Button>
                      <span className="text-xs font-semibold text-secondary-400">
                        Page {page} of {Math.ceil(total / limit)}
                      </span>
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={page >= Math.ceil(total / limit)}
                        onClick={() => setPage(page + 1)}
                        className="rounded-full px-5 font-bold text-xs"
                      >
                        Next
                      </Button>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Things To Know Section */}
            <div id="things-to-know-section" className="space-y-5 pt-8 border-t border-secondary-100 dark:border-secondary-900 scroll-mt-36 select-none">
              <h3 className="text-xl font-bold text-secondary-900 dark:text-white">Things to know</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
                
                {/* House Rules */}
                <div className="space-y-3 bg-transparent">
                  <h4 className="font-black text-xs text-secondary-900 dark:text-white uppercase tracking-wider">House rules</h4>
                  <ul className="space-y-2.5 text-xs text-secondary-650 dark:text-secondary-300 font-bold">
                    <li className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-secondary-400 shrink-0" />
                      <span>Check-in: After 12:00 PM</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-secondary-400 shrink-0" />
                      <span>Check-out: Before 11:00 AM</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <User className="h-4 w-4 text-secondary-400 shrink-0" />
                      <span>Max 2 visitors allowed</span>
                    </li>
                  </ul>
                  <button 
                    onClick={() => toast.success('Full House Rules: No pets, no smoking, quiet hours after 10 PM.')}
                    className="text-xs font-black text-secondary-900 dark:text-white underline hover:text-secondary-600 block pt-1.5 focus:outline-none"
                  >
                    Show more &gt;
                  </button>
                </div>

                {/* Safety & Property */}
                <div className="space-y-3 bg-transparent">
                  <h4 className="font-black text-xs text-secondary-900 dark:text-white uppercase tracking-wider">Safety &amp; property</h4>
                  <ul className="space-y-2.5 text-xs text-secondary-650 dark:text-secondary-300 font-bold">
                    <li className="flex items-center gap-2">
                      <ShieldCheck className="h-4 w-4 text-secondary-400 shrink-0" />
                      <span>CCTV / Security cameras active</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-secondary-400 shrink-0" />
                      <span>Smoke alarm installed</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-secondary-400 shrink-0" />
                      <span>First aid kit on premise</span>
                    </li>
                  </ul>
                  <button 
                    onClick={() => toast.success('Full Safety Info: Carbon monoxide alarm, emergency exit map available in the lobby.')}
                    className="text-xs font-black text-secondary-900 dark:text-white underline hover:text-secondary-600 block pt-1.5 focus:outline-none"
                  >
                    Show more &gt;
                  </button>
                </div>

                {/* Cancellation Policy */}
                <div className="space-y-3 bg-transparent">
                  <h4 className="font-black text-xs text-secondary-900 dark:text-white uppercase tracking-wider">Cancellation policy</h4>
                  <div className="space-y-2 text-xs text-secondary-650 dark:text-secondary-300 font-bold leading-relaxed">
                    <p>Free cancellation for 48 hours after booking approval.</p>
                    <p className="text-secondary-400 font-medium">Review the Host's full cancellation policy for details.</p>
                  </div>
                  <button 
                    onClick={() => toast.success('Full Cancellation Policy: 100% refund up to 14 days before check-in. 50% refund after.')}
                    className="text-xs font-black text-secondary-900 dark:text-white underline hover:text-secondary-600 block pt-1.5 focus:outline-none"
                  >
                    Show more &gt;
                  </button>
                </div>

              </div>
            </div>
          </div>

          {/* Sticky Pricing / Actions Sidebar */}
          <div className="lg:col-span-1 space-y-6 lg:sticky lg:top-[84px] z-10 transition-all duration-300">
            <Card className="p-6 border-secondary-200/50 space-y-6 rounded-[24px] shadow-premium-md bg-white dark:bg-secondary-950">
              <div>
                <span className="text-3xl font-black text-secondary-900 dark:text-white">{"\u20B9"}{prop.pricing?.monthlyRent?.toLocaleString()}</span>
                <span className="text-xs text-secondary-450 ml-1">/ month</span>
              </div>

              <div className="space-y-3.5 text-xs border-t border-b border-secondary-100 dark:border-secondary-900 py-4 font-bold text-secondary-500">
                <div className="flex justify-between">
                  <span>Security Deposit</span>
                  <span className="text-secondary-850 dark:text-secondary-200">{"\u20B9"}{prop.pricing?.securityDeposit?.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Maintenance Charges</span>
                  <span className="text-secondary-850 dark:text-secondary-200">{"\u20B9"}{prop.pricing?.maintenanceCharges?.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Brokerage Charges</span>
                  <span className="text-secondary-850 dark:text-secondary-200">{"\u20B9"}{prop.pricing?.brokerage?.toLocaleString()}</span>
                </div>
              </div>

              {/* Trust Indicators */}
              <div className="bg-secondary-50/50 dark:bg-secondary-900/30 rounded-2xl p-3.5 border border-secondary-100 dark:border-secondary-900/80 space-y-2.5">
                <div className="flex items-center text-[10px] font-bold text-secondary-500">
                  <ShieldCheck className="h-4.5 w-4.5 text-success-600 dark:text-success-500 mr-2.5 shrink-0" />
                  <span>Verified Listing Guarantee</span>
                </div>
                <div className="flex items-center text-[10px] font-bold text-secondary-500">
                  <CreditCard className="h-4.5 w-4.5 text-primary-500 mr-2.5 shrink-0" />
                  <span>Secure Escrow Protection</span>
                </div>
              </div>

              <div className="space-y-2.5">
                <Button onClick={handleScheduleVisitClick} variant="primary" className="w-full py-3 font-bold text-xs rounded-xl shadow-premium-sm transition-all active:scale-98">
                  <Calendar className="h-4.5 w-4.5 mr-2" /> Schedule Site Visit Tour
                </Button>
                <Button 
                  onClick={handlePayDepositClick} 
                  className="w-full py-3 font-bold text-xs rounded-xl bg-success-600 hover:bg-success-700 text-white shadow-premium-sm transition-all active:scale-98"
                >
                  <CreditCard className="h-4.5 w-4.5 mr-2" /> Pay Deposit
                </Button>
              </div>
            </Card>

            {/* Owner Details Card Upgrade (Airbnb style stats) */}
            {prop.ownerId && (
              <div id="host-section" className="scroll-mt-36">
                <Card className="p-5 border-secondary-200/50 space-y-4 rounded-[24px] shadow-premium-md bg-white dark:bg-secondary-950">
                  <div className="flex items-center space-x-3.5">
                    <Avatar src={prop.ownerId.avatar} name={prop.ownerId.name} size="sm" className="rounded-xl" />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h4 className="text-xs font-extrabold text-secondary-900 dark:text-white leading-tight">{prop.ownerId.name}</h4>
                        <ShieldCheck className="h-4 w-4 text-success-500 shrink-0" title="Verified Owner" />
                      </div>
                      <span className="text-[9px] font-black text-primary-650 tracking-wider block mt-0.5 uppercase">Verified Host</span>
                    </div>
                  </div>

                  {/* Host stats */}
                  <div className="grid grid-cols-3 gap-2 py-3 border-t border-b border-secondary-100 dark:border-secondary-900 text-center">
                    <div>
                      <p className="text-[9px] font-bold text-secondary-400 uppercase tracking-wider">Reviews</p>
                      <p className="text-sm font-black text-secondary-800 dark:text-white mt-1">12</p>
                    </div>
                    <div>
                      <p className="text-[9px] font-bold text-secondary-400 uppercase tracking-wider">Rating</p>
                      <p className="text-sm font-black text-secondary-800 dark:text-white mt-1">{"\u2605"} 4.9</p>
                    </div>
                    <div>
                      <p className="text-[9px] font-bold text-secondary-400 uppercase tracking-wider">Years</p>
                      <p className="text-sm font-black text-secondary-800 dark:text-white mt-1">2+</p>
                    </div>
                  </div>

                  <div className="space-y-2.5 text-xs font-bold text-secondary-500 pt-1">
                    <div className="flex items-center">
                      <Phone className="h-4.5 w-4.5 text-secondary-400 mr-2.5 shrink-0" />
                      <span className="text-secondary-700 dark:text-secondary-300 font-semibold">{prop.ownerId.phone || 'Contact number locked'}</span>
                    </div>
                    <div className="flex items-center">
                      <Clock className="h-4.5 w-4.5 text-secondary-400 mr-2.5 shrink-0" />
                      <span className="font-semibold text-secondary-700 dark:text-secondary-300">Joined StayMate: {new Date(prop.ownerId.createdAt || prop.createdAt || Date.now()).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}</span>
                    </div>
                    <div className="flex items-center text-primary-600 mb-2">
                      <MessageCircle className="h-4.5 w-4.5 text-primary-500 mr-2.5 shrink-0" />
                      <span>Avg Response: 2 hours</span>
                    </div>
                    {(!user || String(prop.ownerId._id || prop.ownerId) !== String(user.id || user._id)) && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full py-2.5 font-extrabold text-xs border-primary-500 text-primary-650 hover:bg-primary-50 rounded-xl"
                        onClick={handleContactOwner}
                      >
                        <MessageCircle className="h-4 w-4 mr-2" /> Contact Landlord
                      </Button>
                    )}
                  </div>
                </Card>
              </div>
            )}

            {/* Social share panel */}
            <Card className="p-4 border-secondary-200/50 space-y-3 rounded-[20px] shadow-premium-sm">
              <span className="text-[10px] font-bold text-secondary-400 uppercase tracking-widest block">Share listing</span>
              <div className="grid grid-cols-3 gap-1.5">
                <Button variant="outline" size="sm" className="font-bold text-[10px] py-2 px-1 border-secondary-200 hover:bg-secondary-50 dark:hover:bg-secondary-900 flex items-center justify-center space-x-1.5 shrink-0" onClick={handleWhatsAppShare}>
                  <WhatsAppIcon />
                  <span>WhatsApp</span>
                </Button>
                <Button variant="outline" size="sm" className="font-bold text-[10px] py-2 px-1 border-secondary-200 hover:bg-secondary-50 dark:hover:bg-secondary-900 flex items-center justify-center space-x-1.5 shrink-0" onClick={handleTelegramShare}>
                  <TelegramIcon />
                  <span>Telegram</span>
                </Button>
                <Button variant="outline" size="sm" className="font-bold text-[10px] py-2 px-1 border-secondary-200 hover:bg-secondary-50 dark:hover:bg-secondary-900 flex items-center justify-center space-x-1.5 shrink-0" onClick={handleCopyLink}>
                  <Link2 className="h-3.5 w-3.5 text-primary-500 shrink-0" />
                  <span>Copy Link</span>
                </Button>
              </div>
              <Button variant="ghost" size="sm" className="w-full text-[9px] text-error-550 hover:bg-error-50/10 font-bold mt-1" onClick={() => toast.success('Report logged. StayMate team will audit listing.')}>
                <AlertTriangle className="h-3.5 w-3.5 mr-1" /> Report listing inaccuracies
              </Button>
            </Card>
          </div>
        </div>

        {/* Similar properties catalog row */}
        {similarProps.length > 0 && (
          <div className="space-y-4 pt-8 border-t border-secondary-100">
            <div>
              <h3 className="text-base font-extrabold text-secondary-855 dark:text-secondary-100 flex items-center">
                <Navigation className="h-4.5 w-4.5 text-primary-500 mr-2 animate-bounce" /> Similar properties in {prop.location?.city}
              </h3>
              <p className="text-xs text-secondary-400 mt-1">Explore matching stays in this location.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {similarProps.map(p => <PropertyCard key={p._id || p.id} property={p} />)}
            </div>
          </div>
        )}

        {/* Schedule Tour Modal */}
        {showVisitModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="fixed inset-0 bg-black/45 backdrop-blur-xs" onClick={() => setShowVisitModal(false)} />
            <Card className="relative z-10 w-full max-w-md p-6 m-4 space-y-5 animate-fade-in bg-white dark:bg-secondary-950 rounded-[24px] shadow-2xl">
              <div className="flex justify-between items-center border-b border-secondary-100 dark:border-secondary-900 pb-3">
                <h3 className="font-extrabold text-sm text-secondary-900 dark:text-white flex items-center">
                  <Calendar className="h-4.5 w-4.5 text-primary-500 mr-2" /> Schedule Property Tour
                </h3>
                <button onClick={() => setShowVisitModal(false)} className="text-secondary-450 hover:text-secondary-650">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleScheduleVisit} className="space-y-4">
                <Input
                  type="date"
                  label="Choose Tour Date"
                  required
                  value={visitDate}
                  onChange={(e) => setVisitDate(e.target.value)}
                />

                <Input
                  type="time"
                  label="Choose Tour Time"
                  required
                  value={visitTime}
                  onChange={(e) => setVisitTime(e.target.value)}
                />

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-secondary-400 uppercase tracking-wider">Note to Owner (optional)</label>
                  <textarea
                    placeholder="Introduce yourself or write specific requests..."
                    className="w-full text-xs p-3 rounded-lg border border-secondary-200 focus:outline-none focus:ring-1 focus:ring-primary-500 w-full"
                    rows={3}
                    value={visitNote}
                    onChange={(e) => setVisitNote(e.target.value)}
                  />
                </div>

                <div className="pt-2 flex justify-end gap-3">
                  <Button type="button" variant="ghost" className="font-bold text-xs" onClick={() => setShowVisitModal(false)}>Cancel</Button>
                  <Button type="submit" variant="primary" className="font-bold text-xs px-4" isLoading={schedulingLoading}>Send Tour Request</Button>
                </div>
              </form>
            </Card>
          </div>
        )}

        {/* Fullscreen Airbnb-Style Photo Tour Overlay */}
        {showFullscreen && createPortal(
          <div className="fixed inset-0 z-[100] bg-white dark:bg-secondary-950 flex flex-col h-screen overflow-hidden select-none animate-fade-in text-secondary-900 dark:text-white">
            
            {/* Photo Tour Header */}
            <div className="flex justify-between items-center border-b border-secondary-150 dark:border-secondary-900 px-6 py-4 shrink-0 bg-white dark:bg-secondary-950">
              <button 
                onClick={() => setShowFullscreen(false)} 
                className="p-2 hover:bg-secondary-100 dark:hover:bg-secondary-900 rounded-full text-secondary-500 hover:text-secondary-800 dark:hover:text-white transition-colors"
                title="Close photo tour"
              >
                <ArrowLeft className="h-6 w-6" />
              </button>
              
              <span className="font-extrabold text-sm text-secondary-900 dark:text-white">Photo tour</span>
              
              <div className="flex items-center space-x-2">
                <button onClick={handleCopyLink} className="p-2 hover:bg-secondary-100 dark:hover:bg-secondary-900 rounded-full text-secondary-500 hover:text-secondary-800 dark:hover:text-white transition-colors" title="Share">
                  <Share className="h-5 w-5" />
                </button>
                <button onClick={handleToggleWishlist} className="p-2 hover:bg-secondary-100 dark:hover:bg-secondary-900 rounded-full text-secondary-500 hover:text-secondary-800 dark:hover:text-white transition-colors" title="Save">
                  <Heart className={`h-5 w-5 ${isSaved ? 'fill-error-500 text-error-500' : ''}`} />
                </button>
              </div>
            </div>

            {/* Category Navigation Pills */}
            <div className="border-b border-secondary-150 dark:border-secondary-900 bg-white dark:bg-secondary-950 shrink-0 px-6 py-4 flex items-center space-x-6 overflow-x-auto scrollbar-none shadow-sm">
              {Object.entries(categorizedImages).map(([catName, list]) => (
                <button
                  key={catName}
                  onClick={() => {
                    const el = document.getElementById(`tour-cat-${catName}`);
                    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }}
                  className="flex flex-col items-center shrink-0 group focus:outline-none"
                >
                  <div className="w-[50px] h-[50px] rounded-full overflow-hidden border-2 border-secondary-200 dark:border-secondary-800 group-hover:border-primary-500 transition-all">
                    <img src={list[0]?.url} alt={catName} className="w-full h-full object-cover" />
                  </div>
                  <span className="text-[9px] font-bold text-secondary-500 dark:text-secondary-400 mt-1.5 uppercase group-hover:text-primary-500 tracking-wider">{catName}</span>
                </button>
              ))}
            </div>

            {/* Scrollable Gallery Content */}
            <div className="flex-1 overflow-y-auto px-6 py-8 space-y-8 scroll-smooth scrollbar-none select-text">
              {Object.entries(categorizedImages).map(([catName, list]) => (
                <div key={catName} id={`tour-cat-${catName}`} className="space-y-4 py-6 border-b border-secondary-100 dark:border-secondary-900 last:border-0 scroll-mt-24">
                  <div>
                    <h3 className="text-sm font-black text-secondary-900 dark:text-white uppercase tracking-wider">{catName}</h3>
                    <p className="text-[10px] text-secondary-450 mt-0.5 font-bold capitalize">
                      {catName.includes('Bedroom') ? 'Double bed' : catName.includes('bathroom') ? 'Full bath' : 'Premium space'}
                    </p>
                  </div>
                  
                  {list.length === 1 ? (
                    <div className="overflow-hidden rounded-[20px] bg-secondary-100 dark:bg-secondary-900 shadow-premium-sm aspect-[4/3] max-w-2xl">
                      <img src={list[0].url} alt={catName} className="w-full h-full object-cover" loading="lazy" />
                    </div>
                  ) : list.length === 2 ? (
                    <div className="grid grid-cols-2 gap-4">
                      {list.map((p, i) => (
                        <div key={i} className="overflow-hidden rounded-[20px] bg-secondary-100 dark:bg-secondary-900 shadow-premium-sm aspect-[4/3]">
                          <img src={p.url} alt={`${catName}-${i}`} className="w-full h-full object-cover" loading="lazy" />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="overflow-hidden rounded-[20px] bg-secondary-100 dark:bg-secondary-900 shadow-premium-sm aspect-[16/10] w-full">
                        <img src={list[0].url} alt={`${catName}-featured`} className="w-full h-full object-cover" loading="lazy" />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        {list.slice(1).map((p, i) => (
                          <div key={i} className="overflow-hidden rounded-[20px] bg-secondary-100 dark:bg-secondary-900 shadow-premium-sm aspect-[4/3]">
                            <img src={p.url} alt={`${catName}-extra-${i}`} className="w-full h-full object-cover" loading="lazy" />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>,
          document.body
        )}

        {showBookModal && (
          <BookPropertyModal 
            property={prop} 
            onClose={() => setShowBookModal(false)} 
            onSuccess={() => {
              toast.success('Stay deposit paid! Your receipt is generated.');
              setTimeout(() => window.location.reload(), 1000);
            }} 
          />
        )}

        {/* Mobile Sticky Booking Bar */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-white/95 dark:bg-secondary-900/95 backdrop-blur-sm border-t border-secondary-200/60 dark:border-secondary-800/60 px-6 py-4 flex items-center justify-between shadow-premium-lg">
          <div>
            <div className="flex items-baseline">
              <span className="text-lg font-black text-secondary-900 dark:text-white">₹{prop.pricing?.monthlyRent?.toLocaleString()}</span>
              <span className="text-[10px] text-secondary-450 dark:text-secondary-400 ml-1">/ month</span>
            </div>
            <p className="text-[9px] text-primary-650 dark:text-primary-400 font-extrabold uppercase mt-0.5 tracking-wider">
              {prop.verificationStatus === 'verified' ? '✓ Verified Listing' : 'Pending Verification'}
            </p>
          </div>
          <div className="flex gap-2 shrink-0">
            <Button 
              onClick={handleScheduleVisitClick} 
              variant="outline" 
              size="sm" 
              className="font-extrabold text-[10px] py-2 px-3 rounded-xl transition-all"
            >
              Schedule Visit
            </Button>
            <Button 
              onClick={handlePayDepositClick} 
              variant="primary" 
              size="sm" 
              className="font-extrabold text-[10px] py-2 px-3 rounded-xl bg-success-600 hover:bg-success-700 text-white transition-all shadow-premium-sm"
            >
              Pay Deposit
            </Button>
          </div>
        </div>

      </div>
    </div>
  );
};

const PropertyDetailsWithReviews = () => (
  <ReviewProvider>
    <PropertyDetails />
  </ReviewProvider>
);

export default PropertyDetailsWithReviews;
