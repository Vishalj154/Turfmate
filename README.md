# TurfMate — Sports Venue & Turf Booking Mobile Application

TurfMate is a modern, cross-platform mobile application designed for discovering, checking real-time slot availability, and booking sports turfs, courts, and venues. Built with React Native, Expo SDK 54, TypeScript, and Firebase cloud services, TurfMate offers live venue exploration, interactive Google Maps turf visualization, atomic double-booking protection, ephemeral GPS proximity calculation, offline network status detection, and a comprehensive user profile support suite.

This project is developed as part of an Application Development Lab curriculum.

> **Current Status: Phase 3 Complete — Core TurfMate functionality is implemented and the app is currently moving toward advanced features and final stabilization.**

---

## 1. Executive Summary & Status Overview

### Status Dashboard

| Phase / Feature Area | Status | Description |
| :--- | :---: | :--- |
| **Phase 1 — Auth & Navigation** | ✅ Completed | Firebase Auth, session persistence, protected routes, profile loading |
| **Phase 2 — Firestore & Booking** | ✅ Completed | Live Firestore venues, 14-day date picker, time slots, atomic transaction double-booking protection, QR codes, cancellations |
| **Phase 3 — Network, GPS, Maps & Distance** | ✅ Completed | Offline NetInfo banner, Expo Location GPS, `react-native-maps` interactive turf map, Haversine distance, nearest-first sorting |
| **Google Maps Standalone Android Config** | 🟡 Pending | Map operates in Expo Go; Google Maps API key setup for standalone APK/AAB builds planned |
| **Post-Phase 3 Advanced Roadmap** | 🔵 Planned | Real payment gateway, push notifications, owner admin dashboard, reviews & ratings |

---

## 2. Main User Flow

