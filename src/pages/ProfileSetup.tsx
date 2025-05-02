import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles.css'; // Assuming styles.css is in the same directory or adjust the path accordingly

// Import avatar images properly
import avatar1 from '../assets/avatar1.png';
import avatar2 from '../assets/avatar2.png';
import avatar3 from '../assets/avatar3.png';
import avatar4 from '../assets/avatar3.png';
import avatar5 from '../assets/avatar3.png';

const ProfileSetup: React.FC = () => {
  const navigate = useNavigate();

  // State for form fields
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [location, setLocation] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState(0);

  // List of avatar images using imported resources
  const avatars = [
    avatar1,
    avatar2,
    avatar3,
    avatar4,
    avatar5,
  ];

  // Handle avatar selection
  const handleAvatarSelect = (index: number) => {
    setSelectedAvatar(index);
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Save profile data (e.g., to an API or local storage)
    const profileData = {
      displayName,
      bio,
      location,
      avatar: avatars[selectedAvatar],
    };
    console.log('Profile Data:', profileData); // Replace with actual save logic
    // Redirect to the main page (e.g., dashboard or home)
    navigate('/games'); // Adjust the route as needed
  };

  // Handle skip action
  const handleSkip = () => {
    // Redirect to the main page without saving
    navigate('/games'); // Adjust the route as needed
  };

  // Handle back to home
  const handleBackToHome = () => {
    navigate('/'); // Redirect to home page
  };

  // Calculate remaining characters for bio
  const bioCharLimit = 60;
  const remainingChars = bioCharLimit - bio.length;

  return (
    <div className="profile-setup-page">
      <button className="back-to-home" onClick={handleBackToHome}>
        Back to home
      </button>
      <div className="profile-setup-container">
        <h2 className="profile-setup-title">Set Up Your Profile</h2>
        <p className="profile-setup-subtitle">Choose your avatar</p>
        <div className="avatar-selection">
          {avatars.map((avatar, index) => (
            <div
              key={index}
              className={`avatar-option ${selectedAvatar === index ? 'selected' : ''}`}
              onClick={() => handleAvatarSelect(index)}
            >
              <img src={avatar} alt={`Avatar option ${index + 1}`} />
            </div>
          ))}
        </div>
        <form className="profile-form" onSubmit={handleSubmit}>
          <div className="profile-form-group">
            <label htmlFor="display-name">DISPLAY NAME</label>
            <input
              type="text"
              id="display-name"
              placeholder="Claim your name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              required
            />
          </div>
          <div className="profile-form-group">
            <label htmlFor="bio">BIO</label>
            <textarea
              id="bio"
              placeholder="Add a short vibe"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
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
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>
          <div className="profile-actions">
            <button type="submit" className="save-btn">
              Save and Continue
            </button>
            <button type="button" className="skip-btn" onClick={handleSkip}>
              Skip for now
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfileSetup;