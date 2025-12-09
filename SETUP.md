# FitGym UI - Mobile-First PWA

A modern, mobile-first Progressive Web App for booking gym sessions using Next.js, Mobile Authentication, and Tailwind CSS.

## Features

✨ **Mobile-First Design** - Optimized for mobile devices  
🔐 **Mobile Auth** - Secure authentication with OTP
💾 **PWA Support** - Works offline, installable  
🎨 **Modern UI** - Responsive, accessible components  
📱 **Touch-Friendly** - Large buttons and easy navigation  
🚀 **Fast** - Built with Next.js 15 & Turbopack  

## Project Structure

```
gym-ui/
├── app/
│   ├── auth/
│   │   ├── login/           # Login page
│   │   └── verify-otp/      # OTP verification page
│   ├── dashboard/           # Main dashboard
│   ├── layout.tsx           # Root layout with PWA setup
│   ├── page.tsx            # Home page (redirects)
│   └── providers.tsx       # Client-side providers
├── lib/
│   ├── api/
│   │   └── client.ts       # API client with interceptors
│   └── store/
│       └── authStore.ts    # Zustand auth store
├── public/
│   ├── manifest.json       # PWA manifest
│   └── sw.js              # Service worker
└── package.json
```

## Setup Instructions

### 1. Install Dependencies

```bash
cd gym-ui
npm install
```

### 2. Backend Configuration

1. Make sure your backend is running and accessible.
2. Create `.env.local` file:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000/api
```

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Pages

### Login Page (`/auth/login`)
- Mobile number authentication
- Beautiful gradient UI
- Mobile-optimized
- Error handling

### Verify OTP Page (`/auth/verify-otp`)
- OTP verification
- Beautiful gradient UI
- Mobile-optimized
- Error handling

### Dashboard (`/dashboard`)
- User profile display
- Quick actions
- Logout functionality
- Protected route

## Authentication Flow

1. User enters their phone number and clicks "Continue"
2. The app sends a request to `/api/auth/send-otp`
3. The user is redirected to the verify-otp page
4. The user enters the OTP they received
5. The app sends a request to `/api/auth/verify-otp`
6. Backend verifies the OTP and returns a JWT
7. User is logged in with the JWT token
8. Redirected to their respective dashboard

## PWA Features

✅ **Installable** - Add to home screen on mobile  
✅ **Offline Support** - Service worker caches pages  
✅ **App-like** - Standalone display mode  
✅ **Fast** - Optimized assets and caching  
✅ **Web Push Ready** - Infrastructure for notifications  

### Install PWA

**iOS:**
1. Open in Safari
2. Tap Share → Add to Home Screen

**Android:**
1. Open in Chrome
2. Tap Menu → Install app

**Desktop:**
1. Click Install button in address bar

## Zustand Auth Store

```typescript
import { useAuthStore } from '@/lib/store/authStore';

const { user, token, setUser, setToken, logout } = useAuthStore();
```

## API Client

The API client automatically:
- Adds JWT token to all requests
- Handles 401 errors (redirects to login)
- Uses base URL from `.env.local`

```typescript
import { authAPI } from '@/lib/api/client';

// Send OTP
const response = await authAPI.sendOtp(phoneNumber);

// Verify OTP
await authAPI.verifyOtp(phoneNumber, otp);
```

## Styling

- **Framework**: Tailwind CSS v4
- **Icons**: Lucide React
- **Responsive**: Mobile-first approach
- **Gradients**: Purple to Blue theme

## Build & Deploy

### Build

```bash
npm run build
```

### Production Start

```bash
npm start
```

## Environment Variables

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_API_BASE_URL` | Backend API URL |

## Browser Support

- Chrome/Edge 88+
- Firefox 78+
- Safari 13+
- Mobile browsers (iOS Safari 13+, Chrome Android)

## Troubleshooting

### API Calls Failing
- Ensure backend is running on `NEXT_PUBLIC_API_BASE_URL`
- Check CORS configuration on backend
- Verify JWT token is valid

## Performance Metrics

- **FCP**: < 1.5s
- **LCP**: < 2.5s
- **CLS**: < 0.1
- **TTI**: < 2.5s

## License

MIT