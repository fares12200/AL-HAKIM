
import { firestore } from '@/lib/firebase'; // Use the exported Firestore instance
import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  getDoc as fbGetDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  serverTimestamp,
  type Timestamp 
} from 'firebase/firestore';

/**
 * Represents an appointment.
 */
export interface Appointment {
  /**
   * The appointment's ID (Firestore document ID).
   */
  id: string;
  /**
   * The doctor's ID.
   */
  doctorId: string;
  /**
   * The patient's ID.
   */
  patientId: string;
  /**
   * The patient's name (denormalized for easier display).
   */
  patientName?: string; // This should come from the form, linked to patientId
  /**
   * The appointment's date in 'yyyy-MM-dd' format.
   */
  date: string;
  /**
   * The appointment's time.
   */
  time: string;
  /**
   * Notes for the appointment.
   */
  notes?: string;
  /**
   * Status of the appointment.
   */
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  /**
   * Timestamp of when the appointment was created.
   */
  createdAt?: Timestamp | Date | any; 
   /**
   * Timestamp of when the appointment was last updated.
   */
  updatedAt?: Timestamp | Date | any; 
}

/**
 * Asynchronously retrieves a list of all appointments from Firestore.
 * @returns A promise that resolves to an array of Appointment objects.
 */
export async function getAllAppointments(): Promise<Appointment[]> {
  if (!firestore) throw new Error("Firestore is not initialized. Check configuration and console logs.");
  try {
    const appointmentsCol = collection(firestore, 'appointments');
    const appointmentSnapshot = await getDocs(appointmentsCol);
    const appointmentsList = appointmentSnapshot.docs.map(docSnap => ({
      id: docSnap.id,
      ...docSnap.data(),
    } as Appointment));
    return appointmentsList;
  } catch (error) {
    console.error("Error fetching all appointments:", error);
    throw error;
  }
}


/**
 * Asynchronously retrieves appointments for a specific doctor or patient from Firestore.
 * @param id The ID of the doctor or patient.
 * @param userType 'doctor' or 'patient'.
 * @returns A promise that resolves to an array of Appointment objects.
 */
export async function getAppointmentsForUser(id: string, userType: 'doctor' | 'patient'): Promise<Appointment[]> {
  if (!firestore) throw new Error("Firestore is not initialized. Check configuration and console logs.");
  try {
    const appointmentsCol = collection(firestore, 'appointments');
    const fieldToQuery = userType === 'doctor' ? 'doctorId' : 'patientId';
    const q = query(appointmentsCol, where(fieldToQuery, '==', id));
    const appointmentSnapshot = await getDocs(q);
    const appointmentsList = appointmentSnapshot.docs.map(docSnap => ({
      id: docSnap.id,
      ...docSnap.data(),
    } as Appointment));
    return appointmentsList.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime() || a.time.localeCompare(b.time));
  } catch (error)
  {
    console.error(`Error fetching appointments for ${userType} ${id}:`, error);
    throw error;
  }
}


/**
 * Asynchronously retrieves an appointment by ID from Firestore.
 *
 * @param id The ID of the appointment to retrieve.
 * @returns A promise that resolves to an Appointment object if found, or null if not found.
 */
export async function getAppointment(id: string): Promise<Appointment | null> {
  if (!firestore) throw new Error("Firestore is not initialized. Check configuration and console logs.");
  try {
    const appointmentDocRef = doc(firestore, 'appointments', id);
    const appointmentSnap = await fbGetDoc(appointmentDocRef);
    if (appointmentSnap.exists()) {
      return { id: appointmentSnap.id, ...appointmentSnap.data() } as Appointment;
    }
    return null;
  } catch (error) {
    console.error(`Error fetching appointment ${id}:`, error);
    throw error;
  }
}

/**
 * Asynchronously creates a new appointment in Firestore.
 *
 * @param appointmentData The data for the appointment to create (excluding ID, createdAt, updatedAt, status).
 *                        It must include doctorId, patientId, patientName, date, time, and optional notes.
 * @returns A promise that resolves to the created Appointment object with its new ID.
 */
export async function createAppointment(appointmentData: Omit<Appointment, 'id' | 'createdAt' | 'updatedAt' | 'status'>): Promise<Appointment> {
  if (!firestore) throw new Error("Firestore is not initialized. Check configuration and console logs.");
  if (!appointmentData.patientId) {
    throw new Error("Patient ID is required to create an appointment.");
  }
  try {
    const appointmentsCol = collection(firestore, 'appointments');
    const newAppointmentPayload = {
      ...appointmentData, // patientId and patientName are now passed directly
      status: 'pending' as const, 
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    const docRef = await addDoc(appointmentsCol, newAppointmentPayload);
    
    // Fetch the doctor's name to include in the return object or for notifications (optional here)
    // const doctorDoc = await getDoc(doc(firestore, 'users', appointmentData.doctorId));
    // const doctorName = doctorDoc.exists() ? doctorDoc.data()?.name : 'الطبيب';

    return { 
        id: docRef.id, 
        doctorId: appointmentData.doctorId,
        patientId: appointmentData.patientId,
        patientName: appointmentData.patientName,
        date: appointmentData.date,
        time: appointmentData.time,
        notes: appointmentData.notes,
        status: 'pending', 
    } as Appointment; 
  } catch (error) {
    console.error("Error creating appointment:", error);
    throw error;
  }
}

/**
 * Asynchronously updates an appointment's status in Firestore.
 * @param appointmentId The ID of the appointment to update.
 * @param status The new status for the appointment.
 * @returns A promise that resolves when the update is complete.
 */
export async function updateAppointmentStatus(appointmentId: string, status: 'pending' | 'confirmed' | 'cancelled' | 'completed'): Promise<void> {
  if (!firestore) throw new Error("Firestore is not initialized. Check configuration and console logs.");
  try {
    const appointmentDocRef = doc(firestore, 'appointments', appointmentId);
    await updateDoc(appointmentDocRef, {
      status: status,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error(`Error updating appointment ${appointmentId} status:`, error);
    throw error;
  }
}


/**
 * Asynchronously deletes an appointment from Firestore.
 * @param appointmentId The ID of the appointment to delete.
 * @returns A promise that resolves when the deletion is complete.
 */
export async function deleteAppointment(appointmentId: string): Promise<void> {
  if (!firestore) throw new Error("Firestore is not initialized. Check configuration and console logs.");
  try {
    const appointmentDocRef = doc(firestore, 'appointments', appointmentId);
    await deleteDoc(appointmentDocRef);
  } catch (error) {
    console.error(`Error deleting appointment ${appointmentId}:`, error);
    throw error;
  }
}
