import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageSquareCode, X } from 'lucide-react';
import { useChatbot } from '../../../hooks';

const renderMessageText = (text) => {
  if (!text) return '';
  return text.split('\n').map((line, index) => {
    if (line.startsWith('## ')) {
      return <h4 key={index} style={{ margin: '0.5rem 0 0.25rem 0', fontWeight: 'bold', color: 'inherit' }}>{line.replace('## ', '')}</h4>;
    }
    if (line.startsWith('- ')) {
      return <li key={index} style={{ marginLeft: '1rem', listStyleType: 'disc', color: 'inherit' }}>{line.replace('- ', '')}</li>;
    }
    return <p key={index} style={{ margin: '0.25rem 0', color: 'inherit' }}>{line}</p>;
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
    setIsThinking(true);

    try {
      let replyText = await askChatbot(query);
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
