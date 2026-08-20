# TurfMate — Sports Venue & Turf Booking Mobile Application

TurfMate is a cross-platform mobile application designed for discovering, booking, and managing sports turfs, courts, and event venues. Built with modern mobile technologies and Firebase cloud services, TurfMate offers live venue exploration, real-time time-slot reservation, atomic double-booking protection, ephemeral GPS distance calculation, offline network status monitoring, and comprehensive user support features.

This project is developed as part of an Application Development Lab curriculum.

---

## 1. Project Overview

- **Project Name:** TurfMate
- **Category:** Sports Tech / Booking Application
- **Main Problem Solved:** Eliminates manual phone-call bookings, fragmented availability schedules, and double-booking conflicts for sports enthusiasts and turf owners.
- **Key Features:**
  - Firebase Email & Password Authentication with automatic session persistence across app restarts via `AsyncStorage`.
  - User Registration with automatic Cloud Firestore user profile generation (`users` collection).
  - Multi-tab navigation with protected route guards for authenticated users.
  - Live Firestore Turf & Venue discovery interface with category filters, dynamic search, and detailed venue profiles.
  - Dynamic 14-day date selector and real-time slot availability checking (`timeSlots` collection).
  - Atomic booking creation powered by Cloud Firestore transactions (`runTransaction`) for concurrent double-booking protection.
  - Unique slot locking keyed by deterministic document ID `${venueId}_${date}_${startTime}`.
  - Reservation details view (`/booking/detail`) with entry QR codes, booking cancellation, and optional "Book Again" triggers.
  - User booking history management with filter tabs (`Upcoming`, `Completed`, `Cancelled`), pull-to-refresh, and atomic cancellation releasing slot locks.
  - Ephemeral GPS location detection using `expo-location` for nearest-first venue distance calculation without persisting precise coordinates to Firestore.
  - Offline network detection with safe-area top inset positioning (`@react-native-community/netinfo`).
  - Interactive Profile support suite (`Help & Support`, `Terms & Conditions`, `Privacy Policy`, `About TurfMate`, native `Share`, and `Rate TurfMate`).
  - Granular Cloud Firestore security rules protecting user profiles, bookings, and time slot reservations.
  - Dark/Light mode theme toggle and user preferences management.
- **Current Development Status:** **Phase 1, Phase 2 & Phase 3A/3B Completed** (Authentication, Persistence, Navigation Guard, Firestore Venues, Real-time Slot Availability, Atomic Double-Booking Protection, Booking Details View, Ephemeral GPS Location, Offline Banner, & Profile Support Suite).

---

## 2. Tech Stack

| Category | Technology | Version | Purpose |
| :--- | :--- | :--- | :--- |
| **Framework** | Expo SDK | `~54.0.35` | Universal React Native development platform |
| **Core Runtime** | React Native | `0.81.5` | Native mobile component runtime |
| **UI Library** | React | `19.1.0` | Component state & UI rendering |
| **Language** | TypeScript | `~5.9.2` | Type-safe JavaScript application development |
| **Backend & Auth** | Firebase JS SDK | `^12.17.1` | Authentication & Cloud Firestore backend |
| **Auth Persistence** | Async Storage | `2.2.0` | Persistent local key-value storage for Auth tokens |
| **Location / GPS** | Expo Location | `~19.0.2` | Device GPS permission & location coordinates |
| **Network State** | NetInfo | `^11.4.1` | Native network connectivity listener |
| **Routing** | Expo Router | `~6.0.24` | File-based navigation system |
| **Navigation Core** | React Navigation | `^7.1.8` | Core routing utilities (`@react-navigation/native`) |
| **Tab Navigation** | React Navigation Tabs | `^7.4.0` | Bottom tab bar layout (`@react-navigation/bottom-tabs`) |
| **UI Elements** | Expo Vector Icons | `^15.0.3` | Vector icon sets (Ionicons) |
| **Animations** | React Native Reanimated | `~4.1.1` | Native thread animations |
| **Safe Area** | React Native Safe Area Context | `~5.6.0` | Inset management for notches and camera cutouts |
| **Screen Handler** | React Native Screens | `~4.16.0` | Native navigation screen management |

---

## 3. Project Status & Phase Progress

### Phase 1 — Authentication & Navigation
**Status:** ✅ COMPLETED
- Firebase Email/Password registration & login
- Authentication state listener (`onAuthStateChanged`)
- Authentication persistence (`AsyncStorage`)
- Protected navigation route guard
- Sign-Out functionality
- Firestore user profile creation (`users` collection)

### Phase 2 — Firestore + Core Turf Booking
**Status:** ✅ COMPLETED
- Firestore turf/venue listing (`venues` collection)
- Real-time turf search & category filtering
- Dynamic date selection (14-day window from today)
- Time-slot selection with real-time Firestore availability
- Atomic booking creation via Firestore `runTransaction`
- Double-booking protection against concurrent reservations
- Booking confirmation screen (`/booking/success`)
- My Bookings management dashboard & atomic cancellation

