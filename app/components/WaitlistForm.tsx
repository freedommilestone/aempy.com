'use client';

import { useState, FormEvent } from 'react';

export default function WaitlistForm() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!email || !email.includes('@')) {
      setStatus('error');
      setMessage('Please enter a valid email address.');
      return;
    }

    setStatus('loading');
    
    try {
      // TODO: Connect to actual API endpoint
      const response = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          source: 'landing_page',
          created_at: new Date().toISOString(),
        }),
      });

      if (response.ok) {
        setStatus('success');
        setMessage("You're on the list.");
        setEmail('');
        
        // Track analytics event
        if (typeof window !== 'undefined' && (window as any).gtag) {
          (window as any).gtag('event', 'waitlist_joined', {
            email_domain: email.split('@')[1],
          });
        }
      } else {
        throw new Error('Failed to join waitlist');
      }
    } catch (error) {
      setStatus('error');
      setMessage('Something went wrong. Please try again.');
    }
  };

  if (status === 'success') {
    return (
      <div className="waitlist-success">
        <div className="success-icon">✓</div>
        <p className="success-title">{message}</p>
        <p className="success-subtitle">We'll let you know when Aempy is ready.</p>
      </div>
    );
  }

  return (
    <form className="waitlist-form" onSubmit={handleSubmit} id="waitlist">
      <div className="form-row">
        <div className="email-input-wrapper">
          <svg className="email-icon" width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M3 4h14a1 1 0 011 1v10a1 1 0 01-1 1H3a1 1 0 01-1-1V5a1 1 0 011-1z" stroke="currentColor" strokeWidth="1.5" fill="none"/>
            <path d="M2 5l8 5 8-5" stroke="currentColor" strokeWidth="1.5" fill="none"/>
          </svg>
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={status === 'loading'}
            required
            aria-label="Email address"
          />
        </div>
        <button 
          type="submit" 
          className="waitlist-submit"
          disabled={status === 'loading'}
        >
          {status === 'loading' ? 'Joining...' : 'Join Waitlist →'}
        </button>
      </div>
      
      {status === 'error' && (
        <p className="form-error">{message}</p>
      )}
      
      <p className="form-footnote">
        Be the first to know when we launch. No spam, just updates.
      </p>
    </form>
  );
}
