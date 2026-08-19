# TurfMate — Sports Venue & Turf Booking Mobile Application

TurfMate is a cross-platform mobile application designed for discovering, booking, and managing sports turfs, courts, and event venues. Built with modern mobile technologies and Firebase cloud services, TurfMate offers seamless venue exploration, instant slot reservation, and personalized user profile management.

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
  - Turf & Venue discovery interface with mock listings, category filters, and detailed venue information.
  - Dark/Light mode theme toggle and user preferences management.
- **Current Development Status:** **Phase 1 Completed** (Authentication, Persistence, Navigation Guard & Profile Data).

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

## 3. Current Features Completed (Phase 1)

### Authentication & User Profile
- **Email/Password Registration:** Validates input fields (full name, email, phone, minimum 6-character password, password confirmation) and creates user accounts via Firebase Authentication.
- **Cloud Firestore Profile Creation:** Automatically initializes a user profile document in the `users` collection upon successful registration.
- **Firebase Login:** Authenticates existing users with email and password, displaying clear, user-friendly error banners for invalid credentials or missing input.
- **Real-Time Auth Listener:** Centralized `onAuthStateChanged` subscriber in `AppContext.tsx` that synchronizes login state application-wide.
- **Auth Persistence:** Uses `getReactNativePersistence(AsyncStorage)` so authenticated sessions persist across application reloads and device restarts.
- **Auth Loading State:** Displays a themed `ActivityIndicator` while checking initial session restoration, preventing navigation flicker.
- **Protected Routes:** Navigation guard prevents unauthenticated access to main app tabs (`/(tabs)`) and redirects signed-out users to `/(auth)/login`.
- **Firebase Sign-Out:** Securely logs out the user, removes session tokens, and returns to the login screen.
- **Error Handling:** Maps internal Firebase error codes to human-readable error messages using `firebaseErrors.ts`.

> **Note on Google Authentication:** Google Sign-In is not currently implemented in Phase 1 and is planned for a future release stage after core turf booking functionality is completed.

---

## 4. Phase Progress

```text
[Phase 1] Authentication & Navigation ───► COMPLETED
[Phase 2] Firestore & Core Turf Features ──► NEXT
[Phase 3] Network / Maps / GPS ──────────► PLANNED
[Phase 4] AI Chatbot ────────────────────► PLANNED
[Phase 5] ML Features ───────────────────► PLANNED
[Phase 6] AI Alerts & Notifications ─────► PLANNED
[Final]   Android Build & Demo ──────────► PLANNED
```

### Phase 1 — Authentication & Navigation
**Status:** `COMPLETED`
- Firebase Email/Password login
- Registration & Firestore profile creation
- Real-time auth state synchronization
- AsyncStorage persistence
- Protected navigation guard
- Sign-Out functionality
- TypeScript verification (0 errors)

### Phase 2 — Firestore & Core Turf Features
**Status:** `NEXT`
- Live Firestore venue retrieval (`venues` collection)
- Real-time slot availability checking (`timeSlots` collection)
- Booking creation (`bookings` collection)
- User booking history
- Firestore security rules implementation

### Phase 3 — Network / Maps / GPS
**Status:** `PLANNED`
- Integration of Google Maps / Expo Location for turf proximity search
- Distance calculation and GPS navigation to venues

### Phase 4 — AI Chatbot
**Status:** `PLANNED`
- AI assistant tab (`(tabs)/ai.tsx`) integration for turf recommendations and queries

### Phase 5 — ML Features
**Status:** `PLANNED`
- Intelligent booking demand prediction and smart slot recommendations

### Phase 6 — AI Alerts & Notifications
**Status:** `PLANNED`
- Weather-based game alerts and promotional push notifications

### Final Android Build & Demonstration
**Status:** `PLANNED`
- Production standalone Android build using Expo Application Services (EAS) for college lab demonstration.

---

## 5. Firebase Architecture

- **Project Name:** TurfMate
- **Project ID:** `turfmate-b7d1d`
- **Firestore Hosting Region:** `asia-south1` (Mumbai)
- **Services Configured:**
  - Firebase Authentication (Email/Password provider)
  - Cloud Firestore (NoSQL Document Store)
  - Firebase Web SDK (`firebase/app`, `firebase/auth`, `firebase/firestore`, `firebase/storage`)
  - AsyncStorage-based persistence (`getReactNativePersistence`)

---

## 6. Database & Data Architecture Blueprint

The project contains a structured NoSQL database blueprint located in the `database/` directory (`database/README.md`, `database/schema.ts`, `database/relationships.md`).

