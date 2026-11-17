import { Navigate, Route, BrowserRouter as Router, Routes } from "react-router";
import { ScrollToTop } from "./components/common/ScrollToTop";
import { ProtectedRoute } from "./components/siv/ProtectedRoute";
import AppLayout from "./layout/AppLayout";
import AlertDetailPage from "./pages/Alerts/AlertDetailPage";
import AlertsPage from "./pages/Alerts/AlertsPage";
import SignIn from "./pages/AuthPages/SignIn";
import SurveillanceDashboard from "./pages/Dashboard/SurveillanceDashboard";
import DetectionsPage from "./pages/Detections/DetectionsPage";
import HistoryPage from "./pages/History/HistoryPage";
import CameraDetailPage from "./pages/Monitoring/CameraDetailPage";
import CameraMonitoringPage from "./pages/Monitoring/CameraMonitoringPage";
import LiveMonitoringPage from "./pages/Monitoring/LiveMonitoringPage";
import NotFound from "./pages/OtherPage/NotFound";
import UserProfiles from "./pages/UserProfiles";
import UsersPage from "./pages/Users/UsersPage";

export default function App() {
  return (
    <Router>
      <ScrollToTop />
      <Routes>
        <Route path="/signin" element={<SignIn />} />

        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<SurveillanceDashboard />} />
            <Route path="/monitoring" element={<LiveMonitoringPage />} />
            <Route path="/cameras" element={<CameraMonitoringPage />} />
            <Route path="/cameras/:id" element={<CameraDetailPage />} />
            <Route path="/alerts" element={<AlertsPage />} />
            <Route path="/alerts/:id" element={<AlertDetailPage />} />
            <Route path="/history" element={<HistoryPage />} />
            <Route path="/detections" element={<DetectionsPage />} />
            <Route path="/users" element={<UsersPage />} />
            <Route path="/profile" element={<UserProfiles />} />
          </Route>
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}
