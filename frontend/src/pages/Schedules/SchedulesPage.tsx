import { useEffect, useState } from 'react';
import {
  Card, Button, Table, Space, message, Popconfirm, Form, InputNumber, Select,
  TimePicker, Row, Col, Tag, Modal
} from 'antd';
import { PlusOutlined, SyncOutlined } from '@ant-design/icons';
import {
  getSchedules, createSchedule, updateSchedule, deleteSchedule, generateSlots,
} from '../../api/schedules';
import { getDoctors } from '../../api/doctors';
import { ScheduleTemplate, Doctor, ScheduleTemplateCreate } from '../../types';
import dayjs from 'dayjs';

const { Option } = Select;

const daysOfWeek = ['Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота', 'Воскресенье'];

const SchedulesPage: React.FC = () => {
  const [schedules, setSchedules] = useState<ScheduleTemplate[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState<ScheduleTemplate | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [generating, setGenerating] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [schedRes, docsRes] = await Promise.all([getSchedules(), getDoctors()]);
      setSchedules(schedRes.data);
      setDoctors(docsRes.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const openCreate = () => {
    setEditing(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const openEdit = (record: ScheduleTemplate) => {
    setEditing(record);
    form.setFieldsValue({
        doctor_id: record.doctor_id,
        days_of_week: [record.day_of_week],
        start_time: dayjs(record.start_time, 'HH:mm'),
        end_time: dayjs(record.end_time, 'HH:mm'),
        slot_duration: record.slot_duration || 30,
    });
    setIsModalVisible(true);
  };

  const handleSubmit = async () => {
    try {
        const values = await form.validateFields();
        const payload: ScheduleTemplateCreate = {
        doctor_id: values.doctor_id,
        days_of_week: values.days_of_week, // массив
        start_time: values.start_time.format('HH:mm'),
        end_time: values.end_time.format('HH:mm'),
        slot_duration: values.slot_duration || 30,
        };
        if (editing) {
        // Для редактирования оставляем один день (первый из выбранных, но лучше передать day_of_week)
        await updateSchedule(editing.id, {
            doctor_id: values.doctor_id,
            day_of_week: values.days_of_week[0],
            start_time: values.start_time.format('HH:mm'),
            end_time: values.end_time.format('HH:mm'),
            slot_duration: values.slot_duration || 30,
        });
        message.success('Расписание обновлено');
        } else {
        await createSchedule(payload);
        message.success('Расписание добавлено');
        }
        setIsModalVisible(false);
        fetchData();
    } catch (err) {
        message.error('Ошибка при сохранении');
    }
  };

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const res = await generateSlots(7);
      message.success(res.data.message || 'Слоты сгенерированы');
    } catch (err) {
      message.error('Ошибка генерации');
    } finally {
      setGenerating(false);
    }
  };

  const columns = [
    {
      title: 'Врач',
      dataIndex: 'doctor_id',
      key: 'doctor',
      render: (id: string) => doctors.find(d => d.id === id)?.full_name || id,
    },
    {
      title: 'День недели',
      dataIndex: 'day_of_week',
      key: 'day',
      render: (d: number) => daysOfWeek[d],
    },
    {
      title: 'Время',
      key: 'time',
      render: (_: any, record: ScheduleTemplate) => `${record.start_time} - ${record.end_time}`,
    },
    {
      title: 'Длит. слота',
      dataIndex: 'slot_duration',
      key: 'duration',
      render: (d: number) => `${d} мин`,
    },
    {
      title: 'Действия',
      key: 'actions',
      render: (_: any, record: ScheduleTemplate) => (
        <Space>
          <Button size="small" onClick={() => openEdit(record)}>Изменить</Button>
          <Popconfirm title="Удалить?" onConfirm={async () => {
            await deleteSchedule(record.id);
            message.success('Удалено');
            fetchData();
          }}>
            <Button size="small" danger>Удалить</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Row justify="space-between" style={{ marginBottom: 16 }}>
        <Col>
          <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
            Добавить расписание
          </Button>
        </Col>
        <Col>
          <Button icon={<SyncOutlined />} onClick={handleGenerate} loading={generating}>
            Сгенерировать слоты на неделю
          </Button>
        </Col>
      </Row>
      <Table
        dataSource={schedules}
        columns={columns}
        rowKey="id"
        loading={loading}
      />

      {/* Модальное окно для добавления/редактирования */}
      {isModalVisible && (
        <Modal
          title={editing ? 'Редактировать расписание' : 'Добавить расписание'}
          open={isModalVisible}
          onOk={handleSubmit}
          onCancel={() => setIsModalVisible(false)}
          destroyOnClose
        >
          <Form form={form} layout="vertical">
            <Form.Item name="doctor_id" label="Врач" rules={[{ required: true }]}>
              <Select placeholder="Выберите врача" showSearch>
                {doctors.map(d => (
                  <Option key={d.id} value={d.id}>{d.full_name}</Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item name="days_of_week" label="Дни недели" rules={[{ required: true }]}>
                <Select mode="multiple" placeholder="Выберите дни">
                    {daysOfWeek.map((name, index) => (
                    <Option key={index} value={index}>{name}</Option>
                    ))}
                </Select>
            </Form.Item>
            <Form.Item name="start_time" label="Начало" rules={[{ required: true }]}>
              <TimePicker format="HH:mm" style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item name="end_time" label="Окончание" rules={[{ required: true }]}>
              <TimePicker format="HH:mm" style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item name="slot_duration" label="Длительность слота (мин)" initialValue={30}>
              <InputNumber min={5} max={120} step={5} style={{ width: '100%' }} />
            </Form.Item>
          </Form>
        </Modal>
      )}
    </div>
  );
};

export default SchedulesPage;