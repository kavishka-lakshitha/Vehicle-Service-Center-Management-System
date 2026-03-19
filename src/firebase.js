import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyDNcx0ZeQvJJRFc_kBGFnKycQ8bWyotfCs',
  authDomain: 'vs-center.firebaseapp.com',
  projectId: 'vs-center',
  storageBucket: 'vs-center.appspot.com',
  messagingSenderId: '791524580237',
  appId: '1:791524580237:web:21ca46a259a1a911e6bbc4',
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };
