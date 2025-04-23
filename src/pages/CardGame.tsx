import React, { useState, useEffect } from 'react';
import { useAccount, useWriteContract } from 'wagmi';
import { parseEther } from 'viem';
import io from 'socket.io-client';
import '../styles.css';

const socket = io('http://localhost:3001');

const REWARD_CONTRACT_ADDRESS = '0xYourContractAddressHere'; // Replace with deployed address
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

// Initialize 8 pairs (4 suits × 2 ranks)
const initialCards = [
  { id: 1, value: 'A♠', matched: false },
  { id: 2, value: 'A♠', matched: false },
  { id: 3, value: 'K♠', matched: false },
  { id: 4, value: 'K♠', matched: false },
  { id: 5, value: 'A♥', matched: false },
  { id: 6, value: 'A♥', matched: false },
  { id: 7, value: 'K♥', matched: false },
  { id: 8, value: 'K♥', matched: false },
  { id: 9, value: 'A♣', matched: false },
  { id: 10, value: 'A♣', matched: false },
  { id: 11, value: 'K♣', matched: false },
  { id: 12, value: 'K♣', matched: false },
  { id: 13, value: 'A♦', matched: false },
  { id: 14, value: 'A♦', matched: false },
  { id: 15, value: 'K♦', matched: false },
  { id: 16, value: 'K♦', matched: false },
];

// Shuffle cards
const shuffleCards = (cards: typeof initialCards) => {
  return [...cards].sort(() => Math.random() - 0.5);
};

