# ClosetIQ — Digital Wardrobe & Outfit Architecture Platform

**ClosetIQ** is a full-stack, responsive digital wardrobe and outfit-planning web application designed with a minimalist editorial fashion-magazine aesthetic merged with a modern SaaS dashboard. It enables users to digitize clothes they own, architect cohesive outfits on an interactive visual canvas, schedule looks on a monthly style calendar, maintain a shopping wishlist with one-click wardrobe conversion, and share curated looks with a social community lookbook.

---

## ✦ Aesthetic & Design System

- **Palette:** Warm Ivory (`#fcfbf9`), Alabaster (`#f4f2ee`), Charcoal Black (`#18181b`), Muted Lavender (`#8a7ea4` / `#f1edf7`), and Warm Gold (`#c5a059`).
- **Typography:** Editorial serif headings (*Cormorant Garamond*) paired with clean, modern sans-serif body (*Plus Jakarta Sans*).
- **Layout:** Spacious grids, rounded cards, subtle ambient drop shadows, hover transitions, collapsible desktop sidebar, and fluid mobile drawer navigation.

---

## 🛠 Tech Stack

- **Frontend:** React 18, Vite, React Router v6, Lucide React icons, Axios
- **Styling:** Pure CSS3 with custom variables, layout modules, and responsive breakpoints
- **Backend:** Node.js, Express.js (RESTful architecture)
- **Database:** MongoDB with Mongoose ODM
- **Database Management Tool:** MongoDB Compass (`mongodb://127.0.0.1:27017/closetiq`)
- **Authentication:** JWT (JSON Web Tokens) with Bcrypt password hashing
- **Image Uploads:** Multer with local disk storage in `server/uploads/` and Express static route serving (also supports external image URLs)

---

## 📁 Project Folder Structure

```
25070521293_CA3/
├── client/                     # Frontend React + Vite application
│   ├── index.html              # HTML entry point with Google Fonts
│   ├── vite.config.js          # Vite configuration with /api & /uploads proxy
│   ├── package.json            # Client dependencies
│   ├── .env.example            # Client environment variable template
│   ├── .env                    # Active client environment variables
│   └── src/
│       ├── main.jsx            # React root with BrowserRouter, AuthProvider, ToastProvider
│       ├── App.jsx             # React Router application routes
│       ├── index.css           # Global resets and CSS imports
│       ├── styles/
│       │   ├── variables.css   # Color palette, radii, shadows, typography tokens
│       │   ├── layout.css      # App shell, collapsible sidebar, navbar, responsive drawer
│       │   ├── components.css  # Buttons, inputs, modals, cards, badges, toasts, spinners
│       │   └── pages.css       # Landing, dashboard, wardrobe, builder, calendar, community styles
│       ├── context/
│       │   ├── AuthContext.jsx # User authentication state and session methods
│       │   └── ToastContext.jsx# Toast notification system
│       ├── services/
│       │   ├── api.js          # Centralized Axios instance with JWT interceptor
│       │   ├── authService.js  # Auth and user API requests
│       │   ├── clothingService.js # Clothing CRUD & favorite toggles
│       │   ├── outfitService.js# Outfit CRUD & lookbook requests
│       │   ├── calendarService.js # Calendar planning requests
│       │   ├── wishlistService.js # Wishlist CRUD & wardrobe conversion
│       │   └── communityService.js# Social lookbook feed & likes
│       ├── components/
│       │   ├── Navbar.jsx      # Top sticky navigation bar
│       │   ├── Sidebar.jsx     # Collapsible desktop sidebar & mobile drawer
│       │   ├── ClothingCard.jsx# Luxury card for wardrobe clothing pieces
│       │   ├── OutfitCard.jsx  # Mosaic card for outfits with quick actions
│       │   ├── Modal.jsx       # Animated accessible modal popup
│       │   ├── ConfirmDialog.jsx # Confirmation dialog for deletions
│       │   ├── EmptyState.jsx  # Friendly editorial empty states
│       │   └── LoadingSpinner.jsx # Luxury spinner component
│       ├── layouts/
│       │   └── MainLayout.jsx  # Authenticated shell layout
│       └── pages/
│           ├── LandingPage.jsx # Hero showcase, editorial tags, features, sample cards
│           ├── LoginPage.jsx   # Split-screen sign-in with 1-click demo logins
│           ├── RegisterPage.jsx# New stylist account registration
│           ├── DashboardPage.jsx# Metrics, quick actions, recent items & looks
│           ├── WardrobePage.jsx# Categorized wardrobe image grid, filters, add/edit/delete
│           ├── OutfitBuilderPage.jsx # Interactive multi-select canvas outfit builder
│           ├── CalendarPage.jsx# Monthly calendar with duplicate outfit-date protection
│           ├── WishlistPage.jsx# Shopping wishlist + 1-click "Move to Wardrobe" conversion
│           ├── CommunityPage.jsx# Public lookbook social feed with likes and privacy isolation
│           └── ProfilePage.jsx # Stylist bio, profile avatar, and wardrobe analytics
│
├── server/                     # Backend Node.js + Express API
│   ├── package.json            # Server dependencies
│   ├── .env.example            # Server environment variable template
│   ├── .env                    # Active server environment variables
│   ├── server.js               # Express application entry point & route mounting
│   ├── config/
│   │   └── db.js               # Mongoose MongoDB connection
│   ├── middleware/
│   │   ├── auth.js             # JWT bearer verification & req.user attachment
│   │   ├── upload.js           # Multer diskStorage, 5MB limit, image mime validation
│   │   └── errorHandler.js     # Centralized error handler with accurate HTTP status codes
│   ├── models/
│   │   ├── User.js             # User schema with bcrypt password hashing
│   │   ├── ClothingItem.js     # Wardrobe pieces with category, season, occasion, brand
│   │   ├── Outfit.js           # Outfits referencing multiple ClothingItem ObjectIds
│   │   ├── OutfitPlan.js       # Calendar plans with compound uniqueness on (userId, outfitId, dateString)
│   │   ├── WishlistItem.js     # Shopping wishlist items with price & store URLs
│   │   └── CommunityPost.js    # Publicly shared outfits with caption & user likes array
│   ├── controllers/
│   │   ├── authController.js   # Register, login, getMe, updateProfile
│   │   ├── userController.js   # Dashboard counts & category/season aggregate analytics
│   │   ├── clothingController.js # Clothing filtering, search, sort, CRUD, favorite
│   │   ├── outfitController.js # Outfit CRUD, populated lookbooks, favorite
│   │   ├── calendarController.js # Calendar queries, schedule, conflict detection
│   │   ├── wishlistController.js # Wishlist CRUD & "Move to Wardrobe" conversion
│   │   └── communityController.js# Feed pagination, filters, likes toggle, delete
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── userRoutes.js
│   │   ├── clothingRoutes.js
│   │   ├── outfitRoutes.js
│   │   ├── calendarRoutes.js
│   │   ├── wishlistRoutes.js
│   │   └── communityRoutes.js
│   ├── seeds/
│   │   └── seedData.js         # Realistic demo seed script with high-res editorial pieces
│   └── uploads/                # Directory for local uploaded clothing images
│
├── package.json                # Root package runner scripts
└── README.md                   # Complete documentation
```

