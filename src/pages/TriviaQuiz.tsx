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
import Cat1 from "../assets/Genie category icons (1).png";
import Cat2 from "../assets/Genie category icons (2).png";
import Cat3 from "../assets/Genie category icons (3).png";
import Cat4 from "../assets/Genie category icons (4).png";
import Cat5 from "../assets/Genie category icons (5).png";
import Cat6 from "../assets/Genie category icons (6).png";
import SettingsPage from "./SettingsPage";

// Audio imports
import triviaBg from "../assets/audio/quiz-bg.mp3";
import correctSound from "../assets/audio/correct-answer.mp3";
import incorrectSound from "../assets/audio/incorrect-answer.mp3";
import gameOverSound from "../assets/audio/game-over.wav";
import clickSound from "../assets/audio/button-click.mp3";
import backgroundImage from "../assets/score.png";
import backgroundImages from "../assets/BG2.png";
import triviabackground from "../assets/back-img.jpg";
import questionbg from "../assets/question-bg.png";
import circle from "../assets/sircle1.png";
import handshakeImage from '../assets/handshake.png';
import trophyImage from '../assets/trophy.png';
import pizzaImage from '../assets/pizza.png';

// Import questions from JSON file
import TRIVIA_QUESTIONS from "../trivia-questions.json";

// Define levelImages with an index signature
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

interface Answer {
  question: string;
  selectedAnswer: string;
  correctAnswer: string;
}

type Category = "nature" | "sports" | "geography" | "tv" | "literature" | "food";
type Difficulty = "easy" | "medium" | "hard";
type GameMode = "single" | "multiplayer" | null;
type MultiplayerScreen = "menu" | "create-or-join" | "create-room-setup" | "create-room" | "join-room" | "countdown" | "game" | "results" | null;

// Define QUESTIONS_PER_LEVEL with an index signature
const QUESTIONS_PER_LEVEL: { [key: number]: number } = {
  1: 4,
  2: 6,
  3: 8,
  4: 10,
};

