import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, ChevronRight } from 'lucide-react';
import { useApp } from '../context/AppContext';
import constituencies from '../data/constituencies';
import assemblyConstituencies from '../data/assemblyConstituencies';
import { lookupPinDistrict } from '../data/pincodeDistricts';
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
  resultDistrict: {
    fontSize: '12px',
    color: 'var(--gray-400)',
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
  filterInput: {
    width: '100%',
    padding: '10px 14px',
    fontSize: '14px',
    fontFamily: 'inherit',
    border: 'none',
    borderBottom: '1px solid var(--gray-200)',
    background: '#FFFFFF',
    color: 'var(--gray-900)',
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
};

// Normalize district names for fuzzy matching between datasets
function normalizeDistrict(name) {
  return name
    .toUpperCase()
    .replace(/\s+DISTRICT$/i, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export default function PincodeLookup() {
  const [pincode, setPincode] = useState('');
  const [focused, setFocused] = useState(false);
  const [showBrowse, setShowBrowse] = useState(false);
  const [stateFilter, setStateFilter] = useState('');
  const [acFilter, setAcFilter] = useState('');
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

  // For Vidhan Sabha: use district-based matching
  // Step 1: Look up full PIN code in pincodeDistricts for precise district
  // Step 2: Fall back to state-level match via Lok Sabha pinRanges
  const vidhanSabhaMatches = useMemo(() => {
    if (pincode.length < 3) return [];

    // Try full 6-digit PIN → district lookup
    if (pincode.length === 6) {
      const pinData = lookupPinDistrict(pincode);
      if (pinData) {
        const normDistrict = normalizeDistrict(pinData.district);
        // Find ACs in this district
        const districtMatches = assemblyConstituencies.filter(c => {
          if (c.state !== pinData.state) return false;
          if (!c.district) return false;
          return normalizeDistrict(c.district) === normDistrict;
        });
        if (districtMatches.length > 0) {
          return districtMatches;
        }
        // If no district match (name mismatch), fall back to state
        return assemblyConstituencies.filter(c => c.state === pinData.state);
      }
    }

    // Fall back: use Lok Sabha match to identify state(s)
    const stateSet = new Set(lokSabhaMatches.map(c => c.state));
    if (stateSet.size === 0) return [];
    return assemblyConstituencies.filter(c => stateSet.has(c.state));
  }, [pincode, lokSabhaMatches]);

  // Is the match district-level (precise) or state-level (broad)?
  const matchInfo = useMemo(() => {
    if (pincode.length === 6) {
      const pinData = lookupPinDistrict(pincode);
      if (pinData) {
        const normDistrict = normalizeDistrict(pinData.district);
        const districtMatches = assemblyConstituencies.filter(c => {
          if (c.state !== pinData.state) return false;
          if (!c.district) return false;
          return normalizeDistrict(c.district) === normDistrict;
        });
        if (districtMatches.length > 0) {
          return { type: 'district', district: pinData.district, state: pinData.state };
        }
        return { type: 'state', state: pinData.state };
      }
    }
    const states = [...new Set(lokSabhaMatches.map(c => c.state))];
    if (states.length > 0) return { type: 'state', state: states.join(', ') };
    return null;
  }, [pincode, lokSabhaMatches]);

  // Filter assembly results by name search
  const filteredVidhanSabha = useMemo(() => {
    if (!acFilter.trim()) return vidhanSabhaMatches;
    const q = acFilter.toLowerCase();
    return vidhanSabhaMatches.filter(c =>
      c.name.toLowerCase().includes(q) ||
      (c.district && c.district.toLowerCase().includes(q))
    );
  }, [vidhanSabhaMatches, acFilter]);

  const matches = isVidhanSabha ? filteredVidhanSabha : lokSabhaMatches;
  const hasResults = isVidhanSabha ? vidhanSabhaMatches.length > 0 : lokSabhaMatches.length > 0;

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

  const groupByDistrict = (list) => {
    const grouped = {};
    list.forEach(c => {
      const key = c.district || c.state;
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(c);
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

  // For Vidhan Sabha with district match, group by district; otherwise group by state
  const grouped = matches.length > 0
    ? (isVidhanSabha && matchInfo?.type === 'district'
        ? groupByDistrict(matches)
        : groupByState(matches))
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
            setAcFilter('');
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
        {isVidhanSabha
          ? 'Enter your full 6-digit PIN code for best results'
          : 'Enter at least 3 digits of your PIN code to find your constituency'}
      </p>

      {pincode.length >= 3 && hasResults && (
        <div style={styles.results} className="fade-in">
          {/* Info bar showing match quality */}
          {isVidhanSabha && vidhanSabhaMatches.length > 0 && (
            <>
              <div style={styles.matchCount}>
                {matchInfo?.type === 'district'
                  ? `Found ${vidhanSabhaMatches.length} constituencies in ${matchInfo.district}, ${matchInfo.state}`
                  : `Found ${vidhanSabhaMatches.length} constituencies in ${matchInfo?.state || 'your area'} — enter full PIN code for better results`
                }
              </div>
              {vidhanSabhaMatches.length > 15 && (
                <input
                  type="text"
                  placeholder="Type to filter by name or district..."
                  value={acFilter}
                  onChange={(e) => setAcFilter(e.target.value)}
                  style={styles.filterInput}
                  autoFocus
                />
              )}
            </>
          )}
          <div style={isVidhanSabha ? styles.resultsList : {}}>
            {Object.entries(grouped).map(([group, items]) => (
              <div key={group}>
                <div style={styles.stateGroup}>
                  {group} ({items.length})
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
                        <div style={styles.resultState}>
                          {c.district && c.district !== group
                            ? `${c.district}, ${c.state}`
                            : c.state}
                        </div>
                      </div>
                    </div>
                    <ChevronRight size={18} color="var(--gray-400)" />
                  </div>
                ))}
              </div>
            ))}
          </div>
          {isVidhanSabha && acFilter && filteredVidhanSabha.length === 0 && (
            <div style={styles.noResults}>
              No constituency matching &quot;{acFilter}&quot;
            </div>
          )}
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
