import { collection, doc, getDocs, getDoc, setDoc, query, where } from 'firebase/firestore';
import { db } from './firebase';
import { Venue as SchemaVenue } from '../database/schema';
import { sampleVenues } from '../database/sampleData';
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
    description: v.description || 'Premium astroturf for football and box cricket.'
  };
};

/**
 * Seeds initial sample venues into Firestore if the collection is empty.
 */
export const seedInitialVenuesIfEmpty = async (): Promise<void> => {
  try {
    const venuesRef = collection(db, 'venues');
    const snapshot = await getDocs(venuesRef);
    if (snapshot.empty) {
      console.log('Firestore venues collection is empty. Seeding initial venues...');
      for (const sample of sampleVenues) {
        const docRef = doc(db, 'venues', sample.id);
        // Replace sample image placeholders with working high quality Unsplash URLs
        const validImages = [
          'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800',
          'https://images.unsplash.com/photo-1529900748604-07564a03e7a6?w=800'
        ];
        await setDoc(docRef, {
          ...sample,
          images: validImages
        });
      }
      console.log('Seeded initial venues into Firestore successfully.');
    }
  } catch (error) {
    console.error('Error seeding initial venues:', error);
  }
};

/**
 * Fetches all active turfs from Cloud Firestore.
 */
export const getActiveTurfsFromFirestore = async (): Promise<UIVenue[]> => {
  await seedInitialVenuesIfEmpty();

  const venuesRef = collection(db, 'venues');
  const q = query(venuesRef, where('isActive', '==', true));
  const snapshot = await getDocs(q);

  const venues: UIVenue[] = [];
  snapshot.forEach((docSnap) => {
    const data = docSnap.data();
    venues.push(mapSchemaToUIVenue({ ...data, id: docSnap.id }));
  });

  return venues;
};

/**
 * Fetches a single turf/venue by ID from Cloud Firestore.
 */
export const getTurfByIdFromFirestore = async (id: string): Promise<UIVenue | null> => {
  const docRef = doc(db, 'venues', id);
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) {
    return null;
  }

  return mapSchemaToUIVenue({ ...docSnap.data(), id: docSnap.id });
};
