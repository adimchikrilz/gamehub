import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Score from '../assets/score.png'
import podium from '../assets/podium.png'
import Avatar1 from '../assets/avatar1.png'
import Timer from '../assets/timer.png'
import Choose from '../assets/choose.png'
import Coins from '../assets/coin.png'
import Genie from '../assets/genie.png'
import Trivia1 from '../assets/trivia1.png'




const HowToPlay: React.FC = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
  
    const instructions = [
      {
        title: 'How to play Genie',
        description: 'Answer fast. Score big. Climb higher. Genie is your fast track to trivia glory!',
        
      },
      {
        title: '',
        description: 'Each round starts with a timer and a question. The countdown is on!',
        image: Timer, // Placeholder path, replace with actual path
      },
      {
        title: 'Choose your answer quickly. Faster = more points and win big!',
        image: Trivia1, // Placeholder path, replace with actual path
      },
      {
        title: '',
        description: 'Right answers earn you coins. Beat the clock to earn bonus coins!',
        image: Coins, // Placeholder path, replace with actual path
      },
      {
        title: '',
        description: 'Rack up points. Climb the leaderboard. Be the trivia master!',
        image: podium, // Placeholder path, replace with actual path
      },
    ];
  
    const handleNext = () => {
      if (step < instructions.length) {
        setStep(step + 1);
      } else {
        navigate('/games/trivia-quiz'); // Navigate to the game start screen
      }
    };
  
    const currentInstruction = instructions[step - 1];
  
    return (
      <div className="how-to-play">
        <div className="trivia-header">
          <img
            src={Genie} // Placeholder path, replace with actual path
            alt="Genie Logo"
            style={{ height: '100px' }} // Adjust size as needed
          />
          <div className="game-stats">
            <img
              src={Score} // Placeholder path, replace with actual path
              alt="Coins Logo"
              style={{ height: '40px', marginLeft: '400px' }} // Adjust size and spacing
            />
            <img
              src={Avatar1} // Placeholder path, replace with actual path
              alt="Avatar Logo"
              style={{ height: '40px', borderRadius: '50%', marginLeft: "4px" }} // Adjust size, make circular
            />
          </div>
        </div>
  
        <div className="how-to-play-content">
          {currentInstruction.title && <h2>{currentInstruction.title}</h2>}
          <p>{currentInstruction.description}</p>
          <img
            src={currentInstruction.image}
            alt="Instruction Image"
            className="instruction-image"
          />
          <button className="next-button" onClick={handleNext}>
            {step === instructions.length ? 'Start Game' : 'Next'}
          </button>
        </div>
      </div>
    );
  };
  
  export default HowToPlay;