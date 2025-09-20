import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';
import Button from '../../../components/ui/Button';

const PostCard = ({ post, onLike, onComment, onFollow, onShare }) => {
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [localComments, setLocalComments] = useState(post?.comments || []);

  const handleAddComment = () => {
    if (newComment?.trim()) {
      const comment = {
        id: Date.now(),
        author: 'Current User',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face',
        content: newComment,
        timestamp: new Date(),
        likes: 0
      };
      setLocalComments([...localComments, comment]);
      setNewComment('');
      onComment && onComment(post?.id, comment);
    }
  };

  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const diff = now - new Date(timestamp);
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  };

  return (
    <div className="bg-card border border-border rounded-lg shadow-warm p-6 mb-6">
      {/* Post Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <Image
            src={post?.author?.avatar}
            alt={post?.author?.name}
            className="w-12 h-12 rounded-full object-cover"
          />
          <div>
            <h3 className="font-semibold text-foreground">{post?.author?.name}</h3>
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
            <Icon name={post?.isLiked ? "Heart" : "Heart"} size={18} />
            <span>{post?.likes}</span>
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowComments(!showComments)}
            className="flex items-center space-x-2 text-muted-foreground"
          >
            <Icon name="MessageCircle" size={18} />
            <span>{localComments?.length}</span>
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
              src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face"
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
                disabled={!newComment?.trim()}
              >
                Post
              </Button>
            </div>
          </div>

          {/* Comments List */}
          <div className="space-y-3">
            {localComments?.map((comment) => (
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