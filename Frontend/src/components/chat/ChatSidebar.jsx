import React from 'react';
import './ChatSidebar.css';


const ChatSidebar = ({ chats, activeChatId, onSelectChat, onNewChat, onDeleteChat, onEditChat, open }) => {
  return (
    <aside className={"chat-sidebar " + (open ? 'open' : '')} aria-label="Previous chats">
      <div className="sidebar-header">
        <h2>Chats</h2>
        <button className="small-btn" onClick={onNewChat}>New</button>
      </div>
      <nav className="chat-list" aria-live="polite">
        {chats.map(c => (
          <div key={c._id} className={"chat-list-item " + (c._id === activeChatId ? 'active' : '')}>
            <button className="chat-item-btn" onClick={() => onSelectChat(c._id)}>
              <div className="chat-item-left">
                <div className="avatar" aria-hidden>
                  {((c.title || '').split(' ').map(s => s[0]).slice(0,2).join('')).toUpperCase()}
                </div>
              </div>

              <div className="chat-item-main">
                <span className="title-line">{c.title}</span>
              </div>
            </button>

            <div className="chat-actions" role="group" aria-label={`Actions for ${c.title}`}>
              <button
                className="chat-action-btn edit"
                aria-label="Edit chat"
                title="Edit chat"
                onClick={() => onEditChat && onEditChat(c._id)}
              >
                {/* pencil icon */}
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                  <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25z" fill="currentColor" />
                  <path d="M20.71 7.04a1.003 1.003 0 0 0 0-1.42l-2.34-2.34a1.003 1.003 0 0 0-1.42 0l-1.83 1.83 3.75 3.75 1.84-1.82z" fill="currentColor" />
                </svg>
              </button>

              <button
                className="chat-action-btn delete"
                aria-label="Delete chat"
                title="Delete chat"
                onClick={() => onDeleteChat && onDeleteChat(c._id)}
              >
                {/* trash icon */}
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                  <path d="M6 7h12v13a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V7z" stroke="currentColor" strokeWidth="1.2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M9 7V4h6v3" stroke="currentColor" strokeWidth="1.2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M10 11v6M14 11v6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                </svg>
              </button>
            </div>
          </div>
        ))}
        {chats.length === 0 && <p className="empty-hint">No chats yet.</p>}
      </nav>
    </aside>
  );
};

export default ChatSidebar;
