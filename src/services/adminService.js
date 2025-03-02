import { getAuth } from "firebase/auth";
import { firestoreDB } from "./authService"
import { doc, setDoc, updateDoc } from "firebase/firestore";
const auth = getAuth();
export const AdminService = {
  createProfile: (data, uid) => {
    return new Promise(async (res, rej) => {
      try {
        setDoc(doc(firestoreDB, "agents", auth.currentUser.uid), data).then((data) => {
          res(true)
        }).catch(err => {
          console.log(err);
          rej(false)
        })
      } catch (error) {
        rej(error)
      }
      // const docRef = doc(firestoreDB, "agents", auth.currentUser.uid);
      // await updateDoc(docRef, data).then((data) => {
      //   res(true)
      // }).catch(err => {
      //   console.log(err);
      //   rej(false)
      // })
    })
  },
}