import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Avatar from '../assets/gameAvatar.png';
import FlipbitLogo from '../assets/FlipBitLogo.png';
import Sticker from '../assets/sticker.png';
import './FlipBitGame.css'; // Using the provided CSS file name

function FlipBitGame() {
  const navigate = useNavigate();
  const [count, setCount] = useState(0);
  const [showModeSelection, setShowModeSelection] = useState(false); // State to toggle between screens

  // Handle button clicks
  const handlePlayClick = () => {
    setShowModeSelection(true); // Switch to mode selection screen
  };

  const handleTutorialClick = () => {
    console.log('Tutorial clicked'); // Placeholder: Implement tutorial logic or navigate
  };

  const handleLeaderboardClick = () => {
    navigate('/leaderboard'); // Navigate to leaderboard route
  };

  const handleSettingsClick = () => {
    navigate('/settings'); // Navigate to settings route
  };

  const handleExitClick = () => {
    navigate('/'); // Return to home or dashboard
  };

  // Handle mode selection
  const handleSinglePlayerClick = () => {
    navigate('/flipbit-single'); // Navigate to single player game (placeholder route)
  };

  const handleMultiplayerClick = () => {
    navigate('/flipbit-multi'); // Navigate to multiplayer game (placeholder route)
  };

  return (
    <>
      <div className="flipHeader">
        <div id="empty"></div>
        <div className="logoTXT">
          <img src={FlipbitLogo} alt="" className="flipbitLogo" />
        </div>
        <img src={Avatar} alt="" className="flipAvatar" />
      </div>
      <div className="flipContainer">
        {!showModeSelection ? (
          <div className="width">
            <div className="emptyLeft"></div>
            <div className="buttons">
              <button className="button playBTN" id="playBTN" onClick={handlePlayClick}>
                Play
              </button>
              <button className="button Tutorial" onClick={handleTutorialClick}>
                Tutorial
              </button>
              <button className="button Leaderboard" onClick={handleLeaderboardClick}>
                Leaderboard
              </button>
              <button className="button Settings" onClick={handleSettingsClick}>
                Settings
              </button>
              <button className="button Exit" onClick={handleExitClick}>
                Exit
              </button>
            </div>
            <div className="right">
              <img src={Sticker} alt="" className="sticker" />
            </div>
          </div>
        ) : (
          <div className="width">
            <div className="emptyLeft"></div>
            <div className="mode-selection">
              <h2 className="mode-title">Select Game Mode</h2>
              <div className="mode-buttons">
                <button className="mode-button single-player" onClick={handleSinglePlayerClick}>
                  Single Player
                </button>
                <button className="mode-button multiplayer" onClick={handleMultiplayerClick}>
                  Multiplayer
                </button>
              </div>
            </div>
            <div className="right">
              <img src={Sticker} alt="" className="sticker" />
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default FlipBitGame;