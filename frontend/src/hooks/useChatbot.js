import { useState, useCallback } from 'react';
import { AI_ANM_API_URL } from '../constants';

/**
 * Structured intent knowledge base for offline fallback agent replies.
 * Supports active agents: 'ai' (Trợ lý AI) & 'moderator' (Hỗ trợ trực tuyến).
 */
const AGENT_RULES = {
  ai: [
    {
      keywords: ['shipper', 'giao hàng', 'đơn hàng', 'gửi hàng', 'ship'],
      reply: 'Đối với thủ đoạn **giao hàng giả mạo (Fake Shipper)**:\n- Kẻ lừa đảo lấy thông tin đơn từ livestream/thùng rác rồi gọi điện yêu cầu chuyển khoản trước.\n- **Cách phòng tránh**: Tuyệt đối không chuyển khoản khi chưa nhận hàng trực tiếp, đối chiếu mã vận đơn trên app mua sắm và xác nhận với người thân.'
    },
    {
      keywords: ['vneid', 'vnelid', 'định danh', 'tài khoản bị khóa', 'công an', 'mã độc', 'apk'],
      reply: '⚠️ **Cảnh báo khẩn cấp**:\n- Cơ quan Công an **KHÔNG** làm việc qua điện thoại/SMS để yêu cầu mở khóa VNeID.\n- Các đường link đính kèm thường chứa mã độc (file `.APK`) nhằm chiếm quyền điều khiển điện thoại.\n- Tuyệt đối không nhấn link lạ và không cài ứng dụng ngoài CH Play/App Store.'
    },
    {
      keywords: ['vtrust', 'shield', 'hệ thống', 'thuật toán'],
      reply: '🛡️ **Hệ thống VTrust**:\n- Hoạt động dựa trên AI phân tích thời gian thực kết hợp cơ sở dữ liệu lớn của shield.\n- Tự động đối soát và chấm điểm mức độ uy tín của Website, Số điện thoại, Tài khoản ngân hàng và IP nhanh chóng.'
    },
    {
      keywords: ['link', 'web', 'trang web', 'tên miền', 'đường dẫn', 'url', 'domain'],
      reply: '🔍 **Kiểm tra độ an toàn Website**:\n- Hãy dán địa chỉ (URL) cần kiểm tra vào khung tìm kiếm trên trang chủ.\n- Hệ thống sẽ tự động quét bằng AI và đối soát cơ sở dữ liệu rủi ro để đưa ra cảnh báo ngay tức thì.'
    },
    {
      keywords: ['cọc', 'mua hàng', 'facebook', 'fanpage', 'giá rẻ', 'chuyển tiền', 'đặt cọc'],
      reply: '💳 **Lừa đảo cọc mua hàng online**:\n- Kẻ gian tạo fanpage giả, mua tương tác ảo, đăng bán sản phẩm giá rẻ bất ngờ và ép chuyển cọc qua STK rác.\n- **Khuyến nghị**: Hãy tra cứu Số tài khoản ngân hàng đó trên shield xem đã bị tố cáo chưa trước khi thực hiện giao dịch.'
    },
    {
      keywords: ['ngân hàng', 'e-banking', 'qr', 'chuyển khoản', 'stk', 'vcb', 'bidv'],
      reply: '🏦 **An toàn Tài chính Ngân hàng**:\n- Không truy cập đường link ngân hàng gửi qua SMS/tin nhắn lạ.\n- Không quét mã QR không rõ nguồn gốc.\n- Kiểm tra kỹ tên miền đăng nhập Internet Banking (phải là tên miền chính thức có đuôi `.com.vn` hoặc `.vn`).'
    },
    {
      keywords: ['zalo', 'telegram', 'mạng xã hội', 'hack', 'nhiệm vụ', 'mật khẩu', 'cookie', 'token'],
      reply: '🌐 **An toàn Mạng Xã Hội**:\n- Cảnh giác với chiêu trò hack tài khoản rồi nhắn tin vay tiền, hoặc dụ dỗ click link nhận quà để lấy cắp Cookie/Token.\n- Bật ngay bảo mật 2 lớp (2FA) và tránh xa các hội nhóm làm "nhiệm vụ xem video kiếm tiền" trên Telegram.'
    },
    {
      keywords: ['bill', 'hóa đơn', 'chụp', 'ảnh'],
      reply: '📸 **Xác minh Hóa đơn / Bill chuyển tiền**:\n- Tuyệt đối chỉ giao hàng khi tiền đã thực sự về tài khoản ngân hàng của bạn (kiểm tra qua app ngân hàng chính thức).\n- Các công cụ làm bill giả hiện nay rất tinh vi, có thể nhái chính xác mã giao dịch, số tiền và tên người chuyển.'
    },
    {
      keywords: ['báo cáo', 'tố cáo', 'báo xấu', 'trình báo', 'pháp lý', 'hồ sơ'],
      reply: '📢 **Hướng dẫn Báo cáo & Tố cáo**:\n1. Để báo cáo STK hoặc URL độc hại: Chọn tab **"Báo cáo"** trên thanh điều hướng.\n2. Nếu bị lừa đảo tài sản lớn: Chụp màn hình cuộc hội thoại, in biên lai chuyển tiền và làm đơn trình báo gửi trực tiếp Cơ quan Cảnh sát Điều tra Công an Cấp Quận/Huyện gần nhất.'
    },
    {
      keywords: ['tiện ích', 'extension', 'cài đặt', 'shield', 'chrome'],
      reply: '🧩 **Cài đặt tiện ích mở rộng**:\n- Nhấp vào nút **"Bảo vệ ngay"** ở góc trên bên phải để xem hướng dẫn cài đặt tiện ích shield trên Chrome, Edge, Firefox giúp tự động chặn trang web độc hại.'
    },
    {
      keywords: ['chào', 'hi', 'hello', 'xin chào', 'tư vấn', 'trợ giúp'],
      reply: 'Xin chào! Tôi là **Trợ lý AI của shield**. Bạn cần hỗ trợ kiểm tra độ an toàn của đường link, SĐT, STK ngân hàng hay tư vấn phòng shield nào?'
    }
  ],
  moderator: [
    {
      keywords: ['chào', 'hi', 'hello', 'tư vấn', 'hỗ trợ'],
      reply: 'Xin chào! Bạn đang kết nối với kênh **Hỗ trợ trực tuyến**. Vui lòng để lại tin nhắn chi tiết, tư vấn viên sẽ phản hồi bạn sớm nhất.'
    }
  ]
};

