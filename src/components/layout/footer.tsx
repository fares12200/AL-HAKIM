import { Copyright } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gradient-to-t from-muted/60 to-muted/30 text-muted-foreground py-8 mt-auto border-t border-border/50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
            <Copyright size={18} />
            <p className="text-md font-medium">
                {new Date().getFullYear()} منصة الحكيم.
            </p>
        </div>
        <p className="text-sm">جميع الحقوق محفوظة. تم التطوير بحب لخدمتكم.</p>
        {/* Optional: Add social media links or other footer content here */}
        {/* <div className="mt-4 flex justify-center space-x-4 space-x-reverse">
            <a href="#" className="hover:text-primary transition-colors">فيسبوك</a>
            <a href="#" className="hover:text-primary transition-colors">تويتر</a>
            <a href="#" className="hover:text-primary transition-colors">انستغرام</a>
        </div> */}
      </div>
    </footer>
  );
}
