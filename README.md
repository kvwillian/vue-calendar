# Calendar App

A modern, feature-rich calendar application built with Vue 3 and TypeScript. This app allows you to create and manage reminders with weather integration and location-based features.

## 🚀 Technologies Used

### Frontend Framework
- **Vue 3** - Progressive JavaScript framework with Composition API
- **TypeScript** - Type-safe JavaScript development
- **Vite** - Fast build tool and development server

### State Management & Routing
- **Pinia** - Vue state management library
- **Vue Router** - Official router for Vue.js applications

### Styling & UI
- **Tailwind CSS** - Utility-first CSS framework
- **Custom Components** - Built with Vue 3 Composition API

### Date & Time
- **date-fns** - Modern JavaScript date utility library

### External APIs
- **OpenWeatherMap API** - Weather data integration
- **Geocoding API** - Location-based features

### Development Tools
- **Vitest** - Unit testing framework
- **Vue Test Utils** - Testing utilities for Vue components

## 📦 Installation

### Prerequisites
- Node.js (version 16 or higher)
- npm or yarn package manager

### Setup Steps

1. **Clone the repository**
   ```bash
   git clone https://github.com/kvwillian/vue-calendar
   cd calendar-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Environment Configuration**
   Create a `.env` file in the root directory and add your OpenWeatherMap API key:
   ```env
   VITE_OWM_API_KEY=your_openweathermap_api_key_here
   ```
   
   > **Note**: Get your free API key from [OpenWeatherMap](https://openweathermap.org/api)

4. **Start development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

> **Live Demo**: The app runs on `http://localhost:5173/` after starting the development server.


5. **Run tests**
   ```bash
   npm test
   # or
   yarn test
   ```

## 🛠️ Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm test` - Run unit tests

## 📁 Folder Structure

```
calendar-app/
├── public/                 # Static assets
├── src/
│   ├── assets/            # Images, fonts, and other static assets
│   ├── components/        # Reusable Vue components
│   │   ├── calendar/      # Calendar-specific components
│   │   │   ├── Calendar.vue
│   │   │   ├── CalendarGrid.vue
│   │   │   ├── CalendarHeader.vue
│   │   │   ├── DayCell.vue
│   │   │   ├── ReminderModal.vue
│   │   │   └── WeekView.vue
│   │   ├── CitySelect.vue
│   │   ├── ConfirmationModal.vue
│   │   ├── SidebarNav.vue
│   │   ├── StatCard.vue
│   │   └── TopBar.vue
│   ├── composables/       # Vue 3 composables
│   │   ├── useCalendar.ts
│   │   ├── useGeocoding.ts
│   │   └── useWeather.ts
│   ├── layouts/           # Layout components
│   │   └── DashboardLayout.vue
│   ├── router/            # Vue Router configuration
│   │   └── index.ts
│   ├── stores/            # Pinia stores
│   │   ├── calendar.ts
│   │   └── reminders.ts
│   ├── types/             # TypeScript type definitions
│   │   ├── Location.ts
│   │   └── Reminder.ts
│   ├── utils/             # Utility functions
│   ├── views/             # Page components
│   │   ├── CalendarPage.vue
│   │   └── DashboardHome.vue
│   ├── App.vue            # Root component
│   └── main.ts            # Application entry point
├── index.html             # HTML template
├── package.json           # Dependencies and scripts
├── tsconfig.json          # TypeScript configuration
├── tsconfig.app.json      # App-specific TypeScript config
├── tsconfig.node.json     # Node-specific TypeScript config
├── vite.config.ts         # Vite configuration
└── README.md              # This file
```

## ✨ Features

### 📅 Calendar Management
- **Monthly View** - Clean, intuitive monthly calendar display
- <img width="1853" height="943" alt="image" src="https://github.com/user-attachments/assets/9ee0525d-fcc2-4030-aef1-062c31e93c71" />
- **Week View** - Clean, intuitive week calendar display
- <img width="1602" height="891" alt="image" src="https://github.com/user-attachments/assets/9d35b90f-105b-4c94-904e-927c0b25a9d8" />
- **Navigation Controls** - Previous/Next month navigation and "Today" button
- **Responsive Design** - Works seamlessly on desktop and mobile devices
- <img width="395" height="864" alt="image" src="https://github.com/user-attachments/assets/86010a44-a128-401d-b477-6f3abe86d236" />


### 🔔 Reminder System
- **Create Reminders** - Add new reminders with date, time, and description
- **Edit Reminders** - Modify existing reminders with full CRUD operations
- **Delete Reminders** - Remove individual reminders or all reminders for a specific date
- **Color Coding** - Customize reminder colors for better organization
- **Time-based Sorting** - Reminders automatically sorted by time within each day

### 🌤️ Weather Integration
- **Location-based Weather** - Get weather forecasts for reminder locations
- **OpenWeatherMap Integration** - Real-time weather data with caching
- **Weather Icons** - Visual weather indicators in reminders
- **Geocoding Support** - Automatic location resolution for cities

### 💾 Data Persistence
- **Local Storage** - All reminders saved locally in browser
- **Automatic Sync** - Changes persist across browser sessions

### 🎨 User Interface
- **Modern Design** - Clean, professional interface with Tailwind CSS
- **Dark/Light Theme Ready** - Built with theming support
- **Responsive Layout** - Optimized for all screen sizes
- **Intuitive Navigation** - Sidebar navigation with active state indicators

### 🧪 Testing
- **Comprehensive Test Suite** - 90+ unit tests
- **Component Testing** - Vue Test Utils for component behavior

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
