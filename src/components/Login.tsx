import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import Logo from '../assets/logo.png';
import { useAuth } from '../context/AuthContext';
import { playSound } from '../services/playSound';
import signInSound from '../assets/audio/sign-in-sound.wav';

export default function Login() {
  const navigate = useNavigate();
  const { login, currentUser } = useAuth();
  
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: value
    }));
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    
    try {
      await login(formData.username, formData.password);
      playSound(signInSound); // Play sign-in sound
      // Add welcome back notification to localStorage
      const displayName = currentUser?.displayName || formData.username; // Fallback to username if displayName isn't set yet
      const welcomeBackMessage = `Yoo! Welcome back, ${displayName}!`;
      localStorage.setItem('welcomeNotification', JSON.stringify({
        id: Date.now(),
        message: welcomeBackMessage,
        time: 'Just now',
        action: { type: 'welcome' },
      }));
      navigate('/game-platform');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid username or password');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-left">
        <Link to="/" className="auth-logo">
          <img src={Logo} alt="EightBit Logo" className="auth-logo-icon" />
          <span className="auth-logo-text">EightBit</span>
        </Link>
        <div className="auth-tagline">
          <h1>Bits of Fun!
            <br/>
            Instant Games.
          </h1>
        </div>
      </div>
      <div className="auth-right">
        <button className="auth-back-btn" onClick={() => navigate('/')}>
          <span className="auth-back-arrow">←</span>
          <span className="auth-back-text">Back</span>
        </button>
        <h2 className="auth-title1">Yoo, welcome back!</h2>
        
        {error && (
          <div className="auth-error-message">
            {error}
          </div>
        )}
        
        <form className="auth-form" onSubmit={handleLogin}>
          <div className="auth-form-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              placeholder="Enter username"
              value={formData.username}
              onChange={handleChange}
              required
            />
          </div>
          <div className="auth-form-group">
            <label htmlFor="password">Password</label>
            <div className="password-input-wrapper">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                placeholder="Enter password"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>
          </div>
          <button 
            type="submit" 
            className="auth-submit-btn"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Logging in...' : 'Login'}
          </button>
          <p className="auth-link-text auth-forgot-password">
            <Link to="/forgot-password">Forgot password?</Link>
          </p>
        </form>
        <div className="auth-divider">
          <span>Or</span>
        </div>
        <p className="auth-link-text">
          First time on EightBit?{' '}
          <Link to="/signup" className="auth-link">
            Sign up here
          </Link>
        </p>
        <footer className="auth-footer">
          ©2025 EIGHTBIT STUDIO, ALL RIGHTS RESERVED.
        </footer>
      </div>
    </div>
  );
}