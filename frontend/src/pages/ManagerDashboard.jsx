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
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBankData();
  }, []);

  const fetchBankData = async () => {
    try {
      setLoading(true);
      const res = await api.get('/accounts'); // Manager can read all accounts
      setAccounts(res.data || []);
      setLoading(false);
    } catch (err) {
      console.error('Failed to load accounts for Manager', err);
      setLoading(false);
    }
  };

  const totalAccounts = accounts.length;
  const totalBalance = accounts.reduce((sum, a) => sum + (a.balance || 0), 0);
  const activeAccountsCount = accounts.filter(a => a.status === 'ACTIVE').length;
  const frozenAccountsCount = accounts.filter(a => a.status === 'FROZEN').length;
  
  // Lấy ra top 5 tài khoản giàu nhất
  const topAccounts = [...accounts]
    .sort((a, b) => b.balance - a.balance)
    .slice(0, 5);

  if (loading) {
    return <div className="loading-spinner">Đang tải dữ liệu tổng quan ngân hàng...</div>;
  }

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
