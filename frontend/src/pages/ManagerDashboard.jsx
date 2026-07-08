import { useState, useEffect } from 'react';
import api from '../services/api';
import { 
  Building, 
  TrendingUp, 
  Users, 
  ShieldCheck, 
  ShieldAlert, 
  Wallet,
  Activity
} from 'lucide-react';

const ManagerDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBankData();
  }, []);

  const fetchBankData = async () => {
    try {
      setLoading(true);
      const res = await api.get('/dashboard/manager');
      setStats(res.data);
      setLoading(false);
    } catch (err) {
      console.error('Failed to load dashboard data for Manager', err);
      setLoading(false);
    }
  };

  if (loading || !stats) {
    return <div className="loading-spinner">Đang tải dữ liệu tổng quan ngân hàng...</div>;
  }

  const { totalAccounts, totalBalance, activeAccountsCount, frozenAccountsCount, topAccounts, monthlyGrowth } = stats;

  return (
    <div className="manager-dashboard-view">
      <div className="section-header">
        <h1>Bảng Kiểm Soát Trưởng Phòng (Manager)</h1>
        <p>Báo cáo tổng quan số liệu tài chính toàn hệ thống ngân hàng thời gian thực.</p>
      </div>

      {/* Stats Cards */}
      <div className="manager-stats-grid">
        <div className="manager-stat-card glass-card">
          <div className="stat-header">
            <span>TỔNG SỐ TÀI KHOẢN</span>
            <Building className="stat-icon" size={20} />
          </div>
          <h2>{totalAccounts}</h2>
          <p>Tài khoản được mở trên hệ thống</p>
        </div>

        <div className="manager-stat-card glass-card">
          <div className="stat-header">
            <span>TỔNG TIỀN GỬI (LIQUIDITY)</span>
            <Wallet className="stat-icon" size={20} />
          </div>
          <h2 className="success-amount">
            {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(totalBalance)}
          </h2>
          <p>Tổng lượng tiền thanh khoản lưu thông</p>
        </div>

        <div className="manager-stat-card glass-card">
          <div className="stat-header">
            <span>TÀI KHOẢN ĐANG HOẠT ĐỘNG</span>
            <ShieldCheck className="stat-icon text-success" size={20} />
          </div>
          <h2>{activeAccountsCount}</h2>
          <p>Tài khoản đang giao dịch bình thường</p>
        </div>

        <div className="manager-stat-card glass-card">
          <div className="stat-header">
            <span>TÀI KHOẢN PHONG TỎA</span>
            <ShieldAlert className="stat-icon text-danger" size={20} />
          </div>
          <h2>{frozenAccountsCount}</h2>
          <p>Tài khoản đang bị tạm ngừng hoạt động</p>
        </div>
      </div>

      {/* Revenue & Growth Trend Chart */}
      <div className="glass-card" style={{ padding: '20px', marginBottom: '30px', marginTop: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
          <h3 style={{ margin: 0, fontSize: '15px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)' }}>
            <TrendingUp size={20} className="text-primary" />
            Biểu Đồ Xu Hướng Tăng Trưởng Doanh Thu Quý II
          </h3>
          <span style={{ fontSize: '12px', color: '#10b981', background: 'rgba(16,185,129,0.1)', padding: '4px 8px', borderRadius: '12px' }}>
            +24.5% So với quý trước
          </span>
        </div>
        <div style={{ position: 'relative', height: '140px', width: '100%', marginTop: '20px' }}>
          {/* SVG Wave chart */}
          <svg viewBox="0 0 500 100" preserveAspectRatio="none" style={{ width: '100%', height: '100%' }}>
            <defs>
              <linearGradient id="managerGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#6366f1" stopOpacity="0.4"/>
                <stop offset="100%" stopColor="#6366f1" stopOpacity="0.0"/>
              </linearGradient>
            </defs>
            {/* Grid Lines */}
            <line x1="0" y1="20" x2="500" y2="20" stroke="rgba(255,255,255,0.05)" strokeDasharray="3,3" />
            <line x1="0" y1="50" x2="500" y2="50" stroke="rgba(255,255,255,0.05)" strokeDasharray="3,3" />
            <line x1="0" y1="80" x2="500" y2="80" stroke="rgba(255,255,255,0.05)" strokeDasharray="3,3" />
            
            {/* Area */}
            <path d="M 0 80 Q 80 40 160 60 T 320 20 T 500 10 L 500 100 L 0 100 Z" fill="url(#managerGrad)" />
            {/* Line */}
            <path d="M 0 80 Q 80 40 160 60 T 320 20 T 500 10" fill="none" stroke="#6366f1" strokeWidth="3" />
            
            {/* Dots */}
            <circle cx="160" cy="60" r="4" fill="#a855f7" />
            <circle cx="320" cy="20" r="4" fill="#6366f1" />
            <circle cx="500" cy="10" r="4" fill="#10b981" />
          </svg>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-secondary)', marginTop: '8px' }}>
            <span>Tháng 4</span>
            <span>Tháng 5</span>
            <span>Tháng 6</span>
            <span>Tháng 7 (Dự kiến)</span>
          </div>
        </div>
      </div>

      {/* Top Rich Customers Table */}
      <div className="top-rich-section">
        <div className="section-header">
          <h3>Top 5 Tài Khoản Có Số Dư Lớn Nhất</h3>
        </div>

        <div className="admin-table-wrapper glass-card">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Hạng</th>
                <th>Số Tài Khoản</th>
                <th>Tên Khách Hàng</th>
                <th>Trạng Thái</th>
                <th>Số Dư Hiện Tại</th>
              </tr>
            </thead>
            <tbody>
              {topAccounts.map((acc, index) => (
                <tr key={acc.id} className="admin-row">
                  <td><strong>#{index + 1}</strong></td>
                  <td className="acc-number"><strong>{acc.accountNumber}</strong></td>
                  <td className="acc-owner">{acc.customerName}</td>
                  <td className="acc-status">
                    <span className={`status-badge ${acc.status.toLowerCase()}`}>
                      {acc.status === 'ACTIVE' ? 'Hoạt động' : 'Bị phong tỏa'}
                    </span>
                  </td>
                  <td className="acc-balance">
                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(acc.balance)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ManagerDashboard;
