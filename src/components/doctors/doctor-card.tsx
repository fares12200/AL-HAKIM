
import Image from 'next/image';
import Link from 'next/link';
import type { Doctor } from '@/services/doctors';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Stethoscope, MapPin, Briefcase, Globe, Sparkles, Brain, Settings2, Info, Star, Award, CalendarDays, Phone } from 'lucide-react';

interface DoctorCardProps {
  doctor: Doctor;
}

const DetailItem: React.FC<{ icon: React.ElementType; label: string; value?: string | number | null; isRating?: boolean; iconClassName?: string; lineClamp?: string }> = ({ icon: Icon, label, value, isRating = false, iconClassName = "text-accent", lineClamp = "line-clamp-2" }) => {
  if (value === undefined || value === null || (typeof value === 'string' && (value.trim() === '' || value.trim().toLowerCase() === 'غير محدد' || value.trim().toLowerCase() === 'لا توجد نبذة تعريفية.'))) return null;
  
  const displayValue = isRating && typeof value === 'number' ? `${value.toFixed(1)} / 5` : String(value);

  return (
    <div className="flex items-start gap-2.5 text-xs group last:mb-0">
      <Icon size={16} className={`${iconClassName} mt-0.5 shrink-0 transition-colors duration-300 group-hover:text-primary`} strokeWidth={1.5}/>
      <div className="flex-1">
        <h4 className="font-medium text-foreground/80 block mb-0.5 text-sm">{label}</h4>
        {isRating && typeof value === 'number' ? (
          <span className="text-foreground/70 leading-relaxed flex items-center gap-1 text-sm">
            {displayValue}
            <Star size={14} className="text-yellow-400 fill-yellow-400" />
          </span>
        ) : (
           <p className={`text-foreground/60 leading-relaxed ${lineClamp} text-sm`}>{displayValue}</p>
        )}
      </div>
    </div>
  );
};


export default function DoctorCard({ doctor }: DoctorCardProps) {
  return (
    <Card className="flex flex-col overflow-hidden rounded-lg shadow-md hover:shadow-lg transition-all duration-300 h-full bg-card group transform hover:-translate-y-0.5">
      <CardHeader className="p-0 relative">
        <div className="aspect-[4/3] w-full relative"> {/* Adjusted aspect ratio */}
            <Image
            src={doctor.imageUrl || `https://picsum.photos/seed/${doctor.id.substring(0,10)}/400/300`}
            alt={`صورة ${doctor.name}`}
            layout="fill"
            objectFit="cover"
            className="rounded-t-lg transition-transform duration-300 group-hover:scale-105"
            data-ai-hint="doctor portrait professional"
            />
        </div>
        {doctor.rating && doctor.rating >= 4.5 && (
           <div className="absolute top-2.5 right-2.5 bg-primary text-primary-foreground px-2.5 py-1 rounded-full text-[10px] font-semibold flex items-center gap-1 shadow-sm z-10">
             <Award size={12}/> متميز
           </div>
        )}
      </CardHeader>
      <CardContent className="p-4 flex-grow space-y-3"> {/* Reduced padding and space */}
        <CardTitle className="text-xl font-bold mb-1 text-primary group-hover:text-accent transition-colors duration-300 line-clamp-1">{doctor.name}</CardTitle>
        
        <div className="space-y-2.5"> {/* Reduced space */}
            <DetailItem icon={Briefcase} label="التخصص" value={doctor.specialty} lineClamp="line-clamp-1"/> 
            {doctor.rating !== undefined && doctor.rating !== null && <DetailItem icon={Star} label="التقييم" value={doctor.rating} isRating iconClassName="text-yellow-500" />}
            <DetailItem icon={MapPin} label="العنوان" value={doctor.location} lineClamp="line-clamp-1"/>
            <DetailItem icon={Globe} label="الولاية" value={doctor.wilaya} />
            {doctor.phoneNumber && <DetailItem icon={Phone} label="الهاتف" value={doctor.phoneNumber} />}
        </div>

        {(doctor.bio || doctor.experience || doctor.skills || doctor.equipment) && (
            <div className="pt-2.5 mt-2.5 border-t border-border/50 space-y-2.5"> {/* Reduced padding and space */}
                {doctor.bio && <DetailItem icon={Info} label="نبذة" value={doctor.bio} lineClamp="line-clamp-2"/>}
                {doctor.experience && <DetailItem icon={Sparkles} label="الخبرة" value={doctor.experience} lineClamp="line-clamp-1"/>}
                {doctor.skills && <DetailItem icon={Brain} label="المهارات" value={doctor.skills} lineClamp="line-clamp-1"/>}
                {doctor.equipment && <DetailItem icon={Settings2} label="التجهيزات" value={doctor.equipment} lineClamp="line-clamp-1"/>}
            </div>
        )}
      </CardContent>
      <CardFooter className="p-4 border-t bg-muted/20 rounded-b-lg"> {/* Reduced padding */}
        <Link href={`/appointments/book/${doctor.id}`} passHref className="w-full">
          <Button size="default" className="w-full bg-accent hover:bg-accent/90 text-accent-foreground text-sm py-2.5 rounded-md shadow hover:shadow-md transition-all duration-300 transform group-hover:scale-105"> {/* Adjusted button size */}
            <CalendarDays size={18} className="mr-2 rtl:ml-2" />
            احجز موعد
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
