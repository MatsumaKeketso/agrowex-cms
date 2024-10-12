import { getAuth } from "firebase/auth";
import { doc, getDoc, updateDoc } from "firebase/firestore";
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
  updateAccountProfile: async (data) => {
    const docRef = doc(firestoreDB, "agents", auth.currentUser.uid);
    await updateDoc(docRef, data).then((data) => {
      return (true)
    }).catch(err => {
      console.log(err);

      return false
    })

  }
}