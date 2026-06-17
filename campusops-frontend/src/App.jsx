import React from 'react';
import { Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import UserDashboard from './pages/UserDashboard';
import NoticeListPage from './pages/NoticeListPage';
import NoticeDetailPage from './pages/NoticeDetailPage';
import ReportPage from './pages/ReportPage';
import ReportDetailPage from './pages/ReportDetailPage';
import AssetPage from './pages/AssetPage';
import AssetDetailPage from './pages/AssetDetailPage';
import RoomPage from './pages/RoomPage';
import RoomDetailPage from './pages/RoomDetailPage';
import NotificationPage from './pages/NotificationPage';
import AdminDashboard from './pages/AdminDashboard';
import AdminNoticePage from './pages/AdminNoticePage';
import AdminReportPage from './pages/AdminReportPage';
import AdminAssetPage from './pages/AdminAssetPage';
import AdminRoomPage from './pages/AdminRoomPage';
import HomePage from './pages/HomePage';

export default function App() {
  return (
    <div className="app-shell">
      <Navbar />
      <main className="app-main">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/home" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/dashboard" element={<ProtectedRoute><UserDashboard /></ProtectedRoute>} />
          <Route path="/notices" element={<ProtectedRoute><NoticeListPage /></ProtectedRoute>} />
          <Route path="/notices/:noticeNo" element={<ProtectedRoute><NoticeDetailPage /></ProtectedRoute>} />
          <Route path="/reports" element={<ProtectedRoute><ReportPage /></ProtectedRoute>} />
          <Route path="/reports/:reportNo" element={<ProtectedRoute><ReportDetailPage /></ProtectedRoute>} />
          <Route path="/assets" element={<ProtectedRoute><AssetPage /></ProtectedRoute>} />
          <Route path="/assets/:assetNo" element={<ProtectedRoute><AssetDetailPage /></ProtectedRoute>} />
          <Route path="/rooms" element={<ProtectedRoute><RoomPage /></ProtectedRoute>} />
          <Route path="/rooms/:roomNo" element={<ProtectedRoute><RoomDetailPage /></ProtectedRoute>} />
          <Route path="/notifications" element={<ProtectedRoute><NotificationPage /></ProtectedRoute>} />
          <Route path="/admin" element={<ProtectedRoute role="ADMIN"><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/notices" element={<ProtectedRoute role="ADMIN"><AdminNoticePage /></ProtectedRoute>} />
          <Route path="/admin/reports" element={<ProtectedRoute role="ADMIN"><AdminReportPage /></ProtectedRoute>} />
          <Route path="/admin/assets" element={<ProtectedRoute role="ADMIN"><AdminAssetPage /></ProtectedRoute>} />
          <Route path="/admin/rooms" element={<ProtectedRoute role="ADMIN"><AdminRoomPage /></ProtectedRoute>} />
        </Routes>
      </main>
    </div>
  );
}
