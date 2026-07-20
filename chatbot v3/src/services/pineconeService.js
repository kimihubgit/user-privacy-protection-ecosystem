import { Pinecone } from '@pinecone-database/pinecone';
import { config } from '../config.js';

const pc = new Pinecone({ apiKey: config.pinecone.apiKey });
const index = pc.index(config.pinecone.indexName);

/**
 * Truy vấn Pinecone lấy top-K chunk liên quan nhất tới vector câu hỏi.
 * Trả về danh sách { text, score, metadata }.
 */
export async function searchSimilarChunks(vector) {
  const ns = index.namespace(config.pinecone.namespace || '');

  const result = await ns.query({
    vector,
    topK: config.pinecone.topK,
    includeMetadata: true,
  });

  const matches = result?.matches || [];

  // Log chẩn đoán: xem Pinecone có trả về match thô nào không, trước khi lọc.
  if (matches.length === 0) {
    console.warn(
      '[pinecone] Query không trả về match nào. Kiểm tra lại: namespace ' +
      `("${config.pinecone.namespace || '(mặc định/rỗng)'}") có đúng không, ` +
      'index có thực sự chứa dữ liệu không, và embedding model dùng để tạo ' +
      'vector câu hỏi có khớp với model đã dùng khi nạp dữ liệu vào Pinecone không.'
    );
  } else {
    console.log(
      `[pinecone] Nhận được ${matches.length} match thô, điểm cao nhất: ` +
      `${matches.map((m) => (m.score ?? 0).toFixed(3)).join(', ')} ` +
      `(ngưỡng lọc hiện tại: PINECONE_MIN_SCORE=${config.pinecone.minScore})`
    );
    if (matches[0]?.metadata) {
      console.log(
        `[pinecone] Metadata keys của match đầu tiên: ${Object.keys(matches[0].metadata).join(', ')} ` +
        `(đang lấy text từ field "${config.pinecone.textField}")`
      );
    }
  }

  return matches
    .filter((m) => (m.score ?? 0) >= config.pinecone.minScore)
    .map((m) => ({
      text: m.metadata?.[config.pinecone.textField] || '',
      score: m.score,
      metadata: m.metadata,
    }))
    .filter((m) => m.text.trim().length > 0);
}
