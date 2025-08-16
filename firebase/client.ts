// Import the functions you need from the SDKs you need
import { initializeApp, getApps } from "firebase/app";
import { Auth, getAuth } from "firebase/auth";
import { FirebaseStorage, getStorage } from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAf4z-ga_jaPMNm8bA0cbMBnfaUG4EDe-0",
  authDomain: "travel-app-c8aa1.firebaseapp.com",
  projectId: "travel-app-c8aa1",
  storageBucket: "travel-app-c8aa1.firebasestorage.app",
  messagingSenderId: "286760824258",
  appId: "1:286760824258:web:88dea9c2874a2ef1effa5b"
};

// Initialize Firebase
const currentApps = getApps();
let auth: Auth;
let storage: FirebaseStorage;

if (!currentApps.length) {
  const app = initializeApp(firebaseConfig)
  auth = getAuth(app);
  storage = getStorage(app);
} else {
  const app = currentApps[0];
  auth = getAuth(app);
  storage = getStorage(app);
}

export { auth, storage };