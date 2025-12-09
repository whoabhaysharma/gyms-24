# FitGym - Mobile PWA for Gym Booking

A beautiful, modern Progressive Web App for booking gym sessions with Google authentication.

## Quick Start

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.local.example .env.local
# Edit .env.local with your Firebase credentials

# Run development server
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

## Key Features

- 🔐 **Google Sign-in** with Firebase
- 📱 **Mobile-First UI** - Optimized for phones
- 💾 **PWA Ready** - Installable, offline support
- ⚡ **Fast** - Next.js 15 with Turbopack
- 🎨 **Beautiful** - Tailwind CSS + Lucide Icons
- 🌐 **Responsive** - Works on all devices

## Pages

- `/` - Home (redirects to login/dashboard)
- `/auth/login` - Google login
- `/dashboard` - User dashboard (protected)

## Setup

See [SETUP.md](./SETUP.md) for detailed setup instructions.

## Building & Deployment

```bash
# Build for production
npm run build

# Start production server
npm start
```

Deploy to Vercel, Netlify, or any Node.js hosting.

## Technologies

- **Framework**: Next.js 15
- **Auth**: Firebase
- **Styling**: Tailwind CSS 4
- **State**: Zustand
- **HTTP**: Axios
- **Icons**: Lucide React
- **PWA**: Service Workers

## Project Structure

```
app/
├── auth/login/          # Login page
├── dashboard/           # Main app
├── layout.tsx          # Root layout
└── page.tsx            # Home redirect

lib/
├── api/client.ts       # API client
└── store/authStore.ts  # State management
```

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
