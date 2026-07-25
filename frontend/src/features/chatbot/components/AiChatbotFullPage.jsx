import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, ChevronLeft, Settings, HelpCircle, Send, Image, Minimize2, LogOut, MessageSquare, Info, ShieldAlert } from 'lucide-react';
import './AiChatbotFullPage.css';
import { useChatbot } from '../../../hooks';

const AGENT = {
  id: 'ai',
  name: 'AI',
  color: '#23b56c',
  label: 'Trợ lý chung',
  welcome: 'Xin chào! Tôi là Trợ lý AI của Chống Lừa Đảo. Tôi có thể giúp bạn kiểm tra độ an toàn của các đường link, IP, SĐT, email và tư vấn phòng chống các hình thức lừa đảo trực tuyến phổ biến.'
};

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

// Parse **bold** trong một dòng văn bản thành <strong>, tránh hiện ký tự ** thô
const renderInlineText = (line) => {
  const parts = line.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i}>{part.slice(2, -2)}</strong>;
    }
    return part;
  });
};

const renderMessageText = (text) => {
  if (!text) return '';
  return text.split('\n').map((line, index) => {
    if (line.startsWith('## ')) {
      return <h4 key={index} style={{ margin: '0.5rem 0 0.25rem 0', fontWeight: 'bold', color: 'inherit' }}>{renderInlineText(line.replace('## ', ''))}</h4>;
    }
    if (line.startsWith('- ')) {
      return <li key={index} style={{ marginLeft: '1rem', listStyleType: 'disc', color: 'inherit' }}>{renderInlineText(line.replace('- ', ''))}</li>;
    }
    return <p key={index} style={{ margin: '0.25rem 0', color: 'inherit' }}>{renderInlineText(line)}</p>;
  });
};

