import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
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


function App() {
  return (
    <Router>
      <Routes>
        {/* Routes NOT wrapped with WagmiWrapper */}
        <Route path="/profile-setup" element={<ProfileSetup />} />
        <Route path="/how-to-play" element={<HowToPlay />} />
        <Route path="/games/card-game" element={<CardGame />} />
        <Route path="/games/trivia-quiz" element={<TriviaQuiz />} />
        <Route path="/studio-page" element={<StudioPage />} />
        <Route path="/settings-page" element={<SettingsPage />} />
        
        
        {/* Routes wrapped with WagmiWrapper */}
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
        <Route path="/games" element={
          <WagmiWrapper>
            <Games />
          </WagmiWrapper>
        } />
        <Route path="/profile" element={
          <WagmiWrapper>
            <Profile />
          </WagmiWrapper>
        } />
        <Route path="/leaderboard" element={
          <WagmiWrapper>
            <Leaderboard />
          </WagmiWrapper>
        } />
        <Route path="/studio" element={
          <WagmiWrapper>
            <div>Studio Page (TBD)</div>
          </WagmiWrapper>
        } />
        <Route path="/about" element={
          <WagmiWrapper>
            <div>About Page (TBD)</div>
          </WagmiWrapper>
        } />
      </Routes>
    </Router>
  );
}

export default App;