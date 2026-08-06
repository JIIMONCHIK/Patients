import { useEffect, useState } from 'react';
import { Table, Button, Space, Popconfirm, message } from 'antd';
import { getDoctors, deleteDoctor } from '../../api/doctors';
import { Doctor } from '../../types';
import { useNavigate } from 'react-router-dom';

const DoctorsList: React.FC = () => {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const fetchDoctors = async () => {
    setLoading(true);
    try {
      const res = await getDoctors();
      setDoctors(res.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDoctors(); }, []);

  const handleDelete = async (id: string) => {
    await deleteDoctor(id);
    message.success('Врач удалён');
    fetchDoctors();
  };

  const columns = [
    { title: 'ФИО', dataIndex: 'full_name', key: 'full_name' },
    { title: 'Кабинет', dataIndex: 'cabinet', key: 'cabinet' },
    { title: 'Специализация', dataIndex: 'specialization_name', key: 'specialization_name' },
    {
      title: 'Действия',
      key: 'actions',
      render: (_: any, record: Doctor) => (
        <Space>
          <Button onClick={() => navigate(`/doctors/${record.id}`)}>Редактировать</Button>
          <Popconfirm title="Удалить врача?" onConfirm={() => handleDelete(record.id)}>
            <Button danger>Удалить</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Button type="primary" onClick={() => navigate('/doctors/new')} style={{ marginBottom: 16 }}>
        Добавить врача
      </Button>
      <Table dataSource={doctors} columns={columns} rowKey="id" loading={loading} />
    </div>
  );
};

export default DoctorsList;