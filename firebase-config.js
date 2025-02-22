import { initializeApp } from "https://www.gstatic.com/firebasejs/9.1.3/firebase-app.js";
import {
  getDatabase,
  ref,
  push,
  set,
} from "https://www.gstatic.com/firebasejs/9.1.3/firebase-database.js";

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyApzW90meePGlKNhi5UyiQWceKeUz6F4dw",
  authDomain: "gps-rfid-tracker.firebaseapp.com",
  databaseURL:
    "https://gps-rfid-tracker-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "gps-rfid-tracker",
  storageBucket: "gps-rfid-tracker.firebasestorage.app",
  messagingSenderId: "909010484136",
  appId: "1:909010484136:web:af85a7ba20eedd89993b9d",
  measurementId: "G-B78LH6TNP1",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

console.log("Firebase initialized successfully!"); // Debugging log

// Function to save GPS data to Firebase Realtime Database
export function saveGPSData(lat, lon) {
  console.log("Saving GPS Data:", lat, lon); // Log GPS data

  const locationsRef = ref(database, "locations");
  const newLocationRef = push(locationsRef);

  set(newLocationRef, {
    latitude: lat,
    longitude: lon,
    timestamp: new Date().toISOString(),
  })
    .then(() => {
      console.log("GPS data saved successfully to Firebase Realtime Database!");
    })
    .catch((error) => {
      console.error("Error saving GPS data to Firebase:", error);
    });
}

// Export Firebase database instance
export { database };
