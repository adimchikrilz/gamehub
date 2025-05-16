import React from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/logo.png';
import './WelcomePage.css';

const WelcomePage = () => {
  const navigate = useNavigate();

  const handleSetupProfile = () => {
    navigate('/profile-setup');
  };

  return (
    <div className="welcome-page">
      <div className="welcome-content">
        <h1 className="welcome-title">Hello Gamer! Welcome to EightBit <img src={logo} alt="EightBit Logo" className="welcome-logo" /></h1>
        <p className="welcome-writeup">
          Get ready to dive into a world of thrilling challenges and endless fun! EightBit brings you instant games that test your skills, spark your creativity, and connect you with a global community of gamers. Whether you're flipping bits, solving puzzles, or battling it out, every moment is a chance to level up and make your mark. Let’s get started!
        </p>
        <button className="setup-button" onClick={handleSetupProfile}>
          Click to Set Up Your Profile
        </button>
      </div>
    </div>
  );
};

export default WelcomePage;