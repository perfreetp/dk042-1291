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
  AlertTriangle,
  Calendar,
  UserX,
  Clock,
  ArrowUpRight,
  X,
  User,
  MessageSquare,
  ShieldAlert,
  History,
  UserPlus,
  Mail,
  FileText,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Tag } from "@/components/ui/Tag";
import { Badge } from "@/components/ui/Status";
import { Drawer } from "@/components/ui/Drawer";
import { TaskCard } from "@/components/business/TaskCard";
import { useTaskStore } from "@/store/useTaskStore";
import { usePatientStore } from "@/store/usePatientStore";
import { useEscalationStore } from "@/store/useEscalationStore";
import { taskTypeMap, taskStatusMap, taskPriorityMap } from "@/types/task";
import { callStatusMap, callResultMap } from "@/types/call";
import { escalationLevelMap, escalationStatusMap } from "@/types/escalation";
import { cn, generateId } from "@/lib/utils";
import { formatDateTime, getRemainingTime } from "@/utils/date";
import type { Task } from "@/types/task";

type ViewMode = "card" | "list";
type DetailTab = "info" | "sms" | "call" | "escalation" | "history";

export default function TaskQueue() {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<ViewMode>("card");
  const [selectedTasks, setSelectedTasks] = useState<string[]>([]);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedAssignee, setSelectedAssignee] = useState("");
  const [selectedAssigneeName, setSelectedAssigneeName] = useState("");
  const [showDetail, setShowDetail] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [detailTab, setDetailTab] = useState<DetailTab>("info");

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
    getTaskById,
    getCallLogsByTaskId,
  } = useTaskStore();

  const { getPatientById } = usePatientStore();
  const { getRecordsByTaskId } = useEscalationStore();

  const filteredTasks = getFilteredTasks();
  const pendingCount = tasks.filter((t) => t.status === "pending").length;
  const processingCount = tasks.filter((t) => t.status === "processing").length;
  const completedCount = tasks.filter((t) => t.status === "completed").length;
  const escalatedCount = tasks.filter((t) => t.status === "escalated").length;

  const selectedTask = selectedTaskId ? getTaskById(selectedTaskId) : null;
  const selectedPatient = selectedTask ? getPatientById(selectedTask.patientId) : null;
  const taskCallLogs = selectedTaskId ? getCallLogsByTaskId(selectedTaskId) : [];
  const taskEscalations = selectedTaskId ? getRecordsByTaskId(selectedTaskId) : [];

  const handleTaskClick = (taskId: string) => {
    setSelectedTaskId(taskId);
    setDetailTab("info");
    setShowDetail(true);
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

  const detailTabs: { key: DetailTab; label: string; icon: React.ReactNode }[] = [
    { key: "info", label: "患者信息", icon: <User size={16} /> },
    { key: "sms", label: "短信记录", icon: <Mail size={16} /> },
    { key: "call", label: "回访记录", icon: <PhoneCall size={16} /> },
    { key: "escalation", label: "升级记录", icon: <ShieldAlert size={16} /> },
    { key: "history", label: "变更历史", icon: <History size={16} /> },
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
                                navigate(`/callback?taskId=${task.id}`);
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

      {/* 分页 */}
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

      {/* 任务详情侧栏 */}
      <Drawer
        open={showDetail}
        onClose={() => setShowDetail(false)}
        title="任务详情"
        width="560px"
      >
        {selectedTask ? (
          <div className="space-y-5">
            {/* 任务和患者概要 */}
            <div className="p-4 bg-gradient-to-br from-primary-50 to-white rounded-xl border border-primary-100">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-lg">
                    {selectedPatient?.name?.charAt(0) || selectedTask.patient?.name?.charAt(0) || "?"}
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-800 text-lg">{selectedPatient?.name || selectedTask.patient?.name || "未知患者"}</h3>
                    <p className="text-sm text-slate-500">
                      {selectedPatient
                        ? `孕${selectedPatient.gestationalWeek ?? "-"}周${selectedPatient.gestationalDay ?? 0}天`
                        : "—"}{" "}
                      · {selectedPatient?.phone || selectedTask.patient?.phone || "无联系方式"}
                    </p>
                  </div>
                </div>
                <span
                  className={cn(
                    "text-xs font-medium px-2.5 py-1 rounded-full",
                    taskStatusMap[selectedTask.status]?.bgColor || "bg-slate-100",
                    taskStatusMap[selectedTask.status]?.color || "text-slate-600"
                  )}
                >
                  {taskStatusMap[selectedTask.status]?.label || selectedTask.status}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-slate-500">任务编号</p>
                  <p className="font-mono font-medium text-slate-700">{selectedTask.id}</p>
                </div>
                <div>
                  <p className="text-slate-500">任务类型</p>
                  <p className={cn("font-medium", taskTypeMap[selectedTask.taskType]?.color || "text-slate-600")}>
                    {taskTypeMap[selectedTask.taskType]?.label || selectedTask.taskType}
                  </p>
                </div>
                <div>
                  <p className="text-slate-500">优先级</p>
                  <p className="font-medium text-slate-700">
                    {taskPriorityMap[selectedTask.priority]?.label || selectedTask.priority}
                  </p>
                </div>
                <div>
                  <p className="text-slate-500">负责人</p>
                  <p className="font-medium text-slate-700">{selectedTask.assignedName || "未分配"}</p>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-primary-100">
                <p className="text-sm text-slate-500 mb-1">任务说明</p>
                <p className="text-sm text-slate-700">{selectedTask.description || "—"}</p>
              </div>
            </div>

            {/* Tab 切换 */}
            <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl overflow-x-auto">
              {detailTabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setDetailTab(tab.key)}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg whitespace-nowrap transition-colors",
                    detailTab === tab.key
                      ? "bg-white text-primary-600 shadow-sm"
                      : "text-slate-500 hover:text-slate-700"
                  )}
                >
                  {tab.icon}
                  {tab.label}
                  {tab.key === "sms" && selectedTask.smsHistory && selectedTask.smsHistory.length > 0 && (
                    <span className="ml-1 px-1.5 py-0.5 text-xs bg-primary-100 text-primary-700 rounded-full">
                      {selectedTask.smsHistory.length}
                    </span>
                  )}
                  {tab.key === "call" && taskCallLogs.length > 0 && (
                    <span className="ml-1 px-1.5 py-0.5 text-xs bg-primary-100 text-primary-700 rounded-full">
                      {taskCallLogs.length}
                    </span>
                  )}
                  {tab.key === "escalation" && taskEscalations.length > 0 && (
                    <span className="ml-1 px-1.5 py-0.5 text-xs bg-danger-100 text-danger-700 rounded-full">
                      {taskEscalations.length}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Tab 内容 - 患者信息 */}
            {detailTab === "info" && (
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-slate-700 mb-3 flex items-center gap-2">
                    <User size={16} className="text-primary-500" />
                    基本信息
                  </h4>
                  <div className="grid grid-cols-2 gap-3 p-4 bg-slate-50 rounded-xl text-sm">
                    <div>
                      <p className="text-slate-500 mb-1">姓名</p>
                      <p className="font-medium text-slate-700">{selectedPatient?.name || "—"}</p>
                    </div>
                    <div>
                      <p className="text-slate-500 mb-1">性别</p>
                      <p className="font-medium text-slate-700">{selectedPatient?.gender || "—"}</p>
                    </div>
                    <div>
                      <p className="text-slate-500 mb-1">年龄</p>
                      <p className="font-medium text-slate-700">
                        {selectedPatient?.age ? `${selectedPatient.age}岁` : "—"}
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-500 mb-1">手机号</p>
                      <p className="font-medium text-slate-700">{selectedPatient?.phone || "—"}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-slate-500 mb-1">身份证号</p>
                      <p className="font-medium text-slate-700 font-mono">
                        {selectedPatient?.idCard || "—"}
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-slate-700 mb-3 flex items-center gap-2">
                    <Calendar size={16} className="text-primary-500" />
                    孕期信息
                  </h4>
                  <div className="grid grid-cols-2 gap-3 p-4 bg-slate-50 rounded-xl text-sm">
                    <div>
                      <p className="text-slate-500 mb-1">孕周</p>
                      <p className="font-medium text-slate-700">
                        {selectedPatient?.gestationalWeek !== undefined
                          ? `${selectedPatient.gestationalWeek}周${selectedPatient.gestationalDay ?? 0}天`
                          : "—"}
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-500 mb-1">预产期</p>
                      <p className="font-medium text-slate-700">{selectedPatient?.expectedDate || "—"}</p>
                    </div>
                    <div>
                      <p className="text-slate-500 mb-1">高危等级</p>
                      <p className="font-medium text-danger-600">
                        {selectedPatient?.riskLevel || "—"}
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-500 mb-1">档案编号</p>
                      <p className="font-medium text-slate-700 font-mono">
                        {selectedPatient?.patientNo || "—"}
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-slate-700 mb-3 flex items-center gap-2">
                    <AlertTriangle size={16} className="text-warning-500" />
                    高危因素
                  </h4>
                  <div className="p-4 bg-warning-50 rounded-xl border border-warning-100">
                    {selectedPatient?.riskFactors && selectedPatient.riskFactors.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {selectedPatient.riskFactors.map((factor, idx) => (
                          <span
                            key={idx}
                            className="px-2.5 py-1 text-xs bg-white text-warning-700 rounded-md border border-warning-200"
                          >
                            {factor}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-slate-500">暂无高危因素记录</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Tab 内容 - 短信记录 */}
            {detailTab === "sms" && (
              <div className="space-y-3">
                {selectedTask.smsHistory && selectedTask.smsHistory.length > 0 ? (
                  selectedTask.smsHistory.map((sms) => (
                    <div
                      key={sms.id}
                      className="p-4 bg-slate-50 rounded-xl border border-slate-100"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-success-100 flex items-center justify-center">
                            <Mail size={14} className="text-success-600" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-slate-700">{sms.sentByName || "系统"}</p>
                            <p className="text-xs text-slate-500">{sms.sentAt ? formatDateTime(sms.sentAt) : "—"}</p>
                          </div>
                        </div>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-success-100 text-success-700">
                          已发送
                        </span>
                      </div>
                      <div className="mt-2 p-3 bg-white rounded-lg border border-slate-100">
                        <p className="text-sm text-slate-700">{sms.content || "—"}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-16 text-center">
                    <Mail size={48} className="mx-auto text-slate-300 mb-4" />
                    <p className="text-slate-500">暂无短信记录</p>
                    <p className="text-sm text-slate-400 mt-1">可在列表勾选任务后点击「发送短信」</p>
                  </div>
                )}
              </div>
            )}

            {/* Tab 内容 - 回访记录 */}
            {detailTab === "call" && (
              <div className="space-y-3">
                {taskCallLogs.length > 0 ? (
                  taskCallLogs.map((log) => {
                    const statusInfo = callStatusMap[log.status];
                    const resultInfo = callResultMap[log.result];
                    return (
                      <div
                        key={log.id}
                        className="p-4 bg-slate-50 rounded-xl border border-slate-100"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
                              <PhoneCall size={14} className="text-primary-600" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-slate-700">{log.callerName || "—"}</p>
                              <p className="text-xs text-slate-500">
                                {log.callTime ? formatDateTime(log.callTime) : "—"} · 通话{" "}
                                {log.duration !== undefined ? `${Math.floor(log.duration / 60)}分${log.duration % 60}秒` : "—"}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className={cn("text-xs px-2 py-0.5 rounded-full", statusInfo?.bgColor || "bg-slate-100", statusInfo?.color || "text-slate-600")}>
                              {statusInfo?.label || log.status}
                            </span>
                            {resultInfo && (
                              <span className={cn("text-xs px-2 py-0.5 rounded-full bg-slate-100", resultInfo.color)}>
                                {resultInfo.label}
                              </span>
                            )}
                          </div>
                        </div>
                        {log.note && (
                          <div className="mt-2 p-3 bg-white rounded-lg border border-slate-100">
                            <p className="text-xs text-slate-500 mb-1">通话记录</p>
                            <p className="text-sm text-slate-700">{log.note}</p>
                          </div>
                        )}
                        {log.familyJoined && (
                          <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-500">
                            <UserPlus size={12} />
                            家属共同接听：{log.familyName || "—"}（{log.familyRelation || "—"}）
                          </div>
                        )}
                        {log.nextFollowUpTime && (
                          <div className="mt-2 flex items-center gap-1.5 text-xs text-primary-600">
                            <Clock size={12} />
                            下次随访时间：{formatDateTime(log.nextFollowUpTime)}
                          </div>
                        )}
                      </div>
                    );
                  })
                ) : (
                  <div className="py-16 text-center">
                    <PhoneCall size={48} className="mx-auto text-slate-300 mb-4" />
                    <p className="text-slate-500">暂无回访记录</p>
                    <p className="text-sm text-slate-400 mt-1">点击「开始回访」处理此任务</p>
                  </div>
                )}
              </div>
            )}

            {/* Tab 内容 - 升级记录 */}
            {detailTab === "escalation" && (
              <div className="space-y-3">
                {taskEscalations.length > 0 ? (
                  taskEscalations.map((record) => {
                    const levelInfo = escalationLevelMap[record.level];
                    const statusInfo = escalationStatusMap[record.status];
                    return (
                      <div
                        key={record.id}
                        className="p-4 bg-danger-50/50 rounded-xl border border-danger-100"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-danger-100 flex items-center justify-center">
                              <ShieldAlert size={14} className="text-danger-600" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-slate-700">
                                {levelInfo?.label || record.level}
                              </p>
                              <p className="text-xs text-slate-500">
                                {record.reporterName || "—"} 上报 · {record.createTime ? formatDateTime(record.createTime) : "—"}
                              </p>
                            </div>
                          </div>
                          <span className={cn("text-xs px-2 py-0.5 rounded-full", statusInfo?.bgColor || "bg-slate-100", statusInfo?.color || "text-slate-600")}>
                            {statusInfo?.label || record.status}
                          </span>
                        </div>
                        <div className="mt-2 p-3 bg-white rounded-lg border border-danger-100">
                          <p className="text-xs text-slate-500 mb-1">升级原因</p>
                          <p className="text-sm text-danger-700">{record.reason || "—"}</p>
                        </div>
                        {record.result && (
                          <div className="mt-2 p-3 bg-success-50 rounded-lg border border-success-100">
                            <p className="text-xs text-slate-500 mb-1">处置结果</p>
                            <p className="text-sm text-success-700">{record.result}</p>
                          </div>
                        )}
                      </div>
                    );
                  })
                ) : (
                  <div className="py-16 text-center">
                    <ShieldAlert size={48} className="mx-auto text-slate-300 mb-4" />
                    <p className="text-slate-500">暂无升级记录</p>
                    <p className="text-sm text-slate-400 mt-1">该任务暂未升级处置</p>
                  </div>
                )}
              </div>
            )}

            {/* Tab 内容 - 变更历史 */}
            {detailTab === "history" && (
              <div className="space-y-3">
                <div>
                  <h4 className="text-sm font-medium text-slate-700 mb-3 flex items-center gap-2">
                    <UserPlus size={16} className="text-primary-500" />
                    负责人变更
                  </h4>
                  {selectedTask.assignHistory && selectedTask.assignHistory.length > 0 ? (
                    <div className="space-y-2">
                      {selectedTask.assignHistory.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl"
                        >
                          <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
                            <User size={14} className="text-primary-600" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <p className="text-sm text-slate-700">
                                由 <span className="font-medium">{item.assignedByName || "系统"}</span> 分配给{" "}
                                <span className="font-medium text-primary-600">{item.assignedName || "—"}</span>
                              </p>
                              <p className="text-xs text-slate-500">
                                {item.assignedAt ? formatDateTime(item.assignedAt) : "—"}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-8 text-center p-4 bg-slate-50 rounded-xl">
                      <UserPlus size={32} className="mx-auto text-slate-300 mb-2" />
                      <p className="text-sm text-slate-500">暂无负责人变更记录</p>
                    </div>
                  )}
                </div>

                <div>
                  <h4 className="text-sm font-medium text-slate-700 mb-3 flex items-center gap-2">
                    <FileText size={16} className="text-primary-500" />
                    任务时间线
                  </h4>
                  <div className="space-y-0">
                    <div className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <div className="w-3 h-3 rounded-full bg-success-500 mt-1.5" />
                        <div className="w-0.5 flex-1 bg-slate-200 my-1 min-h-[24px]" />
                      </div>
                      <div className="pb-3">
                        <p className="text-sm font-medium text-slate-700">任务创建</p>
                        <p className="text-xs text-slate-500">{selectedTask.createTime ? formatDateTime(selectedTask.createTime) : "—"}</p>
                      </div>
                    </div>
                    {selectedTask.smsSent && (
                      <div className="flex gap-3">
                        <div className="flex flex-col items-center">
                          <div className="w-3 h-3 rounded-full bg-primary-500 mt-1.5" />
                          <div className="w-0.5 flex-1 bg-slate-200 my-1 min-h-[24px]" />
                        </div>
                        <div className="pb-3">
                          <p className="text-sm font-medium text-slate-700">短信已发送</p>
                          <p className="text-xs text-slate-500">
                            {selectedTask.smsSendTime ? formatDateTime(selectedTask.smsSendTime) : ""}
                          </p>
                        </div>
                      </div>
                    )}
                    <div className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <div className="w-3 h-3 rounded-full bg-slate-300 mt-1.5" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-700">最后更新</p>
                        <p className="text-xs text-slate-500">{selectedTask.updateTime ? formatDateTime(selectedTask.updateTime) : "—"}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 底部操作栏 */}
            <div className="pt-4 border-t border-slate-100 sticky bottom-0 bg-white">
              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant="outline"
                  fullWidth
                  icon={<ArrowUpRight size={16} />}
                  onClick={() => {
                    setShowDetail(false);
                    navigate("/records");
                  }}
                >
                  回访记录
                </Button>
                <Button
                  fullWidth
                  icon={<PhoneCall size={16} />}
                  onClick={() => {
                    setShowDetail(false);
                    navigate(`/callback?taskId=${selectedTask.id}`);
                  }}
                >
                  去回访
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="py-16 text-center">
            <ListTodo size={48} className="mx-auto text-slate-300 mb-4" />
            <p className="text-slate-500">请选择一个任务查看详情</p>
          </div>
        )}
      </Drawer>
    </div>
  );
}
