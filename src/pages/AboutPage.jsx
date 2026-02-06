import { Vote, Users, Megaphone, Target, Shield, BarChart3 } from 'lucide-react';

const styles = {
  container: {
    maxWidth: 'var(--container-max)',
    margin: '0 auto',
    padding: '40px 24px',
  },
  hero: {
    textAlign: 'center',
    marginBottom: '48px',
  },
  title: {
    fontSize: '32px',
    fontWeight: '800',
    color: 'var(--gray-900)',
    marginBottom: '12px',
  },
  subtitle: {
    fontSize: '17px',
    color: 'var(--gray-500)',
    maxWidth: '600px',
    margin: '0 auto',
    lineHeight: '1.6',
  },
  section: {
    marginBottom: '48px',
  },
  sectionTitle: {
    fontSize: '22px',
    fontWeight: '700',
    color: 'var(--gray-900)',
    marginBottom: '20px',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  sectionIcon: {
    width: '36px',
    height: '36px',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#FFFFFF',
    flexShrink: 0,
  },
  card: {
    background: '#FFFFFF',
    borderRadius: 'var(--radius-md)',
    padding: '24px',
    border: '1px solid var(--gray-200)',
    marginBottom: '12px',
  },
  cardTitle: {
    fontSize: '16px',
    fontWeight: '600',
    color: 'var(--gray-800)',
    marginBottom: '8px',
  },
  cardDesc: {
    fontSize: '14px',
    color: 'var(--gray-600)',
    lineHeight: '1.6',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '16px',
  },
  principle: {
    display: 'flex',
    gap: '12px',
    background: '#FFFFFF',
    borderRadius: 'var(--radius-md)',
    padding: '20px',
    border: '1px solid var(--gray-200)',
  },
  principleIcon: {
    width: '40px',
    height: '40px',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#FFFFFF',
    flexShrink: 0,
  },
  principleTitle: {
    fontSize: '15px',
    fontWeight: '600',
    color: 'var(--gray-800)',
    marginBottom: '4px',
  },
  principleDesc: {
    fontSize: '13px',
    color: 'var(--gray-500)',
    lineHeight: '1.5',
  },
};

export default function AboutPage() {
  return (
    <div style={styles.container} className="fade-in">
      <div style={styles.hero}>
        <h1 style={styles.title}>About JanAwaaz</h1>
        <p style={styles.subtitle}>
          JanAwaaz (&quot;People&apos;s Voice&quot;) is a citizen engagement platform
          that empowers voters to set the agenda for their constituencies and
          hold representatives accountable.
        </p>
      </div>

      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>
          <div style={{ ...styles.sectionIcon, background: 'linear-gradient(135deg, #FF9933, #E6872E)' }}>
            <Target size={20} />
          </div>
          Our Mission
        </h2>
        <div style={styles.card}>
          <p style={styles.cardDesc}>
            India&apos;s democracy is the world&apos;s largest, with 543 Lok Sabha constituencies
            spanning the nation. Yet, citizens often lack a direct way to communicate
            their priorities to elected representatives. JanAwaaz bridges this gap by
            creating a transparent, constituency-level platform where the issues that
            matter most rise to the top through citizen votes.
          </p>
        </div>
      </div>

      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>
          <div style={{ ...styles.sectionIcon, background: 'linear-gradient(135deg, #138808, #0E6B06)' }}>
            <Users size={20} />
          </div>
          How It Works
        </h2>
        <div style={styles.grid}>
          <div style={styles.card}>
            <div style={styles.cardTitle}>For Voters</div>
            <div style={styles.cardDesc}>
              Enter your PIN code to find your constituency. Browse the issues
              proposed by social activists and community leaders. Upvote the topics
              you want addressed or downvote those you disagree with. Your vote
              helps set the constituency&apos;s agenda.
            </div>
          </div>
          <div style={styles.card}>
            <div style={styles.cardTitle}>For Politicians</div>
            <div style={styles.cardDesc}>
              See what your constituents care about most. Engage with the issues
              that have the strongest support. Commit to addressing the top-voted
              topics and demonstrate your responsiveness to earn and retain voter trust.
            </div>
          </div>
          <div style={styles.card}>
            <div style={styles.cardTitle}>For Activists</div>
            <div style={styles.cardDesc}>
              Propose issues with clear problem statements and actionable solutions.
              Rally community support around causes that need attention. Drive
              meaningful change by making citizen voices impossible to ignore.
            </div>
          </div>
        </div>
      </div>

      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>
          <div style={{ ...styles.sectionIcon, background: 'linear-gradient(135deg, #000080, #1A1A99)' }}>
            <Shield size={20} />
          </div>
          Our Principles
        </h2>
        <div style={styles.grid}>
          {[
            {
              icon: <Vote size={18} />,
              bg: '#FF9933',
              title: 'Transparency',
              desc: 'All topics and votes are visible to everyone. No hidden agendas.',
            },
            {
              icon: <BarChart3 size={18} />,
              bg: '#138808',
              title: 'Accountability',
              desc: 'Politicians can be measured by how well they address top-voted issues.',
            },
            {
              icon: <Megaphone size={18} />,
              bg: '#000080',
              title: 'Citizen-First',
              desc: 'The platform exists to amplify citizen voices, not political narratives.',
            },
            {
              icon: <Target size={18} />,
              bg: '#DC2626',
              title: 'Non-Partisan',
              desc: 'Issues are presented without party affiliation. Focus is on problems and solutions.',
            },
          ].map((p, i) => (
            <div key={i} style={styles.principle}>
              <div style={{ ...styles.principleIcon, background: p.bg }}>
                {p.icon}
              </div>
              <div>
                <div style={styles.principleTitle}>{p.title}</div>
                <div style={styles.principleDesc}>{p.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
