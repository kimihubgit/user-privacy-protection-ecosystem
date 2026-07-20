import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageSquareCode, X } from 'lucide-react';
import { useChatbot } from '../../../hooks';

const parseInlineStyle = (text) => {
  if (!text) return '';
  const parts = text.split(/\*\*([^*]+)\*\*/g);
  return parts.map((part, idx) => {
    if (idx % 2 === 1) {
      return <strong key={idx}>{part}</strong>;
    }
    return part;
  });
};

const renderMessageText = (text) => {
  if (!text) return '';
  return text.split('\n').map((line, index) => {
    const trimmed = line.trim();

    // Horizontal Rule
    if (trimmed === '---') {
      return <hr key={index} style={{ margin: '1rem 0', border: 'none', borderTop: '1px solid rgba(255, 255, 255, 0.1)' }} />;
    }

    // Headings (ordered from longest to shortest prefix)
    if (trimmed.startsWith('### ')) {
      return (
        <h4 key={index} style={{ margin: '0.8rem 0 0.35rem 0', fontWeight: 'bold', color: 'inherit', fontSize: '1.05rem' }}>
          {parseInlineStyle(trimmed.substring(4))}
        </h4>
      );
    }
    if (trimmed.startsWith('## ')) {
      return (
        <h3 key={index} style={{ margin: '0.9rem 0 0.4rem 0', fontWeight: 'bold', color: 'inherit', fontSize: '1.25rem' }}>
          {parseInlineStyle(trimmed.substring(3))}
        </h3>
      );
    }
    if (trimmed.startsWith('# ')) {
      return (
        <h2 key={index} style={{ margin: '1rem 0 0.5rem 0', fontWeight: 'bold', color: 'inherit', fontSize: '1.45rem' }}>
          {parseInlineStyle(trimmed.substring(2))}
        </h2>
      );
    }

    // Numbered lists (e.g. "1. ", "2. ")
    const numberMatch = trimmed.match(/^(\d+)\.\s(.*)/);
    if (numberMatch) {
      const num = numberMatch[1];
      const rest = numberMatch[2];
      return (
        <div key={index} style={{ marginLeft: '1.25rem', margin: '0.25rem 0', display: 'flex', gap: '0.35rem', alignItems: 'flex-start', lineHeight: '1.5' }}>
          <span style={{ fontWeight: 'bold', flexShrink: 0, minWidth: '1.2rem' }}>{num}.</span>
          <span style={{ flex: 1 }}>{parseInlineStyle(rest)}</span>
        </div>
      );
    }

    // Bullet lists (e.g. "- ", "* ")
    if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      return (
        <div key={index} style={{ marginLeft: '1.25rem', margin: '0.25rem 0', display: 'flex', gap: '0.5rem', alignItems: 'flex-start', lineHeight: '1.5' }}>
          <span style={{ flexShrink: 0, color: 'var(--text-secondary)' }}>•</span>
          <span style={{ flex: 1 }}>{parseInlineStyle(trimmed.substring(2))}</span>
        </div>
      );
    }

    // Empty line
    if (!trimmed) {
      return <div key={index} style={{ height: '0.5rem' }} />;
    }

    // Regular paragraph
    return (
      <p key={index} style={{ margin: '0.35rem 0', color: 'inherit', lineHeight: '1.5' }}>
        {parseInlineStyle(line)}
      </p>
    );
  });
};

export default function FloatingChat({
  isAiChatOpen,
  setIsAiChatOpen,
  showScrollTop
}) {
  const navigate = useNavigate();
  const { chatInput, setChatInput, isThinking, setIsThinking, getAgentReply, askChatbot } = useChatbot();
  const [chatMessages, setChatMessages] = useState([
    { sender: 'bot', text: 'Xin chào! Tôi là Trợ lý AI của Chống Lừa Đảo. Tôi có thể giúp gì cho bạn?' }
  ]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const query = chatInput;
    const userMsg = { sender: 'user', text: query };
    setChatMessages(prev => [...prev, userMsg]);
    setChatInput('');

    // Fallback chatbot response
    setIsThinking(true);
    try {
      let replyText = await askChatbot(query, 'ai', chatMessages);
      if (!replyText) {
        replyText = getAgentReply(query, 'ai');
      }
      setChatMessages(prev => [...prev, { sender: 'bot', text: replyText }]);
    } catch (err) {
      const replyText = getAgentReply(query, 'ai');
      setChatMessages(prev => [...prev, { sender: 'bot', text: replyText }]);
    } finally {
      setIsThinking(false);
    }
  };

  return (
    <>
      {/* AI Chatbot Floating Toggle Button */}
      <button
        onClick={() => setIsAiChatOpen(!isAiChatOpen)}
        className="ai-chat-toggle"
        style={{
          right: isAiChatOpen
            ? showScrollTop ? '27.5rem' : '24rem'
            : showScrollTop ? '5.5rem' : '2rem'
        }}
        aria-label="Toggle AI Chatbot"
      >
        <MessageSquareCode size={20} />
      </button>

      {/* AI Floating Chat Assistant Panel */}
      {isAiChatOpen && (
        <div className="ai-chat-window" style={{ zIndex: 10000 }}>
          <div className="ai-chat-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span className="live-pulse-dot" style={{ backgroundColor: '#10B981', boxShadow: '0 0 8px #10B981' }}></span>
              <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-primary)' }}>TRỢ LÝ BẢO MẬT AI</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <button 
                className="ai-chat-close-btn" 
                onClick={() => {
                  setIsAiChatOpen(false);
                  navigate('/tro-ly-ai');
                }}
                title="Phóng to"
                style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '4px', borderRadius: '4px', color: 'var(--text-secondary)' }}
              >
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
                </svg>
              </button>
              <button className="ai-chat-close-btn" onClick={() => setIsAiChatOpen(false)} title="Đóng">
                <X size={16} />
              </button>
            </div>
          </div>

          <div className="ai-chat-messages">
            {chatMessages.map((msg, idx) => (
              <div key={idx} className={`chat-bubble-wrap ${msg.sender}`}>
                <div className="chat-avatar">
                  {msg.sender === 'bot' ? 'AI' : 'U'}
                </div>
                <div className="chat-bubble">
                  {renderMessageText(msg.text)}
                </div>
              </div>
            ))}
            {isThinking && (
              <div className="chat-bubble-wrap bot">
                <div className="chat-avatar">AI</div>
                <div className="chat-bubble thinking">
                  <span>Đang phân tích</span>
                  <div className="spinner" style={{ width: '10px', height: '10px', borderWidth: '1.5px', borderStyle: 'solid' }}></div>
                </div>
              </div>
            )}
          </div>

          <form onSubmit={handleSendMessage} className="ai-chat-input-form">
            <input
              type="text"
              className="ai-chat-input"
              placeholder="Hỏi trợ lý AI về an toàn mạng..."
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
            />
            <button type="submit" className="ai-chat-send-btn">
              Gửi
            </button>
          </form>
        </div>
      )}
    </>
  );
}
