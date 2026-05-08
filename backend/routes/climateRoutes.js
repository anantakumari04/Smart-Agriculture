const express = require('express');
const router = express.Router();
const Farm = require('../models/Farm');
const ClimateData = require('../models/ClimateData');
const Alert = require('../models/Alert');
const { protect, authorize } = require('../middleware/auth');
const axios = require('axios');

// Get all climate data for user's farms
router.get('/data', protect, async (req, res) => {
  try {
    const farms = await Farm.find({ owner: req.user.id });
    const farmIds = farms.map(f => f._id);

    const climateData = await ClimateData.find({ farm: { $in: farmIds } })
      .populate('farm')
      .sort({ timestamp: -1 });

    res.status(200).json({ success: true, data: climateData });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get latest climate data for a specific farm
router.get('/latest/:farmId', protect, async (req, res) => {
  try {
    const latestData = await ClimateData.findOne({ farm: req.params.farmId })
      .sort({ timestamp: -1 });

    res.status(200).json({ success: true, data: latestData });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get climate data statistics (last 24 hours)
router.get('/stats/:farmId', protect, async (req, res) => {
  try {
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const data = await ClimateData.find({
      farm: req.params.farmId,
      timestamp: { $gte: twentyFourHoursAgo }
    }).sort({ timestamp: 1 });

    if (data.length === 0) {
      return res.status(200).json({
        success: true,
        stats: {
          avgTemperature: 0,
          avgHumidity: 0,
          avgSoilMoisture: 0,
          minTemp: 0,
          maxTemp: 0,
          tempRange: '0°C - 0°C'
        }
      });
    }

    const temperatures = data.map(d => d.temperature);
    const humidities = data.map(d => d.humidity);
    const soilMoistures = data.map(d => d.soilMoisture);

    const stats = {
      avgTemperature: (temperatures.reduce((a, b) => a + b, 0) / temperatures.length).toFixed(2),
      avgHumidity: (humidities.reduce((a, b) => a + b, 0) / humidities.length).toFixed(1),
      avgSoilMoisture: (soilMoistures.reduce((a, b) => a + b, 0) / soilMoistures.length).toFixed(1),
      minTemp: Math.min(...temperatures).toFixed(2),
      maxTemp: Math.max(...temperatures).toFixed(2),
      tempRange: `${Math.min(...temperatures).toFixed(1)}° - ${Math.max(...temperatures).toFixed(1)}°C`
    };

    res.status(200).json({ success: true, stats });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Fetch data from OpenWeather API
router.post('/fetch-api/:farmId', protect, async (req, res) => {
  try {
    const farm = await Farm.findById(req.params.farmId);
    if (!farm) {
      return res.status(404).json({ message: 'Farm not found' });
    }

    const lat = farm.latitude || 28.7041; // Default: Delhi
    const lon = farm.longitude || 77.1025;

    const response = await axios.get(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${process.env.OPENWEATHER_API_KEY}&units=metric`
    );

    const weatherData = response.data;

    const climateData = new ClimateData({
      farm: farm._id,
      temperature: weatherData.main.temp,
      humidity: weatherData.main.humidity,
      soilMoisture: 50 + Math.random() * 40, // Simulated soil moisture
      airQuality: weatherData.main.humidity > 80 ? 'Poor' : 'Good',
      windSpeed: weatherData.wind.speed,
      rainfall: weatherData.rain ? weatherData.rain['1h'] : 0,
      source: 'api'
    });

    await climateData.save();

    // Check thresholds and create alerts if needed
    await checkThresholds(farm, climateData);

    res.status(201).json({ success: true, data: climateData });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Generate AI recommendations using Gemini
router.get('/recommendations/:farmId', protect, async (req, res) => {
  try {
    const farm = await Farm.findById(req.params.farmId);
    if (!farm) {
      return res.status(404).json({ success: false, message: 'Farm not found' });
    }

    const latestData = await ClimateData.findOne({ farm: req.params.farmId })
      .sort({ timestamp: -1 });

    if (!latestData) {
      return res.status(404).json({ success: false, message: 'No climate data available' });
    }

    if (!process.env.GEMINI_API_KEY) {
      console.warn('Gemini API key is not configured. Returning fallback recommendations.');
      return res.status(200).json({
        success: true,
        data: latestData,
        recommendations: generateFallbackRecommendations(latestData),
        source: 'fallback'
      });
    }

    const prompt = `You are an agricultural AI assistant. Analyze the climate data below and return an array of practical farming recommendations in valid JSON. Each recommendation must include id, icon, title, recommendation, severity, description, and action. Use severity values critical, warning, or optimal.

Climate data:
- Temperature: ${latestData.temperature}°C
- Humidity: ${latestData.humidity}%
- Soil moisture: ${latestData.soilMoisture}%
- Air quality: ${latestData.airQuality}
- Wind speed: ${latestData.windSpeed} m/s
- Rainfall: ${latestData.rainfall} mm

Return only JSON. Do not include any explanation outside the JSON array.`;

    try {
      const aiResponse = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta2/models/gemini-1.5-mini:generateText?key=${process.env.GEMINI_API_KEY}`,
        {
          prompt: {
            text: prompt
          },
          temperature: 0.2,
          maxOutputTokens: 450
        },
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      const text = aiResponse.data?.candidates?.[0]?.content || '';
      let recommendations = [];

      try {
        recommendations = JSON.parse(text);
      } catch (parseError) {
        console.warn('Gemini response parse error, using fallback. Response text:', text);
        recommendations = generateFallbackRecommendations(latestData);
      }

      if (!Array.isArray(recommendations)) {
        console.warn('Gemini response did not return an array, using fallback. Raw response:', text);
        recommendations = generateFallbackRecommendations(latestData);
      }

      return res.status(200).json({
        success: true,
        data: latestData,
        recommendations,
        source: 'gemini'
      });
    } catch (error) {
      console.error('Gemini request failed:', error.response?.status, error.response?.data || error.message || error);
      return res.status(200).json({
        success: true,
        data: latestData,
        recommendations: generateFallbackRecommendations(latestData),
        source: 'fallback',
        message: 'Gemini request failed, returned fallback recommendations'
      });
    }
  } catch (error) {
    console.error('AI recommendation route failed:', error.response?.status, error.response?.data || error.message || error);
    if (latestData) {
      return res.status(200).json({
        success: true,
        data: latestData,
        recommendations: generateFallbackRecommendations(latestData),
        source: 'fallback',
        message: 'Fallback recommendations returned after server error'
      });
    }
    res.status(500).json({ success: false, message: error.message || 'Unknown error' });
  }
});

// Add manual climate data
router.post('/manual', protect, authorize('admin'), async (req, res) => {
  try {
    const { farmId, temperature, humidity, soilMoisture, airQuality } = req.body;

    const farm = await Farm.findById(farmId);
    if (!farm) {
      return res.status(404).json({ message: 'Farm not found' });
    }

    const climateData = new ClimateData({
      farm: farmId,
      temperature,
      humidity,
      soilMoisture,
      airQuality,
      source: 'manual'
    });

    await climateData.save();

    // Check thresholds and create alerts
    await checkThresholds(farm, climateData);

    res.status(201).json({ success: true, data: climateData });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

async function checkThresholds(farm, climateData) {
  const thresholds = farm.thresholds;

  if (climateData.temperature < thresholds.minTemperature) {
    await Alert.create({
      farm: farm._id,
      type: 'temperature',
      message: `Temperature is below minimum threshold (${climateData.temperature}°C)`,
      severity: 'high',
      triggeredValue: climateData.temperature,
      threshold: thresholds.minTemperature
    });
  }

  if (climateData.temperature > thresholds.maxTemperature) {
    await Alert.create({
      farm: farm._id,
      type: 'temperature',
      message: `Temperature exceeded maximum threshold (${climateData.temperature}°C)`,
      severity: 'high',
      triggeredValue: climateData.temperature,
      threshold: thresholds.maxTemperature
    });
  }

  if (climateData.humidity < thresholds.minHumidity) {
    await Alert.create({
      farm: farm._id,
      type: 'humidity',
      message: `Humidity is below minimum threshold (${climateData.humidity}%)`,
      severity: 'medium',
      triggeredValue: climateData.humidity,
      threshold: thresholds.minHumidity
    });
  }

  if (climateData.humidity > thresholds.maxHumidity) {
    await Alert.create({
      farm: farm._id,
      type: 'humidity',
      message: `Humidity exceeded maximum threshold (${climateData.humidity}%)`,
      severity: 'medium',
      triggeredValue: climateData.humidity,
      threshold: thresholds.maxHumidity
    });
  }
}

function generateFallbackRecommendations(data) {
  const recommendations = [];
  const temperature = Number(data?.temperature ?? 0);
  const humidity = Number(data?.humidity ?? 0);
  const soilMoisture = Number(data?.soilMoisture ?? 0);
  const airQuality = String(data?.airQuality ?? 'Good');

  if (temperature > 35) {
    recommendations.push({
      id: 1,
      icon: '🌡️',
      title: 'High Temperature Alert',
      recommendation: 'High temperature → Irrigation needed',
      severity: 'critical',
      description: `Temperature is ${temperature.toFixed(1)}°C. Provide immediate irrigation to prevent crop stress and heat damage.`,
      action: 'Increase watering frequency'
    });
  } else if (temperature > 30) {
    recommendations.push({
      id: 2,
      icon: '🌡️',
      title: 'Moderate Temperature',
      recommendation: 'Monitor temperature closely',
      severity: 'warning',
      description: `Temperature is ${temperature.toFixed(1)}°C. Consider irrigation if needed.`,
      action: 'Regular watering schedule'
    });
  }

  if (data.humidity < 30) {
    recommendations.push({
      id: 3,
      icon: '💧',
      title: 'Low Humidity Alert',
      recommendation: 'Water your crops today',
      severity: 'critical',
      description: `Humidity is only ${data.humidity.toFixed(1)}%. This dry condition can stress plants.`,
      action: 'Increase irrigation and mulching'
    });
  } else if (data.humidity > 80) {
    recommendations.push({
      id: 4,
      icon: '💧',
      title: 'High Humidity Alert',
      recommendation: 'Risk of fungal diseases',
      severity: 'warning',
      description: `Humidity is ${data.humidity.toFixed(1)}%. High humidity increases disease risk.`,
      action: 'Ensure proper ventilation and drainage'
    });
  } else {
    recommendations.push({
      id: 5,
      icon: '💧',
      title: 'Humidity Optimal',
      recommendation: 'Humidity levels are good',
      severity: 'optimal',
      description: `Humidity is ${data.humidity.toFixed(1)}%. Conditions are favorable for crop growth.`,
      action: 'Continue regular monitoring'
    });
  }

  if (data.soilMoisture < 20) {
    recommendations.push({
      id: 6,
      icon: '🌱',
      title: 'Low Soil Moisture',
      recommendation: 'Irrigation required immediately',
      severity: 'critical',
      description: `Soil moisture is only ${data.soilMoisture.toFixed(1)}%. Plants need water urgently.`,
      action: 'Start deep watering immediately'
    });
  } else if (data.soilMoisture > 70) {
    recommendations.push({
      id: 7,
      icon: '🌱',
      title: 'High Soil Moisture',
      recommendation: 'Risk of waterlogging',
      severity: 'warning',
      description: `Soil moisture is ${data.soilMoisture.toFixed(1)}%. Risk of root rot and fungal diseases.`,
      action: 'Improve drainage, reduce watering'
    });
  } else {
    recommendations.push({
      id: 8,
      icon: '🌱',
      title: 'Soil Moisture Optimal',
      recommendation: 'Soil conditions are ideal',
      severity: 'optimal',
      description: `Soil moisture is ${data.soilMoisture.toFixed(1)}%. Perfect conditions for crop growth.`,
      action: 'Maintain current watering schedule'
    });
  }

  if (data.airQuality === 'Poor' || data.airQuality === 'poor') {
    recommendations.push({
      id: 9,
      icon: '💨',
      title: 'Poor Air Quality',
      recommendation: 'Check for pollution or stagnant air',
      severity: 'warning',
      description: 'Air quality is poor. This may affect crop photosynthesis and growth.',
      action: 'Ensure adequate air circulation'
    });
  }

  const criticalCount = recommendations.filter(r => r.severity === 'critical').length;
  if (criticalCount === 0) {
    recommendations.push({
      id: 100,
      icon: '✅',
      title: 'Overall Status',
      recommendation: 'All conditions are optimal',
      severity: 'optimal',
      description: 'Your farm conditions are excellent for crop growth.',
      action: 'Continue current practices'
    });
  } else if (criticalCount >= 2) {
    recommendations.unshift({
      id: 0,
      icon: '⚠️',
      title: 'Urgent Action Required',
      recommendation: 'Multiple critical conditions detected',
      severity: 'critical',
      description: `${criticalCount} critical conditions need immediate attention.`,
      action: 'Follow recommendations below'
    });
  }

  return recommendations;
}

module.exports = router;
