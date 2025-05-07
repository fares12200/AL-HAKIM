import { Button } from '@/components/ui/button';
import DoctorCard from '@/components/doctors/doctor-card';
import { getDoctors, type Doctor } from '@/services/doctors';
import Link from 'next/link';
import Image from 'next/image';
import { CheckCircle, CalendarCheck, UserCheck, Stethoscope as StethoscopeIcon, HeartHandshake } from 'lucide-react';


export default async function HomePage() {
  const doctors: Doctor[] = await getDoctors();
  const featuredDoctors = doctors.slice(0, 3); // Show 3 featured doctors

  return (
    <div className="space-y-20 md:space-y-24">
      {/* Hero Section */}
      <section className="text-center py-20 md:py-28 bg-gradient-to-br from-primary/10 via-background to-background rounded-xl shadow-lg overflow-hidden">
        <div className="container mx-auto px-6">
          <StethoscopeIcon className="mx-auto text-primary mb-8 animate-pulse" size={80} strokeWidth={1.5}/>
          <h1 className="text-5xl md:text-6xl font-bold mb-6 text-primary leading-tight">
            أهلاً بك في منصة الحكيم
          </h1>
          <p className="text-lg md:text-xl text-foreground/80 mb-10 max-w-3xl mx-auto leading-relaxed">
            بوابتك لحجوزات طبية سهلة ومتابعة صحية متكاملة. صحتك تهمنا، وراحتك أولويتنا. اكتشف أفضل الأطباء في منطقتك واحجز موعدك بكل سهولة.
          </p>
          <Link href="/appointments" passHref>
            <Button size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground px-10 py-7 text-xl rounded-lg shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105">
              <CalendarCheck size={24} className="mr-3 rtl:ml-3"/>
              احجز موعدك الآن
            </Button>
          </Link>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16">
        <div className="container mx-auto px-6">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-16 text-primary">
            كيف تعمل المنصة؟
          </h2>
          <div className="grid md:grid-cols-3 gap-8 md:gap-10 text-center">
            <div className="p-8 bg-card rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 transform hover:-translate-y-1">
              <CheckCircle className="mx-auto text-accent mb-6" size={56} strokeWidth={1.5} />
              <h3 className="text-2xl font-semibold mb-3 text-foreground">ابحث عن طبيبك</h3>
              <p className="text-foreground/70 leading-relaxed">
                تصفح قائمة الأطباء المتخصصين، اقرأ تقييماتهم، واختر الأنسب لاحتياجاتك بدقة وسهولة.
              </p>
            </div>
            <div className="p-8 bg-card rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 transform hover:-translate-y-1">
              <CalendarCheck className="mx-auto text-accent mb-6" size={56} strokeWidth={1.5} />
              <h3 className="text-2xl font-semibold mb-3 text-foreground">اختر الموعد</h3>
              <p className="text-foreground/70 leading-relaxed">
                اطلع على المواعيد المتاحة للطبيب الذي اخترته واختر الوقت الذي يناسب جدولك بسهولة تامة.
              </p>
            </div>
            <div className="p-8 bg-card rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 transform hover:-translate-y-1">
              <UserCheck className="mx-auto text-accent mb-6" size={56} strokeWidth={1.5} />
              <h3 className="text-2xl font-semibold mb-3 text-foreground">احصل على الرعاية</h3>
              <p className="text-foreground/70 leading-relaxed">
                تمتع بخدمة طبية مميزة، واحصل على متابعة صحية مستمرة وفعالة من خلال منصتنا المتكاملة.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Doctors Section */}
      <section className="py-16 bg-muted/40 rounded-xl">
        <div className="container mx-auto px-6">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-16 text-primary">
            أطباؤنا المميزون
          </h2>
          {featuredDoctors.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
              {featuredDoctors.map((doctor) => (
                <DoctorCard key={doctor.id} doctor={doctor} />
              ))}
            </div>
          ) : (
            <p className="text-center text-lg text-foreground/70 py-10">لا يوجد أطباء مميزون حاليًا. نعمل على إضافة المزيد قريباً.</p>
          )}
          <div className="text-center mt-16">
            <Link href="/appointments" passHref>
              <Button variant="outline" size="lg" className="text-primary border-primary hover:bg-primary hover:text-primary-foreground px-10 py-7 text-xl rounded-lg shadow-sm hover:shadow-md transition-all duration-300">
                عرض جميع الأطباء
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Health Monitoring Teaser Section */}
      <section className="py-16 text-center">
        <div className="container mx-auto px-6">
           <Image src="https://picsum.photos/seed/healthApp/1200/600" alt="متابعة صحية متكاملة" width={1000} height={500} className="mx-auto rounded-xl shadow-xl mb-10 object-cover" data-ai-hint="health app interface" />
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-primary">متابعة صحية شاملة ومتكاملة</h2>
          <p className="text-lg md:text-xl text-foreground/80 mb-10 max-w-3xl mx-auto leading-relaxed">
            نوفر لك أدوات لمتابعة حالتك الصحية، سجلاتك الطبية، والتواصل مع طبيبك بسهولة بعد الموعد. كل ذلك في مكان واحد وآمن. (قريباً)
          </p>
          <Button size="lg" variant="secondary" disabled className="px-10 py-7 text-xl rounded-lg opacity-70 cursor-not-allowed">
             <HeartHandshake size={24} className="mr-3 rtl:ml-3"/>
            اكتشف المزيد (قريباً)
          </Button>
        </div>
      </section>
    </div>
  );
}
