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
import { CalendarIcon, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { createAppointment, type Appointment } from '@/services/appointments';
import { useState, useEffect } from 'react';

const bookingFormSchema = z.object({
  patientName: z.string().min(2, { message: 'يجب إدخال اسم المريض (حرفين على الأقل).' }),
  appointmentDate: z.date({ required_error: 'يرجى اختيار تاريخ الموعد.' }),
  appointmentTime: z.string({ required_error: 'يرجى اختيار وقت الموعد.' }),
  notes: z.string().max(500, { message: 'الملاحظات يجب ألا تتجاوز 500 حرف.' }).optional(),
});

type BookingFormValues = z.infer<typeof bookingFormSchema>;

interface BookingFormProps {
  doctor: Doctor;
}

export default function BookingForm({ doctor }: BookingFormProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [availableTimeSlots, setAvailableTimeSlots] = useState<string[]>([]);

  useEffect(() => {
    // In a real app, fetch available slots based on doctor and selected date
    // For now, use the doctor's predefined slots or default if none
    setAvailableTimeSlots(doctor.availableSlots || ['09:00 ص', '10:00 ص', '11:00 ص', '02:00 م', '03:00 م']);
  }, [doctor.availableSlots]);


  const form = useForm<BookingFormValues>({
    resolver: zodResolver(bookingFormSchema),
    defaultValues: {
      patientName: '',
      notes: '',
    },
  });

  async function onSubmit(data: BookingFormValues) {
    setIsSubmitting(true);
    try {
      const newAppointmentData: Omit<Appointment, 'id' | 'patientId'> = {
        doctorId: doctor.id,
        // patientId will be set by backend if user is logged in, or handled differently
        date: format(data.appointmentDate, 'yyyy-MM-dd'),
        time: data.appointmentTime,
        // notes: data.notes // Add this when Appointment interface supports notes
      };

      // This is a mock of createAppointment. In a real app, you'd make an API call.
      // The current mock createAppointment doesn't actually use the input 'appointment'
      // It returns a fixed object. We will call it as if it works correctly.
      // The patientId is also not handled here, assuming a guest booking or backend handling.
      const created = await createAppointment({
        ...newAppointmentData,
        id: Math.random().toString(36).substring(7), // mock ID
        patientId: 'mockPatient123', // mock patient ID
      } as Appointment);
      
      toast({
        title: 'تم الحجز بنجاح!',
        description: `تم تأكيد موعدك مع ${doctor.name} يوم ${format(data.appointmentDate, 'PPP', { locale: arSA })} الساعة ${data.appointmentTime}.`,
        variant: 'default',
        className: 'bg-green-500 text-white', // Using Tailwind classes directly for immediate visual feedback
      });
      form.reset();
    } catch (error) {
      toast({
        title: 'خطأ في الحجز',
        description: 'حدث خطأ أثناء محاولة حجز الموعد. يرجى المحاولة مرة أخرى.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 p-6 bg-card rounded-lg shadow-xl">
        <FormField
          control={form.control}
          name="patientName"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-lg">اسم المريض</FormLabel>
              <FormControl>
                <Input placeholder="الاسم الكامل للمريض" {...field} className="py-3 text-base"/>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="appointmentDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel className="text-lg">تاريخ الموعد</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={'outline'}
                        className={cn(
                          'w-full justify-start text-right font-normal py-3 text-base',
                          !field.value && 'text-muted-foreground'
                        )}
                      >
                        <CalendarIcon className="ml-2 h-5 w-5 opacity-70" />
                        {field.value ? (
                          format(field.value, 'PPP', { locale: arSA })
                        ) : (
                          <span>اختر تاريخاً</span>
                        )}
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) => date < new Date(new Date().setHours(0,0,0,0)) } // Disable past dates
                      initialFocus
                      locale={arSA}
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
                <FormLabel className="text-lg">وقت الموعد</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger className="py-3 text-base">
                       <Clock className="ml-2 h-5 w-5 opacity-70" />
                      <SelectValue placeholder="اختر وقتاً" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {availableTimeSlots.map((slot) => (
                      <SelectItem key={slot} value={slot} className="text-base justify-end">
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
              <FormLabel className="text-lg">ملاحظات إضافية (اختياري)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="أخبر الطبيب بأي معلومات إضافية أو استفسارات لديك..."
                  className="resize-none min-h-[120px] text-base"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                يمكنك ذكر الأعراض أو أي معلومات يهمك أن يعرفها الطبيب.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" size="lg" className="w-full bg-accent hover:bg-accent/90 text-accent-foreground py-3 text-lg" disabled={isSubmitting}>
          {isSubmitting ? 'جاري الحجز...' : 'تأكيد الحجز'}
        </Button>
      </form>
    </Form>
  );
}
