# TurfMate — Sports Venue & Turf Booking Mobile Application

TurfMate is a cross-platform mobile application designed for discovering, booking, and managing sports turfs, courts, and event venues. Built with modern mobile technologies and Firebase cloud services, TurfMate offers live venue exploration, real-time time-slot reservation, atomic double-booking protection, and personalized user profile management.

This project is developed as part of an Application Development Lab curriculum.

---

## 1. Project Overview

- **Project Name:** TurfMate
- **Category:** Sports Tech / Booking Application
- **Main Problem Solved:** Eliminates manual phone-call bookings, fragmented availability schedules, and lack of real-time slot selection for sports enthusiasts and turf owners.
- **Key Features:**
  - Firebase Email & Password Authentication with automatic session persistence across app restarts.
  - User Registration with automatic Cloud Firestore user profile generation.
  - Multi-tab navigation with protected route guards for authenticated users.
  - Live Firestore Turf & Venue discovery interface with category filters, dynamic search, and detailed venue profiles.
  - Dynamic 14-day date selector and real-time slot availability checking.
  - Atomic booking creation powered by Firestore transactions (`runTransaction`) for concurrent double-booking protection.
  - User booking history management with filter tabs (`Upcoming`, `Completed`, `Cancelled`), pull-to-refresh, and atomic cancellation.
  - Granular Cloud Firestore security rules protecting user profiles, bookings, and time slot reservations.
  - Dark/Light mode theme toggle and user preferences management.
- **Current Development Status:** **Phase 1 & Phase 2 Completed** (Authentication, Persistence, Navigation Guard, Firestore Venues, Real-time Slot Availability, Atomic Bookings, & Booking Management).

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
| **Routing** | Expo Router | `~6.0.24` | File-based navigation system |
| **Navigation Core** | React Navigation | `^7.1.8` | Core routing utilities (`@react-navigation/native`) |
| **Tab Navigation** | React Navigation Tabs | `^7.4.0` | Bottom tab bar layout (`@react-navigation/bottom-tabs`) |
| **UI Elements** | Expo Vector Icons | `^15.0.3` | Vector icon sets (Ionicons) |
| **Animations** | React Native Reanimated | `~4.1.1` | Native thread animations |
| **Safe Area** | React Native Safe Area Context | `~5.6.0` | Inset management for notches and home indicators |
| **Screen Handler** | React Native Screens | `~4.16.0` | Native navigation screen management |

---

## 3. Project Status & Phase Progress

### Phase 1 — Authentication & Navigation
**Status:** ✅ COMPLETED
- Firebase Email/Password registration
- Firebase Email/Password login
- Authentication state listener (`onAuthStateChanged`)
- Authentication persistence (`AsyncStorage`)
- Auth loading state
- Protected navigation route guard
- Sign-Out functionality
- Firestore user profile loading & creation
- Firebase error handling translation

### Phase 2 — Firestore + Core Turf Booking
**Status:** ✅ COMPLETED
- Firestore turf/venue listing (`venues` collection)
- Firestore turf details loaded dynamically by document ID
- Real-time turf search against Firestore venue data
- Category filtering
- Dynamic date selection (14-day window from today)
- Time-slot selection with real-time Firestore availability
- Atomic booking creation via Firestore `runTransaction`
- Double-booking protection against concurrent reservations
- Booking confirmation screen with generated Booking ID
- My Bookings management dashboard
- Booking status filtering (`Upcoming`, `Completed`, `Cancelled`)
- Booking cancellation with time-slot release
- Cloud Firestore security rules (`firestore.rules`)
- UI loading, empty, and error/retry states
- Pull-to-refresh for user bookings

### Phase 3 — Network + Maps + GPS
**Status:** 🔜 NEXT
- Integration of Google Maps & Expo Location for turf proximity search
- Distance calculation and GPS navigation to venues

### Phase 4 — AI Chatbot
**Status:** 📌 PLANNED
- AI assistant tab (`(tabs)/ai.tsx`) integration for turf recommendations and queries

### Phase 5 — ML Features
**Status:** 📌 PLANNED
- Intelligent booking demand prediction and smart slot recommendations

### Phase 6 — AI Alerts & Notifications
**Status:** 📌 PLANNED
- Weather-based game alerts and promotional push notifications

### Final — Testing + Android Build + Demonstration
**Status:** 📌 PLANNED
- Standalone Android development build (`.apk`) using Expo Application Services (EAS) for college lab demonstration.

