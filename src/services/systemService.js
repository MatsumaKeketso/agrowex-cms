import { ref } from "firebase/database";
import { ref as sRef } from 'firebase/storage';
import { getDownloadURL, getStorage, uploadBytesResumable } from "firebase/storage";
import { Permissions } from "./system/permissions";
import { firestoreDB } from "./authService";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";

export const storage = getStorage();
export const SystemService = {
  getVariables: () => {

  },
  // // todo update function to pull from db
  getPermissions: async () => {
    const docRef = doc(firestoreDB, "system", "permissions");
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { ...docSnap.data(), key: docSnap.id }
    } else {
      // docSnap.data() will be undefined in this case
      console.log("No such document!");
    }
  },
  updatePermissions: async (permissions) => {
    await updateDoc(doc(firestoreDB, 'system', 'permissions'), { ...permissions, updated_at: SystemService.generateTimestamp() });
  },
  uploadFile: (path, fileObject) => {

    const metadata = {
      contentType: fileObject.type
    };
    console.log(`cms-documents/${path}/${fileObject.name}`);

    const storageRef = sRef(storage, `cms-documents/${path}${fileObject.name}`);

    const uploadTask = uploadBytesResumable(storageRef, fileObject, metadata);

    // Listen for state changes, errors, and completion of the upload.
    uploadTask.on('state_changed',
      (snapshot) => {
        // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;

        switch (snapshot.state) {
          case 'paused':
            console.log('Upload is paused');
            break;
          case 'running':
            console.log('Upload is running');
            break;
          default:
            break;
        }
      },
      (error) => {
        console.log('====================================');
        console.log(error);
        console.log('====================================');
        // A full list of error codes is available at
        switch (error.code) {

          case 'storage/unauthorized':
            // User doesn't have permission to access the object
            break;
          case 'storage/canceled':
            // User canceled the upload
            break;
          case 'storage/unknown':
            // Unknown error occurred, inspect error.serverResponse
            break;
          default:
            break;

        }
      },
      () => {
        // Upload completed successfully, now we can get the download URL
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
          return downloadURL
        });
      }
    );



  },
  convertTimestampToDateString: (timestamp) => {
    // Create a new Date object using the timestamp
    const date = new Date(timestamp);

    // Array of month names
    const months = [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug",
      "Sep", "Oct", "Nov", "Dec"
    ];

    // Extract the day, month, and year from the Date object
    const day = date.getDate();
    const month = months[date.getMonth()];
    const year = date.getFullYear();

    // Return the formatted string
    return `${day} ${month}, ${year}`;
  },
  generateTimestamp: () => {
    return Date.now();
  },
  // // todo need to add time string for this formating
  formatTimestamp: (timestamp) => {
    const date = new Date(timestamp);
    const options = {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    };
    return date.toLocaleDateString('en-GB', options).replace(',', '')
    //  ' at ' + 
    //  date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: true });
  },
  converStringToSentenceCase: (str) => {
    return str.replace(/\b\w/g, c => c.toUpperCase());
  }
}

