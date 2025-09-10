# EduTrack - Smart Educational Management System

## Overview

EduTrack is a comprehensive educational management platform designed to streamline academic operations for students, teachers, and administrators. The system provides smart timetable management, QR-based attendance tracking, assignment management, AI-powered assistance, and multi-role dashboards. Built as a full-stack application with React frontend and Express backend, it leverages modern web technologies to deliver a seamless educational experience.

## Current Status: ✅ FULLY OPERATIONAL

The application is successfully deployed and running with all core features implemented:

- **Authentication System**: JWT-based login with role-based access control
- **Student Dashboard**: Next class display, today's schedule, assignments, digital ID with QR code
- **Teacher Dashboard**: Class management, attendance marking, assignment creation
- **Admin Dashboard**: User management, notice creation, system overview
- **AI Assistant**: Google Gemini-powered educational chatbot
- **Timetable Management**: Weekly class schedule with room and teacher information
- **Assignment System**: Create, submit, and track assignments with due dates
- **Notice Board**: Announcements with priority levels and target audiences
- **QR Attendance**: Digital student ID cards with QR codes for attendance marking

### Demo Credentials
- **Student**: rahul.sharma / student123
- **Teacher**: sarah.johnson / teacher123  
- **Admin**: admin / admin123

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript for type safety and better development experience
- **Styling**: TailwindCSS with shadcn/ui component library for consistent, modern UI design
- **State Management**: TanStack React Query for server state management and caching
- **Routing**: Wouter for lightweight client-side routing
- **Build Tool**: Vite for fast development and optimized production builds

### Backend Architecture
- **Runtime**: Node.js with Express.js framework for REST API development
- **Authentication**: JWT-based authentication with role-based access control (student, teacher, admin)
- **Database ORM**: Drizzle ORM for type-safe database operations
- **Session Management**: Express sessions with PostgreSQL session store
- **Development**: TypeScript with hot reload support via tsx

### Database Design
- **Primary Database**: PostgreSQL with connection through Neon serverless
- **Schema Structure**: 
  - User management with role-based separation (users, students, teachers)
  - Academic entities (subjects, classes, assignments)
  - Attendance tracking with QR code integration
  - Notice board and feedback systems
- **Migration Strategy**: Drizzle Kit for schema migrations and database synchronization

### Authentication & Authorization
- **Token Strategy**: JWT tokens stored in localStorage for client-side auth state
- **Role Management**: Three-tier role system (student, teacher, admin) with middleware-based route protection
- **Session Handling**: Secure session management with PostgreSQL backing store
- **Security**: Password hashing and token validation on protected routes

### UI/UX Design System
- **Component Library**: Radix UI primitives with custom shadcn/ui styling
- **Responsive Design**: Mobile-first approach with dedicated mobile navigation
- **Theme System**: CSS custom properties for consistent theming
- **Accessibility**: ARIA compliance through Radix UI components

### Real-time Features
- **QR Code Generation**: Dynamic QR codes for student attendance using qrcode.react
- **Attendance Scanning**: QR-based attendance marking system
- **Live Updates**: React Query for real-time data synchronization

### Development Workflow
- **Monorepo Structure**: Shared schema definitions between client and server
- **Type Safety**: End-to-end TypeScript with shared type definitions
- **Hot Reload**: Development server with instant updates for both frontend and backend
- **Build Process**: Vite for frontend bundling, esbuild for backend compilation

## External Dependencies

### AI Services
- **Google Gemini AI**: Integrated via @google/genai for intelligent student assistance, syllabus help, and educational content generation
- **Use Cases**: Study guidance, assignment help, timetable queries, and general academic support

### Database Services
- **Neon Database**: Serverless PostgreSQL hosting with @neondatabase/serverless driver
- **Connection Management**: Environment-based connection string configuration
- **Session Storage**: connect-pg-simple for PostgreSQL session persistence

### UI Libraries
- **Radix UI**: Comprehensive set of accessible, unstyled UI primitives
- **Lucide Icons**: Consistent icon system throughout the application
- **QR Code**: qrcode.react for generating student identification QR codes

### Development Tools
- **Replit Integration**: Development environment optimization with cartographer and runtime error overlay
- **TypeScript**: Full type safety across frontend, backend, and shared modules
- **ESLint/Prettier**: Code quality and formatting consistency

### Authentication & Session Management
- **JSON Web Tokens**: jsonwebtoken library for secure authentication
- **Session Store**: PostgreSQL-backed session management for scalability
- **Password Security**: Secure password hashing and validation

### Build & Deployment
- **Vite**: Modern build tool with React plugin and development server
- **esbuild**: Fast backend compilation for production deployment
- **Static Assets**: Optimized asset handling and public file serving