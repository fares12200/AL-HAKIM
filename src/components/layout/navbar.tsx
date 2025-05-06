'use client';
import Link from 'next/link';
import { Stethoscope, Home, CalendarPlus, Users, HeartPulse, UserCircle, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useState, useEffect } from 'react';

const navLinks = [
  { href: '/', label: 'الرئيسية', icon: Home },
  { href: '/appointments', label: 'حجز موعد', icon: CalendarPlus },
  { href: '#doctors', label: 'الأطباء', icon: Users }, // Placeholder href
  { href: '#health-profile', label: 'ملفي الصحي', icon: HeartPulse }, // Placeholder href
];

export default function Navbar() {
  const [isMobile, setIsMobile] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const NavContent = () => (
    <>
      {navLinks.map((link) => (
        <Link key={link.label} href={link.href} passHref>
          <Button variant="ghost" className="flex items-center gap-2 text-foreground hover:text-primary">
            <link.icon size={18} />
            {link.label}
          </Button>
        </Link>
      ))}
      <Button variant="outline" className="flex items-center gap-2 text-primary border-primary hover:bg-primary hover:text-primary-foreground">
        <UserCircle size={18} />
        دخول / تسجيل
      </Button>
    </>
  );

  if (!isClient) {
    return (
      <header className="bg-card shadow-md sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <Link href="/" passHref>
            <div className="flex items-center gap-2 text-primary cursor-pointer">
              <Stethoscope size={32} />
              <h1 className="text-2xl font-bold">منصة الحكيم</h1>
            </div>
          </Link>
          {/* Placeholder for hydration */}
          <div className="hidden md:flex items-center space-x-2 space-x-reverse">
             <div className="w-20 h-8 bg-muted rounded"></div>
             <div className="w-24 h-8 bg-muted rounded"></div>
             <div className="w-20 h-8 bg-muted rounded"></div>
             <div className="w-28 h-8 bg-muted rounded"></div>
             <div className="w-32 h-8 bg-muted rounded"></div>
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
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu size={24} />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[250px] bg-card flex flex-col p-6">
              <nav className="flex flex-col space-y-4 mt-6">
                <NavContent />
              </nav>
            </SheetContent>
          </Sheet>
        ) : (
          <nav className="flex items-center space-x-2 space-x-reverse">
            <NavContent />
          </nav>
        )}
      </div>
    </header>
  );
}
