import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import Logo from '../assets/logo.png';
import BackgroundImage from '../assets/background-cubes.png'; // Adjust the path to your background image

export default function Login() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Add your login logic here (e.g., API call)
    navigate('/'); // Redirect to home page after login
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
        <form className="auth-form" onSubmit={handleLogin}>
          <div className="auth-form-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              placeholder="Enter user name"
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
          <button type="submit" className="auth-submit-btn">
            Login
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