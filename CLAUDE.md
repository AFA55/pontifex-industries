# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Pontifex Industries is a Next.js 15 construction asset management platform positioned as a "Hilti ON!Track killer" with advanced BLE beacon integration. The platform provides real-time asset tracking, QR code scanning, and hardware integration for construction sites.

## Key Technologies

- **Framework**: Next.js 15 with App Router and React 19
- **Database**: PostgreSQL via Supabase with real-time subscriptions
- **Authentication**: Supabase Auth with profile-based roles
- **UI**: Tailwind CSS with shadcn/ui components (new-york variant)
- **Hardware**: Web Bluetooth API for M4P Pro beacon integration
- **State Management**: Zustand for client-side state
- **Forms**: React Hook Form with Zod validation
- **QR Codes**: html5-qrcode and qr-code-styling libraries

## Development Commands

```bash
# Development with Turbopack
npm run dev

# Production build
npm run build

# Production server
npm start

# Code linting
npm run lint

# Type checking (manual)
npx tsc --noEmit
```

## Project Structure

- **`/src/app`** - Next.js App Router pages and layouts
- **`/src/components`** - React components with `/ui` for reusable components
- **`/src/lib`** - Core business logic and utilities
  - `bluetooth.ts` - M4P Pro beacon hardware integration
  - `supabase.ts` - Database client configuration
  - `database-schema.sql` - Complete PostgreSQL schema
- **`/src/hooks`** - Custom React hooks including `useAuth.ts`
- **`/src/types`** - TypeScript definitions including Web Bluetooth API types

## Architecture Patterns

### Database-First Design
The system uses a comprehensive PostgreSQL schema with:
- Real-time asset tracking via `asset_realtime_status` view
- Bluetooth beacon integration tables (`asset_beacons`, `beacon_location_readings`)
- Movement event tracking with confidence scoring
- Optimized indexes for dashboard performance

### Hardware Integration
- **Primary**: Web Bluetooth API for M4P Pro beacons
- **Fallback**: Simulation mode when Bluetooth unavailable
- **Features**: RSSI-based distance estimation, battery monitoring, real-time location tracking

### Authentication & Authorization
- Supabase Auth with profile-based roles
- All pages wrapped in `ProtectedRoute` components
- Profile data includes company_id for multi-tenant support

### UI Patterns
- Modal-driven CRUD operations
- Touch-friendly design with 44px minimum touch targets
- Pontifex Industries brand colors (pontifex-blue, pontifex-teal)
- Construction-optimized spacing and typography

## Key Implementation Details

### Bluetooth Service (`/src/lib/bluetooth.ts`)
- BluetoothService class with M4P Pro beacon detection
- Graceful fallback to simulation when hardware unavailable
- RSSI-based distance calculation and signal strength categorization
- Real-time scanning with configurable callbacks

### Database Schema (`/src/lib/database-schema.sql`)
- Complete beacon integration schema with triggers
- Real-time status views for dashboard performance
- Movement event tracking with confidence scoring
- Comprehensive indexing strategy

### Type Safety
- Strict TypeScript configuration with Web Bluetooth API types
- Custom type definitions in `/src/types`
- Zod schemas for runtime validation

## Development Guidelines

### Code Style
- Follow existing component patterns in `/src/components`
- Use shadcn/ui components for consistency
- Implement proper error boundaries and loading states
- Maintain 44px minimum touch targets for accessibility

### Database Changes
- All schema changes go in `database-schema.sql`
- Use views for complex queries (see `asset_realtime_status`)
- Implement proper indexes for performance

### Hardware Integration
- Always provide simulation fallback for Bluetooth features
- Handle hardware permissions gracefully
- Use proper error handling for hardware failures

### Testing
- No testing framework currently configured
- Manual testing via hardware test suite at `/admin/hardware-test`
- Always test Bluetooth functionality in supported browsers

## Known Limitations

- No automated testing framework configured
- Hardware features require HTTPS and supported browsers
- Bluetooth permissions must be granted by user interaction
- Real-time features depend on Supabase connection stability

## Branch Context

Current branch: `feature/dsm-integration` - appears to be working on data source management integration features.