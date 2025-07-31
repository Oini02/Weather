
const API_KEY = '64f2301c872493dfd69bc2a5d94d5a70';
const BASE_URL = 'https://api.openweathermap.org/data/2.5';


const datetimeElement = document.getElementById('datetime');
const cityInput = document.getElementById('cityInput');
const searchBtn = document.getElementById('searchBtn');
const locateBtn = document.getElementById('locateBtn');
const currentWeather = document.getElementById('currentWeather');
const errorMsg = document.getElementById('errorMsg');

function updateDateTime() {
  const now = new Date();
  datetimeElement.textContent = now.toLocaleString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

setInterval(updateDateTime, 60000);
updateDateTime();

const bgVideo = document.getElementById('bg-video');
const videoSource = document.getElementById('video-source');
const videoMap = {
  Clear: 'clear.mp4',
  Clouds: 'cloudy.mp4',
  Rain: 'rainy.mp4',
  Thunderstorm: 'storm.mp4',
  Fog: 'fog.mp4'
  
};
function updateBackground(weatherCondition) {
  const videoFile = videoMap[weatherCondition] || 'clear.mp4';
  const videoPath = `videos/${videoFile}`;
  videoSource.setAttribute('src', videoPath);
  bgVideo.load();
  bgVideo.play().catch(e => console.log("Autoplay blocked:", e));
}

async function fetchWeather(city) {
  try {
  
    const currentResponse = await fetch(`${BASE_URL}/weather?q=${city}&units=metric&appid=${API_KEY}`);
    if (!currentResponse.ok) throw new Error('City not found');
    
    const currentData = await currentResponse.json();
    
    
    const forecastResponse = await fetch(`${BASE_URL}/forecast?q=${city}&units=metric&appid=${API_KEY}`);
    if (!forecastResponse.ok) throw new Error('Forecast not available');
    
    const forecastData = await forecastResponse.json();
    
    return { current: currentData, forecast: forecastData };
  } catch (error) {
    throw error;
  }
}

async function fetchWeatherByCoords(lat, lon) {
  try {
  
    const currentResponse = await fetch(`${BASE_URL}/weather?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`);
    if (!currentResponse.ok) throw new Error('Location weather not available');
    
    const currentData = await currentResponse.json();
    
    
    const forecastResponse = await fetch(`${BASE_URL}/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`);
    if (!forecastResponse.ok) throw new Error('Forecast not available');
    
    const forecastData = await forecastResponse.json();
    
    return { current: currentData, forecast: forecastData };
  } catch (error) {
    throw error;
  }
}


function displayWeather(data) {

  const current = data.current;
  const forecast = data.forecast;

    updateBackground(current.weather[0].main);
  
  document.querySelector('.city').textContent = `${current.name}, ${current.sys.country}`;
  document.querySelector('.temperature').textContent = `${Math.round(current.main.temp)}°C`;
  document.querySelector('.feels-like').textContent = `Feels like ${Math.round(current.main.feels_like)}°C`;
  document.querySelector('.description').textContent = current.weather[0].description;
  document.querySelector('.weather-icon').src = `https://openweathermap.org/img/wn/${current.weather[0].icon}@2x.png`;
  
  
  const now = new Date();
  document.querySelector('.time').textContent = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  
  
  document.getElementById('humidity').textContent = `${current.main.humidity}%`;
  document.getElementById('windSpeed').textContent = `${current.wind.speed}m/s`;
  document.getElementById('clouds').textContent = `${current.clouds.all}%`;
  document.getElementById('pressure').textContent = `${current.main.pressure}hPa`;
  
  
  const sunriseTime = new Date(current.sys.sunrise * 1000);
  const sunsetTime = new Date(current.sys.sunset * 1000);
  
  document.getElementById('sunrise').textContent = sunriseTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  document.getElementById('sunset').textContent = sunsetTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  
  
  const forecastDays = document.getElementById('forecastDays');
  forecastDays.innerHTML = '';
  
  const dailyForecast = {};
  forecast.list.forEach(item => {
    const date = new Date(item.dt * 1000);
    const day = date.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' });
    
    if (!dailyForecast[day]) {
      dailyForecast[day] = {
        temp: item.main.temp,
        icon: item.weather[0].icon,
        description: item.weather[0].description
      };
    }
  });
  
  
  const days = Object.keys(dailyForecast).slice(0, 5);
  days.forEach(day => {
    const forecast = dailyForecast[day];
    
    const dayElement = document.createElement('div');
    dayElement.className = 'forecast-day';
    dayElement.innerHTML = `
      <div class="day">${day}</div>
      <img src="https://openweathermap.org/img/wn/${forecast.icon}.png" alt="${forecast.description}">
      <div class="description">${forecast.description}</div>
      <div class="temp">${Math.round(forecast.temp)}°C</div>
    `;
    
    forecastDays.appendChild(dayElement);
  });
  
 
  currentWeather.classList.remove('hidden');
  errorMsg.classList.add('hidden');
}


function showError(message) {
  errorMsg.textContent = message;
  errorMsg.classList.remove('hidden');
  currentWeather.classList.add('hidden');
}



searchBtn.addEventListener('click', async () => {
  const city = cityInput.value.trim();
  if (!city) return;
  
  try {
    const weatherData = await fetchWeather(city);
    displayWeather(weatherData);
  } catch (error) {
    showError('Could not fetch weather data. Please try again.');
  }
});

locateBtn.addEventListener('click', () => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const weatherData = await fetchWeatherByCoords(
            position.coords.latitude,
            position.coords.longitude
          );
          displayWeather(weatherData);
          cityInput.value = weatherData.current.name;
        } catch (error) {
          showError('Could not fetch weather data for your location.');
        }
      },
      (error) => {
        showError('Location access denied. Please enable location services.');
      }
    );
  } else {
    showError('Geolocation is not supported by your browser.');
  }
});

window.addEventListener('load', async () => {
  try {
    const weatherData = await fetchWeather('Dhaka');
    displayWeather(weatherData);
  } catch (error) {
    
    currentWeather.classList.add('hidden');
    errorMsg.classList.add('hidden');
  }
  
currentWeather.classList.add('hidden');


const bgVideo = document.getElementById('bg-video');
const videoSource = document.getElementById('video-source');
const videoMap = {
  Sunny:'sunny.mp4',
  Clouds: 'cloudy.mp4',
  Rain: 'rainy.mp4',
  Thunderstorm: 'storm.mp4',
  Fog: 'fog.mp4',
  
};



function updateBackground(weathercondition) {
  const videoFile = videoMap[weathercondition] || 'sunny.mp4';
  const videopath = `./videos/${videoFile}`;
  bgVideo.src = videopath;
  bgVideo.onload();
    bgVideo.play().catch(e => console.log("Video autoplay prevented:", e));
}


function displayWeather(data) {
  const current = data.current;

  
  updateBackground(current.weather[0].main);


  document.querySelector('.city').textContent = `${current.name}, ${current.sys.country}`;
  document.querySelector('.temperature').textContent = `${Math.round(current.main.temp)}°C`;
  document.querySelector('.feels-like').textContent = `Feels like ${Math.round(current.main.feels_like)}°C`;
  document.querySelector('.description').textContent = current.weather[0].description;
  document.querySelector('.weather-icon').src = `https://openweathermap.org/img/wn/${current.weather[0].icon}@2x.png`;



  currentWeather.classList.remove('hidden');
  errorMsg.classList.add('hidden');
}

window.addEventListener('load', () => {
  currentWeather.classList.add('hidden');
  errorMsg.classList.add('hidden');
});

});