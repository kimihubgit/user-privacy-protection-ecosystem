import { Component } from 'react';
import { ShieldAlert, RefreshCw } from 'lucide-react';

/**
 * Error Boundary component that catches JavaScript errors in child components
 * and displays a fallback UI instead of crashing the entire app.
 */
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[ErrorBoundary] Caught error:', error, errorInfo);
  }

  handleReload = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '60vh',
          padding: '2rem',
          textAlign: 'center',
          gap: '1.25rem'
        }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            background: 'rgba(239, 68, 68, 0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <ShieldAlert size={28} color="#ef4444" />
          </div>

          <h2 style={{
            fontSize: '1.25rem',
            fontWeight: 800,
            color: 'var(--text-primary)',
            fontFamily: 'var(--font-display)',
            margin: 0
          }}>
            Đã xảy ra lỗi không mong muốn
          </h2>

          <p style={{
            fontSize: '0.88rem',
            color: 'var(--text-muted)',
            maxWidth: '400px',
            lineHeight: 1.5,
            margin: 0
          }}>
            Trang web gặp sự cố khi xử lý yêu cầu. Vui lòng tải lại trang để thử lại.
          </p>

          {import.meta.env.DEV && this.state.error && (
            <pre style={{
              fontSize: '0.75rem',
              color: '#ef4444',
              background: 'rgba(239, 68, 68, 0.05)',
              border: '1px solid rgba(239, 68, 68, 0.12)',
              borderRadius: '8px',
              padding: '0.75rem 1rem',
              maxWidth: '500px',
              overflow: 'auto',
              textAlign: 'left',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word'
            }}>
              {this.state.error.toString()}
            </pre>
          )}

          <button
            onClick={this.handleReload}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.6rem 1.5rem',
              fontSize: '0.85rem',
              fontWeight: 600,
              borderRadius: '8px',
              border: '1px solid var(--primary)',
              background: 'var(--primary)',
              color: '#fff',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            <RefreshCw size={14} />
            Tải lại trang
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
