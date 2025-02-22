import {
  getDatabase,
  ref,
  onValue,
} from "https://www.gstatic.com/firebasejs/9.1.3/firebase-database.js";

// Initialize Firebase if not already initialized (firebaseConfig and initializeApp should already be in your main HTML file)
// Firebase configuration should already be loaded in your main HTML (as in previous HTML examples).

// Access the Firebase database reference
const database = window.database; // Assuming 'window.database' is set with the Firebase initialized
const gpsDataRef = ref(database, "tracking/latest"); // Reference to the 'latest' GPS data node in Firebase

// Function to create a GPS marker icon
function createGPSIcon() {
  return L.icon({
    iconUrl: "https://cdn-icons-png.flaticon.com/512/684/684908.png",
    iconSize: [30, 45],
    iconAnchor: [15, 45],
    popupAnchor: [1, -30],
    shadowSize: [50, 50],
  });
}

// Initialize the GPS marker
const gpsIcon = createGPSIcon();
const gpsMarker = L.marker([14.839439, 120.81383], { icon: gpsIcon })
  .addTo(map)
  .bindPopup("GPS Location")
  .openPopup();

// Function to get the landmark description using reverse geocoding
async function getLandmarkDescription(lat, lon) {
  const apiUrl = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`;
  try {
    const response = await fetch(apiUrl);
    const data = await response.json();
    return data.display_name || "Unknown Location";
  } catch (error) {
    console.error("Error fetching landmark data:", error);
    return "Location details not available.";
  }
}

// Update the GPS location on the map
async function updateLocation(lat, lon) {
  if (isNaN(lat) || isNaN(lon)) {
    console.error("Invalid GPS coordinates.");
    return;
  }

  const newLatLng = new L.LatLng(lat, lon);
  gpsMarker.setLatLng(newLatLng);

  const landmarkDescription = await getLandmarkDescription(lat, lon);
  gpsMarker.setPopupContent(
    `<b>Real-Time Location:</b><br>${landmarkDescription}<br>
    <b>Coordinates:</b> ${lat.toFixed(6)}, ${lon.toFixed(6)}`
  );

  // Optionally, update the map's center and zoom level
  map.setView(newLatLng, map.getZoom());
}

// Listen for real-time changes in Firebase
onValue(gpsDataRef, function (snapshot) {
  const data = snapshot.val();
  if (data) {
    const latitude = data.latitude;
    const longitude = data.longitude;
    updateLocation(latitude, longitude); // Call the updateLocation function to update the marker on the map
  } else {
    console.error("No GPS data found.");
  }
});
