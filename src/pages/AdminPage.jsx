import { useState, useMemo } from 'react';
import { Lock, Plus, Search, MapPin, Trash2, Edit3, X, Check, ChevronRight } from 'lucide-react';
import { useApp } from '../context/AppContext';
import constituencies from '../data/constituencies';

const CATEGORIES = [
  'Infrastructure',
  'Education',
  'Healthcare',
  'Water & Sanitation',
  'Employment',
  'Agriculture',
  'Environment',
  'Women Safety',
  'Public Transport',
  'Corruption',
  'Housing',
  'Digital Access',
  'Law & Order',
  'Other',
];

const styles = {
  container: {
    maxWidth: 'var(--container-max)',
    margin: '0 auto',
    padding: '32px 24px',
  },
  loginCard: {
    maxWidth: '400px',
    margin: '60px auto',
    background: '#FFFFFF',
    borderRadius: 'var(--radius-lg)',
    padding: '40px 32px',
    textAlign: 'center',
    border: '1px solid var(--gray-200)',
    boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
  },
  lockIcon: {
    width: '56px',
    height: '56px',
    borderRadius: '14px',
    background: 'linear-gradient(135deg, #FF9933, #E6872E)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#FFFFFF',
    margin: '0 auto 16px',
  },
  loginTitle: {
    fontSize: '20px',
    fontWeight: '700',
    color: 'var(--gray-900)',
    marginBottom: '8px',
  },
  loginDesc: {
    fontSize: '14px',
    color: 'var(--gray-500)',
    marginBottom: '24px',
  },
  inputGroup: {
    marginBottom: '16px',
  },
  input: {
    width: '100%',
    padding: '12px 16px',
    fontSize: '15px',
    fontFamily: 'inherit',
    border: '2px solid var(--gray-200)',
    borderRadius: 'var(--radius-sm)',
    background: '#FFFFFF',
    color: 'var(--gray-900)',
    transition: 'border-color 0.2s',
  },
  btn: {
    width: '100%',
    padding: '12px',
    fontSize: '15px',
    fontWeight: '600',
    fontFamily: 'inherit',
    border: 'none',
    borderRadius: 'var(--radius-sm)',
    background: 'linear-gradient(135deg, #FF9933, #E6872E)',
    color: '#FFFFFF',
    cursor: 'pointer',
    transition: 'opacity 0.2s',
  },
  error: {
    color: 'var(--downvote)',
    fontSize: '13px',
    marginBottom: '12px',
  },
  // Admin dashboard
  pageTitle: {
    fontSize: '24px',
    fontWeight: '700',
    color: 'var(--gray-900)',
    marginBottom: '24px',
  },
  searchBar: {
    position: 'relative',
    marginBottom: '20px',
  },
  searchIcon: {
    position: 'absolute',
    left: '14px',
    top: '50%',
    transform: 'translateY(-50%)',
    color: 'var(--gray-400)',
  },
  searchInput: {
    width: '100%',
    padding: '12px 12px 12px 42px',
    fontSize: '14px',
    fontFamily: 'inherit',
    border: '2px solid var(--gray-200)',
    borderRadius: 'var(--radius-sm)',
    background: '#FFFFFF',
    color: 'var(--gray-900)',
  },
  constituencyList: {
    background: '#FFFFFF',
    borderRadius: 'var(--radius-md)',
    border: '1px solid var(--gray-200)',
    overflow: 'hidden',
    maxHeight: '400px',
    overflowY: 'auto',
  },
  stateGroup: {
    padding: '8px 16px',
    background: 'var(--gray-50)',
    fontSize: '11px',
    fontWeight: '700',
    color: 'var(--gray-500)',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    position: 'sticky',
    top: 0,
  },
  cItem: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '12px 16px',
    cursor: 'pointer',
    transition: 'background 0.15s',
    borderBottom: '1px solid var(--gray-100)',
  },
  cItemInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  cItemIcon: {
    width: '32px',
    height: '32px',
    borderRadius: '8px',
    background: 'linear-gradient(135deg, #FF9933, #E6872E)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#FFFFFF',
    flexShrink: 0,
  },
  cItemName: {
    fontSize: '14px',
    fontWeight: '600',
    color: 'var(--gray-800)',
  },
  cItemState: {
    fontSize: '12px',
    color: 'var(--gray-500)',
  },
  topicCount: {
    fontSize: '12px',
    fontWeight: '600',
    color: 'var(--green)',
    background: 'var(--upvote-bg)',
    padding: '2px 8px',
    borderRadius: '10px',
  },
  // Topic editor
  editorHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '24px',
    flexWrap: 'wrap',
    gap: '12px',
  },
  backBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '14px',
    fontWeight: '500',
    color: 'var(--gray-500)',
    cursor: 'pointer',
    background: 'none',
    border: 'none',
    fontFamily: 'inherit',
    padding: '4px 0',
  },
  addBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '10px 18px',
    fontSize: '14px',
    fontWeight: '600',
    fontFamily: 'inherit',
    border: 'none',
    borderRadius: 'var(--radius-sm)',
    background: 'var(--green)',
    color: '#FFFFFF',
    cursor: 'pointer',
  },
  topicEditor: {
    background: '#FFFFFF',
    borderRadius: 'var(--radius-md)',
    padding: '24px',
    border: '1px solid var(--gray-200)',
    marginBottom: '16px',
  },
  formGroup: {
    marginBottom: '16px',
  },
  label: {
    display: 'block',
    fontSize: '13px',
    fontWeight: '600',
    color: 'var(--gray-700)',
    marginBottom: '6px',
  },
  textarea: {
    width: '100%',
    padding: '10px 14px',
    fontSize: '14px',
    fontFamily: 'inherit',
    border: '2px solid var(--gray-200)',
    borderRadius: 'var(--radius-sm)',
    background: '#FFFFFF',
    color: 'var(--gray-900)',
    resize: 'vertical',
    minHeight: '80px',
    lineHeight: '1.5',
  },
  select: {
    width: '100%',
    padding: '10px 14px',
    fontSize: '14px',
    fontFamily: 'inherit',
    border: '2px solid var(--gray-200)',
    borderRadius: 'var(--radius-sm)',
    background: '#FFFFFF',
    color: 'var(--gray-900)',
  },
  formActions: {
    display: 'flex',
    gap: '8px',
    justifyContent: 'flex-end',
  },
  cancelBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    padding: '8px 14px',
    fontSize: '13px',
    fontWeight: '600',
    fontFamily: 'inherit',
    border: '2px solid var(--gray-200)',
    borderRadius: 'var(--radius-sm)',
    background: '#FFFFFF',
    color: 'var(--gray-600)',
    cursor: 'pointer',
  },
  saveBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    padding: '8px 14px',
    fontSize: '13px',
    fontWeight: '600',
    fontFamily: 'inherit',
    border: 'none',
    borderRadius: 'var(--radius-sm)',
    background: 'var(--green)',
    color: '#FFFFFF',
    cursor: 'pointer',
  },
  topicItem: {
    background: '#FFFFFF',
    borderRadius: 'var(--radius-sm)',
    padding: '16px 20px',
    border: '1px solid var(--gray-200)',
    marginBottom: '10px',
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: '12px',
  },
  topicTitle: {
    fontSize: '15px',
    fontWeight: '600',
    color: 'var(--gray-900)',
    marginBottom: '4px',
  },
  topicMeta: {
    fontSize: '12px',
    color: 'var(--gray-400)',
  },
  topicActions: {
    display: 'flex',
    gap: '4px',
    flexShrink: 0,
  },
  iconBtn: {
    padding: '6px',
    borderRadius: '6px',
    border: 'none',
    background: 'var(--gray-100)',
    color: 'var(--gray-500)',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteBtn: {
    padding: '6px',
    borderRadius: '6px',
    border: 'none',
    background: 'var(--downvote-bg)',
    color: 'var(--downvote)',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
};

function TopicForm({ topic, onSave, onCancel }) {
  const [title, setTitle] = useState(topic?.title || '');
  const [problem, setProblem] = useState(topic?.problem || '');
  const [solution, setSolution] = useState(topic?.solution || '');
  const [category, setCategory] = useState(topic?.category || CATEGORIES[0]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim() || !problem.trim() || !solution.trim()) return;
    onSave({ title: title.trim(), problem: problem.trim(), solution: solution.trim(), category });
  };

  return (
    <form style={styles.topicEditor} onSubmit={handleSubmit} className="fade-in">
      <div style={styles.formGroup}>
        <label style={styles.label}>Category</label>
        <select
          style={styles.select}
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          {CATEGORIES.map(c => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      <div style={styles.formGroup}>
        <label style={styles.label}>Topic Title *</label>
        <input
          style={styles.input}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g., Road infrastructure in rural areas"
          required
        />
      </div>

      <div style={styles.formGroup}>
        <label style={styles.label}>Problem Description *</label>
        <textarea
          style={styles.textarea}
          value={problem}
          onChange={(e) => setProblem(e.target.value)}
          placeholder="Describe the problem clearly..."
          required
        />
      </div>

      <div style={styles.formGroup}>
        <label style={styles.label}>Proposed Solution *</label>
        <textarea
          style={styles.textarea}
          value={solution}
          onChange={(e) => setSolution(e.target.value)}
          placeholder="Describe the proposed solution..."
          required
        />
      </div>

      <div style={styles.formActions}>
        <button type="button" style={styles.cancelBtn} onClick={onCancel}>
          <X size={14} />
          Cancel
        </button>
        <button type="submit" style={styles.saveBtn}>
          <Check size={14} />
          {topic ? 'Update' : 'Add Topic'}
        </button>
      </div>
    </form>
  );
}

function TopicManager({ constituencyData, onBack }) {
  const { getTopicsForConstituency, addTopic, editTopic, deleteTopic } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [editingTopic, setEditingTopic] = useState(null);

  const topics = getTopicsForConstituency(constituencyData.id);

  const handleSave = (data) => {
    if (editingTopic) {
      editTopic(constituencyData.id, editingTopic.id, data);
      setEditingTopic(null);
    } else {
      addTopic(constituencyData.id, data);
    }
    setShowForm(false);
  };

  return (
    <div className="fade-in">
      <div style={styles.editorHeader}>
        <div>
          <button style={styles.backBtn} onClick={onBack}>
            ← Back to constituencies
          </button>
          <h2 style={{ fontSize: '20px', fontWeight: '700', color: 'var(--gray-900)', marginTop: '8px' }}>
            {constituencyData.name}
          </h2>
          <div style={{ fontSize: '13px', color: 'var(--gray-500)' }}>
            {constituencyData.state} — {topics.length} topics
          </div>
        </div>
        <button
          style={styles.addBtn}
          onClick={() => { setShowForm(true); setEditingTopic(null); }}
        >
          <Plus size={16} />
          Add Topic
        </button>
      </div>

      {(showForm || editingTopic) && (
        <TopicForm
          topic={editingTopic}
          onSave={handleSave}
          onCancel={() => { setShowForm(false); setEditingTopic(null); }}
        />
      )}

      {topics.length === 0 && !showForm && (
        <div style={{ ...styles.topicEditor, textAlign: 'center', color: 'var(--gray-500)', padding: '40px' }}>
          No topics yet. Click &quot;Add Topic&quot; to create one.
        </div>
      )}

      {topics.map((topic) => (
        <div key={topic.id} style={styles.topicItem}>
          <div style={{ flex: 1 }}>
            <div style={styles.topicTitle}>{topic.title}</div>
            <div style={styles.topicMeta}>
              {topic.category} &middot; Added {new Date(topic.createdAt).toLocaleDateString()}
            </div>
          </div>
          <div style={styles.topicActions}>
            <button
              style={styles.iconBtn}
              onClick={() => { setEditingTopic(topic); setShowForm(false); }}
              title="Edit"
            >
              <Edit3 size={14} />
            </button>
            <button
              style={styles.deleteBtn}
              onClick={() => {
                if (confirm('Delete this topic?')) {
                  deleteTopic(constituencyData.id, topic.id);
                }
              }}
              title="Delete"
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function AdminPage() {
  const { isAdmin, loginAdmin, getTopicsForConstituency } = useApp();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [selectedConstituency, setSelectedConstituency] = useState(null);

  const filtered = useMemo(() => {
    if (!search.trim()) return constituencies;
    const q = search.toLowerCase();
    return constituencies.filter(c =>
      c.name.toLowerCase().includes(q) ||
      c.state.toLowerCase().includes(q) ||
      c.id.toLowerCase().includes(q)
    );
  }, [search]);

  const grouped = useMemo(() => {
    const g = {};
    filtered.forEach(c => {
      if (!g[c.state]) g[c.state] = [];
      g[c.state].push(c);
    });
    return g;
  }, [filtered]);

  const handleLogin = (e) => {
    e.preventDefault();
    if (loginAdmin(password)) {
      setError('');
    } else {
      setError('Incorrect password');
    }
  };

  if (!isAdmin) {
    return (
      <div style={styles.container}>
        <div style={styles.loginCard} className="fade-in">
          <div style={styles.lockIcon}>
            <Lock size={24} />
          </div>
          <h2 style={styles.loginTitle}>Admin Access</h2>
          <p style={styles.loginDesc}>Enter the admin password to manage topics</p>
          <form onSubmit={handleLogin}>
            {error && <div style={styles.error}>{error}</div>}
            <div style={styles.inputGroup}>
              <input
                type="password"
                style={styles.input}
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoFocus
              />
            </div>
            <button type="submit" style={styles.btn}>
              Sign In
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (selectedConstituency) {
    return (
      <div style={styles.container}>
        <TopicManager
          constituencyData={selectedConstituency}
          onBack={() => setSelectedConstituency(null)}
        />
      </div>
    );
  }

  return (
    <div style={styles.container} className="fade-in">
      <h1 style={styles.pageTitle}>Manage Topics</h1>

      <div style={styles.searchBar}>
        <Search size={18} style={styles.searchIcon} />
        <input
          style={styles.searchInput}
          type="text"
          placeholder="Search constituencies by name or state..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div style={styles.constituencyList}>
        {Object.entries(grouped).map(([state, items]) => (
          <div key={state}>
            <div style={styles.stateGroup}>{state} ({items.length})</div>
            {items.map(c => {
              const topicCount = getTopicsForConstituency(c.id).length;
              return (
                <div
                  key={c.id}
                  style={styles.cItem}
                  onClick={() => setSelectedConstituency(c)}
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--gray-50)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                >
                  <div style={styles.cItemInfo}>
                    <div style={styles.cItemIcon}>
                      <MapPin size={16} />
                    </div>
                    <div>
                      <div style={styles.cItemName}>{c.name}</div>
                      <div style={styles.cItemState}>{c.id}</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {topicCount > 0 && (
                      <span style={styles.topicCount}>{topicCount} topics</span>
                    )}
                    <ChevronRight size={16} color="var(--gray-400)" />
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
