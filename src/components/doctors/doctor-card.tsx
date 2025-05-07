
import Image from 'next/image';
import Link from 'next/link';
import type { Doctor } from '@/services/doctors';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Stethoscope, MapPin, Briefcase, Globe, Sparkles, Brain, Settings2, Info, Star, Award } from 'lucide-react';

interface DoctorCardProps {
  doctor: Doctor;
}

const DetailItem: React.FC<{ icon: React.ElementType; label: string; value?: string | number; isRating?: boolean; iconClassName?: string }> = ({ icon: Icon, label, value, isRating = false, iconClassName = "text-accent" }) => {
  if (value === undefined || value === null || (typeof value === 'string' && (value.trim() === '' || value.trim().toLowerCase() === 'غير محدد' || value.trim().toLowerCase() === 'لا توجد نبذة تعريفية.'))) return null;
  
  const displayValue = isRating && typeof value === 'number' ? `${value.toFixed(1)} / 5` : value;

  return (
    <div className="flex items-start gap-3 text-sm group">
      <Icon size={18} className={`${iconClassName} mt-1 shrink-0 transition-colors duration-300 group-hover:text-primary`} />
      <div className="flex-1">
        <strong className="font-semibold text-foreground/90 block mb-0.5">{label}</strong>
        {isRating && typeof value === 'number' ? (
          <span className="text-foreground/80 leading-relaxed flex items-center gap-1">
            {displayValue}
            <Star size={16} className="text-yellow-400 fill-yellow-400" />
          </span>
        ) : (
           <p className="text-foreground/70 leading-relaxed line-clamp-3">{String(displayValue)}</p>
        )}
      </div>
    </div>
  );
};


export default function DoctorCard({ doctor }: DoctorCardProps) {
  return (
    <Card className="flex flex-col overflow-hidden rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 h-full bg-card group transform hover:-translate-y-1">
      <CardHeader className="p-0 relative h-64">
        <Image
          src={doctor.imageUrl || `https://picsum.photos/seed/${doctor.id.substring(0,10)}/400/400`}
          alt={`صورة ${doctor.name}`}
          layout="fill"
          objectFit="cover"
          className="rounded-t-xl transition-transform duration-300 group-hover:scale-105"
          data-ai-hint="doctor portrait professional"
        />
        {doctor.rating && doctor.rating >= 4.5 && (
           <div className="absolute top-3 right-3 bg-primary text-primary-foreground px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1 shadow-md">
             <Award size={14}/> متميز
           </div>
        )}
      </CardHeader>
      <CardContent className="p-6 flex-grow space-y-4">
        <CardTitle className="text-2xl font-bold mb-2 text-primary group-hover:text-accent transition-colors duration-300">{doctor.name}</CardTitle>
        
        <DetailItem icon={Briefcase} label="التخصص" value={doctor.specialty} /> 
        {doctor.rating !== undefined && <DetailItem icon={Star} label="التقييم" value={doctor.rating} isRating iconClassName="text-yellow-500" />}
        <DetailItem icon={MapPin} label="عنوان العيادة" value={doctor.location} />
        <DetailItem icon={Globe} label="الولاية" value={doctor.wilaya} />

        {(doctor.bio || doctor.experience || doctor.skills || doctor.equipment) && (
            <div className="pt-4 mt-4 border-t border-border/70 space-y-4">
                {doctor.bio && <DetailItem icon={Info} label="نبذة تعريفية" value={doctor.bio} />}
                <DetailItem icon={Sparkles} label="الخبرة" value={doctor.experience} />
                <DetailItem icon={Brain} label="المهارات والإجراءات" value={doctor.skills} />
                <DetailItem icon={Settings2} label="المعدات والتجهيزات" value={doctor.equipment} />
            </div>
        )}
      </CardContent>
      <CardFooter className="p-6 border-t mt-auto bg-muted/30 rounded-b-xl">
        <Link href={`/appointments/book/${doctor.id}`} passHref className="w-full">
          <Button size="lg" className="w-full bg-primary hover:bg-primary/80 text-primary-foreground text-base py-3 rounded-lg shadow hover:shadow-md transition-all duration-300 transform hover:scale-105">
            <Stethoscope size={20} className="mr-2 rtl:ml-2" />
            احجز الآن
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
