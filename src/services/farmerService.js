import { collection, doc, getDoc, getDocs, query, where } from "firebase/firestore";
import { firestoreDB } from "./authService";

const farmerCollection = collection(firestoreDB, "users");

export const FarmerService = {
  uploadDocument: (farm_id, document) => {

  },
  getSingleFarm: async (farm_id) => {
    const docRef = doc(firestoreDB, "users", farm_id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { ...docSnap.data(), farm_id: docSnap.id }
    } else {
      // docSnap.data() will be undefined in this case
      console.log("No such farm!");
    }
  },
  getFarmers: async () => {
    // check for form completion first before fetch
    const q = query(farmerCollection, where("role", "==", "Farmer"))
    const querySnapshot = await getDocs(q);
    const farms = [];
    querySnapshot.forEach((doc) => {
      // doc.data() is never undefined for query doc snapshots
      const offtake = { ...doc.data(), farm_id: doc.id };
      farms.push(offtake)
    });
    return farms
  }
}