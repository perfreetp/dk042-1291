import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
  Phone,
  PhoneOff,
  PhoneIncoming,
  User,
  Users,
  Calendar,
  MapPin,
  AlertTriangle,
  Clock,
  CheckCircle,
  XCircle,
  ChevronLeft,
  ChevronRight,
  Send,
  Mic,
  Volume2,
  FileText,
  ShieldAlert,
  MessageSquare,
  MoreHorizontal,
  RefreshCw,
  Save,
  AlertCircle,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Tag } from "@/components/ui/Tag";
import { Badge } from "@/components/ui/Status";
import { Textarea } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { CallScript } from "@/components/business/CallScript";
import { Timeline } from "@/components/business/Timeline";
import { PatientCard } from "@/components/business/PatientCard";
import { useTaskStore } from "@/store/useTaskStore";
import { usePatientStore } from "@/store/usePatientStore";
import { useEscalationStore } from "@/store/useEscalationStore";
import { riskLevelMap } from "@/types/patient";
import { taskTypeMap, taskStatusMap, taskPriorityMap } from "@/types/task";
import { callStatusMap, callResultMap } from "@/types/call";
import {
  formatDateTime,
  formatDuration,
  getWeeksDaysText,
  formatPhone,
  getRemainingTime,
} from "@/utils/date";
import { cn } from "@/lib/utils";
import type { CallStatus, CallResult } from "@/types/call";

