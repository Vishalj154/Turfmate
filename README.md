# TurfMate — Sports Venue & Turf Booking Mobile Application

TurfMate is a modern, cross-platform mobile application designed for discovering, checking real-time slot availability, and booking sports turfs, courts, and venues. Built with React Native, Expo SDK 54, TypeScript, and Firebase cloud services, TurfMate offers live venue exploration, atomic double-booking protection, ephemeral GPS proximity calculation, offline network status detection, and a comprehensive user profile support suite.

This project is developed as part of an Application Development Lab curriculum.

---

## 1. Overview

TurfMate eliminates manual phone-call bookings, fragmented availability schedules, and double-booking conflicts by providing a seamless, real-time digital booking experience for sports enthusiasts.

### Main User Flow

```text
Login / Register
   │
   ▼
Home Screen (Live Turfs & GPS Distance)
   │
   ▼
Discover / Search Turfs (/search)
   │
   ▼
View Turf Details (/venue/[id])
   │
   ▼
Select Date (/booking/date — 14-Day Window)
   │
   ▼
Select Time Slot (/booking/slot — Real-Time Availability)
   │
   ▼
Booking Summary (/booking/summary — Coupon & Price Breakdown)
   │
   ▼
Confirm Booking (Atomic Firestore Transaction)
   │
   ▼
Booking Confirmation (/booking/success — Entry QR Code)
   │
   ▼
My Bookings (/(tabs)/bookings — Filter & Cancellation)
   │
   ▼
View Booking Details (/booking/detail — Reservation & Entry QR Code)
```

---

## 2. Technology Stack

The exact package versions installed and used in the TurfMate project (from `package.json`):

| Technology | Version | Purpose |
| :--- | :--- | :--- |
| **Expo SDK** | `~54.0.35` | Universal React Native app development framework |
| **React Native** | `0.81.5` | Mobile native component runtime |
| **React** | `19.1.0` | UI rendering & component state management |
| **TypeScript** | `~5.9.2` | Strict type-safe application development |
| **Firebase SDK** | `^12.17.1` | Authentication & Cloud Firestore database backend |
| **Expo Router** | `~6.0.24` | File-based navigation & deep linking framework |
| **Async Storage** | `2.2.0` | Local persistent key-value storage for Auth sessions |
| **NetInfo** | `11.4.1` | Native network connectivity monitoring |
| **Expo Location** | `~19.0.8` | Device GPS permissions & coordinate retrieval |
| **Safe Area Context** | `~5.6.0` | Inset management for status bars, camera cutouts & notches |
| **React Navigation** | `^7.1.8` | Core routing utilities (`@react-navigation/native`) |
| **Bottom Tabs** | `^7.4.0` | Bottom navigation tab bar (`@react-navigation/bottom-tabs`) |
| **Expo Vector Icons** | `^15.0.3` | Icon set icons (`Ionicons`) |
| **Reanimated** | `~4.1.1` | Native animation engine (`react-native-reanimated`) |

---

## 3. Features & Authentication

### Authentication

- **Firebase Email & Password Auth:** Sign up (`/register`) and log in (`/login`) with credential validation and translated user-friendly error messages.
- **Persistent Auth Session:** Uses `@react-native-async-storage/async-storage` with Firebase `reactNativePersistence` so user sessions persist across application restarts.
- **Auth State Listener:** `onAuthStateChanged` automatically detects login state changes and updates global user context.
- **Protected Navigation Guard:** `_layout.tsx` enforces authentication route guards, redirecting unauthenticated users to the login screen.
- **Firestore User Profiles:** Automatic profile document creation in the `users` collection upon registration.
- **Auth Loading State:** Displays smooth splash loading state while verifying persistent session tokens.
- **Sign-Out:** Instant token invalidation and redirection to sign-in.

> **Note on Google Authentication:** Google Sign-In is intentionally postponed to a later phase.

---

## 4. Firestore Database Architecture

TurfMate utilizes **Cloud Firestore** (Region: `asia-south1` Mumbai) as its live runtime cloud database.

```text
Firebase Authentication User (UID)
        │
        ▼
Firestore User Profile (`users/{uid}`)

User (`users`) ──► creates ──► Booking (`bookings`) ──► for ──► Venue (`venues`)

Venue + Date + Time Slot ──► reserves ──► Time Slot Lock (`timeSlots`)
```

