export const MOCK_SCAM_URLS = [
  { id: '1', url: 'https://vietcombank-otp-verify.com', domain: 'vietcombank-otp-verify.com', status: 'malicious', category: 'phishing', description: 'Trang web giả mạo ngân hàng Vietcombank để đánh cắp mã OTP.', reportedBy: 'Cộng đồng', createdAt: '2026-06-19T10:00:00Z' },
  { id: '2', url: 'http://momo-nhan-loc-he.xyz', domain: 'momo-nhan-loc-he.xyz', status: 'malicious', category: 'scam', description: 'Lừa đảo nhận lộc hè MoMo, dụ dỗ người dùng chuyển tiền hoặc quét mã QR.', reportedBy: 'Cộng đồng', createdAt: '2026-06-19T09:30:00Z' },
  { id: '3', url: 'https://shopee-khuyenmai-hot.top', domain: 'shopee-khuyenmai-hot.top', status: 'suspicious', category: 'scam', description: 'Trang web mạo danh Shopee trúng thưởng tri ân khách hàng.', reportedBy: 'Hệ thống', createdAt: '2026-06-18T15:45:00Z' },
  { id: '4', url: 'https://vnelid-xacthuc.org', domain: 'vnelid-xacthuc.org', status: 'malicious', category: 'phishing', description: 'Giả mạo cổng dịch vụ công VNeID để cài ứng dụng độc hại ăn cắp dữ liệu.', reportedBy: 'Bộ Công An', createdAt: '2026-06-18T08:20:00Z' },
  { id: '5', url: 'http://binance-login-secure.net', domain: 'binance-login-secure.net', status: 'malicious', category: 'phishing', description: 'Trang đăng nhập Binance giả mạo nhằm đánh cắp thông tin tài khoản và ví điện tử.', reportedBy: 'Hệ thống', createdAt: '2026-06-17T11:15:00Z' },
];

export const MOCK_SCAMMERS = [
  { id: 's1', target: '19035678912345', type: 'bank_account', name: 'NGUYEN VAN A', bankName: 'Techcombank', description: 'Lừa cọc mua xe máy giá rẻ trên Facebook, sau khi nhận cọc thì chặn liên lạc.', reportsCount: 14, status: 'approved' },
  { id: 's2', target: '0987654321', type: 'phone', name: 'Mạo danh VTV', bankName: '', description: 'Số điện thoại gọi điện xưng danh là biên tập viên VTV báo trúng quà tri ân yêu cầu đóng phí ship.', reportsCount: 6, status: 'approved' },
  { id: 's3', target: '1029837465', type: 'bank_account', name: 'TRAN THI B', bankName: 'Vietcombank', description: 'Giả mạo nhân viên hỗ trợ cho vay online duyệt hồ sơ nhanh, bắt đóng phí bảo hiểm khoản vay.', reportsCount: 22, status: 'approved' },
];

export const MOCK_REVIEWS = {
  'vietcombank-otp-verify.com': [
    { author: 'Lê Minh H.', rating: 5, date: '1 giờ trước', content: 'Tôi nhận được SMS Brandname giả mạo chứa link này, suýt nữa thì nhập mã OTP!' },
    { author: 'Trần Bình', rating: 5, date: '5 giờ trước', content: 'Domain lừa đảo Vietcombank cực kỳ tinh vi, giao diện giống hệt bản thật.' }
  ],
  'momo-nhan-loc-he.xyz': [
    { author: 'Phan Vy', rating: 5, date: 'Hôm qua', content: 'Quảng cáo trên Facebook nói MoMo tặng 500k, bấm vào bắt quét QR đăng nhập ví. Lừa đảo!' }
  ],
  'shopee-khuyenmai-hot.top': [
    { author: 'Nguyen Hoang', rating: 4, date: '2 ngày trước', content: 'Gửi tin nhắn trúng thưởng xe SH. Mọi người cảnh giác.' }
  ]
};
