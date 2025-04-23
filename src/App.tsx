import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import WagmiWrapper from './components/WagmiWrapper';
import Home from './pages/Home';
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
        </Routes>
      </WagmiWrapper>
    </Router>
  );
}

export default App;