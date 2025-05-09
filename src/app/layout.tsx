
import type { Metadata } from 'next';
import { Inter as Araboto } from 'next/font/google'; // Changed Noto_Sans_Arabic to Araboto (using Inter as a placeholder if Araboto is not a direct Google Font import)
import './globals.css';
import Navbar from '@/components/layout/navbar';
import Footer from '@/components/layout/footer';
import { Toaster } from "@/components/ui/toaster"
import { AuthProvider } from '@/contexts/auth-context';
import { NotificationProvider } from '@/contexts/notification-context'; // Import NotificationProvider

// If "Araboto" is a specific custom font, you'll need to ensure it's correctly set up.
// For Google Fonts, replace 'Inter' with 'Araboto' if available, or use the correct import.
// If Araboto is not a Google Font, this setup will need to be adjusted for local font files or a different provider.
const arabotoFont = Araboto({ // Placeholder: 'Inter' is used. Replace with actual Araboto if it's a Google Font or configure custom font.
  subsets: ['latin', 'arabic'], // Assuming Araboto supports Arabic, added 'arabic'. 'latin' is common.
  weight: ['300', '400', '500', '700'], // Common weights, adjust if Araboto has different ones.
  variable: '--font-araboto', // Changed variable name
});

export const metadata: Metadata = {
  title: 'منصة الحكيم',
  description: 'منصة الحكيم للحجوزات الطبية والمتابعة الصحية',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl">
      <body className={`antialiased flex flex-col min-h-screen ${arabotoFont.variable} font-sans`}>
        <AuthProvider>
          <NotificationProvider> {/* Wrap Navbar and children with NotificationProvider */}
            <Navbar />
            <main className="flex-grow container mx-auto px-4 py-8">
              {children}
            </main>
            <Footer />
            <Toaster />
          </NotificationProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

