const API_KEY = '88c9f0208d3c11baebd0089f31a17aa0';

function updateClock() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    document.getElementById('clock').textContent = `${hours}:${minutes}`;
    
    updateTimeTheme(now.getHours());
}

function updateTimeTheme(hour) {
    const body = document.body;
    body.classList.remove('time-sunrise', 'time-day', 'time-sunset', 'time-night');
    
    if (hour >= 5 && hour < 8) body.classList.add('time-sunrise');
    else if (hour >= 8 && hour < 18) body.classList.add('time-day');
    else if (hour >= 18 && hour < 21) body.classList.add('time-sunset');
    else body.classList.add('time-night');
}

async function fetchWeather(lat, lon) {
    try {
        const res = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric&lang=uk`);
        const data = await res.json();
        
        document.getElementById('city').textContent = data.name;
        document.getElementById('temp').textContent = `${Math.round(data.main.temp)}°C`;
        document.getElementById('description').textContent = data.weather[0].description;
        
        applyWeatherEffect(data.weather[0].main.toLowerCase());
    } catch (err) {
        console.error("Помилка отримання погоди:", err);
    }
}

function applyWeatherEffect(main) {
    const body = document.body;
    body.classList.remove('weather-clear', 'weather-rainy', 'weather-clouds', 'weather-snow');
    
    if (main.includes('rain') || main.includes('drizzle')) body.classList.add('weather-rainy');
    else if (main.includes('cloud')) body.classList.add('weather-clouds');
    else if (main.includes('snow')) body.classList.add('weather-snow');
    else body.classList.add('weather-clear');
}

function getLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (pos) => fetchWeather(pos.coords.latitude, pos.coords.longitude),
            () => {
                document.getElementById('city').textContent = "Київ (GPS недоступний)";
                fetchWeather(50.4501, 30.5234); // Дефолт на Київ
            }
        );
    } else {
        document.getElementById('city').textContent = "Київ (GPS не підтримується)";
        fetchWeather(50.4501, 30.5234);
    }
}

// Початкове налаштування
setInterval(updateClock, 1000);
updateClock();
getLocation();

// Оновлювати погоду кожні 30 хвилин
setInterval(getLocation, 30 * 60 * 1000);
