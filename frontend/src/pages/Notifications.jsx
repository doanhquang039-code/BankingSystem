import { useState, useEffect } from 'react';
import api from '../services/api';
import { 
  Bell, 
  ArrowDownLeft, 
  ArrowUpRight, 
  AlertTriangle, 
  Info,
  CheckCheck,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  // Pagination
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [pageSize] = useState(10);

  useEffect(() => {
    fetchNotifications();
    fetchUnreadCount();
  }, [page]);

  const fetchUnreadCount = async () => {
    try {
      const res = await api.get('/notifications/unread-count');
      setUnreadCount(res.data.count);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await api.get('/notifications', {
        params: { page, size: pageSize }
      });
      setNotifications(res.data.content || []);
      setTotalPages(res.data.totalPages || 0);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setUnreadCount(prev => Math.max(0, prev - 1));
      setNotifications(notifications.map(n => n.id === id ? { ...n, isRead: true } : n));
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.put('/notifications/read-all');
      setUnreadCount(0);
      setNotifications(notifications.map(n => ({ ...n, isRead: true })));
    } catch (err) {
      console.error(err);
    }
  };

  const getNotiIcon = (type) => {
    switch (type) {
      case 'CREDIT':
        return <div className="noti-icon credit"><ArrowDownLeft size={20} /></div>;
      case 'DEBIT':
        return <div className="noti-icon debit"><ArrowUpRight size={20} /></div>;
      case 'SECURITY_ALERT':
        return <div className="noti-icon alert"><AlertTriangle size={20} /></div>;
      default:
        return <div className="noti-icon system"><Info size={20} /></div>;
    }
  };

  return (
    <div className="notifications-view">
      <div className="section-header-main">
        <div className="header-left">
          <h1>Tất Cả Thông Báo</h1>
          <p>Xem toàn bộ biến động số dư và thông báo hệ thống của bạn.</p>
        </div>

        {unreadCount > 0 && (
          <button className="btn-secondary" onClick={handleMarkAllRead}>
            <CheckCheck size={18} />
            Đánh dấu đọc tất cả
          </button>
        )}
      </div>

      {loading ? (
        <div className="loading-spinner">Đang tải thông báo...</div>
      ) : notifications.length === 0 ? (
        <div className="empty-state-large">
          <Bell size={64} />
          <h2>Không có thông báo nào</h2>
          <p>Hộp thư thông báo của bạn hiện đang trống sạch.</p>
        </div>
      ) : (
        <>
          <div className="notifications-list-container glass-card">
            {notifications.map((n) => (
              <div 
                key={n.id} 
                className={`full-noti-item ${!n.isRead ? 'unread' : ''}`}
                onClick={() => !n.isRead && handleMarkAsRead(n.id)}
              >
                {getNotiIcon(n.type)}
                <div className="noti-content-wrapper">
                  <div className="noti-meta">
                    <h3>{n.title}</h3>
                    <span className="time-badge">
                      {new Date(n.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}{' '}
                      {new Date(n.createdAt).toLocaleDateString('vi-VN')}
                    </span>
                  </div>
                  <p className="noti-body-text">{n.body}</p>
                  {!n.isRead && (
                    <button className="btn-read-single" onClick={(e) => {
                      e.stopPropagation();
                      handleMarkAsRead(n.id);
                    }}>
                      Đánh dấu đã đọc
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="pagination-wrapper">
              <div className="pagination-btns">
                <button 
                  className="btn-pagination"
                  disabled={page === 0}
                  onClick={() => setPage(page - 1)}
                >
                  <ChevronLeft size={16} />
                  Trước
                </button>
                
                {Array.from({ length: totalPages }).map((_, idx) => (
                  <button
                    key={idx}
                    className={`btn-page-number ${page === idx ? 'active' : ''}`}
                    onClick={() => setPage(idx)}
                  >
                    {idx + 1}
                  </button>
                ))}

                <button 
                  className="btn-pagination"
                  disabled={page === totalPages - 1}
                  onClick={() => setPage(page + 1)}
                >
                  Sau
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Notifications;
