import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';

import Login from './pages/Login';
import Register from './pages/Register';
import DashboardHome from './pages/DashboardHome';
import SendSms from './pages/SendSms';
import BulkUpload from './pages/BulkUpload';
import History from './pages/History';
import AdminHome from './pages/AdminHome';
import AdminUsers from './pages/AdminUsers';
import AdminLogs from './pages/AdminLogs';

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/"          element={<Login />} />
            <Route path="/register"  element={<Register />} />

            <Route path="/dashboard" element={<ProtectedRoute><Layout><DashboardHome /></Layout></ProtectedRoute>} />
            <Route path="/dashboard/send"  element={<ProtectedRoute><Layout><SendSms /></Layout></ProtectedRoute>} />
            <Route path="/dashboard/bulk"  element={<ProtectedRoute><Layout><BulkUpload /></Layout></ProtectedRoute>} />
            <Route path="/dashboard/history" element={<ProtectedRoute><Layout><History /></Layout></ProtectedRoute>} />

            <Route path="/admin"       element={<ProtectedRoute adminOnly><Layout><AdminHome /></Layout></ProtectedRoute>} />
            <Route path="/admin/users" element={<ProtectedRoute adminOnly><Layout><AdminUsers /></Layout></ProtectedRoute>} />
            <Route path="/admin/logs"  element={<ProtectedRoute adminOnly><Layout><AdminLogs /></Layout></ProtectedRoute>} />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
  );
}
