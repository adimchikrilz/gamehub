import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles.css';
import soundIcon from '../assets/question-mark.png'; // Placeholder for sound icon
import playIcon from '../assets/play.png'; // Placeholder for play icon
import homeIcon from '../assets/home.png'; // Placeholder for home icon
import closeIcon from '../assets/close.png'; // Placeholder for close icon
import userIcon from '../assets/avatar.png'; // Placeholder for user icon

type SettingsPageProps = {
  onResume?: () => void;
  onQuit?: () => void;
  isMuted?: boolean;
  toggleMute?: () => void;
};

const SettingsPage: React.FC<SettingsPageProps> = ({ onResume, onQuit, isMuted, toggleMute }) => {
  // Local state for sound control when toggleMute is not provided
  const [localIsMuted, setLocalIsMuted] = useState(false);
  
  // Use local state if isMuted/toggleMute are not provided
  const effectiveIsMuted = isMuted !== undefined ? isMuted : localIsMuted;
  const effectiveToggleMute = toggleMute || (() => setLocalIsMuted((prev) => !prev));

  const [language, setLanguage] = useState('English (US)');
  const navigate = useNavigate();

  const handleClose = () => {
    handleResume();
  };

  // Default behavior for onResume: navigate to game platform
  const handleResume = onResume || (() => navigate('/game-platform'));

  // Default behavior for onQuit: navigate to the previous page
  const handleQuit = onQuit || (() => navigate(-1));

  return (
    <div className="settings-page">
      <div className="settings-overlays" onClick={handleClose}></div>
      <div className="settings-modals">
        <div className="settings-background">
          <div className="question-mark-decor"></div>
          <div className="question-mark-decor right"></div>
        </div>
        <div className="settings-header">
          <button className="close-btn" onClick={handleClose}>
            <img src={closeIcon} alt="Close" className="close-icon" />
          </button>
          {/* <div className="user-profile">
            <img src={userIcon} alt="User" className="user-icon" />
          </div> */}
        </div>
        <div className="settings-content">
          <button className="settings-btn" onClick={effectiveToggleMute}>
            <img src={soundIcon} alt="Sound" className="btn-icon" />
            {effectiveIsMuted ? 'Sound off' : 'Sound on'}
          </button>
          <button className="settings-btn" onClick={handleResume}>
            <img src={playIcon} alt="Play" className="btn-icon" />
            Resume
          </button>
          <button className="settings-btn" onClick={handleQuit}>
            <img src={homeIcon} alt="Home" className="btn-icon" />
            Quit
          </button>
          <div className="language-selector">
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="language-dropdown"
            >
              <option value="English (US)">English (US)</option>
              {/* Add more language options here if needed */}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;