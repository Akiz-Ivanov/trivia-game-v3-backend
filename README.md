# 🧠 Trivia Flair 3.0 Backend

[![Live API](https://img.shields.io/badge/API-Live-green?style=for-the-badge)](https://trivia-game-v3-backend.onrender.com/)
[![Frontend](https://img.shields.io/badge/Frontend-Repository-blue?style=for-the-badge)](https://github.com/Akiz-Ivanov/trivia-game-v3-frontend)

A robust Node.js backend API powering the Trivia Flair 3.0 game. Provides user authentication, radio station proxy services, and seamless integration with the React frontend.

🚀 **Live API**: [trivia-game-v3-backend.onrender.com](https://trivia-game-v3-backend.onrender.com/)
🎮 **Frontend**: [trivia-game-v3-frontend.onrender.com](https://trivia-game-v3-frontend.onrender.com/)

## 📚 Table of Contents

- [✨ Features](#-features)
  - [🔐 Authentication System](#-authentication-system)
  - [📻 Radio Proxy Service](#-radio-proxy-service)
  - [🛡️ Robust Error Handling](#️-robust-error-handling)
- [🛠️ Tech Stack](#️-tech-stack)
- [🏗️ Architecture](#️-architecture)
  - [Controllers](#controllers)
  - [Middleware](#middleware)
  - [Utils & Services](#utils--services)
- [📡 API Endpoints](#-api-endpoints)
  - [Authentication](#authentication)
  - [Radio Proxy](#radio-proxy)
- [🚀 Quick Start](#-quick-start)
- [⚙️ Configuration](#️-configuration)
- [🧪 Testing](#-testing)
- [🌐 Deployment](#-deployment)
- [📈 Performance Features](#-performance-features)
- [🔒 Security](#-security)
- [🤝 Contributing](#-contributing)

## ✨ Features

### 🔐 Authentication System
- **JWT-based authentication** with secure token handling
- **User registration and login** with input validation
- **Password hashing** using bcrypt for security
- **Persistent sessions** with token extraction middleware
- **MongoDB Atlas integration** for user data storage

### 📻 Radio Proxy Service
- **Intelligent server discovery** via DNS SRV lookup
- **Health checking** for Radio Browser API servers
- **Load balancing** across multiple radio servers
- **Fallback mechanisms** for high availability
- **Caching** with LRU cache for improved performance
- **30,000+ radio stations** proxied from Radio Browser API

### 🛡️ Robust Error Handling
- **Comprehensive error middleware** for graceful failures
- **Request logging** with Morgan for debugging
- **CORS configuration** for secure cross-origin requests
- **Input validation** using the validator library
- **Unknown endpoint handling** for better API responses

## 🛠️ Tech Stack

- **Node.js** + **Express 5.1** - Core server framework
- **MongoDB Atlas** + **Mongoose 8.17** - Database and ODM
- **JWT** + **bcrypt** - Authentication and security
- **Axios 1.12** - HTTP client for external APIs
- **Morgan** - HTTP request logger
- **Validator 13.15** - Input validation
- **LRU Cache 11.2** - In-memory caching
- **SuperTest** + **Node.js Test Runner** - Testing framework
- **CORS** - Cross-origin resource sharing
- **dotenv** - Environment variable management

## 🏗️ Architecture

### Controllers
```
controllers/
├── users.js      # User registration and management
├── login.js      # Authentication and JWT handling
└── radio.js      # Radio Browser API proxy
```

### Middleware
- **Token Extractor** - JWT token parsing and validation
- **Error Handler** - Centralized error processing
- **Unknown Endpoint** - 404 handling for undefined routes

### Utils & Services
- **Radio Config** - Configuration for Radio Browser API
- **Server Discovery** - DNS SRV lookup and health checking
- **Logger** - Structured logging utilities
- **Config** - Environment-based configuration management

## 📡 API Endpoints

### Authentication
```http
POST /api/users          # Register new user
POST /api/login          # User login
```

### Radio Proxy
```http
GET /api/radio/*         # Proxy to Radio Browser API
                         # with automatic server selection
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- MongoDB Atlas account
- Git

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/Akiz-Ivanov/trivia-game-v3-backend
cd trivia-game-v3-backend
```

2. **Install dependencies**
```bash
npm install
```

3. **Environment setup**
Create a `.env` file in the root directory:
```bash
MONGODB_URI=your_mongodb_atlas_connection_string
SECRET=your_jwt_secret_key
FRONTEND_URL=http://localhost:5173
PORT=3001
```

4. **Run development server**
```bash
npm run dev
```

5. **Run tests**
```bash
npm test
```

## ⚙️ Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `MONGODB_URI` | MongoDB Atlas connection string | Required |
| `SECRET` | JWT secret for token signing | Required |
| `FRONTEND_URL` | Frontend URL for CORS | `http://localhost:5173` |
| `PORT` | Server port | `3001` |
| `NODE_ENV` | Environment mode | `development` |

### Radio Browser Configuration
The backend automatically discovers and health-checks Radio Browser API servers:

- **DNS SRV Lookup**: `_api._tcp.radio-browser.info`
- **Fallback Servers**: Hardcoded list of reliable endpoints
- **Health Checking**: 3-second timeout per server
- **Load Balancing**: Random server selection from healthy instances

## 🧪 Testing

The backend includes comprehensive tests for the user authentication system:

```bash
# Run all tests
npm test

# Run tests in development
npm run test:dev

# Start test server
npm run start:test
```

**Test Coverage:**
- ✅ User registration validation
- ✅ Login authentication flow
- ✅ JWT token generation and validation
- ✅ Error handling scenarios
- 🚧 Radio proxy tests (planned for future)

## 🌐 Deployment

### Render.com Deployment

The backend is configured for easy deployment on Render:

1. **Automatic builds** from GitHub repository
2. **Environment variables** managed through Render dashboard
3. **Health checks** for service monitoring
4. **Auto-scaling** based on demand

**Deploy Configuration** (`render.yaml`):
```yaml
services:
  - type: web
    name: trivia-game-backend
    env: node
    buildCommand: npm install
    startCommand: npm start
    envVars:
      - key: MONGODB_URI
        value: ${MONGODB_URI}
      - key: SECRET
        value: ${SECRET}
      - key: FRONTEND_URL
        value: ${FRONTEND_URL}
```

### Manual Deployment

1. Set production environment variables
2. Install production dependencies: `npm install --production`
3. Start server: `npm start`

## 📈 Performance Features

### Caching Strategy
- **LRU Cache** for frequently accessed radio station data
- **Server health status** caching to reduce DNS lookups
- **Automatic cache invalidation** for stale data

### Load Balancing
- **Multi-server support** for Radio Browser API
- **Automatic failover** when servers are unavailable
- **Health monitoring** with periodic server checks
- **Geographic distribution** across EU and US servers

### Error Recovery
- **Exponential backoff** for failed requests
- **Graceful degradation** when external services are down
- **Circuit breaker pattern** for Radio Browser API calls

## 🔒 Security

### Authentication Security
- **Password hashing** with bcrypt (10 rounds)
- **JWT tokens** with secure secret keys
- **Token expiration** for session management
- **Input sanitization** with validator library

### API Security
- **CORS configuration** for trusted origins only
- **Rate limiting** through proxy server capabilities
- **Error message sanitization** to prevent information leakage
- **Secure headers** and middleware stack

### Data Protection
- **MongoDB Atlas** with built-in encryption
- **Environment variable protection** for sensitive data
- **No sensitive data logging** in production
- **Secure token transmission** via HTTP headers

## 🤝 Contributing

### Development Workflow
1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes and add tests
4. Ensure all tests pass: `npm test`
5. Commit your changes: `git commit -m 'Add amazing feature'`
6. Push to the branch: `git push origin feature/amazing-feature`
7. Open a Pull Request

### Code Standards
- Use **CommonJS** module system
- Follow **Express.js best practices**
- Include **tests** for new features
- Use **descriptive commit messages**
- Maintain **consistent code formatting**

---

## 🔗 Related Links

- **Frontend Repository**: [trivia-game-v3-frontend](https://github.com/Akiz-Ivanov/trivia-game-v3-frontend)
- **Live Demo**: [Play Trivia Flair](https://trivia-game-v3-frontend.onrender.com/)
- **API Documentation**: [Backend API](https://trivia-game-v3-backend.onrender.com/)
- **Radio Browser API**: [radio-browser.info](https://www.radio-browser.info/)

---

**Built with ❤️ for trivia enthusiasts and radio lovers worldwide**