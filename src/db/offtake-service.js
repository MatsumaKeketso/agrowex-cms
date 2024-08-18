import { arrayRemove, getDoc, getDocs, getFirestore, onSnapshot, query, updateDoc } from "firebase/firestore";
import { collection, doc, setDoc } from "firebase/firestore";

import { useSelector } from "react-redux";
import { firestoreDB, realtimeDB } from "../services/authService";
import { push, ref, set } from "firebase/database";
const offtakesCollection = collection(firestoreDB, "offtakes");

const farms = [
  {
    key: '1',
    name: "Agrowex Test Farm",
    type: "Agroponic Farming",
    contact: {
      phoneNumber: "0726390088",
      email: "0726390088",
    },
    offers: {
      suggestedOffer: 2000,
      requestedOffer: 2500,
      delivered: 500,
    },
    address: "Vaal University Of Technology, Andries Potgieter Blvd., Vereeniging, Gauteng 1939, South Africa",
  },
  {
    key: '2',
    name: "Green Valley Farms",
    type: "Organic Farming",
    contact: {
      phoneNumber: "0734567890",
      email: "info@greenvalley.co.za",
    },
    offers: {
      suggestedOffer: 1500,
      requestedOffer: 1800,
      delivered: 1200,
    },
    address: "Plot 12, Green Valley, Stellenbosch, Western Cape 7600, South Africa",
  },
  {
    key: '3',
    name: "Sunrise Orchards",
    type: "Fruit Farming",
    contact: {
      phoneNumber: "0712345678",
      email: "contact@sunriseorchards.co.za",
    },
    offers: {
      suggestedOffer: 3000,
      requestedOffer: 3200,
      delivered: 2800,
    },
    address: "123 Orchard Lane, Grabouw, Western Cape 7160, South Africa",
  },
  {
    key: '4',
    name: "Blue Sky Dairy",
    type: "Dairy Farming",
    contact: {
      phoneNumber: "0789876543",
      email: "info@blueskydairy.co.za",
    },
    offers: {
      suggestedOffer: 5000,
      requestedOffer: 5200,
      delivered: 4900,
    },
    address: "Farm 24, Blue Sky Road, Kroonstad, Free State 9499, South Africa",
  },
  {
    key: '5',
    name: "Riverbend Vineyard",
    type: "Viticulture",
    contact: {
      phoneNumber: "0798765432",
      email: "sales@riverbendvineyard.co.za",
    },
    offers: {
      suggestedOffer: 4500,
      requestedOffer: 4800,
      delivered: 4300,
    },
    address: "89 Riverbend Road, Franschhoek, Western Cape 7690, South Africa",
  }
];

console.log(farms);

export const OfftakeService = {
  getOfftakes: async () => {
    const q = query(offtakesCollection)
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
  getOfftake: async (offtake_id) => {
    const docRef = doc(firestoreDB, "offtakes", offtake_id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data()
    } else {
      // docSnap.data() will be undefined in this case
      console.log("No such document!");
    }
  },
  /**
   * 
   * @param {*} offtake_id 
   * @param {*} offtake_data 
   */
  updateOfftake: async (offtake_id, offtake_data) => {
    const offtakeRef = doc(firestoreDB, 'offtakes', offtake_id);
    await setDoc(offtakeRef, { ...offtake_data, });
  },
  removeCostingStep: async (offtake_id, stepId) => {
    const offtakeRef = doc(firestoreDB, 'offtakes', offtake_id);

    // Fetch the current document
    const docSnap = await getDoc(offtakeRef);
    if (docSnap.exists()) {
      const currentSteps = docSnap.data().costing.steps;
      const currentSchedule = docSnap.data().schedule.steps;

      // Filter out the step with the matching id
      const updatedSteps = currentSteps.filter(step => step.id !== stepId);
      const updatedSchedule = currentSchedule.filter(step => step.id !== stepId);

      // Update the document with the modified array
      await updateDoc(offtakeRef, {
        'costing.steps': updatedSteps,
        'schedule.steps': updatedSchedule
      });
      const success = {
        message: 'Document updated'
      }
      return success
    } else {
      const error = {
        message: 'Document not found'
      }
      return error
    }
  },
  sendOMMessage: (offtake_id, message) => {
    const offtake = ref(realtimeDB, `published-chat/${offtake_id}`)
    return push(offtake, message)
      .then(() => {
        return 'success';
      })
      .catch((error) => {
        console.error("Error publishing message: ", error);
        return 'failed';
      });
  },
  getFarmSubmissions: async () => {
    return farms
  }
}