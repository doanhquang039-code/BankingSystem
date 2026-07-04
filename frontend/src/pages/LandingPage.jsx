import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  ShieldCheck, 
  Zap, 
  TrendingUp, 
  Smartphone, 
  ArrowRight, 
  Building,
  HelpCircle,
  Clock,
  Briefcase
} from 'lucide-react';

const LandingPage = () => {
  const { token, user } = useAuth();

  return (
    <div className="landing-view">
      {/* Landing Header */}
      <header className="landing-header">
        <div className="brand">
          <span className="brand-icon">🏦</span>
          <span className="brand-name">BankingSystem</span>
        </div>
        <nav className="landing-nav">
          <a href="#services">Dịch vụ</a>
          <a href="#security">Bảo mật</a>
          <a href="#rates">Lãi suất</a>
          <a href="#about">Về chúng tôi</a>
        </nav>
        <div className="landing-auth-btns">
          <Link to="/login" className="btn-secondary-landing">Đăng nhập</Link>
          <Link to="/register" className="btn-primary-landing">Đăng ký</Link>
          <Link 
            to={
              token 
                ? (user?.role === 'MANAGER' ? '/dashboard/manager-dashboard' : 
                   user?.role === 'SUPPORT' ? '/dashboard/support-center' : 
                   user?.role === 'AUDITOR' ? '/dashboard/audit-logs' : 
                   '/dashboard')
                : '/login'
            } 
            className="btn-primary-landing animate-pulse-subtle"
            style={{ 
              marginLeft: '12px',
              background: 'linear-gradient(135deg, #a855f7 0%, #6366f1 100%)',
              border: 'none',
              boxShadow: '0 0 15px rgba(168, 85, 247, 0.4)'
            }}
          >
            Vào ứng dụng <ArrowRight size={16} />
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="glow-bubble bubble-1"></div>
        <div className="glow-bubble bubble-2"></div>

        <div className="hero-content">
          <span className="badge-promo">🎉 Kỷ nguyên ngân hàng số mới</span>
          <h1>Trải nghiệm tài chính số <br /><span className="gradient-text">Thông minh & Bảo mật</span></h1>
          <p>BankingSystem đem đến giải pháp quản lý tài sản tối ưu, giao dịch chuyển khoản tức thời 24/7 và hệ thống bảo mật đa tầng tối tân.</p>
          
          <div className="hero-cta">
            <Link to="/register" className="btn-primary-hero">
              Mở tài khoản ngay <ArrowRight size={18} />
            </Link>
            <a href="#services" className="btn-secondary-hero">Khám phá dịch vụ</a>
          </div>
        </div>

        <div className="hero-visual">
          <div className="visual-card glass-card">
            <div className="card-header-landing">
              <span>BankingSystem Visa Platinum</span>
              <span className="chip-gold"></span>
            </div>
            <div className="card-body-landing">
              <h3>•••• •••• •••• 8888</h3>
              <p className="card-balance-landing">120,450,000 VND</p>
            </div>
            <div className="card-footer-landing">
              <span>KHÁCH HÀNG ƯU TIÊN</span>
              <strong>HOANG DUC THANG</strong>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="services" className="features-section">
        <div className="section-title">
          <h2>Dịch Vụ Nổi Bật</h2>
          <p>Chúng tôi cung cấp hệ sinh thái tài chính số toàn diện đáp ứng mọi nhu cầu.</p>
        </div>

        <div className="features-grid">
          <div className="feature-card glass-card">
            <div className="feature-icon"><Zap size={24} /></div>
            <h3>Chuyển tiền nhanh 24/7</h3>
            <p>Chuyển khoản nội bộ và liên ngân hàng tức thời, không lo gián đoạn giao dịch.</p>
          </div>

          <div className="feature-card glass-card">
            <div className="feature-icon"><ShieldCheck size={24} /></div>
            <h3>Bảo mật cấp cao</h3>
            <p>Mã hóa dữ liệu AES-256 đầu cuối kết hợp xác thực OTP đa lớp bảo vệ tài khoản.</p>
          </div>

          <div className="feature-card glass-card">
            <div className="feature-icon"><TrendingUp size={24} /></div>
            <h3>Quản lý dòng tiền</h3>
            <p>Tra cứu lịch sử sao kê chi tiết, trực quan hóa thu chi giúp hoạch định tài chính.</p>
          </div>

          <div className="feature-card glass-card">
            <div className="feature-icon"><Smartphone size={24} /></div>
            <h3>Hỗ trợ đa nền tảng</h3>
            <p>Đăng nhập đồng bộ và an toàn thông qua Google, Facebook, Microsoft hoặc LinkedIn.</p>
          </div>
        </div>
      </section>

      {/* Security Trust Section */}
      <section id="security" className="security-section">
        <div className="security-content">
          <h2>An tâm giao dịch với <br /><span className="gradient-text">Hệ thống bảo mật tối tân</span></h2>
          <p>BankingSystem được xây dựng trên nền tảng Spring Security và mã hóa JWT bảo mật tuyệt đối thông tin cá nhân và số dư tài khoản của bạn khỏi mọi cuộc tấn công.</p>
          
          <div className="trust-points">
            <div className="trust-point">
              <Clock size={20} className="trust-icon" />
              <div>
                <h4>Giám sát giao dịch 24/7</h4>
                <p>Nhật ký hệ thống (Audit logs) liên tục theo dõi và phát hiện hành vi bất thường.</p>
              </div>
            </div>
            <div className="trust-point">
              <Briefcase size={20} className="trust-icon" />
              <div>
                <h4>Phân quyền chuyên nghiệp</h4>
                <p>Khách hàng, Thủ quỹ, Trưởng phòng, Kiểm toán và Admin được phân quyền rõ ràng.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="security-visual">
          <div className="security-badge-card glass-card">
            <div className="shield-glow">🛡️</div>
            <h3>Đã xác thực bảo mật</h3>
            <p>Mã hóa SSL/TLS 1.3 bảo vệ đường truyền dữ liệu.</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="about" className="landing-footer">
        <div className="footer-top">
          <div className="footer-brand">
            <h3>🏦 BankingSystem</h3>
            <p>Ngân hàng số thông minh kiến tạo tương lai tài chính của bạn.</p>
          </div>
          <div className="footer-links">
            <h4>Liên kết nhanh</h4>
            <a href="#services">Dịch vụ</a>
            <a href="#security">Bảo mật</a>
            <a href="/login">Đăng nhập cổng Internet Banking</a>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2026 BankingSystem. Tất cả quyền được bảo lưu. Thiết kế giao diện premium.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
