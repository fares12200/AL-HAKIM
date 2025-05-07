'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useAuth } from '@/contexts/auth-context';
import { useToast } from '@/hooks/use-toast';
import { Loader2, UserPlus, ShieldPlus } from 'lucide-react';
import { useRouter } from 'next/navigation';

const signupSchema = z.object({
  name: z.string().min(2, { message: 'الاسم يجب أن يكون حرفين على الأقل.' }).max(50, { message: 'الاسم يجب ألا يتجاوز 50 حرفًا.' }),
  email: z.string().email({ message: 'البريد الإلكتروني غير صالح.' }),
  password: z.string().min(6, { message: 'كلمة المرور يجب أن تكون 6 أحرف على الأقل.' }).max(100, { message: 'كلمة المرور طويلة جدًا.' }),
  role: z.enum(['patient', 'doctor'], { required_error: 'يرجى اختيار نوع الحساب (مريض أو طبيب).' }),
});

type SignupFormValues = z.infer<typeof signupSchema>;

export default function SignupPage() {
  const { signUp, loading } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      role: 'patient',
    },
  });

  const onSubmit = async (data: SignupFormValues) => {
    setIsSubmitting(true);
    try {
      await signUp(data.email, data.password, data.name, data.role);
      toast({
        title: 'تم إنشاء الحساب بنجاح!',
        description: 'أهلاً بك في منصة الحكيم. تم تسجيل دخولك تلقائياً.',
        variant: 'default',
        className: 'bg-green-500 text-white border-green-600',
      });
      // Redirection is handled within signUp method in AuthContext
    } catch (error: any) {
      toast({
        title: 'خطأ في إنشاء الحساب',
        description: error.message || 'حدث خطأ ما أثناء محاولة إنشاء الحساب. يرجى المحاولة مرة أخرى.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-250px)] py-12 px-4">
      <Card className="w-full max-w-lg shadow-xl rounded-xl">
        <CardHeader className="text-center p-8">
          <UserPlus className="mx-auto text-primary mb-6" size={56} strokeWidth={1.5} />
          <CardTitle className="text-4xl font-bold text-primary">إنشاء حساب جديد</CardTitle>
          <CardDescription className="text-lg text-muted-foreground mt-2">انضم إلى منصة الحكيم اليوم للوصول إلى خدماتنا الطبية المتكاملة.</CardDescription>
        </CardHeader>
        <CardContent className="p-8 pt-0">
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-md">الاسم الكامل</Label>
              <Input
                id="name"
                placeholder="الاسم الكامل كما سيظهر في ملفك"
                {...form.register('name')}
                className={`py-3 text-base ${form.formState.errors.name ? 'border-destructive focus-visible:ring-destructive' : ''}`}
              />
              {form.formState.errors.name && (
                <p className="text-sm text-destructive pt-1">{form.formState.errors.name.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-md">البريد الإلكتروني</Label>
              <Input
                id="email"
                type="email"
                placeholder="example@mail.com"
                {...form.register('email')}
                className={`py-3 text-base ${form.formState.errors.email ? 'border-destructive focus-visible:ring-destructive' : ''}`}
              />
              {form.formState.errors.email && (
                <p className="text-sm text-destructive pt-1">{form.formState.errors.email.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-md">كلمة المرور</Label>
              <Input
                id="password"
                type="password"
                placeholder="كلمة مرور قوية (6 أحرف على الأقل)"
                {...form.register('password')}
                className={`py-3 text-base ${form.formState.errors.password ? 'border-destructive focus-visible:ring-destructive' : ''}`}
              />
              {form.formState.errors.password && (
                <p className="text-sm text-destructive pt-1">{form.formState.errors.password.message}</p>
              )}
            </div>
            <div className="space-y-3">
              <Label className="text-md">أرغب في التسجيل كـ:</Label>
              <Controller
                name="role"
                control={form.control}
                render={({ field }) => (
                  <RadioGroup
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    className="flex space-x-6 space-x-reverse pt-1" // Increased spacing
                    dir="rtl" 
                  >
                    <div className="flex items-center space-x-2 space-x-reverse cursor-pointer p-2 rounded-md hover:bg-muted transition-colors">
                      <RadioGroupItem value="patient" id="patient" className="w-5 h-5" />
                      <Label htmlFor="patient" className="font-medium text-md cursor-pointer">مريض</Label>
                    </div>
                    <div className="flex items-center space-x-2 space-x-reverse cursor-pointer p-2 rounded-md hover:bg-muted transition-colors">
                      <RadioGroupItem value="doctor" id="doctor" className="w-5 h-5" />
                      <Label htmlFor="doctor" className="font-medium text-md cursor-pointer">طبيب</Label>
                    </div>
                  </RadioGroup>
                )}
              />
              {form.formState.errors.role && (
                <p className="text-sm text-destructive pt-1">{form.formState.errors.role.message}</p>
              )}
            </div>
            <Button type="submit" className="w-full bg-accent hover:bg-accent/90 text-accent-foreground text-lg py-6 rounded-lg shadow-md hover:shadow-lg transition-shadow" disabled={isSubmitting || loading}>
              {isSubmitting || loading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  جاري إنشاء الحساب...
                </>
              ) : (
                <>
                  <ShieldPlus size={20} className="mr-2 rtl:ml-2" />
                  إنشاء حساب آمن
                </>
              )}
            </Button>
          </form>
          <p className="mt-8 text-center text-md text-muted-foreground">
            لديك حساب بالفعل؟{' '}
            <Link href="/auth/login" className="font-medium text-primary hover:underline hover:text-accent transition-colors">
              تسجيل الدخول من هنا
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
