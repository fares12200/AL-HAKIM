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
import { Loader2, UserCog, Save, CalendarDays, Phone } from 'lucide-react';
import { db } from '@/lib/firebase'; 

const patientProfileSchema = z.object({
  displayName: z.string().min(2, { message: "الاسم يجب أن يكون حرفين على الأقل." }).max(50, { message: "الاسم طويل جدًا."}),
  email: z.string().email({ message: "البريد الإلكتروني غير صالح." }).readonly(), 
  phoneNumber: z.string().regex(/^0[5-7][0-9]{8}$/, {message: "رقم الهاتف غير صالح (يجب أن يبدأ بـ 05، 06، أو 07 ويحتوي على 10 أرقام)."}).optional().or(z.literal('')),
  dateOfBirth: z.string().optional().refine((val) => {
    if (!val) return true; // Optional field
    const date = new Date(val);
    return !isNaN(date.getTime()) && date < new Date(); // Must be a valid date and in the past
  }, { message: "تاريخ الميلاد غير صالح أو في المستقبل."}),
});

type PatientProfileFormValues = z.infer<typeof patientProfileSchema>;

interface PatientProfileData extends PatientProfileFormValues {
  updatedAt?: string; 
}

export default function PatientProfilePage() {
  const { user, loading: authLoading, logOut } = useAuth(); 
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
      const fetchProfile = async () => {
        setIsLoadingData(true);
        try {
          const userDocRefPath = `users/${user.uid}`; 
          const userDoc = await db.getDoc(userDocRefPath);
          if (userDoc.exists()) {
            const data = userDoc.data() as any; 
            form.reset({
              displayName: data.name || user.displayName || '',
              email: data.email || user.email || '',
              phoneNumber: data.phoneNumber || '',
              dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth).toISOString().split('T')[0] : '', 
            });
          } else {
             form.reset({
              displayName: user.displayName || '',
              email: user.email || '',
            });
          }
        } catch (error) {
          console.error("Error fetching patient profile:", error);
          toast({
            title: "خطأ في تحميل البيانات",
            description: "لم نتمكن من تحميل بيانات ملفك الشخصي. يرجى المحاولة مرة أخرى.",
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
        ...(await db.getDoc(userDocRefPath).then(doc => doc.exists() ? doc.data() : {})),
        name: data.displayName, 
        email: data.email, 
        phoneNumber: data.phoneNumber,
        dateOfBirth: data.dateOfBirth,
        updatedAt: new Date().toISOString(),
      });

      toast({
        title: "تم تحديث الملف الشخصي بنجاح!",
        description: "تم حفظ بيانات ملفك الشخصي.",
        variant: "default",
        className: "bg-green-500 text-white border-green-600",
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
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] p-6">
        <Loader2 className="h-16 w-16 animate-spin text-primary mb-6" />
        <p className="ml-4 text-xl text-muted-foreground">جاري تحميل بيانات ملفك الشخصي...</p>
      </div>
    );
  }

  return (
    <Card className="max-w-3xl mx-auto shadow-xl rounded-xl">
      <CardHeader className="text-center p-8 border-b">
        <UserCog className="mx-auto text-primary mb-6" size={56} strokeWidth={1.5} />
        <CardTitle className="text-4xl font-bold text-primary">ملفي الشخصي</CardTitle>
        <CardDescription className="text-lg text-muted-foreground mt-2">
            قم بتحديث معلومات حسابك الشخصية وتفضيلاتك هنا.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-8">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-10">
            <FormField
              control={form.control}
              name="displayName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-md">الاسم الكامل</FormLabel>
                  <FormControl>
                    <Input placeholder="اسمك كما يظهر للمستخدمين والأطباء" {...field} className="py-3 text-base"/>
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
                    <Input type="email" placeholder="بريدك الإلكتروني المسجل" {...field} readOnly className="bg-muted/50 cursor-not-allowed py-3 text-base" />
                  </FormControl>
                  <FormDescription className="text-xs">لا يمكن تغيير البريد الإلكتروني للحساب حالياً من هنا.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid md:grid-cols-2 gap-x-6 gap-y-8">
              <FormField
                control={form.control}
                name="phoneNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-md flex items-center gap-1"><Phone size={16}/> رقم الهاتف (اختياري)</FormLabel>
                    <FormControl>
                      <Input type="tel" placeholder="مثال: 0612345678" {...field} className="py-3 text-base"/>
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
                    <FormLabel className="text-md flex items-center gap-1"><CalendarDays size={16}/> تاريخ الميلاد (اختياري)</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} className="py-3 text-base" max={new Date().toISOString().split("T")[0]}/>
                    </FormControl>
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
                  حفظ التغييرات في الملف الشخصي
                </>
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
