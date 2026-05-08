import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getClimateData } from '../api/services';
import '../styles/auth.css';

function Home() {
  const navigate = useNavigate();
  const [latestClimates, setLatestClimates] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLatestClimateData();
  }, []);

  const fetchLatestClimateData = async () => {
    try {
      const response = await getClimateData();
      if (response.data.success && response.data.data.length > 0) {
        const groupedByFarm = {};
        response.data.data.forEach(data => {
          const farmId = data.farm?._id;
          if (farmId && !groupedByFarm[farmId]) {
            groupedByFarm[farmId] = data;
          }
        });
        setLatestClimates(Object.values(groupedByFarm).slice(0, 4));
      }
    } catch (error) {
      console.error('Error fetching climate data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  const getAirQualityLabel = (airQuality) => {
    const quality = airQuality?.toLowerCase() || 'poor';
    return quality.charAt(0).toUpperCase() + quality.slice(1);
  };

  return (
    <div style={{ minHeight: '100vh' }}>
      {/* Header Navigation */}
      <nav style={{
        background: '#2ecc71',
        padding: '1rem 2rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        color: 'white'
      }}>
        <div style={{ fontSize: '1.5rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '10px' }}>
          🌱 Smart Agriculture
        </div>
        <div style={{ display: 'flex', gap: '2rem' }}>
          <button onClick={() => navigate('/login')} style={{
            background: 'transparent',
            color: 'white',
            border: 'none',
            cursor: 'pointer',
            fontSize: '1rem',
            fontWeight: 'bold'
          }}>
            🔐 Login
          </button>
          <button onClick={() => navigate('/register')} style={{
            background: 'transparent',
            color: 'white',
            border: 'none',
            cursor: 'pointer',
            fontSize: '1rem',
            fontWeight: 'bold'
          }}>
            📝 Register
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section style={{
        background: 'linear-gradient(135deg, #2ecc71 0%, #27ae60 100%)',
        color: 'white',
        padding: '4rem 2rem',
        textAlign: 'center'
      }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🌾 Smart Agriculture</h1>
        <p style={{ fontSize: '1.1rem', marginBottom: '2rem', maxWidth: '600px', margin: '0 auto 2rem' }}>
          Automated Climate Monitoring System for Smart Agriculture. Monitor temperature, humidity, soil moisture and more in real-time to make data-driven decisions.
        </p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <button onClick={() => navigate('/register')} style={{
            background: 'white',
            color: '#2ecc71',
            padding: '0.75rem 2rem',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: 'bold',
            fontSize: '1rem'
          }}>
            👥 Get Started
          </button>
          <button onClick={() => navigate('/login')} style={{
            background: 'transparent',
            color: 'white',
            padding: '0.75rem 2rem',
            border: '2px solid white',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: 'bold',
            fontSize: '1rem'
          }}>
            🔐 Login
          </button>
        </div>
      </section>

      {/* Latest Climate Data Section */}
      <section style={{ padding: '3rem 2rem', background: 'white' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '2rem', fontSize: '1.8rem', color: '#2c3e50' }}>
          📊 Latest Climate Data
        </h2>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: '#95a5a6' }}>
            Loading climate data...
          </div>
        ) : latestClimates && latestClimates.length > 0 ? (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '2rem',
            maxWidth: '1200px',
            margin: '0 auto'
          }}>
            {latestClimates.map((climate, index) => (
              <div key={index} style={{
                background: 'white',
                border: '1px solid #ecf0f1',
                padding: '1.5rem',
                borderRadius: '8px',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#2ecc71', marginBottom: '0.5rem' }}>
                  📍 {climate.farm?.name || 'Farm'} - {climate.farm?.location || 'Location'}
                </div>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, 1fr)',
                  gap: '1rem',
                  marginTop: '1rem'
                }}>
                  <div style={{ borderLeft: '4px solid #e74c3c', paddingLeft: '0.75rem', textAlign: 'left' }}>
                    <div style={{ fontSize: '0.8rem', color: '#95a5a6' }}>🌡️ Temperature</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#2c3e50' }}>
                      {climate.temperature?.toFixed(2) || 'N/A'}°C
                    </div>
                  </div>
                  <div style={{ borderLeft: '4px solid #3498db', paddingLeft: '0.75rem', textAlign: 'left' }}>
                    <div style={{ fontSize: '0.8rem', color: '#95a5a6' }}>💧 Humidity</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#2c3e50' }}>
                      {climate.humidity?.toFixed(1) || 'N/A'}%
                    </div>
                  </div>
                  <div style={{ borderLeft: '4px solid #27ae60', paddingLeft: '0.75rem', textAlign: 'left' }}>
                    <div style={{ fontSize: '0.8rem', color: '#95a5a6' }}>🌱 Soil Moisture</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#2c3e50' }}>
                      {climate.soilMoisture?.toFixed(1) || 'N/A'}%
                    </div>
                  </div>
                  <div style={{ borderLeft: '4px solid #f39c12', paddingLeft: '0.75rem', textAlign: 'left' }}>
                    <div style={{ fontSize: '0.8rem', color: '#95a5a6' }}>💨 Air Quality</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#2c3e50' }}>
                      {getAirQualityLabel(climate.airQuality) || 'N/A'}
                    </div>
                  </div>
                </div>
                <div style={{ fontSize: '0.75rem', color: '#95a5a6', marginTop: '1rem', borderTop: '1px solid #ecf0f1', paddingTop: '0.75rem' }}>
                  Updated: {formatDate(climate.timestamp)}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '2rem', color: '#95a5a6' }}>
            <p>No climate data available yet. Please log in or create a farm to start monitoring.</p>
          </div>
        )}
      </section>

      {/* Features Section */}
      <section style={{ padding: '3rem 2rem', background: '#f5f5f5' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '3rem', fontSize: '1.8rem', color: '#2c3e50' }}>
          ⚙️ System Features
        </h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '2rem',
          maxWidth: '1200px',
          margin: '0 auto'
        }}>
          <div style={{
            background: 'white',
            padding: '2rem',
            borderRadius: '8px',
            textAlign: 'center',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>📈</div>
            <h3 style={{ marginBottom: '1rem', color: '#2c3e50' }}>Real-time Monitoring</h3>
            <p style={{ color: '#95a5a6' }}>
              Monitor climate parameters in real-time with live data updates and interactive charts.
            </p>
          </div>
          <div style={{
            background: 'white',
            padding: '2rem',
            borderRadius: '8px',
            textAlign: 'center',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🔔</div>
            <h3 style={{ marginBottom: '1rem', color: '#2c3e50' }}>Smart Alerts</h3>
            <p style={{ color: '#95a5a6' }}>
              Get instant notifications when climate conditions exceed safe thresholds for your crops.
            </p>
          </div>
          <div style={{
            background: 'white',
            padding: '2rem',
            borderRadius: '8px',
            textAlign: 'center',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>⏱️</div>
            <h3 style={{ marginBottom: '1rem', color: '#2c3e50' }}>Historical Analysis</h3>
            <p style={{ color: '#95a5a6' }}>
              Analyze historical data trends to make informed decisions about your farming practices.
            </p>
          </div>
          <div style={{
            background: 'white',
            padding: '2rem',
            borderRadius: '8px',
            textAlign: 'center',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🤖</div>
            <h3 style={{ marginBottom: '1rem', color: '#2c3e50' }}>AI Recommendations</h3>
            <p style={{ color: '#95a5a6', marginBottom: '1.5rem' }}>
              Get intelligent recommendations based on climate analysis to optimize your farm management.
            </p>
            <button 
              onClick={() => navigate('/ai-recommendations')}
              style={{
                background: '#2ecc71',
                color: 'white',
                padding: '0.6rem 1.2rem',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontWeight: 'bold',
                fontSize: '0.9rem'
              }}
            >
              🚀 Try AI Recommendations
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        background: '#34495e',
        color: 'white',
        padding: '2rem',
        textAlign: 'center'
      }}>
        <div style={{ marginBottom: '1rem', fontSize: '1.1rem', fontWeight: 'bold' }}>
          🌱 Smart Agriculture
        </div>
        <p>Automated Climate Monitoring System for Smart Agriculture</p>
        <p style={{ marginTop: '1rem', fontSize: '0.9rem', opacity: 0.8 }}>
          © 2025 Smart Agriculture. All rights reserved. Helping farmers make data-driven decisions.
        </p>
      </footer>
    </div>
  );
}

export default Home;
