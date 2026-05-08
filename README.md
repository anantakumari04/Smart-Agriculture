<<<<<<< HEAD
# Smart Agriculture - Climate Monitoring System

A full-stack automated climate monitoring system for smart agriculture built with **Vite + React (JSX)**, **Node.js + Express.js**, and **MongoDB**.

## 🌾 Features

### User Features
- **User Authentication**: Register and login with secure JWT tokens
- **Farm Management**: Create and manage multiple farms
- **Real-time Climate Monitoring**: Monitor temperature, humidity, soil moisture, and air quality
- **OpenWeather API Integration**: Automatically fetch real-time weather data
- **Manual Data Entry**: Add climate data manually when needed
- **Smart Alerts**: Get notifications when climate conditions exceed safe thresholds
- **Data History**: View historical climate data with filters
- **Statistics Dashboard**: View 24-hour averages and trends

### Admin Features
- **System Dashboard**: View overall system statistics
- **User Management**: View all users and delete accounts
- **Farm Management**: View and manage all farms in the system
- **Climate Data Monitoring**: View all climate data from all farms
- **Alert Management**: Monitor and manage system alerts
- **Data Analytics**: Track and analyze system-wide metrics
- **Pagination**: Easy navigation through large datasets

## 🏗️ Project Structure

```
Capstone/
├── backend/
│   ├── models/
│   │   ├── User.js
│   │   ├── Farm.js
│   │   ├── ClimateData.js
│   │   └── Alert.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── climateRoutes.js
│   │   ├── alertRoutes.js
│   │   ├── farmRoutes.js
│   │   └── adminRoutes.js
│   ├── middleware/
│   │   └── auth.js
│   ├── package.json
│   ├── server.js
│   └── .env
│
└── frontend/
    ├── src/
    │   ├── api/
    │   │   ├── apiClient.js
    │   │   └── services.js
    │   ├── components/
    │   │   └── Navbar.jsx
    │   ├── pages/
    │   │   ├── Home.jsx
    │   │   ├── Login.jsx
    │   │   ├── Register.jsx
    │   │   ├── Dashboard.jsx
    │   │   ├── Alerts.jsx
    │   │   ├── DataHistory.jsx
    │   │   └── AdminDashboard.jsx
    │   ├── styles/
    │   │   ├── globals.css
    │   │   ├── navbar.css
    │   │   ├── auth.css
    │   │   ├── dashboard.css
    │   │   └── admin.css
    │   ├── App.jsx
    │   └── main.jsx
    ├── index.html
    ├── package.json
    └── vite.config.js
```

## 🛠️ Tech Stack

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **Axios** - HTTP client
- **CORS** - Cross-origin requests

### Frontend
- **React** - UI library
- **Vite** - Build tool
- **React Router DOM** - Routing
- **Axios** - HTTP client
- **CSS** - Styling (plain CSS, no frameworks)

## 📋 Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or cloud)
- npm or yarn
- OpenWeather API key (get free at https://openweathermap.org/api)

## 🚀 Installation & Setup

### 1. Clone or Setup the Repository

```bash
cd Capstone
```

### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create .env file with your configuration
# Copy content from .env.example and update with your values
# MONGODB_URI=mongodb://localhost:27017/smart-agriculture
# JWT_SECRET=your_secret_key
# OPENWEATHER_API_KEY=your_api_key
# PORT=5000

# Start the development server
npm run dev
```

Backend will run on `http://localhost:5000`

### 3. Frontend Setup

```bash
cd ../frontend

# Install dependencies
npm install

# Start the development server
npm run dev
```

Frontend will run on `http://localhost:5173`

## 📝 Default Test Account

The application comes with pre-filled login credentials for testing:
- **Username**: `ananta`
- **Password**: `123456`

## 🔗 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Climate Data
- `GET /api/climate/data` - Get all climate data
- `GET /api/climate/latest/:farmId` - Get latest climate data for farm
- `GET /api/climate/stats/:farmId` - Get 24-hour statistics
- `POST /api/climate/fetch-api/:farmId` - Fetch data from OpenWeather API
- `POST /api/climate/manual` - Add manual climate data

### Farms
- `GET /api/farms` - Get all farms
- `GET /api/farms/:id` - Get single farm
- `POST /api/farms` - Create farm
- `PATCH /api/farms/:id` - Update farm
- `DELETE /api/farms/:id` - Delete farm

### Alerts
- `GET /api/alerts` - Get alerts (with status filter)
- `PATCH /api/alerts/:id/read` - Mark alert as read
- `DELETE /api/alerts/:id` - Delete alert

### Admin (Admin only)
- `GET /api/admin/stats` - Get system statistics
- `GET /api/admin/users` - Get all users
- `GET /api/admin/farms` - Get all farms
- `GET /api/admin/climate-data` - Get all climate data
- `GET /api/admin/alerts` - Get all alerts
- `DELETE /api/admin/users/:id` - Delete user
- `DELETE /api/admin/farms/:id` - Delete farm

## 🎨 UI/UX Features

- **Responsive Design**: Works on desktop, tablet, and mobile
- **Clean Interface**: Green theme matching agriculture/nature
- **Intuitive Navigation**: Easy-to-use navbar and menus
- **Real-time Data**: Live climate data updates
- **Visual Indicators**: Color-coded alerts by severity
- **Data Tables**: Sortable and paginated data views
- **Charts Ready**: Structure prepared for chart integration

## 🔐 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcryptjs for password security
- **Role-based Access**: Admin and User roles
- **Protected Routes**: Frontend and backend route protection
- **CORS**: Configured for secure cross-origin requests

## 📊 Database Schema

### User
- firstName, lastName, username, email, password
- role (user/admin)
- farms (reference to Farm)

### Farm
- name, location, latitude, longitude
- phoneNumber, cropType, areaInHectares
- owner (reference to User)
- thresholds (min/max for temperature, humidity, soil moisture)

### ClimateData
- farm (reference to Farm)
- temperature, humidity, soilMoisture, airQuality
- windSpeed, rainfall
- source (api/manual)
- timestamp

### Alert
- farm (reference to Farm)
- type, message, severity, isRead
- triggeredValue, threshold
- createdAt

## 🌐 OpenWeather API Integration

The system automatically fetches weather data from OpenWeather API:
1. Get your free API key from https://openweathermap.org/api
2. Add it to your `.env` file as `OPENWEATHER_API_KEY`
3. The system fetches: temperature, humidity, wind speed, rainfall, air quality

## 📈 Future Enhancements

- [ ] Chart.js/D3 integration for data visualization
- [ ] Real-time WebSocket updates
- [ ] Email notifications for alerts
- [ ] Mobile app (React Native)
- [ ] Weather forecasting
- [ ] Soil health recommendations
- [ ] Export data to PDF/CSV
- [ ] Multiple language support
- [ ] Dark theme
- [ ] Advanced filtering and search

## 🤝 Contributing

Feel free to fork this project and submit pull requests for any improvements.

## 📄 License

This project is open source and available under the MIT License.

## 📧 Support

For issues or questions, please create an issue in the repository.

---

**Built with ❤️ for Smart Agriculture**
=======
# Smart-Agriculture
>>>>>>> f2e27a2032452f8749ea3ae4cceb925e758329ef
