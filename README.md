# Prediction Market Platform (APPRI)

A full-stack prediction market application where users can trade on future events using virtual currency. Built with React, Node.js, and PostgreSQL.

## Features

-   **User Authentication**: Secure registration and login with JWT.
-   **Market Trading**: Buy and sell shares in binary and multiple-choice markets.
-   **Portfolio Management**: Track positions, transaction history, and total equity.
-   **Leaderboard**: Global ranking of users based on performance.
-   **Admin Dashboard**: Comprehensive management interface for creating markets, resolving outcomes, managing users, and viewing system reports.
-   **Beta Feedback System**: In-app widget for users to submit bug reports and feature requests, complete with screenshot capture.
-   **Localization**: Full support for English and Traditional Chinese (zh-TW).
-   **Deployment**: Google Cloud Platform (App Engine + Cloud SQL).

## Project Structure

```text
C:\Apps\ZotePM\
├── client/                 # React Frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components (Navbar, FeedbackWidget, etc.)
│   │   ├── pages/          # Application pages (Home, Dashboard, Admin, etc.)
│   │   ├── context/        # React Context (AuthContext)
│   │   ├── locales/        # i18n translation files (en.json, zh-TW.json)
│   │   └── utils/          # Helper functions
│   ├── public/             # Static assets
│   └── vite.config.js      # Vite configuration
├── server/                 # Node.js/Express Backend
│   ├── controllers/        # Business logic for API endpoints
│   ├── routes/             # API route definitions
│   ├── middleware/         # Authentication and utility middleware
│   ├── public/             # Served static files (Client build output)
│   ├── schema.sql          # Database schema definition
│   ├── app.yaml            # Google App Engine configuration (Production)
│   ├── app-staging.yaml    # Google App Engine configuration (Staging)
│   └── index.js            # Server entry point
├── deploy_gcp.ps1          # Automated deployment script for Production
└── deploy_stage.ps1        # Automated deployment script for Staging
```

## Getting Started

### Prerequisites

-   **Node.js** (v18+)
-   **PostgreSQL** (Local or Cloud)
-   **Google Cloud SDK** (for deployment)

### Local Development

1.  **Clone the repository.**

2.  **Install dependencies.**
    ```bash
    # Install server dependencies
    cd server
    npm install

    # Install client dependencies
    cd ../client
    npm install
    ```

3.  **Configure Environment Variables.**
    -   Create a `.env` file in the `server/` directory:
        ```env
        PORT=3001
        DATABASE_URL=postgresql://user:password@localhost:5432/appri
        JWT_SECRET=your_secret_key
        USE_MOCK_DB=false
        ```

4.  **Start Development Servers.**
    ```bash
    # Terminal 1: Start Backend
    cd server
    npm run dev

    # Terminal 2: Start Frontend
    cd client
    npm run dev
    ```

## Deployment Guide (Google Cloud Platform)

This project is configured for deployment on Google App Engine (Standard Environment) with a Cloud SQL (PostgreSQL) database.

### 1. Prerequisites
-   A Google Cloud Platform project.
-   **Cloud SQL Instance**: A PostgreSQL instance created in your project.
-   **App Engine Application**: Created in your project.
-   **Google Cloud SDK**: Installed and authenticated (`gcloud init`).

### 2. Configuration
Ensure `server/app.yaml` is configured with your production environment variables:

```yaml
runtime: nodejs20
env_variables:
  NODE_ENV: 'production'
  DATABASE_URL: 'postgresql://postgres:password@/appri?host=/cloudsql/PROJECT_ID:REGION:INSTANCE_NAME'
  JWT_SECRET: 'your-production-secret'
```

### 3. Automated Deployment (Recommended)
Use the provided PowerShell script `deploy_gcp.ps1` to automate the build and deployment process.

**What the script does:**
1.  Checks if the Cloud SQL instance is ready.
2.  (Optional) Sets the database password and creates the database if missing.
3.  Builds the React client (`npm run build` in `client/`).
4.  Deploys the `server/` directory (which now contains the client build) to App Engine.

**To run:**
```powershell
./deploy_gcp.ps1
```

### 4. Manual Deployment
If you prefer to deploy manually or are not on Windows:

1.  **Build the Client:**
    ```bash
    cd client
    npm run build
    ```
    *This compiles the React app and outputs it to `server/public/`.*

2.  **Deploy to App Engine:**
    ```bash
    cd ../server
    gcloud app deploy app.yaml
    ```

3.  **Stream Logs (Optional):**
    ```bash
    gcloud app logs tail -s default
    ```

### 5. Database Migrations
The application is configured to run migrations automatically on startup.
-   `server/index.js` imports `run_migrations.js`.
-   `run_migrations.js` executes `schema.sql` and other migration scripts to ensure the database schema is up-to-date.
