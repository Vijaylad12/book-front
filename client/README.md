# Book Library - Frontend Client

A modern, responsive React-based library management interface built with Vite and vanilla CSS.

## 🎨 Features
- **Dynamic Book Discovery**: Filter by genre, search, and sort.
- **Premium PDF Viewer**: Secure, browser-based manuscript and book reader.
- **User Dashboard**: Track rentals, wishlists, and ratings.
- **Author Tools**: Submit books and view application status.
- **Admin Suite**: Manage authors, books, and view analytics.
- **Design**: Dark theme with glassmorphism and smooth animations.

## 🛠️ Tech Stack
- **Framework**: React 18
- **Build Tool**: Vite
- **Navigation**: React Router 6
- **Icons**: Lucide React
- **Styling**: Vanilla CSS (Global Design System)
- **PDF Rendering**: PDF.js (`pdfjs-dist`)

## 📂 Project Structure
```bash
client/
├── src/
│   ├── components/  # Reusable UI (Navbar, Toast, Modals)
│   ├── context/     # Auth and Theme providers
│   ├── pages/       # Page components (Admin, Books, Auth)
│   ├── services/    # Axios API instance
│   ├── styles/      # Global CSS and tokens
│   └── App.jsx      # Main routing
└── public/          # Static assets
```

## ⚙️ Getting Started

### 1. Installation
```bash
cd client
npm install
```

### 2. Running Locally
```bash
# Start development server
npm run dev
```
The application will be available at `http://localhost:3000`.

### 3. Backend Connection
The frontend is configured to proxy `/api` requests to `http://localhost:5000`. Ensure the backend server is running.

## 💅 Design System
Styles are defined in `src/styles/global.css` using CSS variables for:
- Colors (Primary, Secondary, Accent, Glass)
- Spacing & Radius
- Shadows & Glows
- Animations
