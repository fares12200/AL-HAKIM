
import { db } from '@/lib/firebase'; // Import db to fetch doctor details

/**
 * Represents a doctor's profile.
 */
export interface Doctor {
  /**
   * The doctor's ID. (This is the user UID from Firebase Auth)
   */
  id: string;
  /**
   * The doctor's name.
   */
  name: string;
  /**
   * The doctor's specialty.
   */
  specialty: string;
  /**
   * The doctor's location (general address string). This serves as the address.
   */
  location: string;
  /**
   * The doctor's Wilaya (Algerian province).
   */
  wilaya: string;
  /**
   * Latitude and Longitude of the doctor's clinic.
   */
  coordinates?: { lat: number; lng: number };
  /**
   * URL of the doctor's profile picture. This is the photo.
   */
  imageUrl: string;
  /**
   * Brief description or bio.
   */
  bio: string;
  /**
   * Available time slots (example).
   */
  availableSlots?: string[];
  /**
  * Doctor's contact phone number.
  */
  phoneNumber?: string;
  /**
   * Doctor's years of experience or a description of their experience. This is the experience.
   */
  experience?: string;
  /**
   * List of skills or special procedures the doctor offers. (e.g., comma-separated string)
   */
  skills?: string;
  /**
   * List of special equipment available at the clinic. (e.g., comma-separated string)
   */
  equipment?: string;
  /**
   * The doctor's rating (out of 5). This is the rating.
   */
  rating?: number;
  // Add other fields consistent with what's stored in Firestore `users` collection for doctors
  email?: string;
  updatedAt?: string;
  createdAt?: string;
}

// Sample Algerian Wilayas
const algerianWilayas = [
  "Adrar", "Chlef", "Laghouat", "Oum El Bouaghi", "Batna", "Béjaïa", "Biskra",
  "Béchar", "Blida", "Bouira", "Tamanrasset", "Tébessa", "Tlemcen", "Tiaret",
  "Tizi Ouzou", "Alger", "Djelfa", "Jijel", "Sétif", "Saïda", "Skikda",
  "Sidi Bel Abbès", "Annaba", "Guelma", "Constantine", "Médéa", "Mostaganem",
  "M'Sila", "Mascara", "Ouargla", "Oran", "El Bayadh", "Illizi", "Bordj Bou Arréridj",
  "Boumerdès", "El Tarf", "Tindouf", "Tissemsilt", "El Oued", "Khenchela",
  "Souk Ahras", "Tipaza", "Mila", "Aïn Defla", "Naâma", "Aïn Témouchent", "Ghardaïa",
  "Relizane", "Timimoun", "Bordj Badji Mokhtar", "Ouled Djellal", "Béni Abbès", 
  "In Salah", "In Guezzam", "Touggourt", "Djanet", "El M'Ghair", "El Meniaa"
];

// Mock coordinates for some locations in Algeria (Can be replaced with real geocoding later)
const mockCoordinates: { [key: string]: { lat: number; lng: number } } = {
  "Alger, Centre": { lat: 36.7754, lng: 3.0589 },
  "Oran, Sidi El Houari": { lat: 35.7051, lng: -0.6491 },
  "Constantine, Kasbah": { lat: 36.3650, lng: 6.6120 },
};


/**
 * Asynchronously retrieves a list of doctors from Firestore.
 * @returns A promise that resolves to an array of Doctor objects.
 */
export async function getDoctors(): Promise<Doctor[]> {
  await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API delay

  try {
    const usersData = await db.getDocs('users');
    const doctorsFromDb: Doctor[] = usersData
      .filter(userData => userData.role === 'doctor')
      .map(userData => ({
        id: userData.id,
        name: userData.name || 'اسم غير معروف',
        specialty: userData.specialty || 'تخصص غير محدد',
        location: userData.location || 'موقع غير محدد',
        wilaya: userData.wilaya || 'ولاية غير محددة',
        coordinates: userData.coordinates || mockCoordinates[userData.location as keyof typeof mockCoordinates], // Fallback to mock for now
        imageUrl: userData.imageUrl || `https://picsum.photos/seed/${userData.id.substring(0,10)}/300/300`,
        bio: userData.bio || 'لا توجد نبذة تعريفية.',
        availableSlots: userData.availableSlots || ['09:00 ص', '10:00 ص', '11:00 ص', '02:00 م', '03:00 م'], // Default slots
        phoneNumber: userData.phoneNumber,
        experience: userData.experience || 'غير محدد',
        skills: userData.skills || 'غير محدد',
        equipment: userData.equipment || 'غير محدد',
        rating: userData.rating !== undefined ? Number(userData.rating) : parseFloat((Math.random() * (5 - 3.5) + 3.5).toFixed(1)),
        email: userData.email,
        createdAt: userData.createdAt,
        updatedAt: userData.updatedAt,
      }));
    return doctorsFromDb;
  } catch (error) {
    console.error("Error fetching doctors from Firestore:", error);
    return []; // Return empty array on error
  }
}

