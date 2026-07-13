export default function BackgroundGlows() {
  return (
    <div className="global-background-glows">
      <div className="cyber-grid-overlay"></div>
      <div className="radial-glow-cyan"></div>
      <div className="radial-glow-pink"></div>
      <div className="radial-glow-blue-mid"></div>
      <div className="radial-glow-green-mid"></div>
      <div className="radial-glow-purple-mid"></div>
      <div className="radial-glow-pink-mid"></div>
      
      {/* Extra lower page glows for long scroll heights */}
      <div className="radial-glow-cyan-low"></div>
      <div className="radial-glow-green-low"></div>
      <div className="radial-glow-blue-low"></div>

      {/* Floating cyber mesh particles */}
      <div className="floating-glow-node glow-node-1"></div>
      <div className="floating-glow-node glow-node-2"></div>
      <div className="floating-glow-node glow-node-3"></div>
      <div className="floating-glow-node glow-node-4"></div>
    </div>
  );
}
