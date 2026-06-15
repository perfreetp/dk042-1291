import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ListTodo,
  Filter,
  Search,
  ChevronDown,
  PhoneCall,
  RefreshCw,
  Download,
  MoreHorizontal,
  AlertTriangle,
  Calendar,
  UserX,
  Clock,
  CheckCircle,
  XCircle,
  ArrowUpRight,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Tag } from "@/components/ui/Tag";
import { Badge } from "@/components/ui/Status";
import { Input, Select } from "@/components/ui/Input";
import { TaskCard } from "@/components/business/TaskCard";
import { useTaskStore } from "@/store/useTaskStore";
import { taskTypeMap, taskStatusMap, taskPriorityMap } from "@/types/task";
import { cn } from "@/lib/utils";
import { formatDateTime, getRemainingTime } from "@/utils/date";

type ViewMode = "card" | "list";

export default function TaskQueue() {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<ViewMode>("card");
  const [selectedTasks, setSelectedTasks] = useState<string[]>([]);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedAssignee, setSelectedAssignee] = useState("");
  const [selectedAssigneeName, setSelectedAssigneeName] = useState("");

  const {
    tasks,
    filterStatus,
    filterPriority,
    filterType,
    searchKeyword,
    setFilterStatus,
    setFilterPriority,
    setFilterType,
    setSearchKeyword,
    getFilteredTasks,
    updateTaskStatus,
    incrementRetryCount,
    batchAssignTasks,
    batchMarkSmsSent,
  } = useTaskStore();

  const filteredTasks = getFilteredTasks();
  const pendingCount = tasks.filter((t) => t.status === "pending").length;
  const processingCount = tasks.filter((t) => t.status === "processing").length;
  const completedCount = tasks.filter((t) => t.status === "completed").length;
  const escalatedCount = tasks.filter((t) => t.status === "escalated").length;

  const handleTaskClick = (taskId: string) => {
    navigate(`/callback?taskId=${taskId}`);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedTasks(filteredTasks.map((t) => t.id));
    } else {
      setSelectedTasks([]);
    }
  };

  const handleSelectTask = (taskId: string, checked: boolean) => {
    if (checked) {
      setSelectedTasks([...selectedTasks, taskId]);
    } else {
      setSelectedTasks(selectedTasks.filter((id) => id !== taskId));
    }
  };

  const handleBatchAssign = () => {
    setShowAssignModal(true);
  };

  const handleConfirmAssign = () => {
    if (!selectedAssignee || !selectedAssigneeName) {
      alert("请选择负责人");
      return;
    }
    batchAssignTasks(selectedTasks, selectedAssignee, selectedAssigneeName);
    setShowAssignModal(false);
    setSelectedAssignee("");
    setSelectedAssigneeName("");
  };

  const handleBatchSms = () => {
    if (selectedTasks.length === 0) {
      alert("请先选择任务");
      return;
    }
    batchMarkSmsSent(selectedTasks);
    alert(`已为 ${selectedTasks.length} 条任务标记短信已发送`);
  };

  const statusTabs = [
    { key: "all", label: "全部", count: tasks.length, color: "text-slate-600" },
    { key: "pending", label: "待处理", count: pendingCount, color: "text-warning-600" },
    { key: "processing", label: "处理中", count: processingCount, color: "text-primary-600" },
    { key: "completed", label: "已完成", count: completedCount, color: "text-success-600" },
    { key: "escalated", label: "已升级", count: escalatedCount, color: "text-danger-600" },
  ];

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">任务队列</h1>
          <p className="text-slate-500 mt-1">管理和处理所有回访任务</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" icon={<RefreshCw size={18} />}>
            刷新
          </Button>
          <Button variant="outline" icon={<Download size={18} />}>
            导出
          </Button>
          <Button icon={<PhoneCall size={18} />} onClick={() => navigate("/callback")}>
            开始回访
          </Button>
        </div>
      </div>

      {/* 状态标签 */}
      <div className="flex items-center gap-2 p-1 bg-white rounded-xl shadow-card border border-slate-100 w-fit">
        {statusTabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilterStatus(tab.key as typeof filterStatus)}
            className={cn(
              "px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200",
              "flex items-center gap-2",
              filterStatus === tab.key
                ? "bg-primary-50 text-primary-600"
                : "text-slate-600 hover:bg-slate-50"
            )}
          >
            <span>{tab.label}</span>
            <span
              className={cn(
                "px-1.5 py-0.5 text-xs rounded-full",
                filterStatus === tab.key
                  ? "bg-primary-100 text-primary-700"
                  : "bg-slate-100 text-slate-600"
              )}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* 筛选栏 */}
      <Card padding="none">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-4 flex-1">
            {/* 搜索框 */}
            <div className="relative max-w-xs flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                type="text"
                placeholder="搜索患者姓名、手机号..."
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                className="w-full h-9 pl-9 pr-4 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-primary-400 focus:bg-white transition-colors"
              />
            </div>

            {/* 优先级筛选 */}
            <div className="relative">
              <select
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value as typeof filterPriority)}
                className="h-9 pl-3 pr-8 text-sm bg-slate-50 border border-slate-200 rounded-lg appearance-none cursor-pointer focus:outline-none focus:border-primary-400 focus:bg-white"
              >
                <option value="all">全部优先级</option>
                <option value="urgent">紧急</option>
                <option value="high">高</option>
                <option value="medium">中</option>
                <option value="low">低</option>
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
            </div>

            {/* 类型筛选 */}
            <div className="relative">
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as typeof filterType)}
                className="h-9 pl-3 pr-8 text-sm bg-slate-50 border border-slate-200 rounded-lg appearance-none cursor-pointer focus:outline-none focus:border-primary-400 focus:bg-white"
              >
                <option value="all">全部类型</option>
                <option value="prenatal_check">产检提醒</option>
                <option value="abnormal_index">异常指标</option>
                <option value="follow_up">随访回访</option>
                <option value="revisit_miss">复诊未到</option>
                <option value="lost_contact">失联补联</option>
                <option value="emergency">紧急上报</option>
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
            </div>

            <button className="flex items-center gap-1.5 px-3 py-2 text-sm text-slate-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors">
              <Filter size={16} />
              更多筛选
            </button>
          </div>

          {/* 视图切换 */}
          <div className="flex items-center gap-1 p-0.5 bg-slate-100 rounded-lg">
            <button
              onClick={() => setViewMode("card")}
              className={cn(
                "p-1.5 rounded-md transition-colors",
                viewMode === "card" ? "bg-white text-primary-600 shadow-sm" : "text-slate-400 hover:text-slate-600"
              )}
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="7" height="7" />
                <rect x="14" y="3" width="7" height="7" />
                <rect x="3" y="14" width="7" height="7" />
                <rect x="14" y="14" width="7" height="7" />
              </svg>
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={cn(
                "p-1.5 rounded-md transition-colors",
                viewMode === "list" ? "bg-white text-primary-600 shadow-sm" : "text-slate-400 hover:text-slate-600"
              )}
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </button>
          </div>
        </div>

        {/* 批量操作栏 */}
        {selectedTasks.length > 0 && (
          <div className="px-4 py-3 bg-primary-50 border-b border-primary-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={selectedTasks.length === filteredTasks.length && filteredTasks.length > 0}
                onChange={(e) => handleSelectAll(e.target.checked)}
                className="w-4 h-4 rounded border-slate-300 text-primary-500 focus:ring-primary-500"
              />
              <span className="text-sm text-primary-700">
                已选择 <span className="font-semibold">{selectedTasks.length}</span> 条任务
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="outline" onClick={handleBatchAssign}>
                批量分配
              </Button>
              <Button size="sm" variant="outline" onClick={handleBatchSms}>
                发送短信
              </Button>
              <Button
                size="sm"
                onClick={() => {
                  setSelectedTasks([]);
                }}
              >
                取消选择
              </Button>
            </div>
          </div>
        )}

        <CardBody>
          {viewMode === "card" ? (
            /* 卡片视图 */
            <div className="grid grid-cols-2 gap-4">
              {filteredTasks.map((task) => (
                <div key={task.id} className="relative">
                  {selectedTasks.length > 0 && (
                    <input
                      type="checkbox"
                      checked={selectedTasks.includes(task.id)}
                      onChange={(e) => handleSelectTask(task.id, e.target.checked)}
                      className="absolute top-4 left-4 z-10 w-4 h-4 rounded border-slate-300 text-primary-500 focus:ring-primary-500"
                    />
                  )}
                  <TaskCard task={task} onClick={() => handleTaskClick(task.id)} />
                </div>
              ))}
            </div>
          ) : (
            /* 列表视图 */
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="text-left py-3 px-4 w-10">
                      <input
                        type="checkbox"
                        checked={selectedTasks.length === filteredTasks.length && filteredTasks.length > 0}
                        onChange={(e) => handleSelectAll(e.target.checked)}
                        className="w-4 h-4 rounded border-slate-300 text-primary-500 focus:ring-primary-500"
                      />
                    </th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-slate-500 uppercase tracking-wider">
                      患者信息
                    </th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-slate-500 uppercase tracking-wider">
                      任务类型
                    </th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-slate-500 uppercase tracking-wider">
                      优先级
                    </th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-slate-500 uppercase tracking-wider">
                      状态
                    </th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-slate-500 uppercase tracking-wider">
                      剩余时间
                    </th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-slate-500 uppercase tracking-wider">
                      负责人
                    </th>
                    <th className="text-right py-3 px-4 text-xs font-medium text-slate-500 uppercase tracking-wider">
                      操作
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTasks.map((task) => {
                    const typeInfo = taskTypeMap[task.taskType];
                    const statusInfo = taskStatusMap[task.status];
                    const priorityInfo = taskPriorityMap[task.priority];
                    const remaining = getRemainingTime(task.deadline);

                    return (
                      <tr
                        key={task.id}
                        className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors cursor-pointer"
                        onClick={() => handleTaskClick(task.id)}
                      >
                        <td className="py-3 px-4" onClick={(e) => e.stopPropagation()}>
                          <input
                            type="checkbox"
                            checked={selectedTasks.includes(task.id)}
                            onChange={(e) => handleSelectTask(task.id, e.target.checked)}
                            className="w-4 h-4 rounded border-slate-300 text-primary-500 focus:ring-primary-500"
                          />
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-medium text-sm">
                              {task.patient?.name?.charAt(0) || "?"}
                            </div>
                            <div>
                              <p className="font-medium text-slate-800">{task.patient?.name || "未知"}</p>
                              <p className="text-xs text-slate-500">{task.patient?.phone}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <span className={cn("text-sm", typeInfo.color)}>{typeInfo.label}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <Tag
                            size="sm"
                            variant={
                              task.priority === "urgent"
                                ? "danger"
                                : task.priority === "high"
                                ? "warning"
                                : task.priority === "medium"
                                ? "primary"
                                : "default"
                            }
                          >
                            {priorityInfo.label}
                          </Tag>
                        </td>
                        <td className="py-3 px-4">
                          <span className={cn("text-xs font-medium px-2 py-1 rounded-full", statusInfo.bgColor, statusInfo.color)}>
                            {statusInfo.label}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className={cn("text-sm font-medium", remaining.isOverdue ? "text-danger-600" : "text-slate-600")}>
                            {remaining.text}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-sm text-slate-600">{task.assignedName}</span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleTaskClick(task.id);
                              }}
                              className="p-1.5 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                              title="查看详情"
                            >
                              <ArrowUpRight size={16} />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleTaskClick(task.id);
                              }}
                              className="p-1.5 text-slate-400 hover:text-success-600 hover:bg-success-50 rounded-lg transition-colors"
                              title="开始回访"
                            >
                              <PhoneCall size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {filteredTasks.length === 0 && (
            <div className="py-16 text-center">
              <ListTodo size={48} className="mx-auto text-slate-300 mb-4" />
              <p className="text-slate-500">暂无任务</p>
              <p className="text-sm text-slate-400 mt-1">没有符合筛选条件的任务</p>
            </div>
          )}
        </CardBody>
      </Card>

      {/* 分页（简单展示） */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">
          共 <span className="font-medium text-slate-700">{filteredTasks.length}</span> 条任务
        </p>
        <div className="flex items-center gap-1">
          <button className="px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
            上一页
          </button>
          <button className="px-3 py-1.5 text-sm text-white bg-primary-500 rounded-lg">1</button>
          <button className="px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
            2
          </button>
          <button className="px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
            3
          </button>
          <button className="px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
            下一页
          </button>
        </div>
      </div>

      {/* 批量分配弹窗 */}
      {showAssignModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowAssignModal(false)}
          />
          <div className="relative bg-white rounded-xl shadow-xl p-6 w-[400px] animate-slide-up">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">批量分配任务</h3>
            <p className="text-sm text-slate-500 mb-4">
              将选中的 <span className="font-medium text-primary-600">{selectedTasks.length}</span> 条任务分配给：
            </p>

            <div className="space-y-2 mb-6">
              {[
                { id: "N001", name: "李护士", role: "随访专员" },
                { id: "N002", name: "王护士", role: "随访专员" },
                { id: "D001", name: "陈医生", role: "主治医师" },
                { id: "D002", name: "刘医生", role: "副主任医师" },
              ].map((person) => (
                <div
                  key={person.id}
                  onClick={() => {
                    setSelectedAssignee(person.id);
                    setSelectedAssigneeName(person.name);
                  }}
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all",
                    selectedAssignee === person.id
                      ? "border-primary-500 bg-primary-50"
                      : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                  )}
                >
                  <div
                    className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center text-white font-medium",
                      selectedAssignee === person.id ? "bg-primary-500" : "bg-slate-300"
                    )}
                  >
                    {person.name.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-slate-800">{person.name}</p>
                    <p className="text-xs text-slate-500">{person.role}</p>
                  </div>
                  {selectedAssignee === person.id && (
                    <div className="w-5 h-5 rounded-full bg-primary-500 flex items-center justify-center">
                      <svg
                        className="w-3 h-3 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowAssignModal(false)}>
                取消
              </Button>
              <Button onClick={handleConfirmAssign}>确认分配</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
