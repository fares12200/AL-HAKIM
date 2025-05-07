'use client';

import { useAuth } from '@/contexts/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { Loader2, BriefcaseMedical, Save, Globe, MapPinIcon, Brain, Sparkles, Settings2, Star, ImagePlus, Phone, UserSquare2, Palette } from 'lucide-react';
import { db } from '@/lib/firebase'; 
import { getAllAlgerianWilayas, getUniqueSpecialties as fetchAllSpecialties, updateDoctorProfileInMock, type Doctor } from '@/services/doctors'; 
import Image from 'next/image';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';

const doctorProfileSchema = z.object({
  displayName: z.string().min(2, { message: "الاسم يجب أن يكون حرفين على الأقل." }).max(60, { message: "الاسم طويل جدًا."}),
  email: z.string().email({ message: "البريد الإلكتروني غير صالح." }).readonly(),
  specialty: z.string({ required_error: "يرجى اختيار التخصص."}).min(1, "يرجى اختيار التخصص."),
  wilaya: z.string({ required_error: "يرجى اختيار الولاية."}).min(1, "يرجى اختيار الولاية."),
  location: z.string().min(5, { message: "يرجى إدخال عنوان العيادة (5 أحرف على الأقل)."}).max(150, {message: "العنوان طويل جدًا."}),
  bio: z.string().max(1500, "السيرة الذاتية يجب ألا تتجاوز 1500 حرف.").optional(),
  phoneNumber: z.string().regex(/^0[5-7][0-9]{8}$/, {message: "رقم الهاتف غير صالح (يجب أن يبدأ بـ 05، 06، أو 07 ويحتوي على 10 أرقام)."}).optional().or(z.literal('')),
  experience: z.string().max(700, "وصف الخبرة يجب ألا يتجاوز 700 حرف.").optional(),
  skills: z.string().max(700, "المهارات يجب ألا تتجاوز 700 حرف.").optional(), 
  equipment: z.string().max(700, "المعدات يجب ألا تتجاوز 700 حرف.").optional(), 
  imageUrl: z.string().url({ message: "الرجاء إدخال رابط صورة صحيح أو تركه فارغًا." }).optional().or(z.literal('')),
  rating: z.number().min(0).max(5).optional(),
});

type DoctorProfileFormValues = z.infer<typeof doctorProfileSchema>;