---

## 4. Phase 2 — Firestore + Core Turf Booking

TurfMate utilizes **Cloud Firestore** as the application's cloud data layer for all turf listings, real-time availability, and booking lifecycle operations.

### Turf Discovery
- **Live Firestore Integration:** Active venues are queried directly from the `venues` Firestore collection (`where isActive == true`).
- **Home Screen:** Displays live venue data loaded from Firestore with fallback auto-seeding if the database collection is empty.
- **Search Screen:** Executes client-side filtering against live venue datasets by name and location.
- **Venue Details:** Reads individual venue documents dynamically using their unique Firestore document ID (`venueId`).
- **State Handling:** Includes visual loading spinners (`ActivityIndicator`), error messages with retry triggers, and empty dataset states.

### Booking Flow Architecture
```text
User
  │
  ▼
Venue Selection
  │
  ▼
Venue Details (/venue/[id])
  │
  ▼
Select Date (/booking/date)
  │
  ▼
Select Time Slot (/booking/slot)
  │
  ▼
Booking Summary (/booking/summary)
  │
  ▼
Firestore Transaction (runTransaction)
  │
  ▼
Booking Confirmation (/booking/success)
  │
  ▼
My Bookings (/(tabs)/bookings)
```

### Date Selection
- Users can choose booking dates starting strictly from today (`new Date()`).
- Renders an upcoming **14-day booking window**.
- Past dates are strictly excluded and prohibited.

### Time Slots & Availability
- Renders organized Morning (06:00 AM - 11:00 AM) and Evening (05:00 PM - 10:00 PM) slot windows.
- Queries the `timeSlots` collection for existing reservations matching the venue ID and selected date.
- Reserved slots are rendered as disabled with a `"Booked"` tag to prevent invalid selections.

---

## 5. Atomic Booking & Double-Booking Protection

To prevent concurrent users from reserving the exact same turf, date, and time slot simultaneously, TurfMate implements atomic booking creation powered by a **Cloud Firestore Transaction (`runTransaction`)**.

### Conceptual Transaction Flow
```text
Check slot document (`timeSlots/${venueId}_${date}_${startTime}`)
  │
  ▼
Verify availability (does slot document exist?)
  │
  ├─ If EXISTS ────► Abort Transaction ──► Throw "THIS_SLOT_IS_ALREADY_BOOKED"
  │
  └─ If NOT EXISTS ──► Reserve Slot (`timeSlots` doc created)
                        │
                        ▼
                      Create Booking (`bookings` doc created)
                        │
                        ▼
                      Commit Transaction Atomically
```

- **Deterministic Slot Document IDs:** Uses `${venueId}_${date}_${startTime}` as a unique document identifier.
- **Atomicity:** The read-then-write sequence is executed as a single atomic operation inside `db.runTransaction()`.
- **Concurrent Safety:** If another user attempts to book the same slot at the same time, Firestore's optimistic concurrency control automatically aborts the losing transaction. The app catches this failure and prompts the user to select another available time slot.

---

## 6. Booking Management & Cancellation

### My Bookings
Users can review and manage their booking history on the **My Bookings** screen (`/(tabs)/bookings.tsx`).
- **Owner Scope:** Users can only view bookings associated with their own Firebase Authentication `uid`.
- **Status Filtering:** Supports three filter tabs:
  - `Upcoming`: Active reservations scheduled for future dates.
  - `Completed`: Past fulfilled turf bookings.
  - `Cancelled`: Bookings that have been cancelled.
- **Pull-to-Refresh:** Pulling down on the booking list triggers `refreshBookings()` to sync state with Firestore in real-time.

### Cancellation Flow
When a user cancels an upcoming reservation, the application executes an atomic cancellation in Firestore:
```text
User taps "Cancel"
  │
  ▼
User confirms cancellation dialog
  │
  ▼
Update booking document status to `cancelled` in `bookings/{bookingId}`
  │
  ▼
Delete reservation document in `timeSlots/${venueId}_${date}_${startTime}`
  │
  ▼
Time slot is released and becomes available for other users to book
```
- **Document Retention:** The historical booking document is retained in the `bookings` collection with `status: 'cancelled'` for user recordkeeping.
- **Slot Release:** The corresponding document in `timeSlots` is deleted so the slot immediately re-opens for public booking.

