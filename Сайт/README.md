
# Одобрено — AI-помощник по кредитному скорингу

Платформа для оценки кредитоспособности на основе обученной ML-модели (RandomForest). Анализирует 53 параметра пользователя и выдаёт прогноз одобрения кредита с рекомендациями.

## Возможности

- **ML-скоринг** — RandomForest-модель (53 признака): 17 числовых, 10 типов кредита, 4 категориальных
- **14-дневный пробный период** — неограниченные анализы без карты
- **ИИ-ассистент** — чат с ответами на вопросы о кредитах, скоринге, ставках
- **История анализов** — сохранение результатов с возможностью очистки
- **Тёмная тема** — glassmorphism UI с анимациями

## Технологии

| Слой | Стек |
|------|------|
| Backend | Python 3.13, FastAPI, SQLAlchemy, SQLite, scikit-learn |
| Frontend | Vanilla HTML/CSS/JS, Inter font |
| ML | RandomForestClassifier, StandardScaler, OneHotEncoder, MultiLabelBinarizer |
| Auth | JWT (python-jose), bcrypt (passlib) |

## Структура

```
project/
├── backend/
│   ├── main.py                 # FastAPI app, static mount /app/
│   ├── config.py               # Settings (pydantic-settings)
│   ├── database.py             # SQLAlchemy engine/session
│   ├── .env.example            # Пример переменных окружения
│   ├── requirements.txt
│   ├── routers/
│   │   ├── auth.py             # /api/auth/register, /login
│   │   ├── analysis.py         # /api/analysis/predict, /history
│   │   ├── chat.py             # /api/chat/message
│   │   └── users.py            # /api/users/me
│   ├── schemas/                # Pydantic models
│   ├── models/                 # SQLAlchemy models + .pkl2 модель
│   ├── services/
│   │   ├── credit_scoring.py   # ML-предсказание + fallback
│   │   ├── chat_service.py     # Rule-based чат
│   │   └── auth_service.py     # JWT verification
│   └── ml/
│       └── model_loader.py     # Загрузка .pkl2 бандла
├── frontend/
│   ├── index.html              # Лендинг
│   ├── login.html              # Вход
│   ├── register.html           # Регистрация (14 дней триал)
│   ├── dashboard.html          # Личный кабинет
│   ├── css/
│   │   ├── style.css           # Основные стили + glassmorphism
│   │   └── animations.css      # Анимации
│   └── js/
│       ├── app.js              # API-клиент, утилиты
│       ├── animations.js       # Score rings, counters
│       ├── auth.js             # Формы входа/регистрации
│       └── dashboard.js        # Кабинет, анализ, чат, история
└── README.md
```

## Запуск

### 1. Backend

```bash
cd backend
python -m venv venv
venv\Scripts\activate          # Windows
source venv/bin/activate       # Linux/Mac
pip install -r requirements.txt
cp .env.example .env           # и измените SECRET_KEY
uvicorn main:app --reload --port 8000
```

### 2. Frontend

Frontend раздаётся самим FastAPI по адресу:

```
http://localhost:8000/app/
```

Или отдельно:

```bash
cd frontend
python -m http.server 5500
```

## API

| Метод | Путь | Описание |
|-------|------|----------|
| POST | /api/auth/register | Регистрация (триал 14 дней) |
| POST | /api/auth/login | Вход |
| POST | /api/analysis/predict | ML-анализ кредитоспособности |
| GET | /api/analysis/history | История анализов |
| POST | /api/chat/message | Чат с ассистентом |
| GET | /api/users/me | Профиль |
| PUT | /api/users/me | Обновление профиля |
| GET | /api/health | Health check |

## ML-модель

Модель хранится в `backend/models/credit_model_complete.pkl2` и содержит:

- `model` — RandomForestClassifier (3 класса: Poor/Standard/Good)
- `scaler` — StandardScaler (53 признака)
- `onehot_encoder` — OneHotEncoder (occupation, credit_mix, payment_of_min_amount, payment_behaviour)
- `mlb` — MultiLabelBinarizer (10 типов кредита)
- `feature_names` — список из 53 имён признаков

Порядок признаков: 17 числовых → 10 loan types (MLB) → 26 категориальных (OHE).

## Переменные окружения

| Переменная | Описание | По умолчанию |
|-----------|----------|-------------|
| SECRET_KEY | Секрет для JWT | — |
| DATABASE_URL | Путь к SQLite | sqlite:///./odobreno.db |

## Лицензия

MIT
