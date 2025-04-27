// import { Link } from 'react-router-dom';

// export default function Home() {
//   return (
//     <div className="container py-10">
//       <header className="home-header">
//         <h1>Welcome to GameHub</h1>
//         <p>Your one-stop platform for casual, fun, and competitive gaming!</p>
//       </header>
//       <section className="home-grid">
//         {[
//           { name: 'Memory Card Game', path: '/games/card-game', desc: 'Flip cards to find matching pairs!' },
//           { name: 'Trivia Quiz', path: '/games/trivia-quiz', desc: 'Test your knowledge with fun questions!' },
//         ].map((game) => (
//           <div key={game.name} className="home-card">
//             <h2>{game.name}</h2>
//             <p>{game.desc}</p>
//             <Link to={game.path} className="button button-primary">
//               Play Now
//             </Link>
//           </div>
//         ))}
//       </section>
//     </div>
//   );
// }
import React from 'react';
import { Link } from 'react-router-dom';
import { useAccount, useConnect } from 'wagmi';
import { motion } from 'framer-motion';
import '../styles.css';

const Home: React.FC = () => {
  const { address } = useAccount();
  const { connect, connectors } = useConnect();

  return (
    <div className="landing-container">
      <div className="hero-section">
        <h1 className="hero-title">Welcome to GameHub</h1>
        <p className="hero-subtitle">Your one-stop platform for casual, fun, and competitive gaming!</p>
        {!address && (
          <motion.button
            className="hero-button"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => connect({ connector: connectors[0] })}
          >
            Connect Wallet
          </motion.button>
        )}
      </div>
      <div className="games-section">
        <h2 className="games-title">Choose a Game</h2>
        <div className="game-list">
          {[
            { name: 'Memory Card Game', path: '/games/card-game', desc: 'Flip cards to find matching pairs!' },
            { name: 'Trivia Quiz', path: '/games/trivia-quiz', desc: 'Test your knowledge with fun questions!' },
          ].map((game) => (
            <motion.div
              key={game.name}
              className="game-card"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <h3 className="game-card-title">{game.name}</h3>
              <p className="game-card-description">{game.desc}</p>
              <Link to={game.path} className="game-card-button">
                Play Now
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Home;