# Tardezinha da Space

## Overview
This is a React + TypeScript event management application for "Tardezinha da Space" - an annual company celebration event. The application is built with Vite and uses Supabase for backend services.

**Current State:** The application is fully configured and running in the Replit environment. It's ready for development and deployment.

## Recent Changes (November 21, 2025)
- **Event Date Consistency Fix**: Synchronized both countdown timers (Countdown.tsx and Checkin.tsx) to use the same event date: December 21, 2025 at 12:00 PM
- **Footer Date Correction**: Fixed day of week from "Sábado" to "Domingo" (December 21, 2025 is a Sunday, not Saturday)
- **Database Column Addition**: Added `employee_id` column to confirmations table with foreign key relationship to employees table for duplicate prevention system
- **SQL Script Fix**: Created corrected SQL script (ADD_EMPLOYEE_ID_CORRIGIDO.sql) that avoids errors from non-existent columns

## Previous Changes (November 20, 2025)
- **Supabase Configuration Fix**: Fixed critical bug - changed from `process.env` to `import.meta.env.VITE_*` for proper Vite environment variable access
- **Checkin Redesign**: Completely redesigned following reference design with gradient title, "100% GRÁTIS" badge, prominent green CTA button, transport warning, countdown, and confirmed attendees carousel
- **Admin Dashboard Overhaul**: Professional design with dark slate header, refined tabs with elegant SVG icons, soft color palette (blues/grays/emerald), improved statistics cards
- **Purchase Verification System**: Added attendance confirmation requirement before accessing purchase options - blocked buttons show informative alerts and scroll to checkin section
- **Mobile-First Responsive Design**: Ensured complete responsiveness across all components with Tailwind breakpoints (sm:, md:, lg:)
- Created `vite-env.d.ts` for proper TypeScript environment variable declarations
- Updated all components to use professional SVG icons instead of emojis for better visual consistency

## Previous Changes (November 19, 2025)
- Configured Vite to run on port 5000 with proper Replit proxy support
- Added `allowedHosts: true` to Vite config to allow Replit proxy access
- Added HMR configuration for hot module replacement in Replit environment
- Migrated Supabase credentials to environment variables for security
- Successfully connected to Supabase backend (credentials configured)
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
- **Event Countdown Timer**: Dynamic countdown showing days until the event
- **Employee Check-in System**: 
  - Autocomplete search for 156 employees from Supabase database
  - Companion tracking (max 2 adults + 5 children with RG/CPF validation)
  - Bus boarding management with seat allocation
  - Real-time confirmation carousel showing confirmed attendees
- **Photo Gallery**: Showcase of previous event photos
- **Purchase Options**: 
  - Guest daily passes (R$ 103,78)
  - Bus transfer tickets (R$ 64,19)
  - Blocked until attendance confirmation
  - Automatic redirect to purchase platform
- **Professional Admin Dashboard**:
  - Real-time statistics (confirmations, adults, children, daily passes, transport)
  - Attendance management with full CRUD operations
  - Bus boarding list with check-in/check-out tracking
  - Employee database management
  - Password-protected access (password: 'space2025')
- **FAQ Section**: Common questions and answers
- **Event Rules Display**: Complete event guidelines and regulations
- **Mobile-First Design**: Fully responsive across all devices

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
✅ **Status: Connected** - The application is currently connected to Supabase with the following configuration:
- Project URL: Configured via `SUPABASE_URL` environment variable
- Anon Key: Configured via `SUPABASE_KEY` environment variable

**Note:** The Supabase credentials are stored securely in Replit Secrets and are automatically injected into the application at build time through Vite's define configuration.

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
