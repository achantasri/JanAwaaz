import {
  doc,
  getDoc,
  setDoc,
  deleteDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
  onSnapshot,
  increment,
  serverTimestamp,
  writeBatch,
} from 'firebase/firestore';
import { db } from '../firebase';

// ─── Topics ────────────────────────────────────────────────────

export function subscribeToTopics(constituencyId, callback) {
  const q = query(
    collection(db, 'topics'),
    where('constituencyId', '==', constituencyId)
  );
  return onSnapshot(q, (snapshot) => {
    const topics = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
    topics.sort((a, b) => {
      const aTime = a.createdAt?.toMillis?.() || 0;
      const bTime = b.createdAt?.toMillis?.() || 0;
      return aTime - bTime;
    });
    callback(topics);
  });
}

export async function addTopicToFirestore(constituencyId, topicData) {
  const docRef = doc(collection(db, 'topics'));
  await setDoc(docRef, {
    ...topicData,
    constituencyId,
    createdAt: serverTimestamp(),
  });
  return docRef.id;
}

export async function editTopicInFirestore(topicId, updates) {
  const docRef = doc(db, 'topics', topicId);
  await updateDoc(docRef, updates);
}

export async function deleteTopicFromFirestore(topicId) {
  await deleteDoc(doc(db, 'topics', topicId));
}

// ─── Votes ─────────────────────────────────────────────────────

function voteDocId(uid, constituencyId, topicId) {
  return `${uid}_${constituencyId}_${topicId}`;
}

function voteCountDocId(constituencyId, topicId) {
  return `${constituencyId}_${topicId}`;
}

export async function getUserVotesForConstituency(uid, constituencyId) {
  const q = query(
    collection(db, 'votes'),
    where('uid', '==', uid),
    where('constituencyId', '==', constituencyId)
  );
  const snapshot = await getDocs(q);
  const votes = {};
  snapshot.docs.forEach((d) => {
    const data = d.data();
    votes[data.topicId] = data.direction;
  });
  return votes;
}

export async function castVote(uid, constituencyId, topicId, direction, previousDirection) {
  const batch = writeBatch(db);
  const voteRef = doc(db, 'votes', voteDocId(uid, constituencyId, topicId));
  const countRef = doc(db, 'voteCounts', voteCountDocId(constituencyId, topicId));

  if (previousDirection === direction) {
    // Toggle off: remove vote and decrement count
    batch.delete(voteRef);
    batch.update(countRef, {
      [direction]: increment(-1),
    });
  } else {
    // Set new vote
    batch.set(voteRef, {
      uid,
      constituencyId,
      topicId,
      direction,
      createdAt: serverTimestamp(),
    });

    if (previousDirection) {
      // Switching vote: decrement old, increment new
      batch.set(countRef, {
        constituencyId,
        topicId,
        [direction]: increment(1),
        [previousDirection]: increment(-1),
      }, { merge: true });
    } else {
      // New vote: just increment
      batch.set(countRef, {
        constituencyId,
        topicId,
        [direction]: increment(1),
      }, { merge: true });
    }
  }

  await batch.commit();
}

// ─── Vote Counts (real-time) ───────────────────────────────────

export function subscribeToVoteCounts(constituencyId, topicIds, callback) {
  const unsubscribes = topicIds.map((topicId) => {
    const docRef = doc(db, 'voteCounts', voteCountDocId(constituencyId, topicId));
    return onSnapshot(docRef, (snap) => {
      const data = snap.exists()
        ? { up: snap.data().up || 0, down: snap.data().down || 0 }
        : { up: 0, down: 0 };
      callback(topicId, data);
    });
  });
  return () => unsubscribes.forEach((unsub) => unsub());
}

// ─── Admin check ───────────────────────────────────────────────

export async function checkIsAdmin(uid) {
  const docRef = doc(db, 'admins', uid);
  const snap = await getDoc(docRef);
  return snap.exists();
}
