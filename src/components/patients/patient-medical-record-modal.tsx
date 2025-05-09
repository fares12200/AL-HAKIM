
'use client';

import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2, FileHeart, Droplets, ShieldAlert, Activity, Pill, Info, X } from 'lucide-react';
import { db } from '@/lib/firebase';

interface MedicalRecordData {
  patientId?: string; // Should be the doc ID itself
  bloodType?: string;
  allergies?: string;
  chronicDiseases?: string;
  medications?: string;
  medicalHistoryNotes?: string;
  updatedAt?: string; 
}

interface PatientMedicalRecordModalProps {
  patientId: string;
  patientName: string; // Fallback name for title
  isOpen: boolean;
  onClose: () => void;
}

export default function PatientMedicalRecordModal({ patientId, patientName, isOpen, onClose }: PatientMedicalRecordModalProps) {
  const [recordData, setRecordData] = useState<MedicalRecordData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && patientId) {
      const fetchRecord = async () => {
        setIsLoading(true);
        setError(null);
        try {
          const recordDoc = await db.getDoc(`medicalRecords/${patientId}`);
          if (recordDoc.exists()) {
            setRecordData({ patientId, ...recordDoc.data() } as MedicalRecordData);
          } else {
            setRecordData(null); // No record found is not necessarily an error, just no data
            setError('لم يتم العثور على ملف صحي لهذا المريض.');
          }
        } catch (err) {
          console.error("Error fetching medical record:", err);
          setError('حدث خطأ أثناء تحميل الملف الصحي.');
          setRecordData(null);
        } finally {
          setIsLoading(false);
        }
      };
      fetchRecord();
    }
  }, [isOpen, patientId]);

  if (!isOpen) {
    return null;
  }
  
  const hasData = recordData && (recordData.bloodType || recordData.allergies || recordData.chronicDiseases || recordData.medications || recordData.medicalHistoryNotes);


  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[525px] rounded-lg p-0">
        <DialogHeader className="p-6 pb-4 border-b">
          <DialogTitle className="text-2xl font-semibold text-primary flex items-center gap-2">
            <FileHeart size={28} strokeWidth={1.5} />
            الملف الصحي للمريض: {patientName}
          </DialogTitle>
           <DialogDescription className="text-md text-muted-foreground pt-1">
            المعلومات الطبية الأساسية المسجلة للمريض.
          </DialogDescription>
        </DialogHeader>
        <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-10">
              <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
              <p className="text-muted-foreground">جاري تحميل بيانات الملف الصحي...</p>
            </div>
          )}
          {error && !isLoading && (
            <div className="text-center py-10 text-destructive bg-destructive/10 p-4 rounded-md">
                <p className="font-semibold text-lg">{error}</p>
            </div>
          )}
          {!isLoading && !error && !hasData && (
             <div className="text-center py-10 text-muted-foreground">
                <Info size={40} className="mx-auto mb-3" />
                <p className="text-lg">لا توجد معلومات صحية مسجلة لهذا المريض حتى الآن.</p>
             </div>
          )}
          {!isLoading && !error && hasData && recordData && (
            <div className="space-y-4 text-right">
              <InfoItem icon={Droplets} label="فصيلة الدم" value={recordData.bloodType} />
              <InfoItem icon={ShieldAlert} label="الحساسية المعروفة" value={recordData.allergies} />
              <InfoItem icon={Activity} label="الأمراض المزمنة" value={recordData.chronicDiseases} />
              <InfoItem icon={Pill} label="الأدوية الحالية" value={recordData.medications} />
              <InfoItem icon={Info} label="ملاحظات إضافية" value={recordData.medicalHistoryNotes} isTextArea />
              {recordData.updatedAt && (
                 <p className="text-xs text-muted-foreground text-left pt-3">
                    آخر تحديث: {new Date(recordData.updatedAt).toLocaleDateString('ar-DZ')}
                 </p>
              )}
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
    isTextArea?: boolean;
}

const InfoItem: React.FC<InfoItemProps> = ({ icon: Icon, label, value, isTextArea = false}) => {
    if (!value) return null; // Don't render if value is empty or null
    return (
        <div className="flex items-start justify-end gap-3 py-3 border-b border-border/50 last:border-b-0">
            <div className="text-right flex-1">
                <p className="text-sm text-muted-foreground">{label}</p>
                {isTextArea ? (
                    <p className="text-md font-medium text-foreground whitespace-pre-wrap leading-relaxed">{value}</p>
                ) : (
                    <p className="text-md font-medium text-foreground">{value}</p>
                )}
            </div>
            <Icon size={20} className="text-primary mt-1 flex-shrink-0" strokeWidth={1.5}/>
        </div>
    );
};

