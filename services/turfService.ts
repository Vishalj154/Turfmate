import { collection, doc, getDocs, getDoc, setDoc, query, where } from 'firebase/firestore';
import { db, auth } from './firebase';
import { Venue as SchemaVenue } from '../database/schema';
import { sampleVenues, sampleResorts } from '../database/sampleData';
import { Venue as UIVenue } from '../types';

// Helper function to map schema venue to UI venue
export const mapSchemaToUIVenue = (v: SchemaVenue | any): UIVenue => {
  const mainImage = Array.isArray(v.images) && v.images.length > 0
    ? (v.images[0].startsWith('http') ? v.images[0] : 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800')
    : 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800';

  const galleryImages = Array.isArray(v.images) && v.images.length > 0
    ? v.images.map((img: string) => img.startsWith('http') ? img : 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800')
    : [mainImage];

  const locationStr = typeof v.location === 'object' && v.location !== null
    ? `${v.location.area || ''}, ${v.location.city || ''}`
    : (typeof v.location === 'string' ? v.location : 'Navi Mumbai');

  const lat = typeof v.location === 'object' && v.location !== null ? v.location.latitude : v.latitude;
  const lng = typeof v.location === 'object' && v.location !== null ? v.location.longitude : v.longitude;

  return {
    id: v.id,
    name: v.name,
    type: v.type === 'turf' ? 'Turf' : v.type === 'court' ? 'Sports Venue' : (v.type || 'Turf'),
    sports: Array.isArray(v.sports) ? v.sports : ['Football', 'Box Cricket'],
    rating: v.rating || 4.8,
    reviews: v.reviewCount || 100,
    distance: '2.5 km',
    pricePerHour: v.pricePerHour || 1200,
    location: locationStr,
    image: mainImage,
    gallery: galleryImages,
    facilities: Array.isArray(v.facilities) ? v.facilities : ['Parking', 'Washrooms', 'Floodlights'],
    openingHours: '06:00 AM - 11:00 PM',
    description: v.description || 'Premium astroturf for football and box cricket.',
    latitude: typeof lat === 'number' ? lat : undefined,
    longitude: typeof lng === 'number' ? lng : undefined,
  };
};

/**
 * Seeds initial sample venues into Firestore if the collection is empty.
 */
export const seedInitialVenuesIfEmpty = async (): Promise<void> => {
  try {
    // Skip seeding if offline or user is unauthenticated
    if (!auth.currentUser) {
      return;
    }

    const venuesRef = collection(db, 'venues');
    const snapshot = await getDocs(venuesRef);
    if (snapshot.empty) {
      console.log('Firestore venues collection is empty. Seeding initial venues...');
      for (const sample of sampleVenues) {
        const docRef = doc(db, 'venues', sample.id);
        await setDoc(docRef, { ...sample }, { merge: true });
      }
      console.log('Seeded initial venues into Firestore successfully.');
    }
  } catch (error) {
    console.warn('Seeding initial venues skipped (offline mode or permissions):', error);
  }
};

export const getFallbackVenues = (): UIVenue[] => {
  const turfs = sampleVenues.map((sample) => mapSchemaToUIVenue(sample));
  const resorts = sampleResorts.map((r) => ({
    id: r.id,
    name: r.name,
    type: 'Resort' as const,
    sports: ['Swimming', 'Badminton', 'Cricket'] as any,
    rating: r.rating || 4.7,
    reviews: r.reviewCount || 250,
    distance: '15 km',
    pricePerHour: r.pricePerNight || 5500,
    location: typeof r.location === 'object' && r.location ? `${r.location.area}, ${r.location.city}` : 'Lonavala',
    image: Array.isArray(r.images) && r.images.length > 0 ? r.images[0] : 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800',
    gallery: r.images || [],
    facilities: r.amenities || ['Swimming Pool', 'Spa', 'WiFi'],
    openingHours: '24 Hours',
    description: r.description || 'Luxury nature resort perfect for retreats.',
    latitude: typeof r.location === 'object' && r.location ? r.location.latitude : undefined,
    longitude: typeof r.location === 'object' && r.location ? r.location.longitude : undefined,
  }));
  return [...turfs, ...resorts];
};

/**
 * Fetches all active turfs & resorts from Cloud Firestore merged with local fallback dataset.
 */
export const getActiveTurfsFromFirestore = async (): Promise<UIVenue[]> => {
  const fallbackList = getFallbackVenues();
  try {
    const venuesRef = collection(db, 'venues');
    const q = query(venuesRef, where('isActive', '==', true));
    const snapshot = await getDocs(q);

    const fetchedMap: { [id: string]: UIVenue } = {};
    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      fetchedMap[docSnap.id] = mapSchemaToUIVenue({ ...data, id: docSnap.id });
    });

    if (Object.keys(fetchedMap).length === 0) {
      return fallbackList;
    }

    // Merge fetched Firestore venues with fallback list so all turfs and resorts are present
    const merged = fallbackList.map((f) => fetchedMap[f.id] || f);
    Object.keys(fetchedMap).forEach((id) => {
      if (!merged.some((m) => m.id === id)) {
        merged.push(fetchedMap[id]);
      }
    });

    return merged;
  } catch (error) {
    console.warn('Network or Firestore unavailable. Using fallback venue list:', error);
    return fallbackList;
  }
};

/**
 * Fetches a single turf/resort by ID from Cloud Firestore or local database.
 */
export const getTurfByIdFromFirestore = async (id: string): Promise<UIVenue | null> => {
  const fallbackList = getFallbackVenues();
  try {
    const docRef = doc(db, 'venues', id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return mapSchemaToUIVenue({ ...docSnap.data(), id: docSnap.id });
    }
  } catch (error) {
    console.warn('Network error fetching turf by ID. Falling back to local venue data:', error);
  }

  // Fallback 1: Local SQLite
  try {
    const { getLocalVenues } = await import('../database/localDatabase');
    const local = await getLocalVenues();
    const foundLocal = local.find((v) => v.id === id);
    if (foundLocal) return foundLocal;
  } catch (e) {
    // Ignore SQLite errors
  }

  // Fallback 2: Hardcoded Sample/Fallback list
  return fallbackList.find((v) => v.id === id) || null;
};
