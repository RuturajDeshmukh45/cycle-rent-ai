const Footer = () => (
  <footer className="border-t py-3 px-5 text-center" style={{ borderColor: 'var(--border)', background: 'var(--bg-secondary)' }}>
    <p className="text-xs" style={{ color: 'var(--text-muted)', fontFamily: 'Space Grotesk' }}>
      🌿 EcoCycle · Sustainable Urban Mobility · {new Date().getFullYear()}
    </p>
  </footer>
);

export default Footer;
