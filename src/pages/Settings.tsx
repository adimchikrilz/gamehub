import React, { useState, useEffect, useRef } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import './Settings.css';

// Import icons - adjust paths based on your actual asset structure
import viewProfileIcon from '../assets/profiles-icon.png';
import accountSettingIcon from '../assets/settings-icon.png';
import logoutIcon from '../assets/logout-icon.png';
import editIcon from '../assets/edit-icon.png';
import eyeIcon from '../assets/eye-icon.png';

// Interface for profile data structure
interface ProfileData {
  displayName: string;
  email: string;
  password: string; // Note: In a real application, storing passwords in localStorage is insecure
  location: string;
  bio: string;
  avatar: string;
  stats: {
    played: number;
    wins: number;
    losses: number;
    totalPoints: number;
    currentRank: number;
  };
}

const SettingsPage: React.FC = () => {
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showAccountSettings, setShowAccountSettings] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [userData, setUserData] = useState<ProfileData>({
    displayName: '',
    email: '',
    password: '••••••', // Default password display
    location: '',
    bio: '',
    avatar: '',
    stats: {
      played: 0,
      wins: 0,
      losses: 0,
      totalPoints: 0,
      currentRank: 0,
    }
  });
  
  const [editData, setEditData] = useState({
    email: '',
    oldPassword: '',
    newPassword: '',
    location: '',
  });
  
  const settingsRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Get profile data from local storage
  const getSavedProfile = (): ProfileData => {
    const savedProfile = localStorage.getItem('userProfile');
    if (savedProfile) {
      const profile = JSON.parse(savedProfile);
      // Ensure password is masked for display
      return {
        ...profile,
        password: profile.password || '••••••'
      };
    }
    return {
      displayName: 'User',
      email: '',
      password: '••••••',
      location: '',
      bio: 'Casual player, serious about good times. 😊',
      avatar: '',
      stats: {
        played: 0,
        wins: 0,
        losses: 0,
        totalPoints: 0,
        currentRank: 0,
      }
    };
  };

  // Load user data on component mount
  useEffect(() => {
    const profile = getSavedProfile();
    setUserData(profile);
    setEditData({
      email: profile.email || '',
      oldPassword: '',
      newPassword: '',
      location: profile.location || '',
    });
  }, []);

  // Close modals when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (settingsRef.current && !settingsRef.current.contains(event.target as Node)) {
        setShowLogoutModal(false);
        setShowAccountSettings(false);
        setShowEditProfile(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    setShowLogoutModal(true);
  };

  const confirmLogout = () => {
    localStorage.removeItem('isLoggedIn');
    // Don't remove userProfile data on logout to preserve user settings
    navigate('/');
  };

  const cancelLogout = () => {
    setShowLogoutModal(false);
  };

  const openAccountSettings = () => {
    setShowAccountSettings(true);
  };

  const closeAccountSettings = () => {
    setShowAccountSettings(false);
  };

  const openEditProfile = () => {
    setShowEditProfile(true);
    setShowAccountSettings(false);
    setEditData({
      email: userData.email,
      oldPassword: '',
      newPassword: '',
      location: userData.location,
    });
  };

  const closeEditProfile = () => {
    setShowEditProfile(false);
    setShowAccountSettings(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditData({
      ...editData,
      [name]: value,
    });
  };

  const saveChanges = () => {
    // First get the current profile data
    const savedProfile = getSavedProfile();
    
    // Update with new values from the form
    const updatedProfile = {
      ...savedProfile,
      email: editData.email,
      location: editData.location,
    };
    
    // If a new password was provided, update it
    if (editData.newPassword) {
      updatedProfile.password = editData.newPassword;
    }
    
    // Save back to localStorage
    localStorage.setItem('userProfile', JSON.stringify(updatedProfile));
    
    // Update the local state
    setUserData({
      ...userData,
      email: editData.email,
      password: editData.newPassword ? '••••••' : userData.password,
      location: editData.location,
    });
    
    closeEditProfile();
  };

  return (
    <div className="settings-page-container" ref={settingsRef}>
      <div className="settings-panel">
        <button className="close-btn" onClick={() => navigate('/game-platform')}>×</button>
        <h3>Settings</h3>
        <div className="settings-item">
          <NavLink to="/profile-page" className="nav-link">
            <img src={viewProfileIcon} alt="View Profile" className="settings-icon" />
            <span>View Profile</span>
          </NavLink>
        </div>
        <div className="settings-item" onClick={openAccountSettings}>
          <img src={accountSettingIcon} alt="Account Settings" className="settings-icon" />
          <span>Account Setting</span>
        </div>
        <div className="settings-item logout" onClick={handleLogout}>
          <img src={logoutIcon} alt="Logout" className="settings-icon" />
          <span>Logout</span>
        </div>

        {/* Logout Confirmation Modal */}
        {showLogoutModal && (
          <div className="modal-overlay">
            <div className="logout-modal">
              <div className="modal-icon">!</div>
              <p className="modal-message">Are you sure you want to log out from your account?</p>
              <div className="modal-buttons">
                <button className="modal-button cancel" onClick={cancelLogout}>
                  Cancel
                </button>
                <button className="modal-button logout" onClick={confirmLogout}>
                  Log out
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Account Settings Modal */}
        {showAccountSettings && (
          <div className="modal-overlay">
            <div className="account-settings-modal">
              <div className="account-settings-header">
                <h2>Account Setting</h2>
                <button className="close-button" onClick={closeAccountSettings}>
                  ×
                </button>
              </div>
              <div className="account-settings-content">
                <div className="form-group">
                  <label>EMAIL</label>
                  <div className="input-readonly">{userData.email || 'Not set'}</div>
                </div>
                <div className="form-group">
                  <label>PASSWORD</label>
                  <div className="input-readonly password">
                    {userData.password}
                    <button className="eye-button">
                      <img src={eyeIcon} alt="Show Password" />
                    </button>
                  </div>
                </div>
                <div className="form-group">
                  <label>LOCATION</label>
                  <div className="input-readonly">{userData.location || 'Not set'}</div>
                </div>
                <div className="edit-button-container">
                  <button className="edit-button" onClick={openEditProfile}>
                    <img src={editIcon} alt="Edit" />
                    Edit
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Edit Profile Modal */}
        {showEditProfile && (
          <div className="modal-overlay">
            <div className="edit-profile-modal">
              <div className="edit-profile-header">
                <h2>Change your info</h2>
                <button className="back-button" onClick={closeEditProfile}>
                  x
                </button>
              </div>
              <div className="edit-profile-content">
                <div className="form-group">
                  <label>EMAIL</label>
                  <input
                    type="email"
                    name="email"
                    value={editData.email}
                    onChange={handleInputChange}
                    className="edit-input"
                  />
                </div>
                <div className="form-group">
                  <label>OLD PASSWORD</label>
                  <div className="password-input-container">
                    <input
                      type="password"
                      name="oldPassword"
                      value={editData.oldPassword}
                      onChange={handleInputChange}
                      className="edit-input password"
                    />
                    <button className="eye-button">
                      <img src={eyeIcon} alt="Show Password" />
                    </button>
                  </div>
                </div>
                <div className="form-group">
                  <label>NEW PASSWORD</label>
                  <div className="password-input-container">
                    <input
                      type="password"
                      name="newPassword"
                      value={editData.newPassword}
                      onChange={handleInputChange}
                      className="edit-input password"
                    />
                    <button className="eye-button">
                      <img src={eyeIcon} alt="Show Password" />
                    </button>
                  </div>
                </div>
                <div className="form-group">
                  <label>LOCATION</label>
                  <input
                    type="text"
                    name="location"
                    value={editData.location}
                    onChange={handleInputChange}
                    className="edit-input"
                  />
                </div>
                <div className="change-button-container">
                  <button className="change-button" onClick={saveChanges}>
                    Change
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SettingsPage;