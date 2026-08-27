# CampusSpaces - University Study Space Finder & Seating Reservation System

> A modern, full-stack campus web application for discovering university study spaces, reserving seats with an interactive **BookMyShow-style** visual seating arrangement, forecasting crowd levels using statistical predictions, and consulting a grounded AI study assistant.

Built with a modern, sleek aesthetic inspired by **Google Stitch** design tokens (Google Sans / Inter typography, clean glassmorphic cards, emerald/indigo/amber badge status system, and fluid micro-interactions).

---

## 🌟 Key Features

### 🎓 Student Experience
- **Campus Discovery & Smart Filters**: Search across libraries, research hubs, and 24/7 lounges with filters for Noise Level (*Silent*, *Quiet*, *Moderate*), Wi-Fi availability, Building, Capacity, and "Available Now".
- **BookMyShow-Style Interactive Seating**:
  - Visual seat map with rows and columns (e.g., A1-A8, B1-B8).
  - Clear color-coded states:
    - 🟢 **Available** (emerald green, selectable)
    - 🟣 **Selected** (glowing indigo/purple with ring highlight)
    - 🔴 **Occupied / In-Use** (rose red, disabled)
    - 🟡 **Reserved** (amber, disabled)
    - ⚫ **Under Maintenance** (dark slate, disabled)
  - Workstation badges (⚡ Power outlets, 🪟 Window daylight).
- **Conflict-Safe Reservations**: Real-time server-side conflict detection preventing duplicate seat bookings across overlapping windows.
- **Statistical Availability Prediction**: Transparent historical forecasting algorithm analyzing 30-day occupancy by day of week & hour of day with confidence ratings (`high`, `medium`, `low`).
- **Grounded AI Study Space Advisor**: Conversational natural language assistant that parses noise, duration, and equipment requirements, queries MongoDB for verified campus rooms, and returns grounded recommendations with direct 1-click booking actions.
- **Personal Dashboard & Analytics**: Study sessions countdown, weekly focus hours, favorite spots, and booking history.
- **Student Favorites**: 1-click saved study spaces for fast bookings.

### 🛡️ Campus Administrator Console
- **Operations Dashboard**: Campus-wide metrics (Total Spaces, Total Seats, Live Occupancy %, Active Passes, Suspended Students, Hourly Peak Traffic charts).
- **Space Management**: Create, edit, and deactivate study spaces with custom amenities, noise ratings, operating hours, and photo banners.
- **Visual Seating Grid Configurator**: Grid editor to customize rows & columns, toggle maintenance blocks, and label individual workstations.
- **Student Account Directory & Governance**: Searchable student list with registration date, booking counts, and 1-click **Block / Unblock** authorization controls.
- **Campus Booking Log**: Real-time campus-wide reservation feed with filter by room and administrative cancellation override.

---

## 🛠️ Technology Stack

| Layer | Technology | Description |
| :--- | :--- | :--- |
| **Frontend** | **React 18 (JS)** | Fast component architecture without TypeScript overhead |
| **Tooling** | **Vite** | Lightning-fast development server and optimized bundler |
| **Routing** | **React Router DOM v6** | Client-side routing with role-based auth guards |
| **Icons** | **Lucide React** | Sleek modern iconography |
| **Styling** | **Modern Responsive CSS** | Google Stitch aesthetic with CSS variables & glassmorphism |
| **Backend** | **Node.js + Express.js** | Clean RESTful API architecture |
| **Database** | **MongoDB + Mongoose** | Document persistence with indexes and aggregation pipelines |
| **Auth** | **JWT + bcryptjs** | Role-based authorization (`student`, `admin`) with account block checks |
| **AI Integration** | **Google Gemini / Pluggable** | Grounded recommendations with rule-based fallback |

---

## 📁 Folder Structure

