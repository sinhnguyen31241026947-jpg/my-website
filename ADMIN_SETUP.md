# 🔐 Hướng dẫn Setup Admin Account

## Bước 1: Thêm Email Admin

Mở file `src/app/components/Auth.tsx` và tìm dòng:

```typescript
const ADMIN_EMAILS = ['admin@uehflex.fit', 'you@example.com']; // Thay bằng email của bạn
```

**Thay `you@example.com` bằng email của bạn!** Ví dụ:

```typescript
const ADMIN_EMAILS = ['admin@uehflex.fit', 'khai@ueh.edu.vn']; // Email của bạn
```

## Bước 2: Tạo tài khoản Admin

1. Vào `http://localhost:5182/auth`
2. Đăng ký tài khoản với email mà bạn vừa thêm vào `ADMIN_EMAILS`
3. Sau khi đăng ký/đăng nhập, tài khoản sẽ **tự động nhận quyền admin** ✅

## Bước 3: Kiểm tra Menu Admin

- Vào sidebar, bạn sẽ thấy link **"Quản Trị"** (Shield icon)
- Nếu không phải admin sẽ **không thấy** link này

## Bước 4: Quản lý Admin (Tăng cấp User khác)

Trong Admin Dashboard → Tab **"Quản lý Admin"**:

1. **Thêm Admin Mới**: Nhập email → Nhấn **[Thêm]**
   - Email sẽ được thêm vào danh sách admin
   - User khi đăng nhập lần sau sẽ thành admin

2. **Xóa Admin**: Nhấn **[Xóa]** trên tài khoản admin bất kỳ
   - Không thể xóa chính mình (tài khoản hiện tại)
   - Khi logout và login lại, user sẽ mất quyền admin

## ⚠️ Lưu Ý Quan Trọng

- **Danh sách admin lưu trong `localStorage`** (phía client)
- Để lưu **biết đâu** (permanent), cần lưu vào database
- Khi xóa localStorage → mất danh sách admin

## 📋 Tính Năng Admin Dashboard

### Tab 1: Bài chờ duyệt
- Xem danh sách bài viết chờ duyệt (`status !== 'approved'`)
- Nút **[Duyệt bài]** → `status = 'approved'` + tăng `streak` người đăng
- Nút **[Từ chối]** → xóa bài khỏi danh sách

### Tab 2: Báo cáo
- Xem tất cả báo cáo chưa xử lý
- Nút **[Xác nhận báo cáo]** → trừ -20 điểm uy tín người bị báo

### Tab 3: Quản lý Admin
- Thêm admin mới bằng email
- Xóa admin (trừ chính mình)
- Liệt kê tất cả admin hiện tại

---

🎯 **Bạn đã sẵn sàng quản trị platform!** 💪
