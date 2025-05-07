import { getDoctor, type Doctor } from '@/services/doctors';
import BookingForm from '@/components/appointments/booking-form';
import Image from 'next/image';
import { Stethoscope, MapPin, Briefcase, AlertTriangle, CalendarDays, Clock, Info, Award } from 'lucide-react';
import type { Metadata, ResolvingMetadata } from 'next';
import { Button } from '@/components/ui/button'; 
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

type Props = {
  params: { doctorId: string }
}

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const doctor = await getDoctor(params.doctorId);
  if (!doctor) {
    return {
      title: 'الطبيب غير موجود - منصة الحكيم',
    }
  }
  return {
    title: `حجز موعد مع ${doctor.name} - منصة الحكيم`,
    description: `احجز موعدك الآن مع ${doctor.name}، ${doctor.specialty} في ${doctor.location}. مواعيد متاحة وخيارات حجز مرنة.`,
  }
}

export default async function BookAppointmentPage({ params }: { params: { doctorId: string } }) {
  const doctor: Doctor | null = await getDoctor(params.doctorId);

  if (!doctor) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] text-center p-8 bg-card rounded-xl shadow-xl">
        <AlertTriangle size={72} className="text-destructive mb-8" strokeWidth={1.5} />
        <h1 className="text-4xl font-bold text-destructive mb-4">الطبيب غير موجود</h1>
        <p className="text-xl text-muted-foreground max-w-lg mx-auto mb-8">
          عفواً، لم نتمكن من العثور على الطبيب المطلوب. قد يكون الرابط غير صحيح أو تم حذف الطبيب من المنصة.
        </p>
        <Button variant="link" className="mt-6 text-primary text-lg hover:underline" asChild>
          <a href="/appointments">العودة إلى قائمة الأطباء</a>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 md:py-16">
      <div className="grid lg:grid-cols-5 gap-10 md:gap-12">
        {/* Doctor Info Section */}
        <section className="lg:col-span-2 space-y-8">
          <Card className="shadow-xl rounded-xl overflow-hidden">
            <CardHeader className="p-0">
              <div className="relative aspect-[4/3] w-full">
                <Image
                  src={doctor.imageUrl || `https://picsum.photos/seed/${doctor.id.substring(0,10)}/400/300`}
                  alt={`صورة ${doctor.name}`}
                  layout="fill"
                  objectFit="cover"
                  data-ai-hint="doctor professional modern"
                />
                 {doctor.rating && doctor.rating >= 4.5 && (
                    <div className="absolute top-4 right-4 bg-primary text-primary-foreground px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1 shadow-md z-10">
                        <Award size={14}/> متميز
                    </div>
                 )}
              </div>
            </CardHeader>
            <CardContent className="p-6 text-center">
              <h2 className="text-3xl font-bold text-primary mb-3">{doctor.name}</h2>
              <div className="space-y-3 text-foreground/80 text-right mt-4">
                <p className="flex items-center justify-end gap-3 text-lg">
                  {doctor.specialty}
                  <Briefcase size={22} className="text-accent" strokeWidth={1.5} />
                </p>
                <p className="flex items-center justify-end gap-3 text-lg">
                  {doctor.location}
                  <MapPin size={22} className="text-accent" strokeWidth={1.5} />
                </p>
                {doctor.wilaya && (
                  <p className="flex items-center justify-end gap-3 text-lg">
                    {doctor.wilaya}
                    <Globe size={22} className="text-accent" strokeWidth={1.5} />
                  </p>
                )}
              </div>
              {doctor.bio && (
                 <div className="mt-6 pt-4 border-t border-border/70">
                    <h3 className="text-xl font-semibold text-primary mb-2 text-right flex items-center justify-end gap-2">
                        نبذة عن الطبيب <Info size={20} className="text-accent" />
                    </h3>
                    <p className="text-sm text-foreground/70 text-right leading-relaxed">{doctor.bio}</p>
                 </div>
              )}
              {doctor.availableSlots && doctor.availableSlots.length > 0 && (
                 <div className="mt-6 pt-4 border-t border-border/70">
                    <h3 className="text-xl font-semibold text-primary mb-3 text-right flex items-center justify-end gap-2">
                        المواعيد المتاحة <Clock size={20} className="text-accent" />
                    </h3>
                    <div className="flex flex-wrap justify-end gap-2">
                        {doctor.availableSlots.slice(0,5).map(slot => ( // Show a few slots
                            <span key={slot} className="bg-accent/10 text-accent-foreground px-3 py-1.5 rounded-md text-sm font-medium">
                                {slot}
                            </span>
                        ))}
                        {doctor.availableSlots.length > 5 && <span className="text-sm text-muted-foreground self-center">... والمزيد</span>}
                    </div>
                 </div>
              )}
            </CardContent>
          </Card>
        </section>

        {/* Booking Form Section */}
        <section className="lg:col-span-3">
          <Card className="p-6 sm:p-10 rounded-xl shadow-xl">
            <CardHeader className="text-center p-0 mb-8">
                 <CalendarDays className="mx-auto text-primary mb-4" size={56} strokeWidth={1.5}/>
                <CardTitle className="text-3xl md:text-4xl font-bold text-primary">
                حجز موعد مع د. {doctor.name}
                </CardTitle>
                <CardDescription className="text-lg text-muted-foreground mt-2">
                    املأ النموذج التالي لتأكيد حجزك.
                </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
                <BookingForm doctor={doctor} />
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
}
