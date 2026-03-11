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
  const [peopleList, setPeopleList] = useState([]);
  const [loadingPeople, setLoadingPeople] = useState(false);
  const [shareToast, setShareToast] = useState(null);
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
          followers: data.followersCount || 0,
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
      } else if (filter === 'followers') {
        params.filter = 'followers';
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

  // Fetch followers/following people list
  const fetchPeopleList = async (filter) => {
    if (filter !== 'followers' && filter !== 'following') {
      setPeopleList([]);
      return;
    }
    setLoadingPeople(true);
    try {
      const response = filter === 'followers'
        ? await api.social.getFollowers()
        : await api.social.getFollowing();
      setPeopleList(response.data?.data?.[filter] || []);
    } catch (err) {
      console.error(`Failed to fetch ${filter}:`, err);
      setPeopleList([]);
    } finally {
      setLoadingPeople(false);
    }
  };

  const handleFilterChange = (filter) => {
    setActiveFilter(filter);
    setPage(1);
    // Only fetch posts for feed tabs, not people tabs
    if (filter !== 'followers' && filter !== 'following') {
      fetchPosts(filter, 1);
    } else {
      setPosts([]);
    }
    fetchPeopleList(filter);
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

  const handleShare = async (postId) => {
    const post = posts.find(p => p.id === postId);
    if (!post) return;

    const shareText = `${post.author?.name || 'An artisan'}: ${post.content || ''}`;
    const shareUrl = `${window.location.origin}/community?post=${postId}`;

    // Use Web Share API if available (mobile + modern browsers)
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Post by ${post.author?.name || 'Artisan'} on ArtisanConnect`,
          text: shareText.length > 200 ? shareText.slice(0, 197) + '...' : shareText,
          url: shareUrl,
        });
        return;
      } catch (err) {
        // User cancelled or API failed — fall through to clipboard
        if (err.name === 'AbortError') return;
      }
    }

    // Fallback: copy link to clipboard
    try {
      await navigator.clipboard.writeText(shareUrl);
      setShareToast('Link copied to clipboard!');
    } catch {
      // Final fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = shareUrl;
      textArea.style.position = 'fixed';
      textArea.style.opacity = '0';
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setShareToast('Link copied to clipboard!');
    }
    setTimeout(() => setShareToast(null), 2500);
  };

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchPosts(activeFilter, nextPage, true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50/30 to-white">
      <Header />
      {/* Share toast notification */}
      {shareToast && (
        <div className="fixed top-4 right-4 z-50 bg-green-600 text-white px-4 py-3 rounded-lg shadow-lg flex items-center space-x-2 animate-fade-in">
          <Icon name="Check" size={18} />
          <span className="text-sm font-medium">{shareToast}</span>
        </div>
      )}
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
            
            {activeFilter !== 'followers' && activeFilter !== 'following' && (
              <PostCreator onCreatePost={handleCreatePost} />
            )}

            {/* People List for Followers/Following tabs */}
            {(activeFilter === 'followers' || activeFilter === 'following') && (
              <div className="mb-6">
                <h3 className="text-base font-semibold text-gray-900 mb-3">
                  {activeFilter === 'followers' ? 'People who follow you' : 'People you follow'}
                </h3>
                {loadingPeople ? (
                  <div className="flex items-center justify-center py-4">
                    <Icon name="Loader2" size={20} className="animate-spin text-orange-400" />
                  </div>
                ) : peopleList.length === 0 ? (
                  <div className="bg-white/70 backdrop-blur-sm border border-white/60 rounded-2xl ring-1 ring-orange-100/50 p-4 text-center text-gray-500 text-sm">
                    {activeFilter === 'followers' ? 'No one follows you yet.' : 'You are not following anyone yet.'}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {peopleList.map((person) => (
                      <button
                        key={person.uid}
                        onClick={() => setProfileUserId({ id: person.uid, fallback: { name: `${person.firstName} ${person.lastName}`.trim(), avatar: person.avatarUrl, craftType: person.craftSpecialization } })}
                        className="flex items-center space-x-3 bg-white/70 backdrop-blur-sm border border-white/60 rounded-2xl ring-1 ring-orange-100/50 p-3 hover:shadow-md transition-all text-left w-full"
                      >
                        <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                          {person.avatarUrl ? (
                            <img src={person.avatarUrl} alt="" className="w-10 h-10 rounded-full object-cover" />
                          ) : (
                            <Icon name="User" size={20} className="text-orange-500" />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center space-x-1">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {`${person.firstName} ${person.lastName}`.trim() || 'Artisan'}
                            </p>
                            {person.isVerified && <Icon name="BadgeCheck" size={14} className="text-orange-500 flex-shrink-0" />}
                          </div>
                          <p className="text-xs text-gray-500 truncate">
                            {person.craftSpecialization || 'Artisan'}
                            {person.location ? ` • ${typeof person.location === 'object' ? [person.location.city, person.location.district, person.location.state].filter(Boolean).join(', ') : person.location}` : ''}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

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
            
            {activeFilter !== 'followers' && activeFilter !== 'following' && (loading && posts?.length === 0 ? (
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
                    onShare={handleShare}
                    onAuthorClick={(authorId) => {
                      const authorPost = posts.find(p => p.author?.id === authorId);
                      setProfileUserId({ id: authorId, fallback: authorPost?.author });
                    }}
                  />
                ))}

                {posts?.length === 0 && !loading && (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Icon name="Users" size={32} className="text-orange-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Posts Yet</h3>
                    <p className="text-gray-500">
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
                    <Icon name="Loader2" size={24} className="animate-spin mx-auto text-orange-400" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* User Profile Modal */}
      {profileUserId && (
        <UserProfileModal
          userId={profileUserId.id}
          authorFallback={profileUserId.fallback}
          onClose={() => setProfileUserId(null)}
          onFollow={(uid) => {
            handleFollow(uid);
            setProfileUserId(null);
          }}
          isFollowing={posts.find(p => p.author?.id === profileUserId.id)?.author?.isFollowing}
        />
      )}
    </div>
  );
};

export default CommunityFeed;