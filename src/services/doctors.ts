
import { db } from '@/lib/firebase'; // Import db to potentially fetch doctor details

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

// Mock coordinates for some locations in Algeria
const mockCoordinates: { [key: string]: { lat: number; lng: number } } = {
  "Alger, Centre": { lat: 36.7754, lng: 3.0589 },
  "Oran, Sidi El Houari": { lat: 35.7051, lng: -0.6491 },
  "Constantine, Kasbah": { lat: 36.3650, lng: 6.6120 },
  "Annaba, Cours de la Révolution": { lat: 36.9028, lng: 7.7544 },
  "Sétif, Ain Fouara": { lat: 36.1900, lng: 5.4091 },
};

/**
 * Asynchronously retrieves a list of doctors.
 * This function fetches from the mock Firestore `users` collection.
 * @returns A promise that resolves to an array of Doctor objects.
 */
export async function getDoctors(): Promise<Doctor[]> {
  await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API delay

  const doctorsFromDb: Doctor[] = [];
  const allUserData = await db.getAllUsersForMock(); // Helper to get all user data
  
  for (const userId in allUserData) {
    const userData = allUserData[userId];
    if (userData.role === 'doctor') {
      doctorsFromDb.push({
        id: userId, // Ensure id is mapped correctly
        name: userData.name || 'اسم غير معروف',
        specialty: userData.specialty || 'تخصص غير محدد',
        location: userData.location || 'موقع غير محدد',
        wilaya: userData.wilaya || 'ولاية غير محددة',
        coordinates: userData.coordinates || mockCoordinates[userData.location as keyof typeof mockCoordinates],
        imageUrl: userData.imageUrl || `https://picsum.photos/seed/${userId.substring(0,10)}/300/300`,
        bio: userData.bio || 'لا توجد نبذة تعريفية.',
        availableSlots: userData.availableSlots,
        phoneNumber: userData.phoneNumber,
        experience: userData.experience || 'غير محدد',
        skills: userData.skills || 'غير محدد',
        equipment: userData.equipment || 'غير محدد',
        rating: userData.rating !== undefined ? Number(userData.rating) : parseFloat((Math.random() * (5 - 3.5) + 3.5).toFixed(1)),
      });
    }
  }
  return doctorsFromDb;
}

/**
 * Asynchronously retrieves a doctor by ID.
 *
 * @param id The ID of the doctor to retrieve (Firebase Auth UID).
 * @returns A promise that resolves to a Doctor object if found, or null if not found.
 */
export async function getDoctor(id: string): Promise<Doctor | null> {
  await new Promise(resolve => setTimeout(resolve, 300));
  
  const userDoc = await db.getDoc(`users/${id}`);
  if (userDoc.exists()) {
    const userData = userDoc.data();
    if (userData.role === 'doctor') {
      return {
        id: id, // Ensure id is mapped correctly
        name: userData.name || 'اسم غير معروف',
        specialty: userData.specialty || 'تخصص غير محدد',
        location: userData.location || 'موقع غير محدد',
        wilaya: userData.wilaya || 'ولاية غير محددة',
        coordinates: userData.coordinates || mockCoordinates[userData.location as keyof typeof mockCoordinates],
        imageUrl: userData.imageUrl || `https://picsum.photos/seed/${id.substring(0,10)}/300/300`,
        bio: userData.bio || 'لا توجد نبذة تعريفية.',
        availableSlots: userData.availableSlots,
        phoneNumber: userData.phoneNumber,
        experience: userData.experience || 'غير محدد',
        skills: userData.skills || 'غير محدد',
        equipment: userData.equipment || 'غير محدد',
        rating: userData.rating !== undefined ? Number(userData.rating) : parseFloat((Math.random() * (5 - 3.5) + 3.5).toFixed(1)),
      };
    }
  }
  return null;
}

/**
* Returns a list of unique specialties from the available doctors.
* @returns A promise that resolves to an array of unique specialties.
*/
export async function getUniqueSpecialties(): Promise<string[]> {
  const predefinedSpecialties = [
    'أمراض القلب والشرايين',
    'الأمراض الجلدية والتناسلية',
    'طب الأطفال وحديثي الولادة',
    'الطب الباطني والجهاز الهضمي',
    'طب وجراحة العيون',
    'أمراض النساء والتوليد',
    'طب الأنف والأذن والحنجرة',
    'طب العظام والمفاصل',
    'الأمراض الصدرية',
    'طب الأعصاب',
    'الطب النفسي',
    'جراحة عامة',
    'طب الأسنان',
    'العلاج الطبيعي',
    'التغذية العلاجية',
  ];
  const doctors = await getDoctors();
  const dynamicSpecialties = doctors.map(doc => doc.specialty).filter(Boolean); // Filter out undefined/null
  return [...new Set([...predefinedSpecialties, ...dynamicSpecialties])].sort((a,b) => a.localeCompare(b, 'ar'));
}


// Function to get all Algerian Wilayas (can be used for dropdowns)
export function getAllAlgerianWilayas(): string[] {
  return algerianWilayas.sort((a,b) => a.localeCompare(b, 'ar'));
}


// Helper to simulate updating user data in the mock Firestore
// This is used in doctor profile page.
export async function updateDoctorProfileInMock(uid: string, data: Partial<Doctor & {name: string, email: string, updatedAt: string}>) {
    const userDocPath = `users/${uid}`;
    const existingData = (await db.getDoc(userDocPath).then(doc => doc.exists() ? doc.data() : {})) || {};
    
    const updatedData = {
      ...existingData,
      ...data, // New data from profile form
      role: 'doctor', // Ensure role is doctor
      updatedAt: new Date().toISOString(),
      rating: data.rating !== undefined ? Number(data.rating) : (existingData.rating !== undefined ? Number(existingData.rating) : parseFloat((Math.random() * (5-3.5) + 3.5).toFixed(1))) 
    };
    await db.setDoc(userDocPath, updatedData);
}

