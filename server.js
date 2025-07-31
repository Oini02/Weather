require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
const app = express();
const path = require('path');
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('../frontend')); // Updated path

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Weather API Endpoints
app.post('/api/weather', async (req, res) => {
  try {
    const { city } = req.body;
    if (!city) {
      return res.status(400).json({ error: 'City name is required' });
    }

    const apiKey = process.env.OPENWEATHER_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'Server configuration error' });
    }

    // Current Weather
    const currentUrl = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&units=metric&appid=${apiKey}`;
    const currentResponse = await fetch(currentUrl);
    if (!currentResponse.ok) {
      throw new Error(`API error: ${currentResponse.statusText}`);
    }
    const currentData = await currentResponse.json();

    // Forecast
    const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(city)}&units=metric&appid=${apiKey}`;
    const forecastResponse = await fetch(forecastUrl);
    if (!forecastResponse.ok) {
      throw new Error(`API error: ${forecastResponse.statusText}`);
    }
    const forecastData = await forecastResponse.json();

    // Response
    res.json({
      current: {
        city: currentData.name,
        country: currentData.sys?.country,
        temp: currentData.main?.temp,
        feels_like: currentData.main?.feels_like,
        humidity: currentData.main?.humidity,
        pressure: currentData.main?.pressure,
        wind_speed: currentData.wind?.speed,
        description: currentData.weather[0]?.description,
        icon: currentData.weather[0]?.icon,
        sunrise: currentData.sys?.sunrise,
        sunset: currentData.sys?.sunset,
        clouds: currentData.clouds?.all
      },
      forecast: {
        list: forecastData.list?.map(item => ({
          dt: item.dt,
          temp: item.main?.temp,
          feels_like: item.main?.feels_like,
          description: item.weather[0]?.description,
          icon: item.weather[0]?.icon
        }))
      }
    });

  } catch (error) {
    console.error('Weather API Error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch weather data',
      details: error.message 
    });
  }
});

// Coordinate-based Weather Endpoint
app.post('/api/weather/coordinates', async (req, res) => {
  try {
    const { lat, lon } = req.body;
    if (!lat || !lon) {
      return res.status(400).json({ error: 'Latitude and longitude are required' });
    }

    const apiKey = process.env.OPENWEATHER_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'Server configuration error' });
    }

    // Current Weather by Coordinates
    const currentUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`;
    const currentResponse = await fetch(currentUrl);
    if (!currentResponse.ok) {
      throw new Error(`API error: ${currentResponse.statusText}`);
    }
    const currentData = await currentResponse.json();

    // Forecast by Coordinates
    const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`;
    const forecastResponse = await fetch(forecastUrl);
    if (!forecastResponse.ok) {
      throw new Error(`API error: ${forecastResponse.statusText}`);
    }
    const forecastData = await forecastResponse.json();

    res.json({
      current: {
        city: currentData.name,
        country: currentData.sys?.country,
        temp: currentData.main?.temp,
        feels_like: currentData.main?.feels_like,
        humidity: currentData.main?.humidity,
        pressure: currentData.main?.pressure,
        wind_speed: currentData.wind?.speed,
        description: currentData.weather[0]?.description,
        icon: currentData.weather[0]?.icon,
        sunrise: currentData.sys?.sunrise,
        sunset: currentData.sys?.sunset,
        clouds: currentData.clouds?.all
      },
      forecast: {
        list: forecastData.list?.map(item => ({
          dt: item.dt,
          temp: item.main?.temp,
          feels_like: item.main?.feels_like,
          description: item.weather[0]?.description,
          icon: item.weather[0]?.icon
        }))
      }
    });

  } catch (error) {
    console.error('Weather API Error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch weather data',
      details: error.message 
    });
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log('Frontend served from ../frontend');

});