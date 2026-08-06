import { useEffect, useState } from 'react';
import { Table, Button, Space, Popconfirm, message, Input } from 'antd';
import { getPatients, deletePatient } from '../../api/patients';
import { Patient } from '../../types';
import { useNavigate } from 'react-router-dom';

const PatientsList: React.FC = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  const fetchPatients = async () => {
    setLoading(true);
    try {
      const res = await getPatients();
      setPatients(res.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPatients(); }, []);

  const handleDelete = async (id: string) => {
    await deletePatient(id);
    message.success('Пациент удалён');
    fetchPatients();
  };

  const filtered = search
    ? patients.filter((p) => p.full_name.toLowerCase().includes(search.toLowerCase()))
    : patients;

  const columns = [
    { title: 'ФИО', dataIndex: 'full_name', key: 'full_name' },
    { title: 'Дата рождения', dataIndex: 'birth_date', key: 'birth_date', render: (d: string) => d?.split('T')[0] },
    { title: 'Пол', dataIndex: 'gender', key: 'gender' },
    { title: 'Телефон', dataIndex: 'phone', key: 'phone' },
    { title: 'Полис', dataIndex: 'policy_number', key: 'policy_number' },
    {
      title: 'Действия',
      key: 'actions',
      render: (_: any, record: Patient) => (
        <Space>
          <Button onClick={() => navigate(`/patients/${record.id}`)}>Редактировать</Button>
          <Popconfirm title="Удалить пациента?" onConfirm={() => handleDelete(record.id)}>
            <Button danger>Удалить</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <Button type="primary" onClick={() => navigate('/patients/new')}>Добавить пациента</Button>
        <Input.Search
          placeholder="Поиск по имени"
          style={{ width: 250 }}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      <Table dataSource={filtered} columns={columns} rowKey="id" loading={loading} />
    </div>
  );
};

export default PatientsList;