import { collection, CollectionReference, doc, getDoc, getDocs, query, setDoc, where } from "firebase/firestore";
import { firestoreDB } from "./authService";

export const AgentService = {
  getAgentProfiles: async () => {
    const q = query(collection(firestoreDB, "agents"),  where("role", "!=", "driver"), where("approved", "==", true));

    const querySnapshot = await getDocs(q);
    const agents = []
    if (querySnapshot.empty) { return [] } else {
      querySnapshot.forEach((doc) => {
        // doc.data() is never undefined for query doc snapshots
        console.log(doc.id, " => ",);
        agents.push({ ...doc.data(), key: doc.id })
      });
      return agents
    }

  },
  getPendingAgentProfiles: async () => {
    const q = query(collection(firestoreDB, "agents"),  where("role", "!=", "driver"), where("approved", "==", false));

    const querySnapshot = await getDocs(q);
    const agents = []
    if (querySnapshot.empty) { return [] } else {
      querySnapshot.forEach((doc) => {
        // doc.data() is never undefined for query doc snapshots
        console.log(doc.id, " => ",);
        agents.push({ ...doc.data(), key: doc.id })
      });
      return agents
    }

  },
  getAgentProfile: async (uid) => {
    const docRef = doc(firestoreDB, "agents", uid);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return { ...docSnap.data(), key: docSnap.id }
    } else {
      // docSnap.data() will be undefined in this case
      console.log("No such document!");
    }
  },
  updateAgentProfile: async (uid, profile_data) => {
    try {
      await setDoc(doc(firestoreDB, "agents", uid), profile_data);
      console.log('Profile updated');
    } catch (error) {
      console.log(error);
    }
  },
  approveAgentProfile: async (uid) => {
    try {
      await setDoc(doc(firestoreDB, "agents", uid), { approved: true }, { merge: true });
      console.log('Profile approved');
    } catch (error) {
      console.log(error);
    }
  },
  getAgentsByRole: async (role) => {
    const q = query(collection(firestoreDB, "agents"), where("role", "==", role));

    const querySnapshot = await getDocs(q);
    const agents = []
    if (querySnapshot.empty) { return [] } else {
      querySnapshot.forEach((doc) => {
        // doc.data() is never undefined for query doc snapshots
        console.log(doc.id, " => ",);
        agents.push({ ...doc.data(), key: doc.id })
      });
      return agents
    }

  }
}