import { useState, useEffect } from 'react';
import api from '../services/api';
import { Landmark, ArrowRight, Plus, HelpCircle, BadgePercent, ShieldCheck } from 'lucide-react';

const Savings = () => {
  const [savings, setSavings] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sourceAcc, setSourceAcc] = useState('');
  const [amount, setAmount] = useState('');
  const [term, setTerm] = useState(6);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [savingsRes, accountsRes] = await Promise.all([
        api.get('/savings/me'),
        api.get('/accounts')
      ]);
      setSavings(savingsRes.data || []);
      setAccounts(accountsRes.data || []);
      if (accountsRes.data && accountsRes.data.length > 0) {
        setSourceAcc(accountsRes.data[0].accountNumber);
      }
      setLoading(false);
    } catch (err) {
      console.error('Failed to load savings data', err);
      setLoading(false);
    }
  };

  const getInterestRate = (months) => {
    switch (months) {
      case 1: return 3.50;
      case 3: return 4.50;
      case 6: return 5.50;
      case 12: return 7.20;
      default: return 0.00;
    }
  };

  const handleOpenSavings = async (e) => {
    e.preventDefault();
    if (!amount || parseFloat(amount) < 1000000) {
      alert('Số tiền gửi tối thiểu phải là 1,000,000 VND');
      return;
    }
    setSubmitting(true);
    try {
      await api.post('/savings', {
        sourceAccountNumber: sourceAcc,
        amount: parseFloat(amount),
        termMonths: parseInt(term)
      });
      alert('Mở sổ tiết kiệm trực tuyến thành công!');
      setAmount('');
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Không thể mở sổ tiết kiệm.');
    } finally {
      setSubmitting(false);
    }
  };

  const calculateProjectedInterest = () => {
    if (!amount || isNaN(amount)) return 0;
    const rate = getInterestRate(parseInt(term)) / 100;
    const months = parseInt(term);
    return (parseFloat(amount) * rate * (months / 12));
  };

  return (
    <div className="savings-view" style={{ paddingBottom: '40px' }}>
      <div className="section-header-main">
        <h1>Tiết Kiệm Trực Tuyến (Term Deposit)</h1>
        <p>Tích lũy tài sản an toàn với lãi suất hấp dẫn lên tới 7.2%/năm, mở sổ nhanh chóng chỉ trong vài thao tác.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '30px', marginTop: '20px' }}>
        
        {/* Left Section: Open Savings Form */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="glass-card" style={{ padding: '24px' }}>
            <h3>Mở Sổ Tiết Kiệm Mới</h3>
            
            <form onSubmit={handleOpenSavings} style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '15px' }}>
              <div className="input-group">
                <label>Trích từ tài khoản</label>
                <select 
                  value={sourceAcc} 
                  onChange={(e) => setSourceAcc(e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(15,23,42,0.6)', color: 'white' }}
                >
                  {accounts.map(acc => (
                    <option key={acc.id} value={acc.accountNumber}>
                      {acc.accountNumber} ({new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(acc.balance)})
                    </option>
                  ))}
                </select>
              </div>

              <div className="input-group">
                <label>Số tiền gửi tiết kiệm (VND)</label>
                <input 
                  type="number" 
                  value={amount} 
                  onChange={(e) => setAmount(e.target.value)} 
                  placeholder="Tối thiểu 1,000,000"
                  required 
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(15,23,42,0.6)', color: 'white' }}
                />
              </div>

              <div className="input-group">
                <label>Kỳ hạn gửi</label>
                <select 
                  value={term} 
                  onChange={(e) => setTerm(parseInt(e.target.value))}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(15,23,42,0.6)', color: 'white' }}
                >
                  <option value={1}>1 Tháng (Lãi suất 3.50%/năm)</option>
                  <option value={3}>3 Tháng (Lãi suất 4.50%/năm)</option>
                  <option value={6}>6 Tháng (Lãi suất 5.50%/năm)</option>
                  <option value={12}>12 Tháng (Lãi suất 7.20%/năm)</option>
                </select>
              </div>

              {/* projected interest */}
              {amount && (
                <div style={{ background: 'rgba(99, 102, 241, 0.1)', padding: '15px', borderRadius: '8px', borderLeft: '3px solid #6366f1' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text-secondary)' }}>
                    <span>Lãi suất áp dụng:</span>
                    <strong>{getInterestRate(term)}% / năm</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: 'white', marginTop: '6px' }}>
                    <span>Tiền lãi dự kiến nhận:</span>
                    <strong style={{ color: '#f59e0b' }}>
                      {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(calculateProjectedInterest())}
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
                {submitting ? 'Đang thực hiện...' : 'Xác Nhận Mở Sổ'}
                <ArrowRight size={16} />
              </button>
            </form>
          </div>
        </div>

        {/* Right Section: Active Savings Contracts */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <h3>Danh Sách Sổ Tiết Kiệm Đang Chạy ({savings.length})</h3>

          {loading ? (
            <div className="loading-spinner">Đang tải danh sách sổ tiết kiệm...</div>
          ) : savings.length === 0 ? (
            <div className="empty-state glass-card" style={{ padding: '40px', textAlign: 'center' }}>
              <Landmark size={48} style={{ color: 'var(--text-secondary)', marginBottom: '15px' }} />
              <p>Bạn chưa có sổ tiết kiệm nào.</p>
            </div>
          ) : (
            savings.map(sv => (
              <div 
                key={sv.id} 
                className="glass-card" 
                style={{ 
                  padding: '20px', 
                  borderRadius: '16px', 
                  borderLeft: '4px solid #10b981',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h4 style={{ margin: 0, fontSize: '14px', color: 'var(--text-primary)' }}>Sổ tiết kiệm #{sv.accountNumber}</h4>
                    <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Kỳ hạn {sv.termMonths} tháng • Lãi suất {sv.interestRate}%</span>
                  </div>
                  <span className="status-badge active" style={{ fontSize: '10px', background: 'rgba(16,185,129,0.1)', color: '#10b981', padding: '3px 8px', borderRadius: '4px', fontWeight: 'bold' }}>
                    ĐANG CHẠY
                  </span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '10px' }}>
                  <div>
                    <span style={{ fontSize: '10px', color: 'var(--text-secondary)', display: 'block' }}>GỐC GỬI</span>
                    <strong style={{ fontSize: '15px', color: 'white' }}>
                      {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(sv.balance)}
                    </strong>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '10px', color: 'var(--text-secondary)', display: 'block' }}>NGÀY ĐÁO HẠN</span>
                    <strong style={{ fontSize: '13px', color: 'white' }}>
                      {new Date(sv.maturityDate).toLocaleDateString('vi-VN')}
                    </strong>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Savings;
