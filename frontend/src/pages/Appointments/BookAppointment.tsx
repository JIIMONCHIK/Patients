import { useState, useEffect } from 'react';
import {
  Card, Row, Col, Button, Spin, message, Typography, List, Tag, Divider,
} from 'antd';
import { CalendarOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { getDoctors } from '../../api/doctors';
import { getSlots } from '../../api/slots';
import { createAppointment } from '../../api/appointments';
import { Doctor, AppointmentSlot } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

const BookAppointment: React.FC = () => {
  const { user } = useAuth();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [slots, setSlots] = useState<AppointmentSlot[]>([]);
  const [loadingDoctors, setLoadingDoctors] = useState(false);
  const [loadingSlots, setLoadingSlots] = useState(false);

  useEffect(() => {
    fetchDoctors();
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

  const handleSelectDoctor = async (doctor: Doctor) => {
    setSelectedDoctor(doctor);
    setLoadingSlots(true);
    try {
      const res = await getSlots({ doctor_id: doctor.id, is_available: true });
      // Сортируем по дате и времени
      const sorted = res.data.sort((a: AppointmentSlot, b: AppointmentSlot) =>
        dayjs(a.start_datetime).diff(dayjs(b.start_datetime))
      );
      setSlots(sorted);
    } finally {
      setLoadingSlots(false);
    }
  };

  const handleBookSlot = async (slot: AppointmentSlot) => {
    try {
      await createAppointment({ slot_id: slot.id }); // patient_id не нужен для пациента
      message.success('Вы успешно записаны на приём!');
      // Обновить слоты: убрать этот слот
      setSlots(slots.filter(s => s.id !== slot.id));
      // Сбросить выбранного врача или оставить – на ваше усмотрение
    } catch (err: any) {
      message.error(err.response?.data?.detail || 'Ошибка записи');
    }
  };

  // Группировка слотов по дате
  const groupedSlots = slots.reduce((acc: Record<string, AppointmentSlot[]>, slot) => {
    const dateKey = dayjs(slot.start_datetime).format('YYYY-MM-DD');
    if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey].push(slot);
    return acc;
  }, {});

  return (
    <div>
      <Title level={2}>Запись на приём</Title>
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
                    actions={[<Button type="primary">Выбрать время</Button>]}
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
          <Text type="secondary">{selectedDoctor.specialization_name} · Кабинет {selectedDoctor.cabinet}</Text>
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