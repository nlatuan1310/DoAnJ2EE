import { useState, useEffect, useRef, useCallback } from "react"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { Outlet, useNavigate } from "react-router-dom"
import { Search, Bell, Info, LogOut, User, CheckCheck, AlertTriangle } from "lucide-react"
import { useAuth } from "@/hooks/useAuth"

import LandingPage from "@/pages/LandingPage"

import {
  layThongBao,
  demChuaDoc,
  danhDauDaDoc,
  docTatCa,
  ThongBao,
} from "@/services/notificationService"
import { nganSachApi } from "@/services/api"
import ThongBaoVuotNganSach from "@/components/ThongBaoVuotNganSach"

export default function MainLayout() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();




  /* ── Notification state ── */
  const [notifications, setNotifications] = useState<ThongBao[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotif, setShowNotif] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  /* ── Over-Budget Alert State ── */
  const [overBudgets, setOverBudgets] = useState<any[]>([]);

  const fetchNotifications = useCallback(async () => {
    try {
      const [list, count, budgetRes] = await Promise.all([
        layThongBao(), 
        demChuaDoc(),
        nganSachApi.getAll()
      ]);
      setNotifications(list);
      setUnreadCount(count);

      // Theo dõi vượt ngân sách
      if (budgetRes?.data) {
        const exceeded = budgetRes.data.filter((b: any) => (b.spent || 0) > b.gioiHanTien);
        setOverBudgets(exceeded);
      }
    } catch { /* silent */ }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 5000); // Rút ngắn xuống 5s để cập nhật ngân sách/thông báo nhanh hơn
      return () => clearInterval(interval);
    }
  }, [isAuthenticated, fetchNotifications]);

  // Click outside to close
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotif(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleMarkRead = async (id: string) => {
    await danhDauDaDoc(id);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, daDoc: true } : n))
    );
    setUnreadCount((c) => Math.max(0, c - 1));
  };

  const handleMarkAllRead = async () => {
    await docTatCa();
    setNotifications((prev) => prev.map((n) => ({ ...n, daDoc: true })));
    setUnreadCount(0);
  };

  const handleProfileClick = () => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  };


  const handleLogout = () => {
    // Điều hướng ngay lập tức về trang landing page
    navigate("/", { replace: true });
    
    // Xóa state đăng nhập trong hàng đợi (setTimeout) 
    // để tránh việc React Router render <Navigate to="/login" /> ở trang cũ
    setTimeout(() => {
      logout();
    }, 10);
  }

  const formatTime = (dateStr: string) => {
    const d = new Date(dateStr);
    const now = new Date();
    const diff = Math.floor((now.getTime() - d.getTime()) / 60000);
    if (diff < 1) return "Vừa xong";
    if (diff < 60) return `${diff} phút trước`;
    if (diff < 1440) return `${Math.floor(diff / 60)} giờ trước`;
    return `${Math.floor(diff / 1440)} ngày trước`;
  };

    if (!isAuthenticated) {
    return <LandingPage />;
  }
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="bg-slate-50 min-w-0 flex-1 flex flex-col h-screen overflow-hidden transition-[margin,width] duration-200 ease-linear">
        
        {/* Top Header */}
        <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center justify-end border-b border-slate-200 bg-white/95 backdrop-blur-sm px-4 sm:px-6">
          
          {/* Right Icons Group */}
          <div className="flex items-center gap-1 sm:gap-2">
            {/* Search */}
            <button className="p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors">
              <Search className="w-4 h-4" />
            </button>

            {/* Notifications Bell */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => setShowNotif(!showNotif)}
                className="relative p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 flex items-center justify-center min-w-[16px] h-4 px-1
                                   text-[10px] font-bold text-white bg-rose-500 rounded-full border-2 border-white">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Dropdown */}
              {showNotif && (
                <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white border border-slate-200
                                rounded-xl shadow-xl shadow-slate-200/50 overflow-hidden z-50
                                animate-in fade-in slide-in-from-top-2">
                  {/* Header */}
                  <div className="flex items-center justify-between px-4 py-3 bg-slate-50 border-b border-slate-100">
                    <h3 className="text-sm font-semibold text-slate-700 flex items-center gap-1.5">
                      <Bell className="w-3.5 h-3.5 text-violet-500" /> Thông báo
                      {unreadCount > 0 && (
                        <span className="ml-1 px-1.5 py-0.5 text-[10px] font-bold text-white bg-rose-500 rounded-full">
                          {unreadCount}
                        </span>
                      )}
                    </h3>
                    {unreadCount > 0 && (
                      <button
                        onClick={handleMarkAllRead}
                        className="text-[11px] text-violet-500 hover:text-violet-700 font-medium flex items-center gap-1 transition-colors"
                      >
                        <CheckCheck className="w-3 h-3" /> Đọc tất cả
                      </button>
                    )}
                  </div>

                  {/* List */}
                  <div className="max-h-80 overflow-y-auto divide-y divide-slate-50">
                    {notifications.length === 0 ? (
                      <div className="px-4 py-8 text-center text-sm text-slate-400">
                        Không có thông báo mới
                      </div>
                    ) : (
                      notifications.slice(0, 20).map((n) => (
                        <div
                          key={n.id}
                          className={`px-4 py-3 hover:bg-slate-50/80 cursor-pointer transition-colors ${
                            !n.daDoc ? "bg-violet-50/40" : ""
                          }`}
                          onClick={() => !n.daDoc && handleMarkRead(n.id)}
                        >
                          <div className="flex items-start gap-2.5">
                            <div className={`mt-0.5 p-1.5 rounded-lg shrink-0 ${
                              n.loai === "canh_bao_ngan_sach"
                                ? "bg-amber-100 text-amber-600"
                                : "bg-violet-100 text-violet-600"
                            }`}>
                              <AlertTriangle className="w-3.5 h-3.5" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className={`text-sm leading-snug ${
                                !n.daDoc ? "font-semibold text-slate-800" : "text-slate-600"
                              }`}>
                                {n.tieuDe}
                              </p>
                              <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{n.noiDung}</p>
                              <p className="text-[10px] text-slate-400 mt-1">{formatTime(n.ngayTao)}</p>
                            </div>
                            {!n.daDoc && (
                              <span className="mt-1 w-2 h-2 rounded-full bg-violet-500 shrink-0" />
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Info */}
            <button className="p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors">
              <Info className="w-4 h-4" />
            </button>

            {/* Divider */}
            <div className="w-px h-6 bg-slate-200 mx-1"></div>

            {/* Profile / Auth Section */}
            {isAuthenticated ? (
              <div className="flex items-center gap-2">
                <button 
                  onClick={handleProfileClick}
                  className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-slate-50 transition-colors"
                >
                  <img 
                    src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user?.hoVaTen || 'User')}&background=10b981&color=fff`} 
                    alt="User" 
                    className="w-8 h-8 rounded-full border border-slate-200" 
                  />
                  <div className="text-left hidden sm:block">
                    <p className="text-sm font-semibold text-slate-700 leading-tight">{user?.hoVaTen}</p>
                    <p className="text-[10px] text-slate-400 uppercase tracking-wider">{user?.vaiTro}</p>
                  </div>
                </button>
                
                <button 
                  onClick={handleLogout}
                  title="Đăng xuất"
                  className="p-2 rounded-full text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button 
                onClick={handleProfileClick}
                className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white transition-colors"
              >
                <User className="w-4 h-4" />
                <span className="text-sm font-medium">Đăng nhập</span>
              </button>
            )}
          </div>
        </header>

        <div className="flex-1 overflow-y-auto overflow-x-hidden bg-slate-50 relative">
          <Outlet />
          
          {/* Over-Budget Alert Floating Component */}
          {isAuthenticated && <ThongBaoVuotNganSach overBudgets={overBudgets} />}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
