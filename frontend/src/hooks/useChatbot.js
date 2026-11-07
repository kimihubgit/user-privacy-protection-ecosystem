import { useState, useCallback } from 'react';
import { AI_ANM_API_URL } from '../constants';

export function useChatbot() {
  const [chatInput, setChatInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);

  // 1. Standard Chat API: POST /api/chat/ (JSON body: {"message": "..."})
  const askChatbot = useCallback(async (question, agentId = 'ai', history = []) => {
    try {
      // Try /api/chat/ standard endpoint first
      let response = await fetch(`${AI_ANM_API_URL}/api/chat/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: question })
      });

      if (!response.ok) {
        // Fallback to /chat if /api/chat/ is not found
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
    } catch (err) {
      console.warn('Lỗi kết nối tới máy chủ Chatbot AI:', err);
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
    } catch (err) {
      console.warn('Lỗi kết nối phân tích ảnh tới máy chủ AI:', err);
    }
    return null;
  }, []);

  return {
    chatInput,
    setChatInput,
    isThinking,
    setIsThinking,
    askChatbot,
    askChatbotStream,
    analyzeChatImage
  };
}
