
'use client';

import { useAuth } from '@/contexts/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { FileText, Loader2, HeartPulse, BookOpenText, Settings, ListChecks, LayoutDashboard } from 'lucide-react'; 

export default function PatientDashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login?message=Please login to access your dashboard.');
    } else if (!loading && user && user.role !== 'patient') {
      router.push('/auth/login?message=Access denied. Please login with a patient account.');
    }
  }, [user, loading, router]);

  if (loading || !user || user.role !== 'patient') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] p-6">
        <Loader2 className="h-16 w-16 animate-spin text-primary mb-6" />
        <p className="ml-4 text-xl text-muted-foreground">جاري التحميل...</p>
      </div>
    );
  }

  return (
    <div className="space-y-10 md:space-y-12">
      <section className="text-center py-12 md:py-16 bg-gradient-to-br from-primary/10 via-background to-background rounded-xl shadow-lg">
        <HeartPulse className="mx-auto text-primary mb-6" size={64} strokeWidth={1.5}/>
        <h1 className="text-4xl md:text-5xl font-bold text-primary mb-4">مرحباً بك، {user.displayName || 'المريض'}!</h1>
        <p className="text-lg md:text-xl text-foreground/80 max-w-2xl mx-auto leading-relaxed">
            هنا يمكنك إدارة معلوماتك الصحية، مواعيدك الطبية، وكل ما يتعلق برحلتك الصحية على منصة الحكيم.
        </p>
      </section>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
        <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 rounded-xl transform hover:-translate-y-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-2xl text-primary">
              <ListChecks size={32} strokeWidth={1.5} /> {/* Changed Icon for My Appointments card title */}
              مواعيدي
            </CardTitle>
            <CardDescription className="text-md text-muted-foreground">عرض وإدارة مواعيدك القادمة والسابقة مع الأطباء.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col justify-between h-full">
            <div>
                <p className="text-muted-foreground mb-5">راجع مواعيدك القادمة والسابقة، وقم بإلغاء المواعيد إذا لزم الأمر.</p>
            </div>
            <Link href="/patient/appointments" passHref>
              <Button className="w-full bg-accent hover:bg-accent/90 text-accent-foreground text-md py-3 rounded-lg mt-auto">
                <ListChecks size={18} className="mr-2 rtl:ml-2"/> 
                الذهاب إلى مواعيدي
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 rounded-xl transform hover:-translate-y-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-2xl text-primary">
              <FileText size={32} strokeWidth={1.5} />
              ملفي الصحي
            </CardTitle>
            <CardDescription className="text-md text-muted-foreground">تحديث وعرض معلوماتك الطبية الشخصية بشكل آمن.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col justify-between h-full">
             <p className="text-muted-foreground mb-5">حافظ على تحديث معلوماتك الطبية لتسهيل الرعاية الصحية.</p>
            <Link href="/patient/medical-record" passHref>
              <Button className="w-full bg-secondary text-secondary-foreground hover:bg-secondary/80 text-md py-3 rounded-lg mt-auto">
                 الذهاب إلى الملف الصحي
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 rounded-xl transform hover:-translate-y-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-2xl text-primary">
              <LayoutDashboard size={32} strokeWidth={1.5} /> 
              ملفي الشخصي
            </CardTitle>
            <CardDescription className="text-md text-muted-foreground">إدارة معلومات حسابك، تفضيلاتك، وإعدادات الأمان.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col justify-between h-full">
            <p className="text-muted-foreground mb-5">تحديث بياناتك الشخصية وإعدادات الحساب بسهولة.</p>
             <Link href="/patient/profile" passHref>
                <Button variant="outline" className="w-full border-primary text-primary hover:bg-primary/10 text-md py-3 rounded-lg mt-auto">
                    <Settings size={18} className="mr-2 rtl:ml-2"/>
                    تعديل الملف الشخصي
                </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
      
      <div className="text-center mt-12">
        <Link href="/appointments" passHref>
            <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground text-lg py-3 px-8 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                 <BookOpenText size={20} className="mr-2 rtl:ml-2"/>
                البحث عن طبيب وحجز موعد جديد
            </Button>
        </Link>
      </div>

    </div>
  );
}

