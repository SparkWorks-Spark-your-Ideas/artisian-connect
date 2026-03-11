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
          setProfile(buildFallback());
        }
      } catch (err) {
        console.error('Failed to fetch profile:', err);
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

  const displayName = (() => {
    const name = `${profile?.firstName || ''} ${profile?.lastName || ''}`.trim();
    if (name && name !== userId) return name;
    return authorFallback?.name || userId;
  })();

  const displayAvatar = profile?.avatarUrl || authorFallback?.avatar || null;
  const ap = profile?.artisanProfile;
  const crafts = ap?.craftSpecializations || (ap?.craftSpecialization ? [ap.craftSpecialization] : []);

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div 
        className="bg-white/80 backdrop-blur-xl border border-white/60 rounded-2xl ring-1 ring-orange-100/50 shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with gradient background */}
        <div className="relative bg-gradient-to-br from-orange-200/40 via-amber-100/20 to-transparent rounded-t-2xl pt-6 pb-16 px-6">
          <button 
            onClick={onClose} 
            className="absolute top-4 right-4 text-gray-500 hover:text-gray-900 bg-white/80 rounded-full p-1.5 backdrop-blur-sm z-10"
          >
            <Icon name="X" size={20} />
          </button>
        </div>

        {loading && (
          <div className="flex items-center justify-center py-20">
            <Icon name="Loader2" size={36} className="animate-spin text-orange-500" />
          </div>
        )}

        {profile && !loading && (
          <div className="px-8 pb-8 -mt-14">
            {/* Profile Header */}
            <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4 mb-6">
              <div className="relative flex-shrink-0">
                <Image
                  src={displayAvatar}
                  alt={displayName}
                  className="w-28 h-28 rounded-full object-cover border-4 border-white shadow-lg"
                />
                {(profile.isVerified || ap?.isVerified) && (
                  <div className="absolute -bottom-1 -right-1 bg-orange-500 text-white rounded-full p-1.5">
                    <Icon name="Check" size={14} />
                  </div>
                )}
              </div>
              <div className="flex-1 text-center sm:text-left">
                <h2 className="text-2xl font-bold text-gray-900">{displayName}</h2>
                {profile.userType && (
                  <span className="inline-flex items-center gap-1 text-sm text-orange-600 font-medium mt-0.5">
                    <Icon name="Palette" size={14} />
                    {profile.userType === 'artisan' ? 'Artisan Craftsperson' : profile.userType}
                  </span>
                )}
                {(profile.location?.city || profile.location?.state) && (
                  <div className="flex items-center justify-center sm:justify-start text-sm text-gray-500 mt-1">
                    <Icon name="MapPin" size={14} className="mr-1" />
                    <span>
                      {[profile.location.city, profile.location.district, profile.location.state]
                        .filter(Boolean)
                        .join(', ')}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Followers/Following Row */}
            <div className="flex items-center justify-center sm:justify-start gap-6 mb-6 pb-5 border-b border-gray-200/60">
              <div className="text-center">
                <div className="text-lg font-bold text-gray-900">{profile.followersCount ?? 0}</div>
                <div className="text-xs text-gray-500">Followers</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-gray-900">{profile.followingCount ?? 0}</div>
                <div className="text-xs text-gray-500">Following</div>
              </div>
              {ap?.totalSales > 0 && (
                <div className="text-center">
                  <div className="text-lg font-bold text-gray-900">{ap.totalSales}</div>
                  <div className="text-xs text-gray-500">Sales</div>
                </div>
              )}
              {ap?.rating > 0 && (
                <div className="text-center">
                  <div className="flex items-center justify-center text-amber-500">
                    <Icon name="Star" size={14} />
                    <span className="text-lg font-bold ml-0.5">{ap.rating}</span>
                  </div>
                  <div className="text-xs text-gray-500">{ap.totalReviews || 0} Reviews</div>
                </div>
              )}
            </div>

            {/* Bio */}
            {(profile.bio || ap?.bio) && (
              <div className="mb-5">
                <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  <Icon name="FileText" size={12} />
                  About
                </div>
                <p className="text-sm text-gray-700 leading-relaxed">
                  {profile.bio || ap?.bio}
                </p>
              </div>
            )}

            {/* Craft Specializations */}
            {crafts.length > 0 && (
              <div className="mb-5">
                <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  <Icon name="Hammer" size={12} />
                  Craft Specializations
                </div>
                <div className="flex flex-wrap gap-2">
                  {crafts.map((craft, i) => (
                    <span key={i} className="bg-orange-100 text-orange-600 text-sm font-medium px-3 py-1.5 rounded-full capitalize">
                      {craft.replace(/-/g, ' ')}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Portfolio Images */}
            {ap?.portfolioImages?.length > 0 && (
              <div className="mb-5">
                <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                  <Icon name="Image" size={12} />
                  Portfolio ({ap.portfolioImages.length} images)
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {ap.portfolioImages.slice(0, 8).map((img, i) => (
                    <div key={i} className="aspect-square rounded-xl overflow-hidden bg-gray-100">
                      <Image
                        src={img.src || img.url || img}
                        alt={`Portfolio ${i + 1}`}
                        className="w-full h-full object-cover hover:scale-105 transition-transform"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Skills & Experience Grid */}
            {(ap?.experienceLevel || ap?.yearsOfExperience || ap?.specializationFocus) && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
                {ap.experienceLevel && (
                  <div className="flex items-center gap-3 bg-orange-50/50 rounded-xl p-3">
                    <div className="bg-orange-100 rounded-full p-2 flex-shrink-0">
                      <Icon name="Award" size={16} className="text-orange-500" />
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Experience</div>
                      <div className="text-sm font-semibold text-gray-900 capitalize">{ap.experienceLevel}</div>
                    </div>
                  </div>
                )}
                {ap.yearsOfExperience > 0 && (
                  <div className="flex items-center gap-3 bg-orange-50/50 rounded-xl p-3">
                    <div className="bg-orange-100 rounded-full p-2 flex-shrink-0">
                      <Icon name="Clock" size={16} className="text-orange-500" />
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Years of Practice</div>
                      <div className="text-sm font-semibold text-gray-900">{ap.yearsOfExperience} years</div>
                    </div>
                  </div>
                )}
                {ap.specializationFocus && (
                  <div className="flex items-center gap-3 bg-orange-50/50 rounded-xl p-3 sm:col-span-2">
                    <div className="bg-orange-100 rounded-full p-2 flex-shrink-0">
                      <Icon name="Target" size={16} className="text-orange-500" />
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Specialization Focus</div>
                      <div className="text-sm font-semibold text-gray-900">{ap.specializationFocus}</div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Traditional Techniques */}
            {ap?.craftTechniques?.length > 0 && (
              <div className="mb-5">
                <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  <Icon name="Wrench" size={12} />
                  Traditional Techniques
                </div>
                <div className="flex flex-wrap gap-2">
                  {ap.craftTechniques.map((tech, i) => (
                    <span key={i} className="bg-orange-100 text-orange-600 text-xs font-medium px-2.5 py-1.5 rounded-full border border-orange-200/60">
                      {tech.replace(/-/g, ' ')}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Tools & Equipment */}
            {ap?.toolsAndEquipment && (
              <div className="mb-5">
                <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  <Icon name="Settings" size={12} />
                  Tools & Equipment
                </div>
                <p className="text-sm text-gray-500 leading-relaxed bg-gray-100/50 rounded-xl p-3">
                  {ap.toolsAndEquipment}
                </p>
              </div>
            )}

            {/* Awards & Recognition */}
            {ap?.awardsRecognition?.trim() && (
              <div className="mb-5">
                <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  <Icon name="Trophy" size={12} />
                  Awards & Recognition
                </div>
                <p className="text-sm text-gray-500 leading-relaxed bg-gray-100/50 rounded-xl p-3">
                  {ap.awardsRecognition}
                </p>
              </div>
            )}

            {/* Social Links */}
            {ap?.socialLinks && Object.values(ap.socialLinks).some(v => v) && (
              <div className="mb-5">
                <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  <Icon name="Share2" size={12} />
                  Connect
                </div>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(ap.socialLinks)
                    .filter(([, url]) => url)
                    .map(([platform, url]) => {
                      const iconMap = { instagram: 'Instagram', twitter: 'Twitter', facebook: 'Facebook', youtube: 'Youtube', whatsapp: 'Phone', website: 'Globe' };
                      return (
                        <a
                          key={platform}
                          href={platform === 'whatsapp' ? `https://wa.me/${url}` : (url.startsWith('http') ? url : `https://${url}`)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 bg-gray-100/60 hover:bg-orange-50 rounded-xl px-3 py-2 text-sm text-gray-500 hover:text-orange-600 transition-colors"
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
              className="w-full mt-3"
              size="lg"
              variant={isFollowing ? "secondary" : "default"}
              onClick={() => onFollow && onFollow(userId)}
            >
              <Icon name={isFollowing ? "UserCheck" : "UserPlus"} size={18} className="mr-2" />
              {isFollowing ? 'Following' : 'Follow Artisan'}
            </Button>

            {/* Joined Date */}
            {profile.joinedDate && (
              <div className="text-center mt-4 text-xs text-gray-400">
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
