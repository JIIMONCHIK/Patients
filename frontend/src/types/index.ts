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
  specialization_name?: string | null;
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
  patient_name?: string | null;
  doctor_name?: string | null;
  start_datetime?: string | null;
  end_datetime?: string | null;
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
  patient_name?: string | null;
  appointment_start_datetime?: string | null;
}

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

export interface Specialization {
  id: string;
  name: string;
}

export interface ProfileResponse {
  id: string;
  email: string;
  role: string;
  patient_full_name?: string | null;
  phone?: string | null;
  birth_date?: string | null;
  gender?: string | null;
  address?: string | null;
  policy_number?: string | null;
  blood_group?: string | null;
  allergies?: string | null;
  chronic_diseases?: string | null;
  doctor_full_name?: string | null;
  specialization_id?: string | null;
  specialization_name?: string | null;
  cabinet?: string | null;
}

export interface ProfileUpdate {
  email?: string;
  full_name?: string;
  phone?: string;
  birth_date?: string;
  gender?: string;
  address?: string;
  policy_number?: string;
  blood_group?: string;
  allergies?: string;
  chronic_diseases?: string;
  specialization_id?: string;
  cabinet?: string;
}

export interface ScheduleTemplate {
  id: string;
  doctor_id: string;
  day_of_week: number;   // 0=Пн..6=Вс
  start_time: string;    // HH:mm
  end_time: string;      // HH:mm
  slot_duration: number; // минуты
}

export interface ScheduleTemplateCreate {
  doctor_id: string;
  days_of_week?: number[];  // массив дней 0-6
  day_of_week?: number;     // для совместимости
  start_time: string;
  end_time: string;
  slot_duration?: number;
}