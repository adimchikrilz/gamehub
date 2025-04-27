import { WagmiProvider, createConfig, http } from 'wagmi';
import { sepolia } from 'wagmi/chains';
import { injected } from 'wagmi/connectors';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { ReactNode, useState } from 'react';
import WalletConnect from './WalletConnect';
import '../styles.css';

const queryClient = new QueryClient();
const config = createConfig({
  chains: [sepolia],
  connectors: [injected()],
  transports: {
    [sepolia.id]: http(),
  },
});

interface WagmiWrapperProps {
  children: ReactNode;
}

export default function WagmiWrapper({ children }: WagmiWrapperProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen((prev) => !prev);
  };

  return (
    <QueryClientProvider client={queryClient}>
      <WagmiProvider config={config}>
        <nav className="nav">
          <div className="nav-content">
            <Link to="/" className="nav-logo">
              GameHub
            </Link>
            <button
              className="hamburger"
              onClick={toggleMobileMenu}
              aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
            >
              <span className="hamburger-line"></span>
              <span className="hamburger-line"></span>
              <span className="hamburger-line"></span>
            </button>
            <div className={`nav-links ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
              <Link to="/games" className="nav-link" onClick={() => setIsMobileMenuOpen(false)}>
                Games
              </Link>
              <Link to="/profile" className="nav-link" onClick={() => setIsMobileMenuOpen(false)}>
                Profile
              </Link>
              <Link to="/leaderboard" className="nav-link" onClick={() => setIsMobileMenuOpen(false)}>
                Leaderboard
              </Link>
              <div className="wallet-connect-wrapper">
                <WalletConnect />
              </div>
            </div>
          </div>
        </nav>
        <main>{children}</main>
      </WagmiProvider>
    </QueryClientProvider>
  );
}