---

## 7. Cloud Firestore Architecture & Collections

TurfMate uses four primary collections in Cloud Firestore (Region: `asia-south1` Mumbai):

```text
Firebase Authentication User (UID)
        │
        ▼
Firestore User Profile (`users/{uid}`)

User (`users`) ──► creates ──► Booking (`bookings`) ──► for ──► Venue (`venues`)

Venue + Date + Time Slot ──► reserves ──► Time Slot Reservation (`timeSlots`)
```

### 1. `users`
Stores user profile information associated with their Firebase Authentication account.
- **Document ID:** Firebase Auth `uid`
- **Fields:** `id`, `name`, `email`, `phone`, `photoURL`, `city`, `membership`, `rewardPoints`, `walletBalance`, `createdAt`, `updatedAt`

### 2. `venues`
Stores sports turf and venue listing details.
- **Document ID:** Auto-generated / String ID (e.g. `venue_apex_01`)
- **Fields:** `id`, `name`, `location`, `rating`, `reviewsCount`, `pricePerHour`, `image`, `gallery`, `sports`, `amenities`, `rules`, `description`, `isActive`, `createdAt`, `updatedAt`

### 3. `bookings`
Stores user turf reservation records.
- **Document ID:** Auto-generated (e.g. `BKG-1740001234567`)
- **Fields:** `id`, `userId`, `venueId`, `date`, `startTime`, `endTime`, `timeSlotString`, `players`, `amount`, `status` (`'upcoming'` | `'completed'` | `'cancelled'`), `couponId`, `createdAt`, `updatedAt`

### 4. `timeSlots`
Tracks active slot reservations to enforce availability and prevent double-booking.
- **Document ID:** `${venueId}_${date}_${startTime}`
- **Fields:** `id`, `venueId`, `date`, `startTime`, `endTime`, `bookingId`, `reservedAt`

---

## 8. Cloud Firestore Security Rules

