import { useState, useCallback } from 'react';

/**
 * Base URL của backend AI Security Chatbot (ai_ANM - FastAPI).
 * Đặt VITE_API_BASE_URL trong .env ở gốc project frontend để đổi môi trường
 * (staging/production) mà không cần sửa code.
 */
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
const CHAT_ENDPOINT = `${API_BASE_URL}/api/chat/`;
const CHAT_STREAM_ENDPOINT = `${API_BASE_URL}/api/chat/stream`;
const CHAT_IMAGE_ENDPOINT = `${API_BASE_URL}/api/chat/image/`;
const REQUEST_TIMEOUT_MS = 30000;
const IMAGE_REQUEST_TIMEOUT_MS = 45000;

export function useChatbot() {
  const [chatInput, setChatInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);

  /**
   * Câu trả lời dự phòng (offline) khi không gọi được backend.
   * Chỉ còn 1 chatbot chung nên không cần phân nhánh theo agentId nữa.
   */
  const getAgentReply = useCallback((query) => {
    const q = (query || '').toLowerCase().trim();

    if (q.includes('shipper') || q.includes('giao hàng')) {
      return 'Đối với thủ đoạn giao hàng giả mạo, kẻ lừa đảo thường lấy thông tin đơn hàng từ livestream hoặc thùng rác, sau đó gọi điện yêu cầu bạn chuyển khoản trước. Để phòng tránh, bạn tuyệt đối không chuyển khoản khi chưa nhận hàng trực tiếp, đối chiếu mã vận đơn trên app mua sắm, và liên hệ trực tiếp với người thân để xác nhận.';
    }
    if (q.includes('vneid') || q.includes('tài khoản bị khóa')) {
      return 'Cảnh báo nguy hiểm: Cơ quan Công an KHÔNG làm việc qua điện thoại hay tin nhắn SMS để yêu cầu mở khóa tài khoản định danh điện tử VNeID. Link đính kèm thường chứa mã độc (file .APK) để chiếm quyền điều khiển điện thoại. Bạn tuyệt đối không nhấn vào link lạ và không cài đặt ứng dụng ngoài kho CH Play/App Store.';
    }
    if (q.includes('link') || q.includes('web') || q.includes('trang web') || q.includes('tên miền')) {
      return 'Để kiểm tra một trang web, bạn hãy dán địa chỉ đó vào khung tìm kiếm ở đầu trang này, hoặc gửi trực tiếp cho tôi để kiểm tra.';
    }
    if (q.includes('báo cáo') || q.includes('tố cáo')) {
      return 'Bạn có thể báo cáo các trang web lừa đảo, số điện thoại hoặc số tài khoản ngân hàng bằng cách chọn tab "Báo cáo" trên thanh điều hướng đầu trang.';
    }
    if (q.includes('chào') || q.includes('hi') || q.includes('hello')) {
      return 'Xin chào! Bạn cần tư vấn về vấn đề bảo mật hay kiểm tra dấu hiệu lừa đảo nào không?';
    }

    return 'Cảm ơn câu hỏi của bạn. Để đánh giá an toàn, bạn có thể nhập link trang web, số điện thoại hoặc email nghi ngờ vào đây. Tôi khuyên bạn hãy luôn cảnh giác trước các yêu cầu chuyển tiền gấp, trúng thưởng miễn phí hoặc cài đặt ứng dụng lạ.';
  }, []);

  /**
   * Gọi backend ai_ANM (FastAPI). Nếu backend lỗi/offline, trả về null
   * để nơi gọi tự fallback sang getAgentReply.
   */
  const askChatbot = useCallback(async (question) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    try {
      const response = await fetch(CHAT_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: question }),
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error(`Chatbot API trả về lỗi ${response.status}`);
      }

      const data = await response.json();
      return data.reply;
    } catch (e) {
      console.warn('Chatbot API connection failed, using offline fallback.', e);
      return null;
    } finally {
      clearTimeout(timeoutId);
    }
  }, []);

  /**
   * Gửi ảnh (base64, dạng data URI "data:image/...;base64,...") lên backend
   * để phân tích dấu hiệu lừa đảo. Nếu backend lỗi/offline, trả về null để
   * nơi gọi tự fallback hiển thị thông báo phù hợp.
   */
  const askChatbotImage = useCallback(async (imageBase64, message = '') => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), IMAGE_REQUEST_TIMEOUT_MS);

    try {
      const response = await fetch(CHAT_IMAGE_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ image_base64: imageBase64, message }),
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error(`Chatbot Image API trả về lỗi ${response.status}`);
      }

      const data = await response.json();
      return data.reply;
    } catch (e) {
      console.warn('Chatbot Image API connection failed.', e);
      return null;
    } finally {
      clearTimeout(timeoutId);
    }
  }, []);

  /**
   * Gọi backend theo dạng streaming (SSE) - gọi onChunk(text) mỗi khi có
   * đoạn text mới. Trả về true nếu nhận được ít nhất 1 đoạn nội dung,
   * false nếu lỗi/không nhận được gì (để nơi gọi tự fallback).
   */
  const askChatbotStream = useCallback(async (question, onChunk) => {
    try {
      const response = await fetch(CHAT_STREAM_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: question }),
      });

      if (!response.ok || !response.body) {
        throw new Error(`Chatbot Stream API trả về lỗi ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let buffer = '';
      let receivedAny = false;

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        const events = buffer.split('\n\n');
        // Giữ lại phần cuối chưa hoàn chỉnh (chưa có \n\n kết thúc event)
        buffer = events.pop() || '';

        for (const event of events) {
          const line = event.trim();
          if (!line.startsWith('data:')) continue;

          const raw = line.slice(5).trim();
          if (raw === '[DONE]') {
            return receivedAny;
          }

          try {
            const parsed = JSON.parse(raw);
            if (parsed.chunk) {
              receivedAny = true;
              onChunk(parsed.chunk);
            }
          } catch (e) {
            // Bỏ qua dòng không đúng định dạng JSON
          }
        }
      }

      return receivedAny;
    } catch (e) {
      console.warn('Chatbot Stream API connection failed.', e);
      return false;
    }
  }, []);

  return {
    chatInput,
    setChatInput,
    isThinking,
    setIsThinking,
    getAgentReply,
    askChatbot,
    askChatbotStream,
    askChatbotImage,
  };
}
