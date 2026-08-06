// src/types/index.ts
export interface User {
  id: string;
  email: string;
  role: 'admin' | 'doctor' | 'registrar' | 'patient';
  is_active: boolean;
}

export interface Patient {
  id: string;
  full_name: string;
  birth_date?: string | null;
  gender?: string;
  phone?: string;
  address?: string;
  policy_number?: string;
  blood_group?: string;
  allergies?: string;
  chronic_diseases?: string;
  user_id?: string | null;
}

export interface Doctor {
  id: string;
  full_name: string;
  specialization_id?: string | null;
  cabinet?: string;
  user_id?: string | null;
}

export interface Specialization {
  id: string;
  name: string;
}

export interface AppointmentSlot {
  id: string;
  doctor_id: string;
  start_datetime: string;
  end_datetime: string;
  is_available: boolean;
}

export interface Appointment {
  id: string;
  slot_id: string;
  patient_id: string;
  status: 'booked' | 'cancelled' | 'completed';
  created_at: string;
}

export interface MedicalRecord {
  id: string;
  appointment_id: string;
  diagnosis?: string;
  complaints?: string;
  prescriptions?: string;
  recommendations?: string;
  created_at: string;
  updated_at?: string | null;
}

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}