# Issue Tracker 🎯

A modern full-stack issue tracking application built with cutting-edge technologies.

## 🏗️ Architecture

This project uses an **Nx monorepo** architecture with:

- **Frontend**: Angular 20.3 with TypeScript
- **Backend**: NestJS 11 with TypeScript
- **Database**: Prisma ORM with SQLite (development) / PostgreSQL (production)
- **Testing**: Jest (unit tests) + Cypress (E2E tests)
- **Build System**: Nx Dev Tools with Webpack

## 📁 Project Structure

```
issue-tracker/
├── apps/
│   ├── frontend/           # Angular application
│   ├── frontend-e2e/       # Frontend E2E tests
│   ├── backend/            # NestJS API server
│   └── backend-e2e/        # Backend E2E tests
├── libs/
│   └── shared-types/       # Shared DTOs, types, constants (used by frontend & backend)
├── tools/                  # Custom tools and scripts
└── docs/                   # Documentation
```

## 🚀 Features

### Current Features

- ✅ Nx monorepo setup with Angular frontend and NestJS backend
- ✅ Prisma ORM integration with database migrations
- ✅ Issue management data model (CRUD operations)
- ✅ TypeScript throughout the stack
- ✅ Modern development tooling (ESLint, Prettier, Jest)

### Planned Features

- 🔄 REST API endpoints for issue management
- 🔄 Angular UI for issue tracking
- 🔄 User authentication and authorization
- 🔄 Real-time updates with WebSockets
- 🔄 Advanced filtering and search
- 🔄 Email notifications
- 🔄 Dashboard with analytics

## 🛠️ Technology Stack

### Frontend

- **Angular 20.3** - Modern web framework
- **TypeScript** - Type-safe JavaScript
- **SCSS** - Enhanced CSS with variables and mixins
- **Cypress** - End-to-end testing

### Backend

- **NestJS 11** - Progressive Node.js framework
- **Prisma** - Next-generation ORM
- **SQLite** - Development database
- **Jest** - Testing framework
- **class-validator** - DTO validation with decorators

### Shared Libraries

- **@issue-tracker/shared-types** - Shared DTOs, types, and constants
  - All DTOs are defined as classes with validation decorators
  - Backend imports DTOs directly from shared-types (no local DTOs)
  - Constants for API routes, validation limits, error codes

### Development Tools

- **Nx** - Smart monorepo build system
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Webpack** - Module bundler

## 📊 Database Schema

```prisma
model Issue {
  id          String   @id @default(cuid())
  title       String
  description String?
  status      Status   @default(OPEN)
  priority    Priority @default(MEDIUM)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

enum Status {
  OPEN
  IN_PROGRESS
  CLOSED
}

enum Priority {
  LOW
  MEDIUM
  HIGH
  CRITICAL
}
```

## 🚦 Getting Started

### Prerequisites

- Node.js (LTS version)
- npm or yarn
- Git

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/Ademdkr/issue-tracker.git
   cd issue-tracker
   ```

2. **Install dependencies**

   ```bash
   npm install --legacy-peer-deps
   ```

3. **Setup the database**

   ```bash
   cd apps/backend
   npx prisma generate
   npx prisma migrate dev
   ```

4. **Start the development servers**

   ```bash
   # Backend (from root directory)
   npx nx serve backend

   # Frontend (in another terminal)
   npx nx serve frontend
   ```

### Development URLs

- **Frontend**: http://localhost:4200
- **Backend API**: http://localhost:3000/api
- **Prisma Studio**: `npx prisma studio` (from apps/backend)

## 📚 Available Scripts

### Development

```bash
# Start backend
npx nx serve backend

# Start frontend
npx nx serve frontend

# Build all projects
npx nx build backend
npx nx build frontend
```

### Testing

```bash
# Run unit tests
npx nx test backend
npx nx test frontend

# Run E2E tests
npx nx e2e backend-e2e
npx nx e2e frontend-e2e
```

### Database Operations

```bash
# Generate Prisma client
npx prisma generate

# Create and run migration
npx prisma migrate dev --name <migration-name>

# Open Prisma Studio
npx prisma studio

# Reset database (development only!)
npx prisma migrate reset
```

### Code Quality

```bash
# Lint all projects
npx nx lint backend
npx nx lint frontend

# Format code
npx nx format

# Show project graph
npx nx graph
```

## 📖 Documentation

- [Setup Guide](./SETUP_ANLEITUNG.md) - Detailed setup instructions (German)
- [Prisma Setup](./apps/backend/PRISMA_SETUP.md) - Database setup guide

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🔗 Links

- **Repository**: [GitHub](https://github.com/Ademdkr/issue-tracker)
- **Issues**: [GitHub Issues](https://github.com/Ademdkr/issue-tracker/issues)
- **Documentation**: [Nx Docs](https://nx.dev/), [NestJS Docs](https://nestjs.com/), [Angular Docs](https://angular.io/)

---

**Built with ❤️ using Nx, Angular, NestJS, and Prisma**
