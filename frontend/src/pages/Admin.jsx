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

  useEffect(() => {
    fetchAllAccounts();
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
      <div className="section-header">
        <h1>Quản Trị Hệ Thống</h1>
        <p>Hệ thống giám sát bảo mật tài khoản người dùng, phong tỏa tài khoản đáng ngờ hoặc mở lại hoạt động.</p>
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
