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

Frontend поддерживает Adsterra Social Bar и Native Banner. После добавления сайта в Adsterra создайте в **Settings → Secrets and variables → Actions → Variables**:

- `ADSTERRA_SOCIAL_BAR_SRC` — HTTPS `src` из кода Social Bar;
- `ADSTERRA_NATIVE_SCRIPT_SRC` — HTTPS `src` из кода Native Banner;
- `ADSTERRA_NATIVE_CONTAINER_ID` — `id` контейнера Native Banner, включая `container-`, если он есть в выданном коде.

После изменения variables перезапустите workflow, потому что значения встраиваются во frontend во время сборки. Если variables не заданы или некорректны, рекламные компоненты ничего не отображают и не мешают скачиванию.

Файл `app/rewarded-ads.ts` определяет общий интерфейс rewarded-рекламы. В будущем Google Ad Manager можно подключить реализацией `RewardedAdProvider`, которая возвращает `granted` только после события `rewardedSlotGranted`.

Не загружайте рекламный скрипт до получения согласия пользователя там, где это требуется законом.

## Ограничения

GitHub Pages обслуживает только статические файлы. Получение прямых media URL выполняет отдельный backend. Сервис следует использовать только для собственного контента или материалов, на скачивание которых получено разрешение.
