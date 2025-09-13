# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Carpenter is a full-stack framework built around Sequelize and React, designed to create extensible database-driven web applications with job management capabilities. The framework provides a structured way to build models, routes, and React components with automatic API generation.

## Development Commands

### Starting the Server
```bash
npm start               # Runs server.js to start the development server on port 8010
node server.js         # Alternative way to start the server
```

### Testing
Currently no automated tests are configured. The project uses manual testing through the web interface.

## Architecture Overview

### Core Framework Classes

**CarpenterServer** (`src/lib/CarpenterServer.js`)
- Main orchestrator that manages models, routes, components, and public paths
- Handles database initialization and seeding
- Manages Express.js server setup with automatic API routing
- Supports "stacks" - modular collections of models, routes, and components

**CarpenterModel** (`src/lib/CarpenterModel.js`)
- Base class for all data models extending Sequelize functionality
- Provides automatic CRUD API routes (GET, POST, PUT, DELETE)
- Handles JSON field compatibility across databases (SQLite fallback)
- Supports automatic UUID primary key generation
- Built-in permission system with admin/user/public access levels

**CarpenterJob** (`src/lib/CarpenterJob.js`)
- Base class for scheduled and ad-hoc job execution
- Supports template-based job configuration with validation schemas
- Provides job lifecycle management (start, pause, cancel, resume)
- Integrates with JobTemplate, JobSchedule, JobExecution models for persistence

### Database Models

The system stack includes several model categories:

**User Management System:**
- User, Person, SecurityGroup models with membership relationships
- Session management through UserSession model
- Organization and Location models for structural hierarchy

**Job Management System:**
- JobTemplate: Defines reusable job configurations and schemas
- JobSchedule: Manages recurring or one-time job schedules
- JobExecution: Tracks individual job runs with status/progress
- JobExecutionLog: Stores detailed execution logs and output

**System Management:**
- CarpenterWorker: Tracks server instances running jobs
- MenuItem: Dynamic navigation menu configuration

### Frontend Architecture

**Component Structure:**
- Uses Preact (React-compatible) served from `/vendor/preact/`
- Components organized in `src/systemStack/components/`
- JSX components are served dynamically with Babel compilation
- Bootstrap Icons for UI elements

**Key Frontend Components:**
- `App.jsx`: Main application shell with routing
- `LazyApp.jsx`: Lazy-loaded application entry point
- `jobManagement/`: Complete job management interface with templates, schedules, and execution monitoring

**State Management:**
- `userStore.js`: Handles API calls and user session management
- `AppContext.js`: Provides application-wide context

### API Routing System

The framework uses a custom routing system that automatically generates RESTful APIs:

**Standard Model Routes:** (automatically created for each model)
- `GET /api/data/{model}/` - Browse with filtering/pagination
- `GET /api/data/{model}/{id}` - Read single record
- `POST /api/data/{model}/` - Create new record
- `PUT /api/data/{model}/{id}` - Update existing record
- `DELETE /api/data/{model}/{id}` - Delete record
- `GET /api/data/{model}/{id}/{relationship}` - Browse related records

**Custom Routes:** Can be added via CarpenterRoute objects with path pattern matching.

### Development Patterns

**Model Development:**
- Extend CarpenterModel class
- Define `sequelizeDefinition` with field schemas
- Set up relationships via `sequelizeConnections` array
- Configure seed data through `seedDataCore` and `seedDataDemo` arrays

**Job Development:**
- Extend CarpenterJob class
- Define `defaultConfiguration` schema for job parameters
- Implement `runJob()` method for execution logic
- Set template metadata and security permissions

**Component Development:**
- Use Preact syntax with hooks
- Import from `/vendor/preact/` paths
- Utilize `apiCall()` from userStore.js for backend communication
- Follow Bootstrap/Tailwind styling patterns

### Configuration

**Database Configuration:**
- Uses SQLite by default (`database.sqlite`)
- Supports PostgreSQL and other Sequelize dialects
- JSON fields automatically converted for SQLite compatibility
- Automatic table naming with pluralization and snake_case

**Server Configuration:**
- Configuration stored in `config.json`
- Options managed through CarpenterServer constructor
- Debug levels for development logging
- Single-user vs multi-user mode support

### File Organization

```
src/
├── lib/                    # Core framework classes
├── systemStack/           # System components and models
│   ├── components/        # Preact components
│   ├── models/           # Database models organized by domain
│   ├── routes/           # Custom API routes
│   └── public/           # Static assets and vendor libraries
└── index.js              # Main exports
```

### Current Development Status

Based on recent commits and the framework todo, the project is actively developing:
- Job management system recently integrated
- Job scheduling and execution UI in progress
- User interface components for job templates and schedules
- Focus on completing the job management workflow

The system is designed for extensibility - new "stacks" can be added that bring their own models, routes, and components while leveraging the core Carpenter framework infrastructure.