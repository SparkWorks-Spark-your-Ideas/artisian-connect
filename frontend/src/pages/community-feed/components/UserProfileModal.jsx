import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';
import Button from '../../../components/ui/Button';
import { api } from '../../../utils/api';

const UserProfileModal = ({ userId, authorFallback, onClose, onFollow, isFollowing }) => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const response = await api.user.getPublicProfile(userId);
        const data = response.data?.data?.user || response.data?.data?.profile || response.data?.data;
        if (data) {
          setProfile(data);
        } else {
          // Use fallback from post author info
          setProfile(buildFallback());
        }
      } catch (err) {
        console.error('Failed to fetch profile:', err);
        // Use fallback from post author info
        setProfile(buildFallback());
      } finally {
        setLoading(false);
      }
    };

    const buildFallback = () => ({
      uid: userId,
      firstName: authorFallback?.name || userId,
      lastName: '',
      userType: 'artisan',
      avatarUrl: authorFallback?.avatar || null,
      bio: null,
      location: null,
      artisanProfile: {
        craftSpecialization: authorFallback?.craftType || null,
      }
    });

    fetchProfile();
  }, [userId]);

  if (!userId) return null;

  // Merge profile with fallback author info for display
  const displayName = (() => {
    const name = `${profile?.firstName || ''} ${profile?.lastName || ''}`.trim();
    if (name && name !== userId) return name;
    return authorFallback?.name || userId;
  })();

  const displayAvatar = profile?.avatarUrl || authorFallback?.avatar || null;
  const displayCraft = profile?.artisanProfile?.craftSpecialization || authorFallback?.craftType || null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div 
        className="bg-card border border-border rounded-2xl shadow-2xl max-w-lg w-full max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with gradient background */}
        <div className="relative bg-gradient-to-br from-primary/20 via-primary/10 to-transparent rounded-t-2xl pt-6 pb-16 px-6">
          <button 
            onClick={onClose} 
            className="absolute top-4 right-4 text-muted-foreground hover:text-foreground bg-card/80 rounded-full p-1.5 backdrop-blur-sm"
          >
            <Icon name="X" size={18} />
          </button>
        </div>

        {loading && (
          <div className="flex items-center justify-center py-20">
            <Icon name="Loader2" size={36} className="animate-spin text-primary" />
          </div>
        )}

        {profile && !loading && (
          <div className="px-6 pb-6 -mt-12">
            {/* Avatar */}
            <div className="flex flex-col items-center text-center mb-5">
              <div className="relative mb-4">
                <Image
                  src={displayAvatar}
                  alt={displayName}
                  className="w-24 h-24 rounded-full object-cover border-4 border-card shadow-lg"
                />
                {profile.isVerified && (
                  <div className="absolute -bottom-1 -right-1 bg-primary text-white rounded-full p-1">
                    <Icon name="Check" size={12} />
                  </div>
                )}
              </div>
              <h2 className="text-2xl font-bold text-foreground">{displayName}</h2>
              {profile.userType && (
                <span className="inline-flex items-center gap-1 text-sm text-primary font-medium capitalize mt-1">
                  <Icon name="Palette" size={14} />
                  {profile.userType === 'artisan' ? 'Artisan Craftsperson' : profile.userType}
                </span>
              )}
              {(profile.location?.city || profile.location?.state || profile.location?.country) && (
                <div className="flex items-center text-sm text-muted-foreground mt-2">
                  <Icon name="MapPin" size={14} className="mr-1" />
                  <span>
                    {[profile.location.city, profile.location.state, profile.location.country]
                      .filter(Boolean)
                      .join(', ')}
                  </span>
                </div>
              )}
            </div>

            {/* Bio Section */}
            {(profile.bio || profile.artisanProfile?.bio) && (
              <div className="bg-muted/30 rounded-xl p-4 mb-5">
                <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                  <Icon name="Quote" size={12} />
                  About
                </div>
                <p className="text-sm text-foreground leading-relaxed">
                  {profile.bio || profile.artisanProfile?.bio}
                </p>
              </div>
            )}

            {/* Craft Specialization */}
            {displayCraft && (
              <div className="bg-primary/5 border border-primary/10 rounded-xl p-4 mb-5">
                <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                  <Icon name="Hammer" size={12} />
                  Specialization
                </div>
                <div className="text-base font-semibold text-foreground">{displayCraft}</div>
              </div>
            )}

            {/* Stats Grid */}
            {profile.artisanProfile && (
              <div className="grid grid-cols-3 gap-3 mb-5">
                <div className="bg-muted/40 rounded-xl p-4 text-center">
                  <div className="flex items-center justify-center text-amber-500 mb-1">
                    <Icon name="Star" size={16} />
                    <span className="text-lg font-bold ml-1">{profile.artisanProfile.rating ?? '—'}</span>
                  </div>
                  <div className="text-xs text-muted-foreground font-medium">Rating</div>
                </div>
                <div className="bg-muted/40 rounded-xl p-4 text-center">
                  <div className="text-lg font-bold text-foreground">{profile.artisanProfile.totalReviews ?? 0}</div>
                  <div className="text-xs text-muted-foreground font-medium">Reviews</div>
                </div>
                <div className="bg-muted/40 rounded-xl p-4 text-center">
                  <div className="text-lg font-bold text-foreground">{profile.artisanProfile.totalSales ?? 0}</div>
                  <div className="text-xs text-muted-foreground font-medium">Sales</div>
                </div>
              </div>
            )}

            {/* Skills */}
            {profile.artisanProfile?.skills?.length > 0 && (
              <div className="mb-5">
                <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                  <Icon name="Sparkles" size={12} />
                  Skills & Expertise
                </div>
                <div className="flex flex-wrap gap-2">
                  {profile.artisanProfile.skills.map((skill, i) => (
                    <span key={i} className="bg-primary/10 text-primary text-sm font-medium px-3 py-1.5 rounded-full">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Experience Level */}
            {profile.artisanProfile?.experienceLevel && (
              <div className="flex items-center gap-3 bg-muted/30 rounded-xl p-4 mb-5">
                <div className="bg-primary/10 rounded-full p-2">
                  <Icon name="Award" size={18} className="text-primary" />
                </div>
                <div>
                  <div className="text-xs text-muted-foreground font-medium">Experience Level</div>
                  <div className="text-sm font-semibold text-foreground capitalize">{profile.artisanProfile.experienceLevel}</div>
                </div>
              </div>
            )}

            {/* Social Links */}
            {profile.artisanProfile?.socialLinks && Object.values(profile.artisanProfile.socialLinks).some(v => v) && (
              <div className="mb-5">
                <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                  <Icon name="Link" size={12} />
                  Social Links
                </div>
                <div className="flex gap-3">
                  {Object.entries(profile.artisanProfile.socialLinks)
                    .filter(([, url]) => url)
                    .map(([platform, url]) => {
                      const iconMap = { instagram: 'Instagram', twitter: 'Twitter', facebook: 'Facebook', youtube: 'Youtube', linkedin: 'Linkedin', website: 'Globe' };
                      return (
                        <a
                          key={platform}
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 bg-muted/40 hover:bg-muted rounded-lg px-3 py-2 text-sm text-muted-foreground hover:text-primary transition-colors"
                        >
                          <Icon name={iconMap[platform] || 'Globe'} size={16} />
                          <span className="capitalize">{platform}</span>
                        </a>
                      );
                    })}
                </div>
              </div>
            )}

            {/* Follow Button */}
            <Button
              className="w-full mt-2"
              size="lg"
              variant={isFollowing ? "secondary" : "default"}
              onClick={() => onFollow && onFollow(userId)}
            >
              <Icon name={isFollowing ? "UserCheck" : "UserPlus"} size={18} className="mr-2" />
              {isFollowing ? 'Following' : 'Follow Artisan'}
            </Button>

            {/* Joined Date */}
            {profile.joinedDate && (
              <div className="text-center mt-4 text-xs text-muted-foreground">
                <Icon name="Calendar" size={12} className="inline mr-1" />
                Joined {new Date(profile.joinedDate._seconds ? profile.joinedDate._seconds * 1000 : profile.joinedDate).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserProfileModal;
