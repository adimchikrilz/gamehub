import React, { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { motion, AnimatePresence } from 'framer-motion';
import { useAccount } from 'wagmi';
import '../styles.css';

// Audio imports
import triviaBg from '../assets/audio/quiz-bg.mp3';
import correctSound from '../assets/audio/correct-answer.mp3';
import incorrectSound from '../assets/audio/incorrect-answer.mp3';
import gameOverSound from '../assets/audio/game-over.wav';

interface Question {
  question: string;
  options: string[];
  correctAnswer: string;
}

interface Answer {
  question: string;
  selectedAnswer: string;
  correctAnswer: string;
}

interface LeaderboardEntry {
  playerId: string;
  score: number;
}

type Category = 'general' | 'entertainment' | 'football' | 'science';

interface CategoryQuestions {
  [key: string]: Question[];
}

const TRIVIA_QUESTIONS: CategoryQuestions = {
  general: [
    {
      question: 'What is the capital of France?',
      options: ['Paris', 'London', 'Berlin', 'Madrid'],
      correctAnswer: 'Paris',
    },
    {
      question: 'Which planet is known as the Red Planet?',
      options: ['Mars', 'Jupiter', 'Venus', 'Mercury'],
      correctAnswer: 'Mars',
    },
    {
      question: 'What is 2 + 2?',
      options: ['3', '4', '5', '6'],
      correctAnswer: '4',
    },
    {
      question: 'Which element has the symbol H?',
      options: ['Helium', 'Hydrogen', 'Hafnium', 'Holmium'],
      correctAnswer: 'Hydrogen',
    },
    {
      question: 'What is the largest ocean?',
      options: ['Atlantic', 'Indian', 'Arctic', 'Pacific'],
      correctAnswer: 'Pacific',
    },
    {
      question: 'What is the currency of Japan?',
      options: ['Yuan', 'Yen', 'Won', 'Dollar'],
      correctAnswer: 'Yen',
    },
    {
      question: 'Which country hosted the 2016 Olympics?',
      options: ['China', 'Brazil', 'UK', 'Japan'],
      correctAnswer: 'Brazil',
    },
    {
      question: 'What gas do plants absorb from the air?',
      options: ['Oxygen', 'Nitrogen', 'Carbon Dioxide', 'Argon'],
      correctAnswer: 'Carbon Dioxide',
    },
    {
      question: 'What is the smallest country in the world?',
      options: ['Monaco', 'Vatican City', 'San Marino', 'Liechtenstein'],
      correctAnswer: 'Vatican City',
    },
    {
      question: 'Who discovered penicillin?',
      options: ['Alexander Fleming', 'Marie Curie', 'Thomas Edison', 'Isaac Newton'],
      correctAnswer: 'Alexander Fleming',
    },
  ],
  entertainment: [
    {
      question: 'Who painted the Mona Lisa?',
      options: ['Van Gogh', 'Da Vinci', 'Picasso', 'Monet'],
      correctAnswer: 'Da Vinci',
    },
    {
      question: 'Who wrote "To Kill a Mockingbird"?',
      options: ['Harper Lee', 'J.K. Rowling', 'Ernest Hemingway', 'Mark Twain'],
      correctAnswer: 'Harper Lee',
    },
    {
      question: 'Which film won the Best Picture Oscar in 2020?',
      options: ['1917', 'Joker', 'Parasite', 'Ford v Ferrari'],
      correctAnswer: 'Parasite',
    },
    {
      question: 'Who plays Iron Man in the Marvel Cinematic Universe?',
      options: ['Chris Evans', 'Robert Downey Jr.', 'Chris Hemsworth', 'Mark Ruffalo'],
      correctAnswer: 'Robert Downey Jr.',
    },
    {
      question: 'Which band performed the song "Bohemian Rhapsody"?',
      options: ['The Beatles', 'Queen', 'Led Zeppelin', 'Pink Floyd'],
      correctAnswer: 'Queen',
    },
    {
      question: 'What is the name of the fictional school in Harry Potter?',
      options: ['Hogwarts', 'Beauxbatons', 'Durmstrang', 'Ilvermorny'],
      correctAnswer: 'Hogwarts',
    },
    {
      question: 'Who directed the movie "Jurassic Park"?',
      options: ['Steven Spielberg', 'James Cameron', 'Christopher Nolan', 'Quentin Tarantino'],
      correctAnswer: 'Steven Spielberg',
    },
    {
      question: 'Which TV show features the character Walter White?',
      options: ['The Sopranos', 'Breaking Bad', 'Mad Men', 'The Wire'],
      correctAnswer: 'Breaking Bad',
    },
    {
      question: 'What is the name of Beyoncé’s 2016 visual album?',
      options: ['Lemonade', 'Formation', 'Dangerously in Love', 'Cowboy Carter'],
      correctAnswer: 'Lemonade',
    },
    {
      question: 'Who voiced Mufasa in the 1994 "The Lion King"?',
      options: ['James Earl Jones', 'Morgan Freeman', 'Samuel L. Jackson', 'Denzel Washington'],
      correctAnswer: 'James Earl Jones',
    },
  ],
  football: [
    {
      question: 'Which country won the FIFA World Cup in 2018?',
      options: ['Brazil', 'Germany', 'France', 'Argentina'],
      correctAnswer: 'France',
    },
    {
      question: 'Who holds the record for most goals in a single Premier League season?',
      options: ['Alan Shearer', 'Mohamed Salah', 'Erling Haaland', 'Thierry Henry'],
      correctAnswer: 'Erling Haaland',
    },
    {
      question: 'Which club has won the most UEFA Champions League titles?',
      options: ['Barcelona', 'Real Madrid', 'AC Milan', 'Bayern Munich'],
      correctAnswer: 'Real Madrid',
    },
    {
      question: 'What is the nickname of the England national football team?',
      options: ['Three Lions', 'Red Devils', 'Blues', 'Eagles'],
      correctAnswer: 'Three Lions',
    },
    {
      question: 'Who won the Ballon d’Or in 2023?',
      options: ['Lionel Messi', 'Cristiano Ronaldo', 'Kylian Mbappé', 'Erling Haaland'],
      correctAnswer: 'Lionel Messi',
    },
    {
      question: 'Which stadium is known as the "Theatre of Dreams"?',
      options: ['Wembley', 'Camp Nou', 'Old Trafford', 'Santiago Bernabéu'],
      correctAnswer: 'Old Trafford',
    },
    {
      question: 'Which player is known as "CR7"?',
      options: ['Lionel Messi', 'Cristiano Ronaldo', 'Neymar', 'Ronaldinho'],
      correctAnswer: 'Cristiano Ronaldo',
    },
    {
      question: 'What color card is shown for a serious foul in football?',
      options: ['Yellow', 'Red', 'Green', 'Blue'],
      correctAnswer: 'Red',
    },
    {
      question: 'Which country hosted the 2010 FIFA World Cup?',
      options: ['Brazil', 'Germany', 'South Africa', 'Qatar'],
      correctAnswer: 'South Africa',
    },
    {
      question: 'Who is the all-time top scorer for the Brazil national team?',
      options: ['Pelé', 'Ronaldo', 'Neymar', 'Romário'],
      correctAnswer: 'Neymar',
    },
  ],
  science: [
    {
      question: 'What is the chemical symbol for gold?',
      options: ['Au', 'Ag', 'Fe', 'Cu'],
      correctAnswer: 'Au',
    },
    {
      question: 'Which planet is closest to the Sun?',
      options: ['Venus', 'Mercury', 'Earth', 'Mars'],
      correctAnswer: 'Mercury',
    },
    {
      question: 'What is the primary source of energy for Earth’s climate system?',
      options: ['The Moon', 'The Sun', 'Geothermal Heat', 'Ocean Currents'],
      correctAnswer: 'The Sun',
    },
    {
      question: 'What gas makes up about 78% of Earth’s atmosphere?',
      options: ['Oxygen', 'Nitrogen', 'Carbon Dioxide', 'Argon'],
      correctAnswer: 'Nitrogen',
    },
    {
      question: 'What is the powerhouse of the cell?',
      options: ['Nucleus', 'Mitochondrion', 'Ribosome', 'Golgi Apparatus'],
      correctAnswer: 'Mitochondrion',
    },
    {
      question: 'Which scientist proposed the theory of relativity?',
      options: ['Isaac Newton', 'Albert Einstein', 'Galileo Galilei', 'Stephen Hawking'],
      correctAnswer: 'Albert Einstein',
    },
    {
      question: 'What is the boiling point of water in Celsius at sea level?',
      options: ['0°C', '50°C', '100°C', '150°C'],
      correctAnswer: '100°C',
    },
    {
      question: 'Which particle has a negative charge?',
      options: ['Proton', 'Neutron', 'Electron', 'Positron'],
      correctAnswer: 'Electron',
    },
    {
      question: 'What is the main gas found in stars like the Sun?',
      options: ['Oxygen', 'Hydrogen', 'Nitrogen', 'Carbon'],
      correctAnswer: 'Hydrogen',
    },
    {
      question: 'What type of bond involves the sharing of electrons?',
      options: ['Ionic', 'Covalent', 'Metallic', 'Hydrogen'],
      correctAnswer: 'Covalent',
    },
  ],
};

const TriviaQuiz: React.FC = () => {
  const { address } = useAccount();
  const [playerId] = useState<string>(address || crypto.randomUUID());
  const [category, setCategory] = useState<Category | null>(null);
  const [mode, setMode] = useState<'single' | 'multi' | null>(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(50);
  const [gameOver, setGameOver] = useState(false);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [roomCode, setRoomCode] = useState('');
  const [roomId, setRoomId] = useState<string | null>(null);
  const [players, setPlayers] = useState<string[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [isMuted, setIsMuted] = useState<boolean>(false);

  // Audio refs
  const bgMusicRef = useRef(new Audio(triviaBg));
  const correctSoundRef = useRef(new Audio(correctSound));
  const incorrectSoundRef = useRef(new Audio(incorrectSound));
  const gameOverSoundRef = useRef(new Audio(gameOverSound));

  // Initialize Socket.IO with error handling
  useEffect(() => {
    const SOCKET_URL = process.env.NODE_ENV === 'production'
      ? 'https://gamehub-nlju.onrender.com'
      : 'http://localhost:3001';
    const newSocket = io(SOCKET_URL, { transports: ['websocket'] });
    newSocket.on('connect', () => console.log('Socket connected:', newSocket.id));
    newSocket.on('connect_error', (err) => {
      console.error('Socket connection error:', err.message);
      setMessage({ text: 'Failed to connect to server', type: 'error' });
    });
    setSocket(newSocket);
    return () => {
      newSocket.disconnect();
    };
  }, []);

  // Background music control
  useEffect(() => {
    bgMusicRef.current.loop = true;
    bgMusicRef.current.volume = 0.3;
    if (gameStarted && !gameOver && !isMuted) {
      bgMusicRef.current.play().catch((e) => console.error('BG Music Error:', e));
    } else {
      bgMusicRef.current.pause();
    }
    return () => {
      bgMusicRef.current.pause();
    };
  }, [gameStarted, gameOver, isMuted]);

  // Game-over sound control
  useEffect(() => {
    if (gameOver && !isMuted) {
      gameOverSoundRef.current.play().catch((e) => console.error('Game Over Sound Error:', e));
    }
  }, [gameOver, isMuted]);

  // Handle Socket.IO events
  useEffect(() => {
    if (!socket) return;

    socket.on('roomCreated', ({ roomId, playerId: joinedPlayerId }) => {
      console.log('Room created:', roomId, 'for player:', joinedPlayerId);
      setRoomId(roomId);
      setPlayers([joinedPlayerId]);
      setCategory(category || 'general'); // Fallback to 'general' if category is null
      setMessage({ text: `Room created: ${roomId}`, type: 'success' });
    });

    socket.on('roomJoined', ({ roomId, players, category: serverCategory }) => {
      console.log('Joined room:', roomId, 'Players:', players, 'Category:', serverCategory);
      setRoomId(roomId);
      setPlayers(players);
      setCategory(serverCategory || category || 'general'); // Use serverCategory, fallback to local or 'general'
      setMessage({ text: `Joined room: ${roomId}`, type: 'success' });
    });

    socket.on('playerJoined', ({ players }) => {
      console.log('Player joined, updated players:', players);
      setPlayers(players);
      setMessage({ text: `A player joined the room`, type: 'info' });
    });

    socket.on('gameStarted', ({ timeLeft: serverTime, category: serverCategory }) => {
      console.log('Game started, server time:', serverTime, 'Category:', serverCategory);
      setCategory(serverCategory || category || 'general'); // Use serverCategory, fallback to local or 'general'
      setGameStarted(true);
      setCurrentQuestion(0);
      setScore(0);
      setTimeLeft(serverTime || 50);
      setAnswers([]);
      setSelectedAnswer(null);
      setGameOver(false);
      setMessage({ text: 'Game started!', type: 'success' });
    });

    socket.on('updateTimer', ({ timeLeft: serverTime }) => {
      setTimeLeft(serverTime);
    });

    socket.on('gameOver', ({ leaderboard }) => {
      console.log('Received gameOver:', leaderboard);
      setGameOver(true);
      setLeaderboard(leaderboard);
      setMessage({ text: 'Game Over!', type: 'info' });
    });

    socket.on('error', ({ message }) => {
      console.error('Server error:', message);
      setMessage({ text: message, type: 'error' });
    });

    return () => {
      socket.off('roomCreated');
      socket.off('roomJoined');
      socket.off('playerJoined');
      socket.off('gameStarted');
      socket.off('updateTimer');
      socket.off('gameOver');
      socket.off('error');
    };
  }, [socket, category]);

  // Single 50s timer for single-player
  useEffect(() => {
    if (!gameStarted || gameOver || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          console.log('Time expired, setting gameOver');
          setGameOver(true);
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameStarted, gameOver, timeLeft]);

  // Debug gameOver
  useEffect(() => {
    console.log('gameOver state:', gameOver);
  }, [gameOver]);

  // Toggle mute
  const toggleMute = () => {
    setIsMuted((prev) => !prev);
  };

  const handleCategorySelect = (selectedCategory: Category) => {
    setCategory(selectedCategory);
    setMessage(null);
  };

  const handleModeSelect = (selectedMode: 'single' | 'multi') => {
    setMode(selectedMode);
    setMessage(null);
    if (selectedMode === 'single') {
      setGameStarted(true);
      setCurrentQuestion(0);
      setScore(0);
      setTimeLeft(50);
      setAnswers([]);
      setGameOver(false);
    }
  };

  const handleCreateRoom = () => {
    if (socket && category) {
      console.log('Creating room with playerId:', playerId, 'Category:', category);
      socket.emit('createRoom', { playerId, category });
    } else {
      setMessage({ text: socket ? 'Select a category first' : 'Server not connected', type: 'error' });
    }
  };

  const handleJoinRoom = () => {
    if (socket && roomCode) {
      const code = roomCode.toUpperCase();
      console.log('Joining room:', code);
      socket.emit('joinRoom', { roomId: code, playerId });
    }
  };

  const handleStartMultiplayer = () => {
    if (socket && roomId && category) {
      console.log('Starting game in room:', roomId, 'Category:', category);
      socket.emit('startGame', { roomId, category });
    }
  };

  const handleAnswer = (answer: string) => {
    if (selectedAnswer || gameOver || !category) return;

    const question = TRIVIA_QUESTIONS[category][currentQuestion];
    setSelectedAnswer(answer);
    const isCorrect = answer === question.correctAnswer;
    const newScore = isCorrect ? score + 10 : score;
    setScore(newScore);

    // Play sound based on correctness
    if (!isMuted) {
      const sound = isCorrect ? correctSoundRef.current : incorrectSoundRef.current;
      sound.play().catch((e) => console.error(`${isCorrect ? 'Correct' : 'Incorrect'} Sound Error:`, e));
    }

    setAnswers([
      ...answers,
      {
        question: question.question,
        selectedAnswer: answer,
        correctAnswer: question.correctAnswer,
      },
    ]);

    setTimeout(() => {
      if (currentQuestion + 1 < TRIVIA_QUESTIONS[category].length && !gameOver) {
        setCurrentQuestion(currentQuestion + 1);
        setSelectedAnswer(null);
      } else {
        console.log('Last question or game over, setting gameOver');
        setGameOver(true);
      }
    }, 1000);

    if (mode === 'multi' && socket && roomId) {
      socket.emit('submitAnswer', {
        roomId,
        playerId,
        questionIndex: currentQuestion,
        answer,
        score: newScore,
      });
    }
  };

  const handlePlayAgain = () => {
    console.log('Play Again clicked, resetting');
    setGameStarted(true);
    setCurrentQuestion(0);
    setScore(0);
    setTimeLeft(50);
    setAnswers([]);
    setSelectedAnswer(null);
    setGameOver(false);
    setLeaderboard([]);
    setMessage(null);

    if (mode === 'multi' && socket && roomId) {
      socket.emit('startGame', { roomId, category });
    }
  };

  const handleBuyTime = () => {
    if (!address) {
      setMessage({ text: 'Connect wallet to buy time', type: 'error' });
      return;
    }
    setMessage({ text: 'Time purchase not implemented', type: 'info' });
  };

  const handleChangeMode = () => {
    setCategory(null);
    setMode(null);
    setGameStarted(false);
    setCurrentQuestion(0);
    setScore(0);
    setTimeLeft(50);
    setAnswers([]);
    setSelectedAnswer(null);
    setGameOver(false);
    setRoomId(null);
    setPlayers([]);
    setLeaderboard([]);
    setRoomCode('');
    setMessage(null);
  };

  return (
    <div className="trivia-container">
      <div className="trivia-header">
        <h1 className="trivia-title">Trivia Quiz</h1>
        {gameStarted && (
          <>
            <motion.button
              className="button-outline"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleMute}
            >
              {isMuted ? 'Unmute' : 'Mute'}
            </motion.button>
            <div className="game-stats">
              <div className="stat-item">
                <div className="stat-label">Category</div>
                <div className="stat-value">{category ? category.charAt(0).toUpperCase() + category.slice(1) : '-'}</div>
              </div>
              <div className="stat-item">
                <div className="stat-label">Score</div>
                <div className="stat-value">{score}</div>
              </div>
              <div className="stat-item">
                <div className="stat-label">Time Left</div>
                <div className={`stat-value ${timeLeft <= 10 ? 'low-time' : ''}`}>
                  {timeLeft}s
                </div>
              </div>
              <div className="stat-item">
                <div className="stat-label">Question</div>
                <div className="stat-value">{currentQuestion + 1}/10</div>
              </div>
            </div>
          </>
        )}
      </div>

      {message && (
        <div className={`game-message message-${message.type}`}>
          {message.text}
        </div>
      )}

      {!category && (
        <div className="category-selection">
          <h2>Select Category</h2>
          <div className="category-buttons">
            <motion.button
              className="category-button"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleCategorySelect('general')}
            >
              General Knowledge
            </motion.button>
            <motion.button
              className="category-button"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleCategorySelect('entertainment')}
            >
              Entertainment
            </motion.button>
            <motion.button
              className="category-button"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleCategorySelect('football')}
            >
              Football
            </motion.button>
            <motion.button
              className="category-button"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleCategorySelect('science')}
            >
              Science
            </motion.button>
          </div>
        </div>
      )}

      {category && !mode && (
        <div className="mode-selection">
          <h2>Select Game Mode</h2>
          <div className="mode-buttons">
            <motion.button
              className="mode-button"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleModeSelect('single')}
            >
              Single Player
            </motion.button>
            <motion.button
              className="mode-button"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleModeSelect('multi')}
            >
              Multiplayer
            </motion.button>
          </div>
          <button className="button-outline" onClick={handleChangeMode}>
            Change Category
          </button>
        </div>
      )}

      {mode === 'multi' && !roomId && !gameStarted && (
        <div className="multi-setup">
          <h2>Multiplayer Setup - {category ? category.charAt(0).toUpperCase() + category.slice(1) : 'Unknown Category'}</h2>
          <div className="room-options">
            <div className="create-room">
              <h3>Create Room</h3>
              <button className="button-primary" onClick={handleCreateRoom}>
                Create
              </button>
            </div>
            <div className="room-divider">OR</div>
            <div className="join-room">
              <h3>Join Room</h3>
              <input
                type="text"
                className="room-code-input"
                placeholder="Enter Room Code"
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value)}
              />
              <button className="button-primary" onClick={handleJoinRoom}>
                Join
              </button>
            </div>
          </div>
          <button className="button-outline" onClick={handleChangeMode}>
            Change Category
          </button>
        </div>
      )}

      {mode === 'multi' && roomId && !gameStarted && (
        <div className="waiting-room">
          <h2>
            Waiting Room - {category ? category.charAt(0).toUpperCase() + category.slice(1) : 'Unknown Category'}
          </h2>
          <div className="room-code-display">
            <p>Room Code:</p>
            <div className="code-box">{roomId}</div>
          </div>
          <div className="player-count">Players: {players.length}</div>
          <button className="start-button" onClick={handleStartMultiplayer}>
            Start Game
          </button>
          <button className="button-outline" onClick={handleChangeMode}>
            Change Category
          </button>
        </div>
      )}

      {gameStarted && !gameOver && category && (
        <div className="game-board">
          <h2 className="trivia-question">{TRIVIA_QUESTIONS[category][currentQuestion].question}</h2>
          <div className="trivia-answers">
            {TRIVIA_QUESTIONS[category][currentQuestion].options.map((option, index) => (
              <motion.button
                key={index}
                className={`answer-button ${
                  selectedAnswer === option
                    ? option === TRIVIA_QUESTIONS[category][currentQuestion].correctAnswer
                      ? 'correct'
                      : 'incorrect'
                    : ''
                } ${selectedAnswer ? 'disabled' : ''}`}
                onClick={() => handleAnswer(option)}
                disabled={!!selectedAnswer}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {option}
              </motion.button>
            ))}
          </div>
        </div>
      )}

      <AnimatePresence>
        {gameOver && (
          <motion.div
            className="game-over-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="game-over-modal"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
            >
              <h2>Game Over!</h2>
              <div className="score-display">
                <div className="final-score">
                  Final Score: <span className="score-value">{score}</span>
                </div>
                <div className="stats">
                  Questions Answered: {answers.length}
                  <br />
                  Correct Answers: {answers.filter(a => a.selectedAnswer === a.correctAnswer).length}
                </div>
              </div>
              <div className="trivia-results-table">
                <table>
                  <thead>
                    <tr>
                      <th>Question</th>
                      <th>Your Answer</th>
                      <th>Correct Answer</th>
                    </tr>
                  </thead>
                  <tbody>
                    {answers.map((answer, index) => (
                      <tr key={index}>
                        <td>{answer.question}</td>
                        <td className={answer.selectedAnswer === answer.correctAnswer ? 'correct' : 'incorrect'}>
                          {answer.selectedAnswer}
                        </td>
                        <td>{answer.correctAnswer}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {mode === 'multi' && leaderboard.length > 0 && (
                <div className="leaderboard">
                  <h3>Leaderboard</h3>
                  <div className="leaderboard-list">
                    {leaderboard.map((entry, index) => (
                      <div
                        key={index}
                        className={`leaderboard-item ${entry.playerId === playerId ? 'you' : ''}`}
                      >
                        <span className="rank">{index + 1}</span>
                        <span className="player-id">
                          {entry.playerId === playerId ? 'You' : entry.playerId.slice(0, 6)}
                        </span>
                        <span className="player-score">{entry.score}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <div className="game-over-actions">
                <motion.button
                  className="button-primary"
                  onClick={handlePlayAgain}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Play Again
                </motion.button>
                {mode === 'single' && (
                  <motion.button
                    className="button-secondary"
                    onClick={handleBuyTime}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Buy 15s
                  </motion.button>
                )}
                <motion.button
                  className="button-outline"
                  onClick={handleChangeMode}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Change Category
                </motion.button>
                {mode === 'multi' && (
                  <motion.button
                    className="button-reward"
                    onClick={() => alert('Claim Reward')}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Claim Reward
                  </motion.button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TriviaQuiz;