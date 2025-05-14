import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Leaderboard.css';

// Import placeholder images for flags and rankings
// You should replace these with your actual imports
import nigeriaFlag from '../assets/flag-ng.png';
import usaFlag from '../assets/flag-us.png';
import ukFlag from '../assets/flag-us.png';
import saFlag from '../assets/flag-sa.png';
import argentinaFlag from '../assets/flag-sa.png';
import englandFlag from '../assets/flag-eg.png';
import ivoryCoastFlag from '../assets/flag-iv.png';

import rank1Image from '../assets/one.png';
import rank2Image from '../assets/two.png';
import rank3Image from '../assets/three.png';

// Import avatar images
import avatar1 from '../assets/avatar7.png';
import avatar2 from '../assets/avatar4.png';  
import avatar3 from '../assets/avatar5.png';
import avatar4 from '../assets/avatar6.png';
import profileIcon from '../assets/profile-icon.png';

const Leaderboard = () => {
  const [activeTab, setActiveTab] = useState('Global');
  
  // Define players data for Global leaderboard
  const globalPlayers = [
    {
      id: 1,
      name: 'Susie Lane',
      username: 'camie4040',
      avatar: avatar1,
      flag: nigeriaFlag,
      rank: 1,
      rankImage: rank1Image,
      nationality: '🇳🇬',
      stats: { played: 327, wins: 294, losses: 34, totalPoints: 17473 },
    },
    {
      id: 2,
      name: 'Cameron White',
      username: 'smoothsurfer',
      avatar: avatar2,
      flag: ukFlag,
      rank: 2,
      rankImage: rank2Image,
      nationality: '🇬🇧',
      stats: { played: 353, wins: 288, losses: 40, totalPoints: 16991 },
    },
    {
      id: 3,
      name: 'Sentry Norman',
      username: 'seenoevil42',
      avatar: avatar3,
      flag: usaFlag,
      rank: 3,
      rankImage: rank3Image,
      nationality: '🇺🇸',
      stats: { played: 327, wins: 280, losses: 48, totalPoints: 15546 },
    },
  ];

  // Define players data for National leaderboard
  const nationalPlayers = [
    {
      id: 1,
      name: 'Susie Lane',
      username: 'camie4040',
      avatar: avatar1,
      flag: nigeriaFlag,
      rank: 1,
      rankImage: rank1Image,
      nationality: '🇳🇬',
      stats: { played: 327, wins: 294, losses: 34, totalPoints: 17473 },
    },
    {
      id: 2,
      name: 'Mark White',
      username: 'geeky32',
      avatar: avatar2,
      flag: nigeriaFlag,
      rank: 2,
      rankImage: rank2Image,
      nationality: '🇳🇬',
      stats: { played: 353, wins: 288, losses: 40, totalPoints: 16991 },
    },
    {
      id: 3,
      name: 'Kemi Stanley',
      username: 'sally999',
      avatar: avatar3,
      flag: nigeriaFlag,
      rank: 3,
      rankImage: rank3Image,
      nationality: '🇳🇬',
      stats: { played: 327, wins: 280, losses: 48, totalPoints: 15546 },
    },
  ];

  // Select appropriate player list based on active tab
  const topPlayers = activeTab === 'Global' ? globalPlayers : nationalPlayers;

  // Additional players for the table
  const additionalPlayers = [
    { place: 4, name: activeTab === 'Global' ? 'B.A.T' : 'John Doe', nationality: nigeriaFlag, played: 321, wins: 275, losses: 55, points: 15250 },
    { place: 5, name: activeTab === 'Global' ? 'Kendrick Lamar' : 'Main Character (You)', nationality: activeTab === 'Global' ? usaFlag : nigeriaFlag, played: 321, wins: 275, losses: 55, points: 15250, highlight: activeTab === 'National' },
    { place: 6, name: activeTab === 'Global' ? 'Trevor Noah' : 'John Doe', nationality: activeTab === 'Global' ? saFlag : nigeriaFlag, played: 321, wins: 275, losses: 55, points: 15250 },
    { place: 7, name: activeTab === 'Global' ? 'Main Character (You)' : 'John Doe', nationality: nigeriaFlag, played: 321, wins: 275, losses: 55, points: 15250, highlight: activeTab === 'Global' },
    { place: 8, name: activeTab === 'Global' ? 'Jermaine Cole' : 'John Doe', nationality: activeTab === 'Global' ? usaFlag : nigeriaFlag, played: 321, wins: 275, losses: 55, points: 15250 },
    { place: 9, name: activeTab === 'Global' ? 'Didier Drogba' : 'John Doe', nationality: activeTab === 'Global' ? ivoryCoastFlag : nigeriaFlag, played: 321, wins: 275, losses: 55, points: 15250 },
    { place: 10, name: activeTab === 'Global' ? 'Burna Boy' : 'John Doe', nationality: nigeriaFlag, played: 321, wins: 275, losses: 55, points: 15250 },
    { place: 11, name: activeTab === 'Global' ? 'Lionel Messi' : 'John Doe', nationality: activeTab === 'Global' ? argentinaFlag : nigeriaFlag, played: 321, wins: 275, losses: 55, points: 15250 },
    { place: 12, name: activeTab === 'Global' ? 'Cole Palmer' : 'John Doe', nationality: activeTab === 'Global' ? englandFlag : nigeriaFlag, played: 321, wins: 275, losses: 55, points: 15250 },
    { place: 13, name: activeTab === 'Global' ? 'Young Sheldon' : 'John Doe', nationality: activeTab === 'Global' ? usaFlag : nigeriaFlag, played: 321, wins: 275, losses: 55, points: 15250 },
  ];

  return (
    <div className="leaderboard-container">
      <h1 className="leaderboard-title">Leaderboard</h1>
      
      {/* Tab selector */}
      <div className="leaderboard-tabs">
        <button 
          className={`tab-button ${activeTab === 'Global' ? 'active' : ''}`}
          onClick={() => setActiveTab('Global')}
        >
          Global
        </button>
        <button 
          className={`tab-button ${activeTab === 'National' ? 'active' : ''}`}
          onClick={() => setActiveTab('National')}
        >
          National
        </button>
      </div>
      
      {/* Top 3 Players */}
      <div className="top-players-grid">
        {topPlayers.map(player => (
          <div className="player-cards" key={player.id}>
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
      
      {/* Leaderboard Table */}
      <div className="leaderboard-table">
        <div className="table-header">
          <div className="place-header">Place</div>
          <div className="player-name-header">Player Name</div>
          <div className="nationality-header">Nationality</div>
          <div className="games-played-header">Games Played</div>
          <div className="wins-header">Wins</div>
          <div className="losses-header">Losses</div>
          <div className="total-points-header">Total Points</div>
        </div>
        
        {/* Table Rows */}
        {additionalPlayers.map(player => (
          <div 
            key={player.place}
            className={`table-row ${player.highlight ? 'highlighted-row' : ''}`}
          >
            <div className="place-cell">{player.place}</div>
            <div className="player-name-cell">{player.name}</div>
            <div className="nationality-cell">
              <img src={player.nationality} alt="National flag" className="nationality-flag" />
            </div>
            <div className="games-played-cell">{player.played}</div>
            <div className="wins-cell">{player.wins}</div>
            <div className="losses-cell">{player.losses}</div>
            <div className="total-points-cell">{player.points}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Leaderboard;