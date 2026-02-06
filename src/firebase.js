import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyD97C-dLbgf-LTw6Oe-bpFC0C6rHtfiXM8",
  authDomain: "janawaaz-8e9b2.firebaseapp.com",
  projectId: "janawaaz-8e9b2",
  storageBucket: "janawaaz-8e9b2.firebasestorage.app",
  messagingSenderId: "879223388641",
  appId: "1:879223388641:web:71ef7c3e484095424b3aa0",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
