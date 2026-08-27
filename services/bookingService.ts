import {
  collection,
  doc,
  getDocs,
  getDoc,
  query,
  where,
  runTransaction,
  serverTimestamp
} from 'firebase/firestore';
import { db, auth } from './firebase';
import { Booking as SchemaBooking } from '../database/schema';
import { Booking as UIBooking } from '../types';
import { getFirestoreErrorMessage } from './firebaseErrors';

export interface CreateBookingParams {
  userId: string;
  venueId: string;
  date: string; // e.g. "2026-08-20" or "12 Oct 2026"
  startTime: string; // e.g. "18:00" or "06:00 AM"
  endTime: string;   // e.g. "19:00" or "07:00 AM"
  timeSlotString: string; // e.g. "06:00 AM - 07:00 AM"
  players?: number;
  amount: number;
  couponId?: string | null;
}

// Generate a deterministic timeSlot document ID for atomic transaction locking
export const getSlotDocId = (venueId: string, date: string, startTime: string): string => {
  const cleanVenue = venueId.trim();
  const cleanDate = date.trim().replace(/[^a-zA-Z0-9]/g, '_');
  const cleanTime = startTime.trim().toUpperCase().replace(/[^a-zA-Z0-9]/g, '_');
  return `${cleanVenue}_${cleanDate}_${cleanTime}`;
};

/**
 * Atomic Booking Creation using Firestore runTransaction.
 * Prevents race conditions and double-booking.
 */
export const createBookingAtomic = async (params: CreateBookingParams): Promise<UIBooking> => {
  // Always use the authenticated Firebase UID directly.
  // This is the authoritative identity — it must match request.auth.uid in Firestore rules.
  // Do NOT rely solely on params.userId which comes from UI state.
  const currentUser = auth.currentUser;
  if (!currentUser) {
    throw new Error('Please log in before making a booking.');
  }
  const authenticatedUid = currentUser.uid;

  const normalizedVenueId = params.venueId.trim();
  const normalizedDate = params.date.trim();
  const normalizedStartTime = params.startTime.trim().toUpperCase();

  const slotDocId = getSlotDocId(normalizedVenueId, normalizedDate, normalizedStartTime);
  const slotRef = doc(db, 'timeSlots', slotDocId);
  const bookingRef = doc(collection(db, 'bookings'));
  const newBookingId = bookingRef.id;

  try {
    await runTransaction(db, async (transaction) => {
      // Read the timeSlot document atomically inside transaction
      const slotSnap = await transaction.get(slotRef);

      if (slotSnap.exists() && slotSnap.data().status === 'booked') {
        throw new Error('THIS_SLOT_IS_ALREADY_BOOKED');
      }

      // Set timeSlot document reservation
      transaction.set(slotRef, {
        id: slotDocId,
        venueId: normalizedVenueId,
        date: normalizedDate,
        startTime: normalizedStartTime,
        endTime: params.endTime.trim().toUpperCase(),
        status: 'booked',
        bookingId: newBookingId
      });

      // Set booking document in Firestore.
      // userId must equal the authenticated Firebase UID for Firestore rules to allow the write.
      transaction.set(bookingRef, {
        id: newBookingId,
        userId: authenticatedUid,
        venueId: normalizedVenueId,
        date: normalizedDate,
        startTime: normalizedStartTime,
        endTime: params.endTime.trim().toUpperCase(),
        timeSlot: params.timeSlotString,
        players: params.players || 10,
        amount: params.amount,
        paymentStatus: 'paid',
        bookingStatus: 'confirmed',
        couponId: params.couponId || null,
        createdAt: serverTimestamp()
      });
    });
  } catch (error: any) {
    if (error?.message === 'THIS_SLOT_IS_ALREADY_BOOKED') {
      throw error;
    }
    if (error?.message === 'Please log in before making a booking.') {
      throw error;
    }
    const friendlyMsg = getFirestoreErrorMessage(error);
    throw new Error(friendlyMsg);
  }

  return {
    id: newBookingId,
    venueId: normalizedVenueId,
    date: normalizedDate,
    timeSlot: params.timeSlotString,
    amount: params.amount,
    status: 'Upcoming'
  };
};

