import { Navigate, Outlet } from "react-router-dom"
import { useAuth } from "@/hooks/useAuth"

export default function AdminRoute() {
  const { user } = useAuth()
  
  const isAdmin = user?.vaiTro === "admin" || user?.vaiTro === "ADMIN";

  if (!isAdmin) {
    // Nếu không phải admin, đá về trang chủ
    return <Navigate to="/" replace />
  }

  // Nếu là admin, render component con (giao diện Admin)
  return <Outlet />
}
