import constituencies from '../data/constituencies';
import assemblyConstituencies from '../data/assemblyConstituencies';

export const CONSTITUENCY_TYPES = {
  LOK_SABHA: 'LOK_SABHA',
  VIDHAN_SABHA: 'VIDHAN_SABHA',
};

/**
 * Detect constituency type from its ID.
 * Assembly IDs contain "-AC-" (e.g. "AP-AC-001"), Lok Sabha IDs don't (e.g. "AP-01").
 */
export function getConstituencyType(id) {
  if (!id) return CONSTITUENCY_TYPES.LOK_SABHA;
  return id.includes('-AC-')
    ? CONSTITUENCY_TYPES.VIDHAN_SABHA
    : CONSTITUENCY_TYPES.LOK_SABHA;
}

/**
 * Human-readable label for a constituency type.
 */
export function getTypeLabel(type) {
  return type === CONSTITUENCY_TYPES.VIDHAN_SABHA ? 'Vidhan Sabha' : 'Lok Sabha';
}

/**
 * Return the correct dataset array for a given type.
 */
export function getDatasetForType(type) {
  return type === CONSTITUENCY_TYPES.VIDHAN_SABHA
    ? assemblyConstituencies
    : constituencies;
}

/**
 * Find a constituency by ID across both datasets.
 */
export function findConstituencyById(id) {
  if (!id) return null;
  const type = getConstituencyType(id);
  const dataset = getDatasetForType(type);
  return dataset.find(c => c.id === id) || null;
}
