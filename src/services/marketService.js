import { collection, getDocs, query } from "firebase/firestore";
import { firestoreDB } from "./authService";

const marketAvgPricesCollection = collection(firestoreDB, "marketAvgPrices");
const MarketService = {
  getAll: async () => {
    // check for form completion first before fetch
    // const q = query(ordersCollection, where("form_completion_status", "==", "complete"))
    const q = query(marketAvgPricesCollection)
    const querySnapshot = await getDocs(q);
    const marketAvgPrices = [];
    querySnapshot.forEach((doc) => {
      // doc.data() is never undefined for query doc snapshots
      const market = { ...doc.data(), key: doc.id };
      marketAvgPrices.push(market)
    });
    return marketAvgPrices
  },
}

export default MarketService