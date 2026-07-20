import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, ChevronLeft, Settings, HelpCircle, Send, Image, Minimize2, LogOut, MessageSquare, Info, ShieldAlert } from 'lucide-react';
import './AiChatbotFullPage.css';
import { useChatbot } from '../../../hooks';

const AGENTS = [
  {
    id: 'ai',
    name: 'Trợ lý AI',
    color: '#23b56c',
    label: 'Trợ lý thông minh',
    welcome: 'Xin chào! Tôi là Trợ lý AI của Chống Lừa Đảo. Tôi có thể giúp bạn kiểm tra độ an toàn của các đường link, IP, SĐT, email và tư vấn phòng chống các hình thức lừa đảo trực tuyến phổ biến.'
  },
  {
    id: 'moderator',
    name: 'Người hỗ trợ (Support)',
    color: '#007aff',
    label: 'Hỗ trợ trực tuyến',
    welcome: 'Xin chào! Bạn đang kết nối với kênh hỗ trợ trực tuyến của Chống Lừa Đảo. Vui lòng gửi tin nhắn, hệ thống sẽ phân phát cho tư vấn viên hỗ trợ bạn ngay lập tức.'
  }
];

const QUICK_PROMPTS = [
  {
    id: 'delivery',
    title: 'Tư vấn thủ đoạn giao hàng',
    subtitle: 'Cách nhận biết shipper giả mạo',
    prompt: 'Shipper gọi điện yêu cầu chuyển khoản trước do tôi không có nhà, làm thế nào để nhận biết đây có phải shipper thật hay lừa đảo gửi hàng khống?',
    icon: <Send size={18} style={{ color: '#23b56c' }} />,
    bg: 'rgba(35, 181, 108, 0.08)'
  },
  {
    id: 'screenshot',
    title: 'Phân tích ảnh chụp',
    subtitle: 'Gửi ảnh tin nhắn để kiểm tra',
    prompt: 'Tôi nhận được tin nhắn từ đầu số lạ nói tài khoản VNeID của tôi bị khóa và yêu cầu nhấp vào link để xác thực, đây có phải lừa đảo không?',
    icon: <Image size={18} style={{ color: '#007aff' }} />,
    bg: 'rgba(0, 122, 255, 0.08)'
  },
  {
    id: 'report',
    title: 'Hướng dẫn tố cáo',
    subtitle: 'Quy trình báo cáo cơ quan chức năng',
    prompt: 'Tôi bị lừa chuyển khoản đặt cọc mua hàng online qua Facebook, bây giờ tôi cần chuẩn bị hồ sơ gì và báo cáo ở đâu để lấy lại tiền?',
    icon: <ShieldAlert size={18} style={{ color: '#ef4444' }} />,
    bg: 'rgba(239, 68, 68, 0.08)'
  },
  {
    id: 'vtrust',
    title: 'Tìm hiểu về VTrust',
    subtitle: 'Sứ mệnh và công nghệ của chúng tôi',
    prompt: 'Hệ thống VTrust của Chống Lừa Đảo hoạt động như thế nào để phát hiện và cảnh báo tự động các trang web độc hại?',
    icon: <Info size={18} style={{ color: '#00b4d8' }} />,
    bg: 'rgba(0, 180, 216, 0.08)'
  }
];

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

