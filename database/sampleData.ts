import {
  User, Venue, Resort, Booking, TimeSlot, Favorite, Review, Notification, Tournament
} from './schema';

const now = Date.now();

export const sampleUsers: User[] = [
  {
    id: "user_101",
    name: "Rahul Sharma",
    email: "rahul.s@example.com",
    phone: "+919876543210",
    photoURL: "https://example.com/profiles/rahul.jpg",
    city: "Navi Mumbai",
    membership: "plus",
    rewardPoints: 250,
    walletBalance: 1500,
    createdAt: now - 86400000 * 30 // 30 days ago
  },
  {
    id: "user_102",
    name: "Priya Patel",
    email: "priya.p@example.com",
    phone: "+919988776655",
    photoURL: null,
    city: "Mumbai",
    membership: "free",
    rewardPoints: 50,
    walletBalance: 0,
    createdAt: now - 86400000 * 10
  }
];

export const sampleVenues: Venue[] = [
  {
    id: "venue_001",
    name: "Vashi Sports Arena",
    type: "turf",
    sports: ["Football", "Box Cricket"],
    location: {
      city: "Navi Mumbai",
      area: "Vashi",
      latitude: 19.077065,
      longitude: 72.998993
    },
    address: "Sector 17, Vashi, Navi Mumbai, Maharashtra 400703",
    images: ["https://example.com/vashi1.jpg"],
    rating: 4.8,
    reviewCount: 124,
    pricePerHour: 1200,
    facilities: ["Parking", "Washrooms", "Floodlights"],
    description: "Premium FIFA-certified astroturf for 5v5 football and box cricket.",
    ownerId: "owner_001",
    isActive: true,
    createdAt: now - 86400000 * 100
  },
  {
    id: "venue_002",
    name: "Thane Smashers Badminton Court",
    type: "court",
    sports: ["Badminton"],
    location: {
      city: "Thane",
      area: "Majiwada",
      latitude: 19.218330,
      longitude: 72.978088
    },
    address: "Majiwada Junction, Thane West, Maharashtra 400601",
    images: ["https://example.com/thane1.jpg"],
    rating: 4.5,
    reviewCount: 89,
    pricePerHour: 400,
    facilities: ["Air Conditioned", "Changing Rooms", "Gear Rental"],
    description: "Indoor synthetic courts perfect for professional and casual play.",
    ownerId: "owner_002",
    isActive: true,
    createdAt: now - 86400000 * 200
  },
  {
    id: "venue_003",
    name: "Andheri Sports Complex",
    type: "sports_venue",
    sports: ["Tennis", "Basketball", "Swimming"],
    location: {
      city: "Mumbai",
      area: "Andheri West",
      latitude: 19.113645,
      longitude: 72.869734
    },
    address: "Veera Desai Road, Andheri West, Mumbai, Maharashtra 400058",
    images: ["https://example.com/andheri1.jpg"],
    rating: 4.2,
    reviewCount: 300,
    pricePerHour: 800,
    facilities: ["Parking", "Cafe", "Locker Rooms"],
    description: "A complete sports complex with swimming pool, tennis and basketball courts.",
    ownerId: "owner_003",
    isActive: true,
    createdAt: now - 86400000 * 300
  }
];

export const sampleResorts: Resort[] = [
  {
    id: "resort_001",
    name: "Lonavala Weekend Getaway",
    location: {
      city: "Lonavala",
      area: "Khandala",
      latitude: 18.748060,
      longitude: 73.407222
    },
    address: "Old Mumbai-Pune Highway, Khandala",
    images: ["https://example.com/resort1.jpg"],
    rating: 4.7,
    reviewCount: 450,
    pricePerNight: 5500,
    amenities: ["Swimming Pool", "Spa", "Free WiFi", "Breakfast Included"],
    description: "Luxury resort perfect for corporate outings and weekend sports retreats.",
    ownerId: "owner_004",
    isActive: true,
    createdAt: now - 86400000 * 150
  }
];