```text
Login / Register
   │
   ▼
Home Screen (Live Turfs & GPS Distance) ◄───────► Interactive Map View (/map)
   │                                                     │
   ▼                                                     ▼
Discover / Search Turfs (/search) ────────────────► View Turf Details (/venue/[id])
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

## 3. Technology Stack

The exact package versions installed and used in the TurfMate project (from `package.json`):

| Technology | Version | Purpose |
| :--- | :--- | :--- |
| **Expo SDK** | `~54.0.35` | Universal React Native app development framework |
| **React Native** | `0.81.5` | Mobile native component runtime |
| **React** | `19.1.0` | UI rendering & component state management |
| **TypeScript** | `~5.9.2` | Strict type-safe application development |
| **Firebase SDK** | `^12.17.1` | Authentication & Cloud Firestore database backend |
| **Expo Router** | `~6.0.24` | File-based navigation & deep linking framework |
| **React Native Maps** | `^1.20.1` | Native Google Maps interactive map engine & markers |
| **Async Storage** | `2.2.0` | Local persistent key-value storage for Auth sessions |
| **NetInfo** | `11.4.1` | Native network connectivity monitoring |
| **Expo Location** | `~19.0.8` | Device GPS permissions & coordinate retrieval |
| **Safe Area Context** | `~5.6.0` | Inset management for status bars, camera cutouts & notches |
| **React Navigation** | `^7.1.8` | Core routing utilities (`@react-navigation/native`) |
| **Bottom Tabs** | `^7.4.0` | Bottom navigation tab bar (`@react-navigation/bottom-tabs`) |
| **Expo Vector Icons** | `^15.0.3` | Icon set icons (`Ionicons`) |
| **Reanimated** | `~4.1.1` | Native animation engine (`react-native-reanimated`) |

---

## 4. Completed Implementation Phases

### Phase 1 — Authentication & Navigation ✅

- [x] **Firebase Email & Password Auth:** Sign up (`/register`) and log in (`/login`) with credential validation and translated user-friendly error messages.
- [x] **Persistent Auth Session:** Uses `@react-native-async-storage/async-storage` with Firebase `reactNativePersistence` so user sessions persist across application restarts.
- [x] **Auth State Listener:** `onAuthStateChanged` automatically detects login state changes and updates global user context.
- [x] **Protected Navigation Guard:** `_layout.tsx` enforces authentication route guards, redirecting unauthenticated users to the login screen.
- [x] **Firestore User Profiles:** Automatic profile document creation in the `users` collection upon registration.
- [x] **Auth Loading State:** Displays smooth splash loading state while verifying persistent session tokens.
- [x] **Sign-Out:** Instant token invalidation and redirection to sign-in.
- [x] **Google Sign-In Postponement:** Google Sign-In is intentionally postponed to a post-Phase 3 update.

---

### Phase 2 — Firestore & Booking System ✅

- [x] **Firestore Turf/Venue Data:** Live venue retrieval from Cloud Firestore (`venues` collection).
- [x] **Turf Discovery & Search:** Search live venues by name and location on `/search`.
- [x] **Venue Details:** View image galleries, amenities, hourly pricing, ratings, location details, and sport rules on `/venue/[id]`.
- [x] **Dynamic 14-Day Date Selection:** Select booking dates strictly starting from today (`new Date()`) up to 14 days ahead on `/booking/date`.
- [x] **Real-Time Slot Availability & Detection:** Renders Morning (06:00 AM - 11:00 AM) and Evening (05:00 PM - 10:00 PM) slot cards on `/booking/slot`. Queries `timeSlots` collection and disables already-booked slots.
- [x] **Atomic Firestore Booking:** Confirm bookings atomically via Cloud Firestore transactions (`runTransaction`).
- [x] **Double-Booking Prevention:** Deterministic slot locking key (`${venueId}_${date}_${startTime}`) prevents concurrent double-bookings even when milliseconds apart.
- [x] **Booking Confirmation & QR Code:** Displays generated Booking ID (`BKG-...`), reservation overview, and entry QR code on `/booking/success`.
- [x] **My Bookings Dashboard:** View upcoming, completed, and cancelled reservations on `/(tabs)/bookings` with pull-to-refresh.
- [x] **Booking Cancellation:** Cancelling an upcoming reservation updates the booking status to `cancelled` and releases the time slot document lock.
- [x] **Booking Details:** Standalone `/booking/detail` view showing entry QR code, venue info, and cancellation controls.
- [x] **Book Again Feature:** Tapping "Book Again" from booking details navigates directly back to venue date selection.

---

### Phase 3 — Network, GPS, Maps & Distance ✅

The Phase 3 implementation is **fully complete** and has been validated in Expo Go on physical Android devices.

#### Network & Connectivity ✅
- **Online/Offline Connectivity Detection:** Real-time monitoring powered by `@react-native-community/netinfo` (`useNetworkStatus`).
- **Safe-Area Aware Offline Banner:** `OfflineBanner.tsx` positions cleanly below camera cutouts and status bars using `useSafeAreaInsets()`.
- **Firestore/Network Error Handling:** Graceful error messages and retry prompts during connectivity interruptions.

#### GPS & Location Services ✅
- **Location Permission Request:** Prompts for device GPS permissions via `expo-location` (`useUserLocation`).
- **Current Device Coordinates:** Obtains live latitude and longitude.
- **Permission-Denied Fallback:** Defaults gracefully to standard venue sorting if location permissions are denied.
- **Service Reuse:** Fully reuses the existing background location service layer without duplicating logic.

#### Interactive Maps (`react-native-maps`) ✅
- **Interactive Turf Map (`app/map.tsx`):** Dedicated full-screen interactive map view powered by `react-native-maps`.
- **Firestore Coordinates:** Renders dynamic turf markers using coordinates stored in Firestore venue documents.
- **Custom Turf Markers & Selection:** Custom-styled map pins with scale animation on selection.
- **Turf Information Card:** Floating info card displaying venue photo, title, location, hourly rate, live distance, and navigation button.
- **Marker → Venue Details Navigation:** Tapping the info card navigates directly to `/venue/[id]`.
- **Venue Details → Interactive Map Navigation:** Tapping "View on Interactive Map" in venue details deep-links directly to `/map` centered on the specific venue.
- **Focused Map Centering:** Automatically centers the map region based on route params (selected venue), device GPS, or default fallback.
- **Recenter Control:** Floating GPS recenter button to re-focus the map on the user's current location.

#### Distance Calculation & Discovery ✅
- **Haversine Distance Formula:** Calculates straight-line distance (in km) between user GPS coordinates and venue coordinates (`locationService.ts`).
- **Approximate Distance Display:** Displays live distance badges on venue cards (e.g. `2.4 km away`).
- **Nearby Turf Discovery:** Highlights nearby sports venues based on proximity.
- **Nearest-First Sorting:** One-tap home screen toggle to sort venues by distance.

---

## 5. Map Android Configuration — Pending Note

> ⚠️ **Important Configuration Note for Standalone Builds:**
> * The interactive Map View is **100% complete** and fully operational when running inside **Expo Go**.
> * Additional Google Maps API key configuration in `app.json` (under `expo.android.config.googleMaps.apiKey`) is required for building standalone Android binaries (`.apk` / `.aab`).
> * Google Cloud Console Maps SDK credentials will be configured during the final Android production build phase.
> * This pending build task does **not** affect Phase 3 completion—the mapping feature, marker rendering, deep-linking, and GPS integrations are complete.

---

## 6. Testing & Validation Status

The application features have been thoroughly tested on a physical Android smartphone using Expo Go:

- [x] **Interactive Map Rendering:** Map loads smoothly with interactive pan/zoom controls.
- [x] **Turf Markers:** All Firestore venue coordinates render accurate pins on the map.
- [x] **Marker Navigation:** Tapping markers displays venue info cards and opens the correct venue detail page.
- [x] **Deep Linking:** Tapping "View on Interactive Map" from a venue detail page centers the map exactly on that venue.
- [x] **Distance Calculation:** Live Haversine distance badges update accurately based on device GPS.
- [x] **Offline Network Handling:** Toggling airplane mode displays the safe-area offline banner; reconnecting restores live network state.
- [x] **Atomic Transactions:** Simultaneous slot booking tests confirmed zero double-booking occurrences.
- [x] **TypeScript Validation:** Verified cleanly with zero errors:
  ```bash
  npx tsc --noEmit
  ```

---

## 7. Database Architecture & Firestore Security

### Firestore Collections Overview

```text
User (`users`) ──► creates ──► Booking (`bookings`) ──► for ──► Venue (`venues`)
                                   │
                                   ▼
                    Time Slot Lock (`timeSlots`)
