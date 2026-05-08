import React, { useState, useEffect } from 'react';
import { getClimateStats, getLatestClimateData, getFarms, fetchFromAPI, addManualData, getAlerts, createFarm, getClimateData } from '../api/services';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import '../styles/dashboard.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

function Dashboard({ user }) {
  const [farms, setFarms] = useState([]);
  const [selectedFarm, setSelectedFarm] = useState(null);
  const [latestData, setLatestData] = useState(null);
  const [stats, setStats] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [climateTrends, setClimateTrends] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showManualForm, setShowManualForm] = useState(false);
  const [showCreateFarmForm, setShowCreateFarmForm] = useState(false);
  const [manualData, setManualData] = useState({
    farmId: '',
    temperature: '',
    humidity: '',
    soilMoisture: '',
    airQuality: 'Fair'
  });
  const [farmFormData, setFarmFormData] = useState({
    name: '',
    location: '',
    latitude: '',
    longitude: '',
    phoneNumber: '',
    cropType: 'rice',
    areaInHectares: ''
  });
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    fetchFarms();
  }, []);

  useEffect(() => {
    if (selectedFarm) {
      fetchClimateData();
      fetchAlerts();
    }
  }, [selectedFarm]);

  const fetchFarms = async () => {
    try {
      const response = await getFarms();
      if (response.data.success && response.data.farms.length > 0) {
        setFarms(response.data.farms);
        setSelectedFarm(response.data.farms[0]);
      }
    } catch (error) {
      console.error('Error fetching farms:', error);
    }
  };

  const fetchClimateData = async () => {
    try {
      setLoading(true);
      const latestResponse = await getLatestClimateData(selectedFarm._id);
      const statsResponse = await getClimateStats(selectedFarm._id);
      const climateResponse = await getClimateData();
      
      if (latestResponse.data.success) {
        setLatestData(latestResponse.data.data);
      }
      if (statsResponse.data.success) {
        setStats(statsResponse.data.stats);
      }
      
      // Process climate trends data (last 24 hours)
      if (climateResponse.data.success) {
        const allData = climateResponse.data.data;
        const last24Hours = allData.filter(d => {
          const dataTime = new Date(d.timestamp).getTime();
          const now = new Date().getTime();
          return (now - dataTime) <= 24 * 60 * 60 * 1000;
        }).sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
        
        setClimateTrends(last24Hours);
      }
    } catch (error) {
      console.error('Error fetching climate data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAlerts = async () => {
    try {
      const response = await getAlerts();
      if (response.data.success) {
        setAlerts(response.data.alerts.slice(0, 3));
      }
    } catch (error) {
      console.error('Error fetching alerts:', error);
    }
  };

  const handleFetchFromAPI = async () => {
    try {
      setLoading(true);
      await fetchFromAPI(selectedFarm._id);
      setSuccessMessage('Fresh weather data has been automatically collected!');
      await fetchClimateData();
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Error fetching API data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateFarm = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await createFarm(farmFormData);
      setSuccessMessage('Farm created successfully!');
      setFarmFormData({
        name: '',
        location: '',
        latitude: '',
        longitude: '',
        phoneNumber: '',
        cropType: 'rice',
        areaInHectares: ''
      });
      setShowCreateFarmForm(false);
      await fetchFarms();
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Error creating farm:', error);
      alert('Error creating farm: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddManualData = async (e) => {
    e.preventDefault();
    try {
      await addManualData(manualData);
      setSuccessMessage('Manual data added successfully!');
      setManualData({ farmId: '', temperature: '', humidity: '', soilMoisture: '', airQuality: 'Fair' });
      setShowManualForm(false);
      await fetchClimateData();
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Error adding manual data:', error);
    }
  };

  if (!selectedFarm) {
    return (
      <div className="dashboard-container">
        <div className="dashboard-header">
          <div className="dashboard-title">
            <span>💼</span>
            <h1>Climate Dashboard</h1>
          </div>
        </div>
        <div style={{ textAlign: 'center', padding: '3rem', color: '#95a5a6' }}>
          <p style={{ marginBottom: '2rem' }}>No farms found. Please create a farm first to get started.</p>
          <button 
            className="btn btn-primary"
            onClick={() => setShowCreateFarmForm(true)}
            style={{ marginBottom: '2rem' }}
          >
            ➕ Create Your First Farm
          </button>

          {/* Create Farm Form Modal */}
          {showCreateFarmForm && (
            <div style={{
              background: '#f0f8f0',
              border: '2px solid var(--primary-green)',
              padding: '2rem',
              borderRadius: '8px',
              maxWidth: '600px',
              margin: '0 auto'
            }}>
              <h3 className="section-title">➕ Create New Farm</h3>
              <form onSubmit={handleCreateFarm}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                  <div className="form-group">
                    <label>🏠 Farm Name</label>
                    <input
                      type="text"
                      value={farmFormData.name}
                      onChange={(e) => setFarmFormData({ ...farmFormData, name: e.target.value })}
                      placeholder="e.g., Green Valley Farm"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>📍 Location</label>
                    <input
                      type="text"
                      value={farmFormData.location}
                      onChange={(e) => setFarmFormData({ ...farmFormData, location: e.target.value })}
                      placeholder="e.g., Delhi, India"
                      required
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                  <div className="form-group">
                    <label>📐 Latitude</label>
                    <input
                      type="number"
                      step="0.000001"
                      value={farmFormData.latitude}
                      onChange={(e) => setFarmFormData({ ...farmFormData, latitude: e.target.value })}
                      placeholder="e.g., 28.7041"
                    />
                  </div>
                  <div className="form-group">
                    <label>📐 Longitude</label>
                    <input
                      type="number"
                      step="0.000001"
                      value={farmFormData.longitude}
                      onChange={(e) => setFarmFormData({ ...farmFormData, longitude: e.target.value })}
                      placeholder="e.g., 77.1025"
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                  <div className="form-group">
                    <label>📞 Phone Number</label>
                    <input
                      type="tel"
                      value={farmFormData.phoneNumber}
                      onChange={(e) => setFarmFormData({ ...farmFormData, phoneNumber: e.target.value })}
                      placeholder="e.g., +91-9876543210"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>🌾 Crop Type</label>
                    <select
                      value={farmFormData.cropType}
                      onChange={(e) => setFarmFormData({ ...farmFormData, cropType: e.target.value })}
                    >
                      <option value="rice">Rice</option>
                      <option value="wheat">Wheat</option>
                      <option value="corn">Corn</option>
                      <option value="cotton">Cotton</option>
                      <option value="sugarcane">Sugarcane</option>
                      <option value="vegetables">Vegetables</option>
                      <option value="fruits">Fruits</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: '1rem' }}>
                  <label>📏 Area (Hectares)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={farmFormData.areaInHectares}
                    onChange={(e) => setFarmFormData({ ...farmFormData, areaInHectares: e.target.value })}
                    placeholder="e.g., 10.5"
                  />
                </div>

                <div style={{ display: 'flex', gap: '1rem' }}>
                  <button type="submit" className="btn btn-primary" disabled={loading}>
                    {loading ? 'Creating...' : '✓ Create Farm'}
                  </button>
                  <button type="button" className="btn btn-outline" onClick={() => setShowCreateFarmForm(false)}>
                    ✕ Cancel
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div className="dashboard-title">
          <span>💼</span>
          <h1>Climate Dashboard</h1>
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <button
            className="btn"
            onClick={handleFetchFromAPI}
            disabled={loading}
            style={{
              background: 'white',
              color: '#2ecc71',
              border: '2px solid #2ecc71',
              padding: '0.6rem 1.2rem',
              fontWeight: 'bold',
              borderRadius: '6px',
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            ♻️ Refresh
          </button>
          <button
            className="btn btn-primary"
            onClick={handleFetchFromAPI}
            disabled={loading}
            style={{ padding: '0.6rem 1.2rem' }}
          >
            {loading ? 'Fetching...' : '📡 Fetch API Data'}
          </button>
          {user && user.role === 'admin' && (
            <button
              className="btn btn-primary"
              onClick={() => setShowManualForm(!showManualForm)}
              style={{ padding: '0.6rem 1.2rem' }}
            >
              ➕ Add Manual Data
            </button>
          )}
        </div>
      </div>

      {successMessage && (
        <div className="dashboard-alerts">
          <div className="alert-banner success">
            <span>✓ {successMessage}</span>
            <button className="alert-close" onClick={() => setSuccessMessage('')}>×</button>
          </div>
        </div>
      )}

      {/* Farm Selection (Compact) */}
      <div style={{
        padding: '0 2rem',
        marginBottom: '1.5rem',
        display: 'flex',
        gap: '1rem',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <label style={{ fontWeight: 'bold', whiteSpace: 'nowrap' }}>🏠 Select Farm:</label>
          <select 
            value={selectedFarm._id} 
            onChange={(e) => setSelectedFarm(farms.find(f => f._id === e.target.value))}
            style={{ padding: '0.5rem 1rem', fontSize: '0.95rem', borderRadius: '4px', border: '1px solid #ddd' }}
          >
            {farms.map(farm => (
              <option key={farm._id} value={farm._id}>
                {farm.name} - {farm.location}
              </option>
            ))}
          </select>
        </div>
        <button 
          className="btn btn-secondary"
          onClick={() => setShowCreateFarmForm(true)}
          title="Add a new farm"
          style={{ padding: '0.5rem 1rem' }}
        >
          ➕ New Farm
        </button>
      </div>

      {/* Create Farm Form Modal */}
      {showCreateFarmForm && (
        <div style={{
          background: '#f0f8f0',
          border: '2px solid var(--primary-green)',
          padding: '2rem',
          borderRadius: '8px',
          maxWidth: '600px',
          margin: '0 auto 2rem'
        }}>
          <h3 className="section-title">➕ Create New Farm</h3>
          <form onSubmit={handleCreateFarm}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div className="form-group">
                <label>🏠 Farm Name</label>
                <input
                  type="text"
                  value={farmFormData.name}
                  onChange={(e) => setFarmFormData({ ...farmFormData, name: e.target.value })}
                  placeholder="e.g., Green Valley Farm"
                  required
                />
              </div>
              <div className="form-group">
                <label>📍 Location</label>
                <input
                  type="text"
                  value={farmFormData.location}
                  onChange={(e) => setFarmFormData({ ...farmFormData, location: e.target.value })}
                  placeholder="e.g., Delhi, India"
                  required
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div className="form-group">
                <label>📐 Latitude</label>
                <input
                  type="number"
                  step="0.000001"
                  value={farmFormData.latitude}
                  onChange={(e) => setFarmFormData({ ...farmFormData, latitude: e.target.value })}
                  placeholder="e.g., 28.7041"
                />
              </div>
              <div className="form-group">
                <label>📐 Longitude</label>
                <input
                  type="number"
                  step="0.000001"
                  value={farmFormData.longitude}
                  onChange={(e) => setFarmFormData({ ...farmFormData, longitude: e.target.value })}
                  placeholder="e.g., 77.1025"
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div className="form-group">
                <label>📞 Phone Number</label>
                <input
                  type="tel"
                  value={farmFormData.phoneNumber}
                  onChange={(e) => setFarmFormData({ ...farmFormData, phoneNumber: e.target.value })}
                  placeholder="e.g., +91-9876543210"
                  required
                />
              </div>
              <div className="form-group">
                <label>🌾 Crop Type</label>
                <select
                  value={farmFormData.cropType}
                  onChange={(e) => setFarmFormData({ ...farmFormData, cropType: e.target.value })}
                >
                  <option value="rice">Rice</option>
                  <option value="wheat">Wheat</option>
                  <option value="corn">Corn</option>
                  <option value="cotton">Cotton</option>
                  <option value="sugarcane">Sugarcane</option>
                  <option value="vegetables">Vegetables</option>
                  <option value="fruits">Fruits</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: '1rem' }}>
              <label>📏 Area (Hectares)</label>
              <input
                type="number"
                step="0.1"
                value={farmFormData.areaInHectares}
                onChange={(e) => setFarmFormData({ ...farmFormData, areaInHectares: e.target.value })}
                placeholder="e.g., 10.5"
              />
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Creating...' : '✓ Create Farm'}
              </button>
              <button type="button" className="btn btn-outline" onClick={() => setShowCreateFarmForm(false)}>
                ✕ Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Manual Data Form Modal */}
      {showManualForm && user && user.role === 'admin' && (
        <div style={{
          background: '#f0f8f0',
          border: '2px solid var(--primary-green)',
          padding: '2rem',
          borderRadius: '8px',
          maxWidth: '600px',
          margin: '0 auto 2rem'
        }}>
          <h3 className="section-title">➕ Add Manual Climate Data</h3>
          <form onSubmit={handleAddManualData}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div className="form-group">
                <label>🌡️ Temperature (°C)</label>
                <input
                  type="number"
                  step="0.1"
                  value={manualData.temperature}
                  onChange={(e) => setManualData({ ...manualData, temperature: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>💧 Humidity (%)</label>
                <input
                  type="number"
                  step="0.1"
                  value={manualData.humidity}
                  onChange={(e) => setManualData({ ...manualData, humidity: e.target.value })}
                  required
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div className="form-group">
                <label>🌱 Soil Moisture (%)</label>
                <input
                  type="number"
                  step="0.1"
                  value={manualData.soilMoisture}
                  onChange={(e) => setManualData({ ...manualData, soilMoisture: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>💨 Air Quality</label>
                <select
                  value={manualData.airQuality}
                  onChange={(e) => setManualData({ ...manualData, airQuality: e.target.value })}
                >
                  <option>Good</option>
                  <option>Fair</option>
                  <option>Moderate</option>
                  <option>Poor</option>
                  <option>Very Poor</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <button type="submit" className="btn btn-primary">✓ Submit Data</button>
              <button type="button" className="btn btn-outline" onClick={() => setShowManualForm(false)}>
                ✕ Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Latest Climate Data - Premium Cards View */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '2rem',
        padding: '2rem',
        marginBottom: '2rem'
      }}>
        {loading ? (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', color: '#95a5a6', padding: '2rem' }}>
            Loading climate data...
          </div>
        ) : latestData ? (
          <>
            {/* Temperature Card */}
            <div style={{
              background: 'white',
              borderRadius: '12px',
              padding: '1.5rem',
              borderLeft: '5px solid #e74c3c',
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ color: '#95a5a6', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Temperature</div>
                  <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#2c3e50' }}>
                    {latestData.temperature?.toFixed(2)}°C
                  </div>
                </div>
                <div style={{
                  width: '70px',
                  height: '70px',
                  borderRadius: '50%',
                  background: '#ffebee',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '2.5rem'
                }}>
                  🌡️
                </div>
              </div>
              <div style={{ fontSize: '0.85rem', color: '#95a5a6', borderTop: '1px solid #ecf0f1', paddingTop: '0.75rem' }}>
                Updated: {new Date(latestData.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>

            {/* Humidity Card */}
            <div style={{
              background: 'white',
              borderRadius: '12px',
              padding: '1.5rem',
              borderLeft: '5px solid #3498db',
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ color: '#95a5a6', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Humidity</div>
                  <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#2c3e50' }}>
                    {latestData.humidity?.toFixed(1)}%
                  </div>
                </div>
                <div style={{
                  width: '70px',
                  height: '70px',
                  borderRadius: '50%',
                  background: '#e3f2fd',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '2.5rem'
                }}>
                  💧
                </div>
              </div>
              <div style={{
                background: '#3498db',
                height: '6px',
                borderRadius: '3px',
                overflow: 'hidden'
              }}>
                <div style={{
                  background: '#3498db',
                  height: '100%',
                  width: `${latestData.humidity}%`
                }} />
              </div>
              <div style={{ fontSize: '0.85rem', color: '#95a5a6', borderTop: '1px solid #ecf0f1', paddingTop: '0.75rem' }}>
                Updated: {new Date(latestData.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>

            {/* Soil Moisture Card */}
            <div style={{
              background: 'white',
              borderRadius: '12px',
              padding: '1.5rem',
              borderLeft: '5px solid #27ae60',
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ color: '#95a5a6', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Soil Moisture</div>
                  <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#2c3e50' }}>
                    {latestData.soilMoisture?.toFixed(1)}%
                  </div>
                </div>
                <div style={{
                  width: '70px',
                  height: '70px',
                  borderRadius: '50%',
                  background: '#e8f5e9',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '2.5rem'
                }}>
                  🌱
                </div>
              </div>
              <div style={{
                background: '#e8f5e9',
                height: '6px',
                borderRadius: '3px',
                overflow: 'hidden'
              }}>
                <div style={{
                  background: '#27ae60',
                  height: '100%',
                  width: `${latestData.soilMoisture}%`
                }} />
              </div>
              <div style={{ fontSize: '0.85rem', color: '#95a5a6', borderTop: '1px solid #ecf0f1', paddingTop: '0.75rem' }}>
                Updated: {new Date(latestData.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>

            {/* Air Quality Card */}
            <div style={{
              background: 'white',
              borderRadius: '12px',
              padding: '1.5rem',
              borderLeft: '5px solid #f39c12',
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ color: '#95a5a6', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Air Quality</div>
                  <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#2c3e50' }}>
                    {latestData.airQuality || 'N/A'}
                  </div>
                </div>
                <div style={{
                  width: '70px',
                  height: '70px',
                  borderRadius: '50%',
                  background: '#fff3e0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '2.5rem'
                }}>
                  💨
                </div>
              </div>
              <div style={{ fontSize: '0.85rem', color: '#95a5a6', borderTop: '1px solid #ecf0f1', paddingTop: '0.75rem' }}>
                Updated: {new Date(latestData.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </>
        ) : (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', color: '#95a5a6', padding: '2rem' }}>
            <p>No climate data available. Please fetch data from API or add manually.</p>
          </div>
        )}
      </div>

      {/* Statistics */}
      {/* Statistics Cards */}
      {stats && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1.5rem',
          padding: '0 2rem',
          marginBottom: '2rem'
        }}>
          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '1.5rem',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            textAlign: 'center',
            borderTop: '3px solid #3498db'
          }}>
            <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>❄️</div>
            <div style={{ color: '#95a5a6', fontSize: '0.9rem', marginBottom: '0.75rem' }}>Avg Temperature</div>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#3498db' }}>
              {stats.avgTemperature}°C
            </div>
          </div>

          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '1.5rem',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            textAlign: 'center',
            borderTop: '3px solid #3498db'
          }}>
            <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>💧</div>
            <div style={{ color: '#95a5a6', fontSize: '0.9rem', marginBottom: '0.75rem' }}>Avg Humidity</div>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#3498db' }}>
              {stats.avgHumidity}%
            </div>
          </div>

          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '1.5rem',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            textAlign: 'center',
            borderTop: '3px solid #27ae60'
          }}>
            <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>🌱</div>
            <div style={{ color: '#95a5a6', fontSize: '0.9rem', marginBottom: '0.75rem' }}>Avg Soil Moisture</div>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#27ae60' }}>
              {stats.avgSoilMoisture}%
            </div>
          </div>

          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '1.5rem',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            textAlign: 'center',
            borderTop: '3px solid #f39c12'
          }}>
            <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>📊</div>
            <div style={{ color: '#95a5a6', fontSize: '0.9rem', marginBottom: '0.75rem' }}>Temperature Range</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#f39c12' }}>
              {stats.tempRange}
            </div>
          </div>
        </div>
      )}

      {/* Climate Trends Section */}
      <div style={{
        background: 'white',
        borderRadius: '12px',
        padding: '2rem',
        margin: '0 2rem 2rem',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
      }}>
        <h3 style={{
          fontSize: '1.3rem',
          fontWeight: 'bold',
          color: '#2c3e50',
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem'
        }}>
          📈 Climate Trends (Last 24 Hours)
        </h3>
        <div style={{
          background: 'white',
          borderRadius: '8px',
          padding: '1.5rem',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
        }}>
          {climateTrends.length === 0 ? (
            <div style={{
              height: '300px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: '#f9f9f9',
              borderRadius: '8px',
              color: '#95a5a6'
            }}>
              <div style={{ textAlign: 'center' }}>
                <p style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>📊 Chart Widget</p>
                <p style={{ fontSize: '0.9rem' }}>No climate data available for the last 24 hours</p>
              </div>
            </div>
          ) : (
            <Line
              data={{
                labels: climateTrends.map(d => {
                  const time = new Date(d.timestamp);
                  return time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                }),
                datasets: [
                  {
                    label: 'Temperature (°C)',
                    data: climateTrends.map(d => d.temperature),
                    borderColor: '#e74c3c',
                    backgroundColor: 'rgba(231, 76, 60, 0.1)',
                    tension: 0.4,
                    fill: true,
                    pointRadius: 4,
                    pointHoverRadius: 6,
                    pointBackgroundColor: '#e74c3c',
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2
                  },
                  {
                    label: 'Humidity (%)',
                    data: climateTrends.map(d => d.humidity),
                    borderColor: '#3498db',
                    backgroundColor: 'rgba(52, 152, 219, 0.1)',
                    tension: 0.4,
                    fill: true,
                    pointRadius: 4,
                    pointHoverRadius: 6,
                    pointBackgroundColor: '#3498db',
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2
                  },
                  {
                    label: 'Soil Moisture (%)',
                    data: climateTrends.map(d => d.soilMoisture),
                    borderColor: '#27ae60',
                    backgroundColor: 'rgba(39, 174, 96, 0.1)',
                    tension: 0.4,
                    fill: true,
                    pointRadius: 4,
                    pointHoverRadius: 6,
                    pointBackgroundColor: '#27ae60',
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2
                  }
                ]
              }}
              options={{
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                  legend: {
                    display: true,
                    position: 'top',
                    labels: {
                      color: '#2c3e50',
                      font: {
                        size: 12,
                        weight: 'bold'
                      },
                      padding: 15,
                      usePointStyle: true
                    }
                  },
                  tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    padding: 12,
                    titleFont: { size: 14, weight: 'bold' },
                    bodyFont: { size: 13 },
                    borderColor: '#2c3e50',
                    borderWidth: 1,
                    callbacks: {
                      afterLabel: function(context) {
                        return '';
                      }
                    }
                  }
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    grid: {
                      color: 'rgba(0, 0, 0, 0.05)',
                      drawBorder: false
                    },
                    ticks: {
                      color: '#95a5a6',
                      font: {
                        size: 12
                      }
                    }
                  },
                  x: {
                    grid: {
                      display: false,
                      drawBorder: false
                    },
                    ticks: {
                      color: '#95a5a6',
                      font: {
                        size: 12
                      },
                      maxRotation: 45,
                      minRotation: 0
                    }
                  }
                }
              }}
            />
          )}
        </div>
      </div>

      {/* Recent Alerts */}
      {alerts.length > 0 && (
        <div style={{
          background: 'white',
          borderRadius: '12px',
          padding: '2rem',
          margin: '0 2rem 2rem',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
        }}>
          <h3 style={{
            fontSize: '1.3rem',
            fontWeight: 'bold',
            color: '#2c3e50',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem'
          }}>
            🔔 Recent Alerts
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {alerts.map(alert => (
              <div key={alert._id} style={{
                padding: '1rem',
                borderRadius: '8px',
                borderLeft: `4px solid ${alert.severity === 'critical' ? '#e74c3c' : alert.severity === 'high' ? '#f39c12' : '#3498db'}`,
                background: alert.severity === 'critical' ? '#ffe6e6' : alert.severity === 'high' ? '#fff3e0' : '#e3f2fd'
              }}>
                <strong>{alert.type.toUpperCase()}</strong>: {alert.message}
                <div style={{ fontSize: '0.85rem', color: '#95a5a6', marginTop: '0.25rem' }}>
                  {new Date(alert.createdAt).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Footer */}
      <footer style={{
        background: '#2c3e50',
        color: 'white',
        padding: '2rem',
        marginTop: '2rem',
        textAlign: 'center'
      }}>
        <div style={{ marginBottom: '0.5rem' }}>
          <strong>🌱 Smart Agriculture</strong>
        </div>
        <p style={{ fontSize: '0.9rem', margin: '0.5rem 0' }}>
          © 2025 Smart Agriculture. All rights reserved.
        </p>
        <p style={{ fontSize: '0.85rem', color: '#bdc3c7', margin: '0.5rem 0' }}>
          Helping farmers make data-driven decisions.
        </p>
      </footer>
    </div>
  );
}

export default Dashboard;
