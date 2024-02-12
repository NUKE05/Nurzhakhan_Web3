const button = document.getElementById("getWeatherInfo");
let map = null;
let cityMarker = null;

async function getWeather() {
    const container = document.getElementById("main-container")
    container.style.display = "block";
    
    const cityInput = document.getElementById('cityInput').value.trim();

    if (!cityInput) {
        weatherResult.textContent = 'Пожалуйста введите название вашего города.';
        return;
    }

    try {
        const response = await fetch(`/weather/${encodeURIComponent(cityInput)}`);
        if (!response.ok) {
        throw new Error('Прогноз погоды не может быть изображен.');
        }
        const data = await response.json();

        const cityData = {
        name: cityInput,
        lat: data.coordinates.lat,
        lng: data.coordinates.lon,
        };

        const tempToDisplay = document.getElementById("current_temp")
        tempToDisplay.innerHTML = '';

        const weatherIcon = document.getElementById("weatherIcon")

        const weatherHTML_2 = `
        <h4>${cityInput}, ${data.country}. <strong class="text-muted text-capitalize fs-6">${data.description}</strong></h4>
        <p>Temperature: <strong>${data.temperature}°C</strong></p>
        <p>Feels like: <strong>${data.feelsLike}°C</strong></p>
        <p>Humidity: <strong>${data.humidity}%</strong></p>
        <p>Wind speed: <strong>${data.windSpeed} км/ч</strong></p>
        <p>Rain Volume: <strong>${data.rainVolume} мм</strong></p>
        `;

        tempToDisplay.insertAdjacentHTML("beforeend", weatherHTML_2)   
        
        weatherIcon.src = `https://openweathermap.org/img/w/${data.icon}.png`;
        weatherIcon.alt = data.description;

        if (!map) {
        map = L.map('map').setView([cityData.lat, cityData.lng], 12);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);
        cityMarker = L.marker([cityData.lat, cityData.lng]).addTo(map);
        } else {
        map.setView([cityData.lat, cityData.lng], 12);
        cityMarker.setLatLng([cityData.lat, cityData.lng]);
        }

    } catch (error) {
        tempToDisplay.textContent = `Error fetching weather data: ${error.message}`;
        console.error('Error fetching weather data:', error);
    }
}
  
button.addEventListener("click", getWeather);
