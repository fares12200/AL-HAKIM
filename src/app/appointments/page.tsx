
import { getDoctors, type Doctor, getUniqueSpecialties, getAllAlgerianWilayas } from '@/services/doctors';
import DoctorCard from '@/components/doctors/doctor-card';
import DoctorSearchFilters from '@/components/doctors/doctor-search-filters';
import { MapPinned } from 'lucide-react';

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

  if (searchParams.specialty) {
    filteredDoctors = filteredDoctors.filter(doctor => doctor.specialty === searchParams.specialty);
  }

  if (searchParams.wilaya) {
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
    <div className="space-y-12">
      <section className="text-center py-12 bg-primary/5 rounded-lg shadow-md">
        <h1 className="text-4xl font-bold mb-4 text-primary">ابحث عن طبيبك واحجز موعدك</h1>
        <p className="text-lg text-foreground/80 max-w-xl mx-auto">
          استخدم الفلاتر للعثور على الطبيب المناسب في منطقتك أو حسب التخصص المطلوب.
        </p>
      </section>
      
      <DoctorSearchFilters specialties={uniqueSpecialties} wilayas={algerianWilayas} />

      <section>
        {filteredDoctors.length > 0 ? (
          <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredDoctors.map((doctor) => (
              <DoctorCard key={doctor.id} doctor={doctor} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-card rounded-lg shadow-md">
            <MapPinned size={64} className="mx-auto text-muted-foreground mb-6" />
            <h2 className="text-2xl font-semibold text-primary mb-3">لا توجد نتائج مطابقة</h2>
            <p className="text-lg text-muted-foreground">
              عفواً، لم نتمكن من العثور على أطباء يطابقون معايير البحث الحالية.
            </p>
            <p className="text-md text-muted-foreground mt-2">
              يرجى محاولة تعديل الفلاتر أو توسيع نطاق البحث.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
