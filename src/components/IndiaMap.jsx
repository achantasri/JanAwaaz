import { useState, useMemo } from 'react';
import indiaMapPaths from '../data/indiaMapPaths';
import constituencies from '../data/constituencies';

const styles = {
  container: {
    position: 'relative',
    width: '100%',
    maxWidth: '460px',
    margin: '0 auto',
  },
  tooltip: {
    position: 'absolute',
    background: 'var(--gray-800)',
    color: '#FFFFFF',
    padding: '8px 14px',
    borderRadius: 'var(--radius-sm)',
    fontSize: '13px',
    fontWeight: '500',
    pointerEvents: 'none',
    transform: 'translate(-50%, -110%)',
    whiteSpace: 'nowrap',
    boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
    zIndex: 10,
  },
  tooltipCount: {
    fontSize: '11px',
    color: 'var(--gray-300)',
    marginTop: '2px',
  },
  tooltipArrow: {
    position: 'absolute',
    bottom: '-6px',
    left: '50%',
    transform: 'translateX(-50%)',
    width: 0,
    height: 0,
    borderLeft: '6px solid transparent',
    borderRight: '6px solid transparent',
    borderTop: '6px solid var(--gray-800)',
  },
};

const VIEW_BOX_W = 600;
const VIEW_BOX_H = 580;

export default function IndiaMap({ onStateSelect, selectedState }) {
  const [hoveredState, setHoveredState] = useState(null);

  const countByState = useMemo(() => {
    const map = {};
    constituencies.forEach(c => {
      map[c.state] = (map[c.state] || 0) + 1;
    });
    return map;
  }, []);

  const hoveredData = hoveredState
    ? indiaMapPaths.find(s => s.name === hoveredState)
    : null;

  return (
    <div style={styles.container}>
      <svg
        viewBox={`0 0 ${VIEW_BOX_W} ${VIEW_BOX_H}`}
        style={{ width: '100%', height: 'auto', display: 'block' }}
        role="img"
        aria-label="Interactive map of India showing states and union territories"
      >
        {indiaMapPaths.map(state => {
          const isHovered = hoveredState === state.name;
          const isSelected = selectedState === state.name;
          const count = countByState[state.name] || 0;

          let fill = '#E8F5E3';
          if (isSelected) fill = '#FF9933';
          else if (isHovered) fill = '#FFD9B3';

          return (
            <path
              key={state.name}
              d={state.path}
              fill={fill}
              stroke={isSelected ? '#E6872E' : '#138808'}
              strokeWidth={isHovered || isSelected ? 2 : 1}
              style={{ cursor: 'pointer', transition: 'fill 0.15s, stroke-width 0.15s' }}
              onMouseEnter={() => setHoveredState(state.name)}
              onMouseLeave={() => setHoveredState(null)}
              onClick={() => onStateSelect(state.name === selectedState ? null : state.name)}
              role="button"
              tabIndex={0}
              aria-label={`${state.name}, ${count} constituencies`}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onStateSelect(state.name === selectedState ? null : state.name);
                }
              }}
            />
          );
        })}
      </svg>

      {hoveredData && (
        <div
          style={{
            ...styles.tooltip,
            left: `${(hoveredData.labelX / VIEW_BOX_W) * 100}%`,
            top: `${(hoveredData.labelY / VIEW_BOX_H) * 100}%`,
          }}
        >
          <div>{hoveredData.name}</div>
          <div style={styles.tooltipCount}>
            {countByState[hoveredData.name] || 0} constituencies
          </div>
          <div style={styles.tooltipArrow} />
        </div>
      )}
    </div>
  );
}
