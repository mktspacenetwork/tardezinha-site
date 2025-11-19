# Tardezinha da Space

## Overview
This is a React + TypeScript event management application for "Tardezinha da Space" - an annual company celebration event. The application is built with Vite and uses Supabase for backend services.

**Current State:** The application is fully configured and running in the Replit environment. It's ready for development and deployment.

## Recent Changes (November 19, 2025)
- Configured Vite to run on port 5000 with proper Replit proxy support
- Added HMR configuration for hot module replacement in Replit environment
- Migrated Supabase credentials to environment variables for security
- Set up proper ESM module support in vite.config.ts
- Configured deployment settings for static site deployment
- Installed all npm dependencies

## Project Architecture

### Tech Stack
- **Frontend Framework:** React 19.2.0
- **Build Tool:** Vite 6.2.0
- **Language:** TypeScript 5.8.2
- **Styling:** Tailwind CSS (via CDN)
- **Backend:** Supabase (for database and authentication)

### Project Structure
```
/
├── components/         # React components
│   ├── Admin.tsx      # Admin panel
│   ├── Checkin.tsx    # Event check-in
│   ├── Countdown.tsx  # Event countdown timer
│   ├── EventDetails.tsx
│   ├── FAQ.tsx
│   ├── Footer.tsx
│   ├── Gallery.tsx
│   ├── Header.tsx
│   ├── Navbar.tsx
│   ├── PromoSection.tsx
│   ├── PurchaseOptions.tsx
│   └── Rules.tsx
├── data/
│   └── employees.ts   # Employee data
├── App.tsx            # Main application component
├── index.tsx          # Application entry point
├── index.html         # HTML template
├── supabaseClient.ts  # Supabase client configuration
├── types.ts           # TypeScript type definitions
├── vite.config.ts     # Vite configuration
└── package.json       # Project dependencies
```

### Key Features
- Event countdown timer
- Employee check-in system
- Photo gallery
- Purchase options for event extras
- Admin panel for event management
- FAQ section
- Event rules display

## Configuration

### Environment Variables
The following environment variables need to be set for full functionality:

- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_KEY` - Your Supabase anon/public key
- `GEMINI_API_KEY` (optional) - If using Gemini API features

### Port Configuration
- **Development Server:** Port 5000
- **Host:** 0.0.0.0 (configured for Replit proxy)
- **HMR:** Configured for clientPort 443

### Deployment
The project is configured for static site deployment:
- Build command: `npm run build`
- Output directory: `dist`
- Deployment type: Static

## Development Workflow

### Running Locally
```bash
npm install       # Install dependencies
npm run dev       # Start development server
```

### Building for Production
```bash
npm run build     # Build for production
npm run preview   # Preview production build
```

### Available Scripts
- `npm run dev` - Start Vite development server on port 5000
- `npm run build` - Build production bundle to `dist/`
- `npm run preview` - Preview production build locally

## Important Notes

### Supabase Setup
1. Create a Supabase project at https://supabase.com
2. Get your project URL and anon key from Project Settings → API
3. Add them as environment variables in Replit:
   - `SUPABASE_URL`
   - `SUPABASE_KEY`

### Tailwind CSS
Currently using Tailwind CSS via CDN (included in index.html). This is fine for development but should be migrated to PostCSS for production to reduce bundle size and improve performance.

### Browser Compatibility
The application uses modern ES2022 features and React 19. Ensure target browsers support these features.

## Future Improvements
- Migrate Tailwind CSS from CDN to PostCSS for production
- Add proper error handling and loading states
- Implement data caching strategies
- Add unit and integration tests
- Optimize images and assets for faster loading
