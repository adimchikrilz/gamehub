import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import WagmiWrapper from './components/WagmiWrapper';
import Home from './pages/LandingPage';
import Games from './pages/Games';
import CardGame from './pages/CardGame';
import TriviaQuiz from './pages/TriviaQuiz';
import Profile from './pages/Profile';
import Leaderboard from './pages/Leaderboard';
import './styles.css';
import SignUp from './components/SignUp';
import Login from './components/Login';
import HowToPlay from './components/HowToPlay';
import ProfileSetup from './pages/ProfileSetup';
import StudioPage from './pages/StudioPage';
import SettingsPage from './pages/SettingsPage';
import { AuthProvider, useAuth } from './context/AuthContext';
import { JSX } from 'react';
import GamePlatform from './pages/GamePlatform';
import ProfilePage from './pages/ProfilePages';
import Categories from './pages/Categories';
import Achievements from './pages/Achievements';
import Settings from './pages/Settings';
import FlipBitGame from './pages/FlipBitGame';
import WelcomePage from './pages/WelcomePage';

// Coming Soon Component
const ComingSoon: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const gameName = searchParams.get('game') || 'This Game';

  return (
    <div className="coming-soon-page" style={{ textAlign: 'center', padding: '50px' }}>
      <h1>{gameName} - Coming Soon!</h1>
      <p>We're working hard to bring {gameName} to you. Stay tuned for updates!</p>
      <button
        onClick={() => navigate('/game-platform')}
        style={{
          marginTop: '20px',
          padding: '10px 20px',
          fontSize: '16px',
          cursor: 'pointer',
          backgroundColor: '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '5px'
        }}
      >
        Back to Dashboard
      </button>
    </div>
  );
};

// Protected route component
const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public routes NOT wrapped with WagmiWrapper */}
          <Route path="/how-to-play" element={<HowToPlay />} />
          <Route path="/games/card-game" element={<CardGame />} />
          <Route path="/games/trivia-quiz" element={<TriviaQuiz />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/profile-page" element={<ProfilePage />} />
          <Route path="/welcome" element={<WelcomePage />} />
          <Route path="/profile-setup" element={<ProfileSetup />} />
          <Route path="/settings-page" element={<SettingsPage />} />
          
          {/* Public routes wrapped with WagmiWrapper */}
          <Route path="/" element={<WagmiWrapper><Home /></WagmiWrapper>} />
          
          {/* Protected routes NOT wrapped with WagmiWrapper */}
          <Route path="/studio-page" element={<ProtectedRoute><StudioPage /></ProtectedRoute>} />
          {/* <Route path="/settings-page" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} /> */}
          
          {/* Protected routes wrapped with WagmiWrapper */}
          <Route path="/games" element={<ProtectedRoute><WagmiWrapper><Games /></WagmiWrapper></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><WagmiWrapper><Profile /></WagmiWrapper></ProtectedRoute>} />
          <Route path="/leaderboard" element={<ProtectedRoute><WagmiWrapper><Leaderboard /></WagmiWrapper></ProtectedRoute>} />
          <Route path="/studio" element={<ProtectedRoute><WagmiWrapper><div>Studio Page (TBD)</div></WagmiWrapper></ProtectedRoute>} />
          <Route path="/about" element={<WagmiWrapper><div>About Page (TBD)</div></WagmiWrapper>} />
          
          {/* GamePlatform as a layout with nested routes */}
          <Route path="/game-platform" element={<GamePlatform />}>
            <Route index element={<div className="main-content">Game Platform Dashboard</div>} />
            <Route path="categories" element={<Categories />} />
            <Route path="leaderboard" element={<Leaderboard />} />
            <Route path="achievements" element={<Achievements />} />
            <Route path="friends" element={<div>Friends Page</div>} />
            <Route path="settings" element={<Settings />} />
            <Route path="flipbit" element={<FlipBitGame />} />
            <Route path="coming-soon" element={<ComingSoon />} />
          </Route>
          
          {/* Placeholder routes */}
          <Route path="/flipbit-single" element={<div>Single Player Game</div>} />
          <Route path="/flipbit-multi" element={<div>Multiplayer Game</div>} />
          
          {/* 404 Route */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;