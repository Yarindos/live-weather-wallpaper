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
    
    console.log("Поточна погода (API):", main);

    if (main.includes('rain') || main.includes('drizzle') || main.includes('thunderstorm')) {
        body.classList.add('weather-rainy');
    } else if (main.includes('cloud')) {
        body.classList.add('weather-clouds');
    } else if (main.includes('snow')) {
        body.classList.add('weather-snow');
    } else {
        body.classList.add('weather-clear');
    }
}

// Функція отримання погоди для Києва за замовчуванням
function getLocation() {
    // Вказуємо координати Києва напряму
    const lat = 50.4501;
    const lon = 30.5234;
    fetchWeather(lat, lon);
}

// Початкове налаштування
setInterval(updateClock, 1000);
updateClock();
getLocation(); // Викликаємо одразу для Києва

// Оновлювати погоду кожні 30 хвилин
setInterval(getLocation, 30 * 60 * 1000);
