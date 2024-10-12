import { ref } from "firebase/database";
import { ref as sRef } from 'firebase/storage';
import { getDownloadURL, getStorage, uploadBytesResumable } from "firebase/storage";

export const storage = getStorage();
export const SystemService = {
  getVariables: () => {

  },
  getContractModel: () => {

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
      "January", "February", "March", "April", "May", "June", "July", "August",
      "September", "October", "November", "December"
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
  // todo need to add time string for this formating
  formatTimestamp: (timestamp) => {

    const date = new Date(timestamp);
    const options = { day: 'numeric', month: 'short', year: 'numeric' };
    return date.toLocaleDateString('en-GB', options);
  }
}

