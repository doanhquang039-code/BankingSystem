import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import OAuth2RedirectHandler from './pages/OAuth2RedirectHandler';
import Dashboard from './pages/Dashboard';
import Transfer from './pages/Transfer';
import Beneficiaries from './pages/Beneficiaries';
import Statement from './pages/Statement';
import Notifications from './pages/Notifications';
import Admin from './pages/Admin';
import AuditLogs from './pages/AuditLogs';
import ManagerDashboard from './pages/ManagerDashboard';
import SupportCenter from './pages/SupportCenter';
import LandingPage from './pages/LandingPage';
import Settings from './pages/Settings';
import Learning from './pages/Learning';
import { LanguageProvider } from './context/LanguageContext';
import { ThemeProvider } from './context/ThemeContext';
import './App.css';

// Component kiểm tra quyền truy cập của User
const ProtectedRoute = ({ children }) => {
  const { token, loading } = useAuth();

  if (loading) {
    return (
      <div className="app-loading-screen">
        <div className="spinner"></div>
      </div>
    );
  }

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

// Component kiểm tra quyền ADMIN
const AdminRoute = ({ children }) => {
  const { token, isAdmin, loading } = useAuth();
  if (loading) return <div className="app-loading-screen"><div className="spinner"></div></div>;
  if (!token) return <Navigate to="/login" replace />;
  if (!isAdmin()) return <Navigate to="/dashboard" replace />;
  return children;
};

// Component kiểm tra quyền MANAGER
const ManagerRoute = ({ children }) => {
  const { token, isManager, loading } = useAuth();
  if (loading) return <div className="app-loading-screen"><div className="spinner"></div></div>;
  if (!token) return <Navigate to="/login" replace />;
  if (!isManager()) return <Navigate to="/dashboard" replace />;
  return children;
};

// Component kiểm tra quyền SUPPORT hoặc MANAGER
const SupportRoute = ({ children }) => {
  const { token, isSupport, isManager, loading } = useAuth();
  if (loading) return <div className="app-loading-screen"><div className="spinner"></div></div>;
  if (!token) return <Navigate to="/login" replace />;
  if (!isSupport() && !isManager()) return <Navigate to="/dashboard" replace />;
  return children;
};

// Component kiểm tra quyền AUDITOR hoặc ADMIN
const AuditorRoute = ({ children }) => {
  const { token, isAuditor, isAdmin, loading } = useAuth();
  if (loading) return <div className="app-loading-screen"><div className="spinner"></div></div>;
  if (!token) return <Navigate to="/login" replace />;
  if (!isAuditor() && !isAdmin()) return <Navigate to="/dashboard" replace />;
  return children;
};

function App() {
  return (
    <LanguageProvider>
      <ThemeProvider>
        <AuthProvider>
          <Router>
            <Routes>
              {/* Public Landing Page */}
              <Route path="/" element={<LandingPage />} />
              
              {/* Auth Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/oauth2/redirect" element={<OAuth2RedirectHandler />} />

              {/* Protected Portal Routes inside Main Layout */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Layout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<Dashboard />} />
                <Route path="transfer" element={<Transfer />} />
                <Route path="beneficiaries" element={<Beneficiaries />} />
                <Route path="statement" element={<Statement />} />
                <Route path="notifications" element={<Notifications />} />
                <Route path="settings" element={<Settings />} />
                <Route path="learning" element={<Learning />} />
                
                {/* Admin only route */}
                <Route path="admin" element={<AdminRoute><Admin /></AdminRoute>} />
                
                {/* Manager only route */}
                <Route path="manager-dashboard" element={<ManagerRoute><ManagerDashboard /></ManagerRoute>} />
                
                {/* Support route */}
                <Route path="support-center" element={<SupportRoute><SupportCenter /></SupportRoute>} />
                
                {/* Auditor / Admin route */}
                <Route path="audit-logs" element={<AuditorRoute><AuditLogs /></AuditorRoute>} />
              </Route>

              {/* Fallback redirect */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Router>
        </AuthProvider>
      </ThemeProvider>
    </LanguageProvider>
  );
}

export default App;
