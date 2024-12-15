import { addDoc, deleteDoc, getDoc, getDocs, query, updateDoc, where } from "firebase/firestore";
import { collection, doc, setDoc } from "firebase/firestore";
import { firestoreDB, realtimeDB } from "./authService";
import { get, push, ref, remove } from "firebase/database";
import { SystemService } from "./systemService";
import moment from 'moment';
import { FarmerService } from "./farmerService";
const pdfMake = require('pdfmake/build/pdfmake');
const pdfFonts = require('pdfmake/build/vfs_fonts');
const offtakesCollection = collection(firestoreDB, "offtakes");
const agentsCollection = collection(firestoreDB, "agents");
pdfMake.vfs = pdfFonts.pdfMake.vfs;
export const stableOfttakes = ["AGREF-OF-1726166927085", "AGREF-OF-1726166927086", "AGREF-OF-1726166927087", "AGREF-OF-1726166927088", "AGREF-OF-1726166927089", "AGREF-OF-1726166927090"]
export const OfftakeService = {
  getOfftakes: async () => {
    // check for form completion first before fetch
    const q = query(offtakesCollection, where("form_completion_status", "==", "complete"))

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
  getUserProfile: async (uid) => {
    const docRef = doc(firestoreDB, "users", uid);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data()
    } else {
      // docSnap.data() will be undefined in this case
      console.log("No such document!");
    }
  },
  generateProductionPDF: async (data, offtake) => {

    const docDefinition = {
      content: [],
      styles: {
        header: {
          fontSize: 16,
          bold: true,
          margin: [0, 0, 0, 10]
        },
        page_header: {
          fontSize: 18,
          bold: true,
          margin: [0, 0, 0, 10]
        },
        description: {
          fontSize: 12,
          margin: [0, 0, 0, 20]
        }
      }
    };
    docDefinition.content.push(
      { text: `Offtake Production Plan`, style: 'page_header' },
      { text: offtake.offtake_id, style: 'description' });
    data.forEach((item, index) => {
      // Add a page break before each new item, except the first one
      if (index > 0) {
        docDefinition.content.push({ text: '      ' });
      }

      docDefinition.content.push(
        { text: item.name, style: 'header' },
        { text: item.description, style: 'description' },
        {
          table: {
            headerRows: 1,
            widths: ['*', '*', '*', '*'],
            body: [
              ['Step', 'Duration', 'Costing Item', 'Amount']
            ]
          }
        }
      );

      let totalAmount = 0;

      item._steps.forEach(step => {
        const startDate = moment(step.duration[0]).format('DD MMM, YYYY');
        const endDate = moment(step.duration[1]).format('DD MMM, YYYY');
        const duration = `${startDate} - ${endDate}`;

        step._costing.forEach(costing => {
          docDefinition.content[docDefinition.content.length - 1].table.body.push([
            step.name,
            duration,
            costing.name,
            `R${costing.amount}`
          ]);
          totalAmount += parseInt(costing.amount);
        });
      });

      // Add total row
      docDefinition.content[docDefinition.content.length - 1].table.body.push([
        'Total', '', '', `R${totalAmount}`
      ]);

      // Apply styles to the table
      docDefinition.content[docDefinition.content.length - 1].layout = {
        hLineWidth: function (i, node) {
          return (i === 0 || i === node.table.body.length) ? 2 : 1;
        },
        vLineWidth: function (i, node) {
          return (i === 0 || i === node.table.widths.length) ? 2 : 1;
        },
        hLineColor: function (i, node) {
          return (i === 0 || i === node.table.body.length) ? 'black' : 'gray';
        },
        vLineColor: function (i, node) {
          return (i === 0 || i === node.table.widths.length) ? 'black' : 'gray';
        },
        fillColor: function (rowIndex, node, columnIndex) {
          return (rowIndex === 0) ? '#CCCCCC' : null;
        }
      };
    });

    // Generate PDF
    pdfMake.createPdf(docDefinition).download(`${offtake.offtake_id}_production_plan.pdf`);

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
  addProductionStatus: async (offtake_id, status) => {
    try {
      // Create a reference to the 'production-plan' collection
      const productionPlanCollectionRef = collection(firestoreDB, 'offtakes', offtake_id, '_production-plan');

      // Add a new document to the collection with the provided status data
      const docRef = await addDoc(productionPlanCollectionRef, status);

      console.log('Production status added successfully with ID:', docRef.id);
      return docRef.id; // Return the ID of the newly created document
    } catch (error) {
      console.error('Error adding production status:', error);
      throw error;
    }
  },
  removeProductionStatus: async (offtake_id, status_id) => {
    try {
      // Create a reference to the specific document in the 'production-plan' subcollection
      const statusDocRef = doc(firestoreDB, 'offtakes', offtake_id, '_production-plan', status_id);

      // Delete the document
      await deleteDoc(statusDocRef);

      console.log('Production status removed successfully:', status_id);
      return status_id; // Return the ID of the removed document
    } catch (error) {
      console.error('Error removing production status:', error);
      return error
    }
  },
  updateProductionPlan: async (offtake_id, status_id, status) => {
    // Create a reference to the 'tracker' document in the 'production-plan' collection
    const trackerDocRef = doc(firestoreDB, 'offtakes', offtake_id, '_production-plan', status_id);

    // Set the document with the provided schedule data
    await setDoc(trackerDocRef, status)

    console.log('Offtake schedule updated successfully!');
    return trackerDocRef.id; // Return the reference to the updated document
  },
  updateSubmission: async (offtake_id, doc_id, data) => {
    // Create a reference to the 'tracker' document in the 'production-plan' collection
    const trackerDocRef = doc(firestoreDB, 'offtakes', offtake_id, '_farm_applications', doc_id);

    // Set the document with the provided schedule data
    await setDoc(trackerDocRef, data)

    console.log('Applications updated successfully!');
    return trackerDocRef.id; // Return the reference to the updated document
  },
  getProductionPlan: async (offtake_id) => {
    try {
      const productionPlanRef = collection(firestoreDB, "offtakes", offtake_id, "_production-plan");
      const querySnapshot = await getDocs(productionPlanRef);

      if (!querySnapshot.empty) {
        const documents = querySnapshot.docs.map(doc => ({
          ...doc.data(),
          key: doc.id
        }));
        return documents;
      } else {
        console.log("No documents found in the production-plan subcollection!");
        return [];
      }
    } catch (error) {
      console.error("Error fetching production plan:", error);
      // throw error;
    }
  },
  getRespondents: async (offtake_id) => {
    try {
      const respondentsRef = collection(firestoreDB, "offtakes", offtake_id, "_farm_applications");
      const querySnapshot = await getDocs(respondentsRef);

      if (!querySnapshot.empty) {
        const respondents = []
        querySnapshot.docs.map(doc => {
          var _data = {
            ...doc.data(),
            key: doc.id,
            farm_profile: {}
          }
          FarmerService.getSingleFarm(doc.data().respondent).then(_farm => {
            if (_farm) {
              _data.farm_profile = _farm
              respondents.push(_data)
            }
          })
        });
        return respondents;
      } else {
        console.log("No documents found in the production-plan subcollection!");
        return [];
      }
    } catch (error) {
      console.error("Error fetching production plan:", error);
      throw error;
    }
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
    const offtake = ref(realtimeDB, `submitted-chat/${offtake_id}`)
    return push(offtake, message)
      .then(() => {
        return 'success';
      })
      .catch((error) => {
        console.error("Error publishing message: ", error);
        return 'failed';
      });
  },
  getMasterContract: async (offtake_id, document_id) => {
    try {
      // Create a reference to the specific document within the 'documents' subcollection
      const documentRef = doc(firestoreDB, 'offtakes', offtake_id, '_documents', document_id);

      // Get the document
      const docSnap = await getDoc(documentRef);

      if (docSnap.exists()) {
        // If the document exists, return its data
        return { id: docSnap.id, ...docSnap.data() };
      } else {
        // If the document doesn't exist, return null or throw an error
        console.log('No such document!');
        return null;
      }
    } catch (error) {
      console.error('Error getting document:', error);
      throw error;
    }
  },
  getSingleDocument: async (offtake_id, document_id) => {
    try {
      // Create a reference to the specific document within the 'documents' subcollection
      const documentRef = doc(firestoreDB, 'offtakes', offtake_id, '_documents', document_id);

      // Get the document
      const docSnap = await getDoc(documentRef);

      if (docSnap.exists()) {
        // If the document exists, return its data
        return { id: docSnap.id, ...docSnap.data() };
      } else {
        // If the document doesn't exist, return null or throw an error
        console.log('No such document!');
        return null;
      }
    } catch (error) {
      console.error('Error getting document:', error);
      throw error;
    }
  },
  addDocument: async (offtake_id, document) => {
    try {
      // Create a reference to the 'production-plan' collection
      const documentsCollectionRef = collection(firestoreDB, 'offtakes', offtake_id, '_documents');
      // Add a new document to the collection with the provided status data
      const docRef = await addDoc(documentsCollectionRef, document);
      return docRef.id; // Return the ID of the newly created document
    } catch (error) {
      console.error('Error adding production status:', error);
      throw error;
    }
  },
  getFarmSubmissions: async (offtake_id) => {
    const q = query(collection(firestoreDB, `/offtakes/${offtake_id}/_farm_applications`));
    const querySnapshot = await getDocs(q);
    var d = []
    var submissions = []
    querySnapshot.forEach((doc) => {
      // doc.data() is never undefined for query doc snapshots
      if (doc.exists()) {
        d.push({ ...doc.data() })
      } else {
        // docSnap.data() will be undefined in this case
        console.log("No such document!");
      }
    });
    if (d.length !== 0) {
      await d.forEach((submission, i) => {
        FarmerService.getSingleFarm(submission.uid).then(profile => {
          submissions.push({ ...submission, farm_profile: profile })
        })
      });
    }
    return submissions
    // return farms
  },
  updateContractModel: async (offtake_id, contract_model) => {
    const offtakeRef = doc(firestoreDB, 'offtakes', offtake_id);
    await updateDoc(offtakeRef, { contract_model: contract_model })
  },
  // Arrow function to extract all '_step' from categories
  extractSteps: (productionPlan) => {
    // Check if productionPlan and _category exist
    if (!productionPlan || !productionPlan._steps) {
      return [];
    }

    // Use flatMap with a safe check
    return productionPlan._steps.reduce((acc, step) => {
      if (step) {
        return [...acc, ...step];
      }
      return acc;
    }, []);
  },
  // Arrow function to extract all '_costing' from steps
  extractCostings: (productionPlan) => {
    console.log('====================================');
    console.log(productionPlan);
    console.log('====================================');
    // Get all steps first
    const steps = OfftakeService.extractSteps(productionPlan);

    // Extract costings from steps
    return steps.reduce((acc, step) => {
      if (step && step._costing) {
        return [...acc, ...step._costing];
      }
      return acc;
    }, []);
  },
  // Arrow function to extract all '_category'
  getPMProfiles: async () => {
    console.log('Getting profiles');
    try {
      console.log('Getting PM profiles');

      // Reference to the agents collection
      const q = query(
        agentsCollection,
        where("role", "==", "pm") // Directly filter out active agents in query
      );

      // Execute the query
      const querySnapshot = await getDocs(q);

      // If no documents found, return empty array
      if (querySnapshot.empty) {
        return [];
      }

      // Map documents directly to agents, avoiding forEach loop
      const pmAgents = querySnapshot.docs.map(doc => ({
        key: doc.id,  // Include document ID
        ...doc.data()
      }));

      return pmAgents;
    } catch (error) {
      console.error('Error fetching PM profiles:', error);
      return [];
    }
  },
  getAgentAssignedOfftakes: async (agent_uid) => {
    console.log('Getting profiles');
    try {
      console.log(`Getting PM ${agent_uid} offtakes`);

      // Reference to the agents collection
      const q = query(
        offtakesCollection,
        where("pm", "==", agent_uid) // Directly filter out active agents in query
      );

      // Execute the query
      const querySnapshot = await getDocs(q);

      // If no documents found, return empty array
      if (querySnapshot.empty) {
        return [];
      }

      // Map documents directly to agents, avoiding forEach loop
      const agentOfftakes = querySnapshot.docs.map(doc => ({
        key: doc.id,  // Include document ID
        ...doc.data()
      }));

      return agentOfftakes;
    } catch (error) {
      console.error('Error fetching PM profiles:', error);
      return [];
    }
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
        "status": [{
          "status_name": 'inprogress',
          "updated_at": SystemService.generateTimestamp()
        }],
        "packaging": "Rigid Plastic Containers",
        "start_date": "",
        "category_type": "Contract",
        "production_method": "Vertical Farm",
        "commodity_name": "Broccoli",
        "address": "Johannesburg Road Lyndhurst Johannesburg",
        "contract": "instrument2",
        "form_completion_status": "complete",
        "input_investment": "Yes",
        "created_at": SystemService.generateTimestamp(),
        "title": "Agrowex Offtake",
        "country": "south_africa",
        "_commodity_meta": {
          "product_id": 'SKU-342i3uhf',
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
          // for (const document of documents) {
          //   const docRef = doc(documentsCollectionRef);
          //   await setDoc(docRef, {
          //     ...document,
          //     created_at: moment().valueOf() // Use current timestamp
          //   });
          //   console.log(`Created document ${document.name} for offtake: ${offtake_id}`);
          // }
        } catch (error) {
          console.error(`Error creating offtake ${offtake_id}:`, error);
        }
      }

      console.log("Finished generating stable offtakes and their documents.");
    }
  }
}