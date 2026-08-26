import * as SQLite from 'expo-sqlite';
import { User, Booking, Notification, Venue, Sport } from '../types';

let dbInstance: SQLite.SQLiteDatabase | null = null;

export async function getLocalDb(): Promise<SQLite.SQLiteDatabase> {
  if (dbInstance) {
    return dbInstance;
  }
  try {
    dbInstance = await SQLite.openDatabaseAsync('turfmate.db');
    return dbInstance;
  } catch (error) {
    console.error('[SQLite] Error opening database:', error);
    dbInstance = null;
    throw error;
  }
}

/**
 * Safe JSON parser that never throws
 */
function safeJsonParse<T>(str: any, fallback: T): T {
  if (!str || typeof str !== 'string') return fallback;
  try {
    return JSON.parse(str);
  } catch {
    return fallback;
  }
}

/**
 * Initializes local SQLite tables for TurfMate
 */
export async function initLocalDatabase(): Promise<void> {
  try {
    const db = await getLocalDb();

    // Enable WAL mode safely
    try {
      await db.execAsync('PRAGMA journal_mode = WAL;');
    } catch {
      // Ignore WAL pragma failure on platforms that don't support it
    }

    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        name TEXT,
        email TEXT,
        phone TEXT,
        isVerified INTEGER,
        points INTEGER
      );

      CREATE TABLE IF NOT EXISTS venues (
        id TEXT PRIMARY KEY,
        name TEXT,
        type TEXT,
        sportsJson TEXT,
        rating REAL,
        reviews INTEGER,
        distance TEXT,
        pricePerHour REAL,
        location TEXT,
        image TEXT,
        galleryJson TEXT,
        facilitiesJson TEXT,
        openingHours TEXT,
        description TEXT,
        latitude REAL,
        longitude REAL
      );

      CREATE TABLE IF NOT EXISTS bookings (
        id TEXT PRIMARY KEY,
        userId TEXT,
        venueId TEXT,
        date TEXT,
        timeSlot TEXT,
        amount REAL,
        status TEXT
      );

      CREATE TABLE IF NOT EXISTS favorites (
        id TEXT PRIMARY KEY,
        userId TEXT,
        venueId TEXT
      );

      CREATE TABLE IF NOT EXISTS notifications (
        id TEXT PRIMARY KEY,
        userId TEXT,
        title TEXT,
        message TEXT,
        type TEXT,
        isRead INTEGER,
        createdAt TEXT
      );
    `);

    console.log('[SQLite] Local database tables initialized successfully.');
  } catch (error) {
    console.error('[SQLite] Failed to initialize local database:', error);
  }
}

// ===================== USER OPERATIONS =====================

export async function saveLocalUser(user: User): Promise<void> {
  try {
    const db = await getLocalDb();
    await db.runAsync(
      `INSERT OR REPLACE INTO users (id, name, email, phone, isVerified, points) VALUES (?, ?, ?, ?, ?, ?);`,
      [user.id, user.name || '', user.email || '', user.phone || '', user.isVerified ? 1 : 0, user.points || 0]
    );
  } catch (error) {
    console.error('[SQLite] Error saving user:', error);
  }
}

export async function getLocalUser(userId: string): Promise<User | null> {
  try {
    const db = await getLocalDb();
    const row = await db.getFirstAsync<any>(`SELECT * FROM users WHERE id = ?;`, [userId]);
    if (!row) return null;
    return {
      id: row.id,
      name: row.name || 'TurfMate User',
      email: row.email || '',
      phone: row.phone || '',
      isVerified: Boolean(row.isVerified),
      points: row.points || 0
    };
  } catch (error) {
    console.error('[SQLite] Error reading user:', error);
    return null;
  }
}

// ===================== VENUE OPERATIONS =====================

export async function saveLocalVenues(venues: Venue[]): Promise<void> {
  if (!venues || venues.length === 0) return;
  try {
    const db = await getLocalDb();
    await db.withTransactionAsync(async () => {
      for (const v of venues) {
        if (!v || !v.id) continue;
        await db.runAsync(
          `INSERT OR REPLACE INTO venues 
          (id, name, type, sportsJson, rating, reviews, distance, pricePerHour, location, image, galleryJson, facilitiesJson, openingHours, description, latitude, longitude)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
          [
            v.id,
            v.name || '',
            v.type || 'Turf',
            JSON.stringify(v.sports || []),
            typeof v.rating === 'number' ? v.rating : 4.5,
            typeof v.reviews === 'number' ? v.reviews : 0,
            v.distance || '',
            typeof v.pricePerHour === 'number' ? v.pricePerHour : 0,
            v.location || '',
            v.image || '',
            JSON.stringify(v.gallery || []),
            JSON.stringify(v.facilities || []),
            v.openingHours || '',
            v.description || '',
            typeof v.latitude === 'number' ? v.latitude : null,
            typeof v.longitude === 'number' ? v.longitude : null
          ]
        );
      }
    });
  } catch (error) {
    console.error('[SQLite] Error saving local venues:', error);
  }
}

