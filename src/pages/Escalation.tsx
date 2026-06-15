import { useState } from "react";
import {
  ShieldAlert,
  AlertTriangle,
  ChevronRight,
  Clock,
  User,
  Phone,
  CheckCircle,
  Clock4,
  ArrowUpRight,
  Bell,
  Moon,
  FileText,
  MessageSquare,
  Users,
  Activity,
  Heart,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Tag } from "@/components/ui/Tag";
import { Badge } from "@/components/ui/Status";
import { Drawer } from "@/components/ui/Drawer";
import { Textarea } from "@/components/ui/Input";
import { Timeline } from "@/components/business/Timeline";
import { useEscalationStore } from "@/store/useEscalationStore";
import { usePatientStore } from "@/store/usePatientStore";
import { escalationLevelMap, escalationStatusMap } from "@/types/escalation";
import { formatDateTime, formatRelativeTime } from "@/utils/date";
import { cn } from "@/lib/utils";
import type { EscalationRecord, EscalationLevel } from "@/types/escalation";

type TabType = "pending" | "processing" | "resolved" | "all";

export default function Escalation() {
  const [activeTab, setActiveTab] = useState<TabType>("pending");
  const [showDetail, setShowDetail] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<EscalationRecord | null>(null);
  const [handleNote, setHandleNote] = useState("");
  const [showEscalateModal, setShowEscalateModal] = useState(false);
  const [escalateLevel, setEscalateLevel] = useState<EscalationLevel>("level2");
  const [escalateReason, setEscalateReason] = useState("");

  const { records, updateRecordStatus, escalateLevel: doEscalate, getPendingRecords, getTodayRecords } =
    useEscalationStore();
  const { getPatientById } = usePatientStore();

  const pendingCount = records.filter((r) => r.status === "pending").length;
  const processingCount = records.filter((r) => r.status === "processing").length;
  const resolvedCount = records.filter((r) => r.status === "resolved").length;

  const filteredRecords = records
    .filter((record) => {
      if (activeTab === "all") return true;
      return record.status === activeTab;
    })
    .sort((a, b) => new Date(b.createTime).getTime() - new Date(a.createTime).getTime());

  const handleViewDetail = (record: EscalationRecord) => {
    setSelectedRecord(record);
    setShowDetail(true);
  };

  const handleStartProcess = (record: EscalationRecord) => {
    updateRecordStatus(record.id, "processing", "D001", "陈医生");
    setSelectedRecord({ ...record, status: "processing", handler: "D001", handlerName: "陈医生" });
  };

  const handleResolve = () => {
    if (selectedRecord) {
      updateRecordStatus(selectedRecord.id, "resolved");
      setShowDetail(false);
    }
  };

  const handleEscalate = () => {
    if (selectedRecord) {
      doEscalate(selectedRecord.id, escalateLevel, escalateReason);
      setShowEscalateModal(false);
      setEscalateReason("");
    }
  };

  const tabs = [
    { key: "pending", label: "待处理", count: pendingCount, color: "text-warning-600" },
    { key: "processing", label: "处理中", count: processingCount, color: "text-primary-600" },
    { key: "resolved", label: "已解决", count: resolvedCount, color: "text-success-600" },
    { key: "all", label: "全部", count: records.length, color: "text-slate-600" },
  ];

  const selectedPatient = selectedRecord ? getPatientById(selectedRecord.patientId) : null;

  const todayRecords = getTodayRecords();
  const pendingRecords = getPendingRecords();
  const nightShiftRecords = records.filter((r) => r.isNightShift);

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">升级处置</h1>
          <p className="text-slate-500 mt-1">管理和处理紧急升级病例</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-danger-50 text-danger-700 rounded-lg">
            <span className="w-2 h-2 bg-danger-500 rounded-full animate-pulse" />
            <span className="text-sm font-medium">待处理: {pendingCount}</span>
          </div>
        </div>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-4 gap-5">
        <Card className="border-danger-200 bg-gradient-to-br from-danger-50 to-white">
          <CardBody>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-danger-600">今日紧急上报</p>
                <p className="text-2xl font-bold text-danger-700 mt-1">{todayRecords.length}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-danger-500 flex items-center justify-center">
                <ShieldAlert size={22} className="text-white" />
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">待处理</p>
                <p className="text-2xl font-bold text-warning-600 mt-1">{pendingCount}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-warning-50 flex items-center justify-center">
                <Clock size={22} className="text-warning-500" />
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">处理中</p>
                <p className="text-2xl font-bold text-primary-600 mt-1">{processingCount}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-primary-50 flex items-center justify-center">
                <Activity size={22} className="text-primary-500" />
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">夜间值守</p>
                <p className="text-2xl font-bold text-purple-600 mt-1">{nightShiftRecords.length}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center">
                <Moon size={22} className="text-purple-500" />
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* 主内容区 */}
      <div className="grid grid-cols-12 gap-5">
        {/* 左侧 - 升级列表 */}
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

            {/* 列表 */}
            <div className="divide-y divide-slate-50 max-h-[600px] overflow-y-auto">
              {filteredRecords.map((record) => {
                const patient = getPatientById(record.patientId);
                const levelInfo = escalationLevelMap[record.level];
                const statusInfo = escalationStatusMap[record.status];

                return (
                  <div
                    key={record.id}
                    className={cn(
                      "p-4 hover:bg-slate-50/50 cursor-pointer transition-colors",
                      record.status === "pending" && record.level === "level3"
                        ? "bg-danger-50/30"
                        : ""
                    )}
                    onClick={() => handleViewDetail(record)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <div
                          className={cn(
                            "w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0",
                            levelInfo.bgColor
                          )}
                        >
                          <ShieldAlert size={22} className={levelInfo.color} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold text-slate-800">{patient?.name || "未知患者"}</span>
                            <Tag size="sm" variant={record.level === "level1" ? "warning" : "danger"}>
                              {levelInfo.label}
                            </Tag>
                            {record.isNightShift && (
                              <Tag size="sm" variant="info">
                                <Moon size={10} className="inline mr-1" />
                                夜间
                              </Tag>
                            )}
                          </div>
                          <p className="text-sm text-slate-600 line-clamp-1">{record.reason}</p>
                          <div className="flex items-center gap-4 mt-2 text-xs text-slate-400">
                            <span className="flex items-center gap-1">
                              <Clock size={12} />
                              {formatRelativeTime(record.createTime)}
                            </span>
                            <span className="flex items-center gap-1">
                              <User size={12} />
                              上报人: {record.reporterName}
                            </span>
                            {record.handlerName && (
                              <span className="flex items-center gap-1">
                                <Heart size={12} />
                                处理人: {record.handlerName}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className={cn("text-xs font-medium px-2.5 py-1 rounded-full", statusInfo.bgColor, statusInfo.color)}>
                          {statusInfo.label}
                        </span>
                        {record.status === "pending" && (
                          <Button size="sm" onClick={(e) => {
                            e.stopPropagation();
                            handleStartProcess(record);
                          }}>
                            开始处理
                          </Button>
                        )}
                        <ChevronRight size={18} className="text-slate-300" />
                      </div>
                    </div>

                    {/* 紧急上报码 */}
                    {record.emergencyCode && (
                      <div className="mt-3 pl-16">
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-lg">
                          <span className="text-xs text-slate-500">紧急上报码:</span>
                          <span className="text-sm font-mono font-bold text-slate-700">
                            {record.emergencyCode}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {filteredRecords.length === 0 && (
              <div className="py-16 text-center">
                <ShieldAlert size={48} className="mx-auto text-slate-300 mb-4" />
                <p className="text-slate-500">暂无升级记录</p>
              </div>
            )}
          </Card>
        </div>

        {/* 右侧 - 值班信息和快捷操作 */}
        <div className="col-span-4 space-y-5">
          {/* 当前值班医生 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User size={18} className="text-primary-500" />
                今日值班
              </CardTitle>
            </CardHeader>
            <CardBody className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-primary-50 rounded-xl">
                <div className="w-12 h-12 rounded-full bg-primary-500 flex items-center justify-center text-white font-bold text-lg">
                  陈
                </div>
                <div>
                  <p className="font-semibold text-slate-800">陈医生</p>
                  <p className="text-sm text-slate-500">主治医师 · 产科</p>
                </div>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">联系电话</span>
                  <span className="text-slate-700 font-medium">13900139000</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">值班时间</span>
                  <span className="text-slate-700">白班 08:00-20:00</span>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* 升级流程 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ArrowUpRight size={18} className="text-danger-500" />
                升级流程
              </CardTitle>
            </CardHeader>
            <CardBody>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-full bg-warning-100 text-warning-600 flex items-center justify-center text-sm font-bold flex-shrink-0">
                    1
                  </div>
                  <div>
                    <p className="font-medium text-slate-700">一级 - 值班医生</p>
                    <p className="text-xs text-slate-500 mt-0.5">普通异常情况，值班医生处理</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-full bg-danger-100 text-danger-600 flex items-center justify-center text-sm font-bold flex-shrink-0">
                    2
                  </div>
                  <div>
                    <p className="font-medium text-slate-700">二级 - 科室主任</p>
                    <p className="text-xs text-slate-500 mt-0.5">严重异常，需科室主任介入</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-full bg-danger-200 text-danger-700 flex items-center justify-center text-sm font-bold flex-shrink-0">
                    3
                  </div>
                  <div>
                    <p className="font-medium text-slate-700">三级 - 医务科</p>
                    <p className="text-xs text-slate-500 mt-0.5">重大紧急事件，医务科协调</p>
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* 快捷操作 */}
          <Card>
            <CardHeader>
              <CardTitle>快捷操作</CardTitle>
            </CardHeader>
            <CardBody className="space-y-2">
              <button className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors text-left">
                <Phone size={18} className="text-success-500" />
                <span className="text-sm text-slate-700">联系值班医生</span>
              </button>
              <button className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors text-left">
                <MessageSquare size={18} className="text-primary-500" />
                <span className="text-sm text-slate-700">发送紧急通知</span>
              </button>
              <button className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors text-left">
                <FileText size={18} className="text-warning-500" />
                <span className="text-sm text-slate-700">查看处置记录</span>
              </button>
              <button className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors text-left">
                <Users size={18} className="text-purple-500" />
                <span className="text-sm text-slate-700">联系家属</span>
              </button>
            </CardBody>
          </Card>
        </div>
      </div>

      {/* 详情抽屉 */}
      <Drawer
        open={showDetail}
        onClose={() => setShowDetail(false)}
        title="升级详情"
        width="500px"
      >
        {selectedRecord && selectedPatient && (
          <div className="space-y-5">
            {/* 患者信息 */}
            <div className="p-4 bg-slate-50 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-danger-100 flex items-center justify-center text-danger-700 font-bold text-lg">
                  {selectedPatient.name.charAt(0)}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-slate-800">{selectedPatient.name}</h3>
                  <p className="text-sm text-slate-500">
                    孕{selectedPatient.gestationalWeek}周{selectedPatient.gestationalDay}天 · {selectedPatient.phone}
                  </p>
                </div>
                <Tag variant="danger">{escalationLevelMap[selectedRecord.level].label}</Tag>
              </div>
            </div>

            {/* 基本信息 */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500">紧急上报码</span>
                <span className="font-mono font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                  {selectedRecord.emergencyCode}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500">状态</span>
                <Badge
                  variant={
                    selectedRecord.status === "pending"
                      ? "warning"
                      : selectedRecord.status === "processing"
                      ? "primary"
                      : "success"
                  }
                  dot
                >
                  {escalationStatusMap[selectedRecord.status].label}
                </Badge>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500">上报时间</span>
                <span className="text-slate-700">{formatDateTime(selectedRecord.createTime)}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500">上报人</span>
                <span className="text-slate-700">{selectedRecord.reporterName}</span>
              </div>
              {selectedRecord.handlerName && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">处理人</span>
                  <span className="text-slate-700">{selectedRecord.handlerName}</span>
                </div>
              )}
              {selectedRecord.isNightShift && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">值守类型</span>
                  <span className="text-purple-600 flex items-center gap-1">
                    <Moon size={14} />
                    夜间值守
                  </span>
                </div>
              )}
            </div>

            {/* 升级原因 */}
            <div>
              <h4 className="text-sm font-medium text-slate-700 mb-2">升级原因</h4>
              <div className="p-4 bg-danger-50 rounded-lg border border-danger-100">
                <p className="text-sm text-danger-700">{selectedRecord.reason}</p>
              </div>
            </div>

            {/* 详细描述 */}
            {selectedRecord.description && (
              <div>
                <h4 className="text-sm font-medium text-slate-700 mb-2">详细描述</h4>
                <div className="p-4 bg-slate-50 rounded-lg">
                  <p className="text-sm text-slate-600">{selectedRecord.description}</p>
                </div>
              </div>
            )}

            {/* 处置结果 */}
            {selectedRecord.result && (
              <div>
                <h4 className="text-sm font-medium text-slate-700 mb-2">处置结果</h4>
                <div className="p-4 bg-success-50 rounded-lg border border-success-100">
                  <p className="text-sm text-success-700">{selectedRecord.result}</p>
                </div>
              </div>
            )}

            {/* 处置时间轴 */}
            <div>
              <h4 className="text-sm font-medium text-slate-700 mb-3">处置进度</h4>
              <Timeline
                items={[
                  {
                    id: "1",
                    title: "上报成功",
                    description: `${selectedRecord.reporterName} 上报`,
                    time: formatDateTime(selectedRecord.createTime, "HH:mm"),
                    type: "success",
                  },
                  ...(selectedRecord.handleTime
                    ? [
                        {
                          id: "2",
                          title: "开始处理",
                          description: `${selectedRecord.handlerName} 接手处理`,
                          time: formatDateTime(selectedRecord.handleTime!, "HH:mm"),
                          type: "primary",
                        },
                      ]
                    : []),
                  ...(selectedRecord.resolveTime
                    ? [
                        {
                          id: "3",
                          title: "已解决",
                          description: selectedRecord.result,
                          time: formatDateTime(selectedRecord.resolveTime!, "HH:mm"),
                          type: "success",
                        },
                      ]
                    : []),
                ]}
              />
            </div>

            {/* 操作按钮 */}
            {selectedRecord.status === "processing" && (
              <div className="space-y-3">
                <Textarea
                  label="处置意见"
                  placeholder="请输入处置意见和处理结果..."
                  rows={4}
                  value={handleNote}
                  onChange={(e) => setHandleNote(e.target.value)}
                />
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    fullWidth
                    onClick={() => setShowEscalateModal(true)}
                  >
                    升级上报
                  </Button>
                  <Button variant="success" fullWidth onClick={handleResolve}>
                    处置完成
                  </Button>
                </div>
              </div>
            )}

            {selectedRecord.status === "pending" && (
              <Button fullWidth onClick={() => handleStartProcess(selectedRecord)}>
                开始处理
              </Button>
            )}
          </div>
        )}
      </Drawer>

      {/* 升级确认弹窗 */}
      <div className={showEscalateModal ? "fixed inset-0 z-50 flex items-center justify-center" : "hidden"}>
        {showEscalateModal && (
          <>
            <div
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setShowEscalateModal(false)}
            />
            <div className="relative bg-white rounded-xl shadow-xl p-6 w-[420px] animate-slide-up">
              <h3 className="text-lg font-semibold text-slate-800 mb-4">确认升级上报</h3>
              <div className="space-y-4">
                <div className="p-4 bg-danger-50 border border-danger-200 rounded-lg">
                  <p className="text-sm text-danger-700">
                    确定将此病例升级至 {escalationLevelMap[escalateLevel].label} 吗？
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    升级级别
                  </label>
                  <div className="space-y-2">
                    {(Object.keys(escalationLevelMap) as EscalationLevel[]).map((level) => {
                      const info = escalationLevelMap[level];
                      return (
                        <button
                          key={level}
                          onClick={() => setEscalateLevel(level)}
                          className={cn(
                            "w-full p-3 rounded-lg border text-left transition-colors",
                            escalateLevel === level
                              ? "border-primary-500 bg-primary-50"
                              : "border-slate-200 hover:border-slate-300"
                          )}
                        >
                          <p className="font-medium text-slate-800">{info.label}</p>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    升级原因
                  </label>
                  <Textarea
                    placeholder="请输入升级原因..."
                    rows={3}
                    value={escalateReason}
                    onChange={(e) => setEscalateReason(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <Button variant="outline" onClick={() => setShowEscalateModal(false)}>
                  取消
                </Button>
                <Button variant="danger" onClick={handleEscalate}>
                  确认升级
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
