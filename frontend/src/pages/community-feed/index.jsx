import React, { useState, useEffect } from 'react';
import Header from '../../components/ui/Header';
import PostCard from './components/PostCard';
import PostCreator from './components/PostCreator';
import FilterTabs from './components/FilterTabs';
import SuggestedArtisans from './components/SuggestedArtisans';
import LoadingSkeleton from './components/LoadingSkeleton';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';

const CommunityFeed = () => {
  const [posts, setPosts] = useState([]);
  const [activeFilter, setActiveFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);

  // Mock posts data
  const mockPosts = [
    {
      id: 1,
      author: {
        id: 'user1',
        name: 'Priya Sharma',
        avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=40&h=40&fit=crop&crop=face',
        craftType: 'Pottery & Ceramics',
        isFollowing: false
      },
      content: `Just finished this beautiful terracotta vase using traditional wheel throwing techniques passed down from my grandmother. The clay was sourced locally from our village and fired in our community kiln.\n\nThe intricate patterns were hand-carved before the final firing. Each piece tells a story of our heritage and craftsmanship. So grateful to be preserving these ancient techniques! 🏺✨`,
      images: [
        'https://images.pexels.com/photos/1094767/pexels-photo-1094767.jpeg?w=400&h=400&fit=crop',
        'https://images.pixabay.com/photo/2017/08/02/14/26/pottery-2571169_960_720.jpg'
      ],
      tags: ['pottery', 'traditional', 'handmade', 'terracotta'],
      type: 'general',
      timestamp: new Date(Date.now() - 3600000),
      likes: 47,
      isLiked: false,
      comments: [
        {
          id: 1,
          author: 'Rajesh Kumar',
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=32&h=32&fit=crop&crop=face',
          content: 'Absolutely stunning work! The patterns are so intricate.',
          timestamp: new Date(Date.now() - 1800000),
          likes: 3
        }
      ],
      location: 'Jaipur, Rajasthan'
    },
    {
      id: 2,
      author: {
        id: 'user2',
        name: 'Rajesh Kumar',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face',
        craftType: 'Wood Carving',
        isFollowing: true
      },
      content: `🎉 MILESTONE ACHIEVED! 🎉\n\nI'm thrilled to share that my wooden sculpture "Dancing Ganesha" has been selected for the National Handicrafts Exhibition in Delhi! This piece took me 3 months to complete, working with traditional Mysore rosewood.\n\nFrom a small village workshop to national recognition - dreams do come true with dedication and passion. Thank you to everyone who supported my journey!`,
      images: [
        'https://images.pixabay.com/photo/2017/08/02/14/26/wood-2571169_960_720.jpg'
      ],
      tags: ['woodcarving', 'achievement', 'ganesha', 'exhibition'],
      type: 'success_story',
      timestamp: new Date(Date.now() - 7200000),
      likes: 156,
      isLiked: true,
      comments: [
        {
          id: 1,
          author: 'Meera Devi',avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=32&h=32&fit=crop&crop=face',content: 'Congratulations! Your dedication is truly inspiring.',
          timestamp: new Date(Date.now() - 3600000),
          likes: 8
        },
        {
          id: 2,
          author: 'Arjun Singh',avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face',content: 'Well deserved recognition! The detail work is incredible.',
          timestamp: new Date(Date.now() - 2700000),
          likes: 5
        }
      ],
      location: 'Mysore, Karnataka'
    },
    {
      id: 3,
      author: {
        id: 'user3',name: 'Meera Devi',avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop&crop=face',craftType: 'Textile Weaving',
        isFollowing: false
      },
      content: `💡 TECHNIQUE TUESDAY: Natural Dyeing Process 💡\n\nSharing my grandmother's secret recipe for creating vibrant indigo blue dye from fresh indigo leaves. This traditional method has been used in our family for over 100 years!\n\nStep 1: Harvest fresh indigo leaves early morning\nStep 2: Ferment in clay pots for 24 hours\nStep 3: Add lime water and beat vigorously\nStep 4: Let settle and extract the blue sediment\n\nThe result? Rich, deep blue that lasts for generations! Who wants to try this at home?`,
      images: [
        'https://images.pexels.com/photos/6292/red-hands-woman-creative.jpg?w=400&h=400&fit=crop',
        'https://images.pixabay.com/photo/2017/08/02/14/26/textile-2571169_960_720.jpg',
        'https://images.pexels.com/photos/1094767/pexels-photo-1094767.jpeg?w=400&h=400&fit=crop'
      ],
      tags: ['weaving', 'natural-dye', 'indigo', 'traditional-technique'],
      type: 'technique',
      timestamp: new Date(Date.now() - 10800000),
      likes: 89,
      isLiked: false,
      comments: [
        {
          id: 1,
          author: 'Priya Sharma',
          avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=32&h=32&fit=crop&crop=face',
          content: 'This is amazing! Can you share more about the fermentation process?',
          timestamp: new Date(Date.now() - 5400000),
          likes: 12
        }
      ],
      location: 'Varanasi, UP'
    },
    {
      id: 4,
      author: {
        id: 'user4',
        name: 'Arjun Singh',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face',
        craftType: 'Metal Jewelry',
        isFollowing: true
      },
      content: `Working on a custom bridal jewelry set inspired by Rajasthani Kundan work. The intricate gold filigree combined with precious stones creates such beautiful patterns.\n\nEach piece is handcrafted using techniques that are centuries old. The attention to detail in traditional Indian jewelry making never ceases to amaze me. Can't wait to see the bride wearing this on her special day! ✨💍`,
      images: [
        'https://images.pixabay.com/photo/2017/11/11/15/58/jewelry-2939191_960_720.jpg'
      ],
      tags: ['jewelry', 'kundan', 'bridal', 'gold'],
      type: 'general',
      timestamp: new Date(Date.now() - 14400000),
      likes: 73,
      isLiked: false,
      comments: [],
      location: 'Jodhpur, Rajasthan'
    },
    {
      id: 5,
      author: {
        id: 'user5',name: 'Kavita Patel',avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=40&h=40&fit=crop&crop=face',craftType: 'Embroidery',
        isFollowing: false
      },
      content: `From struggling to make ends meet to running my own embroidery workshop with 15 women artisans! 🌟\n\nThree years ago, I was doing piecework from home for ₹50 per day. Today, our collective "Stitch Sisters" generates ₹2 lakh monthly revenue, and each woman earns a dignified wage.\n\nWe specialize in Gujarati mirror work and have clients across India. Empowering women through traditional crafts - this is what success looks like! 💪👩‍🎨`,
      images: [
        'https://images.pexels.com/photos/6292/red-hands-woman-creative.jpg?w=400&h=400&fit=crop','https://images.pixabay.com/photo/2017/08/02/14/26/embroidery-2571169_960_720.jpg'
      ],
      tags: ['embroidery', 'women-empowerment', 'success-story', 'collective'],
      type: 'success_story',
      timestamp: new Date(Date.now() - 18000000),
      likes: 234,
      isLiked: true,
      comments: [
        {
          id: 1,
          author: 'Meera Devi',avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=32&h=32&fit=crop&crop=face',content: 'So inspiring! You are changing lives through craft.',
          timestamp: new Date(Date.now() - 14400000),
          likes: 15
        }
      ],
      location: 'Ahmedabad, Gujarat'
    }
  ];

  const filterCounts = {
    all: mockPosts?.length,
    following: mockPosts?.filter(post => post?.author?.isFollowing)?.length,
    craftType: mockPosts?.filter(post => post?.author?.craftType?.includes('Pottery'))?.length,
    successStories: mockPosts?.filter(post => post?.type === 'success_story')?.length
  };

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setPosts(mockPosts);
      setLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  const handleFilterChange = (filter) => {
    setActiveFilter(filter);
    setLoading(true);
    
    // Simulate filter loading
    setTimeout(() => {
      let filteredPosts = mockPosts;
      
      switch (filter) {
        case 'following':
          filteredPosts = mockPosts?.filter(post => post?.author?.isFollowing);
          break;
        case 'craft_type':
          filteredPosts = mockPosts?.filter(post => post?.author?.craftType?.includes('Pottery'));
          break;
        case 'success_stories':
          filteredPosts = mockPosts?.filter(post => post?.type === 'success_story');
          break;
        default:
          filteredPosts = mockPosts;
      }
      
      setPosts(filteredPosts);
      setLoading(false);
    }, 800);
  };

  const handleCreatePost = (newPost) => {
    setPosts(prev => [newPost, ...prev]);
  };

  const handleLike = (postId) => {
    setPosts(prev => prev?.map(post => 
      post?.id === postId 
        ? { 
            ...post, 
            isLiked: !post?.isLiked,
            likes: post?.isLiked ? post?.likes - 1 : post?.likes + 1
          }
        : post
    ));
  };

  const handleComment = (postId, comment) => {
    setPosts(prev => prev?.map(post => 
      post?.id === postId 
        ? { ...post, comments: [...post?.comments, comment] }
        : post
    ));
  };

  const handleFollow = (userId) => {
    setPosts(prev => prev?.map(post => 
      post?.author?.id === userId 
        ? { 
            ...post, 
            author: { ...post?.author, isFollowing: !post?.author?.isFollowing }
          }
        : post
    ));
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