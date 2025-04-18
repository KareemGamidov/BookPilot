# Руководство по развертыванию BookPilot

Это подробное руководство по развертыванию проекта BookPilot с использованием GitHub, Railway и Vercel.

## Предварительные требования

- Аккаунт GitHub: https://github.com/
- Аккаунт Railway: https://railway.app/
- Аккаунт Vercel: https://vercel.com/
- API-ключ OpenAI (уже предоставлен)

## Шаг 1: Создание репозитория GitHub

1. Перейдите на GitHub и войдите в свой аккаунт
2. Нажмите на "+" в правом верхнем углу и выберите "New repository"
3. Назовите репозиторий "bookpilot"
4. Выберите "Public" или "Private" в зависимости от ваших предпочтений
5. Нажмите "Create repository"
6. После создания репозитория, скопируйте его URL (например, `https://github.com/username/bookpilot.git`)

## Шаг 2: Загрузка кода в репозиторий

```bash
# Клонировать пустой репозиторий
git clone https://github.com/username/bookpilot.git
cd bookpilot

# Скопировать файлы проекта
# (Здесь будет команда для копирования файлов из архива)

# Добавить файлы в репозиторий
git add .
git commit -m "Initial commit"
git push origin main
```

## Шаг 3: Настройка базы данных на Railway

1. Перейдите на Railway и войдите в свой аккаунт
2. Нажмите "New Project" и выберите "PostgreSQL"
3. После создания базы данных, перейдите в раздел "Variables"
4. Скопируйте значение переменной `DATABASE_URL` (оно понадобится позже)

## Шаг 4: Развертывание бэкенда на Railway

1. На Railway нажмите "New Project" и выберите "Deploy from GitHub repo"
2. Выберите репозиторий "bookpilot"
3. В настройках проекта:
   - Укажите рабочую директорию: `/backend`
   - Команда запуска: `uvicorn main:app --host 0.0.0.0 --port $PORT`
4. Перейдите в раздел "Variables" и добавьте следующие переменные:
   - `DATABASE_URL`: значение, скопированное на шаге 3
   - `OPENAI_API_KEY`: ваш API-ключ OpenAI
   - `SECRET_KEY`: сгенерируйте случайную строку (например, `openssl rand -hex 32`)
5. Нажмите "Deploy" для запуска бэкенда
6. После успешного развертывания, скопируйте URL бэкенда (например, `https://bookpilot-backend-production.up.railway.app`)

## Шаг 5: Развертывание фронтенда на Vercel

1. Перейдите на Vercel и войдите в свой аккаунт
2. Нажмите "Add New" и выберите "Project"
3. Импортируйте репозиторий "bookpilot" из GitHub
4. В настройках проекта:
   - Укажите рабочую директорию: `frontend`
   - Framework Preset: Next.js
5. В разделе "Environment Variables" добавьте:
   - `NEXT_PUBLIC_API_URL`: URL бэкенда + `/api/v1` (например, `https://bookpilot-backend-production.up.railway.app/api/v1`)
6. Нажмите "Deploy" для запуска фронтенда
7. После успешного развертывания, вы получите URL вашего приложения (например, `https://bookpilot.vercel.app`)

## Шаг 6: Настройка домена (опционально)

1. На Vercel перейдите в настройки проекта и выберите "Domains"
2. Добавьте свой домен и следуйте инструкциям для настройки DNS

## Шаг 7: Тестирование приложения

1. Откройте URL фронтенда в браузере
2. Зарегистрируйте тестового пользователя
3. Загрузите книгу и проверьте генерацию учебного руководства
4. Протестируйте чат с книгой и другие функции

## Шаг 8: Настройка системы подписок

1. Для настройки платежей рекомендуется использовать Stripe:
   - Создайте аккаунт на Stripe: https://stripe.com/
   - Добавьте ключи API Stripe в переменные окружения бэкенда
   - Настройте вебхуки для обработки событий подписки

## Поддержка и обновления

- Для обновления приложения просто внесите изменения в репозиторий GitHub
- Railway и Vercel автоматически обнаружат изменения и обновят развернутые приложения
- Для мониторинга и логирования используйте встроенные инструменты Railway и Vercel

## Устранение неполадок

- Если бэкенд не запускается, проверьте логи на Railway
- Если фронтенд не подключается к бэкенду, проверьте переменную `NEXT_PUBLIC_API_URL`
- Для проблем с API OpenAI проверьте правильность ключа и квоты использования
