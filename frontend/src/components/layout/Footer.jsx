export default function Footer({ setActiveTab }) {
  return (
    <footer className="scam-footer">
      <div className="container scam-footer-container">

        {/* Top Row: Logo, Member Cards, Socials */}
        <div className="footer-top-row">

          {/* Brand Logo Column */}
          <div className="footer-brand-col">
            <div className="footer-brand-logo" onClick={() => setActiveTab('checker')}>
              <div className="logo-line-chong">Shield</div>
              <div className="logo-line-luadao">
                Protect<span className="logo-at-symbol">@</span>for Me
              </div>
            </div>
          </div>

          {/* Member/Partners Cards Column */}
          <div className="footer-members-col">

            {/* Member Card 1 */}
            <div className="member-card-wrapper">
              <span className="member-label">Thành viên Hiệp hội an ninh mạng Quốc gia</span>
              <div className="white-badge-card">
                <svg viewBox="0 0 120 32" width="105" height="28" style={{ display: 'block' }}>
                  {/* NCA Circle Logo */}
                  <circle cx="14" cy="16" r="11" fill="#e8eff9" />
                  <path d="M10 18c0-1.8 1.2-3 2.5-3h1v-1c0-1.5 1-2.5 2.5-2.5h1" stroke="#0052cc" strokeWidth="1.5" fill="none" />
                  <rect x="9" y="14" width="10" height="7" rx="1" fill="#0052cc" />
                  <text x="28" y="20" fontFamily="Plus Jakarta Sans, sans-serif" fontWeight="800" fontSize="10" fill="#0052cc">NCA</text>

                  {/* NÂNG CAO badge */}
                  <rect x="70" y="2" width="34" height="8" rx="4" fill="#FFA000" />
                  <text x="73" y="8" fontFamily="Plus Jakarta Sans, sans-serif" fontWeight="800" fontSize="4.5" fill="#fff">NÂNG CAO</text>

                  {/* Tín Nhiệm Mạng text and shield */}
                  <g transform="translate(56, 14)">
                    <path d="M0 3.5L4.5 1.5l4.5 2V7c0 3-4.5 4.8-4.5 4.8S0 10 0 7V3.5z" fill="#FFA000" />
                    <text x="12" y="9" fontFamily="Plus Jakarta Sans, sans-serif" fontWeight="800" fontSize="7" fill="#0052cc">TÍN NHIỆM MẠNG</text>
                  </g>
                </svg>
              </div>
            </div>

            {/* Member Card 2 */}
            <div className="member-card-wrapper">
              <span className="member-label">Thành viên Liên minh An Ninh Mạng ViSecurity</span>
              <div className="white-badge-card">
                <svg viewBox="0 0 120 32" width="105" height="28" style={{ display: 'block' }}>
                  <g transform="translate(4, 4)">
                    <circle cx="12" cy="12" r="11" fill="#fff" stroke="#ff3e6c" strokeWidth="1.5" />
                    <path d="M7 9.5L12 7.5l5 2V14c0 3-5 5-5 5s-5-2-5-5V9.5z" fill="#ff3e6c" />
                    <polygon points="12,10 12.8,12 14.8,12.3 13.3,13.8 13.7,15.8 12,14.8 10.3,15.8 10.7,13.8 9.2,12.3 11.2,12" fill="#fff" />
                  </g>
                  <text x="32" y="16" fontFamily="Space Grotesk, sans-serif" fontWeight="700" fontSize="11" fill="#0c2b2d">ViSecurity</text>
                  <text x="32" y="24" fontFamily="Plus Jakarta Sans, sans-serif" fontWeight="600" fontSize="4.8" fill="#555">VIETNAM SECURITY NETWORK</text>
                </svg>
              </div>
            </div>

            {/* Member Card 3 */}
            <div className="member-card-wrapper">
              <span className="member-label">Được bảo vệ bởi Cloudflare Project Galileo</span>
              <div className="white-badge-card">
                <svg viewBox="0 0 120 32" width="105" height="28" style={{ display: 'block' }}>
                  <g transform="translate(4, 4)">
                    <path d="M0 4.5L10 0l10 4.5V11c0 6.2-10 10-10 10S0 17.2 0 11V4.5z" fill="#1b365d" />
                    <polygon points="10,5 11.2,7.5 13.8,7.9 11.9,9.8 12.4,12.4 10,11.2 7.6,12.4 8.1,9.8 6.2,7.9 8.8,7.5" fill="#e88024" />
                  </g>
                  <text x="28" y="14" fontFamily="Space Grotesk, sans-serif" fontWeight="700" fontSize="10" fill="#0c2b2d">Project Galileo</text>
                  <text x="28" y="24" fontFamily="Plus Jakarta Sans, sans-serif" fontWeight="700" fontSize="5.5" fill="#555">Powered by Cloudflare</text>
                </svg>
              </div>
            </div>

          </div>

          {/* Social Icons Column */}
          <div className="footer-socials-col">
            <div className="socials-row">
              <a href="https://facebook.com" target="_blank" rel="noreferrer" className="social-icon-circle fb">
                <svg viewBox="0 0 24 24" fill="currentColor"><path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c4.56-.93 8-4.96 8-9.75z" /></svg>
              </a>
              <a href="mailto:info@shield.vn" className="social-icon-circle mail">
                <svg viewBox="0 0 24 24" fill="currentColor"><path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" /></svg>
              </a>
              <a href="#partner" className="social-icon-circle partner">
                <svg viewBox="0 0 24 24" fill="currentColor"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 2 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" /></svg>
              </a>
              <a href="https://discord.com" target="_blank" rel="noreferrer" className="social-icon-circle discord">
                <svg viewBox="0 0 24 24" fill="currentColor"><path d="M20.317 4.37a19.791 19.791 0 00-4.885-1.515.074.074 0 00-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.617-1.25.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.37a.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 00.031.057 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028 14.09 14.09 0 001.226-1.994.076.076 0 00-.041-.106 13.107 13.107 0 01-1.873-.894.077.077 0 01-.008-.128c.126-.093.252-.19.372-.287a.075.075 0 01.077-.011c3.92 1.793 8.18 1.793 12.061 0a.073.073 0 01.078.009c.12.099.246.195.373.289a.077.077 0 01-.006.127 12.299 12.299 0 01-1.873.894.077.077 0 00-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 00.084.028 19.839 19.839 0 006.002-3.03.077.077 0 00.032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.156-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.156 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.156-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.156 2.418z" /></svg>
              </a>
              <a href="https://t.me/shield" target="_blank" rel="noreferrer" className="social-icon-circle telegram">
                <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.2-.02-.08.02-1.35.86-3.82 2.53-.36.25-.69.37-.98.36-.32-.01-.94-.18-1.4-.33-.56-.18-1-.28-.96-.6.02-.16.24-.33.67-.5 2.62-1.14 4.36-1.89 5.23-2.25 2.49-.99 3.01-1.16 3.35-1.16.07 0 .24.02.35.1.09.07.12.16.13.25 0 .07.01.15 0 .22z" /></svg>
              </a>
              <a href="https://tiktok.com" target="_blank" rel="noreferrer" className="social-icon-circle tiktok">
                <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.02 1.59 4.23.97 1.2 2.37 2.01 3.92 2.3v3.78c-1.57-.03-3.11-.53-4.43-1.44-.72-.51-1.32-1.17-1.78-1.94V14c-.04 2.14-.92 4.19-2.47 5.66-1.55 1.47-3.66 2.23-5.81 2.1-2.31-.14-4.47-1.33-5.74-3.29-1.27-1.95-1.57-4.44-.81-6.64.76-2.21 2.62-3.88 4.9-4.38.74-.16 1.51-.2 2.26-.1v3.7c-.5-.06-1.02-.02-1.5.13-.91.28-1.64.99-1.93 1.9-.3.92-.12 1.95.48 2.69.6.73 1.52 1.13 2.47 1.05.95-.08 1.78-.71 2.11-1.6.21-.59.27-1.22.25-1.85V.02z" /></svg>
              </a>
            </div>
          </div>

        </div>

        {/* Bottom Row: Contact info, Google Recaptcha & Author Credits */}
        <div className="footer-bottom-row">

          {/* Left Info Column */}
          <div className="bottom-left-info">
            <p>Bản quyền © shield 2026 | <button className="footer-policy-link" onClick={() => setActiveTab('privacy')}>Chính sách bảo mật</button></p>
            <p>Liên hệ: <a href="mailto:info@shield.vn" className="footer-email-link">info@shield.vn</a></p>
            <p>Công ty TNHH Doanh Nghiệp Xã Hội S.H.I.E.L.D - Mã số thuế 0317043919</p>
          </div>

          {/* Right Credits Column */}
          <div className="bottom-right-credits">
            <p className="recaptcha-text">
              Trang web này được bảo vệ bởi reCAPTCHA và <a href="https://policies.google.com/privacy" target="_blank" rel="noreferrer">Chính sách Bảo mật</a> và <a href="https://policies.google.com/terms" target="_blank" rel="noreferrer">Điều khoản Dịch vụ</a> của Google được áp dụng.
            </p>
            <p className="author-credits">
              Thiết kế bởi: <a href="#design" className="credit-link">Collective Design Agency</a>
            </p>
            <p className="author-credits">
              Viết mã bởi: <a href="#code" className="credit-link green">CLD Team</a>
            </p>
          </div>

        </div>

      </div>
    </footer>
  );
}
