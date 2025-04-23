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

const questions = [
  {
    question: 'What is the capital of Japan?',
    options: ['Beijing', 'Seoul', 'Tokyo', 'Bangkok'],
    correct: 2,
  },
  {
    question: 'Which planet is known as the Red Planet?',
    options: ['Venus', 'Mars', 'Jupiter', 'Saturn'],
    correct: 1,
  },
  {
    question: 'Who painted the Mona Lisa?',
    options: ['Vincent van Gogh', 'Pablo Picasso', 'Leonardo da Vinci', 'Claude Monet'],
    correct: 2,
  },
  {
    question: 'What is the largest mammal in the world?',
    options: ['Blue Whale', 'African Elephant', 'Giraffe', 'Great White Shark'],
    correct: 0,
  },
  {
    question: 'In which year did the Titanic sink?',
    options: ['1905', '1912', '1920', '1931'],
    correct: 1,
  },
  {
    question: 'What is the chemical symbol for Gold?',
    options: ['Ag', 'Au', 'Fe', 'Cu'],
    correct: 1,
  },
  {
    question: 'Which country is home to the kangaroo?',
    options: ['Brazil', 'India', 'Australia', 'South Africa'],
    correct: 2,
  },
  {
    question: 'Who wrote the play "Romeo and Juliet"?',
    options: ['William Shakespeare', 'Charles Dickens', 'Jane Austen', 'Mark Twain'],
    correct: 0,
  },
  {
    question: 'What is the smallest prime number?',
    options: ['0', '1', '2', '3'],
    correct: 2,
  },
  {
    question: 'Which element is essential for human respiration?',
    options: ['Nitrogen', 'Oxygen', 'Carbon', 'Hydrogen'],
    correct: 1,
  },
];

const TriviaQuiz: React.FC = () => {
  const { address } = useAccount();
  const { writeContract } = useWriteContract();
  const [mode, setMode] = useState<'select' | 'single' | 'multi'>('select');
  const [roomCode, setRoomCode] = useState('');
  const [playerState, setPlayerState] = useState<{ score: number; timer: number } | null>(null);
  const [gameOver, setGameOver] = useState(false);
  const [results, setResults] = useState<{ id: string; score: number }[]>([]);
  const [coins, setCoins] = useState(100);
  const [error, setError] = useState('');
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<{ question: string; userAnswer: string; correctAnswer: string }[]>([]);
  const [answeredCount, setAnsweredCount] = useState(0);

  // Single-player timer
  useEffect(() => {
    if (mode === 'single' && playerState && playerState.timer > 0 && !gameOver) {
      const interval = setInterval(() => {
        setPlayerState((prev) => {
          if (!prev || prev.timer <= 0) {
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
        setRoomCode(code);
      });

      socket.on('joinedRoom', (code) => {
        setRoomCode(code);
      });

      socket.on('playerCount', (count) => {
        console.log(`Players in room: ${count}`);
      });

      socket.on('startGame', (state) => {
        setPlayerState(state);
        setGameOver(false);
        setCurrentQuestion(0);
        setAnsweredCount(0);
        setAnswers([]);
      });

      socket.on('updatePlayerState', (state) => {
        setPlayerState(state);
      });

      socket.on('gameOver', ({ score, results }) => {
        setPlayerState((prev) => ({ ...prev!, score }));
        setGameOver(true);
        setResults(results);
      });

      socket.on('error', (msg) => {
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
    setMode(selectedMode);
    if (selectedMode === 'single') {
      setPlayerState({ score: 0, timer: 30 });
      setCurrentQuestion(0);
      setAnsweredCount(0);
      setAnswers([]);
      setGameOver(false);
      setError('');
    }
  };

  const createRoom = () => {
    socket.emit('createRoom');
  };

  const joinRoom = () => {
    if (roomCode) {
      socket.emit('joinRoom', roomCode.toUpperCase());
    }
  };

  const ready = () => {
    if (roomCode) {
      socket.emit('ready', roomCode);
    }
  };

  const submitAnswer = (answerIndex: number) => {
    if (playerState && playerState.timer > 0 && answeredCount < questions.length) {
      const isCorrect = answerIndex === questions[currentQuestion].correct;
      const answerRecord = {
        question: questions[currentQuestion].question,
        userAnswer: questions[currentQuestion].options[answerIndex],
        correctAnswer: questions[currentQuestion].options[questions[currentQuestion].correct],
      };
      setAnswers((prev) => [...prev, answerRecord]);
      setAnsweredCount((prev) => prev + 1);

      if (mode === 'single') {
        if (isCorrect) {
          setPlayerState((prev) => prev && { ...prev, score: prev.score + 10 });
        }
        if (answeredCount + 1 === questions.length) {
          setGameOver(true);
        } else {
          setCurrentQuestion((prev) => prev + 1);
        }
      } else {
        socket.emit('submitAnswer', { roomCode, answerIndex, questionIndex: currentQuestion });
        if (answeredCount + 1 === questions.length) {
          socket.emit('endGame', { roomCode });
        } else {
          setCurrentQuestion((prev) => prev + 1);
        }
      }
    }
  };

  const buyTime = () => {
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
            setCoins((c) => c - 10);
            if (mode === 'single') {
              setPlayerState((prev) => prev && { ...prev, timer: 15 });
              setGameOver(false);
              setCurrentQuestion(0);
              setAnsweredCount(0);
              setAnswers([]);
            } else {
              socket.emit('buyTime', roomCode);
            }
          },
          onError: (error: Error) => {
            alert(`Failed to buy time: ${error.message}`);
          },
        }
      );
    }
  };

  const claimReward = () => {
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
            onError: (error: Error) => {
              alert(`Failed to claim reward: ${error.message}`);
            },
          }
        );
      }
    }
  };

  return (
    <div className="container">
      <h1>Trivia Quiz</h1>
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
          {!gameOver ? (
            <div>
              <p className="question">{questions[currentQuestion].question}</p>
              <div className="options">
                {questions[currentQuestion].options.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => submitAnswer(index)}
                    disabled={playerState.timer === 0}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div>
              <p>Game Over! Your Score: {playerState.score}</p>
              <div className="results-table">
                <h2>Your Answers</h2>
                <table>
                  <thead>
                    <tr>
                      <th>Question</th>
                      <th>Your Answer</th>
                      <th>Correct Answer</th>
                    </tr>
                  </thead>
                  <tbody>
                    {answers.map((ans, index) => (
                      <tr key={index}>
                        <td>{ans.question}</td>
                        <td>{ans.userAnswer}</td>
                        <td>{ans.correctAnswer}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {mode === 'multi' && results.length > 1 && (
                <div>
                  <h2>Multiplayer Results</h2>
                  {results.map((r) => (
                    <p key={r.id}>
                      Player {r.id.slice(0, 6)}: {r.score}
                    </p>
                  ))}
                </div>
              )}
              <button onClick={buyTime} disabled={coins < 10 || playerState.timer > 0}>
                Buy 15s for 10 Coins
              </button>
              {mode === 'multi' && results.length > 1 && (
                <button onClick={claimReward}>Claim Reward</button>
              )}
            </div>
          )}
        </div>
      ) : null}
      {error && <p className="error">{error}</p>}
    </div>
  );
};

export default TriviaQuiz;