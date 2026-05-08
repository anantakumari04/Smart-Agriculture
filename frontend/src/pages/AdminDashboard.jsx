import React, { useState, useEffect } from 'react';
import { getAdminStats, getAllUsers, getAllFarms, getAllClimateData, getAllAlerts, deleteUser, deleteFarmAdmin } from '../api/services';
import '../styles/admin.css';

function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [farms, setFarms] = useState([]);
  const [climateData, setClimateData] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchAdminData();
  }, []);

  useEffect(() => {
    if (activeTab !== 'dashboard') {
      fetchAdminData();
    }
  }, [activeTab]);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      // Always fetch stats for accurate counts
      const statsResponse = await getAdminStats();
      if (statsResponse.data.success) {
        setStats(statsResponse.data.stats);
      }

      if (activeTab === 'dashboard') {
        // Already fetched stats above
      } else if (activeTab === 'users') {
        const usersResponse = await getAllUsers();
        if (usersResponse.data.success) {
          setUsers(usersResponse.data.users);
        }
      } else if (activeTab === 'farms') {
        const farmsResponse = await getAllFarms();
        if (farmsResponse.data.success) {
          setFarms(farmsResponse.data.farms);
        }
      } else if (activeTab === 'climate') {
        const climateResponse = await getAllClimateData();
        if (climateResponse.data.success) {
          setClimateData(climateResponse.data.data);
        }
      } else if (activeTab === 'alerts') {
        const alertsResponse = await getAllAlerts();
        if (alertsResponse.data.success) {
          setAlerts(alertsResponse.data.alerts);
        }
      }
    } catch (error) {
      console.error('Error fetching admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user and all associated data?')) {
      try {
        await deleteUser(userId);
        setUsers(users.filter(u => u._id !== userId));
      } catch (error) {
        console.error('Error deleting user:', error);
      }
    }
  };

  const handleDeleteFarm = async (farmId) => {
    if (window.confirm('Are you sure you want to delete this farm and all associated data?')) {
      try {
        await deleteFarmAdmin(farmId);
        setFarms(farms.filter(f => f._id !== farmId));
      } catch (error) {
        console.error('Error deleting farm:', error);
      }
    }
  };

  const getPaginatedData = (data) => {
    const startIndex = (page - 1) * itemsPerPage;
    return {
      items: data.slice(startIndex, startIndex + itemsPerPage),
      totalPages: Math.ceil(data.length / itemsPerPage)
    };
  };

  return (
    <div className="admin-container">
      <div className="admin-header">
        <h1 className="admin-title">⚙️ Admin Dashboard</h1>
        <p className="admin-subtitle">Manage users, farms, climate data, and system alerts</p>
      </div>

      <div className="admin-content">
        {/* Tabs */}
        <div className="admin-tabs">
          <button
            className={`tab-button ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => { setActiveTab('dashboard'); setPage(1); }}
          >
            📊 Dashboard
          </button>
          <button
            className={`tab-button ${activeTab === 'users' ? 'active' : ''}`}
            onClick={() => { setActiveTab('users'); setPage(1); }}
          >
            👥 Users ({stats?.totalUsers || users.length})
          </button>
          <button
            className={`tab-button ${activeTab === 'farms' ? 'active' : ''}`}
            onClick={() => { setActiveTab('farms'); setPage(1); }}
          >
            🏠 Farms ({stats?.totalFarms || farms.length})
          </button>
          <button
            className={`tab-button ${activeTab === 'climate' ? 'active' : ''}`}
            onClick={() => { setActiveTab('climate'); setPage(1); }}
          >
            📈 Climate Data ({stats?.totalClimateEntries || climateData.length})
          </button>
          <button
            className={`tab-button ${activeTab === 'alerts' ? 'active' : ''}`}
            onClick={() => { setActiveTab('alerts'); setPage(1); }}
          >
            🔔 Alerts ({stats?.totalAlerts || alerts.length})
          </button>
        </div>

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && stats && (
          <div>
            <div className="stats-dashboard">
              <div className="stat-card">
                <div className="stat-card-icon" style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>👥</div>
                <div className="stat-card-number">{stats.totalUsers}</div>
                <div className="stat-card-label">Total Users</div>
              </div>
              <div className="stat-card">
                <div className="stat-card-icon" style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🏠</div>
                <div className="stat-card-number">{stats.totalFarms}</div>
                <div className="stat-card-label">Total Farms</div>
              </div>
              <div className="stat-card">
                <div className="stat-card-icon" style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📈</div>
                <div className="stat-card-number">{stats.totalClimateEntries}</div>
                <div className="stat-card-label">Climate Entries</div>
              </div>
              <div className="stat-card">
                <div className="stat-card-icon" style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🔔</div>
                <div className="stat-card-number">{stats.totalAlerts}</div>
                <div className="stat-card-label">Total Alerts</div>
              </div>
              <div className="stat-card">
                <div className="stat-card-icon" style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>⚠️</div>
                <div className="stat-card-number">{stats.unreadAlerts}</div>
                <div className="stat-card-label">Unread Alerts</div>
              </div>
              <div className="stat-card">
                <div className="stat-card-icon" style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🌡️</div>
                <div className="stat-card-number">{stats.averageTemperature}°C</div>
                <div className="stat-card-label">Avg Temperature</div>
              </div>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="data-table">
            {loading ? (
              <div style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div>
            ) : users.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">👥</div>
                <p>No users found</p>
              </div>
            ) : (
              <>
                <div className="table-wrapper">
                  <table>
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Username</th>
                        <th>Farms</th>
                        <th>Created</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {getPaginatedData(users).items.map(user => (
                        <tr key={user._id}>
                          <td>{user.firstName} {user.lastName}</td>
                          <td>{user.email}</td>
                          <td>{user.username}</td>
                          <td>{user.farms?.length || 0}</td>
                          <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                          <td>
                            <div className="action-buttons">
                              <button
                                className="btn-small btn-danger"
                                onClick={() => handleDeleteUser(user._id)}
                              >
                                🗑️ Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="pagination">
                  {Array.from({ length: getPaginatedData(users).totalPages }, (_, i) => (
                    <button
                      key={i + 1}
                      onClick={() => setPage(i + 1)}
                      className={page === i + 1 ? 'active' : ''}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* Farms Tab */}
        {activeTab === 'farms' && (
          <div className="data-table">
            {loading ? (
              <div style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div>
            ) : farms.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">🏠</div>
                <p>No farms found</p>
              </div>
            ) : (
              <>
                <div className="table-wrapper">
                  <table>
                    <thead>
                      <tr>
                        <th>Farm Name</th>
                        <th>Location</th>
                        <th>Owner</th>
                        <th>Crop Type</th>
                        <th>Area (ha)</th>
                        <th>Created</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {getPaginatedData(farms).items.map(farm => (
                        <tr key={farm._id}>
                          <td>{farm.name}</td>
                          <td>{farm.location}</td>
                          <td>{farm.owner?.firstName} {farm.owner?.lastName}</td>
                          <td>{farm.cropType}</td>
                          <td>{farm.areaInHectares || '-'}</td>
                          <td>{new Date(farm.createdAt).toLocaleDateString()}</td>
                          <td>
                            <div className="action-buttons">
                              <button
                                className="btn-small btn-danger"
                                onClick={() => handleDeleteFarm(farm._id)}
                              >
                                🗑️ Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="pagination">
                  {Array.from({ length: getPaginatedData(farms).totalPages }, (_, i) => (
                    <button
                      key={i + 1}
                      onClick={() => setPage(i + 1)}
                      className={page === i + 1 ? 'active' : ''}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* Climate Data Tab */}
        {activeTab === 'climate' && (
          <div className="data-table">
            {loading ? (
              <div style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div>
            ) : climateData.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">📈</div>
                <p>No climate data found</p>
              </div>
            ) : (
              <>
                <div className="table-wrapper">
                  <table>
                    <thead>
                      <tr>
                        <th>Farm</th>
                        <th>Temperature</th>
                        <th>Humidity</th>
                        <th>Soil Moisture</th>
                        <th>Air Quality</th>
                        <th>Source</th>
                        <th>Timestamp</th>
                      </tr>
                    </thead>
                    <tbody>
                      {getPaginatedData(climateData).items.map(data => (
                        <tr key={data._id}>
                          <td>{data.farm?.name}</td>
                          <td>{data.temperature?.toFixed(2)}°C</td>
                          <td>{data.humidity?.toFixed(1)}%</td>
                          <td>{data.soilMoisture?.toFixed(1)}%</td>
                          <td>{data.airQuality}</td>
                          <td>
                            <span style={{
                              padding: '0.25rem 0.5rem',
                              borderRadius: '4px',
                              background: data.source === 'api' ? '#e3f2fd' : '#e8f5e9',
                              color: data.source === 'api' ? '#3498db' : '#27ae60',
                              fontSize: '0.85rem'
                            }}>
                              {data.source === 'api' ? '📡' : '✋'}
                            </span>
                          </td>
                          <td>{new Date(data.timestamp).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="pagination">
                  {Array.from({ length: getPaginatedData(climateData).totalPages }, (_, i) => (
                    <button
                      key={i + 1}
                      onClick={() => setPage(i + 1)}
                      className={page === i + 1 ? 'active' : ''}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* Alerts Tab */}
        {activeTab === 'alerts' && (
          <div className="data-table">
            {loading ? (
              <div style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div>
            ) : alerts.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">🔔</div>
                <p>No alerts found</p>
              </div>
            ) : (
              <>
                <div className="table-wrapper">
                  <table>
                    <thead>
                      <tr>
                        <th>Farm</th>
                        <th>Type</th>
                        <th>Message</th>
                        <th>Severity</th>
                        <th>Status</th>
                        <th>Created</th>
                      </tr>
                    </thead>
                    <tbody>
                      {getPaginatedData(alerts).items.map(alert => (
                        <tr key={alert._id}>
                          <td>{alert.farm?.name}</td>
                          <td>{alert.type.toUpperCase()}</td>
                          <td>{alert.message}</td>
                          <td>
                            <span style={{
                              padding: '0.25rem 0.5rem',
                              borderRadius: '4px',
                              background: alert.severity === 'critical' ? '#ffe6e6' :
                                         alert.severity === 'high' ? '#fff3e0' :
                                         alert.severity === 'medium' ? '#e3f2fd' : '#e8f5e9',
                              color: alert.severity === 'critical' ? '#e74c3c' :
                                    alert.severity === 'high' ? '#f39c12' :
                                    alert.severity === 'medium' ? '#3498db' : '#27ae60',
                              fontSize: '0.85rem',
                              fontWeight: 'bold'
                            }}>
                              {alert.severity}
                            </span>
                          </td>
                          <td>
                            <span style={{
                              padding: '0.25rem 0.5rem',
                              borderRadius: '4px',
                              background: alert.isRead ? '#e8f5e9' : '#fff3e0',
                              color: alert.isRead ? '#27ae60' : '#f39c12',
                              fontSize: '0.85rem'
                            }}>
                              {alert.isRead ? '✓ Read' : '📌 Unread'}
                            </span>
                          </td>
                          <td>{new Date(alert.createdAt).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="pagination">
                  {Array.from({ length: getPaginatedData(alerts).totalPages }, (_, i) => (
                    <button
                      key={i + 1}
                      onClick={() => setPage(i + 1)}
                      className={page === i + 1 ? 'active' : ''}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminDashboard;
