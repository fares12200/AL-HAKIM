
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
import { Label } from '@/components/ui/label';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { Loader2, FileHeart, Save } from 'lucide-react';
import { db } from '@/lib/firebase'; // Assuming db is exported for Firestore operations

// Mock schema for medical record - expand as needed
const medicalRecordSchema = z.object({
  bloodType: z.string().optional(),
  allergies: z.string().optional(),
  chronicDiseases: z.string().optional(),
  medications: z.string().optional(),
  medicalHistoryNotes: z.string().max(2000, "الملاحظات يجب ألا تتجاوز 2000 حرف.").optional(),
});

type MedicalRecordFormValues = z.infer<typeof medicalRecordSchema>;

interface MedicalRecordData extends MedicalRecordFormValues {
  updatedAt?: string; // ISO string
}

export default function MedicalRecordPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);

  const form = useForm<MedicalRecordFormValues>({
    resolver: zodResolver(medicalRecordSchema),
    defaultValues: {
      bloodType: '',
      allergies: '',
      chronicDiseases: '',
      medications: '',
      medicalHistoryNotes: '',
    },
  });

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login?message=Please login to access your medical record.');
    } else if (!authLoading && user && user.role !== 'patient') {
      router.push('/auth/login?message=Access denied.');
    } else if (user) {
      // Fetch existing medical record data
      const fetchRecord = async () => {
        setIsLoadingData(true);
        try {
          const recordRefPath = `medicalRecords/${user.uid}`; // Path for medical record document
          const recordDoc = await db.getDoc(recordRefPath);
          if (recordDoc.exists()) {
            const data = recordDoc.data() as MedicalRecordData;
            form.reset(data); // Populate form with fetched data
          }
        } catch (error) {
          console.error("Error fetching medical record:", error);
          toast({
            title: "خطأ في تحميل البيانات",
            description: "لم نتمكن من تحميل بيانات ملفك الصحي.",
            variant: "destructive",
          });
        } finally {
          setIsLoadingData(false);
        }
      };
      fetchRecord();
    }
  }, [user, authLoading, router, form, toast]);

  const onSubmit = async (data: MedicalRecordFormValues) => {
    if (!user) return;
    setIsSubmitting(true);
    try {
      const recordRefPath = `medicalRecords/${user.uid}`;
      await db.setDoc(recordRefPath, {
        ...data,
        patientId: user.uid,
        updatedAt: new Date().toISOString(),
      });
      toast({
        title: "تم تحديث الملف الصحي",
        description: "تم حفظ بيانات ملفك الصحي بنجاح.",
        variant: "default",
        className: "bg-green-500 text-white",
      });
    } catch (error) {
      console.error("Error updating medical record:", error);
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
        <p className="ml-4 text-lg text-muted-foreground">جاري تحميل بيانات الملف الصحي...</p>
      </div>
    );
  }

  return (
    <Card className="max-w-3xl mx-auto shadow-xl">
      <CardHeader className="text-center">
        <FileHeart className="mx-auto text-primary mb-4" size={48} />
        <CardTitle className="text-3xl font-bold text-primary">ملفي الصحي</CardTitle>
        <CardDescription>قم بتحديث معلوماتك الطبية الأساسية هنا. هذه المعلومات ستكون متاحة للأطباء الذين تحجز معهم.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="grid md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="bloodType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-md">فصيلة الدم</FormLabel>
                    <FormControl>
                      <Input placeholder="مثال: O+" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="allergies"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-md">الحساسية المعروفة</FormLabel>
                    <FormControl>
                      <Input placeholder="مثال: البنسلين، الفول السوداني" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="chronicDiseases"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-md">الأمراض المزمنة</FormLabel>
                  <FormControl>
                    <Textarea placeholder="مثال: السكري، ارتفاع ضغط الدم..." className="min-h-[100px]" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="medications"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-md">الأدوية الحالية</FormLabel>
                  <FormControl>
                    <Textarea placeholder="اذكر الأدوية التي تتناولها حالياً وجرعاتها..." className="min-h-[100px]" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="medicalHistoryNotes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-md">ملاحظات إضافية عن التاريخ الطبي</FormLabel>
                  <FormControl>
                    <Textarea placeholder="أي معلومات أخرى تراها مهمة (عمليات سابقة، تاريخ عائلي مرضي، إلخ)..." className="min-h-[150px]" {...field} />
                  </FormControl>
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
