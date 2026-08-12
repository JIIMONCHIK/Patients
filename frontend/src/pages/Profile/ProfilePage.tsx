import { useEffect, useState } from 'react';
import {
  Form, Input, Button, message, DatePicker, Select, Spin,
  Row, Col, Divider, Typography, Descriptions
} from 'antd';
import { getMyProfile, updateMyProfile } from '../../api/profile';
import { getSpecializations } from '../../api/specializations';
import { ProfileResponse, Specialization } from '../../types';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

const ProfilePage: React.FC = () => {
  const [profile, setProfile] = useState<ProfileResponse | null>(null);
  const [specializations, setSpecializations] = useState<Specialization[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchProfile();
    getSpecializations().then(res => setSpecializations(res.data)).catch(() => {});
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await getMyProfile();
      setProfile(res.data);
    } catch {
      message.error('Не удалось загрузить профиль');
    } finally {
      setLoading(false);
    }
  };

  const onFinish = async (values: any) => {
    setSaving(true);
    try {
      const payload: any = {};
      if (values.email && values.email !== profile?.email) payload.email = values.email;
      if (profile?.role === 'patient') {
        payload.full_name = values.full_name;
        payload.phone = values.phone;
        payload.birth_date = values.birth_date ? values.birth_date.format('YYYY-MM-DD') : null;
        payload.gender = values.gender;
        payload.address = values.address;
        payload.policy_number = values.policy_number;
        payload.blood_group = values.blood_group;
        payload.allergies = values.allergies;
        payload.chronic_diseases = values.chronic_diseases;
      } else if (profile?.role === 'doctor') {
        payload.full_name = values.full_name;
        payload.specialization_id = values.specialization_id;
        payload.cabinet = values.cabinet;
      }
      const res = await updateMyProfile(payload);
      setProfile(res.data);
      message.success('Профиль обновлён');
    } catch (err: any) {
      message.error(err.response?.data?.detail || 'Ошибка сохранения');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Spin size="large" style={{ display: 'block', margin: '100px auto' }} />;
  if (!profile) return null;

  const showPatientFields = profile.role === 'patient';
  const showDoctorFields = profile.role === 'doctor';

  return (
    <div>
      <Title level={2}>Мой профиль</Title>
      <Divider />

      <Descriptions bordered column={1} size="small" style={{ marginBottom: 32 }}>
        <Descriptions.Item label="Роль">
          <Text strong style={{ textTransform: 'capitalize' }}>{profile.role}</Text>
        </Descriptions.Item>
        <Descriptions.Item label="ID пользователя">{profile.id}</Descriptions.Item>
        {showPatientFields && profile.patient_full_name && (
          <Descriptions.Item label="ФИО пациента">{profile.patient_full_name}</Descriptions.Item>
        )}
        {showDoctorFields && profile.doctor_full_name && (
          <Descriptions.Item label="ФИО врача">{profile.doctor_full_name}</Descriptions.Item>
        )}
      </Descriptions>

      <Form
        layout="vertical"
        initialValues={{
          email: profile.email,
          full_name: profile.patient_full_name || profile.doctor_full_name,
          phone: profile.phone,
          birth_date: profile.birth_date ? dayjs(profile.birth_date) : null,
          gender: profile.gender,
          address: profile.address,
          policy_number: profile.policy_number,
          blood_group: profile.blood_group,
          allergies: profile.allergies,
          chronic_diseases: profile.chronic_diseases,
          specialization_id: profile.specialization_id,
          cabinet: profile.cabinet,
        }}
        onFinish={onFinish}
      >
        <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email' }]}>
          <Input />
        </Form.Item>

        {(showPatientFields || showDoctorFields) && (
          <Form.Item name="full_name" label="ФИО" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
        )}

        {showPatientFields && (
          <>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="phone" label="Телефон">
                  <Input />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="birth_date" label="Дата рождения">
                  <DatePicker style={{ width: '100%' }} format="DD.MM.YYYY" />
                </Form.Item>
              </Col>
            </Row>
            <Form.Item name="gender" label="Пол">
              <Select allowClear>
                <Select.Option value="male">Мужской</Select.Option>
                <Select.Option value="female">Женский</Select.Option>
              </Select>
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
          </>
        )}

        {showDoctorFields && (
          <>
            <Form.Item name="specialization_id" label="Специализация">
              <Select allowClear placeholder="Выберите специализацию">
                {specializations.map(s => (
                  <Select.Option key={s.id} value={s.id}>{s.name}</Select.Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item name="cabinet" label="Кабинет">
              <Input />
            </Form.Item>
          </>
        )}

        <Button type="primary" htmlType="submit" loading={saving} block>
          Сохранить изменения
        </Button>
      </Form>
    </div>
  );
};

export default ProfilePage;