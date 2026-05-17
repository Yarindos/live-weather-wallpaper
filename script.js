const API_KEY = '88c9f0208d3c11baebd0089f31a17aa0';
const canvas = document.getElementById('weather-canvas');
const ctx = canvas.getContext('2d');
let particles = [];
let weatherType = 'clear';

// Resize canvas
function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener('resize', resize);
resize();

class Particle {
    constructor(type) {
        this.type = type;
        this.reset();
    }

    reset() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * -canvas.height;
        this.vx = (Math.random() - 0.5) * 2; // Wind
        
        if (this.type === 'rain') {
            this.vy = Math.random() * 15 + 10;
            this.len = Math.random() * 20 + 10;
            this.opacity = Math.random() * 0.3 + 0.1;
        } else {
            this.vy = Math.random() * 2 + 1;
            this.len = Math.random() * 3 + 2;
            this.opacity = Math.random() * 0.5 + 0.3;
        }
    }

    update() {
        this.y += this.vy;
        this.x += this.vx;
        if (this.y > canvas.height) this.reset();
    }

    draw() {
        ctx.strokeStyle = `rgba(255, 255, 255, ${this.opacity})`;
        ctx.lineWidth = this.type === 'rain' ? 1 : this.len;
        ctx.beginPath();
        ctx.moveTo(this.x, this.y);
        if (this.type === 'rain') {
            ctx.lineTo(this.x + this.vx, this.y + this.len);
        } else {
            ctx.arc(this.x, this.y, this.len / 2, 0, Math.PI * 2);
        }
        ctx.stroke();
    }
}

function initParticles(type) {
    particles = [];
    const count = type === 'rain' ? 1000 : 200;
    for (let i = 0; i < count; i++) {
        particles.push(new Particle(type));
    }
}

function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (weatherType !== 'clear' && weatherType !== 'clouds') {
        particles.forEach(p => {
            p.update();
            p.draw();
        });
    }
    requestAnimationFrame(animate);
}
animate();

function updateClock() {
    const now = new Date();
    document.getElementById('clock').textContent = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
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
        if (res.status === 401) throw new Error("API_KEY_NOT_ACTIVE");
        const data = await res.json();
        document.getElementById('city').textContent = data.name;
        document.getElementById('temp').textContent = `${Math.round(data.main.temp)}°C`;
        document.getElementById('description').textContent = data.weather[0].description;
        setWeather(data.weather[0].main.toLowerCase());
    } catch (err) {
        if (err.message === "API_KEY_NOT_ACTIVE") {
            document.getElementById('city').textContent = "Київ (Демо)";
            document.getElementById('description').textContent = "API ще не активний";
            document.getElementById('temp').textContent = "15°C";
            setWeather('rain');
        }
    }
}

function setWeather(type) {
    const body = document.body;
    body.classList.remove('weather-clear', 'weather-rainy', 'weather-clouds', 'weather-snow', 'weather-thunderstorm');
    
    if (type.includes('thunderstorm')) {
        weatherType = 'rain';
        body.classList.add('weather-thunderstorm');
        startLightning();
        initParticles('rain');
    } else if (type.includes('rain') || type.includes('drizzle')) {
        weatherType = 'rain';
        body.classList.add('weather-rainy');
        stopLightning();
        initParticles('rain');
    } else if (type.includes('snow')) {
        weatherType = 'snow';
        body.classList.add('weather-snow');
        stopLightning();
        initParticles('snow');
    } else {
        weatherType = type.includes('cloud') ? 'clouds' : 'clear';
        body.classList.add(`weather-${weatherType}`);
        stopLightning();
        particles = [];
    }
}

let lightningInterval;
function startLightning() {
    if (lightningInterval) return;
    const flash = document.querySelector('.lightning-flash');
    lightningInterval = setInterval(() => {
        if (Math.random() > 0.93) {
            flash.classList.add('lightning-active');
            setTimeout(() => flash.classList.remove('lightning-active'), 150);
        }
    }, 1000);
}

function stopLightning() {
    clearInterval(lightningInterval);
    lightningInterval = null;
}

function getLocation() {
    fetchWeather(50.4501, 30.5234);
}

setInterval(updateClock, 1000);
updateClock();
getLocation();
setInterval(getLocation, 30 * 60 * 1000);
