import { useEffect, useState } from 'react';
import { Table, Button, Popconfirm, message, Input, Space } from 'antd';
import { getSpecializations, createSpecialization, updateSpecialization, deleteSpecialization } from '../../api/specializations';
import { Specialization } from '../../types';

const SpecializationsList: React.FC = () => {
  const [specializations, setSpecializations] = useState<Specialization[]>([]);
  const [loading, setLoading] = useState(false);
  const [newName, setNewName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');

  const fetch = async () => {
    setLoading(true);
    const res = await getSpecializations();
    setSpecializations(res.data);
    setLoading(false);
  };

  useEffect(() => { fetch(); }, []);

  const handleAdd = async () => {
    if (!newName) return;
    await createSpecialization({ name: newName });
    setNewName('');
    fetch();
    message.success('Специализация добавлена');
  };

  const handleEdit = async (id: string) => {
    if (!editingName) return;
    await updateSpecialization(id, { name: editingName });
    setEditingId(null);
    setEditingName('');
    fetch();
    message.success('Обновлено');
  };

  const handleDelete = async (id: string) => {
    await deleteSpecialization(id);
    fetch();
    message.success('Удалено');
  };

  const columns = [
    {
      title: 'Название',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: Specialization) =>
        editingId === record.id ? (
          <Input value={editingName} onChange={(e) => setEditingName(e.target.value)} onPressEnter={() => handleEdit(record.id)} />
        ) : (
          text
        ),
    },
    {
      title: 'Действия',
      key: 'actions',
      render: (_: any, record: Specialization) => (
        <Space>
          {editingId === record.id ? (
            <>
              <Button type="link" onClick={() => handleEdit(record.id)}>Сохранить</Button>
              <Button type="link" onClick={() => setEditingId(null)}>Отмена</Button>
            </>
          ) : (
            <>
              <Button type="link" onClick={() => { setEditingId(record.id); setEditingName(record.name); }}>Редактировать</Button>
              <Popconfirm title="Удалить?" onConfirm={() => handleDelete(record.id)}>
                <Button type="link" danger>Удалить</Button>
              </Popconfirm>
            </>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', gap: 8 }}>
        <Input
          placeholder="Новая специализация"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          style={{ width: 200 }}
        />
        <Button type="primary" onClick={handleAdd}>Добавить</Button>
      </div>
      <Table dataSource={specializations} columns={columns} rowKey="id" loading={loading} />
    </div>
  );
};

export default SpecializationsList;