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
  const [tickets, setTickets] = useState([]);

  useEffect(() => {
    fetchAccounts();
    fetchTickets();
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

  const fetchTickets = async () => {
    try {
      const res = await api.get('/support-tickets');
      const mapped = (res.data || []).map(t => ({
        id: t.id,
        type: t.title,
        customer: t.customerName || 'Khách danh ẩn',
        date: new Date(t.createdAt).toLocaleString('vi-VN'),
        status: t.status,
        desc: t.description
      }));
      setTickets(mapped);
    } catch (err) {
      console.error('Failed to load tickets', err);
    }
  };

  const handleTicketAction = async (id, newStatus) => {
    try {
      await api.put(`/support-tickets/${id}/status?status=${newStatus}`);
      fetchTickets();
    } catch (err) {
      alert(err.response?.data?.message || 'Không thể cập nhật trạng thái yêu cầu.');
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
        <div className="admin-table-wrapper glass-card" style={{ marginBottom: '30px' }}>
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

      {/* Support Ticket Simulator Section */}
      <div className="support-tickets-section">
        <div className="section-header" style={{ marginBottom: '15px' }}>
          <h3>Yêu Cầu Hỗ Trợ Đang Chờ Xử Lý ({tickets.filter(t => t.status === 'PENDING').length})</h3>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
          {tickets.map(ticket => (
            <div key={ticket.id} className="glass-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px', borderLeft: ticket.status === 'PENDING' ? '4px solid #f59e0b' : ticket.status === 'APPROVED' ? '4px solid #10b981' : '4px solid #ef4444' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h4 style={{ margin: 0, fontSize: '15px', color: 'var(--text-primary)' }}>{ticket.type}</h4>
                  <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{ticket.customer} • {ticket.date}</span>
                </div>
                <span className={`status-badge ${ticket.status.toLowerCase()}`} style={{ 
                  backgroundColor: ticket.status === 'PENDING' ? 'rgba(245,158,11,0.1)' : ticket.status === 'APPROVED' ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
                  color: ticket.status === 'PENDING' ? '#f59e0b' : ticket.status === 'APPROVED' ? '#10b981' : '#ef4444',
                  padding: '3px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold'
                }}>
                  {ticket.status === 'PENDING' ? 'ĐANG CHỜ' : ticket.status === 'APPROVED' ? 'ĐÃ DUYỆT' : 'TỪ CHỐI'}
                </span>
              </div>
              <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>{ticket.desc}</p>
              
              {ticket.status === 'PENDING' && (
                <div style={{ display: 'flex', gap: '10px', marginTop: '5px' }}>
                  <button 
                    onClick={() => handleTicketAction(ticket.id, 'APPROVED')} 
                    className="btn-primary" 
                    style={{ flex: 1, padding: '6px 12px', fontSize: '12px' }}
                  >
                    Duyệt Yêu Cầu
                  </button>
                  <button 
                    onClick={() => handleTicketAction(ticket.id, 'REJECTED')} 
                    className="btn-secondary" 
                    style={{ flex: 1, padding: '6px 12px', fontSize: '12px', color: '#ef4444', borderColor: 'rgba(239,68,68,0.2)' }}
                  >
                    Từ Chối
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SupportCenter;
