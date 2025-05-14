import React from 'react';
import { Link } from 'react-router-dom';
import gamepadImage from '../assets/gamepad.png'; // Import the image
import '../styles.css';
import Flagng from '../assets/flag-ng.png'
import Flageg from '../assets/flag-eg.png'
import Flagiv from '../assets/flag-iv.png'
import Flagus from '../assets/flag-us.png'
import Flagsa from '../assets/flag-sa.png'
import Excite from '../assets/excite.png'
import Leader from '../assets/leaders.png'
import Super from '../assets/leader.png'
import Logo from '../assets/logo.png'
import { FaXTwitter, FaFacebook, FaInstagram } from 'react-icons/fa6';
import game1 from '../assets/game7.png';
import game2 from '../assets/game2.png';
import game3 from '../assets/game1.png';
import game4 from '../assets/game7.png';
import game5 from '../assets/game2.png';
import game6 from '../assets/game1.png';


const LandingPage = () => {
  return (
    <div className="landing-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content-wrapper">
          <div className="hero-content">
            <h1>
              Welcome to <br />EightBit Studio
            </h1>
            <h2>
              Your <span>digital arcade</span>!
              <br />
              A curated space where casual games are just a click away.
              <br />
              Bits of fun. Instant Games.
            </h2>
            <Link to="/login">
              <button className="play-now-btn">Play Now</button>
            </Link>
          </div>
          <div className="gamepad-container">
            <img src={gamepadImage} alt="Gamepad" className="gamepad-img" />
          </div>
        </div>
      </section>

      {/* Core Features Section */}
      <section className="core-features-section">
        {/* SVG for curved background */}
        <svg 
          className="core-features-curved-bg" 
          xmlns="http://www.w3.org/2000/svg" 
          viewBox="0 0 1440 800" 
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" style={{stopColor: "#1a1a1a"}} />
              <stop offset="100%" style={{stopColor: "#2a2a2a"}} />
            </linearGradient>
          </defs>
          <path d="M0,0 L1440,0 L1440,800 L0,800 L0,0 Z" fill="url(#gradient)" />
          <path d="M0,0 L1440,0 L1440,100 C1080,180 360,180 0,100 L0,0 Z" fill="url(#gradient)" />
        </svg>
        
        <div className="core-features-container">
          <h2 className="core-features-title">Core Features</h2>
          <div className="core-features-grid">
            {/* Leaderboards */}
            <div className="feature-card feature-card-beige">
              <span className="feature-icon" role="img" aria-label="trophy">
              <img src={Leader} alt="US Flag" className="excite" />
              </span>
              <h3 className="feature-title">Leaderboards</h3>
              <p className="feature-descriptions">Compete. Conquer. Celebrate.</p>
            </div>
            {/* Exciting */}
            <div className="feature-card feature-card-red feature-card-elevated">
              <span className="feature-icon" role="img" aria-label="target">
              <img src={Excite} alt="US Flag" className="excite" />
              </span>
              <h3 className="feature-title">Exciting</h3>
              <p className="feature-description">Over 100 Engaging Games!</p>
            </div>
            {/* Super Fast */}
            <div className="feature-card feature-card-beige">
              <span className="feature-icon" role="img" aria-label="lightning">
              <img src={Super} alt="US Flag" className="excite" />
              </span>
              <h3 className="feature-title">Super Fast</h3>
              <p className="feature-descriptions">Instant Games at Your Fingertips</p>
            </div>
          </div>
        </div>
      </section>

      {/* Upcoming Games Section */}
      <section className="upcoming-games-section">
        {/* SVG for background */}
        <svg 
          className="upcoming-games-bg" 
          xmlns="http://www.w3.org/2000/svg" 
          viewBox="0 0 1440 800" 
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="upcoming-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" style={{stopColor: "#1a1a1a"}} />
              <stop offset="100%" style={{stopColor: "#2a2a2a"}} />
            </linearGradient>
          </defs>
          <path d="M0,0 L1440,0 L1440,800 L0,800 L0,0 Z" fill="url(#upcoming-gradient)" />
        </svg>

        <div className="upcoming-games-container">
          <h2 className="upcoming-games-title">Upcoming <span>Games</span></h2>
          
          {/* Category Highlights */}
          <div className="category-highlights">
            <div className="category-card">
              <h3 className="category-title">Trivia</h3>
              <p className="category-description">150 games heartbeat!</p>
            </div>
            <div className="category-cartar">
              <h3 className="category-title">Cards</h3>
              <p className="category-description">9 games Annotation</p>
            </div>
            <div className="category-cartar">
              <h3 className="category-title">Puzzles</h3>
              <p className="category-description">Trivia with heartbeat!</p>
            </div>
          </div>

          {/* Game Previews Grid */}
          <div className="game-previews-grid">
            <div className="game-preview-card">
              <img src={game1} alt="Game 1" className="game-images" />
              
            </div>
            <div className="game-preview-card">
              <img src={game2} alt="Game 2" className="game-images" />
              
            </div>
            <div className="game-preview-card">
              <img src={game3} alt="Game 3" className="game-images" />
              
            </div>
            <div className="game-preview-card">
              <img src={game4} alt="Game 4" className="game-images" />
              
            </div>
            <div className="game-preview-card">
              <img src={game5} alt="Game 5" className="game-images" />
              
            </div>
            <div className="game-preview-card">
              <img src={game6} alt="Game 6" className="game-images" />
              
            </div>
          </div>

          {/* See All Button */}
          <Link to="/upcoming-games">
            <button className="see-all-btn">See All</button>
          </Link>
        </div>
      </section>

      {/* Leaderboard Section */}
      <section className="leaderboard-section">
        {/* SVG for curved background */}
        <svg 
          className="leaderboard-bg" 
          xmlns="http://www.w3.org/2000/svg" 
          viewBox="0 0 1440 800" 
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="leaderboard-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" style={{stopColor: "#1a1a1a"}} />
              <stop offset="100%" style={{stopColor: "#2a2a2a"}} />
            </linearGradient>
          </defs>
          <path d="M0,0 L1440,0 L1440,800 L0,800 L0,0 Z" fill="url(#leaderboard-gradient)" />
          <path d="M0,0 L1440,0 L1440,100 C1080,180 360,180 0,100 L0,0 Z" fill="url(#leaderboard-gradient)" />
        </svg>

        <div className="leaderboard-container">
          <h2 className="leaderboard-title">Leaderboard
          <p className='leaderboard-player-name'>Join the Leaderboard</p>
          </h2>
          
          <div className="top-players">
            <div className="player-card">
              <div className="player-avatar2"></div>
              <span className="player-rank2"></span>
              <span className="player-name">Player Two</span>
              <span className="player-id-text">Player ID: 00264</span>
              <span className="player-score-text">1,850</span>
            </div>
            <div className="player-card">
              <div className="player-avatar"></div>
              <span className="player-rank"></span>
              <span className="player-name">Franny</span>
              <span className="player-id-text">Player ID: 00365</span>
              <span className="player-score-text">2,300</span>
            </div>
            <div className="player-card">
              <div className="player-avatar1"></div>
              <span className="player-rank3"></span>
              <span className="player-name">BizyB</span>
              <span className="player-id-text">Player ID: 36543</span>
              <span className="player-score-text">1,500</span>
            </div>
          </div>
          <div className="leaderboard-table">
            <div className="leaderboard-row">
              <span className="leaderboard-rank">4</span>
              <div className="leaderboard-player">
                
                <span className="leaderboard-player-name">B.A.T</span>
                
              </div>
              <div className="leaderboard-stats">
              <img src={Flagng} alt="US Flag" className="leaderboard-flag" />
                <span className="leaderboard-stat">12</span>
              </div>
              <span className="leaderboard-total">2,300</span>
              <span className="leaderboard-stat">14,200</span>
            </div>
            <div className="leaderboard-row">
              <span className="leaderboard-rank">5</span>
              <div className="leaderboard-player">
                
                <span className="leaderboard-player-name">Izyyd</span>
              </div>
              <div className="leaderboard-stats">
              <img src={Flagus} alt="US Flag" className="leaderboard-flag" />
                <span className="leaderboard-stat">10</span>
              </div>
              <span className="leaderboard-total">1,850</span>
              <span className="leaderboard-stat">13,300</span>
            </div>
            <div className="leaderboard-row">
              <span className="leaderboard-rank">6</span>
              <div className="leaderboard-player">
                
                <span className="leaderboard-player-name">PandaPea</span>
              </div>
              <div className="leaderboard-stats">
              <img src={Flagsa} alt="US Flag" className="leaderboard-flag" />
                <span className="leaderboard-stat">8</span>
              </div>
              <span className="leaderboard-total">1,500</span>
              <span className="leaderboard-stat">12,500</span>
            </div>
            <div className="leaderboard-row">
              <span className="leaderboard-rank">7</span>
              <div className="leaderboard-player">
                
                <span className="leaderboard-player-name">Deigny</span>
              </div>
              <div className="leaderboard-stats">
              <img src={Flagiv} alt="US Flag" className="leaderboard-flag" />
                <span className="leaderboard-stat">7</span>
              </div>
              <span className="leaderboard-total">1,200</span>
              <span className="leaderboard-stat">10,200</span>
            </div>
            <div className="leaderboard-row">
              <span className="leaderboard-rank">8</span>
              <div className="leaderboard-player">
            
                <span className="leaderboard-player-name">Xhenat</span>
              </div>
              <div className="leaderboard-stats">
              <img src={Flageg} alt="US Flag" className="leaderboard-flag" />
                <span className="leaderboard-stat">5</span>
              </div>
              <span className="leaderboard-total">900</span>
              <span className="leaderboard-stat">5,787</span>
            </div>
          </div>
        </div>
      </section>

      {/* About EightBit Section */}
      <section className="about-eightbit-section">
        <svg 
          className="about-eightbit-bg" 
          xmlns="http://www.w3.org/2000/svg" 
          viewBox="0 0 1440 800" 
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="about-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" style={{stopColor: "#1a1a1a"}} />
              <stop offset="100%" style={{stopColor: "#2a2a2a"}} />
            </linearGradient>
          </defs>
          <path d="M0,0 L1440,0 L1440,800 L0,800 L0,0 Z" fill="url(#about-gradient)" />
        </svg>

        <div className="about-eightbit-container">
          <h2 className="about-eightbit-title">About <span>EightBit</span></h2>
          <p className="about-eightbit-description">
            EightBit is your ultimate casual gaming home, a seamless platform where you can jump into diverse games, track your progress, compete with friends, and celebrate every win. With effortless navigation, rich stats, and a vibrant community, EightBit makes gaming intuitive, inclusive, and endlessly fun.
          </p>
          <div className="about-eightbit-stats">
            <div className="stat-card">
              <span className="stat-value">12,856</span>
              <span className="stat-label">Players</span>
            </div>
            <div className="stat-card">
              <span className="stat-value">304</span>
              <span className="stat-label">New games monthly</span>
            </div>
            <div className="stat-card">
              <span className="stat-value">2,652</span>
              <span className="stat-label">Players today</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer Section */}
      <footer className="footer-section">
        <div className="footer-container">
          <div className="footer-top">
            <div className="footer-logo">
              <span className="footer-logo-icon"><span role="img" aria-label="gamepad"><img src={Logo} alt="US Flag" className="leaderboard-flag" /></span></span>
              <span className="footer-logo-text">EightBit</span>
            </div>
          
              <div className="social-links">
                <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="social-link" aria-label="Twitter">
                  <span className="social-icon"><FaXTwitter /></span>
                </a>
                <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="social-link" aria-label="Facebook">
                  <span className="social-icon"><FaFacebook /></span>
                </a>
                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="social-link" aria-label="Instagram">
                  <span className="social-icon"><FaInstagram /></span>
                </a>
              </div>
          </div>
          <div className="footer-divider"></div>
          <div className="footer-content">
            <div className="footer-left">
              <div className="footer-links">
                <Link to="/" className="footer-link">Home</Link>
                <Link to="/studio" className="footer-link">Studio</Link>
                <Link to="/about" className="footer-link">About</Link>
              </div>
            </div>
            <div className="footer-right">
              <div className="newsletter">
                <h3 className="newsletter-title">Stay in the loop</h3>
                <p className="newsletter-description">Subscribe to our newsletter updates</p>
                <div className="newsletter-form">
                  <input 
                    type="email" 
                    placeholder="Enter email address" 
                    className="newsletter-input" 
                    aria-label="Email address for newsletter subscription"
                  />
                  <button className="newsletter-btn">Subscribe</button>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <p className="footer-copyright">©2025 EightBit Studio. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;