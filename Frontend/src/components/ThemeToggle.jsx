import React, { useEffect, useState, useCallback } from 'react';

const ThemeToggle = () => {
  // Requirements/contract:
  // - Input: user click or keyboard activation
  // - Output: set document html[data-theme] to 'light' or 'dark' and persist in localStorage
  // - Error modes: localStorage unavailable (fall back to in-memory)
  const [theme, setTheme] = useState(() => {
    try {
      return localStorage.getItem('theme') || 'light';
    } catch {
      return 'light';
    }
  });

  useEffect(() => {
    try {
      document.documentElement.setAttribute('data-theme', theme);
      localStorage.setItem('theme', theme);
    } catch {
      // ignore storage errors but still apply theme attribute
      document.documentElement.setAttribute('data-theme', theme);
    }
  }, [theme]);

  const toggle = useCallback(() => {
    setTheme(t => (t === 'light' ? 'dark' : 'light'));
  }, []);

  return (
    <button
      type="button"
      onClick={toggle}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); } }}
      className="theme-toggle"
      aria-pressed={theme === 'dark'}
      aria-label={theme === 'light' ? 'Activate dark mode' : 'Activate light mode'}
    >
      <span className="sr-only">{theme === 'light' ? 'Switch to dark theme' : 'Switch to light theme'}</span>
      <span className="icon sun" aria-hidden>☀️</span>
      <span className="icon moon" aria-hidden>🌙</span>
      <span className="knob" aria-hidden />
    </button>
  );
};

export default ThemeToggle;
