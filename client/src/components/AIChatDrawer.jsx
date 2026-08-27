import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  X,
  Send,
  Bot,
  User,
  MapPin,
  ChevronRight,
  Wifi,
  Volume2,
  Minimize2,
} from 'lucide-react';
import api from '../services/api';

export const AIChatDrawer = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      sender: 'assistant',
      text: "👋 Hi! I'm your **Campus Study Space Assistant**. Tell me what kind of space you need (e.g., *'I need a quiet spot with Wi-Fi and power outlets for 2 hours'* or *'Find spaces with open seats right now'*), and I will match verified live campus spaces for you!",
      recommendations: [],
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const suggestedPrompts = [
    'Quiet space with power outlets & Wi-Fi',
    'Where are open seats available right now?',
    'Silent study area in Engineering building',
    'Group collaboration room with whiteboards',
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSend = async (queryText = null) => {
    const text = queryText || inputValue;
    if (!text || !text.trim() || loading) return;

    const userMsg = {
      id: Date.now().toString(),
      sender: 'user',
      text: text.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!queryText) setInputValue('');
    setLoading(true);

    try {
      const res = await api.chatWithAI(text.trim());
      if (res.success && res.data) {
        const assistantMsg = {
          id: (Date.now() + 1).toString(),
          sender: 'assistant',
          text: res.data.reply || 'Here are the matching campus locations:',
          recommendations: res.data.recommendations || [],
          suggestedFollowUps: res.data.suggestedFollowUps || [],
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, assistantMsg]);
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: 'assistant',
          text: "I'm having trouble retrieving campus space data right now. Please check if the backend server is running and try again.",
          recommendations: [],
          timestamp: new Date(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="ai-drawer-panel">
      {/* Header */}
      <div className="ai-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
          <div className="ai-avatar-box">
            <Sparkles size={18} color="#ffffff" />
          </div>
          <div>
            <h4 style={{ fontWeight: 800, fontSize: '0.9375rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
              Campus AI Advisor
              <span className="badge badge-indigo" style={{ fontSize: '0.65rem', padding: '0.15rem 0.4rem' }}>Grounded</span>
            </h4>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Real-time campus space finder</span>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
          title="Close Assistant"
        >
          <X size={20} />
        </button>
      </div>

      {/* Message Feed */}
      <div className="ai-messages-feed">
        {messages.map((msg) => (
          <div key={msg.id} className={`msg-row ${msg.sender === 'user' ? 'msg-row-user' : 'msg-row-assistant'}`}>
            {msg.sender === 'assistant' && (
              <div className="msg-bot-avatar">
                <Bot size={14} color="#4f46e5" />
              </div>
            )}

            <div className={`msg-bubble ${msg.sender === 'user' ? 'msg-bubble-user' : 'msg-bubble-assistant'}`}>
              <div style={{ whiteSpace: 'pre-line', fontSize: '0.875rem', lineHeight: '1.5' }}>
                {msg.text}
              </div>

              {/* Grounded Recommendation Cards */}
              {msg.recommendations && msg.recommendations.length > 0 && (
                <div className="ai-rec-cards">
                  {msg.recommendations.map((space) => {
                    const live = space.liveStats || { availableSeats: space.capacity || 20 };
                    return (
                      <div key={space._id || space.id} className="ai-rec-card">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <div>
                            <h5 style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--text-main)' }}>{space.name}</h5>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{space.building} · {space.room}</span>
                          </div>
                          <span className="badge badge-emerald" style={{ fontSize: '0.7rem' }}>
                            {live.availableSeats} open
                          </span>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem', paddingTop: '0.375rem', borderTop: '1px solid #f1f5f9' }}>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'capitalize' }}>
                            {space.noiseLevel} Zone
                          </span>

                          <Link
                            to={`/spaces/${space._id || space.id}`}
                            onClick={onClose}
                            className="btn btn-primary btn-sm"
                            style={{ padding: '0.25rem 0.625rem', fontSize: '0.75rem' }}
                          >
                            <span>Book Seat</span>
                            <ChevronRight size={12} />
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="msg-row msg-row-assistant">
            <div className="msg-bot-avatar">
              <Bot size={14} color="#4f46e5" />
            </div>
            <div className="msg-bubble msg-bubble-assistant">
              <div className="typing-dots">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompts */}
      <div className="ai-quick-prompts">
        {suggestedPrompts.map((p, idx) => (
          <button
            key={idx}
            type="button"
            className="quick-prompt-chip"
            onClick={() => handleSend(p)}
            disabled={loading}
          >
            {p}
          </button>
        ))}
      </div>

      {/* Input Row */}
      <div className="ai-input-area">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          style={{ display: 'flex', gap: '0.5rem' }}
        >
          <input
            type="text"
            className="ai-text-input"
            placeholder="Ask AI for campus recommendations..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            disabled={loading}
          />
          <button
            type="submit"
            className="btn btn-primary"
            style={{ padding: '0.625rem 0.875rem' }}
            disabled={loading || !inputValue.trim()}
          >
            <Send size={15} />
          </button>
        </form>
      </div>

      <style>{`
        .ai-header {
          padding: 1rem 1.25rem;
          border-bottom: 1px solid var(--border-subtle);
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: #ffffff;
        }
        .ai-avatar-box {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .ai-messages-feed {
          flex: 1;
          overflow-y: auto;
          padding: 1rem;
          display: flex;
          flex-direction: column;
          gap: 0.875rem;
          background: #f8fafc;
        }
        .msg-row {
          display: flex;
          gap: 0.5rem;
          align-items: flex-start;
        }
        .msg-row-user {
          justify-content: flex-end;
        }
        .msg-bot-avatar {
          width: 26px;
          height: 26px;
          border-radius: 50%;
          background: var(--primary-light);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .msg-bubble {
          max-width: 82%;
          padding: 0.75rem 1rem;
          border-radius: var(--radius-lg);
          font-size: 0.875rem;
        }
        .msg-bubble-assistant {
          background: #ffffff;
          border: 1px solid var(--border-subtle);
          color: var(--text-main);
          border-top-left-radius: 4px;
          box-shadow: var(--shadow-sm);
        }
        .msg-bubble-user {
          background: linear-gradient(135deg, #4f46e5 0%, #6366f1 100%);
          color: #ffffff;
          border-top-right-radius: 4px;
        }
        .ai-rec-cards {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          margin-top: 0.75rem;
        }
        .ai-rec-card {
          background: #f8fafc;
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-md);
          padding: 0.625rem;
        }
        .ai-quick-prompts {
          display: flex;
          overflow-x: auto;
          gap: 0.375rem;
          padding: 0.5rem 0.875rem;
          background: #ffffff;
          border-top: 1px solid var(--border-subtle);
        }
        .quick-prompt-chip {
          padding: 0.25rem 0.625rem;
          font-size: 0.6875rem;
          font-weight: 600;
          color: var(--text-muted);
          background: #f1f5f9;
          border: 1px solid transparent;
          border-radius: var(--radius-full);
          white-space: nowrap;
          cursor: pointer;
          transition: var(--transition);
        }
        .quick-prompt-chip:hover {
          background: var(--primary-light);
          color: var(--primary);
        }
        .ai-input-area {
          padding: 0.75rem 1rem;
          background: #ffffff;
          border-top: 1px solid var(--border-subtle);
        }
        .ai-text-input {
          flex: 1;
          padding: 0.625rem 0.875rem;
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-md);
          font-size: 0.875rem;
          outline: none;
          transition: var(--transition);
        }
        .ai-text-input:focus {
          border-color: var(--primary);
          box-shadow: 0 0 0 2px var(--primary-focus);
        }
        .typing-dots {
          display: flex;
          gap: 4px;
          padding: 4px 2px;
        }
        .typing-dots span {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background-color: var(--primary);
          animation: bounce 1.2s infinite ease-in-out;
        }
        .typing-dots span:nth-child(2) { animation-delay: 0.2s; }
        .typing-dots span:nth-child(3) { animation-delay: 0.4s; }
        @keyframes bounce {
          0%, 80%, 100% { transform: scale(0); }
          40% { transform: scale(1); }
        }
      `}</style>
    </div>
  );
};

export default AIChatDrawer;
