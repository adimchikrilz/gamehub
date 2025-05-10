import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles.css';

// Import avatar images properly
import avatar1 from '../assets/avatar1.png';
import avatar2 from '../assets/avatar2.png';
import avatar3 from '../assets/avatar3.png';
import avatar4 from '../assets/avatar3.png';
import avatar5 from '../assets/avatar3.png';

const ProfileSetup: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser, updateProfile, loading, error: authError } = useAuth();

  // State for form fields
  const [formData, setFormData] = useState({
    displayName: '',
    bio: '',
    location: '',
    selectedAvatar: 0,
    favoriteGames: [] as string[]
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // List of avatar images using imported resources
  const avatars = [
    avatar1,
    avatar2,
    avatar3,
    avatar4,
    avatar5,
  ];

  const gameOptions = [
    'Platformer',
    'Puzzle',
    'Racing',
    'RPG',
    'Shooter',
    'Sports',
    'Strategy'
  ];

  // Pre-fill with username if available
  useEffect(() => {
    if (currentUser?.username) {
      setFormData(prev => ({
        ...prev,
        displayName: currentUser.username
      }));
    }
    
    // If user already has profile data, pre-fill the form
    if (currentUser?.displayName) {
      setFormData(prev => ({
        ...prev,
        displayName: currentUser.displayName || prev.displayName,
        bio: currentUser.bio || prev.bio,
        location: currentUser.location || prev.location,
        // Find avatar index if possible
        selectedAvatar: currentUser.avatar ? 
          avatars.findIndex(a => a === currentUser.avatar) > -1 ? 
            avatars.findIndex(a => a === currentUser.avatar) : 0 
          : 0,
        favoriteGames: currentUser.favoriteGames || []
      }));
    }
  }, [currentUser, avatars]);

  // If not logged in, redirect to login
  useEffect(() => {
    if (!loading && !currentUser) {
      navigate('/login');
    }
  }, [currentUser, navigate, loading]);

  // Handle avatar selection
  const handleAvatarSelect = (index: number) => {
    setFormData(prev => ({
      ...prev,
      selectedAvatar: index
    }));
  };

  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: value
    }));
  };

  // Handle game type toggle
  const handleGameToggle = (game: string) => {
    setFormData(prev => {
      const games = prev.favoriteGames.includes(game)
        ? prev.favoriteGames.filter(g => g !== game)
        : [...prev.favoriteGames, game];
      
      return {
        ...prev,
        favoriteGames: games
      };
    });
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    
    try {
      // Prepare profile data for update
      const profileData = {
        displayName: formData.displayName,
        bio: formData.bio,
        location: formData.location,
        avatar: avatars[formData.selectedAvatar],
        favoriteGames: formData.favoriteGames
      };
      
      // Use the updateProfile function from AuthContext
      await updateProfile(profileData);
      
      // Redirect to profile page after successful update
      navigate('/profile');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update profile');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle skip action
  const handleSkip = () => {
    navigate('/games'); 
  };

  // Handle back to home
  const handleBackToHome = () => {
    navigate('/');
  };

  // Calculate remaining characters for bio
  const bioCharLimit = 60;
  const remainingChars = bioCharLimit - formData.bio.length;

  // If still loading auth state, show loading
  if (loading) {
    return <div className="loading-container">Loading...</div>;
  }

  // If not logged in yet, this will be handled by the useEffect redirect

  return (
    <div className="profile-setup-page">
      <button className="back-to-home" onClick={handleBackToHome}>
        Back to home
      </button>
      <div className="profile-setup-container">
        <h2 className="profile-setup-title">Set Up Your Profile</h2>
        
        {(error || authError) && (
          <div className="error-message" style={{
            padding: '10px',
            marginBottom: '15px',
            backgroundColor: '#ffebee',
            color: '#d32f2f',
            borderRadius: '4px'
          }}>
            {error || authError}
          </div>
        )}
        
        <p className="profile-setup-subtitle">Choose your avatar</p>
        <div className="avatar-selection">
          {avatars.map((avatar, index) => (
            <div
              key={index}
              className={`avatar-option ${formData.selectedAvatar === index ? 'selected' : ''}`}
              onClick={() => handleAvatarSelect(index)}
              style={{
                width: '100px',
                height: '100px',
                border: '2px solid #ccc',
                borderRadius: '10px',
                overflow: 'hidden',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                margin: '1px',
                cursor: 'pointer',
                backgroundColor: formData.selectedAvatar === index ? '#e0e0e0' : 'transparent',
              }}
            >
              <img
                src={avatar}
                alt={`Avatar option ${index + 1}`}
                style={{
                  maxWidth: '100%',
                  maxHeight: '100%',
                  objectFit: 'cover',
                }}
              />
            </div>
          ))}
        </div>
        
        <form className="profile-form" onSubmit={handleSubmit}>
          <div className="profile-form-group">
            <label htmlFor="displayName">DISPLAY NAME</label>
            <input
              type="text"
              id="displayName"
              placeholder="Claim your name"
              value={formData.displayName}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="profile-form-group">
            <label htmlFor="bio">BIO</label>
            <textarea
              id="bio"
              placeholder="Add a short vibe"
              value={formData.bio}
              onChange={handleChange}
              maxLength={bioCharLimit}
            />
            <div className="char-limit">Char limit: {remainingChars}</div>
          </div>
          
          <div className="profile-form-group">
            <label htmlFor="location">LOCATION (OPTIONAL)</label>
            <input
              type="text"
              id="location"
              placeholder="Lagos, Nigeria."
              value={formData.location}
              onChange={handleChange}
            />
          </div>
          
          <div className="profile-form-group">
            <label>FAVORITE GAME TYPES</label>
            <div className="game-types-grid" style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
              gap: '10px',
              marginTop: '10px'
            }}>
              {gameOptions.map((game, index) => (
                <div 
                  key={index}
                  className={`game-option ${formData.favoriteGames.includes(game) ? 'selected' : ''}`}
                  onClick={() => handleGameToggle(game)}
                  style={{
                    padding: '8px 12px',
                    border: '1px solid #ccc',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    textAlign: 'center',
                    backgroundColor: formData.favoriteGames.includes(game) ? '#e0e0e0' : 'transparent',
                  }}
                >
                  {game}
                </div>
              ))}
            </div>
          </div>
          
          <div className="profile-actions">
            <button 
              type="submit" 
              className="save-btn"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : 'Save and Continue'}
            </button>
            <button 
              type="button" 
              className="skip-btn" 
              onClick={handleSkip}
            >
              Skip for now
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfileSetup;