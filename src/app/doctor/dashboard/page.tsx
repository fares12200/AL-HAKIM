
'use client';

import { useAuth } from '@/contexts/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { CalendarDays, UserCog, ListChecks, Loader2, BriefcaseMedical } from 'lucide-react';
import { getAppointments, type Appointment } from '@/services/appointments'; // Assuming this fetches appointments for the doctor

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
      // Fetch appointments for this doctor
      const fetchDoctorAppointments = async () => {
        setIsLoadingAppointments(true);
        try {
          // This mock getAppointments returns all. In a real app, filter by doctorId.
          const allAppointments = await getAppointments();
          const doctorAppointments = allAppointments.filter(app => app.doctorId === user.uid);
          setAppointments(doctorAppointments);
        } catch (error) {
          console.error("Error fetching doctor's appointments:", error);
          // Handle error (e.g., show toast)
        } finally {
          setIsLoadingAppointments(false);
        }
      };
      fetchDoctorAppointments();
    }
  }, [user, loading, router]);

  if (loading || !user || user.role !== 'doctor') {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-4 text-lg text-muted-foreground">جاري التحميل...</p>
      </div>
    );
  }

  const upcomingAppointments = appointments.filter(app => new Date(app.date) >= new Date()).slice(0, 3); // Show 3 upcoming

  return (
    <div className="space-y-8">
      <section className="text-center py-10 bg-primary/5 rounded-lg shadow-md">
        <h1 className="text-4xl font-bold text-primary mb-3">أهلاً بك د. {user.displayName || 'الطبيب'}!</h1>
        <p className="text-lg text-foreground/80">هنا يمكنك إدارة مواعيدك وملفك المهني.</p>
      </section>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl text-primary">
              <CalendarDays size={28} />
              المواعيد القادمة ({upcomingAppointments.length})
            </CardTitle>
            <CardDescription>نظرة سريعة على مواعيدك القادمة.</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingAppointments ? (
              <div className="flex items-center justify-center p-4">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : upcomingAppointments.length > 0 ? (
              <ul className="space-y-2">
                {upcomingAppointments.map(app => (
                  <li key={app.id} className="text-sm p-2 border rounded-md bg-muted/50">
                    {app.date} الساعة {app.time} {/* ( مع المريض: {app.patientId} ) - Consider fetching patient name */}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground">لا توجد مواعيد قادمة حالياً.</p>
            )}
            <Link href="/doctor/appointments" passHref>
              <Button variant="link" className="mt-4 p-0 text-accent">
                عرض كل المواعيد
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl text-primary">
              <ListChecks size={28} />
              إدارة المواعيد
            </CardTitle>
            <CardDescription>تأكيد، إلغاء، أو إعادة جدولة المواعيد.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">تحكم كامل في جدول مواعيدك.</p>
            <Link href="/doctor/appointments" passHref>
              <Button className="mt-4 w-full bg-secondary text-secondary-foreground hover:bg-secondary/80">
                الذهاب إلى إدارة المواعيد
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl text-primary">
              <UserCog size={28} />
              الملف المهني
            </CardTitle>
            <CardDescription>تحديث معلوماتك المهنية، التخصص، وساعات العمل.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">حافظ على تحديث ملفك ليجده المرضى بسهولة.</p>
            <Link href="/doctor/profile" passHref>
                <Button variant="outline" className="mt-4 w-full border-primary text-primary hover:bg-primary/10">
                    تعديل الملف المهني
                </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
