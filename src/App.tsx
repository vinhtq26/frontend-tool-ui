import { Navigate, Route, Routes } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Licenses from './pages/Licenses';
import Users from './pages/Users';
import Audit from './pages/Audit';
import Settings from './pages/Settings';
import LicenseDetailPage from './pages/LicenseDetail';
import MyLicenses from './pages/MyLicenses';
import AppShell from './components/AppShell';
import ProtectedRoute from './components/ProtectedRoute';

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route element={<ProtectedRoute roles={['admin']} />}>
        <Route element={<AppShell />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/licenses" element={<Licenses />} />
          <Route path="/licenses/:key" element={<LicenseDetailPage />} />
          <Route path="/users" element={<Users />} />
          <Route path="/audit" element={<Audit />} />
          <Route path="/settings" element={<Settings />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute roles={['user', 'admin']} />}>
        <Route path="/my-licenses" element={<MyLicenses />} />
      </Route>

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
