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
   * The doctor's location (general address string).
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
   * URL of the doctor's profile picture.
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
   * Doctor's years of experience or a description of their experience.
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
  "الرياض، حي العليا": { lat: 24.7136, lng: 46.6753 }, // Kept for existing data, not Algerian
  "جدة، حي الروضة": { lat: 21.5433, lng: 39.1728 },   // Kept for existing data, not Algerian
  "الدمام، حي الشاطئ": { lat: 26.4207, lng: 50.0888 }, // Kept for existing data, not Algerian
  "مكة المكرمة، حي العزيزية": { lat: 21.3891, lng: 39.8579 }, // Kept for existing data, not Algerian
  "المدينة المنورة، سلطانة": { lat: 24.4686, lng: 39.6142 }, // Kept for existing data, not Algerian
  "Alger, Centre": { lat: 36.7754, lng: 3.0589 },
  "Oran, Sidi El Houari": { lat: 35.7051, lng: -0.6491 },
  "Constantine, Kasbah": { lat: 36.3650, lng: 6.6120 },
  "Annaba, Cours de la Révolution": { lat: 36.9028, lng: 7.7544 },
  "Sétif, Ain Fouara": { lat: 36.1900, lng: 5.4091 },
};

// Initial mock doctors data. In a real app, this would be fetched from Firestore.
// The doctor's 'id' should correspond to their Firebase Auth UID.
const initialMockDoctors: Doctor[] = [
    {
      id: 'mock-doc-1', // Example UID
      name: 'د. أحمد الهاشمي',
      specialty: 'أمراض القلب والشرايين',
      location: 'الجزائر العاصمة، باب الزوار',
      wilaya: 'Alger',
      coordinates: mockCoordinates["Alger, Centre"],
      imageUrl: 'https://picsum.photos/seed/ahmed/300/300',
      bio: 'استشاري أمراض القلب بخبرة تتجاوز 15 عامًا في التشخيص وعلاج أمراض القلب المختلفة.',
      availableSlots: ['09:00 ص', '10:00 ص', '11:30 ص', '02:00 م'],
      phoneNumber: '021xxxxxx',
      experience: '15+ سنة خبرة، عمل سابق في مستشفى مصطفى باشا.',
      skills: 'قسطرة قلبية, تركيب دعامات, تخطيط صدى القلب',
      equipment: 'جهاز تخطيط القلب (ECG), جهاز صدى القلب (ECHO)',
    },
    {
      id: 'mock-doc-2', // Example UID
      name: 'د. فاطمة الزهراء',
      specialty: 'الأمراض الجلدية والتناسلية',
      location: 'وهران، حي السلام',
      wilaya: 'Oran',
      coordinates: mockCoordinates["Oran, Sidi El Houari"],
      imageUrl: 'https://picsum.photos/seed/fatima/300/300',
      bio: 'أخصائية أمراض جلدية وتجميل، متخصصة في علاج مشاكل البشرة والشعر بأحدث التقنيات.',
      availableSlots: ['10:30 ص', '11:00 ص', '01:00 م', '03:30 م'],
      phoneNumber: '041xxxxxx',
      experience: '10 سنوات خبرة في مجال الجلدية والتجميل.',
      skills: 'علاج حب الشباب, إزالة الشعر بالليزر, حقن الفيلر والبوتكس',
      equipment: 'جهاز ليزر لإزالة الشعر, جهاز ديرمابن',
    },
    {
      id: 'mock-doc-3',
      name: 'د. خالد الأنصاري',
      specialty: 'طب الأطفال وحديثي الولادة',
      location: 'قسنطينة، حي الأمير عبد القادر',
      wilaya: 'Constantine',
      coordinates: mockCoordinates["Constantine, Kasbah"],
      imageUrl: 'https://picsum.photos/seed/khalid/300/300',
      bio: 'طبيب أطفال متخصص في رعاية صحة الأطفال منذ الولادة وحتى سن المراهقة.',
      availableSlots: ['09:30 ص', '10:30 ص', '12:00 م', '02:30 م', '04:00 م'],
      experience: '8 سنوات خبرة في متابعة نمو الأطفال وعلاج أمراض الطفولة الشائعة.',
      skills: 'تطعيمات الأطفال, متابعة النمو والتطور, علاج حساسية الأطفال',
      equipment: 'ميزان أطفال دقيق, جهاز قياس الصفراء',
    },
    {
      id: 'mock-doc-4',
      name: 'د. سارة القحطاني',
      specialty: 'الطب الباطني والجهاز الهضمي',
      location: 'عنابة، وسط المدينة',
      wilaya: 'Annaba',
      coordinates: mockCoordinates["Annaba, Cours de la Révolution"],
      imageUrl: 'https://picsum.photos/seed/sara/300/300',
      bio: 'استشارية طب باطني وجهاز هضمي، تقدم تشخيصًا وعلاجًا لمختلف الأمراض الباطنية.',
      availableSlots: ['09:00 ص', '11:00 ص', '01:30 م'],
      phoneNumber: '031xxxxxx',
      experience: '12 سنة خبرة، متخصصة في أمراض المعدة والقولون.',
      skills: 'تنظير المعدة والقولون, علاج ارتجاع المريء, متابعة مرضى السكري',
      equipment: 'جهاز منظار داخلي, جهاز قياس سكر الدم',
    },
     {
      id: 'mock-doc-5',
      name: 'د. يوسف الحمدان',
      specialty: 'طب وجراحة العيون',
      location: 'سطيف، حي النصر',
      wilaya: 'Sétif',
      coordinates: mockCoordinates["Sétif, Ain Fouara"],
      imageUrl: 'https://picsum.photos/seed/youssef/300/300',
      bio: 'جراح عيون متخصص في تصحيح النظر وعلاج أمراض العيون المختلفة.',
      availableSlots: ['10:00 ص', '12:30 م', '03:00 م', '04:30 م'],
      experience: 'خبرة 20 عاماً في جراحات العيون بالليزر والماء الأبيض.',
      skills: 'جراحة الماء الأبيض (الكاتاراكت), تصحيح النظر بالليزك, علاج الجلوكوما',
      equipment: 'جهاز فحص قاع العين, جهاز قياس ضغط العين',
    },
    {
      id: 'mock-doc-6',
      name: 'د. ليلى بناني',
      specialty: 'أمراض النساء والتوليد',
      location: 'البليدة، وسط المدينة',
      wilaya: 'Blida',
      coordinates: { lat: 36.4707, lng: 2.8276 }, 
      imageUrl: 'https://picsum.photos/seed/leila/300/300',
      bio: 'طبيبة نساء وتوليد بخبرة واسعة في متابعة الحمل والولادة.',
      availableSlots: ['08:00 ص', '09:30 ص', '11:00 م'],
      experience: '14 سنة خبرة في متابعة حالات الحمل عالية الخطورة وإجراء الولادات.',
      skills: 'متابعة الحمل, ولادة طبيعية وقيصرية, تركيب اللولب الهرموني',
      equipment: 'جهاز سونار (إيكوغرافيا), جهاز تخطيط قلب الجنين',
    },
    {
      id: 'mock-doc-7',
      name: 'د. علي منصوري',
      specialty: 'أمراض القلب والشرايين',
      location: 'تيزي وزو، المدينة الجديدة',
      wilaya: 'Tizi Ouzou',
      coordinates: { lat: 36.7118, lng: 4.0459 },
      imageUrl: 'https://picsum.photos/seed/ali/300/300',
      bio: 'استشاري قلب متخصص في القسطرة القلبية وعلاج ارتفاع ضغط الدم.',
      availableSlots: ['10:00 ص', '11:00 ص', '02:30 م', '03:30 م'],
      experience: 'استشاري وخبرة 18 عاماً.',
      skills: 'قسطرة تشخيصية وعلاجية, علاج اضطرابات نظم القلب.',
      equipment: 'جهاز هولتر لمراقبة نظم القلب, جهاز اختبار الجهد.',
    }
];


