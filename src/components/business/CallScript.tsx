import { useState } from "react";
import { ChevronRight, ChevronDown, Volume2, Copy, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState as useReactState } from "react";

interface ScriptStep {
  id: string;
  title: string;
  content: string;
  completed?: boolean;
}

interface CallScriptProps {
  patientName?: string;
  taskType?: string;
  script?: string;
  onComplete?: () => void;
}

export function CallScript({ patientName = "患者", taskType, script, onComplete }: CallScriptProps) {
  const [copied, setCopied] = useState(false);
  const [expandedSteps, setExpandedSteps] = useReactState<Record<string, boolean>>({
    step1: true,
    step2: false,
    step3: false,
    step4: false,
  });
  const [currentStep, setCurrentStep] = useState(1);

  const defaultSteps: ScriptStep[] = [
    {
      id: "step1",
      title: "开场问候与身份确认",
      content: `您好，我是XX医院产科随访护士，请问是${patientName}吗？\n\n（等待对方确认）\n\n打扰您几分钟时间，今天打电话是想跟您做一个孕期随访，请问您现在方便接听电话吗？`,
    },
    {
      id: "step2",
      title: "了解近期身体状况",
      content: `请问您最近身体怎么样？有没有什么不舒服的地方？\n\n（根据患者回答，询问具体症状）\n\n胎动正常吗？每天大概动多少次？\n\n饮食和睡眠情况怎么样？\n\n有没有按时服用医生开的药物？`,
    },
    {
      id: "step3",
      title: "提醒产检/复诊",
      content: `您的下次产检时间是{日期}，想跟您确认一下是否能按时来产检？\n\n（如果不能按时：请问是什么原因呢？需不需要帮您重新预约时间？）\n\n（如果能按时：好的，那我们{日期}见，产检当天记得空腹过来）`,
    },
    {
      id: "step4",
      title: "健康指导与结束通话",
      content: `平时要注意多休息，避免劳累，饮食要均衡。\n\n如果出现以下情况，请立即来医院：\n1. 阴道出血或流水\n2. 剧烈腹痛\n3. 胎动明显减少或增多\n4. 头痛、头晕、视物模糊\n\n好的，那今天就不打扰您了，祝您孕期顺利！有任何问题随时给我们打电话。再见！`,
    },
  ];

  const steps = defaultSteps;

  const toggleStep = (stepId: string) => {
    setExpandedSteps((prev) => ({
      ...prev,
      [stepId]: !prev[stepId],
    }));
  };

  const handleCopy = () => {
    const fullScript = steps.map((s) => `【${s.title}】\n${s.content}`).join("\n\n");
    navigator.clipboard.writeText(fullScript);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleNextStep = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
      setExpandedSteps((prev) => ({
        ...prev,
        [`step${currentStep + 1}`]: true,
      }));
    } else {
      onComplete?.();
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-card border border-slate-100 overflow-hidden">
      {/* 标题栏 */}
      <div className="px-5 py-4 bg-gradient-to-r from-primary-50 to-blue-50 border-b border-slate-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary-500 flex items-center justify-center">
              <Volume2 size={20} className="text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-800">通话语音脚本</h3>
              <p className="text-xs text-slate-500">
                当前进度: {currentStep}/{steps.length} 步
              </p>
            </div>
          </div>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-slate-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
          >
            {copied ? <Check size={16} className="text-success-500" /> : <Copy size={16} />}
            <span>{copied ? "已复制" : "复制脚本"}</span>
          </button>
        </div>

        {/* 进度条 */}
        <div className="mt-3 h-1.5 bg-primary-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-primary-500 rounded-full transition-all duration-500"
            style={{ width: `${(currentStep / steps.length) * 100}%` }}
          />
        </div>
      </div>

      {/* 脚本步骤 */}
      <div className="divide-y divide-slate-100 max-h-[400px] overflow-y-auto">
        {steps.map((step, index) => {
          const stepNum = index + 1;
          const isExpanded = expandedSteps[step.id];
          const isPast = stepNum < currentStep;
          const isCurrent = stepNum === currentStep;

          return (
            <div
              key={step.id}
              className={cn(
                "transition-colors",
                isCurrent && "bg-primary-50/50"
              )}
            >
              <button
                onClick={() => toggleStep(step.id)}
                className={cn(
                  "w-full px-5 py-3 flex items-center gap-3 text-left hover:bg-slate-50 transition-colors",
                  isPast && "text-slate-400"
                )}
              >
                <div
                  className={cn(
                    "w-7 h-7 rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0",
                    isPast
                      ? "bg-success-500 text-white"
                      : isCurrent
                      ? "bg-primary-500 text-white"
                      : "bg-slate-200 text-slate-500"
                  )}
                >
                  {isPast ? <Check size={14} /> : stepNum}
                </div>
                <span className={cn("flex-1 text-sm font-medium", isPast && "line-through")}>
                  {step.title}
                </span>
                {isExpanded ? (
                  <ChevronDown size={18} className="text-slate-400" />
                ) : (
                  <ChevronRight size={18} className="text-slate-400" />
                )}
              </button>

              {isExpanded && (
                <div className="px-5 pb-4 pl-15">
                  <div className="ml-10 p-4 bg-slate-50 rounded-lg text-sm text-slate-700 whitespace-pre-line leading-relaxed">
                    {step.content}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* 底部操作 */}
      <div className="px-5 py-4 border-t border-slate-100 flex justify-end gap-3">
        <button
          onClick={() => currentStep > 1 && setCurrentStep(currentStep - 1)}
          disabled={currentStep === 1}
          className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          上一步
        </button>
        <button
          onClick={handleNextStep}
          className="px-6 py-2 text-sm font-medium text-white bg-primary-500 hover:bg-primary-600 rounded-lg transition-colors"
        >
          {currentStep === steps.length ? "完成回访" : "下一步"}
        </button>
      </div>
    </div>
  );
}
