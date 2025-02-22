// Replace with your Geoapify API key
const geoapifyApiKey = "c6a0f1aa494446a99b7df357c4598089";

// Initialize the map at the new coordinates
const map = L.map("map", {
  zoomControl: true,
  maxZoom: 18,
  minZoom: 10,
}).setView([14.839439, 120.81383], 13); // Set to the new coordinates

// Add OpenStreetMap tile layer
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution:
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
}).addTo(map);

// Define a reusable GPS marker icon
function createGPSIcon() {
  return L.icon({
    iconUrl: "https://cdn-icons-png.flaticon.com/512/684/684908.png", // Replace with a working icon URL
    iconSize: [30, 45],
    iconAnchor: [15, 45],
    popupAnchor: [1, -30],
    shadowSize: [50, 50],
  });
}

// Initialize the GPS marker with "None" as the initial landmark name
const gpsIcon = createGPSIcon();
const marker = L.marker([14.839439, 120.81383], { icon: gpsIcon })
  .addTo(map)
  .bindPopup("None") // Initially set to "None"
  .openPopup();

let searchMarker; // For searched locations
let followGPS = true;

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

// Update the GPS location on the map
async function updateLocation(lat, lon) {
  if (isNaN(lat) || isNaN(lon)) {
    console.error("Invalid GPS coordinates.");
    return;
  }

  const newLatLng = new L.LatLng(lat, lon);
  marker.setLatLng(newLatLng);

  const landmarkDescription = await getLandmarkDescription(lat, lon);
  marker.setPopupContent(
    `<b>Real-Time Location:</b><br>${landmarkDescription}<br>
    <b>Coordinates:</b> ${lat.toFixed(6)}, ${lon.toFixed(6)}`
  );

  if (followGPS) {
    map.setView(newLatLng, map.getZoom());
  }
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
            searchMarker = L.marker([lat, lon], { icon: gpsIcon })
              .addTo(map)
              .bindPopup(
                `<b>Searched Location:</b><br>${formatted}<br>
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

// Add GPS follow button
function addGPSFollowButton() {
  const button = L.control({ position: "bottomleft" });
  button.onAdd = function () {
    const btn = L.DomUtil.create("button", "gps-toggle-btn");
    btn.textContent = "Follow GPS";
    btn.style.padding = "10px";
    btn.style.borderRadius = "5px";
    btn.style.cursor = "pointer";

    btn.onclick = () => {
      followGPS = !followGPS;
      btn.textContent = followGPS ? "Unfollow GPS" : "Follow GPS";
      btn.style.backgroundColor = followGPS ? "#4caf50" : "#f44336";
    };

    return btn;
  };
  button.addTo(map);
}

// Initialize features
addSearchFeature();
addGPSFollowButton();

// Simulate GPS data updates
setInterval(() => {
  const newLat = 14.839439 + (Math.random() * 0.005 - 0.001);
  const newLon = 120.81383 + (Math.random() * 0.005 - 0.001);
  updateLocation(newLat, newLon);
}, 5000);
