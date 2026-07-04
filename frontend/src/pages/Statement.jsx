import { useState, useEffect } from 'react';
import api from '../services/api';
import { 
  FileText, 
  ArrowDownLeft, 
  ArrowUpRight, 
  ChevronLeft, 
  ChevronRight, 
  Download,
  Calendar,
  Building
} from 'lucide-react';

const Statement = () => {
  const [accounts, setAccounts] = useState([]);
  const [selectedAccNumber, setSelectedAccNumber] = useState('');
  
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Pagination state
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [pageSize] = useState(10); // 10 items per page

  useEffect(() => {
    fetchAccounts();
  }, []);

  useEffect(() => {
    if (selectedAccNumber) {
      fetchStatement(selectedAccNumber, page);
    }
  }, [selectedAccNumber, page]);

  const fetchAccounts = async () => {
    try {
      const res = await api.get('/accounts');
      const activeAccs = (res.data || []).filter(a => a.status === 'ACTIVE');
      setAccounts(activeAccs);
      if (activeAccs.length > 0) {
        setSelectedAccNumber(activeAccs[0].accountNumber);
      } else {
        setLoading(false);
      }
    } catch (err) {
      console.error('Failed to fetch accounts in Statement', err);
      setLoading(false);
    }
  };

  const fetchStatement = async (accNumber, pageNum) => {
    try {
      setLoading(true);
      const res = await api.get(`/transactions/accounts/${accNumber}/statement`, {
        params: {
          page: pageNum,
          size: pageSize
        }
      });
      setTransactions(res.data.content || []);
      setTotalPages(res.data.totalPages || 0);
      setTotalElements(res.data.totalElements || 0);
      setLoading(false);
    } catch (err) {
      console.error('Failed to fetch paged statement', err);
      setLoading(false);
    }
  };

  const handleAccountChange = (e) => {
    setSelectedAccNumber(e.target.value);
    setPage(0); // reset to page 0
  };

  const handleDownloadCSV = () => {
    if (transactions.length === 0) return;
    
    // Tạo file CSV nội dung sao kê
    let csvContent = "data:text/csv;charset=utf-8,\uFEFF"; // Thêm BOM để hiển thị đúng tiếng Việt
    csvContent += "Mã Giao Dịch,Thời Gian,Loại Giao Dịch,Mã Gửi,Mã Nhận,Số Tiền (VND),Nội Dung\n";
    
    transactions.forEach(tx => {
      csvContent += `${tx.id},"${new Date(tx.createdAt).toLocaleString('vi-VN')}",${tx.type},${tx.sourceAccountNumber || ''},${tx.destinationAccountNumber || ''},${tx.amount},"${tx.description || ''}"\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `SaoKe_TaiKhoan_${selectedAccNumber}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="statement-view">
      <div className="section-header-main">
        <div className="header-left">
          <h1>Sao Kê Tài Khoản</h1>
          <p>Truy vấn lịch sử giao dịch chi tiết, xuất hóa đơn điện tử hoặc bảng sao kê định kỳ.</p>
        </div>
        
        {transactions.length > 0 && (
          <button className="btn-secondary" onClick={handleDownloadCSV}>
            <Download size={18} />
            Tải File CSV
          </button>
        )}
      </div>

      <div className="statement-filters glass-card">
        <div className="filter-group">
          <label htmlFor="selectAcc">Chọn tài khoản sao kê</label>
          <select id="selectAcc" value={selectedAccNumber} onChange={handleAccountChange}>
            {accounts.map(acc => (
              <option key={acc.id} value={acc.accountNumber}>
                {acc.accountNumber} - Số dư: {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(acc.balance)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="loading-spinner">Đang tải lịch sử sao kê tài khoản...</div>
      ) : transactions.length === 0 ? (
        <div className="empty-state-large">
          <FileText size={64} />
          <h2>Không tìm thấy giao dịch</h2>
          <p>Tài khoản {selectedAccNumber} chưa phát sinh giao dịch nào trong khoảng thời gian được chọn.</p>
        </div>
      ) : (
        <>
          <div className="transactions-table-wrapper glass-card">
            <table className="transactions-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Thời Gian</th>
                  <th>Loại</th>
                  <th>Tài Khoản Gửi</th>
                  <th>Tài Khoản Nhận</th>
                  <th>Số Tiền</th>
                  <th>Mô Tả</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((tx) => {
                  const isCredit = 
                    (tx.type === 'DEPOSIT') || 
                    (tx.type === 'TRANSFER' && tx.destinationAccountNumber === selectedAccNumber);
                  
                  return (
                    <tr key={tx.id} className="tx-row">
                      <td className="tx-id">#{tx.id}</td>
                      <td className="tx-date">
                        {new Date(tx.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}{' '}
                        {new Date(tx.createdAt).toLocaleDateString('vi-VN')}
                      </td>
                      <td className="tx-type">
                        <span className={`badge-type ${tx.type.toLowerCase()}`}>
                          {tx.type === 'TRANSFER' ? 'Chuyển khoản' : tx.type === 'DEPOSIT' ? 'Nạp tiền' : 'Rút tiền'}
                        </span>
                      </td>
                      <td className="tx-acc">{tx.sourceAccountNumber || '—'}</td>
                      <td className="tx-acc">{tx.destinationAccountNumber || '—'}</td>
                      <td className={`tx-amount ${isCredit ? 'credit' : 'debit'}`}>
                        {isCredit ? '+' : '-'}{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(tx.amount)}
                      </td>
                      <td className="tx-desc">{tx.description}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="pagination-wrapper">
              <span className="pagination-info">
                Hiển thị {page * pageSize + 1} - {Math.min((page + 1) * pageSize, totalElements)} trên tổng số {totalElements} giao dịch
              </span>
              
              <div className="pagination-btns">
                <button 
                  className="btn-pagination"
                  disabled={page === 0}
                  onClick={() => setPage(page - 1)}
                >
                  <ChevronLeft size={16} />
                  Trước
                </button>
                
                {Array.from({ length: totalPages }).map((_, idx) => (
                  <button
                    key={idx}
                    className={`btn-page-number ${page === idx ? 'active' : ''}`}
                    onClick={() => setPage(idx)}
                  >
                    {idx + 1}
                  </button>
                ))}

                <button 
                  className="btn-pagination"
                  disabled={page === totalPages - 1}
                  onClick={() => setPage(page + 1)}
                >
                  Sau
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Statement;
