// Temporary Timestamp type to be replaced by Firebase Timestamp later
export type Timestamp = number;

export type MembershipType = "free" | "plus";
export type VenueType = "turf" | "court" | "sports_venue" | "event_venue";
export type BookingStatus = "pending" | "confirmed" | "completed" | "cancelled";
export type PaymentStatus = "pending" | "paid" | "failed" | "refunded";
export type TimeSlotStatus = "available" | "booked" | "blocked";
export type NotificationType = "booking" | "offer" | "tournament" | "system";
export type TournamentStatus = "upcoming" | "ongoing" | "completed";

export interface VenueLocation {
  city: string;
  area: string;
  latitude: number;
  longitude: number;
}

export interface User {
  id: string; // Same as Firebase Auth UID
  name: string;
  email: string;
  phone: string;
  photoURL: string | null;
  city: string;
  membership: MembershipType;
  rewardPoints: number;
  walletBalance: number;
  createdAt: Timestamp;
}

export interface Venue {
  id: string;
  name: string;
  type: VenueType;
  sports: string[]; // e.g., ["Cricket", "Football", "Box Cricket", "Badminton"]
  location: VenueLocation;
  address: string;
  images: string[];
  rating: number;
  reviewCount: number;
  pricePerHour: number;
  facilities: string[];
  description: string;
  ownerId: string;
  isActive: boolean;
  createdAt: Timestamp;
}

export interface Resort {
  id: string;
  name: string;
  location: VenueLocation;
  address: string;
  images: string[];
  rating: number;
  reviewCount: number;
  pricePerNight: number;
  amenities: string[];
  description: string;
  ownerId: string;
  isActive: boolean;
  createdAt: Timestamp;
}

export interface Booking {
  id: string;
  userId: string; // booking.userId -> users/{userId}
  venueId: string;  // booking.venueId -> venues/{venueId}
  date: string;
  startTime: string;
  endTime: string;
  players: number;
  amount: number;
  paymentStatus: PaymentStatus;
  bookingStatus: BookingStatus;
  couponId: string | null;
  createdAt: Timestamp;
}

export interface TimeSlot {
  id: string;
  venueId: string; // timeSlot.venueId -> venues/{venueId}
  date: string;
  startTime: string;
  endTime: string;
  status: TimeSlotStatus;
  bookingId: string | null; // timeSlot.bookingId -> bookings/{bookingId}
}

export interface Favorite {
  id: string;
  userId: string; // favorite.userId -> users/{userId}
  venueId: string; // favorite.venueId -> venues/{venueId}
  createdAt: Timestamp;
}

export interface Review {
  id: string;
  userId: string; // review.userId -> users/{userId}
  venueId: string; // review.venueId -> venues/{venueId}
  rating: number;
  comment: string;
  userName: string;
  userPhoto: string | null;
  createdAt: Timestamp;
}

export interface Notification {
  id: string;
  userId: string; // notification.userId -> users/{userId}
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  createdAt: Timestamp;
}

export interface Tournament {
  id: string;
  name: string;
  sport: string;
  location: string;
  date: string;
  entryFee: number;
  prizePool: number;
  maxTeams: number;
  registeredTeams: number;
  image: string;
  status: TournamentStatus;
  createdAt: Timestamp;
}
