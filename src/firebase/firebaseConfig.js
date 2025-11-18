import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore"; 

const firebaseConfig = {
  apiKey: "AIzaSyC51jtxbRU0uqhQHnJ2GwiolY2ds_opdII",
  authDomain: "propanogo.firebaseapp.com",
  projectId: "propanogo",
  storageBucket: "propanogo.firebasestorage.app",
  messagingSenderId: "930034133608",
  appId: "1:930034133608:web:ff58e8fbf4c35134bd29dd"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const firestore = getFirestore(app); 
