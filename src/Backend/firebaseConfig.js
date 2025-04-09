
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDXR__iDR6ExLw8lMS_KTxKikef5fA1Ufc",
  authDomain: "d-modeler-5d343.firebaseapp.com",
  projectId: "d-modeler-5d343",
  storageBucket: "d-modeler-5d343.appspot.com",  
  messagingSenderId: "675916052498",
  appId: "1:675916052498:web:be8ecf005c6656d8cfc0cb"
};


const app = initializeApp(firebaseConfig);
const db = getFirestore(app);


export { db };
