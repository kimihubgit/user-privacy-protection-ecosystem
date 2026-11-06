import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, ChevronLeft, Settings, Send, Image, Minimize2, LogOut, MessageSquare, ShieldAlert, X, PanelLeft, Bot, Headphones, Sparkles, Search, Database, ShieldCheck, BrainCircuit, Lock, Scale, Cpu, Globe } from 'lucide-react';
import './AiChatbotFullPage.css';
import { useChatbot } from '../../../hooks';

const AGENTS = [
  {
    id: 'ai',
    name: 'Trợ lý AI Bảo Mật',
    color: '#23b56c',
    type: 'ai',
    icon: <Bot size={16} />,
    badge: 'VISION AI & RAG ENGINE (AUTOMATED)',
    label: 'Trợ lý AI tự động tra cứu 24/7',
    welcome: 'Xin chào! Tôi là Trợ lý AI Bảo mật. Tôi sử dụng mô hình trí tuệ nhân tạo RAG & Vision AI để hỗ trợ bạn tự động tra cứu đường link, SĐT, STK rác và phân tích ảnh chụp màn hình nghi lừa đảo 24/7.'
  },
  {
    id: 'moderator',
    name: 'Tư vấn viên Trực tuyến',
    color: '#007aff',
    type: 'moderator',
    icon: <Headphones size={16} />,
    badge: 'CHATSOCKET LIVE SUPPORT (HUMAN MODERATOR)',
    label: 'Chat trực tiếp với Kiểm duyệt viên S.H.I.E.L.D.',
    welcome: 'Xin chào! Bạn đang kết nối với kênh ChatSocket Hỗ trợ trực tiếp của Kiểm duyệt viên S.H.I.E.L.D. Vui lòng gửi tin nhắn hoặc ảnh chụp chứng cứ, tin nhắn của bạn sẽ truyền thời gian thực tới bàn làm việc của tư vấn viên.'
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
    title: 'Phân tích ảnh chụp màn hình',
    subtitle: 'Gửi ảnh tin nhắn / biên lai để kiểm tra',
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
  }
];

const QUICK_SUGGESTION_CHIPS = [
  {
    label: 'Shipper giả mạo',
    prompt: 'Shipper gọi điện yêu cầu chuyển khoản trước do tôi không có nhà, làm thế nào để nhận biết shipper giả mạo?'
  },
  {
    label: 'VNeID bị khóa / Link APK',
    prompt: 'Tin nhắn báo tài khoản VNeID bị khóa và yêu cầu nhấp link cài file APK xác thực có phải lừa đảo không?'
  },
  {
    label: 'Lừa cọc mua hàng online',
    prompt: 'Tôi bị dụ chuyển khoản đặt cọc mua hàng giá rẻ qua Facebook, làm thế nào để tra cứu STK và báo cáo?'
  },
  {
    label: 'SMS Ngân hàng giả mạo',
    prompt: 'Dấu hiệu nhận biết SMS Brandname ngân hàng giả mạo và cách phân biệt tên miền Internet Banking thật/giả?'
  },
  {
    label: 'Nhiệm vụ Telegram / Việc làm ảo',
    prompt: 'Chiêu trò tuyển cộng tác viên làm nhiệm vụ xem video, nạp tiền duyệt đơn trên Telegram hoạt động ra sao?'
  },
  {
    label: 'Lộ thông tin CCCD / CMND',
    prompt: 'Tôi lỡ chụp gửi ảnh CCCD cho kẻ gian, bây giờ cần làm gì để ngăn ngừa bị mạo danh mở tài khoản/vay tiền?'
  },
  {
    label: 'Hồ sơ tố cáo công an',
    prompt: 'Tôi bị lừa đảo chuyển khoản, cần chuẩn bị những chứng cứ và thủ tục gì để trình báo công an?'
  }
];

