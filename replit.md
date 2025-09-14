# Overview

CoffeeChain is a comprehensive supply chain management platform specifically designed for the Kenyan coffee industry. The application tracks coffee from farm to cup, enabling transparency and traceability across the entire value chain. It supports multiple stakeholder roles including farmers, cooperatives, mill operators, exporters, roasters, and retailers, providing each with relevant tools and dashboards to manage their part of the coffee supply chain.

The platform features coffee lot tracking with QR code generation, inventory management across processing facilities, auction marketplace functionality, integrated payment processing, and SMS notification system for stakeholder communication.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **React with TypeScript**: Single-page application built using React 18 with TypeScript for type safety
- **Wouter**: Lightweight routing library for client-side navigation instead of React Router
- **TanStack Query**: Data fetching and caching library for efficient API state management
- **Vite**: Modern build tool for fast development and optimized production builds
- **Tailwind CSS**: Utility-first CSS framework for rapid UI development
- **shadcn/ui**: Component library built on Radix UI primitives with customizable design system

## Backend Architecture
- **Express.js**: Node.js web framework serving both API endpoints and static assets
- **TypeScript**: Full-stack type safety with ES modules
- **Monorepo Structure**: Shared schema and types between client and server in `/shared` directory
- **RESTful API**: Standard HTTP endpoints for CRUD operations on coffee supply chain entities
- **Middleware Pattern**: Request logging, error handling, and JSON parsing through Express middleware

## Data Storage Solutions  
- **PostgreSQL**: Primary database using Neon serverless PostgreSQL for scalability
- **Drizzle ORM**: Type-safe database queries and schema management with automatic TypeScript inference
- **Schema-First Design**: Centralized database schema in `/shared/schema.ts` with enums for coffee-specific data types (grades, processing methods, lot status)

## Authentication and Authorization
- **Role-Based Access**: Six distinct user roles (farmer, mill, cooperative, exporter, roaster, retailer) with role-specific UI and permissions
- **Context-Based State**: React Context API manages current user role throughout the application
- **Session Management**: Express sessions with PostgreSQL session storage for user authentication state

## Key Business Logic Components
- **QR Code Generation**: Coffee lot traceability through QR codes containing lot metadata (farmerId, quantity, processing method, timestamps)
- **Auction System**: Marketplace for coffee lot bidding with real-time price discovery
- **Payment Processing**: Multi-method payment support (M-Pesa, bank transfers, cash) with transaction tracking
- **SMS Notifications**: Automated messaging system for price alerts, weather updates, payment confirmations, and general communications
- **Inventory Tracking**: Multi-facility inventory management across wet mills, dry mills, and cooperative storage

# External Dependencies

## Database and Infrastructure
- **Neon Database**: Serverless PostgreSQL hosting with connection pooling
- **WebSocket Support**: Real-time database connections for live updates

## Payment Processing
- **Stripe**: Payment gateway integration for secure transaction processing
- **Stripe React Elements**: Frontend payment form components

## Communication Services
- **SMS Provider**: Backend SMS notification system (implementation details not specified in current codebase)

## Development and Deployment
- **Replit Integration**: Custom Vite plugins for Replit development environment
- **Development Tools**: Runtime error overlay, cartographer mapping, and dev banner plugins

## UI and Styling
- **Radix UI**: Accessible component primitives for consistent user interface
- **Lucide Icons**: Icon library for consistent visual elements
- **QRCode Library**: QR code generation for coffee lot tracking
- **React Hook Form**: Form validation and management with Zod schema validation

## Build and Development
- **ESBuild**: Fast bundling for server-side code in production
- **PostCSS**: CSS processing with Tailwind CSS integration
- **TypeScript Compiler**: Type checking and compilation across full stack