import { Outlet } from "react-router-dom"

export default function AdminRoute() {
  // Lấy vai trò (role) từ localStorage
  // const role = localStorage.getItem("role")

  // Tạm thời cho phép bypass luôn để thiết kế UI
  const isAdmin = true;

  if (!isAdmin) {
    // Nếu không phải admin, đá về trang chủ
    // return <Navigate to="/" replace />
  }

  // Nếu là admin, render component con (giao diện Admin)
  return <Outlet />
}
