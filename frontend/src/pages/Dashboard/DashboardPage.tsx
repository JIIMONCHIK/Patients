import { useEffect, useState } from 'react';
import { Typography, Card, Row, Col, Statistic, Spin } from 'antd';
import { useAuth } from '../../contexts/AuthContext';
import { UserOutlined, TeamOutlined, CalendarOutlined } from '@ant-design/icons';
import { getPatients } from '../../api/patients';
import { getDoctors } from '../../api/doctors';
import { getAppointments } from '../../api/appointments';

const { Title } = Typography;

const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [patientCount, setPatientCount] = useState(0);
  const [doctorCount, setDoctorCount] = useState(0);
  const [appointmentCount, setAppointmentCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [patientsRes, doctorsRes, appointmentsRes] = await Promise.all([
          getPatients(),
          getDoctors(),
          getAppointments(),
        ]);
        setPatientCount(patientsRes.data.length);
        setDoctorCount(doctorsRes.data.length);
        setAppointmentCount(appointmentsRes.data.length);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <Spin size="large" style={{ display: 'block', margin: '100px auto' }} />;

  return (
    <div>
      <Title level={2}>Добро пожаловать, {user?.email}</Title>
      <Row gutter={16}>
        {(user?.role === 'admin' || user?.role === 'registrar') && (
          <>
            <Col span={6}>
              <Card>
                <Statistic title="Пациенты" value={patientCount} prefix={<UserOutlined />} />
              </Card>
            </Col>
            <Col span={6}>
              <Card>
                <Statistic title="Врачи" value={doctorCount} prefix={<TeamOutlined />} />
              </Card>
            </Col>
            <Col span={6}>
              <Card>
                <Statistic title="Приёмы" value={appointmentCount} prefix={<CalendarOutlined />} />
              </Card>
            </Col>
          </>
        )}
        {user?.role === 'doctor' && (
          <Col span={6}>
            <Card>
              <Statistic title="Мои приёмы" value={appointmentCount} prefix={<CalendarOutlined />} />
            </Card>
          </Col>
        )}
      </Row>
    </div>
  );
};

export default DashboardPage;