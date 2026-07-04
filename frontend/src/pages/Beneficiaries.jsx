import { useState, useEffect } from 'react';
import api from '../services/api';
import { 
  UserPlus, 
  Trash2, 
  Edit, 
  AlertTriangle, 
  CheckCircle, 
  User, 
  Plus, 
  Building 
} from 'lucide-react';

const Beneficiaries = () => {
  const [beneficiaries, setBeneficiaries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(null); // hold item being edited
  
  // Form fields for Add/Edit
  const [alias, setAlias] = useState('');
  const [bankName, setBankName] = useState('BankingSystem'); // Mặc định là ngân hàng nội bộ
  const [accountNumber, setAccountNumber] = useState('');
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchBeneficiaries();
  }, []);

  const fetchBeneficiaries = async () => {
    try {
      setLoading(true);
      const res = await api.get('/beneficiaries');
      setBeneficiaries(res.data || []);
      setLoading(false);
    } catch (err) {
      console.error('Failed to load beneficiaries', err);
      setLoading(false);
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setActionLoading(true);

    try {
      // DTO: BeneficiaryRequest(String accountNumber, String bankName, String alias)
      await api.post('/beneficiaries', {
        accountNumber,
        bankName,
        alias
      });

      setSuccess(true);
      setAlias('');
      setAccountNumber('');
      
      await fetchBeneficiaries();
      setTimeout(() => {
        setShowAddModal(false);
        setSuccess(false);
      }, 1000);
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể thêm người nhận. Hãy kiểm tra lại số tài khoản.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleEditInit = (ben) => {
    setShowEditModal(ben);
    setAlias(ben.alias);
    setBankName(ben.bankName);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setActionLoading(true);

    try {
      // DTO PATCH /api/beneficiaries/{id}
      await api.patch(`/beneficiaries/${showEditModal.id}`, {
        alias,
        bankName
      });

      setSuccess(true);
      setAlias('');
      await fetchBeneficiaries();
      setTimeout(() => {
        setShowEditModal(null);
        setSuccess(false);
      }, 1000);
    } catch (err) {
      setError(err.response?.data?.message || 'Cập nhật thất bại.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa người nhận này khỏi danh bạ?')) return;
    
    try {
      await api.delete(`/beneficiaries/${id}`);
      setBeneficiaries(beneficiaries.filter(b => b.id !== id));
    } catch (err) {
      alert('Không thể xóa người thụ hưởng này.');
    }
  };

  return (
    <div className="beneficiaries-view">
      <div className="section-header-main">
        <div className="header-left">
          <h1>Danh Bạ Thụ Hưởng</h1>
          <p>Lưu và quản lý thông tin các tài khoản thụ hưởng thường xuyên chuyển tiền.</p>
        </div>
        <button className="btn-primary btn-add-ben" onClick={() => setShowAddModal(true)}>
          <UserPlus size={18} />
          Thêm người nhận
        </button>
      </div>

      {loading ? (
        <div className="loading-spinner">Đang tải danh bạ thụ hưởng...</div>
      ) : beneficiaries.length === 0 ? (
        <div className="empty-state-large">
          <User size={64} />
          <h2>Danh bạ trống</h2>
          <p>Bạn chưa lưu bất kỳ thông tin thụ hưởng nào. Bấm vào "Thêm người nhận" để tạo mới ngay!</p>
          <button className="btn-primary" onClick={() => setShowAddModal(true)}>Thêm ngay</button>
        </div>
      ) : (
        <div className="beneficiaries-grid">
          {beneficiaries.map((ben) => (
            <div key={ben.id} className="beneficiary-card glass-card">
              <div className="ben-card-top">
                <div className="avatar-large">
                  {ben.alias.substring(0, 2).toUpperCase()}
                </div>
                <div className="ben-badge-bank">
                  <Building size={14} />
                  <span>{ben.bankName}</span>
                </div>
              </div>
              <div className="ben-card-body">
                <h3>{ben.alias}</h3>
                <p className="real-name">{ben.beneficiaryName}</p>
                <p className="account-num">{ben.accountNumber}</p>
              </div>
              <div className="ben-card-footer">
                <button className="btn-edit" onClick={() => handleEditInit(ben)}>
                  <Edit size={16} />
                  Sửa biệt danh
                </button>
                <button className="btn-delete" onClick={() => handleDelete(ben.id)}>
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal: Add Beneficiary */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-header">
              <h3>Thêm Người Thụ Hưởng Mới</h3>
              <button className="btn-close" onClick={() => setShowAddModal(false)}><Plus className="rotate-45" /></button>
            </div>
            <form onSubmit={handleAdd}>
              <div className="modal-body">
                {error && (
                  <div className="alert-error">
                    <AlertTriangle size={16} />
                    <span>{error}</span>
                  </div>
                )}
                {success && (
                  <div className="alert-success">
                    <CheckCircle size={16} />
                    <span>Đã lưu thành công!</span>
                  </div>
                )}
                
                <div className="input-group">
                  <label htmlFor="accountNumber">Số tài khoản nhận</label>
                  <input 
                    id="accountNumber"
                    type="text"
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                    placeholder="Nhập chính xác số tài khoản"
                    required
                  />
                </div>

                <div className="input-group">
                  <label htmlFor="bankName">Tên ngân hàng</label>
                  <select 
                    id="bankName"
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    required
                  >
                    <option value="BankingSystem">BankingSystem (Nội bộ)</option>
                    <option value="Vietcombank">Vietcombank</option>
                    <option value="Techcombank">Techcombank</option>
                    <option value="BIDV">BIDV</option>
                    <option value="MB Bank">MB Bank</option>
                  </select>
                </div>

                <div className="input-group">
                  <label htmlFor="alias">Biệt danh / Tên gợi nhớ</label>
                  <input 
                    id="alias"
                    type="text"
                    value={alias}
                    onChange={(e) => setAlias(e.target.value)}
                    placeholder="Ví dụ: Bố mẹ, Bạn Nam..."
                    required
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setShowAddModal(false)}>Hủy</button>
                <button type="submit" className="btn-primary" disabled={actionLoading || success}>
                  {actionLoading ? 'Đang lưu...' : 'Thêm Thụ Hưởng'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Edit Beneficiary */}
      {showEditModal && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-header">
              <h3>Sửa Thông Tin Người Nhận</h3>
              <button className="btn-close" onClick={() => setShowEditModal(null)}><Plus className="rotate-45" /></button>
            </div>
            <form onSubmit={handleUpdate}>
              <div className="modal-body">
                {error && (
                  <div className="alert-error">
                    <AlertTriangle size={16} />
                    <span>{error}</span>
                  </div>
                )}
                {success && (
                  <div className="alert-success">
                    <CheckCircle size={16} />
                    <span>Đã cập nhật thành công!</span>
                  </div>
                )}

                <div className="input-group">
                  <label>Số tài khoản</label>
                  <input type="text" value={showEditModal.accountNumber} disabled />
                </div>

                <div className="input-group">
                  <label htmlFor="editBankName">Tên ngân hàng</label>
                  <select 
                    id="editBankName"
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    required
                  >
                    <option value="BankingSystem">BankingSystem (Nội bộ)</option>
                    <option value="Vietcombank">Vietcombank</option>
                    <option value="Techcombank">Techcombank</option>
                    <option value="BIDV">BIDV</option>
                    <option value="MB Bank">MB Bank</option>
                  </select>
                </div>

                <div className="input-group">
                  <label htmlFor="editAlias">Biệt danh / Tên gợi nhớ</label>
                  <input 
                    id="editAlias"
                    type="text"
                    value={alias}
                    onChange={(e) => setAlias(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setShowEditModal(null)}>Hủy</button>
                <button type="submit" className="btn-primary" disabled={actionLoading || success}>
                  {actionLoading ? 'Đang cập nhật...' : 'Cập Nhật'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Beneficiaries;