/**
 * Query booked slot IDs/timeStrings for a given venue and date.
 */
export const getBookedSlotsForVenueAndDate = async (venueId: string, date: string): Promise<string[]> => {
  const bookedTimes: Set<string> = new Set();
  const normalizedVenueId = venueId.trim();
  const normalizedDate = date.trim();

  // 1. Check local SQLite bookings first (instant offline check)
  try {
    const { getLocalBookings } = await import('../database/localDatabase');
    const local = await getLocalBookings();
    local.forEach(b => {
      if (b.venueId === normalizedVenueId && b.date === normalizedDate && b.status !== 'Cancelled') {
        const start = b.timeSlot.split(' - ')[0]?.trim().toUpperCase();
        if (start) bookedTimes.add(start);
      }
    });
  } catch (e) {
    // Ignore local SQLite errors
  }

  // 2. Query Cloud Firestore timeSlots
  try {
    const timeSlotsRef = collection(db, 'timeSlots');
    const q = query(
      timeSlotsRef,
      where('venueId', '==', normalizedVenueId),
      where('date', '==', normalizedDate),
      where('status', '==', 'booked')
    );
    const snapshot = await getDocs(q);

    snapshot.forEach((dSnap) => {
      const data = dSnap.data();
      if (data.startTime) {
        bookedTimes.add(data.startTime.trim().toUpperCase());
      }
    });
  } catch (error) {
    console.warn('Could not query Firestore timeSlots, using local booked slots:', error);
  }

  return Array.from(bookedTimes);
};

/**
 * Fetch all bookings for an authenticated user.
 */
export const getUserBookingsFromFirestore = async (userId: string): Promise<UIBooking[]> => {
  try {
    const bookingsRef = collection(db, 'bookings');
    const q = query(bookingsRef, where('userId', '==', userId));
    const snapshot = await getDocs(q);

    const userBookings: UIBooking[] = [];
    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      
      let uiStatus: 'Upcoming' | 'Completed' | 'Cancelled' = 'Upcoming';
      if (data.bookingStatus === 'cancelled') {
        uiStatus = 'Cancelled';
      } else if (data.bookingStatus === 'completed') {
        uiStatus = 'Completed';
      } else {
        uiStatus = 'Upcoming';
      }

      userBookings.push({
        id: docSnap.id,
        venueId: data.venueId,
        date: data.date,
        timeSlot: data.timeSlot || `${data.startTime || ''} - ${data.endTime || ''}`,
        amount: data.amount || 0,
        status: uiStatus
      });
    });

    return userBookings;
  } catch (error) {
    console.error('Error fetching user bookings:', error);
    return [];
  }
};

/**
 * Cancel a booking for an authenticated user.
 */
export const cancelBookingInFirestore = async (bookingId: string, userId: string): Promise<boolean> => {
  try {
    const bookingRef = doc(db, 'bookings', bookingId);
    const bookingSnap = await getDoc(bookingRef);

    if (!bookingSnap.exists()) {
      throw new Error('Booking not found');
    }

    const data = bookingSnap.data();
    if (data.userId !== userId) {
      throw new Error('Unauthorized cancellation attempt');
    }

    await runTransaction(db, async (transaction) => {
      transaction.update(bookingRef, {
        bookingStatus: 'cancelled'
      });

      if (data.venueId && data.date && data.startTime) {
        const slotDocId = getSlotDocId(data.venueId, data.date, data.startTime);
        const slotRef = doc(db, 'timeSlots', slotDocId);
        transaction.update(slotRef, {
          status: 'available',
          bookingId: null
        });
      }
    });

    // Update local SQLite booking status
    try {
      const { updateLocalBookingStatus } = await import('../database/localDatabase');
      await updateLocalBookingStatus(bookingId, 'Cancelled');
    } catch (e) {
      console.warn('Could not update local SQLite booking status:', e);
    }

    return true;
  } catch (error) {
    console.error('Error cancelling booking:', error);
    throw error;
  }
};
