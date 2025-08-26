# WanderTogether Travel App

## Overview

WanderTogether is a comprehensive group travel planning platform built as a progressive web app (PWA) with native mobile capabilities through Capacitor. The application enables friends to collaboratively plan trips, manage expenses, coordinate activities, and maintain real-time communication throughout their travel journey. The platform combines modern web technologies with AI-powered features to provide intelligent travel recommendations and multilingual support.

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes

**Google Cloud Platform Deployment (August 26, 2025)**
- Successfully created bulletproof Node.js App Engine deployment template
- Resolved npm optional dependency bug (Rollup @rollup/rollup-linux-x64-gnu issue)
- Implemented separate Cloud Build and App Engine configurations
- Added comprehensive build process with error handling and verification
- Created production-only dependency configuration to prevent build conflicts
- Fixed Cloud Build logging requirements and service account configuration
- Application deployment template works straight from GitHub to GCP without modification
- Local development environment also fixed for Rollup dependency issues

## System Architecture

### Frontend Architecture
The client-side application is built with React 18 and TypeScript, utilizing a component-based architecture pattern. The UI framework leverages Radix UI primitives with shadcn/ui components, styled with Tailwind CSS for consistent design. The application implements responsive design principles with mobile-first considerations and supports both light and dark themes through a context-based theme system.

Key architectural decisions:
- **Component Structure**: Modular components organized by feature domains (activities, expenses, group-management, etc.)
- **State Management**: React hooks for local state with React Query for server state management and caching
- **Routing**: React Router for client-side navigation with protected route patterns
- **Authentication**: Context-based auth system with localStorage persistence
- **Forms**: React Hook Form with Zod validation for type-safe form handling

### Backend Architecture
The server follows a REST API architecture built with Express.js and TypeScript. The application uses a monorepo structure with shared schema definitions between client and server to ensure type consistency across the full stack.

Core backend components:
- **API Routes**: RESTful endpoints organized by resource domains (trips, users, expenses, messages)
- **Database Layer**: Drizzle ORM with PostgreSQL providing type-safe database operations
- **File Handling**: Multer for file uploads with Google Cloud Storage integration for scalable file storage
- **Authentication**: Custom auth system with session-based authentication stored in localStorage

### Data Storage Solutions
The application uses PostgreSQL as the primary database with Neon serverless hosting for scalability. The database schema is managed through Drizzle ORM with migration support.

Key data entities:
- **Users**: Comprehensive user profiles with travel preferences, dietary restrictions, and accessibility needs
- **Trips**: Core trip entities with destination, dates, and group settings
- **Participants**: Many-to-many relationship between users and trips with role-based access control
- **Expenses**: Shared expense tracking with split calculations and payment verification
- **Messages**: Real-time group chat with file sharing capabilities
- **Activities**: AI-generated and user-submitted activity suggestions with voting mechanisms

### Authentication and Authorization
The system implements a custom authentication mechanism with role-based access control for trip management. Users can have roles of owner, co-organizer, or participant within each trip context.

Authentication flow:
- User registration/login creates secure sessions
- Session tokens stored in localStorage for persistence
- Role-based permissions enforce access control for sensitive operations
- Invitation-based trip joining with token validation

### Mobile and PWA Integration
The application is built as a Progressive Web App with Capacitor integration for native mobile features. This hybrid approach allows deployment as both a web application and native mobile apps for Android.

Native capabilities include:
- **Camera Access**: Photo capture for payment proof uploads and trip documentation
- **Geolocation**: Location sharing and check-ins during trips
- **Push Notifications**: Real-time trip updates and expense reminders
- **Device Information**: Platform-specific optimizations and feature detection
- **File Sharing**: Native sharing capabilities for trip invitations and updates

## External Dependencies

### Third-Party Services
- **Neon Database**: Serverless PostgreSQL hosting with connection pooling
- **Google Cloud Storage**: Scalable file storage for payment proofs and trip documents
- **SendGrid**: Email service for invitation delivery and notifications
- **Anthropic Claude**: AI service for travel recommendations and activity suggestions (with fallback mechanisms)

### Key NPM Packages
- **@capacitor/core**: Cross-platform native runtime for mobile app deployment
- **@neondatabase/serverless**: Serverless database driver with WebSocket support
- **drizzle-orm**: Type-safe ORM with PostgreSQL dialect support
- **@radix-ui/react-***: Accessible UI primitives for consistent component behavior
- **@tanstack/react-query**: Server state management with caching and synchronization
- **zod**: Runtime type validation for API contracts and form validation

### Development and Build Tools
- **Vite**: Modern build tool with fast development server and optimized production builds
- **TypeScript**: Static type checking across the entire application stack
- **Tailwind CSS**: Utility-first CSS framework with custom design system
- **ESBuild**: Fast JavaScript bundler for server-side code compilation
- **PostCSS**: CSS processing with Tailwind CSS integration