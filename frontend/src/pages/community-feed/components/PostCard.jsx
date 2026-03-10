import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';
import Button from '../../../components/ui/Button';

const PostCard = ({ post, onLike, onComment, onFollow, onShare, onAuthorClick }) => {
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);

  // Get current user profile from localStorage
  const getUserProfile = () => {
    try {
      const stored = localStorage.getItem('userProfile');
      return stored ? JSON.parse(stored) : null;
    } catch { return null; }
  };

  const userProfile = getUserProfile();
  const currentUserAvatar = userProfile?.avatarUrl || null;

  const handleAddComment = async () => {
    if (!newComment?.trim() || submittingComment) return;
    setSubmittingComment(true);
    try {
      await onComment(post?.id, newComment.trim());
      setNewComment('');
    } catch (err) {
      console.error('Comment error:', err);
    } finally {
      setSubmittingComment(false);
    }
  };

  const formatTimeAgo = (timestamp) => {
    if (!timestamp) return '';
    const now = new Date();
    let date;
    // Handle Firestore Timestamp objects
    if (timestamp?._seconds) {
      date = new Date(timestamp._seconds * 1000);
    } else {
      date = new Date(timestamp);
    }
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  };

  const comments = post?.comments || [];

  return (
    <div className="bg-card border border-border rounded-lg shadow-warm p-6 mb-6">
      {/* Post Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <button onClick={() => onAuthorClick && onAuthorClick(post?.author?.id)} className="flex-shrink-0">
            <Image
              src={post?.author?.avatar}
              alt={post?.author?.name}
              className="w-12 h-12 rounded-full object-cover hover:ring-2 hover:ring-primary transition-all cursor-pointer"
            />
          </button>
          <div>
            <button 
              onClick={() => onAuthorClick && onAuthorClick(post?.author?.id)}
              className="font-semibold text-foreground hover:text-primary transition-colors cursor-pointer text-left"
            >
              {post?.author?.name}
            </button>
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <span>{post?.author?.craftType}</span>
              <span>•</span>
              <span>{formatTimeAgo(post?.timestamp)}</span>
              {post?.location && (
                <>
                  <span>•</span>
                  <div className="flex items-center space-x-1">
                    <Icon name="MapPin" size={12} />
                    <span>{post?.location}</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {post?.type === 'success_story' && (
            <div className="bg-success text-success-foreground px-2 py-1 rounded-full text-xs font-medium">
              <Icon name="Trophy" size={12} className="inline mr-1" />
              Success Story
            </div>
          )}
          <Button
            variant={post?.author?.isFollowing ? "secondary" : "outline"}
            size="sm"
            onClick={() => onFollow && onFollow(post?.author?.id)}
          >
            {post?.author?.isFollowing ? 'Following' : 'Follow'}
          </Button>
        </div>
      </div>
      {/* Post Content */}
      <div className="mb-4">
        <p className="text-foreground mb-3 leading-relaxed">{post?.content}</p>
        
        {post?.tags && post?.tags?.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {post?.tags?.map((tag, index) => (
              <span
                key={index}
                className="bg-muted text-muted-foreground px-2 py-1 rounded-full text-xs"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {post?.images && post?.images?.length > 0 && (
          <div className={`grid gap-2 rounded-lg overflow-hidden ${
            post?.images?.length === 1 ? 'grid-cols-1' :
            post?.images?.length === 2 ? 'grid-cols-2': 'grid-cols-2 md:grid-cols-3'
          }`}>
            {post?.images?.map((image, index) => (
              <div key={index} className="relative aspect-square overflow-hidden">
                <Image
                  src={image}
                  alt={`Post image ${index + 1}`}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-200"
                />
              </div>
            ))}
          </div>
        )}
      </div>
      {/* Post Actions */}
      <div className="flex items-center justify-between pt-4 border-t border-border">
        <div className="flex items-center space-x-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onLike && onLike(post?.id)}
            className={`flex items-center space-x-2 ${post?.isLiked ? 'text-destructive' : 'text-muted-foreground'}`}
          >
            <Icon name="Heart" size={18} />
            <span>{post?.likes || 0}</span>
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowComments(!showComments)}
            className="flex items-center space-x-2 text-muted-foreground"
          >
            <Icon name="MessageCircle" size={18} />
            <span>{comments?.length || 0}</span>
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onShare && onShare(post?.id)}
            className="flex items-center space-x-2 text-muted-foreground"
          >
            <Icon name="Share2" size={18} />
            <span>Share</span>
          </Button>
        </div>
        
        <Button variant="ghost" size="sm" className="text-muted-foreground">
          <Icon name="Bookmark" size={18} />
        </Button>
      </div>
      {/* Comments Section */}
      {showComments && (
        <div className="mt-4 pt-4 border-t border-border">
          {/* Add Comment */}
          <div className="flex items-start space-x-3 mb-4">
            <Image
              src={currentUserAvatar}
              alt="Your avatar"
              className="w-8 h-8 rounded-full object-cover"
            />
            <div className="flex-1 flex space-x-2">
              <input
                type="text"
                placeholder="Write a comment..."
                value={newComment}
                onChange={(e) => setNewComment(e?.target?.value)}
                onKeyPress={(e) => e?.key === 'Enter' && handleAddComment()}
                className="flex-1 px-3 py-2 bg-muted border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <Button
                size="sm"
                onClick={handleAddComment}
                disabled={!newComment?.trim() || submittingComment}
              >
                {submittingComment ? '...' : 'Post'}
              </Button>
            </div>
          </div>

          {/* Comments List */}
          <div className="space-y-3">
            {comments?.map((comment) => (
              <div key={comment?.id} className="flex items-start space-x-3">
                <Image
                  src={comment?.avatar}
                  alt={comment?.author}
                  className="w-8 h-8 rounded-full object-cover"
                />
                <div className="flex-1">
                  <div className="bg-muted rounded-lg px-3 py-2">
                    <div className="font-medium text-sm text-foreground">{comment?.author}</div>
                    <p className="text-sm text-foreground">{comment?.content}</p>
                  </div>
                  <div className="flex items-center space-x-4 mt-1 text-xs text-muted-foreground">
                    <span>{formatTimeAgo(comment?.timestamp)}</span>
                    <button className="hover:text-foreground">Like</button>
                    <button className="hover:text-foreground">Reply</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PostCard;