```

1. **`users`**: Profile documents (`id`, `name`, `email`, `phone`, `isVerified`, `rewardPoints`, `createdAt`).
2. **`venues`**: Sports venue listings (`id`, `name`, `location`, `rating`, `reviewsCount`, `pricePerHour`, `image`, `gallery`, `sports`, `amenities`, `rules`, `latitude`, `longitude`).
3. **`bookings`**: Reservation documents (`id`, `userId`, `venueId`, `date`, `startTime`, `endTime`, `timeSlot`, `players`, `amount`, `paymentStatus`, `bookingStatus`, `createdAt`).
4. **`timeSlots`**: Atomic slot locks (`${venueId}_${date}_${startTime}`).

### Cloud Firestore Security Rules (`firestore.rules`)

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    match /venues/{venueId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == resource.data.ownerId;
    }
    match /bookings/{bookingId} {
      allow read: if request.auth != null && resource.data.userId == request.auth.uid;
      allow create: if request.auth != null && request.resource.data.userId == request.auth.uid;
      allow update, delete: if request.auth != null && resource.data.userId == request.auth.uid;
    }
    match /timeSlots/{slotId} {
      allow read: if request.auth != null;
      allow create, update: if request.auth != null;
    }
  }
}
```

---

## 8. Navigation & Project Structure

