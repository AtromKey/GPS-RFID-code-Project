// // Replace with your Geoapify API key
// const geoapifyApiKey = "c6a0f1aa494446a99b7df357c4598089";

// // Initialize the map
// const map = L.map("map", {
//   zoomControl: true,
//   maxZoom: 18,
//   minZoom: 10,
// }).setView([14.839439, 120.81383], 13);

// // Add OpenStreetMap tile layer
// L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
//   attribution:
//     '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
// }).addTo(map);

// // Define a reusable GPS marker icon
// function createGPSIcon() {
//   return L.icon({
//     iconUrl: "https://cdn-icons-png.flaticon.com/512/684/684908.png", // GPS Icon
//     iconSize: [30, 45],
//     iconAnchor: [15, 45],
//     popupAnchor: [1, -30],
//     shadowSize: [50, 50],
//   });
// }

// // Initialize the GPS marker
// const gpsIcon = createGPSIcon();
// const gpsMarker = L.marker([14.839439, 120.81383], { icon: gpsIcon })
//   .addTo(map)
//   .bindPopup("GPS Location") // Initial GPS marker label
//   .openPopup();

// let searchMarker; // For searched locations
// let clickedMarker; // For clicked location
// let followGPS = true; // Track follow GPS state

// // Reverse geocoding to fetch landmark details
// async function getLandmarkDescription(lat, lon) {
//   const apiUrl = `https://api.geoapify.com/v1/geocode/reverse?lat=${lat}&lon=${lon}&apiKey=${geoapifyApiKey}`;
//   try {
//     const response = await fetch(apiUrl);
//     const data = await response.json();
//     if (data.features && data.features.length > 0) {
//       return data.features[0].properties.formatted || "Unknown Location";
//     }
//   } catch (error) {
//     console.error("Error fetching landmark data:", error);
//   }
//   return "Location details not available.";
// }

// // Update the GPS location on the map and save to Firebase
// async function updateLocation(lat, lon) {
//   if (isNaN(lat) || isNaN(lon)) {
//     console.error("Invalid GPS coordinates.");
//     return;
//   }

//   const newLatLng = new L.LatLng(lat, lon);
//   gpsMarker.setLatLng(newLatLng);

//   const landmarkDescription = await getLandmarkDescription(lat, lon);
//   gpsMarker.setPopupContent(
//     `<b>Real-Time Location:</b><br>${landmarkDescription}<br>
//     <b>Coordinates:</b> ${lat.toFixed(6)}, ${lon.toFixed(6)}`
//   );

//   // Only update the map view if followGPS is enabled
//   if (followGPS) {
//     map.setView(newLatLng, map.getZoom());
//   }

//   // Save GPS data to Firebase
//   saveGPSData(lat, lon);
// }

// // Firebase: Save GPS data to Firebase Realtime Database
// function saveGPSData(lat, lon) {
//   if (isNaN(lat) || isNaN(lon)) {
//     console.error("Invalid GPS coordinates:", lat, lon);
//     return;
//   }

//   const locationsRef = firebase.database().ref("locations");
//   const newLocationRef = locationsRef.push();
//   newLocationRef
//     .set({
//       latitude: lat,
//       longitude: lon,
//       timestamp: new Date().toISOString(),
//     })
//     .then(() => {
//       console.log("GPS data saved successfully to Firebase!");
//     })
//     .catch((error) => {
//       console.error("Error saving data to Firebase:", error);
//     });
// }

// // Add debounce for search input
// function debounce(func, delay) {
//   let timer;
//   return function (...args) {
//     clearTimeout(timer);
//     timer = setTimeout(() => func.apply(this, args), delay);
//   };
// }

// // Add search functionality
// function addSearchFeature() {
//   const searchContainer = document.createElement("div");
//   searchContainer.className = "search-container";
//   searchContainer.style.position = "absolute";
//   searchContainer.style.top = "10px";
//   searchContainer.style.right = "10px";
//   searchContainer.style.zIndex = "1000";
//   searchContainer.style.background = "white";
//   searchContainer.style.padding = "10px";
//   searchContainer.style.borderRadius = "8px";
//   searchContainer.style.boxShadow = "0 4px 8px rgba(0, 0, 0, 0.2)";

