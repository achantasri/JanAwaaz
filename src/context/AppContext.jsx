import { createContext, useContext, useState, useEffect } from 'react';

const AppContext = createContext();

const STORAGE_KEYS = {
  CONSTITUENCY: 'janawaaz_constituency',
  PINCODE: 'janawaaz_pincode',
  VOTES: 'janawaaz_votes',
  VOTE_COUNTS: 'janawaaz_vote_counts',
  TOPICS: 'janawaaz_topics',
  ADMIN_AUTH: 'janawaaz_admin_auth',
};

const ADMIN_PASSWORD = 'janawaaz2024';

export function AppProvider({ children }) {
  const [constituency, setConstituency] = useState(null);
  const [pincode, setPincode] = useState('');
  const [votes, setVotes] = useState({});
  const [voteCounts, setVoteCounts] = useState({});
  const [topics, setTopics] = useState({});
  const [isAdmin, setIsAdmin] = useState(false);

  // Load persisted state on mount
  useEffect(() => {
    try {
      const savedConstituency = localStorage.getItem(STORAGE_KEYS.CONSTITUENCY);
      const savedPincode = localStorage.getItem(STORAGE_KEYS.PINCODE);
      const savedVotes = localStorage.getItem(STORAGE_KEYS.VOTES);
      const savedTopics = localStorage.getItem(STORAGE_KEYS.TOPICS);
      const savedAdmin = sessionStorage.getItem(STORAGE_KEYS.ADMIN_AUTH);

      if (savedConstituency) setConstituency(JSON.parse(savedConstituency));
      if (savedPincode) setPincode(savedPincode);
      if (savedVotes) setVotes(JSON.parse(savedVotes));
      const savedVoteCounts = localStorage.getItem(STORAGE_KEYS.VOTE_COUNTS);
      if (savedVoteCounts) setVoteCounts(JSON.parse(savedVoteCounts));
      if (savedTopics) setTopics(JSON.parse(savedTopics));
      if (savedAdmin === 'true') setIsAdmin(true);
    } catch {
      // Ignore parse errors
    }
  }, []);

  // Persist constituency
  useEffect(() => {
    if (constituency) {
      localStorage.setItem(STORAGE_KEYS.CONSTITUENCY, JSON.stringify(constituency));
    }
  }, [constituency]);

  // Persist pincode
  useEffect(() => {
    if (pincode) {
      localStorage.setItem(STORAGE_KEYS.PINCODE, pincode);
    }
  }, [pincode]);

  // Persist votes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.VOTES, JSON.stringify(votes));
  }, [votes]);

  // Persist vote counts
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.VOTE_COUNTS, JSON.stringify(voteCounts));
  }, [voteCounts]);

  // Persist topics
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.TOPICS, JSON.stringify(topics));
  }, [topics]);

  const selectConstituency = (c, pin) => {
    setConstituency(c);
    setPincode(pin);
  };

  const clearConstituency = () => {
    setConstituency(null);
    setPincode('');
    localStorage.removeItem(STORAGE_KEYS.CONSTITUENCY);
    localStorage.removeItem(STORAGE_KEYS.PINCODE);
  };

  const vote = (topicId, direction) => {
    const key = `${constituency.id}_${topicId}`;
    const currentVote = votes[key];
    const countsKey = key;
    const counts = voteCounts[countsKey] || { up: 0, down: 0 };
    const newCounts = { ...counts };

    // Remove previous vote from counts
    if (currentVote) {
      newCounts[currentVote] = Math.max(0, newCounts[currentVote] - 1);
    }

    const newVotes = { ...votes };
    if (currentVote === direction) {
      // Toggle off
      delete newVotes[key];
    } else {
      // Set new vote and add to counts
      newVotes[key] = direction;
      newCounts[direction] = newCounts[direction] + 1;
    }

    setVotes(newVotes);
    setVoteCounts({ ...voteCounts, [countsKey]: newCounts });
  };

  const getVote = (topicId) => {
    if (!constituency) return null;
    return votes[`${constituency.id}_${topicId}`] || null;
  };

  const getTopicsForConstituency = (constituencyId) => {
    return topics[constituencyId] || [];
  };

  const addTopic = (constituencyId, topic) => {
    const current = topics[constituencyId] || [];
    const newTopic = {
      ...topic,
      id: `topic_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      createdAt: new Date().toISOString(),
    };
    setTopics({ ...topics, [constituencyId]: [...current, newTopic] });
  };

  const editTopic = (constituencyId, topicId, updates) => {
    const current = topics[constituencyId] || [];
    setTopics({
      ...topics,
      [constituencyId]: current.map(t => t.id === topicId ? { ...t, ...updates } : t),
    });
  };

  const deleteTopic = (constituencyId, topicId) => {
    const current = topics[constituencyId] || [];
    setTopics({
      ...topics,
      [constituencyId]: current.filter(t => t.id !== topicId),
    });
  };

  const loginAdmin = (password) => {
    if (password === ADMIN_PASSWORD) {
      setIsAdmin(true);
      sessionStorage.setItem(STORAGE_KEYS.ADMIN_AUTH, 'true');
      return true;
    }
    return false;
  };

  const logoutAdmin = () => {
    setIsAdmin(false);
    sessionStorage.removeItem(STORAGE_KEYS.ADMIN_AUTH);
  };

  const getVoteCounts = (topicId) => {
    if (!constituency) return { up: 0, down: 0 };
    const key = `${constituency.id}_${topicId}`;
    return voteCounts[key] || { up: 0, down: 0 };
  };

  return (
    <AppContext.Provider value={{
      constituency,
      pincode,
      isAdmin,
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
