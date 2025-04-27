import React, { useState, useEffect, useRef } from 'react';
import { useAccount, useWriteContract } from 'wagmi';
import { parseEther } from 'viem';
import io from 'socket.io-client';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import '../styles.css';

// Audio imports
import arcadeBg from '../assets/audio/arcade-loop.wav';
import cardFlipSound from '../assets/audio/card-flip.ogg';
import matchVictorySound from '../assets/audio/match-victory.wav';
import gameOverSound from '../assets/audio/game-over.wav';

// Update based on your deployment environment
const SOCKET_URL = process.env.NODE_ENV === 'production' 
  ? 'https://gamehub-nlju.onrender.com' 
  : 'http://localhost:3001';

const socket = io(SOCKET_URL);

const REWARD_CONTRACT_ADDRESS = '0xYourContractAddressHere'; // Replace with deployed Sepolia address
const REWARD_ABI = [
  {
    name: 'buyTime',
    type: 'function',
    inputs: [{ name: 'coins', type: 'uint256' }],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    name: 'rewardPlayer',
    type: 'function',
    inputs: [{ name: 'amount', type: 'uint256' }],
    outputs: [],
    stateMutability: 'nonpayable',
  },
];

// Card themes
const CARD_THEMES = {
  classic: {
    cards: [
      { value: 'A♠', display: 'A♠' },
      { value: 'K♠', display: 'K♠' },
      { value: 'A♥', display: 'A♥' },
      { value: 'K♥', display: 'K♥' },
      { value: 'A♣', display: 'A♣' },
      { value: 'K♣', display: 'K♣' },
      { value: 'A♦', display: 'A♦' },
      { value: 'K♦', display: 'K♦' },
    ],
    backDesign: '?'
  },
  emoji: {
    cards: [
      { value: 'smile', display: '😊' },
      { value: 'laugh', display: '😂' },
      { value: 'heart', display: '❤️' },
      { value: 'fire', display: '🔥' },
      { value: 'unicorn', display: '🦄' },
      { value: 'rocket', display: '🚀' },
      { value: 'star', display: '⭐' },
      { value: 'moon', display: '🌙' },
    ],
    backDesign: '❓'
  },
  animals: {
    cards: [
      { value: 'cat', display: '🐱' },
      { value: 'dog', display: '🐶' },
      { value: 'owl', display: '🦉' },
      { value: 'fox', display: '🦊' },
      { value: 'panda', display: '🐼' },
      { value: 'lion', display: '🦁' },
      { value: 'tiger', display: '🐯' },
      { value: 'penguin', display: '🐧' },
    ],
    backDesign: '🐾'
  }
};

// Difficulty levels
const DIFFICULTY_LEVELS = {
  easy: {
    pairCount: 8,
    initialTime: 120,
    matchPoints: 10,
    specialCardChance: 0.1,
  },
  medium: {
    pairCount: 12,
    initialTime: 90,
    matchPoints: 15,
    specialCardChance: 0.15,
  },
  hard: {
    pairCount: 16,
    initialTime: 60,
    matchPoints: 20,
    specialCardChance: 0.2,
  }
};

// Types
type Theme = keyof typeof CARD_THEMES;
type Difficulty = keyof typeof DIFFICULTY_LEVELS;

interface Card {
  id: number;
  value: string;
  display: string;
  matched: boolean;
  isSpecial: boolean;
}

interface PlayerState {
  score: number;
  timer: number;
}

interface Result {
  id: string;
  score: number;
}

// Generate initial cards based on theme and difficulty
const generateCards = (theme: Theme, difficulty: Difficulty): Card[] => {
  const themeCards = CARD_THEMES[theme].cards;
  const pairCount = DIFFICULTY_LEVELS[difficulty].pairCount;
  const neededPairs = Math.min(pairCount, themeCards.length);
  
  const selectedCards = themeCards.slice(0, neededPairs);
  
  // Create pairs and assign IDs
  const cardPairs = selectedCards.flatMap((card: { value: string; display: string }, index: number) => [
    { id: index * 2 + 1, value: card.value, display: card.display, matched: false, isSpecial: Math.random() < DIFFICULTY_LEVELS[difficulty].specialCardChance },
    { id: index * 2 + 2, value: card.value, display: card.display, matched: false, isSpecial: false } // Only one card in pair can be special
  ]);
  
  return cardPairs;
};

