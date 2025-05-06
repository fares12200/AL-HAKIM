/**
 * Represents an appointment.
 */
export interface Appointment {
  /**
   * The appointment's ID.
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
   * The appointment's date.
   */
  date: string;
  /**
   * The appointment's time.
   */
  time: string;
}

/**
 * Asynchronously retrieves a list of appointments.
 * @returns A promise that resolves to an array of Appointment objects.
 */
export async function getAppointments(): Promise<Appointment[]> {
  // TODO: Implement this by calling an API.

  return [
    {
      id: '1',
      doctorId: '1',
      patientId: '1',
      date: '2024-01-01',
      time: '10:00',
    },
    {
      id: '2',
      doctorId: '2',
      patientId: '2',
      date: '2024-01-02',
      time: '11:00',
    },
  ];
}

/**
 * Asynchronously retrieves an appointment by ID.
 *
 * @param id The ID of the appointment to retrieve.
 * @returns A promise that resolves to an Appointment object if found, or null if not found.
 */
export async function getAppointment(id: string): Promise<Appointment | null> {
  // TODO: Implement this by calling an API.

  return {
    id: '1',
    doctorId: '1',
    patientId: '1',
    date: '2024-01-01',
    time: '10:00',
  };
}

/**
 * Asynchronously creates a new appointment.
 *
 * @param appointment The appointment to create.
 * @returns A promise that resolves to the created Appointment object.
 */
export async function createAppointment(appointment: Appointment): Promise<Appointment> {
  // TODO: Implement this by calling an API.

  return {
    id: '3',
    doctorId: '1',
    patientId: '1',
    date: '2024-01-03',
    time: '12:00',
  };
}