export async function getLocalVenues(): Promise<Venue[]> {
  try {
    const db = await getLocalDb();
    const rows = await db.getAllAsync<any>(`SELECT * FROM venues;`);
    if (!rows || rows.length === 0) return [];
    return rows.map(r => ({
      id: r.id,
      name: r.name || '',
      type: (r.type as Venue['type']) || 'Turf',
      sports: safeJsonParse<Sport[]>(r.sportsJson, ['Football']),
      rating: typeof r.rating === 'number' ? r.rating : 4.5,
      reviews: typeof r.reviews === 'number' ? r.reviews : 0,
      distance: r.distance || '',
      pricePerHour: typeof r.pricePerHour === 'number' ? r.pricePerHour : 0,
      location: r.location || '',
      image: r.image || '',
      gallery: safeJsonParse<string[]>(r.galleryJson, []),
      facilities: safeJsonParse<string[]>(r.facilitiesJson, []),
      openingHours: r.openingHours || '',
      description: r.description || '',
      latitude: typeof r.latitude === 'number' ? r.latitude : undefined,
      longitude: typeof r.longitude === 'number' ? r.longitude : undefined
    }));
  } catch (error) {
    console.error('[SQLite] Error getting local venues:', error);
    return [];
  }
}

// ===================== BOOKING OPERATIONS =====================

export async function saveLocalBooking(booking: Booking, userId: string = 'guest'): Promise<void> {
  if (!booking || !booking.id) return;
  try {
    const db = await getLocalDb();
    await db.runAsync(
      `INSERT OR REPLACE INTO bookings (id, userId, venueId, date, timeSlot, amount, status) VALUES (?, ?, ?, ?, ?, ?, ?);`,
      [booking.id, userId, booking.venueId || '', booking.date || '', booking.timeSlot || '', typeof booking.amount === 'number' ? booking.amount : 0, booking.status || 'Upcoming']
    );
  } catch (error) {
    console.error('[SQLite] Error saving local booking:', error);
  }
}

export async function saveLocalBookings(bookings: Booking[], userId: string = 'guest'): Promise<void> {
  if (!bookings || bookings.length === 0) return;
  try {
    const db = await getLocalDb();
    await db.withTransactionAsync(async () => {
      for (const b of bookings) {
        if (!b || !b.id) continue;
        await db.runAsync(
          `INSERT OR REPLACE INTO bookings (id, userId, venueId, date, timeSlot, amount, status) VALUES (?, ?, ?, ?, ?, ?, ?);`,
          [b.id, userId, b.venueId || '', b.date || '', b.timeSlot || '', typeof b.amount === 'number' ? b.amount : 0, b.status || 'Upcoming']
        );
      }
    });
  } catch (error) {
    console.error('[SQLite] Error saving local bookings:', error);
  }
}

export async function getLocalBookings(userId: string = 'guest'): Promise<Booking[]> {
  try {
    const db = await getLocalDb();
    const rows = await db.getAllAsync<any>(`SELECT * FROM bookings WHERE userId = ? ORDER BY id DESC;`, [userId]);
    if (!rows || rows.length === 0) return [];
    return rows.map(r => ({
      id: r.id,
      venueId: r.venueId || '',
      date: r.date || '',
      timeSlot: r.timeSlot || '',
      amount: typeof r.amount === 'number' ? r.amount : 0,
      status: r.status || 'Upcoming'
    }));
  } catch (error) {
    console.error('[SQLite] Error getting local bookings:', error);
    return [];
  }
}

export async function updateLocalBookingStatus(bookingId: string, status: string): Promise<void> {
  try {
    const db = await getLocalDb();
    await db.runAsync(`UPDATE bookings SET status = ? WHERE id = ?;`, [status, bookingId]);
  } catch (error) {
    console.error('[SQLite] Error updating booking status:', error);
  }
}

// ===================== FAVORITES OPERATIONS =====================

export async function saveLocalFavorite(userId: string, venueId: string): Promise<void> {
  try {
    const db = await getLocalDb();
    const id = `${userId}_${venueId}`;
    await db.runAsync(`INSERT OR REPLACE INTO favorites (id, userId, venueId) VALUES (?, ?, ?);`, [id, userId, venueId]);
  } catch (error) {
    console.error('[SQLite] Error saving local favorite:', error);
  }
}

export async function removeLocalFavorite(userId: string, venueId: string): Promise<void> {
  try {
    const db = await getLocalDb();
    await db.runAsync(`DELETE FROM favorites WHERE userId = ? AND venueId = ?;`, [userId, venueId]);
  } catch (error) {
    console.error('[SQLite] Error removing local favorite:', error);
  }
}

export async function getLocalFavorites(userId: string): Promise<string[]> {
  try {
    const db = await getLocalDb();
    const rows = await db.getAllAsync<any>(`SELECT venueId FROM favorites WHERE userId = ?;`, [userId]);
    if (!rows || rows.length === 0) return [];
    return rows.map(r => r.venueId);
  } catch (error) {
    console.error('[SQLite] Error getting local favorites:', error);
    return [];
  }
}
