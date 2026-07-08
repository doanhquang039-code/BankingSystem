import { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Bot, User } from 'lucide-react';

const AiChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { id: 1, text: 'Xin chào! Mình là Trợ lý ảo VietBank AI. Mình có thể giúp gì cho bạn hôm nay?', sender: 'bot' }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userText = input.trim();
    setMessages(prev => [...prev, { id: Date.now(), text: userText, sender: 'user' }]);
    setInput('');
    setIsTyping(true);

    // Simulate AI thinking and replying
    setTimeout(() => {
      let replyText = 'Cảm ơn câu hỏi của bạn. Mình là trợ lý ảo VietBank AI. Bạn có thể hỏi mình về: Lãi suất tiết kiệm, Đăng ký vay, hoặc Quản lý dịch vụ thẻ nhé!';
      const cleanText = userText.toLowerCase();

      if (cleanText.includes('chào') || cleanText.includes('hello') || cleanText.includes('hi')) {
        replyText = 'Xin chào! Rất vui được hỗ trợ bạn. Hôm nay bạn muốn tìm hiểu dịch vụ gì của VietBank? (Lãi suất, Khoản vay hay Dịch vụ Thẻ?)';
      } else if (cleanText.includes('lãi suất') || cleanText.includes('tiết kiệm') || cleanText.includes('gửi tiền')) {
        replyText = 'VietBank cung cấp lãi suất tiết kiệm trực tuyến cực kỳ cạnh tranh: 1 tháng: 3.5%/năm, 3 tháng: 4.5%/năm, 6 tháng: 5.5%/năm, và kỳ hạn 12 tháng lên tới 7.2%/năm. Bạn hãy vào trang "Tiết Kiệm" để mở sổ ngay nhé!';
      } else if (cleanText.includes('vay') || cleanText.includes('mượn') || cleanText.includes('tín dụng')) {
        replyText = 'Bạn có thể đăng ký vay tiêu dùng trực tuyến tại mục "Khoản Vay" với số tiền từ 5 triệu đến 500 triệu VND. Lãi suất từ 8.5% - 9.5%/năm, giải ngân tự động sau khi được phê duyệt.';
      } else if (cleanText.includes('thẻ') || cleanText.includes('card') || cleanText.includes('pin') || cleanText.includes('khóa')) {
        replyText = 'Để quản lý thẻ, bạn vui lòng truy cập trang "Thẻ Của Tôi". Tại đây bạn có thể mở thẻ Debit/Credit ảo mới, khóa thẻ khẩn cấp hoặc đổi mã PIN trực tuyến bảo mật.';
      }

      setMessages(prev => [...prev, { id: Date.now(), text: replyText, sender: 'bot' }]);
      setIsTyping(false);
    }, 1000);
  };

  return (
    <div style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: 9999 }}>
      {/* Chat Bubble Toggle Button */}
      {!isOpen && (
        <button 
          onClick={() => setIsOpen(true)}
          style={{ 
            width: '60px', height: '60px', borderRadius: '30px', 
            background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
            border: 'none', color: 'white', display: 'flex', alignItems: 'center', 
            justifyContent: 'center', cursor: 'pointer', boxShadow: '0 8px 24px rgba(99, 102, 241, 0.4)',
            transition: 'transform 0.2s ease'
          }}
          className="hover-scale"
        >
          <MessageSquare size={26} />
        </button>
      )}

      {/* Chat Window Panel */}
      {isOpen && (
        <div 
          className="glass-card" 
          style={{ 
            width: '350px', height: '450px', display: 'flex', flexDirection: 'column', 
            borderRadius: '20px', overflow: 'hidden', boxShadow: '0 12px 40px rgba(0,0,0,0.6)',
            border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(15,23,42,0.95)'
          }}
        >
          {/* Header */}
          <div style={{ 
            padding: '16px', background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)', 
            display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'white' 
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Bot size={22} />
              <div>
                <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 'bold' }}>Trợ Lý VietBank AI</h4>
                <span style={{ fontSize: '10px', opacity: 0.8 }}>Hỗ trợ trực tuyến 24/7</span>
              </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', display: 'flex', padding: '4px' }}
            >
              <X size={18} />
            </button>
          </div>

          {/* Messages Area */}
          <div style={{ flex: 1, padding: '16px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {messages.map(msg => (
              <div 
                key={msg.id} 
                style={{ 
                  display: 'flex', 
                  gap: '8px', 
                  flexDirection: msg.sender === 'user' ? 'row-reverse' : 'row',
                  alignItems: 'flex-start'
                }}
              >
                <div style={{ 
                  width: '28px', height: '28px', borderRadius: '14px', 
                  background: msg.sender === 'user' ? 'rgba(255,255,255,0.1)' : 'rgba(99,102,241,0.2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', color: msg.sender === 'user' ? 'white' : '#6366f1',
                  flexShrink: 0
                }}>
                  {msg.sender === 'user' ? <User size={14} /> : <Bot size={14} />}
                </div>
                
                <div style={{ 
                  background: msg.sender === 'user' ? '#6366f1' : 'rgba(255,255,255,0.06)',
                  color: 'white',
                  padding: '10px 14px',
                  borderRadius: msg.sender === 'user' ? '14px 14px 2px 14px' : '2px 14px 14px 14px',
                  maxWidth: '75%',
                  fontSize: '13px',
                  lineHeight: '1.4',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                }}>
                  {msg.text}
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <div style={{ width: '28px', height: '28px', borderRadius: '14px', background: 'rgba(99,102,241,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6366f1' }}>
                  <Bot size={14} />
                </div>
                <div style={{ background: 'rgba(255,255,255,0.06)', padding: '10px 14px', borderRadius: '2px 14px 14px 14px', color: 'rgba(255,255,255,0.5)', fontSize: '12px' }}>
                  Đang soạn câu trả lời...
                </div>
              </div>
            )}
            <div ref={scrollToBottom} />
          </div>

          {/* Footer Input Form */}
          <form onSubmit={handleSend} style={{ padding: '12px', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', gap: '8px', background: 'rgba(0,0,0,0.2)' }}>
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Hỏi trợ lý ảo về lãi suất, vay vốn..."
              style={{ 
                flex: 1, padding: '8px 12px', borderRadius: '8px', 
                border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(15,23,42,0.6)', 
                color: 'white', fontSize: '13px' 
              }}
            />
            <button 
              type="submit" 
              style={{ 
                width: '36px', height: '36px', borderRadius: '8px', 
                background: '#6366f1', border: 'none', color: 'white', 
                display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' 
              }}
            >
              <Send size={16} />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default AiChatbot;
