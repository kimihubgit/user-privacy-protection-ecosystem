import { GoogleGenAI } from '@google/genai';
import { config } from '../config.js';

const ai = new GoogleGenAI({ apiKey: config.gemini.apiKey });

/**
 * Tạo vector embedding cho một đoạn văn bản (dùng cho câu hỏi của người dùng).
 * Model PHẢI trùng với model đã dùng khi nạp dữ liệu vào Pinecone.
 */
export async function embedText(text) {
  const response = await ai.models.embedContent({
    model: config.gemini.embeddingModel,
    contents: text,
    config: {
      outputDimensionality: config.gemini.embeddingDimension,
    },
  });

  const values = response?.embeddings?.[0]?.values;
  if (!values) {
    throw new Error('Không thể tạo embedding từ Gemini.');
  }
  return values;
}

/**
 * Sinh câu trả lời từ Gemini dựa trên system instruction (persona + ngữ cảnh RAG)
 * và lịch sử hội thoại.
 */
export async function generateAnswer({ systemInstruction, history = [], question }) {
  const contents = [
    ...history.map((m) => ({
      role: m.sender === 'user' ? 'user' : 'model',
      parts: [{ text: m.text }],
    })),
    { role: 'user', parts: [{ text: question }] },
  ];

  const response = await ai.models.generateContent({
    model: config.gemini.chatModel,
    contents,
    config: {
      systemInstruction,
      // Gemini 3.x: token "suy luận" (thinking) cũng tính vào maxOutputTokens.
      // Đặt thinkingLevel thấp để dành nhiều token hơn cho câu trả lời hiển thị,
      // và tăng maxOutputTokens để có đủ chỗ cho cả 2 phần.
      thinkingConfig: {
        thinkingLevel: 'low',
      },
      maxOutputTokens: 4096,
      // Không tùy chỉnh temperature/top_p/top_k với dòng Gemini 3.x theo khuyến cáo
      // của Google, để không ảnh hưởng tới khả năng suy luận đã được tối ưu sẵn.
    },
  });

  const text = response?.text;
  if (!text) {
    throw new Error('Gemini không trả về nội dung.');
  }

  const finishReason = response?.candidates?.[0]?.finishReason;
  if (finishReason === 'MAX_TOKENS') {
    console.warn('[gemini] Cảnh báo: câu trả lời bị cắt do đạt giới hạn maxOutputTokens. Cân nhắc tăng thêm.');
  }

  return text;
}
