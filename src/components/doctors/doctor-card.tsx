import Image from 'next/image';
import Link from 'next/link';
import type { Doctor } from '@/services/doctors';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Stethoscope, MapPin, Briefcase, Globe } from 'lucide-react';

interface DoctorCardProps {
  doctor: Doctor;
}

export default function DoctorCard({ doctor }: DoctorCardProps) {
  return (
    <Card className="flex flex-col overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 h-full">
      <CardHeader className="p-0 relative h-56">
        <Image
          src={doctor.imageUrl}
          alt={`صورة ${doctor.name}`}
          layout="fill"
          objectFit="cover"
          className="rounded-t-lg"
          data-ai-hint="doctor portrait"
        />
      </CardHeader>
      <CardContent className="p-6 flex-grow">
        <CardTitle className="text-2xl font-bold mb-3 text-primary">{doctor.name}</CardTitle>
        <div className="space-y-3 text-foreground/80">
          <div className="flex items-center gap-2">
            <Briefcase size={18} className="text-accent" />
            <p>{doctor.specialty}</p>
          </div>
          <div className="flex items-center gap-2">
            <MapPin size={18} className="text-accent" />
            <p>{doctor.location}</p>
          </div>
          <div className="flex items-center gap-2">
            <Globe size={18} className="text-accent" />
            <p>ولاية: {doctor.wilaya}</p>
          </div>
          <p className="text-sm text-foreground/70 line-clamp-3 pt-2 border-t border-border/50">{doctor.bio}</p>
        </div>
      </CardContent>
      <CardFooter className="p-6 border-t mt-auto">
        <Link href={`/appointments/book/${doctor.id}`} passHref className="w-full">
          <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
            <Stethoscope size={18} className="mr-2 rtl:ml-2" />
            احجز الآن
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