### Active Collections

#### 1. `users`
Stores profile records for registered accounts.
- **Document ID:** Firebase Auth `uid`
- **Fields:** `id`, `name`, `email`, `phone`, `isVerified`, `rewardPoints`, `createdAt`

#### 2. `venues`
Stores sports venue and turf listings.
- **Document ID:** Unique venue string ID (e.g. `venue_001`)
- **Fields:** `id`, `name`, `location`, `rating`, `reviewsCount`, `pricePerHour`, `image`, `gallery`, `sports`, `amenities`, `rules`, `description`, `isActive`, `latitude`, `longitude`, `ownerId`

#### 3. `bookings`
Stores user reservation documents.
- **Document ID:** Generated document ID (e.g. `BKG-1740001234567`)
- **Fields:** `id`, `userId` (matches Auth `uid`), `venueId`, `date`, `startTime`, `endTime`, `timeSlot`, `players`, `amount`, `paymentStatus`, `bookingStatus` (`'confirmed'` | `'cancelled'`), `couponId`, `createdAt`

#### 4. `timeSlots`
Tracks active slot reservations for atomic double-booking protection.
- **Document ID:** Deterministic key format `${venueId}_${date}_${startTime}` (e.g. `venue_001_2026-08-20_06_00_AM`)
- **Fields:** `id`, `venueId`, `date`, `startTime`, `endTime`, `status` (`'booked'`), `bookingId`

---

## 5. Database Design Blueprint vs Live Firestore

The TurfMate codebase maintains a clear distinction between its structural design blueprint and its active runtime database:

* **`database/` Blueprint Directory:**
  - `database/schema.ts`: TypeScript data models and interface blueprints.
  - `database/sampleData.ts`: Blueprint reference dataset for venues and categories.
  - `database/relationships.md`: Entity-relationship mapping documentation.
  - `database/README.md`: Architectural documentation for the blueprint schema.

> **Important Distinction:** `database/` contains the application's database design/schema documentation and sample data. **Cloud Firestore is the actual live runtime database.** `database/schema.ts` serves as a blueprint specification and is not a local database engine.

---

## 6. Firestore Security & Rules

Access control is enforced using Cloud Firestore security rules defined in `firestore.rules`:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // User Profiles (Owner access only)
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Venues (Public read for authenticated users, owner write)
    match /venues/{venueId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == resource.data.ownerId;
    }
    
    // Bookings (Owner access; create requires matching Auth UID)
    match /bookings/{bookingId} {
      allow read: if request.auth != null && resource.data.userId == request.auth.uid;
      allow create: if request.auth != null && request.resource.data.userId == request.auth.uid;
      allow update, delete: if request.auth != null && resource.data.userId == request.auth.uid;
    }

    // Time Slots (Read for authenticated users, atomic creation)
    match /timeSlots/{slotId} {
      allow read: if request.auth != null;
      allow create, update: if request.auth != null;
    }
  }
}
```

- **Authenticated Access:** Only authenticated users with valid Firebase tokens can write to Firestore.
- **User Data Isolation:** Users can only view and update their own booking records.
- **Strict Identity Matching:** Booking creation requires `request.resource.data.userId == request.auth.uid`.
- **Public Venue Access:** Venue listings and availability status are readable by signed-in users.
- **No Secret Exposure:** Client SDK initialization in `services/firebase.ts` uses public app configurations; no private credentials or service accounts are committed.

---

## 7. Booking System & Atomic Double-Booking Protection

### Booking Flow Features

- **Venue Discovery & Search:** Browse active venues on the Home screen or filter live venues by name and location on `/search`.
- **Venue Profile:** View venue image galleries, amenities, hourly pricing, ratings, and sport rules on `/venue/[id]`.
- **14-Day Date Window:** Select booking dates strictly starting from today (`new Date()`) up to 14 days ahead on `/booking/date`.
- **Real-Time Slot Availability:** Renders Morning (06:00 AM - 11:00 AM) and Evening (05:00 PM - 10:00 PM) slot cards on `/booking/slot`. Queries `timeSlots` collection and disables already-booked slots.
- **Booking Summary & Discounts:** Displays price breakdown, platform fees, and coupon application (`WELCOME20`) on `/booking/summary`.
- **Booking Confirmation:** Displays generated Booking ID (`BKG-...`), reservation overview, and an entry QR code on `/booking/success`.
- **Reservation Details:** Dedicated `/booking/detail` screen featuring entry QR code, venue details, payment summary, and cancellation options.
- **My Bookings Dashboard:** View upcoming, completed, and cancelled reservations on `/(tabs)/bookings` with pull-to-refresh.
- **Booking Cancellation:** Cancelling an upcoming reservation updates the booking status to `cancelled` and releases the time slot document lock.
- **Book Again Feature:** Tapping "Book Again" from booking details navigates directly back to venue date selection.

### Atomic Double-Booking Protection

To prevent concurrent users from reserving the exact same venue, date, and time slot simultaneously, TurfMate implements atomic slot locking powered by a **Cloud Firestore Transaction (`runTransaction`)**:

```text
User initiates booking for slot (e.g. 06:00 AM)
  │
  ▼
