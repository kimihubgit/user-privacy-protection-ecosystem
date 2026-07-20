import express from 'express';
import cors from 'cors';
import { config } from './config.js';
import { chatRouter } from './routes/chat.js';

const app = express();

app.use(cors({ origin: config.corsOrigin }));
app.use(express.json({ limit: '1mb' }));

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/', chatRouter);

app.use((req, res) => {
  res.status(404).json({ error: 'not_found' });
});

app.listen(config.port, () => {
  console.log(`Chatbot RAG backend đang chạy tại http://localhost:${config.port}`);
});