/**
 * Asynchronously retrieves a list of doctors.
 * This function tries to fetch from the mock Firestore `users` collection if a doctor has updated their profile.
 * Otherwise, it falls back to `initialMockDoctors`.
 * @returns A promise that resolves to an array of Doctor objects.
 */
export async function getDoctors(): Promise<Doctor[]> {
  await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API delay

  const doctorsFromDb: Doctor[] = [];
  // In a real scenario, this would be a Firestore query for all users with role 'doctor'
  // For mock, we iterate over our simulated 'users' collection in firebase.ts
  // This is a simplified approach as db.getDoc in mock only takes path.
  // A real implementation would need db.getDocs(collection(db, 'users')) and then filter.
  // For the mock, we'll stick to hydrating initialMockDoctors with data from the users store.

  const allUserIds = Object.keys(await db.getAllUsersForMock()); // Helper to get all UIDs, needs to be added to mock firebase.ts
  
  for (const userId of allUserIds) {
    const userDoc = await db.getDoc(`users/${userId}`);
    if (userDoc.exists()) {
      const userData = userDoc.data();
      if (userData.role === 'doctor') {
        // Find if this doctor exists in the initial mock list to get base data if needed
        const initialDoctorData = initialMockDoctors.find(d => d.id === userId);
        
        doctorsFromDb.push({
          id: userId,
          name: userData.name || initialDoctorData?.name || 'اسم غير معروف',
          specialty: userData.specialty || initialDoctorData?.specialty || 'تخصص غير محدد',
          location: userData.location || initialDoctorData?.location || 'موقع غير محدد',
          wilaya: userData.wilaya || initialDoctorData?.wilaya || 'ولاية غير محددة',
          coordinates: userData.coordinates || initialDoctorData?.coordinates,
          imageUrl: userData.imageUrl || initialDoctorData?.imageUrl || `https://picsum.photos/seed/${userId.substring(0,10)}/300/300`,
          bio: userData.bio || initialDoctorData?.bio || 'لا توجد نبذة تعريفية.',
          availableSlots: userData.availableSlots || initialDoctorData?.availableSlots,
          phoneNumber: userData.phoneNumber || initialDoctorData?.phoneNumber,
          experience: userData.experience || initialDoctorData?.experience || 'غير محدد',
          skills: userData.skills || initialDoctorData?.skills || 'غير محدد',
          equipment: userData.equipment || initialDoctorData?.equipment || 'غير محدد',
        });
      }
    }
  }

  // To ensure initialMockDoctors are present if not in DB (e.g. new mock doctor not "registered" yet)
  // and to avoid duplicates, merge them carefully.
  const combinedDoctors: Doctor[] = [...doctorsFromDb];
  initialMockDoctors.forEach(initialDoc => {
    if (!combinedDoctors.find(dbDoc => dbDoc.id === initialDoc.id)) {
      combinedDoctors.push(initialDoc);
    }
  });
  
  return combinedDoctors;
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
      const initialDoctorData = initialMockDoctors.find(d => d.id === id);
      return {
        id: id,
        name: userData.name || initialDoctorData?.name || 'اسم غير معروف',
        specialty: userData.specialty || initialDoctorData?.specialty || 'تخصص غير محدد',
        location: userData.location || initialDoctorData?.location || 'موقع غير محدد',
        wilaya: userData.wilaya || initialDoctorData?.wilaya || 'ولاية غير محددة',
        coordinates: userData.coordinates || initialDoctorData?.coordinates,
        imageUrl: userData.imageUrl || initialDoctorData?.imageUrl || `https://picsum.photos/seed/${id.substring(0,10)}/300/300`,
        bio: userData.bio || initialDoctorData?.bio || 'لا توجد نبذة تعريفية.',
        availableSlots: userData.availableSlots || initialDoctorData?.availableSlots,
        phoneNumber: userData.phoneNumber || initialDoctorData?.phoneNumber,
        experience: userData.experience || initialDoctorData?.experience || 'غير محدد',
        skills: userData.skills || initialDoctorData?.skills || 'غير محدد',
        equipment: userData.equipment || initialDoctorData?.equipment || 'غير محدد',
      };
    }
  }
  // Fallback to initialMockDoctors if not in DB (simulates doctor not having completed profile yet)
  const initialDoctor = initialMockDoctors.find(doc => doc.id === id);
  if (initialDoctor) return initialDoctor;
  
  return null;
}

