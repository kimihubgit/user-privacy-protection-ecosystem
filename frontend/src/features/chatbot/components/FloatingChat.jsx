import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageSquare, MessageSquareCode, X, Send, Sparkles, Maximize2, Image, Search, Database, ShieldCheck, BrainCircuit, Globe, Scale, Cpu, Lock } from 'lucide-react';
import './FloatingChat.css';
import { useChatbot } from '../../../hooks';

const parseInlineStyle = (text) => {
  if (!text) return '';
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`|\*[^*]+\*)/g);
  return parts.map((part, idx) => {
    if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
      return <strong key={idx}>{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith('`') && part.endsWith('`') && part.length > 2) {
      return (
        <code key={idx} style={{ background: 'rgba(16, 185, 129, 0.15)', padding: '0.15rem 0.4rem', borderRadius: '4px', fontFamily: 'monospace', fontSize: '0.88em' }}>
          {part.slice(1, -1)}
        </code>
      );
    }
    if (part.startsWith('*') && part.endsWith('*') && part.length > 2) {
      return <em key={idx}>{part.slice(1, -1)}</em>;
    }
    return part;
  });
};

const renderMessageText = (text) => {
  if (!text) return '';
  return text.split('\n').map((line, index) => {
    let trimmed = line.trim();

    // Horizontal Rule
    if (trimmed === '---' || trimmed === '***' || trimmed === '___') {
      return <hr key={index} style={{ margin: '0.8rem 0', border: 'none', borderTop: '1px solid rgba(255, 255, 255, 0.1)' }} />;
    }

    // Headings (#, ##, ###, ####, #####, ######)
    const headingMatch = trimmed.match(/^(#{1,6})\s*(.*)/);
    if (headingMatch) {
      const level = headingMatch[1].length;
      const content = headingMatch[2];

      if (level === 1) {
        return (
          <h2 key={index} style={{ margin: '0.75rem 0 0.35rem 0', fontWeight: '800', fontSize: '1.2rem', color: 'inherit', lineHeight: '1.3' }}>
            {parseInlineStyle(content)}
          </h2>
        );
      }
      if (level === 2) {
        return (
          <h3 key={index} style={{ margin: '0.7rem 0 0.3rem 0', fontWeight: '700', fontSize: '1.1rem', color: 'inherit', lineHeight: '1.3' }}>
            {parseInlineStyle(content)}
          </h3>
        );
      }
      return (
        <h4 key={index} style={{ margin: '0.6rem 0 0.25rem 0', fontWeight: '700', fontSize: '1rem', color: 'inherit', lineHeight: '1.3' }}>
          {parseInlineStyle(content)}
        </h4>
      );
    }

    // Numbered lists (e.g. "1. ", "2. ")
    const numberMatch = trimmed.match(/^(\d+)\.\s*(.*)/);
    if (numberMatch) {
      const num = numberMatch[1];
      const rest = numberMatch[2];
      return (
        <div key={index} style={{ marginLeft: '0.5rem', margin: '0.25rem 0', display: 'flex', gap: '0.35rem', alignItems: 'flex-start', lineHeight: '1.5' }}>
          <span style={{ fontWeight: 'bold', flexShrink: 0, minWidth: '1.2rem', color: '#10b981' }}>{num}.</span>
          <span style={{ flex: 1 }}>{parseInlineStyle(rest)}</span>
        </div>
      );
    }

    // Bullet lists (e.g. "- ", "* ", "• ")
    if (trimmed.startsWith('- ') || trimmed.startsWith('* ') || trimmed.startsWith('• ')) {
      const rest = trimmed.replace(/^[-*•]\s*/, '');
      return (
        <div key={index} style={{ marginLeft: '0.5rem', margin: '0.25rem 0', display: 'flex', gap: '0.45rem', alignItems: 'flex-start', lineHeight: '1.5' }}>
          <span style={{ flexShrink: 0, color: '#10b981', fontSize: '0.95rem' }}>•</span>
          <span style={{ flex: 1 }}>{parseInlineStyle(rest)}</span>
        </div>
      );
    }

    // Empty line
    if (!trimmed) {
      return <div key={index} style={{ height: '0.4rem' }} />;
    }

    // Regular paragraph
    return (
      <p key={index} style={{ margin: '0.3rem 0', color: 'inherit', lineHeight: '1.5' }}>
        {parseInlineStyle(line)}
      </p>
    );
  });
};

const THINKING_STEPS = [
  {
    icon: BrainCircuit,
    title: 'Khởi tạo mô hình Reasoning Engine',
    sub: 'Thiết lập ngữ cảnh xử lý & tải trọng số ngôn ngữ...'
  },
  {
    icon: Search,
    title: 'Phân tích cú pháp & trích xuất thực thể',
    sub: 'Nhận diện ý định, tên miền, SĐT, STK ngân hàng & dấu hiệu bất thường...'
  },
  {
    icon: Globe,
    title: 'Giải mã đường dẫn & kiểm tra tên miền nhái',
    sub: 'Bóc tách URL, kiểm tra SSL, DNS & phát hiện giả mạo thương hiệu...'
  },
  {
    icon: Database,
    title: 'Truy vấn kho dữ liệu rủi ro S.H.I.E.L.D.',
    sub: 'Đối soát 1.4M+ hồ sơ tài khoản rác, danh sách đen & lịch sử tố cáo...'
  },
  {
    icon: ShieldCheck,
    title: 'Đánh giá chỉ số đe dọa & tính tín nhiệm',
    sub: 'Đo lường mức độ nguy hiểm, rủi ro tài chính & rerank ngữ cảnh...'
  },
  {
    icon: Scale,
    title: 'Trích xuất Luật An ninh mạng & Nghị định 13/2023',
    sub: 'Khảo sát các điều khoản pháp lý & hình phạt vi phạm liên quan...'
  },
  {
    icon: Cpu,
    title: 'Phân tích nhận diện thủ đoạn tâm lý',
    sub: 'Bắt bài kịch bản giả danh công an, shipper, khóa VNeID, làm nhiệm vụ...'
  },
  {
    icon: Lock,
    title: 'Đối soát danh sách đen & danh sách trắng',
    sub: 'Xác minh độ an toàn từ các cơ quan chức năng & ngân hàng uy tín...'
  },
  {
    icon: Sparkles,
    title: 'Khởi tạo phương án bảo vệ & khuyến nghị',
    sub: 'Tổng hợp câu trả lời chi tiết kèm hướng dẫn xử lý khẩn cấp...'
  }
];

export default function FloatingChat({
  isAiChatOpen,
  setIsAiChatOpen,
  showScrollTop
}) {
  const navigate = useNavigate();
  const { chatInput, setChatInput, isThinking, setIsThinking, getAgentReply, askChatbot, analyzeChatImage } = useChatbot();
  const [chatMessages, setChatMessages] = useState([
    { sender: 'bot', text: 'Xin chào! Tôi là Trợ lý AI của shield. Tôi có thể giúp gì cho bạn?' }
  ]);
  const [thinkingStepIdx, setThinkingStepIdx] = useState(0);

  useEffect(() => {
    let timerId;
    if (isThinking) {
      setThinkingStepIdx(0);

      const triggerNextStep = () => {
        const randomTime = Math.floor(Math.random() * 1600) + 2200;
        timerId = setTimeout(() => {
          setThinkingStepIdx(prev => (prev + 1) % THINKING_STEPS.length);
          triggerNextStep();
        }, randomTime);
      };

      triggerNextStep();
    } else {
      setThinkingStepIdx(0);
    }

    return () => {
      if (timerId) clearTimeout(timerId);
    };
  }, [isThinking]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const query = chatInput;
    const userMsg = { sender: 'user', text: query };
    setChatMessages(prev => [...prev, userMsg]);
    setChatInput('');

    // Fallback chatbot response
    setIsThinking(true);
    const randomThinkingDuration = Math.floor(Math.random() * 1500) + 3000;
    const minDelay = new Promise(resolve => setTimeout(resolve, randomThinkingDuration));
    try {
      let replyPromise = askChatbot(query, 'ai', chatMessages);
      const [apiReply] = await Promise.all([replyPromise, minDelay]);
      let replyText = apiReply;
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
                <div className="chat-bubble thinking-compact">
                  <div className="thinking-compact-icon">
                    {(() => {
                      const CurrentIcon = THINKING_STEPS[thinkingStepIdx].icon;
                      return <CurrentIcon size={15} className="thinking-step-icon-spinner" />;
                    })()}
                  </div>
                  <div className="thinking-compact-text-wrap">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <span className="thinking-pulse-dot" style={{ width: '6px', height: '6px' }}></span>
                      <span className="thinking-compact-title">
                        {THINKING_STEPS[thinkingStepIdx].title}
                      </span>
                    </div>
                    <span className="thinking-compact-sub">
                      {THINKING_STEPS[thinkingStepIdx].sub}
                    </span>
                  </div>
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

          {/* Credit Footer Bar */}
          <div className="ai-chat-credit-bar">
            <span>Powered by <strong>kimidev.net</strong></span>
          </div>
        </div>
      )}
    </>
  );
}
