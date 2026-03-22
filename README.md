# Hướng Dẫn Cài Đặt Dự Án SpendWise AI

Chào mừng đến với dự án **SpendWise AI**! Repository này bao gồm cả backend (Spring Boot) và frontend (React). Hãy làm theo các hướng dẫn dưới đây để cấu hình và chạy dự án trên máy cá nhân của bạn.

## 📌 Các Yêu Cầu Cần Thiết

Trước khi bắt đầu, hãy đảm bảo rằng máy tính của bạn đã được cài đặt các phần mềm sau:

- **Java Development Kit (JDK) 17** trở lên (dành cho backend Spring Boot)
- **Node.js** (đạt phiên bản v18 trở lên) và **npm** (dành cho frontend React Vite)
- **Git** (quản lý phiên bản mã nguồn)
- Một IDE như IntelliJ IDEA, Eclipse hoặc VS Code (nếu dùng VS Code, đảm bảo đã cài đặt Extension Pack for Java và các tiện ích mở rộng như ESLint/Prettier)

---

## 🚀 Cài Đặt Backend (SpendwiseAI)

Backend được xây dựng dựa trên **Java Spring Boot**, **Maven**, và kết nối với cơ sở dữ liệu **PostgreSQL** trên Cloud của **Neon.tech**.

### 1. Di chuyển vào thư mục Backend
```bash
cd SpendwiseAI/SpendwiseAI
```

### 2. Cấu Hình Biến Môi Trường (Environment Variables)
Dự án sử dụng biến môi trường để cấp thông tin bảo mật cho Database và chuỗi JWT bí mật (Secret). Bạn có thể cấu hình chúng ngay trong IDE chạy code, hoặc nếu chạy tạm trên local, bạn có thể truyền qua file `src/main/resources/application.yml` hoặc `application-dev.yml` (Lưu ý: Không nên commit mật khẩu lên Git nhé!).

Các Biến Môi Trường Chỉnh Sửa Quan Trọng:
- `DB_URL`: Đường dẫn kết nối CSDL PostgreSQL (VD: `jdbc:postgresql://<neon-host>/<db-name>`)
- `DB_USERNAME`: Tên đăng nhập vào CSDL
- `DB_PASSWORD`: Mật khẩu đăng nhập vào CSDL
- `JWT_SECRET`: (Tuỳ chọn nhưng khuyên dùng) Khóa bí mật dùng để mã hoá/giải mã token JWT. Hệ thống đã có sẵn khóa mặc định cho môi trường phát triển (dev).

### 3. Build & Khởi Chạy Ứng Dụng
Bạn có thể sử dụng file wrapper của Maven đã được đính kèm sẵn trong hệ thống phân tách để build và khởi chạy Web Server.

**Để tiến hành build dự án:**
```bash
./mvnw clean install
```
*(Trên Windows, gõ lệnh `mvnw.cmd clean install`)*

**Để bắt đầu chạy ứng dụng (Start application):**
```bash
./mvnw spring-boot:run
```
*(Trên Windows, gõ lệnh `mvnw.cmd spring-boot:run`)*

Backend server sẽ chính thức hoạt động tại địa chỉ: `http://localhost:8080`.

---

## 🎨 Cài Đặt Frontend (React + Vite)

Frontend là một Web App hiện đại được xây dựng qua sự kết hợp của **React**, **TypeScript**, **Vite** và **Tailwind CSS**.

### 1. Di chuyển vào thư mục Frontend
Mở một cửa sổ Terminal mới (hoặc tab mới) và trỏ vào thư mục:
```bash
cd frontend
```

### 2. Cài đặt Dependencies (Thư Viện)
Cài đặt tất cả các gói package cần thiết của Node.js:
```bash
npm install
```

### 3. Khởi Chạy Máy Chủ Phát Triển (Development Server)
Sau khi cài đặt xong dependencies, hãy chạy môi trường dev của Vite:
```bash
npm run dev
```

