import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './GamePlatform.css';
import './ProfilePage.css';
import logo from '../assets/logo.png';
import searchIcon from '../assets/search-icon.png';
import notificationIcon from '../assets/notification-icon.png';
import profileIcon from '../assets/profile-icon.png';
import homeIcon from '../assets/home2.png';
import gamesIcon from '../assets/games-icon.png';
import feedIcon from '../assets/feed-icon.png';
import friendsIcon from '../assets/friends-icon.png';
import helpIcon from '../assets/help-icon.png';
import settingsIcon from '../assets/settings-icon.png';
import Open from '../assets/open-icon.png';
import Close from '../assets/close-icon.png';
import genieImage from '../assets/game7.png';
import flipbitImage from '../assets/game2.png';
import wordbitImage from '../assets/game1.png';

interface Game {
  name: string;
  tagline: string;
  image: string;
  background: string;
}

interface PlayerStats {
  played: number;
  wins: number;
  losses: number;
  totalPoints: number;
  currentRank: number;
}

interface Setting {
  id: string;
  label: string;
  enabled: boolean;
}

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

const ProfilePage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [activeItem, setActiveItem] = useState<string>('Profile');

  // Get profile data from local storage
  const getSavedProfile = (): ProfileData => {
    const savedProfile = localStorage.getItem('userProfile');
    if (savedProfile) {
      return JSON.parse(savedProfile);
    }
    return {
      displayName: 'User',
      bio: 'Casual player, serious about good times. 😊',
      location: '',
      avatar: profileIcon,
      stats: {
        played: 0,
        wins: 0,
        losses: 0,
        totalPoints: 0,
        currentRank: 0,
      }
    };
  };
  
  const userProfile = getSavedProfile();
  
  const [playerStats, setPlayerStats] = useState<PlayerStats>(userProfile.stats);
  const [bio, setBio] = useState<string>(userProfile.bio);
  const [isEditingBio, setIsEditingBio] = useState<boolean>(false);
  const [tempBio, setTempBio] = useState<string>(userProfile.bio);
  const [profileImage, setProfileImage] = useState<string>(userProfile.avatar);
  const [recentlyPlayedGames, setRecentlyPlayedGames] = useState<Game[]>([
    { name: 'Wordbit', tagline: 'Think Fast. Spell Smart.', image: wordbitImage, background: '#F8E9D3' },
    { name: 'Genie', tagline: 'Trivia with a heartbeat!', image: genieImage, background: '#D3EEF8' },
    { name: 'FlipBit', tagline: 'See it, Flip it, Match it', image: flipbitImage, background: '#E3F7D9' },
  ]);
  const [favouriteGames, setFavouriteGames] = useState<Game[]>([]);
  const [activeTab, setActiveTab] = useState<'recently-played' | 'favourites'>('recently-played');
  const [privacySettings, setPrivacySettings] = useState<Setting[]>([
    { id: 'profile-visibility', label: 'Anyone can view my profile', enabled: true },
    { id: 'game-activities', label: 'Show my game activities to friends', enabled: true },
    { id: 'friends-list', label: 'Display my friends list', enabled: true },
  ]);
  const [communicationSettings, setCommunicationSettings] = useState<Setting[]>([
    { id: 'coop-requests', label: 'Anyone can send me co-play requests', enabled: true },
    { id: 'friend-requests', label: 'Allow friend requests', enabled: true },
  ]);
  const [notificationSettings, setNotificationSettings] = useState<Setting[]>([
    { id: 'coop-requests-notif', label: 'Co-play Requests', enabled: true },
    { id: 'game-invites', label: 'Game Invites', enabled: true },
    { id: 'game-updates', label: 'Game updates & Recommendations', enabled: true },
    { id: 'leaderboard', label: 'Leaderboard & Achievements', enabled: true },
    { id: 'platform-updates', label: 'Platform Updates', enabled: true },
  ]);
  const [friendCount, setFriendCount] = useState<number>(0);

  // Re-fetch profile data when component mounts
  useEffect(() => {
    const profile = getSavedProfile();
    setProfileImage(profile.avatar);
    setBio(profile.bio);
    setTempBio(profile.bio);
    setPlayerStats(profile.stats);
  }, []);

  const handleEditBio = () => {
    setIsEditingBio(true);
    setTempBio(bio);
  };

  const handleSaveBio = async () => {
    setBio(tempBio);
    setIsEditingBio(false);
    
    // Save updated bio to local storage
    const profile = getSavedProfile();
    profile.bio = tempBio;
    localStorage.setItem('userProfile', JSON.stringify(profile));
  };

  const handleCancelBio = () => {
    setIsEditingBio(false);
    setTempBio(bio);
  };

  const handleRemoveGame = (index: number) => {
    setRecentlyPlayedGames(recentlyPlayedGames.filter((_, i) => i !== index));
  };

  const handleToggleFavourite = (game: Game) => {
    if (favouriteGames.some((fav) => fav.name === game.name)) {
      setFavouriteGames(favouriteGames.filter((fav) => fav.name !== game.name));
    } else {
      setFavouriteGames([...favouriteGames, game]);
    }
  };

  const handleTogglePrivacy = (index: number, type: 'privacy' | 'communication' | 'notification') => {
    if (type === 'privacy') {
      const updatedSettings = [...privacySettings];
      updatedSettings[index].enabled = !updatedSettings[index].enabled;
      setPrivacySettings(updatedSettings);
    } else if (type === 'communication') {
      const updatedSettings = [...communicationSettings];
      updatedSettings[index].enabled = !updatedSettings[index].enabled;
      setCommunicationSettings(updatedSettings);
    } else if (type === 'notification') {
      const updatedSettings = [...notificationSettings];
      updatedSettings[index].enabled = !updatedSettings[index].enabled;
      setNotificationSettings(updatedSettings);
    }
  };

  const handleAddFriend = () => {
    setFriendCount(friendCount + 1);
  };

  const handleGameResult = (result: 'win' | 'loss', points: number) => {
    const updatedStats: PlayerStats = { ...playerStats };
    updatedStats.played += 1;
    if (result === 'win') {
      updatedStats.wins += 1;
      updatedStats.totalPoints += points;
      if (updatedStats.totalPoints >= 17000 && updatedStats.currentRank > 1) {
        updatedStats.currentRank -= 1;
      }
    } else {
      updatedStats.losses += 1;
      if (updatedStats.losses % 10 === 0) {
        updatedStats.currentRank += 1;
      }
    }
    setPlayerStats(updatedStats);
    
    // Save updated stats to local storage
    const profile = getSavedProfile();
    profile.stats = updatedStats;
    localStorage.setItem('userProfile', JSON.stringify(profile));
  };

  const handleImageChange = () => {
    const newImage = prompt('Enter new image URL (simulated):', profileImage);
    if (newImage) {
      setProfileImage(newImage);
      
      // Save updated avatar to local storage
      const profile = getSavedProfile();
      profile.avatar = newImage;
      localStorage.setItem('userProfile', JSON.stringify(profile));
    }
  };

  const handleGameClick = (gameName: string) => {
    if (gameName === 'Genie') {
      navigate('/games/trivia-quiz');
    } else if (gameName === 'Wordbit') {
      navigate('/wordbit');
    } else if (gameName === 'FlipBit') {
      navigate('/game-platform/flipbit');
    }
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const sidebarItems = [
    { name: 'Dashboard', icon: homeIcon, path: '' },
    { name: 'Categories', icon: gamesIcon, path: 'categories' },
    { name: 'Leaderboard', icon: feedIcon, path: 'leaderboard' },
    { name: 'Achievements', icon: profileIcon, path: 'achievements' }, // Changed to profileIcon as a placeholder
    { name: 'Friends', icon: helpIcon, path: 'friends' },
    { name: '', icon: friendsIcon, isFriends: true },
    { name: 'Settings', icon: settingsIcon, path: 'settings' },
  ];

  return (
    <div className="game-platform">
      <div className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <div className="logo-container">
          <img src={logo} alt="Eightbit Logo" className="logo" />
          <span className="logo-text">EightBit</span>
        </div>
        
        <button className="toggle-button" onClick={toggleSidebar}>
          <img src={isSidebarOpen ? Close : Open} alt={isSidebarOpen ? 'Close' : 'Open'} />
          <span>{isSidebarOpen ? '' : 'open'}</span>
        </button>
        
        <div className="sidebar-menu">
          {sidebarItems.map(item => (
            <a
              key={item.name || `item-${item.isFriends ? 'friends' : Math.random()}`}
              href={item.path ? `/game-platform/${item.path}` : '/game-platform'}
              className={`sidebar-item ${item.isFriends ? 'friends-item' : ''} ${
                activeItem === item.name || 
                (location.pathname === `/game-platform/${item.path}` && item.path) ? 'active' : ''}`}
              onClick={() => {
                setActiveItem(item.name);
                if (item.path) navigate(`/game-platform/${item.path}`);
                else navigate('/game-platform');
              }}
            >
              <img src={item.icon} alt={item.name} />
              {isSidebarOpen && <span>{item.name}</span>}
            </a>
          ))}
        </div>
      </div>
      
      <div className="main-content">
        <div className="header">
          <div className="header-center-container">
            <div className="search-container">
              <img src={searchIcon} alt="Search" className="search-icon" />
              <input type="text" placeholder="Search" className="search-input" />
            </div>
            <div className="header-actions">
              <div className="notification-icon">
                <img src={notificationIcon} alt="Notifications" />
              </div>
              <div className="profile-icon">
                <a href="/game-platform">
                  <img src={profileIcon} alt="Profile" />
                </a>
              </div>
            </div>
          </div>
        </div>
        <div className="profile-section">
          <div className="profile-header">
            <div className="profile-avatar-container">
              <div className="profile-avatar">
                <img src={profileImage} alt="Profile" />
                <div className="camera-icon" onClick={handleImageChange}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 16C14.2091 16 16 14.2091 16 12C16 9.79086 14.2091 8 12 8C9.79086 8 8 9.79086 8 12C8 14.2091 9.79086 16 12 16Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M3 16.8V9.2C3 8.0799 3 7.51984 3.21799 7.09202C3.40973 6.71569 3.71569 6.40973 4.09202 6.21799C4.51984 6 5.0799 6 6.2 6H7.25464C7.37758 6 7.43905 6 7.49576 5.9935C7.79166 5.95961 8.05705 5.79559 8.21969 5.54609C8.25086 5.49827 8.27836 5.44328 8.33333 5.33333C8.44329 5.11342 8.49827 5.00346 8.56062 4.90782C8.8859 4.40882 9.41668 4.08078 10.0085 4.01299C10.1219 4 10.2448 4 10.4907 4H13.5093C13.7552 4 13.8781 4 13.9915 4.01299C14.5833 4.08078 15.1141 4.40882 15.4394 4.90782C15.5017 5.00345 15.5567 5.11345 15.6667 5.33333C15.7216 5.44329 15.7491 5.49827 15.7803 5.54609C15.943 5.79559 16.2083 5.95961 16.5042 5.9935C16.561 6 16.6224 6 16.7454 6H17.8C18.9201 6 19.4802 6 19.908 6.21799C20.2843 6.40973 20.5903 6.71569 20.782 7.09202C21 7.51984 21 8.0799 21 9.2V16.8C21 17.9201 21 18.4802 20.782 18.908C20.5903 19.2843 20.2843 19.5903 19.908 19.782C19.4802 20 18.9201 20 17.8 20H6.2C5.0799 20 4.51984 20 4.09202 19.782C3.71569 19.5903 3.40973 19.2843 3.21799 18.908C3 18.4802 3 17.9201 3 16.8Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </div>
            </div>
            <div className="profile-info-box">
              <div className="profile-info">
                <h1 className="profile-name">{userProfile.displayName}</h1>
                <p className="profile-username">Location: {userProfile.location || 'Not specified'}</p>
              </div>
              <div className="profile-bio">
                <h2 className="section-subtitle">Bio</h2>
                <div className="bio-content">
                  {isEditingBio ? (
                    <>
                      <textarea value={tempBio} onChange={(e) => setTempBio(e.target.value)} className="bio-textarea" />
                      <div className="bio-edit-actions">
                        <button className="save-button" onClick={handleSaveBio}>Save</button>
                        <button className="cancel-button" onClick={handleCancelBio}>Cancel</button>
                      </div>
                    </>
                  ) : (
                    <>
                      <p>{bio}</p>
                      <button className="edit-link" onClick={handleEditBio}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M18.5 2.49998C18.8978 2.10216 19.4374 1.87866 20 1.87866C20.5626 1.87866 21.1022 2.10216 21.5 2.49998C21.8978 2.89781 22.1213 3.43737 22.1213 3.99998C22.1213 4.56259 21.8978 5.10216 21.5 5.49998L12 15L8 16L9 12L18.5 2.49998Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        Edit
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
          <div className="profile-content">
            <div className="profile-left-column">
              <div className="friends-section">
                <div className="section-header">
                  <h2>Friends <span className="friend-count">{friendCount}</span></h2>
                </div>
              </div>
              <div className="current-rank-section">
                <h2 className="section-subtitle">Current Rank</h2>
                <div className="rank-number">{playerStats.currentRank || 'N/A'}</div>
                <div className="stats-grid">
                  <div className="stat-column">
                    <p className="stat-label">Played</p>
                    <p className="stat-value">{playerStats.played}</p>
                  </div>
                  <div className="stat-column">
                    <p className="stat-label">Wins</p>
                    <p className="stat-value">{playerStats.wins}</p>
                  </div>
                  <div className="stat-column">
                    <p className="stat-label">Losses</p>
                    <p className="stat-value">{playerStats.losses}</p>
                  </div>
                  <div className="stat-column">
                    <p className="stat-label">Total Points</p>
                    <p className="stat-value points">{playerStats.totalPoints}</p>
                  </div>
                </div>
              </div>
              <div className="privacy-section">
                <div className="section-header">
                  <h2 className="settings-title">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="settings-icon">
                      <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M12 16V12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M12 8H12.01" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Privacy Settings
                  </h2>
                </div>
                <div className="settings-group">
                  <h3 className="settings-subtitle">Profile visibility</h3>
                  {privacySettings.map((setting, index) => (
                    <div className="setting-item" key={setting.id}>
                      <span className="setting-label">{setting.label}</span>
                      <label className="toggle-switch">
                        <input type="checkbox" checked={setting.enabled} onChange={() => handleTogglePrivacy(index, 'privacy')} />
                        <span className="slider"></span>
                      </label>
                    </div>
                  ))}
                </div>
                <div className="settings-group">
                  <h3 className="settings-subtitle">Communication</h3>
                  {communicationSettings.map((setting, index) => (
                    <div className="setting-item" key={setting.id}>
                      <span className="setting-label">{setting.label}</span>
                      <label className="toggle-switch">
                        <input type="checkbox" checked={setting.enabled} onChange={() => handleTogglePrivacy(index, 'communication')} />
                        <span className="slider"></span>
                      </label>
                    </div>
                  ))}
                </div>
              </div>
              <div className="notification-section">
                <div className="section-header">
                  <h2 className="settings-title">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="settings-icon">
                      <path d="M18 8C18 6.4087 17.3679 4.88258 16.2426 3.75736C15.1174 2.63214 13.5913 2 12 2C10.4087 2 8.88258 2.63214 7.75736 3.75736C6.63214 4.88258 6 6.4087 6 8C6 15 3 17 3 17H21C21 17 18 15 18 8Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M13.73 21C13.5542 21.3031 13.3019 21.5547 12.9982 21.7295C12.6946 21.9044 12.3504 21.9965 12 21.9965C11.6496 21.9965 11.3054 21.9044 11.0018 21.7295C10.6982 21.5547 10.4458 21.3031 10.27 21" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Notification Settings
                  </h2>
                </div>
                <div className="settings-group">
                  <h3 className="settings-subtitle">On Eightbit (While you're here)</h3>
                  {notificationSettings.map((setting, index) => (
                    <div className="setting-item" key={setting.id}>
                      <span className="setting-label">{setting.label}</span>
                      <label className="toggle-switch">
                        <input type="checkbox" checked={setting.enabled} onChange={() => handleTogglePrivacy(index, 'notification')} />
                        <span className="slider"></span>
                      </label>
                    </div>
                  ))}
                </div>
                <div className="settings-group dnd-setting">
                  <label className="radio-container">
                    <span className="radio-label">"Do Not Disturb" (silences all on-site notifications)</span>
                    <input type="radio" name="notification-mode" />
                    <span className="radio-checkmark"></span>
                  </label>
                </div>
              </div>
            </div>
            <div className="profile-right-column">
              <div className="my-games-section">
                <div className="section-header">
                  <h2 className="section-title">My Games</h2>
                </div>
                <div className="games-tabs">
                  <button className={`tab-button ${activeTab === 'recently-played' ? 'active' : ''}`} onClick={() => setActiveTab('recently-played')}>
                    Recently played
                  </button>
                  <button className={`tab-button ${activeTab === 'favourites' ? 'active' : ''}`} onClick={() => setActiveTab('favourites')}>
                    Favourites
                  </button>
                </div>
                <div className="my-games-grid">
                  {(activeTab === 'recently-played' ? recentlyPlayedGames : favouriteGames).map((game, index) => (
                    <div
                      className="my-game-card"
                      key={index}
                      style={{ backgroundColor: game.background }}
                      onClick={() => handleGameClick(game.name)}
                    >
                      <img src={game.image} alt={game.name} className="game-image" />
                      <button className="close-button" onClick={(e) => { e.stopPropagation(); handleRemoveGame(index); }}>×</button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;