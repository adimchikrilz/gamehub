import { WagmiProvider, createConfig, http } from 'wagmi';
import { sepolia } from 'wagmi/chains';
import { injected } from 'wagmi/connectors';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import WalletConnect from './WalletConnect';
import { Link } from 'react-router-dom';
import { ReactNode } from 'react';

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
  return (
    <QueryClientProvider client={queryClient}>
      <WagmiProvider config={config}>
        <nav className="nav">
          <div className="nav-content">
            <Link to="/" className="nav-logo">
              GameHub
            </Link>
            <div className="nav-links">
              <Link to="/games" className="nav-link">
                Games
              </Link>
              <Link to="/profile" className="nav-link">
                Profile
              </Link>
              <Link to="/leaderboard" className="nav-link">
                Leaderboard
              </Link>
              <WalletConnect />
            </div>
          </div>
        </nav>
        <main>{children}</main>
      </WagmiProvider>
    </QueryClientProvider>
  );
}