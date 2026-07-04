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

  return (
    <div className="audit-logs-view">
      <div className="section-header-main">
        <div className="header-left">
          <h1>Nhật Ký Hệ Thống (Audit Logs)</h1>
          <p>Nhật ký ghi lại toàn bộ hoạt động nhạy cảm trên hệ thống nhằm phục vụ mục đích kiểm toán và bảo mật.</p>
        </div>
      </div>

      {loading ? (
        <div className="loading-spinner">Đang tải nhật ký kiểm toán...</div>
      ) : logs.length === 0 ? (
        <div className="empty-state-large">
          <FileSpreadsheet size={64} />
          <h2>Nhật ký trống</h2>
          <p>Chưa ghi nhận hoạt động nào trên hệ thống.</p>
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
                {logs.map((log) => (
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
