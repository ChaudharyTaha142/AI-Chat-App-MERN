import React, { useCallback, useRef, useLayoutEffect, useState } from 'react';
import './ChatComposer.css';

// NOTE: Public API (props) kept identical for drop-in upgrade
const ChatComposer = React.forwardRef(({ input, setInput, onSend, isSending, editing, setEditing }, ref) => {
  const textareaRef = useRef(null);

  // Auto-grow textarea height up to max-height
  useLayoutEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 320) + 'px';
  }, [input]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (input.trim()) {
        onSend();
        if (editing) setEditing(false);
      }
    }
  }, [onSend, input, editing, setEditing]);

  React.useImperativeHandle(ref, () => ({
    focus: () => { textareaRef.current?.focus(); }
  }));

  return (
    <form className="composer" onSubmit={e => { e.preventDefault(); if (input.trim()) { onSend(); if (editing) setEditing(false); } }}>
      <div className="composer-surface" data-state={isSending ? 'sending' : undefined}>
        <div className="composer-field">
          <textarea
            ref={textareaRef}
            className="composer-input"
            placeholder="Message ChatGPT…"
            aria-label="Message"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={1}
            spellCheck
            autoComplete="off"
          />
          <div className="composer-hint" aria-hidden="true">Enter ↵ to send • Shift+Enter = newline</div>
        </div>
        {/* Theme toggle placed next to send button so users can force light/dark */}
        <ThemeToggleInline />
        <div className="composer-actions">
          <button
            type="submit"
            className="send-btn icon-btn"
            disabled={!input.trim() || isSending}
            aria-label={isSending ? 'Sending' : (editing ? 'Save edited message' : 'Send message')}
            title={editing ? 'Save' : 'Send'}
          >
            <span className="send-icon" aria-hidden="true">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14" />
                <path d="M12 5l7 7-7 7" />
              </svg>
            </span>
          </button>
        </div>
      </div>
    </form>
  );
});

function ThemeToggleInline() {
  const [theme, setTheme] = useState(() => {
    try { return localStorage.getItem('theme') || 'light'; } catch { return 'light'; }
  });

  function toggle() {
    const next = theme === 'light' ? 'dark' : 'light';
  try { localStorage.setItem('theme', next); } catch { /* ignore storage errors */ }
    document.documentElement.setAttribute('data-theme', next);
    setTheme(next);
  }

  return (
    <button
      type="button"
      className="composer-theme-btn"
      onClick={toggle}
      aria-label={theme === 'light' ? 'Activate dark theme' : 'Activate light theme'}
      title={theme === 'light' ? 'Switch to dark' : 'Switch to light'}
    >
      <span aria-hidden>{theme === 'light' ? '🌙' : '☀️'}</span>
      <span className="sr-only">{theme === 'light' ? 'Switch to dark theme' : 'Switch to light theme'}</span>
    </button>
  );
}

export default ChatComposer;
