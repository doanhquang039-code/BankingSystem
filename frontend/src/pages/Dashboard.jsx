import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { 
  Plus, 
  ArrowDownLeft, 
  ArrowUpRight, 
  Wallet, 
  TrendingUp, 
  CreditCard, 
  CheckCircle,
  HelpCircle,
  Eye,
  EyeOff,
  DollarSign,
  QrCode,
  Camera
} from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  
  const [accounts, setAccounts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [showOpenModal, setShowOpenModal] = useState(false);
  const [showOperationModal, setShowOperationModal] = useState(null); // 'deposit' or 'withdraw'
  const [showQrModal, setShowQrModal] = useState(false);
  const [qrScanSuccess, setQrScanSuccess] = useState(false);
  
  const [initialBalance, setInitialBalance] = useState('');
  const [opAmount, setOpAmount] = useState('');
  const [opDescription, setOpDescription] = useState('');
  
  const [opError, setOpError] = useState('');
  const [opSuccess, setOpSuccess] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  
  const [hideBalances, setHideBalances] = useState(false);

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    try {
      setLoading(true);
      const res = await api.get('/accounts');
      setAccounts(res.data || []);
      if (res.data && res.data.length > 0) {
        // Mặc định chọn tài khoản đầu tiên để xem giao dịch gần đây
        const activeAcc = res.data.find(a => a.status === 'ACTIVE') || res.data[0];
        setSelectedAccount(activeAcc);
        fetchRecentTransactions(activeAcc.accountNumber);
      } else {
        setLoading(false);
      }
    } catch (err) {
      console.error('Failed to load accounts', err);
      setLoading(false);
    }
  };

  const fetchRecentTransactions = async (accNumber) => {
    try {
      const res = await api.get(`/transactions/accounts/${accNumber}`);
      setTransactions(res.data.slice(0, 5) || []); // Chỉ lấy 5 giao dịch gần đây
      setLoading(false);
    } catch (err) {
      console.error('Failed to load transactions', err);
      setLoading(false);
    }
  };

  const handleAccountSelect = (account) => {
    setSelectedAccount(account);
    fetchRecentTransactions(account.accountNumber);
  };

  const handleOpenAccount = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      // Mock customer ID. If backend requires real customer, we can fetch customer or create one.
      // Wait, let's see backend account creation DTO:
      // CreateAccountRequest(Long customerId, BigDecimal initialBalance)
      // Since backend already seeded customers (V2 migration customer IDs 1, 2, 3), and our test users are linked to them.
      // Wait, let's check user object to get customer ID.
      // Wait, does user have a customer? Let's check:
      // User model contains: `private Customer customer;`
      // Let's assume customerId is 1 or read it if available.
      // Wait, our backend AuthService currently links new registered users with NO customer, or we can check if they have one.
      // Let's fallback to customerId = 1 if user.customerId is not present in AuthResponse.
      // Let's verify DTO in AccountService.java:
      // Customer customer = customerService.findCustomer(request.customerId());
      // So request.customerId must exist!
      const customerId = user?.customerId; 

      await api.post('/accounts', {
        customerId: customerId,
        initialBalance: initialBalance ? parseFloat(initialBalance) : 0
      });
      
      setInitialBalance('');
      setShowOpenModal(false);
      await fetchAccounts();
    } catch (err) {
      console.error('Failed to create account', err);
      alert('Không thể mở tài khoản mới. Vui lòng liên hệ quản trị viên.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleOperation = async (e) => {
    e.preventDefault();
    if (!selectedAccount) return;
    
    setOpError('');
    setOpSuccess(false);
    setActionLoading(true);

    try {
      const endpoint = `/transactions/accounts/${selectedAccount.accountNumber}/${showOperationModal}`;
      const res = await api.post(endpoint, {
        amount: parseFloat(opAmount),
        description: opDescription
      });

      setOpSuccess(true);
      setOpAmount('');
      setOpDescription('');
      
      // Update account list and transaction list
      await fetchAccounts();
      
      setTimeout(() => {
        setShowOperationModal(null);
        setOpSuccess(false);
      }, 1500);

    } catch (err) {
      setOpError(err.response?.data?.message || 'Giao dịch thất bại. Vui lòng kiểm tra lại số dư.');
    } finally {
      setActionLoading(false);
    }
  };

  const formatCurrency = (val) => {
    if (hideBalances) return '•••••••• VND';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);
  };

  const maskAccountNumber = (number) => {
    return `•••• •••• •••• ${number.substring(number.length - 4)}`;
  };

  const totalAsset = accounts
    .filter(a => a.status === 'ACTIVE')
    .reduce((sum, a) => sum + (a.balance || 0), 0);

  return (
    <div className="dashboard-view">
      {/* Welcome Banner */}
      <div className="welcome-banner">
        <div className="banner-left">
          <h1>Chào mừng trở lại, {user?.username}!</h1>
          <p>Hệ thống hoạt động bình thường. Giao dịch của bạn an toàn tuyệt đối.</p>
        </div>
        <div className="banner-right">
          <div className="total-asset-card">
            <span className="label">
              Tổng Tài Sản
              <button className="btn-hide-balance" onClick={() => setHideBalances(!hideBalances)}>
                {hideBalances ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </span>
            <h2 className="amount">{formatCurrency(totalAsset)}</h2>
          </div>
        </div>
      </div>

      {/* Grid: Cards + Recent Actions */}
      <div className="dashboard-grid">
        {/* Left Column: Account Cards List */}
        <div className="dashboard-col-left">
          <div className="section-header">
            <h3>Tài Khoản Của Bạn</h3>
            <button className="btn-add-account" onClick={() => setShowOpenModal(true)}>
              <Plus size={16} />
              Mở tài khoản
            </button>
          </div>

          {accounts.length === 0 ? (
            <div className="empty-state">
              <CreditCard size={48} />
              <p>Bạn chưa có tài khoản ngân hàng nào.</p>
              <button className="btn-primary" onClick={() => setShowOpenModal(true)}>Mở tài khoản ngay</button>
            </div>
          ) : (
            <div className="cards-slider">
              {accounts.map((acc) => (
                <div 
                  key={acc.id}
                  className={`atm-card ${selectedAccount?.id === acc.id ? 'active' : ''} ${acc.status !== 'ACTIVE' ? 'frozen' : ''}`}
                  onClick={() => handleAccountSelect(acc)}
                >
                  <div className="card-glass"></div>
                  <div className="card-top">
                    <span className="card-brand">VIsa Gold</span>
                    <span className="card-chip"></span>
                  </div>
                  <div className="card-middle">
                    <h3 className="card-balance">{formatCurrency(acc.balance)}</h3>
                    <p className="card-number">{maskAccountNumber(acc.accountNumber)}</p>
                  </div>
                  <div className="card-bottom">
                    <div className="holder-info">
                      <span>CHỦ TÀI KHOẢN</span>
                      <p>{acc.customerName?.toUpperCase() || user?.username?.toUpperCase()}</p>
                    </div>
                    <span className={`status-badge ${acc.status.toLowerCase()}`}>
                      {acc.status === 'ACTIVE' ? 'HOẠT ĐỘNG' : 'ĐANG KHÓA'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Quick Operations */}
        <div className="dashboard-col-right">
          <div className="section-header">
            <h3>Giao Dịch Nhanh</h3>
          </div>

          <div className="quick-actions-grid">
            <button 
              className="action-card deposit"
              onClick={() => setShowOperationModal('deposit')}
              disabled={!selectedAccount || selectedAccount.status !== 'ACTIVE'}
            >
              <div className="action-icon"><ArrowDownLeft size={24} /></div>
              <h4>Nạp Tiền</h4>
              <p>Nạp thêm tiền mặt vào tài khoản hiện tại</p>
            </button>

            <button 
              className="action-card withdraw"
              onClick={() => setShowOperationModal('withdraw')}
              disabled={!selectedAccount || selectedAccount.status !== 'ACTIVE'}
            >
              <div className="action-icon"><ArrowUpRight size={24} /></div>
              <h4>Rút Tiền</h4>
              <p>Rút tiền trực tuyến từ tài khoản hiện tại</p>
            </button>

            <button 
              className="action-card deposit"
              onClick={() => {
                setQrScanSuccess(false);
                setShowQrModal(true);
              }}
              disabled={!selectedAccount || selectedAccount.status !== 'ACTIVE'}
              style={{ gridColumn: 'span 2', marginTop: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', height: '54px' }}
            >
              <div className="action-icon" style={{ background: 'rgba(168,85,247,0.1)', color: '#a855f7', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '36px', height: '36px', borderRadius: '8px' }}><QrCode size={20} /></div>
              <h4 style={{ margin: 0, fontSize: '14px' }}>Thanh Toán / Chuyển Khoản QR</h4>
            </button>
          </div>

          {/* Spending Analysis Chart & Loyalty Info */}
          <div className="spending-analysis glass-card" style={{ marginTop: '20px', padding: '20px' }}>
            <div className="section-header" style={{ marginBottom: '15px' }}>
              <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: 0, fontSize: '15px', color: 'var(--text-primary)' }}>
                <TrendingUp size={18} className="text-primary" />
                Phân Tích Chi Tiêu Tuần
              </h4>
            </div>
            <div className="chart-container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', height: '100px', padding: '10px 0' }}>
              <div style={{ textAlign: 'center', width: '12%' }}>
                <div style={{ height: '35px', background: 'linear-gradient(to top, #6366f1, #a855f7)', borderRadius: '4px' }}></div>
                <span style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>T2</span>
              </div>
              <div style={{ textAlign: 'center', width: '12%' }}>
                <div style={{ height: '70px', background: 'linear-gradient(to top, #6366f1, #a855f7)', borderRadius: '4px' }}></div>
                <span style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>T3</span>
              </div>
              <div style={{ textAlign: 'center', width: '12%' }}>
                <div style={{ height: '20px', background: 'linear-gradient(to top, #6366f1, #a855f7)', borderRadius: '4px' }}></div>
                <span style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>T4</span>
              </div>
              <div style={{ textAlign: 'center', width: '12%' }}>
                <div style={{ height: '90px', background: 'linear-gradient(to top, #6366f1, #a855f7)', borderRadius: '4px' }}></div>
                <span style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>T5</span>
              </div>
              <div style={{ textAlign: 'center', width: '12%' }}>
                <div style={{ height: '45px', background: 'linear-gradient(to top, #6366f1, #a855f7)', borderRadius: '4px' }}></div>
                <span style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>T6</span>
              </div>
              <div style={{ textAlign: 'center', width: '12%' }}>
                <div style={{ height: '60px', background: 'linear-gradient(to top, #6366f1, #a855f7)', borderRadius: '4px' }}></div>
                <span style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>T7</span>
              </div>
              <div style={{ textAlign: 'center', width: '12%' }}>
                <div style={{ height: '80px', background: 'linear-gradient(to top, #10b981, #34d399)', borderRadius: '4px' }}></div>
                <span style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>CN</span>
              </div>
            </div>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '10px', textAlign: 'center' }}>
              Tổng chi tiêu tuần này giảm 12% so với tuần trước.
            </p>
          </div>
        </div>
      </div>

      {/* Transaction History Section */}
      <div className="recent-transactions-section">
        <div className="section-header">
          <h3>Giao Dịch Gần Đây {selectedAccount && `(${selectedAccount.accountNumber})`}</h3>
        </div>

        {loading ? (
          <div className="loading-spinner">Đang tải lịch sử giao dịch...</div>
        ) : transactions.length === 0 ? (
          <div className="empty-state-tx">Không có giao dịch nào phát sinh.</div>
        ) : (
          <div className="transactions-table-wrapper">
            <table className="transactions-table">
              <thead>
                <tr>
                  <th>Thời Gian</th>
                  <th>Loại</th>
                  <th>Mô Tả Giao Dịch</th>
                  <th>Số Tiền</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((tx) => {
                  const isCredit = 
                    (tx.type === 'DEPOSIT') || 
                    (tx.type === 'TRANSFER' && tx.destinationAccountNumber === selectedAccount?.accountNumber);
                  
                  return (
                    <tr key={tx.id} className="tx-row">
                      <td className="tx-date">
                        {new Date(tx.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}{' '}
                        {new Date(tx.createdAt).toLocaleDateString('vi-VN')}
                      </td>
                      <td className="tx-type">
                        <span className={`badge-type ${tx.type.toLowerCase()}`}>
                          {tx.type === 'TRANSFER' ? 'Chuyển khoản' : tx.type === 'DEPOSIT' ? 'Nạp tiền' : 'Rút tiền'}
                        </span>
                      </td>
                      <td className="tx-desc">
                        <p className="main-desc">{tx.description || 'Giao dịch hệ thống'}</p>
                        {tx.type === 'TRANSFER' && (
                          <span className="sub-desc">
                            {tx.sourceAccountNumber === selectedAccount?.accountNumber
                              ? `Đến: ${tx.destinationAccountNumber}`
                              : `Từ: ${tx.sourceAccountNumber}`}
                          </span>
                        )}
                      </td>
                      <td className={`tx-amount ${isCredit ? 'credit' : 'debit'}`}>
                        {isCredit ? '+' : '-'}{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(tx.amount)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal: Open Account */}
      {showOpenModal && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-header">
              <h3>Mở Tài Khoản Mới</h3>
              <button className="btn-close" onClick={() => setShowOpenModal(false)}><Plus className="rotate-45" /></button>
            </div>
            <form onSubmit={handleOpenAccount}>
              <div className="modal-body">
                <div className="input-group">
                  <label htmlFor="initialBalance">Số dư ban đầu (VND)</label>
                  <input 
                    id="initialBalance"
                    type="number"
                    value={initialBalance}
                    onChange={(e) => setInitialBalance(e.target.value)}
                    placeholder="Ví dụ: 500000"
                    min="0"
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setShowOpenModal(false)}>Hủy</button>
                <button type="submit" className="btn-primary" disabled={actionLoading}>
                  {actionLoading ? 'Đang xử lý...' : 'Xác Nhận Mở'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Deposit or Withdraw Operation */}
      {showOperationModal && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-header">
              <h3>{showOperationModal === 'deposit' ? 'Nạp Tiền Vào Tài Khoản' : 'Rút Tiền Khỏi Tài Khoản'}</h3>
              <button className="btn-close" onClick={() => setShowOperationModal(null)}><Plus className="rotate-45" /></button>
            </div>
            <form onSubmit={handleOperation}>
              <div className="modal-body">
                {opError && (
                  <div className="alert-error">
                    <AlertTriangle size={16} />
                    <span>{opError}</span>
                  </div>
                )}
                {opSuccess && (
                  <div className="alert-success">
                    <CheckCircle size={16} />
                    <span>Giao dịch thành công!</span>
                  </div>
                )}
                <div className="input-group">
                  <label htmlFor="opAmount">Số tiền giao dịch (VND)</label>
                  <input 
                    id="opAmount"
                    type="number"
                    value={opAmount}
                    onChange={(e) => setOpAmount(e.target.value)}
                    placeholder="Tối thiểu 10,000 VND"
                    min="10000"
                    required
                  />
                </div>
                <div className="input-group">
                  <label htmlFor="opDescription">Nội dung / Mô tả</label>
                  <input 
                    id="opDescription"
                    type="text"
                    value={opDescription}
                    onChange={(e) => setOpDescription(e.target.value)}
                    placeholder="Nhập nội dung giao dịch"
                    required
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setShowOperationModal(null)}>Hủy</button>
                <button type="submit" className="btn-primary" disabled={actionLoading || opSuccess}>
                  {actionLoading ? 'Đang xử lý...' : 'Xác Nhận'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* QR Code Modal */}
      {showQrModal && (
        <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="modal-content glass-card" style={{ padding: '24px', width: '90%', maxWidth: '440px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '12px' }}>
              <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px', color: 'white' }}>
                <QrCode size={20} className="text-primary" />
                Giao Dịch Bằng Mã QR
              </h3>
              <button onClick={() => setShowQrModal(false)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', fontSize: '20px' }}>×</button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              
              {/* Tab Selector */}
              <div style={{ display: 'flex', background: 'rgba(255,255,255,0.05)', padding: '4px', borderRadius: '8px' }}>
                <button 
                  type="button"
                  style={{ flex: 1, padding: '8px', border: 'none', borderRadius: '6px', background: !qrScanSuccess ? '#6366f1' : 'none', color: 'white', cursor: 'pointer', fontSize: '13px', fontWeight: 'bold' }}
                  onClick={() => setQrScanSuccess(false)}
                >
                  Mã QR Nhận Tiền
                </button>
                <button 
                  type="button"
                  style={{ flex: 1, padding: '8px', border: 'none', borderRadius: '6px', background: qrScanSuccess ? '#6366f1' : 'none', color: 'white', cursor: 'pointer', fontSize: '13px', fontWeight: 'bold' }}
                  onClick={() => setQrScanSuccess(true)}
                >
                  Quét Mã Chuyển Khoản
                </button>
              </div>

              {!qrScanSuccess ? (
                /* QR Code Generation tab */
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px', padding: '10px 0' }}>
                  <div style={{ 
                    width: '180px', height: '180px', background: 'white', borderRadius: '12px', padding: '15px',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative'
                  }}>
                    {/* Simulated QR blocks using pure CSS/styling inside a grid */}
                    <div style={{ width: '100%', height: '100%', display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '6px', opacity: 0.85 }}>
                      <div style={{ background: '#000', borderRadius: '2px' }}></div>
                      <div style={{ background: '#000', borderRadius: '2px' }}></div>
                      <div></div>
                      <div style={{ background: '#000', borderRadius: '2px' }}></div>
                      <div style={{ background: '#000', borderRadius: '2px' }}></div>
                      
                      <div style={{ background: '#000', borderRadius: '2px' }}></div>
                      <div></div>
                      <div style={{ background: '#000', borderRadius: '2px' }}></div>
                      <div></div>
                      <div style={{ background: '#000', borderRadius: '2px' }}></div>
                      
                      <div></div>
                      <div style={{ background: '#000', borderRadius: '2px' }}></div>
                      <div style={{ background: '#6366f1', borderRadius: '2px' }}></div>
                      <div style={{ background: '#000', borderRadius: '2px' }}></div>
                      <div></div>
                      
                      <div style={{ background: '#000', borderRadius: '2px' }}></div>
                      <div></div>
                      <div style={{ background: '#000', borderRadius: '2px' }}></div>
                      <div></div>
                      <div style={{ background: '#000', borderRadius: '2px' }}></div>
                      
                      <div style={{ background: '#000', borderRadius: '2px' }}></div>
                      <div style={{ background: '#000', borderRadius: '2px' }}></div>
                      <div></div>
                      <div style={{ background: '#000', borderRadius: '2px' }}></div>
                      <div style={{ background: '#000', borderRadius: '2px' }}></div>
                    </div>
                    {/* Bank Icon in the middle of QR code */}
                    <div style={{ position: 'absolute', width: '36px', height: '36px', background: '#6366f1', borderRadius: '50%', border: '3px solid white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px' }}>🏦</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <strong style={{ fontSize: '14px', color: 'white', display: 'block' }}>{selectedAccount?.customerName}</strong>
                    <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>VietBank • {selectedAccount?.accountNumber}</span>
                  </div>
                </div>
              ) : (
                /* QR Scan Simulator tab */
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px', padding: '10px 0' }}>
                  <style>{`
                    @keyframes scanLineAnim {
                      0% { top: 0%; }
                      50% { top: 100%; }
                      100% { top: 0%; }
                    }
                  `}</style>
                  <div style={{ 
                    width: '180px', height: '180px', border: '2px dashed #6366f1', borderRadius: '12px', position: 'relative',
                    overflow: 'hidden', background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>
                    <Camera size={40} style={{ color: 'rgba(255,255,255,0.15)' }} />
                    {/* Scanning Laser line */}
                    <div style={{ 
                      position: 'absolute', left: 0, width: '100%', height: '2px', background: '#10b981',
                      boxShadow: '0 0 8px #10b981', top: '10%',
                      animation: 'scanLineAnim 2s infinite linear'
                    }}></div>
                  </div>
                  
                  <button 
                    onClick={async () => {
                      setActionLoading(true);
                      try {
                        // Simulate sending a transfer of 50K from selected account to Nguyen Van An
                        await api.post('/transactions/transfer', {
                          sourceAccountNumber: selectedAccount.accountNumber,
                          destinationAccountNumber: '100000000001',
                          amount: 50000,
                          description: 'Quet ma QR Thanh toan VietBank'
                        });
                        alert('Quét mã thành công! Đã chuyển khoản nhanh 50,000 VND đến Nguyen Van An.');
                        setShowQrModal(false);
                        fetchAccounts(); // reload balances
                      } catch (err) {
                        alert(err.response?.data?.message || 'Quét mã chuyển khoản thất bại.');
                      } finally {
                        setActionLoading(false);
                      }
                    }}
                    className="btn-primary" 
                    style={{ padding: '10px 16px', display: 'flex', alignItems: 'center', gap: '8px' }}
                    disabled={actionLoading}
                  >
                    <QrCode size={16} />
                    {actionLoading ? 'Đang chuyển khoản...' : 'Quét Mã & Chuyển 50K Chào Mừng'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
