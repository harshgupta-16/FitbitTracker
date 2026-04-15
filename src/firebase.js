// ─────────────────────────────────────────────────────────────────────────────
//  Firebase + Firestore setup
//  Replace the values below with YOUR Firebase project credentials.
//  Steps to get them:
//    1. Go to https://console.firebase.google.com
//    2. Create a new project (or use an existing one)
//    3. Click ⚙ Project settings → "Your apps" → Web app (</>)
//    4. Register the app, copy the firebaseConfig object here
//    5. In Firestore Database → Create database (start in test mode)
// ─────────────────────────────────────────────────────────────────────────────

import { initializeApp } from 'firebase/app';
import {
  getFirestore, collection,
  addDoc, getDocs, deleteDoc,
  doc, query, orderBy,
} from 'firebase/firestore';

// ← Paste your own config here ↓
const firebaseConfig = {
  apiKey: "AIzaSyDfZo7l6pmuo7rx7gipYaZvNS2vGRzosG0",
  authDomain: "calorie-counter-ce864.firebaseapp.com",
  projectId: "calorie-counter-ce864",
  storageBucket: "calorie-counter-ce864.firebasestorage.app",
  messagingSenderId: "945236974804",
  appId: "1:945236974804:web:a82f75ca8be6dda6832f41",
  measurementId: "G-Z16Z3MWGB8"
};

// Detect placeholder — fall back to localStorage mode so the app still works
export const FIREBASE_CONFIGURED =
  firebaseConfig.apiKey !== "REPLACE_WITH_YOUR_API_KEY";

let app, db;
if (FIREBASE_CONFIGURED) {
  app = initializeApp(firebaseConfig);
  db = getFirestore(app);
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const COL = 'entries';

/** Fetch all entries, sorted oldest → newest */
export async function fetchEntries() {
  if (!FIREBASE_CONFIGURED) return null;          // caller uses localStorage
  const q = query(collection(db, COL), orderBy('date', 'asc'));
  const snap = await getDocs(q);
  const result = { calories: [], protein: [], carbs: [], fats: [] };
  snap.forEach(d => {
    const data = d.data();
    if (result[data.nutrient]) {
      result[data.nutrient].push({ ...data, id: d.id });
    }
  });
  return result;
}

/** Add a single entry document, returns the saved entry with Firestore id */
export async function addEntry(nutrient, entry) {
  if (!FIREBASE_CONFIGURED) return null;
  const docRef = await addDoc(collection(db, COL), { nutrient, ...entry });
  return { ...entry, nutrient, id: docRef.id };
}

/** Delete an entry by Firestore document id */
export async function deleteEntry(id) {
  if (!FIREBASE_CONFIGURED) return;
  await deleteDoc(doc(db, COL, id));
}
