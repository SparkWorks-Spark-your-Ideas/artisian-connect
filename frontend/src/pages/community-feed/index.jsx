import React, { useState, useEffect } from 'react';
import Header from '../../components/ui/Header';
import PostCard from './components/PostCard';
import PostCreator from './components/PostCreator';
import FilterTabs from './components/FilterTabs';
import SuggestedArtisans from './components/SuggestedArtisans';
import LoadingSkeleton from './components/LoadingSkeleton';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import { api } from '../../utils/api';

const CommunityFeed = () => {
  const [posts, setPosts] = useState([]);
  const [activeFilter, setActiveFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState(null);

  // State for filter counts
  const [filterCounts, setFilterCounts] = useState({
    all: 0,
    following: 0,
    craftType: 0,
    successStories: 0
  });

  // Fetch posts from API - Temporarily disabled for debugging
  const fetchPosts = async (filter = 'all') => {
    // try {
    //   setLoading(true);
    //   setError(null);
      
    //   const params = {};
    //   if (filter !== 'all') {
    //     params.filter = filter;
    //   }
      
    //   const response = await api.social.getFeed(params);
    //   const fetchedPosts = response.data.posts || [];
      
    //   setPosts(fetchedPosts);
      
    //   // Update filter counts based on fetched data
    //   setFilterCounts({
    //     all: fetchedPosts.length,
    //     following: fetchedPosts.filter(post => post?.author?.isFollowing).length,
    //     craftType: fetchedPosts.filter(post => post?.author?.craftType?.includes('Pottery')).length,
    //     successStories: fetchedPosts.filter(post => post?.type === 'success_story').length
    //   });
      
    // } catch (error) {
    //   console.error('Error fetching posts:', error);
    //   setError('Failed to load posts. Please try again later.');
    //   setPosts([]);
    // } finally {
    //   setLoading(false);
    // }
    
    // Temporary simple implementation
    setLoading(false);
    setPosts([]);
  };

  useEffect(() => {
    fetchPosts(activeFilter);
  }, []);

  const handleFilterChange = (filter) => {
    setActiveFilter(filter);
    fetchPosts(filter);
  };

  const handleCreatePost = async (newPostData) => {
    // Temporarily disabled for debugging
    console.log('Create post called with:', newPostData);
  };

  const handleLike = async (postId) => {
    // Temporarily disabled for debugging
    console.log('Like post called for:', postId);
  };

  const handleComment = async (postId, commentText) => {
    // Temporarily disabled for debugging
    console.log('Comment called for:', postId, commentText);
  };

  const handleFollow = (userId) => {
    // Temporarily disabled for debugging  
    console.log('Follow called for:', userId);
  }; 

  const handleShare = (postId) => {
    // Mock share functionality
    navigator.share && navigator.share({
      title: 'Check out this amazing craft post!',
      url: `${window.location?.origin}/community-feed/post/${postId}`
    });
  };

  const loadMorePosts = () => {
    setLoading(true);
    // Simulate loading more posts
    setTimeout(() => {
      setHasMore(false);
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-3">
            <FilterTabs 
              activeFilter={activeFilter}
              onFilterChange={handleFilterChange}
              counts={filterCounts}
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
                    onShare={handleShare}
                  />
                ))}
                
                {posts?.length === 0 && !loading && (
                  <div className="text-center py-12">
                    <Icon name="MessageSquare" size={48} className="mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium text-foreground mb-2">No posts found</h3>
                    <p className="text-muted-foreground mb-4">
                      {activeFilter === 'following' 
                        ? "Follow some artisans to see their posts here" :"Be the first to share something with the community!"
                      }
                    </p>
                    <Button onClick={() => handleFilterChange('all')}>
                      View All Posts
                    </Button>
                  </div>
                )}
                
                {hasMore && posts?.length > 0 && (
                  <div className="text-center py-6">
                    <Button
                      variant="outline"
                      onClick={loadMorePosts}
                      disabled={loading}
                      loading={loading}
                    >
                      Load More Posts
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
          
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              <SuggestedArtisans onFollow={handleFollow} />
              
              {/* Quick Actions */}
              <div className="bg-card border border-border rounded-lg shadow-warm p-4">
                <h3 className="font-medium text-foreground mb-3">Quick Actions</h3>
                <div className="space-y-2">
                  <Button variant="outline" size="sm" fullWidth>
                    <Icon name="Users" size={16} className="mr-2" />
                    Find Artisans
                  </Button>
                  <Button variant="outline" size="sm" fullWidth>
                    <Icon name="Calendar" size={16} className="mr-2" />
                    Events
                  </Button>
                  <Button variant="outline" size="sm" fullWidth>
                    <Icon name="BookOpen" size={16} className="mr-2" />
                    Tutorials
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Mobile FAB */}
      <div className="fixed bottom-6 right-6 lg:hidden">
        <Button
          size="lg"
          className="rounded-full w-14 h-14 shadow-warm-lg"
          onClick={() => document.querySelector('textarea')?.focus()}
        >
          <Icon name="Plus" size={24} />
        </Button>
      </div>
    </div>
  );
};

export default CommunityFeed;