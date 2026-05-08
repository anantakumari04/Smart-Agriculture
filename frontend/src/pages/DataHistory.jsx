import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getClimateData } from '../api/services';
import '../styles/dashboard.css';

function DataHistory() {
  const navigate = useNavigate();
  const [historyData, setHistoryData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [filteredData, setFilteredData] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    applyDateFilter();
  }, [historyData, startDate, endDate]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await getClimateData();
      if (response.data.success) {
        setHistoryData(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyDateFilter = () => {
    let filtered = historyData;

    if (startDate) {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      filtered = filtered.filter(d => new Date(d.timestamp) >= start);
    }

    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      filtered = filtered.filter(d => new Date(d.timestamp) <= end);
    }

    setFilteredData(filtered.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)));
  };

  const handleClearFilter = () => {
    setStartDate('');
    setEndDate('');
  };

  const getAirQualityStatus = (quality) => {
    const qualityMap = {
      'Good': { color: '#27ae60', label: 'Good' },
      'Moderate': { color: '#f39c12', label: 'Moderate' },
      'Poor': { color: '#e74c3c', label: 'Poor' },
      'Normal': { color: '#27ae60', label: 'Normal' },
      'Unhealthy': { color: '#c0392b', label: 'Unhealthy' }
    };
    return qualityMap[quality] || { color: '#95a5a6', label: quality };
  };

  const getTemperatureStatus = (temp) => {
    if (temp > 35) return { color: '#e74c3c', label: 'Critical' };
    if (temp > 30) return { color: '#f39c12', label: 'Moderate' };
    return { color: '#27ae60', label: 'Normal' };
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div className="dashboard-title">
          <span>⏱️</span>
          <h1>Historical Data</h1>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button 
            className="btn btn-outline"
            onClick={() => navigate('/dashboard')}
          >
            ← Back to Dashboard
          </button>
          <button 
            className="btn btn-primary"
            onClick={() => navigate('/dashboard')}
            style={{ marginLeft: 'auto' }}
          >
            ➕ Add Data
          </button>
        </div>
      </div>

      {/* Filter Section */}
      <div style={{
        background: 'white',
        borderRadius: '8px',
        padding: '2rem',
        marginBottom: '2rem',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        <h3 style={{ marginBottom: '1.5rem', fontSize: '1.1rem', fontWeight: 'bold', color: '#2c3e50' }}>
          ▼ Filter Data
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto auto', gap: '1rem', alignItems: 'flex-end' }}>
          <div className="form-group" style={{ margin: 0 }}>
            <label style={{ marginBottom: '0.5rem', display: 'block', fontWeight: 'bold', color: '#2c3e50' }}>Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '0.95rem'
              }}
            />
          </div>
          <div className="form-group" style={{ margin: 0 }}>
            <label style={{ marginBottom: '0.5rem', display: 'block', fontWeight: 'bold', color: '#2c3e50' }}>End Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '0.95rem'
              }}
            />
          </div>
          <button
            className="btn btn-primary"
            onClick={applyDateFilter}
            style={{ padding: '0.75rem 2rem' }}
          >
            🔍 Filter
          </button>
          <button
            className="btn btn-outline"
            onClick={handleClearFilter}
            style={{ padding: '0.75rem 2rem' }}
          >
            ✕ Clear
          </button>
        </div>
      </div>

      {/* Climate Data Records */}
      <div style={{
        background: 'white',
        borderRadius: '8px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        overflow: 'hidden'
      }}>
        <div style={{
          padding: '1.5rem',
          borderBottom: '2px solid #ecf0f1',
          fontWeight: 'bold',
          color: '#2c3e50',
          fontSize: '1.1rem'
        }}>
          📊 Climate Data Records
        </div>

        {loading ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: '#95a5a6' }}>
            Loading data...
          </div>
        ) : filteredData.length === 0 ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: '#95a5a6' }}>
            <p>No climate data records found for the selected date range.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{
              width: '100%',
              borderCollapse: 'collapse'
            }}>
              <thead>
                <tr style={{ background: '#f5f5f5', borderBottom: '1px solid #ecf0f1' }}>
                  <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 'bold', color: '#2c3e50' }}>Timestamp</th>
                  <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 'bold', color: '#2c3e50' }}>Location</th>
                  <th style={{ padding: '1rem', textAlign: 'center', fontWeight: 'bold', color: '#2c3e50' }}>Temperature</th>
                  <th style={{ padding: '1rem', textAlign: 'center', fontWeight: 'bold', color: '#2c3e50' }}>Humidity</th>
                  <th style={{ padding: '1rem', textAlign: 'center', fontWeight: 'bold', color: '#2c3e50' }}>Soil Moisture</th>
                  <th style={{ padding: '1rem', textAlign: 'center', fontWeight: 'bold', color: '#2c3e50' }}>Rainfall</th>
                  <th style={{ padding: '1rem', textAlign: 'center', fontWeight: 'bold', color: '#2c3e50' }}>Air Quality</th>
                  <th style={{ padding: '1rem', textAlign: 'center', fontWeight: 'bold', color: '#2c3e50' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.map((data, index) => {
                  const tempStatus = getTemperatureStatus(data.temperature);
                  const airQualityStatus = getAirQualityStatus(data.airQuality);
                  return (
                    <tr
                      key={data._id}
                      style={{
                        borderBottom: '1px solid #ecf0f1',
                        background: index % 2 === 0 ? 'white' : '#f9f9f9',
                        transition: 'background 0.2s'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = '#f0f8f0'}
                      onMouseLeave={(e) => e.currentTarget.style.background = index % 2 === 0 ? 'white' : '#f9f9f9'}
                    >
                      <td style={{ padding: '1rem', color: '#2c3e50', fontSize: '0.9rem' }}>
                        <div>{new Date(data.timestamp).toLocaleDateString()}</div>
                        <div style={{ color: '#95a5a6', fontSize: '0.85rem' }}>
                          {new Date(data.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </td>
                      <td style={{ padding: '1rem', color: '#2c3e50' }}>
                        <span>📍 {data.farm?.name || 'N/A'}</span>
                      </td>
                      <td style={{ padding: '1rem', textAlign: 'center', color: '#2c3e50', fontWeight: 'bold' }}>
                        <span style={{ color: '#e74c3c' }}>🌡️ {data.temperature?.toFixed(2) || '-'}°C</span>
                      </td>
                      <td style={{ padding: '1rem', textAlign: 'center', color: '#2c3e50' }}>
                        <span style={{ color: '#3498db' }}>💧 {data.humidity?.toFixed(1) || '-'}%</span>
                      </td>
                      <td style={{ padding: '1rem', textAlign: 'center', color: '#2c3e50' }}>
                        <span style={{ color: '#16a085' }}>🌱 {data.soilMoisture?.toFixed(1) || '-'}%</span>
                      </td>
                      <td style={{ padding: '1rem', textAlign: 'center', color: '#2c3e50' }}>
                        <span style={{ color: '#3498db' }}>🌧️ {data.rainfall?.toFixed(1) || '-'}mm</span>
                      </td>
                      <td style={{ padding: '1rem', textAlign: 'center' }}>
                        <span style={{
                          background: airQualityStatus.color === '#27ae60' ? '#e8f5e9' : 
                                     airQualityStatus.color === '#f39c12' ? '#fff3e0' : '#ffe6e6',
                          color: airQualityStatus.color,
                          padding: '0.4rem 0.8rem',
                          borderRadius: '4px',
                          fontSize: '0.85rem',
                          fontWeight: 'bold'
                        }}>
                          {airQualityStatus.label}
                        </span>
                      </td>
                      <td style={{ padding: '1rem', textAlign: 'center' }}>
                        <span style={{
                          background: tempStatus.color === '#27ae60' ? '#e8f5e9' : 
                                     tempStatus.color === '#f39c12' ? '#fff3e0' : '#ffe6e6',
                          color: tempStatus.color,
                          padding: '0.4rem 0.8rem',
                          borderRadius: '4px',
                          fontSize: '0.85rem',
                          fontWeight: 'bold'
                        }}>
                          {tempStatus.color === '#27ae60' ? '✓' : '⚠️'} {tempStatus.label}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default DataHistory;
