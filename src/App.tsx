import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
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
import { AuthProvider } from './context/AuthContext'; // Import auth styles if you have them
import { JSX } from 'react';
import GamePlatform from './pages/GamePlatform';
import ProfilePage from './pages/ProfilePages';
import Categories from './pages/Categories'; // Import Categories component
import Achievements from './pages/Achievements';
import Settings from './pages/Settings';

// Protected route component
const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const isAuthenticated = localStorage.getItem('user') !== null;
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
          <Route path="/profile-page" element={<ProfilePage />} />
          
          {/* Public routes wrapped with WagmiWrapper */}
          <Route path="/" element={<WagmiWrapper><Home /></WagmiWrapper>} />
          <Route path="/signup" element={<SignUp />} />
          
          {/* Protected routes NOT wrapped with WagmiWrapper */}
          <Route path="/profile-setup" element={<ProtectedRoute><ProfileSetup /></ProtectedRoute>} />
          <Route path="/studio-page" element={<ProtectedRoute><StudioPage /></ProtectedRoute>} />
          <Route path="/settings-page" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
          
          {/* Protected routes wrapped with WagmiWrapper */}
          <Route path="/games" element={<ProtectedRoute><WagmiWrapper><Games /></WagmiWrapper></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><WagmiWrapper><Profile /></WagmiWrapper></ProtectedRoute>} />
          <Route path="/leaderboard" element={<ProtectedRoute><WagmiWrapper><Leaderboard /></WagmiWrapper></ProtectedRoute>} />
          <Route path="/studio" element={<ProtectedRoute><WagmiWrapper><div>Studio Page (TBD)</div></WagmiWrapper></ProtectedRoute>} />
          <Route path="/about" element={<WagmiWrapper><div>About Page (TBD)</div></WagmiWrapper>} />
          
          {/* GamePlatform as a layout with nested routes */}
          <Route path="/game-platform" element={<ProtectedRoute><GamePlatform /></ProtectedRoute>}>
            <Route index element={<div className="main-content">Game Platform Dashboard</div>} /> {/* Default content */}
            <Route path="categories" element={<Categories />} /> {/* Nested categories route */}
            <Route path="leaderboard" element={<Leaderboard/>} />
            <Route path="achievements" element={<Achievements/>} />
            <Route path="friends" element={<div>Friends Page</div>} />
            <Route path="settings" element={<Settings/>} />
          </Route>
          
          {/* Remove standalone categories route since it's now nested */}
          {/* <Route path="/categories" element={<Categories />} /> */}
          
          {/* 404 Route */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;