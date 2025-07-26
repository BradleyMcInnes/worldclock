# World Clock Application

## Overview

This is a client-side World Clock application that displays real-time clocks for 6 major cities around the world. The application features both live time display and custom time conversion capabilities, allowing users to see what time it would be in different cities at any given moment.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

This is a pure frontend application built with vanilla HTML, CSS, and JavaScript. It runs entirely in the browser without requiring any backend services or external APIs.

### Frontend Architecture
- **HTML Structure**: Simple semantic HTML with a container-based layout
- **CSS Styling**: Modern CSS with gradient backgrounds, flexbox/grid layouts, and responsive design
- **JavaScript Logic**: Object-oriented approach using ES6 classes and the native Intl.DateTimeFormat API

## Key Components

### 1. HTML Structure (index.html)
- Main container with header and city grid layout
- Custom time converter controls with city selector and datetime input
- Individual time cards for each city (Melbourne, Wellington, London, Delhi, Singapore, Boston)

### 2. World Clock Class (script.js)
- **Cities Configuration**: Centralized mapping of cities to their respective timezones
- **Time Management**: Handles both live time updates and custom time calculations
- **Event Handling**: Manages user interactions for time conversion features
- **Display Updates**: Real-time DOM manipulation for time display

### 3. Styling System (styles.css)
- **Modern Design**: Gradient backgrounds and card-based layout
- **Responsive Layout**: Flexible grid system for different screen sizes
- **Visual Hierarchy**: Clear typography and spacing for readability

## Data Flow

1. **Initialization**: Application loads and sets up city configurations with timezone mappings
2. **Live Mode**: Timer updates all city times every second using browser's native date/time APIs
3. **Custom Mode**: User selects a city and time, triggering calculation of equivalent times in all other cities
4. **Display Update**: DOM elements are updated with formatted time strings

## External Dependencies

### Browser APIs
- **Intl.DateTimeFormat**: For timezone-aware time formatting and conversion
- **Date Object**: For time calculations and manipulation
- **DOM APIs**: For element selection and content updates

### No External Libraries
The application intentionally uses no external JavaScript libraries or frameworks, relying entirely on modern browser capabilities.

## Deployment Strategy

### Static Hosting
This application can be deployed to any static hosting service since it requires no server-side processing:
- GitHub Pages
- Netlify
- Vercel
- Traditional web servers

### File Structure
```
/
├── index.html (main page)
├── script.js (application logic)
└── styles.css (styling)
```

### Browser Compatibility
The application uses modern JavaScript features (ES6 classes, Intl API) and requires browsers that support:
- ES6 classes
- Intl.DateTimeFormat API
- Modern CSS features (flexbox, gradients)

This approach was chosen for simplicity, performance, and ease of deployment while providing a rich user experience without external dependencies.