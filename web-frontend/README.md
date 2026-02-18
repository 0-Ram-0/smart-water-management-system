# Web Frontend - Control Room Dashboard

React.js web application for the Smart Water Management System control room.

## Structure

```
web-frontend/
├── src/
│   ├── components/     # Reusable components
│   │   └── Layout/     # Header, Sidebar, etc.
│   ├── config/         # API and Socket configuration
│   ├── store/          # Zustand state management
│   ├── utils/          # Utility functions and constants
│   ├── pages/          # Page components (to be added)
│   ├── App.jsx         # Main app component
│   └── main.jsx        # Entry point
├── public/             # Static assets
└── package.json
```

## Features

- Control Room Dashboard (Admin)
- GIS-based map visualization
- Real-time sensor monitoring
- DMA management
- Alert management
- Task assignment
- Complaint management
- Reports and analytics

## Running the Application

```bash
npm install
npm run dev    # Development server (http://localhost:3000)
npm run build  # Production build
npm run preview # Preview production build
```

## Environment Variables

See `.env.example` for required environment variables.

## Design System

- **Color Palette**: Blue (#0066cc) and Green (#00a86b) theme
- **Style**: Professional, SCADA-inspired, government-grade UI
- **Framework**: React 18 with Vite
