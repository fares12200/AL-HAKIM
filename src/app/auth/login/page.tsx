'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/auth-context';
import { useToast } from '@/hooks/use-toast';
import { Loader2, LogInIcon, ShieldCheck } from 'lucide-react';
import { useRouter } from 'next/navigation';

const loginSchema = z.object({
  email: z.string().email({ message: 'البريد الإلكتروني غير صالح.' }),
  password: z.string().min(6, { message: 'كلمة المرور يجب أن تكون 6 أحرف على الأقل.' }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const { logIn, loading } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    setIsSubmitting(true);
    try {
      await logIn(data.email, data.password);
      toast({
        title: 'تم تسجيل الدخول بنجاح!',
        description: 'أهلاً بك مجدداً في منصة الحكيم.',
        variant: 'default',
        className: 'bg-green-500 text-white border-green-600',
      });
      // Redirection is handled within logIn method in AuthContext
    } catch (error: any) {
      toast({
        title: 'خطأ في تسجيل الدخول',
        description: error.message || 'البريد الإلكتروني أو كلمة المرور غير صحيحة. يرجى المحاولة مرة أخرى.',
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
          <LogInIcon className="mx-auto text-primary mb-6" size={56} strokeWidth={1.5}/>
          <CardTitle className="text-4xl font-bold text-primary">تسجيل الدخول</CardTitle>
          <CardDescription className="text-lg text-muted-foreground mt-2">أدخل بريدك الإلكتروني وكلمة المرور للوصول إلى حسابك في منصة الحكيم.</CardDescription>
        </CardHeader>
        <CardContent className="p-8 pt-0">
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
                placeholder="********"
                {...form.register('password')}
                className={`py-3 text-base ${form.formState.errors.password ? 'border-destructive focus-visible:ring-destructive' : ''}`}
              />
              {form.formState.errors.password && (
                <p className="text-sm text-destructive pt-1">{form.formState.errors.password.message}</p>
              )}
            </div>
            <Button type="submit" className="w-full bg-accent hover:bg-accent/90 text-accent-foreground text-lg py-6 rounded-lg shadow-md hover:shadow-lg transition-shadow" disabled={isSubmitting || loading}>
              {isSubmitting || loading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  جاري تسجيل الدخول...
                </>
              ) : (
                <>
                 <ShieldCheck size={20} className="mr-2 rtl:ml-2" />
                  تسجيل الدخول الآمن
                </>
              )}
            </Button>
          </form>
          <p className="mt-8 text-center text-md text-muted-foreground">
            ليس لديك حساب بعد؟{' '}
            <Link href="/auth/signup" className="font-medium text-primary hover:underline hover:text-accent transition-colors">
              أنشئ حساباً جديداً الآن
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
