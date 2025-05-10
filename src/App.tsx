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
          
          {/* Public routes wrapped with WagmiWrapper */}
          <Route path="/" element={
            <WagmiWrapper>
              <Home />
            </WagmiWrapper>
          } />
          <Route path="/signup" element={
            <WagmiWrapper>
              <SignUp />
            </WagmiWrapper>
          } />
          <Route path="/login" element={
            <WagmiWrapper>
              <Login />
            </WagmiWrapper>
          } />
          
          {/* Protected routes NOT wrapped with WagmiWrapper */}
          <Route path="/profile-setup" element={
            <ProtectedRoute>
              <ProfileSetup />
            </ProtectedRoute>
          } />
          <Route path="/studio-page" element={
            <ProtectedRoute>
              <StudioPage />
            </ProtectedRoute>
          } />
          <Route path="/settings-page" element={
            <ProtectedRoute>
              <SettingsPage />
            </ProtectedRoute>
          } />
          
          {/* Protected routes wrapped with WagmiWrapper */}
          <Route path="/games" element={
            <ProtectedRoute>
              <WagmiWrapper>
                <Games />
              </WagmiWrapper>
            </ProtectedRoute>
          } />
          <Route path="/profile" element={
            <ProtectedRoute>
              <WagmiWrapper>
                <Profile />
              </WagmiWrapper>
              </ProtectedRoute>
          } />
          <Route path="/leaderboard" element={
            <ProtectedRoute>
              <WagmiWrapper>
                <Leaderboard />
              </WagmiWrapper>
            </ProtectedRoute>
          } />
          <Route path="/studio" element={
            <ProtectedRoute>
              <WagmiWrapper>
                <div>Studio Page (TBD)</div>
              </WagmiWrapper>
            </ProtectedRoute>
          } />
          <Route path="/about" element={
            <WagmiWrapper>
              <div>About Page (TBD)</div>
            </WagmiWrapper>
          } />
          
          {/* 404 Route */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;