const TriviaQuiz = () => {
  const [gameMode, setGameMode] = useState<GameMode>(null);
  const [category, setCategory] = useState<Category | null>(null);
  const [difficulty, setDifficulty] = useState<Difficulty | null>(null);
  const [activeDifficulty, setActiveDifficulty] = useState<Difficulty>("easy");
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
  const [feedback, setFeedback] = useState<"correct" | "incorrect" | null>(null);
  const [levelComplete, setLevelComplete] = useState(false);
  const [stars, setStars] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [showLevelSelection, setShowLevelSelection] = useState(false);
  const [showCategorySelection, setShowCategorySelection] = useState(false);
  const [multiplayerScreen, setMultiplayerScreen] = useState<MultiplayerScreen>(null);
  const [roomCode, setRoomCode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [playersReady, setPlayersReady] = useState(false);
  // New state variables for pause functionality and settings page
  const [isPaused, setIsPaused] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { selectedCategory } = location.state || {};

  // Update category if coming from Category component
  useEffect(() => {
    if (selectedCategory) {
      setCategory(selectedCategory);
    }
  }, [selectedCategory]);

  // Audio refs
  const bgMusicRef = useRef(new Audio(triviaBg));
  const correctSoundRef = useRef(new Audio(correctSound));
  const incorrectSoundRef = useRef(new Audio(incorrectSound));
  const gameOverSoundRef = useRef(new Audio(gameOverSound));
  const clickSoundRef = useRef(new Audio(clickSound));
  const bgImageWidth = 172;
  const bgImageHeight = 70;

  // Background music control with pause functionality
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

  // Game-over sound control
  useEffect(() => {
    if (gameOver && !isMuted) {
      gameOverSoundRef.current
        .play()
        .catch((e) => console.error("Game Over Sound Error:", e));
    }
  }, [gameOver, isMuted]);

  // Timer logic with pause functionality
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

  // Toggle mute
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

  // New functions for pause and resume
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
    } else if (mode === "multiplayer") {
      setMultiplayerScreen("menu");
    }
  };

  const handleLevelSelect = (selectedLevel: number) => {
    setLevel(selectedLevel);
    setShowLevelSelection(false);
    setShowCategorySelection(true);
  };

  const handleCategorySelect = (selectedCategory: Category) => {
    setCategory(selectedCategory);
    setShowCategorySelection(false);
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
    if (selectedAnswer || gameOver || !category || isPaused) return;

    setSelectedAnswer(answer);
    const question = TRIVIA_QUESTIONS[category][currentQuestion];
    const isCorrect = answer === question.correctAnswer;
    const newScore = isCorrect ? score + 500 : score;
    setScore(newScore);
    if (!isMultiplayer) {
      setTotalScore(totalScore + (isCorrect ? 500 : 0));
    }
    setFeedback(isCorrect ? "correct" : "incorrect");

    if (!isMuted) {
      const sound = isCorrect ? correctSoundRef.current : incorrectSoundRef.current;
      sound
        .play()
        .catch((e) =>
          console.error(`${isCorrect ? "Correct" : "Incorrect"} Sound Error:`, e)
        );
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
          setMultiplayerScreen("results");
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
          const correctAnswers =
            answers.filter((a) => a.selectedAnswer === a.correctAnswer).length +
            (isCorrect ? 1 : 0);
          const starsEarned = Math.min(
            3,
            Math.floor((correctAnswers / questionsInLevel) * 3) + 1
          );
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
    setShowCategorySelection(true);
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
    setShowCategorySelection(false);
    setActiveDifficulty("easy");
    setMultiplayerScreen(null);
    setRoomCode(null);
    setCopied(false);
    setPlayersReady(false);
    setIsPaused(false);
    setShowSettings(false);
    navigate("/");
  };

  const screenVariants = {
    initial: { opacity: 0, x: 50 },
    animate: { opacity: 1, x: 0, transition: { duration: 0.5 } },
    exit: { opacity: 0, x: -50, transition: { duration: 0.5 } },
  };

  const TimerDisplay = memo(({ timeLeft }: { timeLeft: number }) => (
    <span style={{ fontSize: "16px" }}>
      ⏰ {timeLeft.toString().padStart(2, "0")}:00
    </span>
  ));

  const MultiplayerMenu = () => (
    <motion.div
      key="multiplayer-menu"
      variants={screenVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="multiplayer-menu"
      style={{ textAlign: "center", padding: "20px" }}
    >
      <h2 style={{ fontSize: "24px", marginBottom: "20px" }}>
        MULTIPLAYER MODE
      </h2>
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
            setMultiplayerScreen("create-or-join");
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
          Challenge a Friend
        </motion.button>
        <motion.button
          onClick={() => {
            playClickSound();
            setMultiplayerScreen("game");
            setGameStarted(true);
            setCategory("literature");
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
          Play with Computer
        </motion.button>
        <motion.button
          onClick={() => {
            playClickSound();
            handleQuit();
          }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          style={{
            background: "#32CD32",
            color: "white",
            padding: "10px 30px",
            borderRadius: "10px",
            border: "none",
            fontSize: "16px",
            cursor: "pointer",
          }}
        >
          Back
        </motion.button>
      </div>
    </motion.div>
  );

  const CreateOrJoin = () => (
    <motion.div
      key="create-or-join"
      variants={screenVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="create-or-join"
      style={{ textAlign: "center", padding: "20px" }}
    >
      <h2 style={{ fontSize: "24px", marginBottom: "20px" }}>
        CHALLENGE A FRIEND
      </h2>
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
            setMultiplayerScreen("create-room-setup");
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
          Create a Room
        </motion.button>
        <motion.button
          onClick={() => {
            playClickSound();
            setMultiplayerScreen("join-room");
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
          Join a Room
        </motion.button>
        <motion.button
          onClick={() => {
            playClickSound();
            setMultiplayerScreen("menu");
          }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          style={{
            background: "#32CD32",
            color: "white",
            padding: "10px 30px",
            borderRadius: "10px",
            border: "none",
            fontSize: "16px",
            cursor: "pointer",
          }}
        >
          Back
        </motion.button>
      </div>
    </motion.div>
  );

  const CreateRoomSetup = () => (
    <motion.div
      key="create-room-setup"
      variants={screenVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="create-room-setup"
      style={{ textAlign: "center", padding: "20px" }}
    >
      <h2 style={{ fontSize: "24px", marginBottom: "20px" }}>
        Create a Game Room to Challenge a Friend
      </h2>
      <h3 style={{ fontSize: "20px", marginBottom: "10px" }}>
        SELECT DIFFICULTY
      </h3>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: "10px",
          marginBottom: "20px",
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
                ? "linear-gradient(90deg, #8B4513, #FF5733)"
                : "#A9A9A9",
            color: "white",
            padding: "15px 50px",
            borderRadius: "10px",
            border: "none",
            fontSize: "16px",
            fontWeight: "bold",
            cursor: "pointer",
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
                ? "linear-gradient(90deg, #8B4513, #FF5733)"
                : "#A9A9A9",
            color: "white",
            padding: "15px 50px",
            borderRadius: "10px",
            border: "none",
            fontSize: "16px",
            fontWeight: "bold",
            cursor: "pointer",
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
                ? "linear-gradient(90deg, #8B4513, #FF5733)"
                : "#A9A9A9",
            color: "white",
            padding: "15px 50px",
            borderRadius: "10px",
            border: "none",
            fontSize: "16px",
            fontWeight: "bold",
            cursor: "pointer",
          }}
        >
          Hard
        </motion.button>
      </div>
      <div style={{ display: "flex", justifyContent: "center", gap: "10px" }}>
        <motion.button
          onClick={() => {
            playClickSound();
            setMultiplayerScreen("create-or-join");
          }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          style={{
            background: "linear-gradient(to bottom, white 10%, rgba(147, 204, 77, 0.7) 50%,rgb(152, 223, 66) 70%, #77aa4e 100%)",
            color: "white",
            padding: "10px 10px",
            borderRadius: "10px",
            border: "2.3px solid black",
            width: '220px',
            height: '80px',
            fontSize: "18px",
            cursor: "pointer",
            paddingTop: '29px',
            paddingBottom: '29px',
            textShadow: "1px 1px 2px rgba(0, 0, 0, 2.7)",
            marginTop: "40px",
            fontWeight: "400",
          }}
        >
          Back
        </motion.button>
        <motion.button
          onClick={() => {
            playClickSound();
            setDifficulty(activeDifficulty);
            setRoomCode(
              Math.floor(100000000 + Math.random() * 900000000).toString()
            );
            setMultiplayerScreen("create-room");
          }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          style={{
            background: "linear-gradient(to bottom, white 10%, rgba(147, 204, 77, 0.7) 50%,rgb(152, 223, 66) 70%, #77aa4e 100%)",
            color: "white",
            padding: "10px 10px",
            borderRadius: "10px",
            border: "2.3px solid black",
            width: '220px',
            height: '80px',
            fontSize: "18px",
            cursor: "pointer",
            paddingTop: '29px',
            paddingBottom: '29px',
            textShadow: "1px 1px 2px rgba(0, 0, 0, 2.7)",
            marginTop: "40px",
            fontWeight: "400",
          }}
        >
          Create Game Room
        </motion.button>
      </div>
    </motion.div>
  );

  const CreateRoom = () => {
    const handleCopyCode = () => {
      if (roomCode) {
        navigator.clipboard.writeText(roomCode).then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        });
      }
    };

    const handleSimulatePlayer2Join = () => {
      setPlayersReady(true);
      setMultiplayerScreen("countdown");
    };

    return (
      <motion.div
        key="create-room"
        variants={screenVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        className="create-room"
        style={{ textAlign: "center", padding: "20px" }}
      >
        <h2 style={{ fontSize: "24px", marginBottom: "20px" }}>
          Game Room Link
        </h2>
        <div
          onClick={handleCopyCode}
          style={{
            background: "#e0e0e0",
            padding: "10px 20px",
            borderRadius: "5px",
            fontSize: "24px",
            marginBottom: "20px",
            cursor: "pointer",
            position: "relative",
            userSelect: "none",
          }}
        >
          {roomCode}
          {copied && (
            <span
              style={{
                position: "absolute",
                top: "-30px",
                left: "50%",
                transform: "translateX(-50%)",
                background: "#32CD32",
                color: "white",
                padding: "5px 10px",
                borderRadius: "5px",
                fontSize: "14px",
              }}
            >
              Copied!
            </span>
          )}
        </div>
        <p>Waiting for Player 2 to join.</p>
        <motion.button
          onClick={handleSimulatePlayer2Join}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          style={{
            background: "#FFD700",
            color: "black",
            padding: "10px 30px",
            borderRadius: "10px",
            border: "none",
            fontSize: "16px",
            cursor: "pointer",
            marginTop: "10px",
          }}
        >
          Simulate Player 2 Join (For Testing)
        </motion.button>
        <motion.button
          onClick={() => {
            playClickSound();
            setMultiplayerScreen("create-room-setup");
            setRoomCode(null);
          }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          style={{
            background: "linear-gradient(to bottom, white 10%, rgba(147, 204, 77, 0.7) 50%,rgb(152, 223, 66) 70%, #77aa4e 100%)",
            color: "white",
            padding: "10px 10px",
            borderRadius: "10px",
            border: "2.3px solid black",
            width: '220px',
            height: '80px',
            fontSize: "18px",
            cursor: "pointer",
            paddingTop: '29px',
            paddingBottom: '29px',
            textShadow: "1px 1px 2px rgba(0, 0, 0, 2.7)",
            marginTop: "40px",
            fontWeight: "400",
          }}
        >
          Cancel
        </motion.button>
      </motion.div>
    );
  };

  const JoinRoom = () => {
    const [inputCode, setInputCode] = useState("");

    const handleJoin = () => {
      if (inputCode) {
        setRoomCode(inputCode);
        setPlayersReady(true);
        setMultiplayerScreen("countdown");
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
        style={{ textAlign: "center", padding: "20px" }}
      >
        <h2 style={{ fontSize: "24px", marginBottom: "20px" }}>
          Enter Game Room Link
        </h2>
        <input
          type="text"
          value={inputCode}
          onChange={(e) => setInputCode(e.target.value)}
          placeholder="Enter Game Room Link"
          style={{
            padding: "10px",
            borderRadius: "5px",
            border: "1px solid #ccc",
            fontSize: "16px",
            width: "200px",
            marginBottom: "20px",
          }}
        />
        <div style={{ display: "flex", justifyContent: "center", gap: "10px" }}>
          <motion.button
            onClick={() => {
              playClickSound();
              setMultiplayerScreen("create-or-join");
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            style={{
              background: "linear-gradient(to bottom, white 10%, rgba(147, 204, 77, 0.7) 50%,rgb(152, 223, 66) 70%, #77aa4e 100%)",
              color: "white",
              padding: "10px 10px",
              borderRadius: "10px",
              border: "2.3px solid black",
              width: '220px',
              height: '80px',
              fontSize: "24px",
              cursor: "pointer",
              paddingTop: '29px',
              paddingBottom: '29px',
              textShadow: "1px 1px 2px rgba(0, 0, 0, 2.7)",
              marginTop: "40px",
              fontWeight: "400",
            }}
          >
            Back
          </motion.button>
          <motion.button
            onClick={() => {
              playClickSound();
              handleJoin();
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            style={{
              background: "linear-gradient(to bottom, white 10%, rgba(147, 204, 77, 0.7) 50%,rgb(152, 223, 66) 70%, #77aa4e 100%)",
              color: "white",
              padding: "10px 10px",
              borderRadius: "10px",
              border: "2.3px solid black",
              width: '220px',
              height: '80px',
              fontSize: "24px",
              cursor: "pointer",
              paddingTop: '29px',
              paddingBottom: '29px',
              textShadow: "1px 1px 2px rgba(0, 0, 0, 2.7)",
              marginTop: "40px",
              fontWeight: "400",
            }}
          >
            Join
          </motion.button>
        </div>
      </motion.div>
    );
  };

  const Countdown = () => {
    const [count, setCount] = useState(3);

    useEffect(() => {
      if (count === 0) {
        setMultiplayerScreen("game");
        setGameStarted(true);
        if (!category) setCategory("literature");
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
        style={{ textAlign: "center", padding: "20px" }}
      >
        <h1 style={{ fontSize: "48px", color: "#FF5733" }}>{count}</h1>
      </motion.div>
    );
  };

  const MultiplayerGameBoard = memo(() => (
    <motion.div
      key={`multiplayer-question-${currentQuestion}`}
      variants={screenVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="multiplayer-game-board"
      style={{ padding: "20px", textAlign: "center", maxWidth: '1020px', marginInline: 'auto' }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          marginBottom: "20px",
          gap: "10px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span
            style={{
              background: "#FFD700",
              padding: "5px 15px",
              borderRadius: "10px",
            }}
          >
            You: {score}
          </span>
        </div>
        <TimerDisplay timeLeft={timeLeft} />
        {/* Pause Button for Multiplayer */}
        <button
          onClick={handlePause}
          style={{
            background: "none",
            border: "none",
            fontSize: "16px",
            cursor: "pointer",
          }}
        >
          ⏸️
        </button>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span
            style={{
              background: "#FFD700",
              padding: "5px 15px",
              borderRadius: "10px",
            }}
          >
            geeky32: {opponentScore}
          </span>
        </div>
      </div>
      <div
        style={{
          border: "2px solid #000",
          borderRadius: "10px",
          padding: "20px",
          background: "white",
          marginBottom: "20px",
        }}
      >
        <h2 style={{ fontSize: "20px", margin: 0 }}>
          Question {currentQuestion + 1} of 6
        </h2>
        <p>{TRIVIA_QUESTIONS[category!][currentQuestion].question}</p>
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "10px",
          marginBottom: "20px",
        }}
      >
        {TRIVIA_QUESTIONS[category!][currentQuestion].options.map(
          (option, index) => (
            <motion.button
              key={index}
              onClick={() => handleAnswer(option, true)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              style={{
                background: feedback
                  ? option ===
                    TRIVIA_QUESTIONS[category!][currentQuestion].correctAnswer
                    ? "#32CD32"
                    : option === selectedAnswer
                    ? "#FF0000"
                    : "white"
                  : "white",
                border: "2px solid #000",
                borderRadius: "10px",
                padding: "15px",
                fontSize: "16px",
                cursor: feedback || isPaused ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                gap: "10px",
              }}
            >
              <span
                style={{
                  background: "#D3D3D3",
                  borderRadius: "50%",
                  width: "30px",
                  height: "30px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {String.fromCharCode(65 + index)}
              </span>
              {option}
            </motion.button>
          )
        )}
      </div>
      {feedback && (
        <div
          style={{
            background: feedback === "correct" ? "#90EE90" : "#FFB6C1",
            padding: "10px",
            borderRadius: "10px",
          }}
        >
          <span style={{ fontSize: "18px", fontWeight: "bold", maxWidth: "1020px", marginInline: "auto" }}>
            {feedback === "correct"
              ? "✅ Correct!"
              : "❌ Oops.. you got that wrong."}
          </span>
          <p>
            {feedback === "correct"
              ? ""
              : `The correct answer is "${
                  TRIVIA_QUESTIONS[category!][currentQuestion].correctAnswer
                }".`}
          </p>
        </div>
      )}
    </motion.div>
  ));

  const GameResults = () => {
    const yourCorrect = answers.filter(
      (a) => a.selectedAnswer === a.correctAnswer
    ).length;
    const opponentCorrect = Math.floor(opponentScore / 500);
    let result = "DRAW!";
    let image = handshakeImage;
    let message = "That was a long one. Let's have a rematch.";
    let backgroundStyle = {};

    if (score > opponentScore) {
      result = "YOU WIN!";
      image = trophyImage;
      message = "You are the master of trivia!";
      backgroundStyle = { background: "url(/assets/confetti.png) repeat" };
    } else if (score < opponentScore) {
      result = "YOU LOSE!";
      image = pizzaImage;
      message =
        "You weren't fast enough, but here's a slice of pizza for your effort.";
    }

    return (
      <motion.div
        key="game-results"
        variants={screenVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        className="game-results"
        style={{ textAlign: "center", padding: "20px", ...backgroundStyle }}
      >
        <h1 style={{ fontSize: "72px", marginBottom: "20px", fontFamily: "Bagel Fat One" }}>{result}</h1>
        <img
          src={image}
          alt="Result"
          style={{ maxWidth: "150px", marginBottom: "20px" }}
        />
        <p style={{ fontSize: "32px", marginBottom: "20px", fontFamily: "Bagel Fat One" }}>{message}</p>
        <div
          style={{
            display: "flex",
            justifyContent: "space-around",
            marginBottom: "20px",
          }}
        >
          <div>
            <h3 style={{
              fontSize: "32px",
              fontWeight: "700",
            }}>YOUR SCORE</h3>
            <p style={{
              fontFamily: "Bagel Fat One",
              fontSize: "40px"
            }}>{score}</p>
            <p
            style={{
              fontSize: "32px",
              fontWeight: "700",
            }}>Total right: {yourCorrect}/6</p>
          </div>
          <div>
            <h3 style={{
              fontSize: "32px",
              fontWeight: "700",
            }}>OPPONENT SCORE</h3>
            <p style={{
              fontFamily: "Bagel Fat One",
              fontSize: "40px"
            }}>{opponentScore}</p>
            <p style={{
              fontSize: "32px",
              fontWeight: "700",
            }}>Total right: {opponentCorrect}/6</p>
          </div>
        </div>
        <div style={{ display: "flex", justifyContent: "center", gap: "30px" }}>
          <motion.button
            onClick={() => {
              playClickSound();
              setMultiplayerScreen("create-room");
              setGameStarted(false);
              setCurrentQuestion(0);
              setScore(0);
              setOpponentScore(0);
              setAnswers([]);
              setSelectedAnswer(null);
              setFeedback(null);
              setLevelComplete(false);
              setTimeLeft(60);
              setRoomCode(
                Math.floor(100000000 + Math.random() * 900000000).toString()
              );
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            style={{
              background: "linear-gradient(to bottom, white 10%, rgba(147, 204, 77, 0.7) 50%,rgb(152, 223, 66) 70%, #77aa4e 100%)",
              color: "white",
              padding: "10px 10px",
              borderRadius: "10px",
              border: "2.3px solid black",
              width: '220px',
              height: '80px',
              fontSize: "18px",
              cursor: "pointer",
              paddingTop: '29px',
              paddingBottom: '29px',
              textShadow: "1px 1px 2px rgba(0, 0, 0, 2.7)",
              marginTop: "40px",
              fontWeight: "400",
            }}
          >
            Create New Game Room
          </motion.button>
          <motion.button
            onClick={() => {
              playClickSound();
              handleQuit();
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            style={{
              background: "linear-gradient(to bottom, white 10%, rgba(147, 204, 77, 0.7) 50%,rgb(152, 223, 66) 70%, #77aa4e 100%)",
              color: "white",
              padding: "10px 10px",
              borderRadius: "10px",
              border: "2.3px solid black",
              width: '220px',
              height: '80px',
              fontSize: "18px",
              cursor: "pointer",
              paddingTop: '29px',
              paddingBottom: '29px',
              textShadow: "1px 1px 2px rgba(0, 0, 0, 2.7)",
              marginTop: "40px",
              fontWeight: "400",
            }}
          >
            Back to Home
          </motion.button>
        </div>
      </motion.div>
    );
  };
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
            width: 40%;
            height: auto;
            display: flex;
            justify-content: center;
            align-items: center;
            margin-top: -300px;
            padding: 20px;
            gap: 60px;
          }
          
          .trivia-quiz-category .categoryBT button {
            width: 220px;
            height: 60px;
            borderRadius: "10px",
            border: "2.3px solid black",
            font: 24px;
            paddingTop: '29px',
            paddingBottom: '29px',
            background: "linear-gradient(to bottom, white 30%, rgba(170, 217, 113, 0.7) 50%, #aad971 70%, #77aa4e 100%)",
          }
          
          @media screen and (max-width: 768px) {
            .trivia-quiz-category .categoryBody {
              margin-top: 0px;
              padding: 0px;
            }
            .trivia-quiz-category .categoryContainer {
              margin-top: 0px;
              padding: 0px;
              height: 40vh;
            }
          
            .trivia-quiz-category .categoryDiv {
              width: fit-content;
              height: 300px;
              display: flex;
              flex-direction: row;
              justify-content: center;
              align-items: center;
              gap: 20px;
              overflow-x: visible;
              margin: auto;
              margin-bottom: 30px;
              animation: passing 2s ease-in-out;
              animation-delay: .5s;
            }
            .trivia-quiz-category .catBox {
              height: 100%;
              margin: auto;
            }
            .trivia-quiz-category .item1 {
              width: 100%;
              height: 210px;
              margin: 0px auto;
            }
            .trivia-quiz-category .categoryBT button {
              width: 100%;
              height: auto;
              font-size: 20px;
              padding: 10px;
            }
          
            .trivia-quiz-category .categoryBT {
              width: 70%;
              height: auto;
              display: flex;
              flex-direction: column;
              justify-content: center;
              align-items: center;
              margin: auto;
              padding: 20px;
              gap: 20px;
              margin-top: 50px;
            }
          }

          .trivia-quiz-category .cat {
            font-size: 20px;
            font-weight: 400;
            color: black;
            text-align: center;
            margin: 10px 0;
            font-family: Bagel Fat One;
          }
        `}
      </style>

      {/* Settings Page Pop-Up */}
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
              background: `url(${backgroundImage}) no-repeat center center/cover`,
              padding: "5px 15px",
              borderRadius: "20px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginRight: "10px",
              minWidth: `${bgImageWidth}px`,
              height: `${bgImageHeight}px`,
              backgroundSize: "100% 100%",
            }}
          >
            <span
              style={{
                color: "white",
                fontFamily: "Bagel Fat One",
                paddingLeft: "50px",
                fontSize: "24px",
                fontWeight: "400",
                alignItems: "center"
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
              style={{
                display: "flex",
                justifyContent: "center",
                gap: "20px",
                marginBottom: "20px",
                marginTop: "50px",
              }}
            >
              <motion.button
                onClick={() => {
                  playClickSound();
                  handleGameModeSelect("single");
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                style={{
                  background: "transparent",
                  color: "#FF5733",
                  padding: "15px 50px",
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
                onClick={() => {
                  playClickSound();
                  handleGameModeSelect("multiplayer");
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                style={{
                  background: "transparent",
                  color: "#FF5733",
                  padding: "15px 50px",
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
                  background:
                    "linear-gradient(90deg, rgb(13, 88, 25), #FF5733)",
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
                  background:
                    "linear-gradient(90deg, rgb(13, 88, 25), #FF5733)",
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
                onClick={() => playClickSound()}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95}}
                style={{
                  background:
                    "linear-gradient(90deg, rgb(13, 88, 25), #FF5733)",
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
                onClick={() => playClickSound()}
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

        {gameMode === "single" && showLevelSelection && (
          <motion.div
            key="level-selection"
            variants={screenVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="level-selection"
            style={{ textAlign: "center", padding: "20px" }}
          >
            <h2 style={{ fontSize: "48px", marginBottom: "20px", fontFamily: "Bagel Fat One", fontWeight: "400" }}>
              SELECT GAME LEVEL
            </h2>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(4, 1fr)",
                gap: "10px",
                marginBottom: "20px",
                marginInline: "auto",
                maxWidth: "1020px",
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
                    width: "150px",
                    height: "150px",
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
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                style={{
                  background: "linear-gradient(to bottom, white 10%, rgba(170, 217, 113, 0.7) 50%, #aad971 70%, #77aa4e 100%)",
                  color: "white",
                  borderRadius: "10px",
                  border: "2.3px solid black",
                  width: '220px',
                  height: '90px',
                  fontSize: "24px",
                  cursor: "pointer",
                  paddingTop: '29px',
                  paddingBottom: '29px',
                  fontFamily: 'Athletics',
                  fontWeight: '500',
                  textShadow: "1px 1px 2px rgba(0, 0, 0, 2.3)"
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
                  <div
                    className="catBox nature"
                    onClick={() => {
                      playClickSound();
                      handleCategorySelect("nature");
                    }}
                  >
                    <h2 className="cat cat1">SCIENCE & NATURE</h2>
                    <div className="item1">
                      <img src={Cat1} alt="" />
                    </div>
                  </div>

                  <div
                    className="catBox nature"
                    onClick={() => {
                      playClickSound();
                      handleCategorySelect("sports");
                    }}
                  >
                    <h2 className="cat cat1">SPORTS & GAMES</h2>
                    <div className="item1">
                      <img src={Cat2} alt="" />
                    </div>
                  </div>

                  <div
                    className="catBox nature"
                    onClick={() => {
                      playClickSound();
                      handleCategorySelect("geography");
                    }}
                  >
                    <h2 className="cat cat1">GEOGRAPHY</h2>
                    <div className="item1">
                      <img src={Cat3} alt="" />
                    </div>
                  </div>

                  <div
                    className="catBox nature"
                    onClick={() => {
                      playClickSound();
                      handleCategorySelect("tv");
                    }}
                  >
                    <h2 className="cat cat1">TV & MOVIES</h2>
                    <div className="item1">
                      <img src={Cat4} alt="" />
                    </div>
                  </div>

                  <div
                    className="catBox nature"
                    onClick={() => {
                      playClickSound();
                      handleCategorySelect("literature");
                    }}
                  >
                    <h2 className="cat cat1">LITERATURE & BOOKS</h2>
                    <div className="item1">
                      <img src={Cat5} alt="" />
                    </div>
                  </div>

                  <div
                    className="catBox nature"
                    onClick={() => {
                      playClickSound();
                      handleCategorySelect("food");
                    }}
                  >
                    <h2 className="cat cat1">FOOD & DRINKS</h2>
                    <div className="item1">
                      <img src={Cat6} alt="" />
                    </div>
                  </div>
                </div>
                <div className="categoryBT">
                  <button
                    className="catBTN btn1"
                    onClick={() => {
                      playClickSound();
                      setShowCategorySelection(false);
                      setShowLevelSelection(true);
                    }}
                  >
                    Back
                  </button>
                  <button className="catBTN btn2" disabled>
                    Next
                  </button>
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
            style={{ textAlign: "center", padding: "20px" }}
          >
            <h2 style={{ fontSize: "48px", marginBottom: "40px", fontFamily: "Bagel Fat One", fontWeight: "400" }}>
              SELECT DIFFICULTY
            </h2>
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
                  padding: "15px 50px",
                  borderRadius: "10px",
                  border: "none",
                  fontSize: "16px",
                  fontWeight: "bold",
                  cursor: "pointer",
                  width: "400px",
                  height: "80px"
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
                  padding: "15px 50px",
                  borderRadius: "10px",
                  border: "none",
                  fontSize: "16px",
                  fontWeight: "bold",
                  cursor: "pointer",
                  width: "400px",
                  height: "80px"
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
                  padding: "15px 50px",
                  borderRadius: "10px",
                  border: "none",
                  fontSize: "16px",
                  fontWeight: "bold",
                  cursor: "pointer",
                  width: "400px",
                  height: "80px"
                }}
              >
                Hard
              </motion.button>
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                gap: "10px",
                marginTop: "20px",
              }}
            >
              <motion.button
                onClick={() => {
                  playClickSound();
                  setCategory(null);
                  setShowCategorySelection(true);
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: "0.95" }}
                style={{
                  background: "linear-gradient(to bottom, white 10%, rgba(170, 217, 113, 0.7) 50%, #aad971 70%, #77aa4e 100%)",
                  color: "white",
                  padding: "10px 30px",
                  borderRadius: "10px",
                  border: "2.3px solid black",
                  width: '220px',
                  height: '80px',
                  fontSize: "24px",
                  cursor: "pointer",
                  paddingTop: '29px',
                  paddingBottom: '29px',
                  textShadow: "1px 1px 2px rgba(0, 0, 0, 2.7)",
                  marginTop: "40px",
                  fontWeight: "400"
                }}
              >
                {'<'} Back 
              </motion.button>
              <motion.button
                onClick={() => {
                  playClickSound();
                  handleDifficultySelect(activeDifficulty);
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                style={{
                  background: "linear-gradient(to bottom, white 30%, rgba(170, 217, 113, 0.7) 50%, #aad971 70%, #77aa4e 100%)",
                  color: "white",
                  padding: "10px 30px",
                  borderRadius: "10px",
                  border: "2.3px solid black",
                  width: '220px',
                  height: '80px',
                  fontSize: "24px",
                  cursor: "pointer",
                  paddingTop: '29px',
                  paddingBottom: '29px',
                  textShadow: "1px 1px 2px rgba(0, 0, 0, 2.7)",
                  marginTop: "40px",
                  fontWeight: "400"
                }}
              >
                Next {'>'}
              </motion.button>
            </div>
          </motion.div>
        )}

        {gameMode === "multiplayer" && multiplayerScreen === "menu" && (
          <MultiplayerMenu />
        )}
        {gameMode === "multiplayer" && multiplayerScreen === "create-or-join" && <CreateOrJoin />}
        {gameMode === "multiplayer" && multiplayerScreen === "create-room-setup" && <CreateRoomSetup />}
        {gameMode === "multiplayer" && multiplayerScreen === "create-room" && <CreateRoom />}
        {gameMode === "multiplayer" && multiplayerScreen === "join-room" && <JoinRoom />}
        {gameMode === "multiplayer" && multiplayerScreen === "countdown" && playersReady && <Countdown />}
        {gameMode === "multiplayer" && multiplayerScreen === "game" && playersReady && !levelComplete && <MultiplayerGameBoard />}
        {gameMode === "multiplayer" && multiplayerScreen === "results" && <GameResults />}

        {gameMode === "single" && gameStarted && !gameOver && !levelComplete && category && (
          <motion.div
            key={`question-${currentQuestion}`}
            variants={screenVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="game-board"
            style={{ padding: "20px", textAlign: "center", maxWidth: '2580px', marginInline: 'auto', backgroundImage: `url(${triviabackground})`, backgroundSize: "cover" }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                marginBottom: "20px",
                gap: "10px",
              }}
            >
              <TimerDisplay timeLeft={timeLeft} />
              {/* Pause Button for Single Player */}
              <button
                onClick={handlePause}
                style={{
                  background: "none",
                  border: "none",
                  fontSize: "16px",
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
                  color: "white",
                  padding: "5px 15px",
                  borderRadius: "21.93px",
                  width: "200px",
                  height: "87px",
                  fontFamily: "Bagel Fat One"
                }}
              >
                Question {currentQuestion + 1} of {QUESTIONS_PER_LEVEL[level]}
              </span>
            </div>
            <div
              style={{
                border: "2px solid white",
                borderRadius: "10px",
                padding: "81px 155px 81px 155px",
                background: "transparent",
                marginBottom: "81px",
                fontWeight: "500",
                fontSize: "40px",
                color: "white",
                maxWidth: '1020px',
                marginInline: 'auto'
              }}
            >
              <h2 style={{ fontSize: "20px", margin: 0 }}>
                {TRIVIA_QUESTIONS[category][currentQuestion].question}
              </h2>
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "10px",
                marginBottom: "50px",
                maxWidth: '1020px',
                marginInline: 'auto'
              }}
            >
              {TRIVIA_QUESTIONS[category][currentQuestion].options.map(
                (option, index) => (
                  <motion.button
                    key={index}
                    onClick={() => handleAnswer(option)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    style={{
                      background: feedback
                        ? option ===
                          TRIVIA_QUESTIONS[category][currentQuestion].correctAnswer
                          ? "#32CD32"
                          : option === selectedAnswer
                          ? "#FF0000"
                          : "white"
                        : "white",
                      border: "2px solid #000",
                      borderRadius: "10px",
                      padding: "15px",
                      fontSize: "16px",
                      cursor: feedback || isPaused ? "not-allowed" : "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                    }}
                  >
                    <span
                      style={{
                        background: "#D3D3D3",
                        borderRadius: "50%",
                        width: "30px",
                        height: "30px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {String.fromCharCode(65 + index)}
                    </span>
                    {option}
                  </motion.button>
                )
              )}
            </div>
            {feedback && (
              <div
                style={{
                  background: feedback === "correct" ? "#90EE90" : "#FFB6C1",
                  padding: "10px",
                  borderRadius: "10px",
                  maxWidth: "1020px", marginInline: "auto"
                }}
              >
                <span style={{ fontSize: "18px", fontWeight: "bold", maxWidth: "1020px", marginInline: "auto" }}>
                  {feedback === "correct"
                    ? "✅ Correct!"
                    : "❌ Oops.. you got that wrong."}
                </span>
                <p>
                  {feedback === "correct"
                    ? ""
                    : `The correct answer is "${TRIVIA_QUESTIONS[category][currentQuestion].correctAnswer}".`}
                </p>
              </div>
            )}
          </motion.div>
        )}

        {gameMode === "single" && levelComplete && (
          <motion.div
            key="level-complete-screen"
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
              QUESTIONS_PER_LEVEL[level] / 2
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
            <div style={{ display: "flex", justifyContent: "center", gap: "30px", flexWrap: 'wrap' }}>
              {answers.filter((a) => a.selectedAnswer === a.correctAnswer).length >=
                QUESTIONS_PER_LEVEL[level] / 2 && level < 8 && (
                <motion.button
                  onClick={() => {
                    playClickSound();
                    handleNextLevel();
                  }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  style={{
                    background: "linear-gradient(to bottom, white 10%, rgba(170, 217, 113, 0.7) 50%, #aad971 70%, #77aa4e 100%)",
                    color: "white",
                    padding: "10px 30px",
                    borderRadius: "10px",
                    border: "2.3px solid black",
                    width: '220px',
                    height: '80px',
                    fontSize: "24px",
                    cursor: "pointer",
                    paddingTop: '29px',
                    paddingBottom: '29px',
                    textShadow: "1px 1px 2px rgba(0, 0, 0, 2.7)",
                    marginTop: "40px",
                    fontWeight: "400"
                  }}
                >
                  Next Level
                </motion.button>
              )}
              <motion.button
                onClick={() => {
                  playClickSound();
                  handleRetryLevel();
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                style={{
                  background: "linear-gradient(to bottom, white 10%, rgba(170, 217, 113, 0.7) 50%, #aad971 70%, #77aa4e 100%)",
                  color: "white",
                  padding: "10px 30px",
                  borderRadius: "10px",
                  border: "2.3px solid black",
                  width: '220px',
                  height: '80px',
                  fontSize: "24px",
                  cursor: "pointer",
                  paddingTop: '29px',
                  paddingBottom: '29px',
                  textShadow: "1px 1px 2px rgba(0, 0, 0, 2.7)",
                  marginTop: "40px",
                  fontWeight: "400"
                }}
              >
                Retry Level
              </motion.button>
              <motion.button
                onClick={() => {
                  playClickSound();
                  handleQuit();
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                style={{
                  background: "linear-gradient(to bottom, white 10%, rgba(170, 217, 113, 0.7) 50%, #aad971 70%, #77aa4e 100%)",
                  color: "white",
                  padding: "10px 30px",
                  borderRadius: "10px",
                  border: "2.3px solid black",
                  width: '220px',
                  height: '80px',
                  fontSize: "24px",
                  cursor: "pointer",
                  paddingTop: '29px',
                  paddingBottom: '29px',
                  textShadow: "1px 1px 2px rgba(0, 0, 0, 2.7)",
                  marginTop: "40px",
                  fontWeight: "400"
                }}
              >
                Back to Home
              </motion.button>
            </div>
          </motion.div>
        )}

        {gameMode === "single" && gameOver && (
          <motion.div
            key="game-over-screen"
            variants={screenVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="game-over-screen"
            style={{ textAlign: "center", padding: "20px" }}
          >
            <h2 style={{ fontSize: "24px", marginBottom: "20px" }}>GAME OVER!</h2>
            <p style={{ fontSize: "18px", marginBottom: "20px" }}>
              Time's up! Your score: {score}
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
                  background: "linear-gradient(to bottom, white 10%, rgba(170, 217, 113, 0.7) 50%, #aad971 70%, #77aa4e 100%)",
                  color: "white",
                  padding: "10px 30px",
                  borderRadius: "10px",
                  border: "2.3px solid black",
                  width: '220px',
                  height: '80px',
                  fontSize: "24px",
                  cursor: "pointer",
                  paddingTop: '29px',
                  paddingBottom: '29px',
                  textShadow: "1px 1px 2px rgba(0, 0, 0, 2.7)",
                  marginTop: "40px",
                  fontWeight: "400"
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
                  background: "linear-gradient(to bottom, white 10%, rgba(170, 217, 113, 0.7) 50%, #aad971 70%, #77aa4e 100%)",
                  color: "white",
                  padding: "10px 30px",
                  borderRadius: "10px",
                  border: "2.3px solid black",
                  width: '220px',
                  height: '80px',
                  fontSize: "24px",
                  cursor: "pointer",
                  paddingTop: '29px',
                  paddingBottom: '29px',
                  textShadow: "1px 1px 2px rgba(0, 0, 0, 2.7)",
                  marginTop: "40px",
                  fontWeight: "400"
                }}
              >
                Back to Home
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TriviaQuiz;