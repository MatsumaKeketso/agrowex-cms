import { collection, getDocs, query } from "firebase/firestore";
import { firestoreDB, realtimeDB } from "./authService";
import { onValue, ref } from "firebase/database";

const ordersCollection = collection(firestoreDB, "orders");
const OrdersService = {
  getAll: async () => {
    const starCountRef = ref(realtimeDB, 'test_orders_orders');

    // check for form completion first before fetch
    // const q = query(ordersCollection, where("form_completion_status", "==", "complete"))
    // const q = query(ordersCollection)
    // const querySnapshot = await getDocs(q);
    var orders = [];
    onValue(starCountRef, (snapshot) => {
      const data = snapshot.val();
      orders = data
    });
    // querySnapshot.forEach((doc) => {
    //   // doc.data() is never undefined for query doc snapshots
    //   const offtake = { ...doc.data(), offtake_id: doc.id };
    //   if (!offtake.status) {
    //     offtake.push(offtake)
    //   } else {
    //     offtakes.unshift(offtake)
    //   }
    // });orders
    return orders
  },
}

export default OrdersService