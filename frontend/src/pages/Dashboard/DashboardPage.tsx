import { Typography, Card, Row, Col, Statistic } from 'antd';
import { useAuth } from '../../contexts/AuthContext';
import { UserOutlined, TeamOutlined, CalendarOutlined, MedicineBoxOutlined } from '@ant-design/icons';

const { Title } = Typography;

const DashboardPage: React.FC = () => {
  const { user } = useAuth();

  return (
    <div>
      <Title level={2}>Добро пожаловать, {user?.email}</Title>
      <Row gutter={16}>
        {user?.role === 'admin' || user?.role === 'registrar' ? (
          <>
            <Col span={6}>
              <Card>
                <Statistic title="Пациенты" value={0} prefix={<UserOutlined />} />
              </Card>
            </Col>
            <Col span={6}>
              <Card>
                <Statistic title="Врачи" value={0} prefix={<TeamOutlined />} />
              </Card>
            </Col>
            <Col span={6}>
              <Card>
                <Statistic title="Приёмы" value={0} prefix={<CalendarOutlined />} />
              </Card>
            </Col>
          </>
        ) : null}
        {user?.role === 'doctor' && (
          <Col span={6}>
            <Card>
              <Statistic title="Мои приёмы" value={0} prefix={<CalendarOutlined />} />
            </Card>
          </Col>
        )}
      </Row>
    </div>
  );
};

export default DashboardPage;