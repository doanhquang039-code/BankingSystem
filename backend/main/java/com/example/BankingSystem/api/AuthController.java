package com.example.BankingSystem.api;

import com.example.BankingSystem.dto.LoginRequest;
import com.example.BankingSystem.dto.LoginResponse;
import com.example.BankingSystem.dto.RegisterRequest;
import com.example.BankingSystem.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;
    private final com.example.BankingSystem.service.CaptchaService captchaService;
    private final org.springframework.cache.CacheManager cacheManager;

    public AuthController(AuthService authService,
                          com.example.BankingSystem.service.CaptchaService captchaService,
                          org.springframework.cache.CacheManager cacheManager) {
        this.authService = authService;
        this.captchaService = captchaService;
        this.cacheManager = cacheManager;
    }

    /**
     * GET /api/auth/captcha
     * Trả về mã xác thực ảnh Base64 và ID xác thực
     */
    @GetMapping("/captcha")
    public com.example.BankingSystem.dto.CaptchaResponse getCaptcha() {
        String captchaId = java.util.UUID.randomUUID().toString();
        String text = captchaService.generateText();
        String imageBase64 = captchaService.generateImageBase64(text);

        org.springframework.cache.Cache cache = cacheManager.getCache("captcha");
        if (cache != null) {
            cache.put(captchaId, text);
        }

        return new com.example.BankingSystem.dto.CaptchaResponse(captchaId, imageBase64);
    }

    /**
     * POST /api/auth/login
     * Body: { "username": "admin", "password": "admin123", "captchaId": "...", "captchaCode": "..." }
     */
    @PostMapping("/login")
    public LoginResponse login(@Valid @RequestBody LoginRequest request) {
        return authService.login(request);
    }

    /**
     * POST /api/auth/register
     * Body: { "username": "newuser", "password": "pass123", "email": "user@email.com" }
     */
    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    public LoginResponse register(@Valid @RequestBody RegisterRequest request) {
        return authService.register(request);
    }

    /**
     * GET /api/auth/oauth2/success?token=xxx&username=yyy&email=zzz&role=CUSTOMER
     * Redirect target sau khi Google OAuth2 login thành công.
     * Trả về trang HTML để user copy JWT token.
     */
    @GetMapping(value = "/oauth2/success", produces = MediaType.TEXT_HTML_VALUE)
    public String oauth2Success(
            @RequestParam String token,
            @RequestParam String username,
            @RequestParam String email,
            @RequestParam String role) {
        return """
                <!DOCTYPE html>
                <html lang="vi">
                <head>
                  <meta charset="UTF-8">
                  <title>Đăng nhập Google thành công</title>
                  <style>
                    * { box-sizing: border-box; margin: 0; padding: 0; }
                    body { font-family: 'Segoe UI', sans-serif; background: #0f172a; color: #e2e8f0;
                           display: flex; justify-content: center; align-items: center; min-height: 100vh; }
                    .card { background: #1e293b; border-radius: 16px; padding: 2rem; max-width: 640px;
                            width: 100%%; box-shadow: 0 20px 60px rgba(0,0,0,0.5); }
                    .badge-success { display: inline-flex; align-items: center; gap: 8px;
                                     background: #064e3b; color: #34d399; padding: 6px 14px;
                                     border-radius: 999px; font-size: 14px; margin-bottom: 1.5rem; }
                    h1 { font-size: 1.5rem; font-weight: 700; margin-bottom: 0.5rem; }
                    .info { background: #0f172a; border-radius: 8px; padding: 1rem; margin: 1rem 0; }
                    .info-row { display: flex; justify-content: space-between; padding: 4px 0; }
                    .info-row span:first-child { color: #94a3b8; font-size: 13px; }
                    .info-row span:last-child { font-weight: 600; }
                    .token-box { background: #0f172a; border: 1px solid #334155; border-radius: 8px;
                                 padding: 1rem; word-break: break-all; font-family: monospace;
                                 font-size: 12px; color: #7dd3fc; margin: 1rem 0; max-height: 120px;
                                 overflow-y: auto; }
                    .copy-btn { width: 100%%; padding: 12px; background: #3b82f6; color: white;
                                border: none; border-radius: 8px; font-size: 15px; font-weight: 600;
                                cursor: pointer; transition: background 0.2s; margin-top: 0.5rem; }
                    .copy-btn:hover { background: #2563eb; }
                    .copy-btn.copied { background: #059669; }
                    .usage { margin-top: 1.5rem; padding-top: 1rem; border-top: 1px solid #334155; }
                    .usage h3 { font-size: 13px; color: #94a3b8; margin-bottom: 8px; }
                    .usage code { background: #0f172a; color: #f472b6; padding: 2px 6px;
                                  border-radius: 4px; font-family: monospace; font-size: 12px; }
                  </style>
                </head>
                <body>
                  <div class="card">
                    <div class="badge-success">✅ Google Login thành công</div>
                    <h1>Xin chào, %s!</h1>
                    <p style="color:#94a3b8; margin-bottom:1rem">Tài khoản của bạn đã được xác thực qua Google.</p>
                    <div class="info">
                      <div class="info-row"><span>Email</span><span>%s</span></div>
                      <div class="info-row"><span>Vai trò</span><span>%s</span></div>
                      <div class="info-row"><span>Hiệu lực</span><span>24 giờ</span></div>
                    </div>
                    <p style="color:#94a3b8; font-size:13px; margin-bottom:8px">JWT Token (copy để dùng cho API):</p>
                    <div class="token-box" id="tokenBox">%s</div>
                    <button class="copy-btn" id="copyBtn" onclick="copyToken()">📋 Copy Token</button>
                    <div class="usage">
                      <h3>CÁCH DÙNG — thêm vào header của mọi API request:</h3>
                      <code>Authorization: Bearer &lt;token&gt;</code>
                    </div>
                  </div>
                  <script>
                    function copyToken() {
                      const token = document.getElementById('tokenBox').innerText;
                      navigator.clipboard.writeText(token).then(() => {
                        const btn = document.getElementById('copyBtn');
                        btn.textContent = '✅ Đã copy!';
                        btn.className = 'copy-btn copied';
                        setTimeout(() => {
                          btn.textContent = '📋 Copy Token';
                          btn.className = 'copy-btn';
                        }, 2000);
                      });
                    }
                  </script>
                </body>
                </html>
                """.formatted(username, email, role, token);
    }
}

