# WhatsApp Webhook - Project Structure

## 📁 Directory Structure

```
whatsapp_webhook/
├── src/                          # Source code
│   ├── config/                   # Configuration
│   │   └── index.js             # Centralized config (WhatsApp, Backend, Server)
│   │
│   ├── controllers/              # Request handlers
│   │   └── webhook.controller.js # Webhook message handling logic
│   │
│   ├── services/                 # Business logic layer
│   │   ├── backend.service.js   # Backend API communication
│   │   └── whatsapp.service.js  # WhatsApp messaging operations
│   │
│   ├── routes/                   # Route definitions
│   │   └── webhook.routes.js    # Webhook endpoint routes
│   │
│   ├── middleware/               # Express middleware
│   │   └── errorHandler.js      # Error handling & 404
│   │
│   ├── utils/                    # Utility functions
│   │   └── logger.js            # Logging utility
│   │
│   └── app.js                    # Express app configuration
│
├── tests/                        # Test files
│   └── simulate.js              # Webhook simulation script
│
├── .env                          # Environment variables (gitignored)
├── .env.example                  # Example environment file
├── .gitignore                    # Git ignore rules
├── package.json                  # NPM dependencies & scripts
├── package-lock.json             # NPM lock file
├── server.js                     # Application entry point
└── README.md                     # Documentation
```

## 🏗️ Architecture Layers

### 1. **Entry Point** (`server.js`)
- Starts the Express server
- Handles graceful shutdown
- Loads configuration

### 2. **Application Layer** (`src/app.js`)
- Express app setup
- Middleware registration
- Route mounting
- Error handling

### 3. **Routes Layer** (`src/routes/`)
- Clean route definitions
- Maps HTTP endpoints to controllers
- Minimal logic, delegates to controllers

### 4. **Controllers Layer** (`src/controllers/`)
- Handles HTTP requests/responses
- Input validation
- Delegates business logic to services
- Formats responses

### 5. **Services Layer** (`src/services/`)
- **WhatsAppService**: All WhatsApp Cloud API operations
  - Send messages
  - Format interactive messages
  - Handle different message types
  
- **BackendService**: All gym backend API operations
  - Fetch gyms and plans
  - Create subscriptions
  - Check subscription status

### 6. **Middleware Layer** (`src/middleware/`)
- Error handling
- 404 handling
- Request logging (in app.js)

### 7. **Utilities Layer** (`src/utils/`)
- Logger with timestamps
- Reusable helper functions

### 8. **Configuration Layer** (`src/config/`)
- Centralized configuration
- Environment variable management
- Organized by domain (whatsapp, backend, server)

## 🔄 Request Flow

```
Incoming Request
    ↓
server.js (Entry Point)
    ↓
app.js (Express Setup)
    ↓
webhook.routes.js (Route Matching)
    ↓
webhook.controller.js (Request Handling)
    ↓
whatsapp.service.js / backend.service.js (Business Logic)
    ↓
External APIs (WhatsApp / Backend)
    ↓
Response
```

## 📦 Module Responsibilities

| Module | Responsibility |
|--------|---------------|
| `server.js` | Application bootstrap |
| `app.js` | Express configuration |
| `webhook.routes.js` | Route definitions |
| `webhook.controller.js` | Request/response handling |
| `whatsapp.service.js` | WhatsApp API operations |
| `backend.service.js` | Backend API operations |
| `errorHandler.js` | Error handling middleware |
| `logger.js` | Logging utility |
| `config/index.js` | Configuration management |

## 🎯 Key Features

- ✅ **Modular Structure**: Clear separation of concerns
- ✅ **Class-Based Services**: Organized business logic
- ✅ **Centralized Config**: Single source of truth
- ✅ **Error Handling**: Comprehensive error middleware
- ✅ **Logging**: Timestamped logging utility
- ✅ **Testing**: Simulation script for testing
- ✅ **Documentation**: Comprehensive README

## 🚀 NPM Scripts

```bash
npm start      # Start production server
npm run dev    # Start development server with auto-reload
npm test       # Run simulation tests
```
