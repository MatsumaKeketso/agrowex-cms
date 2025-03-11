import { collection, getDocs, query } from "firebase/firestore";
import { firestoreDB } from "./authService";

const ordersCollection = collection(firestoreDB, "products");
const ProductsService = {
  getAll: async () => {
    // check for form completion first before fetch
    // const q = query(ordersCollection, where("form_completion_status", "==", "complete"))
    const q = query(ordersCollection)
    const querySnapshot = await getDocs(q);
    const offtakes = [];
    querySnapshot.forEach((doc) => {
      // doc.data() is never undefined for query doc snapshots
      const offtake = { ...doc.data(), offtake_id: doc.id };
      if (!offtake.status) {
        offtakes.push(offtake)
      } else {
        offtakes.unshift(offtake)
      }
    });
    return offtakes
  },
}

export default ProductsService