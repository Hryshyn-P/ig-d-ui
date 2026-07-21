# ReelSave

A minimal, responsive frontend for downloading media from public Instagram posts.

## Local development

```bash
npm ci
npm run dev
```

Set `NEXT_PUBLIC_DOWNLOADER_API_URL` to an HTTPS backend endpoint to enable downloads. Without it, the interface remains fully usable as a static demo and shows a configuration message on submit.

The frontend sends:

```json
{ "url": "https://www.instagram.com/reel/..." }
```

The backend should return:

```json
{
  "title": "Post title",
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

## GitHub Pages deployment

The workflow in `.github/workflows/deploy-pages.yml` builds a static Next.js export and deploys the generated `out/` directory.

1. Push the project to the `main` branch.
2. In **Settings → Pages**, select **GitHub Actions** as the source.
3. Add an optional `DOWNLOADER_API_URL` repository secret with the HTTPS backend endpoint.
4. To enable ads, add optional repository variables `ADSTERRA_SOCIAL_BAR_SRC`, `ADSTERRA_NATIVE_SCRIPT_SRC`, and `ADSTERRA_NATIVE_CONTAINER_ID` using the values from the corresponding Adsterra snippets.
5. Push to `main` or run **Deploy to GitHub Pages** manually from the Actions tab.

The workflow automatically applies the repository name as the GitHub Pages base path. For a custom domain, set `NEXT_PUBLIC_BASE_PATH` to an empty string in the workflow.

Adsterra scripts are loaded only when their complete configuration is present and uses HTTPS. `app/rewarded-ads.ts` contains a provider interface for a future Google Ad Manager rewarded-ad integration.

## Checks

```bash
npm test
npm run lint
```

GitHub Pages only hosts the static frontend. Never expose Instagram cookies, credentials, or private API keys in this repository or in `NEXT_PUBLIC_*` variables.
