import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapPin, FileQuestion, ArrowLeft } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { findConstituencyById, getConstituencyType, getTypeLabel } from '../utils/constituencyHelpers';
import TopicCard from '../components/TopicCard';

const styles = {
  container: {
    maxWidth: 'var(--container-max)',
    margin: '0 auto',
    padding: '32px 24px',
  },
  back: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    color: 'var(--gray-500)',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    background: 'none',
    border: 'none',
    fontFamily: 'inherit',
    padding: '4px 0',
    marginBottom: '20px',
    transition: 'color 0.2s',
  },
  header: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '16px',
    marginBottom: '32px',
    padding: '24px',
    background: 'linear-gradient(135deg, #FFF5EB 0%, #FFFFFF 100%)',
    borderRadius: 'var(--radius-lg)',
    border: '1px solid var(--gray-200)',
  },
  headerIcon: {
    width: '52px',
    height: '52px',
    borderRadius: '14px',
    background: 'linear-gradient(135deg, #FF9933, #E6872E)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#FFFFFF',
    flexShrink: 0,
  },
  headerInfo: {
    flex: 1,
  },
  constituencyName: {
    fontSize: '24px',
    fontWeight: '700',
    color: 'var(--gray-900)',
    marginBottom: '4px',
  },
  stateName: {
    fontSize: '15px',
    color: 'var(--gray-500)',
    fontWeight: '500',
  },
  topicCount: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    padding: '4px 12px',
    borderRadius: '16px',
    background: 'var(--green)',
    color: '#FFFFFF',
    fontSize: '13px',
    fontWeight: '600',
    marginTop: '8px',
  },
  topicList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  empty: {
    textAlign: 'center',
    padding: '60px 24px',
    background: '#FFFFFF',
    borderRadius: 'var(--radius-lg)',
    border: '1px solid var(--gray-200)',
  },
  emptyIcon: {
    width: '64px',
    height: '64px',
    borderRadius: '16px',
    background: 'var(--gray-100)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 16px',
    color: 'var(--gray-400)',
  },
  emptyTitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: 'var(--gray-700)',
    marginBottom: '8px',
  },
  emptyDesc: {
    fontSize: '14px',
    color: 'var(--gray-500)',
    maxWidth: '360px',
    margin: '0 auto',
  },
  sectionLabel: {
    fontSize: '13px',
    fontWeight: '600',
    color: 'var(--gray-500)',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    marginBottom: '16px',
  },
};

export default function ConstituencyPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { constituency, selectConstituency, getTopicsForConstituency, loading } = useApp();

  const constituencyData = findConstituencyById(id);
  const constituencyTypeLabel = getTypeLabel(getConstituencyType(id));
  const topics = getTopicsForConstituency(id);

  useEffect(() => {
    if (constituencyData && (!constituency || constituency.id !== id)) {
      selectConstituency(constituencyData, '');
    }
  }, [constituencyData, constituency, id, selectConstituency]);

  if (!constituencyData) {
    return (
      <div style={styles.container}>
        <div style={styles.empty}>
          <div style={styles.emptyTitle}>Constituency not found</div>
          <button
            style={{ ...styles.back, margin: '12px auto 0' }}
            onClick={() => navigate('/')}
          >
            <ArrowLeft size={16} />
            Go back home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container} className="fade-in">
      <button
        style={styles.back}
        onClick={() => navigate('/')}
        onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--saffron)'; }}
        onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--gray-500)'; }}
      >
        <ArrowLeft size={16} />
        Change constituency
      </button>

      <div style={styles.header}>
        <div style={styles.headerIcon}>
          <MapPin size={26} />
        </div>
        <div style={styles.headerInfo}>
          <h1 style={styles.constituencyName}>{constituencyData.name}</h1>
          <div style={styles.stateName}>{constituencyData.state} — {constituencyTypeLabel} Constituency</div>
          <div style={styles.topicCount}>
            {topics.length} {topics.length === 1 ? 'topic' : 'topics'}
          </div>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 24px', color: 'var(--gray-500)', fontSize: '15px' }}>
          Loading topics...
        </div>
      ) : topics.length > 0 ? (
        <>
          <div style={styles.sectionLabel}>Issues in your constituency</div>
          <div style={styles.topicList}>
            {topics.map((topic) => (
              <TopicCard key={topic.id} topic={topic} />
            ))}
          </div>
        </>
      ) : (
        <div style={styles.empty}>
          <div style={styles.emptyIcon}>
            <FileQuestion size={28} />
          </div>
          <div style={styles.emptyTitle}>No topics yet</div>
          <div style={styles.emptyDesc}>
            No issues have been added for this constituency yet.
            Topics will be added by administrators and social activists.
          </div>
        </div>
      )}
    </div>
  );
}
