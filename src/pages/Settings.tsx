import React, { useState, ChangeEvent, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import './Settings.css';

const Settings = () => {
  // Interface for user data
  interface UserData {
    name: string;
    email: string;
    password: string;
    location: string;
  }

  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [userData, setUserData] = useState<UserData>({
    name: 'Johnnie Doe',
    email: 'johnniedoe@gmail.com',
    password: 'password123',  // In a real app, you wouldn't store password in state
    location: 'Lagos, Nigeria'
  });
  const [formData, setFormData] = useState<UserData>({...userData});
  const [message, setMessage] = useState<string>('');

  const handleClose = () => {
    navigate('/game-platform');
  };

  const handleEditToggle = () => {
    if (isEditing) {
      // Cancel editing, revert to original data
      setFormData({...userData});
    }
    setIsEditing(!isEditing);
    setMessage('');
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSave = () => {
    // Validate data
    if (!formData.email || !formData.password || !formData.name || !formData.location) {
      setMessage('All fields are required');
      return;
    }
    
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setMessage('Please enter a valid email address');
      return;
    }

    // Save changes
    setUserData({...formData});
    setIsEditing(false);
    setMessage('Profile updated successfully!');
    
    // In a real app, you would send these changes to your backend
    console.log('Saved user data:', formData);
  };

  return (
    <div className="settings-overlay">
      <div className="settings-modal">
        <div className="settings-header">
          <h2>Account Settings</h2>
          <button className="closeing-btn" onClick={handleClose}>
            ✕
          </button>
        </div>
        {message && (
          <div className={`message ${message.includes('success') ? 'success' : 'error'}`}>
            {message}
          </div>
        )}
        <div className="settings-content">
          <div className="settings-field">
            <label>NAME</label>
            {isEditing ? (
              <input 
                type="text" 
                name="name"
                value={formData.name} 
                onChange={handleChange} 
              />
            ) : (
              <input type="text" value={userData.name} readOnly />
            )}
          </div>
          <div className="settings-field">
            <label>EMAIL</label>
            {isEditing ? (
              <input 
                type="email" 
                name="email"
                value={formData.email} 
                onChange={handleChange} 
              />
            ) : (
              <input type="text" value={userData.email} readOnly />
            )}
          </div>
          <div className="settings-field">
            <label>PASSWORD</label>
            {isEditing ? (
              <input 
                type="password" 
                name="password"
                value={formData.password} 
                onChange={handleChange} 
                placeholder="Enter new password"
              />
            ) : (
              <input type="password" value="••••••••" readOnly />
            )}
          </div>
          <div className="settings-field">
            <label>LOCATION</label>
            {isEditing ? (
              <input 
                type="text" 
                name="location"
                value={formData.location} 
                onChange={handleChange} 
              />
            ) : (
              <input type="text" value={userData.location} readOnly />
            )}
          </div>
          {isEditing ? (
            <div className="button-group">
              <button className="cancel-btn" onClick={handleEditToggle}>
                Cancel
              </button>
              <button className="save-btn" onClick={handleSave}>
                Save Changes
              </button>
            </div>
          ) : (
            <button className="edit-btn" onClick={handleEditToggle}>
              ✎ Edit
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;