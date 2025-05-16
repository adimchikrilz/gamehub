import React, { useState, useEffect } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import './GamePlatform.css';
import { useAuth } from '../context/AuthContext';
import { playSound } from '../services/playSound';
import notificationSound from '../assets/audio/notification-sound.wav';

// Importing placeholder icons
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
import LeaderboardIcon from '../assets/leaderboard-icon.png';
import hamburgerIcon from '../assets/hamburger.png';

// Game images
import flutterbirdImage from '../assets/flutterbird.png';
import genieImage from '../assets/game7.png';
import flipbitImage from '../assets/game2.png';
import wordbitImage from '../assets/game1.png';
import angryBirdsImage from '../assets/game3.png';
import ginRummyImage from '../assets/game4.png';
import brawlArenaImage from '../assets/game9.png';
import briscolaImage from '../assets/game5.png';
import buddyBlitzImage from '../assets/game8.png';
import wordCookiesImage from '../assets/game6.png';

// Import flag and rank images
import nigeriaFlag from '../assets/flag-ng.png';
import rank1Image from '../assets/one.png';
import rank2Image from '../assets/two.png';
import rank3Image from '../assets/three.png';
import avatar2 from '../assets/avatar4.png';
import avatar3 from '../assets/avatar5.png';
import avatar4 from '../assets/avatar6.png';
import Image2 from '../assets/image2.png';

// Define interfaces for our component props and state
interface NotificationAction {
  type: 'play' | 'co-play' | 'welcome';
  game?: string;
  from?: string;
  response?: 'accept' | 'cancel';
  id?: number;
}

interface Notification {
  id: number;
  message: string;
  time: string;
  action: NotificationAction | null;
}

interface PlayerStats {
  played: number;
  wins: number;
  losses: number;
  totalPoints: number;
  currentRank: number;
}

interface Player {
  id: number;
  name: string;
  username: string;
  avatar: string;
  flag: string;
  rank: number;
  rankImage: string;
  stats: PlayerStats;
}

interface SidebarItem {
  name: string;
  icon: string;
  path?: string;
  isFriends?: boolean;
}

interface NotificationPanelProps {
  notifications: Notification[];
  onClose: () => void;
  onAction: (action: NotificationAction) => void;
}

interface NotificationPopupProps {
  message: string;
  onClick: () => void;
  onClose: () => void;
}

// Define game interfaces for search functionality
interface Game {
  id: number;
  name: string;
  image: string;
  description: string;
  type: 'current' | 'upcoming';
  onClick?: () => void;
}

// Notification Popup Component
const NotificationPopup: React.FC<NotificationPopupProps> = ({ message, onClick, onClose }) => {
  return (
    <div className="notification-popup">
      <p>{message}</p>
      <button onClick={onClick}>View</button>
      <button onClick={onClose} className="close-btn">×</button>
    </div>
  );
};

// Mobile Header Component
const MobileHeader: React.FC<{
  toggleMobileSidebar: () => void;
  toggleNotifications: () => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}> = ({ toggleMobileSidebar, toggleNotifications, searchQuery, setSearchQuery }) => {
  return (
    <div className="mobile-header">
      <div className="logo-container">
        <img src={logo} alt="Eightbit Logo" className="logo" />
        <span className="logo-text">EightBit</span>
      </div>
      
      <div className="header-actions">
        <div className="notification-icon" onClick={toggleNotifications}>
          <img src={notificationIcon} alt="Notifications" />
        </div>
        
        <button className="hamburger-toggle" onClick={toggleMobileSidebar}>
          <img src={hamburgerIcon} alt="Menu" />
        </button>
      </div>
    </div>
  );
};

