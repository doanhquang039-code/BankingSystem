import { useState, useEffect } from 'react';
import api from '../services/api';
import { 
  FileSpreadsheet, 
  ChevronLeft, 
  ChevronRight, 
  User, 
  Activity, 
  Calendar, 
  Layers 
} from 'lucide-react';

const AuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Pagination
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [pageSize] = useState(15);

  const [filterUser, setFilterUser] = useState('');
  const [filterAction, setFilterAction] = useState('');

  useEffect(() => {
    fetchAuditLogs();
  }, [page]);

  const fetchAuditLogs = async () => {
    try {
      setLoading(true);
      const res = await api.get('/audit-logs', {
        params: {
          page,
          size: pageSize
        }
      });
      setLogs(res.data.content || []);
      setTotalPages(res.data.totalPages || 0);
      setTotalElements(res.data.totalElements || 0);
      setLoading(false);
    } catch (err) {
      console.error('Failed to load audit logs', err);
      setLoading(false);
    }
  };

  const handleExportCSV = () => {
    if (logs.length === 0) return;
    
    // CSV Header (UTF-8 BOM to display Vietnamese correctly in Excel)
    let csvContent = "\uFEFFThời Gian,Người Thực Hiện,Thao Tác,Đối Tượng,Chi Tiết Hoạt Động\n";
    
    // CSV Rows
    logs.forEach(log => {
      const timeStr = `${new Date(log.createdAt).toLocaleTimeString('vi-VN')} ${new Date(log.createdAt).toLocaleDateString('vi-VN')}`;
      const user = log.performedBy;
      const action = log.action;
      const entity = log.entityType ? `${log.entityType} #${log.entityId}` : '—';
      const desc = `"${log.description.replace(/"/g, '""')}"`;
      
      csvContent += `${timeStr},${user},${action},${entity},${desc}\n`;
    });
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `banking_audit_logs_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredLogs = logs.filter(log => {
    const matchUser = log.performedBy.toLowerCase().includes(filterUser.toLowerCase());
    const matchAction = log.action.toLowerCase().includes(filterAction.toLowerCase());
    return matchUser && matchAction;
  });

  return (
    <div className="audit-logs-view">
      <div className="section-header-main" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
        <div className="header-left">
          <h1>Nhật Ký Hệ Thống (Audit Logs)</h1>
          <p>Nhật ký ghi lại toàn bộ hoạt động nhạy cảm trên hệ thống nhằm phục vụ mục đích kiểm toán và bảo mật.</p>
        </div>
        <button 
          onClick={handleExportCSV} 
          className="btn-primary" 
          style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px' }}
          disabled={logs.length === 0}
        >
          <FileSpreadsheet size={16} />
          Xuất Báo Cáo CSV
        </button>
      </div>

      {/* Filter Bar */}
      <div className="admin-filters glass-card" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', marginTop: '20px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Lọc Người Thực Hiện</label>
          <input 
            type="text" 
            value={filterUser} 
            onChange={(e) => setFilterUser(e.target.value)} 
            placeholder="Ví dụ: admin, auditor..." 
            style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(15,23,42,0.4)', color: 'white' }}
          />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Lọc Loại Hoạt Động</label>
          <input 
            type="text" 
            value={filterAction} 
            onChange={(e) => setFilterAction(e.target.value)} 
            placeholder="Ví dụ: LOGIN, WITHDRAW..." 
            style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(15,23,42,0.4)', color: 'white' }}
          />
        </div>
      </div>

      {loading ? (
        <div className="loading-spinner">Đang tải nhật ký kiểm toán...</div>
      ) : filteredLogs.length === 0 ? (
        <div className="empty-state-large">
          <FileSpreadsheet size={64} />
          <h2>Không có nhật ký phù hợp</h2>
          <p>Không tìm thấy hoạt động nào khớp với các bộ lọc hiện tại.</p>
        </div>
      ) : (
        <>
          <div className="transactions-table-wrapper glass-card">
            <table className="transactions-table">
              <thead>
                <tr>
                  <th>Thời Gian</th>
                  <th>Người Thực Hiện</th>
                  <th>Thao Tác</th>
                  <th>Đối Tượng</th>
                  <th>Chi Tiết Hoạt Động</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="tx-row">
                    <td className="tx-date">
                      {new Date(log.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}{' '}
                      {new Date(log.createdAt).toLocaleDateString('vi-VN')}
                    </td>
                    <td className="tx-user">
                      <span className="user-badge">
                        <User size={12} />
                        {log.performedBy}
                      </span>
                    </td>
                    <td className="tx-action">
                      <span className={`badge-type ${log.action.toLowerCase().includes('fail') ? 'withdraw' : 'transfer'}`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="tx-entity">
                      {log.entityType ? (
                        <span className="entity-badge">
                          {log.entityType} #{log.entityId}
                        </span>
                      ) : '—'}
                    </td>
                    <td className="tx-desc">{log.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="pagination-wrapper">
              <span className="pagination-info">
                Hiển thị {page * pageSize + 1} - {Math.min((page + 1) * pageSize, totalElements)} trên tổng số {totalElements} nhật ký
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

export default AuditLogs;
