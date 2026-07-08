import { useState, useEffect } from 'react';
import api from '../services/api';
import { 
  ShieldAlert, 
  Unlock, 
  Lock, 
  CheckCircle, 
  AlertTriangle,
  RefreshCw,
  Search
} from 'lucide-react';

const Admin = () => {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  const [actionLoading, setActionLoading] = useState(null); // ID of account being processed

  const [cpu, setCpu] = useState(34);
  const [ram, setRam] = useState(4.2);
  const [sessions, setSessions] = useState(128);

  const fetchDashboardStats = async () => {
    try {
      const res = await api.get('/dashboard/admin');
      setCpu(res.data.cpu);
      setRam(parseFloat(res.data.ram.toFixed(1)));
      setSessions(res.data.sessions);
    } catch (err) {
      console.error('Failed to fetch admin dashboard stats', err);
    }
  };

  useEffect(() => {
    fetchAllAccounts();
    fetchDashboardStats();
    
    // Get live monitoring updates from backend
    const interval = setInterval(fetchDashboardStats, 3000);
    
    return () => clearInterval(interval);
  }, []);

  const fetchAllAccounts = async () => {
    try {
      setLoading(true);
      const res = await api.get('/accounts'); // Admin get all accounts
      setAccounts(res.data || []);
      setLoading(false);
    } catch (err) {
      console.error('Failed to fetch accounts for Admin', err);
      setLoading(false);
    }
  };

  const handleStatusToggle = async (accountNumber, currentStatus) => {
    setActionLoading(accountNumber);
    try {
      const isCurrentlyActive = currentStatus === 'ACTIVE';
      const action = isCurrentlyActive ? 'freeze' : 'activate';
      
      const res = await api.put(`/accounts/${accountNumber}/${action}`);
      
      // Cập nhật trạng thái trực tiếp trong state
      setAccounts(accounts.map(acc => 
        acc.accountNumber === accountNumber ? { ...acc, status: res.data.status } : acc
      ));
    } catch (err) {
      alert(err.response?.data?.message || 'Không thể thay đổi trạng thái tài khoản này.');
    } finally {
      setActionLoading(null);
    }
  };

  const filteredAccounts = accounts.filter(acc => 
    acc.accountNumber.includes(search) || 
    acc.customerName?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="admin-view">
      <div className="section-header" style={{ marginBottom: '20px' }}>
        <h1>Quản Trị Hệ Thống</h1>
        <p>Hệ thống giám sát bảo mật tài khoản người dùng, phong tỏa tài khoản đáng ngờ hoặc mở lại hoạt động.</p>
      </div>

      {/* System Resources Monitor Dashboard */}
      <div className="system-monitor-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '20px' }}>
        <div className="glass-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>CPU LOAD</span>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
            <h2 style={{ fontSize: '32px', margin: 0, fontWeight: 'bold', color: cpu > 60 ? '#ef4444' : '#10b981' }}>{cpu}%</h2>
            <span style={{ fontSize: '11px', color: '#10b981' }}>Ổn định</span>
          </div>
          <div style={{ width: '100%', height: '4px', background: 'rgba(255,255,255,0.05)', borderRadius: '2px', overflow: 'hidden' }}>
            <div style={{ width: `${cpu}%`, height: '100%', background: cpu > 60 ? '#ef4444' : '#10b981', transition: 'width 0.5s ease' }}></div>
          </div>
        </div>

        <div className="glass-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>DUNG LƯỢNG RAM</span>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
            <h2 style={{ fontSize: '32px', margin: 0, fontWeight: 'bold', color: '#6366f1' }}>{ram} GB</h2>
            <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>của 8.0 GB</span>
          </div>
          <div style={{ width: '100%', height: '4px', background: 'rgba(255,255,255,0.05)', borderRadius: '2px', overflow: 'hidden' }}>
            <div style={{ width: `${(ram / 8) * 100}%`, height: '100%', background: '#6366f1', transition: 'width 0.5s ease' }}></div>
          </div>
        </div>

        <div className="glass-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>ACTIVE SESSIONS</span>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
            <h2 style={{ fontSize: '32px', margin: 0, fontWeight: 'bold', color: '#f59e0b' }}>{sessions}</h2>
            <span style={{ fontSize: '11px', color: '#10b981' }}>Live</span>
          </div>
          <div style={{ width: '100%', height: '4px', background: 'rgba(255,255,255,0.05)', borderRadius: '2px', overflow: 'hidden' }}>
            <div style={{ width: '65%', height: '100%', background: '#f59e0b' }}></div>
          </div>
        </div>
      </div>

      <div className="admin-filters glass-card">
        <div className="search-wrapper">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm kiếm theo Số tài khoản hoặc Tên khách hàng..."
          />
        </div>
      </div>

      {loading ? (
        <div className="loading-spinner">Đang tải danh sách tài khoản hệ thống...</div>
      ) : filteredAccounts.length === 0 ? (
        <div className="empty-state-large">
          <ShieldAlert size={64} />
          <h2>Không tìm thấy kết quả</h2>
          <p>Không tìm thấy tài khoản ngân hàng nào khớp với thông tin lọc.</p>
        </div>
      ) : (
        <div className="admin-table-wrapper glass-card">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Số Tài Khoản</th>
                <th>Tên Khách Hàng</th>
                <th>Số Dư</th>
                <th>Trạng Thái</th>
                <th>Hành Động</th>
              </tr>
            </thead>
            <tbody>
              {filteredAccounts.map((acc) => (
                <tr key={acc.id} className="admin-row">
                  <td className="acc-number"><strong>{acc.accountNumber}</strong></td>
                  <td className="acc-owner">{acc.customerName}</td>
                  <td className="acc-balance">
                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(acc.balance)}
                  </td>
                  <td className="acc-status">
                    <span className={`status-badge ${acc.status.toLowerCase()}`}>
                      {acc.status === 'ACTIVE' ? 'Đang hoạt động' : acc.status === 'FROZEN' ? 'Đã phong tỏa' : 'Đang khóa'}
                    </span>
                  </td>
                  <td className="acc-actions">
                    {actionLoading === acc.accountNumber ? (
                      <button className="btn-action loading" disabled>
                        <RefreshCw className="animate-spin" size={16} />
                        Đang xử lý
                      </button>
                    ) : acc.status === 'ACTIVE' ? (
                      <button 
                        className="btn-action freeze"
                        onClick={() => handleStatusToggle(acc.accountNumber, acc.status)}
                      >
                        <Lock size={16} />
                        Khóa / Phong tỏa
                      </button>
                    ) : (
                      <button 
                        className="btn-action activate"
                        onClick={() => handleStatusToggle(acc.accountNumber, acc.status)}
                      >
                        <Unlock size={16} />
                        Mở khóa tài khoản
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Admin;
