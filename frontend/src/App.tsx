import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import ruRU from 'antd/locale/ru_RU';
import { AuthProvider } from './contexts/AuthContext';
import MainLayout from './components/Layout/MainLayout';
import ProtectedRoute from './components/Layout/ProtectedRoute';
import LoginPage from './pages/Login/LoginPage';
import DashboardPage from './pages/Dashboard/DashboardPage';
import PatientsList from './pages/Patients/PatientsList';
import PatientForm from './pages/Patients/PatientForm';
import DoctorsList from './pages/Doctors/DoctorsList';
import DoctorForm from './pages/Doctors/DoctorForm';
import SpecializationsList from './pages/Specializations/SpecializationsList';
import AppointmentsList from './pages/Appointments/AppointmentsList';
import MedicalRecordsList from './pages/MedicalRecords/MedicalRecordsList';
import BookAppointment from './pages/Appointments/BookAppointment';
import ProfilePage from './pages/Profile/ProfilePage';

const App = () => {
  return (
    <ConfigProvider locale={ruRU}>
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route
              path="/"
              element={
                <ProtectedRoute allowedRoles={['admin', 'registrar', 'doctor', 'patient']}>
                  <MainLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<DashboardPage />} />
              <Route
                path="patients"
                element={
                  <ProtectedRoute allowedRoles={['admin', 'registrar']}>
                    <PatientsList />
                  </ProtectedRoute>
                }
              />
              <Route
                path="patients/new"
                element={
                  <ProtectedRoute allowedRoles={['admin', 'registrar']}>
                    <PatientForm />
                  </ProtectedRoute>
                }
              />
              <Route
                path="patients/:id"
                element={
                  <ProtectedRoute allowedRoles={['admin', 'registrar']}>
                    <PatientForm />
                  </ProtectedRoute>
                }
              />
              <Route
                path="doctors"
                element={
                  <ProtectedRoute allowedRoles={['admin', 'registrar']}>
                    <DoctorsList />
                  </ProtectedRoute>
                }
              />
              <Route
                path="doctors/new"
                element={
                  <ProtectedRoute allowedRoles={['admin', 'registrar']}>
                    <DoctorForm />
                  </ProtectedRoute>
                }
              />
              <Route
                path="doctors/:id"
                element={
                  <ProtectedRoute allowedRoles={['admin', 'registrar']}>
                    <DoctorForm />
                  </ProtectedRoute>
                }
              />
              <Route
                path="specializations"
                element={
                  <ProtectedRoute allowedRoles={['admin', 'registrar']}>
                    <SpecializationsList />
                  </ProtectedRoute>
                }
              />
              <Route
                path="appointments"
                element={
                  <ProtectedRoute allowedRoles={['admin', 'registrar', 'doctor', 'patient']}>
                    <AppointmentsList />
                  </ProtectedRoute>
                }
              />
              <Route
                path="medical-records"
                element={
                  <ProtectedRoute allowedRoles={['doctor', 'admin']}>
                    <MedicalRecordsList />
                  </ProtectedRoute>
                }
              />
              <Route
                path="appointments/book"
                element={
                  <ProtectedRoute allowedRoles={['admin', 'registrar', 'doctor', 'patient']}>
                    <BookAppointment />
                  </ProtectedRoute>
                }
              />
                <Route
                path="profile"
                element={
                  <ProtectedRoute allowedRoles={['admin', 'doctor', 'patient']}>
                    <ProfilePage />
                  </ProtectedRoute>
                }
              />
            </Route>
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </ConfigProvider>
  );
};

export default App;