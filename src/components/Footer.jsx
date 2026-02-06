const styles = {
  footer: {
    background: 'var(--gray-800)',
    color: 'var(--gray-400)',
    padding: '24px',
    textAlign: 'center',
    fontSize: '13px',
    marginTop: 'auto',
  },
  triStripe: {
    display: 'flex',
    height: '3px',
  },
  saffronStripe: { flex: 1, background: '#FF9933' },
  whiteStripe: { flex: 1, background: '#FFFFFF' },
  greenStripe: { flex: 1, background: '#138808' },
  tagline: {
    color: 'var(--gray-300)',
    fontWeight: '500',
    marginBottom: '4px',
  },
};

export default function Footer() {
  return (
    <footer>
      <div style={styles.triStripe}>
        <div style={styles.saffronStripe} />
        <div style={styles.whiteStripe} />
        <div style={styles.greenStripe} />
      </div>
      <div style={styles.footer}>
        <div style={styles.tagline}>JanAwaaz — People&apos;s Voice</div>
        <div>Empowering citizens to set the agenda for their constituency</div>
      </div>
    </footer>
  );
}
