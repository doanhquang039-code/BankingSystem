import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Send, AlertTriangle, CheckCircle, Search, User } from 'lucide-react';

const Transfer = () => {
  const navigate = useNavigate();

  const [accounts, setAccounts] = useState([]);
  const [beneficiaries, setBeneficiaries] = useState([]);
  
  const [fromAccount, setFromAccount] = useState('');
  const [toAccount, setToAccount] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successData, setSuccessData] = useState(null);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const [accRes, benRes] = await Promise.all([
        api.get('/accounts'),
        api.get('/beneficiaries')
      ]);
      
      const activeAccs = (accRes.data || []).filter(a => a.status === 'ACTIVE');
      setAccounts(activeAccs);
      if (activeAccs.length > 0) {
        setFromAccount(activeAccs[0].accountNumber);
      }
      
      setBeneficiaries(benRes.data || []);
      setLoading(false);
    } catch (err) {
      console.error('Failed to load initial transfer data', err);
      setLoading(false);
    }
  };

  const handleBeneficiarySelect = (accountNumber) => {
    setToAccount(accountNumber);
  };

  const handleTransfer = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessData(null);

    if (fromAccount === toAccount) {
      setError('Tài khoản gửi và tài khoản nhận không được trùng nhau.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.post('/transactions/transfer', {
        fromAccountNumber: fromAccount,
        toAccountNumber: toAccount,
        amount: parseFloat(amount),
        description: description
      });

      setSuccessData(res.data);
      // Reset form
      setAmount('');
      setDescription('');
    } catch (err) {
      setError(err.response?.data?.message || 'Chuyển khoản thất bại. Vui lòng xác nhận chính xác số tài khoản nhận và số dư khả dụng.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="loading-spinner">Đang tải cấu hình chuyển khoản...</div>;
  }

  return (
    <div className="transfer-view">
      <div className="section-header">
        <h1>Chuyển Tiền Nhanh</h1>
        <p>Hỗ trợ chuyển khoản nội bộ nhanh chóng, an toàn và bảo mật.</p>
      </div>

      <div className="transfer-grid">
        {/* Left column: Transfer Form */}
        <div className="transfer-col-form">
          <div className="glass-card">
            {error && (
              <div className="alert-error">
                <AlertTriangle size={18} />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleTransfer} className="transfer-form">
              {/* Source Account */}
              <div className="input-group">
                <label htmlFor="fromAccount">Tài khoản trích tiền</label>
                <select
                  id="fromAccount"
                  value={fromAccount}
                  onChange={(e) => setFromAccount(e.target.value)}
                  required
                >
                  {accounts.map(acc => (
                    <option key={acc.id} value={acc.accountNumber}>
                      {acc.accountNumber} - Số dư: {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(acc.balance)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Destination Account */}
              <div className="input-group">
                <label htmlFor="toAccount">Số tài khoản thụ hưởng</label>
                <div className="input-wrapper">
                  <Search className="input-icon" size={18} />
                  <input
                    id="toAccount"
                    type="text"
                    value={toAccount}
                    onChange={(e) => setToAccount(e.target.value)}
                    placeholder="Nhập số tài khoản nhận"
                    required
                  />
                </div>
              </div>

              {/* Amount */}
              <div className="input-group">
                <label htmlFor="amount">Số tiền chuyển (VND)</label>
                <input
                  id="amount"
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Tối thiểu 10,000 VND"
                  min="10000"
                  required
                />
              </div>

              {/* Description */}
              <div className="input-group">
                <label htmlFor="description">Nội dung chuyển khoản</label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Nhập nội dung chuyển tiền (không dấu)"
                  rows="3"
                  required
                />
              </div>

              <button type="submit" className="btn-primary form-submit" disabled={submitting}>
                {submitting ? 'Đang thực hiện giao dịch...' : 'Xác Nhận Chuyển Tiền'}
              </button>
            </form>
          </div>
        </div>

        {/* Right column: Quick Beneficiary List */}
        <div className="transfer-col-beneficiaries">
          <div className="glass-card">
            <h3>Danh Bạ Đã Lưu</h3>
            <p className="subtitle">Chọn người nhận trong danh bạ để chuyển nhanh</p>
            
            {beneficiaries.length === 0 ? (
              <div className="empty-side-list">
                <User size={24} />
                <p>Chưa lưu người nhận nào. Thêm mới tại trang Danh bạ thụ hưởng.</p>
              </div>
            ) : (
              <div className="side-beneficiaries-list">
                {beneficiaries.map((ben) => (
                  <div 
                    key={ben.id} 
                    className="side-ben-card"
                    onClick={() => handleBeneficiarySelect(ben.accountNumber)}
                  >
                    <div className="ben-avatar">
                      {ben.alias.substring(0, 2).toUpperCase()}
                    </div>
                    <div className="ben-info">
                      <h4>{ben.alias}</h4>
                      <p>{ben.beneficiaryName}</p>
                      <span>{ben.accountNumber} ({ben.bankName})</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Success Modal */}
      {successData && (
        <div className="modal-overlay">
          <div className="modal-card success">
            <div className="modal-body success-body">
              <div className="success-icon-wrapper">
                <CheckCircle className="icon-success" size={48} />
              </div>
              <h2>Chuyển Khoản Thành Công!</h2>
              <p className="success-tagline">Giao dịch đã được hệ thống xử lý hoàn tất.</p>
              
              <div className="receipt-details">
                <div className="receipt-row">
                  <span>Mã Giao Dịch</span>
                  <strong>#{successData.id}</strong>
                </div>
                <div className="receipt-row">
                  <span>Tài Khoản Gửi</span>
                  <strong>{successData.sourceAccountNumber}</strong>
                </div>
                <div className="receipt-row">
                  <span>Tài Khoản Nhận</span>
                  <strong>{successData.destinationAccountNumber}</strong>
                </div>
                <div className="receipt-row">
                  <span>Số Tiền</span>
                  <strong className="amount">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(successData.amount)}</strong>
                </div>
                <div className="receipt-row">
                  <span>Nội Dung</span>
                  <p>{successData.description}</p>
                </div>
              </div>

              <button 
                type="button" 
                className="btn-primary" 
                onClick={() => {
                  setSuccessData(null);
                  navigate('/');
                }}
              >
                Quay Về Trang Chủ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Transfer;
