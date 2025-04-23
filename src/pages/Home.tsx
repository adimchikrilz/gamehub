import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div className="container py-10">
      <header className="home-header">
        <h1>Welcome to GameHub</h1>
        <p>Your one-stop platform for casual, fun, and competitive gaming!</p>
      </header>
      <section className="home-grid">
        {[
          { name: 'Memory Card Game', path: '/games/card-game', desc: 'Flip cards to find matching pairs!' },
          { name: 'Trivia Quiz', path: '/games/trivia-quiz', desc: 'Test your knowledge with fun questions!' },
        ].map((game) => (
          <div key={game.name} className="home-card">
            <h2>{game.name}</h2>
            <p>{game.desc}</p>
            <Link to={game.path} className="button button-primary">
              Play Now
            </Link>
          </div>
        ))}
      </section>
    </div>
  );
}