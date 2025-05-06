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
   * The doctor's location.
   */
  location: string;
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
      location: 'الرياض، حي العليا',
      imageUrl: 'https://picsum.photos/seed/ahmed/300/300',
      bio: 'استشاري أمراض القلب بخبرة تتجاوز 15 عامًا في التشخيص وعلاج أمراض القلب المختلفة.',
      availableSlots: ['09:00 ص', '10:00 ص', '11:30 ص', '02:00 م']
    },
    {
      id: '2',
      name: 'د. فاطمة الزهراء',
      specialty: 'الأمراض الجلدية والتناسلية',
      location: 'جدة، حي الروضة',
      imageUrl: 'https://picsum.photos/seed/fatima/300/300',
      bio: 'أخصائية أمراض جلدية وتجميل، متخصصة في علاج مشاكل البشرة والشعر بأحدث التقنيات.',
      availableSlots: ['10:30 ص', '11:00 ص', '01:00 م', '03:30 م']
    },
    {
      id: '3',
      name: 'د. خالد الأنصاري',
      specialty: 'طب الأطفال وحديثي الولادة',
      location: 'الدمام، حي الشاطئ',
      imageUrl: 'https://picsum.photos/seed/khalid/300/300',
      bio: 'طبيب أطفال متخصص في رعاية صحة الأطفال منذ الولادة وحتى سن المراهقة.',
      availableSlots: ['09:30 ص', '10:30 ص', '12:00 م', '02:30 م', '04:00 م']
    },
    {
      id: '4',
      name: 'د. سارة القحطاني',
      specialty: 'الطب الباطني والجهاز الهضمي',
      location: 'مكة المكرمة، حي العزيزية',
      imageUrl: 'https://picsum.photos/seed/sara/300/300',
      bio: 'استشارية طب باطني وجهاز هضمي، تقدم تشخيصًا وعلاجًا لمختلف الأمراض الباطنية.',
      availableSlots: ['09:00 ص', '11:00 ص', '01:30 م']
    },
     {
      id: '5',
      name: 'د. يوسف الحمدان',
      specialty: 'طب وجراحة العيون',
      location: 'المدينة المنورة، سلطانة',
      imageUrl: 'https://picsum.photos/seed/youssef/300/300',
      bio: 'جراح عيون متخصص في تصحيح النظر وعلاج أمراض العيون المختلفة.',
      availableSlots: ['10:00 ص', '12:30 م', '03:00 م', '04:30 م']
    },
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
