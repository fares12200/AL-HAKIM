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
import { Loader2, BriefcaseMedical, Save, Globe, MapPinIcon, Brain, Sparkles, Settings2, Star } from 'lucide-react';
import { db } from '@/lib/firebase'; // For Firestore operations
import { getAllAlgerianWilayas, getUniqueSpecialties as fetchAllSpecialties, updateDoctorProfileInMock, type Doctor } from '@/services/doctors'; // For dropdowns and mock update
import Image from 'next/image';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';

// Schema for doctor profile
const doctorProfileSchema = z.object({
  displayName: z.string().min(2, { message: "الاسم يجب أن يكون حرفين على الأقل." }),
  email: z.string().email({ message: "البريد الإلكتروني غير صالح." }).readonly(),
  specialty: z.string({ required_error: "يرجى اختيار التخصص."}).min(1, "يرجى اختيار التخصص."),
  wilaya: z.string({ required_error: "يرجى اختيار الولاية."}).min(1, "يرجى اختيار الولاية."),
  location: z.string().min(5, { message: "يرجى إدخال عنوان العيادة (5 أحرف على الأقل)."}),
  bio: z.string().max(1000, "السيرة الذاتية يجب ألا تتجاوز 1000 حرف.").optional(),
  phoneNumber: z.string().optional(),
  experience: z.string().max(500, "وصف الخبرة يجب ألا يتجاوز 500 حرف.").optional(),
  skills: z.string().max(500, "المهارات يجب ألا تتجاوز 500 حرف.").optional(), // Could be comma-separated
  equipment: z.string().max(500, "المعدات يجب ألا تتجاوز 500 حرف.").optional(), // Could be comma-separated
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
      rating: 4.0, // Default rating
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
            const data = userDoc.data() as Partial<Doctor> & { name?: string }; // Cast as DoctorProfileData
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
              imageUrl: data.imageUrl || `https://picsum.photos/seed/${user.uid.substring(0,10)}/300/300`,
              rating: data.rating === undefined ? 4.0 : Number(data.rating), // Ensure rating is a number
            });
            setImagePreview(data.imageUrl || `https://picsum.photos/seed/${user.uid.substring(0,10)}/300/300`);
          } else {
             form.reset({
                displayName: user.displayName || '',
                email: user.email || '',
                imageUrl: `https://picsum.photos/seed/${user.uid.substring(0,10)}/300/300`,
                rating: 4.0,
             });
             setImagePreview(`https://picsum.photos/seed/${user.uid.substring(0,10)}/300/300`);
          }
        } catch (error) {
          console.error("Error fetching doctor profile:", error);
          toast({
            title: "خطأ في تحميل البيانات",
            description: "لم نتمكن من تحميل بيانات ملفك المهني.",
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
        imageUrl: data.imageUrl || `https://picsum.photos/seed/${user.uid.substring(0,10)}/300/300`, // Default if empty
        rating: data.rating !== undefined ? Number(data.rating) : 4.0,
        updatedAt: new Date().toISOString(),
      };
      
      await updateDoctorProfileInMock(user.uid, profileDataToSave);

      toast({
        title: "تم تحديث الملف المهني",
        description: "تم حفظ بيانات ملفك المهني بنجاح.",
        variant: "default",
        className: "bg-green-500 text-white",
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
        form.setValue('imageUrl', dataUri); // This will be a data URI
        setImagePreview(dataUri);
        toast({ title: "تنبيه", description: "الصورة المرفوعة هي Data URI. في تطبيق حقيقي، يتم رفعها لسيرفر."});
      };
      reader.readAsDataURL(file);
    } else { // If user clears selection or provides URL via text input
        const urlValue = form.getValues('imageUrl');
        if (urlValue && urlValue.startsWith('http')) {
            setImagePreview(urlValue);
        } else if (!urlValue) {
             setImagePreview(`https://picsum.photos/seed/${user?.uid.substring(0,10)}/300/300`);
        }
    }
  };


  if (authLoading || isLoadingData || !user || user.role !== 'doctor') {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-4 text-lg text-muted-foreground">جاري تحميل بيانات الملف المهني...</p>
      </div>
    );
  }

  return (
    <Card className="max-w-3xl mx-auto shadow-xl">
      <CardHeader className="text-center">
        <BriefcaseMedical className="mx-auto text-primary mb-4" size={48} />
        <CardTitle className="text-3xl font-bold text-primary">ملفي المهني</CardTitle>
        <CardDescription>قم بتحديث معلوماتك المهنية لتظهر للمرضى بشكل صحيح.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="flex flex-col items-center space-y-4">
                <Label htmlFor="profileImage" className="text-md">الصورة الشخصية</Label>
                <div className="relative w-32 h-32 rounded-full overflow-hidden border-2 border-primary">
                {imagePreview ? (
                    <Image src={imagePreview} alt="معاينة الصورة" layout="fill" objectFit="cover" data-ai-hint="doctor profile" />
                ) : (
                    <div className="w-full h-full bg-muted flex items-center justify-center text-muted-foreground">
                    لا توجد صورة
                    </div>
                )}
                </div>
                 <FormField
                    control={form.control}
                    name="imageUrl"
                    render={({ field }) => (
                        <FormItem className="w-full max-w-sm">
                        <FormLabel className="sr-only">رابط الصورة الشخصية</FormLabel>
                        <FormControl>
                            <Input 
                                type="text" 
                                placeholder="أو أدخل رابط الصورة هنا" 
                                {...field} 
                                onChange={(e) => {
                                    field.onChange(e); // RHF update
                                    setImagePreview(e.target.value || `https://picsum.photos/seed/${user?.uid.substring(0,10)}/300/300`);
                                }}
                                value={field.value || ''}
                            />
                        </FormControl>
                        <FormDescription>يمكنك رفع صورة أو إدخال رابط صورة عام (مثل Picsum, Unsplash).</FormDescription>
                        <FormMessage />
                        </FormItem>
                    )}
                />
                <Input 
                    id="profileImageUpload" 
                    type="file" 
                    accept="image/*" 
                    onChange={handleImageChange} 
                    className="text-sm max-w-sm"
                />
                <FormDescription className="max-w-sm text-center">أو قم برفع صورة من جهازك (سيتم تحويلها إلى Data URI).</FormDescription>

            </div>


            <FormField
              control={form.control}
              name="displayName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-md">الاسم الكامل (كما سيظهر للمرضى)</FormLabel>
                  <FormControl>
                    <Input placeholder="مثال: د. اسمك الكامل" {...field} />
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
                    <Input type="email" placeholder="بريدك الإلكتروني" {...field} readOnly className="bg-muted/50 cursor-not-allowed"/>
                  </FormControl>
                  <FormDescription>لا يمكن تغيير البريد الإلكتروني للحساب حالياً.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="specialty"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-md">التخصص الطبي</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="اختر تخصصك" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {specialties.map((spec) => (
                          <SelectItem key={spec} value={spec} className="text-right">{spec}</SelectItem>
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
                    <FormLabel className="text-md">رقم هاتف العيادة (اختياري)</FormLabel>
                    <FormControl>
                      <Input type="tel" placeholder="للتواصل والاستفسارات" {...field} value={field.value || ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid md:grid-cols-2 gap-6">
                 <FormField
                    control={form.control}
                    name="wilaya"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel className="text-md flex items-center gap-1"><Globe size={16}/> الولاية</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value} defaultValue={field.value}>
                        <FormControl>
                            <SelectTrigger>
                            <SelectValue placeholder="اختر ولاية العيادة" />
                            </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                            {algerianWilayas.map((wil) => (
                            <SelectItem key={wil} value={wil} className="text-right">{wil}</SelectItem>
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
                        <Input placeholder="مثال: حي النصر، شارع الاستقلال، رقم 15" {...field} />
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
                  <FormLabel className="text-md">نبذة تعريفية / سيرة ذاتية (اختياري)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="اذكر خبراتك، شهاداتك، أو أي معلومات إضافية تود مشاركتها مع المرضى..." className="min-h-[150px]" {...field} value={field.value || ''}/>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="experience"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-md flex items-center gap-1"><Sparkles size={16}/> الخبرة المهنية</FormLabel>
                  <FormControl>
                    <Textarea placeholder="مثال: 10 سنوات خبرة في مستشفى X، متخصص في Y..." className="min-h-[100px]" {...field} value={field.value || ''}/>
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
                  <FormLabel className="text-md flex items-center gap-1"><Brain size={16}/> المهارات والإجراءات</FormLabel>
                  <FormControl>
                    <Textarea placeholder="مثال: تخطيط صدى القلب, تركيب دعامات, علاج بالليزر (يفضل فصلها بفاصلة)" className="min-h-[100px]" {...field} value={field.value || ''}/>
                  </FormControl>
                  <FormDescription>اذكر المهارات أو الإجراءات الطبية الخاصة التي تقدمها.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="equipment"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-md flex items-center gap-1"><Settings2 size={16}/> المعدات والأجهزة الخاصة بالعيادة</FormLabel>
                  <FormControl>
                    <Textarea placeholder="مثال: جهاز سونار رباعي الأبعاد, جهاز تخطيط دماغ (يفضل فصلها بفاصلة)" className="min-h-[100px]" {...field} value={field.value || ''}/>
                  </FormControl>
                  <FormDescription>اذكر أي معدات أو أجهزة متطورة متوفرة في عيادتك.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="rating"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-md flex items-center gap-1"><Star size={16}/> التقييم (لأغراض العرض فقط)</FormLabel>
                  <FormControl>
                    <div className="flex items-center gap-4">
                       <Slider
                        value={[field.value ?? 4.0]}
                        max={5}
                        step={0.1}
                        onValueChange={(value) => field.onChange(value[0])}
                        className="w-[calc(100%-4rem)]"
                      />
                      <span className="text-lg font-semibold w-16 text-center">{(field.value ?? 4.0).toFixed(1)}</span>
                    </div>
                  </FormControl>
                   <FormDescription>هذا الحقل لأغراض العرض والتجربة. في تطبيق حقيقي، يتم حسابه بناءً على تقييمات المرضى.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <Button type="submit" className="w-full bg-accent hover:bg-accent/90 text-accent-foreground text-lg py-3" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  جاري الحفظ...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-5 w-5" />
                  حفظ التغييرات
                </>
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

