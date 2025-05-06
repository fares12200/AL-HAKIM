export default function Footer() {
  return (
    <footer className="bg-muted text-muted-foreground py-6 mt-auto">
      <div className="container mx-auto px-4 text-center">
        <p>&copy; {new Date().getFullYear()} منصة الحكيم. جميع الحقوق محفوظة.</p>
      </div>
    </footer>
  );
}
