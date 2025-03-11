import { collection, getDocs, query } from "firebase/firestore";
import { firestoreDB } from "./authService";

const agroStoreCollection = collection(firestoreDB, "agroStore");
const StoreService = {
  getAll: async () => {
    // check for form completion first before fetch
    // const q = query(ordersCollection, where("form_completion_status", "==", "complete"))
    const q = query(agroStoreCollection)
    const querySnapshot = await getDocs(q);
    const agroStore = [];
    querySnapshot.forEach((doc) => {
      // doc.data() is never undefined for query doc snapshots
      const store = { ...doc.data(), key: doc.id };
      agroStore.push(store)
    });
    return agroStore
  },
}

export default StoreService