### Defined Blueprint Collections
1. **`users`**: User identity, contact info, membership level, reward points, and wallet balance.
2. **`venues`**: Turf details, sports available, location coordinates, pricing per hour, facilities, owner ID, and ratings.
3. **`resorts`**: Resort listings with night stay pricing, location, and amenities.
4. **`bookings`**: Active/past reservations linking `userId`, `venueId`, selected time slot, payment status, and booking status.
5. **`timeSlots`**: Venue slot schedules (`available`, `booked`, `blocked`).
6. **`favorites`**: Saved venues linked by `userId` and `venueId`.
7. **`reviews`**: User ratings, comments, and venue feedback.
8. **`notifications`**: System, offer, and booking status alerts for users.
9. **`tournaments`**: Local sports tournaments, entry fees, prize pools, and team registrations.

### Entity Relationships
```text
User
 |
 +---- makes --------> Booking --------> Venue
 |
 +---- saves --------> Favorite -------> Venue
 |
 +---- writes -------> Review ---------> Venue
 |
 +---- receives -----> Notification

Venue
 |
 +---- has ----------> Time Slots
 |
 +---- receives -----> Bookings
 |
 +---- receives -----> Reviews
```

*Implementation Status:* The `users` collection is live in Firestore for user profile creation upon registration. Other collections currently exist as TypeScript schema definitions and mock datasets, scheduled for live Firestore integration in Phase 2.

---

## 7. Firestore User Profile Data Model

When a user registers, Firebase Authentication generates a unique `uid`. TurfMate uses this `uid` as the document ID in the Firestore `users` collection:

```text
Firebase Authentication (UID)
        │
        ▼
Cloud Firestore Document: users/{uid}
        │
        ├── id: string (same as UID)
        ├── name: string
        ├── email: string
        ├── phone: string
        ├── photoURL: string | null
        ├── city: string
        ├── membership: "free" | "plus"
        ├── rewardPoints: number
        └── walletBalance: number
```

---

## 8. Project Structure

```text
TurfMate/
├── app/                      # Expo Router File-Based Pages & Navigation
│   ├── _layout.tsx           # Root layout, AppProvider wrapper & Auth Route Guard
│   ├── index.tsx             # Animated Splash screen
│   ├── onboarding.tsx        # Multi-slide onboarding walkthrough
│   ├── (auth)/               # Unauthenticated Authentication Routes
│   │   ├── _layout.tsx       # Auth stack header setup
│   │   ├── login.tsx         # Login screen with Firebase Email/Password Auth
│   │   └── register.tsx      # Registration screen with Firestore profile creation
│   └── (tabs)/               # Protected Authenticated Application Routes
│       ├── _layout.tsx       # Bottom Tab Navigator layout
│       ├── index.tsx         # Home screen with featured turfs & categories
│       ├── explore.tsx       # Search & explore sports venues
│       ├── bookings.tsx      # User booking history
│       ├── wishlist.tsx      # Saved favorite venues
│       ├── ai.tsx            # TurfMate AI Assistant
│       └── profile.tsx       # User profile management & Log Out action
├── components/               # Reusable UI Components
│   └── ui/                   # Custom Buttons, Inputs, Cards, Text, Skeletons
├── services/                 # Core Firebase & API Service Layer
│   ├── firebase.ts           # Firebase App, Auth (with AsyncStorage), Firestore init
│   ├── authService.ts        # Pure Firebase Auth operations (login, register, logout)
│   ├── authStateService.ts   # Firebase onAuthStateChanged listener wrapper
│   ├── userService.ts        # Firestore users CRUD operations
│   └── firebaseErrors.ts     # Firebase Auth error message translation
├── store/                    # Global Application Context
│   └── AppContext.tsx        # Central state, theme mode, auth listener & profile state
├── database/                 # Firestore Database Design Blueprint
│   ├── schema.ts             # TypeScript definitions for database collections
│   ├── sampleData.ts         # Mock data for venue & booking UI rendering
│   ├── relationships.md      # Entity relationship documentation
│   └── README.md             # Collection schema specifications
├── types/                    # Frontend UI Type Definitions
├── theme/                    # Design System Token Definitions (Colors, Spacing, Typography)
├── constants/                # App constants
├── hooks/                    # Custom React hooks
├── assets/                   # App icons, splash images, and visual assets
├── app.json                  # Expo project configuration (Package name: com.vishaljankar.turfmate)
├── tsconfig.json             # Strict TypeScript configuration
└── package.json              # Project dependencies & npm scripts
```

---

## 9. Authentication & Navigation Flow

### Registration Flow
```text
User fills form
   │
   ▼
registerUser(email, password)
   │
   ▼
Firebase Authentication creates account
   │
   ▼
createUserProfile(uid, profileData)
   │
   ▼
Firestore creates document: users/{uid}
   │
   ▼
onAuthStateChanged listener fires
   │
   ▼
AppContext updates user state
   │
   ▼
RootNavigation redirects to /(tabs) (Home)
```

### Login & Session Persistence Flow
```text
App Launch / Reload
   │
   ▼
AppContext initializes (authLoading = true)
   │
   ▼
RootNavigation displays themed Loading Indicator
   │
   ▼
Firebase SDK restores session from AsyncStorage
   │
   ▼
onAuthStateChanged receives User
   │
   ├─ User Logged In  ──► Fetch profile from Firestore ──► Route to /(tabs)
   └─ User Logged Out ──► Set user = null              ──► Route to /(auth)/login
```

