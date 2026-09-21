'use client';

import { useEffect, useRef, useState } from 'react';

interface StoryCard {
  id: string;
  label: string;
  gradient: string;
  description: string;
}

const storyCards: StoryCard[] = [
  {
    id: 'fantasy',
    label: 'Fantasy',
    gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    description: 'Epic fantasy worlds'
  },
  {
    id: 'scifi',
    label: 'Sci-Fi',
    gradient: 'linear-gradient(135deg, #06beb6 0%, #48b1bf 100%)',
    description: 'Futuristic adventures'
  },
  {
    id: 'slice-of-life',
    label: 'Slice of Life',
    gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    description: 'Everyday moments'
  },
  {
    id: 'action',
    label: 'Action',
    gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    description: 'Dynamic battles'
  },
  {
    id: 'cozy',
    label: 'Cozy',
    gradient: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
    description: 'Warm & comforting'
  },
  {
    id: 'drama',
    label: 'Drama',
    gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    description: 'Emotional stories'
  },
  {
    id: 'adventure',
    label: 'Adventure',
    gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
    description: 'Journey & discovery'
  },
  {
    id: 'cyberpunk',
    label: 'Cyberpunk',
    gradient: 'linear-gradient(135deg, #fa8bff 0%, #2bd2ff 90%)',
    description: 'Neon-lit futures'
  },
  {
    id: 'historical',
    label: 'Historical',
    gradient: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
    description: 'Period pieces'
  },
  {
    id: 'comedy',
    label: 'Comedy',
    gradient: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
    description: 'Fun & laughter'
  },
  {
    id: 'mystery',
    label: 'Mystery',
    gradient: 'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)',
    description: 'Suspense & intrigue'
  },
  {
    id: 'romance',
    label: 'Romance',
    gradient: 'linear-gradient(135deg, #fccb90 0%, #d57eeb 100%)',
    description: 'Love stories'
  }
];

export default function StoryShowcase() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);

  useEffect(() => {
    const scrollContainer = scrollRef.current;
    if (!scrollContainer) return;

    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    let animationFrameId: number;
    let lastTimestamp = 0;
    const scrollSpeed = 0.3; // pixels per frame

    const animate = (timestamp: number) => {
      if (!isPaused && scrollContainer) {
        const delta = timestamp - lastTimestamp;
        
        if (delta > 16) { // ~60fps
          scrollContainer.scrollLeft += scrollSpeed;
          
          // Reset scroll position for infinite loop
          const maxScroll = scrollContainer.scrollWidth / 2;
          if (scrollContainer.scrollLeft >= maxScroll) {
            scrollContainer.scrollLeft = 0;
          }
          
          lastTimestamp = timestamp;
        }
      }
      
      animationFrameId = requestAnimationFrame(animate);
    };

    animationFrameId = requestAnimationFrame(animate);

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [isPaused]);

  const handleMouseEnter = () => {
    setIsPaused(true);
    setHasInteracted(true);
    
    // Track analytics
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'showcase_viewed');
    }
  };

  const handleMouseLeave = () => {
    setIsPaused(false);
  };

  // Duplicate cards for seamless infinite scroll
  const duplicatedCards = [...storyCards, ...storyCards];

  return (
    <section className="story-showcase">
      <div 
        className="showcase-scroll" 
        ref={scrollRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <div className="showcase-track">
          {duplicatedCards.map((card, index) => (
            <div
              key={`${card.id}-${index}`}
              className="story-card"
              style={{ background: card.gradient }}
            >
              <div className="story-card-content">
                <div className="story-card-visual"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="showcase-labels">
        {duplicatedCards.map((card, index) => (
          <span key={`label-${card.id}-${index}`} className="story-label">
            {card.label}
          </span>
        ))}
      </div>
      
      <div className="showcase-fade showcase-fade-left"></div>
      <div className="showcase-fade showcase-fade-right"></div>
    </section>
  );
}
