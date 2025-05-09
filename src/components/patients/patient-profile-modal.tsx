
'use client';

import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2, UserSquare2, Mail, Phone, CalendarDays, X } from 'lucide-react';
import { db, type User as AppUser } from '@/lib/firebase'; 
import { format } from 'date-fns';
import { arSA } from 'date-fns/locale';

interface PatientProfileData extends AppUser {
  phoneNumber?: string;
  dateOfBirth?: string;
  // Add other relevant fields from your 'users' collection for patients
}

interface PatientProfileModalProps {
  patientId: string;
  patientName: string; // Fallback name for title
  isOpen: boolean;
  onClose: () => void;
}

export default function PatientProfileModal({ patientId, patientName, isOpen, onClose }: PatientProfileModalProps) {
  const [profileData, setProfileData] = useState<PatientProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && patientId) {
      const fetchProfile = async () => {
        setIsLoading(true);
        setError(null);
        try {
          const userDoc = await db.getDoc(`users/${patientId}`);
          if (userDoc.exists()) {
            const data = userDoc.data() as any;
            setProfileData({
              uid: userDoc.id,
              email: data.email,
              displayName: data.name || patientName, // Prioritize fetched name
              role: data.role,
              photoURL: data.photoURL,
              phoneNumber: data.phoneNumber,
              dateOfBirth: data.dateOfBirth,
            });
          } else {
            setError('لم يتم العثور على ملف المريض.');
            setProfileData(null);
          }
        } catch (err) {
          console.error("Error fetching patient profile:", err);
          setError('حدث خطأ أثناء تحميل ملف المريض.');
          setProfileData(null);
        } finally {
          setIsLoading(false);
        }
      };
      fetchProfile();
    }
  }, [isOpen, patientId, patientName]);

  if (!isOpen) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[525px] rounded-lg p-0">
        <DialogHeader className="p-6 pb-4 border-b">
          <DialogTitle className="text-2xl font-semibold text-primary flex items-center gap-2">
            <UserSquare2 size={28} strokeWidth={1.5} />
            الملف الشخصي للمريض: {profileData?.displayName || patientName}
          </DialogTitle>
          <DialogDescription className="text-md text-muted-foreground pt-1">
            تفاصيل ومعلومات الاتصال الخاصة بالمريض.
          </DialogDescription>
        </DialogHeader>
        <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-10">
              <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
              <p className="text-muted-foreground">جاري تحميل بيانات المريض...</p>
            </div>
          )}
          {error && !isLoading && (
            <div className="text-center py-10 text-destructive bg-destructive/10 p-4 rounded-md">
              <p className="font-semibold text-lg">{error}</p>
            </div>
          )}
          {!isLoading && !error && profileData && (
            <div className="space-y-4 text-right">
              <InfoItem icon={UserSquare2} label="الاسم الكامل" value={profileData.displayName} />
              <InfoItem icon={Mail} label="البريد الإلكتروني" value={profileData.email} />
              <InfoItem icon={Phone} label="رقم الهاتف" value={profileData.phoneNumber || 'غير متوفر'} />
              <InfoItem icon={CalendarDays} label="تاريخ الميلاد" value={profileData.dateOfBirth ? format(new Date(profileData.dateOfBirth), 'PPP', {locale: arSA}) : 'غير متوفر'} />
               {/* Add more fields as needed from PatientProfileData */}
            </div>
          )}
           {!isLoading && !error && !profileData && (
            <div className="text-center py-10 text-muted-foreground">
              <p>لا توجد بيانات لعرضها.</p>
            </div>
          )}
        </div>
        <div className="px-6 py-4 border-t flex justify-end">
          <Button variant="outline" onClick={onClose} className="rounded-md text-md py-2.5 px-6">
            <X size={18} className="ml-2" />
            إغلاق
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

interface InfoItemProps {
    icon: React.ElementType;
    label: string;
    value: string | null | undefined;
}

const InfoItem: React.FC<InfoItemProps> = ({ icon: Icon, label, value}) => (
    <div className="flex items-start justify-end gap-3 py-2 border-b border-border/50 last:border-b-0">
        <div className="text-right">
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="text-md font-medium text-foreground">{value || 'غير محدد'}</p>
        </div>
        <Icon size={20} className="text-primary mt-1" strokeWidth={1.5}/>
    </div>
);
