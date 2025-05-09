import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import '../styles.css';
import Logo from '../assets/logo.png';
import { FaTachometerAlt, FaList, FaTrophy, FaMedal, FaUsers, FaCog } from 'react-icons/fa';

// Placeholder images for games and categories
import game1 from '../assets/game1.png';
import game2 from '../assets/game2.png';
import game3 from '../assets/game3.png';
import triviaIcon from '../assets/game4.png';
import cardsIcon from '../assets/game5.png';
import puzzlesIcon from '../assets/game6.png';

const StudioPage = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="studio-page">
      {/* Sidebar */}
      <div className={`sidebar ${isSidebarOpen ? 'sidebar-open' : ''}`}>
        <div className="sidebar-header">
          <img src={Logo} alt="EightBit Logo" className="sidebar-logo" />
          <span className="sidebar-logo-text">EightBit</span>
        </div>
        <div className="sidebar-nav">
          <Link
            to="/dashboard"
            className={`sidebar-link ${location.pathname === '/dashboard' ? 'active' : ''}`}
            onClick={() => setIsSidebarOpen(false)}
          >
            <FaTachometerAlt className="sidebar-icon" />
            Dashboard
          </Link>
          <Link
            to="/categories"
            className={`sidebar-link ${location.pathname === '/categories' ? 'active' : ''}`}
            onClick={() => setIsSidebarOpen(false)}
          >
            <FaList className="sidebar-icon" />
            Categories
          </Link>
          <Link
            to="/leaderboard"
            className={`sidebar-link ${location.pathname === '/leaderboard' ? 'active' : ''}`}
            onClick={() => setIsSidebarOpen(false)}
          >
            <FaTrophy className="sidebar-icon" />
            Leaderboard
          </Link>
          <Link
            to="/achievements"
            className={`sidebar-link ${location.pathname === '/achievements' ? 'active' : ''}`}
            onClick={() => setIsSidebarOpen(false)}
          >
            <FaMedal className="sidebar-icon" />
            Achievements
          </Link>
          <Link
            to="/friends"
            className={`sidebar-link ${location.pathname === '/friends' ? 'active' : ''}`}
            onClick={() => setIsSidebarOpen(false)}
          >
            <FaUsers className="sidebar-icon" />
            Friends
          </Link>
          <Link
            to="/settings"
            className={`sidebar-link ${location.pathname === '/settings' ? 'active' : ''}`}
            onClick={() => setIsSidebarOpen(false)}
          >
            <FaCog className="sidebar-icon" />
            Settings
          </Link>
        </div>
      </div>

      {/* Hamburger Menu for Mobile */}
      <div className="hamburger-menu" onClick={toggleSidebar}>
        <span className="hamburger-icon">☰</span>
      </div>

      {/* Main Content */}
      <div className="studio-content">
        {/* Header Section */}
        <section className="studio-header-section">
          <svg
            className="studio-header-bg"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 1440 400"
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id="header-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" style={{ stopColor: "#1a1a1a" }} />
                <stop offset="100%" style={{ stopColor: "#2a2a2a" }} />
              </linearGradient>
            </defs>
            <path d="M0,0 L1440,0 L1440,400 L0,400 L0,0 Z" fill="url(#header-gradient)" />
            <path d="M0,0 L1440,0 L1440,100 C1080,180 360,180 0,100 L0,0 Z" fill="url(#header-gradient)" />
          </svg>
          <div className="studio-header-content">
            <h1>EightBit Studio</h1>
            <p>Your ultimate destination for instant casual gaming fun.</p>
          </div>
        </section>

        {/* Featured Games Section */}
        <section className="featured-games-section">
          <div className="featured-games-container">
            <h2 className="section-title">Featured <span>Games</span></h2>
            <div className="games-grid">
              <div className="game-card">
                <img src={game1} alt="Game 1" className="game-image" />
                <h3 className="game-title">Trivia Challenge</h3>
                <p className="game-description">Test your knowledge with exciting trivia questions!</p>
                <Link to="/trivia">
                  <button className="play-btn">Play Now</button>
                </Link>
              </div>
              <div className="game-card">
                <img src={game2} alt="Game 2" className="game-image" />
                <h3 className="game-title">Card Match</h3>
                <p className="game-description">Match cards and win big rewards!</p>
                <Link to="/card-match">
                  <button className="play-btn">Play Now</button>
                </Link>
              </div>
              <div className="game-card">
                <img src={game3} alt="Game 3" className="game-image" />
                <h3 className="game-title">Puzzle Quest</h3>
                <p className="game-description">Solve challenging puzzles to advance!</p>
                <Link to="/puzzle-quest">
                  <button className="play-btn">Play Now</button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Game Categories Section */}
        <section className="game-categories-section">
          <svg
            className="game-categories-bg"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 1440 800"
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id="categories-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" style={{ stopColor: "#1a1a1a" }} />
                <stop offset="100%" style={{ stopColor: "#2a2a2a" }} />
              </linearGradient>
            </defs>
            <path d="M0,0 L1440,0 L1440,800 L0,800 L0,0 Z" fill="url(#categories-gradient)" />
          </svg>
          <div className="game-categories-container">
            <h2 className="section-title">Game <span>Categories</span></h2>
            <div className="categories-grid">
              <div className="category-card">
                <img src={triviaIcon} alt="Trivia Icon" className="category-icon" />
                <h3 className="category-title">Trivia</h3>
                <p className="category-description">150 games to test your knowledge!</p>
              </div>
              <div className="category-card">
                <img src={cardsIcon} alt="Cards Icon" className="category-icon" />
                <h3 className="category-title">Cards</h3>
                <p className="category-description">9 games for strategic fun!</p>
              </div>
              <div className="category-card">
                <img src={puzzlesIcon} alt="Puzzles Icon" className="category-icon" />
                <h3 className="category-title">Puzzles</h3>
                <p className="category-description">Challenge your mind with puzzles!</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default StudioPage;