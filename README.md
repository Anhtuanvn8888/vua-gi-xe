# VUA GIỮ XE — TỪ BẢO VỆ LÊN ÔNG TRÙM (v2 STORY DEMO)

Bản chơi thử HTML5 miễn phí, chạy trên trình duyệt điện thoại và máy tính. Không cần tài khoản hay backend. Mã nguồn tự chứa WebGL 3D low-poly và có Canvas 2.5D fallback cho máy không hỗ trợ WebGL. Phần ảnh bìa và shop là **minh họa concept**, không phải ảnh chụp đồ họa 3D thực tế trong khi chơi.

## 12 màn và 4 chương

**Chương 1 — Bãi xe nhỏ, giấc mơ to**
1. Ca trực đầu tiên — hướng dẫn chọn/dắt xe từng ô.
2. Tan trường náo loạn — tìm lối ra giữa xe phụ huynh.
3. Bà Năm mất vé — đối chiếu manh mối để giao xe đúng chủ.

**Chương 2 — Sự cố không báo trước**
4. Rước dâu kẹt cổng — phục vụ 2 xe theo thứ tự.
5. Mưa to, bãi ngập — mỗi ô ngập làm giảm 6 giây.
6. Mở đường cấp cứu — ưu tiên xe cứu thương, rồi đến xe người nhà.

**Chương 3 — Đối thủ Bảy Còi**
7. Bảy Còi chơi xấu — gỡ khóa 3 chốt, chọn nhận tiền hoặc giữ uy tín.
8. Livestream bóc phốt — xác minh người lấy xe qua camera.
9. Hội xuân nghẹt thở — phục vụ liên tiếp 3 xe VIP.

**Chương 4 — Chung kết Vua Giữ Xe**
10. Bãi xe siêu mô tô — bãi đông, tháo khóa và trả 2 xe.
11. Sếp đến bất ngờ — trả 2 xe và kiểm tra quy trình giao xe.
12. Đại chiến Vua Giữ Xe — trả 3 xe, tháo khóa, xử lý xe Bảy Còi cố ý chắn cổng.

## Cách chơi
- Chạm chiếc xe muốn dắt. Chạm một ô trống **ngay sát bên** để di chuyển một ô. Hoặc kéo trực tiếp.
- Chiếc xe cần giao có viền vàng. Chỉ xe cần giao được đưa ra cổng (ô hàng 3, cột 5, kề phía phải); trò chơi tự động ghi nhận.
- Trong các màn nhiều xe, tiếp tục tìm xe vàng kế tiếp. Hết thời gian sẽ thua.
- Màn đặc biệt có câu hỏi xác minh, khóa xe, nước ngập hoặc quyết định ảnh hưởng danh tiếng.
- Có shop mua thời gian, đội tháo khóa hoặc xe cẩu bằng tiền xu kiếm được trong game.
- Điểm sao, xu, uy tín, màn đã mở được lưu trên trình duyệt bằng localStorage.

## Chạy thử

### Cách dễ nhất: file HTML độc lập
Dùng file riêng `Vua_Giu_Xe_Story_v2_1_file.html`. File này chứa toàn bộ mã và ảnh. Đổi tên thành `index.html` rồi tải lên một repository GitHub Pages để chơi trực tiếp. Hoặc mở file bằng trình duyệt hỗ trợ HTML cục bộ. Trình xem trước của iPhone Files có thể chặn JavaScript nên nên dùng GitHub Pages.

### Cách dự án đầy đủ (gói ZIP)
Giải nén gói, tải toàn bộ `index.html`, `game.js`, `renderer.js`, thư mục `assets/` lên repository GitHub. Vào **Settings → Pages → Deploy from a branch → main → / (root)**. Đợi GitHub Pages triển khai và mở `https://TÊN-TÀI-KHOẢN.github.io/TÊN-REPO/`.

### Chạy trên máy tính khi phát triển
Trong thư mục chứa `index.html`, chạy: `python -m http.server 8000` rồi mở http://localhost:8000 trên trình duyệt. Cần HTTP server vì bản dự án dùng JavaScript ES module.

## Trạng thái, giới hạn
- Đã kiểm tra cú pháp JavaScript, mô phỏng 12 khởi tạo màn, thao tác chạm chọn/dắt xe, quiz, gỡ khóa, biến cố Bảy Còi, màn thưởng trong Chromium thử nghiệm.
- Môi trường kiểm thử không mở được WebGL, nên chỉ kiểm tra trực tiếp được chế độ Canvas 2.5D. Cần kiểm thử WebGL, iPhone/Android thật trước khi phát hành.
- Đồ họa trong khi chơi là mô hình low-poly tự dựng. Ảnh 3D chi tiết ở bìa/shop chỉ là ảnh concept, chưa phải asset/model 3D dùng trong màn chơi.
- Chưa có NPC chạy động, hoạt cảnh cốt truyện dựng phim, hệ thống âm thanh, quảng cáo, bảng xếp hạng mạng hay tích hợp nạp tiền.
- Bản thử nghiệm chưa dành để phát hành App Store hoặc Google Play.

## Ưu tiên nâng cấp v3
1. Thay các mô hình thủ công bằng xe 3D có chất liệu đẹp (glTF/GLB tối ưu dung lượng, có LOD), hiệu ứng bóng đổ và animation.
2. NPC bảo vệ dắt xe, khách xếp hàng, âm thanh và thoại, camera đổi góc linh hoạt.
3. Tách 12 bãi xe thành bối cảnh riêng thực tế; thêm 4 minigame cơ chế khác nhau mỗi chương.
4. QA 60 FPS trên iPhone/Android phổ biến, đóng gói Capacitor, triển khai App Store/Google Play sau khi kiểm thử.
