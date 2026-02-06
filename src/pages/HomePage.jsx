import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Vote, Users, Megaphone, MapPin, ChevronRight } from 'lucide-react';
import { useApp } from '../context/AppContext';
import PincodeLookup from '../components/PincodeLookup';
import IndiaMap from '../components/IndiaMap';
import constituencies from '../data/constituencies';

const styles = {
  hero: {
    background: 'linear-gradient(160deg, #FFF5EB 0%, #FFFFFF 40%, #E8F5E3 100%)',
    padding: '60px 24px 48px',
    textAlign: 'center',
  },
  heroInner: {
    maxWidth: 'var(--container-max)',
    margin: '0 auto',
  },
  badge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '6px 14px',
    borderRadius: '20px',
    background: '#FFFFFF',
    border: '1px solid var(--gray-200)',
    fontSize: '13px',
    fontWeight: '500',
    color: 'var(--gray-600)',
    marginBottom: '20px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
  },
  badgeDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    background: 'var(--green)',
  },
  title: {
    fontSize: 'clamp(28px, 5vw, 44px)',
    fontWeight: '800',
    color: 'var(--gray-900)',
    lineHeight: '1.15',
    marginBottom: '16px',
    letterSpacing: '-0.5px',
  },
  titleAccent: {
    background: 'linear-gradient(135deg, #FF9933, #E6872E)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  subtitle: {
    fontSize: '17px',
    color: 'var(--gray-500)',
    maxWidth: '520px',
    margin: '0 auto 40px',
    lineHeight: '1.6',
  },
  // Map section
  mapSection: {
    maxWidth: 'var(--container-max)',
    margin: '0 auto',
    padding: '48px 24px',
  },
  mapSectionTitle: {
    fontSize: '24px',
    fontWeight: '700',
    color: 'var(--gray-900)',
    textAlign: 'center',
    marginBottom: '8px',
  },
  mapSectionSubtitle: {
    fontSize: '15px',
    color: 'var(--gray-500)',
    textAlign: 'center',
    marginBottom: '32px',
  },
  mapLayout: {
    display: 'grid',
    gap: '32px',
    alignItems: 'start',
  },
  mapContainer: {
    display: 'flex',
    justifyContent: 'center',
  },
  constituencyPanel: {
    background: '#FFFFFF',
    borderRadius: 'var(--radius-md)',
    border: '1px solid var(--gray-200)',
    maxHeight: '500px',
    overflowY: 'auto',
  },
  panelHeader: {
    padding: '16px',
    borderBottom: '1px solid var(--gray-200)',
    position: 'sticky',
    top: 0,
    background: '#FFFFFF',
    zIndex: 1,
    borderRadius: 'var(--radius-md) var(--radius-md) 0 0',
  },
  panelTitle: {
    fontSize: '16px',
    fontWeight: '600',
    color: 'var(--gray-900)',
  },
  panelCount: {
    fontSize: '13px',
    color: 'var(--gray-500)',
    marginTop: '2px',
  },
  panelEmpty: {
    padding: '48px 24px',
    textAlign: 'center',
    color: 'var(--gray-500)',
    fontSize: '14px',
    lineHeight: '1.6',
  },
  panelEmptyIcon: {
    width: '48px',
    height: '48px',
    borderRadius: '12px',
    background: 'var(--gray-100)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 12px',
    color: 'var(--gray-400)',
  },
  constituencyItem: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '12px 16px',
    cursor: 'pointer',
    transition: 'background 0.15s',
    borderBottom: '1px solid var(--gray-100)',
  },
  constituencyItemInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  constituencyName: {
    fontSize: '14px',
    fontWeight: '500',
    color: 'var(--gray-800)',
  },
  // Features
  features: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
    gap: '20px',
    maxWidth: 'var(--container-max)',
    margin: '0 auto',
    padding: '48px 24px',
  },
  featureCard: {
    background: '#FFFFFF',
    borderRadius: 'var(--radius-md)',
    padding: '28px 24px',
    textAlign: 'center',
    border: '1px solid var(--gray-200)',
    transition: 'all 0.2s',
  },
  featureIcon: {
    width: '48px',
    height: '48px',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 14px',
    color: '#FFFFFF',
  },
  featureTitle: {
    fontSize: '16px',
    fontWeight: '600',
    color: 'var(--gray-900)',
    marginBottom: '6px',
  },
  featureDesc: {
    fontSize: '13px',
    color: 'var(--gray-500)',
    lineHeight: '1.5',
  },
  howItWorks: {
    maxWidth: 'var(--container-max)',
    margin: '0 auto',
    padding: '24px 24px 60px',
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: '24px',
    fontWeight: '700',
    color: 'var(--gray-900)',
    marginBottom: '32px',
  },
  steps: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '24px',
  },
  step: {
    position: 'relative',
    padding: '20px',
  },
  stepNumber: {
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #FF9933, #E6872E)',
    color: '#FFFFFF',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '16px',
    fontWeight: '700',
    margin: '0 auto 12px',
  },
  stepTitle: {
    fontSize: '15px',
    fontWeight: '600',
    color: 'var(--gray-800)',
    marginBottom: '4px',
  },
  stepDesc: {
    fontSize: '13px',
    color: 'var(--gray-500)',
  },
};

