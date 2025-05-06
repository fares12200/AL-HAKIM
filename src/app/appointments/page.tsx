import { getDoctors, type Doctor } from '@/services/doctors';
import DoctorCard from '@/components/doctors/doctor-card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';
// This will be a server component by default

// Client component for search functionality
// For now, we'll keep it simple and list all doctors. Search can be added later.

export const metadata = {
  title: 'حجز موعد - منصة الحكيم',
  description: 'ابحث عن طبيبك واحجز موعدك بسهولة عبر منصة الحكيم.',
};

export default async function AppointmentsPage() {
  const doctors: Doctor[] = await getDoctors();

  return (
    <div className="space-y-12">
      <section className="text-center py-12 bg-primary/5 rounded-lg shadow-md">
        <h1 className="text-4xl font-bold mb-4 text-primary">ابحث عن طبيبك واحجز موعدك</h1>
        <p className="text-lg text-foreground/80 max-w-xl mx-auto">
          تصفح قائمة الأطباء المتوفرين واختر الأنسب لاحتياجاتك الصحية. الحجز سريع وسهل.
        </p>
      </section>
      
      {/* Search and Filter Section - Placeholder for future enhancement */}
      {/* 
      <section className="py-6">
        <div className="flex flex-col md:flex-row gap-4 items-center p-4 bg-card rounded-lg shadow">
          <div className="relative flex-grow w-full md:w-auto">
            <Input type="text" placeholder="ابحث باسم الطبيب أو التخصص..." className="pl-10 pr-4 py-3 text-base" />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={20} />
          </div>
          <Button className="w-full md:w-auto">
            <Search size={18} className="mr-2 rtl:ml-2" />
            بحث
          </Button>
        </div>
      </section>
      */}

      <section>
        {doctors.length > 0 ? (
          <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {doctors.map((doctor) => (
              <DoctorCard key={doctor.id} doctor={doctor} />
            ))}
          </div>
        ) : (
          <div className="text-center py-10">
            <p className="text-xl text-muted-foreground">عفواً، لا يوجد أطباء متاحون حالياً.</p>
            <p className="text-md text-muted-foreground mt-2">يرجى المحاولة مرة أخرى لاحقاً.</p>
          </div>
        )}
      </section>
    </div>
  );
}
