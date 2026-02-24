# Grand Romeo Hotel - Setup & Deployment Guide

## 🎨 NEW FEATURES IMPLEMENTED

### 1. Modern Black & Red Theme
- Completely redesigned color scheme from gold/navy to sophisticated black/red
- Updated all 3 portals: Admin, Front Desk, and Guest
- New gradient utilities and shadow effects

### 2. Walk-In Customer Support
- Both Admin and Front Desk can now register walk-in customers
- Auto-generates credentials for walk-in guests
- Special flag to distinguish walk-in vs online registrations
- Quick registration form with required fields

### 3. Enhanced Database Schema
- Room images support
- Walk-in customer tracking
- Enhanced payment statuses (Pending, Completed, Failed, Refunded)
- Expanded reservation statuses
- Audit trail fields
- Guest loyalty system
- Performance indexes

---

## 📦 PREREQUISITES

Before setting up, ensure you have:

- **Node.js** (v18+) - [Download](https://nodejs.org/)
- **Bun** (for package management) - [Download](https://bun.sh/)
- **Supabase Account** - [Sign up](https://supabase.com/)
- **Git** - [Download](https://git-scm.com/)

---

## 🚀 SETUP INSTRUCTIONS

### Step 1: Database Setup

1. Log in to your [Supabase Dashboard](https://app.supabase.com/)
2. Create a new project or select your existing Grand Romeo Hotel project
3. Go to **SQL Editor**
4. Run the database scripts in this order:

   **a. Create Tables (DDL)**
   ```sql
   -- Copy and paste contents from: database/DDL.sql
   -- This creates all the base tables
   ```

   **b. Apply Enhancements**
   ```sql
   -- Copy and paste contents from: database/migration_enhancements.sql
   -- This adds: room images, walk-in support, enhanced statuses, etc.
   ```

   **c. Add Sample Data (Optional)**
   ```sql
   -- Copy and paste contents from: database/DML.sql
   -- This adds test accounts and sample data
   ```

5. Get your Supabase credentials:
   - Go to **Settings** → **API**
   - Copy your **Project URL**
   - Copy your **anon public** key

### Step 2: Configure Environment Variables

For EACH of the 3 apps (hotel-admin, hotel-front-desk, hotel-guest):

1. Create a `.env.local` file in the app root:
   ```
   hotel-admin/.env.local
   hotel-front-desk/.env.local
   hotel-guest/.env.local
   ```

2. Add your Supabase credentials:
   ```.env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here
   ```

### Step 3: Install Dependencies

Open 3 terminal windows (one for each app) and run:

**Terminal 1 - Admin Portal:**
```powershell
cd hotel-admin
bun install
```

**Terminal 2 - Front Desk Portal:**
```powershell
cd hotel-front-desk
bun install
```

**Terminal 3 - Guest Portal:**
```powershell
cd hotel-guest
bun install
```

### Step 4: Start Development Servers

In each terminal, run:

**Terminal 1 (Admin):**
```powershell
cd hotel-admin
bun run dev
```
- Runs on: http://localhost:5173

**Terminal 2 (Front Desk):**
```powershell
cd hotel-front-desk
bun run dev
```
- Runs on: http://localhost:5174

**Terminal 3 (Guest):**
```powershell
cd hotel-guest
bun run dev
```
- Runs on: http://localhost:5175

---

## 🧪 TEST ACCOUNTS

### After running DML.sql, you can log in with:

**Admin Portal** (http://localhost:5173/login)
- Username: `admin`
- Password: `Admin123!`

**Front Desk Portal** (http://localhost:5174/login)
- Username: `frontdesk`
- Password: `Desk123!`

**Guest Portal** (http://localhost:5175/login)
- Username: `guest`
- Password: `Guest123!`

---

## 🆕 NEW FEATURES GUIDE

### Walk-In Guest Registration

**Location:** Admin & Front Desk → Guests Page

1. Click the **"Add Walk-In Guest"** button
2. Fill in:
   - First Name *
   - Last Name *
   - Email *
   - Contact Number *
   - Address (optional but recommended)
3. Click **"Create Guest"**
4. System automatically generates username and password
5. Guest is marked as "walk-in" in the database

### Room Images

**What Changed:**
- All rooms now support image URLs
- Default images are set for each room type
- Images display in room browsing

**To Add/Update Room Images:**
1. Go to Admin → Rooms
2. Edit a room
3. Add an image URL (use Unsplash or upload to your storage)

**Default Images (Already Set):**
- Standard: https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800
- Deluxe: https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800
- Suite: https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800
- Presidential: https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=800

---

## 🎨 COLOR THEME CUSTOMIZATION

The new theme uses red/black. To customize:

### Edit colors in `src/index.css` for each app:

```css
:root {
  /* Primary Red */
  --primary: 0 84% 60%;  /* HSL values */
  
  /* Crimson Variant */
  --crimson: 348 83% 47%;
  
  /* Black Shades */
  --black: 0 0% 8%;
  --black-light: 0 0% 15%;
}
```

---

## 📱 PORTAL RESPONSIBILITIES

### Admin Portal
- ✅ Manage all users (guests, front desk, admins)
- ✅ View financial reports and revenue
- ✅ Add/Edit/Delete rooms
- ✅ Manage staff members
- ✅ Register walk-in customers
- ✅ Full reservation oversight
- ✅ Process payments and refunds

### Front Desk Portal
- ✅ View guest information
- ✅ Create reservations
- ✅ Register walk-in customers
- ✅ Check-in/Check-out guests
- ✅ Process payments
- ✅ View room availability

### Guest Portal
- ✅ Browse available rooms with images
- ✅ Make reservations
- ✅ View booking history
- ✅ Update profile information
- ✅ Cancel reservations

---

## 🐛 TROUBLESHOOTING

### "Module not found" error
```powershell
# Delete node_modules and reinstall
rm -r node_modules
rm bun.lockb
bun install
```

### Database connection error
1. Check `.env.local` has correct Supabase URL and key
2. Verify your Supabase project is active
3. Check Row Level Security policies are created

### Build errors
```powershell
# Clear Vite cache
rm -r .vite
rm -r dist
bun run dev
```

### Port already in use
```powershell
# Change port in vite.config.ts:
server: {
  port: 5176  # Use different port
}
```

---

## 📂 PROJECT STRUCTURE

```
Grand-Romeo-Hotel/
├── database/
│   ├── DDL.sql                    # Create tables
│   ├── DML.sql                    # Sample data
│   ├── migration_enhancements.sql # New features
│   └── Policies.sql               # RLS policies
├── hotel-admin/                   # Admin portal
│   ├── src/
│   │   ├── components/
│   │   │   └── WalkInGuestDialog.tsx
│   │   ├── pages/
│   │   ├── lib/
│   │   └── index.css
│   └── .env.local
├── hotel-front-desk/              # Front desk portal
│   ├── src/
│   │   ├── components/
│   │   │   └── WalkInGuestDialog.tsx
│   │   └── ...
│   └── .env.local
├── hotel-guest/                   # Guest portal
│   ├── src/
│   │   ├── pages/
│   │   └── ...
│   └── .env.local
├── IMPLEMENTATION_GUIDE.md        # Detailed implementation notes
└── SETUP_GUIDE.md                 # This file
```

---

## 🚢 DEPLOYMENT

### Deploy to Vercel

Each portal can be deployed separately:

1. Push code to GitHub
2. Go to [Vercel Dashboard](https://vercel.com/)
3. Import each folder as a separate project:
   - `hotel-admin` → grand-romeo-admin.vercel.app
   - `hotel-front-desk` → grand-romeo-frontdesk.vercel.app
   - `hotel-guest` → grand-romeo-guest.vercel.app

4. Add environment variables in Vercel settings:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`

5. Deploy!

---

## 📊 NEXT STEPS (Future Enhancements)

### High Priority
- [ ] Direct booking flow (room click → payment)
- [ ] Check-in/Check-out buttons with status updates
- [ ] Receipt generation (PDF)
- [ ] Payment validation improvements

### Medium Priority
- [ ] Email notifications
- [ ] Front desk as staff in admin panel
- [ ] Guest loyalty points system
- [ ] Advanced search and filters

### Low Priority
- [ ] SMS notifications
- [ ] Multi-language support
- [ ] Mobile app
- [ ] Analytics dashboard

---

## 📞 SUPPORT

For issues or questions:
1. Check the [IMPLEMENTATION_GUIDE.md](IMPLEMENTATION_GUIDE.md)
2. Review Supabase logs in dashboard
3. Check browser console for errors
4. Verify database migration was successful

---

## 📝 CHANGELOG

### v2.0.0 (2026-02-24)
- ✨ New black/red theme
- ✨ Walk-in customer registration
- ✨ Room images support
- ✨ Enhanced database schema
- ✨ Improved type definitions
- 🎨 Updated UI components
- 🐛 Bug fixes and improvements

### v1.0.0 (Initial Release)
- Basic hotel management system
- Three-portal architecture
- Reservation system
- User authentication

---

**Made with ❤️ for Grand Romeo Hotel**

Last Updated: February 24, 2026
