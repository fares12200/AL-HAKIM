
import Image from 'next/image';
import Link from 'next/link';
import type { Doctor } from '@/services/doctors';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Stethoscope, MapPin, Briefcase, Globe, Sparkles, Brain, Settings2, Info, Star } from 'lucide-react';

interface DoctorCardProps {
  doctor: Doctor;
}

const DetailItem: React.FC<{ icon: React.ElementType; label: string; value?: string | number; isRating?: boolean }> = ({ icon: Icon, label, value, isRating = false }) => {
  if (value === undefined || value === null || (typeof value === 'string' && (value.trim() === '' || value.trim().toLowerCase() === 'غير محدد' || value.trim().toLowerCase() === 'لا توجد نبذة تعريفية.'))) return null;
  
  const displayValue = isRating && typeof value === 'number' ? `${value.toFixed(1)} / 5` : value;

  return (
    <div className="flex items-start gap-2 text-sm">
      <Icon size={16} className="text-accent mt-0.5 shrink-0" />
      <div>
        <strong className="font-medium">{label}:</strong>
        {isRating && typeof value === 'number' ? (
          <span className="text-foreground/80 leading-relaxed flex items-center gap-1">
            {displayValue}
            <Star size={14} className="text-yellow-400 fill-yellow-400" />
          </span>
        ) : (
           <p className="text-foreground/80 leading-relaxed">{String(displayValue)}</p>
        )}
      </div>
    </div>
  );
};


export default function DoctorCard({ doctor }: DoctorCardProps) {
  return (
    <Card className="flex flex-col overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 h-full">
      <CardHeader className="p-0 relative h-56">
        <Image
          src={doctor.imageUrl || `https://picsum.photos/seed/${doctor.id.substring(0,10)}/300/300`}
          alt={`صورة ${doctor.name}`}
          layout="fill"
          objectFit="cover"
          className="rounded-t-lg"
          data-ai-hint="doctor portrait"
        />
      </CardHeader>
      <CardContent className="p-6 flex-grow">
        <CardTitle className="text-2xl font-bold mb-3 text-primary">{doctor.name}</CardTitle>
        <div className="space-y-3">
          <DetailItem icon={Briefcase} label="التخصص" value={doctor.specialty} /> 
          <DetailItem icon={MapPin} label="عنوان العيادة" value={doctor.location} />
          <DetailItem icon={Sparkles} label="الخبرة" value={doctor.experience} />
          {doctor.rating !== undefined && <DetailItem icon={Star} label="التقييم" value={doctor.rating} isRating />}
          <DetailItem icon={Globe} label="الولاية" value={doctor.wilaya} />
          
          {doctor.bio && <DetailItem icon={Info} label="نبذة تعريفية" value={doctor.bio} />}

          {(doctor.skills || doctor.equipment) && (
            <div className="pt-3 mt-3 border-t border-border/50 space-y-3">
                <DetailItem icon={Brain} label="المهارات والإجراءات" value={doctor.skills} />
                <DetailItem icon={Settings2} label="المعدات والتجهيزات" value={doctor.equipment} />
            </div>
          )}
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

