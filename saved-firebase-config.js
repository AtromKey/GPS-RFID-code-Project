// Your Firebase config (replace this with your actual credentials)
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
const app = firebase.initializeApp(firebaseConfig);
const database = firebase.database(app);

// Function to save GPS data to Firebase Realtime Database
function saveGPSData(lat, lon) {
  const locationsRef = database.ref("locations");
  const newLocationRef = locationsRef.push();
  newLocationRef
    .set({
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

// Example usage: Call the saveGPSData function with GPS coordinates (latitude, longitude)
saveGPSData(14.839439, 120.81383); // Example coordinates
