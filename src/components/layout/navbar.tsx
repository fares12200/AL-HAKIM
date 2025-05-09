'use client';
import Link from 'next/link';
import { Stethoscope, Home, CalendarPlus, Users, HeartPulse, UserCircle, Menu, LogOut, Gauge, UserCog, Briefcase, CalendarSearch, Bell, CheckCheck, XCircle, InfoIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetClose, SheetTitle } from '@/components/ui/sheet';
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth-context';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from '@/components/ui/badge';
import { useNotification, type Notification } from '@/contexts/notification-context';
import { formatDistanceToNow } from 'date-fns';
import { arSA } from 'date-fns/locale';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useRouter } from 'next/navigation'; // Added for notification link navigation

const baseNavLinks = [
  { href: '/', label: 'الرئيسية', icon: Home, requiresAuth: false, roles: ['patient', 'doctor', null] },
  { href: '/appointments', label: 'حجز موعد', icon: CalendarPlus, requiresAuth: false, roles: ['patient', 'doctor', null] },
];

export default function Navbar() {
  const { user, logOut, loading } = useAuth();
  const { 
    getNotificationsForUser, 
    unreadCount, // This is now the unread count for the current user
    markAsRead, 
    markAllAsRead, 
    clearNotifications 
  } = useNotification();
  const router = useRouter(); // Added for navigation
  const [isMobile, setIsMobile] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);

  // Directly use unreadCount from the context, as it's already for the current user
  const currentUserUnreadCount = unreadCount;


  useEffect(() => {
    setIsClient(true);
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
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
        dynamicLinks.push({ href: '/patient/dashboard', label: 'لوحة التحكم', icon: Gauge, requiresAuth: true, roles: ['patient'] });
        dynamicLinks.push({ href: '/patient/appointments', label: 'مواعيدي', icon: CalendarSearch, requiresAuth: true, roles: ['patient'] });
      } else if (user.role === 'doctor') {
        dynamicLinks.push({ href: '/doctor/dashboard', label: 'لوحة التحكم', icon: Gauge, requiresAuth: true, roles: ['doctor'] });
      }
    }
    return [...baseNavLinks, ...dynamicLinks].filter(link => {
      if (!link.requiresAuth) return true;
      if (user && link.roles.includes(user.role || null)) return true;
      return false;
    });
  };
  
  const ProfileLink = () => {
    if (!user) return null;
    const profilePath = user.role === 'doctor' ? `/doctor/profile` : `/patient/profile`;
    const profileLabel = user.role === 'doctor' ? 'الملف المهني' : 'الملف الشخصي';
    const ProfileSpecificIcon = user.role === 'doctor' ? Briefcase : UserCog;

    return (
         isMobile ? (
            <SheetClose asChild>
                <Link href={profilePath} passHref onClick={handleLinkClick}>
                <Button variant="ghost" className="flex items-center justify-start gap-3 text-foreground hover:text-primary w-full text-md py-3 px-4 rounded-lg">
                    <ProfileSpecificIcon size={20} strokeWidth={1.5}/>
                    {profileLabel}
                </Button>
                </Link>
            </SheetClose>
         ) : (
            <Link href={profilePath} passHref>
                <DropdownMenuItem className="justify-end cursor-pointer text-md py-2.5 px-3">
                {profileLabel}
                <ProfileSpecificIcon className="ml-2 h-5 w-5" strokeWidth={1.5}/>
                </DropdownMenuItem>
            </Link>
         )
    );
  };
  
  const renderNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'success':
        return <CheckCheck className="h-5 w-5 text-green-500" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'warning':
        return <InfoIcon className="h-5 w-5 text-yellow-500" />; // Or use AlertTriangle
      case 'info':
      default:
        return <InfoIcon className="h-5 w-5 text-blue-500" />;
    }
  };

  const NotificationMenu = () => {
    if (!user) return null;
    const userNotifications = getNotificationsForUser(user.uid);

    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="relative rounded-lg p-2">
            <Bell size={24} />
            {currentUserUnreadCount > 0 && (
              <Badge variant="destructive" className="absolute -top-1 -right-1 h-5 w-5 justify-center rounded-full p-0 text-xs">
                {currentUserUnreadCount}
              </Badge>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-80 md:w-96 rounded-xl shadow-lg mt-2 p-0" align="end">
          <DropdownMenuLabel className="px-4 py-3 border-b text-lg font-semibold text-right">
            الإشعارات ({userNotifications.length})
          </DropdownMenuLabel>
          <ScrollArea className="h-[300px] md:h-[400px]">
            {userNotifications.length === 0 ? (
              <p className="text-center text-muted-foreground py-10 px-4 text-sm">لا توجد إشعارات جديدة.</p>
            ) : (
              <DropdownMenuGroup>
                {userNotifications.map((notification) => (
                  <DropdownMenuItem
                    key={notification.id}
                    className={`p-3 border-b last:border-b-0 hover:bg-muted/50 cursor-pointer ${!notification.read ? 'bg-primary/5' : ''}`}
                    onClick={() => {
                      if (!notification.read) markAsRead(notification.id);
                      if (notification.link) router.push(notification.link);
                    }}
                    dir="rtl"
                  >
                    <div className="flex items-start gap-3 w-full">
                      <div className="flex-shrink-0 mt-1">
                        {renderNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-grow">
                        <p className={`text-sm ${!notification.read ? 'font-semibold text-foreground' : 'text-foreground/80'}`}>
                          {notification.message}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {formatDistanceToNow(new Date(notification.timestamp), { addSuffix: true, locale: arSA })}
                        </p>
                      </div>
                       {!notification.read && <div className="w-2 h-2 bg-primary rounded-full self-center ml-auto"></div>}
                    </div>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuGroup>
            )}
          </ScrollArea>
          {userNotifications.length > 0 && user && ( // Ensure user is not null for markAllAsRead and clearNotifications
            <>
              <DropdownMenuSeparator />
              <DropdownMenuGroup className="p-2">
                <DropdownMenuItem
                    onClick={() => markAllAsRead(user.uid)}
                    disabled={currentUserUnreadCount === 0}
                    className="justify-center text-sm py-2 cursor-pointer hover:bg-muted/80"
                >
                    وضع علامة على الكل كمقروء
                </DropdownMenuItem>
                <DropdownMenuItem
                    onClick={() => clearNotifications(user.uid)}
                    className="justify-center text-sm py-2 text-destructive hover:bg-destructive/10 cursor-pointer"
                >
                    مسح جميع الإشعارات
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  };


  const NavContent = () => (
    <>
      {navLinks.map((link) => (
        isMobile ? (
            <SheetClose asChild key={link.href}>
                <Link href={link.href} passHref onClick={handleLinkClick}>
                <Button variant="ghost" className="flex items-center justify-start gap-3 text-foreground hover:text-primary w-full text-md py-3 px-4 rounded-lg">
                    <link.icon size={20} strokeWidth={1.5}/>
                    {link.label}
                </Button>
                </Link>
            </SheetClose>
        ) : (
            <Link key={link.href} href={link.href} passHref>
            <Button variant="ghost" className="flex items-center justify-center gap-2 text-foreground hover:text-primary text-md px-4 py-2 rounded-lg">
                {user && (link.href === (user.role === 'doctor' ? '/doctor/dashboard' : '/patient/dashboard') || link.href === '/patient/appointments' && user.role === 'patient') && (
                  <Avatar className="h-7 w-7">
                    <AvatarImage src={user.photoURL || `https://avatar.vercel.sh/${user.email || user.uid}.png?size=28`} alt={user.displayName || 'User'} />
                    <AvatarFallback className="text-xs bg-primary/20 text-primary font-semibold">
                      {user.displayName?.[0]?.toUpperCase() || (user.email?.[0]?.toUpperCase() || 'U')}
                    </AvatarFallback>
                  </Avatar>
                )}
               {!user && link.href === '/' &&  <link.icon size={18} strokeWidth={1.5}/> }
               {user && !( (link.href === (user.role === 'doctor' ? '/doctor/dashboard' : '/patient/dashboard')) || (link.href === '/patient/appointments' && user.role === 'patient') ) && <link.icon size={18} strokeWidth={1.5}/> }
                {link.label}
            </Button>
            </Link>
        )
      ))}
      {user && !loading ? (
        isMobile ? (
           <>
            {user && <NotificationMenu /> } {/* Added NotificationMenu for mobile */}
            <ProfileLink />
            <SheetClose asChild>
                <Button variant="ghost" onClick={() => { logOut(); handleLinkClick();}} className="flex items-center justify-start gap-3 text-destructive hover:text-destructive/90 w-full text-md py-3 px-4 rounded-lg hover:bg-destructive/10">
                <LogOut size={20} strokeWidth={1.5}/>
                تسجيل الخروج
                </Button>
            </SheetClose>
           </>
        ) : (
          <>
          <NotificationMenu />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-11 w-11 rounded-full p-0">
                <Avatar className="h-10 w-10 border-2 border-primary/50 hover:border-primary transition-colors">
                  <AvatarImage src={user.photoURL || `https://avatar.vercel.sh/${user.email || user.uid}.png?size=100`} alt={user.displayName || 'User'} />
                  <AvatarFallback className="bg-primary/20 text-primary font-semibold text-lg">{user.displayName?.[0]?.toUpperCase() || (user.email?.[0]?.toUpperCase() || 'U')}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-60 rounded-xl shadow-lg mt-2" align="end" forceMount>
              <DropdownMenuLabel className="font-normal px-3 py-2.5">
                <div className="flex flex-col space-y-1 text-right">
                  <p className="text-md font-semibold leading-none text-foreground">{user.displayName || user.email}</p>
                  <p className="text-sm leading-none text-muted-foreground">
                    {user.role === 'patient' ? 'حساب مريض' : 'حساب طبيب'}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <ProfileLink />
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={logOut} className="text-destructive focus:text-destructive-foreground focus:bg-destructive/80 justify-end cursor-pointer text-md py-2.5 px-3 hover:bg-destructive/10">
                تسجيل الخروج
                <LogOut className="ml-2 h-5 w-5" strokeWidth={1.5}/>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          </>
        )
      ) : !loading ? (
         isMobile ? (
            <SheetClose asChild>
                <Link href="/auth/login" passHref onClick={handleLinkClick}>
                    <Button variant="default" className="flex items-center justify-center gap-3 bg-accent hover:bg-accent/90 text-accent-foreground w-full text-md py-3 px-4 rounded-lg">
                    <UserCircle size={20} strokeWidth={1.5}/>
                    دخول / تسجيل
                    </Button>
                </Link>
            </SheetClose>
         ) : (
            <Link href="/auth/login" passHref>
                <Button variant="default" className="flex items-center gap-2 text-md px-5 py-2.5 rounded-lg bg-accent hover:bg-accent/90 text-accent-foreground shadow-sm hover:shadow-md transition-all">
                <UserCircle size={18} strokeWidth={1.5}/>
                دخول / تسجيل
                </Button>
            </Link>
         )
      ) : null}
    </>
  );
  

  if (!isClient) { 
    return (
      <header className="bg-card shadow-md sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-3 flex justify-between items-center">
          <Link href="/" passHref>
            <div className="flex items-center gap-2.5 text-primary cursor-pointer">
              <Stethoscope size={36} strokeWidth={1.5} />
              <h1 className="text-2xl sm:text-3xl font-bold">منصة الحكيم</h1>
            </div>
          </Link>
          <div className="hidden md:flex items-center space-x-1 space-x-reverse">
             <div className="w-24 h-10 bg-muted rounded-lg animate-pulse"></div>
             <div className="w-28 h-10 bg-muted rounded-lg animate-pulse"></div>
             <div className="w-36 h-10 bg-muted rounded-lg animate-pulse"></div>
          </div>
          <div className="md:hidden"> 
            <Button variant="ghost" size="icon" className="rounded-lg">
                <Menu size={28} />
            </Button>
          </div>
        </div>
      </header>
    );
  }


  return (
    <header className="bg-card shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-3 flex justify-between items-center">
        <Link href="/" passHref>
          <div className="flex items-center gap-2.5 text-primary cursor-pointer">
            <Stethoscope size={36} strokeWidth={1.5}/>
            <h1 className="text-2xl sm:text-3xl font-bold">منصة الحكيم</h1>
          </div>
        </Link>

        {isMobile ? (
          <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-lg p-2">
                <Menu size={28} />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] bg-card flex flex-col p-6 shadow-xl rounded-l-xl">
               <SheetTitle className="sr-only">القائمة الرئيسية</SheetTitle>
               <div className="flex items-center gap-2.5 text-primary mb-6 border-b pb-4">
                 <Stethoscope size={32} strokeWidth={1.5}/>
                 <h2 className="text-2xl font-bold">منصة الحكيم</h2>
               </div>
              <nav className="flex flex-col space-y-3 mt-2">
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
