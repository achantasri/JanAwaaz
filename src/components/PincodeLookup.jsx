import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, ChevronRight } from 'lucide-react';
import { useApp } from '../context/AppContext';
import constituencies from '../data/constituencies';
import assemblyConstituencies from '../data/assemblyConstituencies';
import pcToAcMapping from '../data/pcToAcMapping';
import { CONSTITUENCY_TYPES } from '../utils/constituencyHelpers';

const styles = {
  wrapper: {
    maxWidth: '480px',
    margin: '0 auto',
    width: '100%',
  },
  inputGroup: {
    position: 'relative',
    marginBottom: '16px',
  },
  icon: {
    position: 'absolute',
    left: '16px',
    top: '50%',
    transform: 'translateY(-50%)',
    color: 'var(--gray-400)',
    pointerEvents: 'none',
  },
  input: {
    width: '100%',
    padding: '16px 16px 16px 48px',
    fontSize: '18px',
    fontWeight: '500',
    fontFamily: 'inherit',
    border: '2px solid var(--gray-200)',
    borderRadius: 'var(--radius-md)',
    background: '#FFFFFF',
    color: 'var(--gray-900)',
    transition: 'all 0.2s',
    letterSpacing: '2px',
  },
  inputFocused: {
    borderColor: 'var(--saffron)',
    boxShadow: '0 0 0 3px rgba(255,153,51,0.15)',
  },
  hint: {
    fontSize: '13px',
    color: 'var(--gray-500)',
    textAlign: 'center',
    marginBottom: '16px',
  },
  results: {
    background: '#FFFFFF',
    borderRadius: 'var(--radius-md)',
    border: '1px solid var(--gray-200)',
    overflow: 'hidden',
    boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
  },
  resultItem: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '14px 16px',
    cursor: 'pointer',
    transition: 'background 0.15s',
    borderBottom: '1px solid var(--gray-100)',
  },
  resultInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  resultIcon: {
    width: '36px',
    height: '36px',
    borderRadius: '8px',
    background: 'linear-gradient(135deg, #FF9933, #E6872E)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#FFFFFF',
    flexShrink: 0,
  },
  resultName: {
    fontSize: '15px',
    fontWeight: '600',
    color: 'var(--gray-900)',
  },
  resultState: {
    fontSize: '13px',
    color: 'var(--gray-500)',
  },
  noResults: {
    padding: '24px',
    textAlign: 'center',
    color: 'var(--gray-500)',
    fontSize: '14px',
  },
  stateGroup: {
    padding: '8px 16px',
    background: 'var(--gray-50)',
    fontSize: '11px',
    fontWeight: '700',
    color: 'var(--gray-500)',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  orDivider: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    margin: '20px 0',
    color: 'var(--gray-400)',
    fontSize: '13px',
  },
  dividerLine: {
    flex: 1,
    height: '1px',
    background: 'var(--gray-200)',
  },
  browseLink: {
    display: 'block',
    padding: '12px',
    textAlign: 'center',
    color: 'var(--saffron-dark)',
    fontWeight: '600',
    fontSize: '14px',
    cursor: 'pointer',
    background: 'none',
    border: 'none',
    width: '100%',
    fontFamily: 'inherit',
    transition: 'color 0.2s',
  },
  resultsList: {
    maxHeight: '300px',
    overflowY: 'auto',
  },
  matchCount: {
    fontSize: '12px',
    color: 'var(--gray-400)',
    padding: '6px 16px',
    background: 'var(--gray-50)',
    borderBottom: '1px solid var(--gray-100)',
  },
  pcLabel: {
    fontSize: '11px',
    color: 'var(--gray-400)',
    marginTop: '2px',
  },
};

// Build AC lookup by ID for fast access
const acById = {};
assemblyConstituencies.forEach(c => { acById[c.id] = c; });