//   const input = document.createElement("input");
//   input.type = "text";
//   input.placeholder = "Search for a place or coordinates";
//   input.style.width = "250px";
//   input.style.padding = "8px";
//   input.style.border = "1px solid #ccc";
//   input.style.borderRadius = "4px";

//   const suggestions = document.createElement("div");
//   suggestions.style.maxHeight = "200px";
//   suggestions.style.overflowY = "auto";
//   suggestions.style.display = "none";

//   searchContainer.appendChild(input);
//   searchContainer.appendChild(suggestions);
//   document.body.appendChild(searchContainer);

//   input.addEventListener(
//     "input",
//     debounce(async (e) => {
//       const query = e.target.value.trim();
//       if (!query) {
//         suggestions.style.display = "none";
//         return;
//       }

//       const apiUrl = `https://api.geoapify.com/v1/geocode/search?text=${encodeURIComponent(
//         query
//       )}&apiKey=${geoapifyApiKey}`;

//       try {
//         const response = await fetch(apiUrl);
//         const data = await response.json();
//         const results = data.features || [];

//         suggestions.innerHTML = "";
//         if (results.length === 0) {
//           suggestions.innerHTML = "<div>No results found</div>";
//           suggestions.style.display = "block";
//           return;
//         }

//         results.forEach((result) => {
//           const { formatted, lat, lon } = result.properties;

//           const suggestion = document.createElement("div");
//           suggestion.textContent = formatted;
//           suggestion.style.cursor = "pointer";
//           suggestion.style.padding = "8px";
//           suggestion.style.borderBottom = "1px solid #eee";

//           suggestion.addEventListener("click", () => {
//             if (searchMarker) map.removeLayer(searchMarker);
//             searchMarker = L.marker([lat, lon], { icon: createSearchIcon() })
//               .addTo(map)
//               .bindPopup(
//                 `<b>Search Location:</b><br>${formatted}<br>
//                 <b>Coordinates:</b> ${lat.toFixed(6)}, ${lon.toFixed(6)}`
//               )
//               .openPopup();
//             map.setView([lat, lon], 17);
//             input.value = "";
//             suggestions.style.display = "none";
//           });

//           suggestions.appendChild(suggestion);
//         });
//         suggestions.style.display = "block";
//       } catch (error) {
//         console.error("Error fetching search suggestions:", error);
//       }
//     }, 300)
//   );
// }

// // Add GPS follow button (fixed position)
// function addGPSFollowButton() {
//   const button = L.DomUtil.create("button", "gps-toggle-btn");
//   button.textContent = "Follow GPS";
//   button.style.position = "fixed";
//   button.style.bottom = "10px";
//   button.style.left = "10px";
//   button.style.padding = "10px";
//   button.style.borderRadius = "5px";
//   button.style.cursor = "pointer";
//   button.style.zIndex = 1000;
//   button.style.backgroundColor = "#4caf50";

//   button.onclick = () => {
//     followGPS = !followGPS;
//     button.textContent = followGPS ? "Unfollow GPS" : "Follow GPS";
//     button.style.backgroundColor = followGPS ? "#4caf50" : "#f44336";
//   };

//   document.body.appendChild(button);
// }

// // Initialize features
// addSearchFeature();
// addGPSFollowButton();

// // Simulate GPS data updates
// setInterval(() => {
//   const newLat = 14.839439 + (Math.random() * 0.001 - 0.0005);
//   const newLon = 120.81383 + (Math.random() * 0.001 - 0.0005);
//   updateLocation(newLat, newLon);
// }, 5000);

// // Add click event listener to update location on map click
// map.on("click", async function (e) {
//   const lat = e.latlng.lat;
//   const lon = e.latlng.lng;

//   // Remove any existing clicked marker
//   if (clickedMarker) map.removeLayer(clickedMarker);

//   // Fetch the landmark description for the clicked location
//   const landmarkDescription = await getLandmarkDescription(lat, lon);

//   // Create a new marker for clicked location with landmark info
//   clickedMarker = L.marker([lat, lon], { icon: createClickedIcon() })
//     .addTo(map)
//     .bindPopup(
//       `<b>Clicked Location:</b><br>${landmarkDescription}<br>
//       <b>Coordinates:</b> ${lat.toFixed(6)}, ${lon.toFixed(6)}`
//     )
//     .openPopup();

