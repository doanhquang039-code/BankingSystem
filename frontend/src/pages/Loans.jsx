import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { DollarSign, Landmark, Plus, CheckCircle, RefreshCw, FileText, XCircle } from 'lucide-react';

const Loans = () => {
  const { user } = useAuth();
  const isStaff = user?.role === 'MANAGER' || user?.role === 'ADMIN';

  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [amount, setAmount] = useState('');
  const [term, setTerm] = useState(12);
  const [submitting, setSubmitting] = useState(false);
  const [actionLoading, setActionLoading] = useState(null); // loanId being approved

  useEffect(() => {
    fetchLoans();
  }, []);

  const fetchLoans = async () => {
    try {
      setLoading(true);
      const endpoint = isStaff ? '/loans' : '/loans/me';
      const res = await api.get(endpoint);
      setLoans(res.data || []);
      setLoading(false);
    } catch (err) {
      console.error('Failed to load loans list', err);
      setLoading(false);
    }
  };

  const handleRequestLoan = async (e) => {
    e.preventDefault();
    if (!amount || parseFloat(amount) < 5000000) {
      alert('Số tiền vay tối thiểu là 5,000,000 VND');
      return;
    }
    setSubmitting(true);
    try {
      await api.post('/loans', {
        amount: parseFloat(amount),
        termMonths: parseInt(term)
      });
      alert('Gửi đơn đăng ký vay tiêu dùng thành công! Vui lòng chờ Trưởng phòng phê duyệt giải ngân.');
      setAmount('');
      fetchLoans();
    } catch (err) {
      alert(err.response?.data?.message || 'Không thể tạo đơn vay.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleApproveLoan = async (loanId) => {
    setActionLoading(loanId);
    try {
      const res = await api.put(`/loans/${loanId}/approve`);
      alert('Phê duyệt và giải ngân khoản vay thành công!');
      // Update state
      setLoans(loans.map(l => l.id === loanId ? res.data : l));
    } catch (err) {
      alert(err.response?.data?.message || 'Không thể duyệt giải ngân khoản vay này.');
    } finally {
      setActionLoading(null);
    }
  };

  const calculateMonthlyRepay = () => {
    if (!amount || isNaN(amount)) return 0;
    const rate = term > 12 ? 9.5 : 8.5;
    const totalRepay = parseFloat(amount) * (1 + rate / 100);
    return totalRepay / term;
  };

  return (
    <div className="loans-view" style={{ paddingBottom: '40px' }}>
      <div className="section-header-main">
        <h1>Vay Tiêu Dùng Trực Tuyến (Consumer Loans)</h1>
        <p>
          {isStaff 
            ? 'Danh sách hồ sơ đăng ký khoản vay chờ thẩm định và phê duyệt giải ngân tài chính.' 
            : 'Đăng ký vay tín chấp tiêu dùng trực tuyến với lãi suất cực thấp chỉ từ 8.5%/năm, giải ngân lập tức.'}
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '30px', marginTop: '20px' }}>
        
        {/* Left Column: Form (for customer) or Rules Guide (for staff) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {!isStaff ? (
            <div className="glass-card" style={{ padding: '24px' }}>
              <h3>Đăng Ký Khoản Vay Mới</h3>
              
              <form onSubmit={handleRequestLoan} style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '15px' }}>
                <div className="input-group">
                  <label>Số tiền muốn vay (VND)</label>
                  <input 
                    type="number" 
                    value={amount} 
                    onChange={(e) => setAmount(e.target.value)} 
                    placeholder="Tối thiểu 5,000,000"
                    required 
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(15,23,42,0.6)', color: 'white' }}
                  />
                </div>

                <div className="input-group">
                  <label>Kỳ hạn vay</label>
                  <select 
                    value={term} 
                    onChange={(e) => setTerm(parseInt(e.target.value))}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(15,23,42,0.6)', color: 'white' }}
                  >
                    <option value={6}>6 Tháng (Lãi suất cố định 8.5%/năm)</option>
                    <option value={12}>12 Tháng (Lãi suất cố định 8.5%/năm)</option>
                    <option value={24}>24 Tháng (Lãi suất cố định 9.5%/năm)</option>
                  </select>
                </div>

                {amount && (
                  <div style={{ background: 'rgba(99, 102, 241, 0.1)', padding: '15px', borderRadius: '8px', borderLeft: '3px solid #6366f1' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text-secondary)' }}>
                      <span>Lãi suất áp dụng:</span>
                      <strong>{term > 12 ? '9.5%' : '8.5%'} / năm</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: 'white', marginTop: '6px' }}>
                      <span>Trả góp gốc+lãi hàng tháng:</span>
                      <strong style={{ color: '#ef4444' }}>
                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(calculateMonthlyRepay())}
                      </strong>
                    </div>
                  </div>
                )}

                <button 
                  type="submit" 
                  className="btn-primary" 
                  disabled={submitting}
                  style={{ padding: '10px 20px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                >
                  {submitting ? 'Đang gửi hồ sơ...' : 'Gửi Đơn Đăng Ký Vay'}
                </button>
              </form>
            </div>
          ) : (
            <div className="glass-card" style={{ padding: '24px' }}>
              <h3>Cẩm Nang Phê Duyệt Tín Dụng</h3>
              <p className="settings-desc" style={{ marginBottom: '15px' }}>Các quy tắc bắt buộc áp dụng khi kiểm toán và duyệt hồ sơ vay của khách hàng.</p>
              <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '13px', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <li>Xác minh lịch sử giao dịch và số dư bình quân của tài khoản khách hàng.</li>
                <li>Hạn mức vay không vượt quá 5 lần tổng số dư khả dụng trên mọi tài khoản thanh toán hiện có.</li>
                <li>Đơn phê duyệt sẽ thực hiện giải ngân tiền trực tiếp về tài khoản thanh toán của khách hàng trong 1 giây.</li>
              </ul>
            </div>
          )}
        </div>

        {/* Right Column: Loans List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <h3>{isStaff ? 'Đơn Đăng Ký Vay Hệ Thống' : 'Danh Sách Khoản Vay Của Bạn'} ({loans.length})</h3>

          {loading ? (
            <div className="loading-spinner">Đang tải danh sách khoản vay...</div>
          ) : loans.length === 0 ? (
            <div className="empty-state glass-card" style={{ padding: '40px', textAlign: 'center' }}>
              <FileText size={48} style={{ color: 'var(--text-secondary)', marginBottom: '15px' }} />
              <p>Chưa có khoản vay nào ghi nhận.</p>
            </div>
          ) : (
            loans.map(loan => (
              <div 
                key={loan.id} 
                className="glass-card" 
                style={{ 
                  padding: '20px', 
                  borderRadius: '16px', 
                  borderLeft: loan.status === 'PENDING' 
                    ? '4px solid #f59e0b' 
                    : loan.status === 'APPROVED' 
                      ? '4px solid #10b981' 
                      : '4px solid #ef4444',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h4 style={{ margin: 0, fontSize: '14px', color: 'var(--text-primary)' }}>
                      {isStaff ? `Khách hàng ID #${loan.customerId}` : 'Khoản vay cá nhân'}
                    </h4>
                    <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Kỳ hạn {loan.termMonths} tháng • Lãi suất {loan.interestRate}%</span>
                  </div>
                  <span className={`status-badge ${loan.status.toLowerCase()}`} style={{ 
                    fontSize: '10px', 
                    background: loan.status === 'PENDING' ? 'rgba(245,158,11,0.1)' : loan.status === 'APPROVED' ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)', 
                    color: loan.status === 'PENDING' ? '#f59e0b' : loan.status === 'APPROVED' ? '#10b981' : '#ef4444', 
                    padding: '3px 8px', 
                    borderRadius: '4px', 
                    fontWeight: 'bold' 
                  }}>
                    {loan.status === 'PENDING' ? 'CHỜ DUYỆT' : loan.status === 'APPROVED' ? 'ĐÃ DUYỆT' : 'TỪ CHỐI'}
                  </span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '10px' }}>
                  <div>
                    <span style={{ fontSize: '10px', color: 'var(--text-secondary)', display: 'block' }}>SỐ TIỀN VAY</span>
                    <strong style={{ fontSize: '15px', color: 'white' }}>
                      {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(loan.amount)}
                    </strong>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '10px', color: 'var(--text-secondary)', display: 'block' }}>GỐC + LÃI / THÁNG</span>
                    <strong style={{ fontSize: '13px', color: '#ef4444' }}>
                      {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(loan.monthlyPayment)}
                    </strong>
                  </div>
                </div>

                {/* Approve Action Button for staff */}
                {isStaff && loan.status === 'PENDING' && (
                  <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '10px', display: 'flex', justifyContent: 'flex-end' }}>
                    <button
                      onClick={() => handleApproveLoan(loan.id)}
                      className="btn-primary"
                      style={{ padding: '6px 12px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}
                      disabled={actionLoading === loan.id}
                    >
                      {actionLoading === loan.id ? (
                        <RefreshCw size={14} className="animate-spin" />
                      ) : (
                        <>
                          <CheckCircle size={14} />
                          Phê Duyệt & Giải Ngân
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Loans;
