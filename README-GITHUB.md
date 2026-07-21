# ReelSave

Адаптивный статический frontend для загрузчика общедоступных Instagram-публикаций.

## Локальный запуск

```bash
npm ci
NEXT_PUBLIC_DOWNLOADER_API_URL=http://localhost:8787/api/download npm run dev
```

Без переменной `NEXT_PUBLIC_DOWNLOADER_API_URL` интерфейс работает, проверяет ссылку и показывает сообщение о необходимости подключить API.

## Контракт API

Frontend отправляет `POST` на адрес из `NEXT_PUBLIC_DOWNLOADER_API_URL`:

```json
{ "url": "https://www.instagram.com/reel/..." }
```

Ожидаемый успешный ответ:

```json
{
  "title": "Название публикации",
  "thumbnail": "https://cdn.example.com/preview.jpg",
  "media": [
    {
      "url": "https://cdn.example.com/video.mp4",
      "type": "video",
      "quality": "1080p",
      "filename": "reel.mp4"
    }
  ]
}
```

Ошибка возвращается с HTTP 4xx/5xx и телом `{ "error": "Описание" }`. API должен разрешать CORS для домена GitHub Pages. Не помещайте Instagram cookies, пароли или API-токены во frontend либо GitHub Actions.

## GitHub Pages

1. Создайте репозиторий и отправьте код в ветку `main`.
2. В **Settings → Pages → Source** выберите **GitHub Actions**.
3. В **Settings → Secrets and variables → Actions** создайте repository secret `DOWNLOADER_API_URL` с HTTPS-адресом backend endpoint.
4. Запустите workflow **Deploy to GitHub Pages** или сделайте push в `main`.

Workflow сам учитывает имя репозитория как `basePath`. Для custom domain замените `NEXT_PUBLIC_BASE_PATH` в workflow на пустую строку.

## Реклама

Компонент `AdSlot` в `app/page.tsx` отмечает места для рекламы. После одобрения рекламной сетью замените содержимое слотов её официальным кодом. Не загружайте рекламный скрипт до получения согласия пользователя там, где это требуется законом.

## Ограничения

GitHub Pages обслуживает только статические файлы. Получение прямых media URL выполняет отдельный backend. Сервис следует использовать только для собственного контента или материалов, на скачивание которых получено разрешение.
