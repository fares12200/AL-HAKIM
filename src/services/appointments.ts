
import { db } from '@/lib/firebase';
import { collection, addDoc, getDocs, doc, getDoc, updateDoc, deleteDoc, query, where, serverTimestamp } from 'firebase/firestore';

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
  patientName?: string;
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
  createdAt?: any; // Firestore ServerTimestamp
   /**
   * Timestamp of when the appointment was last updated.
   */
  updatedAt?: any; // Firestore ServerTimestamp
}

/**
 * Asynchronously retrieves a list of all appointments from Firestore.
 * @returns A promise that resolves to an array of Appointment objects.
 */
export async function getAllAppointments(): Promise<Appointment[]> {
  try {
    const appointmentsCol = collection(db, 'appointments');
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
  try {
    const appointmentsCol = collection(db, 'appointments');
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
  try {
    const appointmentDocRef = doc(db, 'appointments', id);
    const appointmentSnap = await getDoc(appointmentDocRef);
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
 * @param appointmentData The data for the appointment to create (excluding ID).
 * @returns A promise that resolves to the created Appointment object with its new ID.
 */
export async function createAppointment(appointmentData: Omit<Appointment, 'id' | 'createdAt' | 'updatedAt'>): Promise<Appointment> {
  try {
    const appointmentsCol = collection(db, 'appointments');
    const docRef = await addDoc(appointmentsCol, {
      ...appointmentData,
      status: 'pending', // Default status
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return { ...appointmentData, id: docRef.id, status: 'pending' } as Appointment; // Return with ID
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
  try {
    const appointmentDocRef = doc(db, 'appointments', appointmentId);
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
  try {
    const appointmentDocRef = doc(db, 'appointments', appointmentId);
    await deleteDoc(appointmentDocRef);
  } catch (error) {
    console.error(`Error deleting appointment ${appointmentId}:`, error);
    throw error;
  }
}
