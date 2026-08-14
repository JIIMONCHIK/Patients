# Clinic System — Система учёта пациентов

Веб-приложение для управления медицинской клиникой: учёт пациентов, врачей, расписаний, записей на приём и медицинских карт. Реализовано на базе **FastAPI**, **React**, **PostgreSQL** и **Docker**.

## Основные возможности

- Аутентификация и авторизация (JWT)
  - Роли: администратор, регистратор, врач, пациент
  - Регистрация пациентов и врачей через интерфейс
  - Автоматический вход после регистрации
- Личный профиль пользователя
  - Редактирование email, ФИО, телефона, даты рождения и других данных
  - Для врачей — специализация, кабинет
- Управление пациентами
  - Полный CRUD, поиск и фильтрация
  - Карточка с медицинской информацией (аллергии, хронические заболевания, группа крови)
- Управление врачами
  - Привязка к специализациям
  - Кабинет, расписание
- Расписание и слоты
  - Шаблоны расписания по дням недели
  - Автоматическая генерация свободных слотов на неделю вперёд
  - Настройка длительности слота (15, 20, 30 минут)
- Запись на приём
  - Удобный интерфейс для пациента: выбор врача, фильтрация по специализации и доступности
  - Автоматическое скрытие прошедших слотов
- Приёмы и медицинские записи
  - Отметка приёма как завершённого
  - Создание медицинской записи (диагноз, жалобы, назначения, рекомендации)
- Панель управления
  - Статистика по пациентам, врачам и приёмам
  - Для пациента — количество активных записей
  - Для врача — количество активных приёмов
- Фильтрация и сортировка
  - Приёмы: по пациенту, врачу, специализации, диапазону дат, статусу
  - Сортировка новых записей сверху

## Технологический стек

### Бэкенд
- **FastAPI** — веб-фреймворк
- **SQLAlchemy 2.0 (async)** — ORM
- **PostgreSQL 15** — база данных
- **Alembic** — миграции
- **Pydantic v2** — валидация
- **python-jose** — JWT
- **passlib[bcrypt]** — хеширование паролей

### Фронтенд
- **React 18** + **TypeScript**
- **Vite** — сборщик
- **Ant Design 5** — UI-библиотека
- **React Router v6** — маршрутизация
- **Axios** — HTTP-клиент
- **dayjs** — работа с датами

### Инфраструктура
- **Docker** и **Docker Compose**
- **Nginx** — раздача статики и проксирование API
- **pgAdmin** — администрирование БД

