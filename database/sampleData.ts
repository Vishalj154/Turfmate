import {
  Booking,
  Favorite,
  Notification,
  Resort,
  Review,
  TimeSlot,
  Tournament,
  User, Venue
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
    location: { city: "Navi Mumbai", area: "Vashi", latitude: 19.077065, longitude: 72.998993 },
    address: "Sector 17, Vashi, Navi Mumbai, Maharashtra 400703",
    images: [
      "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800",
      "https://images.unsplash.com/photo-1529900748604-07564a03e7a6?w=800"
    ],
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
    location: { city: "Thane", area: "Majiwada", latitude: 19.218330, longitude: 72.978088 },
    address: "Majiwada Junction, Thane West, Maharashtra 400601",
    images: [
      "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=800",
      "https://images.unsplash.com/photo-1554068865-24cecd4e34d8?w=800"
    ],
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
    location: { city: "Mumbai", area: "Andheri West", latitude: 19.113645, longitude: 72.869734 },
    address: "Veera Desai Road, Andheri West, Mumbai, Maharashtra 400058",
    images: [
      "https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=800",
      "https://images.unsplash.com/photo-1519315901367-f34f9274ce1c?w=800"
    ],
    rating: 4.2,
    reviewCount: 300,
    pricePerHour: 800,
    facilities: ["Parking", "Cafe", "Locker Rooms"],
    description: "A complete sports complex with swimming pool, tennis and basketball courts.",
    ownerId: "owner_003",
    isActive: true,
    createdAt: now - 86400000 * 300
  },
  {
    id: "venue_004",
    name: "Kharghar Champions Arena",
    type: "turf",
    sports: ["Football", "Box Cricket"],
    location: { city: "Navi Mumbai", area: "Kharghar", latitude: 19.0473, longitude: 73.0699 },
    address: "Sector 12, Kharghar, Navi Mumbai",
    images: [
      "https://images.unsplash.com/photo-1459865264687-595d652de67e?w=800",
      "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=800"
    ],
    rating: 4.9,
    reviewCount: 215,
    pricePerHour: 1100,
    facilities: ["Parking", "Floodlights", "Cafeteria", "Drinking Water"],
    description: "High density 40mm FIFA grade turf suitable for box cricket and 6v6 football.",
    ownerId: "owner_004",
    isActive: true,
    createdAt: now - 86400000 * 50
  },
  {
    id: "venue_005",
    name: "Ghodbunder Greenfield Cricket Turf",
    type: "turf",
    sports: ["Box Cricket"],
    location: { city: "Thane", area: "Ghodbunder Road", latitude: 19.2568, longitude: 72.9642 },
    address: "Opp. Hypercity, Ghodbunder Road, Thane",
    images: [
      "https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=800"
    ],
    rating: 4.6,
    reviewCount: 178,
    pricePerHour: 950,
    facilities: ["Floodlights", "Equipment", "Parking", "Washrooms"],
    description: "Specialized box cricket turf with high net enclosures and side boundaries.",
    ownerId: "owner_005",
    isActive: true,
    createdAt: now - 86400000 * 80
  },
  {
    id: "venue_006",
    name: "Nerul Olympus Swimming Pool",
    type: "sports_venue",
    sports: ["Swimming"],
    location: { city: "Navi Mumbai", area: "Nerul", latitude: 19.0330, longitude: 73.0169 },
    address: "Near LP Junction, Nerul, Navi Mumbai",
    images: [
      "https://images.unsplash.com/photo-1519315901367-f34f9274ce1c?w=800"
    ],
    rating: 4.8,
    reviewCount: 310,
    pricePerHour: 350,
    facilities: ["Changing Room", "Lockers", "Shower", "Coaching"],
    description: "Clean temperature-controlled semi-Olympic swimming pool.",
    ownerId: "owner_006",
    isActive: true,
    createdAt: now - 86400000 * 120
  },
  {
    id: "venue_007",
    name: "Juhu SuperStrikers Football Turf",
    type: "turf",
    sports: ["Football"],
    location: { city: "Mumbai", area: "Juhu", latitude: 19.1075, longitude: 72.8263 },
    address: "Near Juhu Beach, Juhu, Mumbai",
    images: [
      "https://images.unsplash.com/photo-1529900965600-71fc64c8f001?w=800"
    ],
    rating: 4.9,
    reviewCount: 410,
    pricePerHour: 1500,
    facilities: ["Premium Turf", "Floodlights", "Locker Room", "Valet Parking"],
    description: "Celebrity-frequented premium turf located near Juhu Beach.",
    ownerId: "owner_007",
    isActive: true,
    createdAt: now - 86400000 * 40
  },
  {
    id: "venue_008",
    name: "Seawoods Rooftop Box Cricket",
    type: "turf",
    sports: ["Box Cricket"],
    location: { city: "Navi Mumbai", area: "Seawoods", latitude: 19.0189, longitude: 73.0181 },
    address: "Grand Central Mall Rooftop, Seawoods",
    images: [
      "https://images.unsplash.com/photo-1560272564-c83b66b1ad12?w=800"
    ],
    rating: 4.4,
    reviewCount: 95,
    pricePerHour: 1000,
    facilities: ["Rooftop View", "Floodlights", "Mall Parking", "Food Court Access"],
    description: "Exciting rooftop box cricket under stadium lighting.",
    ownerId: "owner_008",
    isActive: true,
    createdAt: now - 86400000 * 15
  },
  {
    id: "venue_009",
    name: "Bandra Lawn Tennis Club",
    type: "court",
    sports: ["Tennis"],
    location: { city: "Mumbai", area: "Bandra West", latitude: 19.0596, longitude: 72.8295 },
    address: "Pali Hill Road, Bandra West, Mumbai",
    images: [
      "https://images.unsplash.com/photo-1554068865-24cecd4e34d8?w=800",
      "https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=800"
    ],
    rating: 4.8,
    reviewCount: 240,
    pricePerHour: 900,
    facilities: ["Synthetic Clay Court", "Floodlights", "Pro Shop", "Locker Room"],
    description: "Professional synthetic clay tennis courts in Bandra West.",
    ownerId: "owner_012",
    isActive: true,
    createdAt: now - 86400000 * 60
  },
  {
    id: "venue_010",
    name: "Dadar Tennis & Turf Club",
    type: "sports_venue",
    sports: ["Tennis", "Football"],
    location: { city: "Mumbai", area: "Dadar West", latitude: 19.0178, longitude: 72.8478 },
    address: "Shivaji Park, Dadar West, Mumbai",
    images: [
      "https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=800"
    ],
    rating: 4.7,
    reviewCount: 190,
    pricePerHour: 850,
    facilities: ["Floodlights", "Parking", "Coaching Available"],
    description: "Historic tennis & football venue located right next to Shivaji Park.",
    ownerId: "owner_013",
    isActive: true,
    createdAt: now - 86400000 * 90
  },
  {
    id: "venue_011",
    name: "Powai Lakeview Tennis & Sports",
    type: "court",
    sports: ["Tennis"],
    location: { city: "Mumbai", area: "Powai", latitude: 19.1176, longitude: 72.9060 },
    address: "Hiranandani Gardens, Powai, Mumbai",
    images: [
      "https://images.unsplash.com/photo-1554068865-24cecd4e34d8?w=800"
    ],
    rating: 4.6,
    reviewCount: 155,
    pricePerHour: 1000,
    facilities: ["Lakeview Court", "Changing Room", "Equipment Rental"],
    description: "Scenic tennis courts overlooking Powai Lake.",
    ownerId: "owner_014",
    isActive: true,
    createdAt: now - 86400000 * 110
  },
  {
    id: "venue_012",
    name: "Khar Tennis Academy",
    type: "court",
    sports: ["Tennis"],
    location: { city: "Mumbai", area: "Khar West", latitude: 19.0700, longitude: 72.8333 },
    address: "14th Road, Khar West, Mumbai",
    images: [
      "https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=800"
    ],
    rating: 4.9,
    reviewCount: 280,
    pricePerHour: 950,
    facilities: ["Hard Court", "Floodlights", "Refreshement Bar"],
    description: "High standard hard court tennis academy for matches & practice.",
    ownerId: "owner_015",
    isActive: true,
    createdAt: now - 86400000 * 70
  },
  {
    id: "venue_013",
    name: "Airoli Sports & Turf Hub",
    type: "turf",
    sports: ["Football", "Box Cricket"],
    location: { city: "Navi Mumbai", area: "Airoli", latitude: 19.1579, longitude: 72.9965 },
    address: "Sector 5, Airoli, Navi Mumbai",
    images: [
      "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800"
    ],
    rating: 4.5,
    reviewCount: 140,
    pricePerHour: 800,
    facilities: ["Floodlights", "Parking", "Washroom"],
    description: "Popular neighborhood turf for 5v5 matches and cricket sessions.",
    ownerId: "owner_016",
    isActive: true,
    createdAt: now - 86400000 * 45
  },
  {
    id: "venue_014",
    name: "Belapur Turf & Tennis Club",
    type: "sports_venue",
    sports: ["Tennis", "Football"],
    location: { city: "Navi Mumbai", area: "CBD Belapur", latitude: 19.0243, longitude: 73.0416 },
    address: "Sector 15, CBD Belapur, Navi Mumbai",
    images: [
      "https://images.unsplash.com/photo-1554068865-24cecd4e34d8?w=800"
    ],
    rating: 4.7,
    reviewCount: 165,
    pricePerHour: 850,
    facilities: ["Floodlights", "Parking", "Cafe"],
    description: "Multi-sport venue offering pristine tennis courts and football turf.",
    ownerId: "owner_017",
    isActive: true,
    createdAt: now - 86400000 * 35
  }
];

