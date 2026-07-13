import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, ChevronLeft, Settings, HelpCircle, Send, Image, Minimize2, LogOut, MessageSquare, Info, ShieldAlert } from 'lucide-react';
import './AiChatbotFullPage.css';
import { useChatbot } from '../../../hooks';

const AGENTS = [
  {
    id: 'ai',
    name: 'AI',
    color: '#23b56c',
    label: 'Trợ lý chung',
    welcome: 'Xin chào! Tôi là Trợ lý AI của Chống Lừa Đảo. Tôi có thể giúp bạn kiểm tra độ an toàn của các đường link, IP, SĐT, email và tư vấn phòng chống các hình thức lừa đảo trực tuyến phổ biến.'
  },
  {
    id: 'hoangminh',
    name: 'Hoàng Minh',
    color: '#ef4444',
    label: 'Tài chính & Ngân hàng',
    welcome: 'Chào bạn! Tôi là Hoàng Minh, chuyên gia tư vấn an toàn tài chính. Hãy chia sẻ với tôi nếu bạn gặp cuộc gọi mạo danh cơ quan công an/ngân hàng, dụ dỗ đầu tư tài chính lãi cao, hoặc nhận tin nhắn gửi mã OTP giả mạo.'
  },
  {
    id: 'minhan',
    name: 'Minh An',
    color: '#007aff',
    label: 'Mạng xã hội & OTP',
    welcome: 'Hi! Minh An đây, chuyên gia bảo mật mạng xã hội. Tôi có thể hỗ trợ bạn nhận diện các group Telegram lừa đảo làm nhiệm vụ online, fanpage giả mạo, link tặng quà trúng thưởng, hay hướng dẫn bảo mật tài khoản Facebook.'
  },
  {
    id: 'tieulam',
    name: 'Tiểu Lâm',
    color: '#f59e0b',
    label: 'Rò rỉ dữ liệu',
    welcome: 'Xin chào! Tôi là Tiểu Lâm, trợ lý kiểm tra lộ lọt dữ liệu cá nhân. Nếu bạn nghi ngờ địa chỉ email, mật khẩu hoặc số CCCD của mình bị rò rỉ trên internet hoặc chợ đen, tôi sẽ hướng dẫn bạn các bước xử lý khân cấp.'
  },
  {
    id: 'tieumy',
    name: 'Tiểu Mỹ',
    color: '#8b5cf6',
    label: 'Phân tích ảnh chụp',
    welcome: 'Chào bạn! Tôi là Tiểu Mỹ. Tôi chuyên phân tích hình ảnh tin nhắn đe dọa, hóa đơn chuyển tiền giả (fake bill). Bạn hãy mô tả nội dung ảnh chụp hoặc dán văn bản tin nhắn nghi ngờ vào đây để tôi kiểm tra.'
  },
  {
    id: 'tieuhong',
    name: 'Tiểu Hồng',
    color: '#ec4899',
    label: 'Hỗ trợ tố cáo',
    welcome: 'Chào bạn! Tôi là Tiểu Hồng, cố vấn pháp lý cộng đồng. Tôi sẽ hướng dẫn bạn chi tiết quy trình thu thập bằng chứng kỹ thuật số, lập vi bằng, viết đơn trình báo và liên hệ các cơ quan Công an có thẩm quyền để tố cáo lừa đảo.'
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

export default function AiChatbotFullPage({ addToast }) {
  const navigate = useNavigate();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const { chatInput, setChatInput, isThinking, setIsThinking, getAgentReply } = useChatbot();
  const [conversations, setConversations] = useState([
    { id: '1', title: 'Hội thoại chính', agent: 'ai', messages: [] }
  ]);
  const [activeConvId, setActiveConvId] = useState('1');
  const [selectedAgentId, setSelectedAgentId] = useState('ai');

  const messagesEndRef = useRef(null);

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

  const handleSendMessage = (textToSend) => {
    const text = textToSend || chatInput;
    if (!text.trim()) return;

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

    // Mock AI reply based on agent persona and message context
    setTimeout(() => {
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
      setIsThinking(false);
    }, 1000);
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

        {/* Agent Persona Select Bar */}
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
          {activeConv.messages.length === 0 ? (
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
                    {msg.text}
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
              placeholder="Nhập câu hỏi hoặc dán tin nhắn nghi ngờ..."
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
