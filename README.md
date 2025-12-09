# WhatsApp Webhook Server

A structured WhatsApp Cloud API webhook server for gym management system.

## 📁 Project Structure

```
whatsapp_webhook/
├── src/
│   ├── config/          # Configuration files
│   │   └── index.js
│   ├── controllers/     # Request handlers
│   │   └── webhook.controller.js
│   ├── services/        # Business logic
│   │   ├── whatsapp.service.js
│   │   └── backend.service.js
│   ├── routes/          # Route definitions
│   │   └── webhook.routes.js
│   ├── middleware/      # Express middleware
│   │   └── errorHandler.js
│   ├── utils/           # Utility functions
│   │   └── logger.js
│   └── app.js           # Express app setup
├── tests/               # Test files
│   └── simulate.js
├── .env                 # Environment variables
├── .env.example         # Example environment file
├── server.js            # Entry point
└── package.json
```

## 🚀 Getting Started

### Installation

```bash
npm install
```

### Environment Variables

Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

### Running the Server

Development mode with auto-reload:
```bash
npm run dev
```

Production mode:
```bash
npm start
```

### Testing

Run simulation:
```bash
npm test
```

## 📡 API Endpoints

- `GET /` - Health check
- `GET /webhook` - Webhook verification
- `POST /webhook` - Handle incoming messages

## 🏗️ Architecture

### Services Layer
- **WhatsAppService**: Handles all WhatsApp messaging operations
- **BackendService**: Communicates with the gym management backend

### Controller Layer
- **WebhookController**: Processes incoming webhook requests

### Routes Layer
- Clean route definitions with proper separation

### Middleware
- Error handling
- Request logging
- JSON parsing

## 🔧 Configuration

All configuration is centralized in `src/config/index.js` with sections for:
- WhatsApp API settings
- Backend API settings
- Server settings

## 📝 License

ISC