export default function AiChatbotFullPage({ addToast }) {
  const navigate = useNavigate();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const { chatInput, setChatInput, isThinking, setIsThinking, getAgentReply, askChatbot } = useChatbot();
  const [conversations, setConversations] = useState([
    { id: '1', title: 'Hội thoại chính', agent: 'ai', messages: [] }
  ]);
  const [activeConvId, setActiveConvId] = useState('1');
  const [selectedAgentId, setSelectedAgentId] = useState('ai');

  // Support & WebSocket Chat states
  const [supportMessages, setSupportMessages] = useState([
    { sender: 'bot', text: 'Xin chào! Bạn đang kết nối với kênh hỗ trợ trực tuyến của Chống Lừa Đảo. Vui lòng gửi tin nhắn, hệ thống sẽ phân phát cho tư vấn viên hỗ trợ bạn ngay lập tức.' }
  ]);
  const supportSocketRef = useRef(null);

  const messagesEndRef = useRef(null);

  // Initialize Support WebSocket connection when selectedAgentId === 'moderator'
  useEffect(() => {
    if (selectedAgentId !== 'moderator') {
      if (supportSocketRef.current) {
        supportSocketRef.current.close();
        supportSocketRef.current = null;
      }
      return;
    }

    let sessionId = sessionStorage.getItem('chat_session_id');
    if (!sessionId) {
      sessionId = 'guest_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
      sessionStorage.setItem('chat_session_id', sessionId);
    }

    const wsUrl = `ws://localhost:8081/api/v1/ws/chat?session_id=${sessionId}&name=Khách_Hàng_A`;
    const socket = new WebSocket(wsUrl);
    supportSocketRef.current = socket;

    socket.onopen = () => {
      console.log('Support WebSocket connected for guest:', sessionId);
    };

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        const replyText = data.text || data.content;
        const senderRole = data.role;

        if (replyText && senderRole === 'moderator') {
          setSupportMessages(prev => {
            const isDuplicate = prev.some(m => m.text === replyText && m.sender === 'bot');
            if (isDuplicate) return prev;
            return [...prev, { sender: 'bot', text: replyText }];
          });
        }
      } catch (err) {
        console.warn('Failed to parse Support WebSocket message:', err);
      }
    };

    socket.onerror = (error) => {
      console.warn('Support WebSocket error:', error);
    };

    socket.onclose = () => {
      console.log('Support WebSocket disconnected');
    };

    return () => {
      socket.close();
      if (supportSocketRef.current === socket) {
        supportSocketRef.current = null;
      }
    };
  }, [selectedAgentId]);

  const activeConv = conversations.find(c => c.id === activeConvId) || conversations[0];
  const selectedAgent = AGENTS.find(a => a.id === selectedAgentId) || AGENTS[0];

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeConv?.messages, isThinking]);

  // Adjust active agent when switching conversations
  useEffect(() => {
    if (activeConv) {
      setTimeout(() => setSelectedAgentId(activeConv.agent), 0);
    }
  }, [activeConvId, activeConv]);


  const handleSelectAgent = (agentId) => {
    setSelectedAgentId(agentId);
    // Update active conversation's agent
    setConversations(prev => prev.map(c => {
      if (c.id === activeConvId) {
        return { ...c, agent: agentId };
      }
      return c;
    }));
  };

  const handleNewConversation = () => {
    const newId = (conversations.length + 1).toString();
    const newConv = {
      id: newId,
      title: `Hội thoại ${newId}`,
      agent: 'ai',
      messages: []
    };
    setConversations(prev => [...prev, newConv]);
    setActiveConvId(newId);
    setSelectedAgentId('ai');
    if (addToast) {
      addToast('Đã tạo cuộc hội thoại mới!', 'success');
    }
  };

  const handleSendMessage = async (textToSend) => {
    const text = textToSend || chatInput;
    if (!text.trim()) return;

    if (selectedAgentId === 'moderator') {
      const userMsg = { sender: 'user', text: text };
      setSupportMessages(prev => [...prev, userMsg]);
      if (!textToSend) {
        setChatInput('');
      }

      if (supportSocketRef.current && supportSocketRef.current.readyState === WebSocket.OPEN) {
        try {
          const sessionId = sessionStorage.getItem('chat_session_id') || 'guest_unknown';
          supportSocketRef.current.send(JSON.stringify({
            session_id: sessionId,
            sender: "Khách hàng",
            sender_name: "Khách hàng",
            role: "guest",
            content: text,
            text: text,
            timestamp: Date.now()
          }));
        } catch (err) {
          console.warn('Failed to send support message via WebSocket:', err);
          setSupportMessages(prev => [...prev, { sender: 'bot', text: 'Không thể gửi tin nhắn. Kênh hỗ trợ đang gián đoạn.' }]);
        }
      } else {
        setSupportMessages(prev => [...prev, { sender: 'bot', text: 'Kết nối hỗ trợ chưa sẵn sàng hoặc đã đóng. Vui lòng thử lại.' }]);
      }
      return;
    }

    // Add user message
    const userMsg = { sender: 'user', text: text };

    // Update conversation message list
    let updatedMsgs = [...activeConv.messages, userMsg];

    // Auto title update if it's the first message
    const isFirstMsg = activeConv.messages.length === 0;
    const titleUpdate = isFirstMsg ? (text.length > 22 ? text.substring(0, 20) + '...' : text) : activeConv.title;

    setConversations(prev => prev.map(c => {
      if (c.id === activeConvId) {
        return {
          ...c,
          title: titleUpdate,
          messages: updatedMsgs
        };
      }
      return c;
    }));

    if (!textToSend) {
      setChatInput('');
    }

    setIsThinking(true);

    try {
      let replyText = await askChatbot(text, selectedAgentId, activeConv.messages);
      if (!replyText) {
        replyText = getAgentReply(text, selectedAgentId);
      }

      setConversations(prev => prev.map(c => {
        if (c.id === activeConvId) {
          return {
            ...c,
            messages: [...c.messages, { sender: 'bot', text: replyText }]
          };
        }
        return c;
      }));
    } catch (err) {
      const replyText = getAgentReply(text, selectedAgentId);
      setConversations(prev => prev.map(c => {
        if (c.id === activeConvId) {
          return {
            ...c,
            messages: [...c.messages, { sender: 'bot', text: replyText }]
          };
        }
        return c;
      }));
    } finally {
      setIsThinking(false);
    }
  };

  const handleInputKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleUploadImage = () => {
    if (addToast) {
      addToast('Chức năng phân tích hình ảnh đang được đồng bộ hóa...', 'info');
    }
  };

  return (
    <div className="chat-fullpage-container">
      {/* Laser Scanning lines (Theme decoration) */}
      <div className="login-overlay-laser" style={{ opacity: 0.15 }}></div>

      {/* Left Sidebar */}
      {selectedAgentId === 'ai' && (
        <div className={`chat-sidebar ${isSidebarCollapsed ? 'collapsed' : ''}`}>
          <div>
            <div className="chat-sidebar-top-action">
              <button className="new-chat-btn" onClick={handleNewConversation}>
                <Plus size={16} />
                <span>Hội thoại mới</span>
              </button>
              <button
                className="collapse-sidebar-btn"
                onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                title={isSidebarCollapsed ? "Mở rộng thanh bên" : "Thu nhỏ thanh bên"}
              >
                <ChevronLeft size={16} />
              </button>
            </div>

            <div className="chat-history-section">
              <h4 className="chat-history-title">GẦN ĐÂY</h4>
              <div className="chat-history-list">
                {conversations.length > 0 ? (
                  conversations.map(conv => (
                    <div
                      key={conv.id}
                      className={`history-item ${conv.id === activeConvId ? 'active' : ''}`}
                      onClick={() => setActiveConvId(conv.id)}
                      title={conv.title}
                    >
                      <MessageSquare size={16} style={{ flexShrink: 0 }} />
                      <span>{conv.title}</span>
                    </div>
                  ))
                ) : (
                  <div className="no-history-text">Chưa có hội thoại nào</div>
                )}
              </div>
            </div>
          </div>

          <div className="chat-sidebar-footer">
            <button className="sidebar-footer-item" onClick={() => addToast && addToast('Cài đặt đang đồng bộ hóa...', 'info')}>
              <Settings size={16} style={{ flexShrink: 0 }} />
              <span>Cài đặt</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Area */}
      <div className="chat-main-area">
        {/* Header */}
        <header className="chat-main-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <span className="live-pulse-dot" style={{ backgroundColor: '#23B56C', boxShadow: '0 0 8px #23B56C', width: '7px', height: '7px' }}></span>
            <span className="chat-header-title">AI Chatbot</span>
          </div>

          <div className="chat-header-actions">
            <button className="header-action-btn" onClick={() => navigate('/?chat=open')} title="Thu nhỏ chatbot về dạng cửa sổ nổi">
              <Minimize2 size={15} />
              <span>Thu nhỏ</span>
            </button>
            <button className="header-action-btn btn-exit" onClick={() => navigate('/')} title="Thoát về trang chủ">
              <LogOut size={15} />
              <span>Thoát</span>
            </button>
          </div>
        </header>

        {/* Tab Selection Bar (2 Tabs) */}
        <div className="agent-selection-row">
          {AGENTS.map(agent => (
            <button
              key={agent.id}
              className={`agent-pill ${selectedAgentId === agent.id ? 'active' : ''}`}
              onClick={() => handleSelectAgent(agent.id)}
            >
              <div className="agent-avatar-circle" style={{ backgroundColor: agent.color }}>
                {agent.name[0]}
              </div>
              <span>{agent.name}</span>
            </button>
          ))}
        </div>

        {/* Message Stream Stream */}
        <div className="chat-messages-container">
          {selectedAgentId === 'moderator' ? (
            /* Support Messages Stream */
            <>
              {supportMessages.map((msg, idx) => (
                <div key={idx} className={`chat-bubble-row ${msg.sender === 'user' ? 'user' : 'bot'}`}>
                  <div className="chat-avatar-wrap" style={{ backgroundColor: msg.sender === 'user' ? undefined : '#23b56c' }}>
                    {msg.sender === 'user' ? 'U' : 'SUP'}
                  </div>
                  <div className="chat-msg-bubble">
                    {renderMessageText(msg.text)}
                  </div>
                </div>
              ))}
            </>
          ) : activeConv.messages.length === 0 ? (
            /* Empty Greeting State */
            <div className="chat-empty-greeting">
              <div className="chat-welcome-avatar-wrap" style={{ color: selectedAgent.color, borderColor: `${selectedAgent.color}33`, background: `${selectedAgent.color}11` }}>
                <span style={{ fontSize: '1.75rem', fontWeight: 900 }}>{selectedAgent.name[0]}</span>
              </div>
              <h2>Chào bạn, Trợ lý {selectedAgent.name} có thể giúp gì?</h2>
              <p>{selectedAgent.welcome}</p>

              <div className="chat-prompts-grid">
                {QUICK_PROMPTS.map(p => (
                  <div
                    key={p.id}
                    className="chat-prompt-card"
                    onClick={() => handleSendMessage(p.prompt)}
                  >
                    <div className="prompt-icon-wrap" style={{ background: p.bg }}>
                      {p.icon}
                    </div>
                    <div className="prompt-content">
                      <span className="prompt-title">{p.title}</span>
                      <span className="prompt-subtitle">{p.subtitle}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            /* Message Bubbles list */
            <>
              {/* Auto welcoming message */}
              <div className="chat-bubble-row bot">
                <div className="chat-avatar-wrap" style={{ backgroundColor: selectedAgent.color }}>
                  {selectedAgent.name[0]}
                </div>
                <div className="chat-msg-bubble">
                  {selectedAgent.welcome}
                </div>
              </div>

              {activeConv.messages.map((msg, idx) => (
                <div key={idx} className={`chat-bubble-row ${msg.sender}`}>
                  <div className="chat-avatar-wrap" style={{ backgroundColor: msg.sender === 'bot' ? selectedAgent.color : undefined }}>
                    {msg.sender === 'user' ? 'U' : selectedAgent.name[0]}
                  </div>
                  <div className="chat-msg-bubble">
                    {renderMessageText(msg.text)}
                  </div>
                </div>
              ))}

              {isThinking && (
                <div className="chat-bubble-row bot thinking">
                  <div className="chat-avatar-wrap" style={{ backgroundColor: selectedAgent.color }}>
                    {selectedAgent.name[0]}
                  </div>
                  <div className="chat-msg-bubble">
                    <span>Trợ lý {selectedAgent.name} đang suy nghĩ</span>
                    <div className="spinner" style={{ width: '10px', height: '10px', borderWidth: '1.5px', borderStyle: 'solid', display: 'inline-block' }}></div>
                  </div>
                </div>
              )}
            </>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Bottom Input Area */}
        <div className="chat-bottom-wrapper">
          <div className="chat-input-bar">
            <button className="input-media-btn" onClick={handleUploadImage} title="Tải ảnh hoặc tài liệu">
              <Image size={18} />
            </button>
            <input
              type="text"
              className="chat-core-input"
              placeholder={selectedAgentId === 'moderator' ? "Nhập nội dung cần hỗ trợ từ tư vấn viên..." : "Nhập câu hỏi hoặc dán tin nhắn nghi ngờ..."}
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={handleInputKeyDown}
            />
            <button className="chat-send-submit-btn" onClick={() => handleSendMessage()} title="Gửi tin nhắn">
              <Send size={16} />
            </button>
          </div>

          <span className="chat-subtext-footer">
            Trợ lý AI có thể mắc sai sót. Hãy luôn kiểm chứng thông tin quan trọng.
          </span>
        </div>
      </div>
    </div>
  );
}
