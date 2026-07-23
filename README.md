# LibHub — Library Event Management Platform

LibHub là hệ thống quản lý sự kiện thư viện, hỗ trợ quản trị viên và nhân viên thư viện tạo sự kiện, quản lý phòng tổ chức, danh mục sự kiện, lịch trình hoạt động và lượt đăng ký của độc giả.

Dự án được xây dựng theo mô hình full-stack với:

- Backend: NestJS, MongoDB, Mongoose, JWT Authentication
- Frontend: React, Vite, TypeScript, Tailwind CSS, shadcn/ui
- Database: MongoDB

---

## 1. Mục tiêu dự án

LibHub giúp thư viện quản lý toàn bộ quy trình tổ chức sự kiện:

- Tạo và công khai sự kiện
- Quản lý danh mục sự kiện
- Quản lý phòng tổ chức
- Kiểm tra trùng lịch phòng
- Quản lý lịch trình chi tiết của từng sự kiện
- Cho phép độc giả đăng ký tham gia sự kiện
- Cho phép nhân viên check-in người tham gia
- Theo dõi thống kê tổng quan qua dashboard

---

## 2. Vai trò người dùng

Hệ thống có 3 vai trò chính:

### Admin

Admin có toàn quyền quản lý hệ thống:

- Quản lý sự kiện
- Quản lý danh mục
- Quản lý phòng
- Quản lý đăng ký
- Check-in người tham gia
- Hủy đăng ký
- Xem dashboard thống kê

### Staff

Staff là nhân viên thư viện, có thể hỗ trợ quản lý nghiệp vụ:

- Quản lý sự kiện
- Quản lý lịch trình
- Quản lý đăng ký
- Check-in người tham gia
- Theo dõi dashboard

### Reader

Reader là độc giả sử dụng hệ thống:

- Xem danh sách sự kiện
- Xem chi tiết sự kiện
- Xem lịch trình tổng hợp
- Đăng ký tham gia sự kiện
- Xem danh sách sự kiện đã đăng ký
- Hủy đăng ký nếu cần

---

## 3. Công nghệ sử dụng

### Backend

- NestJS
- TypeScript
- MongoDB
- Mongoose
- JWT Authentication
- Passport JWT
- bcrypt
- class-validator
- class-transformer

### Frontend

- React
- Vite
- TypeScript
- React Router DOM
- Zustand
- Axios
- Tailwind CSS
- shadcn/ui
- Lucide React

---

