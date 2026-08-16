# TurfMate Database Design

**Database:** Firebase Cloud Firestore
**Database Type:** NoSQL Document Database
**Status:** Design Phase / Firebase integration pending

## Why Firestore?
- Natural Firebase integration
- Good React Native/Expo support
- Realtime data updates
- Scalable document-based structure
- Firebase Authentication integration
- Useful for booking applications
- Can later integrate Firebase Storage and Cloud Functions

*Note: The files in this directory represent the database blueprint. Actual data will later be stored in Cloud Firestore.*

## Collections

### `users`
**Document ID:** `userId`

**Fields:**
- `id`: string
- `name`: string
- `email`: string
- `phone`: string
- `photoURL`: string | null
- `city`: string
- `membership`: "free" | "plus"
- `rewardPoints`: number
- `walletBalance`: number
- `createdAt`: timestamp

*Explanation: Firebase Authentication will provide the UID and the Firestore user document should use the same UID as its document ID.*

### `venues`
**Document ID:** `venueId`

**Fields:**
- `id`: string
- `name`: string
- `type`: "turf" | "court" | "sports_venue" | "event_venue"
- `sports`: string[] (Can contain: Cricket, Football, Box Cricket, Badminton, Tennis, Basketball, Volleyball, Swimming)
- `location`: { city: string, area: string, latitude: number, longitude: number }
- `address`: string
- `images`: string[]
- `rating`: number
- `reviewCount`: number
- `pricePerHour`: number
- `facilities`: string[]
- `description`: string
- `ownerId`: string
- `isActive`: boolean
- `createdAt`: timestamp

### `resorts`
**Document ID:** `resortId`

**Fields:**
- `id`: string
- `name`: string
- `location`: { city: string, area: string, latitude: number, longitude: number }
- `address`: string
- `images`: string[]
- `rating`: number
- `reviewCount`: number
- `pricePerNight`: number
- `amenities`: string[]
- `description`: string
- `ownerId`: string
- `isActive`: boolean
- `createdAt`: timestamp

### `bookings`
**Document ID:** `bookingId`

**Fields:**
- `id`: string
- `userId`: string
- `venueId`: string
- `date`: string
- `startTime`: string
- `endTime`: string
- `players`: number
- `amount`: number
- `paymentStatus`: "pending" | "paid" | "failed" | "refunded"
- `bookingStatus`: "pending" | "confirmed" | "completed" | "cancelled"
- `couponId`: string | null
- `createdAt`: timestamp

*Explanation: `userId` references `users/{userId}` and `venueId` references `venues/{venueId}`.*

### `timeSlots`
**Document ID:** Auto-generated

**Fields:**
- `id`: string
- `venueId`: string
- `date`: string
- `startTime`: string
- `endTime`: string
- `status`: "available" | "booked" | "blocked"
- `bookingId`: string | null

*IMPORTANT: Frontend availability checks alone are NOT sufficient. Later, booking creation must use a Firestore transaction or secure server-side Cloud Function to prevent two users from booking the same venue/time slot simultaneously. Do not implement that logic now.*

### `favorites`
**Document ID:** Auto-generated

**Fields:**
- `id`: string
- `userId`: string
- `venueId`: string
- `createdAt`: timestamp

*Relationships: `userId` -> `users`, `venueId` -> `venues`*

### `reviews`
**Document ID:** Auto-generated

**Fields:**
- `id`: string
- `userId`: string
- `venueId`: string
- `rating`: number
- `comment`: string
- `userName`: string
- `userPhoto`: string | null
- `createdAt`: timestamp

### `notifications`
**Document ID:** Auto-generated

**Fields:**
- `id`: string
- `userId`: string
- `title`: string
- `message`: string
- `type`: "booking" | "offer" | "tournament" | "system"
- `isRead`: boolean
- `createdAt`: timestamp

### `tournaments`
**Document ID:** Auto-generated

**Fields:**
- `id`: string
- `name`: string
- `sport`: string
- `location`: string
- `date`: string
- `entryFee`: number
- `prizePool`: number
- `maxTeams`: number
- `registeredTeams`: number
- `image`: string
- `status`: "upcoming" | "ongoing" | "completed"
- `createdAt`: timestamp

## Future Collections
- **events**: Special sporting events, marathons, or meetups.
- **coupons**: Discount codes and promotional offers.
- **rewards**: Gamification milestones and loyalty program data.
- **walletTransactions**: Tracking wallet deposits, deductions, and refunds.
- **aiConversations**: Storing chat history for the AI assistant feature.
