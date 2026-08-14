import { useEffect, useState, useCallback } from 'react';
import { Table, Popconfirm, message, Space, Tag, Select, DatePicker, Row, Col,
   Card, Button, Switch } from 'antd';
import { useSearchParams } from 'react-router-dom';
import { getAppointments, cancelAppointment, completeAppointment } from '../../api/appointments';
import { getDoctors } from '../../api/doctors';
import { getPatients } from '../../api/patients';
import { getSpecializations } from '../../api/specializations';
import { Appointment, Doctor, Patient, Specialization } from '../../types';
import dayjs from 'dayjs';
import { useAuth } from '../../contexts/AuthContext';
import MedicalRecordModal from '../MedicalRecords/MedicalRecordModal';


const { RangePicker } = DatePicker;

const statusColors: Record<string, string> = {
  booked: 'blue',
  cancelled: 'red',
  completed: 'green',
};

const AppointmentsList: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(false);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [specializations, setSpecializations] = useState<Specialization[]>([]);

  const [searchParams, setSearchParams] = useSearchParams();

  const [selectedPatient, setSelectedPatient] = useState<string | undefined>(undefined);
  const [selectedDoctor, setSelectedDoctor] = useState<string | undefined>(undefined);
  const [selectedSpecialization, setSelectedSpecialization] = useState<string | undefined>(undefined);
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>(null);
  const [activeOnly, setActiveOnly] = useState<boolean>(false);

  const [medicalRecordAppointmentId, setMedicalRecordAppointmentId] = useState<string | null>(null);
  const openMedicalRecord = (appointmentId: string) => {
  setMedicalRecordAppointmentId(appointmentId);
};

  const { user } = useAuth();

  // При монтаже считываем specialization_id из URL
  useEffect(() => {
    const specId = searchParams.get('specialization_id');
    if (specId) setSelectedSpecialization(specId);
    const patientId = searchParams.get('patient_id');
    if (patientId) setSelectedPatient(patientId);
    const doctorId = searchParams.get('doctor_id');
    if (doctorId) setSelectedDoctor(doctorId);
    const from = searchParams.get('date_from');
    const to = searchParams.get('date_to');
    if (from && to) {
      setDateRange([dayjs(from), dayjs(to)]);
    }
    const active = searchParams.get('active');
    if (active === 'true') setActiveOnly(true);
  }, []);

  // Загружаем справочники (для админа/регистратора)
  useEffect(() => {
    if (user?.role === 'admin' || user?.role === 'registrar') {
      getDoctors().then(res => setDoctors(res.data)).catch(() => {});
      getPatients().then(res => setPatients(res.data)).catch(() => {});
      getSpecializations().then(res => setSpecializations(res.data)).catch(() => {});
    }
  }, [user]);

  const fetchAppointments = useCallback(async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (selectedPatient) params.patient_id = selectedPatient;
      if (selectedDoctor) params.doctor_id = selectedDoctor;
      if (selectedSpecialization) params.specialization_id = selectedSpecialization;
      if (dateRange && dateRange[0] && dateRange[1]) {
        params.date_from = dateRange[0].startOf('day').toISOString();
        params.date_to = dateRange[1].endOf('day').toISOString();
      }
      if (activeOnly) params.status = 'booked';
      const res = await getAppointments(params);
      setAppointments(res.data);
    } catch (err) {
      message.error('Не удалось загрузить приёмы');
    } finally {
      setLoading(false);
    }
  }, [selectedPatient, selectedDoctor, selectedSpecialization, dateRange, activeOnly]);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  const updateFilters = () => {
    const params = new URLSearchParams();
    if (selectedPatient) params.set('patient_id', selectedPatient);
    if (selectedDoctor) params.set('doctor_id', selectedDoctor);
    if (selectedSpecialization) params.set('specialization_id', selectedSpecialization);
    if (dateRange && dateRange[0] && dateRange[1]) {
      params.set('date_from', dateRange[0].startOf('day').toISOString());
      params.set('date_to', dateRange[1].endOf('day').toISOString());
    }
    if (activeOnly) params.set('active', 'true');
    setSearchParams(params);
    
  };

  const handleCancel = async (id: string) => {
    try {
      await cancelAppointment(id);
      message.success('Запись отменена');
      fetchAppointments();
    } catch (err: any) {
      message.error(err.response?.data?.detail || 'Ошибка отмены');
    }
  };

  const handleComplete = async (id: string) => {
    try {
      await completeAppointment(id);
      message.success('Приём завершён');
      fetchAppointments();
    } catch (err: any) {
      message.error(err.response?.data?.detail || 'Ошибка завершения');
    }
  };

  const columns = [
    { title: 'Пациент', dataIndex: 'patient_name', key: 'patient_name', render: (text: string) => text || '—' },
    { title: 'Врач', dataIndex: 'doctor_name', key: 'doctor_name', render: (text: string) => text || '—' },
    {
      title: 'Дата и время',
      key: 'datetime',
      render: (_: any, record: Appointment) => (
        <span>
          {record.start_datetime
            ? `${dayjs(record.start_datetime).format('DD.MM.YYYY HH:mm')} – ${dayjs(record.end_datetime).format('HH:mm')}`
            : '—'}
        </span>
      ),
    },
    {
      title: 'Статус',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => <Tag color={statusColors[status]}>{status}</Tag>,
    },
    {
      title: 'Действия',
      key: 'actions',
      render: (_: any, record: Appointment) => (
        <Space>
          {record.status === 'booked' && (
            <>
              {/* Врач может завершать свои приёмы */}
              {user?.role === 'doctor' && (
                <Popconfirm title="Завершить приём?" onConfirm={() => handleComplete(record.id)}>
                  <Button type="primary" size="small">Завершить</Button>
                </Popconfirm>
              )}
              {/* Администратор/регистратор могут отменять */}
              {(user?.role === 'admin' || user?.role === 'registrar') && (
                <Popconfirm title="Отменить запись?" onConfirm={() => handleCancel(record.id)}>
                  <Button danger>Отменить</Button>
                </Popconfirm>
              )}
              {/* Пациент может отменять свои записи */}
              {user?.role === 'patient' && (
                <Popconfirm title="Отменить запись?" onConfirm={() => handleCancel(record.id)}>
                  <Button danger>Отменить</Button>
                </Popconfirm>
              )}
            </>
          )}
          {record.status === 'completed' && user?.role === 'doctor' && (
            <Button type="link" size="small" onClick={() => openMedicalRecord(record.id)}>
              Медзапись
            </Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Card style={{ marginBottom: 16 }}>
        <Row gutter={[16, 16]} align="middle">
          {(user?.role === 'admin' || user?.role === 'registrar') && (
            <>
            <Col>
              <Select
                allowClear
                placeholder="Все пациенты"
                style={{ width: 220, textAlign: 'left' }}
                showSearch
                filterOption={(input, option) =>
                  (option?.children as unknown as string)?.toLowerCase().includes(input.toLowerCase())
                }
                value={selectedPatient}
                onChange={(val) => {
                  setSelectedPatient(val);
                  updateFilters();
                }}
              >
                {patients.map(p => (
                  <Select.Option key={p.id} value={p.id}>{p.full_name}</Select.Option>
                ))}
              </Select>
            </Col>
            <Col>
              <Select
                allowClear
                placeholder="Все врачи"
                style={{ width: 220, textAlign: 'left' }}
                showSearch
                filterOption={(input, option) =>
                  (option?.children as unknown as string)?.toLowerCase().includes(input.toLowerCase())
                }
                value={selectedDoctor}
                onChange={(val) => {
                  setSelectedDoctor(val);
                  updateFilters();
                }}
              >
                {doctors.map(d => (
                  <Select.Option key={d.id} value={d.id}>{d.full_name}</Select.Option>
                ))}
              </Select>
            </Col>
            <Col>
              <Select
                allowClear
                placeholder="Все специализации"
                style={{ width: 220 }}
                value={selectedSpecialization}
                onChange={(val) => {
                  setSelectedSpecialization(val);
                  updateFilters();
                }}
              >
                {specializations.map(s => (
                  <Select.Option key={s.id} value={s.id}>{s.name}</Select.Option>
                ))}
              </Select>
            </Col>
            </>
          )}
          <Col>
            <RangePicker
              value={dateRange}
              onChange={(dates) => {
                setDateRange(dates as [dayjs.Dayjs, dayjs.Dayjs]);
                updateFilters();
              }}
              format="DD.MM.YYYY"
              placeholder={['С', 'По']}
            />
          </Col>
          <Col>
            <Space>
              <span>Только активные</span>
              <Switch
                checked={activeOnly}
                onChange={(checked) => {
                  setActiveOnly(checked);
                  updateFilters();
                }}
              />
            </Space>
          </Col>
        </Row>
      </Card>
      <Table dataSource={appointments} columns={columns} rowKey="id" loading={loading} />
      {medicalRecordAppointmentId && (
        <MedicalRecordModal
          appointmentId={medicalRecordAppointmentId}
          visible={!!medicalRecordAppointmentId}
          onClose={() => setMedicalRecordAppointmentId(null)}
          onSuccess={() => setMedicalRecordAppointmentId(null)}
        />
      )}
    </div>
  );
};

export default AppointmentsList;