
'use client';

import { useAuth } from '@/contexts/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { CalendarDays, UserCog, ListChecks, Loader2, BriefcaseMedical, BarChart3, Users, Settings, AlertTriangle } from 'lucide-react';
import { getAppointmentsForUser, type Appointment } from '@/services/appointments'; 
import { format } from 'date-fns';
import { arSA } from 'date-fns/locale';
import { Badge } from '@/components/ui/badge';


export default function DoctorDashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoadingAppointments, setIsLoadingAppointments] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login?message=Please login to access your dashboard.');
    } else if (!loading && user && user.role !== 'doctor') {
      router.push('/auth/login?message=Access denied. Please login with a doctor account.');
    } else if (user && user.role === 'doctor') {
      const fetchDoctorAppointments = async () => {
        setIsLoadingAppointments(true);
        try {
          
          const doctorAppointments = await getAppointmentsForUser(user.uid, 'doctor');
          setAppointments(doctorAppointments);
        } catch (error) {
          console.error("Error fetching doctor's appointments:", error);
          
        } finally {
          setIsLoadingAppointments(false);
        }
      };
      fetchDoctorAppointments();
    }
  }, [user, loading, router]);

  if (loading || !user || user.role !== 'doctor') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] p-6">
        <Loader2 className="h-16 w-16 animate-spin text-primary mb-6" />
        <p className="ml-4 text-xl text-muted-foreground">جاري التحميل...</p>
      </div>
    );
  }

  const upcomingAppointments = appointments.filter(app => new Date(app.date) >= new Date() && app.status !== 'completed' && app.status !== 'cancelled').slice(0, 5);
  const totalAppointmentsToday = appointments.filter(app => format(new Date(app.date), 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd') && app.status !== 'cancelled').length;


  return (
    <div className="space-y-10 md:space-y-12">
      <section className="text-center py-12 md:py-16 bg-gradient-to-br from-primary/10 via-background to-background rounded-xl shadow-lg">
        <BriefcaseMedical className="mx-auto text-primary mb-6" size={64} strokeWidth={1.5} />
        <h1 className="text-4xl md:text-5xl font-bold text-primary mb-4">أهلاً بك د. {user.displayName || 'الطبيب'}!</h1>
        <p className="text-lg md:text-xl text-foreground/80 max-w-2xl mx-auto leading-relaxed">
            لوحة التحكم الخاصة بك لإدارة مواعيدك، ملفك المهني، وكل ما يتعلق بنشاطك على منصة الحكيم.
        </p>
      </section>

      
      <section className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
         <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 rounded-xl transform hover:-translate-y-1">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between text-xl text-primary">
              <span className="flex items-center gap-2"><CalendarDays size={28} strokeWidth={1.5} /> مواعيد اليوم</span>
               <span className="text-3xl font-bold text-accent">{totalAppointmentsToday}</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-sm">إجمالي عدد المواعيد المجدولة لليوم.</p>
          </CardContent>
        </Card>
         <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 rounded-xl transform hover:-translate-y-1">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between text-xl text-primary">
               <span className="flex items-center gap-2"><Users size={28} strokeWidth={1.5}/> إجمالي المرضى</span>
               <span className="text-3xl font-bold text-accent">{[...new Set(appointments.map(a => a.patientId))].length}</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-sm">عدد المرضى الفريدين الذين قاموا بالحجز معك.</p>
          </CardContent>
        </Card>
         <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 rounded-xl transform hover:-translate-y-1">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between text-xl text-primary">
              <span className="flex items-center gap-2"><BarChart3 size={28} strokeWidth={1.5} /> متوسط التقييم</span>
               <span className="text-3xl font-bold text-accent">{user.rating?.toFixed(1) || 'N/A'} <span className="text-sm">/ 5</span></span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-sm">متوسط تقييمك العام من قبل المرضى.</p>
          </CardContent>
        </Card>
      </section>

      <div className="grid lg:grid-cols-3 gap-6 md:gap-8">
        
        <Card className="lg:col-span-2 shadow-lg hover:shadow-xl transition-shadow duration-300 rounded-xl transform hover:-translate-y-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-2xl text-primary">
              <CalendarDays size={32} strokeWidth={1.5} />
              المواعيد القادمة ({upcomingAppointments.length})
            </CardTitle>
            <CardDescription className="text-md text-muted-foreground">نظرة سريعة على مواعيدك الخمسة القادمة.</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingAppointments ? (
              <div className="flex items-center justify-center p-6">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : upcomingAppointments.length > 0 ? (
              <ul className="space-y-3">
                {upcomingAppointments.map(app => (
                  <li key={app.id} className="text-md p-3 border rounded-lg bg-muted/50 flex justify-between items-center hover:bg-muted/70 transition-colors">
                    <div>
                        <span className="font-medium">{format(new Date(app.date), 'eeee, d MMM yyyy', {locale: arSA})} - الساعة {app.time}</span>
                        <span className="block text-sm text-muted-foreground mt-0.5">(مع المريض: {app.patientName || app.patientId.substring(0,8)+'...' })</span>
                    </div>
                    <Badge variant={app.status === 'confirmed' ? 'default' : 'secondary'} className="text-xs">
                        {app.status === 'confirmed' ? 'مؤكد' : 'قيد المراجعة'}
                    </Badge>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-center py-8">
                <AlertTriangle size={48} className="mx-auto text-muted-foreground mb-4" strokeWidth={1.5}/>
                <p className="text-lg text-muted-foreground">لا توجد مواعيد قادمة حالياً في جدولك.</p>
              </div>
            )}
            <Link href="/doctor/appointments" passHref>
              <Button variant="link" className="mt-6 p-0 text-lg text-accent hover:underline">
                عرض كل المواعيد والتفاصيل
              </Button>
            </Link>
          </CardContent>
        </Card>

        
        <div className="space-y-6 md:space-y-8">
            <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 rounded-xl transform hover:-translate-y-1">
            <CardHeader>
                <CardTitle className="flex items-center gap-3 text-2xl text-primary">
                <ListChecks size={32} strokeWidth={1.5} />
                إدارة المواعيد
                </CardTitle>
                <CardDescription className="text-md text-muted-foreground">تأكيد، إلغاء، أو إعادة جدولة المواعيد.</CardDescription>
            </CardHeader>
            <CardContent>
                <p className="text-muted-foreground mb-5">تحكم كامل في جدول مواعيدك وقم بإدارتها بكفاءة.</p>
                <Link href="/doctor/appointments" passHref>
                <Button className="w-full bg-secondary text-secondary-foreground hover:bg-secondary/80 text-md py-3 rounded-lg">
                    <ListChecks size={18} className="mr-2 rtl:ml-2"/>
                    الذهاب إلى إدارة المواعيد
                </Button>
                </Link>
            </CardContent>
            </Card>

            <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 rounded-xl transform hover:-translate-y-1">
            <CardHeader>
                <CardTitle className="flex items-center gap-3 text-2xl text-primary">
                <UserCog size={32} strokeWidth={1.5} />
                الملف المهني
                </CardTitle>
                <CardDescription className="text-md text-muted-foreground">تحديث معلوماتك، التخصص، وساعات العمل.</CardDescription>
            </CardHeader>
            <CardContent>
                <p className="text-muted-foreground mb-5">حافظ على تحديث ملفك ليجده المرضى بسهولة.</p>
                <Link href="/doctor/profile" passHref>
                    <Button variant="outline" className="w-full border-primary text-primary hover:bg-primary/10 text-md py-3 rounded-lg">
                        <Settings size={18} className="mr-2 rtl:ml-2"/>
                        تعديل الملف المهني
                    </Button>
                </Link>
            </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}

