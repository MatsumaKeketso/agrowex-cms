import { getAuth } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { firestoreDB } from "./authService";

const auth = getAuth();

export const ProfileService = {
  getProfile: async (uid) => {
    const docRef = doc(firestoreDB, "agents", uid);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data()
    } else {
      return {}
    }
  },
  updateAccountProfile: (data) => {
    return new Promise((res, rej) => {
      // user
    })
  }
}