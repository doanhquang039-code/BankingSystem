import { useState, useEffect } from 'react';
import api from '../services/api';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { 
  Globe, 
  Palette, 
  Sun, 
  Moon, 
  Check, 
  HelpCircle,
  Settings as SettingsIcon,
  ShieldCheck,
  User,
  Phone,
  Mail,
  Award
} from 'lucide-react';

const Settings = () => {
  const { lang, changeLanguage, t } = useLanguage();
  const { themeColor, setThemeColor, themeMode, setThemeMode } = useTheme();

  const [profile, setProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editFullName, setEditFullName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [updateError, setUpdateError] = useState('');
  const [updateSuccess, setUpdateSuccess] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoadingProfile(true);
      const res = await api.get('/customers/me');
      setProfile(res.data);
      setEditFullName(res.data.fullName);
      setEditPhone(res.data.phone);
      setEditEmail(res.data.email);
      setLoadingProfile(false);
    } catch (err) {
      console.error('Failed to fetch customer profile', err);
      setLoadingProfile(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setUpdateError('');
    setUpdateSuccess(false);
    try {
      const res = await api.put('/customers/me', {
        fullName: editFullName,
        email: editEmail,
        phone: editPhone
      });
      setProfile(res.data);
      setUpdateSuccess(true);
      setIsEditing(false);
      setTimeout(() => setUpdateSuccess(false), 2000);
    } catch (err) {
      setUpdateError(err.response?.data?.message || 'Cập nhật thông tin thất bại.');
    }
  };

  const colorThemes = [
    { id: 'indigo', name: 'Indigo (Mặc định)', color: '#6366f1' },
    { id: 'emerald', name: 'Emerald Green (Lục bảo)', color: '#10b981' },
    { id: 'ruby', name: 'Ruby Red (Hồng ngọc)', color: '#ef4444' },
    { id: 'ocean', name: 'Ocean Blue (Đại dương)', color: '#0ea5e9' },
    { id: 'amber', name: 'Golden Amber (Hổ phách)', color: '#f59e0b' }
  ];

  return (
    <div className="settings-view">
      <div className="section-header-main">
        <div>
          <h1>{t('settings')}</h1>
          <p>Tùy chỉnh ngôn ngữ hiển thị, giao diện cá nhân và cấu hình bảo mật ứng dụng.</p>
        </div>
      </div>

      <div className="settings-grid">
        {/* Profile Card */}
        <div className="settings-card glass-card profile-settings-card" style={{ gridColumn: '1 / -1' }}>
          <div className="settings-card-header">
            <User className="settings-icon-header" size={22} />
            <h3>Thông tin tài khoản</h3>
          </div>
          
          {loadingProfile ? (
            <div className="loading-spinner" style={{ padding: '20px 0', textAlign: 'center', color: 'var(--text-secondary)' }}>
              Đang tải thông tin cá nhân...
            </div>
          ) : profile ? (
            <div className="profile-settings-content">
              {updateSuccess && (
                <div className="alert-success" style={{ marginBottom: '15px' }}>
                  <span>Cập nhật hồ sơ thành công!</span>
                </div>
              )}
              {!isEditing ? (
                <div className="profile-details-view" style={{ display: 'flex', gap: '24px', alignItems: 'center', flexWrap: 'wrap' }}>
                  <div className="profile-avatar-large" style={{ 
                    width: '64px', height: '64px', borderRadius: '16px', 
                    background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)', 
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '24px', fontWeight: 'bold', color: 'white',
                    boxShadow: '0 8px 24px rgba(99, 102, 241, 0.3)'
                  }}>
                    {profile.fullName.substring(0, 2).toUpperCase()}
                  </div>
                  <div className="profile-info-grid" style={{ 
                    flex: '1', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
                    gap: '16px' 
                  }}>
                    <div className="info-item">
                      <span className="label" style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>Họ và tên</span>
                      <strong className="value" style={{ fontSize: '15px', color: 'var(--text-primary)' }}>{profile.fullName}</strong>
                    </div>
                    <div className="info-item">
                      <span className="label" style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>Số điện thoại</span>
                      <strong className="value" style={{ fontSize: '15px', color: 'var(--text-primary)' }}>{profile.phone}</strong>
                    </div>
                    <div className="info-item">
                      <span className="label" style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>Địa chỉ Email</span>
                      <strong className="value" style={{ fontSize: '15px', color: 'var(--text-primary)' }}>{profile.email}</strong>
                    </div>
                    <div className="info-item loyalty-badge-item">
                      <span className="label" style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>Điểm tích lũy</span>
                      <strong className="value loyalty-value" style={{ 
                        fontSize: '15px', color: '#f59e0b', display: 'flex', alignItems: 'center', gap: '6px' 
                      }}>
                        <Award size={16} />
                        {profile.loyaltyPoints} điểm
                      </strong>
                    </div>
                  </div>
                  <button 
                    className="btn-secondary edit-profile-btn" 
                    onClick={() => setIsEditing(true)}
                    style={{ padding: '8px 16px', fontSize: '14px' }}
                  >
                    Chỉnh sửa
                  </button>
                </div>
              ) : (
                <form onSubmit={handleUpdateProfile} className="profile-edit-form" style={{ width: '100%' }}>
                  {updateError && (
                    <div className="alert-error" style={{ marginBottom: '15px' }}>
                      <span>{updateError}</span>
                    </div>
                  )}
                  <div className="form-grid" style={{ 
                    display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
                    gap: '16px', marginBottom: '16px' 
                  }}>
                    <div className="input-group">
                      <label htmlFor="editFullName" style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '6px' }}>Họ và tên</label>
                      <input 
                        id="editFullName"
                        type="text" 
                        value={editFullName} 
                        onChange={(e) => setEditFullName(e.target.value)} 
                        required 
                        style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(15,23,42,0.6)', color: 'white' }}
                      />
                    </div>
                    <div className="input-group">
                      <label htmlFor="editPhone" style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '6px' }}>Số điện thoại</label>
                      <input 
                        id="editPhone"
                        type="text" 
                        value={editPhone} 
                        onChange={(e) => setEditPhone(e.target.value)} 
                        required 
                        style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(15,23,42,0.6)', color: 'white' }}
                      />
                    </div>
                    <div className="input-group">
                      <label htmlFor="editEmail" style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '6px' }}>Địa chỉ Email</label>
                      <input 
                        id="editEmail"
                        type="email" 
                        value={editEmail} 
                        onChange={(e) => setEditEmail(e.target.value)} 
                        required 
                        style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(15,23,42,0.6)', color: 'white' }}
                      />
                    </div>
                  </div>
                  <div className="form-actions" style={{ display: 'flex', gap: '10px' }}>
                    <button type="submit" className="btn-primary" style={{ padding: '8px 16px', fontSize: '14px' }}>Lưu thay đổi</button>
                    <button 
                      type="button" 
                      className="btn-secondary" 
                      onClick={() => {
                        setIsEditing(false);
                        setEditFullName(profile.fullName);
                        setEditPhone(profile.phone);
                        setEditEmail(profile.email);
                        setUpdateError('');
                      }}
                      style={{ padding: '8px 16px', fontSize: '14px' }}
                    >
                      Hủy
                    </button>
                  </div>
                </form>
              )}
            </div>
          ) : (
            <p className="settings-desc">Không tìm thấy thông tin hồ sơ khách hàng. Vui lòng liên hệ hỗ trợ.</p>
          )}
        </div>

        {/* Language Card */}
        <div className="settings-card glass-card">
          <div className="settings-card-header">
            <Globe className="settings-icon-header" size={22} />
            <h3>{t('language')}</h3>
          </div>
          <p className="settings-desc">{t('selectLanguage')}</p>
          
          <div className="language-selector-group">
            <button 
              className={`lang-option-btn ${lang === 'vi' ? 'active' : ''}`}
              onClick={() => changeLanguage('vi')}
            >
              🇻🇳 Tiếng Việt
            </button>
            <button 
              className={`lang-option-btn ${lang === 'en' ? 'active' : ''}`}
              onClick={() => changeLanguage('en')}
            >
              🇺🇸 English
            </button>
            <button 
              className={`lang-option-btn ${lang === 'ja' ? 'active' : ''}`}
              onClick={() => changeLanguage('ja')}
            >
              🇯🇵 日本語
            </button>
            <button 
              className={`lang-option-btn ${lang === 'ko' ? 'active' : ''}`}
              onClick={() => changeLanguage('ko')}
            >
              🇰🇷 한국어
            </button>
            <button 
              className={`lang-option-btn ${lang === 'zh' ? 'active' : ''}`}
              onClick={() => changeLanguage('zh')}
            >
              🇨🇳 中文
            </button>
          </div>
        </div>

        {/* Color Palette Card */}
        <div className="settings-card glass-card">
          <div className="settings-card-header">
            <Palette className="settings-icon-header" size={22} />
            <h3>{t('themeColor')}</h3>
          </div>
          <p className="settings-desc">Thay đổi màu sắc chủ đạo của toàn bộ hệ thống các nút và tiêu đề.</p>

          <div className="color-palette-group">
            {colorThemes.map((theme) => (
              <button
                key={theme.id}
                className={`color-theme-btn ${themeColor === theme.id ? 'active' : ''}`}
                onClick={() => setThemeColor(theme.id)}
                style={{ '--theme-dot-color': theme.color }}
              >
                <span className="color-dot" style={{ backgroundColor: theme.color }}>
                  {themeColor === theme.id && <Check size={12} className="check-icon" />}
                </span>
                {theme.name}
              </button>
            ))}
          </div>
        </div>

        {/* Brightness Card */}
        <div className="settings-card glass-card">
          <div className="settings-card-header">
            {themeMode === 'dark' ? <Moon className="settings-icon-header" size={22} /> : <Sun className="settings-icon-header" size={22} />}
            <h3>{t('themeBrightness')}</h3>
          </div>
          <p className="settings-desc">Điều chỉnh độ sáng tối của giao diện để bảo vệ mắt của bạn.</p>

          <div className="brightness-toggle-group">
            <button
              className={`brightness-option-btn ${themeMode === 'light' ? 'active' : ''}`}
              onClick={() => setThemeMode('light')}
            >
              <Sun size={18} />
              Chế độ Sáng (Light)
            </button>
            
            <button
              className={`brightness-option-btn ${themeMode === 'dark' ? 'active' : ''}`}
              onClick={() => setThemeMode('dark')}
            >
              <Moon size={18} />
              Chế độ Tối (Dark)
            </button>
          </div>
        </div>

        {/* Security & System Info */}
        <div className="settings-card glass-card">
          <div className="settings-card-header">
            <ShieldCheck className="settings-icon-header" size={22} />
            <h3>Thông tin Bảo mật</h3>
          </div>
          <p className="settings-desc">Hệ thống áp dụng chuẩn mã hóa ngân hàng đầu cuối.</p>
          
          <div className="security-info-box">
            <div className="info-row">
              <span>Phương thức mã hóa:</span>
              <strong>AES-256 JWT</strong>
            </div>
            <div className="info-row">
              <span>Đường truyền:</span>
              <strong>SSL/TLS 1.3 SECURE</strong>
            </div>
            <div className="info-row">
              <span>Phiên bản App:</span>
              <strong>v2.4.0-release</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
