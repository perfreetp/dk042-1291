import { useState, useEffect } from "react";
import {
  FileText,
  Search,
  Filter,
  Download,
  Calendar,
  Phone,
  Users,
  CheckCircle,
  AlertTriangle,
  Clock,
  ChevronRight,
  Edit2,
  Eye,
  UserX,
  XCircle,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Tag } from "@/components/ui/Tag";
import { Badge } from "@/components/ui/Status";
import { Drawer } from "@/components/ui/Drawer";
import { Textarea, Input, Select } from "@/components/ui/Input";
import { Timeline } from "@/components/business/Timeline";
import { useTaskStore } from "@/store/useTaskStore";
import { usePatientStore } from "@/store/usePatientStore";
import { useEscalationStore } from "@/store/useEscalationStore";
import { taskTypeMap, taskStatusMap } from "@/types/task";
import { callStatusMap, callResultMap } from "@/types/call";
import { formatDateTime, formatDuration, formatPhone } from "@/utils/date";
import { cn, generateId } from "@/lib/utils";
import type { CallLog, CallResult } from "@/types/call";
import type { Task } from "@/types/task";

type TabType = "all" | "completed" | "missed" | "escalated";

export default function Records() {
  const [activeTab, setActiveTab] = useState<TabType>("all");
  const [showDetail, setShowDetail] = useState(false);
  const [selectedRecordId, setSelectedRecordId] = useState<string | null>(null);
  const [showFillForm, setShowFillForm] = useState(false);

  // 补全记录表单
  const [fillForm, setFillForm] = useState({
    result: "confirmed" as CallResult,
    note: "",
    nextFollowUpTime: "",
    familyJoined: false,
    familyName: "",
    familyRelation: "",
    abnormalItems: [] as string[],
  });

  const { callLogs, tasks, updateCallLog, updateTask, getTaskById, addTask } = useTaskStore();
  const { patients, getPatientById } = usePatientStore();
  const { addRecord } = useEscalationStore();

  const selectedRecord = selectedRecordId ? callLogs.find((c) => c.id === selectedRecordId) : null;

  const filteredLogs = callLogs.filter((log) => {
    if (activeTab === "all") return true;
    if (activeTab === "completed") return log.result === "confirmed";
    if (activeTab === "missed") return log.status === "no_answer" || log.status === "busy";
    if (activeTab === "escalated") return log.result === "escalated";
    return true;
  });

  const handleViewDetail = (log: CallLog) => {
    setSelectedRecordId(log.id);
    setShowDetail(true);
  };

  const handleFillRecord = (log: CallLog) => {
    setSelectedRecordId(log.id);
    setFillForm({
      result: log.result,
      note: log.note,
      nextFollowUpTime: log.nextFollowUpTime || "",
      familyJoined: log.familyJoined,
      familyName: log.familyName || "",
      familyRelation: log.familyRelation || "",
      abnormalItems: [],
    });
    setShowFillForm(true);
  };

  const handleSaveFill = () => {
    if (!selectedRecordId) return;

    // 更新通话记录
    updateCallLog(selectedRecordId, {
      result: fillForm.result,
      note: fillForm.note,
      nextFollowUpTime: fillForm.nextFollowUpTime || undefined,
      familyJoined: fillForm.familyJoined,
      familyName: fillForm.familyName || undefined,
      familyRelation: fillForm.familyRelation || undefined,
      status: fillForm.result === "confirmed" || fillForm.result === "pending" ? "connected" : "no_answer",
    });

    // 更新对应任务状态
    const log = callLogs.find((c) => c.id === selectedRecordId);
    let createdTaskId: string | null = null;
    if (log) {
      const task = getTaskById(log.taskId);
      if (task) {
        let taskStatus = task.status;
        if (fillForm.result === "confirmed") {
          taskStatus = "completed";
        } else if (fillForm.result === "escalated") {
          taskStatus = "escalated";
        } else if (fillForm.result === "failed") {
          taskStatus = "failed";
        }
        updateTask(task.id, { status: taskStatus });

        // 场景1：结果为「已升级」 → 自动生成升级处置记录
        if (fillForm.result === "escalated") {
          const escalateReason = fillForm.abnormalItems.length > 0
            ? `回访发现异常：${fillForm.abnormalItems.join("、")}${fillForm.note ? "。" + fillForm.note : ""}`
            : (fillForm.note || "回访后需医生介入处理");

          addRecord({
            taskId: task.id,
            patientId: task.patientId,
            level: task.priority === "urgent" ? "level2" : "level1",
            reason: escalateReason,
            reporter: log.caller,
            reporterName: log.callerName,
            status: "pending",
            description: fillForm.note,
          });
        }

        // 场景2：填了下次随访时间 → 在任务队列中生成后续跟进任务
        if (fillForm.nextFollowUpTime) {
          const triggerDate = new Date(fillForm.nextFollowUpTime);
          const deadlineDate = new Date(triggerDate.getTime() + 24 * 60 * 60 * 1000); // 次日为截止

          const nextTask: Task = {
            id: generateId("T"),
            patientId: task.patientId,
            taskType: "follow_up",
            priority: fillForm.result === "pending" ? "high" : "medium",
            status: "pending",
            triggerTime: triggerDate.toISOString(),
            deadline: deadlineDate.toISOString(),
            retryCount: 0,
            maxRetryCount: 3,
            assignedTo: task.assignedTo,
            assignedName: task.assignedName,
            description: `常规随访跟进（上次回访安排：${fillForm.note || "持续关注"}）`,
            createTime: new Date().toISOString(),
            updateTime: new Date().toISOString(),
            patient: task.patient,
          };
          addTask(nextTask);
          createdTaskId = nextTask.id;
        }
      }
    }

    setShowFillForm(false);

    // 提示
    if (fillForm.result === "escalated" && fillForm.nextFollowUpTime) {
      alert("已创建升级处置记录，并生成后续随访任务");
    } else if (fillForm.result === "escalated") {
      alert("已创建升级处置记录");
    } else if (fillForm.nextFollowUpTime) {
      alert("已保存，并生成后续随访任务");
    } else {
      alert("保存成功");
    }
  };

  const handleToggleAbnormal = (item: string) => {
    setFillForm((prev) => ({
      ...prev,
      abnormalItems: prev.abnormalItems.includes(item)
        ? prev.abnormalItems.filter((i) => i !== item)
        : [...prev.abnormalItems, item],
    }));
  };

  const tabs = [
    { key: "all", label: "全部记录", count: callLogs.length },
    { key: "completed", label: "回访成功", count: callLogs.filter((l) => l.result === "confirmed").length },
    { key: "missed", label: "未接通", count: callLogs.filter((l) => l.status === "no_answer" || l.status === "busy").length },
    { key: "escalated", label: "已升级", count: callLogs.filter((l) => l.result === "escalated").length },
  ];

  const selectedTask = selectedRecord ? getTaskById(selectedRecord.taskId) : null;
  const selectedPatient = selectedRecord ? getPatientById(selectedRecord.patientId) : null;

  // 漏访清单
  const lostFollowPatients = patients.filter((p) => p.isLostFollow);
  const missedCallTasks = tasks.filter(
    (t) => (t.status === "failed" || t.status === "escalated") && t.retryCount >= t.maxRetryCount
  );

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">回访记录</h1>
          <p className="text-slate-500 mt-1">查看和管理所有回访记录</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" icon={<Download size={18} />}>
            导出记录
          </Button>
        </div>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-4 gap-5">
        <Card>
          <CardBody>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">今日回访</p>
                <p className="text-2xl font-bold text-slate-800 mt-1">
                  {callLogs.filter((l) => l.callTime && l.callTime.includes("2026-06-16")).length}
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-primary-50 flex items-center justify-center">
                <Phone size={22} className="text-primary-500" />
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">接通率</p>
                <p className="text-2xl font-bold text-success-600 mt-1">78%</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-success-50 flex items-center justify-center">
                <CheckCircle size={22} className="text-success-500" />
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">未接通</p>
                <p className="text-2xl font-bold text-warning-600 mt-1">
                  {callLogs.filter((l) => l.status === "no_answer").length}
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-warning-50 flex items-center justify-center">
                <XCircle size={22} className="text-warning-500" />
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">漏访人数</p>
                <p className="text-2xl font-bold text-danger-600 mt-1">{lostFollowPatients.length}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-danger-50 flex items-center justify-center">
                <UserX size={22} className="text-danger-500" />
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* 主内容区 */}
      <div className="grid grid-cols-12 gap-5">
        {/* 左侧 - 记录列表 */}
        <div className="col-span-8">
          <Card padding="none">
            {/* Tab切换 */}
            <div className="px-5 pt-4 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                {tabs.map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key as TabType)}
                    className={cn(
                      "px-4 py-2 text-sm font-medium rounded-lg transition-colors",
                      activeTab === tab.key
                        ? "bg-primary-50 text-primary-600"
                        : "text-slate-600 hover:bg-slate-50"
                    )}
                  >
                    {tab.label}
                    <span
                      className={cn(
                        "ml-1.5 px-1.5 py-0.5 text-xs rounded-full",
                        activeTab === tab.key ? "bg-primary-100 text-primary-700" : "bg-slate-100 text-slate-500"
                      )}
                    >
                      {tab.count}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* 搜索和筛选 */}
            <div className="px-5 py-3 border-b border-slate-100 flex items-center gap-4">
              <div className="relative flex-1 max-w-xs">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input
                  type="text"
                  placeholder="搜索患者姓名、手机号..."
                  className="w-full h-9 pl-9 pr-4 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-primary-400 focus:bg-white transition-colors"
                />
              </div>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <input
                    type="date"
                    className="h-9 px-3 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-primary-400"
                  />
                </div>
                <button className="flex items-center gap-1.5 px-3 py-2 text-sm text-slate-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors">
                  <Filter size={16} />
                  筛选
                </button>
              </div>
            </div>

            {/* 记录列表 */}
            <div className="divide-y divide-slate-50 max-h-[500px] overflow-y-auto">
              {filteredLogs.map((log) => {
                const task = getTaskById(log.taskId);
                const patient = getPatientById(log.patientId);

                return (
                  <div
                    key={log.id}
                    className="p-4 hover:bg-slate-50/50 cursor-pointer transition-colors"
                    onClick={() => handleViewDetail(log)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div
                          className={cn(
                            "w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0",
                            log.status === "connected" ? "bg-success-100" : "bg-slate-100"
                          )}
                        >
                          {log.status === "connected" ? (
                            <Phone size={18} className="text-success-600" />
                          ) : (
                            <Phone size={18} className="text-slate-400" />
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-slate-800">{patient?.name || "未知"}</span>
                            <Tag size="sm" variant={task ? (task.taskType === "abnormal_index" ? "danger" : "primary") : "default"}>
                              {task ? (taskTypeMap[task.taskType]?.label || task.taskType) : "回访"}
                            </Tag>
                            <Badge
                              variant={
                                log.result === "confirmed"
                                  ? "success"
                                  : log.result === "escalated"
                                  ? "danger"
                                  : "warning"
                              }
                              dot
                            >
                              {callResultMap[log.result]?.label || log.result || "待处理"}
                            </Badge>
                          </div>
                          <p className="text-sm text-slate-500 mt-1">{formatPhone(patient?.phone || "")}</p>
                          <p className="text-sm text-slate-600 mt-2 line-clamp-2">{log.note || "—"}</p>
                          <div className="flex items-center gap-4 mt-2 text-xs text-slate-400">
                            <span className="flex items-center gap-1">
                              <Clock size={12} />
                              {log.callTime ? formatDateTime(log.callTime, "MM-dd HH:mm") : "—"}
                            </span>
                            <span>通话时长: {log.duration !== undefined ? formatDuration(log.duration) : "—"}</span>
                            <span>处理人: {log.callerName || "—"}</span>
                            {log.familyJoined && (
                              <span className="flex items-center gap-1 text-primary-500">
                                <Users size={12} />
                                家属接听
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewDetail(log);
                          }}
                          className="p-2 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                          title="查看详情"
                        >
                          <Eye size={16} />
                        </button>
                        {log.result !== "confirmed" && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleFillRecord(log);
                            }}
                            className="p-2 text-slate-400 hover:text-warning-600 hover:bg-warning-50 rounded-lg transition-colors"
                            title="补全记录"
                          >
                            <Edit2 size={16} />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>

        {/* 右侧 - 漏访清单 */}
        <div className="col-span-4 space-y-5">
          {/* 漏访清单 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle size={18} className="text-danger-500" />
                漏访清单
              </CardTitle>
              <span className="text-xs text-danger-500 font-medium">{missedCallTasks.length}人</span>
            </CardHeader>
            <CardBody>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {missedCallTasks.map((task) => {
                  const patient = getPatientById(task.patientId);
                  return (
                    <div
                      key={task.id}
                      className="p-3 bg-danger-50 rounded-lg border border-danger-100"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-danger-800">{patient?.name || "未知"}</span>
                        <Tag size="sm" variant="danger">
                          多次未接
                        </Tag>
                      </div>
                      <p className="text-xs text-danger-600 mb-2">{task.description}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-danger-500">
                          重试: {task.retryCount}/{task.maxRetryCount}次
                        </span>
                        <button className="text-xs text-primary-600 hover:text-primary-700 flex items-center gap-0.5">
                          立即联系 <ChevronRight size={12} />
                        </button>
                      </div>
                    </div>
                  );
                })}
                {missedCallTasks.length === 0 && (
                  <div className="py-6 text-center text-slate-400 text-sm">
                    暂无漏访记录
                  </div>
                )}
              </div>
            </CardBody>
          </Card>

          {/* 失联患者 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserX size={18} className="text-warning-500" />
                失联患者
              </CardTitle>
              <span className="text-xs text-warning-600 font-medium">{lostFollowPatients.length}人</span>
            </CardHeader>
            <CardBody>
              <div className="space-y-3">
                {lostFollowPatients.map((patient) => (
                  <div key={patient.id} className="flex items-center gap-3 p-2 hover:bg-slate-50 rounded-lg cursor-pointer">
                    <div className="w-9 h-9 rounded-full bg-warning-100 flex items-center justify-center text-warning-700 font-medium text-sm">
                      {patient.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-700">{patient.name}</p>
                      <p className="text-xs text-slate-500 truncate">{patient.phone}</p>
                    </div>
                    <ChevronRight size={16} className="text-slate-300" />
                  </div>
                ))}
                {lostFollowPatients.length === 0 && (
                  <div className="py-6 text-center text-slate-400 text-sm">
                    暂无失联患者
                  </div>
                )}
              </div>
            </CardBody>
          </Card>

          {/* 快捷统计 */}
          <Card>
            <CardHeader>
              <CardTitle>本周回访统计</CardTitle>
            </CardHeader>
            <CardBody className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">总回访数</span>
                <span className="font-semibold text-slate-800">48次</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">成功接通</span>
                <span className="font-semibold text-success-600">37次</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">未接通</span>
                <span className="font-semibold text-warning-600">8次</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">升级处置</span>
                <span className="font-semibold text-danger-600">3次</span>
              </div>
              <div className="pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">接通率</span>
                  <span className="font-semibold text-primary-600">77.1%</span>
                </div>
                <div className="mt-2 h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-primary-400 to-primary-600 rounded-full" style={{ width: "77%" }} />
                </div>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>

      {/* 记录详情抽屉 */}
      <Drawer
        open={showDetail}
        onClose={() => setShowDetail(false)}
        title="回访详情"
        width="480px"
      >
        {selectedRecord && (
          <div className="space-y-5">
            {/* 患者信息 */}
            <div className="p-4 bg-slate-50 rounded-xl">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-lg">
                  {getPatientById(selectedRecord.patientId)?.name?.charAt(0) || "?"}
                </div>
                <div>
                  <h3 className="font-semibold text-slate-800">
                    {getPatientById(selectedRecord.patientId)?.name || "未知患者"}
                  </h3>
                  <p className="text-sm text-slate-500">
                    {getPatientById(selectedRecord.patientId)?.phone || ""}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-slate-400">孕周:</span>
                  <span className="ml-1 text-slate-700">
                    {getPatientById(selectedRecord.patientId)?.gestationalWeek !== undefined
                      ? `${getPatientById(selectedRecord.patientId)?.gestationalWeek}周${getPatientById(selectedRecord.patientId)?.gestationalDay ?? 0}天`
                      : "—"}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400">风险等级:</span>
                  <span className="ml-1 text-slate-700">
                    {getPatientById(selectedRecord.patientId)?.riskLevel === "high"
                      ? "高危"
                      : getPatientById(selectedRecord.patientId)?.riskLevel === "medium"
                      ? "中危"
                      : getPatientById(selectedRecord.patientId)?.riskLevel === "low"
                      ? "低危"
                      : getPatientById(selectedRecord.patientId)?.riskLevel || "—"}
                  </span>
                </div>
              </div>
            </div>

            {/* 通话信息 */}
            <div>
              <h4 className="text-sm font-medium text-slate-700 mb-3">通话信息</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">通话状态</span>
                  <Badge
                    variant={
                      selectedRecord.status === "connected"
                        ? "success"
                        : selectedRecord.status === "no_answer"
                        ? "warning"
                        : "danger"
                    }
                    dot
                  >
                    {callStatusMap[selectedRecord.status]?.label || selectedRecord.status || "未知"}
                  </Badge>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">通话结果</span>
                  {callResultMap[selectedRecord.result] ? (
                    <span className={cn("font-medium", callResultMap[selectedRecord.result].color)}>
                      {callResultMap[selectedRecord.result].label}
                    </span>
                  ) : (
                    <span className="font-medium text-slate-700">
                      {selectedRecord.result || "未填写"}
                    </span>
                  )}
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">通话时间</span>
                  <span className="text-slate-700">
                    {selectedRecord.callTime ? formatDateTime(selectedRecord.callTime) : "—"}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">通话时长</span>
                  <span className="text-slate-700">
                    {selectedRecord.duration !== undefined ? formatDuration(selectedRecord.duration) : "—"}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">处理人</span>
                  <span className="text-slate-700">{selectedRecord.callerName || "—"}</span>
                </div>
                {selectedRecord.nextFollowUpTime && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500">下次随访时间</span>
                    <span className="text-primary-600 font-medium">
                      {formatDateTime(selectedRecord.nextFollowUpTime)}
                    </span>
                  </div>
                )}
                {selectedRecord.familyJoined && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500">家属共同接听</span>
                    <span className="text-primary-600">
                      {selectedRecord.familyName || "家属"}
                      {selectedRecord.familyRelation ? `（${selectedRecord.familyRelation}）` : ""}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* 回访记录 */}
            <div>
              <h4 className="text-sm font-medium text-slate-700 mb-3">回访记录</h4>
              <div className="p-4 bg-slate-50 rounded-lg">
                <p className="text-sm text-slate-600 whitespace-pre-line">
                  {selectedRecord.note || "暂无记录"}
                </p>
              </div>
            </div>

            {/* 历史通话 */}
            <div>
              <h4 className="text-sm font-medium text-slate-700 mb-3">历史通话</h4>
              <div className="max-h-48 overflow-y-auto">
                <Timeline
                  items={[
                    {
                      id: "1",
                      title: "本次通话 - " + (selectedRecord.callerName || "—"),
                      description: selectedRecord.note || "（无记录）",
                      time: selectedRecord.callTime ? formatDateTime(selectedRecord.callTime, "MM-dd HH:mm") : "—",
                      type: selectedRecord.status === "connected" ? "success" : "warning",
                    },
                  ]}
                />
              </div>
            </div>
          </div>
        )}
      </Drawer>

      {/* 记录补全弹窗 */}
      <Drawer
        open={showFillForm}
        onClose={() => setShowFillForm(false)}
        title="补全记录"
        width="480px"
        footer={
          <div className="flex items-center justify-end gap-3">
            <Button variant="outline" onClick={() => setShowFillForm(false)}>
              取消
            </Button>
            <Button onClick={handleSaveFill}>保存</Button>
          </div>
        }
      >
        <div className="space-y-5">
          <div className="p-4 bg-warning-50 border border-warning-200 rounded-lg">
            <p className="text-sm text-warning-700">
              请补全本次回访的详细记录，确保信息完整准确
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              回访结果
            </label>
            <select
              value={fillForm.result}
              onChange={(e) => setFillForm({ ...fillForm, result: e.target.value as CallResult })}
              className="w-full h-10 px-3 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
            >
              <option value="confirmed">已确认</option>
              <option value="pending">待跟进</option>
              <option value="escalated">已升级</option>
              <option value="failed">失败</option>
              <option value="other">其他</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              回访内容
            </label>
            <Textarea
              placeholder="请详细记录回访内容..."
              rows={6}
              value={fillForm.note}
              onChange={(e) => setFillForm({ ...fillForm, note: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                下次随访时间
              </label>
              <input
                type="datetime-local"
                value={fillForm.nextFollowUpTime}
                onChange={(e) => setFillForm({ ...fillForm, nextFollowUpTime: e.target.value })}
                className="w-full h-10 px-3 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                是否家属接听
              </label>
              <select
                value={fillForm.familyJoined ? "yes" : "no"}
                onChange={(e) =>
                  setFillForm({ ...fillForm, familyJoined: e.target.value === "yes" })
                }
                className="w-full h-10 px-3 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
              >
                <option value="no">否</option>
                <option value="yes">是</option>
              </select>
            </div>
          </div>

          {fillForm.familyJoined && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  家属姓名
                </label>
                <Input
                  placeholder="请输入家属姓名"
                  value={fillForm.familyName}
                  onChange={(e) => setFillForm({ ...fillForm, familyName: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  与患者关系
                </label>
                <Input
                  placeholder="如：丈夫、母亲"
                  value={fillForm.familyRelation}
                  onChange={(e) => setFillForm({ ...fillForm, familyRelation: e.target.value })}
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              异常情况
            </label>
            <div className="flex flex-wrap gap-2">
              {["血压异常", "血糖异常", "胎动异常", "腹痛", "阴道出血", "其他"].map((item) => (
                <label
                  key={item}
                  className={cn(
                    "px-3 py-1.5 text-sm rounded-lg cursor-pointer transition-colors",
                    fillForm.abnormalItems.includes(item)
                      ? "bg-primary-100 text-primary-700"
                      : "bg-slate-100 hover:bg-primary-50 hover:text-primary-700"
                  )}
                >
                  <input
                    type="checkbox"
                    className="mr-1.5 hidden"
                    checked={fillForm.abnormalItems.includes(item)}
                    onChange={() => handleToggleAbnormal(item)}
                  />
                  {item}
                </label>
              ))}
            </div>
          </div>
        </div>
      </Drawer>
    </div>
  );
}
