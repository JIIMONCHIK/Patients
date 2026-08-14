import { useEffect, useState } from 'react';
import { Table } from 'antd';
import { getMedicalRecords } from '../../api/medicalRecords';
import { MedicalRecord } from '../../types';
import dayjs from 'dayjs';

const MedicalRecordsList: React.FC = () => {
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    getMedicalRecords().then((res) => setRecords(res.data)).finally(() => setLoading(false));
  }, []);

  const columns = [
  {
    title: 'Пациент',
    dataIndex: 'patient_name',
    key: 'patient_name',
    render: (text: string) => text || '—',
  },
  {
    title: 'Дата приёма',
    dataIndex: 'appointment_start_datetime',
    key: 'appointment_start_datetime',
    render: (date: string) => date ? dayjs(date).format('DD.MM.YYYY HH:mm') : '—',
  },
  {
    title: 'Диагноз',
    dataIndex: 'diagnosis',
    key: 'diagnosis',
    render: (text: string) => text || '—',
  },
  {
    title: 'Жалобы',
    dataIndex: 'complaints',
    key: 'complaints',
    render: (text: string) => text || '—',
  },
  {
    title: 'Назначения',
    dataIndex: 'prescriptions',
    key: 'prescriptions',
    render: (text: string) => text || '—',
  },
];

  return <Table dataSource={records} columns={columns} rowKey="id" loading={loading} />;
};

export default MedicalRecordsList;