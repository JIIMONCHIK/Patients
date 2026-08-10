import { useEffect, useState } from 'react';
import { Table, Button, Popconfirm, message, Space, Tag } from 'antd';
import { getAppointments, cancelAppointment } from '../../api/appointments';
import { Appointment } from '../../types';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';

const statusColors: any = { booked: 'blue', cancelled: 'red', completed: 'green' };

const AppointmentsList: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const fetch = async () => {
    setLoading(true);
    const res = await getAppointments();
    setAppointments(res.data);
    setLoading(false);
  };

  useEffect(() => { fetch(); }, []);

  const handleCancel = async (id: string) => {
    await cancelAppointment(id);
    message.success('Запись отменена');
    fetch();
  };

  const columns = [
    { title: 'Пациент', dataIndex: 'patient_name', key: 'patient_name' },
    { title: 'Врач', dataIndex: 'doctor_name', key: 'doctor_name' },
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
      <Button type="primary" onClick={() => navigate('/appointments/new')} style={{ marginBottom: 16 }}>
        Новая запись
      </Button>
      <Table dataSource={appointments} columns={columns} rowKey="id" loading={loading} />
    </div>
  );
};

export default AppointmentsList;