export default function DoctorProfilePage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [algerianWilayas, setAlgerianWilayas] = useState<string[]>([]);
  const [specialties, setSpecialties] = useState<string[]>([]);
  const [imagePreview, setImagePreview] = useState<string | null>(null);


  const form = useForm<DoctorProfileFormValues>({
    resolver: zodResolver(doctorProfileSchema),
    defaultValues: {
      displayName: '',
      email: '',
      specialty: '',
      wilaya: '',
      location: '',
      bio: '',
      phoneNumber: '',
      experience: '',
      skills: '',
      equipment: '',
      imageUrl: '',
      rating: 4.0, 
    },
  });

  useEffect(() => {
    const loadDropdownData = async () => {
        setAlgerianWilayas(getAllAlgerianWilayas());
        setSpecialties(await fetchAllSpecialties());
    };
    loadDropdownData();

    if (!authLoading && !user) {
      router.push('/auth/login?message=Please login to access your profile.');
    } else if (!authLoading && user && user.role !== 'doctor') {
      router.push('/auth/login?message=Access denied.');
    } else if (user) {
      const fetchProfile = async () => {
        setIsLoadingData(true);
        try {
          const userDocRefPath = `users/${user.uid}`; 
          const userDoc = await db.getDoc(userDocRefPath);
          
          if (userDoc.exists()) {
            const data = userDoc.data() as Partial<Doctor> & { name?: string }; 
            form.reset({
              displayName: data.name || user.displayName || '',
              email: data.email || user.email || '',
              specialty: data.specialty || '',
              wilaya: data.wilaya || '',
              location: data.location || '',
              bio: data.bio || '',
              phoneNumber: data.phoneNumber || '',
              experience: data.experience || '',
              skills: data.skills || '',
              equipment: data.equipment || '',
              imageUrl: data.imageUrl || `https://picsum.photos/seed/${user.uid.substring(0,10)}/400/400`,
              rating: data.rating === undefined ? 4.0 : Number(data.rating),
            });
            setImagePreview(data.imageUrl || `https://picsum.photos/seed/${user.uid.substring(0,10)}/400/400`);
          } else {
             form.reset({
                displayName: user.displayName || '',
                email: user.email || '',
                imageUrl: `https://picsum.photos/seed/${user.uid.substring(0,10)}/400/400`,
                rating: 4.0,
             });
             setImagePreview(`https://picsum.photos/seed/${user.uid.substring(0,10)}/400/400`);
          }
        } catch (error) {
          console.error("Error fetching doctor profile:", error);
          toast({
            title: "خطأ في تحميل البيانات",
            description: "لم نتمكن من تحميل بيانات ملفك المهني. يرجى المحاولة مرة أخرى.",
            variant: "destructive",
          });
        } finally {
          setIsLoadingData(false);
        }
      };
      fetchProfile();
    }
  }, [user, authLoading, router, form, toast]);

  const onSubmit = async (data: DoctorProfileFormValues) => {
    if (!user) return;
    setIsSubmitting(true);
    try {
      const profileDataToSave: Partial<Doctor> & {name: string, email: string, updatedAt: string} = {
        name: data.displayName,
        email: data.email,
        specialty: data.specialty,
        wilaya: data.wilaya,
        location: data.location,
        bio: data.bio,
        phoneNumber: data.phoneNumber,
        experience: data.experience,
        skills: data.skills,
        equipment: data.equipment,
        imageUrl: data.imageUrl || `https://picsum.photos/seed/${user.uid.substring(0,10)}/400/400`,
        rating: data.rating !== undefined ? Number(data.rating) : 4.0,
        updatedAt: new Date().toISOString(),
      };
      
      await updateDoctorProfileInMock(user.uid, profileDataToSave);

      toast({
        title: "تم تحديث الملف المهني بنجاح!",
        description: "تم حفظ بيانات ملفك المهني وسيتم عرضها للمرضى.",
        variant: "default",
        className: "bg-green-500 text-white border-green-600",
      });
    } catch (error) {
      console.error("Error updating doctor profile:", error);
      toast({
        title: "خطأ في تحديث الملف",
        description: "حدث خطأ أثناء محاولة حفظ البيانات. يرجى المحاولة مرة أخرى.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUri = reader.result as string;
        form.setValue('imageUrl', dataUri); 
        setImagePreview(dataUri);
        toast({ title: "تنبيه", description: "سيتم استخدام الصورة المرفوعة كـ Data URI. في تطبيق حقيقي، يتم رفعها إلى خادم تخزين.", className: "bg-yellow-500 text-black border-yellow-600"});
      };
      reader.readAsDataURL(file);
    } else { 
        const urlValue = form.getValues('imageUrl');
        if (urlValue && urlValue.startsWith('http')) {
            setImagePreview(urlValue);
        } else if (!urlValue) {
             setImagePreview(`https://picsum.photos/seed/${user?.uid.substring(0,10)}/400/400`);
        }
    }
  };


  if (authLoading || isLoadingData || !user || user.role !== 'doctor') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] p-6">
        <Loader2 className="h-16 w-16 animate-spin text-primary mb-6" />
        <p className="ml-4 text-xl text-muted-foreground">جاري تحميل بيانات ملفك المهني...</p>
      </div>
    );
  }

  return (
    <Card className="max-w-4xl mx-auto shadow-xl rounded-xl">
      <CardHeader className="text-center p-8 border-b">
        <BriefcaseMedical className="mx-auto text-primary mb-6" size={56} strokeWidth={1.5} />
        <CardTitle className="text-4xl font-bold text-primary">ملفي المهني</CardTitle>
        <CardDescription className="text-lg text-muted-foreground mt-2">
            قم بتحديث معلوماتك المهنية بانتظام لتظهر للمرضى بشكل دقيق واحترافي.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-8">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-10">
            {/* Image Upload Section */}
            <FormField
                control={form.control}
                name="imageUrl"
                render={({ field }) => (
                    <FormItem className="flex flex-col items-center space-y-4 p-6 border rounded-lg bg-muted/30">
                        <FormLabel className="text-xl font-semibold text-primary flex items-center gap-2"><ImagePlus size={24}/> الصورة الشخصية</FormLabel>
                        <div className="relative w-40 h-40 rounded-full overflow-hidden border-4 border-primary shadow-md">
                        {imagePreview ? (
                            <Image src={imagePreview} alt="معاينة الصورة الشخصية" layout="fill" objectFit="cover" data-ai-hint="doctor profile professional" />
                        ) : (
                            <div className="w-full h-full bg-muted flex items-center justify-center text-muted-foreground text-sm">
                                لا توجد صورة
                            </div>
                        )}
                        </div>
                        <FormControl>
                            <Input 
                                type="text" 
                                placeholder="أو أدخل رابط الصورة هنا (URL)" 
                                {...field} 
                                onChange={(e) => {
                                    field.onChange(e); 
                                    setImagePreview(e.target.value || `https://picsum.photos/seed/${user?.uid.substring(0,10)}/400/400`);
                                }}
                                value={field.value || ''}
                                className="max-w-md text-center"
                            />
                        </FormControl>
                        <Input 
                            id="profileImageUpload" 
                            type="file" 
                            accept="image/*" 
                            onChange={handleImageChange} 
                            className="text-sm max-w-md file:mr-2 file:py-2 file:px-3 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                        />
                        <FormDescription className="max-w-md text-center text-xs">
                            يمكنك رفع صورة من جهازك (سيتم تحويلها لـ Data URI) أو إدخال رابط URL لصورة عامة.
                        </FormDescription>
                        <FormMessage />
                    </FormItem>
                )}
            />
            
            {/* Basic Information Section */}
            <div className="space-y-6 p-6 border rounded-lg bg-card">
                 <h3 className="text-xl font-semibold text-primary mb-4 flex items-center gap-2"><UserSquare2 size={24}/> المعلومات الأساسية</h3>
                <FormField
                control={form.control}
                name="displayName"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel className="text-md">الاسم الكامل (كما سيظهر للمرضى)</FormLabel>
                    <FormControl>
                        <Input placeholder="مثال: د. اسمك الكامل هنا" {...field} className="py-3 text-base"/>
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
                <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel className="text-md">البريد الإلكتروني (للاتصال)</FormLabel>
                    <FormControl>
                        <Input type="email" placeholder="بريدك الإلكتروني المسجل" {...field} readOnly className="bg-muted/50 cursor-not-allowed py-3 text-base"/>
                    </FormControl>
                    <FormDescription className="text-xs">لا يمكن تغيير البريد الإلكتروني للحساب حالياً من هنا.</FormDescription>
                    <FormMessage />
                    </FormItem>
                )}
                />
            </div>

            {/* Professional Details Section */}
             <div className="space-y-6 p-6 border rounded-lg bg-card">
                 <h3 className="text-xl font-semibold text-primary mb-4 flex items-center gap-2"><BriefcaseMedical size={24}/> التفاصيل المهنية</h3>
                <div className="grid md:grid-cols-2 gap-x-6 gap-y-8">
                <FormField
                    control={form.control}
                    name="specialty"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel className="text-md">التخصص الطبي</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value} defaultValue={field.value}>
                        <FormControl>
                            <SelectTrigger className="py-3 text-base">
                            <SelectValue placeholder="اختر تخصصك الطبي" />
                            </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                            {specialties.map((spec) => (
                            <SelectItem key={spec} value={spec} className="text-right text-base">{spec}</SelectItem>
                            ))}
                        </SelectContent>
                        </Select>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="phoneNumber"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel className="text-md flex items-center gap-1"><Phone size={16}/> رقم هاتف العيادة (اختياري)</FormLabel>
                        <FormControl>
                        <Input type="tel" placeholder="مثال: 0612345678" {...field} value={field.value || ''} className="py-3 text-base"/>
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                </div>

                <div className="grid md:grid-cols-2 gap-x-6 gap-y-8">
                    <FormField
                        control={form.control}
                        name="wilaya"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel className="text-md flex items-center gap-1"><Globe size={16}/> ولاية العيادة</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value} defaultValue={field.value}>
                            <FormControl>
                                <SelectTrigger className="py-3 text-base">
                                <SelectValue placeholder="اختر ولاية موقع العيادة" />
                                </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                {algerianWilayas.map((wil) => (
                                <SelectItem key={wil} value={wil} className="text-right text-base">{wil}</SelectItem>
                                ))}
                            </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="location"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel className="text-md flex items-center gap-1"><MapPinIcon size={16}/> عنوان العيادة التفصيلي</FormLabel>
                            <FormControl>
                            <Input placeholder="مثال: حي النصر، شارع الاستقلال، رقم 15، الطابق 2" {...field} className="py-3 text-base"/>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                </div>
            
                <FormField
                control={form.control}
                name="bio"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel className="text-md flex items-center gap-1"><Palette size={16}/> نبذة تعريفية / سيرة ذاتية (اختياري)</FormLabel>
                    <FormControl>
                        <Textarea placeholder="اذكر خبراتك، شهاداتك، فلسفتك في العلاج، أو أي معلومات إضافية تود مشاركتها مع المرضى..." className="min-h-[150px] text-base" {...field} value={field.value || ''}/>
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
            </div>

            {/* Advanced Details Section */}
             <div className="space-y-6 p-6 border rounded-lg bg-card">
                 <h3 className="text-xl font-semibold text-primary mb-4 flex items-center gap-2"><Sparkles size={24}/> تفاصيل إضافية</h3>
                <FormField
                control={form.control}
                name="experience"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel className="text-md flex items-center gap-1"><Sparkles size={16}/> الخبرة المهنية (اختياري)</FormLabel>
                    <FormControl>
                        <Textarea placeholder="مثال: 10 سنوات خبرة في مستشفى X، متخصص في Y، عملت في Z..." className="min-h-[120px] text-base" {...field} value={field.value || ''}/>
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
                <FormField
                control={form.control}
                name="skills"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel className="text-md flex items-center gap-1"><Brain size={16}/> المهارات والإجراءات (اختياري)</FormLabel>
                    <FormControl>
                        <Textarea placeholder="مثال: تخطيط صدى القلب, تركيب دعامات, علاج بالليزر (يفضل فصلها بفاصلة أو نقاط)" className="min-h-[120px] text-base" {...field} value={field.value || ''}/>
                    </FormControl>
                    <FormDescription className="text-xs">اذكر المهارات أو الإجراءات الطبية الخاصة التي تقدمها.</FormDescription>
                    <FormMessage />
                    </FormItem>
                )}
                />
                <FormField
                control={form.control}
                name="equipment"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel className="text-md flex items-center gap-1"><Settings2 size={16}/> المعدات والأجهزة الخاصة بالعيادة (اختياري)</FormLabel>
                    <FormControl>
                        <Textarea placeholder="مثال: جهاز سونار رباعي الأبعاد, جهاز تخطيط دماغ, مختبر تحاليل مدمج (يفضل فصلها بفاصلة أو نقاط)" className="min-h-[120px] text-base" {...field} value={field.value || ''}/>
                    </FormControl>
                    <FormDescription className="text-xs">اذكر أي معدات أو أجهزة متطورة متوفرة في عيادتك.</FormDescription>
                    <FormMessage />
                    </FormItem>
                )}
                />
                <FormField
                control={form.control}
                name="rating"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel className="text-md flex items-center gap-1"><Star size={16}/> التقييم (لأغراض العرض)</FormLabel>
                    <FormControl>
                        <div className="flex items-center gap-4 pt-2">
                        <Slider
                            value={[field.value ?? 4.0]}
                            max={5}
                            step={0.1}
                            onValueChange={(value) => field.onChange(value[0])}
                            className="w-[calc(100%-5rem)]"
                            aria-label="ضبط التقييم"
                        />
                        <span className="text-xl font-semibold w-20 text-center p-2 bg-primary/10 text-primary rounded-md">{(field.value ?? 4.0).toFixed(1)}</span>
                        </div>
                    </FormControl>
                    <FormDescription className="text-xs">هذا الحقل لأغراض العرض والتجربة. في تطبيق حقيقي، يتم حسابه تلقائياً بناءً على تقييمات المرضى الفعلية.</FormDescription>
                    <FormMessage />
                    </FormItem>
                )}
                />
            </div>
            
            <Button type="submit" className="w-full bg-accent hover:bg-accent/90 text-accent-foreground text-lg py-6 rounded-lg shadow-md hover:shadow-lg transition-shadow" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-6 w-6 animate-spin" />
                  جاري حفظ التغييرات...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-6 w-6" />
                  حفظ التغييرات في الملف المهني
                </>
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
