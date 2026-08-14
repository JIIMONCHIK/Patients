import { Modal, Form, Input, message } from 'antd';
import { createMedicalRecord } from '../../api/medicalRecords';

interface MedicalRecordModalProps {
  appointmentId: string;
  visible: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const MedicalRecordModal: React.FC<MedicalRecordModalProps> = ({
  appointmentId,
  visible,
  onClose,
  onSuccess,
}) => {
  const [form] = Form.useForm();

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      await createMedicalRecord({
        appointment_id: appointmentId,
        ...values,
      });
      message.success('Медицинская запись создана');
      form.resetFields();
      onClose();
      onSuccess?.();
    } catch (err: any) {
      message.error(err.response?.data?.detail || 'Ошибка создания медзаписи');
    }
  };

  return (
    <Modal
      title="Медицинская запись"
      open={visible}
      onOk={handleSubmit}
      onCancel={() => {
        form.resetFields();
        onClose();
      }}
      destroyOnClose
    >
      <Form form={form} layout="vertical">
        <Form.Item name="complaints" label="Жалобы">
          <Input.TextArea rows={3} />
        </Form.Item>
        <Form.Item name="diagnosis" label="Диагноз" rules={[{ required: true }]}>
          <Input.TextArea rows={3} />
        </Form.Item>
        <Form.Item name="prescriptions" label="Назначения">
          <Input.TextArea rows={3} />
        </Form.Item>
        <Form.Item name="recommendations" label="Рекомендации">
          <Input.TextArea rows={3} />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default MedicalRecordModal;