const DEFAULT_FALLBACKS = {
  ai: 'Cảm ơn câu hỏi của bạn. Để đánh giá an toàn, bạn có thể nhập đường link trang web, số điện thoại hoặc STK nghi ngờ vào ô kiểm tra trên trang chủ. Hãy luôn cảnh giác trước các yêu cầu chuyển tiền gấp hoặc cài đặt ứng dụng lạ!',
  moderator: 'Yêu cầu hỗ trợ của bạn đã được ghi nhận. Tư vấn viên trực tuyến sẽ phản hồi bạn trong ít phút.'
};

export function useChatbot() {
  const [chatInput, setChatInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);

  const getAgentReply = useCallback((query, agentId = 'ai') => {
    if (!query) return DEFAULT_FALLBACKS[agentId] || DEFAULT_FALLBACKS.ai;
    const q = query.toLowerCase().trim();

    const rules = AGENT_RULES[agentId] || AGENT_RULES.ai;

    for (const rule of rules) {
      if (rule.keywords.some(kw => q.includes(kw))) {
        return rule.reply;
      }
    }

    return DEFAULT_FALLBACKS[agentId] || DEFAULT_FALLBACKS.ai;
  }, []);

  // 1. Standard Chat API: POST /api/chat/ or POST /chat (JSON body: {"message": "..."})
  const askChatbot = useCallback(async (question, agentId = 'ai', history = []) => {
    try {
      // Try /api/chat/ standard endpoint first
      let response = await fetch(`${AI_ANM_API_URL}/api/chat/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: question })
      });

      if (!response.ok) {
        // Fallback to /chat or /api/chat if 404
        response = await fetch(`${AI_ANM_API_URL}/chat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ question, message: question, agentId, history })
        });
      }

      if (response.ok) {
        const data = await response.json();
        let replyText = data.reply || data.response;
        if (data.citations && data.citations.length > 0) {
          replyText += `\n\n📌 **Căn cứ & Nguồn trích dẫn pháp luật**:\n- ` + data.citations.join('\n- ');
        }
        return replyText;
      }
    } catch {
      // Server AI chưa chạy hoặc chưa sẵn sàng, tự động chuyển về chế độ offline fallback
    }
    return null;
  }, []);

  // 2. Real-time Streaming SSE Chat API: POST /api/chat/stream (JSON body: {"message": "..."})
  const askChatbotStream = useCallback(async (question, onChunk) => {
    try {
      const response = await fetch(`${AI_ANM_API_URL}/api/chat/stream`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: question })
      });

      if (response.ok && response.body) {
        const reader = response.body.getReader();
        const decoder = new TextDecoder('utf-8');
        let done = false;
        let buffer = '';

        while (!done) {
          const { value, done: readerDone } = await reader.read();
          done = readerDone;
          if (value) {
            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop(); // keep trailing incomplete line

            for (const line of lines) {
              const trimmed = line.trim();
              if (trimmed.startsWith('data: ')) {
                const dataStr = trimmed.replace(/^data:\s*/, '');
                if (dataStr === '[DONE]') {
                  return true;
                }
                try {
                  const parsed = JSON.parse(dataStr);
                  if (parsed.chunk && onChunk) {
                    onChunk(parsed.chunk);
                  }
                } catch {
                  // ignore non-json SSE lines
                }
              }
            }
          }
        }
        return true;
      }
    } catch (e) {
      console.warn('Stream API unavailable, using standard response.', e);
    }
    return false;
  }, []);

  // 3. Multimodal Image Analysis API: POST /api/chat/image/ (JSON body: {"image_base64": "...", "message": "..."})
  const analyzeChatImage = useCallback(async (imageBase64, message = '') => {
    try {
      let response = await fetch(`${AI_ANM_API_URL}/api/chat/image/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image_base64: imageBase64,
          message: message
        })
      });

      if (!response.ok) {
        response = await fetch(`${AI_ANM_API_URL}/api/chat/image`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            image_base64: imageBase64,
            message: message
          })
        });
      }

      if (response.ok) {
        const data = await response.json();
        return data.reply || data.response;
      }
    } catch {
      // ai_ANM Image Analysis API offline or starting up
    }
    return null;
  }, []);

  return {
    chatInput,
    setChatInput,
    isThinking,
    setIsThinking,
    getAgentReply,
    askChatbot,
    askChatbotStream,
    analyzeChatImage
  };
}
