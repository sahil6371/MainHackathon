import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: "AIzaSyATaA-yN5OHG9JtuMB8BOUowpDGGKaNaVg",
  authDomain: "nagrik-ai-d73ab.firebaseapp.com",
  projectId: "nagrik-ai-d73ab",
  storageBucket: "nagrik-ai-d73ab.firebasestorage.app",
  messagingSenderId: "45122657702",
  appId: "1:45122657702:web:5e133ae0391d917b2cc367",
  measurementId: "G-YD1YXZWRJL"
}

const app = initializeApp(firebaseConfig)
export const db = getFirestore(app)