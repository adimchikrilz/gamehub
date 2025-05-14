import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Settings.css';

const Settings = () => {
  const navigate = useNavigate();

  const handleClose = () => {
    navigate('/game-platform');
  };

  return (
    <div className="settings-overlay">
      <div className="settings-modal">
        <div className="settings-header">
          <h2>Account Setting</h2>
          <button className="close-btn" onClick={handleClose}>
            ✕
          </button>
        </div>
        <div className="settings-content">
          <div className="settings-field">
            <label>EMAIL</label>
            <input type="text" value="johnniedoe@gmail.com" readOnly />
          </div>
          <div className="settings-field">
            <label>PASSWORD</label>
            <input type="password" value="••••••••" readOnly />
            <span className="visibility-toggle">👁️</span>
          </div>
          <div className="settings-field">
            <label>LOCATION</label>
            <input type="text" value="Lagos, Nigeria" readOnly />
          </div>
          <button className="edit-btn">✎ Edit</button>
        </div>
      </div>
    </div>
  );
};

export default Settings;