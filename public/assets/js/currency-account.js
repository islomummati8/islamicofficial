import { getApp, getApps, initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js';
import {
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  getAuth,
  onAuthStateChanged,
  signInWithPopup,
  signInWithEmailAndPassword,
  signOut
} from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js';
import { doc, getDoc, getFirestore, serverTimestamp, setDoc } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js';

const firebaseConfig = {
  apiKey: 'AIzaSyDy9LPiiHgeXY8B6dCu0x-No6Xf__CJIqY',
  authDomain: 'islamicofficial-9279f.firebaseapp.com',
  projectId: 'islamicofficial-9279f',
  storageBucket: 'islamicofficial-9279f.firebasestorage.app',
  messagingSenderId: '251823878076',
  appId: '1:251823878076:web:9eff3e9b8b01f6f827c5b9'
};

export async function connectCurrencyAccount() {
  const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
  const auth = getAuth(app);
  const db = getFirestore(app);
  const provider = new GoogleAuthProvider();

  const user = await new Promise((resolve, reject) => {
    let unsubscribe;
    unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      unsubscribe();
      resolve(currentUser);
    }, reject);
  });

  async function loadPreferences(currentUser) {
    if (!currentUser) return null;
    const snapshot = await getDoc(doc(db, 'userStats', currentUser.uid));
    return snapshot.exists() ? snapshot.data().currencyPreferences || null : null;
  }

  return {
    user,
    loadPreferences: () => loadPreferences(auth.currentUser),
    signIn: async () => {
      const result = await signInWithPopup(auth, provider);
      return { user: result.user };
    },
    signInWithEmail: async (email, password) => {
      const result = await signInWithEmailAndPassword(auth, email, password);
      return { user: result.user };
    },
    registerWithEmail: async (email, password) => {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      return { user: result.user };
    },
    signOut: () => signOut(auth),
    savePreferences: async (preferences) => {
      if (!auth.currentUser) return;
      await setDoc(doc(db, 'userStats', auth.currentUser.uid), {
        currencyPreferences: preferences,
        updatedAt: serverTimestamp()
      }, { merge: true });
    }
  };
}
