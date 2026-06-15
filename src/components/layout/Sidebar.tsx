import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Settings,
  ListTodo,
  PhoneCall,
  FileText,
  AlertTriangle,
  BarChart3,
  Heart,
} from "lucide-react";
import { cn } from "@/lib/utils";

const menuItems = [
  {
    path: "/dashboard",
    label: "工作台",
    icon: LayoutDashboard,
  },
  {
    path: "/reminder-config",
    label: "提醒配置",
    icon: Settings,
  },
  {
    path: "/task-queue",
    label: "任务队列",
    icon: ListTodo,
  },
  {
    path: "/callback",
    label: "回访处理",
    icon: PhoneCall,
  },
  {
    path: "/records",
    label: "回访记录",
    icon: FileText,
  },
  {
    path: "/escalation",
    label: "升级处置",
    icon: AlertTriangle,
  },
  {
    path: "/daily-summary",
    label: "日终汇总",
    icon: BarChart3,
  },
];

export function Sidebar() {
  const location = useLocation();

  return (
    <aside className="w-60 h-screen bg-slate-900 text-white flex flex-col fixed left-0 top-0 z-40">
      {/* Logo区域 */}
      <div className="h-16 flex items-center px-5 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-primary-500 flex items-center justify-center">
            <Heart size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-base font-bold">高危随访系统</h1>
            <p className="text-xs text-slate-400">High Risk Follow-up</p>
          </div>
        </div>
      </div>

      {/* 导航菜单 */}
      <nav className="flex-1 py-4 px-3 overflow-y-auto">
        <div className="mb-2 px-3 text-xs font-medium text-slate-500 uppercase tracking-wider">
          功能菜单
        </div>
        <ul className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                    isActive
                      ? "bg-primary-500 text-white shadow-lg shadow-primary-500/30"
                      : "text-slate-300 hover:bg-slate-800 hover:text-white"
                  )}
                >
                  <Icon size={18} />
                  <span>{item.label}</span>
                  {item.path === "/task-queue" && (
                    <span className="ml-auto px-2 py-0.5 text-xs bg-danger-500 text-white rounded-full">
                      8
                    </span>
                  )}
                  {item.path === "/escalation" && (
                    <span className="ml-auto w-2 h-2 bg-warning-500 rounded-full animate-pulse" />
                  )}
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* 底部用户信息 */}
      <div className="p-3 border-t border-slate-800">
        <div className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-slate-800 cursor-pointer transition-colors">
          <div className="w-9 h-9 rounded-full bg-primary-500/20 flex items-center justify-center">
            <span className="text-sm font-medium text-primary-400">李</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">李护士</p>
            <p className="text-xs text-slate-500 truncate">随访专员</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
