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
  ShieldCheck
} from 'lucide-react';

const Settings = () => {
  const { lang, changeLanguage, t } = useLanguage();
  const { themeColor, setThemeColor, themeMode, setThemeMode } = useTheme();

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
