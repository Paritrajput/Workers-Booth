import { initializeApp } from "firebase/app";
import {getAuth} from "firebase/auth";
import {getFirestore} from "firebase/firestore";

// const firebaseConfig = {
//   apiKey: "AIzaSyDewC3HgmZVVe6aduDuYp628n-AXxxx2Jw",
//   authDomain: "worker-booth-ce85b.firebaseapp.com",
//   projectId: "worker-booth-ce85b",
//   storageBucket: "worker-booth-ce85b.appspot.com",
//   messagingSenderId: "669020240356",
//   appId: "1:669020240356:web:7e025ea1bb83078d9caff1"
// };
const firebaseConfig = {
  apiKey: "AIzaSyDx9LLa3zrE4aybzYcwzNJ0Wy3qN9hi-FE",
  authDomain: "ajivika-4874b.firebaseapp.com",
  projectId: "ajivika-4874b",
  storageBucket: "ajivika-4874b.firebasestorage.app",
  messagingSenderId: "880549015118",
  appId: "1:880549015118:web:a043d6b4db099600c79d1f",
  measurementId: "G-8X76J5HNW9"
};

const app = initializeApp(firebaseConfig);

export const auth=getAuth();
export const db=getFirestore(app);
export default app;