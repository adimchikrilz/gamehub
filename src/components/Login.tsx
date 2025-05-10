// src/components/Login.tsx
import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import Logo from '../assets/logo.png';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  
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
      // Redirect to home page after successful login
      navigate('/');
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
          EightBit
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
          <span className="auth-back-arrow">←</span> Back
        </button>
        <h2 className="auth-title">Yoo, welcome back!</h2>
        
        {error && (
          <div className="auth-error-message">
            {error}
          </div>
        )}
        
        <form className="auth-form" onSubmit={handleLogin}>
          <div className="auth-form-group">
            <label htmlFor="username">Username or Email</label>
            <input
              type="text"
              id="username"
              placeholder="Enter username or email"
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
              <button
                type="button"
                className="password-toggle"
                onClick={togglePasswordVisibility}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? '🙈' : '👁️'}
              </button>
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