import { useEffect, useState } from 'react';
import { Form, Input, DatePicker, Select, Button, message, Space } from 'antd';
import { useNavigate, useParams } from 'react-router-dom';
import { createPatient, updatePatient, getPatient } from '../../api/patients';
import dayjs from 'dayjs';

const PatientForm: React.FC = () => {
  const [form] = Form.useForm();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const isEditing = !!id;

  useEffect(() => {
    if (id) {
      setLoading(true);
      getPatient(id)
        .then((res) => {
          const data = { ...res.data, birth_date: res.data.birth_date ? dayjs(res.data.birth_date) : null };
          form.setFieldsValue(data);
        })
        .finally(() => setLoading(false));
    }
  }, [id, form]);

  const onFinish = async (values: any) => {
    const payload = {
      ...values,
      birth_date: values.birth_date ? values.birth_date.format('YYYY-MM-DD') : null,
    };
    try {
      if (isEditing) {
        await updatePatient(id!, payload);
        message.success('Пациент обновлён');
      } else {
        await createPatient(payload);
        message.success('Пациент создан');
      }
      navigate('/patients');
    } catch (err) {
      message.error('Ошибка сохранения');
    }
  };

  return (
    <div style={{ maxWidth: 600, margin: '0 auto' }}>
      <h2>{isEditing ? 'Редактировать пациента' : 'Новый пациент'}</h2>
      <Form form={form} layout="vertical" onFinish={onFinish} initialValues={{ gender: 'male' }}>
        <Form.Item name="full_name" label="ФИО" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item name="birth_date" label="Дата рождения">
          <DatePicker style={{ width: '100%' }} />
        </Form.Item>
        <Form.Item name="gender" label="Пол">
          <Select>
            <Select.Option value="male">Мужской</Select.Option>
            <Select.Option value="female">Женский</Select.Option>
          </Select>
        </Form.Item>
        <Form.Item name="phone" label="Телефон">
          <Input />
        </Form.Item>
        <Form.Item name="address" label="Адрес">
          <Input.TextArea />
        </Form.Item>
        <Form.Item name="policy_number" label="Полис ОМС">
          <Input />
        </Form.Item>
        <Form.Item name="blood_group" label="Группа крови">
          <Input />
        </Form.Item>
        <Form.Item name="allergies" label="Аллергии">
          <Input.TextArea />
        </Form.Item>
        <Form.Item name="chronic_diseases" label="Хронические заболевания">
          <Input.TextArea />
        </Form.Item>
        <Space>
          <Button type="primary" htmlType="submit" loading={loading}>Сохранить</Button>
          <Button onClick={() => navigate('/patients')}>Отмена</Button>
        </Space>
      </Form>
    </div>
  );
};

export default PatientForm;