import { serverTimestamp, doc, setDoc } from "firebase/firestore";
import { firestoreDB, realtimeDB } from "./authService";
import { child, get, onValue, push, ref, set } from "firebase/database";
export const convertTimestampToDateString = (timestamp) => {
  const date = new Date(timestamp.seconds * 1000 + timestamp.nanoseconds / 1000000);
  return date.toLocaleString('en-US', { month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true });
}
export const createCurrentTimestamp = () => {
  return {
    seconds: Math.floor(Date.now() / 1000),
    nanoseconds: (Date.now() % 1000) * 1000000
  };
}
export const ChatService = {
  sendMessage: async (message, offtake_id) => {
    // negotiations
    push(ref(realtimeDB, `chat/${offtake_id}/`), message);
  },
  sendPlanningMessage: async (message, offtake_id) => {
    // planning
    push(ref(realtimeDB, `chat/${offtake_id}/`), message);
  },
  sendPublishedMessage: async (message, offtake_id) => {
    // 
    push(ref(realtimeDB, `chat/${offtake_id}/`), message);
  },
  getMessages: (offtake_id) => {
    return new Promise((res, rej) => {
      get(child(realtimeDB, `chat/${offtake_id}/`)).then((snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.val();
          const messages = []
          Object.keys(data).forEach(key => {
            messages.push({ id: key, ...data[key], timestamp: convertTimestampToDateString(data[key].timestamp) })
          })
          res(messages)
        } else {
          res([])
        }
      }).catch((error) => {
        rej(error)
        console.error(error);
      });
    })

  }

}