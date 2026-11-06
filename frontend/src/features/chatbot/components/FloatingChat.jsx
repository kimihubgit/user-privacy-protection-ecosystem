import { useNavigate } from 'react-router-dom';
import './FloatingChat.css';

export default function FloatingChat({ showScrollTop }) {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate('/tro-ly-ai')}
      className="ai-chat-toggle"
      style={{
        right: showScrollTop ? '5.5rem' : '2rem'
      }}
      aria-label="Trợ lý AI Bảo mật"
      title="Mở Trợ lý AI Bảo mật"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="26"
        height="26"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="lucide lucide-message-circle"
      >
        <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
      </svg>
    </button>
  );
}
