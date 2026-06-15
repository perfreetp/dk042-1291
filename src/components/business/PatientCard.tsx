import { Phone, MapPin, Calendar, AlertTriangle, User, Users } from "lucide-react";
import type { Patient } from "@/types/patient";
import { riskLevelMap } from "@/types/patient";
import { Tag } from "@/components/ui/Tag";
import { getWeeksDaysText, formatDate, formatPhone } from "@/utils/date";
import { Card } from "@/components/ui/Card";

interface PatientCardProps {
  patient: Patient;
  onClick?: () => void;
  selected?: boolean;
}

export function PatientCard({ patient, onClick, selected = false }: PatientCardProps) {
  const riskInfo = riskLevelMap[patient.riskLevel];

  return (
    <Card
      hoverable
      padding="md"
      className={`transition-all duration-200 ${
        selected ? "ring-2 ring-primary-500 shadow-card-hover" : ""
      }`}
      onClick={onClick}
    >
      {/* 头部 - 基本信息 */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div
            className={`w-11 h-11 rounded-full flex items-center justify-center text-white font-semibold ${
              patient.riskLevel === "high"
                ? "bg-gradient-to-br from-danger-400 to-danger-600"
                : patient.riskLevel === "medium"
                ? "bg-gradient-to-br from-warning-400 to-warning-600"
                : "bg-gradient-to-br from-success-400 to-success-600"
            }`}
          >
            {patient.name.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-semibold text-slate-800">{patient.name}</h3>
              <Tag variant={patient.riskLevel === "high" ? "danger" : patient.riskLevel === "medium" ? "warning" : "success"} size="sm">
                {riskInfo.label}
              </Tag>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {patient.age}岁 · 孕{getWeeksDaysText(patient.gestationalWeek, patient.gestationalDay)}
            </p>
          </div>
        </div>
        <span className="text-xs text-slate-400">{patient.id}</span>
      </div>

      {/* 高危类型标签 */}
      {patient.highRiskType && patient.highRiskType.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-4">
          {patient.highRiskType.map((type, idx) => (
            <Tag key={idx} variant="info" size="sm">
              {type}
            </Tag>
          ))}
        </div>
      )}

      {/* 异常指标 */}
      {patient.abnormalIndicators && patient.abnormalIndicators.length > 0 && (
        <div className="flex items-center gap-2 mb-3 px-3 py-2 bg-danger-50 rounded-lg">
          <AlertTriangle size={14} className="text-danger-500 flex-shrink-0" />
          <div className="flex flex-wrap gap-1">
            {patient.abnormalIndicators.map((indicator, idx) => (
              <span key={idx} className="text-xs text-danger-700">
                {indicator}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* 联系信息 */}
      <div className="space-y-2 text-sm">
        <div className="flex items-center gap-2 text-slate-600">
          <Phone size={14} className="text-slate-400" />
          <span>{formatPhone(patient.phone)}</span>
        </div>
        <div className="flex items-center gap-2 text-slate-600">
          <Users size={14} className="text-slate-400" />
          <span className="text-xs">家属: {patient.familyContact} {formatPhone(patient.familyPhone)}</span>
        </div>
        <div className="flex items-center gap-2 text-slate-600">
          <Calendar size={14} className="text-slate-400" />
          <span className="text-xs">下次产检: {formatDate(patient.nextVisitTime)}</span>
        </div>
        <div className="flex items-center gap-2 text-slate-600">
          <MapPin size={14} className="text-slate-400" />
          <span className="text-xs text-ellipsis-1">{patient.address}</span>
        </div>
      </div>

      {/* 失联标记 */}
      {patient.isLostFollow && (
        <div className="mt-4 pt-3 border-t border-slate-100">
          <div className="flex items-center gap-2 text-danger-600">
            <User size={14} />
            <span className="text-sm font-medium">失联状态</span>
          </div>
        </div>
      )}
    </Card>
  );
}
