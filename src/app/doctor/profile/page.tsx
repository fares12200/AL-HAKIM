
'use client';

import { useAuth } from '@/contexts/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { Loader2, BriefcaseMedical, Save, Globe, MapPinIcon } from 'lucide-react';
import { db } from '@/lib/firebase'; // For Firestore operations
import { getAllAlgerianWilayas, getUniqueSpecialties as fetchAllSpecialties } from '@/services/doctors'; // For dropdowns

// Schema for doctor profile
const doctorProfileSchema = z.object({
  displayName: z.string().min(2, { message: "الاسم يجب أن يكون حرفين على الأقل." }),
  email: z.string().email({ message: "البريد الإلكتروني غير صالح." }).readonly(),
  specialty: z.string({ required_error: "يرجى اختيار التخصص."}).min(1, "يرجى اختيار التخصص."),
  wilaya: z.string({ required_error: "يرجى اختيار الولاية."}).min(1, "يرجى اختيار الولاية."),
  location: z.string().min(5, { message: "يرجى إدخال عنوان العيادة (5 أحرف على الأقل)."}),
  bio: z.string().max(1000, "السيرة الذاتية يجب ألا تتجاوز 1000 حرف.").optional(),
  phoneNumber: z.string().optional(),
  // availableSlots: z.array(z.string()).optional(), // For managing working hours/slots - more complex UI needed
});

type DoctorProfileFormValues = z.infer<typeof doctorProfileSchema>;

interface DoctorProfileData extends DoctorProfileFormValues {
  updatedAt?: string; // ISO string
  imageUrl?: string; // Assuming image URL is managed separately or part of this doc
  coordinates?: { lat: number; lng: number }; // From services/doctors
}


export default function DoctorProfilePage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [algerianWilayas, setAlgerianWilayas] = useState<string[]>([]);
  const [specialties, setSpecialties] = useState<string[]>([]);


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
      // Fetch existing profile data
      const fetchProfile = async () => {
        setIsLoadingData(true);
        try {
          // Doctor-specific data might be in 'doctors' collection or 'users' with a role.
          // For simplicity, let's assume 'users' collection holds this extended profile.
          const userDocRefPath = `users/${user.uid}`; 
          const userDoc = await db.getDoc(userDocRefPath);
          
          if (userDoc.exists()) {
            const data = userDoc.data() as any; // Cast as DoctorProfileData
            form.reset({
              displayName: data.name || user.displayName || '',
              email: data.email || user.email || '',
              specialty: data.specialty || '',
              wilaya: data.wilaya || '',
              location: data.location || '',
              bio: data.bio || '',
              phoneNumber: data.phoneNumber || '',
            });
          } else {
             // Fallback if no Firestore doc for some reason
             form.reset({
                displayName: user.displayName || '',
                email: user.email || '',
             });
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
      const userDocRefPath = `users/${user.uid}`;
      // In a real app, also update the 'doctors' collection if it's separate
      // For the mock, we store extended info in the 'users' doc.
      await db.setDoc(userDocRefPath, {
        ...(await db.getDoc(userDocRefPath).then(doc => doc.exists() ? doc.data() : {})), // Preserve existing fields like role
        name: data.displayName, // 'name' is the field for display name in users collection
        email: data.email,
        specialty: data.specialty,
        wilaya: data.wilaya,
        location: data.location, // This is the clinic's address string
        bio: data.bio,
        phoneNumber: data.phoneNumber,
        // Mock: In a real scenario, you'd handle image uploads and coordinates separately or via a service
        imageUrl: `https://picsum.photos/seed/${user.uid.substring(0,10)}/300/300`, // Mock image based on UID
        // coordinates: { lat: 36.7754, lng: 3.0589 }, // Mock coordinates for Alger
        updatedAt: new Date().toISOString(),
      });

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
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                      <Input type="tel" placeholder="للتواصل والاستفسارات" {...field} />
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
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                    <Textarea placeholder="اذكر خبراتك، شهاداتك، أو أي معلومات إضافية تود مشاركتها مع المرضى..." className="min-h-[150px]" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Add fields for working hours, image upload etc. later */}

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