---

## 10. Development Environment

- **Primary Framework:** Expo SDK 54 with Expo Go on physical mobile devices.
- **IDE:** Visual Studio Code.
- **Language Mode:** Strict TypeScript (`tsconfig.json` with `"strict": true`).
- **Target OS Build:** Android Application ID configured as `com.vishaljankar.turfmate` for future Android development builds.

---

## 11. Installation & Running

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Vishalj154/Turfmate.git
   cd TurfMate
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the Expo development server:**
   ```bash
   npx expo start
   ```

4. **Run on mobile device:**
   - Install **Expo Go** from Google Play Store or Apple App Store.
   - Scan the QR code displayed in the terminal output.

---

## 12. Verification & Manual Testing Status

| Test Scenario | Steps | Expected Result | Status |
| :--- | :--- | :--- | :--- |
| **Registration** | Register with valid details on `/register` | Auth account created, Firestore document created, routes to Home | Implemented — Manual verification required |
| **Login** | Sign in with registered credentials on `/login` | Auth token validated, routes to Home | Implemented — Manual verification required |
| **Sign-Out** | Tap "Log Out" in Profile screen | Auth session cleared, routes to `/login` | Implemented — Manual verification required |
| **Session Persistence** | Close & re-open app while logged in | Firebase restores session, bypasses login, opens Home | Implemented — Manual verification required |
| **Sign-Out Persistence** | Close & re-open app after sign-out | Opens directly to `/login` | Implemented — Manual verification required |
| **Invalid Credentials** | Enter incorrect password | Friendly error banner displayed | Implemented — Manual verification required |
| **Input Validation** | Submit empty form | Client-side validation message shown | Implemented — Manual verification required |
| **Route Protection** | Attempt to navigate to `/(tabs)` while logged out | Automatically redirected to `/(auth)/login` | Implemented — Manual verification required |

---

## 13. College Practical Mapping

This project maps directly to the Application Development Lab practical requirements:

| Practical Requirement | Project Implementation | Status |
| :--- | :--- | :--- |
| **Practical 1:** Basic mobile app structure & UI components | Customized React Native components (`Button`, `Input`, `Card`, `Text`, `Skeleton`) in `components/ui/` | **Completed** |
| **Practical 2:** Multi-screen navigation & state management | Expo Router file-based navigation, Bottom Tabs, and React Context (`AppContext.tsx`) | **Completed** |
| **Practical 3:** SQLite / Room database storage | Local state & `AsyncStorage` persistence | **Planned** |
| **Practical 4:** Firebase & Cloud synchronization | Firebase Authentication & Cloud Firestore user profile synchronization | **Completed** (Auth & User Profile foundation) |
| **Practical 5:** Network connectivity & REST APIs | Remote HTTP requests & Firebase SDK real-time listeners | **In Progress** |
| **Practical 6:** Google Maps Integration | Venue location coordinates and proximity search | **Planned** (Phase 3) |
| **Practical 7:** Multimedia & Hardware GPS | Camera/Image picker for venue uploads and GPS location | **Planned** (Phase 3) |
| **Practical 8:** AI Assistant / Chatbot | TurfMate AI Assistant screen (`(tabs)/ai.tsx`) | **Planned** (Phase 4) |
| **Practical 9:** Machine Learning integration | Smart booking recommendation features | **Planned** (Phase 5) |
| **Practical 10:** AI Alerts & Cloud Messaging | Push notifications & weather alerts | **Planned** (Phase 6) |

---

## 14. Security Notes

- **Firebase Authentication:** Handles password encryption, hashing, and token signing. Passwords are never stored locally or transmitted in plaintext.
- **No Secret Exposure:** Firebase web client keys in `services/firebase.ts` are designed for public client application identification. No private server keys, service account credentials, or OAuth secrets are committed.
- **Firestore Security Rules:** Must be enforced on the Firebase console to restrict `users/{uid}` read/write permissions strictly to the owner.

---

## 15. Future Roadmap

- 🟢 **Phase 1 (Completed):** Firebase Email/Password Auth, Session Persistence, Route Protection, Profile Creation.
- 🟡 **Phase 2 (Next):** Live Firestore venue listings, real-time booking slot reservation, user booking history.
- 🔵 **Phase 3 (Planned):** Google Maps integration, GPS location search, proximity distance calculation.
- 🟣 **Phase 4 (Planned):** AI TurfMate Chatbot assistant integration.
- 🔴 **Phase 5 (Planned):** Smart Machine Learning slot recommendations.
- 🟤 **Phase 6 (Planned):** AI-driven push notifications and weather alerts.
- ⚪ **Final (Planned):** Standalone Android development build and college lab demonstration.
