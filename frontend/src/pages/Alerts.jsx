import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAlerts, markAlertAsRead, deleteAlert } from '../api/services';
import '../styles/dashboard.css';

function Alerts({ user }) {
  const navigate = useNavigate();
  const [allAlerts, setAllAlerts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [alertStats, setAlertStats] = useState({
    critical: 0,
    high: 0,
    medium: 0,
    resolved: 0
  });

  useEffect(() => {
    fetchAlerts();
  }, []);

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      const response = await getAlerts('');
      if (response.data.success) {
        setAllAlerts(response.data.alerts);
        
        // Calculate stats
        const stats = {
          critical: response.data.alerts.filter(a => a.severity === 'critical').length,
          high: response.data.alerts.filter(a => a.severity === 'high').length,
          medium: response.data.alerts.filter(a => a.severity === 'medium').length,
          resolved: response.data.alerts.filter(a => a.isRead || a.isResolved).length
        };
        setAlertStats(stats);
      }
    } catch (error) {
      console.error('Error fetching alerts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      await markAlertAsRead(id);
      await fetchAlerts();
    } catch (error) {
      console.error('Error marking alert as read:', error);
    }
  };

  const handleDeleteAlert = async (id) => {
    try {
      await deleteAlert(id);
      await fetchAlerts();
    } catch (error) {
      console.error('Error deleting alert:', error);
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical': return '#e74c3c';
      case 'high': return '#f39c12';
      case 'medium': return '#3498db';
      default: return '#27ae60';
    }
  };

  const getSeverityLabel = (severity) => {
    switch (severity) {
      case 'critical': return 'Critical';
      case 'high': return 'High Priority';
      case 'medium': return 'Medium Priority';
      default: return 'Low Priority';
    }
  };

  const getAlertType = (type) => {
    const typeMap = {
      temperature: 'Temperature Alert',
      humidity: 'Humidity Alert',
      soilMoisture: 'Soil Moisture Alert',
      airQuality: 'Air Quality Alert',
      default: 'System Alert'
    };
    return typeMap[type] || typeMap.default;
  };

  return (
    <div className="dashboard-container">
      {/* Header */}
      <div className="dashboard-header">
        <div className="dashboard-title">
          <span>🔔</span>
          <h1>System Alerts</h1>
        </div>
        <button
          className="btn btn-outline"
          onClick={() => navigate('/dashboard')}
          style={{ marginTop: '1rem' }}
        >
          ← Back to Dashboard
        </button>
      </div>

      {/* Alert Summary Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '1.5rem',
        marginBottom: '2rem',
        padding: '0 1rem'
      }}>
        {/* Critical Alerts Card */}
        <div style={{
          background: '#e74c3c',
          color: 'white',
          padding: '2rem',
          borderRadius: '8px',
          textAlign: 'center',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>⚠️</div>
          <div style={{ fontSize: '0.9rem', marginBottom: '0.5rem', opacity: 0.9 }}>Critical Alerts</div>
          <div style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>{alertStats.critical}</div>
        </div>

        {/* High Priority Card */}
        <div style={{
          background: '#f39c12',
          color: 'white',
          padding: '2rem',
          borderRadius: '8px',
          textAlign: 'center',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>❗</div>
          <div style={{ fontSize: '0.9rem', marginBottom: '0.5rem', opacity: 0.9 }}>High Priority</div>
          <div style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>{alertStats.high}</div>
        </div>

        {/* Medium Priority Card */}
        <div style={{
          background: '#3498db',
          color: 'white',
          padding: '2rem',
          borderRadius: '8px',
          textAlign: 'center',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>ℹ️</div>
          <div style={{ fontSize: '0.9rem', marginBottom: '0.5rem', opacity: 0.9 }}>Medium Priority</div>
          <div style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>{alertStats.medium}</div>
        </div>

        {/* Resolved Card */}
        <div style={{
          background: '#27ae60',
          color: 'white',
          padding: '2rem',
          borderRadius: '8px',
          textAlign: 'center',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>✓</div>
          <div style={{ fontSize: '0.9rem', marginBottom: '0.5rem', opacity: 0.9 }}>Resolved</div>
          <div style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>{alertStats.resolved}</div>
        </div>
      </div>

      {/* All Alerts Table */}
      <div style={{
        background: 'white',
        borderRadius: '8px',
        overflow: 'hidden',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        margin: '0 1rem'
      }}>
        <div style={{
          padding: '1.5rem',
          borderBottom: '2px solid #ecf0f1',
          fontWeight: 'bold',
          color: '#2c3e50',
          fontSize: '1.1rem'
        }}>
          📋 All Alerts
        </div>

        {loading ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: '#95a5a6' }}>
            Loading alerts...
          </div>
        ) : allAlerts.length === 0 ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: '#95a5a6' }}>
            <p>No alerts at this time.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{
              width: '100%',
              borderCollapse: 'collapse'
            }}>
              <thead>
                <tr style={{ background: '#f5f5f5', borderBottom: '1px solid #ecf0f1' }}>
                  <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 'bold', color: '#2c3e50' }}>Type</th>
                  <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 'bold', color: '#2c3e50' }}>Severity</th>
                  <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 'bold', color: '#2c3e50' }}>Message</th>
                  <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 'bold', color: '#2c3e50' }}>Status</th>
                  <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 'bold', color: '#2c3e50' }}>Created</th>
                  <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 'bold', color: '#2c3e50' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {allAlerts.map((alert, index) => (
                  <tr
                    key={alert._id}
                    style={{
                      borderBottom: '1px solid #ecf0f1',
                      background: index % 2 === 0 ? 'white' : '#f9f9f9',
                      transition: 'background 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#f0f8f0'}
                    onMouseLeave={(e) => e.currentTarget.style.background = index % 2 === 0 ? 'white' : '#f9f9f9'}
                  >
                    <td style={{ padding: '1rem', color: '#2c3e50' }}>
                      <span>▼</span> {getAlertType(alert.type)}
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <span style={{
                        background: getSeverityColor(alert.severity),
                        color: 'white',
                        padding: '0.4rem 0.8rem',
                        borderRadius: '4px',
                        fontSize: '0.85rem',
                        fontWeight: 'bold'
                      }}>
                        {getSeverityLabel(alert.severity)}
                      </span>
                    </td>
                    <td style={{ padding: '1rem', color: '#2c3e50', maxWidth: '400px' }}>
                      {alert.message}
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <span style={{
                        background: alert.isRead || alert.isResolved ? '#27ae60' : '#f39c12',
                        color: 'white',
                        padding: '0.4rem 0.8rem',
                        borderRadius: '4px',
                        fontSize: '0.85rem',
                        fontWeight: 'bold'
                      }}>
                        {alert.isRead || alert.isResolved ? '✓ Resolved' : '⏳ Pending'}
                      </span>
                    </td>
                    <td style={{ padding: '1rem', color: '#95a5a6', fontSize: '0.9rem' }}>
                      {new Date(alert.createdAt).toLocaleDateString()}<br />
                      {new Date(alert.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'center' }}>
                      {user && user.role === 'admin' ? (
                        <button
                          onClick={() => handleMarkAsRead(alert._id)}
                          style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            fontSize: '1.2rem',
                            transition: 'transform 0.2s'
                          }}
                          title="Mark as Resolved"
                          onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.2)'}
                          onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                        >
                          ✓
                        </button>
                      ) : (
                        <span style={{ color: '#95a5a6', fontSize: '0.9rem' }}>-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default Alerts;