Frontend app sẽ hoạt động qua cổng local và bình thường có thể truy cập tại `http://localhost:5173` (Hãy xem kết quả sinh ra trên màn hình terminal để lấy link Web Address chính xác).

---

## 💡 Quy Trình Git & Tránh Xung Đột Code (Conflict)

Để đảm bảo source code của dự án luôn chạy ổn định và tránh lỗi phát sinh khi nhiều người cùng làm, team cần tuân thủ quy trình Git dưới đây:

### 1. Quy Trình Chia Nhánh (Branching Strategy)
Không code trực tiếp lên nhánh `main`. Quy định tên nhánh nên theo chuẩn sau:
- **`main`**: Nhánh chứa source code ổn định nhất, dùng để build/deploy. Tuyệt đối không push code trực tiếp lên đây.
- **`dev`** (hoặc `develop`): Nhánh tổng hợp code từ các thành viên để test chung trước khi đưa lên `main`.
- **Nhánh tính năng (Feature)**: Định dạng `feature/ten-tinh-nang` (VD: `feature/login-page`, `feature/cart-api`).
- **Nhánh sửa lỗi (Bugfix)**: Định dạng `bugfix/ten-loi` (VD: `bugfix/fix-db-connection`).

### 2. Các Bước Làm Việc Hàng Ngày (Tránh Conflict)

**Trước khi bắt đầu code mới:**
1. Di chuyển về nhánh `dev`: `git checkout dev`
2. Lấy code mới nhất từ mọi người: `git pull origin dev`
3. Tạo nhánh mới của bạn từ nhánh `dev`: `git checkout -b feature/ten-tinh-nang-cua-ban`

**Trong lúc code:**
- Thường xuyên commit các thay đổi nhỏ, tránh để dồn một cục lớn mới commit.
- **Quy tắc ghi Commit Message:** Prefix + Cụm từ mô tả ngắn gọn:
  - `feat: Thêm API đăng nhập`
  - `fix: Bắt lỗi crash khi chọn ngày tháng`
  - `ui: Chỉnh lại màu nút Submit`
  - `docs: Cập nhật README`

**Khi hoàn thành code và chuẩn bị push:**
1. Lưu lại các thay đổi của bạn: `git commit -m "feat: Nội dung gì đó"`
2. **QUAN TRỌNG:** Quay lại nhánh `dev` và pull code mới nhất (đề phòng có ai đó vừa đẩy code lên trong lúc bạn đang làm): 
   `git checkout dev` 👉 `git pull origin dev`
3. Trở lại nhánh của bạn và merge (hoặc rebase) nhánh `dev` vào nhánh của bạn: 
   `git checkout feature/ten-tinh-nang-cua-ban` 👉 `git merge dev`
4. Nếu có **conflict (xung đột)**, Git sẽ báo cho bạn. Bạn mở VS Code lên, tìm các file bị báo đỏ, thảo luận với người viết đoạn code đó (nếu cần), rồi xóa các dòng đánh dấu dư thừa `<<<<<<<` và `>>>>>>>`, chọn phần code đúng nhất.
5. Sau khi giải quyết conflict xong: `git add .` 👉 `git commit -m "Merge dev and resolve conflict"`
6. Đẩy nhánh của bạn lên Github: `git push origin feature/ten-tinh-nang-cua-ban`

### 3. Review Code (Pull Request)
- Lên Github/Gitlab tạo **Pull Request (PR)** từ nhánh `feature/...` của bạn vào nhánh `dev`.
- Yêu cầu ít nhất 1 thành viên khác (hoặc Tech Lead) vào xem code.
- Nhớ nhắc các bạn review nếu file `application.yml` (hoặc `package.json`, `.env`) có sửa đổi, để mọi người cập nhật lại config trên máy cá nhân.

Chúc nhóm code vui vẻ nhé! 🎉 Nếu bất kỳ ai cần giúp đỡ hay gặp vấn đề gì lỗi từ source, bạn hãy nhắn lại nha.