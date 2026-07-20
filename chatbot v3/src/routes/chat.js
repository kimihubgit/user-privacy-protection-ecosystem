import { Router } from 'express';
import { answerQuestion } from '../services/ragService.js';

export const chatRouter = Router();

// Khớp với frontend: vite proxy '/chat-api' -> backend '' (đã strip prefix)
// nên endpoint thực tế ở đây là POST /chat
chatRouter.post('/chat', async (req, res) => {
  const { question, agentId, history } = req.body || {};

  if (!question || typeof question !== 'string' || !question.trim()) {
    return res.status(400).json({ error: 'Thiếu trường "question" hợp lệ.' });
  }

  try {
    const result = await answerQuestion({
      question: question.trim(),
      agentId: typeof agentId === 'string' ? agentId : 'ai',
      history: Array.isArray(history) ? history : [],
    });
    return res.json(result);
  } catch (err) {
    console.error('[chat] Lỗi xử lý câu hỏi:', err);
    return res.status(500).json({
      error: 'internal_error',
      response:
        'Xin lỗi, hệ thống trợ lý AI đang gặp sự cố tạm thời. Vui lòng thử lại sau ít phút.',
    });
  }
});