## 📁 Структура проекта
```
.
├── README.md
├── alembic.ini
├── backend
│   ├── alembic
│   │   ├── env.py
│   │   ├── script.py.mako
│   │   └── versions
│   │       ├── 8eef669a2e9f_remove_unique_slot_id_from_appointments.py
│   │       ├── f1d75e08d6dc_add_slot_duration_to_schedule_templates.py
│   │       └── f83721b1d320_initial.py
│   ├── app
│   │   ├── api
│   │   │   ├── __init__.py
│   │   │   ├── dependencies.py
│   │   │   └── v1
│   │   │       ├── __init__.py
│   │   │       ├── endpoints
│   │   │       │   ├── __init__.py
│   │   │       │   ├── appointments.py
│   │   │       │   ├── auth.py
│   │   │       │   ├── doctors.py
│   │   │       │   ├── medical_records.py
│   │   │       │   ├── patients.py
│   │   │       │   ├── profile.py
│   │   │       │   ├── schedules.py
│   │   │       │   ├── slots.py
│   │   │       │   └── specializations.py
│   │   │       └── router.py
│   │   ├── celery_app
│   │   │   ├── __init__.py
│   │   │   ├── celery_app.py
│   │   │   └── tasks
│   │   │       ├── __init__.py
│   │   │       ├── notifications.py
│   │   │       └── reports.py
│   │   ├── core
│   │   │   ├── __init__.py
│   │   │   ├── config.py
│   │   │   ├── database.py
│   │   │   └── security.py
│   │   ├── crud
│   │   │   ├── __init__.py
│   │   │   ├── appointment.py
│   │   │   ├── base.py
│   │   │   ├── doctor.py
│   │   │   ├── medical_record.py
│   │   │   ├── patient.py
│   │   │   ├── schedule.py
│   │   │   ├── slot.py
│   │   │   ├── specialization.py
│   │   │   └── user.py
│   │   ├── main.py
│   │   ├── models
│   │   │   ├── __init__.py
│   │   │   ├── appointment.py
│   │   │   ├── base.py
│   │   │   ├── doctor.py
│   │   │   ├── medical_record.py
│   │   │   ├── patient.py
│   │   │   ├── schedule.py
│   │   │   ├── slot.py
│   │   │   ├── specialization.py
│   │   │   └── user.py
│   │   └── schemas
│   │       ├── __init__.py
│   │       ├── appointment.py
│   │       ├── auth.py
│   │       ├── common.py
│   │       ├── doctor.py
│   │       ├── medical_record.py
│   │       ├── patient.py
│   │       ├── profile.py
│   │       ├── schedule.py
│   │       ├── slot.py
│   │       └── specialization.py
│   └── docker
│       ├── Dockerfile.app
│       ├── Dockerfile.celery
│       └── entrypoint.sh
├── docker-compose.yml
├── frontend
│   ├── Dockerfile
│   ├── index.html
│   ├── nginx.conf
│   ├── package-lock.json
│   ├── package.json
│   ├── public
│   │   └── favicon.svg
│   ├── src
│   │   ├── App.tsx
│   │   ├── api
│   │   │   ├── appointments.ts
│   │   │   ├── auth.ts
│   │   │   ├── axios.ts
│   │   │   ├── doctors.ts
│   │   │   ├── medicalRecords.ts
│   │   │   ├── patients.ts
│   │   │   ├── profile.ts
│   │   │   ├── schedules.ts
│   │   │   ├── slots.ts
│   │   │   └── specializations.ts
│   │   ├── components
│   │   │   └── Layout
│   │   │       ├── MainLayout.tsx
│   │   │       └── ProtectedRoute.tsx
│   │   ├── contexts
│   │   │   └── AuthContext.tsx
│   │   ├── index.css
│   │   ├── main.tsx
│   │   ├── pages
│   │   │   ├── Appointments
│   │   │   │   ├── AppointmentsList.tsx
│   │   │   │   └── BookAppointment.tsx
│   │   │   ├── Dashboard
│   │   │   │   └── DashboardPage.tsx
│   │   │   ├── Doctors
│   │   │   │   ├── DoctorForm.tsx
│   │   │   │   └── DoctorsList.tsx
│   │   │   ├── Login
│   │   │   │   └── LoginPage.tsx
│   │   │   ├── MedicalRecords
│   │   │   │   ├── MedicalRecordModal.tsx
│   │   │   │   └── MedicalRecordsList.tsx
│   │   │   ├── Patients
│   │   │   │   ├── PatientForm.tsx
│   │   │   │   └── PatientsList.tsx
│   │   │   ├── Profile
│   │   │   │   └── ProfilePage.tsx
│   │   │   ├── Schedules
│   │   │   │   └── SchedulesPage.tsx
│   │   │   └── Specializations
│   │   │       └── SpecializationsList.tsx
│   │   ├── types
│   │   │   └── index.ts
│   │   └── vite-env.d.ts
│   ├── tsconfig.json
│   ├── tsconfig.node.json
│   └── vite.config.ts
└── requirements.txt
```

## Запуск
```
docker-compose up --build -d
```

После запуска будут доступны:
- Фронтенд: http://localhost:3000
- API (Swagger): http://localhost:8000/docs
- pgAdmin: http://localhost:5050

## Роли пользователей
### admin	
Полный доступ: управление пользователями, врачами, пациентами, расписанием. Только изменение email в профиле.

### registrar	
Управление пациентами, врачами, записями, генерация слотов.

### doctor	
Просмотр своих приёмов, завершение приёмов, создание медзаписей.

### patient	
Просмотр и запись на приём, редактирование своего профиля, просмотр своих записей.
