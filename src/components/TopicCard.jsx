import { ThumbsUp, ThumbsDown } from 'lucide-react';
import { useApp } from '../context/AppContext';

const styles = {
  card: {
    background: '#FFFFFF',
    borderRadius: 'var(--radius-md)',
    padding: '20px 24px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
    border: '1px solid var(--gray-200)',
    transition: 'all 0.2s ease',
    animation: 'fadeIn 0.4s ease-out',
  },
  cardHover: {
    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
    borderColor: 'var(--gray-300)',
  },
  category: {
    display: 'inline-block',
    padding: '2px 10px',
    borderRadius: '12px',
    fontSize: '11px',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    marginBottom: '10px',
    background: 'var(--saffron)',
    color: '#FFFFFF',
  },
  title: {
    fontSize: '17px',
    fontWeight: '600',
    color: 'var(--gray-900)',
    marginBottom: '8px',
    lineHeight: '1.4',
  },
  section: {
    marginBottom: '12px',
  },
  sectionLabel: {
    fontSize: '11px',
    fontWeight: '600',
    color: 'var(--gray-500)',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    marginBottom: '4px',
  },
  sectionText: {
    fontSize: '14px',
    color: 'var(--gray-600)',
    lineHeight: '1.5',
  },
  actions: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginTop: '16px',
    paddingTop: '12px',
    borderTop: '1px solid var(--gray-100)',
  },
  voteBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 16px',
    borderRadius: '8px',
    border: '2px solid',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    fontFamily: 'inherit',
  },
  upBtn: {
    borderColor: 'var(--upvote)',
    color: 'var(--upvote)',
    background: 'var(--upvote-bg)',
  },
  upBtnActive: {
    borderColor: 'var(--upvote)',
    color: '#FFFFFF',
    background: 'var(--upvote)',
  },
  downBtn: {
    borderColor: 'var(--downvote)',
    color: 'var(--downvote)',
    background: 'var(--downvote-bg)',
  },
  downBtnActive: {
    borderColor: 'var(--downvote)',
    color: '#FFFFFF',
    background: 'var(--downvote)',
  },
  voteLabel: {
    marginLeft: 'auto',
    fontSize: '12px',
    color: 'var(--gray-400)',
    fontStyle: 'italic',
  },
  countBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    fontSize: '13px',
    fontWeight: '700',
    minWidth: '28px',
  },
  countsRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    marginLeft: 'auto',
  },
  upCount: {
    color: 'var(--upvote)',
  },
  downCount: {
    color: 'var(--downvote)',
  },
};

export default function TopicCard({ topic }) {
  const { vote, getVote, getVoteCounts } = useApp();
  const currentVote = getVote(topic.id);
  const counts = getVoteCounts(topic.id);

  return (
    <div
      style={styles.card}
      onMouseEnter={(e) => {
        Object.assign(e.currentTarget.style, styles.cardHover);
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = styles.card.boxShadow;
        e.currentTarget.style.borderColor = styles.card.border;
      }}
    >
      {topic.category && (
        <span style={styles.category}>{topic.category}</span>
      )}

      <h3 style={styles.title}>{topic.title}</h3>

      <div style={styles.section}>
        <div style={styles.sectionLabel}>Problem</div>
        <p style={styles.sectionText}>{topic.problem}</p>
      </div>

      <div style={styles.section}>
        <div style={styles.sectionLabel}>Proposed Solution</div>
        <p style={styles.sectionText}>{topic.solution}</p>
      </div>

      <div style={styles.actions}>
        <button
          style={{
            ...styles.voteBtn,
            ...(currentVote === 'up' ? styles.upBtnActive : styles.upBtn),
          }}
          onClick={() => vote(topic.id, 'up')}
          title="I support this"
        >
          <ThumbsUp size={16} />
          Support
        </button>

        <button
          style={{
            ...styles.voteBtn,
            ...(currentVote === 'down' ? styles.downBtnActive : styles.downBtn),
          }}
          onClick={() => vote(topic.id, 'down')}
          title="I oppose this"
        >
          <ThumbsDown size={16} />
          Oppose
        </button>

        <div style={styles.countsRow}>
          <span style={{ ...styles.countBadge, ...styles.upCount }}>
            <ThumbsUp size={14} />
            {counts.up}
          </span>
          <span style={{ ...styles.countBadge, ...styles.downCount }}>
            <ThumbsDown size={14} />
            {counts.down}
          </span>
        </div>
      </div>
    </div>
  );
}
