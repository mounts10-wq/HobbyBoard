import { Link } from "react-router-dom";

function Home() {
  return (
    <section className="hero">
      <h1>Organize every project in one place.</h1>
      <p>
        HobbyBoard helps makers, builders, and hobbyists create project boards,
        track tasks, and manage progress without scattered notes.
      </p>
      <div className="hero-actions">
        <Link to="/signup" className="primary-button">
          Get Started
        </Link>

        <Link to="/login" className="secondary-button">
          Login
        </Link>
      </div>
    </section>
  );
}

export default Home;