---

## ⚡ Quick Start & Run Commands

### 1. Prerequisites
- **Node.js**: v18+ or v20+ LTS
- **MongoDB**: Local MongoDB instance running on port 27017

### 2. Start Local MongoDB Daemon
If not already started, start your local MongoDB daemon:
```bash
mongod --dbpath ~/mongodb_data --bind_ip 127.0.0.1 --logpath ~/mongodb_data/mongod.log --fork
```

### 3. Install Dependencies & Seed Sample Data
In the project root:
```bash
# Install backend dependencies
cd server
npm install

# Run database seed script (populates 16 clothing pieces, 4 outfits, calendar plans, wishlist, and community posts)
npm run seed

# Install frontend dependencies
cd ../client
npm install
```

### 4. Run the Development Servers
Open two terminal tabs:

**Terminal 1 — Backend Express Server (Port 5000):**
```bash
cd server
npm run dev
# Server runs on: http://localhost:5000
```

**Terminal 2 — Frontend Vite Application (Port 5173):**
```bash
cd client
npm run dev
# Client runs on: http://localhost:5173
```

Open `http://localhost:5173` in your browser.

---

## 🗄 MongoDB Compass Connection Guide

MongoDB Compass is installed locally at `/Applications/MongoDB Compass.app`.

To inspect the ClosetIQ database and its collections:
1. Launch **MongoDB Compass**.
2. In the connection string input, enter:
   ```
   mongodb://127.0.0.1:27017
   ```
3. Click **Connect**.
4. In the left sidebar, locate and click the **`closetiq`** database.
5. You will see all 6 collections:
   - **`users`**: User records with hashed passwords and profile avatars.
   - **`clothingitems`**: All wardrobe pieces with categories (Tops, Bottoms, etc.), colors, seasons, brands, and image paths.
   - **`outfits`**: Outfits containing arrays of clothing ObjectIds.
   - **`outfitplans`**: Scheduled outfits tied to specific calendar dates (`dateString: 'YYYY-MM-DD'`).
   - **`wishlistitems`**: Shopping wishlist items with prices and product links.
   - **`communityposts`**: Publicly shared outfits with likes arrays and captions.

---

## 🔑 Pre-Seeded Demo Accounts

You can log in instantly using the **Quick 1-Click Demo Buttons** on the `/login` page:

| Curator | Email | Password | Role / Aesthetic |
|---|---|---|---|
| **Elena Vance** | `elena@closetiq.fashion` | `password123` | Minimalist Editorial Stylist (16 items, 4 outfits, 3 calendar plans, 4 wishlist items, community posts) |
| **Marcus Chen** | `marcus@closetiq.fashion` | `password123` | Architectural Streetwear Curator |

Or click **Register** to create a fresh, empty wardrobe account from scratch.

---

## ⚙️ Environment Variables

