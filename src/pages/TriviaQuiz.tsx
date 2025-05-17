import React, { useState, useEffect, useRef, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import "../styles.css";
import genieLogo from "../assets/genie.png";
import { useNavigate, useLocation } from "react-router-dom";
import level1 from "../assets/level1.png";
import level2 from "../assets/level2.png";
import level3 from "../assets/level3.png";
import level4 from "../assets/level4.png";
import level5 from "../assets/level5.png";
import level6 from "../assets/level6.png";
import level7 from "../assets/level7.png";
import level8 from "../assets/level8.png";
import Cat1 from "../assets/cup.png";
import Cat2 from "../assets/Genie category icons (2).png";
import Cat3 from "../assets/Genie category icons (3).png";
import Cat4 from "../assets/Genie category icons (4).png";
import Cat5 from "../assets/Genie category icons (5).png";
import Cat6 from "../assets/plate.png";
import SettingsPage from "./SettingsPage";
import triviaBg from "../assets/audio/quiz-bg.mp3";
import correctSound from "../assets/audio/correct-answer.mp3";
import incorrectSound from "../assets/audio/incorrect-answer.mp3";
import gameOverSound from "../assets/audio/game-over.wav";
import clickSound from "../assets/audio/button-click.mp3";
import backgroundImage from "../assets/score.png";
import backgroundImages from "../assets/BG2.png";
import questionbg from "../assets/question-bg.png";
import circle from "../assets/sircle1.png";

// Define the shape of GAME_CONFIG with proper types
interface GameConfig {
  difficulties: string[];
  levels: number;
  getQuestionsPerLevel: (level: number) => number;
}

const GAME_CONFIG: GameConfig = {
  difficulties: ["easy", "medium", "hard"],
  levels: 9,
  getQuestionsPerLevel: (level: number) => 4 + (level - 1) * 2,
};

// Define levelImages with Record to allow number indexing
const levelImages: Record<number, string> = {
  1: level1,
  2: level2,
  3: level3,
  4: level4,
  5: level5,
  6: level6,
  7: level7,
  8: level8,
};

// Define a simplified Category type for Open Trivia Database
interface Category {
  id: number; // Open Trivia Database uses numeric IDs
  name: string;
}

// Hardcode a few categories from Open Trivia Database for simplicity
const CATEGORIES: Category[] = [
  { id: 9, name: "General Knowledge" },
  { id: 21, name: "Sports" },
  { id: 22, name: "Geography" },
  { id: 11, name: "Entertainment: Film" },
  { id: 10, name: "Entertainment: Books" },
  { id: 17, name: "Science & Nature" },
];

interface Question {
  id: string;
  text: string;
  options: string[];
  correctAnswer: string;
}

interface Answer {
  question: string;
  selectedAnswer: string;
  correctAnswer: string;
}

type Difficulty = "easy" | "medium" | "hard";
type GameMode = "single" | "multiplayer" | null;

// Define QUESTIONS_PER_LEVEL with Record to allow number indexing
const QUESTIONS_PER_LEVEL: Record<number, number> = {
  1: 4,
  2: 6,
  3: 8,
  4: 10,
  5: 12,
  6: 14,
  7: 16,
  8: 18,
  9: 20,
};

const TriviaQuiz = () => {
  const [gameMode, setGameMode] = useState<GameMode>(null);
  const [category, setCategory] = useState<number | null>(null);
  const [difficulty, setDifficulty] = useState<Difficulty | null>(null);
  const [activeDifficulty, setActiveDifficulty] = useState<Difficulty>("easy");
  const [level, setLevel] = useState(1);
  const [gameStarted, setGameStarted] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [totalScore, setTotalScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [gameOver, setGameOver] = useState(false);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<"correct" | "incorrect" | null>(null);
  const [levelComplete, setLevelComplete] = useState(false);
  const [stars, setStars] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [showLevelSelection, setShowLevelSelection] = useState(false);
  const [showCategorySelection, setShowCategorySelection] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { selectedCategory } = location.state || {};

  const bgImageWidth = 172;
  const bgImageHeight = 70;

  const bgMusicRef = useRef(new Audio(triviaBg));
  const correctSoundRef = useRef(new Audio(correctSound));
  const incorrectSoundRef = useRef(new Audio(incorrectSound));
  const gameOverSoundRef = useRef(new Audio(gameOverSound));
  const clickSoundRef = useRef(new Audio(clickSound));

  // Decode HTML entities (e.g., " to ")
  const decodeHtml = (html: string): string => {
    const txt = document.createElement("textarea");
    txt.innerHTML = html;
    return txt.value;
  };

  useEffect(() => {
    if (selectedCategory) {
      setCategory(selectedCategory);
    }
  }, [selectedCategory]);

  useEffect(() => {
    const audio = bgMusicRef.current;
    audio.loop = true;
    audio.volume = 0.3;
    if (gameStarted && !gameOver && !isMuted && !isPaused) {
      audio.play().catch((e) => console.error("BG Music Error:", e));
    } else {
      audio.pause();
    }
    return () => {
      audio.pause();
    };
  }, [gameStarted, gameOver, isMuted, isPaused]);

  useEffect(() => {
    if (gameOver && !isMuted) {
      gameOverSoundRef.current
        .play()
        .catch((e) => console.error("Game Over Sound Error:", e));
    }
  }, [gameOver, isMuted]);

  useEffect(() => {
    if (!gameStarted || gameOver || levelComplete || isPaused) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 0) {
          clearInterval(timer);
          setGameOver(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameStarted, gameOver, levelComplete, timeLeft, isPaused]);

  const startGame = async (categoryId: number, difficulty: Difficulty, level: number) => {
    setIsLoading(true);
    try {
      const questionsCount = GAME_CONFIG.getQuestionsPerLevel(level);
      const apiUrl = `https://opentdb.com/api.php?amount=${questionsCount}&category=${categoryId}&difficulty=${difficulty}&type=multiple`;
      const response = await fetch(apiUrl);
      const data = await response.json();

      if (data.response_code !== 0) {
        throw new Error("Failed to fetch questions from Open Trivia Database.");
      }

      const formattedQuestions = data.results.map((q: any, index: number) => ({
        id: `${index}`,
        text: decodeHtml(q.question),
        options: [...q.incorrect_answers.map((a: string) => decodeHtml(a)), decodeHtml(q.correct_answer)].sort(() => Math.random() - 0.5),
        correctAnswer: decodeHtml(q.correct_answer),
      }));

      setQuestions(formattedQuestions);
      setGameStarted(true);
      setCurrentQuestionIndex(0);
      setScore(0);
      setAnswers([]);
      setSelectedAnswer(null);
      setFeedback(null);
      setLevelComplete(false);
      setTimeLeft(60);
      setStars(0);
    } catch (err) {
      setError("Failed to start game. Please try again.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const submitAnswer = (answer: string) => {
    if (selectedAnswer || gameOver || isPaused) return;

    setSelectedAnswer(answer);
    const currentQuestion = questions[currentQuestionIndex];
    const isCorrect = answer === currentQuestion.correctAnswer;
    const newScore = isCorrect ? score + 500 : score;
    setScore(newScore);
    setTotalScore(totalScore + (isCorrect ? 500 : 0));
    setFeedback(isCorrect ? "correct" : "incorrect");

    if (!isMuted) {
      const sound = isCorrect ? correctSoundRef.current : incorrectSoundRef.current;
      sound.play().catch((e) => console.error(`${isCorrect ? "Correct" : "Incorrect"} Sound Error:`, e));
    }

    setAnswers([
      ...answers,
      {
        question: currentQuestion.text,
        selectedAnswer: answer,
        correctAnswer: currentQuestion.correctAnswer,
      },
    ]);

    setTimeout(() => {
      const questionsInLevel = QUESTIONS_PER_LEVEL[level];
      if (currentQuestionIndex + 1 < questionsInLevel) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
        setSelectedAnswer(null);
        setFeedback(null);
        setTimeLeft(60);
      } else {
        const correctAnswers = answers.filter((a) => a.selectedAnswer === a.correctAnswer).length + (isCorrect ? 1 : 0);
        const starsEarned = Math.min(3, Math.floor((correctAnswers / questionsInLevel) * 3) + 1);
        setStars(starsEarned);
        setLevelComplete(true);
      }
    }, 2000);
  };

  const toggleMute = () => {
    if (!isMuted) {
      clickSoundRef.current
        .play()
        .catch((e) => console.error("Click Sound Error:", e));
    }
    setIsMuted((prev) => !prev);
  };

  const playClickSound = () => {
    if (!isMuted && !gameStarted) {
      clickSoundRef.current
        .play()
        .catch((e) => console.error("Click Sound Error:", e));
    }
  };

  const handlePause = () => {
    playClickSound();
    setIsPaused(true);
    setShowSettings(true);
  };

  const handleResume = () => {
    setIsPaused(false);
    setShowSettings(false);
  };

  const handleGameModeSelect = (mode: GameMode) => {
    setGameMode(mode);
    if (mode === "single") {
      setShowLevelSelection(true);
    }
  };

  const handleLevelSelect = (selectedLevel: number) => {
    setLevel(selectedLevel);
    setShowLevelSelection(false);
    setShowCategorySelection(true);
  };

  const handleCategorySelect = (selectedCategory: number) => {
    setCategory(selectedCategory);
    setShowCategorySelection(false);
  };

  const handleDifficultySelect = (selectedDifficulty: Difficulty) => {
    setDifficulty(selectedDifficulty);
    startGame(category!, selectedDifficulty, level);
  };

  const handleActiveDifficulty = (selectedDifficulty: Difficulty) => {
    setActiveDifficulty(selectedDifficulty);
  };

  const handleAnswer = (answer: string) => {
    submitAnswer(answer);
  };

  const handleNextLevel = async () => {
    const nextLevel = level + 1;
    let nextDifficulty = difficulty || "easy";

    if (nextLevel > 3 && nextDifficulty === "easy") {
      nextDifficulty = "medium";
    } else if (nextLevel > 6 && nextDifficulty === "medium") {
      nextDifficulty = "hard";
    }

    setLevel(nextLevel);
    setDifficulty(nextDifficulty);
    setShowCategorySelection(true);
    setLevelComplete(false);
    setCurrentQuestionIndex(0);
    setScore(0);
    setAnswers([]);
    setSelectedAnswer(null);
    setFeedback(null);
    setTimeLeft(60);
    setStars(0);

    // Fetch new questions for levels up to 5
    if (nextLevel <= 5) {
      await startGame(category!, nextDifficulty, nextLevel);
    }
  };

  const handleRetryLevel = () => {
    setCurrentQuestionIndex(0);
    setScore(0);
    setAnswers([]);
    setSelectedAnswer(null);
    setFeedback(null);
    setLevelComplete(false);
    setTimeLeft(60);
    setStars(0);
    startGame(category!, difficulty!, level);
  };

  const handleQuit = () => {
    setGameMode(null);
    setCategory(null);
    setDifficulty(null);
    setLevel(1);
    setGameStarted(false);
    setCurrentQuestionIndex(0);
    setScore(0);
    setTotalScore(0);
    setAnswers([]);
    setSelectedAnswer(null);
    setFeedback(null);
    setLevelComplete(false);
    setGameOver(false);
    setStars(0);
    setShowLevelSelection(false);
    setShowCategorySelection(false);
    setActiveDifficulty("easy");
    setIsPaused(false);
    setShowSettings(false);
    setQuestions([]);
    navigate("/");
  };

  const screenVariants = {
    initial: { opacity: 0, x: 50 },
    animate: { opacity: 1, x: 0, transition: { duration: 0.5 } },
    exit: { opacity: 0, x: -50, transition: { duration: 0.5 } },
  };

  const TimerDisplay = memo(({ timeLeft }: { timeLeft: number }) => (
    <span style={{ fontSize: "16px", color: "black" }}>
      ⏰ {timeLeft.toString().padStart(2, "0")}
    </span>
  ));

  if (isLoading && !gameStarted) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <p className="text-red-500 mb-4">{error}</p>
        <button 
          className="bg-blue-500 text-white px-4 py-2 rounded"
          onClick={() => setError(null)}
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div
      className="trivia-container"
      style={{
        backgroundImage: `url(${backgroundImages})`,
        backgroundSize: "cover",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center",
        minHeight: "100vh",
        fontFamily: "Arial, sans-serif",
        position: "relative",
      }}
    >
      <style>
      {`
        .trivia-quiz-category .categoryBody {
          width: 100%;
          height: 100%;
          minHeight: 500px;
          display: flex;
          flex-direction: column;
          margin: auto;
          justify-content: center;
          align-items: center;
          gap: 10px;
          margin-top: 30px;
          padding: 30px 5px;
          background-image: url(${backgroundImages});
        }
        
        .trivia-quiz-category .categoryContainer {
          width: 100%;
          height: fit-content;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          overflow: scroll;
          scrollbar-width: none;
        }
        
        .trivia-quiz-category .categoryDiv {
          width: fit-content;
          height: auto;
          display: flex;
          flex-direction: row;
          justify-content: center;
          align-items: center;
          gap: 20px;
          overflow-x: visible;
          margin-bottom: 30%;
        }
        
        @keyframes passing {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(0);
          }
        }
        
        .trivia-quiz-category .catBox {
          width: 300px;
          height: 240px;
          margin: 30px auto;
        }
        
        .trivia-quiz-category .item1 {
          width: 100%;
          height: 85%;
          display: flex;
          justify-content: center;
          align-items: center;
          border-radius: 12px;
          background-color: #4A7043;
        }

        .trivia-quiz-category .item1 img {
          width: 200px;
          object-fit: cover;
        }
        
        .trivia-quiz-category .item1:hover {
          background-color: #3b5a3b;
          cursor: pointer;
          transition: all 0.15s ease-in-out;
          transform: scale(1.02);
          box-sizing: border-box;
          border: 8px solid #FDC2B1;
        }
        
        .trivia-quiz-category .category {
          width: 100%;
          height: 100%;
          display: flex;
          justify-content: center;
          align-items: center;
          margin: auto;
          font-size: 48px;
          font-weight: 400;
          font-family: Bagel Fat One;
          text-transform: uppercase;
        }
        
        .trivia-quiz-category .categoryBT {
          position: fixed;
          bottom: 20px;
          left: 50%;
          transform: translateX(-50%);
          width: auto;
          height: auto;
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 20px;
          gap: 60px;
          z-index: 10;
        }
        
        .trivia-quiz-category .cat {
          font-size: 20px;
          font-weight: 400;
          color: black;
          text-align: center;
          margin: 10px 0;
          font-family: Bagel Fat One;
        }

        @media screen and (max-width: 768px) {
          .level-selection h2 {
            font-size: 32px;
            margin-bottom: 15px;
          }
          .level-selection div {
            grid-template-columns: repeat(3, 1fr);
          }
          .level-selection img {
            width: 100px;
            height: 100px;
          }
          .level-selection button {
            width: 180px;
            height: 60px;
            font-size: 18px;
            padding-top: 15px;
            padding-bottom: 15px;
          }

          .trivia-quiz-category .categoryContainer {
            margin-top: 0px;
            padding: 0px;
            height: 40vh;
            width: 70%;
          }
          .trivia-quiz-category .categoryDiv {
            width: fit-content;
            height: 300px;
            display: flex;
            flex-direction: row;
            justify-content: center;
            align-items: center;
            gap: 15px;
            overflow-x: visible;
            margin: auto;
            margin-bottom: 30px;
            animation: passing 2s ease-in-out;
            animation-delay: .5s;
          }
          .trivia-quiz-category .catBox {
            width: 200px;
            height: 160px;
            margin: auto;
          }
          .trivia-quiz-category .item1 {
            width: 100%;
            height: 120px;
            margin: 0px auto;
          }

          .trivia-quiz-category .item1 img {
            width: 100px;
            object-fit: cover;
          }
          .trivia-quiz-category .category {
            font-size: 32px;
          }
          .trivia-quiz-category .cat {
            font-size: 16px;
            margin: 5px 0;
          }
          
          .trivia-quiz-category .categoryBT {
            position: fixed;
            bottom: 20px;
            left: 50%;
            transform: translateX(-50%);
            width: auto;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            padding: 15px;
            gap: 15px;
            z-index: 10;
          }
          
          .trivia-quiz-category .categoryBT button {
            width: 180px;
            height: 50px;
            font-size: 18px;
            padding-top: 10px;
            padding-bottom: 10px;
          }

          .main-menu button,
          .difficulty-selection button,
          .level-complete-screen button,
          .game-over-screen button {
            width: 180px;
            height: 60px;
            font-size: 16px;
            padding-top: 10px;
            padding-bottom: 10px;
          }

          .difficulty-selection h2 {
            font-size: 32px;
            margin-bottom: 20px;
          }
          .difficulty-selection button {
            width: 300px;
            height: 60px;
            font-size: 14px;
            padding: 10px 30px;
          }

          .level-complete-screen h2 {
            font-size: 20px;
          }
          .level-complete-screen span {
            font-size: 24px;
          }
          .level-complete-screen div span {
            font-size: 20px;
          }

          .game-over-screen h2 {
            font-size: 20px;
          }
          .game-over-screen p {
            font-size: 16px;
          }
        }
      `}
      </style>

      {showSettings && (
        <SettingsPage
          onResume={handleResume}
          onQuit={handleQuit}
          isMuted={isMuted}
          toggleMute={toggleMute}
        />
      )}

      <div
        className="trivia-header"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "10px 20px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center" }}>
          <img
            src={genieLogo}
            alt="Genie"
            className="trivia-logo"
            style={{
              height: "70px",
              margin: 0,
            }}
          />
        </div>
        <div style={{ display: "flex", alignItems: "center" }}>
          <div
            style={{
              background: `url(${backgroundImage}) no-repeat center center`,
              padding: window.innerWidth <= 768 ? "10px" : "20px",
              borderRadius: window.innerWidth <= 768 ? "15px" : "20px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginRight: window.innerWidth <= 768 ? "5px" : "10px",
              minWidth: window.innerWidth <= 768 ? `${bgImageWidth * 0.7}px` : `${bgImageWidth}px`,
              height: window.innerWidth <= 768 ? `${bgImageHeight * 0.7}px` : `${bgImageHeight}px`,
              backgroundSize: "100% 100%"
            }}
          >
            <span
              style={{
                color: "white",
                fontFamily: "Bagel Fat One",
                paddingLeft: "50px",
                fontSize: "24px",
                fontWeight: "400",
                alignItems: "center",
                paddingBottom: "10px"
              }}
            >
              {totalScore}
            </span>
          </div>
          <button
            onClick={() => {
              playClickSound();
              toggleMute();
            }}
            style={{ background: "none", border: "none", fontSize: "16px" }}
          >
            {isMuted ? "🔇" : "🔊"}
          </button>
        </div>
      </div>

      <>
        <style dangerouslySetInnerHTML={{__html: `
          @media (max-width: 768px) {
            .game-buttons-container {
              flex-direction: column !important;
              padding-left: 70px !important;
              padding-right: 70px !important;
              align-items: center !important;
              white-space: nowrap !important;
            }
            .game-button {
              white-space: nowrap !important;
            }
          }
        `}} />
        <AnimatePresence mode="wait">
          {!gameMode && (
            <motion.div
              key="main-menu"
              variants={screenVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="main-menu"
              style={{ textAlign: "center", padding: "20px" }}
            >
              <div
                className="game-buttons-container"
                style={{
                  display: "flex",
                  flexDirection: "row",
                  justifyContent: "center",
                  gap: "20px",
                  marginBottom: "20px",
                  marginTop: "50px",
                }}
              >
                <motion.button
                  className="game-button"
                  onClick={() => {
                    playClickSound();
                    handleGameModeSelect("single");
                  }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  style={{
                    background: "transparent",
                    color: "#FF5733",
                    border: "2px solid #FF5733",
                    borderRadius: "10px",
                    fontSize: "18px",
                    fontWeight: "bold",
                    cursor: "pointer",
                  }}
                >
                  Single Player
                </motion.button>
                <motion.button
                  className="game-button"
                  onClick={() => {
                    playClickSound();
                    handleGameModeSelect("multiplayer");
                  }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  style={{
                    background: "transparent",
                    color: "#FF5733",
                    border: "2px solid #FF5733",
                    borderRadius: "10px",
                    fontSize: "18px",
                    fontWeight: "bold",
                    cursor: "pointer",
                  }}
                >
                  Multiplayer
                </motion.button>
              </div>
              <div style={{ borderTop: "2px dashed #000", margin: "20px 0" }} />
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "10px",
                }}
              >
                <motion.button
                  onClick={() => {
                    playClickSound();
                    navigate("/how-to-play");
                  }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  style={{
                    background: "linear-gradient(90deg, rgb(13, 88, 25), #FF5733)",
                    color: "white",
                    padding: "15px 50px",
                    borderRadius: "10px",
                    border: "none",
                    fontSize: "18px",
                    fontWeight: "500",
                    cursor: "pointer",
                    width: "250px",
                    fontFamily: "Athletics",
                  }}
                >
                  How to Play
                </motion.button>
                <motion.button
                  onClick={() => playClickSound()}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  style={{
                    background: "linear-gradient(90deg, rgb(13, 88, 25), #FF5733)",
                    color: "white",
                    padding: "15px 50px",
                    borderRadius: "10px",
                    border: "none",
                    fontSize: "18px",
                    fontWeight: "500",
                    cursor: "pointer",
                    width: "250px",
                    fontFamily: "Athletics",
                  }}
                >
                  Leaderboard
                </motion.button>
                <motion.button
                  onClick={() => {
                    playClickSound();
                    navigate("/settings-page");
                  }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95}}
                  style={{
                    background: "linear-gradient(90deg, rgb(13, 88, 25), #FF5733)",
                    color: "white",
                    padding: "15px 50px",
                    borderRadius: "10px",
                    border: "none",
                    fontSize: "18px",
                    fontWeight: "500",
                    cursor: "pointer",
                    width: "250px",
                    fontFamily: "Athletics",
                  }}
                >
                  Settings
                </motion.button>
                <motion.button
                  onClick={() => {
                    playClickSound();
                    navigate("/game-platform");
                  }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  style={{
                    background: "linear-gradient(90deg,rgb(13, 88, 25), #FF5733)",
                    color: "white",
                    padding: "15px 50px",
                    borderRadius: "10px",
                    border: "none",
                    fontSize: "18px",
                    fontWeight: "500",
                    cursor: "pointer",
                    width: "250px",
                    fontFamily: "Athletics",
                  }}
                >
                  Exit Game
                </motion.button>
              </div>
            </motion.div>
          )}

          {gameMode === "multiplayer" && (
            <motion.div
              key="multiplayer-coming-soon"
              variants={screenVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="multiplayer-coming-soon"
              style={{ textAlign: "center", padding: "20px" }}
            >
              <h2 style={{ fontSize: "48px", fontFamily: "Bagel Fat One", marginBottom: "20px" }}>
                Coming Soon
              </h2>
              <p style={{ fontSize: "24px", marginBottom: "20px" }}>
                Multiplayer mode is under development. Stay tuned!
              </p>
              <motion.button
                onClick={() => {
                  playClickSound();
                  setGameMode(null);
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                style={{
                  background: "linear-gradient(180deg, #f7fde7, #95c550, #7aa745, #547d37)",
                  color: "white",
                  padding: "10px",
                  borderRadius: "10px",
                  border: "2.3px solid black",
                  width: '220px',
                  height: '50px',
                  fontSize: "20px",
                  cursor: "pointer",
                  textShadow: "1px 1px 2px rgba(0, 0, 0, 2.7)",
                  fontWeight: "400",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                Back
              </motion.button>
            </motion.div>
          )}

          {gameMode === "single" && showLevelSelection && (
            <motion.div
              key="level-selection"
              variants={screenVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="level-selection"
              style={{ 
                textAlign: "center", 
                padding: window.innerWidth <= 768 ? "10px" : "20px" 
              }}
            >
              <h2 style={{ 
                fontSize: window.innerWidth <= 768 ? "32px" : "48px", 
                marginBottom: window.innerWidth <= 768 ? "15px" : "20px", 
                fontFamily: "Bagel Fat One", 
                fontWeight: "400" 
              }}>
                SELECT GAME LEVEL
              </h2>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: window.innerWidth <= 768 ? "repeat(3, 1fr)" : "repeat(4, 1fr)",
                  gap: window.innerWidth <= 768 ? "8px" : "10px",
                  marginBottom: window.innerWidth <= 768 ? "15px" : "20px",
                  marginInline: "auto",
                  maxWidth: window.innerWidth <= 768 ? "360px" : "1020px",
                }}
              >
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
                      width: window.innerWidth <= 768 ? "100px" : "150px",
                      height: window.innerWidth <= 768 ? "100px" : "150px",
                      cursor: lvl <= level ? "pointer" : "not-allowed",
                      opacity: lvl <= level ? 1 : 0.6,
                    }}
                  />
                ))}
              </div>
              <div
                style={{ display: "flex", justifyContent: "center", gap: "10px" }}
              >
                <motion.button
                  onClick={() => {
                    playClickSound();
                    setShowLevelSelection(false);
                    navigate('/game-platform');
                  }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  style={{
                    background: "linear-gradient(180deg, #f7fde7, #95c550, #7aa745, #547d37)",
                    color: "white",
                    padding: "10px",
                    borderRadius: "10px",
                    border: "2.3px solid black",
                    width: '220px',
                    height: '50px',
                    fontSize: "20px",
                    cursor: "pointer",
                    textShadow: "1px 1px 2px rgba(0, 0, 0, 2.7)",
                    fontWeight: "400",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  {'<'}   Back
                </motion.button>
              </div>
            </motion.div>
          )}

          {gameMode === "single" && showCategorySelection && !difficulty && (
            <motion.div
              key="category-selection"
              variants={screenVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="trivia-quiz-category"
            >
              <div className="categoryBody">
                <h1 className="category">Select Category</h1>
                <div className="categoryContainer">
                  <div className="categoryDiv">
                    {CATEGORIES.map((cat) => (
                      <div
                        key={cat.id}
                        className="catBox"
                        onClick={() => {
                          playClickSound();
                          handleCategorySelect(cat.id);
                        }}
                      >
                        <h2 className="cat">{cat.name.toUpperCase()}</h2>
                        <div className="item1">
                          <img src={
                            cat.name.toLowerCase() === "science & nature" ? Cat1 :
                            cat.name.toLowerCase() === "sports" ? Cat2 :
                            cat.name.toLowerCase() === "geography" ? Cat3 :
                            cat.name.toLowerCase() === "entertainment: film" ? Cat4 :
                            cat.name.toLowerCase() === "entertainment: books" ? Cat5 :
                            Cat6
                          } alt={cat.name} />
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="categoryBT">
                    <motion.button
                      className="catBTN btn1"
                      onClick={() => {
                        playClickSound();
                        setShowCategorySelection(false);
                        setShowLevelSelection(true);
                      }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      style={{
                        background: "linear-gradient(180deg, #f7fde7, #95c550, #7aa745, #547d37)",
                        color: "white",
                        padding: "10px",
                        borderRadius: "10px",
                        border: "2.3px solid black",
                        width: '220px',
                        height: '50px',
                        fontSize: "20px",
                        cursor: "pointer",
                        textShadow: "1px 1px 2px rgba(0, 0, 0, 2.7)",
                        fontWeight: "400",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                      }}
                    >
                      Back
                    </motion.button>
                    <motion.button
                      className="catBTN btn1"
                      disabled={!category}
                      onClick={() => {
                        if (category) {
                          playClickSound();
                          setShowCategorySelection(false);
                        }
                      }}
                      whileHover={category ? { scale: 1.05 } : {}}
                      whileTap={category ? { scale: 0.95 } : {}}
                      style={{
                        background: "linear-gradient(180deg, #f7fde7, #95c550, #7aa745, #547d37)",
                        color: "white",
                        padding: "10px",
                        borderRadius: "10px",
                        border: "2.3px solid black",
                        width: '220px',
                        height: '50px',
                        fontSize: "20px",
                        cursor: category ? "pointer" : "not-allowed",
                        textShadow: "1px 1px 2px rgba(0, 0, 0, 2.7)",
                        fontWeight: "400",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        opacity: category ? 1 : 0.6,
                      }}
                    >
                      Next
                    </motion.button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {gameMode === "single" && !showCategorySelection && category && !difficulty && (
            <motion.div
              key="difficulty-selection"
              variants={screenVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="difficulty-selection"
              style={{ 
                textAlign: "center", 
                padding: window.innerWidth <= 768 ? "10px" : "20px" 
              }}
            >
              <h2 style={{ 
                fontSize: window.innerWidth <= 768 ? "32px" : "48px", 
                marginBottom: window.innerWidth <= 768 ? "20px" : "40px", 
                fontFamily: "Bagel Fat One", 
                fontWeight: "400" 
              }}>
                SELECT DIFFICULTY
              </h2>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: window.innerWidth <= 768 ? "8px" : "10px",
                }}
              >
                <motion.button
                  onClick={() => {
                    playClickSound();
                    handleActiveDifficulty("easy");
                  }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  style={{
                    background:
                      activeDifficulty === "easy"
                        ? "linear-gradient(90deg,rgb(53, 121, 14), #FF5733)"
                        : "#A9A9A9",
                    color: "white",
                    padding: window.innerWidth <= 768 ? "10px 30px" : "15px 50px",
                    borderRadius: "10px",
                    border: "none",
                    fontSize: window.innerWidth <= 768 ? "14px" : "16px",
                    fontWeight: "bold",
                    cursor: "pointer",
                    width: window.innerWidth <= 768 ? "300px" : "400px",
                    height: window.innerWidth <= 768 ? "60px" : "80px"
                  }}
                >
                  Easy
                </motion.button>
                <motion.button
                  onClick={() => {
                    playClickSound();
                    handleActiveDifficulty("medium");
                  }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  style={{
                    background:
                      activeDifficulty === "medium"
                        ? "linear-gradient(90deg,rgb(53, 121, 14), #FF5733)"
                        : "#A9A9A9",
                    color: "white",
                    padding: window.innerWidth <= 768 ? "10px 30px" : "15px 50px",
                    borderRadius: "10px",
                    border: "none",
                    fontSize: window.innerWidth <= 768 ? "14px" : "16px",
                    fontWeight: "bold",
                    cursor: "pointer",
                    width: window.innerWidth <= 768 ? "300px" : "400px",
                    height: window.innerWidth <= 768 ? "60px" : "80px"
                  }}
                >
                  Medium
                </motion.button>
                <motion.button
                  onClick={() => {
                    playClickSound();
                    handleActiveDifficulty("hard");
                  }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  style={{
                    background:
                      activeDifficulty === "hard"
                        ? "linear-gradient(90deg,rgb(53, 121, 14), #FF5733)"
                        : "#A9A9A9",
                    color: "white",
                    padding: window.innerWidth <= 768 ? "10px 30px" : "15px 50px",
                    borderRadius: "10px",
                    border: "none",
                    fontSize: window.innerWidth <= 768 ? "14px" : "16px",
                    fontWeight: "bold",
                    cursor: "pointer",
                    width: window.innerWidth <= 768 ? "300px" : "400px",
                    height: window.innerWidth <= 768 ? "60px" : "80px"
                  }}
                >
                  Hard
                </motion.button>
              </div>
              <div style={{ display: "flex", justifyContent: "center", gap: "10px", marginTop: "20px" }}>
                <motion.button
                  onClick={() => {
                    playClickSound();
                    setShowCategorySelection(true);
                  }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  style={{
                    background: "linear-gradient(180deg, #f7fde7, #95c550, #7aa745, #547d37)",
                    color: "white",
                    padding: "10px",
                    borderRadius: "10px",
                    border: "2.3px solid black",
                    width: '220px',
                    height: '50px',
                    fontSize: "20px",
                    cursor: "pointer",
                    textShadow: "1px 1px 2px rgba(0, 0, 0, 2.7)",
                    fontWeight: "400",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  Back
                </motion.button>
                <motion.button
                  onClick={() => {
                    playClickSound();
                    handleDifficultySelect(activeDifficulty);
                  }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  style={{
                    background: "linear-gradient(180deg, #f7fde7, #95c550, #7aa745, #547d37)",
                    color: "white",
                    padding: "10px",
                    borderRadius: "10px",
                    border: "2.3px solid black",
                    width: '220px',
                    height: '50px',
                    fontSize: "20px",
                    cursor: "pointer",
                    textShadow: "1px 1px 2px rgba(0, 0, 0, 2.7)",
                    fontWeight: "400",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  Start Game
                </motion.button>
              </div>
            </motion.div>
          )}

          {gameMode === "single" && gameStarted && !levelComplete && !gameOver && (
            <motion.div
              key={`question-${currentQuestionIndex}`}
              variants={screenVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="game-board"
              style={{ 
                padding: window.innerWidth <= 768 ? "10px" : "20px", 
                textAlign: "center", 
                maxWidth: '1020px', 
                marginInline: 'auto', 
                background: "white", 
                backgroundSize: "cover",
                width: window.innerWidth <= 768 ? "95%" : "auto"
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  marginBottom: window.innerWidth <= 768 ? "10px" : "20px",
                  gap: window.innerWidth <= 768 ? "5px" : "10px",
                  flexDirection: window.innerWidth <= 480 ? "column" : "row",
                }}
              >
                <TimerDisplay timeLeft={timeLeft} />
                <button
                  onClick={handlePause}
                  style={{
                    background: "none",
                    border: "none",
                    fontSize: window.innerWidth <= 768 ? "14px" : "16px",
                    cursor: "pointer",
                  }}
                >
                  ⏸️
                </button>
                <span
                  style={{
                    backgroundImage: `url(${questionbg})`,
                    backgroundRepeat: "no-repeat",
                    backgroundSize: "contain",
                    backgroundPosition: "center",
                    color: "white",
                    padding: window.innerWidth <= 768 ? "3px 10px" : "5px 15px",
                    borderRadius: "21.93px",
                    width: window.innerWidth <= 768 ? "150px" : "200px",
                    height: window.innerWidth <= 768 ? "65px" : "87px",
                    fontFamily: "Bagel Fat One",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: window.innerWidth <= 768 ? "12px" : "inherit",
                  }}
                >
                  Question {currentQuestionIndex + 1} of {QUESTIONS_PER_LEVEL[level]}
                </span>
              </div>
              <div
                style={{
                  border: "2px solid black",
                  borderRadius: "10px",
                  padding: window.innerWidth <= 768 
                    ? (window.innerWidth <= 480 ? "20px 15px" : "40px 60px") 
                    : "81px 155px 81px 155px",
                  background: "white",
                  marginBottom: window.innerWidth <= 768 ? "30px" : "51px",
                  fontWeight: "500",
                  fontSize: window.innerWidth <= 768 
                    ? (window.innerWidth <= 480 ? "18px" : "24px") 
                    : "40px",
                  color: "black",
                  maxWidth: '1020px',
                  marginInline: 'auto'
                }}
              >
                <h2 style={{ 
                  fontSize: window.innerWidth <= 768 
                    ? (window.innerWidth <= 480 ? "16px" : "18px") 
                    : "20px", 
                  margin: 0 
                }}>
                  {questions[currentQuestionIndex].text}
                </h2>
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: window.innerWidth <= 480 ? "1fr" : "1fr 1fr",
                  gap: window.innerWidth <= 768 ? "8px" : "10px",
                  marginBottom: window.innerWidth <= 768 ? "10px" : "10px",
                  maxWidth: '1020px',
                  marginInline: 'auto'
                }}
              >
                {questions[currentQuestionIndex].options.map((option, index) => (
                  <motion.button
                    key={index}
                    onClick={() => handleAnswer(option)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    style={{
                      background: feedback
                        ? option === questions[currentQuestionIndex].correctAnswer
                          ? "#32CD32"
                          : option === selectedAnswer
                          ? "#FF0000"
                          : "white"
                        : "white",
                      border: "2px solid #000",
                      borderRadius: "10px",
                      padding: window.innerWidth <= 768 ? "10px" : "15px",
                      fontSize: window.innerWidth <= 768 ? "14px" : "16px",
                      cursor: feedback || isPaused ? "not-allowed" : "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: window.innerWidth <= 768 ? "5px" : "10px",
                    }}
                  >
                    <span
                      style={{
                        background: "#D3D3D3",
                        borderRadius: "50%",
                        width: window.innerWidth <= 768 ? "24px" : "30px",
                        height: window.innerWidth <= 768 ? "24px" : "30px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: window.innerWidth <= 768 ? "12px" : "14px",
                      }}
                    >
                      {String.fromCharCode(65 + index)}
                    </span>
                    <span style={{ 
                      textAlign: "left", 
                      fontSize: window.innerWidth <= 768 ? "14px" : "16px",
                      wordBreak: "break-word" 
                    }}>
                      {option}
                    </span>
                  </motion.button>
                ))}
              </div>
              {feedback && (
                <div
                  style={{
                    background: feedback === "correct" ? "#90EE90" : "#FFB6C1",
                    padding: window.innerWidth <= 768 ? "8px" : "10px",
                    borderRadius: "10px",
                    maxWidth: "1020px", 
                    marginInline: "auto"
                  }}
                >
                  <span style={{ 
                    fontSize: window.innerWidth <= 768 ? "16px" : "18px", 
                    fontWeight: "bold", 
                    maxWidth: "1020px", 
                    marginInline: "auto" 
                  }}>
                    {feedback === "correct"
                      ? "✅ Correct!"
                      : "❌ Oops.. you got that wrong."}
                  </span>
                  <p style={{ fontSize: window.innerWidth <= 768 ? "14px" : "16px" }}>
                    {feedback === "correct"
                      ? ""
                      : `The correct answer is "${questions[currentQuestionIndex].correctAnswer}".`}
                  </p>
                </div>
              )}
            </motion.div>
          )}

          {gameMode === "single" && levelComplete && (
            <motion.div
              key="level-complete"
              variants={screenVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="level-complete-screen"
              style={{ textAlign: "center", padding: "20px" }}
            >
              <h2 style={{ fontSize: "24px", marginBottom: "20px", fontFamily: 'Bagel Fat One' }}>
                LEVEL {level}{" "}
                {answers.filter((a) => a.selectedAnswer === a.correctAnswer).length >=
                QUESTIONS_PER_LEVEL[level] * 0.8
                  ? "COMPLETE!"
                  : "ATTEMPTED!"}
              </h2>
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  gap: "10px",
                  marginBottom: "20px",
                }}
              >
                {[...Array(3)].map((_, i) => (
                  <span key={i} style={{ fontSize: "30px" }}>
                    {i < stars ? "⭐" : "☆"}
                  </span>
                ))}
              </div>
              <div
                style={{
                  backgroundImage: `url(${circle})`,
                  backgroundSize: 'contain',
                  backgroundRepeat: 'no-repeat',
                  borderRadius: "50%",
                  padding: "70px",
                  display: "inline-block",
                  marginBottom: "20px",
                  marginRight: "-30px"
                }}
              >
                <span style={{ fontSize: "24px", fontWeight: "bold", fontFamily: 'Bagel Fat One', color: "white", marginLeft: "-25px" }}>
                  LEVEL {level}
                </span>
              </div>
              <div style={{ display: "flex", justifyContent: "center", gap: window.innerWidth <= 768 ? "-5px" : "30px", flexWrap: 'wrap' }}>
                <motion.button
                  onClick={() => {
                    playClickSound();
                    handleRetryLevel();
                  }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  style={{
                    background: "linear-gradient(180deg, #f7fde7, #95c550, #7aa745, #547d37)",
                    color: "white",
                    padding: "10px",
                    borderRadius: "10px",
                    border: "2.3px solid black",
                    width: '220px',
                    height: '50px',
                    fontSize: "20px",
                    cursor: "pointer",
                    textShadow: "1px 1px 2px rgba(0, 0, 0, 2.7)",
                    fontWeight: "400",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  Retry Level
                </motion.button>
                {level < GAME_CONFIG.levels && (
                  <motion.button
                    onClick={() => {
                      playClickSound();
                      handleNextLevel();
                    }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    style={{
                      background: "linear-gradient(180deg, #f7fde7, #95c550, #7aa745, #547d37)",
                      color: "white",
                      padding: "10px",
                      borderRadius: "10px",
                      border: "2.3px solid black",
                      width: '220px',
                      height: '50px',
                      fontSize: "20px",
                      cursor: "pointer",
                      textShadow: "1px 1px 2px rgba(0, 0, 0, 2.7)",
                      fontWeight: "400",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    Next Level
                  </motion.button>
                )}
                <motion.button
                  onClick={() => {
                    playClickSound();
                    handleQuit();
                  }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  style={{
                    background: "linear-gradient(180deg, #f7fde7, #95c550, #7aa745, #547d37)",
                    color: "white",
                    padding: "10px",
                    borderRadius: "10px",
                    border: "2.3px solid black",
                    width: '220px',
                    height: '50px',
                    fontSize: "20px",
                    cursor: "pointer",
                    textShadow: "1px 1px 2px rgba(0, 0, 0, 2.7)",
                    fontWeight: "400",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  Quit
                </motion.button>
              </div>
            </motion.div>
          )}

          {gameMode === "single" && gameOver && (
            <motion.div
              key="game-over"
              variants={screenVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="game-over-screen"
              style={{ textAlign: "center", padding: "20px" }}
            >
              <h2 style={{ fontSize: "24px", marginBottom: "20px" }}>
                Game Over!
              </h2>
              <p style={{ fontSize: "18px", marginBottom: "20px" }}>
                Your Score: {score}
              </p>
              <div style={{ display: "flex", justifyContent: "center", gap: "10px" }}>
                <motion.button
                  onClick={() => {
                    playClickSound();
                    handleRetryLevel();
                  }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  style={{
                    background: "linear-gradient(180deg, #f7fde7, #95c550, #7aa745, #547d37)",
                    color: "white",
                    padding: "10px",
                    borderRadius: "10px",
                    border: "2.3px solid black",
                    width: '220px',
                    height: '50px',
                    fontSize: "20px",
                    cursor: "pointer",
                    textShadow: "1px 1px 2px rgba(0, 0, 0, 2.7)",
                    fontWeight: "400",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  Retry
                </motion.button>
                <motion.button
                  onClick={() => {
                    playClickSound();
                    handleQuit();
                  }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  style={{
                    background: "linear-gradient(180deg, #f7fde7, #95c550, #7aa745, #547d37)",
                    color: "white",
                    padding: "10px",
                    borderRadius: "10px",
                    border: "2.3px solid black",
                    width: '220px',
                    height: '50px',
                    fontSize: "20px",
                    cursor: "pointer",
                    textShadow: "1px 1px 2px rgba(0, 0, 0, 2.7)",
                    fontWeight: "400",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  Quit
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </>
    </div>
  );
};

export default TriviaQuiz;