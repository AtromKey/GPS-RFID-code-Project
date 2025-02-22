// Initialize the map
const map = L.map("map", {
  zoomControl: true,
  maxZoom: 18,
  minZoom: 10,
}).setView([0, 0], 13);

// Add OpenStreetMap tile layer
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution:
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
}).addTo(map);

// Define a reusable GPS marker icon
function createGPSIcon() {
  return L.icon({
    iconUrl: "https://cdn-icons-png.flaticon.com/512/684/684908.png",
    iconSize: [30, 45],
    iconAnchor: [15, 45],
    popupAnchor: [1, -30],
    shadowSize: [50, 50],
  });
}

// // Initialize the GPS marker
// const gpsIcon = createGPSIcon();
// const gpsMarker = L.marker([14.839439, 120.81383], { icon: gpsIcon })
//   .addTo(map)
//   .bindPopup("GPS Location")
//   .openPopup();

let searchMarker;
let clickedMarker;
let followGPS = true;

// Reverse geocoding using Nominatim
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
console.log(Hello);
// Add debounce for search input
function debounce(func, delay) {
  let timer;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => func.apply(this, args), delay);
  };
}

// Add search functionality using Nominatim
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

      const apiUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
        query
      )}`;

      try {
        const response = await fetch(apiUrl);
        const data = await response.json();

        suggestions.innerHTML = "";
        if (data.length === 0) {
          suggestions.innerHTML = "<div>No results found</div>";
          suggestions.style.display = "block";
          return;
        }

        data.forEach((result) => {
          const { display_name, lat, lon } = result;

          const suggestion = document.createElement("div");
          suggestion.textContent = display_name;
          suggestion.style.cursor = "pointer";
          suggestion.style.padding = "8px";
          suggestion.style.borderBottom = "1px solid #eee";

          suggestion.addEventListener("click", () => {
            if (searchMarker) map.removeLayer(searchMarker);
            searchMarker = L.marker([lat, lon], { icon: createGPSIcon() })
              .addTo(map)
              .bindPopup(
                `<b>Search Location:</b><br>${display_name}<br>
                <b>Coordinates:</b> ${lat}, ${lon}`
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

// Define the custom icon for the clicked marker
function createClickedIcon() {
  return L.icon({
    iconUrl:
      "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
    iconSize: [32, 42],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });
}

// Add click event listener to update location on map click
map.on("click", async function (e) {
  const lat = e.latlng.lat;
  const lon = e.latlng.lng;

  if (clickedMarker) map.removeLayer(clickedMarker);

  const landmarkDescription = await getLandmarkDescription(lat, lon);

  clickedMarker = L.marker([lat, lon], { icon: createClickedIcon() })
    .addTo(map)
    .bindPopup(
      `<b>Clicked Location:</b><br>${landmarkDescription}<br>
      <b>Coordinates:</b> ${lat.toFixed(6)}, ${lon.toFixed(6)}`
    )
    .openPopup();

  map.setView([lat, lon], map.getZoom());
});