/**
 * Asynchronously retrieves a doctor by ID from Firestore.
 * @param id The ID of the doctor to retrieve (Firebase Auth UID).
 * @returns A promise that resolves to a Doctor object if found, or null if not found.
 */
export async function getDoctor(id: string): Promise<Doctor | null> {
  await new Promise(resolve => setTimeout(resolve, 300));
  try {
    const userDoc = await db.getDoc(`users/${id}`);
    if (userDoc.exists()) {
      const userData = userDoc.data();
      if (userData?.role === 'doctor') {
        return {
          id: userDoc.id,
          name: userData.name || 'اسم غير معروف',
          specialty: userData.specialty || 'تخصص غير محدد',
          location: userData.location || 'موقع غير محدد',
          wilaya: userData.wilaya || 'ولاية غير محددة',
          coordinates: userData.coordinates || mockCoordinates[userData.location as keyof typeof mockCoordinates],
          imageUrl: userData.imageUrl || `https://picsum.photos/seed/${userDoc.id.substring(0,10)}/300/300`,
          bio: userData.bio || 'لا توجد نبذة تعريفية.',
          availableSlots: userData.availableSlots || ['09:00 ص', '10:00 ص', '11:00 ص', '02:00 م', '03:00 م'],
          phoneNumber: userData.phoneNumber,
          experience: userData.experience || 'غير محدد',
          skills: userData.skills || 'غير محدد',
          equipment: userData.equipment || 'غير محدد',
          rating: userData.rating !== undefined ? Number(userData.rating) : parseFloat((Math.random() * (5 - 3.5) + 3.5).toFixed(1)),
          email: userData.email,
          createdAt: userData.createdAt,
          updatedAt: userData.updatedAt,
        };
      }
    }
    return null;
  } catch (error) {
    console.error(`Error fetching doctor ${id} from Firestore:`, error);
    return null;
  }
}

/**
* Returns a list of unique specialties from the available doctors.
* @returns A promise that resolves to an array of unique specialties.
*/
export async function getUniqueSpecialties(): Promise<string[]> {
  const predefinedSpecialties = [
    'أمراض القلب والشرايين', 'الأمراض الجلدية والتناسلية', 'طب الأطفال وحديثي الولادة',
    'الطب الباطني والجهاز الهضمي', 'طب وجراحة العيون', 'أمراض النساء والتوليد',
    'طب الأنف والأذن والحنجرة', 'طب العظام والمفاصل', 'الأمراض الصدرية',
    'طب الأعصاب', 'الطب النفسي', 'جراحة عامة', 'طب الأسنان',
    'العلاج الطبيعي', 'التغذية العلاجية',
  ];
  try {
    const doctors = await getDoctors(); // This now fetches from Firestore
    const dynamicSpecialties = doctors.map(doc => doc.specialty).filter(Boolean);
    return [...new Set([...predefinedSpecialties, ...dynamicSpecialties])].sort((a,b) => a.localeCompare(b, 'ar'));
  } catch (error) {
    console.error("Error fetching unique specialties:", error);
    return predefinedSpecialties.sort((a,b) => a.localeCompare(b, 'ar')); // Fallback to predefined
  }
}

export function getAllAlgerianWilayas(): string[] {
  return algerianWilayas.sort((a,b) => a.localeCompare(b, 'ar'));
}

// Renamed from updateDoctorProfileInMock
export async function updateDoctorProfile(uid: string, data: Partial<Doctor>) {
    const userDocPath = `users/${uid}`;
    // Ensure that only fields relevant to Doctor profile are updated
    // and avoid overwriting essential fields like email, role, createdAt if not explicitly provided
    const profileDataToSave = {
        ...data, // New data from profile form
        updatedAt: new Date().toISOString(),
    };
    // Remove fields that should not be directly updated by this function if they are undefined in `data`
    if (data.name === undefined) delete profileDataToSave.name;
    if (data.email === undefined) delete profileDataToSave.email; // Email should typically be updated via auth service

    await db.setDoc(userDocPath, profileDataToSave); // setDoc with merge:true is default in our db wrapper
}
// Keep the old name for compatibility if it's used elsewhere, but mark as deprecated or point to new one.
// For now, I'll replace its usage in doctor profile page.
export const updateDoctorProfileInMock = updateDoctorProfile;
