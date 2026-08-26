import {
  initLocalDatabase,
  saveLocalVenues,
  getLocalVenues,
  saveLocalBookings,
  getLocalBookings,
  saveLocalUser,
  getLocalUser
} from '../database/localDatabase';
import { getActiveTurfsFromFirestore, seedInitialVenuesIfEmpty } from './turfService';
import { getUserBookingsFromFirestore } from './bookingService';
import { Venue, Booking, User } from '../types';

/**
 * Initializes local database and synchronizes initial dataset between SQLite and Firestore
 */
export async function initializeAndSyncData(userId?: string): Promise<{
  venues: Venue[];
  bookings: Booking[];
}> {
  // 1. Initialize SQLite Database Tables
  await initLocalDatabase();

  // 2. Fetch existing cached data from local SQLite
  let localVenues = await getLocalVenues();
  let localBookings = userId ? await getLocalBookings(userId) : [];

  // 3. Trigger Firestore background sync
  try {
    await seedInitialVenuesIfEmpty();
    const cloudVenues = await getActiveTurfsFromFirestore();

    if (cloudVenues && cloudVenues.length > 0) {
      await saveLocalVenues(cloudVenues);
      localVenues = cloudVenues;
      console.log(`[SyncService] Synced ${cloudVenues.length} venues from Firestore to local SQLite.`);
    }

    if (userId && userId !== 'guest') {
      const cloudBookings = await getUserBookingsFromFirestore(userId);
      if (cloudBookings && cloudBookings.length > 0) {
        await saveLocalBookings(cloudBookings, userId);
        localBookings = cloudBookings;
        console.log(`[SyncService] Synced ${cloudBookings.length} user bookings from Firestore to local SQLite.`);
      }
    }
  } catch (error) {
    console.warn('[SyncService] Offline mode active. Using local SQLite data:', error);
  }

  return {
    venues: localVenues,
    bookings: localBookings
  };
}

/**
 * Syncs a new booking into local SQLite
 */
export async function saveBookingDual(booking: Booking, userId: string): Promise<void> {
  // Save locally in SQLite immediately for sub-millisecond offline performance
  try {
    await saveLocalBookings([booking], userId);
    console.log('[SyncService] Booking successfully saved to Local SQLite.');
  } catch (error) {
    console.warn('[SyncService] Error saving booking to local SQLite:', error);
  }
}

