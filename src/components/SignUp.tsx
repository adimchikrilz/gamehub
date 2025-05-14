import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Logo from '../assets/logo.png';
import { useAuth } from '../context/AuthContext';
import { playSound } from '../services/playSound';
import signInSound from '../assets/audio/sign-in-sound.wav';

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
  const [debugInfo, setDebugInfo] = useState<string | null>(null);

  // Clear any error messages when component mounts or form changes
  useEffect(() => {
    setError(null);
  }, [formData]);

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
    setDebugInfo(null);
    setIsSubmitting(true);
  
    // Form validation
    if (!formData.username || formData.username.trim().length < 3) {
      setError('Username must be at least 3 characters');
      setIsSubmitting(false);
      return;
    }
    
    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      setError('Please enter a valid email address');
      setIsSubmitting(false);
      return;
    }
    
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      setIsSubmitting(false);
      return;
    }
  
    try {
      // Add debugging information
      setDebugInfo('Sending registration request...');
      
      await signup(formData.email, formData.password, formData.username);
      
      setDebugInfo('Registration successful!');
      playSound(signInSound); // Play sign-in sound on successful signup
      
      // Short delay to ensure the user sees the success message
      setTimeout(() => {
        navigate('/profile-setup');
      }, 500);
    } catch (err) {
      let errorMessage = 'An error occurred during sign up';
      
      if (err instanceof Error) {
        errorMessage = err.message;
        
        // Additional debugging for common issues
        if (errorMessage.includes('Network Error')) {
          errorMessage = 'Cannot connect to server. Please check your internet connection.';
        } else if (errorMessage.includes('409') || errorMessage.includes('exists')) {
          errorMessage = 'Username or email already exists. Please try different credentials.';
        } else if (errorMessage.includes('400')) {
          errorMessage = 'Invalid signup data. Please check all fields.';
        }
      }
      
      setError(errorMessage);
      setDebugInfo('Registration failed - check console for details');
      console.error('Signup error details:', err);
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
        
        {debugInfo && process.env.NODE_ENV === 'development' && (
          <div className="auth-debug-info" style={{backgroundColor: '#f8f9fa', padding: '8px', marginBottom: '10px', fontSize: '0.8rem', color: '#666'}}>
            {debugInfo}
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
              minLength={3}
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
                minLength={6}
              />
              {/* <button 
                type="button"
                onClick={togglePasswordVisibility}
                className="password-toggle-btn"
              >
                {showPassword ? '🙈' : '👁️'}
              </button> */}
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