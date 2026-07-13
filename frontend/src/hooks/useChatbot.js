import { useState, useCallback } from 'react';

export function useChatbot() {
  const [chatInput, setChatInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);

  const getAgentReply = useCallback((query, agentId) => {
    const q = query.toLowerCase().trim();
    
    switch (agentId) {
      case 'ai':
        if (q.includes('shipper') || q.includes('giao hàng')) {
          return 'Đối với thủ đoạn giao hàng giả mạo, kẻ lừa đảo thường lấy thông tin đơn hàng từ livestream hoặc thùng rác, sau đó gọi điện yêu cầu bạn chuyển khoản trước. Để phòng tránh, bạn tuyệt đối không chuyển khoản khi chưa nhận hàng trực tiếp, đối chiếu mã vận đơn trên app mua sắm, và liên hệ trực tiếp với người thân để xác nhận.';
        } else if (q.includes('vnelid') || q.includes('vneid') || q.includes('tài khoản bị khóa')) {
          return 'Cảnh báo nguy hiểm: Cơ quan Công an KHÔNG làm việc qua điện thoại hay tin nhắn SMS để yêu cầu mở khóa tài khoản định danh điện tử VNeID. Link đính kèm thường chứa mã độc (file .APK) để chiếm quyền điều khiển điện thoại. Bạn tuyệt đối không nhấn vào link lạ và không cài đặt ứng dụng ngoài kho CH Play/App Store.';
        } else if (q.includes('vtrust') || q.includes('chống lừa đảo')) {
          return 'Hệ thống VTrust hoạt động dựa trên mạng lưới phân tích AI thời gian thực kết hợp cơ sở dữ liệu lớn của Chống Lừa Đảo để đối soát và chấm điểm mức độ uy tín của website, tài khoản ngân hàng và IP. Nhờ đó, VTrust cung cấp thông tin đánh giá toàn diện về các mối đe dọa trực tuyến ngay lập tức.';
        } else if (q.includes('link') || q.includes('web') || q.includes('trang web') || q.includes('tên miền')) {
          return 'Để kiểm tra một trang web, bạn hãy dán địa chỉ đó vào khung tìm kiếm ở đầu trang này. Hệ thống sẽ tự động quét bằng AI và đối soát cơ sở dữ liệu để đưa ra cảnh báo.';
        } else if (q.includes('báo cáo') || q.includes('tố cáo')) {
          return 'Bạn có thể báo cáo các trang web lừa đảo, số điện thoại hoặc số tài khoản ngân hàng bằng cách chọn tab "Báo cáo" trên thanh điều hướng đầu trang.';
        } else if (q.includes('tiện ích') || q.includes('extension') || q.includes('cài đặt')) {
          return 'Bạn hãy nhấp vào nút "Bảo vệ ngay" ở góc trên bên phải trang web để xem hướng dẫn cài đặt tiện ích mở rộng ChongLuaDao trên Chrome, Edge, Firefox, giúp tự động chặn trang độc hại.';
        } else if (q.includes('chào') || q.includes('hi') || q.includes('hello')) {
          return 'Xin chào! Bạn cần tư vấn về vấn đề bảo mật hay kiểm tra dấu hiệu lừa đảo nào không?';
        }
        return 'Cảm ơn câu hỏi của bạn. Để đánh giá an toàn, bạn có thể nhập link trang web hoặc số điện thoại nghi ngờ vào ô kiểm tra. Tôi khuyên bạn hãy luôn cảnh giác trước các yêu cầu chuyển tiền gấp, trúng thưởng miễn phí hoặc cài đặt ứng dụng lạ.';

      case 'hoangminh':
        if (q.includes('cọc') || q.includes('mua hàng') || q.includes('facebook')) {
          return 'Đây là thủ đoạn lừa cọc mua xe/hàng hóa giá rẻ rất phổ biến. Kẻ gian tạo fanpage ảo có lượt tương tác giả, đăng bán sản phẩm cực rẻ và ép cọc qua tài khoản ngân hàng rác. Bạn hãy đối soát số tài khoản ngân hàng đó trên website Chống Lừa Đảo xem đã bị báo cáo xấu chưa trước khi thực hiện giao dịch nhé.';
        }
        return 'Với tư cách là chuyên gia an ninh tài chính, tôi khuyến nghị bạn không bao giờ truy cập đường link ngân hàng lạ, không quét mã QR không rõ nguồn gốc, và luôn kiểm tra kỹ tên miền trang đăng nhập e-banking (phải có dạng chính thống như vietcombank.com.vn, bidv.com.vn...).';

      case 'minhan':
        return 'Về các vấn đề bảo mật mạng xã hội (Facebook, Telegram, Zalo), hãy cẩn thận với chiêu trò hack nick rồi nhắn tin vay tiền, hoặc dụ dỗ click link nhận quà để đánh cắp Token/Cookie của trình duyệt. Bạn nên bật bảo mật 2 lớp (2FA) bằng Google Authenticator và hạn chế tham gia các group làm nhiệm vụ kiếm tiền online trên Telegram.';

      case 'tieulam':
        return 'Tiểu Lâm khuyến cáo: Khi phát hiện email hoặc mật khẩu bị lộ trên mạng, bạn cần ngay lập tức thay đổi mật khẩu cho toàn bộ tài khoản quan trọng (Email chính, Ngân hàng, MXH). Không sử dụng chung một mật khẩu cho nhiều trang web khác nhau và kích hoạt cảnh báo đăng nhập lạ.';

      case 'tieumy':
        return 'Nhận diện hình ảnh: Đối với hóa đơn chuyển khoản (bill chuyển tiền), bạn cần xác nhận số dư tài khoản ngân hàng của mình thay đổi trên ứng dụng chính thức trước khi giao hàng cho khách. Các công cụ làm bill giả hiện nay cực kỳ tinh vi, có thể chỉnh sửa số tiền, tên người gửi và mã giao dịch giống y như thật.';

      case 'tieuhong':
        return 'Hướng dẫn tố cáo pháp lý: Khi bị lừa đảo chiếm đoạt tài sản, bạn hãy chụp ảnh toàn bộ cuộc hội thoại, lưu lại biên lai chuyển khoản ngân hàng (có mã giao dịch giao dịch của ngân hàng), lấy thông tin số tài khoản của kẻ lừa đảo. Sau đó, làm đơn trình báo tố giác tội phạm gửi trực tiếp đến Cơ quan Cảnh sát điều tra Công an cấp Quận/Huyện gần nhất.';

      default:
        return 'Tôi có thể giúp gì cho bạn trong việc phân tích rủi ro an ninh mạng?';
    }
  }, []);

  return {
    chatInput,
    setChatInput,
    isThinking,
    setIsThinking,
    getAgentReply
  };
}
