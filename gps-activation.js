// gps-activation.js

let isTrackingActive = false;

// Function to check if GPS should be active based on time
function checkTrackingTime() {
  let now = new Date();
  let hours = now.getHours();

  // Morning session: 7 AM - 12 PM
  let isMorning = hours >= 7 && hours < 12;

  // Afternoon session: 1 PM - 6 PM
  let isAfternoon = hours >= 13 && hours < 18;

  if (isMorning || isAfternoon) {
    activateGPS();
  } else {
    deactivateGPS();
  }
}

// Function to activate GPS tracking
function activateGPS() {
  if (!isTrackingActive) {
    console.log("GPS tracking activated.");
    isTrackingActive = true;
    // Call actual GPS start function here (e.g., start collecting data)
  }
}

// Function to deactivate GPS tracking
function deactivateGPS() {
  if (isTrackingActive) {
    console.log("GPS tracking deactivated.");
    isTrackingActive = false;
    // Call actual GPS stop function here (e.g., stop collecting data)
  }
}

// Function to activate GPS via RFID scan (override timeframes)
function activateGPSWithRFID() {
  console.log("GPS tracking activated via RFID override.");
  activateGPS();
}

// Run time check every minute
setInterval(checkTrackingTime, 60000); // 60 seconds

// Run immediately on page load
checkTrackingTime();
