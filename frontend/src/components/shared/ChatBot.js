import { useState, useRef, useEffect } from 'react';
import api from '../../services/api';
import './ChatBot.css';

const WELCOME_MESSAGE = {
  role: 'assistant',
  content: 'أهلاً! أنا لولو، مساعدك التعليمي 🎓\nكيف أقدر أساعدك النهارده؟',
};

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([WELCOME_MESSAGE]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [hasNewMsg, setHasNewMsg] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 300);
      setHasNewMsg(false);
    }
  }, [isOpen]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || loading) return;

    const userMsg = { role: 'user', content: text };
    const updatedMessages = [...messages, userMsg];

    setMessages(updatedMessages);
    setInput('');
    setLoading(true);

    try {
      // بنبعت كل الـ messages ما عدا الـ welcome message الأول
      const apiMessages = updatedMessages.filter((_, i) => i !== 0);

      const res = await api.post('/chatbot/', { messages: apiMessages });
      const botMsg = { role: 'assistant', content: res.data.reply };
      setMessages(prev => [...prev, botMsg]);

      if (!isOpen) setHasNewMsg(true);
    } catch (err) {
      const errText = err.response?.data?.error || 'حدث خطأ، حاول مرة تانية.';
      setMessages(prev => [...prev, { role: 'assistant', content: errText, isError: true }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleClear = () => {
    setMessages([WELCOME_MESSAGE]);
  };

  return (
    <div className="chatbot-wrapper">
      {/* Chat Window */}
      <div className={`chatbot-window ${isOpen ? 'open' : ''}`}>
        {/* Header */}
        <div className="chatbot-header">
          <div className="chatbot-header-info">
            <div className="chatbot-avatar-pulse">
              <div className="chatbot-avatar">🎓</div>
            </div>
            <div>
              <p className="chatbot-name">Lolo</p>
              <p className="chatbot-status">
                <span className="status-dot" />
                مساعد تعليمي
              </p>
            </div>
          </div>
          <div className="chatbot-header-actions">
            <button className="icon-btn" onClick={handleClear} title="مسح المحادثة">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/>
                <path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/>
              </svg>
            </button>
            <button className="icon-btn" onClick={() => setIsOpen(false)} title="إغلاق">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="chatbot-messages">
          {messages.map((msg, i) => (
            <div key={i} className={`message-row ${msg.role}`}>
              {msg.role === 'assistant' && (
                <div className="bot-icon">🎓</div>
              )}
              <div className={`message-bubble ${msg.role} ${msg.isError ? 'error' : ''}`}>
                {msg.content.split('\n').map((line, j) => (
                  <span key={j}>{line}{j < msg.content.split('\n').length - 1 && <br />}</span>
                ))}
              </div>
            </div>
          ))}

          {/* Typing indicator */}
          {loading && (
            <div className="message-row assistant">
              <div className="bot-icon">🎓</div>
              <div className="message-bubble assistant typing">
                <span /><span /><span />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="chatbot-input-area">
          <textarea
            ref={inputRef}
            className="chatbot-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="اكتب سؤالك هنا..."
            rows={1}
            disabled={loading}
          />
          <button
            className={`send-btn ${input.trim() && !loading ? 'active' : ''}`}
            onClick={handleSend}
            disabled={!input.trim() || loading}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="22" y1="2" x2="11" y2="13"/>
              <polygon points="22 2 15 22 11 13 2 9 22 2"/>
            </svg>
          </button>
        </div>
      </div>

      {/* Floating Button */}
      <button
        className={`chatbot-fab ${isOpen ? 'active' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        aria-label="فتح المساعد التعليمي"
      >
        {isOpen ? (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        ) : (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
          </svg>
        )}
        {hasNewMsg && !isOpen && <span className="fab-badge" />}
      </button>
    </div>
  );
};

export default ChatBot;