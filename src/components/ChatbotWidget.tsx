'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Send } from 'lucide-react';

interface Message {
  id: number;
  sender: 'JANE' | 'YOU';
  content: string;
}

const MOCK_RESPONSES = [
  'Farah is currently working on residential concept sketches for a client in Langkawi.',
  "She's been exploring material palettes for an upcoming commercial project in George Town.",
  "Right now she's reviewing photographs from a recent editorial shoot.",
  'Farah is preparing documentation for an urban planning proposal.',
];

const WELCOME_MESSAGE: Message = {
  id: 0,
  sender: 'JANE',
  content:
    "Hello — I'm Jane, Farah's assistant. I can tell you what Farah is currently working on, or answer questions about her portfolio.",
};

interface ChatbotWidgetProps {
  currentActivity?: string;
}

export default function ChatbotWidget({ currentActivity = '' }: ChatbotWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([WELCOME_MESSAGE]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [responseIndex, setResponseIndex] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const nextIdRef = useRef(1);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping, scrollToBottom]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleSend = useCallback(() => {
    const text = inputValue.trim();
    if (!text) return;

    const userMsg: Message = {
      id: nextIdRef.current++,
      sender: 'YOU',
      content: text,
    };
    setMessages((prev) => [...prev, userMsg]);
    setInputValue('');
    setIsTyping(true);

    const currentResponseIndex = responseIndex;
    setResponseIndex((prev) => (prev + 1) % MOCK_RESPONSES.length);

    setTimeout(() => {
      const janeMsg: Message = {
        id: nextIdRef.current++,
        sender: 'JANE',
        content: MOCK_RESPONSES[currentResponseIndex],
      };
      setMessages((prev) => [...prev, janeMsg]);
      setIsTyping(false);
    }, 1000);
  }, [inputValue, responseIndex]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // ─── COLLAPSED STATE ───
  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        style={{
          position: 'fixed',
          bottom: '16px',
          right: '16px',
          zIndex: 900,
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '10px 16px',
          backgroundColor: 'var(--color-primary-blue)',
          color: '#f5f0e8',
          border: '1px solid var(--color-mid-blue)',
          borderRadius: 0,
          fontFamily: 'var(--font-mono)',
          fontSize: '11px',
          letterSpacing: '0.04em',
          cursor: 'pointer',
          transition: 'background-color 0.15s ease',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = 'var(--color-light-blue)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'var(--color-primary-blue)';
        }}
      >
        <span
          style={{
            width: '6px',
            height: '6px',
            backgroundColor: '#4ade80',
            display: 'inline-block',
            animation: 'pulse-dot 2s ease-in-out infinite',
            flexShrink: 0,
          }}
        />
        WHAT IS FARAH WORKING ON?
      </button>
    );
  }

  // ─── EXPANDED STATE ───
  return (
    <div
      style={{
        position: 'fixed',
        bottom: '16px',
        right: '16px',
        width: '360px',
        height: '480px',
        zIndex: 900,
        display: 'flex',
        flexDirection: 'column',
        border: '1px solid var(--color-primary-blue)',
        backgroundColor: 'var(--color-background)',
      }}
    >
      {/* Header */}
      <div
        style={{
          backgroundColor: 'var(--color-primary-blue)',
          color: '#f5f0e8',
          padding: '12px 16px',
          flexShrink: 0,
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <span
              style={{
                width: '6px',
                height: '6px',
                backgroundColor: '#4ade80',
                display: 'inline-block',
                animation: 'pulse-dot 2s ease-in-out infinite',
                flexShrink: 0,
              }}
            />
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '12px',
                fontWeight: 500,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
              }}
            >
              JANE &middot; FARAH&apos;S ASSISTANT
            </span>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            style={{
              all: 'unset',
              cursor: 'pointer',
              fontFamily: 'var(--font-mono)',
              fontSize: '16px',
              lineHeight: 1,
              color: '#f5f0e8',
              opacity: 0.7,
            }}
          >
            &times;
          </button>
        </div>
        <div
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '11px',
            opacity: 0.7,
            marginTop: '4px',
          }}
        >
          Currently: {currentActivity}
        </div>
      </div>

      {/* Messages */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '12px',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
        }}
      >
        {messages.map((msg) => (
          <div
            key={msg.id}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: msg.sender === 'YOU' ? 'flex-end' : 'flex-start',
            }}
          >
            <div
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '10px',
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                color: 'var(--color-primary-blue)',
                opacity: 0.5,
                marginBottom: '3px',
              }}
            >
              {msg.sender}
            </div>
            <div
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '13px',
                lineHeight: 1.5,
                color: 'var(--color-dark-blue)',
                backgroundColor:
                  msg.sender === 'JANE'
                    ? 'rgba(44, 95, 138, 0.08)'
                    : 'var(--color-cell-bg)',
                border: '1px solid var(--color-gridline)',
                padding: '8px 12px',
                maxWidth: '85%',
                borderRadius: 0,
              }}
            >
              {msg.content}
            </div>
          </div>
        ))}

        {/* Typing indicator */}
        {isTyping && (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
            }}
          >
            <div
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '10px',
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                color: 'var(--color-primary-blue)',
                opacity: 0.5,
                marginBottom: '3px',
              }}
            >
              JANE
            </div>
            <div
              style={{
                backgroundColor: 'rgba(44, 95, 138, 0.08)',
                border: '1px solid var(--color-gridline)',
                padding: '8px 12px',
                display: 'flex',
                gap: '4px',
                alignItems: 'center',
              }}
            >
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  style={{
                    width: '5px',
                    height: '5px',
                    backgroundColor: 'var(--color-primary-blue)',
                    display: 'inline-block',
                    animation: `typingDot 1.2s ease-in-out ${i * 0.2}s infinite`,
                  }}
                />
              ))}
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div
        style={{
          borderTop: '1px solid var(--color-gridline-heavy)',
          padding: '8px',
          display: 'flex',
          gap: '6px',
          backgroundColor: 'var(--color-cell-bg)',
          flexShrink: 0,
        }}
      >
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask about Farah..."
          style={{
            flex: 1,
            fontFamily: 'var(--font-mono)',
            fontSize: '13px',
            color: 'var(--color-dark-blue)',
            backgroundColor: 'var(--color-background)',
            border: '1px solid var(--color-gridline-heavy)',
            borderRadius: 0,
            padding: '6px 10px',
            outline: 'none',
          }}
        />
        <button
          onClick={handleSend}
          disabled={!inputValue.trim()}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '36px',
            height: '36px',
            backgroundColor: inputValue.trim()
              ? 'var(--color-primary-blue)'
              : 'var(--color-cell-hover)',
            color: inputValue.trim() ? '#f5f0e8' : 'var(--color-primary-blue)',
            border: '1px solid var(--color-gridline-heavy)',
            borderRadius: 0,
            cursor: inputValue.trim() ? 'pointer' : 'default',
            opacity: inputValue.trim() ? 1 : 0.5,
            transition: 'all 0.15s ease',
            flexShrink: 0,
          }}
        >
          <Send size={14} />
        </button>
      </div>

      {/* Typing animation keyframes */}
      <style>{`
        @keyframes typingDot {
          0%, 60%, 100% { opacity: 0.3; }
          30% { opacity: 1; }
        }
      `}</style>
    </div>
  );
}