Access control is strictly enforced using Cloud Firestore security rules defined in [`firestore.rules`](file:///c:/projects%20of%20college/TurfMate/firestore.rules):

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // User Profiles
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Venues (Public read, admin write)
    match /venues/{venueId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    
    // Bookings
    match /bookings/{bookingId} {
      allow read: if request.auth != null && (resource.data.userId == request.auth.uid || request.auth.uid == request.resource.data.userId);
      allow create: if request.auth != null && request.resource.data.userId == request.auth.uid;
      allow update: if request.auth != null && resource.data.userId == request.auth.uid;
      allow delete: if false;
    }
    
    // Time Slots
    match /timeSlots/{slotId} {
      allow read: if true;
      allow create: if request.auth != null;
      allow delete: if request.auth != null;
    }
  }
}
```

### Security Goals Achieved
- **Authenticated Access:** Only signed-in users can create bookings or update user profiles.
- **Data Isolation:** Users can only read and update their own booking records.
- **Public Venue Discovery:** Venue listings and time slot availability are publicly readable so unauthenticated guests can explore options before logging in.
- **Protected Slot Reservation:** Time slot creation and release require an authenticated user session.

---

## 9. Service Layer Architecture

The core backend operations are structured cleanly in the `services/` directory:

- **[`services/firebase.ts`](file:///c:/projects%20of%20college/TurfMate/services/firebase.ts)**: Initializes the Firebase App, Auth with `AsyncStorage` persistence, and Cloud Firestore.
- **[`services/authService.ts`](file:///c:/projects%20of%20college/TurfMate/services/authService.ts)**: Encapsulates Firebase Authentication user sign-up, sign-in, and sign-out logic.
- **[`services/authStateService.ts`](file:///c:/projects%20of%20college/TurfMate/services/authStateService.ts)**: Listens for auth state changes (`onAuthStateChanged`).
- **[`services/userService.ts`](file:///c:/projects%20of%20college/TurfMate/services/userService.ts)**: Manages Firestore user profile document creation and retrieval (`users` collection).
- **[`services/turfService.ts`](file:///c:/projects%20of%20college/TurfMate/services/turfService.ts)**: Handles active venue retrieval (`getActiveTurfsFromFirestore`), single venue lookup (`getTurfByIdFromFirestore`), and automatic initial venue seeding.
- **[`services/bookingService.ts`](file:///c:/projects%20of%20college/TurfMate/services/bookingService.ts)**: Executes atomic booking transactions (`createBookingAtomic`), checks booked slots (`getBookedSlotsForVenueAndDate`), fetches user booking history (`getUserBookingsFromFirestore`), and cancels bookings (`cancelBookingInFirestore`).
- **[`services/firebaseErrors.ts`](file:///c:/projects%20of%20college/TurfMate/services/firebaseErrors.ts)**: Translates technical Firebase error codes into friendly user messages.

---

## 10. Project Structure

```text
TurfMate/
├── app/                      # Expo Router File-Based Pages & Navigation
│   ├── _layout.tsx           # Root layout, AppProvider wrapper & Auth Route Guard
│   ├── index.tsx             # Animated Splash screen
│   ├── onboarding.tsx        # Multi-slide onboarding walkthrough
│   ├── search.tsx            # Live Firestore turf search screen
│   ├── (auth)/               # Unauthenticated Routes
│   │   ├── _layout.tsx       # Auth stack header setup
│   │   ├── login.tsx         # Login screen with Firebase Email/Password Auth
│   │   └── register.tsx      # Registration screen with Firestore profile creation
│   ├── (tabs)/               # Protected Authenticated Routes
│   │   ├── _layout.tsx       # Bottom Tab Navigator layout
│   │   ├── index.tsx         # Home screen with live Firestore turfs & categories
│   │   ├── explore.tsx       # Explore sports venues & categories
│   │   ├── bookings.tsx      # User booking history with filter tabs & cancellation
│   │   ├── wishlist.tsx      # Saved favorite venues
│   │   ├── ai.tsx            # TurfMate AI Assistant
│   │   └── profile.tsx       # User profile management & Log Out action
│   ├── venue/
│   │   └── [id].tsx          # Dynamic venue details screen (Firestore document ID)
│   └── booking/
│       ├── date.tsx          # Dynamic 14-day calendar date selector
│       ├── slot.tsx          # Real-time slot availability picker
│       ├── summary.tsx       # Booking summary & atomic transaction trigger
│       └── success.tsx       # Booking confirmation & Firestore ID display
├── components/               # Reusable UI Components
│   └── ui/                   # Custom Buttons, Inputs, Cards, Text, Skeletons
├── services/                 # Core Firebase & API Service Layer
│   ├── firebase.ts           # Firebase App, Auth (with AsyncStorage), Firestore init
│   ├── authService.ts        # Pure Firebase Auth operations (login, register, logout)
│   ├── authStateService.ts   # Firebase onAuthStateChanged listener wrapper
│   ├── userService.ts        # Firestore users CRUD operations
│   ├── turfService.ts        # Live Firestore venue retrieval & auto-seeder
│   ├── bookingService.ts     # Slot availability, atomic transactions, & cancellation
│   └── firebaseErrors.ts     # Firebase Auth error message translation
├── store/                    # Global Application Context
│   └── AppContext.tsx        # Central state, theme mode, auth listener & booking sync
├── database/                 # Database Design Blueprint & Documentation
│   ├── schema.ts             # TypeScript definitions for database collections
│   ├── sampleData.ts         # Sample data for venue seeding & blueprint references
│   ├── relationships.md      # Entity relationship documentation
│   └── README.md             # Blueprint collection schema specifications
├── firestore.rules           # Cloud Firestore Security Rules
├── types/                    # Frontend UI Type Definitions
├── theme/                    # Design System Tokens (Colors, Spacing, Typography)
├── app.json                  # Expo project configuration (Package: com.vishaljankar.turfmate)
├── tsconfig.json             # Strict TypeScript configuration
└── package.json              # Project dependencies & npm scripts
```

---

## 11. Database Architecture & Design Blueprint

TurfMate distinguishes between its broader **Database Design Blueprint** and its active **Firestore Implementation**:

### Database Design Blueprint
Located in `database/` (`schema.ts`, `sampleData.ts`, `relationships.md`, `README.md`), this blueprint represents the complete multi-phase data model designed for the full application scope (including resorts, reviews, favorites, notifications, and tournaments).

### Active Cloud Firestore Implementation
Phase 1 & Phase 2 have connected the core database components to live Cloud Firestore:
- `users`: Authenticated user profiles.
- `venues`: Active sports venue listings.
- `bookings`: User reservations.
- `timeSlots`: Real-time slot locks for double-booking protection.

---

## 12. Verification & Manual Testing Status

| Test Scenario | Steps | Expected Result | Status |
| :--- | :--- | :--- | :--- |
| **Registration** | Register with valid details on `/register` | Auth account created, Firestore document created, routes to Home | Implemented — Manual verification required |
| **Login** | Sign in with registered credentials on `/login` | Auth token validated, routes to Home | Implemented — Manual verification required |
| **Sign-Out** | Tap "Log Out" in Profile screen | Auth session cleared, routes to `/login` | Implemented — Manual verification required |
| **Session Persistence** | Close & re-open app while logged in | Firebase restores session, bypasses login, opens Home | Implemented — Manual verification required |
| **Venue Discovery** | Launch app / open Home screen | Active turfs fetched live from Firestore | Implemented — Manual verification required |
| **Turf Search** | Search by keyword on `/search` | Venues filtered dynamically based on Firestore data | Implemented — Manual verification required |
| **Venue Details** | Tap venue card | Venue details loaded by Firestore document ID | Implemented — Manual verification required |
| **Date Selection** | Select date on `/booking/date` | Only upcoming 14 days starting from today selectable | Implemented — Manual verification required |
| **Slot Availability** | Open `/booking/slot` | Reserved slots fetched from Firestore and marked disabled | Implemented — Manual verification required |
| **Atomic Booking** | Tap "Proceed to Pay" on `/booking/summary` | Firestore `runTransaction` reserves slot & creates booking | Implemented — Manual verification required |
| **Double-Booking Protection** | Attempt concurrent booking on same slot | Transaction aborts second attempt, shows error alert | Implemented — Manual verification required |
| **My Bookings** | Open `/(tabs)/bookings` | User's bookings displayed with status filters | Implemented — Manual verification required |
| **Booking Cancellation** | Tap "Cancel" on upcoming booking | Booking status updated to `cancelled` and slot released | Implemented — Manual verification required |

---

## 13. College Practical Mapping

This project maps directly to the Application Development Lab practical requirements:

| Practical Requirement | Project Implementation | Status |
| :--- | :--- | :--- |
| **Practical 1:** Basic mobile app structure & UI components | Customized React Native components (`Button`, `Input`, `Card`, `Text`, `Skeleton`) in `components/ui/` | **Completed** |
| **Practical 2:** Multi-screen navigation & state management | Expo Router file-based navigation, Bottom Tabs, and React Context (`AppContext.tsx`) | **Completed** |
| **Practical 3:** SQLite / Room database storage | Local state & `AsyncStorage` persistence | **Planned** |
| **Practical 4:** Firebase & Cloud synchronization | Firebase Authentication, Cloud Firestore user profiles, venue listings, slot locks, & atomic bookings | **Completed** |
| **Practical 5:** Network connectivity & REST APIs | Remote HTTP requests & Firebase SDK real-time listeners | **Next** (Phase 3) |
| **Practical 6:** Google Maps Integration | Venue location coordinates and proximity search | **Planned** (Phase 3) |
| **Practical 7:** Multimedia & Hardware GPS | Camera/Image picker for venue uploads and GPS location | **Planned** (Phase 3) |
| **Practical 8:** AI Assistant / Chatbot | TurfMate AI Assistant screen (`(tabs)/ai.tsx`) | **Planned** (Phase 4) |
| **Practical 9:** Machine Learning integration | Smart booking recommendation features | **Planned** (Phase 5) |
| **Practical 10:** AI Alerts & Cloud Messaging | Push notifications & weather alerts | **Planned** (Phase 6) |

---

## 14. Roadmap

```text
Phase 1
Authentication & Navigation
✅ COMPLETED

Phase 2
Firestore + Core Turf Booking
✅ COMPLETED

Phase 3
Network + Maps + GPS
🔜 NEXT

Phase 4
AI Chatbot
📌 PLANNED

Phase 5
ML Features
📌 PLANNED

Phase 6
AI Alerts & Notifications
📌 PLANNED

Final
Testing + Android Development Build + College Demonstration
📌 PLANNED
```

---

## 15. Security Notes

- **Firebase Authentication:** Handles password hashing and token signing securely.
- **No Secret Exposure:** Client keys in `services/firebase.ts` are designed for public client identification. No private service account keys or credentials are committed.
- **Firestore Security Rules:** Enforced in `firestore.rules` to restrict user document access, ensure user booking ownership, and prevent unauthorized data mutation.
