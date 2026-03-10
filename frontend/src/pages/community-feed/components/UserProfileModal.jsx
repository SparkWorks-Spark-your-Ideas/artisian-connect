import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';
import Button from '../../../components/ui/Button';
import { api } from '../../../utils/api';

const UserProfileModal = ({ userId, onClose, onFollow, isFollowing }) => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!userId) return;
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const response = await api.user.getPublicProfile(userId);
        setProfile(response.data?.data?.user || response.data?.data?.profile || response.data?.data);
      } catch (err) {
        console.error('Failed to fetch profile:', err);
        setError('Failed to load profile');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [userId]);

  if (!userId) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div 
        className="bg-card border border-border rounded-xl shadow-xl max-w-md w-full max-h-[80vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <div className="flex justify-end p-3 pb-0">
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <Icon name="X" size={20} />
          </button>
        </div>

        {loading && (
          <div className="flex items-center justify-center py-16">
            <Icon name="Loader2" size={32} className="animate-spin text-muted-foreground" />
          </div>
        )}

        {error && (
          <div className="text-center py-16 px-6">
            <Icon name="AlertCircle" size={32} className="text-destructive mx-auto mb-2" />
            <p className="text-muted-foreground">{error}</p>
          </div>
        )}

        {profile && !loading && (
          <div className="px-6 pb-6">
            {/* Avatar & Name */}
            <div className="flex flex-col items-center text-center mb-6">
              <Image
                src={profile.avatarUrl}
                alt={`${profile.firstName} ${profile.lastName}`}
                className="w-20 h-20 rounded-full object-cover mb-3 border-2 border-primary/20"
              />
              <h2 className="text-xl font-bold text-foreground">
                {profile.firstName} {profile.lastName}
              </h2>
              {profile.userType && (
                <span className="text-sm text-primary capitalize mt-1">
                  {profile.userType === 'artisan' ? 'Artisan' : profile.userType}
                </span>
              )}
              {profile.location && (
                <div className="flex items-center text-sm text-muted-foreground mt-1">
                  <Icon name="MapPin" size={14} className="mr-1" />
                  <span>
                    {[profile.location.city, profile.location.state, profile.location.country]
                      .filter(Boolean)
                      .join(', ')}
                  </span>
                </div>
              )}
              {profile.isVerified && (
                <div className="flex items-center text-sm text-success mt-1">
                  <Icon name="BadgeCheck" size={14} className="mr-1" />
                  <span>Verified</span>
                </div>
              )}
            </div>

            {/* Bio */}
            {(profile.bio || profile.artisanProfile?.bio) && (
              <div className="mb-4">
                <p className="text-sm text-muted-foreground leading-relaxed text-center">
                  {profile.bio || profile.artisanProfile?.bio}
                </p>
              </div>
            )}

            {/* Artisan Details */}
            {profile.artisanProfile && (
              <div className="space-y-4">
                {/* Craft Specialization */}
                {profile.artisanProfile.craftSpecialization && (
                  <div className="bg-muted/50 rounded-lg p-3">
                    <div className="text-xs font-medium text-muted-foreground mb-1">Specialization</div>
                    <div className="text-sm font-semibold text-foreground">
                      {profile.artisanProfile.craftSpecialization}
                    </div>
                  </div>
                )}

                {/* Skills */}
                {profile.artisanProfile.skills?.length > 0 && (
                  <div>
                    <div className="text-xs font-medium text-muted-foreground mb-2">Skills</div>
                    <div className="flex flex-wrap gap-1.5">
                      {profile.artisanProfile.skills.map((skill, i) => (
                        <span key={i} className="bg-primary/10 text-primary text-xs px-2 py-1 rounded-full">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Stats Row */}
                <div className="grid grid-cols-3 gap-3">
                  {profile.artisanProfile.rating != null && (
                    <div className="bg-muted/50 rounded-lg p-3 text-center">
                      <div className="flex items-center justify-center text-amber-500 mb-1">
                        <Icon name="Star" size={14} />
                        <span className="text-sm font-bold ml-1">{profile.artisanProfile.rating}</span>
                      </div>
                      <div className="text-xs text-muted-foreground">Rating</div>
                    </div>
                  )}
                  {profile.artisanProfile.totalReviews != null && (
                    <div className="bg-muted/50 rounded-lg p-3 text-center">
                      <div className="text-sm font-bold text-foreground">{profile.artisanProfile.totalReviews}</div>
                      <div className="text-xs text-muted-foreground">Reviews</div>
                    </div>
                  )}
                  {profile.artisanProfile.totalSales != null && (
                    <div className="bg-muted/50 rounded-lg p-3 text-center">
                      <div className="text-sm font-bold text-foreground">{profile.artisanProfile.totalSales}</div>
                      <div className="text-xs text-muted-foreground">Sales</div>
                    </div>
                  )}
                </div>

                {/* Experience Level */}
                {profile.artisanProfile.experienceLevel && (
                  <div className="flex items-center text-sm">
                    <Icon name="Award" size={14} className="text-muted-foreground mr-2" />
                    <span className="text-muted-foreground">Experience: </span>
                    <span className="font-medium text-foreground ml-1 capitalize">
                      {profile.artisanProfile.experienceLevel}
                    </span>
                  </div>
                )}

                {/* Social Links */}
                {profile.artisanProfile.socialLinks && Object.keys(profile.artisanProfile.socialLinks).length > 0 && (
                  <div>
                    <div className="text-xs font-medium text-muted-foreground mb-2">Social Links</div>
                    <div className="flex gap-3">
                      {Object.entries(profile.artisanProfile.socialLinks)
                        .filter(([, url]) => url)
                        .map(([platform, url]) => (
                          <a
                            key={platform}
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-muted-foreground hover:text-primary transition-colors"
                          >
                            <Icon name={platform === 'instagram' ? 'Instagram' : platform === 'twitter' ? 'Twitter' : platform === 'facebook' ? 'Facebook' : 'Globe'} size={18} />
                          </a>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Follow Button */}
            <div className="mt-6">
              <Button
                className="w-full"
                variant={isFollowing ? "secondary" : "default"}
                onClick={() => onFollow && onFollow(userId)}
              >
                {isFollowing ? 'Following' : 'Follow'}
              </Button>
            </div>

            {/* Joined Date */}
            {profile.joinedDate && (
              <div className="text-center mt-3 text-xs text-muted-foreground">
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
