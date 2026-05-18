# 🎸 Guitar Learning Platform

Guitar Learning Platform là web app học guitar có tích hợp trợ lý AI, quản lý khóa học, bài học, luyện tập, theo dõi tiến độ và gợi ý lộ trình học cá nhân hóa.

Dự án gồm:

- Frontend: React + Vite + TypeScript
- Backend: Express + TypeScript
- Database/Auth: Supabase
- AI Assistant: Google Gemini API + fallback rule-based
- Deploy Frontend: Vercel
- Deploy Backend: Render

---

## 📁 Cấu trúc dự án

```txt
Web_manguonmo/
├── guitar-app-frontend/
├── guitar-app-backend/
└── old-guitar-ui-reference/

Trong đó:
guitar-app-frontend  → Giao diện người dùng React
guitar-app-backend   → API server Express
old-guitar-ui-reference → Dự án cũ dùng để tham khảo UI/flow
🚀 Tính năng chính
Người học
Đăng ký / đăng nhập bằng Supabase Auth
Xem danh sách khóa học guitar
Xem chi tiết bài học
Xem video/audio bài học
Hỏi trợ lý AI về lộ trình học guitar
Theo dõi tiến độ học tập
Luyện tập hợp âm, tiết tấu, fingerstyle
Nhận gợi ý học tập cá nhân hóa
Quản trị
Thêm khóa học
Sửa khóa học
Xóa khóa học
Thêm/sửa bài học
Quản lý dữ liệu demo
🛠 Công nghệ sử dụng
Frontend
React
Vite
TypeScript
Tailwind CSS
React Router
Axios
Supabase JS
React Markdown
Lucide React
Recharts
Backend
Node.js
Express.js
TypeScript
Supabase JS SDK
Google Gemini API
dotenv
cors
ts-node-dev
Database
Supabase PostgreSQL
Supabase Auth
Supabase Storage
Row Level Security
⚙️ Yêu cầu hệ thống

Cần cài trước:

Node.js >= 20
npm
Git
VS Code
Tài khoản Supabase
Tài khoản Google AI Studio

Kiểm tra phiên bản:

node -v
npm -v
git --version
🔐 Lưu ý bảo mật

Không được push các file sau lên GitHub:

.env
.env.local
node_modules/
dist/

Frontend chỉ được dùng:

VITE_API_URL
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY

Backend mới được dùng:

SUPABASE_SERVICE_ROLE_KEY
GEMINI_API_KEY
JWT_SECRET

Tuyệt đối không đưa SUPABASE_SERVICE_ROLE_KEY hoặc GEMINI_API_KEY vào frontend.

1. Cài đặt Backend
Di chuyển vào thư mục backend
cd guitar-app-backend
Cài dependencies
npm install
Tạo file môi trường

Tạo file .env từ .env.example:

copy .env.example .env

Hoặc trên Git Bash/macOS/Linux:

cp .env.example .env
Cấu hình .env
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=gemini-2.5-flash-lite

JWT_SECRET=your_jwt_secret
Chạy backend
npm run dev

Backend chạy tại:

http://localhost:5000

Kiểm tra API:

http://localhost:5000/api/health
2. Cài đặt Frontend
Di chuyển vào thư mục frontend
cd guitar-app-frontend
Cài dependencies
npm install
Tạo file môi trường

Tạo file .env:

VITE_API_URL=http://localhost:5000/api
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
Chạy frontend
npm run dev

Frontend chạy tại:

http://localhost:5173
3. Thiết lập Supabase
Tạo project Supabase

Vào Supabase Dashboard và tạo project mới.

Sau đó lấy:

Project URL
Anon Key
Service Role Key
Chạy SQL schema

Mở:

Supabase Dashboard → SQL Editor

Chạy file:

docs/supabase/auth_schema.sql

File này tạo các bảng chính:

profiles
courses
lessons
lesson_progress
practice_sessions
recommendations

Đồng thời bật Row Level Security cho dữ liệu người dùng.

Chạy dữ liệu mẫu

Chạy tiếp file:

docs/supabase/seed.sql

Dữ liệu mẫu gồm:

3 khóa học
mỗi khóa học có 3 bài học

Ví dụ:

Guitar cơ bản cho người mới
Luyện hợp âm và chuyển hợp âm
Fingerstyle nhập môn
4. Chạy toàn bộ project local

Cần mở 2 terminal.

Terminal 1 — Backend
cd guitar-app-backend
npm run dev

Backend:

http://localhost:5000
Terminal 2 — Frontend
cd guitar-app-frontend
npm run dev

Frontend:

http://localhost:5173
5. API Backend chính
Health check
GET /api/health
Courses
GET /api/courses
GET /api/courses/:id
POST /api/courses
PUT /api/courses/:id
DELETE /api/courses/:id
Lessons
GET /api/lessons/:id
GET /api/lessons/course/:courseId
POST /api/lessons
PUT /api/lessons/:id
DELETE /api/lessons/:id
AI Assistant
POST /api/assistant/ask

Body:

{
  "message": "Tôi mới học guitar nên bắt đầu từ đâu?",
  "userId": "optional-user-id"
}

Response:

{
  "success": true,
  "message": "Assistant replied successfully",
  "data": {
    "reply": "...",
    "source": "gemini"
  }
}

Nếu Gemini lỗi quota/API, hệ thống tự dùng fallback:

{
  "source": "fallback"
}
Progress
POST /api/progress
GET /api/progress/:userId
Practice
POST /api/practice
GET /api/practice/:userId/sessions
GET /api/practice/:userId/stats
Recommendations
GET /api/recommendations/:userId
6. Test nhanh bằng PowerShell
Test backend
Invoke-RestMethod http://localhost:5000/api/health
Test Gemini Assistant
$response = Invoke-RestMethod `
  -Uri "http://localhost:5000/api/assistant/ask" `
  -Method POST `
  -ContentType "application/json" `
  -Body '{"message":"Tôi mới học guitar nên bắt đầu từ đâu?"}'

$response | ConvertTo-Json -Depth 10

Nếu thấy:

"source": "gemini"

nghĩa là gọi Gemini API thành công.

Nếu thấy:

"source": "fallback"

nghĩa là Gemini lỗi quota/API nhưng hệ thống vẫn trả lời bằng fallback.

7. Các trang frontend chính
/                → Trang chủ
/login           → Đăng nhập
/register        → Đăng ký
/courses         → Danh sách khóa học
/lessons/:id     → Chi tiết bài học
/assistant       → Trợ lý guitar AI
/practice        → Luyện tập
/dashboard       → Tiến độ học tập
/admin           → Quản trị khóa học/bài học

Nếu chưa đăng nhập, hệ thống sẽ chuyển về:

/login

Sau khi đăng nhập thành công, người dùng được chuyển vào trang chủ/dashboard.

8. Build project
Build backend
cd guitar-app-backend
npm run build
Build frontend
cd guitar-app-frontend
npm run build

Nếu build thành công, frontend sẽ tạo thư mục:

dist/

Backend sẽ tạo:

dist/
9. Deploy Frontend lên Vercel
Bước 1

Push repo frontend lên GitHub.

Bước 2

Vào Vercel:

Add New Project
Import guitar-app-frontend
Bước 3

Cấu hình:

Framework: Vite
Build Command: npm run build
Output Directory: dist
Bước 4

Thêm Environment Variables:

VITE_API_URL=https://your-backend.onrender.com/api
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
10. Deploy Backend lên Render
Bước 1

Push repo backend lên GitHub.

Bước 2

Vào Render:

New Web Service
Connect GitHub repository
Bước 3

Cấu hình:

Build Command: npm install && npm run build
Start Command: npm start
Bước 4

Thêm Environment Variables:

PORT=5000
NODE_ENV=production
FRONTEND_URL=https://your-frontend.vercel.app

SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=gemini-2.5-flash-lite

JWT_SECRET=your_jwt_secret
11. Quy trình push GitHub
Kiểm tra trạng thái
git status
Add file
git add .
Commit
git commit -m "complete guitar learning platform setup"
Push
git push origin main

Nếu dùng branch:

git checkout -b feature/auth
git push origin feature/auth
12. Checklist trước khi nộp/demo
[ ] Backend chạy được ở localhost:5000
[ ] Frontend chạy được ở localhost:5173
[ ] Supabase đã chạy auth_schema.sql
[ ] Supabase đã chạy seed.sql
[ ] Đăng ký tài khoản được
[ ] Đăng nhập được
[ ] Logout được
[ ] /courses hiển thị khóa học
[ ] /assistant trả lời được
[ ] Gemini source hiển thị gemini hoặc fallback
[ ] /lessons/:id mở được bài học
[ ] Progress tracking hoạt động
[ ] Dashboard hiển thị tiến độ
[ ] Admin tạo/sửa/xóa course được
[ ] Frontend build pass
[ ] Backend build pass
[ ] Không push file .env
13. Lỗi thường gặp
Frontend không gọi được backend

Kiểm tra:

VITE_API_URL=http://localhost:5000/api

Sau khi sửa .env, restart frontend:

npm run dev
Backend báo thiếu Supabase table

Chạy lại:

docs/supabase/auth_schema.sql
docs/supabase/seed.sql
Gemini báo 429 quota

Hệ thống sẽ tự dùng fallback. Có thể xử lý bằng cách:

- Đợi quota reset
- Tạo API key mới
- Đổi Google project
- Đổi model GEMINI_MODEL
Gemini báo model not found

Đổi trong backend .env:

GEMINI_MODEL=gemini-2.5-flash-lite

Sau đó restart backend.

14. Tác giả

Dự án được xây dựng cho đồ án web app học guitar.

Author: Tien (ntien17)
Project: Guitar Learning Platform

```txt
README frontend
README backend
