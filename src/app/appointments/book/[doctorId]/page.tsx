import { getDoctor, type Doctor } from '@/services/doctors';
import BookingForm from '@/components/appointments/booking-form';
import Image from 'next/image';
import { Stethoscope, MapPin, Briefcase, AlertTriangle } from 'lucide-react';
import type { Metadata, ResolvingMetadata } from 'next'

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
    description: `احجز موعدك الآن مع ${doctor.name}، ${doctor.specialty} في ${doctor.location}.`,
  }
}

export default async function BookAppointmentPage({ params }: { params: { doctorId: string } }) {
  const doctor: Doctor | null = await getDoctor(params.doctorId);

  if (!doctor) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8">
        <AlertTriangle size={64} className="text-destructive mb-6" />
        <h1 className="text-3xl font-bold text-destructive mb-4">الطبيب غير موجود</h1>
        <p className="text-lg text-muted-foreground">
          عفواً، لم نتمكن من العثور على الطبيب المطلوب. قد يكون الرابط غير صحيح أو تم حذف الطبيب.
        </p>
        <Button variant="link" className="mt-6 text-primary text-lg" asChild>
          <a href="/appointments">العودة إلى قائمة الأطباء</a>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="grid lg:grid-cols-3 gap-12">
        {/* Doctor Info Section */}
        <section className="lg:col-span-1 space-y-8">
          <div className="bg-card p-6 rounded-lg shadow-xl text-center">
            <div className="relative w-40 h-40 mx-auto mb-6 rounded-full overflow-hidden border-4 border-primary shadow-md">
              <Image
                src={doctor.imageUrl}
                alt={`صورة ${doctor.name}`}
                layout="fill"
                objectFit="cover"
                data-ai-hint="doctor portrait"
              />
            </div>
            <h2 className="text-3xl font-bold text-primary mb-2">{doctor.name}</h2>
            <div className="space-y-3 text-foreground/80 text-right">
              <p className="flex items-center justify-end gap-2 text-lg">
                {doctor.specialty}
                <Briefcase size={20} className="text-accent" />
              </p>
              <p className="flex items-center justify-end gap-2 text-lg">
                {doctor.location}
                <MapPin size={20} className="text-accent" />
              </p>
            </div>
            <p className="mt-4 text-sm text-foreground/70 text-right leading-relaxed">{doctor.bio}</p>
          </div>
        </section>

        {/* Booking Form Section */}
        <section className="lg:col-span-2">
          <div className="bg-card p-6 sm:p-8 rounded-lg shadow-xl">
            <h1 className="text-3xl font-bold mb-8 text-center text-primary">
              حجز موعد مع {doctor.name}
            </h1>
            <BookingForm doctor={doctor} />
          </div>
        </section>
      </div>
    </div>
  );
}
