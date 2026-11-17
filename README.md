# SIV IA — Frontend Web (`frontend-svi`)

Aplicación web del **Sistema de Videovigilancia Inteligente (SIV IA)**: interfaz para operadores, supervisores y administradores que permite gestionar cámaras, monitorear en tiempo real y validar las alertas generadas por el modelo de detección de objetos peligrosos (`knife`, `scissors`, `box_cutter`, `lighter`).

## Índice

1. [Descripción del proyecto](#1-descripción-del-proyecto)
2. [Tecnologías utilizadas](#2-tecnologías-utilizadas)
3. [Requisitos](#3-requisitos)
4. [Instalación](#4-instalación)
5. [Configuración de `.env`](#5-configuración-de-env)
6. [Ejecución local](#6-ejecución-local)
7. [Build de producción](#7-build-de-producción)
8. [Estructura del proyecto](#8-estructura-del-proyecto)
9. [Comunicación con el backend](#9-comunicación-con-el-backend)
10. [Consideraciones de CORS](#10-consideraciones-de-cors)
11. [Pruebas y verificaciones](#11-pruebas-y-verificaciones)
12. [Despliegue en Vercel](#12-despliegue-en-vercel)
13. [Autoría y licencia](#13-autoría-y-licencia)

---

## 1. Descripción del proyecto

`frontend-svi` es el cliente web del SIV IA y se ejecuta de forma local (sin Docker). **No ejecuta inferencia en el navegador**: toda la lógica de negocio, la detección con YOLO (ONNX Runtime), la persistencia en PostgreSQL y la generación de alertas residen en el backend `svi-backend`.

El frontend consume la API REST (`/api/v1`) mediante `fetch` con autenticación JWT (Bearer + refresh token) y recibe eventos en tiempo real por WebSocket.

---

## 2. Tecnologías utilizadas

Versiones declaradas en [`package.json`](./package.json):

| Tecnología | Versión |
|---|---|
| React / React DOM | `^19.2.7` |
| TypeScript | `^5.8` |
| Vite | `^8.2.2` (`@vitejs/plugin-react ^5.2.0`) |
| Tailwind CSS | `^4.3.3` (`@tailwindcss/vite`, `@tailwindcss/postcss`) |
| React Router | `react-router ^8.3.1` |
| Gráficos | `apexcharts ^7.1.0`, `react-apexcharts ^2.1.1` |
| i18n | `i18next ^26.4.0`, `react-i18next ^17.0.12` |
| Calidad de código | `eslint ^10.10.0`, `typescript-eslint ^8.69.0`, `prettier ^3.9.6` |

La base visual proviene de la plantilla **TailAdmin React** (nombre de paquete `tailadmin-react`).

---

## 3. Requisitos

- **Node.js** `20.x` o superior.
- **npm** (incluido con Node.js).
- Backend **`svi-backend`** en ejecución y accesible desde el navegador en `http://localhost:8000` (el backend se ejecuta de forma independiente con Docker Compose).

---

## 4. Instalación

```bash
git clone <url-del-repositorio> frontend-svi
cd frontend-svi
npm ci
```

---

## 5. Configuración de `.env`

Copiar [`.env.example`](./.env.example) a `.env`:

```bash
cp .env.example .env
```

Contenido de referencia:

```env
# URL base del backend FastAPI SIV IA (sin barra final)
VITE_API_URL=http://localhost:8000

# URL del WebSocket (opcional; si se omite se deriva automáticamente de VITE_API_URL)
VITE_WS_URL=ws://localhost:8000/api/v1/ws
```

| Variable | Obligatoria | Por defecto | Descripción |
|---|---|---|---|
| `VITE_API_URL` | Recomendada | `http://localhost:8000` | URL base del backend, **sin** `/api/v1` ni barra final (`src/config/env.ts` construye `API_V1_URL = ${API_BASE_URL}/api/v1`). |
| `VITE_WS_URL` | No | Derivada de `VITE_API_URL` | URL completa del WebSocket (incluye `/api/v1/ws`). |

> Las variables `VITE_*` se incrustan en el bundle durante `npm run build`. No deben contener credenciales ni secretos, y `.env` está excluido de Git mediante `.gitignore`.

---

## 6. Ejecución local

Flujo de trabajo recomendado:

1. **Primero iniciar el backend** desde el repositorio `svi-backend`:

   ```bash
   docker compose up -d
   ```

   Esto levanta FastAPI en `http://localhost:8000` (API en `http://localhost:8000/api/v1`) y PostgreSQL dentro de Docker.

2. **Después iniciar el frontend** localmente desde `frontend-svi`:

   ```bash
   npm run dev
   ```

   La aplicación quedará disponible en `http://localhost:5173`.

---

## 7. Build de producción

```bash
npm run build    # ejecuta tsc -b && vite build y genera dist/
npm run preview  # sirve dist/ localmente para verificación
```

---

## 8. Estructura del proyecto

```text
frontend-svi/
├── public/               # Recursos estáticos
├── docs/especificaciones # Especificaciones funcionales (F01–F15)
├── src/
│   ├── config/env.ts     # Resolución centralizada de VITE_API_URL y VITE_WS_URL
│   ├── services/         # Cliente HTTP (apiClient) y servicios por módulo
│   ├── hooks/            # Hooks (useRealtimeSocket, etc.)
│   ├── context/          # Contextos de React (AuthContext, ThemeContext, LanguageContext, SidebarContext)
│   ├── types/            # Tipos TypeScript de las entidades del backend
│   ├── pages/            # Pantallas (Dashboard, Monitoring, Cameras, Detections, Alerts, History, Users, Profile)
│   ├── components/       # Componentes SIV (siv/), plantilla TailAdmin (ui/, form/, header/, etc.)
│   ├── layout/           # AppLayout, AppSidebar, AppHeader
│   ├── i18n/, locales/   # Internacionalización
│   └── App.tsx           # Definición de rutas y ProtectedRoute
├── vercel.json           # Rewrite SPA para Vercel
├── vite.config.ts        # Configuración de Vite 8
├── tsconfig.json         # Configuración base de TypeScript
└── .env.example          # Plantilla de variables de entorno
```

---

## 9. Comunicación con el backend

La resolución de URLs está centralizada en [`src/config/env.ts`](./src/config/env.ts):

- `API_BASE_URL`: toma `VITE_API_URL` (por defecto `http://localhost:8000`) sin barra final.
- `API_V1_URL`: `${API_BASE_URL}/api/v1`.
- `WS_URL`: toma `VITE_WS_URL` o la deriva automáticamente (`http://` → `ws://`, `https://` → `wss://`) agregando `/api/v1/ws`.
- `resolveApiAssetUrl()`: convierte rutas relativas de imágenes/snapshots en URLs absolutas usando `API_BASE_URL`.

### Servicios HTTP (`src/services/`)

| Servicio | Endpoints consumidos (bajo `/api/v1`) |
|---|---|
| `authService` / `apiClient` | `POST /auth/login`, `POST /auth/refresh`, `GET /auth/me`, `POST /auth/logout` |
| `dashboardService` | `GET /dashboard/summary` |
| `camerasService` | `GET/POST /cameras`, `GET/PATCH/DELETE /cameras/{id}`, `GET /cameras/{id}/stream`, `GET /cameras/{id}/connection-status`, `PATCH /cameras/{id}/active`, `POST /cameras/discover`, `POST /cameras/test-connection`, `POST /cameras/{id}/test-connection`, `POST /cameras/{id}/connect`, `POST /cameras/{id}/disconnect`, `GET /cameras/{id}/snapshot` |
| `monitoringService` | `GET /monitoring/cameras`, `GET /monitoring/cameras/streaming`, `GET /monitoring/cameras/{id}/status`, `POST /monitoring/cameras/{id}/start`, `POST /monitoring/cameras/{id}/stop`, `GET /monitoring/cameras/{id}/stream-info` |
| `detectionsService` | `GET /detections`, `POST /detections/cameras/{id}/process-frame`, `POST /inference/analyze`, `GET /inference/health` |
| `alertsService` | `GET /alerts`, `GET /alerts/recent`, `GET /alerts/{id}`, `PATCH /alerts/{id}/validate`, `PATCH /alerts/{id}/notes` |
| `historyService` | `GET /history` |
| `usersService` | `GET/POST /users`, `GET/PATCH /users/{id}` |

### Autenticación, errores y WebSocket

- **JWT**: `tokenStorage` almacena `siv_access_token`, `siv_refresh_token` y `siv_user` en `localStorage`. `apiClient` adjunta `Authorization: Bearer <token>`.
- **401 Unauthorized**: intenta renovar el token mediante `POST /auth/refresh` (con deduplicación de peticiones concurrentes). Si falla, limpia la sesión y dispara `onSessionExpired` para redirigir a `/signin`.
- **403 / 404 / 500**: `apiClient` parsea `{ error: { code, message, details } }` o `{ detail }` y lanza `ApiError`.
- **WebSocket**: `useRealtimeSocket` se conecta a `${WS_URL}?token=<access_token>`, envía heartbeat `"ping"` cada 25 s, reconecta con backoff exponencial y procesa eventos `alert.created`, `alert.updated` y `camera.status`.

---

## 10. Consideraciones de CORS

Dado que el navegador ejecuta el frontend en `http://localhost:5173` y consulta la API en `http://localhost:8000`, el backend `svi-backend` debe incluir el origen del frontend en su configuración `CORS_ORIGINS`:

```env
CORS_ORIGINS=http://localhost:5173
```

Si en producción o staging el frontend se sirve desde otro dominio (por ejemplo Vercel), ese origen también debe agregarse a `CORS_ORIGINS` en el backend y servirse sobre HTTPS/WSS para evitar bloqueo de contenido mixto.

---

## 11. Pruebas y verificaciones

No existen suites de pruebas unitarias o E2E configuradas actualmente en `package.json`. Las verificaciones disponibles son:

```bash
npx tsc -b       # Verificación de tipos TypeScript
npm run lint     # Análisis estático con ESLint
npm run build    # Compilación TypeScript + bundle de producción con Vite
```

---

## 12. Despliegue en Vercel

El repositorio incluye [`vercel.json`](./vercel.json) con rewrite `/(.*) → /index.html` para soportar rutas SPA al recargar.

1. Importar el repositorio en Vercel (preset **Vite**, build `npm run build`, output `dist`).
2. Configurar `VITE_API_URL=https://<dominio-del-backend>` (y opcionalmente `VITE_WS_URL`).
3. Agregar el dominio de Vercel a `CORS_ORIGINS` en `svi-backend`.

---

## 13. Autoría y licencia

- **Autoría:** _a completar por el equipo del proyecto SIV IA._
- **Licencia:** el archivo [`LICENSE.md`](./LICENSE.md) corresponde a la licencia **MIT** de la plantilla TailAdmin (© 2023 TailAdmin).
