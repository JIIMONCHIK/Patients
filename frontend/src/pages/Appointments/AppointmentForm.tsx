import { Form, Input, Button, Select, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import { createAppointment } from '../../api/appointments';
import { useEffect, useState } from 'react';
import { getPatients } from '../../api/patients';
import { getDoctors } from '../../api/doctors'; // или слоты

const AppointmentForm: React.FC = () => {
  const [patients, setPatients] = useState<any[]>([]);
  const [slots, setSlots] = useState<any[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    getPatients().then((res) => setPatients(res.data));
    // getAvailableSlots()... пока опустим
  }, []);

  const onFinish = async (values: any) => {
    await createAppointment(values);
    message.success('Запись создана');
    navigate('/appointments');
  };

  return (
    <div style={{ maxWidth: 400, margin: '0 auto' }}>
      <h2>Новая запись на приём</h2>
      <Form layout="vertical" onFinish={onFinish}>
        <Form.Item name="patient_id" label="Пациент" rules={[{ required: true }]}>
          <Select>
            {patients.map((p) => (
              <Select.Option key={p.id} value={p.id}>{p.full_name}</Select.Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item name="slot_id" label="Слот" rules={[{ required: true }]}>
          <Input placeholder="UUID слота" />
        </Form.Item>
        <Button type="primary" htmlType="submit">Создать</Button>
      </Form>
    </div>
  );
};

export default AppointmentForm;