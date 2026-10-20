# Web — TallerScan

Sitio público (portada, precios, pedir turno, mi turno, dónde estamos) y panel de los socios (hoy, turnos, métricas, finanzas, precios, ajustes, cuenta). Next.js 16 + React 19 + Tailwind 4, **exportado estático**: `npm run build` deja todo en `out/` y lo sirve nginx. Lo dinámico lo pide el navegador a ApiCore por `/api`.

## Desarrollo

1. Levantar la API: `..\ApiCore\iniciar-api.bat` (queda en `http://localhost:5100`).
2. **`iniciar-web.bat`** (o `npm run dev`): `http://localhost:3000`, en esa misma ventana.

O todo junto con `..\iniciar-todo.bat` (dos ventanas: API y web); cortar con `..\detener-todo.bat`.

Variables en `.env.local` (copiar de `.env.example`). Todas son de build:

| Variable | Para qué |
|---|---|
| `NEXT_PUBLIC_SITE_NAME` | Nombre del sitio. Cambiar de marca = cambiar esto y recompilar. |
| `NEXT_PUBLIC_SITE_URL` | URL pública (metadatos). |
| `NEXT_PUBLIC_API_URL` | `http://localhost:5100` en desarrollo; **vacía** en producción (mismo origen). |
| `BUILD_API_URL` | Opcional: de dónde leer precios y datos del taller al compilar, para que el HTML ya los traiga. |

Dirección, horarios, redes, WhatsApp y precios **no** van acá: se cargan desde el panel (Ajustes y Precios).

## Rutas

| Ruta | Qué |
|---|---|
| `/` | Portada con la promo del escaneo |
| `/tarifas` | Pizarrón de precios |
| `/turnos` | Pedir turno en 3 pasos (`?s=<id>` preselecciona un servicio) |
| `/mi-turno` | Buscar los turnos propios con patente + WhatsApp o email |
| `/mi-turno?c=<código>` | Estado del turno, cancelar o cambiar el día (el link llega por WhatsApp y email) |
| `/ubicacion` | Dirección, horarios, contacto |
| `/ingresar` | Login de los socios |
| `/panel` | Hoy: abrir el día ("Estoy disponible"), bloques, cupos y turnos |
| `/panel/turnos` | Buscar turnos |
| `/panel/metricas` | Embudo, publicidad, servicios, gancho del escaneo |
| `/panel/finanzas` | Saldo, gastos, Pagar + comprobante, gastos mensuales |
| `/panel/tarifas` | Precios base, tramos y redondeo (permiso de tarifas o dueño) |
| `/panel/ajustes` | Reglas de turnos y avisos fallidos; datos del taller y socios solo para el dueño |
| `/panel/cuenta` | Vincular Telegram, contraseña, salir |

## Publicidad

Cada anuncio con su link: `https://tallerscan.com.ar/?utm_source=instagram&utm_campaign=escaneo-oct`. La web guarda el origen de la primera visita y lo manda con el turno. En Finanzas, el gasto de esa publicidad se carga con la misma campaña (`escaneo-oct`) y en Métricas se ve cuánto rindió.

## Antes de dar algo por terminado

`npm run build` y `npm run lint` sin errores, y recorrer a 360 px de ancho sin scroll horizontal.
