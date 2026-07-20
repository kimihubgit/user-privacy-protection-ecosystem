import 'dotenv/config';

function required(name, value) {
  if (!value) {
    console.warn(`[config] Cảnh báo: biến môi trường ${name} chưa được thiết lập.`);
  }
  return value;
}

export const config = {
  port: Number(process.env.PORT || 8003),
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',

  gemini: {
    apiKey: required('GEMINI_API_KEY', process.env.GEMINI_API_KEY),
    chatModel: process.env.GEMINI_CHAT_MODEL || 'gemini-2.5-flash',
    embeddingModel: process.env.GEMINI_EMBEDDING_MODEL || 'text-embedding-004',
    embeddingDimension: Number(process.env.GEMINI_EMBEDDING_DIMENSION || 768),
  },

  pinecone: {
    apiKey: required('PINECONE_API_KEY', process.env.PINECONE_API_KEY),
    indexName: required('PINECONE_INDEX_NAME', process.env.PINECONE_INDEX_NAME),
    namespace: process.env.PINECONE_NAMESPACE || '',
    topK: Number(process.env.PINECONE_TOP_K || 5),
    minScore: Number(process.env.PINECONE_MIN_SCORE || 0.72),
    textField: process.env.PINECONE_TEXT_FIELD || 'text',
  },
};
