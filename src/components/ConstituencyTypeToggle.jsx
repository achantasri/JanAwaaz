import { useApp } from '../context/AppContext';
import { CONSTITUENCY_TYPES, getTypeLabel } from '../utils/constituencyHelpers';

const styles = {
  container: {
    display: 'inline-flex',
    borderRadius: '10px',
    border: '1px solid var(--gray-200)',
    background: '#FFFFFF',
    padding: '3px',
    gap: '2px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
  },
  pill: {
    padding: '8px 18px',
    fontSize: '13px',
    fontWeight: '600',
    fontFamily: 'inherit',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.2s',
    whiteSpace: 'nowrap',
  },
  active: {
    background: 'linear-gradient(135deg, #FF9933, #E6872E)',
    color: '#FFFFFF',
    boxShadow: '0 2px 6px rgba(255,153,51,0.3)',
  },
  inactive: {
    background: 'transparent',
    color: 'var(--gray-500)',
  },
};

export default function ConstituencyTypeToggle() {
  const { constituencyType, switchConstituencyType } = useApp();

  return (
    <div style={styles.container}>
      {Object.values(CONSTITUENCY_TYPES).map(type => {
        const isActive = constituencyType === type;
        return (
          <button
            key={type}
            style={{
              ...styles.pill,
              ...(isActive ? styles.active : styles.inactive),
            }}
            onClick={() => switchConstituencyType(type)}
            onMouseEnter={(e) => {
              if (!isActive) e.currentTarget.style.color = 'var(--gray-700)';
            }}
            onMouseLeave={(e) => {
              if (!isActive) e.currentTarget.style.color = 'var(--gray-500)';
            }}
          >
            {getTypeLabel(type)}
          </button>
        );
      })}
    </div>
  );
}
