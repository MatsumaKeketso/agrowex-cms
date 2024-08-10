import { arrayRemove, getDoc, getDocs, getFirestore, onSnapshot, query, updateDoc } from "firebase/firestore";
import { collection, doc, setDoc } from "firebase/firestore";

import { useSelector } from "react-redux";
import { firestoreDB } from "../services/authService";
const offtakesCollection = collection(firestoreDB, "offtakes");


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
  }

}