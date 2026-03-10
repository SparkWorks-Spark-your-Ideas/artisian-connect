import React, { useState, useEffect, useCallback } from 'react';
import Header from '../../components/ui/Header';
import PostCard from './components/PostCard';
import PostCreator from './components/PostCreator';
import FilterTabs from './components/FilterTabs';
import LoadingSkeleton from './components/LoadingSkeleton';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import UserProfileModal from './components/UserProfileModal';
import { api } from '../../utils/api';

const CommunityFeed = () => {
  const [posts, setPosts] = useState([]);
  const [activeFilter, setActiveFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [profileUserId, setProfileUserId] = useState(null);
  const [stats, setStats] = useState({
    postsToday: 0,
    followingCount: 0,
    totalInteractions: 0,
    successStories: 0,
    totalPosts: 0
  });

  // State for filter counts
  const [filterCounts, setFilterCounts] = useState({
    all: 0,
    following: 0,
    craftType: 0,
    successStories: 0
  });

  // Get current user profile from localStorage
  const getUserProfile = () => {
    try {
      const stored = localStorage.getItem('userProfile');
      return stored ? JSON.parse(stored) : null;
    } catch { return null; }
  };

  // Fetch community stats
  const fetchStats = async () => {
    try {
      const response = await api.social.getStats();
      const data = response.data?.data;
      if (data) {
        setStats(data);
        setFilterCounts({
          all: data.totalPosts || 0,
          following: data.followingCount || 0,
          craftType: 0,
          successStories: data.successStories || 0
        });
      }
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    }
  };

  // Fetch posts from API
  const fetchPosts = useCallback(async (filter = 'all', pageNum = 1, append = false) => {
    setLoading(true);
    setError(null);
    
    try {
      const params = { page: pageNum, limit: 10 };

      if (filter === 'following') {
        params.filter = 'following';
      } else if (filter === 'success_stories') {
        params.filter = 'success_stories';
      }

      const response = await api.social.getFeed(params);
      const data = response.data?.data;
      const newPosts = data?.posts || [];
      const pagination = data?.pagination;

      if (append) {
        setPosts(prev => [...prev, ...newPosts]);
      } else {
        setPosts(newPosts);
      }

      setHasMore(pagination ? pageNum < pagination.totalPages : false);
    } catch (err) {
      console.error('Failed to fetch posts:', err);
      setError('Failed to load posts. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPosts(activeFilter, 1);
    fetchStats();
  }, []);

  const handleFilterChange = (filter) => {
    setActiveFilter(filter);
    setPage(1);
    fetchPosts(filter, 1);
  };

  const handleCreatePost = async (newPostData) => {
    try {
      // Upload images if any
      let imageUrls = [];
      if (newPostData.imageFiles && newPostData.imageFiles.length > 0) {
        const formData = new FormData();
        newPostData.imageFiles.forEach(file => formData.append('images', file));
        const uploadRes = await api.social.uploadImages(formData);
        imageUrls = uploadRes.data?.data?.imageUrls || [];
      }

      const postPayload = {
        content: newPostData.content,
        type: newPostData.type || 'text',
        tags: newPostData.tags || [],
        imageUrls
      };

      const response = await api.social.createPost(postPayload);
      const createdPost = response.data?.data?.post;
      
      if (createdPost) {
        const userProfile = getUserProfile();
        // Map to frontend shape and prepend to feed
        const mappedPost = {
          id: createdPost.id,
          content: createdPost.content,
          type: createdPost.type || 'text',
          tags: createdPost.tags || [],
          images: createdPost.imageUrls || [],
          likes: 0,
          isLiked: false,
          comments: [],
          shares: 0,
          views: 0,
          timestamp: createdPost.createdAt,
          author: {
            id: createdPost.authorId,
            name: userProfile ? `${userProfile.firstName || ''} ${userProfile.lastName || ''}`.trim() : 'You',
            avatar: userProfile?.avatarUrl || null,
            craftType: userProfile?.artisanProfile?.craftSpecialization || userProfile?.userType || 'Artisan',
            isFollowing: false
          }
        };
        setPosts(prev => [mappedPost, ...prev]);
        fetchStats();
      }
    } catch (err) {
      console.error('Failed to create post:', err);
      setError('Failed to create post. Please try again.');
    }
  };

  const handleLike = async (postId) => {
    try {
      const response = await api.social.likePost(postId);
      const result = response.data?.data;
      
      setPosts(prev => prev.map(post => 
        post.id === postId 
          ? { ...post, likes: result.likesCount, isLiked: result.isLiked }
          : post
      ));
    } catch (err) {
      console.error('Failed to like post:', err);
    }
  };

  const handleComment = async (postId, commentContent) => {
    try {
      const response = await api.social.commentPost(postId, commentContent);
      const result = response.data?.data?.comment;
      
      if (result) {
        const userProfile = getUserProfile();
        const newComment = {
          id: result.id,
          content: result.content,
          timestamp: result.createdAt,
          likes: 0,
          author: userProfile ? `${userProfile.firstName || ''} ${userProfile.lastName || ''}`.trim() : 'You',
          avatar: userProfile?.avatarUrl || null
        };

        setPosts(prev => prev.map(post =>
          post.id === postId
            ? { ...post, comments: [...(post.comments || []), newComment] }
            : post
        ));
      }
    } catch (err) {
      console.error('Failed to add comment:', err);
    }
  };

  const handleFollow = async (artisanId) => {
    try {
      const response = await api.social.followArtisan(artisanId);
      const result = response.data?.data;
      
      setPosts(prev => prev.map(post =>
        post.author?.id === artisanId
          ? { ...post, author: { ...post.author, isFollowing: result.isFollowing } }
          : post
      ));
      fetchStats();
    } catch (err) {
      console.error('Failed to follow/unfollow:', err);
    }
  };

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchPosts(activeFilter, nextPage, true);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 gap-6">
          {/* Main Content - Full Width */}
          <div className="w-full">
            <FilterTabs 
              activeFilter={activeFilter}
              onFilterChange={handleFilterChange}
              counts={filterCounts}
              stats={stats}
            />
            
            <PostCreator onCreatePost={handleCreatePost} />
            
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600">{error}</p>
                <Button 
                  onClick={() => fetchPosts(activeFilter)} 
                  className="mt-2" 
                  variant="outline"
                  size="sm"
                >
                  Try Again
                </Button>
              </div>
            )}
            
            {loading && posts?.length === 0 ? (
              <LoadingSkeleton />
            ) : (
              <div className="space-y-6">
                {posts?.map((post) => (
                  <PostCard
                    key={post?.id}
                    post={post}
                    onLike={handleLike}
                    onComment={handleComment}
                    onFollow={handleFollow}
                    onShare={() => {}}
                    onAuthorClick={(authorId) => setProfileUserId(authorId)}
                  />
                ))}

                {posts?.length === 0 && !loading && (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                      <Icon name="Users" size={32} className="text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-medium text-foreground mb-2">No Posts Yet</h3>
                    <p className="text-muted-foreground">
                      Be the first to share your craft journey with the community!
                    </p>
                  </div>
                )}

                {hasMore && posts?.length > 0 && !loading && (
                  <div className="text-center">
                    <Button
                      variant="outline"
                      onClick={handleLoadMore}
                      className="w-full sm:w-auto"
                    >
                      Load More Posts
                    </Button>
                  </div>
                )}

                {loading && posts?.length > 0 && (
                  <div className="text-center py-4">
                    <Icon name="Loader2" size={24} className="animate-spin mx-auto text-muted-foreground" />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* User Profile Modal */}
      {profileUserId && (
        <UserProfileModal
          userId={profileUserId}
          onClose={() => setProfileUserId(null)}
          onFollow={(uid) => {
            handleFollow(uid);
            setProfileUserId(null);
          }}
          isFollowing={posts.find(p => p.author?.id === profileUserId)?.author?.isFollowing}
        />
      )}
    </div>
  );
};

export default CommunityFeed;