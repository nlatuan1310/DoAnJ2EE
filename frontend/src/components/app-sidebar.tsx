import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
} from "@/components/ui/sidebar"
import {
  Home,
  Wallet,
  PieChart,
  Goal,
  BarChart3,
  ChevronDown,
  TrendingUp,
  ScanLine,
  LayoutGrid,
  BrainCircuit,
} from "lucide-react"
import { Link, useLocation } from "react-router-dom"
import { useState } from "react"

interface MenuItem {
  title: string
  url?: string
  icon: any
  subItems?: { title: string; url: string }[]
}

const mainMenuItems: MenuItem[] = [
  {
    title: "Dashboard",
    icon: Home,
    subItems: [
      { title: "Tổng quan", url: "/" },
      { title: "Smart Dashboard", url: "/smart-dashboard" },
    ],
  },
  {
    title: "Giao dịch",
    url: "/transactions",
    icon: Wallet,
  },
  {
    title: "Quét hóa đơn",
    url: "/receipt-scanner",
    icon: ScanLine,
  },
  {
    title: "Danh mục & Thẻ",
    url: "/categories",
    icon: LayoutGrid,
  },
  {
    title: "Ngân sách",
    url: "/budgets",
    icon: PieChart,
  },
  {
    title: "Mục tiêu",
    url: "/goals",
    icon: Goal,
  },
  {
    title: "Báo cáo",
    url: "/reports",
    icon: BarChart3,
  },
  {
    title: "Đầu tư",
    url: "/investments",
    icon: TrendingUp,
  },
  {
    title: "Cố vấn AI",
    url: "/advisor",
    icon: BrainCircuit,
  },
]

export function AppSidebar() {
  const location = useLocation()
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({ Dashboard: true })

  const toggleMenu = (title: string) => {
    setOpenMenus((prev) => ({ ...prev, [title]: !prev[title] }))
  }

  const isActive = (url?: string) => {
    if (!url) return false
    return location.pathname === url
  }

  const isGroupActive = (item: MenuItem) => {
    if (item.subItems) {
      return item.subItems.some((sub) => location.pathname === sub.url)
    }
    return location.pathname === item.url
  }

  const renderMenuItem = (item: MenuItem) => {
    const active = isGroupActive(item)

    if (item.subItems) {
      return (
        <SidebarMenuItem key={item.title}>
          <SidebarMenuButton
            onClick={() => toggleMenu(item.title)}
            className={`
              flex items-center justify-between w-full px-3 py-2 rounded-md text-sm font-medium transition-colors
              ${active
                ? "text-violet-600"
                : "text-slate-600 hover:text-violet-600 hover:bg-slate-50"
              }
            `}
          >
            <div className="flex items-center gap-3">
              <item.icon className={`w-4 h-4 ${active ? "text-violet-500" : "text-slate-400"}`} />
              <span>{item.title}</span>
            </div>
            <ChevronDown
              className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${openMenus[item.title] ? "rotate-180" : ""
                }`}
            />
          </SidebarMenuButton>

          {openMenus[item.title] && (
            <SidebarMenuSub className="ml-6 mt-1 border-l border-slate-200 pl-0">
              {item.subItems.map((sub) => (
                <SidebarMenuSubItem key={sub.title}>
                  <Link
                    to={sub.url}
                    className="block w-full"
                  >
                    <SidebarMenuSubButton
                      isActive={isActive(sub.url)}
                    >
                      {sub.title}
                    </SidebarMenuSubButton>
                  </Link>
                </SidebarMenuSubItem>
              ))}
            </SidebarMenuSub>
          )}
        </SidebarMenuItem>
      )
    }

    if (!item.url) return null

    return (
      <SidebarMenuItem key={item.title}>
        <Link to={item.url} className="w-full">
          <SidebarMenuButton
            tooltip={item.title}
            isActive={active}
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
      <SidebarContent className="bg-white text-slate-700">
        <SidebarGroup>
          {/* Logo Section */}
          <div className="flex items-center gap-3 px-4 pt-6 pb-6">
            <div className="bg-violet-500 text-white p-2 rounded-lg">
              <Wallet className="w-5 h-5" />
            </div>
            <span className="font-bold text-lg tracking-tight text-slate-800">SpendWise</span>
          </div>

          {/* Main Menu */}
          <SidebarGroupLabel className="px-4 text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Trang
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-0.5 px-2">
              {mainMenuItems.map((item) => renderMenuItem(item))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>


      </SidebarContent>
    </Sidebar>
  )
}
