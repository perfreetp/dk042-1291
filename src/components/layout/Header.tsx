import { Bell, Search, ChevronDown, Clock, User } from "lucide-react";
import { useState } from "react";

export function Header() {
  const [showNotifications, setShowNotifications] = useState(false);

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 sticky top-0 z-30">
      {/* 左侧 - 页面标题 */}
      <div className="flex items-center gap-4">
        <h2 className="text-lg font-semibold text-slate-800">首页工作台</h2>
        <span className="text-xs text-slate-400">今天是 2026年6月16日 星期二</span>
      </div>

      {/* 中间 - 搜索框 */}
      <div className="flex-1 max-w-md mx-8">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="搜索患者姓名、手机号、任务编号..."
            className="w-full h-9 pl-10 pr-4 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-primary-400 focus:bg-white transition-colors"
          />
        </div>
      </div>

      {/* 右侧 - 操作区 */}
      <div className="flex items-center gap-4">
        {/* 值班状态 */}
        <div className="flex items-center gap-2 px-3 py-1.5 bg-success-50 text-success-700 rounded-lg text-sm">
          <span className="w-2 h-2 bg-success-500 rounded-full animate-pulse" />
          <span>值班中</span>
          <Clock size={14} />
        </div>

        {/* 通知 */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <Bell size={20} />
            <span className="absolute top-1 right-1 w-4 h-4 bg-danger-500 text-white text-xs rounded-full flex items-center justify-center">
              3
            </span>
          </button>

          {showNotifications && (
            <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-card-hover border border-slate-100 overflow-hidden z-50 animate-slide-up">
              <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                <span className="font-semibold text-slate-800">通知消息</span>
                <button className="text-xs text-primary-500 hover:text-primary-600">全部已读</button>
              </div>
              <div className="max-h-80 overflow-y-auto">
                {[
                  { type: "urgent", title: "紧急上报 - 王芳", desc: "血压升高至160/100mmHg", time: "5分钟前" },
                  { type: "warning", title: "任务超时提醒", desc: "张红的产检提醒任务即将超时", time: "30分钟前" },
                  { type: "info", title: "系统提醒", desc: "今日待处理任务8条", time: "2小时前" },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className="px-4 py-3 hover:bg-slate-50 cursor-pointer transition-colors border-b border-slate-50 last:border-0"
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                          item.type === "urgent"
                            ? "bg-danger-500"
                            : item.type === "warning"
                            ? "bg-warning-500"
                            : "bg-primary-500"
                        }`}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-700">{item.title}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{item.desc}</p>
                        <p className="text-xs text-slate-400 mt-1">{item.time}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 用户头像 */}
        <button className="flex items-center gap-2 hover:bg-slate-50 px-2 py-1.5 rounded-lg transition-colors">
          <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
            <User size={16} className="text-primary-600" />
          </div>
          <span className="text-sm font-medium text-slate-700">李护士</span>
          <ChevronDown size={16} className="text-slate-400" />
        </button>
      </div>
    </header>
  );
}
