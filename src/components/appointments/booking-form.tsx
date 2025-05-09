
'use client';

import type { Doctor } from '@/services/doctors';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { arSA } from 'date-fns/locale';
import { CalendarIcon, Clock, User, StickyNote, Send, Loader2, LogIn, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { createAppointment, type Appointment } from '@/services/appointments';
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth-context';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const bookingFormSchema = z.object({
  patientName: z.string().min(2, { message: 'يجب إدخال اسم المريض (حرفين على الأقل).' }).max(60, "الاسم طويل جدًا."),
  appointmentDate: z.date({ required_error: 'يرجى اختيار تاريخ الموعد.' }),
  appointmentTime: z.string({ required_error: 'يرجى اختيار وقت الموعد.' }),
  notes: z.string().max(700, { message: 'الملاحظات يجب ألا تتجاوز 700 حرف.' }).optional(),
});

type BookingFormValues = z.infer<typeof bookingFormSchema>;

interface BookingFormProps {
  doctor: Doctor;
}

export default function BookingForm({ doctor }: BookingFormProps) {
  const { toast } = useToast();
  const { user, loading: authLoading } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [availableTimeSlots, setAvailableTimeSlots] = useState<string[]>([]);

  useEffect(() => {
    setAvailableTimeSlots(doctor.availableSlots || ['09:00 ص', '09:30 ص', '10:00 ص', '10:30 ص', '11:00 ص', '11:30 ص', '02:00 م', '02:30 م', '03:00 م', '03:30 م']);
  }, [doctor.availableSlots]);


  const form = useForm<BookingFormValues>({
    resolver: zodResolver(bookingFormSchema),
    defaultValues: {
      patientName: '', // Will be set by useEffect
      notes: '',
    },
  });

  useEffect(() => {
    if (user?.displayName) {
        form.setValue('patientName', user.displayName);
    } else {
        form.setValue('patientName', ''); // Clear if no user or no display name
    }
  }, [user, form]);

  async function onSubmit(data: BookingFormValues) {
    if (!user) {
      toast({
        title: 'مطلوب تسجيل الدخول',
        description: 'يرجى تسجيل الدخول أو إنشاء حساب جديد لتتمكن من حجز موعد.',
        variant: 'destructive',
      });
      return;
    }
    setIsSubmitting(true);
    try {
      const newAppointmentData: Omit<Appointment, 'id' | 'createdAt' | 'updatedAt' | 'status'> = {
        doctorId: doctor.id,
        patientId: user.uid, // Use authenticated user's ID
        patientName: data.patientName, 
        date: format(data.appointmentDate, 'yyyy-MM-dd'),
        time: data.appointmentTime,
        notes: data.notes || '',
      };
      
      const createdAppointment = await createAppointment(newAppointmentData);
      
      toast({
        title: 'تم الحجز بنجاح!',
        description: `تم تأكيد موعدك مع د. ${doctor.name} يوم ${format(data.appointmentDate, 'PPPP', { locale: arSA })} الساعة ${data.appointmentTime}. رقم الموعد: ${createdAppointment.id.substring(0,6)}`,
        variant: 'default',
        className: 'bg-green-500 text-white border-green-600', 
      });
      form.reset({ patientName: user?.displayName || '', notes: '', appointmentDate: undefined, appointmentTime: undefined });
    } catch (error) {
        console.error("Booking error:", error);
      toast({
        title: 'خطأ في الحجز',
        description: 'حدث خطأ أثناء محاولة حجز الموعد. يرجى المحاولة مرة أخرى أو التواصل مع الدعم.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  if (authLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-10 rounded-xl shadow-xl bg-card min-h-[300px]">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-lg text-muted-foreground">جاري تحميل معلومات المصادقة...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <Card className="text-center p-8 md:p-12 rounded-xl shadow-xl bg-card border-primary/30">
         <CardHeader className="p-0">
            <AlertTriangle size={64} className="mx-auto text-destructive mb-6" strokeWidth={1.5}/>
            <CardTitle className="text-2xl md:text-3xl font-bold text-primary mb-3">
                مطلوب تسجيل الدخول للحجز
            </CardTitle>
            <CardDescription className="text-md md:text-lg text-muted-foreground max-w-md mx-auto leading-relaxed">
                لتتمكن من حجز موعد مع د. {doctor.name}، يرجى تسجيل الدخول إلى حسابك أو إنشاء حساب جديد إذا لم يكن لديك واحد.
            </CardDescription>
         </CardHeader>
         <CardContent className="p-0 mt-8">
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground text-lg py-3 px-8 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                    <Link href={`/auth/login?redirect=/appointments/book/${doctor.id}`}>
                        <LogIn size={20} className="mr-2 rtl:ml-2"/>
                        تسجيل الدخول
                    </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="text-primary border-primary hover:bg-primary/10 text-lg py-3 px-8 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                    <Link href={`/auth/signup?redirect=/appointments/book/${doctor.id}`}>
                        إنشاء حساب جديد
                    </Link>
                </Button>
            </div>
         </CardContent>
      </Card>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="patientName"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-lg flex items-center gap-2"><User size={20} className="text-muted-foreground"/> اسم المريض</FormLabel>
              <FormControl>
                <Input 
                  placeholder="الاسم الكامل كما هو في الهوية" 
                  {...field} 
                  className="py-3.5 text-base rounded-md bg-muted/30 cursor-not-allowed" 
                  readOnly // Name is pre-filled from authenticated user
                  />
              </FormControl>
              <FormDescription className="text-xs">
                سيتم استخدام الاسم المسجل في حسابك.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid md:grid-cols-2 gap-x-6 gap-y-8">
          <FormField
            control={form.control}
            name="appointmentDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel className="text-lg flex items-center gap-2"><CalendarIcon size={20} className="text-muted-foreground"/> تاريخ الموعد</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={'outline'}
                        className={cn(
                          'w-full justify-start text-right font-normal py-3.5 text-base rounded-md',
                          !field.value && 'text-muted-foreground'
                        )}
                      >
                        <CalendarIcon className="ml-2 h-5 w-5 opacity-70" />
                        {field.value ? (
                          format(field.value, 'PPPP', { locale: arSA })
                        ) : (
                          <span>اختر تاريخاً للحجز</span>
                        )}
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 rounded-lg shadow-lg" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) => date < new Date(new Date().setDate(new Date().getDate() -1)) } 
                      initialFocus
                      locale={arSA}
                      className="rounded-md"
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="appointmentTime"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-lg flex items-center gap-2"><Clock size={20} className="text-muted-foreground"/> وقت الموعد</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value || undefined}>
                  <FormControl>
                    <SelectTrigger className="py-3.5 text-base rounded-md">
                       <Clock className="ml-2 h-5 w-5 opacity-70" />
                      <SelectValue placeholder="اختر وقتاً من المتاح" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="rounded-lg shadow-lg">
                    {availableTimeSlots.map((slot) => (
                      <SelectItem key={slot} value={slot} className="text-base justify-end py-2.5">
                        {slot}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-lg flex items-center gap-2"><StickyNote size={20} className="text-muted-foreground"/> ملاحظات إضافية (اختياري)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="أخبر الطبيب بأي معلومات إضافية، أعراض رئيسية، أو استفسارات لديك قبل الموعد..."
                  className="resize-none min-h-[130px] text-base rounded-md"
                  {...field}
                />
              </FormControl>
              <FormDescription className="text-xs">
                هذه المعلومات ستساعد الطبيب على التحضير بشكل أفضل لموعدك.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" size="lg" className="w-full bg-accent hover:bg-accent/90 text-accent-foreground py-7 text-lg rounded-lg shadow-md hover:shadow-lg transition-shadow transform hover:scale-105" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
             <Loader2 className="mr-2 h-5 w-5 animate-spin rtl:ml-2" />
             جاري تأكيد الحجز...
            </>
          ) : (
            <>
            <Send size={20} className="mr-2 rtl:ml-2"/>
             تأكيد وإرسال طلب الحجز
            </>
          )}
        </Button>
      </form>
    </Form>
  );
}

