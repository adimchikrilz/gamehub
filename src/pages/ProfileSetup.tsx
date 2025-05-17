import { useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect, useRef, useMemo } from 'react';
import Avatar1 from '../assets/avatar4.png';
import Avatar2 from '../assets/avatar5.png';
import Avatar3 from '../assets/avatar6.png';
import Avatar4 from '../assets/avatar7.png';
import Avatar5 from '../assets/avatar8.png';
import Avatar6 from '../assets/avatar9.png';
import Avatar7 from '../assets/avatar.png';
import Avatar8 from '../assets/avatar11.png';
import Avatar9 from '../assets/avatar12.png';
import Avatar10 from '../assets/avatar13.png';
import './ProfileSetup.css';

interface ProfileData {
  displayName: string;
  bio: string;
  location: string;
  avatar: string;
  stats: {
    played: number;
    wins: number;
    losses: number;
    totalPoints: number;
    currentRank: number;
  };
}

export default function ProfileSetup() {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get profile data from local storage or use defaults
  const getSavedProfile = (): ProfileData => {
    const savedProfile = localStorage.getItem('userProfile');
    if (savedProfile) {
      return JSON.parse(savedProfile);
    }
    return {
      displayName: '',
      bio: '',
      location: '',
      avatar: Avatar1,
      stats: {
        played: 0,
        wins: 0,
        losses: 0,
        totalPoints: 0,
        currentRank: 0,
      }
    };
  };

  const savedProfile = getSavedProfile();
  
  // Check if we're coming from signup
  useEffect(() => {
    const isFromSignup = location.state?.fromSignup;
    if (isFromSignup && !localStorage.getItem('userProfile')) {
      const defaultProfile: ProfileData = {
        displayName: '',
        bio: '',
        location: '',
        avatar: Avatar1,
        stats: {
          played: 0,
          wins: 0,
          losses: 0,
          totalPoints: 0,
          currentRank: 0,
        }
      };
      localStorage.setItem('userProfile', JSON.stringify(defaultProfile));
    } else if (!isFromSignup && savedProfile.displayName) {
      navigate('/game-platform');
    }
  }, [location.state, navigate]);
  
  const [displayName, setDisplayName] = useState<string>(savedProfile.displayName || '');
  const [bio, setBio] = useState<string>(savedProfile.bio || '');
  const [locationState, setLocation] = useState<string>(savedProfile.location || '');
  const [selectedAvatar, setSelectedAvatar] = useState<string>(savedProfile.avatar || Avatar1);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  const avatarScrollRef = useRef<HTMLDivElement | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [startX, setStartX] = useState<number>(0);
  const [scrollLeft, setScrollLeft] = useState<number>(0);

  const avatars = useMemo(() => [
    Avatar1, Avatar2, Avatar3, Avatar4, Avatar5, Avatar6, Avatar7, Avatar8, Avatar9, Avatar10,
  ], []);

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!avatarScrollRef.current) return;
    setIsDragging(true);
    setStartX(e.pageX - avatarScrollRef.current.offsetLeft);
    setScrollLeft(avatarScrollRef.current.scrollLeft);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging || !avatarScrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - avatarScrollRef.current.offsetLeft;
    const walk = (x - startX) * 2;
    avatarScrollRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleMouseUp = () => setIsDragging(false);

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!avatarScrollRef.current) return;
    setIsDragging(true);
    setStartX(e.touches[0].pageX - avatarScrollRef.current.offsetLeft);
    setScrollLeft(avatarScrollRef.current.scrollLeft);
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!isDragging || !avatarScrollRef.current) return;
    const x = e.touches[0].pageX - avatarScrollRef.current.offsetLeft;
    const walk = (x - startX) * 2;
    avatarScrollRef.current.scrollLeft = scrollLeft - walk;
  };

  useEffect(() => {
    const handleMouseUpGlobal = () => setIsDragging(false);
    document.addEventListener('mouseup', handleMouseUpGlobal);
    document.addEventListener('touchend', handleMouseUpGlobal);
    return () => {
      document.removeEventListener('mouseup', handleMouseUpGlobal);
      document.removeEventListener('touchend', handleMouseUpGlobal);
    };
  }, []);

  const handleAvatarSelect = (avatar: string) => setSelectedAvatar(avatar);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const profileData: ProfileData = {
        displayName,
        bio,
        location: locationState,
        avatar: selectedAvatar,
        stats: savedProfile.stats || {
          played: 0,
          wins: 0,
          losses: 0,
          totalPoints: 0,
          currentRank: 0,
        },
      };

      localStorage.setItem('userProfile', JSON.stringify(profileData));
      
      setIsLoading(false);
      navigate('/game-platform', { state: { fromProfileSetup: true } });
    } catch (err) {
      setIsLoading(false);
      const errorMessage = err instanceof Error ? err.message : 'Failed to save profile';
      setError(errorMessage);
    }
  };

  return (
    <div className="profile-setup-page">
      <div className="back-button-container">
        <button className="back-btn" onClick={() => navigate('/')}>
          <span className="back-arrow">←</span> 
          <span className="back-text">Back to home</span>
        </button>
      </div>
      
      <div className="profile-setup-container">
        <h2 className="profile-title">Set Up Your Profile</h2>
        <p className="profile-subtitle">Choose your avatar</p>
        
        <div className="selected-avatar-container">
          <img src={selectedAvatar} alt="Selected Avatar" className="selected-avatar" />
        </div>
        
        <div 
          ref={avatarScrollRef} 
          className="avatar-scroll-container"
          onMouseDown={handleMouseDown} 
          onMouseMove={handleMouseMove} 
          onMouseUp={handleMouseUp} 
          onMouseLeave={handleMouseUp} 
          onTouchStart={handleTouchStart} 
          onTouchMove={handleTouchMove} 
          onTouchEnd={handleMouseUp}
        >
          <div className="avatar-options">
            {avatars.map((avatar, index) => (
              <div 
                key={index} 
                onClick={() => handleAvatarSelect(avatar)} 
                className={`avatar-option ${selectedAvatar === avatar ? 'selected' : ''}`}
              >
                <img src={avatar} alt={`Avatar ${index + 1}`} className="avatar-image" />
                {selectedAvatar === avatar && <div className="avatar-indicator" />}
              </div>
            ))}
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="profile-form">
          {error && <div className="error-message">{error}</div>}
          
          <div className="form-group">
            <label className="form-label">DISPLAY NAME</label>
            <input 
              type="text" 
              value={displayName} 
              onChange={(e) => setDisplayName(e.target.value)} 
              className="form-input"
              placeholder="Claim your name"
              required 
            />
          </div>
          
          <div className="form-group">
            <label className="form-label">BIO</label>
            <textarea 
              value={bio} 
              onChange={(e) => setBio(e.target.value.slice(0, 60))} 
              className="form-input form-textarea"
              placeholder="Add a short vibe" 
            />
            <div className="char-count">Char limit: {bio.length}/60</div>
          </div>
          
          <div className="form-group">
            <label className="form-label">LOCATION (OPTIONAL)</label>
            <input 
              type="text" 
              value={locationState}
              onChange={(e) => {
                if (e.target) setLocation(e.target.value);
              }} 
              className="form-input"
              placeholder="e.g. Lagos, Nigeria" 
            />
          </div>
          
          <div className="button-container">
            <button 
              type="submit" 
              className="save-buttonx" 
              disabled={isLoading}
            >
              {isLoading ? 'Saving...' : 'Save and Continue'}
            </button>
            <button 
              type="button" 
              className="skip-button" 
              onClick={() => navigate('/game-platform')}
              disabled={isLoading}
            >
              Skip for now
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}