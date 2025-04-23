import { Link } from 'react-router-dom';

export default function Games() {
  return (
    <div className="container py-10">
      <h1>Choose a Game</h1>
      <div className="games-grid">
        {[
          { name: 'Memory Card Game', path: '/games/card-game', desc: 'Flip cards to find matching pairs!' },
          { name: 'Trivia Quiz', path: '/games/trivia-quiz', desc: 'Test your knowledge with fun questions!' },
        ].map((game) => (
          <div key={game.name} className="games-card">
            <h2>{game.name}</h2>
            <p>{game.desc}</p>
            <Link to={game.path} className="button button-primary">
              Play Now
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}