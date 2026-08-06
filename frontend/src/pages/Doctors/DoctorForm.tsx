import { useEffect, useState } from 'react';
import { Form, Input, Select, Button, Space, message } from 'antd';
import { useNavigate, useParams } from 'react-router-dom';
import { createDoctor, updateDoctor, getDoctor } from '../../api/doctors';
import { getSpecializations } from '../../api/specializations';

const DoctorForm: React.FC = () => {
  const [form] = Form.useForm();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [specializations, setSpecializations] = useState<any[]>([]);

  useEffect(() => {
    getSpecializations().then((res) => setSpecializations(res.data));
    if (id) {
      getDoctor(id).then((res) => form.setFieldsValue(res.data));
    }
  }, [id, form]);

  const onFinish = async (values: any) => {
    if (id) {
      await updateDoctor(id, values);
      message.success('Врач обновлён');
    } else {
      await createDoctor(values);
      message.success('Врач создан');
    }
    navigate('/doctors');
  };

  return (
    <div style={{ maxWidth: 600, margin: '0 auto' }}>
      <h2>{id ? 'Редактировать врача' : 'Новый врач'}</h2>
      <Form form={form} layout="vertical" onFinish={onFinish}>
        <Form.Item name="full_name" label="ФИО" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item name="specialization_id" label="Специализация">
          <Select>
            {specializations.map((s: any) => (
              <Select.Option key={s.id} value={s.id}>{s.name}</Select.Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item name="cabinet" label="Кабинет">
          <Input />
        </Form.Item>
        <Space>
          <Button type="primary" htmlType="submit">Сохранить</Button>
          <Button onClick={() => navigate('/doctors')}>Отмена</Button>
        </Space>
      </Form>
    </div>
  );
};

export default DoctorForm;