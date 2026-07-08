import { useState, useEffect } from 'react';
import api from '../services/api';
import { CreditCard, Eye, EyeOff, ShieldCheck, ShieldAlert, Lock, Unlock, Plus, RefreshCw, Key } from 'lucide-react';

const Cards = () => {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNumbers, setShowNumbers] = useState({}); // cardId -> boolean
  const [cardType, setCardType] = useState('DEBIT');
  const [actionLoading, setActionLoading] = useState(null); // cardId being processed
  const [showPinModal, setShowPinModal] = useState(false);
  const [pinCardNumber, setPinCardNumber] = useState('');
  const [oldPin, setOldPin] = useState('');
  const [newPin, setNewPin] = useState('');

  useEffect(() => {
    fetchCards();
  }, []);

  const fetchCards = async () => {
    try {
      setLoading(true);
      const res = await api.get('/cards/me');
      setCards(res.data || []);
      setLoading(false);
    } catch (err) {
      console.error('Failed to fetch cards', err);
      setLoading(false);
    }
  };

  const handleIssueCard = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/cards', { cardType });
      setCards([...cards, res.data]);
      alert('Phát hành thẻ ảo thành công!');
    } catch (err) {
      alert(err.response?.data?.message || 'Không thể phát hành thẻ.');
    }
  };

  const handleToggleLock = async (cardNumber) => {
    setActionLoading(cardNumber);
    try {
      const res = await api.put(`/cards/${cardNumber}/toggle`);
      setCards(cards.map(c => c.cardNumber === cardNumber ? res.data : c));
    } catch (err) {
      alert(err.response?.data?.message || 'Không thể thay đổi trạng thái thẻ.');
    } finally {
      setActionLoading(null);
    }
  };

  const toggleShowNumber = (cardId) => {
    setShowNumbers(prev => ({ ...prev, [cardId]: !prev[cardId] }));
  };

  const handleChangePinSubmit = (e) => {
    e.preventDefault();
    if (newPin.length !== 4 || isNaN(newPin)) {
      alert('Mã PIN mới phải gồm đúng 4 chữ số');
      return;
    }
    alert(`Đã đổi mã PIN cho thẻ ${pinCardNumber} thành công!`);
    setShowPinModal(false);
    setOldPin('');
    setNewPin('');
  };

  const formatCardNumber = (num, show) => {
    if (show) {
      return num.replace(/(.{4})/g, '$1 ').trim();
    }
    return `•••• •••• •••• ${num.slice(-4)}`;
  };

  return (
    <div className="cards-view" style={{ paddingBottom: '40px' }}>
      <div className="section-header-main" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
        <div>
          <h1>Quản Lý Thẻ Của Bạn</h1>
          <p>Phát hành thẻ ảo lập tức, bật/tắt khóa thẻ trực tuyến và đổi mã PIN bảo mật.</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '30px', marginTop: '20px' }}>
        
        {/* Left Section: Cards Display */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <h3>Danh Sách Thẻ Sở Hữu ({cards.length})</h3>
          
          {loading ? (
            <div className="loading-spinner">Đang tải danh sách thẻ...</div>
          ) : cards.length === 0 ? (
            <div className="empty-state glass-card" style={{ padding: '40px', textAlign: 'center' }}>
              <CreditCard size={48} style={{ color: 'var(--text-secondary)', marginBottom: '15px' }} />
              <p>Bạn chưa phát hành thẻ ngân hàng nào.</p>
            </div>
          ) : (
            cards.map(card => (
              <div 
                key={card.id} 
                className="glass-card" 
                style={{ 
                  padding: '24px', 
                  borderRadius: '20px', 
                  background: card.cardType === 'CREDIT' 
                    ? 'linear-gradient(135deg, #1e1b4b 0%, #311042 100%)' 
                    : 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
                  position: 'relative',
                  border: card.status === 'LOCKED' ? '2px dashed #ef4444' : '1px solid rgba(255,255,255,0.1)',
                  opacity: card.status === 'LOCKED' ? 0.7 : 1,
                  transition: 'transform 0.3s ease'
                }}
              >
                {/* Status Overlay */}
                {card.status === 'LOCKED' && (
                  <div style={{ 
                    position: 'absolute', top: '15px', right: '15px', 
                    background: '#ef4444', color: 'white', fontSize: '10px', 
                    fontWeight: 'bold', padding: '4px 8px', borderRadius: '4px' 
                  }}>
                    ĐANG KHÓA
                  </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <span style={{ fontSize: '11px', fontWeight: 'bold', color: 'rgba(255,255,255,0.5)' }}>
                    {card.cardType} CARD
                  </span>
                  <span style={{ fontSize: '20px' }}>{card.cardType === 'CREDIT' ? '💳' : '🏦'}</span>
                </div>

                <div style={{ margin: '30px 0 20px 0' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <h3 style={{ fontSize: '20px', margin: 0, fontFamily: 'monospace', letterSpacing: '2px', color: 'white' }}>
                      {formatCardNumber(card.cardNumber, showNumbers[card.id])}
                    </h3>
                    <button 
                      type="button" 
                      onClick={() => toggleShowNumber(card.id)}
                      style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', display: 'flex', padding: '4px' }}
                    >
                      {showNumbers[card.id] ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  
                  {card.cardType === 'CREDIT' && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px' }}>
                      <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)' }}>Hạn mức:</span>
                      <strong style={{ fontSize: '12px', color: '#10b981' }}>
                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(card.cardLimit)}
                      </strong>
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <span style={{ fontSize: '9px', color: 'rgba(255,255,255,0.4)', display: 'block' }}>CHỦ THẺ</span>
                    <strong style={{ fontSize: '13px', color: 'white' }}>{card.holderName}</strong>
                  </div>
                  <div style={{ display: 'flex', gap: '15px' }}>
                    <div>
                      <span style={{ fontSize: '9px', color: 'rgba(255,255,255,0.4)', display: 'block' }}>HẠN DÙNG</span>
                      <strong style={{ fontSize: '13px', color: 'white' }}>{card.expirationDate}</strong>
                    </div>
                    {showNumbers[card.id] && (
                      <div>
                        <span style={{ fontSize: '9px', color: 'rgba(255,255,255,0.4)', display: 'block' }}>CVV</span>
                        <strong style={{ fontSize: '13px', color: '#f59e0b' }}>{card.cvv}</strong>
                      </div>
                    )}
                  </div>
                </div>

                {/* Operations Buttons */}
                <div style={{ display: 'flex', gap: '10px', marginTop: '20px', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '15px' }}>
                  <button
                    onClick={() => handleToggleLock(card.cardNumber)}
                    className="btn-secondary"
                    style={{ flex: 1, padding: '8px 12px', fontSize: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                    disabled={actionLoading === card.cardNumber}
                  >
                    {actionLoading === card.cardNumber ? (
                      <RefreshCw size={14} className="animate-spin" />
                    ) : card.status === 'ACTIVE' ? (
                      <>
                        <Lock size={14} style={{ color: '#ef4444' }} />
                        Khóa Thẻ
                      </>
                    ) : (
                      <>
                        <Unlock size={14} style={{ color: '#10b981' }} />
                        Mở Khóa
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => {
                      setPinCardNumber(card.cardNumber);
                      setShowPinModal(true);
                    }}
                    className="btn-secondary"
                    style={{ flex: 1, padding: '8px 12px', fontSize: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                    disabled={card.status === 'LOCKED'}
                  >
                    <Key size={14} />
                    Đổi mã PIN
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Right Section: Form and Guidelines */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="glass-card" style={{ padding: '24px' }}>
            <h3>Phát Hành Thẻ Mới</h3>
            <p className="settings-desc" style={{ marginBottom: '20px' }}>Phát hành thẻ Visa/Mastercard ảo miễn phí trong 1 giây để thanh toán trực tuyến.</p>

            <form onSubmit={handleIssueCard} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div className="input-group">
                <label>Loại thẻ phát hành</label>
                <select 
                  value={cardType} 
                  onChange={(e) => setCardType(e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(15,23,42,0.6)', color: 'white' }}
                >
                  <option value="DEBIT">Thẻ Ghi Nợ Ảo (Debit Card)</option>
                  <option value="CREDIT">Thẻ Tín Dụng Ảo (Credit Card - Hạn mức 50M)</option>
                </select>
              </div>

              <button type="submit" className="btn-primary" style={{ padding: '10px 20px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <Plus size={16} />
                Yêu Cầu Phát Hành
              </button>
            </form>
          </div>

          <div className="glass-card" style={{ padding: '24px' }}>
            <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '0 0 12px 0', fontSize: '14px', color: '#10b981' }}>
              <ShieldCheck size={18} />
              Thông Tin Bảo Mật Thẻ
            </h4>
            <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '13px', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <li>Thẻ ảo hoạt động tương đương thẻ vật lý thông thường.</li>
              <li>Chức năng <strong>Khóa Thẻ</strong> lập tức đóng băng toàn bộ giao dịch trực tuyến để bảo vệ tài sản của bạn.</li>
              <li>Không chia sẻ số thẻ, ngày hết hạn và mã CVV cho bất kỳ ai.</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Change PIN Modal */}
      {showPinModal && (
        <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="modal-content glass-card" style={{ padding: '30px', width: '90%', maxWidth: '400px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <h3 style={{ margin: 0 }}>Đổi Mã PIN Thẻ</h3>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0 }}>Số thẻ: {formatCardNumber(pinCardNumber, false)}</p>

            <form onSubmit={handleChangePinSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div className="input-group">
                <label htmlFor="oldPin">Mã PIN cũ (4 chữ số)</label>
                <input 
                  id="oldPin"
                  type="password" 
                  maxLength={4}
                  value={oldPin} 
                  onChange={(e) => setOldPin(e.target.value)} 
                  placeholder="••••"
                  required 
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(15,23,42,0.6)', color: 'white', textAlign: 'center', letterSpacing: '4px' }}
                />
              </div>
              <div className="input-group">
                <label htmlFor="newPin">Mã PIN mới (4 chữ số)</label>
                <input 
                  id="newPin"
                  type="password" 
                  maxLength={4}
                  value={newPin} 
                  onChange={(e) => setNewPin(e.target.value)} 
                  placeholder="••••"
                  required 
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(15,23,42,0.6)', color: 'white', textAlign: 'center', letterSpacing: '4px' }}
                />
              </div>
              
              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button type="submit" className="btn-primary" style={{ flex: 1, padding: '10px' }}>Lưu thay đổi</button>
                <button type="button" onClick={() => setShowPinModal(false)} className="btn-secondary" style={{ flex: 1, padding: '10px' }}>Hủy</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cards;
