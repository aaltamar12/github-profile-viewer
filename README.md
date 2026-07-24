# GitHub Profile Viewer

Reto técnico: un backend en NestJS que consulta la API pública de GitHub y un
frontend en Next.js que consume ese endpoint para mostrar el perfil de
[aaltamar12](https://github.com/aaltamar12).

## Estructura

```
backend/   NestJS — GET /user/:username
frontend/  Next.js (App Router) — consume el endpoint anterior
```

## Backend

```
cd backend
npm install
npm run start:dev   # http://localhost:4000
```

`GET /user/:username` responde:

```json
{
  "login": "aaltamar12",
  "name": "Alfonso Altamar Montero",
  "avatarUrl": "https://avatars.githubusercontent.com/u/66718199?v=4",
  "bio": null,
  "company": null,
  "location": "Barranquilla, Atlántico - Colombia",
  "blog": "",
  "twitterUsername": null,
  "publicRepos": 127,
  "followers": 4,
  "following": 2,
  "htmlUrl": "https://github.com/aaltamar12",
  "createdAt": "2020-06-10T07:05:40Z"
}
```

404 si el usuario no existe, 429 si se agota el rate limit de GitHub (60
req/hora sin token). Variable opcional `GITHUB_TOKEN` en `.env` para subir ese
límite a 5000 req/hora (ver `.env.example`).

## Frontend

```
cd frontend
npm install
npm run dev   # http://localhost:3000
```

Variable `BACKEND_URL` (server-side, ver `.env.example`) apunta al backend.
El fetch ocurre en un Server Component sin caché (`cache: "no-store"`), con
`loading.tsx` cubriendo el estado de carga vía Suspense.

## Diseño

El perfil se presenta como un documento, no como un dashboard: encabezado
mono que expone la llamada real (`GET /user/aaltamar12 → 200 OK`), nombre en
serif (Fraunces) sobre metadatos en mono (IBM Plex Mono), y estadísticas
como tipografía plana en vez de badges o tarjetas con iconos.

## Deploy

- Frontend: `<pendiente>`
- Backend: `<pendiente>`