### Server (`server/.env`):
| Variable | Default Value | Description |
|---|---|---|
| `PORT` | `5000` | Express HTTP server port |
| `MONGODB_URI` | `mongodb://127.0.0.1:27017/closetiq` | Local MongoDB connection URI |
| `JWT_SECRET` | `closetiq_super_secret_jwt_key_2026_fashion_tech` | Secret key for signing JWTs |
| `CLIENT_URL` | `http://localhost:5173` | Allowed CORS frontend origin |
| `NODE_ENV` | `development` | Environment mode |

### Client (`client/.env`):
| Variable | Default Value | Description |
|---|---|---|
| `VITE_API_URL` | `http://localhost:5000/api` | Base URL for REST API endpoints |

---

## 🌟 Implemented Features

### 1. Landing Page
- Editorial hero header with brand tagline and badge.
- Interactive floating outfit collage with realistic fashion pieces.
- Feature overview cards explaining wardrobe digitization, outfit architecting, calendar planning, wishlist, and lookbook.
- CTAs to register or sign in.

### 2. Authentication & Security
- Secure registration and login with bcrypt password hashing (10 salt rounds).
- JWT generation and verification with 30-day token expiration.
- Private wardrobe isolation: user queries explicitly enforce `{ userId: req.user._id }`.
- Input validation, password length checks, and friendly toast alerts.

### 3. Dashboard
- Personalized greeting ("Good morning, Elena") tailored to current time.
- 4 real-time stat cards: Total Clothes, Saved Outfits, Upcoming Plans, Wishlist items.
- Quick Actions Bar for one-click access to add clothing, architect outfits, plan on calendar, or browse community.
- Recently Added Pieces carousel with instant detail modal.
- Recently Created Outfits showcase with lookbook modal.

### 4. My Wardrobe
- Responsive image grid with category badges, brand labels, color chips, and season tags.
- Category filters: All, Tops, Bottoms, Dresses, Outerwear, Shoes, Bags, Accessories.
- Season, Occasion, Color filters and Favorites-only toggle.
- Real-time search by piece name, brand, color, or care notes.
- Sort dropdown: Newest First, Oldest First, Alphabetical (A-Z, Z-A).
- Add piece modal supporting local file upload (Multer) or image URL.
- Edit piece modal with image replacement.
- View details modal displaying piece attributes and which outfits feature this piece.
- Delete piece with confirmation dialog (automatically unlinks piece from any saved outfits).
- Optimistic instant favorite toggle button on cards.

### 5. Outfit Architect (Outfit Builder)
- Split-screen workspace: searchable and categorizable wardrobe pieces on the left, live visual Outfit Canvas on the right.
- Multi-select wardrobe items with instant checkmarks and visual mosaic preview.
- Metadata fields: Outfit Name (required), Description, Occasion, Season, and optional initial Calendar Date.
- Prevents saving without a name or at least one selected item.
- Edit and update existing curated outfits.
- Curated Lookbook grid of all saved outfits with one-click "Schedule on Calendar" or "Share to Community".

### 6. Style Calendar
- Full interactive monthly calendar grid with previous/next month navigation and "Today" button.
- Displays scheduled outfit badges with piece count on each day cell.
- Date cell click opens day view drawer with details of all looks planned for that date.
- Duplicate prevention: strictly rejects scheduling the same outfit on the same date with an informative conflict error message.
- Edit and delete outfit plans from calendar.

### 7. Wishlist & Favorites
- Shopping Wishlist with piece name, image URL, estimated price, store link, category, and notes.
- **"Moved to Wardrobe!" Action:** one-click conversion of an acquired wishlist item directly into an active digital wardrobe clothing piece!
- Edit and delete wishlist items.
- Favorites tab providing unified quick access to all favorited clothes and signature outfits.

### 8. Community Lookbook
- Social feed displaying outfits shared by curators across the platform.
- Author profile avatar, name, outfit title, clothing piece mosaic, caption, and timestamp.
- Like and unlike button with real-time like counts and heart animation.
- Authors can delete their own published posts.
- Occasion filters and sorting by Most Recent or Most Loved.
- **Strict Privacy Guarantee:** Only outfits explicitly published to the community appear in the feed; private wardrobe pieces remain isolated.

### 9. Profile & Wardrobe Analytics
- View and update stylist name, bio, and avatar photo URL.
- Wardrobe composition breakdown by Category with percentage visual progress bars.
- Wardrobe composition breakdown by Season with count badges.
- Total community likes received metric.
- Secure sign out action.

---

## 🔮 Remaining Limitations & Future Roadmap

1. **Cloud Image Hosting:** Development utilizes local disk storage via Multer in `server/uploads/`. In production, this can be seamlessly swapped with Cloudinary, AWS S3, or Google Cloud Storage.
2. **Weather Integration:** A future release could integrate open-meteo or weather APIs to recommend outfits on the calendar based on the local temperature and rain forecast.
3. **AI Outfit Suggestions:** An AI stylist endpoint could suggest new outfit combinations based on color harmony and season compatibility.

