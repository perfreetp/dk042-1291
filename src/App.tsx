import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import Dashboard from "@/pages/Dashboard";
import ReminderConfig from "@/pages/ReminderConfig";
import TaskQueue from "@/pages/TaskQueue";
import Callback from "@/pages/Callback";
import Records from "@/pages/Records";
import Escalation from "@/pages/Escalation";
import DailySummary from "@/pages/DailySummary";

export default function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/reminder-config" element={<ReminderConfig />} />
          <Route path="/task-queue" element={<TaskQueue />} />
          <Route path="/callback" element={<Callback />} />
          <Route path="/records" element={<Records />} />
          <Route path="/escalation" element={<Escalation />} />
          <Route path="/daily-summary" element={<DailySummary />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Layout>
    </Router>
  );
}
