import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { useLanguage } from '../context/LanguageContext';
import { 
  LayoutDashboard, 
  Send, 
  Users, 
  FileText, 
  ShieldAlert, 
  LogOut, 
  Bell, 
  User as UserIcon, 
  ChevronDown, 
  Menu, 
  X, 
  CheckCheck,
  AlertTriangle,
  ArrowDownLeft,
  ArrowUpRight,
  Info,
  Settings as SettingsIcon,
  BookOpen,
  Landmark,
  CreditCard,
  TrendingDown
} from 'lucide-react';
import AiChatbot from './AiChatbot';

const Layout = () => {
  const { user, logout, isAdmin, isManager, isSupport, isAuditor, isCustomer } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notiOpen, setNotiOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  
  const notiRef = useRef(null);

  useEffect(() => {
    if (user) {
      fetchUnreadCount();
      fetchNotifications();
      // Poll notifications every 30 seconds
      const interval = setInterval(() => {
        fetchUnreadCount();
      }, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  // Đóng notification dropdown khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notiRef.current && !notiRef.current.contains(event.target)) {
        setNotiOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchUnreadCount = async () => {
    try {
      const res = await api.get('/notifications/unread-count');
      setUnreadCount(res.data.count);
    } catch (err) {
      console.error('Failed to fetch unread count', err);
    }
  };

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications?page=0&size=5');
      setNotifications(res.data.content || []);
    } catch (err) {
      console.error('Failed to fetch notifications', err);
    }
  };

  const handleNotiClick = async () => {
    setNotiOpen(!notiOpen);
    if (!notiOpen) {
      await fetchNotifications();
      await fetchUnreadCount();
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.put('/notifications/read-all');
      setUnreadCount(0);
      setNotifications(notifications.map(n => ({ ...n, isRead: true })));
    } catch (err) {
      console.error('Failed to mark all notifications read', err);
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setUnreadCount(prev => Math.max(0, prev - 1));
      setNotifications(notifications.map(n => n.id === id ? { ...n, isRead: true } : n));
    } catch (err) {
      console.error('Failed to mark notification read', err);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getNotiIcon = (type) => {
    switch (type) {
      case 'CREDIT':
        return <div className="noti-icon credit"><ArrowDownLeft size={16} /></div>;
      case 'DEBIT':
        return <div className="noti-icon debit"><ArrowUpRight size={16} /></div>;
      case 'SECURITY_ALERT':
        return <div className="noti-icon alert"><AlertTriangle size={16} /></div>;
      default:
        return <div className="noti-icon system"><Info size={16} /></div>;
    }
  };

  const getNavItems = () => {
    const items = [];
    
    // 1. Dashboard Link
    if (isManager()) {
      items.push({ label: t('managerDashboard') || 'Bảng Điều Kiểm', path: '/dashboard/manager-dashboard', icon: <LayoutDashboard size={20} /> });
    } else if (isSupport()) {
      items.push({ label: t('supportCenter') || 'Bảng Điều Khiển', path: '/dashboard/support-center', icon: <LayoutDashboard size={20} /> });
    } else if (isAuditor()) {
      items.push({ label: t('auditLogs') || 'Bảng Điều Khiển', path: '/dashboard/audit-logs', icon: <LayoutDashboard size={20} /> });
    } else {
      // Admin, Customer
      items.push({ label: t('dashboard'), path: '/dashboard', icon: <LayoutDashboard size={20} /> });
    }

    // 2. Client Business Links (Customers, Admins)
    if (isCustomer() || isAdmin()) {
      items.push({ label: t('transfer'), path: '/dashboard/transfer', icon: <Send size={20} /> });
      items.push({ label: 'Gửi Tiết Kiệm', path: '/dashboard/savings', icon: <Landmark size={20} /> });
      items.push({ label: 'Khoản Vay', path: '/dashboard/loans', icon: <TrendingDown size={20} /> });
      items.push({ label: 'Thẻ Của Tôi', path: '/dashboard/cards', icon: <CreditCard size={20} /> });
      items.push({ label: t('beneficiaries'), path: '/dashboard/beneficiaries', icon: <Users size={20} /> });
      items.push({ label: t('learning'), path: '/dashboard/learning', icon: <BookOpen size={20} /> });
    }

    // 3. Statement / Auditing Links
    if (isCustomer() || isAdmin() || isAuditor()) {
      items.push({ label: t('statement'), path: '/dashboard/statement', icon: <FileText size={20} /> });
    }

    // 4. Custom Support search (Support, Manager)
    if (isSupport() || isManager()) {
      items.push({ label: t('supportCenter'), path: '/dashboard/support-center', icon: <Users size={20} /> });
    }

    // 5. Special log links / Loans duyệt for Manager / Admin
    if (isManager()) {
      items.push({ label: 'Duyệt Khoản Vay', path: '/dashboard/loans', icon: <TrendingDown size={20} /> });
    }
    
    if (isManager() || isAdmin()) {
      items.push({ label: t('auditLogs'), path: '/dashboard/audit-logs', icon: <FileText size={20} /> });
    }

    // 6. Admin Control panel
    if (isAdmin()) {
      items.push({ label: 'Duyệt Khoản Vay', path: '/dashboard/loans', icon: <TrendingDown size={20} /> });
      items.push({ label: t('admin'), path: '/dashboard/admin', icon: <ShieldAlert size={20} /> });
    }

    // 7. Settings (Always available)
    items.push({ label: t('settings'), path: '/dashboard/settings', icon: <SettingsIcon size={20} /> });

    return items;
  };

  const navItems = getNavItems();

  const isBackoffice = isAdmin() || isManager() || isSupport() || isAuditor();

  return (
    <div className={`app-layout ${isBackoffice ? 'layout-backoffice' : 'layout-customer'}`}>
      {/* Background blobs for Customer App view */}
      {!isBackoffice && (
        <>
          <div className="glow-bubble bubble-1"></div>
          <div className="glow-bubble bubble-2"></div>
        </>
      )}

      {/* Top Navbar */}
      <header className="top-navbar">
        <div className="nav-left">
          <button className="mobile-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>
            {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
          <div className="brand">
            <span className="brand-icon">🏦</span>
            <span className="brand-name">
              {isBackoffice ? `CONSOLE BAN QUẢN TRỊ` : 'BankingSystem'}
            </span>
          </div>
        </div>

        <div className="nav-right">
          {/* Notifications Dropdown */}
          <div className="noti-container" ref={notiRef}>
            <button className="noti-trigger" onClick={handleNotiClick}>
              <Bell size={20} />
              {unreadCount > 0 && <span className="noti-badge">{unreadCount}</span>}
            </button>

            {notiOpen && (
              <div className="noti-dropdown">
                <div className="noti-header">
                  <h3>Thông báo</h3>
                  {unreadCount > 0 && (
                    <button onClick={handleMarkAllRead} className="btn-link">
                      <CheckCheck size={14} />
                      Đọc tất cả
                    </button>
                  )}
                </div>
                
                <div className="noti-list">
                  {notifications.length === 0 ? (
                    <div className="noti-empty">Không có thông báo mới</div>
                  ) : (
                    notifications.map((n) => (
                      <div 
                        key={n.id} 
                        className={`noti-item ${!n.isRead ? 'unread' : ''}`}
                        onClick={() => !n.isRead && handleMarkAsRead(n.id)}
                      >
                        {getNotiIcon(n.type)}
                        <div className="noti-body">
                          <h4 className="noti-title">{n.title}</h4>
                          <p className="noti-desc">{n.body}</p>
                          <span className="noti-time">
                            {new Date(n.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}{' '}
                            {new Date(n.createdAt).toLocaleDateString('vi-VN')}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                <div className="noti-footer">
                  <Link to="/dashboard/notifications" onClick={() => setNotiOpen(false)}>Xem tất cả thông báo</Link>
                </div>
              </div>
            )}
          </div>

          {/* User Profile */}
          <div className="user-profile-summary">
            <div className="avatar">
              <UserIcon size={18} />
            </div>
            <div className="user-details">
              <span className="username">{user?.username}</span>
              <span className="role-tag">{user?.role}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="main-wrapper">
        {/* Sidebar */}
        <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
          <nav className="sidebar-nav">
            <div className="sidebar-section-title">Hệ thống</div>
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`nav-link ${location.pathname === item.path ? 'active' : ''}`}
                onClick={() => setSidebarOpen(false)}
              >
                {item.icon}
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>

          <div className="sidebar-footer">
            <button className="btn-logout" onClick={handleLogout}>
              <LogOut size={20} />
              <span>{t('logout')}</span>
            </button>
          </div>
        </aside>

        {/* Dynamic Route Content */}
        <main className="content-container">
          <Outlet />
        </main>
      </div>
      <AiChatbot />
    </div>
  );
};

export default Layout;
