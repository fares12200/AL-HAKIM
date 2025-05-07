
import { getDoctors, type Doctor, getUniqueSpecialties, getAllAlgerianWilayas } from '@/services/doctors';
import DoctorCard from '@/components/doctors/doctor-card';
import DoctorSearchFilters from '@/components/doctors/doctor-search-filters';
import { MapPinned, SearchX } from 'lucide-react';

export const metadata = {
  title: 'البحث عن طبيب وحجز موعد - منصة الحكيم',
  description: 'ابحث عن طبيبك حسب التخصص، الولاية، أو الموقع الجغرافي واحجز موعدك بسهولة عبر منصة الحكيم في الجزائر.',
};

interface AppointmentsPageProps {
  searchParams: {
    specialty?: string;
    wilaya?: string;
    name?: string;
    lat?: string;
    lng?: string;
  };
}

// Haversine formula to calculate distance between two points on Earth
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c; // Distance in km
  return d;
}

function deg2rad(deg: number): number {
  return deg * (Math.PI / 180);
}


export default async function AppointmentsPage({ searchParams }: AppointmentsPageProps) {
  const allDoctors: Doctor[] = await getDoctors();
  const uniqueSpecialties = await getUniqueSpecialties();
  const algerianWilayas = getAllAlgerianWilayas();

  let filteredDoctors = allDoctors;

  if (searchParams.name) {
    filteredDoctors = filteredDoctors.filter(doctor =>
      doctor.name.toLowerCase().includes(searchParams.name?.toLowerCase() || '')
    );
  }

  if (searchParams.specialty && searchParams.specialty !== '__ALL_ITEMS__') {
    filteredDoctors = filteredDoctors.filter(doctor => doctor.specialty === searchParams.specialty);
  }

  if (searchParams.wilaya && searchParams.wilaya !== '__ALL_ITEMS__') {
    filteredDoctors = filteredDoctors.filter(doctor => doctor.wilaya === searchParams.wilaya);
  }

  if (searchParams.lat && searchParams.lng) {
    const userLat = parseFloat(searchParams.lat);
    const userLng = parseFloat(searchParams.lng);
    const searchRadiusKm = 20; // Define a search radius, e.g., 20km

    filteredDoctors = filteredDoctors.filter(doctor => {
      if (doctor.coordinates) {
        const distance = calculateDistance(userLat, userLng, doctor.coordinates.lat, doctor.coordinates.lng);
        return distance <= searchRadiusKm;
      }
      return false;
    }).sort((a, b) => { // Sort by distance
      if (a.coordinates && b.coordinates) {
        const distA = calculateDistance(userLat, userLng, a.coordinates.lat, a.coordinates.lng);
        const distB = calculateDistance(userLat, userLng, b.coordinates.lat, b.coordinates.lng);
        return distA - distB;
      }
      return 0;
    });
  }


  return (
    <div className="space-y-12 md:space-y-16">
      <section className="text-center py-16 md:py-20 bg-primary/10 rounded-xl shadow-lg">
        <h1 className="text-4xl md:text-5xl font-bold mb-6 text-primary">ابحث عن طبيبك واحجز موعدك</h1>
        <p className="text-lg md:text-xl text-foreground/80 max-w-2xl mx-auto leading-relaxed">
          استخدم الفلاتر المتقدمة أدناه للعثور على الطبيب المناسب في منطقتك أو حسب التخصص المطلوب بكل سهولة ويسر.
        </p>
      </section>
      
      <DoctorSearchFilters specialties={uniqueSpecialties} wilayas={algerianWilayas} />

      <section className="pb-16">
        {filteredDoctors.length > 0 ? (
          <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
            {filteredDoctors.map((doctor) => (
              <DoctorCard key={doctor.id} doctor={doctor} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 md:py-24 bg-card rounded-xl shadow-lg flex flex-col items-center justify-center">
            <SearchX size={80} className="mx-auto text-muted-foreground mb-8" strokeWidth={1.5}/>
            <h2 className="text-3xl md:text-4xl font-semibold text-primary mb-4">لا توجد نتائج مطابقة</h2>
            <p className="text-lg md:text-xl text-muted-foreground max-w-md mx-auto leading-relaxed">
              عفواً، لم نتمكن من العثور على أطباء يطابقون معايير البحث الحالية.
            </p>
            <p className="text-md text-muted-foreground mt-3">
              يرجى محاولة تعديل الفلاتر، توسيع نطاق البحث، أو التحقق من صحة الكلمات المدخلة.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
