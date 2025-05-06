/**
 * Represents a doctor's profile.
 */
export interface Doctor {
  /**
   * The doctor's ID.
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


/**
 * Asynchronously retrieves a list of doctors.
 * @returns A promise that resolves to an array of Doctor objects.
 */
export async function getDoctors(): Promise<Doctor[]> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  return [
    {
      id: '1',
      name: 'د. أحمد الهاشمي',
      specialty: 'أمراض القلب والشرايين',
      location: 'الجزائر العاصمة، باب الزوار',
      wilaya: 'Alger',
      coordinates: mockCoordinates["Alger, Centre"],
      imageUrl: 'https://picsum.photos/seed/ahmed/300/300',
      bio: 'استشاري أمراض القلب بخبرة تتجاوز 15 عامًا في التشخيص وعلاج أمراض القلب المختلفة.',
      availableSlots: ['09:00 ص', '10:00 ص', '11:30 ص', '02:00 م']
    },
    {
      id: '2',
      name: 'د. فاطمة الزهراء',
      specialty: 'الأمراض الجلدية والتناسلية',
      location: 'وهران، حي السلام',
      wilaya: 'Oran',
      coordinates: mockCoordinates["Oran, Sidi El Houari"],
      imageUrl: 'https://picsum.photos/seed/fatima/300/300',
      bio: 'أخصائية أمراض جلدية وتجميل، متخصصة في علاج مشاكل البشرة والشعر بأحدث التقنيات.',
      availableSlots: ['10:30 ص', '11:00 ص', '01:00 م', '03:30 م']
    },
    {
      id: '3',
      name: 'د. خالد الأنصاري',
      specialty: 'طب الأطفال وحديثي الولادة',
      location: 'قسنطينة، حي الأمير عبد القادر',
      wilaya: 'Constantine',
      coordinates: mockCoordinates["Constantine, Kasbah"],
      imageUrl: 'https://picsum.photos/seed/khalid/300/300',
      bio: 'طبيب أطفال متخصص في رعاية صحة الأطفال منذ الولادة وحتى سن المراهقة.',
      availableSlots: ['09:30 ص', '10:30 ص', '12:00 م', '02:30 م', '04:00 م']
    },
    {
      id: '4',
      name: 'د. سارة القحطاني',
      specialty: 'الطب الباطني والجهاز الهضمي',
      location: 'عنابة، وسط المدينة',
      wilaya: 'Annaba',
      coordinates: mockCoordinates["Annaba, Cours de la Révolution"],
      imageUrl: 'https://picsum.photos/seed/sara/300/300',
      bio: 'استشارية طب باطني وجهاز هضمي، تقدم تشخيصًا وعلاجًا لمختلف الأمراض الباطنية.',
      availableSlots: ['09:00 ص', '11:00 ص', '01:30 م']
    },
     {
      id: '5',
      name: 'د. يوسف الحمدان',
      specialty: 'طب وجراحة العيون',
      location: 'سطيف، حي النصر',
      wilaya: 'Sétif',
      coordinates: mockCoordinates["Sétif, Ain Fouara"],
      imageUrl: 'https://picsum.photos/seed/youssef/300/300',
      bio: 'جراح عيون متخصص في تصحيح النظر وعلاج أمراض العيون المختلفة.',
      availableSlots: ['10:00 ص', '12:30 م', '03:00 م', '04:30 م']
    },
    {
      id: '6',
      name: 'د. ليلى بناني',
      specialty: 'أمراض النساء والتوليد',
      location: 'البليدة، وسط المدينة',
      wilaya: 'Blida',
      coordinates: { lat: 36.4707, lng: 2.8276 }, // Example coordinates
      imageUrl: 'https://picsum.photos/seed/leila/300/300',
      bio: 'طبيبة نساء وتوليد بخبرة واسعة في متابعة الحمل والولادة.',
      availableSlots: ['08:00 ص', '09:30 ص', '11:00 م']
    },
    {
      id: '7',
      name: 'د. علي منصوري',
      specialty: 'أمراض القلب والشرايين',
      location: 'تيزي وزو، المدينة الجديدة',
      wilaya: 'Tizi Ouzou',
      coordinates: { lat: 36.7118, lng: 4.0459 }, // Example coordinates
      imageUrl: 'https://picsum.photos/seed/ali/300/300',
      bio: 'استشاري قلب متخصص في القسطرة القلبية وعلاج ارتفاع ضغط الدم.',
      availableSlots: ['10:00 ص', '11:00 ص', '02:30 م', '03:30 م']
    }
  ];
}

/**
 * Asynchronously retrieves a doctor by ID.
 *
 * @param id The ID of the doctor to retrieve.
 * @returns A promise that resolves to a Doctor object if found, or null if not found.
 */
export async function getDoctor(id: string): Promise<Doctor | null> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 300));
  const doctors = await getDoctors();
  return doctors.find(doc => doc.id === id) || null;
}

/**
* Returns a list of unique specialties from the available doctors.
* @returns A promise that resolves to an array of unique specialties.
*/
export async function getUniqueSpecialties(): Promise<string[]> {
  const doctors = await getDoctors();
  const specialties = doctors.map(doc => doc.specialty);
  return [...new Set(specialties)];
}

/**
* Returns a list of unique Algerian Wilayas from the available doctors.
* @returns A promise that resolves to an array of unique Wilayas.
*/
export async function getUniqueWilayas(): Promise<string[]> {
  const doctors = await getDoctors();
  const wilayas = doctors.map(doc => doc.wilaya);
  return [...new Set(wilayas)].sort(); // Sort for consistent display
}

// Function to get all Algerian Wilayas (can be used for dropdowns)
export function getAllAlgerianWilayas(): string[] {
  return algerianWilayas.sort();
}
