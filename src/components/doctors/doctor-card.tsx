
import Image from 'next/image';
import Link from 'next/link';
import type { Doctor } from '@/services/doctors';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Briefcase, MapPin, Star, Award, CalendarDays, Globe } from 'lucide-react';

interface DoctorCardProps {
  doctor: Doctor;
}

const DetailItem: React.FC<{ icon: React.ElementType; value?: string | number | null; isRating?: boolean; iconClassName?: string; lineClamp?: string, srLabel: string }> = ({ icon: Icon, value, isRating = false, iconClassName = "text-accent", lineClamp = "line-clamp-1", srLabel }) => {
  if (value === undefined || value === null || (typeof value === 'string' && (value.trim() === '' || value.trim().toLowerCase() === 'غير محدد'))) return null;
  
  const displayValue = isRating && typeof value === 'number' ? `${value.toFixed(1)} / 5` : String(value);

  return (
    <div className="flex items-center gap-1.5 text-xs group">
       <Icon size={14} className={`${iconClassName} shrink-0 transition-colors duration-300 group-hover:text-primary`} strokeWidth={1.5}/>
       <span className="sr-only">{srLabel}:</span>
      {isRating && typeof value === 'number' ? (
        <span className="text-foreground/70 leading-relaxed flex items-center gap-1">
          {displayValue}
          <Star size={12} className="text-yellow-400 fill-yellow-400" />
        </span>
      ) : (
         <p className={`text-foreground/70 leading-relaxed ${lineClamp}`}>{displayValue}</p>
      )}
    </div>
  );
};


export default function DoctorCard({ doctor }: DoctorCardProps) {
  return (
    <Card className="flex flex-col overflow-hidden rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 h-full bg-card group transform hover:-translate-y-1">
      <CardHeader className="p-0 relative">
        <div className="aspect-[16/10] w-full relative">
            <Image
            src={doctor.imageUrl || `https://picsum.photos/seed/${doctor.id.substring(0,10)}/320/200`}
            alt={`صورة ${doctor.name}`}
            layout="fill"
            objectFit="cover"
            className="rounded-t-xl transition-transform duration-300 group-hover:scale-105"
            data-ai-hint="doctor portrait professional"
            />
        </div>
        {doctor.rating && doctor.rating >= 4.5 && (
           <div className="absolute top-2.5 right-2.5 bg-primary text-primary-foreground px-2.5 py-1 rounded-full text-[10px] font-semibold flex items-center gap-1 shadow-md z-10">
             <Award size={12}/> متميز
           </div>
        )}
      </CardHeader>
      <CardContent className="p-4 flex-grow space-y-2.5">
        <CardTitle className="text-lg font-bold mb-1 text-primary group-hover:text-accent transition-colors duration-300 line-clamp-1">{doctor.name}</CardTitle>
        
        <div className="space-y-1.5 text-sm">
            <DetailItem icon={Briefcase} value={doctor.specialty} lineClamp="line-clamp-1" srLabel="التخصص" />
            {doctor.rating !== undefined && doctor.rating !== null && <DetailItem icon={Star} value={doctor.rating} isRating iconClassName="text-yellow-500" srLabel="التقييم" />}
            <DetailItem icon={Globe} value={doctor.wilaya} lineClamp="line-clamp-1" srLabel="الولاية"/>
            {/* يمكنك إضافة المزيد من التفاصيل هنا إذا لزم الأمر، مع الحرص على الإيجاز */}
        </div>
      </CardContent>
      <CardFooter className="p-3 border-t bg-muted/30 rounded-b-xl mt-auto">
        <Link href={`/appointments/book/${doctor.id}`} passHref className="w-full">
          <Button size="sm" className="w-full bg-accent hover:bg-accent/90 text-accent-foreground text-sm py-2.5 rounded-md shadow-md hover:shadow-lg transition-all duration-300 transform group-hover:scale-105">
            <CalendarDays size={16} className="mr-2 rtl:ml-2" />
            احجز موعد الآن
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