//   // Optionally, zoom to the clicked location
//   map.setView([lat, lon], map.getZoom());
// });

// Replace with your Geoapify API key
const geoapifyApiKey = "c6a0f1aa494446a99b7df357c4598089";

// Initialize the map
const map = L.map("map", {
  zoomControl: true,
  maxZoom: 18,
  minZoom: 10,
}).setView([14.839439, 120.81383], 13);

// Add OpenStreetMap tile layer
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution:
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
}).addTo(map);

// Define a reusable GPS marker icon
function createGPSIcon() {
  return L.icon({
    iconUrl: "https://cdn-icons-png.flaticon.com/512/684/684908.png", // GPS Icon
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
  .bindPopup("GPS Location") // Initial GPS marker label
  .openPopup();

let searchMarker; // For searched locations
let clickedMarker; // For clicked location
let followGPS = true; // Track follow GPS state

// Reverse geocoding to fetch landmark details
async function getLandmarkDescription(lat, lon) {
  const apiUrl = `https://api.geoapify.com/v1/geocode/reverse?lat=${lat}&lon=${lon}&apiKey=${geoapifyApiKey}`;
  try {
    const response = await fetch(apiUrl);
    const data = await response.json();
    if (data.features && data.features.length > 0) {
      return data.features[0].properties.formatted || "Unknown Location";
    }
  } catch (error) {
    console.error("Error fetching landmark data:", error);
  }
  return "Location details not available.";
}

// Update the GPS location on the map and save to Firebase
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

  // Only update the map view if followGPS is enabled
  if (followGPS) {
    map.setView(newLatLng, map.getZoom());
  }

  // Save GPS data to Firebase
  saveGPSData(lat, lon);
}

// Firebase: Save GPS data to Firebase Realtime Database
function saveGPSData(lat, lon) {
  if (isNaN(lat) || isNaN(lon)) {
    console.error("Invalid GPS coordinates:", lat, lon);
    return;
  }

  const locationsRef = firebase.database().ref("locations");
  const newLocationRef = locationsRef.push();
  newLocationRef
    .set({
      latitude: lat,
      longitude: lon,
      timestamp: new Date().toISOString(),
    })
    .then(() => {
      console.log("GPS data saved successfully to Firebase!");
    })
    .catch((error) => {
      console.error("Error saving data to Firebase:", error);
    });
}

// Add debounce for search input
function debounce(func, delay) {
  let timer;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => func.apply(this, args), delay);
  };
}

// Add search functionality
function addSearchFeature() {
  const searchContainer = document.createElement("div");
  searchContainer.className = "search-container";
  searchContainer.style.position = "absolute";
  searchContainer.style.top = "10px";
  searchContainer.style.right = "10px";
  searchContainer.style.zIndex = "1000";
  searchContainer.style.background = "white";
  searchContainer.style.padding = "10px";
  searchContainer.style.borderRadius = "8px";
  searchContainer.style.boxShadow = "0 4px 8px rgba(0, 0, 0, 0.2)";

  const input = document.createElement("input");
  input.type = "text";
  input.placeholder = "Search for a place or coordinates";
  input.style.width = "250px";
  input.style.padding = "8px";
  input.style.border = "1px solid #ccc";
  input.style.borderRadius = "4px";

  const suggestions = document.createElement("div");
  suggestions.style.maxHeight = "200px";
  suggestions.style.overflowY = "auto";
  suggestions.style.display = "none";

  searchContainer.appendChild(input);
  searchContainer.appendChild(suggestions);
  document.body.appendChild(searchContainer);

  input.addEventListener(
    "input",
    debounce(async (e) => {
      const query = e.target.value.trim();
      if (!query) {
        suggestions.style.display = "none";
        return;
      }

      const apiUrl = `https://api.geoapify.com/v1/geocode/search?text=${encodeURIComponent(
        query
      )}&apiKey=${geoapifyApiKey}`;

      try {
        const response = await fetch(apiUrl);
        const data = await response.json();
        const results = data.features || [];

        suggestions.innerHTML = "";
        if (results.length === 0) {
          suggestions.innerHTML = "<div>No results found</div>";
          suggestions.style.display = "block";
          return;
        }

        results.forEach((result) => {
          const { formatted, lat, lon } = result.properties;

          const suggestion = document.createElement("div");
          suggestion.textContent = formatted;
          suggestion.style.cursor = "pointer";
          suggestion.style.padding = "8px";
          suggestion.style.borderBottom = "1px solid #eee";

          suggestion.addEventListener("click", () => {
            if (searchMarker) map.removeLayer(searchMarker);
            searchMarker = L.marker([lat, lon], { icon: createSearchIcon() })
              .addTo(map)
              .bindPopup(
                `<b>Search Location:</b><br>${formatted}<br>
                <b>Coordinates:</b> ${lat.toFixed(6)}, ${lon.toFixed(6)}`
              )
              .openPopup();
            map.setView([lat, lon], 17);
            input.value = "";
            suggestions.style.display = "none";
          });

          suggestions.appendChild(suggestion);
        });
        suggestions.style.display = "block";
      } catch (error) {
        console.error("Error fetching search suggestions:", error);
      }
    }, 300)
  );
}

