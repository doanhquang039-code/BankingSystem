import { useState, useEffect } from 'react';
import api from '../services/api';
import { useLanguage } from '../context/LanguageContext';
import { 
  BookOpen, 
  Award, 
  Ticket, 
  CheckCircle2, 
  HelpCircle, 
  Coins, 
  ArrowRight,
  TrendingUp,
  Sparkles
} from 'lucide-react';

const Learning = () => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState('lessons'); // 'lessons' or 'shop'
  
  // Data States
  const [lessons, setLessons] = useState([]);
  const [shopVouchers, setShopVouchers] = useState([]);
  const [myVouchers, setMyVouchers] = useState([]);
  const [points, setPoints] = useState(0);
  const [loading, setLoading] = useState(true);

  // Lesson Detail Quiz States
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [selectedAnswer, setSelectedAnswer] = useState('');
  const [quizMessage, setQuizMessage] = useState(null);
  const [quizSuccess, setQuizSuccess] = useState(false);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      await fetchPoints();
      await fetchLessons();
      await fetchVouchers();
      setLoading(false);
    } catch (err) {
      console.error('Failed to load gamification data', err);
      setLoading(false);
    }
  };

  const fetchPoints = async () => {
    try {
      const res = await api.get('/gamification/points');
      setPoints(res.data.points || 0);
    } catch (err) {
      console.error('Error fetching points', err);
    }
  };

  const fetchLessons = async () => {
    try {
      const res = await api.get('/gamification/lessons');
      setLessons(res.data || []);
    } catch (err) {
      console.error('Error fetching lessons', err);
    }
  };

  const fetchVouchers = async () => {
    try {
      const shopRes = await api.get('/gamification/vouchers/shop');
      setShopVouchers(shopRes.data || []);
      const myRes = await api.get('/gamification/vouchers/my');
      setMyVouchers(myRes.data || []);
    } catch (err) {
      console.error('Error fetching vouchers', err);
    }
  };

  const handleSelectLesson = (lesson) => {
    setSelectedLesson(lesson);
    setSelectedAnswer('');
    setQuizMessage(null);
  };

  const handleSubmitAnswer = async (e) => {
    e.preventDefault();
    if (!selectedAnswer) return;

    try {
      const res = await api.post(`/gamification/lessons/${selectedLesson.id}/submit`, null, {
        params: { answer: selectedAnswer }
      });

      if (res.data.correct) {
        setQuizSuccess(true);
        setQuizMessage(res.data.message);
        // Refresh points and lessons
        fetchPoints();
        fetchLessons();
        // Update local selected lesson status to avoid double submits
        setSelectedLesson(prev => ({ ...prev, completed: true }));
      } else {
        setQuizSuccess(false);
        setQuizMessage(res.data.message);
      }
    } catch (err) {
      console.error('Error submitting quiz answer', err);
      setQuizSuccess(false);
      setQuizMessage('Gửi câu trả lời thất bại, vui lòng thử lại.');
    }
  };

  const handleRedeemVoucher = async (voucherId) => {
    try {
      const res = await api.post(`/gamification/vouchers/${voucherId}/redeem`);
      alert(`Đổi thành công: ${res.data.title}`);
      fetchPoints();
      fetchVouchers();
    } catch (err) {
      alert(err.response?.data?.message || 'Quy đổi thất bại. Hãy chắc chắn bạn có đủ điểm!');
    }
  };

  return (
    <div className="learning-view-container">
      {/* Gamification Dashboard Header */}
      <div className="welcome-banner learning-header-banner">
        <div className="banner-left">
          <h1>Học Tập Nhận Voucher Đổi Thưởng</h1>
          <p>Tích lũy kiến thức ngoại ngữ bổ ích và quy đổi điểm thưởng trực tiếp thành mã giảm giá thanh toán hóa đơn.</p>
        </div>
        <div className="total-asset-card point-tracker-card glass-card">
          <div className="label">
            <Sparkles size={14} className="animate-pulse" />
            ĐIỂM TÍCH LŨY CỦA BẠN
          </div>
          <div className="amount point-amount">
            <Coins className="coin-icon" size={26} />
            {points} <span className="pts-label">PTS</span>
          </div>
        </div>
      </div>

      {/* Nav Tabs */}
      <div className="learning-tabs">
        <button 
          className={`tab-btn ${activeTab === 'lessons' ? 'active' : ''}`}
          onClick={() => setActiveTab('lessons')}
        >
          <BookOpen size={18} />
          Học Ngoại Ngữ Tích Điểm
        </button>
        <button 
          className={`tab-btn ${activeTab === 'shop' ? 'active' : ''}`}
          onClick={() => setActiveTab('shop')}
        >
          <Ticket size={18} />
          Cửa Hàng Đổi Voucher
        </button>
      </div>

      {loading ? (
        <div className="loading-spinner">Đang tải dữ liệu học tập...</div>
      ) : activeTab === 'lessons' ? (
        /* ================= TAB 1: LESSONS ================= */
        <div className="lessons-layout">
          <div className="lessons-grid-list">
            <div className="section-header">
              <h3>Danh sách bài học hôm nay</h3>
            </div>
            
            <div className="lessons-cards-stack">
              {lessons.map((lesson) => (
                <div 
                  key={lesson.id} 
                  className={`lesson-list-item glass-card ${selectedLesson?.id === lesson.id ? 'selected' : ''} ${lesson.completed ? 'completed-item' : ''}`}
                  onClick={() => handleSelectLesson(lesson)}
                >
                  <div className="lesson-badge-info">
                    {lesson.completed ? (
                      <span className="badge-type deposit">Hoàn thành</span>
                    ) : (
                      <span className="badge-type transfer">+{lesson.pointsReward} PTS</span>
                    )}
                  </div>
                  <h4>{lesson.title}</h4>
                  <p className="lesson-teaser">Tìm hiểu về các thuật ngữ và đàm thoại ngoại ngữ.</p>
                  <div className="lesson-footer">
                    <span>Xem bài học</span>
                    <ArrowRight size={14} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Lesson Details & Quiz Console */}
          <div className="lesson-detail-panel glass-card">
            {selectedLesson ? (
              <div className="lesson-detail-content">
                <div className="detail-header">
                  <h2>{selectedLesson.title}</h2>
                  <span className="points-label-badge">
                    <Award size={14} />
                    {selectedLesson.pointsReward} Điểm thưởng
                  </span>
                </div>

                {/* Lesson Learning Material */}
                <div className="lesson-material-box">
                  <h4>📖 Nội Dung Bài Học:</h4>
                  <div className="material-content">
                    {selectedLesson.content}
                  </div>
                </div>

                {/* Quiz Box */}
                <div className="quiz-box">
                  <h4>💡 Trắc nghiệm kiểm tra:</h4>
                  <p className="quiz-question">{selectedLesson.question}</p>

                  {selectedLesson.completed ? (
                    <div className="quiz-completed-success">
                      <CheckCircle2 size={36} className="text-success" />
                      <div>
                        <h5>Bài học đã hoàn thành!</h5>
                        <p>Bạn đã trả lời đúng câu hỏi này và nhận điểm thưởng trước đó.</p>
                      </div>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmitAnswer} className="quiz-form">
                      <div className="quiz-options-list">
                        {selectedLesson.options.map((opt, i) => (
                          <label 
                            key={i} 
                            className={`quiz-option-item ${selectedAnswer === opt ? 'checked' : ''}`}
                          >
                            <input 
                              type="radio" 
                              name="quiz-answer" 
                              value={opt} 
                              checked={selectedAnswer === opt}
                              onChange={(e) => setSelectedAnswer(e.target.value)}
                            />
                            <span>{opt}</span>
                          </label>
                        ))}
                      </div>

                      {quizMessage && (
                        <div className={`quiz-feedback-box ${quizSuccess ? 'success' : 'fail'}`}>
                          {quizMessage}
                        </div>
                      )}

                      <button 
                        type="submit" 
                        className="btn-primary quiz-submit-btn"
                        disabled={!selectedAnswer}
                      >
                        Gửi câu trả lời
                      </button>
                    </form>
                  )}
                </div>
              </div>
            ) : (
              <div className="no-lesson-selected">
                <HelpCircle size={48} className="text-muted" />
                <h3>Chọn một bài học</h3>
                <p>Hãy chọn một bài học ngoại ngữ ở danh sách bên trái để bắt đầu học tập và tích lũy điểm thưởng đổi voucher.</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* ================= TAB 2: VOUCHER SHOP ================= */
        <div className="shop-layout">
          <div className="shop-vouchers-section">
            <div className="section-header">
              <h3>Voucher đổi thưởng hấp dẫn</h3>
            </div>
            
            {shopVouchers.length === 0 ? (
              <div className="empty-state-large">
                <Ticket size={48} />
                <h2>Hết Voucher trong kho</h2>
                <p>Hiện các voucher đổi quà tạm thời hết hàng, hãy quay lại sau nhé!</p>
              </div>
            ) : (
              <div className="vouchers-shop-grid">
                {shopVouchers.map((voucher) => (
                  <div key={voucher.id} className="voucher-coupon-card glass-card">
                    <div className="coupon-left">
                      <div className="coupon-tag">HOT</div>
                      <Ticket size={24} className="coupon-icon" />
                    </div>
                    <div className="coupon-right">
                      <h4>{voucher.title}</h4>
                      <p className="coupon-code">Code: {voucher.code}</p>
                      <div className="coupon-redeem-row">
                        <span className="coupon-cost">{voucher.pointCost} PTS</span>
                        <button 
                          className="btn-primary redeem-coupon-btn"
                          disabled={points < voucher.pointCost}
                          onClick={() => handleRedeemVoucher(voucher.id)}
                        >
                          Đổi quà
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Owned Vouchers */}
          <div className="my-vouchers-section">
            <div className="section-header">
              <h3>Voucher của tôi đã sở hữu</h3>
            </div>
            
            {myVouchers.length === 0 ? (
              <div className="empty-state-large my-vouchers-empty">
                <Ticket size={36} className="text-muted" />
                <p>Bạn chưa đổi voucher nào. Hãy làm các bài học kiểm tra để tích lũy điểm và đổi quà nhé!</p>
              </div>
            ) : (
              <div className="my-vouchers-list">
                {myVouchers.map((v) => (
                  <div key={v.id} className="my-voucher-row glass-card">
                    <CheckCircle2 className="text-success" size={18} />
                    <div className="my-v-info">
                      <h4>{v.title}</h4>
                      <span className="voucher-code-badge">{v.code}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Learning;
