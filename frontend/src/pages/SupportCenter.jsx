import { useState, useEffect } from 'react';
import api from '../services/api';
import { 
  PhoneCall, 
  Search, 
  User, 
  CreditCard, 
  HelpCircle,
  Mail,
  ShieldCheck,
  ShieldAlert
} from 'lucide-react';

const SupportCenter = () => {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    try {
      setLoading(true);
      const res = await api.get('/accounts'); // Support role can read accounts list
      setAccounts(res.data || []);
      setLoading(false);
    } catch (err) {
      console.error('Failed to load accounts for Support', err);
      setLoading(false);
    }
  };

  const filteredAccounts = accounts.filter(acc => 
    acc.accountNumber.includes(search) || 
    acc.customerName?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="support-center-view">
      <div className="section-header">
        <h1>Trung Tâm Hỗ Trợ Khách Hàng (Support)</h1>
        <p>Hỗ trợ giải đáp thắc mắc, tra cứu thông tin số dư, xác thực trạng thái tài khoản cho chủ thẻ.</p>
      </div>

      <div className="admin-filters glass-card">
        <div className="search-wrapper">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tra cứu nhanh theo Số tài khoản hoặc Tên khách hàng..."
          />
        </div>
      </div>

      {loading ? (
        <div className="loading-spinner">Đang tải cơ sở dữ liệu khách hàng...</div>
      ) : filteredAccounts.length === 0 ? (
        <div className="empty-state-large">
          <HelpCircle size={64} />
          <h2>Không tìm thấy khách hàng</h2>
          <p>Không tìm thấy tài khoản ngân hàng nào khớp với truy vấn.</p>
        </div>
      ) : (
        <div className="admin-table-wrapper glass-card">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Thông Tin Khách Hàng</th>
                <th>Số Tài Khoản</th>
                <th>Số Dư</th>
                <th>Trạng Thái</th>
              </tr>
            </thead>
            <tbody>
              {filteredAccounts.map((acc) => (
                <tr key={acc.id} className="admin-row">
                  <td className="acc-owner-info">
                    <div className="owner-meta">
                      <div className="avatar-small">
                        <User size={14} />
                      </div>
                      <div>
                        <h4>{acc.customerName}</h4>
                        <p className="sub-info">
                          <Mail size={12} />
                          Khách hàng hệ thống
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="acc-number">
                    <div className="card-number-wrapper">
                      <CreditCard size={14} />
                      <strong>{acc.accountNumber}</strong>
                    </div>
                  </td>
                  <td className="acc-balance">
                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(acc.balance)}
                  </td>
                  <td className="acc-status">
                    {acc.status === 'ACTIVE' ? (
                      <span className="status-badge active">
                        <ShieldCheck size={12} />
                        Hoạt động bình thường
                      </span>
                    ) : (
                      <span className="status-badge frozen">
                        <ShieldAlert size={12} />
                        Đang bị đóng băng
                      </span>
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

export default SupportCenter;