export default function AiChatbotFullPage({ addToast }) {
  const navigate = useNavigate();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const { chatInput, setChatInput, isThinking, setIsThinking, getAgentReply, askChatbot, askChatbotStream, askChatbotImage } = useChatbot();
  const [conversations, setConversations] = useState([
    { id: '1', title: 'Hội thoại chính', messages: [] }
  ]);
  const [activeConvId, setActiveConvId] = useState('1');

  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  const activeConv = conversations.find(c => c.id === activeConvId) || conversations[0];

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeConv?.messages, isThinking]);

  const handleNewConversation = () => {
    const newId = (conversations.length + 1).toString();
    const newConv = {
      id: newId,
      title: `Hội thoại ${newId}`,
      messages: []
    };
    setConversations(prev => [...prev, newConv]);
    setActiveConvId(newId);
    if (addToast) {
      addToast('Đã tạo cuộc hội thoại mới!', 'success');
    }
  };

  const handleSendMessage = async (textToSend) => {
    const text = textToSend || chatInput;
    if (!text.trim()) return;

    // Chốt lại conversation đích để không bị lệch nếu người dùng đổi
    // hội thoại giữa lúc đang stream.
    const convId = activeConvId;

    // Add user message
    const userMsg = { sender: 'user', text: text };

    // Update conversation message list
    let updatedMsgs = [...activeConv.messages, userMsg];

    // Auto title update if it's the first message
    const isFirstMsg = activeConv.messages.length === 0;
    const titleUpdate = isFirstMsg ? (text.length > 22 ? text.substring(0, 20) + '...' : text) : activeConv.title;

    setConversations(prev => prev.map(c => {
      if (c.id === convId) {
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

    // Bubble bot rỗng để hiện hiệu ứng gõ chữ dần khi stream về
    setConversations(prev => prev.map(c => {
      if (c.id === convId) {
        return { ...c, messages: [...c.messages, { sender: 'bot', text: '' }] };
      }
      return c;
    }));

    const appendToLastBotMessage = (chunk) => {
      setConversations(prev => prev.map(c => {
        if (c.id !== convId) return c;
        const msgs = [...c.messages];
        const lastIdx = msgs.length - 1;
        msgs[lastIdx] = { ...msgs[lastIdx], text: msgs[lastIdx].text + chunk };
        return { ...c, messages: msgs };
      }));
    };

    // ==========================================
    // Hiệu ứng gõ chữ mượt (typewriter)
    // ==========================================
    // Gemini trả về theo từng cụm câu khá lớn (không phải từng token nhỏ
    // như một số LLM khác), nên nếu hiện thẳng nguyên chunk sẽ có cảm giác
    // "nhảy cục" thay vì "gõ chữ" mượt. Ở đây mình dồn các chunk nhận được
    // vào 1 hàng đợi, rồi "nhả" ra màn hình vài ký tự một cách đều đặn,
    // độc lập với tốc độ chunk thật sự đến từ mạng.
    let typeBuffer = '';
    let isDraining = false;
    const CHARS_PER_TICK = 3;
    const TICK_MS = 16;

    const drainTypeBuffer = () => {
      if (isDraining) return;
      isDraining = true;

      const tick = () => {
        if (typeBuffer.length === 0) {
          isDraining = false;
          return;
        }
        const piece = typeBuffer.slice(0, CHARS_PER_TICK);
        typeBuffer = typeBuffer.slice(CHARS_PER_TICK);
        appendToLastBotMessage(piece);
        setTimeout(tick, TICK_MS);
      };

      tick();
    };

    const enqueueForTyping = (chunk) => {
      typeBuffer += chunk;
      drainTypeBuffer();
    };

    const replaceLastBotMessage = (replyText) => {
      setConversations(prev => prev.map(c => {
        if (c.id !== convId) return c;
        const msgs = [...c.messages];
        msgs[msgs.length - 1] = { sender: 'bot', text: replyText };
        return { ...c, messages: msgs };
      }));
    };

    let streamedAny = false;

    try {
      streamedAny = await askChatbotStream(text, (chunk) => {
        setIsThinking(false);
        enqueueForTyping(chunk);
      });
    } catch (err) {
      streamedAny = false;
    }

    if (!streamedAny) {
      // Backend stream lỗi/offline -> thử API thường, rồi tới câu trả lời offline
      let replyText = null;
      try {
        replyText = await askChatbot(text);
      } catch (err) {
        replyText = null;
      }
      if (!replyText) {
        replyText = getAgentReply(text);
      }
      replaceLastBotMessage(replyText);
    }

    setIsThinking(false);
  };

  const handleInputKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const appendMessageToActiveConv = (msg) => {
    setConversations(prev => prev.map(c => {
      if (c.id === activeConvId) {
        return { ...c, messages: [...c.messages, msg] };
      }
      return c;
    }));
  };

  const handleUploadImage = () => {
    fileInputRef.current?.click();
  };

  const handleImageSelected = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      if (addToast) addToast('Vui lòng chọn một tệp hình ảnh.', 'error');
      return;
    }

    const MAX_SIZE_MB = 8;
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      if (addToast) addToast(`Ảnh quá lớn (tối đa ${MAX_SIZE_MB}MB).`, 'error');
      return;
    }

    const dataUrl = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

    appendMessageToActiveConv({ sender: 'user', text: 'Đã gửi một ảnh để kiểm tra.', image: dataUrl });
    setIsThinking(true);

    try {
      let replyText = await askChatbotImage(dataUrl);
      if (!replyText) {
        replyText = 'Xin lỗi, hiện chưa phân tích được ảnh này. Bạn thử lại sau ít phút nhé.';
      }
      appendMessageToActiveConv({ sender: 'bot', text: replyText });
    } catch (err) {
      appendMessageToActiveConv({ sender: 'bot', text: 'Xin lỗi, hiện chưa phân tích được ảnh này. Bạn thử lại sau ít phút nhé.' });
    } finally {
      setIsThinking(false);
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

        {/* Message Stream Stream */}
        <div className="chat-messages-container">
          {activeConv.messages.length === 0 ? (
            /* Empty Greeting State */
            <div className="chat-empty-greeting">
              <div className="chat-welcome-avatar-wrap" style={{ color: AGENT.color, borderColor: `${AGENT.color}33`, background: `${AGENT.color}11` }}>
                <span style={{ fontSize: '1.75rem', fontWeight: 900 }}>{AGENT.name[0]}</span>
              </div>
              <h2>Chào bạn, Trợ lý {AGENT.name} có thể giúp gì?</h2>
              <p>{AGENT.welcome}</p>

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
                <div className="chat-avatar-wrap" style={{ backgroundColor: AGENT.color }}>
                  {AGENT.name[0]}
                </div>
                <div className="chat-msg-bubble">
                  {AGENT.welcome}
                </div>
              </div>

              {activeConv.messages.map((msg, idx) => {
                const isEmptyStreamingPlaceholder =
                  msg.sender === 'bot' && msg.text === '' && !msg.image && isThinking && idx === activeConv.messages.length - 1;

                if (isEmptyStreamingPlaceholder) return null;

                return (
                  <div key={idx} className={`chat-bubble-row ${msg.sender}`}>
                    <div className="chat-avatar-wrap" style={{ backgroundColor: msg.sender === 'bot' ? AGENT.color : undefined }}>
                      {msg.sender === 'user' ? 'U' : AGENT.name[0]}
                    </div>
                    <div className="chat-msg-bubble">
                      {msg.image && (
                        <img
                          src={msg.image}
                          alt="Ảnh đã gửi"
                          style={{ maxWidth: '220px', maxHeight: '220px', borderRadius: '8px', display: 'block', marginBottom: msg.text ? '0.5rem' : 0 }}
                        />
                      )}
                      {renderMessageText(msg.text)}
                    </div>
                  </div>
                );
              })}

              {isThinking && (
                <div className="chat-bubble-row bot thinking">
                  <div className="chat-avatar-wrap" style={{ backgroundColor: AGENT.color }}>
                    {AGENT.name[0]}
                  </div>
                  <div className="chat-msg-bubble">
                    <span>Trợ lý {AGENT.name} đang suy nghĩ</span>
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
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              onChange={handleImageSelected}
              style={{ display: 'none' }}
            />
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
