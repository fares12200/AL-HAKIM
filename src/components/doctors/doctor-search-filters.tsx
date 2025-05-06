// src/components/doctors/doctor-search-filters.tsx
'use client';

import { useState, useEffect, useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Filter, Search, MapPin, RotateCcw, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface DoctorSearchFiltersProps {
  specialties: string[];
  wilayas: string[];
}

const ALL_FILTER_VALUE = '__ALL_ITEMS__';

export default function DoctorSearchFilters({ specialties, wilayas }: DoctorSearchFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const [name, setName] = useState(searchParams.get('name') || '');
  const [selectedSpecialty, setSelectedSpecialty] = useState(searchParams.get('specialty') || ALL_FILTER_VALUE);
  const [selectedWilaya, setSelectedWilaya] = useState(searchParams.get('wilaya') || ALL_FILTER_VALUE);
  const [isLocating, setIsLocating] = useState(false);

  useEffect(() => {
    // Pre-fill form if query params exist
    setName(searchParams.get('name') || '');
    setSelectedSpecialty(searchParams.get('specialty') || ALL_FILTER_VALUE);
    setSelectedWilaya(searchParams.get('wilaya') || ALL_FILTER_VALUE);
  }, [searchParams]);

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (name) params.set('name', name);
    if (selectedSpecialty && selectedSpecialty !== ALL_FILTER_VALUE) {
      params.set('specialty', selectedSpecialty);
    }
    if (selectedWilaya && selectedWilaya !== ALL_FILTER_VALUE) {
      params.set('wilaya', selectedWilaya);
    }
    
    startTransition(() => {
      router.push(`/appointments?${params.toString()}`);
    });
  };

  const handleResetFilters = () => {
    setName('');
    setSelectedSpecialty(ALL_FILTER_VALUE);
    setSelectedWilaya(ALL_FILTER_VALUE);
    startTransition(() => {
      router.push('/appointments');
    });
  };
  
  const handleGeoLocationSearch = () => {
    if (!navigator.geolocation) {
      toast({
        title: "خاصية تحديد الموقع غير مدعومة",
        description: "متصفحك لا يدعم تحديد الموقع الجغرافي.",
        variant: "destructive",
      });
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const params = new URLSearchParams();
        params.set('lat', latitude.toString());
        params.set('lng', longitude.toString());
        // Keep other filters if they are set
        if (name) params.set('name', name);
        if (selectedSpecialty && selectedSpecialty !== ALL_FILTER_VALUE) {
          params.set('specialty', selectedSpecialty);
        }
        // Wilaya might be less relevant with geo-search but can be kept if desired
        // if (selectedWilaya && selectedWilaya !== ALL_FILTER_VALUE) params.set('wilaya', selectedWilaya);

        startTransition(() => {
          router.push(`/appointments?${params.toString()}`);
        });
        setIsLocating(false);
        toast({
          title: "تم تحديد موقعك",
          description: "جاري البحث عن أطباء بالقرب منك...",
        });
      },
      (error) => {
        setIsLocating(false);
        console.error("Error getting location:", error);
        let description = "حدث خطأ أثناء محاولة تحديد موقعك.";
        if (error.code === error.PERMISSION_DENIED) {
          description = "تم رفض إذن الوصول إلى الموقع. يرجى تمكين تحديد الموقع للمتصفح.";
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          description = "معلومات الموقع غير متوفرة حالياً.";
        } else if (error.code === error.TIMEOUT) {
          description = "انتهت مهلة طلب تحديد الموقع.";
        }
        toast({
          title: "خطأ في تحديد الموقع",
          description: description,
          variant: "destructive",
        });
      },
      { timeout: 10000 } // 10 seconds timeout
    );
  };


  return (
    <Card className="shadow-lg mb-8">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-primary">
          <Filter size={24} />
          فلاتر البحث عن الأطباء
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Name Search */}
          <div className="space-y-2">
            <label htmlFor="doctorName" className="font-medium text-foreground/90">
              اسم الطبيب
            </label>
            <Input
              id="doctorName"
              type="text"
              placeholder="ابحث باسم الطبيب..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="text-base"
            />
          </div>

          {/* Specialty Select */}
          <div className="space-y-2">
            <label htmlFor="specialty" className="font-medium text-foreground/90">
              التخصص الطبي
            </label>
            <Select value={selectedSpecialty} onValueChange={setSelectedSpecialty}>
              <SelectTrigger id="specialty" className="text-base">
                <SelectValue placeholder="اختر التخصص" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL_FILTER_VALUE}>الكل</SelectItem>
                {specialties.map((spec) => (
                  <SelectItem key={spec} value={spec} className="text-right">
                    {spec}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Wilaya Select */}
          <div className="space-y-2">
            <label htmlFor="wilaya" className="font-medium text-foreground/90">
              الولاية
            </label>
            <Select value={selectedWilaya} onValueChange={setSelectedWilaya}>
              <SelectTrigger id="wilaya" className="text-base">
                <SelectValue placeholder="اختر الولاية" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL_FILTER_VALUE}>الكل</SelectItem>
                {wilayas.map((wil) => (
                  <SelectItem key={wil} value={wil} className="text-right">
                    {wil}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="mt-6 flex flex-col sm:flex-row gap-4 justify-end">
          <Button
            onClick={handleGeoLocationSearch}
            variant="outline"
            className="w-full sm:w-auto border-primary text-primary hover:bg-primary/10"
            disabled={isPending || isLocating}
          >
            {isLocating ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              <MapPin size={20} />
            )}
            البحث قرب موقعي الحالي
          </Button>
          <Button
            onClick={handleResetFilters}
            variant="ghost"
            className="w-full sm:w-auto text-muted-foreground hover:text-destructive"
            disabled={isPending}
          >
            <RotateCcw size={20} />
            إعادة تعيين الفلاتر
          </Button>
          <Button
            onClick={handleSearch}
            className="w-full sm:w-auto bg-accent hover:bg-accent/90 text-accent-foreground"
            disabled={isPending || isLocating}
          >
            {isPending ? <Loader2 className="animate-spin" size={20} /> : <Search size={20} />}
            بحث
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