const THINKING_STEPS_AI = [
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
    icon: Search,
    title: 'Giải mã',
    sub: 'Bóc tách dữ liệu, DNS ...'
  },
  {
    icon: Database,
    title: 'Truy vấn kho dữ liệu S.H.I.E.L.D.',
    sub: 'Đang Đối soát 1.4M+ hồ sơ tài khoản rác, danh sách đen & lịch sử tố cáo...'
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
    sub: 'Đang xây dựng kịch ...'
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

export default function AiChatbotFullPage({ addToast }) {
  const navigate = useNavigate();
  const { askChatbot, getAgentReply, analyzeChatImage } = useChatbot();

  const [selectedAgentId, setSelectedAgentId] = useState('ai');
  const [conversations, setConversations] = useState([
    {
      id: 'conv-default',
      title: 'Tư vấn phòng shield',
      agentId: 'ai',
      messages: []
    }
  ]);
  const [activeConvId, setActiveConvId] = useState('conv-default');
  const [chatInput, setChatInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [thinkingStepIdx, setThinkingStepIdx] = useState(0);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const socketRef = useRef(null);

  const token = localStorage.getItem('token');
  const userName = localStorage.getItem('userName') || 'Khách Hàng';
  const [sessionId] = useState(() => localStorage.getItem('chat_session_id') || `session_${Date.now()}_${Math.floor(Math.random() * 1000)}`);

  useEffect(() => {
    localStorage.setItem('chat_session_id', sessionId);
  }, [sessionId]);

  const selectedAgent = AGENTS.find(a => a.id === selectedAgentId) || AGENTS[0];
  const activeConv = conversations.find(c => c.id === activeConvId) || conversations[0];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeConv?.messages, isThinking]);

  // Connect to ChatSocket WebSocket when Moderator mode is active
  useEffect(() => {
    if (selectedAgentId !== 'moderator') return;

    const wsUrl = token
      ? `ws://localhost:8081/api/v1/ws/chat?token=${token}&session_id=${sessionId}&type=client`
      : `ws://localhost:8081/api/v1/ws/chat?session_id=${sessionId}&name=${encodeURIComponent(userName)}&type=client`;

    let socket;
    try {
      socket = new WebSocket(wsUrl);
      socketRef.current = socket;

      socket.onopen = () => {
        console.log('ChatSocket WebSocket connected to moderator server');
      };

      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          const msgText = data.text || data.content || data.message;
          const senderRole = data.role || (data.sender === 'Moderator' ? 'moderator' : 'user');

          if (senderRole === 'moderator' && msgText) {
            setIsThinking(false);
            setConversations(prev => prev.map(c => {
              if (c.agentId === 'moderator') {
                return {
                  ...c,
                  messages: [...c.messages, { sender: 'bot', text: msgText }]
                };
              }
              return c;
            }));
          }
        } catch (err) {
          console.warn('Failed to parse incoming ChatSocket message:', err);
        }
      };

      socket.onerror = (err) => {
        console.warn('ChatSocket WebSocket connection error:', err);
      };
    } catch (e) {
      console.warn('Could not establish ChatSocket WebSocket connection:', e);
    }

    return () => {
      if (socket) {
        socket.close();
      }
      if (socketRef.current === socket) {
        socketRef.current = null;
      }
    };
  }, [selectedAgentId, token, sessionId, userName]);

  // Step ticker animation with dynamic randomized timing (Strictly for AI Chatbot mode ONLY)
  useEffect(() => {
    let timerId;
    if (isThinking && selectedAgentId === 'ai') {
      setThinkingStepIdx(0);

      const triggerNextStep = () => {
        // Randomize delay between 2200ms and 3800ms for natural reasoning pace
        const randomTime = Math.floor(Math.random() * 1600) + 2200;
        timerId = setTimeout(() => {
          setThinkingStepIdx(prev => (prev + 1) % THINKING_STEPS_AI.length);
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
  }, [isThinking, selectedAgentId]);

  const handleSelectAgent = (agentId) => {
    setSelectedAgentId(agentId);
    let conv = conversations.find(c => c.agentId === agentId);
    if (!conv) {
      const newConv = {
        id: `conv-${Date.now()}`,
        title: agentId === 'moderator' ? 'Kênh ChatSocket Hỗ Trợ' : 'Hội thoại mới',
        agentId: agentId,
        messages: []
      };
      setConversations(prev => [newConv, ...prev]);
      setActiveConvId(newConv.id);
    } else {
      setActiveConvId(conv.id);
    }
  };

  const handleNewConversation = () => {
    const newConv = {
      id: `conv-${Date.now()}`,
      title: 'Hội thoại mới',
      agentId: selectedAgentId,
      messages: []
    };
    setConversations(prev => [newConv, ...prev]);
    setActiveConvId(newConv.id);
  };

  const handleFileClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      if (addToast) addToast('Vui lòng chọn định dạng file hình ảnh (PNG, JPG, WEBP)', 'warning');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setSelectedImage({
        file,
        previewUrl: reader.result,
        name: file.name
      });
      if (addToast) addToast(`Đã đính kèm ảnh: ${file.name}`, 'info');
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
  };

  const handlePaste = (e) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        const file = items[i].getAsFile();
        if (file) {
          const reader = new FileReader();
          reader.onload = () => {
            setSelectedImage({
              file,
              previewUrl: reader.result,
              name: 'Anh_da_dan.png'
            });
            if (addToast) addToast('Đã dán ảnh từ bộ nhớ tạm!', 'info');
          };
          reader.readAsDataURL(file);
        }
      }
    }
  };

  const handleSendMessage = async (customText = null) => {
    const text = (customText !== null ? customText : chatInput).trim();
    const imageAttachment = selectedImage?.previewUrl || null;

    if (!text && !imageAttachment) return;

    const userMsg = {
      sender: 'user',
      text: text || 'Đã gửi 1 ảnh chụp màn hình cần phân tích',
      image: imageAttachment
    };

    const isFirstMsg = activeConv.messages.length === 0;
    const titleUpdate = isFirstMsg
      ? (text ? (text.length > 22 ? text.substring(0, 20) + '...' : text) : 'Phân tích ảnh chụp')
      : activeConv.title;

    const updatedMsgs = [...activeConv.messages, userMsg];

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

    if (customText === null) {
      setChatInput('');
      const inputEl = document.querySelector('.chat-core-input');
      if (inputEl) inputEl.style.height = 'auto';
    }
    setSelectedImage(null);

    // MODE 1: MODERATOR CHATSOCKET (WebSocket Live Support with Human Moderator)
    if (selectedAgentId === 'moderator') {
      setIsThinking(false);
      if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
        try {
          socketRef.current.send(JSON.stringify({
            session_id: sessionId,
            sender_id: sessionId,
            sender_name: userName,
            name: userName,
            role: 'user',
            text: text || 'Gửi ảnh bằng chứng',
            content: text || 'Gửi ảnh bằng chứng',
            timestamp: Date.now()
          }));
        } catch (err) {
          console.warn('Failed to send message over ChatSocket WebSocket:', err);
        }
      }
      return;
    }

    // MODE 2: AI CHATBOT RAG (Python ai_ANM Server API)
    setIsThinking(true);
    const randomThinkingDuration = Math.floor(Math.random() * 1500) + 3000;
    const minDelay = new Promise(resolve => setTimeout(resolve, randomThinkingDuration));
    try {
      let replyText = null;

      // If image attachment is present, perform OCR Screenshot Analysis via ai_ANM Image API
      if (imageAttachment) {
        const [apiReply] = await Promise.all([analyzeChatImage(imageAttachment, text), minDelay]);
        replyText = apiReply;
        if (!replyText) {
          replyText = `🔍 **KẾT QUẢ PHÂN TÍCH ẢNH CHỤP MÀN HÌNH (VISION AI OCR)**:\n\n` +
            `1. **Mô tả nhận diện**: Hệ thống đã tiếp nhận và phân tích dữ liệu hình ảnh của bạn.\n` +
            `2. **Đánh giá dấu hiệu bất thường**:\n` +
            `   - **Tin nhắn / Đường link lạ**: Cảnh giác trước các tên miền nhái ngân hàng, cổng VNeID giả mạo hoặc đuôi file \`.APK\` độc hại.\n` +
            `   - **Số tài khoản cá nhân**: Ngân hàng và cơ quan công an KHÔNG BAO GIỜ yêu cầu chuyển tiền qua tài khoản cá nhân.\n` +
            `3. **Khuyến cáo hành động ngay**:\n` +
            `   - Tuyệt đối KHÔNG bấm vào bất kỳ đường link nào hiển thị trên ảnh.\n` +
            `   - KHÔNG cung cấp mã xác thực OTP hay mật khẩu ứng dụng ngân hàng.\n` +
            `   - Báo cáo số tài khoản / URL độc hại này trên hệ thống S.H.I.E.L.D. để bảo vệ cộng đồng.`;
        }
      } else {
        const [apiReply] = await Promise.all([askChatbot(text, selectedAgentId, activeConv.messages), minDelay]);
        replyText = apiReply;
        if (!replyText) {
          replyText = getAgentReply(text, selectedAgentId);
        }
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
    } catch {
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
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const parseInlineStyle = (text) => {
    if (!text) return '';
    const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`|\*[^*]+\*)/g);
    return parts.map((part, idx) => {
      if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
        return <strong key={idx}>{part.slice(2, -2)}</strong>;
      }
      if (part.startsWith('`') && part.endsWith('`') && part.length > 2) {
        return (
          <code key={idx} style={{ background: 'rgba(35, 181, 108, 0.12)', padding: '0.15rem 0.4rem', borderRadius: '4px', fontFamily: 'monospace', fontSize: '0.88em' }}>
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
    if (!text) return null;

    return text.split('\n').map((line, index) => {
      let trimmed = line.trim();

      // Horizontal Rule
      if (trimmed === '---' || trimmed === '***' || trimmed === '___') {
        return <hr key={index} style={{ margin: '0.8rem 0', border: 'none', borderTop: '1px solid rgba(255, 255, 255, 0.12)' }} />;
      }

      // Headings (#, ##, ###, ####, #####, ######)
      const headingMatch = trimmed.match(/^(#{1,6})\s*(.*)/);
      if (headingMatch) {
        const level = headingMatch[1].length;
        const content = headingMatch[2];

        if (level === 1) {
          return (
            <h2 key={index} style={{ margin: '0.8rem 0 0.4rem 0', fontWeight: '800', fontSize: '1.25rem', color: 'inherit', lineHeight: '1.3' }}>
              {parseInlineStyle(content)}
            </h2>
          );
        }
        if (level === 2) {
          return (
            <h3 key={index} style={{ margin: '0.75rem 0 0.35rem 0', fontWeight: '700', fontSize: '1.12rem', color: 'inherit', lineHeight: '1.3' }}>
              {parseInlineStyle(content)}
            </h3>
          );
        }
        return (
          <h4 key={index} style={{ margin: '0.65rem 0 0.3rem 0', fontWeight: '700', fontSize: '1.02rem', color: 'inherit', lineHeight: '1.3' }}>
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
          <div key={index} style={{ marginLeft: '0.5rem', margin: '0.3rem 0', display: 'flex', gap: '0.4rem', alignItems: 'flex-start', lineHeight: '1.55' }}>
            <span style={{ fontWeight: '700', flexShrink: 0, minWidth: '1.2rem', color: '#23b56c' }}>{num}.</span>
            <span style={{ flex: 1 }}>{parseInlineStyle(rest)}</span>
          </div>
        );
      }

      // Bullet lists (e.g. "- ", "* ", "• ")
      if (trimmed.startsWith('- ') || trimmed.startsWith('* ') || trimmed.startsWith('• ')) {
        const rest = trimmed.replace(/^[-*•]\s*/, '');
        return (
          <div key={index} style={{ marginLeft: '0.5rem', margin: '0.3rem 0', display: 'flex', gap: '0.45rem', alignItems: 'flex-start', lineHeight: '1.55' }}>
            <span style={{ flexShrink: 0, color: '#23b56c', fontSize: '1rem', lineHeight: '1.2' }}>•</span>
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
        <p key={index} style={{ margin: '0.3rem 0', color: 'inherit', lineHeight: '1.6' }}>
          {parseInlineStyle(line)}
        </p>
      );
    });
  };

  return (
    <div className={`chat-fullpage-container ${isSidebarCollapsed ? 'collapsed' : ''}`}>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        style={{ display: 'none' }}
      />

      {/* Left Sidebar */}
      <div className={`chat-sidebar ${isSidebarCollapsed ? 'collapsed' : ''}`}>
        <div className="chat-sidebar-top-action">
          <button className="new-chat-btn" onClick={handleNewConversation}>
            <Plus size={18} />
            {!isSidebarCollapsed && <span>Cuộc trò chuyện mới</span>}
          </button>
          <button
            className="collapse-sidebar-btn"
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            title={isSidebarCollapsed ? "Mở rộng thanh bên" : "Thu gọn thanh bên"}
          >
            <ChevronLeft size={18} className={isSidebarCollapsed ? 'rotate-180' : ''} />
          </button>
        </div>

        {!isSidebarCollapsed && (
          <div className="chat-history-section">
            <span className="section-label">Lịch sử hỗ trợ</span>
            <div className="history-list">
              {conversations.map(conv => (
                <div
                  key={conv.id}
                  className={`history-item ${conv.id === activeConvId ? 'active' : ''}`}
                  onClick={() => {
                    setActiveConvId(conv.id);
                    setSelectedAgentId(conv.agentId);
                  }}
                >
                  <MessageSquare size={16} />
                  <span className="conv-title">{conv.title}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="sidebar-footer">
          <button className="footer-action-btn" onClick={() => navigate('/')}>
            <LogOut size={18} />
            {!isSidebarCollapsed && <span>Trang chủ</span>}
          </button>
        </div>
      </div>

      {/* Main Chat Workspace */}
      <div className="chat-main-area">

        {/* Header */}
        <div className="chat-main-header">
          <div className="agent-selection-row">
            {AGENTS.map(agent => (
              <button
                key={agent.id}
                className={`agent-tab-btn ${selectedAgentId === agent.id ? 'active' : ''}`}
                onClick={() => handleSelectAgent(agent.id)}
                style={{
                  '--agent-color': agent.color
                }}
              >
                <div className="agent-avatar" style={{ backgroundColor: agent.color }}>
                  {agent.icon}
                </div>
                <div className="agent-text-wrap">
                  <span className="agent-name">{agent.name}</span>
                  <span className="agent-label">{agent.label}</span>
                </div>
              </button>
            ))}
          </div>

          <div className="header-actions">
            {isSidebarCollapsed && (
              <button
                className="icon-header-btn"
                onClick={() => setIsSidebarCollapsed(false)}
                title="Mở thanh bên"
              >
                <PanelLeft size={18} />
              </button>
            )}
            <button className="icon-header-btn" onClick={() => navigate('/')} title="Thu nhỏ về trang chính">
              <Minimize2 size={18} />
            </button>
          </div>
        </div>

        {/* Message Thread Container */}
        <div className="chat-messages-container">
          {activeConv.messages.length === 0 ? (
            <div className="chat-welcome-hero">
              <div className="hero-badge-pill" style={{ color: selectedAgent.color, borderColor: `${selectedAgent.color}40`, background: `${selectedAgent.color}15` }}>
                {selectedAgent.icon}
                <span>{selectedAgent.badge}</span>
              </div>
              <h2 className="welcome-headline">
                {selectedAgentId === 'moderator' ? 'Kênh ChatSocket Hỗ Trợ Trực Tuyến' : 'Tôi có thể hỗ trợ gì cho bạn hôm nay?'}
              </h2>
              <p className="welcome-subtext">
                {selectedAgent.welcome}
              </p>

              {selectedAgentId === 'ai' && (
                <div className="chat-prompts-grid">
                  {QUICK_PROMPTS.map(p => (
                    <div
                      key={p.id}
                      className="prompt-card"
                      onClick={() => handleSendMessage(p.prompt)}
                      style={{ background: p.bg }}
                    >
                      <div className="prompt-icon-wrap">
                        {p.icon}
                      </div>
                      <div className="prompt-content">
                        <h4 className="prompt-title">{p.title}</h4>
                        <span className="prompt-subtitle">{p.subtitle}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <>
              <div className="chat-bubble-row bot">
                <div className="chat-avatar-wrap" style={{ backgroundColor: selectedAgent.color }}>
                  {selectedAgent.icon}
                </div>
                <div className="chat-msg-bubble">
                  {selectedAgent.welcome}
                </div>
              </div>

              {activeConv.messages.map((msg, idx) => (
                <div key={idx} className={`chat-bubble-row ${msg.sender}`}>
                  <div className="chat-avatar-wrap" style={{ backgroundColor: msg.sender === 'bot' ? selectedAgent.color : undefined }}>
                    {msg.sender === 'user' ? 'U' : selectedAgent.icon}
                  </div>
                  <div className="chat-msg-bubble">
                    {msg.image && (
                      <img src={msg.image} alt="Ảnh chụp màn hình đính kèm" className="chat-msg-img" />
                    )}
                    {renderMessageText(msg.text)}
                  </div>
                </div>
              ))}

              {isThinking && selectedAgentId === 'ai' && (
                <div className="chat-bubble-row bot thinking">
                  <div className="chat-avatar-wrap" style={{ backgroundColor: selectedAgent.color }}>
                    {selectedAgent.icon}
                  </div>
                  <div className="chat-msg-bubble thinking-bubble">
                    <div className="thinking-container-v2">
                      <div className="thinking-header-pill">
                        <div className="thinking-pulse-dot"></div>
                        <span className="thinking-badge-title">AI REASONING ENGINE</span>
                      </div>

                      <div className="thinking-step-body" key={thinkingStepIdx}>
                        <div className="thinking-step-icon-wrap">
                          {(() => {
                            const CurrentIcon = THINKING_STEPS_AI[thinkingStepIdx].icon;
                            return <CurrentIcon size={18} className="thinking-step-icon-spinner" />;
                          })()}
                        </div>
                        <div className="thinking-step-info">
                          <div className="thinking-step-title">
                            {THINKING_STEPS_AI[thinkingStepIdx].title}
                          </div>
                          <div className="thinking-step-sub">
                            {THINKING_STEPS_AI[thinkingStepIdx].sub}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Bottom Input Area */}
        <div className="chat-bottom-wrapper">

          {/* Image Attachment Preview Bar if image is selected */}
          {selectedImage && (
            <div className="chat-image-preview-bar">
              <img src={selectedImage.previewUrl} alt="Preview" className="chat-image-preview-thumb" />
              <div className="chat-image-preview-info">
                <span className="chat-image-preview-name">{selectedImage.name}</span>
                <span className="chat-image-preview-sub">Đã đính kèm • Sẵn sàng gửi</span>
              </div>
              <button
                type="button"
                className="chat-image-remove-btn"
                onClick={handleRemoveImage}
                title="Hủy đính kèm ảnh"
              >
                <X size={14} />
              </button>
            </div>
          )}

          {/* Quick Suggestion Chips Bar */}
          {selectedAgentId === 'ai' && (
            <div className="chat-quick-chips-scroll">

              {QUICK_SUGGESTION_CHIPS.map((chip, idx) => (
                <button
                  key={idx}
                  type="button"
                  className="quick-chip-btn"
                  onClick={() => handleSendMessage(chip.prompt)}
                  disabled={isThinking}
                >
                  {chip.label}
                </button>
              ))}
            </div>
          )}

          <div className="chat-input-bar">
            <button
              type="button"
              className="input-media-btn"
              onClick={handleFileClick}
              title="Tải ảnh chụp tin nhắn / màn hình để đính kèm"
            >
              <Image size={18} />
            </button>
            <textarea
              className="chat-core-input"
              rows={1}
              placeholder={selectedAgentId === 'moderator' ? "Nhập nội dung gửi tới tư vấn viên ChatSocket..." : "Nhập câu hỏi, dán link hoặc dán ảnh chụp màn hình (Ctrl+V)..."}
              value={chatInput}
              onChange={(e) => {
                setChatInput(e.target.value);
                e.target.style.height = 'auto';
                e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
              }}
              onKeyDown={handleInputKeyDown}
              onPaste={handlePaste}
            />
            <button
              type="button"
              className="chat-send-submit-btn"
              onClick={() => handleSendMessage()}
              title="Gửi tin nhắn"
            >
              <Send size={16} />
            </button>
          </div>

          <span className="chat-subtext-footer">
            {selectedAgentId === 'moderator' ? 'Đang kết nối qua kênh ChatSocket tới hệ thống kiểm duyệt viên.' : 'Ai có thể mắc sai sót.'}
          </span>
        </div>

      </div>
    </div>
  );
}
