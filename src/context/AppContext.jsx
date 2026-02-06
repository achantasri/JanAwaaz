import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from './AuthContext';
import {
  subscribeToTopics,
  addTopicToFirestore,
  editTopicInFirestore,
  deleteTopicFromFirestore,
  castVote,
  getUserVotesForConstituency,
  subscribeToVoteCounts,
  checkIsAdmin,
} from '../services/firestoreService';

const AppContext = createContext();

const STORAGE_KEYS = {
  CONSTITUENCY: 'janawaaz_constituency',
  PINCODE: 'janawaaz_pincode',
};

export function AppProvider({ children }) {
  const { user } = useAuth();

  // ─── Local-only state (stays in localStorage) ────────────────
  const [constituency, setConstituency] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CONSTITUENCY);
      return saved ? JSON.parse(saved) : null;
    } catch { return null; }
  });
  const [pincode, setPincode] = useState(() => {
    return localStorage.getItem(STORAGE_KEYS.PINCODE) || '';
  });

  // ─── Firestore-backed state ──────────────────────────────────
  const [topics, setTopics] = useState([]);
  const [userVotes, setUserVotes] = useState({});
  const [voteCounts, setVoteCounts] = useState({});
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(false);

  // Refs for subscription cleanup
  const unsubTopicsRef = useRef(null);
  const unsubVoteCountsRef = useRef(null);

  // ─── Persist local prefs ─────────────────────────────────────
  useEffect(() => {
    if (constituency) {
      localStorage.setItem(STORAGE_KEYS.CONSTITUENCY, JSON.stringify(constituency));
    }
  }, [constituency]);

  useEffect(() => {
    if (pincode) {
      localStorage.setItem(STORAGE_KEYS.PINCODE, pincode);
    }
  }, [pincode]);

  // ─── Admin check on user login ───────────────────────────────
  useEffect(() => {
    if (user?.uid) {
      checkIsAdmin(user.uid).then(setIsAdmin).catch(() => setIsAdmin(false));
    } else {
      setIsAdmin(false);
    }
  }, [user?.uid]);

  // ─── Subscribe to topics when constituency changes ───────────
  useEffect(() => {
    if (unsubTopicsRef.current) {
      unsubTopicsRef.current();
      unsubTopicsRef.current = null;
    }

    if (!constituency?.id) {
      setTopics([]);
      return;
    }

    setLoading(true);
    const unsub = subscribeToTopics(constituency.id, (newTopics) => {
      setTopics(newTopics);
      setLoading(false);
    });
    unsubTopicsRef.current = unsub;

    return () => {
      if (unsubTopicsRef.current) {
        unsubTopicsRef.current();
        unsubTopicsRef.current = null;
      }
    };
  }, [constituency?.id]);

  // ─── Subscribe to vote counts when topics change ─────────────
  useEffect(() => {
    if (unsubVoteCountsRef.current) {
      unsubVoteCountsRef.current();
      unsubVoteCountsRef.current = null;
    }

    if (!constituency?.id || topics.length === 0) {
      setVoteCounts({});
      return;
    }

    const topicIds = topics.map((t) => t.id);
    const unsub = subscribeToVoteCounts(constituency.id, topicIds, (topicId, counts) => {
      setVoteCounts((prev) => ({ ...prev, [topicId]: counts }));
    });
    unsubVoteCountsRef.current = unsub;

    return () => {
      if (unsubVoteCountsRef.current) {
        unsubVoteCountsRef.current();
        unsubVoteCountsRef.current = null;
      }
    };
  }, [constituency?.id, topics]);

  // ─── Fetch user's votes when constituency or user changes ────
  useEffect(() => {
    if (!user?.uid || !constituency?.id) {
      setUserVotes({});
      return;
    }

    getUserVotesForConstituency(user.uid, constituency.id)
      .then(setUserVotes)
      .catch(() => setUserVotes({}));
  }, [user?.uid, constituency?.id]);

  // ─── Public API ──────────────────────────────────────────────

  const selectConstituency = useCallback((c, pin) => {
    setConstituency(c);
    setPincode(pin);
  }, []);

  const clearConstituency = useCallback(() => {
    setConstituency(null);
    setPincode('');
    localStorage.removeItem(STORAGE_KEYS.CONSTITUENCY);
    localStorage.removeItem(STORAGE_KEYS.PINCODE);
  }, []);

  const vote = useCallback(async (topicId, direction) => {
    if (!user) return;
    const previousDirection = userVotes[topicId] || null;

    // Optimistic UI update
    setUserVotes((prev) => {
      const next = { ...prev };
      if (previousDirection === direction) {
        delete next[topicId];
      } else {
        next[topicId] = direction;
      }
      return next;
    });

    setVoteCounts((prev) => {
      const current = prev[topicId] || { up: 0, down: 0 };
      const next = { ...current };
      if (previousDirection) {
        next[previousDirection] = Math.max(0, next[previousDirection] - 1);
      }
      if (previousDirection !== direction) {
        next[direction] = next[direction] + 1;
      }
      return { ...prev, [topicId]: next };
    });

    try {
      await castVote(user.uid, constituency.id, topicId, direction, previousDirection);
    } catch (error) {
      console.error('Vote failed:', error);
      // Revert by re-fetching
      try {
        const freshVotes = await getUserVotesForConstituency(user.uid, constituency.id);
        setUserVotes(freshVotes);
      } catch {
        // Vote counts will self-correct via onSnapshot
      }
    }
  }, [user, constituency, userVotes]);

  const getVote = useCallback((topicId) => {
    if (!constituency || !user) return null;
    return userVotes[topicId] || null;
  }, [constituency, user, userVotes]);

  const getTopicsForConstituency = useCallback((constituencyId) => {
    if (constituency?.id === constituencyId) {
      return topics;
    }
    return [];
  }, [constituency, topics]);

  const addTopic = useCallback(async (constituencyId, topicData) => {
    await addTopicToFirestore(constituencyId, topicData);
  }, []);

  const editTopic = useCallback(async (constituencyId, topicId, updates) => {
    await editTopicInFirestore(topicId, updates);
  }, []);

  const deleteTopic = useCallback(async (constituencyId, topicId) => {
    await deleteTopicFromFirestore(topicId);
  }, []);

  const getVoteCounts = useCallback((topicId) => {
    return voteCounts[topicId] || { up: 0, down: 0 };
  }, [voteCounts]);

  const loginAdmin = useCallback(async (password) => {
    if (password !== 'janawaaz2024') return false;
    if (!user?.uid) return false;
    const adminStatus = await checkIsAdmin(user.uid);
    setIsAdmin(adminStatus);
    return adminStatus;
  }, [user?.uid]);

  const logoutAdmin = useCallback(() => {
    setIsAdmin(false);
  }, []);

  return (
    <AppContext.Provider value={{
      constituency,
      pincode,
      isAdmin,
      loading,
      selectConstituency,
      clearConstituency,
      vote,
      getVote,
      getTopicsForConstituency,
      addTopic,
      editTopic,
      deleteTopic,
      loginAdmin,
      logoutAdmin,
      getVoteCounts,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
}
