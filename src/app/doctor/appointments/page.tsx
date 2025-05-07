'use client';

import { useAuth } from '@/contexts/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Loader2, CalendarCheck, AlertTriangle, Trash2, CheckCircle, XCircle, Users, ClockIcon } from 'lucide-react';
import { getAppointments, createAppointment, type Appointment } from '@/services/appointments'; 
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
import { format } from 'date-fns';
import { arSA } from 'date-fns/locale';


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
      const allAppointments = await getAppointments();
      const doctorAppointments = allAppointments.filter(app => app.doctorId === doctorId);
      setAppointments(doctorAppointments.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime() || a.time.localeCompare(b.time)));
    } catch (error) {
      console.error("Error fetching appointments:", error);
      toast({ title: "خطأ", description: "لم نتمكن من تحميل المواعيد. يرجى المحاولة مرة أخرى.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelAppointment = async (appointmentId: string) => {
    try {
        setAppointments(prev => prev.filter(app => app.id !== appointmentId));
        toast({
            title: "تم الإلغاء بنجاح",
            description: "تم إلغاء الموعد وإشعار المريض.",
            variant: "default",
            className: "bg-orange-500 text-white border-orange-600",
        });
    } catch (error) {
        toast({
            title: "خطأ في الإلغاء",
            description: "لم نتمكن من إلغاء الموعد. يرجى المحاولة مرة أخرى.",
            variant: "destructive",
        });
    }
  };
  
  const handleConfirmAppointment = (appointmentId: string) => {
     setAppointments(prev => prev.map(app => app.id === appointmentId ? { ...app, status: 'confirmed' } : app)); // Mock status update
    toast({ 
        title: "تم تأكيد الموعد", 
        description: `تم تأكيد الموعد ${appointmentId} بنجاح.`,
        variant: "default",
        className: "bg-green-500 text-white border-green-600",
    });
  };


  if (authLoading || isLoading || !user || user.role !== 'doctor') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] p-6">
        <Loader2 className="h-16 w-16 animate-spin text-primary mb-6" />
        <p className="ml-4 text-xl text-muted-foreground">جاري تحميل بيانات المواعيد...</p>
      </div>
    );
  }

  const upcomingAppointments = appointments.filter(app => new Date(app.date) >= new Date());
  const pastAppointments = appointments.filter(app => new Date(app.date) < new Date());


  return (
    <div className="space-y-8">
        <Card className="shadow-xl rounded-xl">
        <CardHeader className="border-b pb-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-4">
                    <CalendarCheck size={40} className="text-primary" strokeWidth={1.5}/>
                    <div>
                        <CardTitle className="text-3xl font-bold text-primary">
                        إدارة المواعيد
                        </CardTitle>
                        <CardDescription className="text-lg text-muted-foreground mt-1">عرض وتأكيد وإلغاء مواعيد مرضاك بكل سهولة.</CardDescription>
                    </div>
                </div>
                {/* <Button onClick={() => {}} className="bg-accent hover:bg-accent/90 text-accent-foreground rounded-lg px-6 py-3 text-base">
                    <PlusCircle size={20} className="mr-2 rtl:ml-2"/>
                    إضافة موعد يدوي
                </Button> */}
            </div>
        </CardHeader>
        <CardContent className="p-6">
            {appointments.length === 0 ? (
            <div className="text-center py-16">
                <AlertTriangle size={64} className="mx-auto text-muted-foreground mb-6" strokeWidth={1.5} />
                <p className="text-2xl font-semibold text-muted-foreground">لا توجد مواعيد محجوزة حالياً.</p>
                <p className="text-lg text-muted-foreground mt-2">عندما يقوم المرضى بحجز مواعيد، ستظهر هنا.</p>
            </div>
            ) : (
            <div className="space-y-10">
                {upcomingAppointments.length > 0 && (
                    <div>
                        <h2 className="text-2xl font-semibold text-primary mb-4 flex items-center gap-2">
                            <ClockIcon size={28}/> المواعيد القادمة ({upcomingAppointments.length})
                        </h2>
                        <div className="overflow-x-auto rounded-lg border shadow-sm">
                            <Table>
                            <TableHeader>
                                <TableRow className="bg-muted/50">
                                <TableHead className="text-right font-semibold text-base py-3">اسم المريض</TableHead>
                                <TableHead className="text-right font-semibold text-base py-3">التاريخ</TableHead>
                                <TableHead className="text-right font-semibold text-base py-3">الوقت</TableHead>
                                <TableHead className="text-right font-semibold text-base py-3">الحالة</TableHead>
                                <TableHead className="text-center font-semibold text-base py-3">إجراءات</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {upcomingAppointments.map((appointment) => (
                                <TableRow key={appointment.id} className="hover:bg-muted/30">
                                    <TableCell className="py-4">{mockPatientData[appointment.patientId]?.name || appointment.patientId}</TableCell>
                                    <TableCell className="py-4">{format(new Date(appointment.date), 'PPP', { locale: arSA })}</TableCell>
                                    <TableCell className="py-4">{appointment.time}</TableCell>
                                    <TableCell className="py-4">
                                    <Badge variant={(appointment as any).status === 'confirmed' ? "default" : "secondary"} className="text-sm">
                                        {(appointment as any).status === 'confirmed' ? "مؤكد" : "قيد المراجعة"}
                                    </Badge>
                                    </TableCell>
                                    <TableCell className="text-center space-x-1 space-x-reverse py-3">
                                    {(appointment as any).status !== 'confirmed' && (
                                        <Button variant="ghost" size="icon" className="text-green-600 hover:text-green-700 hover:bg-green-100/50 rounded-full w-9 h-9" onClick={() => handleConfirmAppointment(appointment.id)} title="تأكيد الموعد">
                                            <CheckCircle size={20} />
                                        </Button>
                                    )}
                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                        <Button variant="ghost" size="icon" className="text-red-600 hover:text-red-700 hover:bg-red-100/50 rounded-full w-9 h-9" title="إلغاء الموعد">
                                                <Trash2 size={20} />
                                            </Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent className="rounded-lg">
                                            <AlertDialogHeader>
                                            <AlertDialogTitle className="text-xl">هل أنت متأكد من إلغاء هذا الموعد؟</AlertDialogTitle>
                                            <AlertDialogDescription className="text-base">
                                                هذا الإجراء لا يمكن التراجع عنه. سيتم إشعار المريض بإلغاء الموعد فوراً.
                                            </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter className="mt-4">
                                            <AlertDialogCancel className="px-6 py-2.5 text-base rounded-md">تراجع</AlertDialogCancel>
                                            <AlertDialogAction
                                                className="bg-destructive hover:bg-destructive/90 text-destructive-foreground px-6 py-2.5 text-base rounded-md"
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
                    </div>
                )}

                {pastAppointments.length > 0 && (
                     <div>
                        <h2 className="text-2xl font-semibold text-primary mb-4 flex items-center gap-2">
                            <Users size={28}/> المواعيد السابقة ({pastAppointments.length})
                        </h2>
                        <div className="overflow-x-auto rounded-lg border shadow-sm">
                            <Table>
                            <TableHeader>
                                <TableRow className="bg-muted/50">
                                <TableHead className="text-right font-semibold text-base py-3">اسم المريض</TableHead>
                                <TableHead className="text-right font-semibold text-base py-3">التاريخ</TableHead>
                                <TableHead className="text-right font-semibold text-base py-3">الوقت</TableHead>
                                <TableHead className="text-right font-semibold text-base py-3">الحالة</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {pastAppointments.map((appointment) => (
                                <TableRow key={appointment.id} className="hover:bg-muted/30 opacity-70">
                                    <TableCell className="py-4">{mockPatientData[appointment.patientId]?.name || appointment.patientId}</TableCell>
                                    <TableCell className="py-4">{format(new Date(appointment.date), 'PPP', { locale: arSA })}</TableCell>
                                    <TableCell className="py-4">{appointment.time}</TableCell>
                                    <TableCell className="py-4">
                                    <Badge variant="outline" className="text-sm border-slate-400 text-slate-500">
                                        منتهي
                                    </Badge>
                                    </TableCell>
                                </TableRow>
                                ))}
                            </TableBody>
                            </Table>
                        </div>
                    </div>
                )}


            </div>
            )}
        </CardContent>
        </Card>
    </div>
  );
}
