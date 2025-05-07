'use client';

import { useState, useEffect, useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Filter, Search, MapPin, RotateCcw, Loader2, Briefcase, Globe } from 'lucide-react';
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
    setName(searchParams.get('name') || '');
    setSelectedSpecialty(searchParams.get('specialty') || ALL_FILTER_VALUE);
    setSelectedWilaya(searchParams.get('wilaya') || ALL_FILTER_VALUE);
  }, [searchParams]);

  const handleSearch = () => {
    const params = new URLSearchParams(searchParams.toString()); // Preserve existing params like lat/lng if any
    if (name.trim()) params.set('name', name.trim());
    else params.delete('name');

    if (selectedSpecialty && selectedSpecialty !== ALL_FILTER_VALUE) params.set('specialty', selectedSpecialty);
    else params.delete('specialty');

    if (selectedWilaya && selectedWilaya !== ALL_FILTER_VALUE) params.set('wilaya', selectedWilaya);
    else params.delete('wilaya');
    
    // If filters are applied, remove lat/lng to avoid conflicting searches unless explicitly using geo
    if (name.trim() || (selectedSpecialty && selectedSpecialty !== ALL_FILTER_VALUE) || (selectedWilaya && selectedWilaya !== ALL_FILTER_VALUE)) {
        if (!params.has('geo_triggered')) { // Add a flag to know if geo search was specifically triggered
            params.delete('lat');
            params.delete('lng');
        }
    }
    params.delete('geo_triggered'); // Clean up the flag

    startTransition(() => {
      router.push(`/appointments?${params.toString()}`, { scroll: false });
    });
  };

  const handleResetFilters = () => {
    setName('');
    setSelectedSpecialty(ALL_FILTER_VALUE);
    setSelectedWilaya(ALL_FILTER_VALUE);
    startTransition(() => {
      router.push('/appointments', { scroll: false });
    });
  };
  
  const handleGeoLocationSearch = () => {
    if (!navigator.geolocation) {
      toast({
        title: "خاصية تحديد الموقع غير مدعومة",
        description: "متصفحك لا يدعم تحديد الموقع الجغرافي. يرجى التحقق من إعدادات المتصفح أو استخدام متصفح آخر.",
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
        params.set('geo_triggered', 'true'); // Flag that geo was used

        // Optionally, keep other filters if user wants to refine geo search
        // For now, we clear other filters for a pure geo search
        // if (name.trim()) params.set('name', name.trim());
        // if (selectedSpecialty && selectedSpecialty !== ALL_FILTER_VALUE) params.set('specialty', selectedSpecialty);
        
        startTransition(() => {
          router.push(`/appointments?${params.toString()}`, { scroll: false });
        });
        setIsLocating(false);
        toast({
          title: "تم تحديد موقعك بنجاح",
          description: "جاري البحث عن أطباء بالقرب منك...",
          variant: "default",
          className: "bg-green-500 text-white border-green-600",
        });
      },
      (error) => {
        setIsLocating(false);
        console.error("Error getting location:", error);
        let description = "حدث خطأ غير متوقع أثناء محاولة تحديد موقعك.";
        if (error.code === error.PERMISSION_DENIED) {
          description = "تم رفض إذن الوصول إلى الموقع. يرجى تمكين تحديد الموقع للمتصفح والمحاولة مرة أخرى.";
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          description = "معلومات الموقع غير متوفرة حالياً. يرجى التأكد من أن خدمة GPS أو تحديد المواقع مفعلة.";
        } else if (error.code === error.TIMEOUT) {
          description = "انتهت مهلة طلب تحديد الموقع. يرجى المحاولة مرة أخرى في مكان به استقبال أفضل.";
        }
        toast({
          title: "خطأ في تحديد الموقع",
          description: description,
          variant: "destructive",
        });
      },
      { timeout: 10000, enableHighAccuracy: true } 
    );
  };


  return (
    <Card className="shadow-xl rounded-xl mb-10 md:mb-12">
      <CardHeader className="border-b pb-6">
        <div className="flex items-center gap-3">
            <Filter size={32} className="text-primary" strokeWidth={1.5}/>
            <div>
                <CardTitle className="text-2xl md:text-3xl font-bold text-primary">
                فلاتر البحث المتقدمة
                </CardTitle>
                <CardDescription className="text-md md:text-lg text-muted-foreground mt-1">
                    استخدم هذه الفلاتر لتضييق نطاق البحث والعثور على الطبيب المناسب لك.
                </CardDescription>
            </div>
        </div>
      </CardHeader>
      <CardContent className="p-6 md:p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 mb-8">
          {/* Name Search */}
          <div className="space-y-2">
            <label htmlFor="doctorName" className="text-md font-semibold text-foreground/90 flex items-center gap-1.5">
              <Search size={18}/> اسم الطبيب
            </label>
            <Input
              id="doctorName"
              type="text"
              placeholder="ابحث بالاسم أو جزء منه..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="text-base py-3 rounded-md"
            />
          </div>

          {/* Specialty Select */}
          <div className="space-y-2">
            <label htmlFor="specialty" className="text-md font-semibold text-foreground/90 flex items-center gap-1.5">
              <Briefcase size={18}/> التخصص الطبي
            </label>
            <Select value={selectedSpecialty} onValueChange={setSelectedSpecialty}>
              <SelectTrigger id="specialty" className="text-base py-3 rounded-md">
                <SelectValue placeholder="اختر التخصص المطلوب" />
              </SelectTrigger>
              <SelectContent className="rounded-md shadow-lg">
                <SelectItem value={ALL_FILTER_VALUE} className="text-right py-2.5 text-base">الكل</SelectItem>
                {specialties.map((spec) => (
                  <SelectItem key={spec} value={spec} className="text-right py-2.5 text-base">
                    {spec}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Wilaya Select */}
          <div className="space-y-2">
            <label htmlFor="wilaya" className="text-md font-semibold text-foreground/90 flex items-center gap-1.5">
              <Globe size={18}/> الولاية
            </label>
            <Select value={selectedWilaya} onValueChange={setSelectedWilaya}>
              <SelectTrigger id="wilaya" className="text-base py-3 rounded-md">
                <SelectValue placeholder="اختر الولاية" />
              </SelectTrigger>
              <SelectContent className="rounded-md shadow-lg">
                <SelectItem value={ALL_FILTER_VALUE} className="text-right py-2.5 text-base">الكل</SelectItem>
                {wilayas.map((wil) => (
                  <SelectItem key={wil} value={wil} className="text-right py-2.5 text-base">
                    {wil}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-between items-center">
          <Button
            onClick={handleGeoLocationSearch}
            variant="outline"
            className="w-full sm:w-auto border-primary text-primary hover:bg-primary/10 text-md py-3 rounded-lg shadow-sm hover:shadow-md transition-all"
            disabled={isPending || isLocating}
          >
            {isLocating ? (
              <Loader2 className="mr-2 h-5 w-5 animate-spin rtl:ml-2" />
            ) : (
              <MapPin className="mr-2 h-5 w-5 rtl:ml-2" />
            )}
            البحث قرب موقعي
          </Button>
          <div className="flex gap-4 w-full sm:w-auto">
            <Button
                onClick={handleResetFilters}
                variant="ghost"
                className="w-full sm:w-auto text-muted-foreground hover:text-destructive text-md py-3 rounded-lg hover:bg-destructive/10 transition-colors"
                disabled={isPending}
            >
                <RotateCcw className="mr-2 h-5 w-5 rtl:ml-2" />
                إعادة التعيين
            </Button>
            <Button
                onClick={handleSearch}
                className="w-full sm:w-auto bg-accent hover:bg-accent/90 text-accent-foreground text-md py-3 rounded-lg shadow-md hover:shadow-lg transition-all"
                disabled={isPending || isLocating}
            >
                {isPending ? <Loader2 className="mr-2 h-5 w-5 animate-spin rtl:ml-2" /> : <Search className="mr-2 h-5 w-5 rtl:ml-2" />}
                تطبيق الفلاتر
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
