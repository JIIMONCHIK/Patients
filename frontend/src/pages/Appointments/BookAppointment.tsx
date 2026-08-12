import { useState, useEffect, useCallback } from 'react';
import {
  Card, Row, Col, Button, Spin, message, Typography, List, Tag, Divider, Select, Switch, Space,
} from 'antd';
import { CalendarOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { getDoctors } from '../../api/doctors';
import { getSlots } from '../../api/slots';
import { getPatients } from '../../api/patients';
import { getSpecializations } from '../../api/specializations';
import { createAppointment } from '../../api/appointments';
import { Doctor, AppointmentSlot, Patient, Specialization } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

const BookAppointment: React.FC = () => {
  const { user } = useAuth();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [specializations, setSpecializations] = useState<Specialization[]>([]);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [selectedPatientId, setSelectedPatientId] = useState<string | undefined>(undefined);
  const [selectedSpecialization, setSelectedSpecialization] = useState<string | undefined>(undefined);
  const [onlyAvailable, setOnlyAvailable] = useState<boolean>(false);
  const [slots, setSlots] = useState<AppointmentSlot[]>([]);
  const [loadingDoctors, setLoadingDoctors] = useState(false);
  const [loadingSlots, setLoadingSlots] = useState(false);

  const getOptionText = (option: any) => {
    if (!option) return '';
    if (typeof option.children === 'string') return option.children;
    if (Array.isArray(option.children)) {
      return option.children
        .map((child: any) => (typeof child === 'string' ? child : ''))
        .join('');
    }
    return '';
  };

  // Загрузка специализаций и пациентов (для не-пациентов) при монтировании
  useEffect(() => {
    getSpecializations().then(res => setSpecializations(res.data)).catch(() => {});
    if (user?.role !== 'patient') {
      fetchPatients();
    }
  }, []);

  

  const fetchPatients = async () => {
    try {
      const res = await getPatients();
      setPatients(res.data);
    } catch (err) {
      message.error('Не удалось загрузить список пациентов');
    }
  };

  // Функция загрузки врачей с учётом фильтров
  const fetchDoctors = useCallback(async () => {
    setLoadingDoctors(true);
    try {
      const params: any = {};
      if (selectedSpecialization) params.specialization_id = selectedSpecialization;
      if (onlyAvailable) params.has_available_slots = true;
      const res = await getDoctors(params);
      setDoctors(res.data);
    } catch (err) {
      message.error('Не удалось загрузить врачей');
    } finally {
      setLoadingDoctors(false);
    }
  }, [selectedSpecialization, onlyAvailable]);

  // Перезагрузка врачей при изменении фильтров
  useEffect(() => {
    fetchDoctors();
  }, [fetchDoctors]);

  const handleSelectDoctor = async (doctor: Doctor) => {
    setSelectedDoctor(doctor);
    setLoadingSlots(true);
    try {
      const res = await getSlots({ doctor_id: doctor.id, is_available: true });
      const sorted = res.data.sort((a: AppointmentSlot, b: AppointmentSlot) =>
        dayjs(a.start_datetime).diff(dayjs(b.start_datetime))
      );
      setSlots(sorted);
    } catch (err) {
      message.error('Не удалось загрузить слоты');
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
        patient_id: selectedPatientId, // для пациента бэкенд сам определит
      });
      message.success('Запись создана');
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

      {/* Блок фильтров */}
      {!selectedDoctor && (
        <Card style={{ marginBottom: 24 }}>
          <Space size="large" wrap>
            <div>
              <Text strong style={{ marginRight: 8 }}>Специализация:</Text>
              <Select
                allowClear
                placeholder="Все специализации"
                style={{ width: 250 }}
                value={selectedSpecialization}
                onChange={(val) => setSelectedSpecialization(val)}
              >
                {specializations.map(s => (
                  <Select.Option key={s.id} value={s.id}>{s.name}</Select.Option>
                ))}
              </Select>
            </div>
            <Space>
              <Text strong>Только с доступными слотами</Text>
              <Switch checked={onlyAvailable} onChange={setOnlyAvailable} />
            </Space>
          </Space>
        </Card>
      )}

      {/* Выбор пациента для админа/регистратора */}
      {user?.role !== 'patient' && (
        <div style={{ marginBottom: 16 }}>
          <Text strong>Пациент: </Text>
          <Select
            showSearch
            placeholder="Выберите пациента"
            style={{ width: 300 }}
            value={selectedPatientId}
            onChange={setSelectedPatientId}
            filterOption={(input, option) => {
              const text = getOptionText(option);
              return text.toLowerCase().includes(input.toLowerCase());
            }}
          >
            {patients.map((p) => (
              <Select.Option key={p.id} value={p.id}>
                {p.full_name}
              </Select.Option>
            ))}
          </Select>
        </div>
      )}

      {/* Список врачей */}
      {!selectedDoctor ? (
        <>
          <Title level={3}>Выберите врача</Title>
          <Row gutter={[16, 16]}>
            {loadingDoctors ? (
              <Spin size="large" />
            ) : doctors.length === 0 ? (
              <Text>Нет врачей по выбранным фильтрам</Text>
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