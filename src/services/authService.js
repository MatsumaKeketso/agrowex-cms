import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { firebaseConfig } from "../services/fc";
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getDatabase } from "firebase/database";
import { getStorage } from "firebase/storage";
const app = initializeApp(firebaseConfig);
export const firestoreDB = getFirestore(app);
export const realtimeDB = getDatabase()
export const storage = getStorage(app)
const auth = getAuth();
export const AuthService = {
  signin: async (email, password) => {
    return new Promise((res, rej) => {
      signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
          const { user } = userCredential;
          res(user)
        })
        .catch((error) => {
          rej(error)
        });

    })
  },
  getUser: () => {
    return new Promise((res, rej) => {
      onAuthStateChanged(auth, (user) => {
        if (user) {
          res(user)
        } else {
          rej(false)
        }
      });
    })
  },

  signout: () => {
    return new Promise((res, rej) => {
      signOut(auth).then(() => {
        res(true)
      }).catch(err => {
        rej(err)
      })
    })
  }
}