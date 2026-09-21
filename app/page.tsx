import Header from './components/Header';
import Hero from './components/Hero';
import Capabilities from './components/Capabilities';
import StoryShowcase from './components/StoryShowcase';
import Footer from './components/Footer';

export default function Home() {
  return (
    <div className="landing-page">
      <Header />
      
      <main>
        <Hero />
        <Capabilities />
        <StoryShowcase />
      </main>
      
      <Footer />
    </div>
  );
}