export default function Callback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const taskId = searchParams.get("taskId");
  const patientId = searchParams.get("patientId");

  const { tasks, getTaskById, updateTaskStatus, getCallLogsByTaskId, addCallLog, incrementRetryCount } = useTaskStore();
  const { getPatientById, patients } = usePatientStore();
  const { addRecord } = useEscalationStore();

  const [currentTaskIndex, setCurrentTaskIndex] = useState(0);
  const [isCalling, setIsCalling] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [callStatus, setCallStatus] = useState<CallStatus | null>(null);
  const [callResult, setCallResult] = useState<CallResult>("pending");
  const [callNote, setCallNote] = useState("");
  const [showResultModal, setShowResultModal] = useState(false);
  const [showEscalationModal, setShowEscalationModal] = useState(false);
  const [escalationReason, setEscalationReason] = useState("");
  const [familyJoined, setFamilyJoined] = useState(false);
  const [smsContent, setSmsContent] = useState("");

  const pendingTasks = tasks.filter((t) => t.status === "pending" || t.status === "processing");
  const currentTask = taskId ? getTaskById(taskId) : pendingTasks[currentTaskIndex];
  const currentPatient = currentTask
    ? currentTask.patient || getPatientById(currentTask.patientId)
    : patientId
    ? getPatientById(patientId)
    : null;

  const callLogs = currentTask ? getCallLogsByTaskId(currentTask.id) : [];

  // 通话计时器
  useEffect(() => {
    let interval: number | null = null;
    if (isCalling) {
      interval = window.setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isCalling]);

  const handleStartCall = () => {
    setIsCalling(true);
    setCallDuration(0);
    setCallStatus(null);
    if (currentTask) {
      updateTaskStatus(currentTask.id, "processing");
    }
  };

  const handleEndCall = (status: CallStatus) => {
    setIsCalling(false);
    setCallStatus(status);
    setShowResultModal(true);
  };

  const handleSaveResult = () => {
    if (currentTask && callStatus) {
      addCallLog({
        id: `C${Date.now()}`,
        taskId: currentTask.id,
        patientId: currentTask.patientId,
        caller: "U001",
        callerName: "李护士",
        callTime: new Date().toISOString(),
        duration: callDuration,
        status: callStatus,
        result: callResult,
        note: callNote,
        familyJoined: familyJoined,
      });

      if (callStatus === "connected" && callResult === "confirmed") {
        updateTaskStatus(currentTask.id, "completed");
      } else if (callStatus === "connected" && callResult === "escalated") {
        updateTaskStatus(currentTask.id, "escalated");
      } else if (callStatus !== "connected") {
        incrementRetryCount(currentTask.id);
        if (currentTask.retryCount + 1 >= currentTask.maxRetryCount) {
          updateTaskStatus(currentTask.id, "escalated");
        } else {
          updateTaskStatus(currentTask.id, "pending");
        }
      }
    }

    setShowResultModal(false);
    setCallNote("");
    setCallStatus(null);
    setCallResult("pending");
    setFamilyJoined(false);
  };

  const handleNextTask = () => {
    if (currentTaskIndex < pendingTasks.length - 1) {
      setCurrentTaskIndex(currentTaskIndex + 1);
    }
  };

  const handlePrevTask = () => {
    if (currentTaskIndex > 0) {
      setCurrentTaskIndex(currentTaskIndex - 1);
    }
  };

  const handleEscalation = () => {
    if (currentTask && currentPatient) {
      addRecord({
        taskId: currentTask.id,
        patientId: currentPatient.id,
        level: "level1",
        reason: escalationReason || "电话随访发现异常，需医生评估",
        reporter: "U001",
        reporterName: "李护士",
        status: "pending",
      });
      updateTaskStatus(currentTask.id, "escalated");
      setShowEscalationModal(false);
      setEscalationReason("");
    }
  };

  const handleSendSms = () => {
    if (currentTask) {
      alert("短信发送成功！");
    }
  };

  const timelineItems = callLogs.map((log) => ({
    id: log.id,
    title: `${callStatusMap[log.status].label} - ${log.callerName}`,
    description: log.note,
    time: formatDateTime(log.callTime, "MM-dd HH:mm"),
    type:
      log.status === "connected"
        ? "success"
        : log.status === "no_answer" || log.status === "busy"
        ? "warning"
        : "danger",
  }));

  if (!currentPatient) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center">
          <Phone size={48} className="mx-auto text-slate-300 mb-4" />
          <p className="text-slate-500 mb-4">暂无待回访任务</p>
          <Button onClick={() => navigate("/task-queue")}>返回任务队列</Button>
        </div>
      </div>
    );
  }

  const riskInfo = riskLevelMap[currentPatient.riskLevel];

  return (
    <div className="space-y-6">
      {/* 顶部导航栏 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/task-queue")}
            className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <ChevronLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">回访处理</h1>
            <p className="text-slate-500 text-sm mt-0.5">
              共 {pendingTasks.length} 个待处理任务，当前第 {currentTaskIndex + 1} 个
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrevTask}
            disabled={currentTaskIndex === 0}
            className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft size={20} />
          </button>
          <span className="text-sm text-slate-500 px-2">
            {currentTaskIndex + 1} / {pendingTasks.length}
          </span>
          <button
            onClick={handleNextTask}
            disabled={currentTaskIndex >= pendingTasks.length - 1}
            className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      {/* 主内容区 - 三栏布局 */}
      <div className="grid grid-cols-12 gap-5">
        {/* 左侧 - 患者信息 */}
        <div className="col-span-3 space-y-5">
          {/* 患者基本信息卡 */}
          <Card padding="none" className="overflow-hidden">
            <div className={cn("p-5 text-white", riskInfo.bgColor.replace("border-", "bg-").replace("50", "500"))}>
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center text-white text-xl font-bold">
                  {currentPatient.name.charAt(0)}
                </div>
                <div>
                  <h2 className="text-lg font-bold">{currentPatient.name}</h2>
                  <p className="text-sm opacity-90">
                    {currentPatient.age}岁 · 孕{getWeeksDaysText(currentPatient.gestationalWeek, currentPatient.gestationalDay)}
                  </p>
                </div>
              </div>
              <div className="mt-4 flex flex-wrap gap-1.5">
                {currentPatient.highRiskType.map((type, idx) => (
                  <span key={idx} className="px-2 py-0.5 text-xs bg-white/20 rounded-full">
                    {type}
                  </span>
                ))}
              </div>
            </div>

            <div className="p-5 space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <Phone size={16} className="text-slate-400" />
                <span className="text-slate-700">{currentPatient.phone}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Users size={16} className="text-slate-400" />
                <span className="text-slate-700">
                  {currentPatient.familyContact}（{currentPatient.familyPhone}）
                </span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Calendar size={16} className="text-slate-400" />
                <span className="text-slate-700">预产期: {currentPatient.expectedDate}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <MapPin size={16} className="text-slate-400" />
                <span className="text-slate-700 text-ellipsis-1">{currentPatient.address}</span>
              </div>
            </div>
          </Card>

          {/* 当前任务信息 */}
          {currentTask && (
            <Card>
              <CardHeader>
                <CardTitle>当前任务</CardTitle>
                <Badge
                  variant={
                    currentTask.priority === "urgent"
                      ? "danger"
                      : currentTask.priority === "high"
                      ? "warning"
                      : "primary"
                  }
                  dot
                >
                  {taskPriorityMap[currentTask.priority].label}
                </Badge>
              </CardHeader>
              <CardBody className="space-y-3">
                <div>
                  <p className="text-xs text-slate-400 mb-1">任务类型</p>
                  <p className="text-sm font-medium text-slate-700">
                    {taskTypeMap[currentTask.taskType].label}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 mb-1">任务描述</p>
                  <p className="text-sm text-slate-600">{currentTask.description}</p>
                </div>
                {currentTask.relatedIndex && (
                  <div className="p-3 bg-danger-50 rounded-lg">
                    <p className="text-xs text-danger-400 mb-1">异常指标</p>
                    <p className="text-sm font-medium text-danger-700">
                      {currentTask.relatedIndex}: {currentTask.relatedValue}
                    </p>
                    {currentTask.relatedNormalRange && (
                      <p className="text-xs text-danger-500 mt-1">
                        正常范围: {currentTask.relatedNormalRange}
                      </p>
                    )}
                  </div>
                )}
                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                  <span className="text-xs text-slate-400">
                    剩余: {getRemainingTime(currentTask.deadline).text}
                  </span>
                  <span className="text-xs text-slate-400">
                    重试: {currentTask.retryCount}/{currentTask.maxRetryCount}
                  </span>
                </div>
              </CardBody>
            </Card>
          )}

          {/* 历史通话记录 */}
          <Card>
            <CardHeader>
              <CardTitle>通话记录</CardTitle>
              <span className="text-xs text-slate-400">{callLogs.length}条</span>
            </CardHeader>
            <CardBody>
              <div className="max-h-64 overflow-y-auto">
                <Timeline items={timelineItems} />
              </div>
            </CardBody>
          </Card>
        </div>

        {/* 中间 - 语音脚本和通话区 */}
        <div className="col-span-6 space-y-5">
          {/* 通话状态条 */}
          <Card className={cn(isCalling && "ring-2 ring-danger-500 animate-pulse-slow")}>
            <CardBody>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div
                    className={cn(
                      "w-16 h-16 rounded-full flex items-center justify-center",
                      isCalling
                        ? "bg-danger-500 text-white animate-pulse"
                        : "bg-slate-100 text-slate-500"
                    )}
                  >
                    {isCalling ? <PhoneIncoming size={28} /> : <Phone size={28} />}
                  </div>
                  <div>
                    <p className="text-lg font-semibold text-slate-800">
                      {isCalling ? "通话中..." : callStatus ? callStatusMap[callStatus].label : "准备呼叫"}
                    </p>
                    <p className="text-sm text-slate-500">
                      {isCalling
                        ? `通话时长: ${formatDuration(callDuration)}`
                        : callStatus
                        ? `通话时长: ${formatDuration(callDuration)}`
                        : `号码: ${currentPatient.phone}`}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {!isCalling && !callStatus && (
                    <Button
                      size="lg"
                      variant="success"
                      icon={<Phone size={20} />}
                      onClick={handleStartCall}
                    >
                      开始呼叫
                    </Button>
                  )}
                  {isCalling && (
                    <div className="flex items-center gap-2">
                      <button className="p-3 text-slate-600 hover:bg-slate-100 rounded-full transition-colors">
                        <Mic size={20} />
                      </button>
                      <button className="p-3 text-slate-600 hover:bg-slate-100 rounded-full transition-colors">
                        <Volume2 size={20} />
                      </button>
                      <Button
                        size="lg"
                        variant="danger"
                        icon={<PhoneOff size={20} />}
                        onClick={() => handleEndCall("connected")}
                      >
                        结束通话
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              {!isCalling && callStatus && (
                <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleEndCall("no_answer")}
                      className="px-3 py-1.5 text-sm text-warning-600 bg-warning-50 hover:bg-warning-100 rounded-lg transition-colors"
                    >
                      <XCircle size={14} className="inline mr-1" />
                      未接听
                    </button>
                    <button
                      onClick={() => handleEndCall("busy")}
                      className="px-3 py-1.5 text-sm text-warning-600 bg-warning-50 hover:bg-warning-100 rounded-lg transition-colors"
                    >
                      占线
                    </button>
                    <button
                      onClick={() => handleEndCall("wrong_number")}
                      className="px-3 py-1.5 text-sm text-danger-600 bg-danger-50 hover:bg-danger-100 rounded-lg transition-colors"
                    >
                      号码错误
                    </button>
                  </div>
                  <button
                    onClick={handleStartCall}
                    className="px-3 py-1.5 text-sm text-primary-600 bg-primary-50 hover:bg-primary-100 rounded-lg transition-colors"
                  >
                    <RefreshCw size={14} className="inline mr-1" />
                    重新拨打
                  </button>
                </div>
              )}
            </CardBody>
          </Card>

          {/* 语音脚本 */}
          <CallScript patientName={currentPatient.name} />

          {/* 快捷操作 */}
          <div className="grid grid-cols-4 gap-3">
            <button
              onClick={() => setFamilyJoined(!familyJoined)}
              className={cn(
                "p-4 rounded-xl border transition-all duration-200 text-center",
                familyJoined
                  ? "border-success-300 bg-success-50 text-success-700"
                  : "border-slate-200 hover:border-primary-300 hover:bg-primary-50/50"
              )}
            >
              <Users size={24} className="mx-auto mb-2" />
              <p className="text-sm font-medium">家属共同接听</p>
            </button>
            <button
              onClick={() => setShowEscalationModal(true)}
              className="p-4 rounded-xl border border-slate-200 hover:border-danger-300 hover:bg-danger-50/50 transition-all duration-200 text-center"
            >
              <ShieldAlert size={24} className="mx-auto mb-2 text-danger-500" />
              <p className="text-sm font-medium text-slate-700">紧急升级</p>
            </button>
            <button
              onClick={handleSendSms}
              className="p-4 rounded-xl border border-slate-200 hover:border-primary-300 hover:bg-primary-50/50 transition-all duration-200 text-center"
            >
              <MessageSquare size={24} className="mx-auto mb-2 text-primary-500" />
              <p className="text-sm font-medium text-slate-700">发送短信</p>
            </button>
            <button className="p-4 rounded-xl border border-slate-200 hover:border-primary-300 hover:bg-primary-50/50 transition-all duration-200 text-center">
              <FileText size={24} className="mx-auto mb-2 text-slate-500" />
              <p className="text-sm font-medium text-slate-700">查看病历</p>
            </button>
          </div>
        </div>

        {/* 右侧 - 记录和操作 */}
        <div className="col-span-3 space-y-5">
          {/* 回访结果记录 */}
          <Card>
            <CardHeader>
              <CardTitle>回访记录</CardTitle>
              <Badge variant="warning" dot>
                待填写
              </Badge>
            </CardHeader>
            <CardBody className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  回访结果
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(callResultMap).map(([key, val]) => (
                    <button
                      key={key}
                      onClick={() => setCallResult(key as CallResult)}
                      className={cn(
                        "px-3 py-2 text-sm rounded-lg border transition-colors",
                        callResult === key
                          ? "border-primary-500 bg-primary-50 text-primary-700"
                          : "border-slate-200 hover:border-slate-300 text-slate-600"
                      )}
                    >
                      {val.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  回访备注
                </label>
                <Textarea
                  placeholder="请输入回访内容和患者情况..."
                  rows={5}
                  value={callNote}
                  onChange={(e) => setCallNote(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  下次随访时间
                </label>
                <input
                  type="datetime-local"
                  className="w-full h-10 px-3 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
                />
              </div>

              <Button fullWidth icon={<Save size={18} />} onClick={handleSaveResult}>
                保存记录
              </Button>
            </CardBody>
          </Card>

          {/* 风险提示 */}
          {currentPatient.riskLevel === "high" && (
            <div className="p-4 bg-danger-50 border border-danger-200 rounded-xl">
              <div className="flex items-start gap-3">
                <AlertTriangle size={20} className="text-danger-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-danger-800">高危孕妇注意事项</p>
                  <ul className="mt-2 text-sm text-danger-700 space-y-1">
                    <li>• 密切关注血压、血糖变化</li>
                    <li>• 注意观察胎动情况</li>
                    <li>• 如有异常立即就医</li>
                    <li>• 定期产检不能遗漏</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* 快速操作 */}
          <Card>
            <CardHeader>
              <CardTitle>快捷操作</CardTitle>
            </CardHeader>
            <CardBody className="space-y-2">
              <button className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors text-left">
                <Calendar size={18} className="text-primary-500" />
                <span className="text-sm text-slate-700">预约下次产检</span>
              </button>
              <button className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors text-left">
                <MessageSquare size={18} className="text-success-500" />
                <span className="text-sm text-slate-700">发送健康指导短信</span>
              </button>
              <button className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors text-left">
                <FileText size={18} className="text-warning-500" />
                <span className="text-sm text-slate-700">补充随访记录</span>
              </button>
              <button className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors text-left">
                <AlertCircle size={18} className="text-danger-500" />
                <span className="text-sm text-slate-700">标记为异常</span>
              </button>
            </CardBody>
          </Card>
        </div>
      </div>

      {/* 结果确认弹窗 */}
      <Modal
        open={showResultModal}
        onClose={() => setShowResultModal(false)}
        title="确认回访结果"
        footer={
          <div className="flex items-center justify-end gap-3">
            <Button variant="outline" onClick={() => setShowResultModal(false)}>
              取消
            </Button>
            <Button onClick={handleSaveResult}>确认保存</Button>
          </div>
        }
      >
        <div className="space-y-4">
          <div className="p-4 bg-slate-50 rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-slate-500">通话状态</span>
              <span className="text-sm font-medium text-slate-700">
                {callStatus && callStatusMap[callStatus].label}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-500">通话时长</span>
              <span className="text-sm font-medium text-slate-700">
                {formatDuration(callDuration)}
              </span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              回访结果
            </label>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(callResultMap).map(([key, val]) => (
                <button
                  key={key}
                  onClick={() => setCallResult(key as CallResult)}
                  className={cn(
                    "px-3 py-2 text-sm rounded-lg border transition-colors",
                    callResult === key
                      ? "border-primary-500 bg-primary-50 text-primary-700"
                      : "border-slate-200 hover:border-slate-300 text-slate-600"
                  )}
                >
                  {val.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              回访备注
            </label>
            <Textarea
              placeholder="请输入回访内容..."
              rows={3}
              value={callNote}
              onChange={(e) => setCallNote(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="familyJoined"
              checked={familyJoined}
              onChange={(e) => setFamilyJoined(e.target.checked)}
              className="w-4 h-4 rounded border-slate-300 text-primary-500 focus:ring-primary-500"
            />
            <label htmlFor="familyJoined" className="text-sm text-slate-600">
              家属共同接听
            </label>
          </div>
        </div>
      </Modal>

      {/* 升级处置弹窗 */}
      <Modal
        open={showEscalationModal}
        onClose={() => setShowEscalationModal(false)}
        title="紧急升级上报"
        footer={
          <div className="flex items-center justify-end gap-3">
            <Button variant="outline" onClick={() => setShowEscalationModal(false)}>
              取消
            </Button>
            <Button variant="danger" onClick={handleEscalation}>
              确认升级
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <div className="p-4 bg-danger-50 border border-danger-200 rounded-lg">
            <div className="flex items-center gap-2 text-danger-700">
              <ShieldAlert size={20} />
              <span className="font-medium">升级至一级值班医生</span>
            </div>
            <p className="text-sm text-danger-600 mt-2">
              升级后将通知值班医生进行评估处理，请填写升级原因
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              升级原因
            </label>
            <Textarea
              placeholder="请详细描述需要升级的原因..."
              rows={4}
              value={escalationReason}
              onChange={(e) => setEscalationReason(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium text-slate-700">快速选择原因</p>
            <div className="flex flex-wrap gap-2">
              {["患者自述不适", "指标异常加重", "联系不上患者", "胎动异常", "阴道出血/流水", "其他原因"].map(
                (reason) => (
                  <button
                    key={reason}
                    onClick={() => setEscalationReason(reason)}
                    className="px-3 py-1.5 text-xs bg-slate-100 text-slate-600 rounded-full hover:bg-primary-100 hover:text-primary-700 transition-colors"
                  >
                    {reason}
                  </button>
                )
              )}
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded-lg">
            <p className="text-xs text-slate-500">
              值班医生: <span className="font-medium text-slate-700">陈医生</span>
            </p>
            <p className="text-xs text-slate-500 mt-1">
              联系电话: <span className="font-medium text-slate-700">13900139000</span>
            </p>
          </div>
        </div>
      </Modal>
    </div>
  );
}
