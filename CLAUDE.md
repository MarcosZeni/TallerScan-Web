# Web — TallerScan

Sitio público (tarifario, pedido de turnos, estado del turno, ubicación), panel del mecánico y admin. Next.js 16 + React 19 + Tailwind 4, **exportado estático** (`output: 'export'`) y servido por nginx. Todo lo dinámico sale de la API `ApiCore` (repo hermano) por `/api` en el mismo origen.

Documentación de producto y stack en el workspace: `../Docs/` (`stack.md` es la fuente de verdad técnica). Referencia de código: `D:\Github\Web-Autos\Web` (estructura, tokens, componentes) y `D:\Github\Ruvora\Web` (`wa.me`, promo).

## Reglas
- **Exportación estática:** sin Server Actions, `cookies()`, middleware, rewrites ni rutas de API de Next. Datos con `fetch` a `/api/v1/...` desde el navegador, a través de un solo helper en `src/lib/api.ts`.
- **El frontend no calcula precios ni valida reglas:** la API es la que vale. La web muestra lo que recibe.
- **Nombre y URL** del sitio por variables de build (`NEXT_PUBLIC_SITE_NAME`, `NEXT_PUBLIC_SITE_URL`) vía `src/lib/site.ts`. Dirección, horarios, redes y WhatsApp salen de la API (configurables desde el admin), nunca hardcodeados.
- **WhatsApp:** solo links `wa.me`, armados en un helper (`src/lib/whatsapp.ts`).
- **Colores solo con tokens** de `src/app/globals.css` (claro y oscuro redefinen los mismos). Nada de colores de Tailwind sueltos en componentes.
- **Mobile-first, para gente no técnica:** una acción principal por pantalla, 16 px o más, áreas táctiles de 44 px, etiquetas visibles, estados con palabras. El mecánico usa iPhone: probar en Safari iOS.
- Si la API está caída, las páginas públicas se ven igual con lo del build y un aviso; los paneles muestran el error.
- Rutas en español. Archivos kebab-case, componentes PascalCase con named export, componentes de ruta junto a la ruta.
- Antes de diseñar una pantalla nueva: skill `frontend-design`.
- Antes de dar algo por terminado: `npm run build` y `npm run lint`, y recorrer a 360 px sin scroll horizontal.

No hay changelog: un cambio se explica en el **mensaje de commit**, qué, por qué y cómo volver atrás.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
