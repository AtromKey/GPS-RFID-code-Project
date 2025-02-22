import {
  getDatabase,
  ref,
  set,
  get,
} from "https://www.gstatic.com/firebasejs/9.1.3/firebase-database.js";

// Reference to Firebase Realtime Database
const database = getDatabase();

// Function to check the current time and determine the valid tracking timeframe
function getValidTrackingTime() {
  const now = new Date();
  const hours = now.getHours();

  if (hours < 12) {
    return { start: "07:00", end: "12:00" }; // Morning timeframe
  } else if (hours < 18) {
    return { start: "13:00", end: "18:00" }; // Afternoon timeframe
  } else {
    return null; // Outside of allowed hours
  }
}

// Function to override GPS tracking via RFID scan
function overrideGPSWithRFID(rfidTag) {
  const trackingTime = getValidTrackingTime();

  if (!trackingTime) {
    console.log("GPS tracking cannot be activated beyond class hours.");
    return;
  }

  const gpsTrackingRef = ref(database, "gps_tracking");

  // Store the activation status with the valid timeframe
  set(gpsTrackingRef, {
    activatedByRFID: true,
    rfidTag: rfidTag,
    trackingStart: trackingTime.start,
    trackingEnd: trackingTime.end,
    timestamp: new Date().toISOString(),
  })
    .then(() => {
      console.log(
        `GPS tracking activated by RFID (${rfidTag}) from ${trackingTime.start} to ${trackingTime.end}.`
      );
    })
    .catch((error) => {
      console.error("Error activating GPS tracking via RFID:", error);
    });
}

// Example function call (RFID tag should be dynamically retrieved)
overrideGPSWithRFID("1234567890"); // Replace with actual RFID data
