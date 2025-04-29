import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import WagmiWrapper from './components/WagmiWrapper';
import Home from './pages/LandingPage';
import Games from './pages/Games';
import CardGame from './pages/CardGame';
import TriviaQuiz from './pages/TriviaQuiz';
import Profile from './pages/Profile';
import Leaderboard from './pages/Leaderboard';
import './styles.css';

function App() {
  return (
    <Router>
      <WagmiWrapper>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/games" element={<Games />} />
          <Route path="/games/card-game" element={<CardGame />} />
          <Route path="/games/trivia-quiz" element={<TriviaQuiz />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/studio" element={<div>Studio Page (TBD)</div>} />
          <Route path="/about" element={<div>About Page (TBD)</div>} />
        </Routes>
      </WagmiWrapper>
    </Router>
  );
}

export default App;