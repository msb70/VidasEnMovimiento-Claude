# CI/CD — Despliegue automático a Hostinger

Cada `git push` a la rama `main` despliega el sitio estático a Hostinger
mediante GitHub Actions (workflow `.github/workflows/deploy.yml`).

## Cómo funciona

El pipeline tiene **dos jobs** y el deploy depende del primero:

1. **`test`** — valida sintaxis de JS y corre la suite de pruebas
   (`tests/`: RLS, funciones, Edge Function, integridad). Si algo falla, **no se despliega**.
2. **`deploy`** (`needs: [test]`) — copia solo los archivos web a `dist/`
   (`index.html`, `app.js`, `styles.css`, `mockData.js`, `supabase-config.js`,
   `supabase-data.js`, `assets/`) y los sube por **FTPS** a Hostinger.

> Las pruebas corren contra la base real en **modo solo lectura** (`TEST_ALLOW_WRITES=false`);
> no modifican datos, solo garantizan 2 usuarios de prueba. Para las pruebas que escriben,
> usar un branch de Supabase.

### Secret adicional para las pruebas

| Secret | Valor |
|---|---|
| `SUPABASE_SERVICE_ROLE_KEY` | Dashboard → Project Settings → API → `service_role` (secreto). Solo lo usa el setup de las pruebas. |

## Configuración (una sola vez)

### 1. Obtener las credenciales FTP en Hostinger

En **hPanel → Archivos → Cuentas FTP** (o "FTP Accounts"):
- Usa la cuenta FTP existente o crea una nueva.
- Anota: **FTP host/servidor**, **usuario**, **contraseña**.
- La carpeta destino del sitio es: `/home/u201688342/domains/vidasenmovimiento.com/public_html`.

> El valor de `FTP_SERVER_DIR` depende de dónde "arranque" tu cuenta FTP:
> - Si la cuenta FTP tiene como home `/home/u201688342/` → usa
>   `/domains/vidasenmovimiento.com/public_html/`
> - Si la cuenta FTP está limitada al dominio (home = su `public_html`) → usa
>   `/public_html/` o `/`
> En hPanel, junto a la cuenta FTP, aparece el "Directorio". Ese es tu punto de partida.
> **Importante:** el valor debe terminar en `/`.

### 2. Cargar los secrets en GitHub

En el repo: **Settings → Secrets and variables → Actions → New repository secret**.
Crea estos 4 secrets:

| Secret | Ejemplo / Valor |
|---|---|
| `FTP_SERVER` | el host FTP de hPanel (ej. `ftp.vidasenmovimiento.com` o la IP del servidor) |
| `FTP_USERNAME` | usuario FTP (ej. `u201688342.xxxxx`) |
| `FTP_PASSWORD` | contraseña de la cuenta FTP |
| `FTP_SERVER_DIR` | ej. `/domains/vidasenmovimiento.com/public_html/` (debe terminar en `/`) |

### 3. Probar

- Haz un push a `main`, o ve a la pestaña **Actions → Deploy a Hostinger → Run workflow**.
- Revisa el log del paso "Desplegar por FTP".
- Abre https://vidasenmovimiento.com y verifica el cambio.

## Notas

- Si **FTPS** falla (algunas cuentas Hostinger no lo tienen activo), edita el workflow
  y cambia `protocol: ftps` por `protocol: ftp`.
- El despliegue es **incremental** (`dangerous-clean-slate: false`): solo sube archivos
  cambiados, no borra nada del servidor.
- El backend (Supabase, Edge Functions, base de datos) **no** se toca en este pipeline;
  solo se despliega el frontend estático. Los cambios de base de datos van por
  migraciones (`supabase db push`), ver `supabase/README_MIGRACIONES.md`.
- Mejora futura opcional: validación previa (lint/`node --check app.js`) como paso
  anterior al deploy para frenar despliegues con errores de sintaxis.
