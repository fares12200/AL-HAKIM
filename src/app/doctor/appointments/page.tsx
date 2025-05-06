
'use client';

import { useAuth } from '@/contexts/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Loader2, CalendarCheck, AlertTriangle, Trash2, CheckCircle, XCircle } from 'lucide-react';
import { getAppointments, createAppointment, type Appointment } from '@/services/appointments'; // Assuming these interact with your backend/mock
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from '@/hooks/use-toast';


// This is a mock. In a real app, you'd fetch actual patient names.
const mockPatientData: { [id: string]: { name: string } } = {
  'mockPatient123': { name: 'أحمد محمد' },
  'patient1': { name: 'فاطمة علي' },
  'patient2': { name: 'خالد حسن' },
};


export default function DoctorAppointmentsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login?message=Please login to manage appointments.');
    } else if (!authLoading && user && user.role !== 'doctor') {
      router.push('/auth/login?message=Access denied.');
    } else if (user) {
      fetchAppointments(user.uid);
    }
  }, [user, authLoading, router]);

  const fetchAppointments = async (doctorId: string) => {
    setIsLoading(true);
    try {
      // In a real app, getAppointments would likely take a doctorId parameter
      // or be a specific endpoint like getAppointmentsByDoctor(doctorId)
      const allAppointments = await getAppointments();
      const doctorAppointments = allAppointments.filter(app => app.doctorId === doctorId);
      setAppointments(doctorAppointments.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime() || a.time.localeCompare(b.time)));
    } catch (error) {
      console.error("Error fetching appointments:", error);
      toast({ title: "خطأ", description: "لم نتمكن من تحميل المواعيد.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelAppointment = async (appointmentId: string) => {
    // Mock cancellation: remove from local state
    // In a real app, call an API to delete/update the appointment status
    try {
        setAppointments(prev => prev.filter(app => app.id !== appointmentId));
        toast({
            title: "تم الإلغاء",
            description: "تم إلغاء الموعد بنجاح.",
            variant: "default",
            className: "bg-orange-500 text-white",
        });
    } catch (error) {
        toast({
            title: "خطأ",
            description: "لم نتمكن من إلغاء الموعد.",
            variant: "destructive",
        });
    }
  };
  
  // Placeholder for confirming/rescheduling - would involve more complex UI/logic
  const handleConfirmAppointment = (appointmentId: string) => {
    toast({ title: "تم التأكيد", description: `تم تأكيد الموعد ${appointmentId}. (وظيفة تجريبية)` });
  };


  if (authLoading || isLoading || !user || user.role !== 'doctor') {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-4 text-lg text-muted-foreground">جاري تحميل المواعيد...</p>
      </div>
    );
  }

  return (
    <Card className="shadow-xl">
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
                <CardTitle className="text-3xl font-bold text-primary flex items-center gap-2">
                <CalendarCheck size={32} />
                إدارة المواعيد
                </CardTitle>
                <CardDescription>عرض وتأكيد وإلغاء مواعيد مرضاك.</CardDescription>
            </div>
            {/* <Button onClick={() => {}} className="bg-accent hover:bg-accent/90 text-accent-foreground">إضافة موعد يدوي</Button> */}
        </div>
      </CardHeader>
      <CardContent>
        {appointments.length === 0 ? (
          <div className="text-center py-12">
            <AlertTriangle size={48} className="mx-auto text-muted-foreground mb-4" />
            <p className="text-xl text-muted-foreground">لا توجد مواعيد محجوزة حالياً.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-right">اسم المريض</TableHead>
                  <TableHead className="text-right">التاريخ</TableHead>
                  <TableHead className="text-right">الوقت</TableHead>
                  <TableHead className="text-right">الحالة</TableHead>
                  <TableHead className="text-center">إجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {appointments.map((appointment) => (
                  <TableRow key={appointment.id}>
                    <TableCell>{mockPatientData[appointment.patientId]?.name || appointment.patientId}</TableCell>
                    <TableCell>{new Date(appointment.date).toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' })}</TableCell>
                    <TableCell>{appointment.time}</TableCell>
                    <TableCell>
                      {/* Mock status - In real app, status would come from DB */}
                      <Badge variant={new Date(appointment.date) < new Date() ? "secondary" : "default"}>
                        {new Date(appointment.date) < new Date() ? "منتهي" : "مؤكد"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center space-x-2 space-x-reverse">
                      <Button variant="ghost" size="sm" className="text-green-600 hover:text-green-700 hover:bg-green-100" onClick={() => handleConfirmAppointment(appointment.id)} title="تأكيد الموعد">
                        <CheckCircle size={18} />
                      </Button>
                       <AlertDialog>
                        <AlertDialogTrigger asChild>
                           <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-100" title="إلغاء الموعد">
                                <Trash2 size={18} />
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                            <AlertDialogTitle>هل أنت متأكد من إلغاء هذا الموعد؟</AlertDialogTitle>
                            <AlertDialogDescription>
                                هذا الإجراء لا يمكن التراجع عنه. سيتم إشعار المريض بإلغاء الموعد.
                            </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                            <AlertDialogCancel>تراجع</AlertDialogCancel>
                            <AlertDialogAction
                                className="bg-destructive hover:bg-destructive/90"
                                onClick={() => handleCancelAppointment(appointment.id)}
                            >
                                نعم، قم بالإلغاء
                            </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                        </AlertDialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