/**
* Returns a list of unique specialties from the available doctors.
* @returns A promise that resolves to an array of unique specialties.
*/
export async function getUniqueSpecialties(): Promise<string[]> {
  // For simplicity and to ensure all potential specialties are available for doctors to choose,
  // we can have a predefined list or union of mock data and any dynamically added ones.
  // For now, using a broader list and then filtering from actual doctors.
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
  const dynamicSpecialties = doctors.map(doc => doc.specialty);
  return [...new Set([...predefinedSpecialties, ...dynamicSpecialties])].sort((a,b) => a.localeCompare(b, 'ar'));
}

/**
* Returns a list of unique Algerian Wilayas from the available doctors.
* @returns A promise that resolves to an array of unique Wilayas.
*/
export async function getUniqueWilayas(): Promise<string[]> {
  const doctors = await getDoctors();
  const wilayas = doctors.map(doc => doc.wilaya);
  return [...new Set(wilayas)].sort((a,b) => a.localeCompare(b, 'ar')); // Sort for consistent display
}

// Function to get all Algerian Wilayas (can be used for dropdowns)
export function getAllAlgerianWilayas(): string[] {
  return algerianWilayas.sort((a,b) => a.localeCompare(b, 'ar'));
}

// Helper function to add a new doctor to the initialMockDoctors list (for simulation purposes)
// In a real app, this would be handled by the doctor registration process creating a document in Firestore.
export function addMockDoctor(doctorData: Doctor) {
  const existingIndex = initialMockDoctors.findIndex(d => d.id === doctorData.id);
  if (existingIndex > -1) {
    initialMockDoctors[existingIndex] = doctorData; // Update if exists
  } else {
    initialMockDoctors.push(doctorData); // Add if new
  }
}

