
'use client';

import { useAuth } from '@/contexts/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { CalendarCheck, FileText, UserCircle, Loader2 } from 'lucide-react';

export default function PatientDashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login?message=Please login to access your dashboard.');
    } else if (!loading && user && user.role !== 'patient') {
      // Redirect if not a patient (e.g., a doctor trying to access patient dashboard)
      router.push('/auth/login?message=Access denied. Please login with a patient account.');
    }
  }, [user, loading, router]);

  if (loading || !user || user.role !== 'patient') {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-4 text-lg text-muted-foreground">جاري التحميل...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <section className="text-center py-10 bg-primary/5 rounded-lg shadow-md">
        <h1 className="text-4xl font-bold text-primary mb-3">مرحباً بك، {user.displayName || 'المريض'}!</h1>
        <p className="text-lg text-foreground/80">هنا يمكنك إدارة معلوماتك الصحية ومواعيدك.</p>
      </section>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl text-primary">
              <CalendarCheck size={28} />
              مواعيدي القادمة
            </CardTitle>
            <CardDescription>عرض وإدارة مواعيدك مع الأطباء.</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Placeholder for upcoming appointments list */}
            <p className="text-muted-foreground">لا توجد مواعيد قادمة حالياً.</p>
            <Link href="/appointments" passHref>
              <Button variant="link" className="mt-4 p-0 text-accent">
                حجز موعد جديد
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl text-primary">
              <FileText size={28} />
              ملفي الصحي
            </CardTitle>
            <CardDescription>تحديث وعرض معلوماتك الطبية الشخصية.</CardDescription>
          </CardHeader>
          <CardContent>
             <p className="text-muted-foreground">حافظ على تحديث معلوماتك الطبية.</p>
            <Link href="/patient/medical-record" passHref>
              <Button className="mt-4 w-full bg-secondary text-secondary-foreground hover:bg-secondary/80">
                الذهاب إلى الملف الصحي
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl text-primary">
              <UserCircle size={28} />
              ملفي الشخصي
            </CardTitle>
            <CardDescription>إدارة معلومات حسابك وتفضيلاتك.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">تحديث بياناتك الشخصية وإعدادات الحساب.</p>
             <Link href="/patient/profile" passHref>
                <Button variant="outline" className="mt-4 w-full border-primary text-primary hover:bg-primary/10">
                    تعديل الملف الشخصي
                </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
