export default function Capabilities() {
  const capabilities = [
    {
      icon: (
        <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M8 12L12 8L20 16L28 8L32 12L20 24L8 12Z" stroke="currentColor" strokeWidth="1.5" fill="none"/>
          <path d="M10 26H30" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          <path d="M10 32H30" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      ),
      title: 'Develop Your Story',
      subtitle: 'From idea to script'
    },
    {
      icon: (
        <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="8" y="8" width="24" height="24" rx="2" stroke="currentColor" strokeWidth="1.5" fill="none"/>
          <path d="M8 16H32" stroke="currentColor" strokeWidth="1.5"/>
          <path d="M16 8V32" stroke="currentColor" strokeWidth="1.5"/>
          <circle cx="20" cy="22" r="3" stroke="currentColor" strokeWidth="1.5" fill="none"/>
        </svg>
      ),
      title: 'Visualize Your World',
      subtitle: 'Storyboards & shots'
    },
    {
      icon: (
        <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="20" cy="20" r="12" stroke="currentColor" strokeWidth="1.5" fill="none"/>
          <path d="M17 15L25 20L17 25V15Z" fill="currentColor"/>
        </svg>
      ),
      title: 'Generate & Animate',
      subtitle: 'Bring scenes to life'
    },
    {
      icon: (
        <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M10 10L16 16M16 16L10 22M16 16H28" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          <path d="M12 30H28" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      ),
      title: 'Edit & Polish',
      subtitle: 'Refine with AI'
    }
  ];

  return (
    <section className="capabilities">
      {capabilities.map((cap, index) => (
        <div key={index} className="capability">
          <div className="capability-icon">{cap.icon}</div>
          <h3 className="capability-title">{cap.title}</h3>
          <p className="capability-subtitle">{cap.subtitle}</p>
        </div>
      ))}
    </section>
  );
}
