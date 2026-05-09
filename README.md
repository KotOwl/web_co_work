# 💰 Finance Tracker

Сучасний трекер особистих фінансів з Next.js + FastAPI.

![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js-000000?style=flat&logo=next.js&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=flat&logo=fastapi&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=flat&logo=postgresql&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2CA5E0?style=flat&logo=docker&logoColor=white)

## ✨ Функції

### 🔐 Аутентифікація
- Реєстрація та вхід з JWT токенами
- Хешування паролів (bcrypt)
- Автоматичне створення категорій для нових користувачів

### 💳 Транзакції
- Додавання доходів та витрат
- Опис, дата, категорія
- Фільтрація за типом, категорією, датою
- Пошук та сортування

### 📊 Категорії
- Стандартні категорії (їжа, транспорт, розваги, зарплата, тощо)
- Створення власних категорій
- Іконки та кольори
- Редагування та видалення

### 📈 Аналітика
- Загальний баланс
- Доходи vs витрати
- Статистика за період
- Топ категорій витрат
- Прогрес-бар витрат

### 💵 Бюджет
- Встановлення бюджету на місяць
- Ліміт на категорії
- Відображення залишку бюджету

### 🎨 Інтерфейс
- Сучасний дизайн з Tailwind CSS
- Темна/світла тема
- Адаптивний дизайн
- Українська локалізація

## 🚀 Швидкий старт

### Вимоги
- Docker та Docker Compose

### Запуск

```bash
# Клонувати репозиторій
cd finance-tracker

# Запустити всі сервіси
docker-compose up -d

# Backend API: http://localhost:8000
# Frontend: http://localhost:3000
```

## 📁 Структура проєкту

```
finance-tracker/
├── backend/               # FastAPI backend
│   ├── app/
│   │   ├── routers/      # API endpoints
│   │   ├── auth.py       # Аутентифікація
│   │   ├── crud.py       # CRUD операції
│   │   ├── models.py     # SQLAlchemy моделі
│   │   ├── schemas.py    # Pydantic схеми
│   │   └── main.py       # Точка входу
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/              # Next.js frontend
│   ├── app/              # App router pages
│   ├── components/       # React компоненти
│   ├── lib/             # API, store, utils
│   ├── Dockerfile
│   └── package.json
└── docker-compose.yml
```

## 🔧 API Endpoints

### Auth
- `POST /auth/register` - Реєстрація
- `POST /auth/login` - Вхід

### Users
- `GET /users/me` - Профіль користувача
- `PUT /users/me` - Оновлення профілю

### Transactions
- `GET /transactions` - Список транзакцій
- `POST /transactions` - Створення транзакції
- `PUT /transactions/{id}` - Оновлення
- `DELETE /transactions/{id}` - Видалення

### Categories
- `GET /categories` - Список категорій
- `POST /categories` - Створення категорії
- `PUT /categories/{id}` - Оновлення
- `DELETE /categories/{id}` - Видалення

### Budgets
- `GET /budgets` - Список бюджетів
- `POST /budgets` - Створення бюджету
- `PUT /budgets/{id}` - Оновлення
- `DELETE /budgets/{id}` - Видалення

### Statistics
- `GET /statistics/dashboard` - Дашборд статистика
- `GET /statistics/balance` - Баланс
- `GET /statistics/categories` - Статистика по категоріях
- `GET /statistics/monthly` - Місячна статистика

## 🛠 Технології

### Backend
- **FastAPI** - Веб фреймворк
- **SQLAlchemy** - ORM
- **PostgreSQL** - База даних
- **Pydantic** - Валідація даних
- **JWT** - Аутентифікація

### Frontend
- **Next.js 14** - React фреймворк
- **TypeScript** - Типізація
- **Tailwind CSS** - Стилізація
- **Zustand** - State management
- **Axios** - HTTP клієнт
- **Lucide React** - Іконки
- **Recharts** - Графіки

## 📄 Ліцензія

MIT License
