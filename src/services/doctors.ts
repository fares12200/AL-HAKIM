
import { db } from '@/lib/firebase'; 

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
  imageUrl?: string | null;
  /**
   * Brief description or bio.
   */
  bio?: string | null;
  /**
   * Available time slots (example).
   */
  availableSlots?: string[];
  /**
  * Doctor's contact phone number.
  */
  phoneNumber?: string | null;
  /**
   * Doctor's years of experience or a description of their experience. This is the experience.
   */
  experience?: string | null;
  /**
   * List of skills or special procedures the doctor offers. (e.g., comma-separated string)
   */
  skills?: string | null;
  /**
   * List of special equipment available at the clinic. (e.g., comma-separated string)
   */
  equipment?: string | null;
  /**
   * The doctor's rating (out of 5). This is the rating.
   */
  rating?: number | null;
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
  // Simulate API delay - Remove in production if Firestore is fast enough
  // await new Promise(resolve => setTimeout(resolve, 500)); 

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
        coordinates: userData.coordinates || mockCoordinates[userData.location as keyof typeof mockCoordinates], 
        imageUrl: userData.imageUrl || `https://picsum.photos/seed/${userData.id?.substring(0,10) || 'doctor'}/400/250`,
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
      }));
    return doctorsFromDb;
  } catch (error) {
    console.error("Error fetching doctors from Firestore:", error);
    // Depending on how you want to handle errors, you might re-throw or return a specific error object.
    // For now, returning an empty array to prevent page crash, but logging the error.
    throw error; // Re-throw to be caught by the calling page for user feedback
  }
}

/**
 * Asynchronously retrieves a doctor by ID from Firestore.
 * @param id The ID of the doctor to retrieve (Firebase Auth UID).
 * @returns A promise that resolves to a Doctor object if found, or null if not found.
 */
export async function getDoctor(id: string): Promise<Doctor | null> {
  // await new Promise(resolve => setTimeout(resolve, 300)); // Simulate API delay
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
          imageUrl: userData.imageUrl || `https://picsum.photos/seed/${userDoc.id?.substring(0,10) || 'docprofile'}/400/300`,
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
    return null; // Or re-throw, depending on error handling strategy
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
    const doctors = await getDoctors(); 
    const dynamicSpecialties = doctors.map(doc => doc.specialty).filter(Boolean);
    return [...new Set([...predefinedSpecialties, ...dynamicSpecialties])].sort((a,b) => a.localeCompare(b, 'ar'));
  } catch (error) {
    console.error("Error fetching unique specialties:", error);
    return predefinedSpecialties.sort((a,b) => a.localeCompare(b, 'ar')); 
  }
}

export function getAllAlgerianWilayas(): string[] {
  return algerianWilayas.sort((a,b) => a.localeCompare(b, 'ar'));
}

export async function updateDoctorProfile(uid: string, data: Partial<Doctor>) {
    const userDocPath = `users/${uid}`;
    const profileDataToSave = {
        ...data, 
        updatedAt: new Date().toISOString(),
    };
    if (data.name === undefined) delete profileDataToSave.name;
    if (data.email === undefined) delete profileDataToSave.email; 
    await db.setDoc(userDocPath, profileDataToSave); 
}
export const updateDoctorProfileInMock = updateDoctorProfile;

