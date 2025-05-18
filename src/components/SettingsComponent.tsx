import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './SettingsComponent.css';

// Import icons - adjust paths based on your actual asset structure
import viewProfileIcon from '../assets/profile-icon.png';
import accountSettingIcon from '../assets/settings-icon.png';
import logoutIcon from '../assets/logout-icon.png';
import editIcon from '../assets/edit-icon.png';
import eyeIcon from '../assets/eye-icon.png';

// Define TypeScript interfaces for the state
interface UserData {
  email: string;
  password: string;
  location: string;
}

interface EditData {
  email: string;
  oldPassword: string;
  newPassword: string;
  location: string;
}

const Settings: React.FC = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [showLogoutModal, setShowLogoutModal] = useState<boolean>(false);
  const [showAccountSettings, setShowAccountSettings] = useState<boolean>(false);
  const [showEditProfile, setShowEditProfile] = useState<boolean>(false);
  const [userData, setUserData] = useState<UserData>({
    email: 'johnniepdoe@gmail.com',
    password: '••••••',
    location: 'Lagos, Nigeria',
  });
  const [editData, setEditData] = useState<EditData>({
    email: userData.email,
    oldPassword: '',
    newPassword: '',
    location: userData.location,
  });
  
  // Properly type the ref
  const settingsRef = useRef<HTMLDivElement | null>(null);
  const navigate = useNavigate();

  // Close dropdown/modal when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent): void => {
      if (settingsRef.current && !settingsRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const toggleSettings = (): void => {
    setIsOpen(!isOpen);
  };

  const handleLogout = (): void => {
    setShowLogoutModal(true);
    setIsOpen(false);
  };

  const confirmLogout = (): void => {
    // Clear user data from local storage
    localStorage.removeItem('userProfile');
    localStorage.removeItem('isLoggedIn');
    
    // Redirect to landing page
    navigate('/');
  };

  const cancelLogout = (): void => {
    setShowLogoutModal(false);
  };

  const openAccountSettings = (): void => {
    setShowAccountSettings(true);
    setIsOpen(false);
  };

  const closeAccountSettings = (): void => {
    setShowAccountSettings(false);
  };

  const openEditProfile = (): void => {
    setShowEditProfile(true);
    setShowAccountSettings(false);
    setEditData({
      email: userData.email,
      oldPassword: '',
      newPassword: '',
      location: userData.location,
    });
  };

  const closeEditProfile = (): void => {
    setShowEditProfile(false);
    setShowAccountSettings(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    setEditData({
      ...editData,
      [name]: value,
    });
  };

  const saveChanges = (): void => {
    // Update the user data
    setUserData({
      ...userData,
      email: editData.email,
      password: editData.newPassword || userData.password,
      location: editData.location,
    });
    
    // In a real app, you would also update this in your backend/database
    // For now, we can store in localStorage for persistence
    const savedProfile = JSON.parse(localStorage.getItem('userProfile') || '{}');
    localStorage.setItem('userProfile', JSON.stringify({
      ...savedProfile,
      email: editData.email,
      location: editData.location,
    }));
    
    closeEditProfile();
  };

  const handleViewProfile = (): void => {
    navigate('/profile-page');
    setIsOpen(false);
  };

  return (
    <div className="settings-container" ref={settingsRef}>
      {/* Settings Icon/Button */}
      <div className="settings-icon" onClick={toggleSettings}>
        {/* You can use your existing settings icon here */}
      </div>

      {/* Settings Dropdown */}
      {isOpen && (
        <div className="settings-dropdown">
          <div className="settings-item" onClick={handleViewProfile}>
            <img src={viewProfileIcon} alt="Profile" />
            <span>View Profile</span>
          </div>
          <div className="settings-item" onClick={openAccountSettings}>
            <img src={accountSettingIcon} alt="Settings" />
            <span>Account Setting</span>
          </div>
          <div className="settings-item logout" onClick={handleLogout}>
            <img src={logoutIcon} alt="Logout" />
            <span>Log out</span>
          </div>
        </div>
      )}

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
                <div className="input-readonly">{userData.email}</div>
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
                <label></label>
                <div className="input-readonly">{userData.location}</div>
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
                &lt;
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
  );
};

export default Settings;