```
study-space-finder/
├── .env.example                # Root environment template
├── package.json                # Project-wide script orchestrator
├── vercel.json                 # Vercel deployment configuration
├── README.md                   # Complete documentation
│
├── server/                     # Express REST API Backend
│   ├── .env                    # Local environment variables
│   ├── .env.example            # Backend env template
│   ├── package.json
│   ├── server.js               # Express app entrypoint
│   ├── config/
│   │   └── db.js               # MongoDB connection handler
│   ├── models/
│   │   ├── User.js             # Student and Admin schema
│   │   ├── StudySpace.js       # Campus room & capacity schema
│   │   ├── Seat.js             # Seating coordinates & status schema
│   │   ├── Reservation.js      # Booking passes schema
│   │   ├── Favorite.js         # Student bookmarks schema
│   │   └── OccupancyHistory.js # Historical occupancy data points
│   ├── middleware/
│   │   ├── authMiddleware.js   # JWT authentication & blocked user guard
│   │   ├── adminMiddleware.js  # Role-based admin guard
│   │   └── errorMiddleware.js  # Global error & 404 handlers
│   ├── services/
│   │   ├── predictionService.js# Statistical forecasting algorithm
│   │   ├── reservationService.js# Dynamic seat status & conflict checking
│   │   ├── aiService.js        # Grounded AI advisor
│   │   └── analyticsService.js # Student & admin aggregations
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── spaceController.js
│   │   ├── seatController.js
│   │   ├── reservationController.js
│   │   ├── favoriteController.js
│   │   ├── analyticsController.js
│   │   ├── predictionController.js
│   │   ├── aiController.js
│   │   └── adminController.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── spaceRoutes.js
│   │   ├── seatRoutes.js
│   │   ├── reservationRoutes.js
│   │   ├── favoriteRoutes.js
│   │   ├── analyticsRoutes.js
│   │   ├── predictionRoutes.js
│   │   ├── aiRoutes.js
│   │   └── adminRoutes.js
│   └── seeds/
│       └── seed.js             # Comprehensive development seed script
│
└── client/                     # React + Vite Frontend
    ├── package.json
    ├── vite.config.js          # Vite config with /api proxy
    ├── index.html              # Google Sans / Plus Jakarta typography
    └── src/
        ├── main.jsx            # React root
        ├── App.jsx             # Router and layout configuration
        ├── index.css           # Stitch design system CSS
        ├── App.css             # Animations and modal styles
        ├── context/
        │   └── AuthContext.jsx # Auth state provider
        ├── services/
        │   └── api.js          # Centralized API service layer
        ├── components/
        │   ├── Navbar.jsx      # Responsive header with live badge
        │   ├── Footer.jsx      # Campus footer
        │   ├── Sidebar.jsx     # Admin navigation sidebar
        │   ├── StudySpaceCard.jsx # Live occupancy cards
        │   ├── FilterBar.jsx   # Search, noise pills, and wifi filter
        │   ├── SeatMap.jsx     # BookMyShow-style interactive seating
        │   ├── ReservationModal.jsx # Booking confirmation drawer
        │   ├── AIChatDrawer.jsx# Floating Grounded AI Assistant
        │   ├── StatCard.jsx    # Metric cards
        │   └── ProtectedRoute.jsx
        └── pages/
            ├── HomePage.jsx
            ├── SpacesPage.jsx
            ├── SpaceDetailPage.jsx
            ├── DashboardPage.jsx
            ├── ReservationsPage.jsx
            ├── FavoritesPage.jsx
            ├── AnalyticsPage.jsx
            ├── LoginPage.jsx
            ├── RegisterPage.jsx
            ├── NotFoundPage.jsx
            └── admin/
                ├── AdminDashboardPage.jsx
                ├── AdminSpacesPage.jsx
                ├── AdminSeatingPage.jsx
                ├── AdminStudentsPage.jsx
                └── AdminReservationsPage.jsx
```

---

## ⚙️ Prerequisites

1. **Node.js**: v18.0.0 or higher (v20+ recommended)
2. **MongoDB**: Local MongoDB community server running on `mongodb://127.0.0.1:27017` or a free MongoDB Atlas connection string.

