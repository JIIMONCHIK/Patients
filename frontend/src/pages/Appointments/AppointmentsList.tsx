import { useEffect, useState } from 'react';
import { Table, Button, Popconfirm, message, Space, Tag } from 'antd';
import { getAppointments, cancelAppointment } from '../../api/appointments';
import { Appointment } from '../../types';
import { useNavigate } from 'react-router-dom';

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
    { title: 'ID', dataIndex: 'id', key: 'id' },
    { title: 'Слот', dataIndex: 'slot_id', key: 'slot_id' },
    { title: 'Пациент', dataIndex: 'patient_id', key: 'patient_id' },
    {
      title: 'Статус',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => <Tag color={statusColors[status]}>{status}</Tag>,
    },
    {
      title: 'Дата создания',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (d: string) => new Date(d).toLocaleString(),
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