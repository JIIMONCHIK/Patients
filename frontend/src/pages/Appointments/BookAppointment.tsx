import { useState, useEffect } from 'react';
import {
  Card, Row, Col, Button, Spin, message, Typography, List, Tag, Divider, Select,
} from 'antd';
import { CalendarOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { getDoctors } from '../../api/doctors';
import { getSlots } from '../../api/slots';
import { getPatients } from '../../api/patients';
import { createAppointment } from '../../api/appointments';
import { Doctor, AppointmentSlot, Patient } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

const BookAppointment: React.FC = () => {
  const { user } = useAuth();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [selectedPatientId, setSelectedPatientId] = useState<string | undefined>(
    user?.role === 'patient' && user.id ? user.id : undefined
  );
  const [slots, setSlots] = useState<AppointmentSlot[]>([]);
  const [loadingDoctors, setLoadingDoctors] = useState(false);
  const [loadingSlots, setLoadingSlots] = useState(false);

  useEffect(() => {
    fetchDoctors();
    // Если пользователь не пациент, загружаем список пациентов
    if (user?.role !== 'patient') {
      fetchPatients();
    }
  }, []);

  const fetchDoctors = async () => {
    setLoadingDoctors(true);
    try {
      const res = await getDoctors();
      setDoctors(res.data);
    } finally {
      setLoadingDoctors(false);
    }
  };

  const fetchPatients = async () => {
    try {
      const res = await getPatients();
      setPatients(res.data);
    } catch (err) {
      message.error('Не удалось загрузить список пациентов');
    }
  };

  const handleSelectDoctor = async (doctor: Doctor) => {
    setSelectedDoctor(doctor);
    setLoadingSlots(true);
    try {
      const res = await getSlots({ doctor_id: doctor.id, is_available: true });
      const sorted = res.data.sort((a: AppointmentSlot, b: AppointmentSlot) =>
        dayjs(a.start_datetime).diff(dayjs(b.start_datetime))
      );
      setSlots(sorted);
    } finally {
      setLoadingSlots(false);
    }
  };

  const handleBookSlot = async (slot: AppointmentSlot) => {
    if (user?.role !== 'patient' && !selectedPatientId) {
      message.warning('Пожалуйста, выберите пациента');
      return;
    }
    try {
      await createAppointment({
        slot_id: slot.id,
        patient_id: selectedPatientId, // для пациента будет свой id, для админа – выбранный
      });
      message.success('Запись создана');
      // Убираем занятый слот из списка
      setSlots(slots.filter(s => s.id !== slot.id));
    } catch (err: any) {
      message.error(err.response?.data?.detail || 'Ошибка записи');
    }
  };

  const groupedSlots = slots.reduce((acc: Record<string, AppointmentSlot[]>, slot) => {
    const dateKey = dayjs(slot.start_datetime).format('YYYY-MM-DD');
    if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey].push(slot);
    return acc;
  }, {});

  return (
    <div>
      <Title level={2}>Запись на приём</Title>
      {user?.role !== 'patient' && (
        <div style={{ marginBottom: 16 }}>
          <Text strong>Пациент: </Text>
          <Select
            showSearch
            placeholder="Выберите пациента"
            style={{ width: 300, textAlign: 'left', }}
            value={selectedPatientId}
            onChange={setSelectedPatientId}
          >
            {patients.map((p) => (
              <Select.Option key={p.id} value={p.id}>
                {p.full_name}
              </Select.Option>
            ))}
          </Select>
        </div>
      )}
      {!selectedDoctor ? (
        <>
          <Title level={3}>Выберите врача</Title>
          <Row gutter={[16, 16]}>
            {loadingDoctors ? (
              <Spin size="large" />
            ) : (
              doctors.map((doc) => (
                <Col key={doc.id} xs={24} sm={12} md={8} lg={6}>
                  <Card
                    hoverable
                    onClick={() => handleSelectDoctor(doc)}
                    actions={[<Button type="primary">Выбрать слоты</Button>]}
                  >
                    <Card.Meta
                      title={doc.full_name}
                      description={
                        <>
                          <div>{doc.specialization_name || 'Специализация не указана'}</div>
                          {doc.cabinet && <div>Кабинет: {doc.cabinet}</div>}
                        </>
                      }
                    />
                  </Card>
                </Col>
              ))
            )}
          </Row>
        </>
      ) : (
        <>
          <Button onClick={() => setSelectedDoctor(null)} style={{ marginBottom: 16 }}>
            ← Назад к списку врачей
          </Button>
          <Title level={3}>{selectedDoctor.full_name}</Title>
          <Text type="secondary">
            {selectedDoctor.specialization_name} · Кабинет {selectedDoctor.cabinet}
          </Text>
          <Divider />
          {loadingSlots ? (
            <Spin size="large" />
          ) : slots.length === 0 ? (
            <Text>Нет доступных слотов для записи</Text>
          ) : (
            Object.entries(groupedSlots).map(([date, dateSlots]) => (
              <div key={date} style={{ marginBottom: 24 }}>
                <Title level={4}>
                  <CalendarOutlined /> {dayjs(date).format('DD MMMM YYYY')}
                </Title>
                <List
                  grid={{ gutter: 16, xs: 1, sm: 2, md: 3, lg: 4 }}
                  dataSource={dateSlots}
                  renderItem={(slot) => (
                    <List.Item>
                      <Card
                        hoverable
                        onClick={() => handleBookSlot(slot)}
                        style={{ textAlign: 'center' }}
                      >
                        <ClockCircleOutlined style={{ fontSize: 24, marginBottom: 8 }} />
                        <div>
                          {dayjs(slot.start_datetime).format('HH:mm')} – {dayjs(slot.end_datetime).format('HH:mm')}
                        </div>
                        <Tag color="green" style={{ marginTop: 8 }}>Свободно</Tag>
                      </Card>
                    </List.Item>
                  )}
                />
              </div>
            ))
          )}
        </>
      )}
    </div>
  );
};

export default BookAppointment;