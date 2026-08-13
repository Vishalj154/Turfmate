export type Sport = 'Cricket' | 'Football' | 'Badminton' | 'Tennis' | 'Basketball' | 'Volleyball' | 'Box Cricket' | 'Swimming';

export interface Venue {
  id: string;
  name: string;
  type: 'Turf' | 'Resort' | 'Event Venue' | 'Sports Venue';
  sports: Sport[];
  rating: number;
  reviews: number;
  distance: string; // e.g. "2.5 km"
  pricePerHour: number;
  location: string;
  image: string; // URL or local require
  gallery: string[];
  facilities: string[];
  openingHours: string;
  description: string;
}

export interface Tournament {
  id: string;
  name: string;
  sport: Sport;
  date: string;
  location: string;
  entryFee: number;
  teamsLimit: number;
  teamsRegistered: number;
  prizePool: number;
  image: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  isVerified: boolean;
  points: number;
}

export interface Booking {
  id: string;
  venueId: string;
  date: string;
  timeSlot: string;
  amount: number;
  status: 'Upcoming' | 'Completed' | 'Cancelled';
}

export interface Notification {
  id: string;
  type: 'Booking' | 'Offer' | 'Tournament' | 'System';
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export interface Coupon {
  id: string;
  code: string;
  discountPercentage: number;
  minBookingAmount: number;
  expiryDate: string;
}
