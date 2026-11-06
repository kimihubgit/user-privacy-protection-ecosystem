import http from "k6/http";
import { check, sleep } from "k6";

// 1. Cấu hình kịch bản đo hiệu năng
export const options = {
  stages: [
    { duration: "5s", target: 20 }, // 5 giây đầu: tăng từ 0 lên 20 người dùng ảo (VUs)
    { duration: "20s", target: 50 }, // 20 giây tiếp theo: giữ ổn định ở mức 50 VUs
    { duration: "5s", target: 0 }, // 5 giây cuối: giảm dần về 0 để hệ thống hạ nhiệt
  ],
  thresholds: {
    http_req_failed: ["rate<0.01"], // Tỷ lệ lỗi phải dưới 1% (gần như bằng 0)
    http_req_duration: ["p(95)<200"], // 95% số request thời gian phản hồi phải dưới 200ms
  },
};

// Hàm phụ để sinh chuỗi ngẫu nhiên giúp "vượt" qua Cache của Backend nếu có
function makeRandomString(length) {
  let result = "";
  const characters = "abcdefghijklmnopqrstuvwxyz0123456789";
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

// 2. Hàm xử lý chính của mỗi Người dùng ảo (VU)
export default function () {
  const url = "http://localhost:8082/api/urls/check";

  // Giả lập các URL lừa đảo/nghi vấn ngẫu nhiên dựa trên mẫu của bạn
  // Ví dụ: vietcombank-login-update-a7f3x.xyz, techcombank-verify-9b2c.com...
  const randomSub = makeRandomString(5);
  const targetUrl = `https://vietcombank-login-update-${randomSub}.xyz`;

  // Khớp chính xác với raw data của curl bạn cung cấp
  const payload = JSON.stringify({
    url: targetUrl,
  });

  const params = {
    headers: {
      "Content-Type": "application/json",
    },
  };

  // Bắn request POST đo hiệu năng
  const res = http.post(url, payload, params);

  // Kiểm tra phản hồi trả về
  check(res, {
    "Trạng thái HTTP là 200": (r) => r.status === 200,
  });

  // Nghỉ ngơi một chút (từ 100ms đến 300ms) giữa các lần bắn request để giống người dùng thật lướt web
  sleep(Math.random() * 0.2 + 0.1);
}