export const sampleBookings: Booking[] = [
  {
    id: "book_xyz123",
    userId: "user_101",
    venueId: "venue_001",
    date: "2026-08-20",
    startTime: "18:00",
    endTime: "19:00",
    players: 10,
    amount: 1200,
    paymentStatus: "paid",
    bookingStatus: "confirmed",
    couponId: null,
    createdAt: now
  },
  {
    id: "book_abc456",
    userId: "user_102",
    venueId: "venue_002",
    date: "2026-08-21",
    startTime: "10:00",
    endTime: "11:00",
    players: 4,
    amount: 400,
    paymentStatus: "pending",
    bookingStatus: "pending",
    couponId: "WELCOME50",
    createdAt: now
  }
];

export const sampleTimeSlots: TimeSlot[] = [
  {
    id: "ts_001",
    venueId: "venue_001",
    date: "2026-08-20",
    startTime: "17:00",
    endTime: "18:00",
    status: "available",
    bookingId: null
  },
  {
    id: "ts_002",
    venueId: "venue_001",
    date: "2026-08-20",
    startTime: "18:00",
    endTime: "19:00",
    status: "booked",
    bookingId: "book_xyz123"
  },
  {
    id: "ts_003",
    venueId: "venue_001",
    date: "2026-08-20",
    startTime: "19:00",
    endTime: "20:00",
    status: "available",
    bookingId: null
  }
];

export const sampleFavorites: Favorite[] = [
  {
    id: "fav_001",
    userId: "user_101",
    venueId: "venue_001",
    createdAt: now - 86400000 * 2
  },
  {
    id: "fav_002",
    userId: "user_102",
    venueId: "venue_003",
    createdAt: now - 86400000 * 5
  }
];

export const sampleReviews: Review[] = [
  {
    id: "rev_001",
    userId: "user_101",
    venueId: "venue_001",
    rating: 5,
    comment: "Amazing turf quality! The lights were bright and it was easy to find.",
    userName: "Rahul Sharma",
    userPhoto: "https://example.com/profiles/rahul.jpg",
    createdAt: now - 86400000 * 4
  },
  {
    id: "rev_002",
    userId: "user_102",
    venueId: "venue_002",
    rating: 4,
    comment: "Good courts, but parking was a bit difficult.",
    userName: "Priya Patel",
    userPhoto: null,
    createdAt: now - 86400000 * 8
  }
];

export const sampleNotifications: Notification[] = [
  {
    id: "notif_001",
    userId: "user_101",
    title: "Booking Confirmed",
    message: "Your booking for Vashi Sports Arena at 18:00 on 20th Aug is confirmed.",
    type: "booking",
    isRead: false,
    createdAt: now
  },
  {
    id: "notif_002",
    userId: "user_102",
    title: "Weekend Offer!",
    message: "Get 20% off on all Badminton courts this weekend.",
    type: "offer",
    isRead: true,
    createdAt: now - 86400000 * 1
  }
];

export const sampleTournaments: Tournament[] = [
  {
    id: "tourney_001",
    name: "Navi Mumbai Monsoon Cup",
    sport: "Box Cricket",
    location: "Vashi Sports Arena, Navi Mumbai",
    date: "2026-09-01",
    entryFee: 5000,
    prizePool: 50000,
    maxTeams: 16,
    registeredTeams: 12,
    image: "https://example.com/tournament1.jpg",
    status: "upcoming",
    createdAt: now - 86400000 * 7
  },
  {
    id: "tourney_002",
    name: "Mumbai Open Tennis",
    sport: "Tennis",
    location: "Andheri Sports Complex, Mumbai",
    date: "2026-08-15",
    entryFee: 1000,
    prizePool: 20000,
    maxTeams: 32,
    registeredTeams: 32,
    image: "https://example.com/tournament2.jpg",
    status: "ongoing",
    createdAt: now - 86400000 * 30
  }
];