### Phase 3A — Network Connectivity & GPS Location
**Status:** ✅ COMPLETED
- Real-time network detection via `@react-native-community/netinfo`
- Safe-area aware offline banner positioned below status bar cutouts
- Native GPS permission request & device coordinate retrieval via `expo-location`
- Nearest-first venue sorting based on Haversine distance calculation
- Ephemeral in-memory location state preservation (coordinates are NOT persisted to Firestore)

### Phase 3B — Post-Booking UX & Profile Support Suite
**Status:** ✅ COMPLETED
- Dedicated reservation details screen (`/booking/detail`) with entry QR code
- Dynamic time-of-day greeting (Good morning / Good afternoon / Good evening)
- Profile avatar tap navigation to `/(tabs)/profile`
- Full Support suite: `Help & Support` (expandable FAQs), `Terms & Conditions`, `Privacy Policy`, `About TurfMate`, native `Share`, and `Rate TurfMate`

### Phase 4 — Google Maps & Advanced Recommendations
**Status:** 📌 PLANNED
- Map view visualization for sports venues & interactive pins

### Phase 5 — AI Chatbot & Recommendations
**Status:** 📌 PLANNED
- TurfMate AI Assistant (`(tabs)/ai.tsx`) for smart booking queries

---

## 4. Double-Booking Protection & Atomic Transactions

TurfMate enforces double-booking prevention at both the UI level and the database level:

```text
User Selects Time Slot
  │
  ▼
Slot Screen checks timeSlots collection
  ├─ If status == 'booked' ──► Slot is DISABLED with "Booked" badge
  └─ If available ───────────► User proceeds to Booking Summary
                                 │
                                 ▼
                       Firestore Transaction (`runTransaction`)
                         │
                         ▼
                       Read `timeSlots/${venueId}_${date}_${startTime}`
                         │
                         ├─ If EXISTS & status == 'booked'
                         │    │
                         │    └─► Abort Transaction ──► Throw "THIS_SLOT_IS_ALREADY_BOOKED"
                         │                                │
                         │                                └─► Friendly Alert: "This slot is already booked."
                         │
                         └─► Set `timeSlots` doc (status = 'booked')
                             Set `bookings` doc (userId = auth.uid)
                             Commit Transaction Atomically
```

- **Deterministic Document Keys:** Time slots use `${venueId}_${date}_${startTime}` document IDs.
- **Normalization:** `venueId`, `date`, and `startTime` string formats are normalized to prevent casing or spacing discrepancies.
- **Atomicity:** `runTransaction` guarantees that if two users attempt to confirm the exact same slot at the same millisecond, exactly one transaction succeeds and the other receives an alert prompting them to pick a different slot.

---

## 5. Ephemeral GPS & Network Monitoring

### Ephemeral GPS Location
- Location coordinates obtained via `expo-location` are stored exclusively in React application state memory.
- Distances to venues are computed on-the-fly using the Haversine formula.
- User coordinates are **never permanently stored** or written to Cloud Firestore, safeguarding user privacy.

### Offline Network Detection
- Network state is monitored globally by `OfflineBanner` using `@react-native-community/netinfo`.
- The banner dynamically calculates status bar cutouts via `useSafeAreaInsets()` to render gracefully underneath camera notches without obscuring header titles.

---

## 6. Cloud Firestore Collections & Security Rules

### Collections Architecture

1. **`users/{uid}`**: Auth user profile details (Name, Email, Phone, Points).
2. **`venues/{venueId}`**: Sports turf venue details (Name, Location, Price, Images, Sports).
3. **`bookings/{bookingId}`**: User reservation records (userId, venueId, date, timeSlot, amount, status).
4. **`timeSlots/{venueId}_{date}_{startTime}`**: Atomic slot locks (venueId, date, startTime, status, bookingId).

### Security Rules (`firestore.rules`)

```rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // User Profiles (Owner restricted)
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Venues (Public read for auth users, venue owner write)
    match /venues/{venueId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == resource.data.ownerId;
    }
    
    // Bookings (Owner restricted read, create, update)
    match /bookings/{bookingId} {
      allow read: if request.auth != null && resource.data.userId == request.auth.uid;
      allow create: if request.auth != null && request.resource.data.userId == request.auth.uid;
      allow update, delete: if request.auth != null && resource.data.userId == request.auth.uid;
    }

    // Time Slots (Public auth read, atomic write)
    match /timeSlots/{slotId} {
      allow read: if request.auth != null;
      allow create, update: if request.auth != null;
    }
  }
}
```

---

## 7. Database Design Blueprint vs Runtime Firestore

- **Database Blueprint (`database/`):** Contains `schema.ts`, `sampleData.ts`, `relationships.md`, and `README.md` defining the complete structural schema blueprint for the TurfMate platform.
- **Runtime Firestore Backend:** Active Cloud Firestore instance running in region `asia-south1` executing real-time queries for user profiles, venues, bookings, and time slot reservations.

---

## 8. Verification & Verification Commands

To verify TypeScript strictness across the entire codebase:

```bash
npx tsc --noEmit
```

Expected result: **0 errors**.
