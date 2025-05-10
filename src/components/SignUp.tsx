// src/components/SignUp.tsx
import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import Logo from '../assets/logo.png';
import { useAuth } from '../context/AuthContext';

export default function SignUp() {
  const navigate = useNavigate();
  const { signup } = useAuth();
  
  const [formData, setFormData] = useState({
    username: '',
    email: '',
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

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    
    try {
      await signup(formData.email, formData.password, formData.username);
      // Redirect to profile setup page after successful signup
      navigate('/profile-setup');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred during sign up');
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
        <h2 className="auth-title">Sign Up</h2>
        
        {error && (
          <div className="auth-error-message">
            {error}
          </div>
        )}
        
        <form className="auth-form" onSubmit={handleSignUp}>
          <div className="auth-form-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              placeholder="Enter user name"
              value={formData.username}
              onChange={handleChange}
              required
            />
          </div>
          <div className="auth-form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              placeholder="Enter email address"
              value={formData.email}
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
            {isSubmitting ? 'Signing up...' : 'Sign up'}
          </button>
        </form>
        <div className="auth-divider">
          <span>Or</span>
        </div>
        <p className="auth-link-text">
          Have an account?{' '}
          <Link to="/login" className="auth-link">
            Log in here
          </Link>
        </p>
        <footer className="auth-footer">
          ©2025 EIGHTBIT STUDIO, ALL RIGHTS RESERVED.
        </footer>
      </div>
    </div>
  );
}