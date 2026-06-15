import { useNavigate } from "react-router-dom";
import {
  ListTodo,
  AlertTriangle,
  CheckCircle2,
  Users,
  PhoneCall,
  Clock,
  TrendingUp,
  TrendingDown,
  ChevronRight,
  Bell,
  ShieldAlert,
  Calendar,
  BarChart3,
} from "lucide-react";
import { StatCard } from "@/components/business/StatCard";
import { TaskCard } from "@/components/business/TaskCard";
import { Card, CardHeader, CardTitle, CardBody } from "@/components/ui/Card";
import { Tag } from "@/components/ui/Tag";
import { Badge } from "@/components/ui/Status";
import { useTaskStore } from "@/store/useTaskStore";
import { usePatientStore } from "@/store/usePatientStore";
import { useEscalationStore } from "@/store/useEscalationStore";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { formatDateTime, getWeeksDaysText } from "@/utils/date";
import { taskPriorityMap } from "@/types/task";

export default function Dashboard() {
  const navigate = useNavigate();
  const { getPendingTasks, getTodayTasks } = useTaskStore();
  const { getHighRiskPatients, patients } = usePatientStore();
  const { getPendingRecords } = useEscalationStore();

  const pendingTasks = getPendingTasks();
  const todayTasks = getTodayTasks();
  const highRiskPatients = getHighRiskPatients();
  const pendingEscalations = getPendingRecords();

  const todayCompleted = todayTasks.filter((t) => t.status === "completed").length;
  const todayTotal = todayTasks.length;
  const completionRate = todayTotal > 0 ? Math.round((todayCompleted / todayTotal) * 100) : 0;

  const taskTrendData = [
    { name: "周一", 待办: 12, 已完成: 10 },
    { name: "周二", 待办: 15, 已完成: 14 },
    { name: "周三", 待办: 18, 已完成: 16 },
    { name: "周四", 待办: 14, 已完成: 13 },
    { name: "周五", 待办: 20, 已完成: 18 },
    { name: "周六", 待办: 8, 已完成: 7 },
    { name: "周日", 待办: 6, 已完成: 5 },
  ];

  const riskDistributionData = [
    { name: "高危", value: highRiskPatients.length, color: "#E53935" },
    { name: "中危", value: patients.filter((p) => p.riskLevel === "medium").length, color: "#FB8C00" },
    { name: "低危", value: patients.filter((p) => p.riskLevel === "low").length, color: "#43A047" },
  ];

  const quickActions = [
    {
      icon: PhoneCall,
      label: "快速回访",
      desc: "开始电话回访",
      color: "text-primary-500",
      bgColor: "bg-primary-50",
      path: "/callback",
    },
    {
      icon: ListTodo,
      label: "待办任务",
      desc: `${pendingTasks.length}条待处理`,
      color: "text-warning-500",
      bgColor: "bg-warning-50",
      path: "/task-queue",
    },
    {
      icon: ShieldAlert,
      label: "紧急上报",
      desc: `${pendingEscalations.length}条待处理`,
      color: "text-danger-500",
      bgColor: "bg-danger-50",
      path: "/escalation",
    },
    {
      icon: BarChart3,
      label: "数据统计",
      desc: "查看日终汇总",
      color: "text-success-500",
      bgColor: "bg-success-50",
      path: "/daily-summary",
    },
  ];

  const urgentTasks = pendingTasks
    .filter((t) => t.priority === "urgent" || t.priority === "high")
    .slice(0, 3);

  const recentNotifications = [
    {
      id: 1,
      type: "danger",
      title: "紧急异常 - 王芳",
      desc: "血压 160/100mmHg，超出警戒值",
      time: "5分钟前",
    },
    {
      id: 2,
      type: "warning",
      title: "任务即将超时",
      desc: "张丽的产检提醒任务还剩30分钟",
      time: "30分钟前",
    },
    {
      id: 3,
      type: "info",
      title: "复诊提醒",
      desc: "刘静今日需复诊，请确认到院情况",
      time: "1小时前",
    },
    {
      id: 4,
      type: "success",
      title: "任务完成",
      desc: "陈红的随访任务已完成",
      time: "2小时前",
    },
  ];

  return (
    <div className="space-y-6">
      {/* 欢迎语 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">早上好，李护士 👋</h1>
          <p className="text-slate-500 mt-1">
            今天是 {formatDateTime(new Date("2026-06-16"), "yyyy年MM月dd日 EEEE")}，您有 {pendingTasks.length} 条待处理任务
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-4 py-2 bg-success-50 text-success-700 rounded-lg">
            <span className="w-2 h-2 bg-success-500 rounded-full animate-pulse" />
            <span className="text-sm font-medium">值班中</span>
          </div>
        </div>
      </div>

      {/* 数据统计卡片 */}
      <div className="grid grid-cols-4 gap-5">
        <StatCard
          title="今日待办"
          value={pendingTasks.length}
          subtitle="待回访任务"
          icon={<ListTodo size={24} />}
          variant="primary"
          trend="up"
          trendValue="较昨日 +2"
          onClick={() => navigate("/task-queue")}
        />
        <StatCard
          title="异常预警"
          value={todayTasks.filter((t) => t.taskType === "abnormal_index").length}
          subtitle="异常指标触发"
          icon={<AlertTriangle size={24} />}
          variant="danger"
          trend="up"
          trendValue="较昨日 +1"
          onClick={() => navigate("/task-queue?type=abnormal_index")}
        />
        <StatCard
          title="完成率"
          value={`${completionRate}%`}
          subtitle={`${todayCompleted}/${todayTotal} 任务`}
          icon={<CheckCircle2 size={24} />}
          variant="success"
          trend="up"
          trendValue="较昨日 +5%"
          onClick={() => navigate("/daily-summary")}
        />
        <StatCard
          title="高危孕妇"
          value={highRiskPatients.length}
          subtitle="在管高危人数"
          icon={<Users size={24} />}
          variant="warning"
          trend="neutral"
          trendValue="总数 10人"
          onClick={() => {}}
        />
      </div>

      {/* 快捷操作 + 最近通知 */}
      <div className="grid grid-cols-3 gap-5">
        {/* 快捷操作 */}
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle>快捷操作</CardTitle>
          </CardHeader>
          <CardBody>
            <div className="grid grid-cols-4 gap-4">
              {quickActions.map((action, idx) => {
                const Icon = action.icon;
                return (
                  <button
                    key={idx}
                    onClick={() => navigate(action.path)}
                    className="group p-4 rounded-xl border border-slate-100 hover:border-primary-200 hover:shadow-card transition-all duration-200 text-left"
                  >
                    <div className={`w-12 h-12 rounded-xl ${action.bgColor} ${action.color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                      <Icon size={24} />
                    </div>
                    <p className="font-medium text-slate-800">{action.label}</p>
                    <p className="text-xs text-slate-500 mt-1">{action.desc}</p>
                  </button>
                );
              })}
            </div>
          </CardBody>
        </Card>

        {/* 最近通知 */}
        <Card>
          <CardHeader>
            <CardTitle>最近通知</CardTitle>
            <button className="text-xs text-primary-500 hover:text-primary-600 flex items-center gap-1">
              全部 <ChevronRight size={14} />
            </button>
          </CardHeader>
          <CardBody>
            <div className="space-y-3">
              {recentNotifications.map((item) => (
                <div
                  key={item.id}
                  className="flex items-start gap-3 p-2 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors"
                >
                  <div
                    className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                      item.type === "danger"
                        ? "bg-danger-500"
                        : item.type === "warning"
                        ? "bg-warning-500"
                        : item.type === "success"
                        ? "bg-success-500"
                        : "bg-primary-500"
                    }`}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-700">{item.title}</p>
                    <p className="text-xs text-slate-500 mt-0.5 truncate">{item.desc}</p>
                    <p className="text-xs text-slate-400 mt-1">{item.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      </div>

      {/* 紧急任务 + 图表 */}
      <div className="grid grid-cols-3 gap-5">
        {/* 紧急/高优先级任务 */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle size={18} className="text-danger-500" />
              紧急任务
            </CardTitle>
            <span className="text-xs text-slate-400">{urgentTasks.length} 条待处理</span>
          </CardHeader>
          <CardBody>
            <div className="space-y-3">
              {urgentTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  compact
                  onClick={() => navigate(`/callback?taskId=${task.id}`)}
                />
              ))}
              {urgentTasks.length === 0 && (
                <div className="py-8 text-center text-slate-400 text-sm">
                  暂无紧急任务
                </div>
              )}
            </div>
          </CardBody>
        </Card>

        {/* 本周任务趋势 */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>本周任务趋势</CardTitle>
          </CardHeader>
          <CardBody>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={taskTrendData} barGap={4}>
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
                  <Bar dataKey="待办" fill="#90CAF9" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="已完成" fill="#1E88E5" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardBody>
        </Card>

        {/* 风险分布 */}
        <Card>
          <CardHeader>
            <CardTitle>风险等级分布</CardTitle>
          </CardHeader>
          <CardBody>
            <div className="flex items-center justify-center h-56">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={riskDistributionData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    dataKey="value"
                    paddingAngle={3}
                  >
                    {riskDistributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      borderRadius: "8px",
                      border: "1px solid #ECEFF1",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                    }}
                    formatter={(value: number) => [`${value}人`, "人数"]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-6 -mt-2">
              {riskDistributionData.map((item) => (
                <div key={item.name} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-xs text-slate-600">
                    {item.name} ({item.value})
                  </span>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      </div>

      {/* 高危患者快速列表 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldAlert size={18} className="text-danger-500" />
            高危孕妇一览
          </CardTitle>
          <button
            className="text-xs text-primary-500 hover:text-primary-600 flex items-center gap-1"
            onClick={() => navigate("/task-queue")}
          >
            查看全部 <ChevronRight size={14} />
          </button>
        </CardHeader>
        <CardBody>
          <div className="grid grid-cols-4 gap-4">
            {highRiskPatients.slice(0, 4).map((patient) => (
              <div
                key={patient.id}
                onClick={() => navigate(`/callback?patientId=${patient.id}`)}
                className="p-4 rounded-xl border border-slate-100 hover:border-primary-200 hover:shadow-card transition-all duration-200 cursor-pointer"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-danger-400 to-danger-600 flex items-center justify-center text-white font-medium">
                    {patient.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-medium text-slate-800">{patient.name}</p>
                    <p className="text-xs text-slate-500">
                      孕{getWeeksDaysText(patient.gestationalWeek, patient.gestationalDay)}
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1 mb-3">
                  {patient.highRiskType.slice(0, 2).map((type, idx) => (
                    <Tag key={idx} variant="danger" size="sm">
                      {type}
                    </Tag>
                  ))}
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400 flex items-center gap-1">
                    <Calendar size={12} />
                    下次产检: {patient.nextVisitTime.slice(5, 10)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
