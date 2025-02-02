import { addDoc, collection, doc, getDoc, getDocs, query, where } from "firebase/firestore";
import { firestoreDB, storage } from "./authService";
import { push, ref } from "firebase/database";

const farmerCollection = collection(firestoreDB, "users");

export const FarmerService = {
  addDocument: async (farm_id, document) => {
    try {
      const farmerDocumentsRef = collection(firestoreDB, 'users', farm_id, '_documents');
      const docRef = await addDoc(farmerDocumentsRef, document);
      return docRef.id
    } catch (error) {
      console.log(error)
      return []
    }
  },
  getFarmDocuments: async (farm_id) => {
    const querySnapshot = await getDocs(collection(firestoreDB, "users", farm_id, "_documents"));
    const documents = [];
    querySnapshot.forEach((doc) => {
      // doc.data() is never undefined for query doc snapshots
      const document = { ...doc.data(), document_id: doc.id };
      documents.push(document)
    });
    return documents
  },
  getFarmAddress: async (farm_id) => {
    // const addressesRef = collection(firestoreDB, "users", farm_id, "addresses");
    // const q = query(addressesRef, where("is_use", "==", true));
    // const q = query();
    const querySnapshot = await getDocs(collection(firestoreDB, "users", farm_id, "addresses"));

    // const querySnapshot = await getDocs(collection(db, "cities", "SF", "landmarks"));

    if (querySnapshot.size !== 0) {
      let address = {};
      querySnapshot.forEach((doc) => {
        if (doc.data().is_use) {
          // doc.data() is never undefined for query doc snapshots
          address = { ...doc.data(), address_id: doc.id };
        }
      });
      return address
    } else {
      // docSnap.data() will be undefined in this case
      console.log("No such Address!");
    }
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