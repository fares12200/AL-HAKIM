
'use client';

import { useAuth } from '@/contexts/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Loader2, CalendarCheck, AlertTriangle, Trash2, CheckCircle, Users, ClockIcon, UserSquare2, FileHeart } from 'lucide-react';
import { getAppointmentsForUser, updateAppointmentStatus, deleteAppointment, type Appointment } from '@/services/appointments'; 
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
import PatientProfileModal from '@/components/patients/patient-profile-modal';
import PatientMedicalRecordModal from '@/components/patients/patient-medical-record-modal';
import { useNotification } from '@/contexts/notification-context';


export default function DoctorAppointmentsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const { addNotification } = useNotification();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [showPatientProfileModal, setShowPatientProfileModal] = useState(false);
  const [showMedicalRecordModal, setShowMedicalRecordModal] = useState(false);
  const [selectedAppointmentForModal, setSelectedAppointmentForModal] = useState<Appointment | null>(null);


  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login?message=Please login to manage appointments.');
    } else if (!authLoading && user && user.role !== 'doctor') {
      router.push('/auth/login?message=Access denied.');
    } else if (user && user.role === 'doctor') {
      fetchAppointments(user.uid);
    }
  }, [user, authLoading, router]);

  const fetchAppointments = async (doctorId: string) => {
    setIsLoading(true);
    try {
      const doctorAppointments = await getAppointmentsForUser(doctorId, 'doctor');
      setAppointments(doctorAppointments);
    } catch (error) {
      console.error("Error fetching appointments:", error);
      toast({ title: "خطأ", description: "لم نتمكن من تحميل المواعيد. يرجى المحاولة مرة أخرى.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelAppointment = async (appointment: Appointment) => {
    try {
        await deleteAppointment(appointment.id); 
        setAppointments(prev => prev.filter(app => app.id !== appointment.id));
        toast({
            title: "تم الإلغاء بنجاح",
            description: "تم إلغاء الموعد.",
            variant: "default",
            className: "bg-orange-500 text-white border-orange-600",
        });
        addNotification({
          message: `لقد قام د. ${user?.displayName || 'الطبيب'} بإلغاء موعدك ليوم ${format(new Date(appointment.date), 'PPP', { locale: arSA })} الساعة ${appointment.time}.`,
          type: 'warning',
          recipientId: appointment.patientId,
          link: `/patient/appointments`
        });
    } catch (error) {
        console.error("Error cancelling appointment:", error);
        toast({
            title: "خطأ في الإلغاء",
            description: "لم نتمكن من إلغاء الموعد. يرجى المحاولة مرة أخرى.",
            variant: "destructive",
        });
    }
  };
  
  const handleConfirmAppointment = async (appointment: Appointment) => {
    try {
        await updateAppointmentStatus(appointment.id, 'confirmed');
        setAppointments(prev => prev.map(app => app.id === appointment.id ? { ...app, status: 'confirmed' } : app));
        toast({ 
            title: "تم تأكيد الموعد", 
            description: `تم تأكيد الموعد بنجاح.`,
            variant: "default",
            className: "bg-green-500 text-white border-green-600",
        });
        addNotification({
            message: `تم تأكيد موعدك مع د. ${user?.displayName || 'الطبيب'} ليوم ${format(new Date(appointment.date), 'PPP', { locale: arSA })} الساعة ${appointment.time}.`,
            type: 'success',
            recipientId: appointment.patientId,
            link: `/patient/appointments`
        });
    } catch (error) {
        console.error("Error confirming appointment:", error);
        toast({
            title: "خطأ في تأكيد الموعد",
            description: "لم نتمكن من تأكيد الموعد. يرجى المحاولة مرة أخرى.",
            variant: "destructive",
        });
    }
  };

  const openPatientProfile = (appointment: Appointment) => {
    setSelectedAppointmentForModal(appointment);
    setShowPatientProfileModal(true);
  };

  const openMedicalRecord = (appointment: Appointment) => {
    setSelectedAppointmentForModal(appointment);
    setShowMedicalRecordModal(true);
  };


  if (authLoading || isLoading || !user || user.role !== 'doctor') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] p-6">
        <Loader2 className="h-16 w-16 animate-spin text-primary mb-6" />
        <p className="ml-4 text-xl text-muted-foreground">جاري تحميل بيانات المواعيد...</p>
      </div>
    );
  }

  const upcomingAppointments = appointments.filter(app => new Date(app.date) >= new Date() && app.status !== 'completed' && app.status !== 'cancelled');
  const pastAppointments = appointments.filter(app => new Date(app.date) < new Date() || app.status === 'completed' || app.status === 'cancelled');


  const getStatusBadgeVariant = (status: Appointment['status']): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case 'confirmed':
        return 'default'; 
      case 'pending':
        return 'secondary'; 
      case 'cancelled':
        return 'destructive'; 
      case 'completed':
        return 'outline'; 
      default:
        return 'secondary';
    }
  };

   const getStatusText = (status: Appointment['status']): string => {
    switch (status) {
      case 'confirmed':
        return 'مؤكد';
      case 'pending':
        return 'قيد المراجعة';
      case 'cancelled':
        return 'ملغى';
      case 'completed':
        return 'منتهي';
      default:
        return 'غير معروف';
    }
  };


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
            </div>
        </CardHeader>
        <CardContent className="p-6">
            {appointments.length === 0 && !isLoading ? (
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
                                <TableHead className="text-center font-semibold text-base py-3">ملف المريض</TableHead>
                                <TableHead className="text-center font-semibold text-base py-3">إجراءات</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {upcomingAppointments.map((appointment) => (
                                <TableRow key={appointment.id} className="hover:bg-muted/30">
                                    <TableCell className="py-4">{appointment.patientName || appointment.patientId.substring(0,10)+'...'}</TableCell>
                                    <TableCell className="py-4">{format(new Date(appointment.date), 'PPP', { locale: arSA })}</TableCell>
                                    <TableCell className="py-4">{appointment.time}</TableCell>
                                    <TableCell className="py-4">
                                      <Badge variant={getStatusBadgeVariant(appointment.status)} className="text-sm">
                                          {getStatusText(appointment.status)}
                                      </Badge>
                                    </TableCell>
                                    <TableCell className="text-center space-x-1 space-x-reverse py-3">
                                        <Button variant="ghost" size="icon" className="text-blue-600 hover:text-blue-700 hover:bg-blue-100/50 rounded-full w-9 h-9" onClick={() => openPatientProfile(appointment)} title="عرض الملف الشخصي للمريض">
                                            <UserSquare2 size={20} />
                                        </Button>
                                        <Button variant="ghost" size="icon" className="text-purple-600 hover:text-purple-700 hover:bg-purple-100/50 rounded-full w-9 h-9" onClick={() => openMedicalRecord(appointment)} title="عرض الملف الصحي للمريض">
                                            <FileHeart size={20} />
                                        </Button>
                                    </TableCell>
                                    <TableCell className="text-center space-x-1 space-x-reverse py-3">
                                    {appointment.status === 'pending' && (
                                        <Button variant="ghost" size="icon" className="text-green-600 hover:text-green-700 hover:bg-green-100/50 rounded-full w-9 h-9" onClick={() => handleConfirmAppointment(appointment)} title="تأكيد الموعد">
                                            <CheckCircle size={20} />
                                        </Button>
                                    )}
                                    {appointment.status !== 'cancelled' && appointment.status !== 'completed' && (
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
                                                  هذا الإجراء سيقوم بحذف الموعد نهائياً. سيتم إشعار المريض بإلغاء الموعد فوراً.
                                              </AlertDialogDescription>
                                              </AlertDialogHeader>
                                              <AlertDialogFooter className="mt-4">
                                              <AlertDialogCancel className="px-6 py-2.5 text-base rounded-md">تراجع</AlertDialogCancel>
                                              <AlertDialogAction
                                                  className="bg-destructive hover:bg-destructive/90 text-destructive-foreground px-6 py-2.5 text-base rounded-md"
                                                  onClick={() => handleCancelAppointment(appointment)}
                                              >
                                                  نعم، قم بالإلغاء
                                              </AlertDialogAction>
                                              </AlertDialogFooter>
                                          </AlertDialogContent>
                                          </AlertDialog>
                                    )}
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
                                    <TableCell className="py-4">{appointment.patientName || appointment.patientId.substring(0,10)+'...'}</TableCell>
                                    <TableCell className="py-4">{format(new Date(appointment.date), 'PPP', { locale: arSA })}</TableCell>
                                    <TableCell className="py-4">{appointment.time}</TableCell>
                                    <TableCell className="py-4">
                                      <Badge variant={getStatusBadgeVariant(appointment.status)} className="text-sm">
                                          {getStatusText(appointment.status)}
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
        {selectedAppointmentForModal && (
        <>
            <PatientProfileModal
            patientId={selectedAppointmentForModal.patientId}
            patientName={selectedAppointmentForModal.patientName || selectedAppointmentForModal.patientId.substring(0,10)+'...'}
            isOpen={showPatientProfileModal}
            onClose={() => {
                setShowPatientProfileModal(false);
                setSelectedAppointmentForModal(null);
            }}
            />
            <PatientMedicalRecordModal
            patientId={selectedAppointmentForModal.patientId}
            patientName={selectedAppointmentForModal.patientName || selectedAppointmentForModal.patientId.substring(0,10)+'...'}
            isOpen={showMedicalRecordModal}
            onClose={() => {
                setShowMedicalRecordModal(false);
                setSelectedAppointmentForModal(null);
            }}
            />
        </>
        )}
    </div>
  );
}