const CardGame: React.FC = () => {
  const { address } = useAccount();
  const { writeContract } = useWriteContract();
  const [mode, setMode] = useState<'select' | 'single' | 'multi'>('select');
  const [roomCode, setRoomCode] = useState('');
  const [playerState, setPlayerState] = useState<{ score: number; timer: number } | null>(null);
  const [gameOver, setGameOver] = useState(false);
  const [results, setResults] = useState<{ id: string; score: number }[]>([]);
  const [coins, setCoins] = useState(100);
  const [error, setError] = useState('');
  const [cards, setCards] = useState(shuffleCards(initialCards));
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [disabled, setDisabled] = useState(false);

  // Single-player timer
  useEffect(() => {
    if (mode === 'single' && playerState && playerState.timer > 0 && !gameOver) {
      const interval = setInterval(() => {
        setPlayerState((prev) => {
          if (!prev || prev.timer <= 0) {
            console.log('Single-player timer ended, setting gameOver');
            clearInterval(interval);
            setGameOver(true);
            return prev;
          }
          return { ...prev, timer: prev.timer - 1 };
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [mode, playerState, gameOver]);

  // Socket.IO for multiplayer
  useEffect(() => {
    if (mode === 'multi') {
      socket.on('roomCreated', (code) => {
        console.log(`Room created: ${code}`);
        setRoomCode(code);
      });

      socket.on('joinedRoom', (code) => {
        console.log(`Joined room: ${code}`);
        setRoomCode(code);
      });

      socket.on('playerCount', (count) => {
        console.log(`Players in room: ${count}`);
      });

      socket.on('startGame', (state) => {
        console.log('Game started', state);
        setPlayerState(state);
        setGameOver(false);
        setCards(shuffleCards(initialCards));
        setFlippedCards([]);
        setResults([]);
      });

      socket.on('updatePlayerState', (state) => {
        console.log('Player state updated', state);
        setPlayerState(state);
      });

      socket.on('gameOver', ({ score, results }) => {
        console.log('Game over received', { score, results });
        setPlayerState((prev) => (prev ? { ...prev, score } : prev));
        setGameOver(true);
        setResults(results);
      });

      socket.on('error', (msg) => {
        console.log(`Error: ${msg}`);
        setError(msg);
      });

      return () => {
        socket.off('roomCreated');
        socket.off('joinedRoom');
        socket.off('playerCount');
        socket.off('startGame');
        socket.off('updatePlayerState');
        socket.off('gameOver');
        socket.off('error');
      };
    }
  }, [mode]);

  const selectMode = (selectedMode: 'single' | 'multi') => {
    console.log(`Mode selected: ${selectedMode}`);
    setMode(selectedMode);
    if (selectedMode === 'single') {
      setPlayerState({ score: 0, timer: 60 });
      setCards(shuffleCards(initialCards));
      setFlippedCards([]);
      setGameOver(false);
      setError('');
    }
  };

  const createRoom = () => {
    console.log('Creating room');
    socket.emit('createRoom');
  };

  const joinRoom = () => {
    if (roomCode) {
      console.log(`Joining room: ${roomCode}`);
      socket.emit('joinRoom', roomCode.toUpperCase());
    }
  };

  const ready = () => {
    if (roomCode) {
      console.log(`Player ready in room: ${roomCode}`);
      socket.emit('ready', roomCode);
    }
  };

  const flipCard = (index: number) => {
    if (
      playerState &&
      playerState.timer > 0 &&
      !disabled &&
      !cards[index].matched &&
      !flippedCards.includes(index) &&
      flippedCards.length < 2
    ) {
      console.log(`Flipping card: ${index}`);
      setFlippedCards([...flippedCards, index]);
    }
  };

  useEffect(() => {
    if (flippedCards.length === 2) {
      setDisabled(true);
      const [first, second] = flippedCards;
      if (cards[first].value === cards[second].value) {
        console.log('Match found');
        setCards((prev) =>
          prev.map((card, i) =>
            i === first || i === second ? { ...card, matched: true } : card
          )
        );
        if (mode === 'single') {
          setPlayerState((prev) => prev && { ...prev, score: prev.score + 10 });
        } else {
          socket.emit('selectCard', { roomCode, points: 10 });
        }
        setFlippedCards([]);
        setDisabled(false);
      } else {
        setTimeout(() => {
          console.log('No match, resetting cards');
          setFlippedCards([]);
          setDisabled(false);
        }, 1000);
      }
    }
  }, [flippedCards, cards, mode, roomCode]);

  const buyTime = () => {
    console.log('Attempting to buy time', { address, coins });
    if (!address) {
      alert('Please connect your wallet to buy time.');
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
            console.log('Time bought successfully');
            setCoins((c) => c - 10);
            if (mode === 'single') {
              setPlayerState((prev) => prev && { ...prev, timer: 30, score: 0 });
              setGameOver(false);
              setCards(shuffleCards(initialCards));
              setFlippedCards([]);
            } else {
              socket.emit('buyTime', roomCode);
            }
          },
          onError: (error: Error) => {
            console.error('Buy time failed', error);
            alert(`Failed to buy time: ${error.message}`);
          },
        }
      );
    } else {
      alert('Not enough coins or timer still active.');
    }
  };

  const startNewGame = () => {
    console.log(`Starting new game in mode: ${mode}`);
    if (mode === 'single') {
      setPlayerState({ score: 0, timer: 60 });
      setCards(shuffleCards(initialCards));
      setFlippedCards([]);
      setGameOver(false);
    } else {
      socket.emit('startNewGame', roomCode);
    }
  };

  const claimReward = () => {
    console.log('Attempting to claim reward', { address, gameOver, mode });
    if (!address) {
      alert('Please connect your wallet to claim rewards.');
      return;
    }
    if (gameOver && playerState && results.length > 1 && mode === 'multi') {
      const topScore = Math.max(...results.map((r) => r.score));
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
              console.log('Reward claimed successfully');
            },
            onError: (error: Error) => {
              console.error('Claim reward failed', error);
              alert(`Failed to claim reward: ${error.message}`);
            },
          }
        );
      } else {
        alert('Only the top scorer can claim the reward.');
      }
    }
  };

  return (
    <div className="container">
      <h1>Card Matching Game</h1>
      {mode === 'select' ? (
        <div className="mode-selection">
          <button className="mode-button" onClick={() => selectMode('single')}>
            Single Player
          </button>
          <button className="mode-button" onClick={() => selectMode('multi')}>
            Multiplayer
          </button>
        </div>
      ) : mode === 'multi' && !roomCode ? (
        <div>
          <button onClick={createRoom}>Create Room</button>
          <input
            type="text"
            placeholder="Enter Room Code"
            value={roomCode}
            onChange={(e) => setRoomCode(e.target.value)}
          />
          <button onClick={joinRoom}>Join Room</button>
        </div>
      ) : mode === 'multi' && roomCode && !playerState ? (
        <div>
          <p>Room Code: {roomCode}</p>
          <button onClick={ready}>Start Game</button>
        </div>
      ) : playerState ? (
        <div>
          {mode === 'multi' && <p>Room Code: {roomCode}</p>}
          <p>Timer: {playerState.timer}s</p>
          <p>Your Score: {playerState.score}</p>
          <p>Coins: {coins}</p>
          {!address && (
            <p className="wallet-prompt">Connect wallet for rewards and extra time.</p>
          )}
          {gameOver ? (
            <div className="time-up-popup">
              <h2>Time Up!</h2>
              <p>Your Score: {playerState.score}</p>
              {mode === 'multi' && results.length > 1 && (
                <div>
                  <h3>Results</h3>
                  {results.map((r) => (
                    <p key={r.id}>
                      Player {r.id.slice(0, 6)}: {r.score}
                    </p>
                  ))}
                </div>
              )}
              <button className="popup-button" onClick={buyTime} disabled={coins < 10}>
                Connect Wallet to Buy 30s
              </button>
              <button className="popup-button" onClick={startNewGame}>
                Start New Game
              </button>
              {mode === 'multi' && results.length > 1 && (
                <button className="popup-button" onClick={claimReward}>
                  Claim Reward
                </button>
              )}
            </div>
          ) : (
            <div className="card-grid">
              {cards.map((card, index) => (
                <button
                  key={card.id}
                  className={`card ${flippedCards.includes(index) || card.matched ? 'flipped' : ''}`}
                  onClick={() => flipCard(index)}
                  disabled={disabled || card.matched || flippedCards.includes(index)}
                >
                  {flippedCards.includes(index) || card.matched ? card.value : '?'}
                </button>
              ))}
            </div>
          )}
        </div>
      ) : null}
      {error && <p className="error">{error}</p>}
    </div>
  );
};

export default CardGame;