// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore, collection, getDocs } from 'firebase/firestore/lite';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries


/*export const environment = {
  production: false,
  firebaseConfig: {
    apiKey: "AIzaSyB_ysHm74vRYALrQHW2BGBSuI_xN_hqJqY",
    authDomain: "protrack-280ca.firebaseapp.com",
    projectId: "protrack-280ca",
    storageBucket: "protrack-280ca.appspot.com",
    messagingSenderId: "246324628705",
    appId: "1:246324628705:web:69221b27884dda44e1fba0",
    measurementId: "G-B4CLFXREN3"
  }
};*/

export const environment = {
  production: false,
  firebaseConfig: {
    apiKey: "AIzaSyAQ3Kyo0SrYdqwwP80-x_aypIOVfE-0sxY",
    authDomain: "eazybooks-d5a17.firebaseapp.com",
    databaseURL: "https://eazybooks-d5a17-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "eazybooks-d5a17",
    storageBucket: "eazybooks-d5a17.appspot.com",
    messagingSenderId: "1020819590485",
    appId: "1:1020819590485:web:86c9e735007d1f178973dc",
    measurementId: "G-F655KXNQT3"
  }
};


/*
const app = initializeApp(firebaseConfig);

const db = getFirestore(app);

// Get a list of cities from your database
async function getCities(db) {
  const citiesCol = collection(db, 'cities');
  const citySnapshot = await getDocs(citiesCol);
  const cityList = citySnapshot.docs.map(doc => doc.data());
  return cityList;
}*/
