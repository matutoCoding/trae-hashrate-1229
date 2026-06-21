import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Dashboard } from "@/pages/Dashboard";
import { RiskDetail } from "@/pages/RiskDetail";
import { MonthlyReport } from "@/pages/MonthlyReport";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/risk/:departmentId" element={<RiskDetail />} />
        <Route path="/report" element={<MonthlyReport />} />
      </Routes>
    </Router>
  );
}