// Shuffle cards
const shuffleCards = (cards: Card[]): Card[] => {
  return [...cards].sort(() => Math.random() - 0.5);
};

const CardGame = () => {
  const { address } = useAccount();
  const { writeContract } = useWriteContract();
  
  // Game setup states
  const [mode, setMode] = useState<'select' | 'single' | 'multi'>('select');
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [theme, setTheme] = useState<Theme>('classic');
  const [roomCode, setRoomCode] = useState<string>('');
  const [inputRoomCode, setInputRoomCode] = useState<string>('');
  
  // Game state
  const [cards, setCards] = useState<Card[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [matchedPairsCount, setMatchedPairsCount] = useState<number>(0);
  const [disabled, setDisabled] = useState<boolean>(false);
  const [gameResult, setGameResult] = useState<'win' | 'loss' | null>(null);
  const [gameStarted, setGameStarted] = useState<boolean>(false);
  const [playerState, setPlayerState] = useState<PlayerState | null>(null);
  const [results, setResults] = useState<Result[]>([]);
  const [coins, setCoins] = useState<number>(100);
  const [message, setMessage] = useState<string>('');
  const [messageType, setMessageType] = useState<'success' | 'error' | 'warning' | 'info' | ''>('');
  const [waitingForPlayers, setWaitingForPlayers] = useState<boolean>(false);
  const [playerCount, setPlayerCount] = useState<number>(1);
  const [leaderboard, setLeaderboard] = useState<Result[]>([]);
  const [specialCardActive, setSpecialCardActive] = useState<boolean>(false);
  const [specialEffect, setSpecialEffect] = useState<string>('');
  const [isMuted, setIsMuted] = useState<boolean>(false);
  
  // References
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const confettiRef = useRef<HTMLDivElement | null>(null);
  const bgMusicRef = useRef(new Audio(arcadeBg));
  const flipSoundRef = useRef(new Audio(cardFlipSound));
  const matchSoundRef = useRef(new Audio(matchVictorySound));
  const gameOverSoundRef = useRef(new Audio(gameOverSound));
  
  // Background music control
  useEffect(() => {
    bgMusicRef.current.loop = true;
    bgMusicRef.current.volume = 0.3;
    if (gameStarted && !gameResult && !isMuted) {
      bgMusicRef.current.play().catch((e) => console.error('BG Music Error:', e));
    } else {
      bgMusicRef.current.pause();
    }
    return () => {
      bgMusicRef.current.pause();
    };
  }, [gameStarted, gameResult, isMuted]);
  
  // Setup game environment
  useEffect(() => {
    if (gameStarted && !gameResult) {
      const initialCards = generateCards(theme, difficulty);
      setCards(shuffleCards(initialCards));
      setFlippedCards([]);
      setMatchedPairsCount(0);
      setSpecialCardActive(false);
      setSpecialEffect('');
      
      if (mode === 'single') {
        setPlayerState({
          score: 0,
          timer: DIFFICULTY_LEVELS[difficulty].initialTime
        });
      }
    }
  }, [gameStarted, theme, difficulty, mode, gameResult]);
  
  // Socket.IO for multiplayer
  useEffect(() => {
    if (mode === 'multi') {
      socket.on('roomCreated', (roomId: string) => {
        console.log(`Room created: ${roomId}`);
        setRoomCode(roomId);
        setWaitingForPlayers(true);
        setMessage(`Room created! Share code: ${roomId}`);
        setMessageType('success');
      });

      socket.on('joinedRoom', (roomId: string) => {
        console.log(`Joined room: ${roomId}`);
        setRoomCode(roomId);
        setWaitingForPlayers(true);
        setMessage(`Joined room: ${roomId}. Waiting for host to start...`);
        setMessageType('info');
      });

      socket.on('playerCount', (count: number) => {
        console.log(`Players in room: ${count}`);
        setPlayerCount(count);
        setMessage(`${count} player${count !== 1 ? 's' : ''} in room`);
      });

      socket.on('startGame', (state: PlayerState) => {
        console.log('Game started', state);
        setWaitingForPlayers(false);
        setPlayerState(state);
        setGameResult(null);
        setGameStarted(true);
        setMessage('Game started!');
        setMessageType('success');
        
        socket.emit('requestGameSettings', roomCode);
      });
      
      socket.on('gameSettings', ({ theme: newTheme, difficulty: newDifficulty }: { theme: Theme; difficulty: Difficulty }) => {
        setTheme(newTheme);
        setDifficulty(newDifficulty);
      });

      socket.on('updatePlayerState', (state: PlayerState) => {
        setPlayerState(state);
      });
      
      socket.on('cardFlipped', ({ index, matched }: { index: number; matched: boolean }) => {
        if (matched) {
          setCards(prev => prev.map((card, i) => 
            i === flippedCards[0] || i === index ? { ...card, matched: true } : card
          ));
          setFlippedCards([]);
          if (!isMuted) {
            matchSoundRef.current.play().catch((e) => console.error('Match Sound Error:', e));
          }
        }
      });
      
      socket.on('specialCardActivated', ({ effect }: { effect: string }) => {
        handleSpecialEffect(effect);
      });

      socket.on('gameOver', ({ score, results, gameResult: result }: { score: number; results: Result[]; gameResult: 'win' | 'loss' }) => {
        console.log('Game over received', { score, results, gameResult: result });
        setPlayerState(prev => prev ? { ...prev, score } : prev);
        setGameResult(result);
        setResults(results);
        setLeaderboard(results.sort((a: Result, b: Result) => b.score - a.score));
        
        if (!isMuted) {
          if (result === 'win') {
            console.log('Playing victory sound');
            matchSoundRef.current.play().catch((e) => {
              console.error('Victory Sound Error:', e);
              setMessage('Failed to play victory sound');
              setMessageType('error');
            });
          } else {
            console.log('Playing game over sound');
            gameOverSoundRef.current.play().catch((e) => {
              console.error('Game Over Sound Error:', e);
              setMessage('Failed to play game over sound');
              setMessageType('error');
            });
          }
        }
        
        const sortedResults = [...results].sort((a: Result, b: Result) => b.score - a.score);
        const isWinner = sortedResults[0]?.id === socket.id;
        
        if (result === 'win') {
          triggerWinAnimation();
          setMessage(`Congratulations! You matched all pairs!`);
          setMessageType('success');
        } else if (isWinner) {
          triggerWinAnimation();
          setMessage('You won! 🏆');
          setMessageType('success');
        } else {
          setMessage(`Game over! You placed ${sortedResults.findIndex(r => r.id === socket.id) + 1} out of ${sortedResults.length}`);
          setMessageType('info');
        }
      });

      socket.on('error', (error: { message: string }) => {
        console.log(`Error: ${error.message}`);
        setMessage(error.message);
        setMessageType('error');
      });

      return () => {
        socket.off('roomCreated');
        socket.off('joinedRoom');
        socket.off('playerCount');
        socket.off('startGame');
        socket.off('updatePlayerState');
        socket.off('cardFlipped');
        socket.off('specialCardActivated');
        socket.off('gameOver');
        socket.off('error');
        socket.off('gameSettings');
      };
    }
  }, [mode, flippedCards, roomCode, isMuted]);
  
  // Single-player timer
  useEffect(() => {
    if ((mode === 'single' || (mode === 'multi' && gameStarted)) && 
        playerState && playerState.timer > 0 && !gameResult) {
      
      clearInterval(timerRef.current as NodeJS.Timeout | undefined);
      
      timerRef.current = setInterval(() => {
        setPlayerState(prev => {
          if (!prev || prev.timer <= 1) {
            clearInterval(timerRef.current as NodeJS.Timeout | undefined);
            timerRef.current = null;
            
            if (mode === 'single' && matchedPairsCount < DIFFICULTY_LEVELS[difficulty].pairCount) {
              setGameResult('loss');
              
              if (!isMuted) {
                console.log('Playing game over sound');
                gameOverSoundRef.current.play().catch((e) => {
                  console.error('Game Over Sound Error:', e);
                  setMessage('Failed to play game over sound');
                  setMessageType('error');
                });
              }
              
              setMessage('Time up!');
              setMessageType('warning');
            }
            
            return prev ? { ...prev, timer: 0 } : prev;
          }
          return { ...prev, timer: prev.timer - 1 };
        });
      }, 1000);
      
      return () => {
        if (timerRef.current) {
          clearInterval(timerRef.current as NodeJS.Timeout | undefined);
          timerRef.current = null;
        }
      };
    }
  }, [mode, playerState, gameResult, gameStarted, difficulty, matchedPairsCount, isMuted]);
  
  // Check if all pairs are matched
  useEffect(() => {
    console.log('Win check:', { matchedPairsCount, totalPairs: DIFFICULTY_LEVELS[difficulty].pairCount, gameStarted, gameResult });
    if (matchedPairsCount === DIFFICULTY_LEVELS[difficulty].pairCount && gameStarted && !gameResult) {
      console.log('All pairs matched, triggering win');
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      
      const remainingTime = playerState?.timer || 0;
      const timeBonus = remainingTime * 2;
      
      setPlayerState(prev => {
        const newScore = prev ? prev.score + timeBonus : 0;
        console.log('Updating score:', { newScore, timeBonus });
        return prev ? { ...prev, score: newScore } : null;
      });
      
      setGameResult('win');
      if (!isMuted) {
        console.log('Playing victory sound');
        matchSoundRef.current.play().catch((e) => {
          console.error('Victory Sound Error:', e);
          setMessage('Failed to play victory sound');
          setMessageType('error');
        });
      }
      triggerWinAnimation();
      setMessage(`Congratulations! You matched all pairs with ${remainingTime}s remaining. Time bonus: ${timeBonus}`);
      setMessageType('success');
      
      if (mode === 'multi') {
        console.log('Emitting completeGame');
        socket.emit('completeGame', {
          roomCode,
          timeBonus,
          gameResult: 'win'
        });
      }
    }
  }, [matchedPairsCount, difficulty, gameStarted, gameResult, playerState, roomCode, mode, isMuted]);
  
  // Clear any message after 5 seconds
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        setMessage('');
        setMessageType('');
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [message]);
  
  // Win animation
  const triggerWinAnimation = () => {
    if (!confettiRef.current) return;
    
    confetti({
      particleCount: 150,
      spread: 70,
      origin: { y: 0.6 }
    });
  };
  
  // Handle special card effects
  const handleSpecialEffect = (effect: string) => {
    setSpecialCardActive(true);
    setSpecialEffect(effect);
    
    let duration = 5000;
    
    switch (effect) {
      case 'timeBonus':
        setPlayerState(prev => {
          if (!prev) return null;
          return { ...prev, timer: prev.timer + 10 };
        });
        setMessage('+10 seconds bonus!');
        setMessageType('success');
        break;
        
      case 'scoreBonus':
        setPlayerState(prev => {
          if (!prev) return null;
          return { ...prev, score: prev.score + 20 };
        });
        setMessage('+20 points bonus!');
        setMessageType('success');
        break;
        
      case 'shuffle':
        setMessage('Cards shuffling in 3 seconds!');
        setMessageType('warning');
        duration = 3000;
        
        setTimeout(() => {
          const unmatched = cards.filter(card => !card.matched);
          const shuffledUnmatched = shuffleCards(unmatched);
          
          let newCardDeck = [...cards];
          let unmatchedIndex = 0;
          
          for (let i = 0; i < newCardDeck.length; i++) {
            if (!newCardDeck[i].matched) {
              newCardDeck[i] = shuffledUnmatched[unmatchedIndex++];
            }
          }
          
          setCards(newCardDeck);
          setMessage('Cards shuffled!');
        }, 3000);
        break;
        
      case 'reveal':
        setMessage('All cards revealed for 1 second!');
        setMessageType('info');
        
        setFlippedCards(cards.map((_, index) => index));
        
        setTimeout(() => {
          setFlippedCards([]);
        }, 1000);
        break;
    }
    
    setTimeout(() => {
      setSpecialCardActive(false);
      setSpecialEffect('');
    }, duration);
  };
  
  // Toggle mute
  const toggleMute = () => {
    setIsMuted((prev) => !prev);
  };
  
  // Game mode selection
  const selectMode = (selectedMode: 'select' | 'single' | 'multi') => {
    console.log('Changing mode to:', selectedMode);
    setMode(selectedMode);
    setGameStarted(false);
    setGameResult(null);
    setRoomCode('');
    setPlayerState(null);
    setMessage('');
    setMessageType('');
    setCards([]);
    setFlippedCards([]);
    setMatchedPairsCount(0);
    setResults([]);
    setLeaderboard([]);
    setWaitingForPlayers(false);
    setPlayerCount(1);
  };
  
  // Create a multiplayer room
  const createRoom = () => {
    socket.emit('createRoom', { playerId: socket.id, theme, difficulty });
  };
  
  // Join an existing room
  const joinRoom = () => {
    if (inputRoomCode) {
      setRoomCode('');
      socket.emit('joinRoom', { roomId: inputRoomCode.toUpperCase(), playerId: socket.id });
    } else {
      setMessage('Please enter a room code');
      setMessageType('error');
    }
  };
  
  // Start the game
  const startGame = () => {
    if (mode === 'single') {
      setGameStarted(true);
      setGameResult(null);
    } else if (roomCode) {
      socket.emit('startGame', {
        roomId: roomCode,
        settings: {
          theme,
          difficulty
        }
      });
    }
  };
  
  // Flip a card
  const flipCard = (index: number) => {
    if (
      playerState &&
      playerState.timer > 0 &&
      !disabled &&
      !cards[index].matched &&
      !flippedCards.includes(index) &&
      flippedCards.length < 2 &&
      !specialCardActive
    ) {
      if (!isMuted) {
        flipSoundRef.current.play().catch((e) => console.error('Flip Sound Error:', e));
      }
      
      const newFlipped = [...flippedCards, index];
      setFlippedCards(newFlipped);
      
      if (mode === 'multi') {
        socket.emit('flipCard', { roomId: roomCode, index });
      }
      
      if (newFlipped.length === 2) {
        setDisabled(true);
        const [first, second] = newFlipped;
        
        if (cards[first].value === cards[second].value) {
          setTimeout(() => {
            const isSpecialCard = cards[first].isSpecial || cards[second].isSpecial;
            
            if (isSpecialCard) {
              const effects = ['timeBonus', 'scoreBonus', 'reveal', 'shuffle'];
              const randomEffect = effects[Math.floor(Math.random() * effects.length)];
              
              handleSpecialEffect(randomEffect);
              
              if (mode === 'multi') {
                socket.emit('activateSpecialCard', { roomId: roomCode, effect: randomEffect });
              }
            }
            
            setCards(prev =>
              prev.map((card, i) =>
                i === first || i === second ? { ...card, matched: true } : card
              )
            );
            
            setMatchedPairsCount(prevCount => {
              const newCount = prevCount + 1;
              console.log('Match made, new count:', newCount);
              return newCount;
            });
            
            const points = DIFFICULTY_LEVELS[difficulty].matchPoints;
            
            if (mode === 'single') {
              setPlayerState(prev => {
                if (!prev) return null;
                return { ...prev, score: prev.score + points };
              });
              
              if (!isMuted) {
                matchSoundRef.current.play().catch((e) => console.error('Match Sound Error:', e));
              }
              
              setMessage(`+${points} points!`);
              setMessageType('success');
            } else {
              socket.emit('scorePoints', { roomId: roomCode, points });
            }
            
            setFlippedCards([]);
            setDisabled(false);
          }, 500);
        } else {
          setTimeout(() => {
            setFlippedCards([]);
            setDisabled(false);
          }, 1000);
        }
      }
    }
  };
  
  // Buy additional time with coins
  const buyTime = () => {
    if (!address) {
      setMessage('Please connect your wallet to buy time.');
      setMessageType('warning');
      return;
    }
    
    if (coins >= 10 && playerState && playerState.timer === 0) {
      writeContract(
        {
          address: REWARD_CONTRACT_ADDRESS,
          abi: REWARD_ABI,
          functionName: 'buyTime',
          args: [BigInt(10)],
        },
        {
          onSuccess: () => {
            setCoins(c => c - 10);
            if (mode === 'single') {
              setPlayerState(prev => {
                if (!prev) return null;
                return { ...prev, timer: 30 };
              });
              setGameResult(null);
              
              setMessage('Extra 30 seconds purchased!');
              setMessageType('success');
            } else {
              socket.emit('buyTime', roomCode);
            }
          },
          onError: (error: Error) => {
            console.error('Buy time failed', error);
            setMessage(`Failed to buy time: ${error.message}`);
            setMessageType('error');
          },
        }
      );
    } else {
      setMessage(coins < 10 ? 'Not enough coins!' : 'Timer still active!');
      setMessageType('error');
    }
  };
  
  // Start a new game
  const startNewGame = () => {
    if (mode === 'single') {
      setGameStarted(true);
      setGameResult(null);
    } else {
      socket.emit('startNewGame', roomCode);
    }
  };
  
  // Claim reward for winning in multiplayer
  const claimReward = () => {
    if (!address) {
      setMessage('Please connect your wallet to claim rewards.');
      setMessageType('warning');
      return;
    }
    
    if (gameResult && playerState && results.length > 1 && mode === 'multi') {
      const topScore = Math.max(...results.map(r => r.score));
      if (playerState.score === topScore) {
        writeContract(
          {
            address: REWARD_CONTRACT_ADDRESS,
            abi: REWARD_ABI,
            functionName: 'rewardPlayer',
            args: [parseEther('0.01')],
          },
          {
            onSuccess: () => {
              setMessage('Reward claimed successfully!');
              setMessageType('success');
            },
            onError: (error: Error) => {
              console.error('Claim reward failed', error);
              setMessage(`Failed to claim reward: ${error.message}`);
              setMessageType('error');
            },
          }
        );
      } else {
        setMessage('Only the top scorer can claim the reward.');
        setMessageType('warning');
      }
    }
  };
  
  // Format time display
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };
  
  return (
    <div className="game-container">
      <div className="game-header">
        <h1 className="game-title">Memory Match</h1>
        <motion.button
          className="button-outline"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={toggleMute}
        >
          {isMuted ? 'Unmute' : 'Mute'}
        </motion.button>
        {playerState && (
          <div className="game-stats">
            <div className="stat-item">
              <div className="stat-label">Score</div>
              <div className="stat-value">{playerState.score}</div>
            </div>
            <div className="stat-item">
              <div className="stat-label">Time</div>
              <div className={`stat-value ${playerState.timer < 10 ? 'low-time' : ''}`}>
                {formatTime(playerState.timer)}
              </div>
            </div>
            <div className="stat-item">
              <div className="stat-label">Coins</div>
              <div className="stat-value">{coins}</div>
            </div>
          </div>
        )}
      </div>
      
      {message && (
        <div className={`game-message message-${messageType}`}>
          {message}
        </div>
      )}
      
      {mode === 'select' && (
        <div className="mode-selection">
          <h2>Select Game Mode</h2>
          <div className="mode-buttons">
            <motion.button 
              className="mode-button"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => selectMode('single')}
            >
              Single Player
            </motion.button>
            <motion.button 
              className="mode-button"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => selectMode('multi')}
            >
              Multiplayer
            </motion.button>
          </div>
        </div>
      )}
      
      {mode === 'single' && !gameStarted && (
        <div className="game-setup">
          <h2>Game Settings</h2>
          
          <div className="settings-group">
            <label>Card Theme</label>
            <div className="theme-selector">
              {Object.keys(CARD_THEMES).map(themeOption => (
                <button 
                  key={themeOption}
                  className={`theme-button ${theme === themeOption ? 'selected' : ''}`}
                  onClick={() => setTheme(themeOption as Theme)}
                >
                  {themeOption.charAt(0).toUpperCase() + themeOption.slice(1)}
                </button>
              ))}
            </div>
          </div>
          
          <div className="settings-group">
            <label>Difficulty</label>
            <div className="difficulty-selector">
              {Object.keys(DIFFICULTY_LEVELS).map(diffOption => (
                <button 
                  key={diffOption}
                  className={`difficulty-button ${difficulty === diffOption ? 'selected' : ''}`}
                  onClick={() => setDifficulty(diffOption as Difficulty)}
                >
                  {diffOption.charAt(0).toUpperCase() + diffOption.slice(1)}
                </button>
              ))}
            </div>
          </div>
          
          <button className="start-button" onClick={startGame}>
            Start Game
          </button>
        </div>
      )}
      
      {mode === 'multi' && !roomCode && (
        <div className="multi-setup">
          <div className="room-options">
            <div className="create-room">
              <h3>Create a Room</h3>
              
              <div className="settings-group">
                <label>Card Theme</label>
                <div className="theme-selector">
                  {Object.keys(CARD_THEMES).map(themeOption => (
                    <button 
                      key={themeOption}
                      className={`theme-button ${theme === themeOption ? 'selected' : ''}`}
                      onClick={() => setTheme(themeOption as Theme)}
                    >
                      {themeOption.charAt(0).toUpperCase() + themeOption.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="settings-group">
                <label>Difficulty</label>
                <div className="difficulty-selector">
                  {Object.keys(DIFFICULTY_LEVELS).map(diffOption => (
                    <button 
                      key={diffOption}
                      className={`difficulty-button ${difficulty === diffOption ? 'selected' : ''}`}
                      onClick={() => setDifficulty(diffOption as Difficulty)}
                    >
                      {diffOption.charAt(0).toUpperCase() + diffOption.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
              
              <motion.button 
                className="button-primary"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={createRoom}
              >
                Create Room
              </motion.button>
            </div>
            
            <div className="room-divider">OR</div>
            
            <div className="join-room">
              <h3>Join a Room</h3>
              <input
                type="text"
                placeholder="Enter Room Code"
                value={inputRoomCode}
                onChange={(e) => setInputRoomCode(e.target.value)}
                className="room-code-input"
              />
              <motion.button 
                className="button-primary"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={joinRoom}
              >
                Join Room
              </motion.button>
            </div>
          </div>
        </div>
      )}
      
      {mode === 'multi' && roomCode && waitingForPlayers && (
        <div className="waiting-room">
          <h2>Room: {roomCode}</h2>
          <div className="player-count">
            {playerCount} player{playerCount !== 1 ? 's' : ''} in room
          </div>
          
          <div className="room-code-display">
            <p>Share this code with friends:</p>
            <div className="code-box">{roomCode}</div>
          </div>
          
          <motion.button 
            className="start-button"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={startGame}
          >
            Start Game
          </motion.button>
        </div>
      )}
      
      {playerState && !gameResult && gameStarted && (
        <div className={`game-board ${specialCardActive ? `special-effect ${specialEffect}` : ''}`}>
          <AnimatePresence>
            <div className="card-grid" style={{ 
              gridTemplateColumns: `repeat(${Math.ceil(Math.sqrt(cards.length))}, 1fr)` 
            }}>
              {cards.map((card, index) => (
                <motion.div
                  key={card.id}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  transition={{ duration: 0.3 }}
                  className={`card-container ${flippedCards.includes(index) || card.matched ? 'flipped' : ''} ${card.matched ? 'matched' : ''} ${card.isSpecial && card.matched ? 'special' : ''}`}
                  onClick={() => flipCard(index)}
                >
                  <div className="card-inner">
                    <div className="card-back">
                      {CARD_THEMES[theme].backDesign}
                    </div>
                    <div className="card-front">
                      {card.display}
                      {card.isSpecial && <div className="special-indicator">✨</div>}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </AnimatePresence>
          
          {mode === 'multi' && (
            <div className="room-info">
              Room: {roomCode} | Players: {playerCount}
            </div>
          )}
          
          <div ref={confettiRef} className="confetti-container"></div>
        </div>
      )}

      {gameResult && (
        <motion.div 
          className="game-over-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="game-over-modal">
            <h2>{gameResult === 'win' ? 'Congratulations!' : 'Game Over'}</h2>
            
            <div className="score-display">
              <div className="final-score">
                <span>Your Score:</span> 
                <span className="score-value">{playerState?.score || 0}</span>
              </div>
              
              <div className="stats">
                <div>Matched Pairs: {matchedPairsCount}/{DIFFICULTY_LEVELS[difficulty].pairCount}</div>
                <div>Time Remaining: {playerState?.timer || 0}s</div>
              </div>
            </div>
            
            {mode === 'multi' && leaderboard.length > 0 && (
              <div className="leaderboard">
                <h3>Leaderboard</h3>
                <div className="leaderboard-list">
                  {leaderboard.map((player, index) => (
                    <div 
                      key={player.id} 
                      className={`leaderboard-item ${player.id === socket.id ? 'you' : ''}`}
                    >
                      <div className="rank">{index + 1}</div>
                      <div className="player-id">
                        {player.id === socket.id ? 'You' : `Player ${player.id.slice(0, 4)}`}
                      </div>
                      <div className="player-score">{player.score}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <div className="game-over-actions">
              <motion.button 
                className="button-primary"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={startNewGame}
              >
                Play Again
              </motion.button>
              
              {playerState?.timer === 0 && (
                <motion.button 
                  className="button-secondary"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={buyTime}
                  disabled={coins < 10}
                >
                  Buy Time (10 coins)
                </motion.button>
              )}
              
              {mode === 'multi' && results.length > 1 && playerState?.score === Math.max(...results.map(r => r.score)) && (
                <motion.button 
                  className="button-reward"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={claimReward}
                >
                  Claim Reward
                </motion.button>
              )}
              
              <motion.button 
                className="button-outline"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  console.log('Change Mode clicked');
                  selectMode('select');
                }}
              >
                Change Mode
              </motion.button>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default CardGame;