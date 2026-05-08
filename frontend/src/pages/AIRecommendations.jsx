import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getFarms, getAiRecommendations } from '../api/services';
import '../styles/dashboard.css';

function AIRecommendations({ user }) {
  const navigate = useNavigate();
  const [farms, setFarms] = useState([]);
  const [selectedFarm, setSelectedFarm] = useState(null);
  const [climateData, setClimateData] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchFarms();
  }, []);

  const fetchFarms = async () => {
    try {
      setLoading(true);
      const response = await getFarms();
      if (response.data.success && response.data.farms.length > 0) {
        setFarms(response.data.farms);
      }
    } catch (error) {
      console.error('Error fetching farms:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateRecommendations = async (farmId) => {
    try {
      setLoading(true);
      setErrorMessage('');
      const response = await getAiRecommendations(farmId);
      if (response.data.success) {
        const data = response.data.data;
        setClimateData(data);
        setRecommendations(response.data.recommendations || []);
        if (response.data.message) {
          setErrorMessage(response.data.message);
        }
      }
    } catch (error) {
      console.error('Error fetching AI recommendations:', error);
      setErrorMessage(error.response?.data?.message || 'Failed to fetch AI recommendations.');
    } finally {
      setLoading(false);
    }
  };

  const analyzeClimateData = (data) => {
    const recommendations = [];

    // Temperature recommendations
    if (data.temperature > 35) {
      recommendations.push({
        id: 1,
        icon: '🌡️',
        title: 'High Temperature Alert',
        recommendation: 'High temperature → Irrigation needed',
        severity: 'critical',
        description: `Temperature is ${data.temperature.toFixed(1)}°C. Provide immediate irrigation to prevent crop stress and heat damage.`,
        action: 'Increase watering frequency'
      });
    } else if (data.temperature > 30) {
      recommendations.push({
        id: 2,
        icon: '🌡️',
        title: 'Moderate Temperature',
        recommendation: 'Monitor temperature closely',
        severity: 'warning',
        description: `Temperature is ${data.temperature.toFixed(1)}°C. Consider irrigation if needed.`,
        action: 'Regular watering schedule'
      });
    }

    // Humidity recommendations
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

    // Soil Moisture recommendations
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

    // Air Quality recommendations
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

    // Overall recommendation
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
  };

  const handleFarmChange = (e) => {
    const farmId = e.target.value;
    const farm = farms.find(f => f._id === farmId);
    setSelectedFarm(farm);
    if (farmId) {
      generateRecommendations(farmId);
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical':
        return { bg: '#ffe6e6', border: '#e74c3c', text: '#e74c3c' };
      case 'warning':
        return { bg: '#fff3e0', border: '#f39c12', text: '#f39c12' };
      case 'optimal':
        return { bg: '#e8f5e9', border: '#27ae60', text: '#27ae60' };
      default:
        return { bg: '#e3f2fd', border: '#3498db', text: '#3498db' };
    }
  };

  if (!user) {
    return (
      <div className="dashboard-container">
        <div className="dashboard-header">
          <div className="dashboard-title">
            <span>🤖</span>
            <h1>AI Recommendations</h1>
          </div>
        </div>
        <div style={{ textAlign: 'center', padding: '3rem', color: '#95a5a6' }}>
          <p style={{ marginBottom: '1rem' }}>Please log in to access AI Recommendations.</p>
          <button 
            className="btn btn-primary"
            onClick={() => navigate('/login')}
          >
            🔐 Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div className="dashboard-title">
          <span>🤖</span>
          <h1>AI Recommendations</h1>
        </div>
        <button 
          className="btn btn-outline"
          onClick={() => navigate('/')}
        >
          ← Back to Home
        </button>
      </div>

      {/* Farm Selection */}
      <div style={{
        background: 'white',
        borderRadius: '12px',
        padding: '2rem',
        margin: '2rem',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
      }}>
        <h2 style={{
          fontSize: '1.3rem',
          fontWeight: 'bold',
          color: '#2c3e50',
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem'
        }}>
          🏠 Select a Farm
        </h2>
        
        {farms.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: '#95a5a6' }}>
            <p style={{ marginBottom: '1rem' }}>No farms found. Please create a farm first.</p>
            <button 
              className="btn btn-primary"
              onClick={() => navigate('/dashboard')}
            >
              ➕ Create Farm
            </button>
          </div>
        ) : (
          <select 
            value={selectedFarm?._id || ''} 
            onChange={handleFarmChange}
            style={{
              width: '100%',
              padding: '0.75rem 1rem',
              fontSize: '1rem',
              border: '2px solid #2ecc71',
              borderRadius: '6px',
              background: 'white',
              cursor: 'pointer'
            }}
          >
            <option value="">-- Select a Farm --</option>
            {farms.map(farm => (
              <option key={farm._id} value={farm._id}>
                {farm.name} - {farm.location}
              </option>
            ))}
          </select>
        )}
      </div>

      {selectedFarm && errorMessage && (
        <div style={{
          margin: '2rem',
          padding: '1rem 2rem',
          background: '#fdecea',
          color: '#c0392b',
          borderRadius: '8px',
          border: '1px solid #f5c6cb'
        }}>
          {errorMessage}
        </div>
      )}

      {/* Recommendations Section */}
      {selectedFarm && recommendations.length > 0 && (
        <div style={{
          margin: '2rem',
          padding: '2rem',
          background: 'white',
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
            <span style={{ fontSize: '2rem' }}>💡</span>
            <h2 style={{
              fontSize: '1.3rem',
              fontWeight: 'bold',
              color: '#2c3e50',
              margin: 0
            }}>
              AI Generated Recommendations
            </h2>
          </div>

          {/* Climate Data Summary */}
          {climateData && (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
              gap: '1rem',
              marginBottom: '2rem',
              padding: '1.5rem',
              background: '#f9f9f9',
              borderRadius: '8px'
            }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '0.9rem', color: '#95a5a6', marginBottom: '0.5rem' }}>🌡️ Temperature</div>
                <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#e74c3c' }}>
                  {climateData.temperature?.toFixed(1)}°C
                </div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '0.9rem', color: '#95a5a6', marginBottom: '0.5rem' }}>💧 Humidity</div>
                <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#3498db' }}>
                  {climateData.humidity?.toFixed(1)}%
                </div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '0.9rem', color: '#95a5a6', marginBottom: '0.5rem' }}>🌱 Soil Moisture</div>
                <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#27ae60' }}>
                  {climateData.soilMoisture?.toFixed(1)}%
                </div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '0.9rem', color: '#95a5a6', marginBottom: '0.5rem' }}>💨 Air Quality</div>
                <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#f39c12' }}>
                  {climateData.airQuality}
                </div>
              </div>
            </div>
          )}

          {/* Recommendations List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {recommendations.map((rec) => {
              const color = getSeverityColor(rec.severity);
              return (
                <div
                  key={rec.id}
                  style={{
                    border: `2px solid ${color.border}`,
                    background: color.bg,
                    borderRadius: '8px',
                    padding: '1.5rem',
                    transition: 'transform 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                    <div style={{ fontSize: '2rem', marginTop: '0.25rem' }}>{rec.icon}</div>
                    <div style={{ flex: 1 }}>
                      <h3 style={{
                        fontSize: '1.1rem',
                        fontWeight: 'bold',
                        color: color.text,
                        margin: '0 0 0.5rem 0'
                      }}>
                        {rec.title}
                      </h3>
                      <p style={{
                        fontSize: '1rem',
                        color: '#2c3e50',
                        fontWeight: '600',
                        margin: '0.5rem 0',
                        padding: '0.5rem 0'
                      }}>
                        {rec.recommendation}
                      </p>
                      <p style={{
                        fontSize: '0.9rem',
                        color: '#555',
                        margin: '0.5rem 0'
                      }}>
                        {rec.description}
                      </p>
                      <div style={{
                        marginTop: '1rem',
                        padding: '0.75rem',
                        background: 'rgba(255, 255, 255, 0.6)',
                        borderRadius: '4px',
                        borderLeft: `3px solid ${color.border}`
                      }}>
                        <strong style={{ color: color.text }}>Action:</strong> {rec.action}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div style={{
          textAlign: 'center',
          padding: '3rem',
          color: '#95a5a6'
        }}>
          <p style={{ fontSize: '1.1rem' }}>⏳ Analyzing climate data...</p>
        </div>
      )}

      {/* No Selection State */}
      {!selectedFarm && !loading && farms.length > 0 && (
        <div style={{
          textAlign: 'center',
          padding: '3rem',
          color: '#95a5a6'
        }}>
          <p style={{ fontSize: '1.1rem' }}>Select a farm to get AI recommendations</p>
        </div>
      )}
    </div>
  );
}

export default AIRecommendations;
