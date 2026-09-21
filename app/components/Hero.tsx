import WaitlistForm from './WaitlistForm';

export default function Hero() {
  return (
    <section className="hero">
      <div className="hero-content">
        <div className="hero-text">
          <p className="hero-eyebrow">AI STUDIO FOR STORYTELLERS</p>
          
          <h1 className="hero-headline">
            Turn Your Ideas<br />
            Into <span className="hero-highlight">Animated Worlds.</span>
          </h1>
          
          <p className="hero-description">
            Aempy will help you develop, visualize, and create original anime, 
            animated stories, and more — with AI that understands story, 
            characters, and cinematic direction.
          </p>
          
          <p className="hero-tagline">
            No prompt expertise required.
          </p>
          
          <WaitlistForm />
        </div>
        
        <div className="hero-art">
          <div className="hero-art-wrapper">
            <img 
              src="/images/hero-art.jpg" 
              alt="A creator and companion overlooking a vast fantasy world at sunset"
              className="hero-image"
            />
            <div className="hero-art-fade"></div>
          </div>
          
          <div className="hero-decoration">
            <span className="decoration-text">
              Same Stories.<br />
              Bigger Worlds.
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
