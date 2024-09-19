import { getDoc, getDocs, query, updateDoc } from "firebase/firestore";
import { collection, doc, setDoc } from "firebase/firestore";
import { firestoreDB, realtimeDB } from "./authService";
import { push, ref } from "firebase/database";
import { SystemService } from "./systemService";
import moment from 'moment';
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
export const stableOfttakes = ["AGREF-OF-1726166927085", "AGREF-OF-1726166927086", "AGREF-OF-1726166927087", "AGREF-OF-1726166927088", "AGREF-OF-1726166927089", "AGREF-OF-1726166927090"]
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
      return { ...docSnap.data(), offtake_id: docSnap.id }
    } else {
      // docSnap.data() will be undefined in this case
      console.log("No such document!");
    }
  },
  getOfftakeStatusTracker: async (offtake_id) => {
    const trackersRef = await getDocs(collection(firestoreDB, "offtakes", offtake_id, "status_trackers"));
    const docSnap = await getDoc(trackersRef);
    if (docSnap.exists()) {
      return docSnap.data()
    } else {
      // docSnap.data() will be undefined in this case
      console.log("No such document!");
    }
  },
  getOfftakeDocuments: async (offtake_id) => {
    const q = query(collection(firestoreDB, `/offtakes/${offtake_id}/documents`));

    const querySnapshot = await getDocs(q);
    var d = []
    querySnapshot.forEach((doc) => {
      // doc.data() is never undefined for query doc snapshots
      if (doc.exists()) {
        d.push({ ...doc.data(), id: doc.id })
      } else {
        // docSnap.data() will be undefined in this case
        console.log("No such document!");
      }
    });
    return d

  },
  getOfftakeDeliveries: async (offtake_id) => {
    const trackersRef = await getDocs(collection(firestoreDB, "offtakes", offtake_id, "documents"));
    const docSnap = await getDoc(trackersRef);
    if (docSnap.exists()) {
      return docSnap.data()
    } else {
      // docSnap.data() will be undefined in this case
      console.log("No such document!");
    }
  },
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
  },
  updateContractModel: async (offtake_id, contract_model) => {
    const offtakeRef = doc(firestoreDB, 'offtakes', offtake_id);
    await updateDoc(offtakeRef, { contract_model: contract_model })
  },
  getStatus: {
    Name: (status) => {
      if (status?.length) {
        // should always receive arrya
        const currentStatus = status[status.length - 1].status_name
        return currentStatus
      } else {
        return ''
      }
    },
    UpdatedAt: (status) => {
      if (status?.length) {
        const updatedAt = SystemService.formatTimestamp(status[status.length - 1].updated_at)
        const ago = moment(`${status[status.length - 1].updated_at}`, "YYYYMMDD").fromNow();
        return `${updatedAt} • ${ago}`
      } else {
        return ''
      }

    },
  },
  "_testing": {
    // generateStableOfftakes: async () => {
    //   const stableOfftake = {
    //     "weight": 123,
    //     "quantity": "123",
    //     "payment_instrument": "EFT",
    //     "_commodity_details": {
    //       "quantity": "123",
    //       "weight": 123,
    //       "packaging": "Rigid Plastic Containers",
    //       "matrix": "Litres"
    //     },
    //     "_address": {
    //       "province": "South Africa",
    //       "place_name": "Johannesburg Rd, Lyndhurst, Johannesburg, South Africa",
    //       "region": "City of Johannesburg Metropolitan Municipality",
    //       "coords": {
    //         "lng": 28.0995098,
    //         "lat": -26.131242
    //       },
    //       "street_address": "Johannesburg Road Lyndhurst Johannesburg",
    //       "country": "South Africa",
    //       "alias_name": "My Farm",
    //       "city": "Gauteng"
    //     },
    //     "packaging": "Rigid Plastic Containers",
    //     "start_date": "",
    //     "category_type": "Contract",
    //     "production_method": "Vertical Farm",
    //     "commodity_name": "Broccoli",
    //     "address": "Johannesburg Road Lyndhurst Johannesburg",
    //     "contract": "instrument2",
    //     "form_completion_status": "incomplete",
    //     "input_investment": "Yes",
    //     "created_at": 1726167034357,
    //     "title": "Agrowex Offtake",
    //     "country": "south_africa",
    //     "_commodity_meta": {
    //       "product_id": null,
    //       "description": "Broccoli is a cruciferous vegetable belonging to the Brassica genus, which also includes cabbage, kale, cauliflower, and Brussels sprouts. It has a green, tree-like appearance with a thick stem and florets resembling tiny trees. The florets are packed with nutrients and have a mild, slightly bitter flavor. Broccoli is often eaten raw or cooked, and its versatility makes it a popular addition to various dishes, from salads to stir-fries.",
    //       "id": 66,
    //       "order": "Brassicales",
    //       "nutritions": [
    //         {
    //           "value": "55",
    //           "matrix": "",
    //           "type": "Calories"
    //         },
    //         {
    //           "value": "11.2",
    //           "type": "Carbohydrates",
    //           "matrix": "g"
    //         },
    //         {
    //           "value": "5.1",
    //           "type": "Fiber",
    //           "matrix": "g"
    //         },
    //         {
    //           "matrix": "ml",
    //           "value": "89.2",
    //           "type": "Vitamin C"
    //         }
    //       ],
    //       "created_at": "2023-06-24T05:32:26.397602+00:00",
    //       "family": "Brassicaceae",
    //       "name": "Broccoli",
    //       "img": "https://imgs.search.brave.com/0Nf5nOO10_avzwgJrcDFAqBG0ZpiHlCBD2pqARfnMio/rs:fit:500:0:0:0/g:ce/aHR0cHM6Ly93d3cu/cG5nYWxsLmNvbS93/cC1jb250ZW50L3Vw/bG9hZHMvMjAxNi8w/NS9Ccm9jY29saS1U/cmFuc3BhcmVudC5w/bmc",
    //       "user_id": null,
    //       "genus": "Brassica"
    //     },
    //     "delivery_frequency": "weekly",
    //     "supply_duration": "duration2",
    //     "position": "Quality Assurance Manager",
    //     "uid": "rOWxkYtsuxWrv1aFCosbndFTCkH2",
    //     "reference_id": "AGREF-OF-1726166927085",
    //     "end_date": "",
    //     "_price_details": {
    //       "service_fee": 2472.2999999999997,
    //       "final_price": 18954.3,
    //       "price_per_unit": 134,
    //       "origin_price": 16482
    //     },
    //     "offer_price_per_unit": 134,
    //     "unit": "Litres",
    //     "quality_grade": "Grade C",
    //     "pricing_option": "Other",
    //     "payment_terms": "instrument1",
    //     "offtake_id": "AGREF-OF-1726166927085"
    //   }
    //   const documents = [
    //     {
    //       "name": "product_specifications",
    //       "created_at": 1726167047982,
    //       "file_url": "https://firebasestorage.googleapis.com/v0/b/agrowex.appspot.com/o/pdfs%2Fproduct_specifications%2FPurchase%20Order%20Quote%20-%201652411572535.pdf?alt=media&token=e14c4406-a965-4843-8476-5d881022d622",
    //       "doc_id": "VIMT4oL262FwhutoGWZh"
    //     },
    //     {
    //       "created_at": 1726167059635,
    //       "name": "proof_of_payment",
    //       "file_url": "https://firebasestorage.googleapis.com/v0/b/agrowex.appspot.com/o/pdfs%2Fproof_of_payment%2FPurchase%20Order%20Quote%20-%201652411572535.pdf?alt=media&token=686d19c6-23d6-44cb-a144-883f94674f09",
    //       "doc_id": "fcofFxbPc5kYM5ZxMzrM"
    //     },
    //     {
    //       "created_at": 1726167064605,
    //       "name": "letter_of_intent",
    //       "file_url": "https://firebasestorage.googleapis.com/v0/b/agrowex.appspot.com/o/pdfs%2Fletter_of_intent%2FPurchase%20Order%20Quote%20-%201652411572535.pdf?alt=media&token=384d73c2-49fe-422b-a410-e82ef9176426",
    //       "doc_id": "rsDD6nET7cX1FpHdmPvP"
    //     },
    //     {
    //       "file_url": "https://firebasestorage.googleapis.com/v0/b/agrowex.appspot.com/o/pdfs%2Fid_copy%2FPurchase%20Order%20Quote%20-%201652411572535.pdf?alt=media&token=7cedea93-d093-4e28-a0c6-5c456186ddc7",
    //       "name": "id_copy",
    //       "created_at": 1726167053819,
    //       "doc_id": "w1uEwd1k4x8oKvfTkBpR"
    //     }
    //   ];

    //   // create offtakes
    //   stableOfttakes.forEach(async id => {

    //   })
    //   // create documents
    // },
    generateStableOfftakes: async () => {
      const stableOfftake = {
        "weight": 123,
        "quantity": "123",
        "payment_instrument": "EFT",
        "_commodity_details": {
          "quantity": "123",
          "weight": 123,
          "packaging": "Rigid Plastic Containers",
          "matrix": "Litres"
        },
        "_address": {
          "province": "South Africa",
          "place_name": "Johannesburg Rd, Lyndhurst, Johannesburg, South Africa",
          "region": "City of Johannesburg Metropolitan Municipality",
          "coords": {
            "lng": 28.0995098,
            "lat": -26.131242
          },
          "street_address": "Johannesburg Road Lyndhurst Johannesburg",
          "country": "South Africa",
          "alias_name": "My Farm",
          "city": "Gauteng"
        },
        "packaging": "Rigid Plastic Containers",
        "start_date": "",
        "category_type": "Contract",
        "production_method": "Vertical Farm",
        "commodity_name": "Broccoli",
        "address": "Johannesburg Road Lyndhurst Johannesburg",
        "contract": "instrument2",
        "form_completion_status": "incomplete",
        "input_investment": "Yes",
        "created_at": 1726167034357,
        "title": "Agrowex Offtake",
        "country": "south_africa",
        "_commodity_meta": {
          "product_id": null,
          "description": "Broccoli is a cruciferous vegetable belonging to the Brassica genus, which also includes cabbage, kale, cauliflower, and Brussels sprouts. It has a green, tree-like appearance with a thick stem and florets resembling tiny trees. The florets are packed with nutrients and have a mild, slightly bitter flavor. Broccoli is often eaten raw or cooked, and its versatility makes it a popular addition to various dishes, from salads to stir-fries.",
          "id": 66,
          "order": "Brassicales",
          "nutritions": [
            {
              "value": "55",
              "matrix": "",
              "type": "Calories"
            },
            {
              "value": "11.2",
              "type": "Carbohydrates",
              "matrix": "g"
            },
            {
              "value": "5.1",
              "type": "Fiber",
              "matrix": "g"
            },
            {
              "matrix": "ml",
              "value": "89.2",
              "type": "Vitamin C"
            }
          ],
          "created_at": "2023-06-24T05:32:26.397602+00:00",
          "family": "Brassicaceae",
          "name": "Broccoli",
          "img": "https://imgs.search.brave.com/0Nf5nOO10_avzwgJrcDFAqBG0ZpiHlCBD2pqARfnMio/rs:fit:500:0:0:0/g:ce/aHR0cHM6Ly93d3cu/cG5nYWxsLmNvbS93/cC1jb250ZW50L3Vw/bG9hZHMvMjAxNi8w/NS9Ccm9jY29saS1U/cmFuc3BhcmVudC5w/bmc",
          "user_id": null,
          "genus": "Brassica"
        },
        "delivery_frequency": "weekly",
        "supply_duration": "duration2",
        "position": "Quality Assurance Manager",
        "uid": "rOWxkYtsuxWrv1aFCosbndFTCkH2",
        "reference_id": "AGREF-OF-1726166927085",
        "end_date": "",
        "_price_details": {
          "service_fee": 2472.2999999999997,
          "final_price": 18954.3,
          "price_per_unit": 134,
          "origin_price": 16482
        },
        "offer_price_per_unit": 134,
        "unit": "Litres",
        "quality_grade": "Grade C",
        "pricing_option": "Other",
        "payment_terms": "instrument1",
        "offtake_id": "AGREF-OF-1726166927085"
      }

      const documents = [
        {
          "name": "product_specifications",
          "created_at": 1726167047982,
          "file_url": "https://firebasestorage.googleapis.com/v0/b/agrowex.appspot.com/o/pdfs%2Fproduct_specifications%2FPurchase%20Order%20Quote%20-%201652411572535.pdf?alt=media&token=e14c4406-a965-4843-8476-5d881022d622",
          "doc_id": "VIMT4oL262FwhutoGWZh"
        },
        {
          "created_at": 1726167059635,
          "name": "proof_of_payment",
          "file_url": "https://firebasestorage.googleapis.com/v0/b/agrowex.appspot.com/o/pdfs%2Fproof_of_payment%2FPurchase%20Order%20Quote%20-%201652411572535.pdf?alt=media&token=686d19c6-23d6-44cb-a144-883f94674f09",
          "doc_id": "fcofFxbPc5kYM5ZxMzrM"
        },
        {
          "created_at": 1726167064605,
          "name": "letter_of_intent",
          "file_url": "https://firebasestorage.googleapis.com/v0/b/agrowex.appspot.com/o/pdfs%2Fletter_of_intent%2FPurchase%20Order%20Quote%20-%201652411572535.pdf?alt=media&token=384d73c2-49fe-422b-a410-e82ef9176426",
          "doc_id": "rsDD6nET7cX1FpHdmPvP"
        },
        {
          "file_url": "https://firebasestorage.googleapis.com/v0/b/agrowex.appspot.com/o/pdfs%2Fid_copy%2FPurchase%20Order%20Quote%20-%201652411572535.pdf?alt=media&token=7cedea93-d093-4e28-a0c6-5c456186ddc7",
          "name": "id_copy",
          "created_at": 1726167053819,
          "doc_id": "w1uEwd1k4x8oKvfTkBpR"
        }
      ];

      // Create offtakes and their document subcollections
      for (const offtake_id of stableOfttakes) {
        try {
          // Create the main offtake document
          const offtakeRef = doc(offtakesCollection, offtake_id);
          await setDoc(offtakeRef, {
            ...stableOfftake,
            offtake_id: offtake_id,
            created_at: moment().valueOf() // Use current timestamp
          });

          console.log(`Created offtake: ${offtake_id}`);

          // Create the documents subcollection for this offtake
          const documentsCollectionRef = collection(offtakeRef, 'documents');
          for (const document of documents) {
            const docRef = doc(documentsCollectionRef);
            await setDoc(docRef, {
              ...document,
              created_at: moment().valueOf() // Use current timestamp
            });
            console.log(`Created document ${document.name} for offtake: ${offtake_id}`);
          }
        } catch (error) {
          console.error(`Error creating offtake ${offtake_id}:`, error);
        }
      }

      console.log("Finished generating stable offtakes and their documents.");
    }
  }
}