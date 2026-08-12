import { useState, useEffect } from 'react';
import { Form, Input, Button, Card, Tabs, message, Select, DatePicker, Row, Col } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { register as apiRegister } from '../../api/auth';
import { getSpecializations } from '../../api/specializations';
import { Specialization } from '../../types';
import dayjs from 'dayjs';

const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const [specializations, setSpecializations] = useState<Specialization[]>([]);
  const [loadingRegister, setLoadingRegister] = useState(false);

  useEffect(() => {
    // Загружаем список специализаций при монтировании
    getSpecializations().then(res => setSpecializations(res.data)).catch(() => {});
  }, []);

  const onLogin = async (values: { email: string; password: string }) => {
    try {
      await login(values.email, values.password);
      message.success('Вход выполнен');
      navigate('/');
    } catch {
      message.error('Неверный email или пароль');
    }
  };

  const onRegister = async (values: any) => {
    setLoadingRegister(true);
    try {
      const payload: any = {
        email: values.email,
        password: values.password,
        full_name: values.full_name,
        role: values.role,
      };
      if (values.role === 'patient') {
        payload.phone = values.phone;
        payload.birth_date = values.birth_date ? values.birth_date.format('YYYY-MM-DD') : undefined;
      } else if (values.role === 'doctor') {
        payload.specialization_id = values.specialization_id;
        payload.cabinet = values.cabinet;
      }

      const res = await apiRegister(payload);
      // Автоматический вход
      localStorage.setItem('access_token', res.data.access_token);
      // Запрашиваем данные пользователя через getMe (контекст обновится)
      await login(values.email, values.password);  // используем функцию из контекста
      message.success('Регистрация успешна!');
      navigate('/');
    } catch (err: any) {
      message.error(err.response?.data?.detail || 'Ошибка регистрации');
    } finally {
      setLoadingRegister(false);
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: '#f0f2f5' }}>
      <Card style={{ width: 480 }}>
        <Tabs activeKey={activeTab} onChange={(key) => setActiveTab(key as 'login' | 'register')} centered>
          <Tabs.TabPane tab="Вход" key="login">
            <Form layout="vertical" onFinish={onLogin}>
              <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email' }]}>
                <Input />
              </Form.Item>
              <Form.Item name="password" label="Пароль" rules={[{ required: true }]}>
                <Input.Password />
              </Form.Item>
              <Button type="primary" htmlType="submit" block>Войти</Button>
            </Form>
          </Tabs.TabPane>

          <Tabs.TabPane tab="Регистрация" key="register">
            <Form layout="vertical" onFinish={onRegister} initialValues={{ role: 'patient' }}>
              <Form.Item name="role" label="Роль" rules={[{ required: true }]}>
                <Select>
                  <Select.Option value="patient">Пациент</Select.Option>
                  <Select.Option value="doctor">Врач</Select.Option>
                </Select>
              </Form.Item>
              <Form.Item name="full_name" label="ФИО" rules={[{ required: true, min: 1 }]}>
                <Input />
              </Form.Item>
              <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email' }]}>
                <Input />
              </Form.Item>
              <Form.Item name="password" label="Пароль" rules={[{ required: true, min: 6 }]}>
                <Input.Password />
              </Form.Item>

              <Form.Item noStyle shouldUpdate={(prev, cur) => prev.role !== cur.role}>
                {({ getFieldValue }) => {
                  const role = getFieldValue('role');
                  if (role === 'patient') {
                    return (
                      <>
                        <Form.Item name="phone" label="Телефон">
                          <Input />
                        </Form.Item>
                        <Form.Item name="birth_date" label="Дата рождения">
                          <DatePicker style={{ width: '100%' }} format="DD.MM.YYYY" />
                        </Form.Item>
                      </>
                    );
                  }
                  if (role === 'doctor') {
                    return (
                      <>
                        <Form.Item name="specialization_id" label="Специализация">
                          <Select placeholder="Выберите специализацию" allowClear>
                            {specializations.map(s => (
                              <Select.Option key={s.id} value={s.id}>{s.name}</Select.Option>
                            ))}
                          </Select>
                        </Form.Item>
                        <Form.Item name="cabinet" label="Кабинет">
                          <Input />
                        </Form.Item>
                      </>
                    );
                  }
                  return null;
                }}
              </Form.Item>

              <Button type="primary" htmlType="submit" loading={loadingRegister} block>
                Зарегистрироваться
              </Button>
            </Form>
          </Tabs.TabPane>
        </Tabs>
      </Card>
    </div>
  );
};

export default LoginPage;