function getLocation() {
  const status = document.getElementById("status");
  status.textContent = "Getting your location...";

  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(showMap, showError);
  } else {
    status.textContent = "Geolocation not supported by this browser.";
  }
}

function showMap(position) {
  const lat = position.coords.latitude;
  const lon = position.coords.longitude;

  document.getElementById("status").textContent = "You are here.";

  const map = L.map('map').setView([lat, lon], 14);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
  }).addTo(map);

  const userMarker = L.marker([lat, lon])
    .addTo(map)
    .bindPopup('📍 Your Location')
    .openPopup();

  findNearbyHospitals(lat, lon, map);
}

function findNearbyHospitals(lat, lon, map) {
  const query = `https://nominatim.openstreetmap.org/search?format=json&q=hospital+near+${lat},${lon}`;

  fetch(query)
    .then(res => res.json())
    .then(data => {
      if (data.length === 0) {
        document.getElementById("status").textContent = "No nearby services found.";
      } else {
        document.getElementById("status").textContent = `Found ${data.length} nearby hospitals.`;
        data.slice(0, 5).forEach(place => {
          L.marker([place.lat, place.lon])
            .addTo(map)
            .bindPopup("🏥 " + place.display_name);
        });
      }
    })
    .catch(err => {
      document.getElementById("status").textContent = "Failed to fetch nearby services.";
      console.error(err);
    });
}

function showError(error) {
  const status = document.getElementById("status");
  switch (error.code) {
    case error.PERMISSION_DENIED:
      status.textContent = "User denied the request for Geolocation.";
      break;
    case error.POSITION_UNAVAILABLE:
      status.textContent = "Location information is unavailable.";
      break;
    case error.TIMEOUT:
      status.textContent = "The request to get user location timed out.";
      break;
    case error.UNKNOWN_ERROR:
      status.textContent = "An unknown error occurred.";
      break;
  }
}

