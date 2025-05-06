import { Button } from '@/components/ui/button';
import DoctorCard from '@/components/doctors/doctor-card';
import { getDoctors, type Doctor } from '@/services/doctors';
import Link from 'next/link';
import Image from 'next/image';
import { CheckCircle, CalendarCheck, UserCheck, Stethoscope as StethoscopeIcon } from 'lucide-react';


export default async function HomePage() {
  const doctors: Doctor[] = await getDoctors();
  const featuredDoctors = doctors.slice(0, 3); // Show 3 featured doctors

  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <section className="text-center py-16 bg-gradient-to-b from-primary/10 to-background rounded-lg shadow-lg">
        <div className="container mx-auto px-4">
          <StethoscopeIcon className="mx-auto text-primary mb-6" size={72} />
          <h1 className="text-5xl font-bold mb-6 text-primary">
            أهلاً بك في منصة الحكيم
          </h1>
          <p className="text-xl text-foreground/80 mb-8 max-w-2xl mx-auto">
            بوابتك لحجوزات طبية سهلة ومتابعة صحية متكاملة. صحتك تهمنا، وراحتك أولويتنا.
          </p>
          <Link href="/appointments" passHref>
            <Button size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground px-8 py-3 text-lg">
              احجز موعدك الآن
            </Button>
          </Link>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-12 text-primary">
            كيف تعمل المنصة؟
          </h2>
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div className="p-6 bg-card rounded-lg shadow-md hover:shadow-xl transition-shadow">
              <CheckCircle className="mx-auto text-accent mb-4" size={48} />
              <h3 className="text-2xl font-semibold mb-2">ابحث عن طبيبك</h3>
              <p className="text-foreground/70">
                تصفح قائمة الأطباء المتخصصين واختر الأنسب لاحتياجاتك.
              </p>
            </div>
            <div className="p-6 bg-card rounded-lg shadow-md hover:shadow-xl transition-shadow">
              <CalendarCheck className="mx-auto text-accent mb-4" size={48} />
              <h3 className="text-2xl font-semibold mb-2">اختر الموعد</h3>
              <p className="text-foreground/70">
                اطلع على المواعيد المتاحة واختر الوقت الذي يناسبك بسهولة.
              </p>
            </div>
            <div className="p-6 bg-card rounded-lg shadow-md hover:shadow-xl transition-shadow">
              <UserCheck className="mx-auto text-accent mb-4" size={48} />
              <h3 className="text-2xl font-semibold mb-2">احصل على الرعاية</h3>
              <p className="text-foreground/70">
                تمتع بخدمة طبية مميزة ومتابعة صحية مستمرة عبر منصتنا.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Doctors Section */}
      <section className="py-16 bg-muted/50 rounded-lg">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-12 text-primary">
            أطباؤنا المميزون
          </h2>
          {featuredDoctors.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredDoctors.map((doctor) => (
                <DoctorCard key={doctor.id} doctor={doctor} />
              ))}
            </div>
          ) : (
            <p className="text-center text-foreground/70">لا يوجد أطباء مميزون حاليًا.</p>
          )}
          <div className="text-center mt-12">
            <Link href="/appointments" passHref>
              <Button variant="outline" size="lg" className="text-primary border-primary hover:bg-primary hover:text-primary-foreground">
                عرض جميع الأطباء
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Health Monitoring Teaser Section */}
      <section className="py-16 text-center">
        <div className="container mx-auto px-4">
           <Image src="https://picsum.photos/800/400?random=1" alt="متابعة صحية" width={800} height={400} className="mx-auto rounded-lg shadow-lg mb-8" data-ai-hint="health monitoring" />
          <h2 className="text-4xl font-bold mb-6 text-primary">متابعة صحية متكاملة</h2>
          <p className="text-xl text-foreground/80 mb-8 max-w-2xl mx-auto">
            نوفر لك أدوات لمتابعة حالتك الصحية والتواصل مع طبيبك بسهولة بعد الموعد. (قريباً)
          </p>
          <Button size="lg" variant="secondary" disabled>
            اكتشف المزيد (قريباً)
          </Button>
        </div>
      </section>
    </div>
  );
}