// Helper to simulate updating user data in the mock Firestore
// This is used in doctor profile page.
export async function updateDoctorProfileInMock(uid: string, data: Partial<Doctor>) {
    const userDocPath = `users/${uid}`;
    const existingData = (await db.getDoc(userDocPath).then(doc => doc.exists() ? doc.data() : {})) || {};
    
    const updatedData = {
      ...existingData,
      ...data, // New data from profile form
      role: 'doctor', // Ensure role is doctor
      updatedAt: new Date().toISOString(),
    };
    await db.setDoc(userDocPath, updatedData);

    // Also update the initialMockDoctors if the ID matches one of the mock doctors
    // This helps keep the mock data somewhat consistent for display purposes elsewhere
    const mockDoctorIndex = initialMockDoctors.findIndex(d => d.id === uid);
    if (mockDoctorIndex !== -1) {
      initialMockDoctors[mockDoctorIndex] = {
        ...initialMockDoctors[mockDoctorIndex],
        ...updatedData, // apply all updates
      } as Doctor; // Ensure type correctness
    } else {
        // If doctor not in initialMock, add them (though ideally they should be if they are a mock doctor)
        // This might happen if a new user registers as a doctor and they weren't in the initial hardcoded list.
        initialMockDoctors.push({
             id: uid,
             name: updatedData.name || "طبيب جديد",
             specialty: updatedData.specialty || "تخصص غير محدد",
             location: updatedData.location || "موقع غير محدد",
             wilaya: updatedData.wilaya || "ولاية غير محددة",
             imageUrl: updatedData.imageUrl || `https://picsum.photos/seed/${uid.substring(0,10)}/300/300`,
             bio: updatedData.bio || "لا توجد نبذة.",
             experience: updatedData.experience,
             skills: updatedData.skills,
             equipment: updatedData.equipment,
        });
    }
}