Execute Firestore `runTransaction`
  │
  ▼
Read slot document: `timeSlots/${venueId}_${date}_${startTime}`
  │
  ├─ If document EXISTS & status == 'booked'
  │    │
  │    └─► ABORT TRANSACTION ──► Throw "THIS_SLOT_IS_ALREADY_BOOKED"
  │                                │
  │                                └─► Alert: "This slot is already booked. Please select another slot."
  │
  └─ If document DOES NOT EXIST / AVAILABLE
       │
       ├─► Set `timeSlots/${venueId}_${date}_${startTime}` (status = 'booked')
       ├─► Create `bookings/{bookingId}` document (userId = auth.uid)
       └─► COMMIT TRANSACTION ATOMICALLY
```

- **Unique Deterministic Key:** Uses normalized `${venueId}_${date}_${startTime}` document IDs.
- **Concurrency Safety:** If two users attempt to confirm the same slot at the exact same millisecond, Cloud Firestore's transaction manager grants execution to one user and automatically rejects the second attempt with a friendly error prompt.

---

## 8. Network Connectivity Features

- **Real-Time Connectivity Detection:** Powered by `@react-native-community/netinfo` via the custom `useNetworkStatus` hook.
- **Safe-Area Aware Offline Banner:** `OfflineBanner.tsx` calculates top status-bar insets via `useSafeAreaInsets()` to render gracefully below camera cutouts and status bars without overlapping screen content.
- **Reconnection Feedback:** Automatically dismisses when connection is restored.
- **Firestore Fallback:** Displays user-friendly network retry prompts during network interruptions and supports auto-seeding for initial venue listings if the online database collection is empty.

---

## 9. GPS & Location Features

- **Foreground Location Permission:** Prompts users for GPS permissions via `expo-location` (`useUserLocation`).
- **Current Device Coordinates:** Retrieves device latitude and longitude.
- **Haversine Distance Calculation:** Computes precise straight-line distance (in km) between the user's GPS coordinates and venue location coordinates (`locationService.ts`).
- **Distance Display:** Renders distance badges on turf cards (e.g., `2.4 km away`).
- **"Nearest First" Sorting:** Allows users to sort home screen venue listings by proximity.
- **Permission Denied Fallback:** Defaults gracefully to standard venue sorting if location permissions are denied.

> **Location Data Privacy Note:** User GPS coordinates are kept exclusively in temporary application memory/state for distance sorting and are **never persisted to Cloud Firestore**. Reverse geocoding/exact street address lookup is not currently implemented.

---

## 10. Home Screen

The Home screen (`app/(tabs)/index.tsx`) provides an interactive discovery hub:

- **Dynamic Greeting:** Time-of-day greeting ("Good morning", "Good afternoon", "Good evening") based on device clock.
- **Profile Avatar Navigation:** Tapping the user avatar in the top header navigates directly to the Profile tab.
- **Active Venue Listings:** Live turf cards fetched from Cloud Firestore with dynamic skeleton loaders.
- **Category Filter Chips:** Filter turfs by sport categories (All, Football, Cricket, Badminton, Tennis).
- **GPS Location Header Badge:** Displays active GPS status (`GPS Location (Active)` vs `Default Location`).
- **Nearest First Sorting:** One-tap toggle to sort venues by distance from current GPS coordinates.
- **Quick Search Entry:** Direct access to live search via `/search`.

---

## 11. Profile Screen & Support Suite

The Profile screen (`app/(tabs)/profile.tsx`) features user management and a complete support suite:

- **User Profile Header:** Displays user avatar initial, full name, email, and verification badge.
- **TurfMate Plus Card:** Membership upgrade card UI *(UI present / functionality pending)*.
- **Preferences:**
  - Dark Mode toggle (syncs with `AppContext` theme state).
  - Notifications toggle *(UI present / functionality pending)*.
  - Language selector *(UI present / functionality pending — set to English)*.
- **Support Suite:**
  - **Help & Support:** Navigates to `/support` featuring expandable FAQ accordions and support email (`support@turfmate.app`).
  - **Terms & Conditions:** Navigates to `/terms` covering application usage, booking, and cancellation rules.
  - **Privacy Policy:** Navigates to `/privacy` explaining data protection and ephemeral GPS location handling.
  - **About TurfMate:** Navigates to `/about` displaying app version (`v1.0.0`) and technology stack specs.
  - **Share TurfMate:** Triggers native React Native `Share` dialog to share the app.
  - **Rate TurfMate:** Displays alert: *"Rating will be available once TurfMate is published on the Play Store."*
- **Sign-Out Action:** Clears session state and redirects to `/login`.
- **App Version:** Footer displays `TurfMate v1.0.0`.

---

## 12. Navigation Structure

Powered by **Expo Router** file-based navigation with tab and stack navigators:

```text
app/
├── _layout.tsx           # Root stack navigator, AppProvider & Auth route guard
├── index.tsx             # Animated Splash Screen
├── onboarding.tsx        # Walkthrough onboarding slides
├── search.tsx            # Live Firestore venue search screen
├── settings.tsx          # App settings screen
├── support.tsx           # Help & Support screen (Expandable FAQs)
├── terms.tsx             # Terms & Conditions screen
├── privacy.tsx           # Privacy Policy screen
├── about.tsx             # About TurfMate screen
├── (auth)/               # Unauthenticated Auth Stack
│   ├── _layout.tsx       # Auth header configuration
│   ├── login.tsx         # Login screen
│   └── register.tsx      # Registration screen
├── (tabs)/               # Authenticated Main Tab Bar
│   ├── _layout.tsx       # Bottom tab bar layout & icon setup
│   ├── index.tsx         # Home screen (Turf listings & GPS sorting)
│   ├── explore.tsx       # Explore venue categories
│   ├── bookings.tsx      # My Bookings dashboard (Upcoming, Completed, Cancelled)
│   ├── wishlist.tsx      # Saved favorite turfs
│   ├── ai.tsx            # TurfMate AI Assistant
│   └── profile.tsx       # User profile & Support menu
├── venue/
│   └── [id].tsx          # Dynamic venue details page
└── booking/
    ├── date.tsx          # 14-Day calendar date picker
    ├── slot.tsx          # Real-time slot availability picker
    ├── summary.tsx       # Booking summary & atomic transaction trigger
    ├── success.tsx       # Booking confirmation & entry QR code
    └── detail.tsx        # Standalone reservation details & cancellation
