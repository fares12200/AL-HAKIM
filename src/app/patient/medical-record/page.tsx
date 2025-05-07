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
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { Loader2, FileHeart, Save, AlertOctagon, ShieldAlert, Pill, HeartPulse } from 'lucide-react';
import { db } from '@/lib/firebase'; 

const medicalRecordSchema = z.object({
  bloodType: z.string().max(5, "فصيلة الدم يجب ألا تتجاوز 5 أحرف.").optional(),
  allergies: z.string().max(500, "قائمة الحساسية يجب ألا تتجاوز 500 حرف.").optional(),
  chronicDiseases: z.string().max(500, "قائمة الأمراض المزمنة يجب ألا تتجاوز 500 حرف.").optional(),
  medications: z.string().max(500, "قائمة الأدوية يجب ألا تتجاوز 500 حرف.").optional(),
  medicalHistoryNotes: z.string().max(2000, "الملاحظات الإضافية يجب ألا تتجاوز 2000 حرف.").optional(),
});

type MedicalRecordFormValues = z.infer<typeof medicalRecordSchema>;

interface MedicalRecordData extends MedicalRecordFormValues {
  updatedAt?: string; 
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
      const fetchRecord = async () => {
        setIsLoadingData(true);
        try {
          const recordRefPath = `medicalRecords/${user.uid}`; 
          const recordDoc = await db.getDoc(recordRefPath);
          if (recordDoc.exists()) {
            const data = recordDoc.data() as MedicalRecordData;
            form.reset(data); 
          }
        } catch (error) {
          console.error("Error fetching medical record:", error);
          toast({
            title: "خطأ في تحميل البيانات",
            description: "لم نتمكن من تحميل بيانات ملفك الصحي. يرجى المحاولة مرة أخرى.",
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
        title: "تم تحديث الملف الصحي بنجاح!",
        description: "تم حفظ بيانات ملفك الصحي. ستكون هذه المعلومات متاحة للأطباء الذين تحجز معهم.",
        variant: "default",
        className: "bg-green-500 text-white border-green-600",
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
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] p-6">
        <Loader2 className="h-16 w-16 animate-spin text-primary mb-6" />
        <p className="ml-4 text-xl text-muted-foreground">جاري تحميل بيانات ملفك الصحي...</p>
      </div>
    );
  }

  return (
    <Card className="max-w-4xl mx-auto shadow-xl rounded-xl">
      <CardHeader className="text-center p-8 border-b">
        <FileHeart className="mx-auto text-primary mb-6" size={56} strokeWidth={1.5} />
        <CardTitle className="text-4xl font-bold text-primary">ملفي الصحي</CardTitle>
        <CardDescription className="text-lg text-muted-foreground mt-2">
            قم بتحديث معلوماتك الطبية الأساسية هنا. هذه المعلومات ستكون متاحة للأطباء الذين تحجز معهم لتحسين جودة الرعاية.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-8">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-10">
            <div className="grid md:grid-cols-2 gap-x-6 gap-y-8">
              <FormField
                control={form.control}
                name="bloodType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-md flex items-center gap-1"><HeartPulse size={16}/> فصيلة الدم (اختياري)</FormLabel>
                    <FormControl>
                      <Input placeholder="مثال: O+ أو AB-" {...field} className="py-3 text-base"/>
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
                    <FormLabel className="text-md flex items-center gap-1"><AlertOctagon size={16}/> الحساسية المعروفة (اختياري)</FormLabel>
                    <FormControl>
                      <Input placeholder="مثال: البنسلين، الفول السوداني، الغبار" {...field} className="py-3 text-base"/>
                    </FormControl>
                    <FormDescription className="text-xs">افصل بين أنواع الحساسية بفاصلة.</FormDescription>
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
                  <FormLabel className="text-md flex items-center gap-1"><ShieldAlert size={16}/> الأمراض المزمنة (اختياري)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="مثال: السكري النوع الثاني، ارتفاع ضغط الدم، الربو..." className="min-h-[120px] text-base" {...field} />
                  </FormControl>
                  <FormDescription className="text-xs">اذكر أي أمراض مزمنة تعاني منها.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="medications"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-md flex items-center gap-1"><Pill size={16}/> الأدوية الحالية (اختياري)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="اذكر الأدوية التي تتناولها حالياً وجرعاتها إن أمكن..." className="min-h-[120px] text-base" {...field} />
                  </FormControl>
                   <FormDescription className="text-xs">قائمة بالأدوية التي تستخدمها بانتظام.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="medicalHistoryNotes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-md">ملاحظات إضافية عن التاريخ الطبي (اختياري)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="أي معلومات أخرى تراها مهمة (عمليات جراحية سابقة، تاريخ عائلي مرضي، تطعيمات، إلخ)..." className="min-h-[150px] text-base" {...field} />
                  </FormControl>
                  <FormDescription className="text-xs">معلومات إضافية قد تساعد طبيبك في فهم حالتك بشكل أفضل.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full bg-accent hover:bg-accent/90 text-accent-foreground text-lg py-6 rounded-lg shadow-md hover:shadow-lg transition-shadow" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-6 w-6 animate-spin" />
                  جاري حفظ التغييرات...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-6 w-6" />
                  حفظ بيانات الملف الصحي
                </>
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