export default function PincodeLookup() {
  const [pincode, setPincode] = useState('');
  const [focused, setFocused] = useState(false);
  const [showBrowse, setShowBrowse] = useState(false);
  const [stateFilter, setStateFilter] = useState('');
  const { selectConstituency, constituencyType } = useApp();
  const navigate = useNavigate();

  const isVidhanSabha = constituencyType === CONSTITUENCY_TYPES.VIDHAN_SABHA;
  const activeDataset = isVidhanSabha ? assemblyConstituencies : constituencies;

  // For Lok Sabha: direct PIN → constituency match via pinRanges
  const lokSabhaMatches = useMemo(() => {
    if (pincode.length < 3) return [];
    const prefix = pincode.slice(0, 3);
    return constituencies.filter(c =>
      c.pinRanges.some(range => range === prefix)
    );
  }, [pincode]);

  // For Vidhan Sabha: PIN → Lok Sabha PCs → Assembly Constituencies
  // Each Lok Sabha PC is composed of 5-9 specific Assembly Constituencies
  const vidhanSabhaMatches = useMemo(() => {
    if (pincode.length < 3 || lokSabhaMatches.length === 0) return [];

    // Collect all AC IDs from matched Lok Sabha constituencies
    const acIds = new Set();
    lokSabhaMatches.forEach(pc => {
      const acs = pcToAcMapping[pc.id];
      if (acs) {
        acs.forEach(acId => acIds.add(acId));
      }
    });

    // Look up full AC objects
    const results = [];
    acIds.forEach(acId => {
      const ac = acById[acId];
      if (ac) results.push(ac);
    });

    // Sort by state, then name
    results.sort((a, b) => a.state.localeCompare(b.state) || a.name.localeCompare(b.name));
    return results;
  }, [pincode, lokSabhaMatches]);

  // Build a reverse mapping for display: AC ID → PC name
  const acToPcName = useMemo(() => {
    if (!isVidhanSabha || lokSabhaMatches.length === 0) return {};
    const map = {};
    lokSabhaMatches.forEach(pc => {
      const acs = pcToAcMapping[pc.id];
      if (acs) {
        acs.forEach(acId => { map[acId] = pc.name; });
      }
    });
    return map;
  }, [isVidhanSabha, lokSabhaMatches]);

  const matches = isVidhanSabha ? vidhanSabhaMatches : lokSabhaMatches;
  const hasResults = matches.length > 0;

  const states = useMemo(() => {
    const s = [...new Set(activeDataset.map(c => c.state))];
    s.sort();
    return s;
  }, [activeDataset]);

  const filteredByState = useMemo(() => {
    if (!stateFilter) return [];
    return activeDataset.filter(c => c.state === stateFilter);
  }, [stateFilter, activeDataset]);

  const handleSelect = (c) => {
    selectConstituency(c, pincode);
    navigate(`/constituency/${c.id}`);
  };

  // Group by Lok Sabha constituency for Vidhan Sabha results
  const groupByPC = (list) => {
    const grouped = {};
    list.forEach(c => {
      const pcName = acToPcName[c.id] || c.state;
      if (!grouped[pcName]) grouped[pcName] = [];
      grouped[pcName].push(c);
    });
    return grouped;
  };

  const groupByState = (list) => {
    const grouped = {};
    list.forEach(c => {
      if (!grouped[c.state]) grouped[c.state] = [];
      grouped[c.state].push(c);
    });
    return grouped;
  };

  // For Vidhan Sabha, group by parent Lok Sabha constituency; otherwise by state
  const grouped = matches.length > 0
    ? (isVidhanSabha ? groupByPC(matches) : groupByState(matches))
    : {};

  return (
    <div style={styles.wrapper}>
      <div style={styles.inputGroup}>
        <Search size={20} style={styles.icon} />
        <input
          type="text"
          placeholder="Enter your PIN code"
          value={pincode}
          onChange={(e) => {
            const val = e.target.value.replace(/\D/g, '').slice(0, 6);
            setPincode(val);
            setShowBrowse(false);
          }}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{
            ...styles.input,
            ...(focused ? styles.inputFocused : {}),
          }}
          inputMode="numeric"
          maxLength={6}
        />
      </div>

      <p style={styles.hint}>
        Enter at least 3 digits of your PIN code to find your constituency
      </p>

      {pincode.length >= 3 && hasResults && (
        <div style={styles.results} className="fade-in">
          {isVidhanSabha && (
            <div style={styles.matchCount}>
              Found {matches.length} assembly constituencies
              {lokSabhaMatches.length > 0 &&
                ` via ${lokSabhaMatches.length} Lok Sabha ${lokSabhaMatches.length === 1 ? 'constituency' : 'constituencies'}`
              }
            </div>
          )}
          <div style={isVidhanSabha && matches.length > 10 ? styles.resultsList : {}}>
            {Object.entries(grouped).map(([group, items]) => (
              <div key={group}>
                <div style={styles.stateGroup}>
                  {isVidhanSabha ? `${group} Lok Sabha` : group} ({items.length})
                </div>
                {items.map((c) => (
                  <div
                    key={c.id}
                    style={styles.resultItem}
                    onClick={() => handleSelect(c)}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'var(--gray-50)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'transparent';
                    }}
                  >
                    <div style={styles.resultInfo}>
                      <div style={styles.resultIcon}>
                        <MapPin size={18} />
                      </div>
                      <div>
                        <div style={styles.resultName}>{c.name}</div>
                        <div style={styles.resultState}>{c.state}</div>
                      </div>
                    </div>
                    <ChevronRight size={18} color="var(--gray-400)" />
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}

      {pincode.length >= 3 && !hasResults && (
        <div style={styles.results} className="fade-in">
          <div style={styles.noResults}>
            No constituency found for PIN code &quot;{pincode}&quot;.
            Try browsing by state below.
          </div>
        </div>
      )}

      <div style={styles.orDivider}>
        <div style={styles.dividerLine} />
        <span>or</span>
        <div style={styles.dividerLine} />
      </div>

      <button
        style={styles.browseLink}
        onClick={() => setShowBrowse(!showBrowse)}
      >
        {showBrowse ? 'Hide state list' : 'Browse by state'}
      </button>

      {showBrowse && (
        <div style={styles.results} className="fade-in">
          {!stateFilter ? (
            states.map(state => (
              <div
                key={state}
                style={styles.resultItem}
                onClick={() => setStateFilter(state)}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'var(--gray-50)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                }}
              >
                <div style={styles.resultInfo}>
                  <div style={styles.resultIcon}>
                    <MapPin size={18} />
                  </div>
                  <div style={styles.resultName}>{state}</div>
                </div>
                <ChevronRight size={18} color="var(--gray-400)" />
              </div>
            ))
          ) : (
            <>
              <div
                style={{ ...styles.stateGroup, cursor: 'pointer' }}
                onClick={() => setStateFilter('')}
              >
                ← Back to states &nbsp;/&nbsp; {stateFilter}
              </div>
              <div style={styles.resultsList}>
                {filteredByState.map(c => (
                  <div
                    key={c.id}
                    style={styles.resultItem}
                    onClick={() => handleSelect(c)}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'var(--gray-50)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'transparent';
                    }}
                  >
                    <div style={styles.resultInfo}>
                      <div style={styles.resultIcon}>
                        <MapPin size={18} />
                      </div>
                      <div>
                        <div style={styles.resultName}>{c.name}</div>
                        <div style={styles.resultState}>{c.state}</div>
                      </div>
                    </div>
                    <ChevronRight size={18} color="var(--gray-400)" />
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
