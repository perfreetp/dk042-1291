import { useState } from "react";
import {
  BarChart3,
  Calendar,
  CheckCircle,
  AlertTriangle,
  Phone,
  Users,
  TrendingUp,
  TrendingDown,
  Download,
  ChevronLeft,
  ChevronRight,
  FileText,
  Clock,
  ShieldAlert,
  Activity,
  UserX,
  ListChecks,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Tag } from "@/components/ui/Tag";
import { Badge } from "@/components/ui/Status";
import { Progress } from "@/components/ui/Status";
import { StatCard } from "@/components/business/StatCard";
import { useTaskStore } from "@/store/useTaskStore";
import { usePatientStore } from "@/store/usePatientStore";
import { useEscalationStore } from "@/store/useEscalationStore";
import { taskTypeMap, taskPriorityMap } from "@/types/task";
import { callStatusMap } from "@/types/call";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend,
} from "recharts";
import { cn } from "@/lib/utils";
import { formatDate } from "@/utils/date";

export default function DailySummary() {
  const [selectedDate, setSelectedDate] = useState("2026-06-16");

  const { tasks, callLogs, getTodayTasks } = useTaskStore();
  const { patients, getHighRiskPatients } = usePatientStore();
  const { records, getTodayRecords } = useEscalationStore();

  const todayTasks = getTodayTasks();
  const todayEscalations = getTodayRecords();

  const completedCount = todayTasks.filter((t) => t.status === "completed").length;
  const pendingCount = todayTasks.filter((t) => t.status === "pending").length;
  const processingCount = todayTasks.filter((t) => t.status === "processing").length;
  const escalatedCount = todayTasks.filter((t) => t.status === "escalated").length;
  const totalCount = todayTasks.length;
  const completionRate = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const todayCallLogs = callLogs.filter((l) => l.callTime.includes("2026-06-16"));
  const connectedCalls = todayCallLogs.filter((l) => l.status === "connected").length;
  const connectionRate = todayCallLogs.length > 0 ? Math.round((connectedCalls / todayCallLogs.length) * 100) : 0;

  const highRiskPatients = getHighRiskPatients();
  const lostFollowPatients = patients.filter((p) => p.isLostFollow);

  // 任务类型分布
  const taskTypeData = Object.entries(taskTypeMap).map(([key, val]) => ({
    name: val.label,
    value: todayTasks.filter((t) => t.taskType === key).length,
    color: key === "abnormal_index" || key === "emergency" ? "#E53935" : key === "revisit_miss" || key === "lost_contact" ? "#FB8C00" : "#1E88E5",
  })).filter((d) => d.value > 0);

  // 优先级分布
  const priorityData = Object.entries(taskPriorityMap).map(([key, val]) => ({
    name: val.label,
    value: todayTasks.filter((t) => t.priority === key).length,
  }));

  // 本周趋势数据
  const weekTrendData = [
    { name: "周一", 任务数: 12, 完成数: 10, 升级数: 2 },
    { name: "周二", 任务数: 15, 完成数: 14, 升级数: 1 },
    { name: "周三", 任务数: 18, 完成数: 16, 升级数: 3 },
    { name: "周四", 任务数: 14, 完成数: 13, 升级数: 1 },
    { name: "周五", 任务数: 20, 完成数: 18, 升级数: 4 },
    { name: "周六", 任务数: 8, 完成数: 7, 升级数: 0 },
    { name: "周日", 任务数: 6, 完成数: 5, 升级数: 1 },
  ];

  // 通话时间分布
  const callTimeDistribution = [
    { time: "08:00", count: 5 },
    { time: "09:00", count: 12 },
    { time: "10:00", count: 18 },
    { time: "11:00", count: 15 },
    { time: "14:00", count: 20 },
    { time: "15:00", count: 16 },
    { time: "16:00", count: 10 },
    { time: "17:00", count: 6 },
  ];

  // 漏访清单
  const missedTasks = todayTasks.filter(
    (t) => t.status === "failed" || (t.status === "pending" && t.retryCount >= t.maxRetryCount)
  );

  // 异常汇总
  const abnormalTasks = todayTasks.filter((t) => t.taskType === "abnormal_index");
  const abnormalByType = [
    { name: "血压异常", count: 3 },
    { name: "血糖异常", count: 2 },
    { name: "胎心异常", count: 1 },
    { name: "羊水异常", count: 2 },
  ];

  // 次日计划
  const tomorrowPlan = [
    { type: "prenatal_check", count: 5, time: "全天" },
    { type: "follow_up", count: 8, time: "全天" },
    { type: "abnormal_index", count: 2, time: "待触发" },
    { type: "revisit_miss", count: 1, time: "上午" },
  ];

  return (
    <div className="space-y-6">
      {/* 页面标题和日期选择 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">日终汇总</h1>
          <p className="text-slate-500 mt-1">查看每日回访统计和汇总报告</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 rounded-lg">
            <button
              className="p-1 text-slate-400 hover:text-slate-600 transition-colors"
              onClick={() => {}}
            >
              <ChevronLeft size={18} />
            </button>
            <div className="flex items-center gap-2 px-3">
              <Calendar size={16} className="text-primary-500" />
              <span className="font-medium text-slate-700">{formatDate(selectedDate)}</span>
            </div>
            <button
              className="p-1 text-slate-400 hover:text-slate-600 transition-colors"
              onClick={() => {}}
            >
              <ChevronRight size={18} />
            </button>
          </div>
          <Button variant="outline" icon={<Download size={18} />}>
            导出报告
          </Button>
        </div>
      </div>

      {/* 核心数据卡片 */}
      <div className="grid grid-cols-4 gap-5">
        <StatCard
          title="今日任务总数"
          value={totalCount}
          subtitle="待处理任务"
          icon={<ListChecks size={24} />}
          variant="primary"
          trend="up"
          trendValue="较昨日 +2"
        />
        <StatCard
          title="完成率"
          value={`${completionRate}%`}
          subtitle={`${completedCount}/${totalCount} 任务完成`}
          icon={<CheckCircle size={24} />}
          variant="success"
          trend="up"
          trendValue="较昨日 +5%"
        />
        <StatCard
          title="接通率"
          value={`${connectionRate}%`}
          subtitle={`${connectedCalls}/${todayCallLogs.length} 通电话`}
          icon={<Phone size={24} />}
          variant="warning"
          trend="down"
          trendValue="较昨日 -3%"
        />
        <StatCard
          title="紧急升级"
          value={todayEscalations.length}
          subtitle="今日升级病例"
          icon={<ShieldAlert size={24} />}
          variant="danger"
          trend="up"
          trendValue="较昨日 +1"
        />
      </div>

      {/* 图表区域 */}
      <div className="grid grid-cols-3 gap-5">
        {/* 本周趋势图 */}
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity size={18} className="text-primary-500" />
              本周回访趋势
            </CardTitle>
            <div className="flex items-center gap-4 text-xs text-slate-500">
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 rounded-full bg-primary-500" />
                任务数
              </span>
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 rounded-full bg-success-500" />
                完成数
              </span>
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 rounded-full bg-danger-500" />
                升级数
              </span>
            </div>
          </CardHeader>
          <CardBody>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={weekTrendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ECEFF1" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#78909C" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 12, fill: "#78909C" }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      borderRadius: "8px",
                      border: "1px solid #ECEFF1",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                    }}
                  />
                  <Line type="monotone" dataKey="任务数" stroke="#1E88E5" strokeWidth={2} dot={{ r: 4 }} />
                  <Line type="monotone" dataKey="完成数" stroke="#43A047" strokeWidth={2} dot={{ r: 4 }} />
                  <Line type="monotone" dataKey="升级数" stroke="#E53935" strokeWidth={2} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardBody>
        </Card>

        {/* 任务类型分布 */}
        <Card>
          <CardHeader>
            <CardTitle>任务类型分布</CardTitle>
          </CardHeader>
          <CardBody>
            <div className="h-48 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={taskTypeData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={65}
                    dataKey="value"
                    paddingAngle={3}
                  >
                    {taskTypeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      borderRadius: "8px",
                      border: "1px solid #ECEFF1",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                    }}
                    formatter={(value: number) => [`${value}条`, "数量"]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap justify-center gap-3 mt-2">
              {taskTypeData.map((item) => (
                <div key={item.name} className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-xs text-slate-600">
                    {item.name} ({item.value})
                  </span>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      </div>

      {/* 中间行 - 通话时段分布 + 异常指标统计 */}
      <div className="grid grid-cols-3 gap-5">
        {/* 通话时段分布 */}
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock size={18} className="text-primary-500" />
              通话时段分布
            </CardTitle>
          </CardHeader>
          <CardBody>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={callTimeDistribution} barGap={8}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ECEFF1" vertical={false} />
                  <XAxis dataKey="time" tick={{ fontSize: 12, fill: "#78909C" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 12, fill: "#78909C" }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      borderRadius: "8px",
                      border: "1px solid #ECEFF1",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                    }}
                  />
                  <Bar dataKey="count" name="通话次数" fill="#1E88E5" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardBody>
        </Card>

        {/* 异常指标统计 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle size={18} className="text-danger-500" />
              异常指标统计
            </CardTitle>
            <span className="text-xs text-danger-500 font-medium">{abnormalTasks.length}条</span>
          </CardHeader>
          <CardBody>
            <div className="space-y-3">
              {abnormalByType.map((item, idx) => (
                <div key={idx}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-slate-600">{item.name}</span>
                    <span className="font-medium text-slate-700">{item.count}例</span>
                  </div>
                  <Progress value={item.count} max={5} color="danger" size="sm" />
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      </div>

      {/* 漏访清单 + 次日计划 */}
      <div className="grid grid-cols-2 gap-5">
        {/* 漏访清单 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserX size={18} className="text-warning-500" />
              漏访清单
            </CardTitle>
            <span className="text-xs text-warning-600 font-medium">{missedTasks.length}人</span>
          </CardHeader>
          <CardBody>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {missedTasks.map((task) => {
                const patient = task.patient;
                return (
                  <div
                    key={task.id}
                    className="p-3 bg-warning-50 rounded-lg border border-warning-100"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-slate-800">{patient?.name || "未知"}</span>
                        <Tag size="sm" variant="warning">
                          {taskTypeMap[task.taskType].label}
                        </Tag>
                      </div>
                      <span className="text-xs text-warning-600">
                        重试 {task.retryCount}/{task.maxRetryCount}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mb-2 line-clamp-1">{task.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-400">{patient?.phone}</span>
                      <button className="text-xs text-primary-600 hover:text-primary-700 font-medium">
                        继续联系 →
                      </button>
                    </div>
                  </div>
                );
              })}
              {missedTasks.length === 0 && (
                <div className="py-8 text-center text-slate-400 text-sm">
                  今日无漏访记录
                </div>
              )}
            </div>
          </CardBody>
        </Card>

        {/* 次日工作计划 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText size={18} className="text-primary-500" />
              次日工作计划
            </CardTitle>
            <span className="text-xs text-slate-400">6月17日</span>
          </CardHeader>
          <CardBody>
            <div className="space-y-3">
              {tomorrowPlan.map((item, idx) => {
                const typeInfo = taskTypeMap[item.type as keyof typeof taskTypeMap];
                return (
                  <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          "w-9 h-9 rounded-lg flex items-center justify-center",
                          typeInfo.bgColor
                        )}
                      >
                        <span className={cn("text-xs font-medium", typeInfo.color)}>{item.count}</span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-700">{typeInfo.label}</p>
                        <p className="text-xs text-slate-400">{item.time}</p>
                      </div>
                    </div>
                    <span className="text-xs text-slate-500">{item.count}条</span>
                  </div>
                );
              })}
            </div>

            <div className="mt-4 pt-4 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">预计任务总数</span>
                <span className="text-lg font-bold text-primary-600">16条</span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                请合理安排时间，优先处理高优先级任务
              </p>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* 高危孕妇管理情况 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users size={18} className="text-danger-500" />
            高危孕妇管理情况
          </CardTitle>
        </CardHeader>
        <CardBody>
          <div className="grid grid-cols-4 gap-5">
            <div className="p-4 bg-danger-50 rounded-xl text-center">
              <p className="text-3xl font-bold text-danger-600">{highRiskPatients.length}</p>
              <p className="text-sm text-danger-600 mt-1">高危孕妇总数</p>
            </div>
            <div className="p-4 bg-warning-50 rounded-xl text-center">
              <p className="text-3xl font-bold text-warning-600">
                {patients.filter((p) => p.riskLevel === "medium").length}
              </p>
              <p className="text-sm text-warning-600 mt-1">中危孕妇</p>
            </div>
            <div className="p-4 bg-success-50 rounded-xl text-center">
              <p className="text-3xl font-bold text-success-600">
                {patients.filter((p) => p.riskLevel === "low").length}
              </p>
              <p className="text-sm text-success-600 mt-1">低危孕妇</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-xl text-center">
              <p className="text-3xl font-bold text-slate-600">{lostFollowPatients.length}</p>
              <p className="text-sm text-slate-600 mt-1">失联人数</p>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* 完成率仪表盘 */}
      <div className="grid grid-cols-3 gap-5">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>今日完成率</CardTitle>
          </CardHeader>
          <CardBody>
            <div className="flex flex-col items-center">
              <div className="relative w-32 h-32">
                <svg className="w-32 h-32 transform -rotate-90">
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    stroke="#ECEFF1"
                    strokeWidth="12"
                    fill="none"
                  />
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    stroke="#1E88E5"
                    strokeWidth="12"
                    fill="none"
                    strokeDasharray={`${completionRate * 3.52} 352`}
                    strokeLinecap="round"
                    className="transition-all duration-1000"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-bold text-slate-800">{completionRate}%</span>
                  <span className="text-xs text-slate-500">完成率</span>
                </div>
              </div>
              <p className="text-sm text-slate-500 mt-4">
                {completedCount} / {totalCount} 任务完成
              </p>
            </div>
          </CardBody>
        </Card>

        <Card className="col-span-2">
          <CardHeader>
            <CardTitle>今日工作总结</CardTitle>
          </CardHeader>
          <CardBody>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-success-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <CheckCircle size={20} className="text-success-500" />
                  <div>
                    <p className="font-medium text-slate-800">已完成任务</p>
                    <p className="text-sm text-slate-500">所有已完成的回访任务</p>
                  </div>
                </div>
                <span className="text-xl font-bold text-success-600">{completedCount}</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-primary-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Activity size={20} className="text-primary-500" />
                  <div>
                    <p className="font-medium text-slate-800">处理中任务</p>
                    <p className="text-sm text-slate-500">正在进行的回访任务</p>
                  </div>
                </div>
                <span className="text-xl font-bold text-primary-600">{processingCount}</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-warning-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Clock size={20} className="text-warning-500" />
                  <div>
                    <p className="font-medium text-slate-800">待处理任务</p>
                    <p className="text-sm text-slate-500">尚未开始的任务</p>
                  </div>
                </div>
                <span className="text-xl font-bold text-warning-600">{pendingCount}</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-danger-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <ShieldAlert size={20} className="text-danger-500" />
                  <div>
                    <p className="font-medium text-slate-800">已升级任务</p>
                    <p className="text-sm text-slate-500">需要医生介入的任务</p>
                  </div>
                </div>
                <span className="text-xl font-bold text-danger-600">{escalatedCount}</span>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