```

---

## 13. UI & Design System

- **Dark Mode Aesthetic:** Dark theme background (`#0F172A`), dark surface cards (`#1E293B`), and white typography (`#FFFFFF`).
- **Green Accent Palette:** Primary brand green (`#2E7D32` / `#22C55E`) used across CTA buttons, badges, and active tab icons.
- **Typography:** Custom `Text` component supporting `h1`, `h2`, `h3`, `body`, `caption`, and `button` variants with Android font-weight fallback fixes (`fontWeight: '700'`).
- **Reusable Component Library:** Built-in modular components (`Button`, `Input`, `Card`, `Text`, `Skeleton`).
- **Safe Area Insets:** Managed globally using `react-native-safe-area-context` to prevent header and bottom-bar overlap on devices with notches and status bar cutouts.

---

## 14. Project Structure

```text
TurfMate/
├── app/                      # Expo Router screens & navigation stack
├── components/               # UI component library & OfflineBanner component
│   └── ui/                   # Reusable Button, Card, Input, Text, Skeleton controls
├── services/                 # Service layer abstraction
│   ├── firebase.ts           # Firebase App, Auth (AsyncStorage), Firestore init
│   ├── authService.ts        # Auth operations (Login, Register, Logout)
│   ├── authStateService.ts   # Firebase onAuthStateChanged listener
│   ├── userService.ts        # User profile CRUD operations
│   ├── turfService.ts        # Venue lookup, active turfs & auto-seeding
│   ├── bookingService.ts     # Atomic booking transaction, slot locking & cancellation
│   ├── locationService.ts    # GPS distance & Haversine proximity calculations
│   └── firebaseErrors.ts     # Firebase authentication error message translation
├── store/                    # State management
│   └── AppContext.tsx        # Central React Context (Auth, Theme, Bookings)
├── hooks/                    # Custom React hooks
│   ├── useUserLocation.ts    # Expo Location permission & GPS coordinates hook
│   └── useNetworkStatus.ts   # NetInfo network monitoring hook
├── types/                    # TypeScript interfaces (`index.ts`)
├── database/                 # Structural blueprint & documentation files
│   ├── schema.ts             # Blueprint TypeScript definitions
│   ├── sampleData.ts         # Sample data for venue blueprinting
│   ├── relationships.md      # Entity relationship specifications
│   └── README.md             # Blueprint documentation
├── theme/                    # Design system tokens (Colors, Spacing, Typography)
├── firestore.rules           # Cloud Firestore Security Rules
├── app.json                  # Expo project metadata (Package: com.vishaljankar.turfmate)
├── tsconfig.json             # TypeScript compiler settings
└── package.json              # Dependencies & npm scripts
```

