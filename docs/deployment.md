# BookPilot - Развертывание

## Подготовка к развертыванию

Для развертывания приложения BookPilot мы будем использовать:
- **Vercel** для фронтенда на Next.js
- **Railway** для бэкенда на FastAPI
- **PostgreSQL** для базы данных (через Railway)

## Шаги для развертывания

### 1. Подготовка бэкенда к развертыванию

Создадим файл Procfile для Railway:
```
web: cd backend && uvicorn main:app --host 0.0.0.0 --port $PORT
```

Создадим файл .env для бэкенда:
```
DATABASE_URL=postgresql://${PGUSER}:${PGPASSWORD}@${PGHOST}:${PGPORT}/${PGDATABASE}
SECRET_KEY=your-secret-key-here
OPENAI_API_KEY=your-openai-api-key-here
```

Создадим файл requirements.txt в корне проекта для Railway:
```
-r backend/requirements.txt
```

### 2. Подготовка фронтенда к развертыванию

Создадим файл .env.local для фронтенда:
```
NEXT_PUBLIC_API_URL=https://your-backend-url.railway.app/api/v1
```

Обновим package.json для Vercel:
```json
{
  "scripts": {
    "build": "next build",
    "start": "next start",
    "dev": "next dev"
  }
}
```

### 3. Развертывание на Railway (бэкенд)

1. Создайте аккаунт на Railway.app
2. Создайте новый проект
3. Добавьте PostgreSQL в проект
4. Подключите репозиторий GitHub с кодом BookPilot
5. Настройте переменные окружения:
   - DATABASE_URL (автоматически предоставляется Railway)
   - SECRET_KEY
   - OPENAI_API_KEY
6. Запустите деплой

### 4. Развертывание на Vercel (фронтенд)

1. Создайте аккаунт на Vercel.com
2. Импортируйте репозиторий GitHub с кодом BookPilot
3. Настройте:
   - Root Directory: frontend
   - Framework Preset: Next.js
4. Добавьте переменную окружения:
   - NEXT_PUBLIC_API_URL (URL вашего бэкенда на Railway)
5. Запустите деплой

### 5. Настройка CORS

Убедитесь, что в файле конфигурации бэкенда (config.py) добавлен URL вашего фронтенда в список CORS_ORIGINS:

```python
CORS_ORIGINS = [
    "http://localhost",
    "http://localhost:3000",
    "https://your-frontend-url.vercel.app",
]
```

### 6. Тестирование развернутого приложения

После развертывания необходимо протестировать:
1. Регистрацию и вход пользователей
2. Загрузку книг
3. Генерацию учебных руководств
4. Просмотр учебных руководств
5. Функциональность чата с ИИ
6. Экспорт учебных руководств в PDF

### 7. Оптимизация для SEO и улучшение доступности

1. Добавьте метатеги для SEO в компонент Head на всех страницах
2. Убедитесь, что все изображения имеют атрибуты alt
3. Проверьте контрастность цветов для улучшения доступности
4. Добавьте семантические HTML-теги для улучшения доступности
5. Проверьте работу с клавиатурой для всех интерактивных элементов
