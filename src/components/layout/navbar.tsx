
'use client';
import Link from 'next/link';
import { Stethoscope, Home, CalendarPlus, Users, HeartPulse, UserCircle, Menu, LogOut, LayoutDashboard, UserCog } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth-context';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const baseNavLinks = [
  { href: '/', label: 'الرئيسية', icon: Home, requiresAuth: false, roles: ['patient', 'doctor', null] },
  { href: '/appointments', label: 'حجز موعد', icon: CalendarPlus, requiresAuth: false, roles: ['patient', 'doctor', null] },
  // { href: '#doctors', label: 'الأطباء', icon: Users, requiresAuth: false, roles: ['patient', 'doctor', null] }, // Placeholder href
];

export default function Navbar() {
  const { user, logOut, loading } = useAuth();
  const [isMobile, setIsMobile] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);


  useEffect(() => {
    setIsClient(true);
    const checkMobile = () => setIsMobile(window.innerWidth < 768); // Adjusted breakpoint to md for better experience
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleLinkClick = () => {
    if (isMobile) {
      setSheetOpen(false);
    }
  };

  const getNavLinks = () => {
    let dynamicLinks = [];
    if (user) {
      if (user.role === 'patient') {
        dynamicLinks.push({ href: '/patient/dashboard', label: 'لوحة التحكم', icon: LayoutDashboard, requiresAuth: true, roles: ['patient'] });
        dynamicLinks.push({ href: '/patient/medical-record', label: 'ملفي الصحي', icon: HeartPulse, requiresAuth: true, roles: ['patient'] });
      } else if (user.role === 'doctor') {
        dynamicLinks.push({ href: '/doctor/dashboard', label: 'لوحة التحكم', icon: LayoutDashboard, requiresAuth: true, roles: ['doctor'] });
        dynamicLinks.push({ href: '/doctor/appointments', label: 'إدارة المواعيد', icon: CalendarPlus, requiresAuth: true, roles: ['doctor'] });
      }
    }
    return [...baseNavLinks, ...dynamicLinks].filter(link => {
      if (!link.requiresAuth) return true;
      if (user && link.roles.includes(user.role || null)) return true;
      return false;
    });
  };
  
  const navLinks = getNavLinks();

  const NavContent = () => (
    <>
      {navLinks.map((link) => (
        <Link key={link.href} href={link.href} passHref onClick={handleLinkClick}>
          <Button variant="ghost" className="flex items-center justify-start sm:justify-center gap-2 text-foreground hover:text-primary w-full sm:w-auto">
            <link.icon size={18} />
            {link.label}
          </Button>
        </Link>
      ))}
      {user && !loading ? (
        isMobile ? (
           <>
            <DropdownMenuSeparator />
            <Link href={user.role === 'doctor' ? `/doctor/profile` : `/patient/profile`} passHref onClick={handleLinkClick}>
              <Button variant="ghost" className="flex items-center justify-start gap-2 text-foreground hover:text-primary w-full">
                <UserCog size={18} />
                الملف الشخصي
              </Button>
            </Link>
            <Button variant="ghost" onClick={() => { logOut(); handleLinkClick();}} className="flex items-center justify-start gap-2 text-destructive hover:text-destructive/90 w-full">
              <LogOut size={18} />
              تسجيل الخروج
            </Button>
           </>
        ) : (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                <Avatar className="h-9 w-9">
                  <AvatarImage src={user.photoURL || `https://avatar.vercel.sh/${user.email}.png`} alt={user.displayName || 'User'} />
                  <AvatarFallback>{user.displayName?.[0]?.toUpperCase() || 'U'}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1 text-right">
                  <p className="text-sm font-medium leading-none">{user.displayName || user.email}</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user.role === 'patient' ? 'مريض' : 'طبيب'}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
               <Link href={user.role === 'doctor' ? `/doctor/profile` : `/patient/profile`} passHref>
                <DropdownMenuItem className="justify-end cursor-pointer">
                  الملف الشخصي
                  <UserCog className="ml-2 h-4 w-4" />
                </DropdownMenuItem>
              </Link>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={logOut} className="text-destructive focus:text-destructive-foreground focus:bg-destructive justify-end cursor-pointer">
                تسجيل الخروج
                <LogOut className="ml-2 h-4 w-4" />
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      ) : !loading ? (
         <Link href="/auth/login" passHref onClick={handleLinkClick}>
            <Button variant="outline" className="flex items-center gap-2 text-primary border-primary hover:bg-primary hover:text-primary-foreground w-full sm:w-auto">
              <UserCircle size={18} />
              دخول / تسجيل
            </Button>
        </Link>
      ) : null}
    </>
  );
  

  if (!isClient) { // For SSR and to prevent hydration mismatch
    return (
      <header className="bg-card shadow-md sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <Link href="/" passHref>
            <div className="flex items-center gap-2 text-primary cursor-pointer">
              <Stethoscope size={32} />
              <h1 className="text-2xl font-bold">منصة الحكيم</h1>
            </div>
          </Link>
          {/* Placeholder for hydration to match client-side structure */}
          <div className="hidden md:flex items-center space-x-2 space-x-reverse">
             {/* Mimic button placeholders for nav links */}
             <div className="w-24 h-9 bg-muted rounded-md"></div>
             <div className="w-28 h-9 bg-muted rounded-md"></div>
             {/* <div className="w-20 h-9 bg-muted rounded-md"></div> */}
             {/* Mimic login/user button placeholder */}
             <div className="w-36 h-9 bg-muted rounded-md"></div>
          </div>
          <div className="md:hidden"> {/* Placeholder for mobile menu icon */}
            <div className="w-10 h-10 bg-muted rounded-md"></div>
          </div>
        </div>
      </header>
    );
  }


  return (
    <header className="bg-card shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link href="/" passHref>
          <div className="flex items-center gap-2 text-primary cursor-pointer">
            <Stethoscope size={32} />
            <h1 className="text-2xl font-bold">منصة الحكيم</h1>
          </div>
        </Link>

        {isMobile ? (
          <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu size={24} />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[280px] bg-card flex flex-col p-6">
              <nav className="flex flex-col space-y-3 mt-6">
                <NavContent />
              </nav>
            </SheetContent>
          </Sheet>
        ) : (
          <nav className="flex items-center space-x-1 space-x-reverse">
            <NavContent />
          </nav>
        )}
      </div>
    </header>
  );
}
