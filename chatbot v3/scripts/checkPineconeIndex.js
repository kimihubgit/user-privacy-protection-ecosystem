import 'dotenv/config';
import { Pinecone } from '@pinecone-database/pinecone';
import { config } from '../src/config.js';

async function main() {
  console.log('--- Kiểm tra kết nối & dữ liệu Pinecone ---');
  console.log('Index name:', config.pinecone.indexName);

  const pc = new Pinecone({ apiKey: config.pinecone.apiKey });
  const index = pc.index(config.pinecone.indexName);

  const stats = await index.describeIndexStats();

  console.log('\nTổng số vector trong index:', stats.totalRecordCount ?? '(không rõ)');
  console.log('Dimension của index:', stats.dimension ?? '(không rõ)');
  console.log('\nDanh sách namespace và số lượng vector trong mỗi namespace:');

  const namespaces = stats.namespaces || {};
  if (Object.keys(namespaces).length === 0) {
    console.log('  (Không có namespace nào — index có thể đang rỗng hoàn toàn.)');
  } else {
    for (const [ns, info] of Object.entries(namespaces)) {
      const label = ns === '' ? '(mặc định / rỗng "")' : `"${ns}"`;
      console.log(`  - ${label}: ${info.recordCount} vector`);
    }
  }

  console.log(`\nBackend của bạn (.env) đang cấu hình truy vấn namespace: "${config.pinecone.namespace}"`);
  const configuredCount = namespaces[config.pinecone.namespace]?.recordCount;
  if (configuredCount === undefined) {
    console.log('=> CẢNH BÁO: namespace này KHÔNG tồn tại trong danh sách ở trên. Đây chính là lý do query không ra kết quả.');
  } else if (configuredCount === 0) {
    console.log('=> CẢNH BÁO: namespace này tồn tại nhưng có 0 vector (rỗng).');
  } else {
    console.log(`=> OK: namespace này có ${configuredCount} vector, khớp với cấu hình.`);
  }
}

main().catch((err) => {
  console.error('Lỗi khi kiểm tra Pinecone:', err);
  process.exit(1);
});