export const sampleResorts: Resort[] = [
  {
    id: "resort_001",
    name: "Lonavala Weekend Getaway Resort",
    location: { city: "Lonavala", area: "Khandala", latitude: 18.748060, longitude: 73.407222 },
    address: "Old Mumbai-Pune Highway, Khandala",
    images: [
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800",
      "https://images.unsplash.com/photo-1540541338287-41700207dee6?w=800"
    ],
    rating: 4.7,
    reviewCount: 450,
    pricePerNight: 5500,
    amenities: ["Swimming Pool", "Spa", "Free WiFi", "Breakfast Included", "Turf Pitch"],
    description: "Luxury resort perfect for corporate outings and weekend sports retreats.",
    ownerId: "owner_004",
    isActive: true,
    createdAt: now - 86400000 * 150
  },
  {
    id: "resort_002",
    name: "Palm Grove Nature Resort Karjat",
    location: { city: "Karjat", area: "Neral Road", latitude: 18.9102, longitude: 73.3283 },
    address: "Neral-Karjat Road, Karjat, Maharashtra",
    images: [
      "https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?w=800",
      "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800"
    ],
    rating: 4.6,
    reviewCount: 320,
    pricePerNight: 4800,
    amenities: ["Infinity Pool", "Riverfront", "Indoor Games", "Barbecue", "Badminton"],
    description: "Lush green nature resort nestled along Karjat riverbanks.",
    ownerId: "owner_009",
    isActive: true,
    createdAt: now - 86400000 * 90
  },
  {
    id: "resort_003",
    name: "Blue Horizon Beach Resort Alibaug",
    location: { city: "Alibaug", area: "Nagaon Beach", latitude: 18.6414, longitude: 72.8722 },
    address: "Nagaon Beach Road, Alibaug",
    images: [
      "https://images.unsplash.com/photo-1540541338287-41700207dee6?w=800",
      "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800"
    ],
    rating: 4.8,
    reviewCount: 510,
    pricePerNight: 6200,
    amenities: ["Private Beach Access", "Swimming Pool", "Seafood Restaurant", "Beach Volleyball"],
    description: "Stunning beachfront resort with private access to Nagaon beach.",
    ownerId: "owner_010",
    isActive: true,
    createdAt: now - 86400000 * 180
  },
  {
    id: "resort_004",
    name: "Mahabaleshwar Cloud Retreat",
    location: { city: "Mahabaleshwar", area: "Panchgani Road", latitude: 17.9257, longitude: 73.6577 },
    address: "Panchgani-Mahabaleshwar Road, Maharashtra",
    images: [
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800"
    ],
    rating: 4.9,
    reviewCount: 290,
    pricePerNight: 7500,
    amenities: ["Mountain View Pool", "Strawberry Farm", "Spa", "Trekking Trails"],
    description: "Serene mountain hilltop resort surrounded by strawberry valleys.",
    ownerId: "owner_011",
    isActive: true,
    createdAt: now - 86400000 * 220
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
    image: "https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=800",
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
    image: "https://images.unsplash.com/photo-1554068865-24cecd4e34d8?w=800",
    status: "ongoing",
    createdAt: now - 86400000 * 30
  }
];
