import React, { useState, useEffect } from 'react';
import Header from '../../components/ui/Header';
import PostCard from './components/PostCard';
import PostCreator from './components/PostCreator';
import FilterTabs from './components/FilterTabs';
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

  // Fetch posts from API
  const fetchPosts = async (filter = 'all') => {
    setLoading(true);
    setError(null);
    
    // Simulate API call
    setTimeout(() => {
      setPosts([]);
      setLoading(false);
    }, 1000);
  };

  useEffect(() => {
    fetchPosts(activeFilter);
  }, []);

  const handleFilterChange = (filter) => {
    setActiveFilter(filter);
    fetchPosts(filter);
  };

  const handleCreatePost = async (newPostData) => {
    console.log('Create post called with:', newPostData);
  };

  const handleLoadMore = () => {
    console.log('Load more posts');
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
                    onLike={() => console.log('Like post:', post?.id)}
                    onComment={() => console.log('Comment on post:', post?.id)}
                    onShare={() => console.log('Share post:', post?.id)}
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
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommunityFeed;