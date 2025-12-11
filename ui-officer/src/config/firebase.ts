import { initializeApp, type FirebaseApp } from 'firebase/app';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { getAuth, type Auth } from 'firebase/auth';

// Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyDOMKxcDZA9yFS01vlhkYNszMj1qAV7NlY",
  authDomain: "smart-project2-fb297.firebaseapp.com",
  projectId: "smart-project2-fb297",
  storageBucket: "smart-project2-fb297.firebasestorage.app",
  messagingSenderId: "635644809434",
  appId: "1:635644809434:web:de68b600f9edb4cc5155e3",
  measurementId: "G-RGEV98L69Z"
};

// تهيئة Firebase
const app: FirebaseApp = initializeApp(firebaseConfig);
const db: Firestore = getFirestore(app);
const auth: Auth = getAuth(app);

// تصدير Firestore instance
export { db };

// تصدير Auth instance
export { auth };

export default app;

