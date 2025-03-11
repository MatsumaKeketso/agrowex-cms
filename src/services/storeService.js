import { collection, getDocs, query } from "firebase/firestore";
import { firestoreDB } from "./authService";

const agroStoreCollection = collection(firestoreDB, "commodities");
const StoreService = {
  getAll: async () => {
    const q = query(agroStoreCollection)
    const querySnapshot = await getDocs(q);
    const agroStore = [];
    querySnapshot.forEach((doc) => {
      const store = { ...doc.data(), key: doc.id };
      agroStore.push(store)
    });
    return agroStore
  },
}

export default StoreService