---

## 🔑 Environment Variables

### Backend (`server/.env`)
```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/study_space_finder
JWT_SECRET=super_secret_jwt_university_study_space_key_2026
CLIENT_URL=http://localhost:5173
AI_API_KEY=
```

### Frontend (`client/.env`)
```env
VITE_API_URL=http://localhost:5000/api
```

---

## 🚀 Quick Start Guide

### 1. Clone or Open Project Workspace
Open the workspace directory:
```bash
cd study-space-finder
```

### 2. Install Dependencies
Install dependencies for both backend and frontend:
```bash
# Install backend dependencies
cd server && npm install

# Install frontend dependencies
cd ../client && npm install
```

### 3. Seed the Database
Populate demo students, admin, study spaces, interactive seats, and 30-day historical occupancy data:
```bash
cd server
npm run seed
```

### 4. Run the Application
In **Terminal 1** (Start Backend Express Server):
```bash
cd server
npm run dev
# Server will start on http://localhost:5000
```

In **Terminal 2** (Start Frontend Vite Dev Server):
```bash
cd client
npm run dev
# Frontend will start on http://localhost:5173
```

Visit **`http://localhost:5173`** in your browser!

---

## 👥 Demo Test Credentials

The seed script creates the following demo credentials with 1-click auto-fill buttons available on the Login page:

| Role | Email | Password | Description |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@campus.edu` | `AdminPass123!` | Full access to Admin Console, Space editor, Seating builder, and Student directory |
| **Student** | `student@campus.edu` | `StudentPass123!` | Alex Rivera (CS Major) with active and past reservations |
| **Student 2** | `sarah@campus.edu` | `StudentPass123!` | Sarah Chen (Biomedical Engineering) |
| **Blocked Student** | `marcus@campus.edu` | `StudentPass123!` | Marcus Vance (Suspended account - demonstrates 403 authorization guard) |

---

## 📊 Statistical Availability Prediction Algorithm

The prediction engine is implemented in `server/services/predictionService.js`:

1. **Input**: `spaceId`, target `dayOfWeek` (0-6), and target `hourOfDay` (0-23).
2. **Historical Sampling**:
   - Queries `OccupancyHistory` records matching the space, day of week, and target hour (with $\pm 1$ hour smoothing).
   - Aggregates historical completed reservations from `Reservation` records.
3. **Weighting & Confidence**:
   - Direct hour match receives a weight of `1.0`; adjacent hours receive `0.6`.
   - Sample size determines confidence level:
     - $\ge 12$ samples $\rightarrow$ **High Confidence**
     - $4 - 11$ samples $\rightarrow$ **Medium Confidence**
     - $1 - 3$ samples $\rightarrow$ **Low Confidence**
     - $0$ samples $\rightarrow$ **Insufficient Data** (graceful fallback)
4. **Calculated Output**:
   $$\text{Predicted Occupancy } (\%) = \text{clamp}(5\%, 98\%, \text{Weighted Historical Average})$$
   $$\text{Predicted Available Seats} = \max(0, \text{Total Usable Seats} - \text{Predicted Occupied Seats})$$

---

## 🤖 Grounded AI Study Assistant

Located in `server/services/aiService.js`:
- Grounded strictly in real-time MongoDB spaces and live seat availability.
- Parses natural language intent for noise preferences, duration, building keywords, and amenities (e.g. *"quiet space with power outlets and standing desks"*).
- Connects to Google Gemini API when `AI_API_KEY` is provided, and includes an intelligent rule-based campus recommendation engine if no key is configured.

---

## 🌐 Vercel Deployment

1. Set `VITE_API_URL` to your production backend URL (e.g., `https://your-api.vercel.app/api`).
2. Set `MONGODB_URI` in Vercel Environment Variables to your **MongoDB Atlas** connection string.
3. Deploy frontend and backend using `vercel` CLI or Git integration.
