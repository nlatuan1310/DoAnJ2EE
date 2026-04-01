import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import {
  Users,
  LayoutDashboard,
  ShieldCheck,
  FolderCog,
  ScrollText
} from "lucide-react"
import { Link, useLocation } from "react-router-dom"

const adminMenuItems = [
  {
    title: "Thống kê & Báo cáo",
    url: "/admin",
    icon: LayoutDashboard,
  },
  {
    title: "Quản lý Người dùng",
    url: "/admin/users",
    icon: Users,
  },
  {
    title: "Danh mục Hệ thống",
    url: "/admin/categories",
    icon: FolderCog,
  },
  {
    title: "Nhật ký Hoạt động",
    url: "/admin/audit-log",
    icon: ScrollText,
  },
]

export function AdminSidebar() {
  const location = useLocation()

  const isActive = (url: string) => {
    // Nếu URL là /admin thì xử lý khớp chính xác, nếu không thì dùng startsWith
    if (url === "/admin") {
      return location.pathname === "/admin";
    }
    return location.pathname.startsWith(url)
  }

  const renderMenuItem = (item: (typeof adminMenuItems)[0]) => {
    const active = isActive(item.url)

    return (
      <SidebarMenuItem key={item.title}>
        <Link to={item.url} className="w-full">
          <SidebarMenuButton
            tooltip={item.title}
            className={`
              flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors
              ${active
                ? "text-violet-600 bg-violet-50"
                : "text-slate-600 hover:text-violet-600 hover:bg-slate-50"
              }
            `}
          >
            <item.icon className={`w-4 h-4 ${active ? "text-violet-500" : "text-slate-400"}`} />
            <span>{item.title}</span>
          </SidebarMenuButton>
        </Link>
      </SidebarMenuItem>
    )
  }

  return (
    <Sidebar collapsible="none" className="border-r border-slate-200 bg-white sticky top-0 h-screen overflow-y-auto">
      <SidebarContent className="bg-white text-slate-700 flex flex-col h-full">
        <SidebarGroup>
          {/* Logo Section */}
          <div className="flex items-center justify-between px-4 pt-6 pb-6">
            <div className="flex items-center gap-3">
              <div className="bg-violet-600 text-white p-2 rounded-lg">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <span className="font-bold text-lg tracking-tight text-slate-800 block leading-tight">SpendWise</span>
                <span className="text-[10px] font-bold text-violet-600 uppercase tracking-widest block leading-tight pt-1">Admin Portal</span>
              </div>
            </div>
          </div>

          {/* Main Menu */}
          <SidebarGroupLabel className="px-4 text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Quản trị Vận hành
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-0.5 px-2">
              {adminMenuItems.map((item) => renderMenuItem(item))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

      </SidebarContent>
    </Sidebar>
  )
}
