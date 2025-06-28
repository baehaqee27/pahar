// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDJWJ9N0PdfYmMYTwf2oYenSm8sNoo8QX0",
  authDomain: "pahar-115c3.firebaseapp.com",
  projectId: "pahar-115c3",
  storageBucket: "pahar-115c3.firebasestorage.app",
  messagingSenderId: "337704887126",
  appId: "1:337704887126:web:1b93027a5597f66da6acf7",
  measurementId: "G-9GHWMQ9XPH",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize analytics only on client side
let analytics;
if (typeof window !== "undefined") {
  analytics = getAnalytics(app);
}

// Initialize Firestore
const db = getFirestore(app);

// Initialize Auth
const auth = getAuth(app);

// Initialize Storage
const storage = getStorage(app);

export { app, analytics, db, auth, storage };
