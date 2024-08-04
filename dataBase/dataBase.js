const firebaseApp = firebase.initializeApp({
  apiKey: "AIzaSyD13OhZ4noZlVkthQBzL-5mSujTMA9IRN4",
  authDomain: "to-dolist-percent.firebaseapp.com",
  projectId: "to-dolist-percent",
  storageBucket: "to-dolist-percent.appspot.com",
  messagingSenderId: "72352511071",
  appId: "1:72352511071:web:56ab4cfbfb12b5b7ad57ea",
  measurementId: "G-QVRY6YC4DV"
});

export default {
  db: firebaseApp.firestore(),
  auth: firebaseApp.auth(), 
}