// Add GPS follow button (fixed position)
function addGPSFollowButton() {
  const button = L.DomUtil.create("button", "gps-toggle-btn");
  button.textContent = "Follow GPS";
  button.style.position = "fixed";
  button.style.bottom = "10px";
  button.style.left = "10px";
  button.style.padding = "10px";
  button.style.borderRadius = "5px";
  button.style.cursor = "pointer";
  button.style.zIndex = 1000;
  button.style.backgroundColor = "#4caf50";

  button.onclick = () => {
    followGPS = !followGPS;
    button.textContent = followGPS ? "Unfollow GPS" : "Follow GPS";
    button.style.backgroundColor = followGPS ? "#4caf50" : "#f44336";
  };

  document.body.appendChild(button);
}

// Initialize features
addSearchFeature();
addGPSFollowButton();

// Simulate GPS data updates
setInterval(() => {
  const newLat = 14.839439 + (Math.random() * 0.01 - 0.003);
  const newLon = 120.81383 + (Math.random() * 0.01 - 0.003);
  updateLocation(newLat, newLon);
}, 5000);

// Define the custom icon for the clicked marker
function createClickedIcon() {
  return L.icon({
    iconUrl:
      "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png", // Replace with the actual path to your icon image
    iconSize: [32, 42], // Set the size of the icon
    iconAnchor: [16, 32], // Anchor the icon at the bottom center
    popupAnchor: [0, -32], // Position the popup above the marker
  });
}

// Add click event listener to update location on map click
map.on("click", async function (e) {
  const lat = e.latlng.lat;
  const lon = e.latlng.lng;

  // Remove any existing clicked marker
  if (clickedMarker) map.removeLayer(clickedMarker);

  // Fetch the landmark description for the clicked location
  const landmarkDescription = await getLandmarkDescription(lat, lon);

  // Create a new marker for clicked location with landmark info
  clickedMarker = L.marker([lat, lon], { icon: createClickedIcon() })
    .addTo(map)
    .bindPopup(
      `<b>Clicked Location:</b><br>${landmarkDescription}<br>
      <b>Coordinates:</b> ${lat.toFixed(6)}, ${lon.toFixed(6)}`
    )
    .openPopup();

  // Optionally, zoom to the clicked location
  map.setView([lat, lon], map.getZoom());
});

// Firebase: Fetch the last saved GPS location from Firebase
function loadLastLocation() {
  const locationsRef = ref(database, "locations");
  locationsRef
    .orderByChild("timestamp")
    .limitToLast(1) // Get the most recent GPS data
    .once("value")
    .then((snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const location = Object.values(data)[0]; // Get the latest location object
        const { latitude, longitude } = location;

        // Update the map and GPS marker to the last saved location
        const lastLatLng = new L.LatLng(latitude, longitude);
        gpsMarker.setLatLng(lastLatLng);
        gpsMarker.setPopupContent(
          `<b>Last Location:</b><br>Latitude: ${latitude.toFixed(
            6
          )}, Longitude: ${longitude.toFixed(6)}`
        );

        map.setView(lastLatLng, map.getZoom());
        console.log("Last GPS location loaded.");
      } else {
        console.log("No GPS data found.");
      }
    })
    .catch((error) => {
      console.error("Error loading last location:", error);
    });
}

// Call loadLastLocation when the page loads
window.onload = function () {
  loadLastLocation();
};
