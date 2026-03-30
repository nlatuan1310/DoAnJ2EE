import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { Outlet, useNavigate } from "react-router-dom"
import { Search, Bell, Settings, LogOut } from "lucide-react"

export default function AdminLayout() {
  const navigate = useNavigate()

  const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    navigate("/login")
  }

  return (
    <SidebarProvider>
      <AdminSidebar />
      <SidebarInset className="bg-slate-50 min-w-0 flex-1 flex flex-col min-h-screen transition-[margin,width] duration-200 ease-linear">

        {/* Top Header */}
        <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-4 sm:px-6">
          <div className="flex items-center gap-2 flex-1">
            {/* Context/Breadcrumbs would go here if needed. Currently empty. */}
          </div>

          {/* Right Icons Group */}
          <div className="flex items-center gap-1 sm:gap-2">
            <button className="p-2 rounded-full text-slate-400 hover:text-violet-600 hover:bg-violet-50 transition-colors">
              <Search className="w-4 h-4" />
            </button>
            <button className="relative p-2 rounded-full text-slate-400 hover:text-violet-600 hover:bg-violet-50 transition-colors">
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 border-2 border-white"></span>
            </button>
            <button className="p-2 rounded-full text-slate-400 hover:text-violet-600 hover:bg-violet-50 transition-colors">
              <Settings className="w-4 h-4" />
            </button>

            <div className="w-px h-6 bg-slate-200 mx-1"></div>

            <button className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-slate-50 transition-colors">
              <div className="w-8 h-8 rounded-full bg-rose-600 text-white flex items-center justify-center font-bold text-xs ring-2 ring-white">
                AD
              </div>
              <span className="text-sm font-semibold text-slate-700 hidden sm:block">Admin</span>
            </button>

            <button
              onClick={handleLogout}
              className="p-2 ml-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
              title="Đăng xuất"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