```text
TurfMate/
├── app/                      # Expo Router screens & navigation
│   ├── _layout.tsx           # Root layout, Auth guard & theme provider
│   ├── index.tsx             # Splash screen
│   ├── onboarding.tsx        # Onboarding flow
│   ├── search.tsx            # Live Firestore venue search
│   ├── map.tsx               # Phase 3 Interactive Google Maps view
│   ├── settings.tsx          # Settings screen
│   ├── support.tsx           # Support & FAQ screen
│   ├── terms.tsx             # Terms & Conditions
│   ├── privacy.tsx           # Privacy Policy
│   ├── about.tsx             # About TurfMate
│   ├── (auth)/               # Unauthenticated Auth stack (login, register)
│   ├── (tabs)/               # Authenticated Tab Bar (home, explore, bookings, wishlist, ai, profile)
│   ├── venue/[id].tsx        # Venue details & Map deep link
│   └── booking/              # Booking flow (date, slot, summary, success, detail)
├── components/               # UI component library & OfflineBanner
├── services/                 # Firebase, Auth, Firestore, Turf, Booking, Location & Error services
├── hooks/                    # Custom hooks (useUserLocation, useNetworkStatus)
├── store/                    # Global AppContext state manager
├── theme/                    # Design system tokens (Colors, Spacing, Typography)
├── firestore.rules           # Cloud Firestore Security Rules
├── app.json                  # Expo configuration
├── tsconfig.json             # TypeScript config
└── package.json              # Project dependencies & scripts
```

---

## 9. Next Planned Features (Roadmap)

The following features are planned for post-Phase 3 development iterations:

- 🔵 **Real Payment Gateway Integration:** Integration of Razorpay / Stripe SDKs to replace simulated checkout.
- 🔵 **Push Notifications & Booking Reminders:** Firebase Cloud Messaging (FCM) alerts for upcoming reservations.
- 🔵 **Turf Owner & Admin Dashboard:** Web/mobile portal for venue owners to manage turf listings and availability schedules.
- 🔵 **Wishlist & Favorites Persistence:** Cloud Firestore synchronization for saved turfs.
- 🔵 **User Reviews & Ratings:** Capability for users to leave ratings and text reviews after completing a booking.
- 🔵 **Google Sign-In:** Firebase OAuth Google Sign-In integration.
- 🔵 **Enhanced Reverse Geocoding:** Human-readable street and neighborhood location names for GPS coordinates.
- 🔵 **Standalone Android Build (`.apk` / `.aab`):** EAS Build pipeline setup and physical APK device testing.
- 🔵 **Google Maps Android API Credentials:** Production Google Cloud API key configuration in `app.json`.

---

## 10. Production Preparation Checklist

Tasks scheduled prior to final deployment and demonstration:

- [ ] **Firebase Security Rules Audit:** Final review of Firestore rules and index optimizations.
- [ ] **Data Cleanup:** Removal of test/demo booking documents from Firestore production database.
- [ ] **Production Firebase Config:** Environment variable setup for production Firebase credentials.
- [ ] **Error Handling Audit:** Final review of edge-case error boundaries and offline fallback prompts.
- [ ] **Branding Assets:** Finalizing high-resolution app icon, adaptive icon, and splash screen graphics.
- [ ] **Google Maps Android Config:** Adding Google Cloud Maps API key to `app.json` for standalone builds.
- [ ] **Android APK/AAB Build:** Generating release binaries via Expo Application Services (EAS Build).
- [ ] **Android Device Testing:** Testing generated standalone APK across multiple physical Android OS versions.
- [ ] **GitHub Cleanup:** Cleaning up git history, unused assets, and temporary documentation notes.
- [ ] **Final Documentation:** Completing submission documentation and user guide.
- [ ] **College Project Demo Prep:** Preparing live demonstration script and test data presets.

---

## 11. Application Version & License

- **Version:** `1.0.0` (as configured in `package.json` and `app.json`, displayed in application UI as **TurfMate v1.0.0**).
- **License:** Open for academic and application development lab demonstration purposes.
