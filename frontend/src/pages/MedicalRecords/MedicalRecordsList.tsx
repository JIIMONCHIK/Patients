import { useEffect, useState } from 'react';
import { Table } from 'antd';
import { getMedicalRecords } from '../../api/medicalRecords';
import { MedicalRecord } from '../../types';

const MedicalRecordsList: React.FC = () => {
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    getMedicalRecords().then((res) => setRecords(res.data)).finally(() => setLoading(false));
  }, []);

  const columns = [
    { title: 'ID приёма', dataIndex: 'appointment_id', key: 'appointment_id' },
    { title: 'Диагноз', dataIndex: 'diagnosis', key: 'diagnosis' },
    { title: 'Жалобы', dataIndex: 'complaints', key: 'complaints' },
    { title: 'Назначения', dataIndex: 'prescriptions', key: 'prescriptions' },
  ];

  return <Table dataSource={records} columns={columns} rowKey="id" loading={loading} />;
};

export default MedicalRecordsList;