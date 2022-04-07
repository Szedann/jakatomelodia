import { getFirestore } from 'firebase/firestore';
import firebase, { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {

    apiKey: "AIzaSyBbGGH9S9En1fJT1r-j-nD8877P96v0ssM",
  
    authDomain: "jakatomelodia-e4be9.firebaseapp.com",
  
    databaseURL: "https://jakatomelodia-e4be9-default-rtdb.europe-west1.firebasedatabase.app",
  
    projectId: "jakatomelodia-e4be9",
  
    storageBucket: "jakatomelodia-e4be9.appspot.com",
  
    messagingSenderId: "737171135612",
  
    appId: "1:737171135612:web:5f77a6e2210ead2fc57df9"
  
  };
  

const app = initializeApp(firebaseConfig)

const db = getFirestore(app)

const auth = getAuth(app)

export{app, db, auth}

