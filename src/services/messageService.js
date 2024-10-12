import { collection, doc, getDocs } from "firebase/firestore";
import { firestoreDB } from "./authService"
import { get } from "firebase/database";

export const MessageService = {
  getMessages: async () => {
    const querySnapshot = await getDocs(collection(firestoreDB, "messages"));
    var messages = []
    querySnapshot.forEach((doc) => {
      // doc.data() is never undefined for query doc snapshots
      console.log(doc.id, " => ", doc.data());
      if (doc.data().subject) {
        messages.push({ ...doc.data(), id: doc.id })
      }
    });
    return messages
  },

}
// template: () => {
//   return new Promise((res, rej) => {
//   })
// }