import { useState, useEffect } from "react";
import {
  Settings,
  Calendar,
  AlertTriangle,
  Phone,
  Clock,
  Plus,
  Edit2,
  Trash2,
  ChevronRight,
  MessageSquare,
  Bell,
  Thermometer,
  Activity,
  Droplets,
  Heart,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Switch } from "@/components/ui/Switch";
import { Tag } from "@/components/ui/Tag";
import { Drawer } from "@/components/ui/Drawer";
import { Input, Textarea, Select } from "@/components/ui/Input";
import { useConfigStore } from "@/store/useConfigStore";
import { reminderRuleTypeMap } from "@/types/config";
import { taskPriorityMap } from "@/types/task";
import { cn } from "@/lib/utils";
import type { ReminderRule, AbnormalThreshold } from "@/types/config";

const iconMap = {
  Calendar,
  AlertTriangle,
  Phone,
  Clock,
  Settings,
  Thermometer,
  Activity,
  Droplets,
  Heart,
};

type ActiveTab = "rules" | "thresholds";

export default function ReminderConfig() {
  const [activeTab, setActiveTab] = useState<ActiveTab>("rules");
  const [showRuleDrawer, setShowRuleDrawer] = useState(false);
  const [editingRule, setEditingRule] = useState<string | null>(null);
  const [showThresholdDrawer, setShowThresholdDrawer] = useState(false);
  const [editingThreshold, setEditingThreshold] = useState<string | null>(null);

  // 规则表单状态
  const [ruleForm, setRuleForm] = useState<Partial<ReminderRule>>({
    ruleName: "",
    ruleType: "prenatal_check",
    priority: "medium",
    advanceDays: 1,
    maxRetryCount: 3,
    retryInterval: 120,
    triggerCondition: "",
    smsTemplate: "",
    callScript: "",
    description: "",
    enabled: true,
  });

  // 阈值表单状态
  const [thresholdForm, setThresholdForm] = useState<Partial<AbnormalThreshold>>({
    indicatorName: "",
    indicatorCode: "",
    unit: "",
    normalMin: 0,
    normalMax: 0,
    warningMin: 0,
    warningMax: 0,
    criticalMin: 0,
    criticalMax: 0,
    priority: "high",
    description: "",
    enabled: true,
  });

  const {
    reminderRules,
    abnormalThresholds,
    toggleRuleEnabled,
    toggleThresholdEnabled,
    deleteRule,
    deleteThreshold,
    getRuleById,
    getThresholdById,
    addRule,
    updateRule,
    addThreshold,
    updateThreshold,
  } = useConfigStore();

  const handleEditRule = (ruleId: string) => {
    const rule = getRuleById(ruleId);
    if (rule) {
      setRuleForm(rule);
    }
    setEditingRule(ruleId);
    setShowRuleDrawer(true);
  };

  const handleAddRule = () => {
    setRuleForm({
      ruleName: "",
      ruleType: "prenatal",
      priority: "medium",
      advanceDays: 1,
      maxRetryCount: 3,
      retryInterval: 120,
      triggerCondition: "",
      smsTemplate: "",
      callScript: "",
      description: "",
      enabled: true,
    });
    setEditingRule(null);
    setShowRuleDrawer(true);
  };

  const handleSaveRule = () => {
    if (!ruleForm.ruleName) {
      alert("请输入规则名称");
      return;
    }

    if (editingRule) {
      updateRule(editingRule, ruleForm);
    } else {
      const ruleTypeToTaskType: Record<string, string> = {
        prenatal: "prenatal_check",
        abnormal: "abnormal_index",
        followup: "follow_up",
        revisit: "revisit_miss",
        custom: "follow_up",
      };
      const newRule: ReminderRule = {
        id: `R${Date.now()}`,
        ruleName: ruleForm.ruleName || "",
        ruleType: (ruleForm.ruleType as ReminderRuleType) || "custom",
        taskType: (ruleForm.taskType || ruleTypeToTaskType[ruleForm.ruleType || "custom"] || "follow_up") as ReminderRule["taskType"],
        triggerCondition: ruleForm.triggerCondition || "",
        advanceDays: ruleForm.advanceDays ?? 1,
        enabled: ruleForm.enabled ?? true,
        smsTemplate: ruleForm.smsTemplate || "",
        callScript: ruleForm.callScript || "",
        priority: ruleForm.priority || "medium",
        retryInterval: ruleForm.retryInterval ?? 120,
        maxRetryCount: ruleForm.maxRetryCount ?? 3,
        description: ruleForm.description || "",
        createTime: new Date().toISOString(),
        updateTime: new Date().toISOString(),
      };
      addRule(newRule);
    }
    setShowRuleDrawer(false);
  };

  const handleEditThreshold = (thresholdId: string) => {
    const threshold = getThresholdById(thresholdId);
    if (threshold) {
      setThresholdForm(threshold);
    }
    setEditingThreshold(thresholdId);
    setShowThresholdDrawer(true);
  };

  const handleAddThreshold = () => {
    setThresholdForm({
      indicatorName: "",
      indicatorCode: "",
      unit: "",
      normalMin: 0,
      normalMax: 0,
      warningMin: 0,
      warningMax: 0,
      criticalMin: 0,
      criticalMax: 0,
      priority: "high",
      description: "",
      enabled: true,
    });
    setEditingThreshold(null);
    setShowThresholdDrawer(true);
  };

  const handleSaveThreshold = () => {
    if (!thresholdForm.indicatorName) {
      alert("请输入指标名称");
      return;
    }

    if (editingThreshold) {
      updateThreshold(editingThreshold, thresholdForm);
    } else {
      const newThreshold: AbnormalThreshold = {
        ...thresholdForm as AbnormalThreshold,
        id: `T${Date.now()}`,
        createTime: new Date().toISOString(),
        updateTime: new Date().toISOString(),
      };
      addThreshold(newThreshold);
    }
    setShowThresholdDrawer(false);
  };

  const currentRule = editingRule ? getRuleById(editingRule) : null;
  const currentThreshold = editingThreshold ? getThresholdById(editingThreshold) : null;

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">提醒配置</h1>
          <p className="text-slate-500 mt-1">配置产检提醒、异常指标阈值和回访规则</p>
        </div>
        <Button
          icon={<Plus size={18} />}
          onClick={activeTab === "rules" ? handleAddRule : handleAddThreshold}
        >
          新建{activeTab === "rules" ? "规则" : "阈值"}
        </Button>
      </div>

      {/* Tab切换 */}
      <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg w-fit">
        <button
          onClick={() => setActiveTab("rules")}
          className={cn(
            "px-4 py-2 text-sm font-medium rounded-md transition-all duration-200",
            activeTab === "rules"
              ? "bg-white text-primary-600 shadow-sm"
              : "text-slate-600 hover:text-slate-800"
          )}
        >
          提醒规则
        </button>
        <button
          onClick={() => setActiveTab("thresholds")}
          className={cn(
            "px-4 py-2 text-sm font-medium rounded-md transition-all duration-200",
            activeTab === "thresholds"
              ? "bg-white text-primary-600 shadow-sm"
              : "text-slate-600 hover:text-slate-800"
          )}
        >
          异常阈值
        </button>
      </div>

      {activeTab === "rules" ? (
        /* 提醒规则列表 */
        <div className="grid grid-cols-2 gap-5">
          {reminderRules.map((rule) => {
            const typeInfo = reminderRuleTypeMap[rule.ruleType] || {
              label: rule.ruleType || "自定义",
              icon: "Settings",
              color: "text-slate-600",
              bgColor: "bg-slate-100",
            };
            const priorityInfo = taskPriorityMap[rule.priority] || {
              label: rule.priority || "中",
              color: "text-slate-600",
              bgColor: "bg-slate-100",
            };
            const Icon = iconMap[typeInfo.icon as keyof typeof iconMap] || Settings;

            return (
              <Card
                key={rule.id}
                hoverable
                className="transition-all duration-200"
              >
                <CardBody>
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          "w-12 h-12 rounded-xl flex items-center justify-center",
                          typeInfo.color,
                          "bg-opacity-10"
                        )}
                        style={{ backgroundColor: rule.enabled ? undefined : "#f5f5f5", opacity: rule.enabled ? 1 : 0.5 }}
                      >
                        <Icon size={22} className={typeInfo.color} />
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-800">{rule.ruleName || "未命名规则"}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <Tag size="sm" variant="info">
                            {typeInfo.label}
                          </Tag>
                          <Tag size="sm" variant={rule.priority === "urgent" || rule.priority === "high" ? "warning" : "primary"}>
                            {priorityInfo.label}优先级
                          </Tag>
                        </div>
                      </div>
                    </div>
                    <Switch
                      checked={!!rule.enabled}
                      onChange={() => toggleRuleEnabled(rule.id)}
                      size="md"
                    />
                  </div>

                  <p className="text-sm text-slate-500 mb-4 line-clamp-2">
                    {rule.description || rule.triggerCondition || "暂无说明"}
                  </p>

                  <div className="grid grid-cols-3 gap-4 mb-4 text-sm">
                    <div>
                      <p className="text-slate-400 text-xs mb-1">提前天数</p>
                      <p className="font-medium text-slate-700">{rule.advanceDays ?? 0}天</p>
                    </div>
                    <div>
                      <p className="text-slate-400 text-xs mb-1">重试次数</p>
                      <p className="font-medium text-slate-700">{rule.maxRetryCount ?? 0}次</p>
                    </div>
                    <div>
                      <p className="text-slate-400 text-xs mb-1">重试间隔</p>
                      <p className="font-medium text-slate-700">{rule.retryInterval ?? 0}分钟</p>
                    </div>
                  </div>

                  {rule.smsTemplate && (
                    <div className="p-3 bg-slate-50 rounded-lg mb-4">
                      <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-2">
                        <MessageSquare size={12} />
                        <span>短信模板</span>
                      </div>
                      <p className="text-sm text-slate-600 line-clamp-2">{rule.smsTemplate}</p>
                    </div>
                  )}

                  <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                    <button
                      onClick={() => handleEditRule(rule.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-slate-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                    >
                      <Edit2 size={14} />
                      编辑
                    </button>
                    <button
                      onClick={() => deleteRule(rule.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-slate-600 hover:text-danger-600 hover:bg-danger-50 rounded-lg transition-colors"
                    >
                      <Trash2 size={14} />
                      删除
                    </button>
                  </div>
                </CardBody>
              </Card>
            );
          })}
        </div>
      ) : (
        /* 异常阈值列表 */
        <Card>
          <CardBody padding="none">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left py-3 px-5 text-xs font-medium text-slate-500 uppercase tracking-wider">
                    指标名称
                  </th>
                  <th className="text-left py-3 px-5 text-xs font-medium text-slate-500 uppercase tracking-wider">
                    正常范围
                  </th>
                  <th className="text-left py-3 px-5 text-xs font-medium text-slate-500 uppercase tracking-wider">
                    预警范围
                  </th>
                  <th className="text-left py-3 px-5 text-xs font-medium text-slate-500 uppercase tracking-wider">
                    危急范围
                  </th>
                  <th className="text-left py-3 px-5 text-xs font-medium text-slate-500 uppercase tracking-wider">
                    优先级
                  </th>
                  <th className="text-left py-3 px-5 text-xs font-medium text-slate-500 uppercase tracking-wider">
                    状态
                  </th>
                  <th className="text-right py-3 px-5 text-xs font-medium text-slate-500 uppercase tracking-wider">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody>
                {abnormalThresholds.map((threshold) => {
                  const priorityInfo = taskPriorityMap[threshold.priority] || {
                    label: threshold.priority || "中",
                    color: "text-slate-600",
                    bgColor: "bg-slate-100",
                  };
                  return (
                    <tr
                      key={threshold.id}
                      className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors"
                    >
                      <td className="py-4 px-5">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg bg-primary-50 flex items-center justify-center">
                            <Activity size={18} className="text-primary-500" />
                          </div>
                          <div>
                            <p className="font-medium text-slate-800">{threshold.indicatorName || "未命名指标"}</p>
                            <p className="text-xs text-slate-400">{threshold.indicatorCode || "—"}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-5">
                        <span className="text-sm text-success-600 font-medium">
                          {threshold.normalMin ?? 0} - {threshold.normalMax ?? 0} {threshold.unit || ""}
                        </span>
                      </td>
                      <td className="py-4 px-5">
                        <span className="text-sm text-warning-600 font-medium">
                          {threshold.warningMin ?? 0} - {threshold.warningMax ?? 0} {threshold.unit || ""}
                        </span>
                      </td>
                      <td className="py-4 px-5">
                        <span className="text-sm text-danger-600 font-medium">
                          {threshold.criticalMin ?? 0} - {threshold.criticalMax ?? 0} {threshold.unit || ""}
                        </span>
                      </td>
                      <td className="py-4 px-5">
                        <Tag
                          size="sm"
                          variant={
                            threshold.priority === "urgent"
                              ? "danger"
                              : threshold.priority === "high"
                              ? "warning"
                              : "primary"
                          }
                        >
                          {priorityInfo.label}
                        </Tag>
                      </td>
                      <td className="py-4 px-5">
                        <Switch
                          checked={!!threshold.enabled}
                          onChange={() => toggleThresholdEnabled(threshold.id)}
                          size="sm"
                        />
                      </td>
                      <td className="py-4 px-5">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleEditThreshold(threshold.id)}
                            className="p-1.5 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => deleteThreshold(threshold.id)}
                            className="p-1.5 text-slate-400 hover:text-danger-600 hover:bg-danger-50 rounded-lg transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </CardBody>
        </Card>
      )}

      {/* 规则编辑抽屉 */}
      <Drawer
        open={showRuleDrawer}
        onClose={() => setShowRuleDrawer(false)}
        title={editingRule ? "编辑提醒规则" : "新建提醒规则"}
        width="480px"
        footer={
          <div className="flex items-center justify-end gap-3">
            <Button variant="outline" onClick={() => setShowRuleDrawer(false)}>
              取消
            </Button>
            <Button onClick={handleSaveRule}>
              {editingRule ? "保存修改" : "创建规则"}
            </Button>
          </div>
        }
      >
        <div className="space-y-5">
          <Input
            label="规则名称"
            placeholder="请输入规则名称"
            value={ruleForm.ruleName}
            onChange={(e) => setRuleForm({ ...ruleForm, ruleName: e.target.value })}
          />

          <Select
            label="规则类型"
            options={Object.entries(reminderRuleTypeMap).map(([key, val]) => ({
              value: key,
              label: val.label,
            }))}
            value={ruleForm.ruleType}
            onChange={(e) => setRuleForm({ ...ruleForm, ruleType: e.target.value as ReminderRule["ruleType"] })}
          />

          <Select
            label="优先级"
            options={Object.entries(taskPriorityMap).map(([key, val]) => ({
              value: key,
              label: val.label,
            }))}
            value={ruleForm.priority}
            onChange={(e) => setRuleForm({ ...ruleForm, priority: e.target.value as ReminderRule["priority"] })}
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="提前天数"
              type="number"
              placeholder="0"
              value={ruleForm.advanceDays?.toString()}
              onChange={(e) => setRuleForm({ ...ruleForm, advanceDays: Number(e.target.value) })}
            />
            <Input
              label="最大重试次数"
              type="number"
              placeholder="3"
              value={ruleForm.maxRetryCount?.toString()}
              onChange={(e) => setRuleForm({ ...ruleForm, maxRetryCount: Number(e.target.value) })}
            />
          </div>

          <Input
            label="重试间隔（分钟）"
            type="number"
            placeholder="120"
            value={ruleForm.retryInterval?.toString()}
            onChange={(e) => setRuleForm({ ...ruleForm, retryInterval: Number(e.target.value) })}
          />

          <Textarea
            label="触发条件"
            placeholder="描述触发规则的条件"
            rows={2}
            value={ruleForm.triggerCondition}
            onChange={(e) => setRuleForm({ ...ruleForm, triggerCondition: e.target.value })}
          />

          <Textarea
            label="短信模板"
            placeholder="请输入短信模板内容"
            rows={3}
            value={ruleForm.smsTemplate}
            onChange={(e) => setRuleForm({ ...ruleForm, smsTemplate: e.target.value })}
          />

          <Textarea
            label="通话脚本"
            placeholder="请输入通话脚本内容"
            rows={5}
            value={ruleForm.callScript}
            onChange={(e) => setRuleForm({ ...ruleForm, callScript: e.target.value })}
          />

          <Textarea
            label="规则说明"
            placeholder="请输入规则说明"
            rows={2}
            value={ruleForm.description}
            onChange={(e) => setRuleForm({ ...ruleForm, description: e.target.value })}
          />

          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
            <div>
              <p className="text-sm font-medium text-slate-700">启用规则</p>
              <p className="text-xs text-slate-500">启用后规则将自动触发任务</p>
            </div>
            <Switch
              checked={ruleForm.enabled ?? true}
              onChange={() => setRuleForm({ ...ruleForm, enabled: !ruleForm.enabled })}
              size="md"
            />
          </div>
        </div>
      </Drawer>

      {/* 阈值编辑抽屉 */}
      <Drawer
        open={showThresholdDrawer}
        onClose={() => setShowThresholdDrawer(false)}
        title={editingThreshold ? "编辑异常阈值" : "新建异常阈值"}
        width="480px"
        footer={
          <div className="flex items-center justify-end gap-3">
            <Button variant="outline" onClick={() => setShowThresholdDrawer(false)}>
              取消
            </Button>
            <Button onClick={handleSaveThreshold}>
              {editingThreshold ? "保存修改" : "创建阈值"}
            </Button>
          </div>
        }
      >
        <div className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="指标名称"
              placeholder="如：收缩压"
              value={thresholdForm.indicatorName}
              onChange={(e) => setThresholdForm({ ...thresholdForm, indicatorName: e.target.value })}
            />
            <Input
              label="指标代码"
              placeholder="如：SBP"
              value={thresholdForm.indicatorCode}
              onChange={(e) => setThresholdForm({ ...thresholdForm, indicatorCode: e.target.value })}
            />
          </div>

          <Input
            label="单位"
            placeholder="如：mmHg"
            value={thresholdForm.unit}
            onChange={(e) => setThresholdForm({ ...thresholdForm, unit: e.target.value })}
          />

          <div className="p-4 bg-success-50/50 rounded-lg border border-success-100">
            <p className="text-sm font-medium text-success-700 mb-3">正常范围</p>
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="最小值"
                type="number"
                value={thresholdForm.normalMin?.toString()}
                onChange={(e) => setThresholdForm({ ...thresholdForm, normalMin: Number(e.target.value) })}
              />
              <Input
                label="最大值"
                type="number"
                value={thresholdForm.normalMax?.toString()}
                onChange={(e) => setThresholdForm({ ...thresholdForm, normalMax: Number(e.target.value) })}
              />
            </div>
          </div>

          <div className="p-4 bg-warning-50/50 rounded-lg border border-warning-100">
            <p className="text-sm font-medium text-warning-700 mb-3">预警范围</p>
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="预警最小值"
                type="number"
                value={thresholdForm.warningMin?.toString()}
                onChange={(e) => setThresholdForm({ ...thresholdForm, warningMin: Number(e.target.value) })}
              />
              <Input
                label="预警最大值"
                type="number"
                value={thresholdForm.warningMax?.toString()}
                onChange={(e) => setThresholdForm({ ...thresholdForm, warningMax: Number(e.target.value) })}
              />
            </div>
          </div>

          <div className="p-4 bg-danger-50/50 rounded-lg border border-danger-100">
            <p className="text-sm font-medium text-danger-700 mb-3">危急范围</p>
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="危急最小值"
                type="number"
                value={thresholdForm.criticalMin?.toString()}
                onChange={(e) => setThresholdForm({ ...thresholdForm, criticalMin: Number(e.target.value) })}
              />
              <Input
                label="危急最大值"
                type="number"
                value={thresholdForm.criticalMax?.toString()}
                onChange={(e) => setThresholdForm({ ...thresholdForm, criticalMax: Number(e.target.value) })}
              />
            </div>
          </div>

          <Select
            label="优先级"
            options={Object.entries(taskPriorityMap).map(([key, val]) => ({
              value: key,
              label: val.label,
            }))}
            value={thresholdForm.priority}
            onChange={(e) => setThresholdForm({ ...thresholdForm, priority: e.target.value as AbnormalThreshold["priority"] })}
          />

          <Textarea
            label="说明"
            placeholder="请输入指标说明"
            rows={2}
            value={thresholdForm.description}
            onChange={(e) => setThresholdForm({ ...thresholdForm, description: e.target.value })}
          />

          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
            <div>
              <p className="text-sm font-medium text-slate-700">启用阈值</p>
              <p className="text-xs text-slate-500">启用后将自动监测异常指标</p>
            </div>
            <Switch
              checked={thresholdForm.enabled ?? true}
              onChange={() => setThresholdForm({ ...thresholdForm, enabled: !thresholdForm.enabled })}
              size="md"
            />
          </div>
        </div>
      </Drawer>
    </div>
  );
}
