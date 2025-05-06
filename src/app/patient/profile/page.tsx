
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
import { Label } from '@/components/ui/label';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { Loader2, UserCog, Save } from 'lucide-react';
import { db } from '@/lib/firebase'; // For Firestore operations

// Schema for patient profile - can be expanded
const patientProfileSchema = z.object({
  displayName: z.string().min(2, { message: "الاسم يجب أن يكون حرفين على الأقل." }),
  email: z.string().email({ message: "البريد الإلكتروني غير صالح." }).readonly(), // Email might be read-only if managed by Firebase Auth directly
  phoneNumber: z.string().optional(),
  dateOfBirth: z.string().optional(), // Consider using a date picker and proper date validation
});

type PatientProfileFormValues = z.infer<typeof patientProfileSchema>;

interface PatientProfileData extends PatientProfileFormValues {
  updatedAt?: string; // ISO string
}

export default function PatientProfilePage() {
  const { user, loading: authLoading, logOut } = useAuth(); // Assuming logOut is available if needed
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);

  const form = useForm<PatientProfileFormValues>({
    resolver: zodResolver(patientProfileSchema),
    defaultValues: {
      displayName: '',
      email: '',
      phoneNumber: '',
      dateOfBirth: '',
    },
  });

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login?message=Please login to access your profile.');
    } else if (!authLoading && user && user.role !== 'patient') {
      router.push('/auth/login?message=Access denied.');
    } else if (user) {
      // Fetch existing profile data
      const fetchProfile = async () => {
        setIsLoadingData(true);
        try {
          const userDocRefPath = `users/${user.uid}`; // Path for user document in 'users' collection
          const userDoc = await db.getDoc(userDocRefPath);
          if (userDoc.exists()) {
            const data = userDoc.data() as any; // Cast as needed, or define a UserData interface
            form.reset({
              displayName: data.name || user.displayName || '',
              email: data.email || user.email || '',
              phoneNumber: data.phoneNumber || '',
              dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth).toISOString().split('T')[0] : '', // Format for <input type="date">
            });
          } else {
            // If no Firestore doc, use auth details
             form.reset({
              displayName: user.displayName || '',
              email: user.email || '',
            });
          }
        } catch (error) {
          console.error("Error fetching patient profile:", error);
          toast({
            title: "خطأ في تحميل البيانات",
            description: "لم نتمكن من تحميل بيانات ملفك الشخصي.",
            variant: "destructive",
          });
        } finally {
          setIsLoadingData(false);
        }
      };
      fetchProfile();
    }
  }, [user, authLoading, router, form, toast]);

  const onSubmit = async (data: PatientProfileFormValues) => {
    if (!user) return;
    setIsSubmitting(true);
    try {
      const userDocRefPath = `users/${user.uid}`;
      await db.setDoc(userDocRefPath, {
        // Merge with existing data in case there are other fields (like role)
        ...(await db.getDoc(userDocRefPath).then(doc => doc.exists() ? doc.data() : {})),
        name: data.displayName, // 'name' field in Firestore
        email: data.email, // Keep email consistent
        phoneNumber: data.phoneNumber,
        dateOfBirth: data.dateOfBirth,
        updatedAt: new Date().toISOString(),
      });

      // Note: Updating displayName in Firebase Auth is separate if needed.
      // await updateProfile(auth.currentUser, { displayName: data.displayName });

      toast({
        title: "تم تحديث الملف الشخصي",
        description: "تم حفظ بيانات ملفك الشخصي بنجاح.",
        variant: "default",
        className: "bg-green-500 text-white",
      });
    } catch (error) {
      console.error("Error updating patient profile:", error);
      toast({
        title: "خطأ في تحديث الملف",
        description: "حدث خطأ أثناء محاولة حفظ البيانات. يرجى المحاولة مرة أخرى.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authLoading || isLoadingData || !user || user.role !== 'patient') {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-4 text-lg text-muted-foreground">جاري تحميل بيانات الملف الشخصي...</p>
      </div>
    );
  }

  return (
    <Card className="max-w-2xl mx-auto shadow-xl">
      <CardHeader className="text-center">
        <UserCog className="mx-auto text-primary mb-4" size={48} />
        <CardTitle className="text-3xl font-bold text-primary">ملفي الشخصي</CardTitle>
        <CardDescription>قم بتحديث معلومات حسابك الشخصية هنا.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="displayName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-md">الاسم الكامل</FormLabel>
                  <FormControl>
                    <Input placeholder="اسمك كما يظهر للمستخدمين" {...field} />
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
                  <FormLabel className="text-md">البريد الإلكتروني</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="بريدك الإلكتروني" {...field} readOnly className="bg-muted/50 cursor-not-allowed" />
                  </FormControl>
                  <FormDescription>لا يمكن تغيير البريد الإلكتروني حالياً.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="phoneNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-md">رقم الهاتف (اختياري)</FormLabel>
                    <FormControl>
                      <Input type="tel" placeholder="مثال: 05xxxxxxxx" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="dateOfBirth"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-md">تاريخ الميلاد (اختياري)</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
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
