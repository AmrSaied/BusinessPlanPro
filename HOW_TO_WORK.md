# FastDummyTicket - How to Work with This Project

This document provides comprehensive instructions for working with the FastDummyTicket application, which can run both as a web application and as a desktop application using Electron.

## Table of Contents
1. [Project Overview](#project-overview)
2. [Tech Stack](#tech-stack)
3. [Environment Setup](#environment-setup)
4. [Running the Application](#running-the-application)
   - [Web Mode](#web-mode)
   - [Desktop Mode](#desktop-mode)
5. [Building for Production](#building-for-production)
6. [Project Structure](#project-structure)
7. [Development Guidelines](#development-guidelines)
8. [API Integration](#api-integration)
9. [Troubleshooting](#troubleshooting)

## Project Overview

FastDummyTicket is a multilingual flight dummy ticket generation platform designed to simplify visa application processes. The application provides a user-friendly interface for creating verifiable flight reservations that can be used for visa applications, immigration requirements, and passport renewals.

Key features include:
- Flight search with real airline and airport data
- Customizable ticket options
- Passenger information management
- Multiple payment methods
- Localization with multiple language support
- Desktop application support via Electron

## Tech Stack

The application is built using the following technologies:

**Frontend:**
- React (UI library)
- TypeScript (type-safe JavaScript)
- TailwindCSS (styling)
- shadcn/ui (UI components)
- React Query (data fetching & caching)
- i18next (internationalization)
- wouter (routing)

**Backend:**
- Express.js (Node.js framework)
- PostgreSQL (database)
- Drizzle ORM (database management)
- Passport.js (authentication)

**Desktop:**
- Electron (cross-platform desktop applications)
- electron-builder (packaging)

## Environment Setup

1. **Prerequisites:**
   - Node.js (v16 or higher)
   - npm or yarn
   - PostgreSQL database (optional for development)

2. **Clone the repository:**
   ```
   git clone <repository-url>
   cd fastdummyticket
   ```

3. **Install dependencies:**
   ```
   npm install
   ```

4. **Environment variables:**
   Create a `.env` file in the root directory with the following variables:
   ```
   DATABASE_URL=postgres://<username>:<password>@<host>:<port>/<dbname>
   AMADEUS_CLIENT_ID=your_amadeus_api_key
   AMADEUS_CLIENT_SECRET=your_amadeus_api_secret
   AVIATIONSTACK_API_KEY=your_aviationstack_api_key
   ```

## Running the Application

### Web Mode

To run the application in web mode:

1. **Start the development server:**
   ```
   npm run dev
   ```

2. **Access the application:**
   Open a browser and navigate to `http://localhost:3000`

### Desktop Mode

To run the application in desktop mode:

1. **Start the application in development mode:**
   ```
   node electron-dev.js
   ```
   This will start both the Express server and the Electron application.

2. **Development workflows:**
   - Make changes to React components and they will hot-reload in the Electron window
   - Changes to the main Electron process (`electron.js`) require a restart

## Building for Production

### Web Application

1. **Build the web application:**
   ```
   npm run build
   ```

2. **Start the production server:**
   ```
   npm run start
   ```

### Desktop Application

1. **Build the desktop application:**
   ```
   node electron-build.js
   ```

2. **Find the packaged application:**
   The compiled application will be available in the `electron-dist` directory, with packages for Windows (.exe), macOS (.dmg), and Linux (.AppImage) depending on your build platform.

## Project Structure

```
├── client/                  # Frontend code
│   ├── src/                 # Source files
│   │   ├── components/      # UI components
│   │   │   ├── desktop/     # Electron-specific components
│   │   │   ├── sections/    # Page sections
│   │   │   └── ui/          # Reusable UI components
│   │   ├── context/         # React context providers
│   │   ├── hooks/           # Custom React hooks
│   │   ├── i18n/            # Internationalization
│   │   ├── layout/          # Layout components
│   │   ├── lib/             # Utility functions
│   │   └── pages/           # Page components
│   └── index.html           # HTML entry point
├── server/                  # Backend code
│   ├── services/            # Service integrations
│   ├── routes.ts            # API endpoints
│   ├── storage.ts           # Data access layer
│   └── index.ts             # Server entry point
├── shared/                  # Shared code
│   └── schema.ts            # Database schema
├── electron.js              # Electron main process
├── preload.js               # Electron preload script
├── electron-dev.js          # Development helper
├── electron-build.js        # Build helper
└── electron-builder.json    # Electron build config
```

## Development Guidelines

### Adding a New Feature

1. Define the feature requirements
2. Create necessary components in `client/src/components`
3. Add any required API endpoints in `server/routes.ts`
4. Update database schema if needed in `shared/schema.ts`
5. Add translations in `client/src/i18n/translations/`
6. Test in both web and desktop environments

### Working with Electron

When developing for Electron:

1. Use the `isElectron()` utility to detect if running in Electron:
   ```typescript
   import { isElectron } from '@/lib/environment';
   
   if (isElectron()) {
     // Electron-specific code
   }
   ```

2. For IPC communication with the main process:
   ```typescript
   // Send message to main process
   if (isElectron() && (window as any).electron) {
     (window as any).electron.send('toMain', { action: 'some-action', data: someData });
   }
   
   // Receive message from main process
   (window as any).electron.receive('fromMain', (data) => {
     console.log('Received from main:', data);
   });
   ```

## API Integration

### Amadeus API

The application uses Amadeus API for retrieving flight data. To work with the API:

1. Get credentials from [Amadeus for Developers](https://developers.amadeus.com/)
2. Set `AMADEUS_CLIENT_ID` and `AMADEUS_CLIENT_SECRET` in your environment
3. Use the AmadeusService in `server/services/amadeus-service.ts`

### AviationStack API

For airport and flight data, the application also uses AviationStack:

1. Get an API key from [AviationStack](https://aviationstack.com/)
2. Set `AVIATIONSTACK_API_KEY` in your environment
3. Use the AviationStackService in `server/services/aviation-stack-service.ts`

## Troubleshooting

### Common Issues

**Database Connection Errors:**
- Ensure PostgreSQL is running
- Verify that `DATABASE_URL` environment variable is correctly set
- Check if the database exists and has the correct permissions

**Electron Development Issues:**
- If the application doesn't load in Electron, check the console output for errors
- Ensure the server is running on the expected port
- On Windows, you may need to use `cross-env` for environment variables

**API Integration Problems:**
- Verify that API keys are correctly set in the environment
- Check the network tab in the browser devtools for API call errors
- Review the server logs for detailed error information

### Getting Help

If you encounter issues not addressed in this guide:
- Check the project issue tracker
- Consult the official documentation for the relevant libraries
- Reach out to the project maintainers