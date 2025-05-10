// src/components/GenieProfile.tsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Import images
// Logo and icons
import genieLogo from '../assets/logo.png';
import coinIcon from '../assets/coinn.png';
import pointsIcon from '../assets/points.png';
import trophyIcon from '../assets/trophy.png';
import winRateIcon from '../assets/win-rate.png';
import defaultAvatar from '../assets/avatar1.png';

// Achievement badge images
import quickfireAceBadge from '../assets/quickfire-ace.png';
import knowledgeNinjaBadge from '../assets/knowledge-ninja.png';
import leaderboardLegendBadge from '../assets/leaderboard-legend.png';
import coinCollectorBadge from '../assets/coin-collector.png';
import triviaExplorerBadge from '../assets/trivia-explorer.png';


// Define UserProfile type with fields matching the Genie app design
interface UserProfile {
  id: string;
  username: string;
  email: string;
  displayName: string;
  location: string;
  rating: number; // Out of 5
  avatar?: string;
  stats: {
    totalPoints: number;
    totalCoins: number;
    highestPosition: number;
    winRate: number;
  };
  achievements: {
    id: string;
    name: string;
    description: string;
    imageUrl: string;
    unlocked: boolean;
  }[];
}

export default function GenieProfile() {
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  // Update windowWidth when the window is resized
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Check if we're on mobile
  const isMobile = windowWidth < 768;

  useEffect(() => {
    // If not logged in, redirect to login
    if (!currentUser) {
      navigate('/login');
      return;
    }

    // Fetch user profile data
    const fetchProfile = async () => {
      try {
        // For demo purposes, creating a mock profile based on the Figma design
        const mockProfile: UserProfile = {
          id: currentUser.id,
          username: 'carina040',
          email: 'www.susielane040@gmail.com',
          displayName: 'Susie Lane',
          location: 'Nigeria',
          rating: 4,
          avatar: defaultAvatar, // Use imported default avatar
          stats: {
            totalPoints: 20000,
            totalCoins: 15000,
            highestPosition: 1,
            winRate: 85.43
          },
          achievements: [
            {
              id: 'quickfire-ace',
              name: 'QUICKFIRE ACE',
              description: 'Answered super fast',
              imageUrl: quickfireAceBadge, // Use imported badge image
              unlocked: true
            },
            {
              id: 'knowledge-ninja',
              name: 'KNOWLEDGE NINJA',
              description: 'Completed a full game with 100% accuracy',
              imageUrl: knowledgeNinjaBadge, // Use imported badge image
              unlocked: true
            },
            {
              id: 'leaderboard-legend',
              name: 'LEADERBOARD LEGEND',
              description: 'Ranked Top 10 on the leaderboard',
              imageUrl: leaderboardLegendBadge, // Use imported badge image
              unlocked: true
            },
            {
              id: 'coin-collector',
              name: 'COIN COLLECTOR',
              description: 'Collected a large stash of coins in one session',
              imageUrl: coinCollectorBadge, // Use imported badge image
              unlocked: true
            },
            {
              id: 'trivia-explorer',
              name: 'TRIVIA EXPLORER',
              description: 'Played across many categories',
              imageUrl: triviaExplorerBadge, // Use imported badge image
              unlocked: true
            },
            {
              id: 'trivia-titan',
              name: 'TRIVIA TITAN',
              description: 'Get the highest score to unlock this badge',
              imageUrl: quickfireAceBadge, // Use imported badge image
              unlocked: false
            }
          ]
        };
        
        setProfile(mockProfile);
      } catch (error) {
        console.error("Failed to fetch profile", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [currentUser, navigate]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleEditProfile = () => {
    navigate('/profile-setup');
  };

  // Helper function to render rating stars
  const renderRatingStars = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span key={i} style={{ color: i <= rating ? '#FF6B00' : '#D9D9D9' }}>★</span>
      );
    }
    return stars;
  };

  if (loading) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <p>Loading profile...</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div style={{ padding: '2rem' }}>
        <h1>Profile not found</h1>
        <p>Please log in to view your profile.</p>
        <button 
          onClick={() => navigate('/login')}
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: '#FF6B00',
            color: 'white',
            border: 'none',
            borderRadius: '0.25rem',
            marginTop: '1rem',
            cursor: 'pointer'
          }}
        >
          Log In
        </button>
      </div>
    );
  }

  return (
    <div style={{
      maxWidth: '800px',
      margin: '0 auto',
      padding: isMobile ? '0.75rem' : '1rem',
      fontFamily: 'Arial, sans-serif',
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1rem',
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
        }}>
          <img 
            src={genieLogo}
            alt="Genie Logo" 
            style={{
              height: isMobile ? '30px' : '40px',
              marginRight: '0.5rem'
            }}
          />
          <h1 style={{
            color: '#FF6B00',
            fontSize: isMobile ? '1.25rem' : '1.5rem',
            fontWeight: 'bold',
            margin: 0
          }}>
            Genie
          </h1>
          <span style={{
            fontSize: isMobile ? '0.7rem' : '0.8rem',
            color: '#666',
            marginLeft: '0.5rem',
            display: isMobile ? 'none' : 'block'
          }}>
            Trivia with a heart!
          </span>
        </div>
        <div style={{
          display: 'flex',
          alignItems: 'center',
        }}>
          <div style={{
            backgroundColor: '#FFFBEB',
            padding: isMobile ? '0.15rem 0.5rem' : '0.25rem 0.75rem',
            borderRadius: '1rem',
            display: 'flex',
            alignItems: 'center',
            marginRight: '1rem'
          }}>
            <span style={{
              color: '#FF6B00',
              fontWeight: 'bold',
              marginRight: '0.25rem',
              fontSize: isMobile ? '0.8rem' : '1rem'
            }}>
              {profile.stats.totalCoins}
            </span>
            <img 
              src={coinIcon}
              alt="Coins" 
              style={{
                height: isMobile ? '16px' : '20px',
                width: isMobile ? '16px' : '20px'
              }}
            />
          </div>
          <div style={{
            width: isMobile ? '32px' : '40px',
            height: isMobile ? '32px' : '40px',
            borderRadius: '50%',
            overflow: 'hidden'
          }}>
            <img 
              src={profile.avatar} 
              alt="User Avatar" 
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover'
              }}
            />
          </div>
        </div>
      </div>

      {/* Profile Card */}
      <div style={{
        backgroundColor: '#FFFBEB',
        borderRadius: '1rem',
        padding: isMobile ? '1rem' : '1.5rem',
        marginBottom: '1.5rem',
        position: 'relative',
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.05)'
      }}>
        <button 
          onClick={handleEditProfile}
          style={{
            position: 'absolute',
            top: '1rem',
            right: '1rem',
            backgroundColor: 'white',
            border: '1px solid #FF6B00',
            borderRadius: '1rem',
            padding: '0.25rem 0.75rem',
            color: '#FF6B00',
            fontSize: '0.875rem',
            cursor: 'pointer'
          }}
        >
          Edit
        </button>

        <div style={{
          display: 'flex',
          alignItems: isMobile ? 'flex-start' : 'center',
          flexDirection: isMobile ? 'column' : 'row',
          marginBottom: '1rem'
        }}>
          <div style={{
            width: isMobile ? '60px' : '80px',
            height: isMobile ? '60px' : '80px',
            borderRadius: '50%',
            overflow: 'hidden',
            marginRight: isMobile ? '0' : '1.5rem',
            marginBottom: isMobile ? '1rem' : '0'
          }}>
            <img 
              src={profile.avatar} 
              alt="Profile Avatar" 
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover'
              }}
            />
          </div>
          <div>
            <h2 style={{
              margin: '0 0 0.25rem 0',
              fontSize: isMobile ? '1.1rem' : '1.25rem',
              fontWeight: 'bold'
            }}>
              {profile.displayName}
            </h2>
            <p style={{
              margin: '0 0 0.5rem 0',
              fontSize: '0.875rem',
              color: '#666'
            }}>
              Username: {profile.username}
            </p>
            <p style={{
              margin: '0 0 0.5rem 0',
              fontSize: '0.875rem',
              color: '#666'
            }}>
              {profile.email}
            </p>
            <div style={{
              fontSize: '1.25rem',
              marginBottom: '0.5rem'
            }}>
              {renderRatingStars(profile.rating)}
            </div>
            <p style={{
              margin: '0',
              fontSize: '0.875rem',
              color: '#666'
            }}>
              Location: {profile.location}
            </p>
          </div>
        </div>
      </div>

      {/* Progress Summary */}
      <div style={{
        marginBottom: '2rem'
      }}>
        <h2 style={{
          fontSize: isMobile ? '1.1rem' : '1.25rem',
          fontWeight: 'bold',
          marginBottom: '1rem'
        }}>
          Progress Summary
        </h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4, 1fr)',
          gap: '1rem'
        }}>
          {/* Total Points Card */}
          <div style={{
            padding: isMobile ? '0.75rem' : '1rem',
            borderRadius: '0.5rem',
            background: 'linear-gradient(135deg, #4CAF50, #66BB6A)',
            color: 'white',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
          }}>
            <div style={{
              fontSize: isMobile ? '0.75rem' : '0.875rem',
              marginBottom: '0.5rem'
            }}>
              Total Points
            </div>
            <div style={{
              display: 'flex',
              alignItems: 'center'
            }}>
              <img 
                src={pointsIcon}
                alt="Points Icon" 
                style={{
                  width: isMobile ? '16px' : '20px',
                  height: isMobile ? '16px' : '20px',
                  marginRight: '0.5rem'
                }}
              />
              <span style={{
                fontSize: isMobile ? '1rem' : '1.25rem',
                fontWeight: 'bold'
              }}>
                {profile.stats.totalPoints}
              </span>
            </div>
          </div>

          {/* Total Coins Card */}
          <div style={{
            padding: isMobile ? '0.75rem' : '1rem',
            borderRadius: '0.5rem',
            background: 'linear-gradient(135deg, #FF9800, #FFA726)',
            color: 'white',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
          }}>
            <div style={{
              fontSize: isMobile ? '0.75rem' : '0.875rem',
              marginBottom: '0.5rem'
            }}>
              Total Coins
            </div>
            <div style={{
              display: 'flex',
              alignItems: 'center'
            }}>
              <img 
                src={coinIcon}
                alt="Coin Icon" 
                style={{
                  width: isMobile ? '16px' : '20px',
                  height: isMobile ? '16px' : '20px',
                  marginRight: '0.5rem'
                }}
              />
              <span style={{
                fontSize: isMobile ? '1rem' : '1.25rem',
                fontWeight: 'bold'
              }}>
                {profile.stats.totalCoins}
              </span>
            </div>
          </div>

          {/* Highest Position Card */}
          <div style={{
            padding: isMobile ? '0.75rem' : '1rem',
            borderRadius: '0.5rem',
            background: 'linear-gradient(135deg, #8BC34A, #9CCC65)',
            color: 'white',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
          }}>
            <div style={{
              fontSize: isMobile ? '0.75rem' : '0.875rem',
              marginBottom: '0.5rem'
            }}>
              Highest Position
            </div>
            <div style={{
              display: 'flex',
              alignItems: 'center'
            }}>
              <img 
                src={trophyIcon}
                alt="Trophy Icon" 
                style={{
                  width: isMobile ? '16px' : '20px',
                  height: isMobile ? '16px' : '20px',
                  marginRight: '0.5rem'
                }}
              />
              <span style={{
                fontSize: isMobile ? '1rem' : '1.25rem',
                fontWeight: 'bold'
              }}>
                {profile.stats.highestPosition}
              </span>
              <span style={{
                fontSize: isMobile ? '0.7rem' : '0.875rem',
                marginLeft: '0.5rem'
              }}>
                Leaderboard
              </span>
            </div>
          </div>

          {/* Win Rate Card */}
          <div style={{
            padding: isMobile ? '0.75rem' : '1rem',
            borderRadius: '0.5rem',
            background: 'linear-gradient(135deg, #2196F3, #42A5F5)',
            color: 'white',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
          }}>
            <div style={{
              fontSize: isMobile ? '0.75rem' : '0.875rem',
              marginBottom: '0.5rem'
            }}>
              Win Rate
            </div>
            <div style={{
              display: 'flex',
              alignItems: 'center'
            }}>
              <img 
                src={winRateIcon}
                alt="Win Rate" 
                style={{
                  width: isMobile ? '20px' : '24px',
                  height: isMobile ? '20px' : '24px',
                  marginRight: '0.5rem'
                }}
              />
              <span style={{
                fontSize: isMobile ? '1rem' : '1.25rem',
                fontWeight: 'bold'
              }}>
                {profile.stats.winRate}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Achievements Section */}
      <div>
        <h2 style={{
          fontSize: isMobile ? '1.1rem' : '1.25rem',
          fontWeight: 'bold',
          marginBottom: '1rem'
        }}>
          Achievements
        </h2>
        <div style={{
          border: '1px solid #EFEFEF',
          borderRadius: '1rem',
          overflow: 'hidden'
        }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)',
          }}>
            {profile.achievements.map((achievement, index) => (
              <div 
                key={achievement.id}
                style={{
                  padding: '1rem',
                  borderBottom: index < profile.achievements.length - (isMobile ? 1 : 2) ? '1px solid #EFEFEF' : 'none',
                  borderRight: !isMobile && index % 2 === 0 ? '1px solid #EFEFEF' : 'none',
                  display: 'flex',
                  alignItems: 'center',
                  opacity: achievement.unlocked ? 1 : 0.5
                }}
              >
                <div style={{
                  width: isMobile ? '50px' : '60px',
                  height: isMobile ? '50px' : '60px',
                  marginRight: '1rem',
                  position: 'relative'
                }}>
                  <div style={{
                    width: '100%',
                    height: '100%',
                    borderRadius: '50%',
                    backgroundColor: achievement.unlocked ? '#8300E9' : '#E0E0E0',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center'
                  }}></div>
                  <img 
                    src={achievement.imageUrl}
                    alt={achievement.name}
                    style={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                      width: '80%',
                      height: '80%',
                      objectFit: 'contain'
                    }}
                  />
                </div>
                <div style={{
                  flex: 1
                }}>
                  <h3 style={{
                    margin: '0 0 0.25rem 0',
                    fontSize: isMobile ? '0.9rem' : '1rem',
                    fontWeight: 'bold',
                    color: achievement.unlocked ? '#FF6B00' : '#999'
                  }}>
                    {achievement.name}
                  </h3>
                  <p style={{
                    margin: '0',
                    fontSize: isMobile ? '0.8rem' : '0.875rem',
                    color: '#666'
                  }}>
                    {achievement.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}