import { ArrowUp, Sun, Moon } from 'lucide-react';

export default function FloatingActions({
  showScrollTop,
  scrollToTop,
  isDarkMode,
  toggleTheme
}) {
  return (
    <>
      {/* Scroll to Top Button */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="scroll-to-top"
          style={{
            right: '2rem'
          }}
          aria-label="Scroll to top"
        >
          <ArrowUp size={20} />
        </button>
      )}

      {/* Dark Mode Toggle Button */}
      <button
        onClick={toggleTheme}
        className="theme-toggle"
        style={{
          right: showScrollTop ? '9rem' : '5.5rem'
        }}
        aria-label="Toggle Theme"
      >
        {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
      </button>
    </>
  );
}