// Mobile Sidebar Component
const MobileSidebar: React.FC<{
  isOpen: boolean;
  closeSidebar: () => void;
  sidebarItems: SidebarItem[];
  activeItem: string;
  setActiveItem: (name: string) => void;
  location: any;
}> = ({ isOpen, closeSidebar, sidebarItems, activeItem, setActiveItem, location }) => {
  return (
    <>
      <div 
        className={`sidebar-overlay ${isOpen ? 'active' : ''}`} 
        onClick={closeSidebar}
      ></div>
      
      <div className={`mobile-sidebar ${isOpen ? 'open' : ''}`}>
        <button className="mobile-sidebar-close" onClick={closeSidebar}>×</button>
        
        <div className="mobile-sidebar-menu">
          {sidebarItems.map(item => (
            <Link
              key={item.name || `item-${item.isFriends ? 'friends' : Math.random()}`}
              to={item.path ? `/game-platform/${item.path}` : '/game-platform'}
              className={`mobile-sidebar-item ${item.isFriends ? 'friends-item' : ''} ${
                activeItem === item.name || 
                (location.pathname === `/game-platform/${item.path}` && item.path) ? 'active' : ''}`}
              onClick={() => {
                setActiveItem(item.name);
                closeSidebar();
              }}
            >
              <img src={item.icon} alt={item.name} />
              <span>{item.name}</span>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
};

const NotificationPanel: React.FC<NotificationPanelProps> = ({ notifications, onClose, onAction }) => {
  return (
    <div className="notification-panels">
      <div className="notification-headers">
        <h2>Notifications</h2>
        <button className="close-buttons" onClick={onClose}>×</button>
      </div>
      <div className="notification-lists">
        {notifications.map((notif, index) => (
          <div className="notification-items" key={index}>
            <img src={logo} alt="Eightbit Logo" className="notification-icons" />
            <div className="notification-contents">
              <p className="notification-messages">{notif.message}</p>
              <p className="notification-times">{notif.time} ago</p>
              
              {notif.action && (
                <div className="notification-actionss">
                  {notif.action.type === 'play' && (
                    <button 
                      className="action-buttons" 
                      onClick={() => {
                        onAction({
                          type: 'play',
                          game: notif.action!.game!,
                          id: notif.id
                        });
                      }}
                    >
                      Play Now
                    </button>
                  )}
                  {notif.action.type === 'co-play' && notif.action.from && (
                    <>
                      <button 
                        className="action-buttons" 
                        onClick={() => {
                          onAction({
                            type: 'co-play',
                            game: notif.action!.game!,
                            from: notif.action!.from!,
                            response: 'accept',
                            id: notif.id
                          });
                        }}
                      >
                        Accept
                      </button>
                      <button 
                        className="action-buttons cancel" 
                        onClick={() => {
                          onAction({
                            type: 'co-play',
                            game: notif.action!.game!,
                            from: notif.action!.from!,
                            response: 'cancel',
                            id: notif.id
                          });
                        }}
                      >
                        Cancel
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// SearchResults component to display when there are search results
const SearchResults: React.FC<{
  players: Player[];
  games: Game[];
  query: string;
  onClearSearch: () => void;
  handleGameClick: (gameId: number) => void;
}> = ({ players, games, query, onClearSearch, handleGameClick }) => {
  const hasResults = players.length > 0 || games.length > 0;
  
  return (
    <div className="search-results-container">
      <div className="search-results-header">
        <h2>Search Results for "{query}"</h2>
        <button onClick={onClearSearch} className="clear-search-btn">Clear Search</button>
      </div>

      {!hasResults && (
        <div className="no-results">
          <p>No results found for "{query}". Try a different search term.</p>
        </div>
      )}

      {players.length > 0 && (
        <div className="search-section">
          <h3>Players</h3>
          <div className="players-container">
            {players.map(player => (
              <div className="player-card" key={player.id}>
                <div className="player-header">
                  <div className="player-info">
                    <div className="player-avatar">
                      <img src={player.avatar} alt={player.name} />
                    </div>
                    <div className="player-details">
                      <h3>
                        {player.name} 
                        <img src={player.flag} alt="Flag" className="player-flag-image" />
                      </h3>
                      <p className="player-username">Username: {player.username}</p>
                    </div>
                  </div>
                  <div className="player-badge">
                    <img src={player.rankImage} alt={`Rank ${player.rank}`} className="rank-image" />
                  </div>
                </div>
                
                <div className="player-stats">
                  <div className="stat">
                    <p className="stat-label">Played</p>
                    <p className="stat-value">{player.stats.played}</p>
                  </div>
                  <div className="stat">
                    <p className="stat-label">Wins</p>
                    <p className="stat-value">{player.stats.wins}</p>
                  </div>
                  <div className="stat">
                    <p className="stat-label">Losses</p>
                    <p className="stat-value">{player.stats.losses}</p>
                  </div>
                  <div className="stat">
                    <p className="stat-label">Total Points</p>
                    <p className="stat-value points">{player.stats.totalPoints}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {games.length > 0 && (
        <div className="search-section">
          <h3>Games</h3>
          <div className="games-search-results">
            {games.map(game => (
              <div 
                className="game-search-card" 
                key={game.id}
                onClick={() => handleGameClick(game.id)}
                style={{ cursor: 'pointer' }}
              >
                <img src={game.image} alt={game.name} className="game-search-image" />
                <div className="game-search-info">
                  <h4>{game.name}</h4>
                  <p>{game.description}</p>
                  <span className="game-type-badge">{game.type === 'current' ? 'Available Now' : 'Coming Soon'}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const GamePlatform: React.FC = () => {
  const { currentUser } = useAuth();
  const [isNotificationOpen, setIsNotificationOpen] = useState<boolean>(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);
  const [activeItem, setActiveItem] = useState<string>('Dashboard');
  const [isMobile, setIsMobile] = useState<boolean>(window.innerWidth < 768);
  const [showNotificationPopup, setShowNotificationPopup] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Define all games data for search functionality
  const allGames: Game[] = [
    {
      id: 1,
      name: 'Flutterbird',
      image: flutterbirdImage,
      description: 'Soar through challenging skies in Flutter Bird! Tap to fly, dodge obstacles, and see how far you can go in this addictive adventure.',
      type: 'upcoming'
    },
    {
      id: 2,
      name: 'Genie',
      image: genieImage,
      description: 'Test your knowledge and skills with the magical Genie game.',
      type: 'current',
      onClick: () => navigate('/games/trivia-quiz')
    },
    {
      id: 3,
      name: 'FlipBit',
      image: flipbitImage,
      description: 'Flip the bits and match the patterns in this mind-bending puzzle game.',
      type: 'current',
      onClick: () => navigate('/game-platform/flipbit')
    },
    {
      id: 4,
      name: 'WordBit',
      image: wordbitImage,
      description: 'Form words from letters and boost your vocabulary in this challenging word game.',
      type: 'current'
    },
    {
      id: 5,
      name: 'Angry Birds',
      image: angryBirdsImage,
      description: 'Launch birds to destroy structures and defeat the pigs in this physics-based action game.',
      type: 'upcoming'
    },
    {
      id: 6,
      name: 'Gin Rummy',
      image: ginRummyImage,
      description: 'Classic card game where you match cards to form sets and runs.',
      type: 'upcoming'
    },
    {
      id: 7,
      name: 'Brawl Arena',
      image: brawlArenaImage,
      description: 'Battle against other players in this fast-paced fighting game.',
      type: 'upcoming'
    },
    {
      id: 8,
      name: 'Briscola',
      image: briscolaImage,
      description: 'Traditional Italian card game that requires strategy and memory.',
      type: 'upcoming'
    },
    {
      id: 9,
      name: 'Buddy Blitz',
      image: buddyBlitzImage,
      description: 'Team up with friends to solve puzzles and complete challenges.',
      type: 'upcoming'
    },
    {
      id: 10,
      name: 'Word Cookies',
      image: wordCookiesImage,
      description: 'Swipe letters to form words and complete delicious word puzzles.',
      type: 'upcoming'
    }
  ];

  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: 1,
      message: 'EightBit Studio: Dive into the exciting world of Flipbit, now available! Explore new challenges and adventures.',
      time: '30m',
      action: { type: 'play', game: 'Flipbit' },
    },
    {
      id: 2,
      message: 'Adam Sans: Adam sans has invited you to play Battle Arena! Accept the invite and join the fun!',
      time: '20hrs',
      action: { type: 'co-play', game: 'Battle Arena', from: 'Adam Sans' },
    },
    {
      id: 3,
      message: 'Genie: New Achievements Unlocked! Test your skills and earn the latest achievements added to Genie Game. See what challenges await!',
      time: '1hr',
      action: { type: 'play', game: 'Genie' },
    },
    {
      id: 4,
      message: 'EightBit Studio: Our platform will undergo maintenance on 31 April 2025 at 3:30pm (CAT). Some features may be temporarily unavailable. We appreciate your patience!',
      time: '3months',
      action: null,
    },
    {
      id: 5,
      message: 'Susie Lane: Susie Lane sent you a friend request',
      time: '2days',
      action: null,
    },
  ]);

  const topPlayers: Player[] = [
    {
      id: 1,
      name: 'Susie Lane',
      username: 'camie4040',
      avatar: avatar4,
      flag: nigeriaFlag,
      rank: 1,
      rankImage: rank1Image,
      stats: { played: 327, wins: 294, losses: 34, totalPoints: 17473, currentRank: 1 },
    },
    {
      id: 2,
      name: 'Mark White',
      username: 'geeky32',
      avatar: avatar3,
      flag: nigeriaFlag,
      rank: 2,
      rankImage: rank2Image,
      stats: { played: 353, wins: 288, losses: 40, totalPoints: 16991, currentRank: 2 },
    },
    {
      id: 3,
      name: 'Kemi Stanley',
      username: 'sally999',
      avatar: avatar2,
      flag: nigeriaFlag,
      rank: 3,
      rankImage: rank3Image,
      stats: { played: 327, wins: 280, losses: 48, totalPoints: 15546, currentRank: 3 },
    },
  ];

  // Check for welcome back notification
  useEffect(() => {
    const welcomeNotification = localStorage.getItem('welcomeNotification');
    if (welcomeNotification) {
      const parsed = JSON.parse(welcomeNotification);
      setNotifications(prev => [...prev, parsed]);
      localStorage.removeItem('welcomeNotification');
    }
  }, []);

  // Check if user came from profile setup and trigger notification after 10 seconds
  useEffect(() => {
    if (location.state?.fromProfileSetup && currentUser?.displayName) {
      const timer = setTimeout(() => {
        playSound(notificationSound);
        setShowNotificationPopup(true);
      }, 10000); // 10 seconds

      return () => clearTimeout(timer);
    }
  }, [location.state, currentUser]);

  // Check if we're on mobile
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
        setIsMobileSidebarOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Search functionality
  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    const query = event.target.value;
    setSearchQuery(query);
    setIsSearching(query.trim() !== '');
  };

  const clearSearch = () => {
    setSearchQuery('');
    setIsSearching(false);
  };

  // Filter players and games based on search query
  const filteredPlayers = topPlayers.filter(player => {
    const searchLower = searchQuery.toLowerCase();
    return (
      player.name.toLowerCase().includes(searchLower) ||
      player.username.toLowerCase().includes(searchLower)
    );
  });

  const filteredGames = allGames.filter(game => {
    const searchLower = searchQuery.toLowerCase();
    return (
      game.name.toLowerCase().includes(searchLower) ||
      game.description.toLowerCase().includes(searchLower)
    );
  });

  const handleGameClick = (gameId: number) => {
    const game = allGames.find(g => g.id === gameId);
    if (game && game.onClick) {
      game.onClick();
    } else if (game && game.name === 'FlipBit') {
      navigate('/game-platform/flipbit');
    } else if (game && game.name === 'Genie') {
      navigate('/games/trivia-quiz');
    } else {
      console.log(`Clicked on game: ${game?.name}`);
    }
  };

  const handleNotificationAction = (action: NotificationAction) => {
    if (action.type === 'co-play' && action.response) {
      console.log(`Co-play ${action.response} for ${action.game} from ${action.from}`);
      setNotifications(notifications.filter(n => n.id !== action.id));
    } else if (action.type === 'play') {
      console.log(`Playing ${action.game}`);
    }
  };

  const handleNotificationClick = () => {
    setShowNotificationPopup(false);
    setIsNotificationOpen(true);
    if (currentUser?.displayName) {
      const welcomeMessage = location.state?.fromProfileSetup
        ? `Welcome to EightBit, ${currentUser.displayName}! Enjoy your experience.`
        : `Yoo! Welcome back, ${currentUser.displayName}!`;
      setNotifications(prev => [
        {
          id: Date.now(),
          message: welcomeMessage,
          time: 'Just now',
          action: { type: 'welcome' },
        },
        ...prev,
      ]);
    }
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };
  
  const toggleMobileSidebar = () => {
    setIsMobileSidebarOpen(!isMobileSidebarOpen);
  };

  const sidebarItems: SidebarItem[] = [
    { name: 'Dashboard', icon: homeIcon },
    { name: 'Categories', icon: gamesIcon, path: 'categories' },
    { name: 'Leaderboard', icon: feedIcon, path: 'leaderboard' },
    { name: 'Achievements', icon: LeaderboardIcon, path: 'achievements' },
    { name: 'Friends', icon: helpIcon, path: 'friends' },
    { name: '', icon: friendsIcon, isFriends: true },
    { name: 'Settings', icon: settingsIcon, path: 'settings' },
  ];

  const showDashboardContent = location.pathname === '/game-platform';

  // Handle FlipBit card click to navigate to the game route
  const handleFlipBitClick = () => {
    navigate('/game-platform/flipbit');
  };

  return (
    <div className="game-platform">
      {showNotificationPopup && (
        <NotificationPopup
          message="You have a notification"
          onClick={handleNotificationClick}
          onClose={() => setShowNotificationPopup(false)}
        />
      )}

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
            <Link
              key={item.name || `item-${item.isFriends ? 'friends' : Math.random()}`}
              to={item.path ? `/game-platform/${item.path}` : '/game-platform'}
              className={`sidebar-item ${item.isFriends ? 'friends-item' : ''} ${
                activeItem === item.name || 
                (location.pathname === `/game-platform/${item.path}` && item.path) ? 'active' : ''}`}
              onClick={() => setActiveItem(item.name)}
            >
              <img src={item.icon} alt={item.name} />
              {isSidebarOpen && <span>{item.name}</span>}
            </Link>
          ))}
        </div>
      </div>
      
      {isMobile && (
        <>
          <MobileHeader 
            toggleMobileSidebar={toggleMobileSidebar} 
            toggleNotifications={() => setIsNotificationOpen(!isNotificationOpen)}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
          />
          
          <MobileSidebar 
            isOpen={isMobileSidebarOpen}
            closeSidebar={() => setIsMobileSidebarOpen(false)}
            sidebarItems={sidebarItems}
            activeItem={activeItem}
            setActiveItem={setActiveItem}
            location={location}
          />
        </>
      )}
      
      <div className="main-content">
        {!isMobile && (
          <div className="header">
            <div className="header-center-container">
              <div className="search-container">
                <img src={searchIcon} alt="Search" className="search-icon" />
                <input 
                  type="text" 
                  placeholder="Search" 
                  className="search-input" 
                  value={searchQuery}
                  onChange={handleSearch}
                />
                {searchQuery && (
                  <button className="search-clear-btn" onClick={clearSearch}>
                    ×
                  </button>
                )}
              </div>
              <div className="header-actions">
                <div className="notification-icon" onClick={() => setIsNotificationOpen(!isNotificationOpen)}>
                  <img src={notificationIcon} alt="Notifications" />
                </div>
                <div className="profile-icon">
                  <Link to="/profile-page">
                    <img src={profileIcon} alt="Profile" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {isNotificationOpen && (
          <NotificationPanel
            notifications={notifications}
            onClose={() => setIsNotificationOpen(false)}
            onAction={handleNotificationAction}
          />
        )}
        
        {showDashboardContent ? (
          <>
            {isMobile && (
              <div className="search-container" style={{ margin: '10px auto 20px', width: '90%' }}>
                <img src={searchIcon} alt="Search" className="search-icon" />
                <input 
                  type="text" 
                  placeholder="Search" 
                  className="search-input"
                  value={searchQuery}
                  onChange={handleSearch}
                />
                {searchQuery && (
                  <button className="search-clear-btn" onClick={clearSearch}>
                    ×
                  </button>
                )}
              </div>
            )}

            {isSearching ? (
              <SearchResults 
                players={filteredPlayers}
                games={filteredGames}
                query={searchQuery}
                onClearSearch={clearSearch}
                handleGameClick={handleGameClick}
              />
            ) : (
              <>
                <div className="featured-game">
                  <div className="featured-game-content">
                    <div className="featured-game-info">
                      <div className="game-developer">Eightbit Presents!!</div>
                      <div className="game-text-block">
                        <h1 className="game-title-1">Flutterbird</h1>
                        <p className="game-description">
                          Soar through challenging skies in Flutter Bird! Tap to fly, dodge obstacles, and see how far you {!isMobile && <br/>}can go 
                          {!isMobile && 'in this addictive, high-flying adventure.'}
                          <span className="launching-soon">Launching soon!</span>
                        </p>
                      </div>
                      <div className="pagination-dots">
                        <span className="dot"></span>
                        <span className="dot active"></span>
                        <span className="dot"></span>
                      </div>
                    </div>
                    <div className="featured-game-image">
                      <img src={flutterbirdImage} alt="Flutterbird Game" className="bird-image" />
                      <img src={Image2} alt="Image2" className="bird-image2" />
                    </div>
                  </div>
                </div>
                
                <div className="top-players-section">
                  <div className="section-header">
                    <h2>Top 3 Global Players</h2>
                    <button className="view-all" onClick={() => console.log('View all clicked')}>
                      view all
                    </button>
                  </div>
                  
                  <div className="players-container">
                    {topPlayers.map(player => (
                      <div className="player-card" key={player.id}>
                        <div className="player-header">
                          <div className="player-info">
                            <div className="player-avatar">
                              <img src={player.avatar} alt={player.name} />
                            </div>
                            <div className="player-details">
                              <h3>
                                {player.name} 
                                <img src={player.flag} alt="Flag" className="player-flag-image" />
                              </h3>
                              <p className="player-username">Username: {player.username}</p>
                            </div>
                          </div>
                          <div className="player-badge">
                            <img src={player.rankImage} alt={`Rank ${player.rank}`} className="rank-image" />
                          </div>
                        </div>
                        
                        <div className="player-stats">
                          <div className="stat">
                            <p className="stat-label">Played</p>
                            <p className="stat-value">{player.stats.played}</p>
                          </div>
                          <div className="stat">
                            <p className="stat-label">Wins</p>
                            <p className="stat-value">{player.stats.wins}</p>
                          </div>
                          <div className="stat">
                            <p className="stat-label">Losses</p>
                            <p className="stat-value">{player.stats.losses}</p>
                          </div>
                          <div className="stat">
                            <p className="stat-label">Total Points</p>
                            <p className="stat-value points">{player.stats.totalPoints}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="games-section">
                  <h2 className="section-title">Games By Eightbit</h2>
                  
                  <div className="games-container">
                    <div className="game-card genie">
                      <a href="/games/trivia-quiz">
                        <img src={genieImage} alt="Genie Game" className="game-image" />
                      </a>
                    </div>
                    
                    <div className="game-card flipbit" onClick={handleFlipBitClick} style={{ cursor: 'pointer' }}>
                      <img src={flipbitImage} alt="FlipBit Game" className="game-image" />
                      <div className="flipbit-overlay">
                        <span className="flipbit-text">FlipBit</span>
                      </div>
                    </div>
                    
                    <div className="game-card wordbit">
                      <img src={wordbitImage} alt="Wordbit Game" className="game-image" />
                    </div>
                  </div>
                </div>
                
                <div className="upcoming-games-section">
                  <h2 className="section-title">Upcoming Games</h2>
                  
                  <div className="upcoming-games-grid">
                    <div className="row">
                      <div className="upcoming-game-card">
                        <img src={angryBirdsImage} alt="Angry Birds" className="upcoming-game-image" />
                      </div>
                      
                      <div className="upcoming-game-card">
                        <img src={ginRummyImage} alt="Gin Rummy" className="upcoming-game-image" />
                      </div>
                      
                      <div className="upcoming-game-card">
                        <img src={brawlArenaImage} alt="Brawl Arena" className="upcoming-game-image" />
                      </div>
                    </div>
                    
                    <div className="row">
                      <div className="upcoming-game-card">
                        <img src={briscolaImage} alt="Briscola" className="upcoming-game-image" />
                      </div>
                      
                      <div className="upcoming-game-card">
                        <img src={buddyBlitzImage} alt="Buddy Blitz" className="upcoming-game-image" />
                      </div>
                      
                      <div className="upcoming-game-card">
                        <img src={wordCookiesImage} alt="Word Cookies" className="upcoming-game-image" />
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </>
        ) : (
          <Outlet />
        )}
      </div>
    </div>
  );
};

export default GamePlatform;