---

## 15. Current Development Status

### Completed

- [x] Firebase Email/Password Authentication & Session Persistence
- [x] Protected Route Navigation Guard
- [x] Live Cloud Firestore Integration (`venues`, `users`, `bookings`, `timeSlots`)
- [x] Active Turf Discovery & Search
- [x] Dynamic 14-Day Date Selection
- [x] Real-Time Slot Availability Detection
- [x] Atomic Double-Booking Protection via `runTransaction`
- [x] Booking Confirmation & Reservation Detail Screens (`/booking/detail`)
- [x] Entry QR Code Display
- [x] My Bookings Dashboard & Booking Cancellation
- [x] GPS Location Detection & Haversine Distance Sorting ("Nearest First")
- [x] Network Status Monitoring & Top Safe-Area Offline Banner
- [x] Profile Support Suite (`Help & Support`, `Terms & Conditions`, `Privacy Policy`, `About TurfMate`, Native `Share`, `Rate TurfMate`)
- [x] Strict Firestore Security Rules (`firestore.rules`)

---

## 16. Future Enhancements & Postponed Features

Features planned for future development phases:

- **Google Sign-In:** Postponed to a future authentication update.
- **Payment Gateway Integration:** Real payment gateway SDK integration (Razorpay / Stripe) to replace simulated payments.
- **Play Store Rating:** Real Google Play Store link integration for app ratings.
- **Backend Support Ticketing:** Dedicated backend ticketing system for customer support inquiries.
- **Push Notifications:** Firebase Cloud Messaging (FCM) for booking reminders and promotional alerts.
- **Turf Owner Portal:** Dedicated web/mobile management dashboard for venue owners.
- **Production Build:** Standalone Android development build (`.apk`) via EAS for deployment testing.

---

## 17. Testing Environment

- **Execution Environment:** Expo Go on physical Android devices.
- **TypeScript Verification:** Verified using:
  ```bash
  npx tsc --noEmit
  ```
- **Deployment Status:** Standalone Android builds (`.apk` / `.aab`) are planned for later release testing.

---

## 18. Firebase Configuration & Security

- **Services Used:** Firebase Authentication & Cloud Firestore.
- **Configuration Security:** Firebase client SDK initialization parameters in `services/firebase.ts` are designed for public client identification. **No secret API keys, private credentials, or service account files are stored or committed in the codebase.**

---

## 19. Version

- **Application Version:** `1.0.0` (as configured in `package.json` and `app.json`, displayed in application UI as **TurfMate v1.0.0**).
