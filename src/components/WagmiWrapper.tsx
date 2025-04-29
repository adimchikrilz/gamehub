// import { WagmiProvider, createConfig, http } from 'wagmi';
// import { sepolia } from 'wagmi/chains';
// import { injected } from 'wagmi/connectors';
// import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
// import { Link } from 'react-router-dom';
// import { ReactNode, useState } from 'react';
// import WalletConnect from './WalletConnect';
// import '../styles.css';

// const queryClient = new QueryClient();
// const config = createConfig({
//   chains: [sepolia],
//   connectors: [injected()],
//   transports: {
//     [sepolia.id]: http(),
//   },
// });

// interface WagmiWrapperProps {
//   children: ReactNode;
// }

// export default function WagmiWrapper({ children }: WagmiWrapperProps) {
//   const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

//   const toggleMobileMenu = () => {
//     setIsMobileMenuOpen((prev) => !prev);
//   };

//   return (
//     <QueryClientProvider client={queryClient}>
//       <WagmiProvider config={config}>
//         <nav className="nav">
//           <div className="nav-content">
//             <Link to="/" className="nav-logo">
//               GameHub
//             </Link>
//             <button
//               className="hamburger"
//               onClick={toggleMobileMenu}
//               aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
//             >
//               <span className="hamburger-line"></span>
//               <span className="hamburger-line"></span>
//               <span className="hamburger-line"></span>
//             </button>
//             <div className={`nav-links ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
//               <Link to="/games" className="nav-link" onClick={() => setIsMobileMenuOpen(false)}>
//                 Games
//               </Link>
//               <Link to="/profile" className="nav-link" onClick={() => setIsMobileMenuOpen(false)}>
//                 Profile
//               </Link>
//               <Link to="/leaderboard" className="nav-link" onClick={() => setIsMobileMenuOpen(false)}>
//                 Leaderboard
//               </Link>
//               <div className="wallet-connect-wrapper">
//                 <WalletConnect />
//               </div>
//             </div>
//           </div>
//         </nav>
//         <main>{children}</main>
//       </WagmiProvider>
//     </QueryClientProvider>
//   );
// }
import { Link } from 'react-router-dom';
import { ReactNode, useState } from 'react';
import '../styles.css';
import Logo from '../assets/logo.png'

interface WagmiWrapperProps {
  children: ReactNode;
}

export default function WagmiWrapper({ children }: WagmiWrapperProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen((prev) => !prev);
  };

  return (
    <>
      <nav className="nav">
        <div className="nav-content">
          <Link to="/" className="nav-logo">
            <span role="img" aria-label="gamepad"><img src={Logo} alt="US Flag" className="leaderboard-flag" /></span> EightBit
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
            <Link to="/" className="nav-link" onClick={() => setIsMobileMenuOpen(false)}>
              Home
            </Link>
            <Link to="/studio" className="nav-link" onClick={() => setIsMobileMenuOpen(false)}>
              Studio
            </Link>
            <Link to="/about" className="nav-link" onClick={() => setIsMobileMenuOpen(false)}>
              About
            </Link>
            <Link to="/login" className="nav-link-login" onClick={() => setIsMobileMenuOpen(false)}>
              Login/Sign up
            </Link>
          </div>
        </div>
      </nav>
      <main>{children}</main>
    </>
  );
}