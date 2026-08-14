import { Layout, Menu, Button, Avatar, Dropdown } from 'antd';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  DashboardOutlined,
  UserOutlined,
  TeamOutlined,
  MedicineBoxOutlined,
  CalendarOutlined,
  FileTextOutlined,
  LogoutOutlined,
} from '@ant-design/icons';

const { Header, Sider, Content } = Layout;

const MainLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { key: '/', icon: <DashboardOutlined />, label: 'Главная' },
    ...(user?.role === 'admin' || user?.role === 'registrar' ? [
      { key: '/patients', icon: <UserOutlined />, label: 'Пациенты' },
      { key: '/doctors', icon: <TeamOutlined />, label: 'Врачи' },
      { key: '/specializations', icon: <MedicineBoxOutlined />, label: 'Специализации' },
      { key: '/appointments', icon: <CalendarOutlined />, label: 'Приёмы' },
      { key: '/schedules', icon: <CalendarOutlined />, label: 'Расписание' },
      { key: '/appointments/book', icon: <CalendarOutlined />, label: 'Записаться на приём' },
    ] : []),
    ...(user?.role === 'doctor' ? [
      { key: '/appointments', icon: <CalendarOutlined />, label: 'Мои приёмы' },
      { key: '/medical-records', icon: <FileTextOutlined />, label: 'Медкарты' },
    ] : []),
    ...(user?.role === 'patient' ? [
      { key: '/appointments', icon: <CalendarOutlined />, label: 'Мои записи' },
      { key: '/appointments/book', icon: <CalendarOutlined />, label: 'Записаться на приём' },
    ] : []),
    { key: '/profile', icon: <UserOutlined />, label: 'Профиль' },
  ];

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider collapsible>
        <div style={{ color: 'white', textAlign: 'center', padding: '16px', fontWeight: 'bold' }}>
          Clinic System
        </div>
        <Menu
          theme="dark"
          selectedKeys={[location.pathname]}
          mode="inline"
          items={menuItems}
          onClick={({ key }) => navigate(key)}
        />
      </Sider>
      <Layout>
        <Header style={{ background: '#fff', padding: '0 16px', display: 'flex', justifyContent: 'flex-end' }}>
          <Dropdown menu={{ items: [{ key: 'logout', icon: <LogoutOutlined />, label: 'Выйти', onClick: handleLogout }] }}>
            <div style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
              <Avatar icon={<UserOutlined />} />
              <span>{user?.email}</span>
            </div>
          </Dropdown>
        </Header>
        <Content style={{ margin: '16px' }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default MainLayout;