export default function HomePage() {
  const [selectedMapState, setSelectedMapState] = useState(null);
  const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' && window.innerWidth < 768);
  const { selectConstituency } = useApp();
  const navigate = useNavigate();

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const filteredConstituencies = selectedMapState
    ? constituencies.filter(c => c.state === selectedMapState)
    : [];

  const handleConstituencyClick = (c) => {
    selectConstituency(c, '');
    navigate(`/constituency/${c.id}`);
  };

  return (
    <div>
      <section style={styles.hero}>
        <div style={styles.heroInner} className="slide-up">
          <div style={styles.badge}>
            <div style={styles.badgeDot} />
            543 Lok Sabha Constituencies
          </div>

          <h1 style={styles.title}>
            Your Voice.<br />
            Your <span style={styles.titleAccent}>Constituency</span>.<br />
            Your <span style={{ ...styles.titleAccent, background: 'linear-gradient(135deg, #138808, #0E6B06)', WebkitBackgroundClip: 'text' }}>Agenda</span>.
          </h1>

          <p style={styles.subtitle}>
            Vote on the issues that matter most in your constituency.
            Hold your representatives accountable.
          </p>

          <PincodeLookup />
        </div>
      </section>

      <section style={styles.mapSection}>
        <h2 style={styles.mapSectionTitle}>Explore by State</h2>
        <p style={styles.mapSectionSubtitle}>
          Click on any state to see its Lok Sabha constituencies
        </p>
        <div style={{ ...styles.mapLayout, gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr' }}>
          <div style={styles.mapContainer}>
            <IndiaMap
              onStateSelect={setSelectedMapState}
              selectedState={selectedMapState}
            />
          </div>
          <div style={styles.constituencyPanel}>
            {selectedMapState ? (
              <>
                <div style={styles.panelHeader}>
                  <div style={styles.panelTitle}>{selectedMapState}</div>
                  <div style={styles.panelCount}>
                    {filteredConstituencies.length} constituencies
                  </div>
                </div>
                {filteredConstituencies.map(c => (
                  <div
                    key={c.id}
                    style={styles.constituencyItem}
                    onClick={() => handleConstituencyClick(c)}
                    onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--gray-50)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                  >
                    <div style={styles.constituencyItemInfo}>
                      <MapPin size={16} color="#FF9933" />
                      <span style={styles.constituencyName}>{c.name}</span>
                    </div>
                    <ChevronRight size={16} color="var(--gray-400)" />
                  </div>
                ))}
              </>
            ) : (
              <div style={styles.panelEmpty}>
                <div style={styles.panelEmptyIcon}>
                  <MapPin size={22} />
                </div>
                Click on a state in the map to view its constituencies
              </div>
            )}
          </div>
        </div>
      </section>

      <section style={styles.features}>
        {[
          {
            icon: <Vote size={24} />,
            bg: 'linear-gradient(135deg, #FF9933, #E6872E)',
            title: 'For Voters',
            desc: 'Make your voice heard. Upvote or downvote the issues that matter most to you. Put your voting power behind setting the agenda.',
          },
          {
            icon: <Users size={24} />,
            bg: 'linear-gradient(135deg, #138808, #0E6B06)',
            title: 'For Politicians',
            desc: 'Engage with your electorate. Understand their priorities. Gain support by committing to address the issues they care about.',
          },
          {
            icon: <Megaphone size={24} />,
            bg: 'linear-gradient(135deg, #000080, #1A1A99)',
            title: 'For Activists',
            desc: 'Propose problems and solutions. Rally citizen support around the causes that need attention in each constituency.',
          },
        ].map((f, i) => (
          <div
            key={i}
            style={styles.featureCard}
            className="fade-in"
          >
            <div style={{ ...styles.featureIcon, background: f.bg }}>
              {f.icon}
            </div>
            <div style={styles.featureTitle}>{f.title}</div>
            <div style={styles.featureDesc}>{f.desc}</div>
          </div>
        ))}
      </section>

      <section style={styles.howItWorks}>
        <h2 style={styles.sectionTitle}>How It Works</h2>
        <div style={styles.steps}>
          {[
            { num: '1', title: 'Enter PIN Code', desc: 'Find your Lok Sabha constituency' },
            { num: '2', title: 'See Issues', desc: 'Browse topics proposed for your area' },
            { num: '3', title: 'Vote', desc: 'Support or oppose each issue' },
            { num: '4', title: 'Drive Change', desc: 'Hold representatives accountable' },
          ].map((s, i) => (
            <div key={i} style={styles.step}>
              <div style={styles.stepNumber}>{s.num}</div>
              <div style={styles.stepTitle}>{s.title}</div>
              <div style={styles.stepDesc}>{s.desc}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
