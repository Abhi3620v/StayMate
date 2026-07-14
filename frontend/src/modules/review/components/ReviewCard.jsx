import React, { useState } from 'react';
import RatingStars from './RatingStars';
import Avatar from '@/components/ui/Avatar';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { useReview } from '../context/ReviewContext';
import { useAuth } from '@/context/AuthContext';
import { ThumbsUp, Flag, CornerDownRight, Edit3, Trash2, ShieldCheck, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';

export const ReviewCard = ({ review, category, targetId }) => {
  const { user } = useAuth();
  const { deleteReview, submitReply, submitVote, submitReport, editReview } = useReview();
  
  const currentUserId = user?.id || user?._id;
  const isAuthor = currentUserId && String(review.authorId?._id || review.authorId) === String(currentUserId);
  const isAdmin = user && ['admin', 'moderator'].includes(user.role);

  // Editing state
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(review.content);
  const [editRating, setEditRating] = useState(review.rating);
  const [updating, setUpdating] = useState(false);

  // Reply state
  const [showReplyInput, setShowReplyInput] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [replying, setReplying] = useState(false);

  // Resolve author display
  const authorName = review.isAnonymous ? 'Anonymous Member' : (review.authorId?.name || 'StayMate Member');
  const authorAvatar = review.isAnonymous ? '' : (review.authorId?.avatar || '');

  // Format date
  const reviewDate = new Date(review.createdAt).toLocaleDateString('en-IN', {
    year: 'numeric', month: 'short', day: 'numeric'
  });

  // Check 48h editing eligibility
  const hoursElapsed = (new Date() - new Date(review.createdAt)) / (1000 * 60 * 60);
  const isEditable = isAuthor && hoursElapsed <= 48;

  // Check reply eligibility
  const canReply = !review.reply?.content && user && (
    (review.category === 'property' && String(review.ownerId?._id || review.ownerId) === String(currentUserId)) ||
    (review.category === 'roommate' && String(review.roommateId?._id || review.roommateId) === String(currentUserId))
  );

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (editContent.trim().length < 5) {
      toast.error('Review must be at least 5 characters.');
      return;
    }
    setUpdating(true);
    try {
      await editReview(review._id, { content: editContent, rating: editRating }, category, targetId);
      setIsEditing(false);
    } catch (err) {
      // handled in context
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this review?')) {
      await deleteReview(review._id, category, targetId);
    }
  };

  const handleReplySubmit = async (e) => {
    e.preventDefault();
    if (replyText.trim().length === 0) return;
    setReplying(true);
    try {
      await submitReply(review._id, replyText, category, targetId);
      setReplyText('');
      setShowReplyInput(false);
    } catch (err) {
      // handled
    } finally {
      setReplying(false);
    }
  };

  const handleVote = () => {
    if (!currentUserId) {
      toast.error('Please log in to vote on reviews.');
      return;
    }
    submitVote(review._id, 'helpful', category, targetId);
  };

  const handleReport = async () => {
    if (!currentUserId) {
      toast.error('Please log in to report reviews.');
      return;
    }
    const reason = window.prompt('Report review reason (spam, fake_review, abusive_language, harassment, irrelevant_content, other):');
    if (!reason) return;
    const explanation = window.prompt('Describe detailed explanation (minimum 5 characters):');
    if (!explanation) return;

    try {
      const allowedReasons = ['spam', 'fake_review', 'abusive_language', 'harassment', 'irrelevant_content', 'other'];
      let parsedReason = reason.toLowerCase().trim().replace(/\s+/g, '_');
      let finalExplanation = explanation;

      if (!allowedReasons.includes(parsedReason)) {
        finalExplanation = `[Reason: ${reason}] ${explanation}`;
        parsedReason = 'other';
      }

      await submitReport(review._id, { reason: parsedReason, explanation: finalExplanation });
    } catch (err) {
      // Error is toasted inside the Context handler
    }
  };

  return (
    <Card className="p-5 md:p-6 bg-white dark:bg-secondary-900 border border-secondary-200/60 dark:border-secondary-800 rounded-3xl shadow-premium-sm space-y-4">
      {/* Header Info */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center space-x-3">
          <Avatar src={authorAvatar} name={authorName} size="sm" className="rounded-xl shrink-0" />
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="font-extrabold text-[13px] text-secondary-900 dark:text-white leading-tight">
                {authorName}
              </span>
              {/* Verified interaction badge */}
              <Badge variant="success" className="text-[8.5px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-lg flex items-center select-none shrink-0 border border-success-200/10">
                <ShieldCheck className="h-3 w-3 mr-0.5" /> Verified
              </Badge>
            </div>
            <span className="text-[10px] text-secondary-400 block font-bold uppercase tracking-widest mt-0.5">
              Reviewed {reviewDate}
            </span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-2 shrink-0">
          {isEditable && (
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="p-1.5 rounded-lg text-secondary-550 hover:text-primary-600 hover:bg-secondary-50 dark:hover:bg-secondary-800 transition-colors border border-secondary-200/40 dark:border-secondary-800"
              title="Edit review"
            >
              <Edit3 className="h-4.5 w-4.5" />
            </button>
          )}
          {(isAuthor || isAdmin) && (
            <button
              onClick={handleDelete}
              className="p-1.5 rounded-lg text-secondary-550 hover:text-error-600 hover:bg-secondary-50 dark:hover:bg-secondary-800 transition-colors border border-secondary-200/40 dark:border-secondary-800"
              title="Delete review"
            >
              <Trash2 className="h-4.5 w-4.5" />
            </button>
          )}
        </div>
      </div>

      {/* Inline Editing Form */}
      {isEditing ? (
        <form onSubmit={handleEditSubmit} className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <span className="text-[10px] font-black text-secondary-400 uppercase tracking-wider block">Change Rating</span>
            <RatingStars rating={editRating} interactive={true} onChange={setEditRating} size="md" />
          </div>
          <div className="space-y-1.5">
            <span className="text-[10px] font-black text-secondary-400 uppercase tracking-wider block">Edit Feedback</span>
            <textarea
              rows={4}
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="w-full text-xs p-3 border border-secondary-200 dark:border-secondary-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-primary-500 font-medium"
            />
          </div>
          <div className="flex justify-end space-x-2">
            <Button size="xs" variant="outline" onClick={() => setIsEditing(false)} disabled={updating}>
              Cancel
            </Button>
            <Button size="xs" variant="primary" type="submit" isLoading={updating}>
              Save changes
            </Button>
          </div>
        </form>
      ) : (
        /* Review content */
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <RatingStars rating={review.rating} size="sm" />
            {review.title && (
              <span className="font-extrabold text-[13px] text-secondary-900 dark:text-white leading-tight">
                "{review.title}"
              </span>
            )}
          </div>
          <p className="text-xs text-secondary-650 dark:text-secondary-400 leading-relaxed font-medium whitespace-pre-line">
            {review.content}
          </p>

          {/* Attached image gallery previews */}
          {review.images && review.images.length > 0 && (
            <div className="flex flex-wrap gap-2.5 pt-1.5 select-none">
              {review.images.map((img, idx) => (
                <div key={idx} className="relative group rounded-xl overflow-hidden border border-secondary-200/40">
                  <img
                    src={img.url}
                    alt={img.caption || 'Review photo'}
                    className="h-16 w-16 object-cover cursor-pointer hover:opacity-85 transition-opacity"
                    onClick={() => window.open(img.url, '_blank')}
                  />
                  {img.caption && (
                    <div className="absolute bottom-0 left-0 right-0 bg-black/55 text-[8.5px] text-white py-0.5 px-1 truncate font-bold text-center">
                      {img.caption}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Helpful recommendation tag */}
          {review.category === 'property' && review.recommend !== undefined && (
            <div className="text-[10px] font-bold text-secondary-400 dark:text-secondary-500">
              Recommend: <span className={review.recommend ? 'text-success-650 font-black' : 'text-error-550 font-black'}>
                {review.recommend ? 'Yes' : 'No'}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Action Footer Toggles */}
      {!isEditing && (
        <div className="flex items-center justify-between pt-3.5 border-t border-secondary-100 dark:border-secondary-800/80 text-[10px] text-secondary-400 font-bold select-none">
          <div className="flex items-center space-x-4">
            <button
              onClick={handleVote}
              className={`flex items-center space-x-1.5 hover:text-primary-650 transition-colors ${
                user && review.votes?.some(v => String(v.userId) === String(currentUserId) && v.voteType === 'helpful')
                  ? 'text-primary-600'
                  : ''
              }`}
            >
              <ThumbsUp className="h-4 w-4 stroke-[1.8]" />
              <span>Helpful ({review.helpfulCount || 0})</span>
            </button>

            {canReply && (
              <button
                onClick={() => setShowReplyInput(!showReplyInput)}
                className="flex items-center space-x-1.5 hover:text-primary-650 transition-colors"
              >
                <span>Reply to review</span>
              </button>
            )}
          </div>

          {!isAuthor && (
            <button
              onClick={handleReport}
              className={`flex items-center space-x-1 hover:text-error-600 transition-colors ${
                review.status === 'flagged' ? 'text-warning-600' : ''
              }`}
            >
              <Flag className="h-3.5 w-3.5" />
              <span>{review.status === 'flagged' ? 'Reported' : 'Report'}</span>
            </button>
          )}
        </div>
      )}

      {/* Reply input field drawer */}
      {showReplyInput && (
        <form onSubmit={handleReplySubmit} className="flex space-x-3.5 items-end bg-secondary-50/50 dark:bg-secondary-950/20 p-3 rounded-2xl border border-secondary-200/40">
          <textarea
            required
            rows={2}
            placeholder="Write your polite reply..."
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            className="flex-1 text-xs p-2.5 rounded-xl border border-secondary-200 dark:border-secondary-800 bg-white dark:bg-secondary-950 focus:outline-none focus:ring-1 focus:ring-primary-500 font-medium"
          />
          <div className="flex flex-col space-y-1.5">
            <Button size="xs" variant="ghost" onClick={() => setShowReplyInput(false)} disabled={replying}>
              Cancel
            </Button>
            <Button size="xs" variant="primary" type="submit" isLoading={replying}>
              Reply
            </Button>
          </div>
        </form>
      )}

      {/* Threaded Reply bubble (1-level deep) */}
      {review.reply && review.reply.content && (
        <div className="flex items-start space-x-3.5 pl-6 pt-3.5 border-l-2 border-secondary-200 dark:border-secondary-800 bg-secondary-50/30 dark:bg-secondary-950/10 p-3 rounded-2xl">
          <CornerDownRight className="h-4.5 w-4.5 text-secondary-400 shrink-0 mt-1" />
          <Avatar
            src={review.reply.authorId?.avatar}
            name={review.reply.authorId?.name || 'Host'}
            size="xs"
            className="rounded-lg shrink-0"
          />
          <div className="flex-1 space-y-1">
            <div className="flex items-center space-x-1.5">
              <span className="font-extrabold text-[11px] text-secondary-800 dark:text-white leading-tight">
                {review.reply.authorId?.name || 'Host Response'}
              </span>
              <span className="text-[8.5px] font-black text-secondary-400 uppercase tracking-widest">
                {review.category === 'property' ? 'Property Landlord' : 'Matched Roommate'}
              </span>
            </div>
            <p className="text-xs text-secondary-600 dark:text-secondary-450 leading-relaxed font-semibold italic">
              "{review.reply.content}"
            </p>
          </div>
        </div>
      )}
    </Card>
  );
};

export default ReviewCard;
