import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { Outlet, useNavigate } from "react-router-dom"
import { Search, Bell, Info, Sun, LogOut, User } from "lucide-react"
import { useAuth } from "@/hooks/useAuth"

export default function MainLayout() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleProfileClick = () => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  };

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="bg-slate-100 min-w-0 flex-1 flex flex-col min-h-screen transition-[margin,width] duration-200 ease-linear">
        
        {/* Top Header Mosaic Style — minimal, right-aligned icons */}
        <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center justify-end border-b border-slate-200 bg-white px-4 sm:px-6">
          
          {/* Right Icons Group */}
          <div className="flex items-center gap-1 sm:gap-2">
            {/* Search */}
            <button className="p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors">
              <Search className="w-4 h-4" />
            </button>

            {/* Notifications */}
            <button className="relative p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors">
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 border-2 border-white"></span>
            </button>

            {/* Info */}
            <button className="p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors">
              <Info className="w-4 h-4" />
            </button>

            {/* Theme Toggle */}
            <button className="p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors">
              <Sun className="w-4 h-4" />
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
                  onClick={logout}
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

        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
