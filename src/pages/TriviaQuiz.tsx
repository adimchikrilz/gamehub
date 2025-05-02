import React, { useState, useEffect, useRef, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import '../styles.css';
import genieLogo from '../assets/genie.png';
import { useNavigate } from 'react-router-dom';
import level1 from '../assets/level1.png';
import level2 from '../assets/level2.png';
import level3 from '../assets/level3.png';
import level4 from '../assets/level4.png';
import level5 from '../assets/level5.png';
import level6 from '../assets/level6.png';
import level7 from '../assets/level7.png';
import level8 from '../assets/level8.png';

// Category icons
import tvIcon from '../assets/movies.png'; // Clapperboard
import foodIcon from '../assets/foods.png'; // Plate with fork and knife
import sportsIcon from '../assets/sports.png'; // Trophy
import literatureIcon from '../assets/general.png'; // Book
import geographyIcon from '../assets/science.png'; // Globe

// Audio imports
import triviaBg from '../assets/audio/quiz-bg.mp3';
import correctSound from '../assets/audio/correct-answer.mp3';
import incorrectSound from '../assets/audio/incorrect-answer.mp3';
import gameOverSound from '../assets/audio/game-over.wav';
import clickSound from '../assets/audio/button-click.mp3';
import backgroundImage from '../assets/score.png';

// Define levelImages with a numeric index signature
const levelImages: { [key: number]: string } = {
  1: level1,
  2: level2,
  3: level3,
  4: level4,
  5: level5,
  6: level6,
  7: level7,
  8: level8,
};

// Define categoryImages for mapping categories to their icons
const categoryImages: { [key: string]: string } = {
  nature: '', // No image provided; will use placeholder
  sports: sportsIcon,
  geography: geographyIcon,
  tv: tvIcon,
  literature: literatureIcon,
  food: foodIcon,
};

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

type Category = 'nature' | 'sports' | 'geography' | 'tv' | 'literature' | 'food';
type Difficulty = 'easy' | 'medium' | 'hard';
type GameMode = 'single' | 'multiplayer' | null;
type MultiplayerScreen = 'menu' | 'create-or-join' | 'create-room-setup' | 'create-room' | 'join-room' | 'countdown' | 'game' | 'results' | null;

interface CategoryQuestions {
  [key: string]: Question[];
}

const TRIVIA_QUESTIONS: CategoryQuestions = {
  nature: [
    {
      question: 'What is the largest mammal in the world?',
      options: ['Elephant', 'Blue Whale', 'Giraffe', 'Polar Bear'],
      correctAnswer: 'Blue Whale',
    },
    {
      question: 'Which animal is known as the "King of the Jungle"?',
      options: ['Tiger', 'Lion', 'Elephant', 'Gorilla'],
      correctAnswer: 'Lion',
    },
    {
      question: 'What gas do plants absorb from the air?',
      options: ['Oxygen', 'Nitrogen', 'Carbon Dioxide', 'Argon'],
      correctAnswer: 'Carbon Dioxide',
    },
    {
      question: 'What is the tallest species of tree?',
      options: ['Oak', 'Pine', 'Redwood', 'Baobab'],
      correctAnswer: 'Redwood',
    },
    {
      question: 'Which bird is known for its black and white stripes?',
      options: ['Penguin', 'Zebra Finch', 'Ostrich', 'Flamingo'],
      correctAnswer: 'Zebra Finch',
    },
    {
      question: 'What is the primary source of energy for Earth’s climate system?',
      options: ['The Moon', 'The Sun', 'Geothermal Heat', 'Ocean Currents'],
      correctAnswer: 'The Sun',
    },
  ],
  sports: [
    {
      question: 'Which country won the FIFA World Cup in 2018?',
      options: ['Brazil', 'Germany', 'France', 'Argentina'],
      correctAnswer: 'France',
    },
    {
      question: 'What is the nickname of the England national football team?',
      options: ['Three Lions', 'Red Devils', 'Blues', 'Eagles'],
      correctAnswer: 'Three Lions',
    },
    {
      question: 'Which sport uses a shuttlecock?',
      options: ['Tennis', 'Badminton', 'Squash', 'Table Tennis'],
      correctAnswer: 'Badminton',
    },
    {
      question: 'How many players are on a basketball team on the court?',
      options: ['5', '6', '7', '11'],
      correctAnswer: '5',
    },
    {
      question: 'Which city hosts the Wimbledon Championships?',
      options: ['London', 'Paris', 'New York', 'Melbourne'],
      correctAnswer: 'London',
    },
    {
      question: 'What color card is shown for a serious foul in football?',
      options: ['Yellow', 'Red', 'Green', 'Blue'],
      correctAnswer: 'Red',
    },
  ],
  geography: [
    {
      question: 'What is the capital of France?',
      options: ['Paris', 'London', 'Berlin', 'Madrid'],
      correctAnswer: 'Paris',
    },
    {
      question: 'Which continent is the Sahara Desert located in?',
      options: ['Asia', 'Africa', 'Australia', 'South America'],
      correctAnswer: 'Africa',
    },
    {
      question: 'What is the longest river in the world?',
      options: ['Amazon', 'Nile', 'Yangtze', 'Mississippi'],
      correctAnswer: 'Nile',
    },
    {
      question: 'Which country has the most deserts?',
      options: ['Australia', 'China', 'USA', 'Antarctica'],
      correctAnswer: 'Antarctica',
    },
    {
      question: 'What is the smallest country in the world?',
      options: ['Monaco', 'Vatican City', 'San Marino', 'Liechtenstein'],
      correctAnswer: 'Vatican City',
    },
    {
      question: 'Which country hosted the 2016 Olympics?',
      options: ['China', 'Brazil', 'UK', 'Japan'],
      correctAnswer: 'Brazil',
    },
  ],
  tv: [
    {
      question: 'Which TV show features the character Walter White?',
      options: ['The Sopranos', 'Breaking Bad', 'Mad Men', 'The Wire'],
      correctAnswer: 'Breaking Bad',
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
      question: 'Who voiced Mufasa in the 1994 "The Lion King"?',
      options: ['James Earl Jones', 'Morgan Freeman', 'Samuel L. Jackson', 'Denzel Washington'],
      correctAnswer: 'James Earl Jones',
    },
  ],
  literature: [
    {
      question: 'Who wrote the play "Romeo and Juliet"?',
      options: ['William Shakespeare', 'Charles Dickens', 'Jane Austen', 'Mark Twain'],
      correctAnswer: 'William Shakespeare',
    },
    {
      question: 'Who wrote "To Kill a Mockingbird"?',
      options: ['Harper Lee', 'J.K. Rowling', 'Ernest Hemingway', 'Mark Twain'],
      correctAnswer: 'Harper Lee',
    },
    {
      question: 'What is the first book in the "Harry Potter" series?',
      options: ['Chamber of Secrets', 'Philosopher’s Stone', 'Prisoner of Azkaban', 'Goblet of Fire'],
      correctAnswer: 'Philosopher’s Stone',
    },
    {
      question: 'Who wrote "Pride and Prejudice"?',
      options: ['Emily Brontë', 'Jane Austen', 'Charlotte Brontë', 'George Eliot'],
      correctAnswer: 'Jane Austen',
    },
    {
      question: 'Which author created the character Sherlock Holmes?',
      options: ['Agatha Christie', 'Arthur Conan Doyle', 'Edgar Allan Poe', 'Raymond Chandler'],
      correctAnswer: 'Arthur Conan Doyle',
    },
    {
      question: 'What is the name of the hobbit in "The Lord of the Rings"?',
      options: ['Bilbo Baggins', 'Gandalf', 'Aragorn', 'Legolas'],
      correctAnswer: 'Bilbo Baggins',
    },
  ],
  food: [
    {
      question: 'What is the main ingredient in guacamole?',
      options: ['Tomato', 'Avocado', 'Onion', 'Pepper'],
      correctAnswer: 'Avocado',
    },
    {
      question: 'Which country is famous for sushi?',
      options: ['China', 'Japan', 'Thailand', 'Vietnam'],
      correctAnswer: 'Japan',
    },
    {
      question: 'What type of pasta is shaped like small ears?',
      options: ['Spaghetti', 'Orecchiette', 'Fusilli', 'Penne'],
      correctAnswer: 'Orecchiette',
    },
    {
      question: 'What is the primary ingredient in hummus?',
      options: ['Chickpeas', 'Lentils', 'Beans', 'Peas'],
      correctAnswer: 'Chickpeas',
    },
    {
      question: 'Which fruit is known as the "king of fruits"?',
      options: ['Mango', 'Durian', 'Pineapple', 'Banana'],
      correctAnswer: 'Durian',
    },
    {
      question: 'What is the main ingredient in a traditional French baguette?',
      options: ['Rice Flour', 'Wheat Flour', 'Cornmeal', 'Rye Flour'],
      correctAnswer: 'Wheat Flour',
    },
  ],
};

const QUESTIONS_PER_LEVEL: { [key: number]: number } = {
  1: 4,
  2: 6,
  3: 8,
  4: 10,
};

const TriviaQuiz: React.FC = () => {
  const [gameMode, setGameMode] = useState<GameMode>(null);
  const [category, setCategory] = useState<Category | null>(null);
  const [difficulty, setDifficulty] = useState<Difficulty | null>(null);
  const [activeDifficulty, setActiveDifficulty] = useState<Difficulty>('easy');
  const [level, setLevel] = useState(1);
  const [gameStarted, setGameStarted] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [totalScore, setTotalScore] = useState(0);
  const [opponentScore, setOpponentScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [gameOver, setGameOver] = useState(false);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);
  const [levelComplete, setLevelComplete] = useState(false);
  const [stars, setStars] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [showLevelSelection, setShowLevelSelection] = useState(false);
  const [multiplayerScreen, setMultiplayerScreen] = useState<MultiplayerScreen>(null);
  const [roomCode, setRoomCode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [playersReady, setPlayersReady] = useState(false);
  const navigate = useNavigate();

  // Audio refs
  const bgMusicRef = useRef(new Audio(triviaBg));
  const correctSoundRef = useRef(new Audio(correctSound));
  const incorrectSoundRef = useRef(new Audio(incorrectSound));
  const gameOverSoundRef = useRef(new Audio(gameOverSound));
  const clickSoundRef = useRef(new Audio(clickSound));
  const bgImageWidth = 100;
  const bgImageHeight = 40;

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

  // Timer for each question (1 minute)
  useEffect(() => {
    if (!gameStarted || gameOver || timeLeft <= 0 || feedback || levelComplete) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setFeedback('incorrect');
          setAnswers((prevAnswers) => [
            ...prevAnswers,
            {
              question: TRIVIA_QUESTIONS[category!][currentQuestion].question,
              selectedAnswer: 'Time Out',
              correctAnswer: TRIVIA_QUESTIONS[category!][currentQuestion].correctAnswer,
            },
          ]);
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameStarted, gameOver, feedback, levelComplete, category, currentQuestion]);

  // Toggle mute
  const toggleMute = () => {
    if (!isMuted) {
      clickSoundRef.current.play().catch((e) => console.error('Click Sound Error:', e));
    }
    setIsMuted((prev) => !prev);
  };

  // Function to play click sound on button clicks, disabled during gameplay
  const playClickSound = () => {
    if (!isMuted && !gameStarted) {
      clickSoundRef.current.play().catch((e) => console.error('Click Sound Error:', e));
    }
  };

  const handleGameModeSelect = (mode: GameMode) => {
    setGameMode(mode);
    if (mode === 'single') {
      setShowLevelSelection(true);
    } else if (mode === 'multiplayer') {
      setMultiplayerScreen('menu');
    }
  };

  const handleLevelSelect = (selectedLevel: number) => {
    setLevel(selectedLevel);
    setShowLevelSelection(false);
    setCategory(null);
  };

  const handleCategorySelect = (selectedCategory: Category) => {
    setCategory(selectedCategory);
  };

  const handleDifficultySelect = (selectedDifficulty: Difficulty) => {
    setDifficulty(selectedDifficulty);
    setGameStarted(true);
    setTimeLeft(60);
  };

  const handleActiveDifficulty = (selectedDifficulty: Difficulty) => {
    setActiveDifficulty(selectedDifficulty);
  };

  const handleAnswer = (answer: string, isMultiplayer: boolean = false) => {
    if (selectedAnswer || gameOver || !category) return;

    setSelectedAnswer(answer);
    const question = TRIVIA_QUESTIONS[category][currentQuestion];
    const isCorrect = answer === question.correctAnswer;
    const newScore = isCorrect ? score + 500 : score;
    setScore(newScore);
    if (!isMultiplayer) {
      setTotalScore(totalScore + (isCorrect ? 500 : 0));
    }
    setFeedback(isCorrect ? 'correct' : 'incorrect');

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

    if (isMultiplayer) {
      setTimeout(() => {
        const opponentCorrect = Math.random() > 0.5;
        setOpponentScore((prev) => prev + (opponentCorrect ? 500 : 0));
        const questionsInLevel = 6;
        if (currentQuestion + 1 < questionsInLevel) {
          setCurrentQuestion(currentQuestion + 1);
          setSelectedAnswer(null);
          setFeedback(null);
          setTimeLeft(60);
        } else {
          setLevelComplete(true);
          setMultiplayerScreen('results');
        }
      }, 1000);
    } else {
      setTimeout(() => {
        const questionsInLevel = QUESTIONS_PER_LEVEL[level] || 10;
        if (currentQuestion + 1 < questionsInLevel) {
          setCurrentQuestion(currentQuestion + 1);
          setSelectedAnswer(null);
          setFeedback(null);
          setTimeLeft(60);
        } else {
          const correctAnswers = answers.filter(a => a.selectedAnswer === a.correctAnswer).length + (isCorrect ? 1 : 0);
          const starsEarned = Math.min(3, Math.floor((correctAnswers / questionsInLevel) * 3) + 1);
          setStars(starsEarned);
          setLevelComplete(true);
        }
      }, 2000);
    }
  };

  const handleNextLevel = () => {
    setLevel(level + 1);
    setCurrentQuestion(0);
    setScore(0);
    setAnswers([]);
    setSelectedAnswer(null);
    setFeedback(null);
    setLevelComplete(false);
    setTimeLeft(60);
    setStars(0);
  };

  const handleRetryLevel = () => {
    setCurrentQuestion(0);
    setScore(0);
    setAnswers([]);
    setSelectedAnswer(null);
    setFeedback(null);
    setLevelComplete(false);
    setTimeLeft(60);
    setStars(0);
  };

  const handleQuit = () => {
    setGameMode(null);
    setCategory(null);
    setDifficulty(null);
    setLevel(1);
    setGameStarted(false);
    setCurrentQuestion(0);
    setScore(0);
    setOpponentScore(0);
    setTotalScore(15000);
    setAnswers([]);
    setSelectedAnswer(null);
    setFeedback(null);
    setLevelComplete(false);
    setGameOver(false);
    setStars(0);
    setShowLevelSelection(false);
    setActiveDifficulty('easy');
    setMultiplayerScreen(null);
    setRoomCode(null);
    setCopied(false);
    setPlayersReady(false);
  };

  // Animation variants for screen transitions
  const screenVariants = {
    initial: { opacity: 0, x: 50 },
    animate: { opacity: 1, x: 0, transition: { duration: 0.5 } },
    exit: { opacity: 0, x: -50, transition: { duration: 0.5 } },
  };

  // Timer Display Component
  const TimerDisplay = memo(({ timeLeft }: { timeLeft: number }) => (
    <span style={{ fontSize: '16px' }}>
      ⏰ {timeLeft.toString().padStart(2, '0')}:00
    </span>
  ));

  // Multiplayer Menu
  const MultiplayerMenu = () => (
    <motion.div
      key="multiplayer-menu"
      variants={screenVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="multiplayer-menu"
      style={{ textAlign: 'center', padding: '20px' }}
    >
      <h2 style={{ fontSize: '24px', marginBottom: '20px' }}>MULTIPLAYER MODE</h2>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
        <motion.button
          onClick={() => { playClickSound(); setMultiplayerScreen('create-or-join'); }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          style={{
            background: 'linear-gradient(90deg, rgb(13, 88, 25), #FF5733)',
            color: 'white',
            padding: '15px 50px',
            borderRadius: '10px',
            border: 'none',
            fontSize: '18px',
            fontWeight: '500',
            cursor: 'pointer',
            width: '250px',
            fontFamily: 'Athletics',
          }}
        >
          Challenge a Friend
        </motion.button>
        <motion.button
          onClick={() => { playClickSound(); setMultiplayerScreen('game'); setGameStarted(true); setCategory('literature'); }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          style={{
            background: 'linear-gradient(90deg, rgb(13, 88, 25), #FF5733)',
            color: 'white',
            padding: '15px 50px',
            borderRadius: '10px',
            border: 'none',
            fontSize: '18px',
            fontWeight: '500',
            cursor: 'pointer',
            width: '250px',
            fontFamily: 'Athletics',
          }}
        >
          Play with Computer
        </motion.button>
        <motion.button
          onClick={() => { playClickSound(); handleQuit(); }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          style={{
            background: '#32CD32',
            color: 'white',
            padding: '10px 30px',
            borderRadius: '10px',
            border: 'none',
            fontSize: '16px',
            cursor: 'pointer',
          }}
        >
          Back
        </motion.button>
      </div>
    </motion.div>
  );

  // Create or Join Screen
  const CreateOrJoin = () => (
    <motion.div
      key="create-or-join"
      variants={screenVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="create-or-join"
      style={{ textAlign: 'center', padding: '20px' }}
    >
      <h2 style={{ fontSize: '24px', marginBottom: '20px' }}>CHALLENGE A FRIEND</h2>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
        <motion.button
          onClick={() => { playClickSound(); setMultiplayerScreen('create-room-setup'); }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          style={{
            background: 'linear-gradient(90deg, rgb(13, 88, 25), #FF5733)',
            color: 'white',
            padding: '15px 50px',
            borderRadius: '10px',
            border: 'none',
            fontSize: '18px',
            fontWeight: '500',
            cursor: 'pointer',
            width: '250px',
            fontFamily: 'Athletics',
          }}
        >
          Create a Room
        </motion.button>
        <motion.button
          onClick={() => { playClickSound(); setMultiplayerScreen('join-room'); }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          style={{
            background: 'linear-gradient(90deg, rgb(13, 88, 25), #FF5733)',
            color: 'white',
            padding: '15px 50px',
            borderRadius: '10px',
            border: 'none',
            fontSize: '18px',
            fontWeight: '500',
            cursor: 'pointer',
            width: '250px',
            fontFamily: 'Athletics',
          }}
        >
          Join a Room
        </motion.button>
        <motion.button
          onClick={() => { playClickSound(); setMultiplayerScreen('menu'); }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          style={{
            background: '#32CD32',
            color: 'white',
            padding: '10px 30px',
            borderRadius: '10px',
            border: 'none',
            fontSize: '16px',
            cursor: 'pointer',
          }}
        >
          Back
        </motion.button>
      </div>
    </motion.div>
  );

  // Create Room Setup (Category and Difficulty Selection)
  const CreateRoomSetup = () => (
    <motion.div
      key="create-room-setup"
      variants={screenVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="create-room-setup"
      style={{ textAlign: 'center', padding: '20px' }}
    >
      <h2 style={{ fontSize: '24px', marginBottom: '20px' }}>Create a Game Room to Challenge a Friend</h2>
      <h3 style={{ fontSize: '20px', marginBottom: '10px' }}>SELECT CATEGORY</h3>
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          overflowX: 'auto',
          flexWrap: 'nowrap',
          gap: '10px',
          padding: '10px 0',
          marginBottom: '20px',
          scrollBehavior: 'smooth',
          WebkitOverflowScrolling: 'touch',
          scrollbarWidth: 'none' /* For Firefox */,
          msOverflowStyle: 'none' /* For Internet Explorer and Edge */,
        }}
      >
        {/* Hide scrollbar for Webkit browsers (Chrome, Safari) */}
        <style>{`
          div::-webkit-scrollbar {
            display: none;
          }
        `}</style>
        {Object.keys(TRIVIA_QUESTIONS).map((cat) => (
          <div key={cat} style={{ flex: '0 0 auto', textAlign: 'center' }}>
            <span
              style={{
                display: 'block',
                fontSize: '16px',
                fontWeight: 'bold',
                color: '#000',
                marginBottom: '5px',
              }}
            >
              {cat.toUpperCase()}
            </span>
            <motion.button
              onClick={() => { playClickSound(); handleCategorySelect(cat as Category); }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              style={{
                background: category === cat ? '#32CD32' : '#2E8B57',
                color: 'white',
                padding: '10px',
                borderRadius: '10px',
                border: '2px solid #FF5733',
                fontSize: '16px',
                fontWeight: 'bold',
                cursor: 'pointer',
                width: '120px',
                height: '120px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {categoryImages[cat] ? (
                <img
                  src={categoryImages[cat]}
                  alt={cat}
                  style={{ width: '100px', height: '100px', borderRadius: '5px' }}
                />
              ) : (
                // Placeholder for Nature category (no image provided)
                <div
                  style={{
                    width: '100px',
                    height: '100px',
                    background: '#D3D3D3',
                    borderRadius: '5px',
                  }}
                />
              )}
            </motion.button>
          </div>
        ))}
      </div>
      <h3 style={{ fontSize: '20px', marginBottom: '10px' }}>SELECT DIFFICULTY</h3>
      <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginBottom: '20px' }}>
        <motion.button
          onClick={() => { playClickSound(); handleActiveDifficulty('easy'); }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          style={{
            background: activeDifficulty === 'easy' ? 'linear-gradient(90deg, #8B4513, #FF5733)' : '#A9A9A9',
            color: 'white',
            padding: '15px 50px',
            borderRadius: '10px',
            border: 'none',
            fontSize: '16px',
            fontWeight: 'bold',
            cursor: 'pointer',
          }}
        >
          Easy
        </motion.button>
        <motion.button
          onClick={() => { playClickSound(); handleActiveDifficulty('medium'); }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          style={{
            background: activeDifficulty === 'medium' ? 'linear-gradient(90deg, #8B4513, #FF5733)' : '#A9A9A9',
            color: 'white',
            padding: '15px 50px',
            borderRadius: '10px',
            border: 'none',
            fontSize: '16px',
            fontWeight: 'bold',
            cursor: 'pointer',
          }}
        >
          Medium
        </motion.button>
        <motion.button
          onClick={() => { playClickSound(); handleActiveDifficulty('hard'); }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          style={{
            background: activeDifficulty === 'hard' ? 'linear-gradient(90deg, #8B4513, #FF5733)' : '#A9A9A9',
            color: 'white',
            padding: '15px 50px',
            borderRadius: '10px',
            border: 'none',
            fontSize: '16px',
            fontWeight: 'bold',
            cursor: 'pointer',
          }}
        >
          Hard
        </motion.button>
      </div>
      <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
        <motion.button
          onClick={() => { playClickSound(); setMultiplayerScreen('create-or-join'); }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          style={{
            background: '#32CD32',
            color: 'white',
            padding: '10px 30px',
            borderRadius: '10px',
            border: 'none',
            fontSize: '16px',
            cursor: 'pointer',
          }}
        >
          Back
        </motion.button>
        <motion.button
          onClick={() => {
            if (category) {
              playClickSound();
              setDifficulty(activeDifficulty);
              setRoomCode(Math.floor(100000000 + Math.random() * 900000000).toString());
              setMultiplayerScreen('create-room');
            }
          }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          style={{
            background: category ? '#32CD32' : '#A9A9A9',
            color: 'white',
            padding: '15px 50px',
            borderRadius: '10px',
            border: 'none',
            fontSize: '16px',
            cursor: category ? 'pointer' : 'not-allowed',
          }}
        >
          Create Game Room
        </motion.button>
      </div>
    </motion.div>
  );

  // Create Room
  const CreateRoom = () => {
    const handleCopyCode = () => {
      if (roomCode) {
        navigator.clipboard.writeText(roomCode).then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        });
      }
    };

    // Simulate Player 2 joining (for testing purposes)
    const handleSimulatePlayer2Join = () => {
      setPlayersReady(true);
      setMultiplayerScreen('countdown');
    };

    return (
      <motion.div
        key="create-room"
        variants={screenVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        className="create-room"
        style={{ textAlign: 'center', padding: '20px' }}
      >
        <h2 style={{ fontSize: '24px', marginBottom: '20px' }}>Game Room Link</h2>
        <div
          onClick={handleCopyCode}
          style={{
            background: '#e0e0e0',
            padding: '10px 20px',
            borderRadius: '5px',
            fontSize: '24px',
            marginBottom: '20px',
            cursor: 'pointer',
            position: 'relative',
            userSelect: 'none',
          }}
        >
          {roomCode}
          {copied && (
            <span
              style={{
                position: 'absolute',
                top: '-30px',
                left: '50%',
                transform: 'translateX(-50%)',
                background: '#32CD32',
                color: 'white',
                padding: '5px 10px',
                borderRadius: '5px',
                fontSize: '14px',
              }}
            >
              Copied!
            </span>
          )}
        </div>
        <p>Waiting for Player 2 to join.</p>
        {/* Simulate Player 2 joining for testing */}
        <motion.button
          onClick={handleSimulatePlayer2Join}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          style={{
            background: '#FFD700',
            color: 'black',
            padding: '10px 30px',
            borderRadius: '10px',
            border: 'none',
            fontSize: '16px',
            cursor: 'pointer',
            marginTop: '10px',
          }}
        >
          Simulate Player 2 Join (For Testing)
        </motion.button>
        <motion.button
          onClick={() => { playClickSound(); setMultiplayerScreen('create-room-setup'); setRoomCode(null); }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          style={{
            background: '#32CD32',
            color: 'white',
            padding: '10px 30px',
            borderRadius: '10px',
            border: 'none',
            fontSize: '16px',
            cursor: 'pointer',
            marginTop: '20px',
          }}
        >
          Cancel
        </motion.button>
      </motion.div>
    );
  };

  // Join Room
  const JoinRoom = () => {
    const [inputCode, setInputCode] = useState('');

    const handleJoin = () => {
      if (inputCode) {
        setRoomCode(inputCode);
        setPlayersReady(true);
        setMultiplayerScreen('countdown');
      }
    };

    return (
      <motion.div
        key="join-room"
        variants={screenVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        className="join-room"
        style={{ textAlign: 'center', padding: '20px' }}
      >
        <h2 style={{ fontSize: '24px', marginBottom: '20px' }}>Enter Game Room Link</h2>
        <input
          type="text"
          value={inputCode}
          onChange={(e) => setInputCode(e.target.value)}
          placeholder="Enter Game Room Link"
          style={{
            padding: '10px',
            borderRadius: '5px',
            border: '1px solid #ccc',
            fontSize: '16px',
            width: '200px',
            marginBottom: '20px',
          }}
        />
        <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
          <motion.button
            onClick={() => { playClickSound(); setMultiplayerScreen('create-or-join'); }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            style={{
              background: '#32CD32',
              color: 'white',
              padding: '10px 30px',
              borderRadius: '10px',
              border: 'none',
              fontSize: '16px',
              cursor: 'pointer',
            }}
          >
            Back
          </motion.button>
          <motion.button
            onClick={() => { playClickSound(); handleJoin(); }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            style={{
              background: '#32CD32',
              color: 'white',
              padding: '10px 30px',
              borderRadius: '10px',
              border: 'none',
              fontSize: '16px',
              cursor: 'pointer',
            }}
          >
            Join
          </motion.button>
        </div>
      </motion.div>
    );
  };

  // Countdown
  const Countdown = () => {
    const [count, setCount] = useState(3);

    useEffect(() => {
      if (count === 0) {
        setMultiplayerScreen('game');
        setGameStarted(true);
        if (!category) setCategory('literature');
        return;
      }
      const timer = setInterval(() => {
        setCount((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    }, [count]);

    return (
      <motion.div
        key="countdown"
        variants={screenVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        className="countdown"
        style={{ textAlign: 'center', padding: '20px' }}
      >
        <h1 style={{ fontSize: '48px', color: '#FF5733' }}>{count}</h1>
      </motion.div>
    );
  };

  // Multiplayer Game Board
  const MultiplayerGameBoard = memo(() => (
    <motion.div
      key={`multiplayer-question-${currentQuestion}`}
      variants={screenVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="multiplayer-game-board"
      style={{ padding: '20px', textAlign: 'center' }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ background: '#FFD700', padding: '5px 15px', borderRadius: '10px' }}>You: {score}</span>
        </div>
        <TimerDisplay timeLeft={timeLeft} />
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ background: '#FFD700', padding: '5px 15px', borderRadius: '10px' }}>geeky32: {opponentScore}</span>
        </div>
      </div>
      <div style={{ border: '2px solid #000', borderRadius: '10px', padding: '20px', background: 'white', marginBottom: '20px' }}>
        <h2 style={{ fontSize: '20px', margin: 0 }}>Question {currentQuestion + 1} of 6</h2>
        <p>{TRIVIA_QUESTIONS[category!][currentQuestion].question}</p>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '20px' }}>
        {TRIVIA_QUESTIONS[category!][currentQuestion].options.map((option, index) => (
          <motion.button
            key={index}
            onClick={() => handleAnswer(option, true)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            style={{
              background: feedback
                ? option === TRIVIA_QUESTIONS[category!][currentQuestion].correctAnswer
                  ? '#32CD32'
                  : option === selectedAnswer
                  ? '#FF0000'
                  : 'white'
                : 'white',
              border: '2px solid #000',
              borderRadius: '10px',
              padding: '15px',
              fontSize: '16px',
              cursor: feedback ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
            }}
          >
            <span style={{ background: '#D3D3D3', borderRadius: '50%', width: '30px', height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {String.fromCharCode(65 + index)}
            </span>
            {option}
          </motion.button>
        ))}
      </div>
      {feedback && (
        <div style={{ background: feedback === 'correct' ? '#90EE90' : '#FFB6C1', padding: '10px', borderRadius: '10px' }}>
          <span style={{ fontSize: '18px', fontWeight: 'bold' }}>
            {feedback === 'correct' ? '✅ Correct!' : '❌ Oops.. you got that wrong.'}
          </span>
          <p>{feedback === 'correct' ? '' : `The correct answer is "${TRIVIA_QUESTIONS[category!][currentQuestion].correctAnswer}".`}</p>
        </div>
      )}
    </motion.div>
  ));

  // Game Results
  const GameResults = () => {
    const yourCorrect = answers.filter(a => a.selectedAnswer === a.correctAnswer).length;
    const opponentCorrect = Math.floor(opponentScore / 500);
    let result = 'DRAW!';
    let image = '/assets/handshake.png';
    let message = "That was a long one. Let's have a rematch.";
    let backgroundStyle = {};

    if (score > opponentScore) {
      result = 'YOU WIN!';
      image = '/assets/trophy.png';
      message = 'You are the master of trivia!';
      backgroundStyle = { background: 'url(/assets/confetti.png) repeat' };
    } else if (score < opponentScore) {
      result = 'YOU LOSE!';
      image = '/assets/pizza.png';
      message = "You weren't fast enough, but here's a slice of pizza for your effort.";
    }

    return (
      <motion.div
        key="game-results"
        variants={screenVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        className="game-results"
        style={{ textAlign: 'center', padding: '20px', ...backgroundStyle }}
      >
        <h1 style={{ fontSize: '24px', marginBottom: '20px' }}>{result}</h1>
        <img src={image} alt="Result Image" style={{ maxWidth: '100px', marginBottom: '20px' }} />
        <p style={{ fontSize: '18px', marginBottom: '20px' }}>{message}</p>
        <div style={{ display: 'flex', justifyContent: 'space-around', marginBottom: '20px' }}>
          <div>
            <h3>YOUR SCORE</h3>
            <p>{score}</p>
            <p>Total right: {yourCorrect}/6</p>
          </div>
          <div>
            <h3>OPPONENT SCORE</h3>
            <p>{opponentScore}</p>
            <p>Total right: {opponentCorrect}/6</p>
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
          <motion.button
            onClick={() => { playClickSound(); setMultiplayerScreen('create-room'); setGameStarted(false); setCurrentQuestion(0); setScore(0); setOpponentScore(0); setAnswers([]); setSelectedAnswer(null); setFeedback(null); setLevelComplete(false); setTimeLeft(60); setRoomCode(Math.floor(100000000 + Math.random() * 900000000).toString()); }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            style={{
              background: '#32CD32',
              color: 'white',
              padding: '15px 50px',
              borderRadius: '10px',
              border: 'none',
              fontSize: '16px',
              cursor: 'pointer',
            }}
          >
            Create New Game Room
          </motion.button>
          <motion.button
            onClick={() => { playClickSound(); handleQuit(); }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            style={{
              background: '#32CD32',
              color: 'white',
              padding: '15px 50px',
              borderRadius: '10px',
              border: 'none',
              fontSize: '16px',
              cursor: 'pointer',
            }}
          >
            Back to Home
          </motion.button>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="trivia-container" style={{ background: 'linear-gradient(180deg, #FFF5E6 0%, #FFEFD5 100%)', minHeight: '100vh', fontFamily: 'Arial, sans-serif' }}>
      <div className="trivia-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <img 
            src={genieLogo} 
            alt="Genie" 
            className="trivia-logo" 
            style={{ 
              height: '70px',
              margin: 0 
            }} 
          />
        </div>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div style={{ 
            background: `url(${backgroundImage}) no-repeat center center/cover`,
            padding: '5px 15px',
            borderRadius: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: '10px',
            minWidth: `${bgImageWidth}px`,
            height: `${bgImageHeight}px`,
            backgroundSize: '100% 100%'
          }}>
            <span style={{
              color: 'white',
              fontFamily: 'Bagel Fat One',
              paddingLeft: '20px'
            }}>{totalScore}</span>
          </div>
          <button onClick={() => { playClickSound(); toggleMute(); }} style={{ background: 'none', border: 'none', fontSize: '16px' }}>
            {isMuted ? '🔇' : '🔊'}
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {!gameMode && (
          <motion.div
            key="main-menu"
            variants={screenVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="main-menu"
            style={{ textAlign: 'center', padding: '20px' }}
          >
            <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginBottom: '20px', marginTop: '50px' }}>
              <motion.button
                onClick={() => { playClickSound(); handleGameModeSelect('single'); }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                style={{
                  background: 'transparent',
                  color: '#FF5733',
                  padding: '15px 50px',
                  border: '2px solid #FF5733',
                  borderRadius: '10px',
                  fontSize: '18px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                }}
              >
                Single Player
              </motion.button>
              <motion.button
                onClick={() => { playClickSound(); handleGameModeSelect('multiplayer'); }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                style={{
                  background: 'transparent',
                  color: '#FF5733',
                  padding: '15px 50px',
                  border: '2px solid #FF5733',
                  borderRadius: '10px',
                  fontSize: '18px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                }}
              >
                Multiplayer
              </motion.button>
            </div>
            <div style={{ borderTop: '2px dashed #000', margin: '20px 0' }} />
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
              <motion.button
                onClick={() => {
                  playClickSound();
                  navigate('/how-to-play');
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                style={{
                  background: 'linear-gradient(90deg, rgb(13, 88, 25), #FF5733)',
                  color: 'white',
                  padding: '15px 50px',
                  borderRadius: '10px',
                  border: 'none',
                  fontSize: '18px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  width: '250px',
                  fontFamily: 'Athletics'
                }}
              >
                How to Play
              </motion.button>
              <motion.button
                onClick={() => playClickSound()}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                style={{
                  background: 'linear-gradient(90deg, rgb(13, 88, 25), #FF5733)',
                  color: 'white',
                  padding: '15px 50px',
                  borderRadius: '10px',
                  border: 'none',
                  fontSize: '18px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  width: '250px',
                  fontFamily: 'Athletics'
                }}
              >
                Leaderboard
              </motion.button>
              <motion.button
                onClick={() => playClickSound()}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                style={{
                  background: 'linear-gradient(90deg, rgb(13, 88, 25), #FF5733)',
                  color: 'white',
                  padding: '15px 50px',
                  borderRadius: '10px',
                  border: 'none',
                  fontSize: '18px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  width: '250px',
                  fontFamily: 'Athletics'
                }}
              >
                Settings
              </motion.button>
              <motion.button
                onClick={() => playClickSound()}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                style={{
                  background: 'linear-gradient(90deg,rgb(13, 88, 25), #FF5733)',
                  color: 'white',
                  padding: '15px 50px',
                  borderRadius: '10px',
                  border: 'none',
                  fontSize: '18px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  width: '250px',
                  fontFamily: 'Athletics'
                }}
              >
                Exit Game
              </motion.button>
            </div>
          </motion.div>
        )}

        {gameMode === 'single' && showLevelSelection && (
          <motion.div
            key="level-selection"
            variants={screenVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="level-selection"
            style={{ textAlign: 'center', padding: '20px' }}
          >
            <h2 style={{ fontSize: '24px', marginBottom: '20px' }}>SELECT GAME LEVEL</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', marginBottom: '20px' }}>
              {[1, 2, 3, 4, 5, 6, 7, 8].map((lvl) => (
                <motion.img
                  key={lvl}
                  src={levelImages[lvl]}
                  alt={`Level ${lvl}`}
                  onClick={() => {
                    if (lvl <= level) {
                      playClickSound();
                      handleLevelSelect(lvl);
                    }
                  }}
                  whileHover={{ scale: lvl <= level ? 1.05 : 1 }}
                  whileTap={{ scale: lvl <= level ? 0.95 : 1 }}
                  style={{
                    width: '80px',
                    height: '80px',
                    cursor: lvl <= level ? 'pointer' : 'not-allowed',
                    opacity: lvl <= level ? 1 : 0.6,
                  }}
                />
              ))}
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
              <motion.button
                onClick={() => { playClickSound(); setShowLevelSelection(false); }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                style={{
                  background: '#32CD32',
                  color: 'white',
                  padding: '10px 30px',
                  borderRadius: '10px',
                  border: 'none',
                  fontSize: '16px',
                  cursor: 'pointer',
                }}
              >
                Back
              </motion.button>
            </div>
          </motion.div>
        )}

        {gameMode === 'single' && !showLevelSelection && !category && (
          <motion.div
            key="category-selection"
            variants={screenVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="category-selection"
            style={{ textAlign: 'center', padding: '20px' }}
          >
            <h2 style={{ fontSize: '24px', marginBottom: '20px' }}>SELECT CATEGORY</h2>
            <div
              style={{
                display: 'flex',
                flexDirection: 'row',
                overflowX: 'auto',
                flexWrap: 'nowrap',
                gap: '10px',
                padding: '10px 0',
                marginBottom: '20px',
                scrollBehavior: 'smooth',
                WebkitOverflowScrolling: 'touch',
                scrollbarWidth: 'none' /* For Firefox */,
                msOverflowStyle: 'none' /* For Internet Explorer and Edge */,
              }}
            >
              {/* Hide scrollbar for Webkit browsers (Chrome, Safari) */}
              <style>{`
                div::-webkit-scrollbar {
                  display: none;
                }
              `}</style>
              {Object.keys(TRIVIA_QUESTIONS).map((cat) => (
                <div key={cat} style={{ flex: '0 0 auto', textAlign: 'center' }}>
                  <span
                    style={{
                      display: 'block',
                      fontSize: '16px',
                      fontWeight: 'bold',
                      color: '#000',
                      marginBottom: '5px',
                    }}
                  >
                    {cat.toUpperCase()}
                  </span>
                  <motion.button
                    onClick={() => { playClickSound(); handleCategorySelect(cat as Category); }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    style={{
                      background: category === cat ? '#32CD32' : '#2E8B57',
                      color: 'white',
                      padding: '10px',
                      borderRadius: '10px',
                      border: '2px solid #FF5733',
                      fontSize: '16px',
                      fontWeight: 'bold',
                      cursor: 'pointer',
                      width: '120px',
                      height: '120px',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {categoryImages[cat] ? (
                      <img
                        src={categoryImages[cat]}
                        alt={cat}
                        style={{ width: '100px', height: '100px', borderRadius: '5px' }}
                      />
                    ) : (
                      // Placeholder for Nature category (no image provided)
                      <div
                        style={{
                          width: '100px',
                          height: '100px',
                          background: '#D3D3D3',
                          borderRadius: '5px',
                        }}
                      />
                    )}
                  </motion.button>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginTop: '20px' }}>
              <motion.button
                onClick={() => { playClickSound(); setShowLevelSelection(true); }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                style={{
                  background: '#32CD32',
                  color: 'white',
                  padding: '10px 30px',
                  borderRadius: '10px',
                  border: 'none',
                  fontSize: '16px',
                  cursor: 'pointer',
                }}
              >
                Back
              </motion.button>
            </div>
          </motion.div>
        )}

        {gameMode === 'single' && category && !difficulty && (
          <motion.div
            key="difficulty-selection"
            variants={screenVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="difficulty-selection"
            style={{ textAlign: 'center', padding: '20px' }}
          >
            <h2 style={{ fontSize: '24px', marginBottom: '20px' }}>SELECT DIFFICULTY</h2>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
              <motion.button
                onClick={() => { playClickSound(); handleActiveDifficulty('easy'); }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                style={{
                  background: activeDifficulty === 'easy' ? 'linear-gradient(90deg, #8B4513, #FF5733)' : '#A9A9A9',
                  color: 'white',
                  padding: '15px 50px',
                  borderRadius: '10px',
                  border: 'none',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  width: '200px',
                }}
              >
                Easy
              </motion.button>
              <motion.button
                onClick={() => { playClickSound(); handleActiveDifficulty('medium'); }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                style={{
                  background: activeDifficulty === 'medium' ? 'linear-gradient(90deg, #8B4513, #FF5733)' : '#A9A9A9',
                  color: 'white',
                  padding: '15px 50px',
                  borderRadius: '10px',
                  border: 'none',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  width: '200px',
                }}
              >
                Medium
              </motion.button>
              <motion.button
                onClick={() => { playClickSound(); handleActiveDifficulty('hard'); }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                style={{
                  background: activeDifficulty === 'hard' ? 'linear-gradient(90deg, #8B4513, #FF5733)' : '#A9A9A9',
                  color: 'white',
                  padding: '15px 50px',
                  borderRadius: '10px',
                  border: 'none',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  width: '200px',
                }}
              >
                Hard
              </motion.button>
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginTop: '20px' }}>
              <motion.button
                onClick={() => { playClickSound(); setCategory(null); }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: '0.95' }}
                style={{
                  background: '#32CD32',
                  color: 'white',
                  padding: '10px 30px',
                  borderRadius: '10px',
                  border: 'none',
                  fontSize: '16px',
                  cursor: 'pointer',
                }}
              >
                Back
              </motion.button>
              <motion.button
                onClick={() => { playClickSound(); handleDifficultySelect(activeDifficulty); }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                style={{
                  background: '#32CD32',
                  color: 'white',
                  padding: '10px 30px',
                  borderRadius: '10px',
                  border: 'none',
                  fontSize: '16px',
                  cursor: 'pointer',
                }}
              >
                Next
              </motion.button>
            </div>
          </motion.div>
        )}

        {gameMode === 'multiplayer' && multiplayerScreen === 'menu' && <MultiplayerMenu />}
        {gameMode === 'multiplayer' && multiplayerScreen === 'create-or-join' && <CreateOrJoin />}
        {gameMode === 'multiplayer' && multiplayerScreen === 'create-room-setup' && <CreateRoomSetup />}
        {gameMode === 'multiplayer' && multiplayerScreen === 'create-room' && <CreateRoom />}
        {gameMode === 'multiplayer' && multiplayerScreen === 'join-room' && <JoinRoom />}
        {gameMode === 'multiplayer' && multiplayerScreen === 'countdown' && playersReady && <Countdown />}
        {gameMode === 'multiplayer' && multiplayerScreen === 'game' && playersReady && !levelComplete && <MultiplayerGameBoard />}
        {gameMode === 'multiplayer' && multiplayerScreen === 'results' && <GameResults />}

        {gameMode === 'single' && gameStarted && !gameOver && !levelComplete && category && (
          <motion.div
            key={`question-${currentQuestion}`}
            variants={screenVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="game-board"
            style={{ padding: '20px', textAlign: 'center' }}
          >
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '20px' }}>
              <TimerDisplay timeLeft={timeLeft} />
              <span style={{ background: 'linear-gradient(90deg, #8B4513, #FF5733)', color: 'white', padding: '5px 15px', borderRadius: '20px', marginLeft: '10px' }}>
                Question {currentQuestion + 1} of {QUESTIONS_PER_LEVEL[level]}
              </span>
            </div>
            <div style={{ border: '2px solid #000', borderRadius: '10px', padding: '20px', background: 'white', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '20px', margin: 0 }}>{TRIVIA_QUESTIONS[category][currentQuestion].question}</h2>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '20px' }}>
              {TRIVIA_QUESTIONS[category][currentQuestion].options.map((option, index) => (
                <motion.button
                  key={index}
                  onClick={() => handleAnswer(option)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  style={{
                    background: feedback
                      ? option === TRIVIA_QUESTIONS[category][currentQuestion].correctAnswer
                        ? '#32CD32'
                        : option === selectedAnswer
                        ? '#FF0000'
                        : 'white'
                      : 'white',
                    border: '2px solid #000',
                    borderRadius: '10px',
                    padding: '15px',
                    fontSize: '16px',
                    cursor: feedback ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                  }}
                >
                  <span style={{ background: '#D3D3D3', borderRadius: '50%', width: '30px', height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {String.fromCharCode(65 + index)}
                  </span>
                  {option}
                </motion.button>
              ))}
            </div>
            {feedback && (
              <div style={{ background: feedback === 'correct' ? '#90EE90' : '#FFB6C1', padding: '10px', borderRadius: '10px' }}>
                <span style={{ fontSize: '18px', fontWeight: 'bold' }}>
                  {feedback === 'correct' ? '✅ Correct!' : '❌ Oops.. you got that wrong.'}
                </span>
                <p>{feedback === 'correct' ? '' : `The correct answer is "${TRIVIA_QUESTIONS[category][currentQuestion].correctAnswer}".`}</p>
              </div>
            )}
          </motion.div>
        )}

        {gameMode === 'single' && levelComplete && (
          <motion.div
            key="level-complete-screen"
            variants={screenVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="level-complete-screen"
            style={{ textAlign: 'center', padding: '20px' }}
          >
            <h2 style={{ fontSize: '24px', marginBottom: '20px' }}>
              LEVEL {level} {answers.filter(a => a.selectedAnswer === a.correctAnswer).length >= QUESTIONS_PER_LEVEL[level] / 2 ? 'COMPLETE!' : 'ATTEMPTED!'}
            </h2>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginBottom: '20px' }}>
              {[...Array(3)].map((_, i) => (
                <span key={i} style={{ fontSize: '30px' }}>{i < stars ? '⭐' : '☆'}</span>
              ))}
            </div>
            <div style={{ background: '#FFD700', borderRadius: '50%', padding: '20px', display: 'inline-block', marginBottom: '20px' }}>
              <span style={{ fontSize: '24px', fontWeight: 'bold' }}>LEVEL {level}</span>
            </div>
            <p style={{ fontSize: '18px', marginBottom: '20px' }}>
              {answers.filter(a => a.selectedAnswer === a.correctAnswer).length >= QUESTIONS_PER_LEVEL[level] / 2
                ? 'You are a trivia superstar! You got all questions right.'
                : 'Low effort! You got only one question right.'}
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginBottom: '20px' }}>
              <span style={{ background: '#32CD32', padding: '5px 15px', borderRadius: '10px' }}>SCORE {score}</span>
              <span style={{ background: '#FFD700', padding: '5px 15px', borderRadius: '10px' }}>{totalScore}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
              {answers.filter(a => a.selectedAnswer === a.correctAnswer).length >= QUESTIONS_PER_LEVEL[level] / 2 ? (
                <motion.button
                  onClick={() => { playClickSound(); handleNextLevel(); }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  style={{
                    background: '#32CD32',
                    color: 'white',
                    padding: '15px 50px',
                    borderRadius: '10px',
                    border: 'none',
                    fontSize: '16px',
                    cursor: 'pointer',
                  }}
                >
                  Continue
                </motion.button>
              ) : (
                <>
                  <motion.button
                    onClick={() => { playClickSound(); handleRetryLevel(); }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    style={{
                      background: '#32CD32',
                      color: 'white',
                      padding: '15px 50px',
                      borderRadius: '10px',
                      border: 'none',
                      fontSize: '16px',
                      cursor: 'pointer',
                    }}
                  >
                    Retry
                  </motion.button>
                  <motion.button
                    onClick={() => { playClickSound(); handleQuit(); }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    style={{
                      background: '#32CD32',
                      color: 'white',
                      padding: '15px 50px',
                      borderRadius: '10px',
                      border: 'none',
                      fontSize: '16px',
                      cursor: 'pointer',
                    }}
                  >
                    Quit
                  </motion.button>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TriviaQuiz;