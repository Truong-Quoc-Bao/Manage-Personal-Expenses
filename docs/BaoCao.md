# BÁO CÁO ĐỒ ÁN CUỐI NGÀNH

## HỆ THỐNG QUẢN LÝ TÀI CHÍNH CÁ NHÂN THÔNG MINH - MONEY GUARD

---

# Mục lục

- [Chương 1: Tóm tắt đồ án](#chương-1-tóm-tắt-đồ-án)
- [Chương 2: Bài toán và mục tiêu](#chương-2-bài-toán-và-mục-tiêu)
  - [2.1. Bối cảnh và nhu cầu thực tế](#21-bối-cảnh-và-nhu-cầu-thực-tế)
  - [2.2. Đối tượng người dùng mục tiêu](#22-đối-tượng-người-dùng-mục-tiêu)
  - [2.3. User Story chi tiết](#23-user-story-chi-tiết)
  - [2.4. Mục tiêu hệ thống](#24-mục-tiêu-hệ-thống)
  - [2.5. Phạm vi hệ thống](#25-phạm-vi-hệ-thống)
- [Chương 3: Phân tích yêu cầu hệ thống](#chương-3-phân-tích-yêu-cầu-hệ-thống)
  - [3.1. Yêu cầu chức năng chi tiết](#31-yêu-cầu-chức-năng-chi-tiết)
  - [3.2. Đặc tả Usecase chi tiết](#32-đặc-tả-usecase-chi-tiết)
  - [3.3. Bảng đối sánh yêu cầu tối thiểu](#33-bảng-đối-sánh-yêu-cầu-tối-thiểu)
  - [3.4. Yêu cầu phi chức năng](#34-yêu-cầu-phi-chức-năng)
  - [3.5. Ràng buộc thiết kế](#35-ràng-buộc-thiết-kế)
- [Chương 4: Thiết kế hệ thống](#chương-4-thiết-kế-hệ-thống)
  - [4.1. Kiến trúc tổng thể](#41-kiến-trúc-tổng-thể)
  - [4.2. Giao tiếp giữa các service](#42-giao-tiếp-giữa-các-service)
  - [4.3. Thiết kế cơ sở dữ liệu](#43-thiết-kế-cơ-sở-dữ-liệu)
  - [4.4. Thiết kế API Gateway](#44-thiết-kế-api-gateway)
  - [4.5. Thiết kế giao diện và luồng người dùng](#45-thiết-kế-giao-diện-và-luồng-người-dùng)
- [Chương 5: Công nghệ sử dụng](#chương-5-công-nghệ-sử-dụng)
- [Chương 6: Mô tả các Module và API chính](#chương-6-mô-tả-các-module-và-api-chính)
  - [6.1. Auth Service - Xác thực](#61-auth-service---xác-thực)
  - [6.2. User Service - Quản lý người dùng](#62-user-service---quản-lý-người-dùng)
  - [6.3. Account Service - Tài khoản/Ví](#63-account-service---tài-khoảnví)
  - [6.4. Transaction Service - Giao dịch](#64-transaction-service---giao-dịch)
  - [6.5. Category Service - Danh mục](#65-category-service---danh-mục)
  - [6.6. Budget Service - Ngân sách](#66-budget-service---ngân-sách)
  - [6.7. Analytics Service - Phân tích dữ liệu](#67-analytics-service---phân-tích-dữ-liệu)
  - [6.8. AI Service - Trí tuệ nhân tạo](#68-ai-service---trí-tuệ-nhân-tạo)
  - [6.9. Notification Service - Thông báo](#69-notification-service---thông-báo)
- [Chương 7: Mô tả chi tiết phần AI/NLP tích hợp](#chương-7-mô-tả-chi-tiết-phần-ainlp-tích-hợp)
  - [7.1. FinBot - Chatbot Trợ lý Tài chính](#71-finbot---chatbot-trợ-lý-tài-chính)
  - [7.2. OCR Hóa đơn](#72-ocr-hóa-đơn---nhận-dạng-và-phân-loại-tự-động)
  - [7.3. Phát hiện bất thường chi tiêu](#73-phát-hiện-bất-thường-chi-tiêu-anomaly-detection)
  - [7.4. AI Deep Scan - Phân tích sức khỏe tài chính](#74-ai-deep-scan---phân-tích-sức-khỏe-tài-chính)
  - [7.5. Bank Webhook AI Classification](#75-bank-webhook-ai-classification)
  - [7.6. Model Fallback - Đa não bộ AI](#76-model-fallback---đa-não-bộ-ai)
- [Chương 8: Cài đặt và triển khai](#chương-8-cài-đặt-và-triển-khai)
- [Chương 9: Kết quả thực nghiệm và kiểm thử](#chương-9-kết-quả-thực-nghiệm-và-kiểm-thử)
- [Chương 10: Đối sánh trực tiếp với tiêu chí chấm điểm](#chương-10-đối-sánh-trực-tiếp-với-tiêu-chí-chấm-điểm)
- [Chương 11: Phân công công việc và đóng góp thành viên](#chương-11-phân-công-công-việc-và-đóng-góp-thành-viên)
- [Chương 12: Kết luận và hướng phát triển](#chương-12-kết-luận-và-hướng-phát-triển)
- [Chương 13: Tài liệu tham khảo](#chương-13-tài-liệu-tham-khảo)
- [Chương 14: Phụ lục](#chương-14-phụ-lục-bắt-buộc)
- [Chương 15: Checklist tự rà trước khi nộp](#chương-15-checklist-tự-rà-trước-khi-nộp)

---

# Chương 1: Tóm tắt đồ án

Hệ thống **Quản lý Tài chính Cá nhân thông minh (Money Guard)** là một ứng dụng web toàn diện được xây dựng theo kiến trúc **Microservices**, tích hợp công nghệ **AI/NLP** để hỗ trợ người dùng Việt Nam quản lý thu chi hiệu quả. Hệ thống bao gồm **10 service độc lập** (Auth, User, Account, Transaction, Category, Budget, Analytics, Notification, AI, Gateway), giao tiếp qua **REST API**, **gRPC** và **RabbitMQ** message broker.

Đối tượng người dùng mục tiêu là cá nhân và hộ gia đình có nhu cầu quản lý tài chính hàng ngày, đặc biệt những người mong muốn ứng dụng công nghệ AI vào kiểm soát chi tiêu và xây dựng thói quen tài chính lành mạnh.

**Các chức năng chính của hệ thống:**

- **Quản lý thu chi** — ghi nhận, phân loại, xem lịch sử giao dịch với lọc đa chiều
- **Quản lý tài khoản/ví** — hỗ trợ nhiều loại: tiền mặt, ngân hàng, ví điện tử
- **Theo dõi ngân sách** — thiết lập hạn mức theo danh mục, cảnh báo khi vượt ngưỡng
- **Phân tích & báo cáo** — dashboard real-time, biểu đồ xu hướng, tổng hợp theo danh mục
- **Chatbot AI (FinBot)** — trợ lý tài chính bằng ngôn ngữ tự nhiên tiếng Việt
- **OCR hóa đơn** — nhận dạng ảnh hóa đơn và tạo giao dịch tự động
- **Phát hiện bất thường** — phân tích chi tiêu bất thường và cảnh báo
- **AI Deep Scan** — phân tích sức khỏe tài chính toàn diện
- **Bank Webhook** — tự động ghi nhận giao dịch ngân hàng qua SePay/BankHub

**Điểm nổi bật về kỹ thuật:**

- Kiến trúc microservices đa ngôn ngữ: **.NET 8** (Auth, Transaction) + **Node.js** (các service còn lại)
- Giao tiếp đồng bộ qua **gRPC** (Account, Category, Budget, User) và bất đồng bộ qua **RabbitMQ**
- ORM: **Prisma** cho Node.js services, **Entity Framework Core** cho .NET services
- AI multi-model: **Google Gemini** với cơ chế fallback và streaming response
- Real-time: **Socket.IO** cho cập nhật dashboard và thông báo tức thời
- Frontend: **React 19** + **TypeScript** + **Vite** + **Tailwind CSS** + **Radix UI**

---

# Chương 2: Bài toán và mục tiêu

## 2.1. Bối cảnh và nhu cầu thực tế

### 2.1.1. Câu chuyện thực tế hiện nay

Trong bối cảnh kinh tế số phát triển mạnh tại Việt Nam, người dân ngày càng thực hiện nhiều giao dịch tài chính hơn thông qua nhiều kênh khác nhau: tiền mặt, thẻ ngân hàng, ví điện tử (MoMo, ZaloPay, VNPay), chuyển khoản online. Tuy nhiên, phần lớn cá nhân và hộ gia đình vẫn chưa có công cụ phù hợp để quản lý tài chính một cách hệ thống và khoa học.

**Tình huống điển hình 1 — Bạn Minh, sinh viên 22 tuổi tại TP.HCM:** Minh nhận học bổng 3 triệu đồng/tháng nhưng thường xuyên hết tiền trước cuối tháng mà không biết tiền đã "chảy đi đâu". Mỗi lần mua trà sữa, đặt đồ ăn Grab hay mua sắm online chỉ vài chục nghìn đồng, nhưng cộng lại cuối tháng có thể lên đến vài triệu. Minh không có thói quen ghi chép và không có công cụ nào tự động theo dõi các khoản chi nhỏ lẻ này.

**Tình huống điển hình 2 — Chị Lan, nhân viên văn phòng 28 tuổi:** Chị Lan có thu nhập ổn định 15 triệu/tháng nhưng cuối năm vẫn không để dành được tiền. Chị muốn lập kế hoạch tiết kiệm để mua nhà nhưng không biết bắt đầu từ đâu. Chị từng thử dùng Excel để ghi chép nhưng việc nhập liệu thủ công quá mất thời gian và không duy trì được lâu.

**Tình huống điển hình 3 — Anh Hùng, chủ hộ kinh doanh nhỏ 35 tuổi:** Anh Hùng quản lý một cửa hàng nhỏ với nhiều khoản thu chi phức tạp: tiền thuê mặt bằng, nhập hàng, điện nước, lương nhân viên... Anh dùng sổ tay ghi chép nhưng thường xuyên nhầm lẫn, không phân tích được mục nào đang "ngốn" tiền nhất, và không nhận ra những chi tiêu bất thường kịp thời.

### 2.1.2. Những vấn đề cốt lõi

Qua phân tích các tình huống trên, nhóm xác định 5 vấn đề cốt lõi mà người dùng đang gặp phải:

| **STT** | **Vấn đề** | **Biểu hiện** | **Hậu quả** |
| ------- | --- | --- | --- |
| 1 | Mất nhiều thời gian nhập liệu thủ công | Ghi sổ, nhập Excel từng giao dịch | Bỏ cuộc sau vài tuần, dữ liệu không đầy đủ |
| 2 | Không nhận ra thói quen chi tiêu lãng phí | Không thấy "toàn cảnh" các khoản nhỏ lẻ | Không thể tiết kiệm dù có thu nhập ổn định |
| 3 | Thiếu cảnh báo kịp thời khi vượt ngân sách | Chỉ biết hết tiền khi đã hết | Không kịp điều chỉnh hành vi chi tiêu |
| 4 | Không có công cụ dự báo tài chính | Không biết tiền còn đủ dùng bao lâu | Lúng túng trong lập kế hoạch tương lai |
| 5 | Rào cản kỹ thuật | Phải nhớ cú pháp, danh mục, quy trình | Người không rành công nghệ không dùng được |

## 2.2. Đối tượng người dùng mục tiêu

**Persona 1 — Người dùng cơ bản (Casual User)**

- Đặc điểm: Sinh viên, người đi làm trẻ, thu nhập trung bình
- Mục tiêu: Biết mình đang tiêu tiền vào đâu, kiểm soát chi tiêu hàng ngày
- Kỳ vọng: Đơn giản, nhanh, không cần học nhiều

**Persona 2 — Người dùng lập kế hoạch (Planner)**

- Đặc điểm: Người có mục tiêu tài chính cụ thể (mua xe, mua nhà, đi du lịch)
- Mục tiêu: Theo dõi tiến độ tiết kiệm, quản lý ngân sách theo danh mục
- Kỳ vọng: Báo cáo rõ ràng, cảnh báo thông minh

**Persona 3 — Người dùng nâng cao (Power User)**

- Đặc điểm: Người kinh doanh, freelancer, quản lý nhiều ví/tài khoản
- Mục tiêu: Phân tích chuyên sâu, tích hợp nhiều nguồn tiền
- Kỳ vọng: Nhiều tài khoản, báo cáo chi tiết, tự động hóa, chatbot AI

## 2.3. User Story chi tiết

### Epic 1: Quản lý Giao dịch

| **ID** | **User Story** | **Mức độ ưu tiên** |
| --- | --- | --- |
| US-01 | Là một người dùng, tôi muốn **ghi nhận khoản chi tiêu** qua form hoặc bằng câu tiếng Việt tự nhiên như "Hôm nay ăn phở 45k" để không cần chọn danh mục thủ công | Cao |
| US-02 | Là một người dùng, tôi muốn **chụp ảnh hóa đơn** và hệ thống tự động đọc và lưu giao dịch để tiết kiệm thời gian nhập liệu | Cao |
| US-03 | Là một người dùng, tôi muốn **xem lịch sử giao dịch** theo ngày/tuần/tháng và lọc theo danh mục để kiểm tra lại chi tiêu | Cao |
| US-04 | Là một người dùng, tôi muốn **chỉnh sửa hoặc xóa giao dịch** nhập sai để đảm bảo dữ liệu chính xác | Trung bình |
| US-05 | Là một người dùng, tôi muốn **phân loại giao dịch** vào các danh mục (ăn uống, di chuyển, giải trí...) để dễ phân tích sau này | Cao |

### Epic 2: Quản lý Tài khoản/Ví

| **ID** | **User Story** | **Mức độ ưu tiên** |
| --- | --- | --- |
| US-06 | Là một người dùng, tôi muốn **tạo nhiều ví/tài khoản** (tiền mặt, Vietcombank, MoMo...) để quản lý tập trung từ một nơi | Cao |
| US-07 | Là một người dùng, tôi muốn **xem tổng số dư** của tất cả tài khoản cùng lúc để biết tình trạng tài chính tổng thể | Cao |
| US-08 | Là một người dùng, tôi muốn **cập nhật số dư ban đầu** của tài khoản khi thêm mới để đồng bộ với thực tế | Trung bình |

### Epic 3: Ngân sách

| **ID** | **User Story** | **Mức độ ưu tiên** |
| --- | --- | --- |
| US-09 | Là một người dùng, tôi muốn **đặt hạn mức chi tiêu** cho từng danh mục (ví dụ: Ăn uống tối đa 3 triệu/tháng) để kiểm soát chi tiêu | Cao |
| US-10 | Là một người dùng, tôi muốn **nhận cảnh báo** khi đã dùng 80% hoặc vượt 100% ngân sách danh mục để kịp điều chỉnh | Cao |
| US-11 | Là một người dùng, tôi muốn **xem tiến độ ngân sách** dưới dạng thanh tiến trình trực quan để dễ theo dõi | Trung bình |

### Epic 4: Phân tích & Báo cáo

| **ID** | **User Story** | **Mức độ ưu tiên** |
| --- | --- | --- |
| US-12 | Là một người dùng, tôi muốn **xem biểu đồ thu chi** theo tháng để nhận ra xu hướng tài chính của bản thân | Cao |
| US-13 | Là một người dùng, tôi muốn **biết danh mục nào tôi chi nhiều nhất** trong tháng để xem xét cắt giảm | Cao |
| US-14 | Là một người dùng, tôi muốn **hỏi chatbot bằng tiếng Việt** như "Tháng này tôi chi bao nhiêu cho cafe?" và nhận câu trả lời ngay | Cao |
| US-15 | Là một người dùng, tôi muốn **xem phân tích sức khỏe tài chính** do AI đánh giá dựa trên thói quen chi tiêu thực tế | Cao |

### Epic 5: Cảnh báo & AI

| **ID** | **User Story** | **Mức độ ưu tiên** |
| --- | --- | --- |
| US-16 | Là một người dùng, tôi muốn **nhận thông báo push** khi có giao dịch bất thường (chi số tiền lớn bất ngờ) để kịp thời phát hiện | Cao |
| US-17 | Là một người dùng, tôi muốn **nhận gợi ý tiết kiệm cá nhân hóa** từ AI dựa trên thói quen chi tiêu của mình | Trung bình |
| US-18 | Là một người dùng, tôi muốn hệ thống **tự động ghi nhận giao dịch** khi có chuyển khoản ngân hàng qua webhook | Cao |

## 2.4. Mục tiêu hệ thống

### 2.4.1. Mục tiêu chức năng

- Xây dựng ứng dụng web quản lý tài chính cá nhân đầy đủ chức năng theo kiến trúc microservices, gồm 10 service độc lập: Gateway, Auth, User, Account, Transaction, Category, Budget, Analytics, Notification, AI.
- Hỗ trợ người dùng ghi nhận, phân loại, xem lịch sử và phân tích tất cả giao dịch tài chính.
- Cung cấp giao diện web responsive, hoạt động tốt trên cả desktop lẫn mobile.
- Tự động hóa nhập liệu qua OCR hóa đơn và Bank Webhook (SePay/BankHub).

### 2.4.2. Mục tiêu AI/NLP

- **FinBot Chatbot**: Cho phép người dùng truy vấn dữ liệu tài chính và thực thi lệnh bằng tiếng Việt tự nhiên, hỗ trợ streaming response.
- **OCR Hóa đơn**: Nhận dạng và phân loại thông tin từ ảnh hóa đơn bằng Google Gemini Vision.
- **AI Deep Scan**: Phân tích sức khỏe tài chính toàn diện, trả về điểm số, triệu chứng và lời khuyên.
- **Bank Webhook AI**: Tự động phân loại giao dịch ngân hàng bằng Gemini khi nhận webhook.
- **Model Fallback**: Đảm bảo uptime AI qua cơ chế chuyển đổi tự động giữa các model Gemini.

### 2.4.3. Mục tiêu phi chức năng

- Thời gian phản hồi API < 500ms cho các truy vấn thông thường.
- Bảo mật JWT trên toàn bộ endpoint, có validation middleware.
- Hệ thống dễ mở rộng, thêm service mới không ảnh hưởng service đang chạy.
- Giao tiếp inter-service hiệu quả qua gRPC (đồng bộ) và RabbitMQ (bất đồng bộ).

## 2.5. Phạm vi hệ thống

**Trong phạm vi (In Scope):**

- Quản lý giao dịch thu/chi, tài khoản/ví, danh mục, ngân sách
- Phân tích và báo cáo tài chính (dashboard, biểu đồ, xu hướng)
- Chatbot AI FinBot hỗ trợ tiếng Việt với streaming
- OCR nhận dạng hóa đơn qua Gemini Vision
- Phát hiện bất thường chi tiêu
- AI Deep Scan phân tích sức khỏe tài chính
- Bank Webhook tự động ghi nhận giao dịch ngân hàng
- Dashboard real-time qua Socket.IO
- Web Push Notification (VAPID)
- API Gateway với JWT authentication
- Workflow automation qua n8n

**Ngoài phạm vi (Out of Scope):**

- Tích hợp trực tiếp với core banking qua Open Banking API
- Thực thi giao dịch tài chính thực (chuyển tiền, thanh toán)
- Tư vấn đầu tư chứng khoán chuyên sâu
- Ứng dụng mobile native (iOS/Android)

---

# Chương 3: Phân tích yêu cầu hệ thống

## 3.1. Yêu cầu chức năng chi tiết

### 3.1.1. Usecase tổng quan

Hệ thống Money Guard có 3 actor chính:

- **Người dùng (User)**: Tương tác trực tiếp với hệ thống qua giao diện web
- **FinBot AI**: Tác nhân AI xử lý ngôn ngữ tự nhiên, truy vấn dữ liệu và thực thi lệnh qua API nội bộ
- **Hệ thống tự động (System)**: Gồm RabbitMQ event consumers, bank webhook handler, n8n workflow

**Sơ đồ Usecase tổng thể:**

| **Actor** | **Usecase chính** |
| --- | --- |
| Người dùng | Đăng ký/Đăng nhập, Quản lý tài khoản/ví, Quản lý giao dịch, Quản lý danh mục, Quản lý ngân sách, Xem dashboard & báo cáo, Trò chuyện với FinBot, Upload hóa đơn OCR, Xem AI Deep Scan |
| FinBot AI | Phân tích câu hỏi tiếng Việt, Truy vấn analytics/transaction API, Thực thi lệnh tạo/xóa giao dịch, Streaming response |
| Hệ thống tự động | Xử lý event qua RabbitMQ (tạo/xóa/cập nhật giao dịch), Phân loại giao dịch ngân hàng qua webhook, Cập nhật analytics data, Gửi web push notification, n8n workflow automation |

## 3.2. Đặc tả Usecase chi tiết

**UC-01: Đăng ký tài khoản**

| **Thuộc tính** | **Nội dung** |
| --- | --- |
| Actor | Người dùng chưa có tài khoản |
| Mô tả | Người dùng tạo tài khoản mới để sử dụng hệ thống |
| Luồng chính | 1. Người dùng nhập email, mật khẩu, họ tên → 2. Hệ thống validate dữ liệu → 3. Auth Service (.NET) tạo tài khoản trong PostgreSQL schema `auth_service` → 4. Publish event qua RabbitMQ → User Service tạo profile → 5. Trả về JWT token → 6. Redirect vào dashboard |
| Luồng ngoại lệ | Email đã tồn tại → thông báo lỗi; Mật khẩu không đủ mạnh → yêu cầu nhập lại |
| Kết quả | Tài khoản được tạo, profile đồng bộ qua RabbitMQ, người dùng đăng nhập thành công |

**UC-02: Ghi nhận giao dịch**

| **Thuộc tính** | **Nội dung** |
| --- | --- |
| Actor | Người dùng đã đăng nhập |
| Mô tả | Người dùng thêm một khoản thu hoặc chi vào hệ thống |
| Điều kiện tiên quyết | Đã có ít nhất 1 tài khoản/ví |
| Luồng chính (thủ công) | 1. Chọn loại giao dịch (thu/chi) → 2. Nhập số tiền → 3. Chọn danh mục → 4. Chọn tài khoản → 5. Nhập mô tả (tùy chọn) → 6. Transaction Service (.NET) lưu vào PostgreSQL → 7. Publish event RabbitMQ → Account Service cập nhật balance, Analytics Service cập nhật thống kê |
| Luồng thay thế (NLP) | 1. Nhập câu tiếng Việt tự nhiên vào FinBot → 2. Gemini phân tích intent và trích xuất thông tin → 3. AI Service gọi API tạo giao dịch → 4. Xác nhận và lưu |
| Luồng thay thế (OCR) | 1. Upload ảnh hóa đơn qua FinBot → 2. Gemini Vision trích xuất items và giá → 3. Tạo batch transactions → 4. Người dùng xác nhận |
| Luồng thay thế (Webhook) | 1. Ngân hàng gửi webhook qua SePay/BankHub → 2. AI Service nhận và phân loại bằng Gemini → 3. Tự động tạo transaction trong PostgreSQL → 4. Push notification qua Socket.IO và Web Push |
| Kết quả | Giao dịch được lưu, số dư tài khoản cập nhật qua RabbitMQ event |

**UC-03: Quản lý Ngân sách**

| **Thuộc tính** | **Nội dung** |
| --- | --- |
| Actor | Người dùng |
| Mô tả | Đặt hạn mức chi tiêu theo danh mục và theo dõi tiến độ |
| Luồng chính | 1. Chọn danh mục → 2. Nhập hạn mức (VD: 3.000.000đ) → 3. Chọn chu kỳ → 4. Budget Service lưu vào PostgreSQL qua Prisma ORM |
| Hành vi hệ thống | Analytics Service tự động tính % đã dùng dựa trên dữ liệu MongoDB |
| Cảnh báo | Khi đạt 80%: gửi notification trong app; Khi vượt 100%: gửi web push notification |
| Kết quả | Người dùng kiểm soát được chi tiêu theo kế hoạch |

**UC-04: Trò chuyện với FinBot**

| **Thuộc tính** | **Nội dung** |
| --- | --- |
| Actor | Người dùng, FinBot AI |
| Mô tả | Người dùng truy vấn dữ liệu tài chính bằng ngôn ngữ tự nhiên tiếng Việt |
| Ví dụ câu hỏi | "Tháng này tôi chi bao nhiêu?", "Top 3 danh mục chi tiêu nhiều nhất?", "Xóa giao dịch Grab hôm qua" |
| Pipeline xử lý | Câu hỏi → AI Service lấy context từ PostgreSQL (categories, budgets, stats) → Gemini reasoning với system instructions (MONEY_GUARD_RULES) → Response synthesis → Streaming SSE hoặc standard response |
| Lưu trữ | Lịch sử chat được lưu trong bảng `message_history` (PostgreSQL schema `ai_service`) |
| Hỗ trợ hình ảnh | Người dùng có thể gửi ảnh hóa đơn kèm câu hỏi (multipart upload qua multer) |
| Fallback | Tự động chuyển model khi gặp lỗi rate limit hoặc overload |

**UC-05: Phát hiện bất thường & AI Deep Scan**

| **Thuộc tính** | **Nội dung** |
| --- | --- |
| Actor | Hệ thống tự động / Người dùng |
| Trigger | Tự động khi có giao dịch mới (anomaly) hoặc người dùng yêu cầu (deep scan) |
| Anomaly Detection | Analytics Service so sánh giao dịch mới với mức trung bình, lưu anomaly log vào MongoDB |
| AI Deep Scan | AI Service lấy dữ liệu chi tiêu tháng hiện tại, gửi cho Gemini phân tích, trả về JSON `{ score, disease, symptoms, advice, future }` |
| Kết quả | Anomaly log được tạo trong MongoDB; Deep Scan trả về đánh giá sức khỏe tài chính |

## 3.3. Bảng đối sánh yêu cầu tối thiểu

| **STT** | **Yêu cầu bắt buộc** | **Service thực hiện** | **Mô tả triển khai** | **Hoàn thành** | **Minh chứng** |
| --- | --- | --- | --- | --- | --- |
| 1 | Quản lý thu chi cá nhân | Transaction Service (.NET), Analytics Service | CRUD đầy đủ: nhập, chỉnh sửa, xóa các khoản thu - chi. Hỗ trợ nhập qua NLP, OCR và Bank Webhook. Lọc, phân trang, tìm kiếm. | Có | Chương 6.4, Giao diện Transaction |
| 2 | Phân loại giao dịch theo danh mục | Category Service (Node.js + Prisma) | Phân loại thủ công hoặc tự động AI. Hỗ trợ danh mục mặc định và tùy chỉnh với icon, color. gRPC endpoint cho inter-service query. | Có | API /api/categories |
| 3 | Thống kê trực quan | Analytics Service (Node.js + MongoDB) | Dashboard real-time qua Socket.IO, biểu đồ doughnut, xu hướng theo ngày/tháng/năm, top danh mục, top giao dịch. Dashboard cache MongoDB. | Có | Chương 6.7, API /api/analytics |
| 4 | Tính toán số dư | Analytics Service, Account Service | Số dư real-time qua Account Service (total-balance API), báo cáo monthly, spending trends, category summary trong MongoDB. | Có | API /api/accounts/total-balance, /api/analytics |
| 5 | Hệ thống xác thực người dùng | Auth Service (.NET 8 + Identity) | Đăng ký, đăng nhập, JWT authentication. ASP.NET Core Identity với PostgreSQL. Gateway middleware verify JWT trên toàn bộ endpoint. | Có | API /api/auth |
| 6 | Tích hợp AI/NLP | AI Service (Node.js + Gemini SDK) | FinBot chatbot tiếng Việt (chat + chat-stream), OCR hóa đơn, AI Deep Scan, Bank Webhook AI classification, model fallback. | Có | Chương 7 |
| 7 | Quản lý ngân sách theo danh mục | Budget Service (Node.js + Prisma) | Tạo, cập nhật, xóa ngân sách; gRPC endpoint; event-driven cập nhật qua RabbitMQ. | Có | API /api/budgets |
| 8 | Phân tích & báo cáo chi tiêu | Analytics Service (Node.js + MongoDB) | Monthly reports, spending trends, category summary, dashboard cache, anomaly logs. Hỗ trợ truy vấn NLP qua FinBot. | Có | API /api/analytics |
| 9 | Quản lý nhiều tài khoản/ví | Account Service (Node.js + Prisma + gRPC) | Tạo/cập nhật/xóa tài khoản; hỗ trợ nhiều loại: tiền mặt, ngân hàng, ví điện tử; xem tổng số dư; RabbitMQ consumer cập nhật balance. | Có | API /api/accounts |

## 3.4. Yêu cầu phi chức năng

| **Tiêu chí** | **Yêu cầu** | **Cách thực hiện** |
| --- | --- | --- |
| **Hiệu năng** | API response < 500ms cho truy vấn thông thường | Redis cache; dashboard_cache MongoDB; gRPC cho inter-service call; tối ưu query PostgreSQL qua Prisma/EF Core |
| **Bảo mật** | JWT authentication trên toàn bộ endpoint | Auth Service .NET 8 Identity, Gateway JWT middleware, CORS, validation middleware |
| **Khả dụng** | Uptime > 99% | Microservices độc lập; model fallback Gemini; Docker health check; RabbitMQ message durability |
| **Khả năng mở rộng** | Dễ thêm service mới | API Gateway proxy theo prefix; Docker Compose scale từng service; gRPC cho high-throughput inter-service |
| **Khả năng sử dụng** | Hoạt động trên mobile, tablet, desktop | React 19 responsive với Tailwind CSS; Radix UI accessible components |
| **Real-time** | Cập nhật tức thì khi có giao dịch mới | Socket.IO cho dashboard; Web Push (VAPID) cho notification |
| **Tự động hóa** | Báo cáo và cảnh báo tự động 24/7 | n8n Workflow automation; RabbitMQ event-driven processing |
| **Độ chính xác AI** | OCR > 80%; Chatbot hiểu đúng intent tiếng Việt | Google Gemini Vision + Gemini Flash/Pro; context-aware prompting |

## 3.5. Ràng buộc thiết kế

- **Ngôn ngữ hỗ trợ**: Tiếng Việt là ngôn ngữ chính cho toàn bộ giao diện và AI/NLP.
- **Kiến trúc bắt buộc**: Microservices với API Gateway duy nhất làm điểm vào.
- **Database**: PostgreSQL (Supabase) với schema riêng cho từng service (giao dịch, tài khoản, ngân sách); MongoDB cho analytics và log.
- **Inter-service communication**: gRPC cho query đồng bộ (Account, Category, Budget, User); RabbitMQ cho event bất đồng bộ.
- **AI Model**: Google Gemini (Flash/Pro) vì hỗ trợ tiếng Việt tốt và có free tier.
- **Triển khai**: Docker + Docker Compose để đảm bảo môi trường đồng nhất.

---

# Chương 4: Thiết kế hệ thống

## 4.1. Kiến trúc tổng thể

Hệ thống được xây dựng theo kiến trúc **Microservices đa ngôn ngữ** với API Gateway làm điểm vào duy nhất. Mỗi service hoạt động độc lập với database schema riêng biệt, giao tiếp qua ba kênh: **HTTP REST API** (client-facing), **gRPC** (inter-service đồng bộ) và **RabbitMQ** (event-driven bất đồng bộ).

**Sơ đồ kiến trúc tổng thể:**

```
Frontend (React 19 / Vite / TypeScript)
          │
          ▼
   API Gateway (Express.js)  ── JWT Middleware
          │
    ┌─────┼─────┬─────┬──────┬──────┬──────┬──────┬──────┐
    ▼     ▼     ▼     ▼      ▼      ▼      ▼      ▼      ▼
  Auth  User  Account Trans Category Budget Analytics Notif  AI
 (.NET) (Node) (Node) (.NET) (Node)  (Node) (Node)   (Node) (Node)
    │     │     │      │      │       │      │        │      │
    └─────┴─────┴──────┴──────┴───────┴──────┴────────┘      │
          │                                                   │
    ┌─────┼──────────┐                              ┌────────┘
    ▼     ▼          ▼                              ▼
PostgreSQL RabbitMQ  Redis                    Google Gemini
(Supabase) (Events)  (Cache)                  (AI/NLP)
                                                    │
              MongoDB ◄─────── Analytics ───────────┘
              (analytics_db)
```

**Chi tiết từng service:**

| **Service** | **Runtime** | **ORM/DB Client** | **Vai trò** |
| --- | --- | --- | --- |
| Gateway | Node.js (Express 5) | — | Reverse proxy, JWT verify, CORS |
| Auth Service | .NET 8 (ASP.NET Core) | Entity Framework Core + Identity | Đăng ký, đăng nhập, JWT |
| User Service | Node.js (Express) | Prisma | Quản lý profile người dùng |
| Account Service | Node.js (Express + gRPC) | Prisma | Quản lý tài khoản/ví, RabbitMQ consumer |
| Transaction Service | .NET 8 (ASP.NET Core + gRPC client) | Entity Framework Core | CRUD giao dịch, background worker |
| Category Service | Node.js (Express + gRPC) | Prisma | Quản lý danh mục |
| Budget Service | Node.js (Express + gRPC) | Prisma | Quản lý ngân sách |
| Analytics Service | Node.js (Express) | Mongoose (MongoDB) | Phân tích, báo cáo, event consumer |
| Notification Service | Node.js (Express) | — | RabbitMQ worker, xử lý thông báo |
| AI Service | Node.js (ESM) | pg (raw SQL) | Chatbot, OCR, Deep Scan, Bank Webhook, Socket.IO |

## 4.2. Giao tiếp giữa các service

### 4.2.1. gRPC (Đồng bộ - Inter-service Query)

Các service Node.js expose gRPC server để cho phép query dữ liệu nhanh giữa các service:

| **Service** | **gRPC Port** | **Proto file** |
| --- | --- | --- |
| Account Service | 50051 | `backend/shared/protos/account.proto` |
| Category Service | 50052 | `backend/shared/protos/category.proto` |
| Budget Service | 50053 | `backend/shared/protos/budget.proto` |
| User Service | 50054 | `backend/shared/protos/user.proto` |

Transaction Service (.NET) sử dụng gRPC client để query Account/Category khi cần validate giao dịch.

### 4.2.2. RabbitMQ (Bất đồng bộ - Event-Driven)

Các service publish/consume event qua RabbitMQ để đồng bộ dữ liệu mà không tạo coupling trực tiếp:

- **Auth Service** → publish `user.registered` → **User Service** tạo profile
- **Transaction Service** → publish `transaction.created/updated/deleted` → **Account Service** cập nhật balance, **Analytics Service** cập nhật thống kê
- **Budget Service** → publish `budget.updated` → **Analytics Service** cập nhật category summary
- **Notification Service** → consume event → xử lý gửi thông báo

### 4.2.3. Socket.IO (Real-time Client)

AI Service khởi tạo Socket.IO server để push thông báo tức thì tới frontend:

- Event `bank_notification`: thông báo khi có giao dịch ngân hàng mới từ webhook
- Kết hợp Web Push (VAPID) để gửi notification khi browser ở background

## 4.3. Thiết kế cơ sở dữ liệu

### 4.3.1. PostgreSQL (Supabase — multi-schema)

Mỗi service sử dụng schema riêng trên cùng một PostgreSQL cluster (Supabase), đảm bảo tách biệt dữ liệu:

**Schema `auth_service`** (EF Core + ASP.NET Identity):
- ASP.NET Identity tables (AspNetUsers, AspNetRoles, AspNetUserClaims...)
- `ApplicationUser`: mở rộng với `Status`, `CreatedAt`

**Schema `user_service`** (Prisma):
- `users`: id, email, full_name, phone, avatar_url, created_at, updated_at

**Schema `account_service`** (Prisma):
- `accounts`: id, user_id, account_name, account_type (enum: CASH, BANK, E_WALLET, CREDIT_CARD, OTHER), balance, currency, is_default, created_at, updated_at

**Schema `transaction_service`** (EF Core):
- `transactions`: trans_id, user_id, account_id, category_id, amount, transaction_type (income/expense), description, date, note, created_at, updated_at

**Schema `category_service`** (Prisma):
- `categories`: id, user_id, name, type, icon, color, is_default, created_at, updated_at
- `icons`: id, name, unicode, category

**Schema `budget_service`** (Prisma):
- `budgets`: id, user_id, category_id, limit_amount, spent_amount, period, start_date, end_date, status (enum: ACTIVE, INACTIVE, COMPLETED), created_at, updated_at

**Schema `ai_service`** (raw SQL qua pg):
- `message_history`: lưu lịch sử chat FinBot
- Cross-schema read: truy vấn `transactions`, `accounts`, `categories`, `budgets` từ các schema khác

### 4.3.2. MongoDB (Analytics Service)

Analytics Service sử dụng MongoDB database `analytics_db` để lưu trữ dữ liệu phân tích với cấu trúc linh hoạt:

| **Collection** | **Mô tả** |
| --- | --- |
| `user_analytics` | Tổng hợp thu/chi, số dư tích lũy theo user |
| `transactions` | Bản sao denormalized từ Transaction Service (event-driven qua RabbitMQ) |
| `category_summary` | Tổng hợp chi tiêu theo danh mục và tháng |
| `monthly_reports` | Báo cáo tháng tự động |
| `spending_trends` | Xu hướng chi tiêu theo thời gian |
| `dashboard_cache` | Cache dữ liệu dashboard real-time |
| `anomaly_logs` | Log các giao dịch bất thường |

## 4.4. Thiết kế API Gateway

API Gateway (`Express.js` + `http-proxy-middleware`) định tuyến request theo prefix, kết hợp JWT authentication middleware:

| **Prefix** | **Service** | **Xác thực** | **Ghi chú** |
| --- | --- | --- | --- |
| `/api/auth` | Auth Service (.NET) | Partial (public: login, register, health, forgot/reset-password) | Middleware cho phép một số route public |
| `/api/users` | User Service | JWT required | |
| `/api/accounts` | Account Service | JWT required | |
| `/api/transactions` | Transaction Service (.NET) | JWT required | Inject header `X-User-Id` từ JWT payload |
| `/api/categories` | Category Service | JWT required | |
| `/api/budgets` | Budget Service | JWT required | |
| `/api/analytics` | Analytics Service | JWT required | |
| `/api/notifications` | Notification Service | JWT required | |
| `/api/ai` | AI Service | No gateway JWT | `pathRewrite`: strip `/api/ai` prefix |
| `/api/health` | Gateway | None | `{ status: "ok" }` |

## 4.5. Thiết kế giao diện và luồng người dùng

Giao diện người dùng được xây dựng bằng **React 19** + **TypeScript** + **Vite** + **Tailwind CSS**, sử dụng **Radix UI** (shadcn-style) cho components:

**Routing (react-router-dom v7):**

| **Layout** | **Route** | **Page** | **Mô tả** |
| --- | --- | --- | --- |
| AuthLayout | `/` | Login | Đăng nhập |
| AuthLayout | `/register` | Register | Đăng ký |
| AuthLayout | `/forgot-password` | ForgotPassword | Quên mật khẩu |
| AuthLayout | `/reset-password` | ResetPassword | Đặt lại mật khẩu |
| MainLayout | `/dashboard` | Dashboard | Tổng quan thu chi, biểu đồ, giao dịch gần đây |
| MainLayout | `/accounts` | Accounts | Quản lý tài khoản/ví |
| MainLayout | `/transactions` | Transactions | Danh sách giao dịch, lọc, phân trang |
| MainLayout | `/transactions/:id` | TransactionDetail | Chi tiết giao dịch |
| MainLayout | `/budgets` | Budgets | Quản lý ngân sách |
| MainLayout | `/statistics` | Statistics | Biểu đồ phân tích, xu hướng |
| MainLayout | `/chatbox` | ChatBox | Giao diện chat với FinBot AI |
| — | `*` | NotFound | Trang 404 |

---

# Chương 5: Công nghệ sử dụng

| **Thành phần** | **Công nghệ** | **Lý do chọn** |
| --- | --- | --- |
| Frontend | React 19, Vite 7, TypeScript, Tailwind CSS 4 | Hiệu năng cao, type-safe, build nhanh, utility-first CSS |
| UI Components | Radix UI (shadcn-style), Recharts | Accessible, composable, biểu đồ đẹp |
| Form & Validation | react-hook-form, Zod | Type-safe validation, performance tốt |
| Backend (Node.js) | Express.js (v4/v5), Node.js v18+ | Nhẹ, phù hợp microservices I/O-heavy |
| Backend (.NET) | .NET 8, ASP.NET Core Web API | Bảo mật mạnh, hỗ trợ JWT/Identity, performance cao |
| ORM (Node.js) | Prisma | Type-safe, auto-generated client, migration dễ dàng |
| ORM (.NET) | Entity Framework Core | LINQ, migration, tích hợp Identity |
| Database SQL | PostgreSQL (Supabase) | ACID, multi-schema, phù hợp giao dịch tài chính |
| Database NoSQL | MongoDB 7 | Linh hoạt schema, phù hợp analytics & aggregation |
| Cache | Redis 7 | Dashboard cache, session, giảm tải DB |
| Message Broker | RabbitMQ 3 (Management) | Event-driven, message durability, routing linh hoạt |
| Inter-service RPC | gRPC (`@grpc/grpc-js`, protobuf) | High-throughput, strongly-typed, binary protocol |
| AI/NLP | Google Gemini SDK (`@google/generative-ai`) | Hỗ trợ tiếng Việt, multimodal (text + image), streaming |
| API Gateway | Express + http-proxy-middleware | Đơn giản, dễ cấu hình, hỗ trợ CORS, path rewrite |
| Real-time | Socket.IO | Cập nhật dashboard tức thì, bank notification |
| Push Notification | Web Push (VAPID) | Thông báo khi browser ở background |
| Automation | n8n Workflow | Tự động hóa báo cáo, cảnh báo, tích hợp bên ngoài |
| File Upload | Multer | Xử lý multipart form data (ảnh hóa đơn) |
| HTTP Client | Axios (frontend), got/axios (backend) | Promise-based, interceptor support |
| DevOps | Docker, Docker Compose | Triển khai đồng nhất, 15 containers, shared network |

---

# Chương 6: Mô tả các Module và API chính

## 6.1. Auth Service - Xác thực

**Runtime:** .NET 8 (ASP.NET Core) + Entity Framework Core + ASP.NET Identity

**PostgreSQL schema:** `auth_service`

| **STT** | **Method** | **Endpoint** | **Mô tả** |
| --- | --- | --- | --- |
| 1 | GET | /health | Health check |
| 2 | POST | /register | Đăng ký tài khoản mới (publish event RabbitMQ) |
| 3 | POST | /login | Đăng nhập, trả về JWT token |
| 4 | POST | /test-publish | Test RabbitMQ publishing |

## 6.2. User Service - Quản lý người dùng

**Runtime:** Node.js (Express) + Prisma + gRPC server (port 50054)

**PostgreSQL schema:** `user_service`

| **STT** | **Method** | **Endpoint** | **Mô tả** |
| --- | --- | --- | --- |
| 1 | GET | /profile | Lấy thông tin hồ sơ người dùng |
| 2 | PUT | /profile | Cập nhật thông tin hồ sơ |

RabbitMQ consumer: nhận event `user.registered` từ Auth Service để tạo profile tự động.

## 6.3. Account Service - Tài khoản/Ví

**Runtime:** Node.js (Express) + Prisma + gRPC server (port 50051) + RabbitMQ consumer

**PostgreSQL schema:** `account_service`

| **STT** | **Method** | **Endpoint** | **Mô tả** |
| --- | --- | --- | --- |
| 1 | POST | / | Tạo tài khoản mới |
| 2 | GET | / | Lấy danh sách tài khoản của user |
| 3 | GET | /total-balance | Lấy tổng số dư tất cả tài khoản |
| 4 | PUT | / | Cập nhật tài khoản |
| 5 | DELETE | / | Xóa tài khoản |

gRPC: cung cấp endpoint cho Transaction Service query thông tin account.
RabbitMQ consumer: cập nhật balance khi có event giao dịch mới.

## 6.4. Transaction Service - Giao dịch

**Runtime:** .NET 8 (ASP.NET Core) + Entity Framework Core + gRPC client + Background Worker

**PostgreSQL schema:** `transaction_service`

| **STT** | **Method** | **Endpoint** | **Mô tả** |
| --- | --- | --- | --- |
| 1 | GET | /health | Health check |
| 2 | GET | / | Lấy danh sách giao dịch (filters + pagination) |
| 3 | GET | /{id} | Lấy chi tiết giao dịch theo ID |
| 4 | POST | / | Tạo giao dịch mới |
| 5 | PUT | /{id} | Cập nhật giao dịch |
| 6 | DELETE | /{id} | Xóa giao dịch |

Gateway inject header `X-User-Id` từ JWT payload cho mọi request tới Transaction Service.
gRPC client: gọi Account Service và Category Service để validate dữ liệu.
Background Worker: xử lý tác vụ nền (publish event RabbitMQ).

## 6.5. Category Service - Danh mục

**Runtime:** Node.js (Express) + Prisma + gRPC server (port 50052)

**PostgreSQL schema:** `category_service`

| **STT** | **Method** | **Endpoint** | **Mô tả** |
| --- | --- | --- | --- |
| 1 | GET | /categories | Lấy danh sách danh mục, filter theo type |
| 2 | POST | /category | Tạo danh mục mới |
| 3 | PUT | /category/:id | Cập nhật danh mục |
| 4 | DELETE | /category/:id | Xóa danh mục |

gRPC: cung cấp endpoint cho Transaction Service và AI Service query danh mục.

## 6.6. Budget Service - Ngân sách

**Runtime:** Node.js (Express) + Prisma + gRPC server (port 50053)

**PostgreSQL schema:** `budget_service`

| **STT** | **Method** | **Endpoint** | **Mô tả** |
| --- | --- | --- | --- |
| 1 | GET | / | Lấy danh sách ngân sách của user |
| 2 | GET | /:id | Lấy chi tiết ngân sách theo ID |
| 3 | POST | / | Tạo ngân sách mới |
| 4 | PUT | /:id | Cập nhật ngân sách |
| 5 | DELETE | /:id | Xóa ngân sách |

gRPC: cung cấp endpoint cho AI Service query thông tin budget.

## 6.7. Analytics Service - Phân tích dữ liệu

**Runtime:** Node.js (Express) + Mongoose (MongoDB)

**Database:** MongoDB `analytics_db`

Analytics Service cung cấp toàn bộ dữ liệu phân tích tài chính, tổ chức theo các nhóm API:

| **Nhóm API** | **Endpoints chính** | **Mô tả** |
| --- | --- | --- |
| User Analytics | GET/PUT `/user_analytics/:userId` | Tổng hợp thu/chi, số dư tích lũy theo user |
| Anomaly Logs | GET/POST/PUT/DELETE `/anomaly_logs/:userId` | Phát hiện và quản lý giao dịch bất thường |
| Category Summary | GET `/category_summary/:userId/by_month`, `/over_budget` | Tổng hợp chi tiêu theo danh mục |
| Dashboard Cache | GET/PUT `/dashboard_cache/:userId` | Cache dashboard data real-time |
| Monthly Reports | GET `/monthly_reports/:userId/by_month`, `/recent` | Báo cáo tháng tự động |
| Spending Trends | GET `/spending_trends/:userId/category/:categoryId` | Xu hướng chi tiêu theo thời gian |
| Transactions | GET `/transactions/:userId/date_range`, `/category/:categoryId` | Query giao dịch nâng cao (mirror data) |

RabbitMQ consumer: nhận event từ Transaction Service để cập nhật analytics data tự động.

## 6.8. AI Service - Trí tuệ nhân tạo

**Runtime:** Node.js (ESM) + Google Gemini SDK + pg (raw SQL) + Socket.IO + Multer

| **STT** | **Method** | **Endpoint** | **Mô tả** |
| --- | --- | --- | --- |
| 1 | POST | /chat | Chat với FinBot (multipart, hỗ trợ ảnh) |
| 2 | POST | /chat-stream | Chat streaming (SSE response) |
| 3 | GET | /chat-history | Lấy lịch sử chat |
| 4 | GET | /api/stats | Lấy thống kê tài chính tháng hiện tại |
| 5 | GET | /api/budgets | Lấy danh sách ngân sách |
| 6 | GET | /api/recent-transactions | Lấy giao dịch gần đây |
| 7 | GET | /api/ai-deep-scan | AI phân tích sức khỏe tài chính toàn diện |
| 8 | GET | /api/ai-health | Health check AI Service |
| 9 | POST | /subscribe | Đăng ký Web Push notification (VAPID) |
| 10 | GET/POST/PUT/DELETE | /api/notifications/* | Quản lý notifications |
| 11 | GET | /api/create-bank | Tạo bank QR code |
| 12 | POST | /webhook/bank-transfer | Nhận webhook giao dịch ngân hàng |

Socket.IO events: `bank_notification` — push thông báo giao dịch ngân hàng real-time.

## 6.9. Notification Service - Thông báo

**Runtime:** Node.js (Express) + RabbitMQ worker

| **STT** | **Method** | **Endpoint** | **Mô tả** |
| --- | --- | --- | --- |
| 1 | GET | /health | Health check |

RabbitMQ worker: consume event từ các service khác để xử lý logic gửi thông báo.

---

# Chương 7: Mô tả chi tiết phần AI/NLP tích hợp

## 7.1. FinBot - Chatbot Trợ lý Tài chính

| **Tiêu chí** | **Mô tả** |
| --- | --- |
| Mục tiêu | Cho phép người dùng truy vấn dữ liệu tài chính và điều khiển hệ thống bằng ngôn ngữ tự nhiên tiếng Việt |
| Đầu vào | Câu hỏi/lệnh tiếng Việt tự do + ảnh hóa đơn tùy chọn (multipart upload qua Multer) |
| Đầu ra | Câu trả lời tự nhiên (standard hoặc streaming SSE) |
| Mô hình/API | Google Gemini SDK (`@google/generative-ai`) với model selection và retry logic |
| System Instructions | `MONEY_GUARD_RULES` — bộ quy tắc hướng dẫn Gemini đóng vai trợ lý tài chính tiếng Việt |
| Context Assembly | AI Service query PostgreSQL trực tiếp (cross-schema) để lấy: categories, budgets, transaction stats tháng hiện tại → inject vào prompt |
| Chat History | Lưu trong bảng `message_history` (PostgreSQL schema `ai_service`) |
| Hai chế độ | `POST /chat` — response đầy đủ; `POST /chat-stream` — streaming SSE từng chunk |
| Ví dụ minh họa | Input: "Tháng này tôi chi bao nhiêu tiền ăn uống?" → AI query thống kê → Trả lời: "Bạn đã chi 2.5 triệu đồng cho Ăn uống trong tháng này" |
| Hạn chế | Phụ thuộc quota API Google; ngữ cảnh dài có thể giảm độ chính xác |

## 7.2. OCR Hóa đơn - Nhận dạng và phân loại tự động

| **Tiêu chí** | **Mô tả** |
| --- | --- |
| Mục tiêu | Tự động nhận dạng hóa đơn từ ảnh chụp, phân tích từng item |
| Đầu vào | Ảnh hóa đơn (JPEG/PNG) gửi kèm tin nhắn chat (multipart upload qua Multer) |
| Đầu ra | Danh sách items (tên món, đơn giá), gán danh mục tự động |
| Mô hình | Google Gemini Vision (multimodal — text + image trong cùng request) |
| Pipeline | Ảnh upload → Multer lưu tạm → Gemini Vision phân tích ảnh + text prompt → Parse kết quả → Trả về cho user |
| Ví dụ | Input: Ảnh hóa đơn nhà hàng → Output: `[{"name":"Phở bò","price":65000,"category":"Ăn uống"},{"name":"Nước cam","price":35000,"category":"Ăn uống"}]` |
| Hạn chế | Độ chính xác phụ thuộc chất lượng ảnh; hóa đơn viết tay độ chính xác thấp hơn |

## 7.3. Phát hiện bất thường chi tiêu (Anomaly Detection)

| **Tiêu chí** | **Mô tả** |
| --- | --- |
| Mục tiêu | Tự động phát hiện giao dịch bất thường và ghi log |
| Đầu vào | Giao dịch mới (event từ RabbitMQ) + lịch sử chi tiêu |
| Đầu ra | Anomaly log trong MongoDB collection `anomaly_logs` |
| Cách tiếp cận | Rule-based: so sánh giao dịch mới với mức trung bình của danh mục đó → flag nếu bất thường |
| Pipeline | Transaction event (RabbitMQ) → Analytics Service consumer → So sánh với average → Nếu bất thường → Tạo anomaly_log (MongoDB) |
| Ví dụ | Giao dịch 30 triệu trong danh mục "Mua sắm" avg 2 triệu → Tạo anomaly log |

## 7.4. AI Deep Scan - Phân tích sức khỏe tài chính

| **Tiêu chí** | **Mô tả** |
| --- | --- |
| Mục tiêu | Phân tích toàn diện sức khỏe tài chính của người dùng trong tháng |
| Đầu vào | Dữ liệu chi tiêu tháng hiện tại từ PostgreSQL (cross-schema query) |
| Đầu ra | JSON có cấu trúc: `{ score, disease, symptoms, advice, future }` |
| Mô hình | Google Gemini — prompt yêu cầu phân tích và trả JSON |
| Endpoint | `GET /api/ai-deep-scan` |
| Ví dụ output | `{ "score": 65, "disease": "Chi tiêu mất cân bằng", "symptoms": ["Chi ăn uống chiếm 45% tổng chi", "Không có khoản tiết kiệm"], "advice": ["Giảm 20% chi ăn ngoài", "Thiết lập ngân sách tự động"], "future": "Nếu duy trì, bạn sẽ hết tiền trong 15 ngày" }` |

## 7.5. Bank Webhook AI Classification

| **Tiêu chí** | **Mô tả** |
| --- | --- |
| Mục tiêu | Tự động ghi nhận và phân loại giao dịch ngân hàng khi nhận webhook |
| Đầu vào | Webhook POST từ SePay/BankHub chứa thông tin giao dịch ngân hàng |
| Xử lý AI | Gemini phân loại nội dung giao dịch (mô tả chuyển khoản) → xác định danh mục phù hợp |
| Hành động | INSERT giao dịch vào PostgreSQL (`transaction_service.transactions`) + Push thông báo qua Socket.IO (`bank_notification`) và Web Push |
| Endpoint | `POST /webhook/bank-transfer` |

## 7.6. Model Fallback - Đa não bộ AI

Hệ thống triển khai cơ chế fallback tự động giữa các mô hình AI thông qua module `super_check.js`:

- **Gemini Flash** (primary): nhanh, chi phí thấp, phù hợp query đơn giản
- **Gemini Pro** (fallback): khi Flash bị rate limit hoặc overload, chuyển sang Pro

Chuyển đổi tự động khi nhận lỗi 429 (Too Many Requests), timeout hoặc overload error.

---

# Chương 8: Cài đặt và triển khai

## 8.1. Môi trường triển khai

- **Docker + Docker Compose**: 15 containers (10 services + 4 infrastructure + 1 frontend) chạy trên shared network `finance-network`
- **Infrastructure containers**: MongoDB 7, Redis 7 Alpine, RabbitMQ 3 Management, n8n
- **Environment variables**: File `.env` duy nhất tại root, mount vào tất cả services
- **Named volumes**: `mongodb-data`, `redis-data`, `rabbitmq-data`, `n8n-data`

## 8.2. Docker Compose Services

| **Container** | **Image / Build** | **Port** | **Depends On** |
| --- | --- | --- | --- |
| finance-n8n | n8nio/n8n:latest | ${N8N_PORT}:5678 | — |
| finance-mongodb | mongo:7 | ${MONGODB_PORT}:27017 | — |
| finance-redis | redis:7-alpine | ${REDIS_PORT}:6379 | — |
| finance-rabbitmq | rabbitmq:3-management-alpine | ${RABBITMQ_PORT}:5672, ${RABBITMQ_MANAGEMENT_PORT}:15672 | — |
| finance-auth-service | Dockerfile (.NET) | ${AUTH_SERVICE_PORT}:3006 | rabbitmq, redis |
| finance-user-service | Dockerfile (Node.js) | ${USER_SERVICE_PORT}:3001, ${GRPC_USER_SERVICE_PORT}:50054 | redis, rabbitmq |
| finance-account-service | Dockerfile (Node.js) | ${ACCOUNT_SERVICE_PORT}:3002, ${GRPC_ACCOUNT_SERVICE_PORT}:50051 | redis, rabbitmq |
| finance-transaction-service | Dockerfile (.NET) | ${TRANSACTION_SERVICE_PORT}:3007 | redis, rabbitmq |
| finance-category-service | Dockerfile (Node.js) | ${CATEGORY_SERVICE_PORT}:3003, ${GRPC_CATEGORY_SERVICE_PORT}:50052 | redis, rabbitmq |
| finance-analytics-service | Dockerfile (Node.js) | ${ANALYTICS_SERVICE_PORT}:3004 | mongodb, redis, rabbitmq |
| finance-notification-service | Dockerfile (Node.js) | ${NOTIFICATION_SERVICE_PORT}:3005 | redis, rabbitmq |
| finance-budget-service | Dockerfile (Node.js) | ${BUDGET_SERVICE_PORT}:3008, ${GRPC_BUDGET_SERVICE_PORT}:50053 | redis, rabbitmq |
| finance-ai-service | Dockerfile (Node.js ESM) | ${AI_PORT}:4005 | — |
| finance-gateway | Dockerfile (Node.js) | ${GATEWAY_PORT}:3000 | auth, user, account, transaction, category, analytics, notification, budget |
| frontend | Dockerfile (Vite) | ${FRONTEND_PORT}:5173 | — |

## 8.3. Hướng dẫn chạy hệ thống

1. Clone repository: `git clone <repo-url>`
2. Tạo file `.env` tại root theo mẫu `.env.example`
3. Chạy toàn bộ hệ thống: `docker-compose up -d`
4. Truy cập Frontend: `http://localhost:<FRONTEND_PORT>`
5. API Gateway: `http://localhost:<GATEWAY_PORT>`
6. RabbitMQ Management: `http://localhost:<RABBITMQ_MANAGEMENT_PORT>` (admin/admin)
7. Health check: `GET http://localhost:<GATEWAY_PORT>/api/health`

## 8.4. Yêu cầu hệ thống

- Docker Engine >= 24.0
- Docker Compose >= 2.0
- RAM tối thiểu: 8GB (khuyến nghị 16GB cho toàn bộ 15 containers)
- Node.js >= 18 (nếu chạy local không dùng Docker)
- .NET 8 SDK (nếu chạy Auth/Transaction service local)

---

# Chương 9: Kết quả thực nghiệm và kiểm thử

## 9.1. Bảng test case chức năng

| **STT** | **Chức năng** | **Test case** | **Kết quả mong đợi** | **Kết quả thực tế** | **Đạt** |
| --- | --- | --- | --- | --- | --- |
| 1 | Đăng ký / Đăng nhập | Đăng ký tài khoản mới với email hợp lệ | Tạo user trong auth_service schema, publish event RabbitMQ, User Service tạo profile, trả về JWT token | ................... | ... |
| 2 | Quản lý tài khoản | Tạo ví mới "Tiền mặt" (type: CASH) | Account được tạo trong account_service schema, balance = 0 | ................... | ... |
| 3 | Giao dịch | Thêm giao dịch chi 100k danh mục Ăn uống | Transaction lưu DB (.NET EF Core), event RabbitMQ → Account balance giảm 100k, Analytics cập nhật | ................... | ... |
| 4 | Danh mục | Tạo danh mục custom "Du lịch" | Category mới xuất hiện trong list (Prisma) | ................... | ... |
| 5 | Ngân sách | Tạo budget Ăn uống 2 triệu/tháng | Budget lưu (Prisma), hiển thị 0% đã dùng | ................... | ... |
| 6 | Cảnh báo ngân sách | Chi đến 80% ngân sách | Analytics phát hiện, hiển thị cảnh báo | ................... | ... |
| 7 | Analytics | Xem báo cáo tháng hiện tại | MongoDB trả về tổng thu, chi, số dư, breakdown theo danh mục | ................... | ... |
| 8 | Dashboard | Thêm giao dịch mới | Dashboard cache MongoDB cập nhật, UI refresh | ................... | ... |
| 9 | gRPC | Transaction Service query Account qua gRPC | Trả về thông tin account chính xác, response < 50ms | ................... | ... |
| 10 | RabbitMQ | Tạo giao dịch → event published | Analytics Service, Account Service nhận và xử lý event thành công | ................... | ... |

## 9.2. Bảng test case AI/NLP

| **STT** | **Tính năng AI** | **Test case** | **Kết quả mong đợi** | **Kết quả thực tế** | **Đạt** |
| --- | --- | --- | --- | --- | --- |
| 1 | FinBot Chatbot | Hỏi "Tháng này tôi chi bao nhiêu tiền ăn uống?" | Trả lời đúng tổng chi ăn uống tháng hiện tại (query PostgreSQL cross-schema) | ................... | ... |
| 2 | FinBot Streaming | Hỏi qua `/chat-stream` endpoint | Response trả về từng chunk qua SSE, hiển thị real-time trên UI | ................... | ... |
| 3 | OCR hóa đơn | Upload ảnh hóa đơn nhà hàng tiếng Việt kèm tin nhắn | Gemini Vision nhận dạng items và giá chính xác > 80% | ................... | ... |
| 4 | AI Deep Scan | Gọi `/api/ai-deep-scan` | Trả về JSON `{ score, disease, symptoms, advice, future }` hợp lệ | ................... | ... |
| 5 | Bank Webhook | POST `/webhook/bank-transfer` với dữ liệu giao dịch | Gemini phân loại, INSERT transaction, push Socket.IO notification | ................... | ... |
| 6 | Model Fallback | Simulate rate limit model chính | Tự động chuyển sang model khác, vẫn trả lời thành công | ................... | ... |

---

# Chương 10: Đối sánh trực tiếp với tiêu chí chấm điểm

| **Tiêu chí chấm** | **Trọng số** | **Nhóm đã thực hiện** | **Mục trong báo cáo** | **Minh chứng** |
| --- | --- | --- | --- | --- |
| Hoàn thiện các chức năng bắt buộc | 30% | Quản lý thu chi (CRUD đầy đủ), ngân sách, tài khoản/ví, danh mục, xác thực JWT, thống kê — triển khai bằng 10 microservices độc lập | Chương 6 | API routes, Giao diện |
| Giao diện người dùng (UX/UI) | 15% | React 19 + TypeScript + Tailwind CSS 4 + Radix UI (shadcn-style), responsive, 7 trang chức năng + chatbox AI, biểu đồ Recharts | Mục 4.5 | Screenshot UI |
| Tính ổn định và hiệu năng | 10% | Microservices độc lập, Redis cache, gRPC inter-service (< 50ms), RabbitMQ event durability, Docker health check, validation middleware | Chương 5, 8 | Docker compose, gRPC protos |
| Tính năng mở rộng và khả năng ứng dụng thực tế | 20% | Bank Webhook (SePay/BankHub) tự động ghi giao dịch, Socket.IO real-time, Web Push notification, n8n workflow automation, gRPC cho easy service integration | Chương 4.2, 8 | Demo webhook |
| Ứng dụng AI/NLP hiệu quả, sáng tạo | 25% | FinBot chatbot tiếng Việt (chat + streaming), OCR hóa đơn (Gemini Vision multimodal), AI Deep Scan (phân tích sức khỏe tài chính), Bank Webhook AI classification, model fallback | Chương 7 | Chương 9.2, demo chatbot |
| Hình thức và nội dung báo cáo | 15% | Báo cáo đầy đủ 15 chương, bảng test case, đối sánh rubric, use case chi tiết, phân công công việc, phụ lục | Toàn bộ báo cáo | File báo cáo này |

---

# Chương 11: Phân công công việc và đóng góp thành viên

| **STT** | **Họ tên** | **MSSV** | **Nhiệm vụ chính** | **Sản phẩm cụ thể** | **Tỉ lệ %** |
| --- | --- | --- | --- | --- | --- |
| 1 | _..._ | _..._ | _..._ | _..._ | _...%_ |
| 2 | _..._ | _..._ | _..._ | _..._ | _...%_ |
| 3 | _..._ | _..._ | _..._ | _..._ | _...%_ |
| 4 | _..._ | _..._ | _..._ | _..._ | _...%_ |

_Lưu ý: Điền thông tin thành viên nhóm, nhiệm vụ cụ thể và tỉ lệ đóng góp thực tế._

---

# Chương 12: Kết luận và hướng phát triển

## 12.1. Kết quả đạt được

- Xây dựng thành công hệ thống quản lý tài chính cá nhân theo kiến trúc microservices đa ngôn ngữ (.NET 8 + Node.js) với 10 services độc lập, 15 Docker containers
- Tích hợp AI/NLP đa chiều: FinBot chatbot tiếng Việt (chat + streaming), OCR hóa đơn multimodal, AI Deep Scan phân tích sức khỏe tài chính, Bank Webhook AI classification
- Triển khai giao tiếp inter-service hiện đại: gRPC cho query đồng bộ hiệu năng cao, RabbitMQ cho event-driven bất đồng bộ
- Giao diện React 19 + TypeScript responsive với Radix UI, biểu đồ trực quan Recharts
- Real-time: Socket.IO cho dashboard update, Web Push (VAPID) cho notification
- Tự động hóa workflow qua n8n, tích hợp Bank Webhook (SePay/BankHub)

## 12.2. Hạn chế

- Phụ thuộc Internet — hệ thống cần kết nối để truy cập Supabase PostgreSQL và Google Gemini API
- Giới hạn quota API Google Gemini (rate limit)
- Độ chính xác OCR phụ thuộc chất lượng ảnh đầu vào
- AI Service truy cập PostgreSQL cross-schema (raw SQL) — chưa tối ưu về tách biệt dữ liệu
- Notification Service còn hạn chế (chỉ có health endpoint + RabbitMQ worker)
- Chưa có unit test và integration test tự động

## 12.3. Hướng phát triển

- Tích hợp Open Banking API để đồng bộ giao dịch ngân hàng tự động
- Phát triển mobile app (React Native) tận dụng API Gateway hiện có
- Thêm Anomaly Detection nâng cao bằng ML model (thay vì rule-based)
- Tách AI Service cross-schema query thành gRPC calls để đảm bảo service boundary
- Thêm unit test, integration test, và E2E test cho toàn bộ services
- Triển khai CI/CD pipeline (GitHub Actions)
- Mở rộng tích hợp ví điện tử: MoMo, ZaloPay, VNPay

---

# Chương 13: Tài liệu tham khảo

- Google Gemini API Documentation. <https://ai.google.dev/docs>
- ASP.NET Core Documentation. <https://learn.microsoft.com/en-us/aspnet/core>
- Entity Framework Core Documentation. <https://learn.microsoft.com/en-us/ef/core>
- Prisma Documentation. <https://www.prisma.io/docs>
- Express.js Documentation. <https://expressjs.com/>
- Node.js Documentation. <https://nodejs.org/en/docs>
- gRPC Documentation. <https://grpc.io/docs/>
- RabbitMQ Documentation. <https://www.rabbitmq.com/docs>
- MongoDB Documentation. <https://www.mongodb.com/docs/>
- PostgreSQL Documentation. <https://www.postgresql.org/docs/>
- Supabase Documentation. <https://supabase.com/docs>
- React Documentation. <https://react.dev/>
- Vite Documentation. <https://vite.dev/>
- Tailwind CSS Documentation. <https://tailwindcss.com/docs>
- Radix UI Documentation. <https://www.radix-ui.com/docs>
- Docker Documentation. <https://docs.docker.com/>
- Socket.IO Documentation. <https://socket.io/docs/>
- n8n Workflow Automation. <https://docs.n8n.io/>
- SePay Webhook. <https://sepay.vn/>

---

# Chương 14: Phụ lục (BẮT BUỘC)

| **Mục cần có** | **Link / Ghi chú** |
| --- | --- |
| Link Git repository | _<https://github.com/>..._ |
| Link video demo | _https://..._ |
| Link triển khai thử (nếu có) | _https://..._ |
| Tài khoản test | Email: _test@example.com_ / Password: _............_ |
| Hướng dẫn chạy hệ thống | Xem Mục 8.3 hoặc README.md trong repository |
| Prompt mẫu / input mẫu AI/NLP | _"Tháng này tôi chi bao nhiêu tiền ăn uống?"_ / _"Phân tích sức khỏe tài chính cho tôi"_ |
| Bảng chi phí API AI | Gemini Flash: miễn phí (free tier); Gemini Pro: theo quota Google AI Studio |

---

# Chương 15: Checklist tự rà trước khi nộp

| **Mục cần có** | **Đã có?** |
| --- | --- |
| Bảng đối sánh chức năng bắt buộc | Có / Chưa |
| Chương riêng mô tả AI/NLP | Có / Chưa |
| Ví dụ input/output cho AI/NLP | Có / Chưa |
| Bảng test case chức năng | Có / Chưa |
| Bảng test case AI/NLP | Có / Chưa |
| Ảnh giao diện có chú thích | Có / Chưa |
| Link Git + minh chứng đóng góp (log Git) | Có / Chưa |
| Link Git, video demo, tài khoản test | Có / Chưa |
| Bảng đối sánh trực tiếp với rubric | Có / Chưa |
