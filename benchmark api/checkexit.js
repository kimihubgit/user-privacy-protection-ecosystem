import http from "k6/http";
import { check } from "k6";

export const options = {
  scenarios: {
    load_test: {
      executor: "constant-arrival-rate",

      rate: 1000, // 1000 request mỗi giây
      timeUnit: "1s",

      duration: "2m",

      preAllocatedVUs: 100,
      maxVUs: 1000,
    },
  },

  thresholds: {
    http_req_failed: ["rate<0.01"],
    http_req_duration: ["p(95)<200"],
  },
};

export default function () {
  const email = `user${__ITER}@example.com`;

  const res = http.get(
    `http://localhost:8081/api/v1/auth/check-email?email=${email}`,
  );

  check(res, {
    "status 200": (r) => r.status === 200,
  });
}
