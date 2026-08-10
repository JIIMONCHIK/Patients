import { useEffect, useState, useCallback } from 'react';
import { Table, Popconfirm, message, Space, Tag, Select, DatePicker, Row, Col, Card, Button } from 'antd';
import { getAppointments, cancelAppointment } from '../../api/appointments';
import { getDoctors } from '../../api/doctors';
import { getPatients } from '../../api/patients';
import { Appointment, Doctor, Patient } from '../../types';
import dayjs from 'dayjs';
import { useAuth } from '../../contexts/AuthContext';

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

  // Фильтры
  const [selectedPatient, setSelectedPatient] = useState<string | undefined>(undefined);
  const [selectedDoctor, setSelectedDoctor] = useState<string | undefined>(undefined);
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>(null);

  const { user } = useAuth();

  const fetchAppointments = useCallback(async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (selectedPatient) params.patient_id = selectedPatient;
      if (selectedDoctor) params.doctor_id = selectedDoctor;
      if (dateRange && dateRange[0] && dateRange[1]) {
        params.date_from = dateRange[0].startOf('day').toISOString();
        params.date_to = dateRange[1].endOf('day').toISOString();
      }
      const res = await getAppointments(params);
      setAppointments(res.data);
    } catch (err) {
      message.error('Не удалось загрузить приёмы');
    } finally {
      setLoading(false);
    }
  }, [selectedPatient, selectedDoctor, dateRange]);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  // Загружаем справочники врачей и пациентов (для админа/регистратора)
  useEffect(() => {
    if (user?.role === 'admin' || user?.role === 'registrar') {
      getDoctors().then((res) => setDoctors(res.data)).catch(() => {});
      getPatients().then((res) => setPatients(res.data)).catch(() => {});
    }
  }, [user]);

  const handleCancel = async (id: string) => {
    try {
      await cancelAppointment(id);
      message.success('Запись отменена');
      fetchAppointments();
    } catch (err: any) {
      message.error(err.response?.data?.detail || 'Ошибка отмены');
    }
  };

  const columns = [
    {
      title: 'Пациент',
      dataIndex: 'patient_name',
      key: 'patient_name',
      render: (text: string) => text || '—',
    },
    {
      title: 'Врач',
      dataIndex: 'doctor_name',
      key: 'doctor_name',
      render: (text: string) => text || '—',
    },
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
            <Popconfirm title="Отменить запись?" onConfirm={() => handleCancel(record.id)}>
              <Button danger>Отменить</Button>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Card style={{ marginBottom: 16 }}>
        <Row gutter={[16, 16]} align="middle">
          <Col>
            <Select
              allowClear
              placeholder="Все пациенты"
              style={{ width: 250, textAlign: 'left'}}
              showSearch
              filterOption={(input, option) =>
                (option?.children as unknown as string)?.toLowerCase().includes(input.toLowerCase())
              }
              value={selectedPatient}
              onChange={(val) => setSelectedPatient(val)}
            >
              {patients.map((p) => (
                <Select.Option key={p.id} value={p.id}>
                  {p.full_name}
                </Select.Option>
              ))}
            </Select>
          </Col>
          <Col>
            <Select
              allowClear
              placeholder="Все врачи"
              style={{ width: 250, textAlign: 'left' }}
              showSearch
              filterOption={(input, option) =>
                (option?.children as unknown as string)?.toLowerCase().includes(input.toLowerCase())
              }
              value={selectedDoctor}
              onChange={(val) => setSelectedDoctor(val)}
            >
              {doctors.map((d) => (
                <Select.Option key={d.id} value={d.id}>
                  {d.full_name}
                </Select.Option>
              ))}
            </Select>
          </Col>
          <Col>
            <RangePicker
              value={dateRange}
              onChange={(dates) => setDateRange(dates as [dayjs.Dayjs, dayjs.Dayjs])}
              format="DD.MM.YYYY"
              placeholder={['С', 'По']}
            />
          </Col>
        </Row>
      </Card>

      <Table
        dataSource={appointments}
        columns={columns}
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 10 }}
      />
    </div>
  );
};

export default AppointmentsList;