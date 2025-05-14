import React, { useState } from 'react';
import './Achievements.css';

// Importing achievement images
import pathfinderImage from '../assets/p1.png';
import trailblazerImage from '../assets/p2.png';
import legendaryFinishImage from '../assets/pe.png';
import milestoneHunterImage from '../assets/p4.png';
import endgameHeroImage from '../assets/p5.png';
import quickfireAceImage from '../assets/quickfire-ace.png';
import coinCollectorImage from '../assets/coin-collector.png';
import leaderboardLegendImage from '../assets/leaderboard-legend.png';
import knowledgeNinjaImage from '../assets/knowledge-ninja.png';
import triviaExplorerImage from '../assets/trivia-explorer.png';

// Define interfaces for our component props and state
interface Achievement {
  id: number;
  name: string;
  description: string;
  image: string;
  progress: number;
  gameCategory: 'All' | 'Genie' | 'FlipBit' | 'Wordbit';
  isCompleted: boolean;
}

const Achievements: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState<'All' | 'Genie' | 'FlipBit' | 'Wordbit'>('All');

  // Mock data for in-progress achievements
  const inProgressAchievements: Achievement[] = [
    {
      id: 1,
      name: 'PATHFINDER',
      description: 'Complete the tutorial or first match',
      image: pathfinderImage, // Update with actual path
      progress: 10,
      gameCategory: 'All',
      isCompleted: false
    },
    {
      id: 2,
      name: 'TRAILBLAZER',
      description: 'Play 50 games on the platform',
      image: trailblazerImage, // Update with actual path
      progress: 10,
      gameCategory: 'All',
      isCompleted: false
    },
    {
      id: 3,
      name: 'LEGENDARY FINISH',
      description: 'Complete all achievement challenges',
      image: legendaryFinishImage, // Update with actual path
      progress: 10,
      gameCategory: 'All',
      isCompleted: false
    },
    {
      id: 4,
      name: 'MILESTONE HUNTER',
      description: 'Complete a game in each category/type',
      image:  milestoneHunterImage, // Update with actual path
      progress: 10,
      gameCategory: 'All',
      isCompleted: false
    },
    {
      id: 5,
      name: 'ENDGAME HERO',
      description: 'Win a final stage, boss level, or tournament',
      image: endgameHeroImage, // Update with actual path
      progress: 10,
      gameCategory: 'All',
      isCompleted: false
    }
  ];

  // Mock data for completed achievements
  const completedAchievements: Achievement[] = [
    {
      id: 6,
      name: 'QUICKFIRE ACE',
      description: 'Answered supper fast',
      image: coinCollectorImage, // Update with actual path
      progress: 100,
      gameCategory: 'All',
      isCompleted: true
    },
    {
      id: 7,
      name: 'COIN COLLECTOR',
      description: 'Collected a large stash of coins in one session',
      image: quickfireAceImage, // Update with actual path
      progress: 100,
      gameCategory: 'All',
      isCompleted: true
    },
    {
      id: 8,
      name: 'LEADERBOARD LEGEND',
      description: 'Ranked top 10 on the leaderboard',
      image: leaderboardLegendImage, // Update with actual path
      progress: 100,
      gameCategory: 'FlipBit',
      isCompleted: true
    },
    {
      id: 9,
      name: 'KNOWLEDGE NINJA',
      description: 'Complete a full game with 100% accuracy',
      image: knowledgeNinjaImage, // Update with actual path
      progress: 100,
      gameCategory: 'Genie',
      isCompleted: true
    },
    {
      id: 10,
      name: 'TRIVIA EXPLORER',
      description: 'Played across many categories',
      image: triviaExplorerImage, // Update with actual path
      progress: 100,
      gameCategory: 'All',
      isCompleted: true
    }
  ];

  // Filter achievements based on selected category
  const filteredInProgress = activeFilter === 'All' 
    ? inProgressAchievements 
    : inProgressAchievements.filter(achievement => achievement.gameCategory === activeFilter);

  const filteredCompleted = activeFilter === 'All' 
    ? completedAchievements 
    : completedAchievements.filter(achievement => achievement.gameCategory === activeFilter);

  return (
    <div className="achievements-container">
      <h1 className="achievements-heading">Achievements</h1>
      
      {/* Filter buttons */}
      <div className="filter-buttons">
        {['All', 'Genie', 'FlipBit', 'Wordbit'].map((filter) => (
          <button 
            key={filter}
            className={`filter-button ${activeFilter === filter ? 'active' : ''}`}
            onClick={() => setActiveFilter(filter as 'All' | 'Genie' | 'FlipBit' | 'Wordbit')}
          >
            {filter}
          </button>
        ))}
      </div>
      
      {/* In Progress Achievements Section */}
      {filteredInProgress.length > 0 && (
        <>
          <h2 className="section-heading">In Progress</h2>
          <div className="achievements-grid">
            {filteredInProgress.map((achievement) => (
              <div key={achievement.id} className="achievement-card">
                <div className="achievement-icon">
                  <img src={achievement.image} alt={achievement.name} />
                </div>
                <div className="achievement-info">
                  <h3 className="achievement-name">{achievement.name}</h3>
                  <p className="achievement-description">{achievement.description}</p>
                  <div className="progress-container">
                    <div 
                      className="progress-bar" 
                      style={{ width: `${achievement.progress}%` }}
                    ></div>
                    <span className="progress-text">{achievement.progress}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
      
      {/* Completed Achievements Section */}
      {filteredCompleted.length > 0 && (
        <>
          <h2 className="section-heading">Completed</h2>
          <div className="completed-achievements">
            {filteredCompleted.map((achievement) => (
              <div key={achievement.id} className="completed-achievement-card">
                <div className="achievement-content">
                  <div className="achievement-icon">
                    <img src={achievement.image} alt={achievement.name} />
                  </div>
                  <div className="achievement-details">
                    <h3 className="achievement-name">{achievement.name}</h3>
                    <p className="achievement-description">{achievement.description}</p>
                  </div>
                </div>
                <div className="checkmark-container">
                  <div className="checkmark-icon">✓</div>
                </div>
                <div className="completed-progress-bar">
                  <div className="completed-progress" style={{ width: '100%' }}></div>
                  <span className="completed-progress-text">100%</span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default Achievements;