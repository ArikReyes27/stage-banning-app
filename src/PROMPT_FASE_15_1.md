# STAGE//STRIKE — Fase 15.1

## Resultado

Preparación opcional de Supabase completada sin migrar datos ni conectar la
aplicación al proyecto alojado. Home, Bracket, VS, Standings, hooks y persistencia
local conservan sus archivos originales. No se hizo push a GitHub, SQL remoto,
db push, db reset, autenticación de interfaz, realtime ni escritura de torneos.

## Respaldo previo

Respaldo válido: `stage-banning-before-phase15-1-verified-20261023-012001.zip`
en la raíz del proyecto. Se verificaron 353 entradas, lectura completa del ZIP y
presencia de package.json y src/types/tournament.ts. Incluye cambios previos sin
commit, código, tests, docs y assets. Excluye node_modules, dist, .git, ZIPs
anteriores y archivos .env*; no es respaldo del historial Git ni de localStorage.
Exportar los datos del navegador por separado cuando se vaya a migrar.

El primer intento con Compress-Archive falló y dejó
`stage-banning-before-phase15-1-20261023-011930.zip` incompleto: **no utilizarlo**.
No se borró ningún archivo. El segundo respaldo se hizo con ZipFile y se verificó
antes de instalar o editar. Comparación SHA256 posterior: de los 353 archivos
preexistentes solo cambiaron package.json y package-lock.json.

## Archivos y decisiones

- `package.json` / `package-lock.json`: @supabase/supabase-js 2.118.0 instalado.
- `src/lib/supabase.ts`: singleton lazy `getSupabaseClient(): SupabaseClient | null`.
  Sin configuración, URL inválida o clave no publishable devuelve null; no hay
  consumidores en la aplicación. Sesión persistente, auto refresh y detección de
  Auth en URL deshabilitados.
- `src/vite-env.d.ts`: variables opcionales tipadas.
- `.env.example`: solo VITE_SUPABASE_URL y VITE_SUPABASE_PUBLISHABLE_KEY vacías.
  `git check-ignore -v .env.local` confirmó la regla existente `.gitignore:13`
  (`*.local`); no fue necesario modificarla ni crear .env.local.
- `supabase/migrations/20261023000000_initial_tournament_architecture.sql`:
  perfiles vinculados a auth.users, torneos, inscritos, miembros, bracket con
  revisión, auditoría por deltas y propuestas de resultados.
- `supabase/README.md`: correspondencia con los modelos reales, concurrencia,
  matriz de permisos futura y pasos de configuración.

Se revisaron tournament.ts, registration.ts, ambos hooks de persistencia,
tournamentStorage, tournamentValidation, tournamentResults, tournamentSetup,
tournamentStandings y las pantallas de presentación/VS/Standings.
El registro local global se mantiene separado: su futura importación será una
selección explícita por torneo, no una migración automática.

El JSONB conserva `Omit<Tournament, 'participants'>`, incluidas versiones 1/2,
resultados legacy, juegos anulados y DQ. Participantes se normalizan por torneo
con ID textual original y orden estable; Standings y encuentros resueltos siguen
siendo derivados. El owner se obtiene de tournaments.owner_id; no hay fila owner
duplicada en miembros, que solo almacenan admin/player.

La futura API deberá validar el modelo completo y escribir dentro de una única
transacción con expected_revision, bloqueo de torneo, incremento de revisión y
auditoría. Conflictos requieren recarga y revisión, nunca sobrescritura ciega.
Este contrato está diseñado, **no implementado**. RLS habilitado y forzado, grants
revocados y políticas restrictivas false bloquean anon/authenticated en las siete
tablas. No existen rutas de escritura ni lecturas públicas habilitadas.

## Verificación

| Comando / comprobación | Resultado |
| --- | --- |
| `npm.cmd test` | 131/131 aprobados |
| `npx.cmd tsc -b` | Aprobado |
| `npm.cmd run lint` | Aprobado |
| `npm.cmd run build` | Aprobado; advertencia de chunks >500 kB |
| Cliente opcional, prueba puntual ejecutada con TypeScript y SDK real | 5 casos aprobados: vacío, incompleto, URL inválida, clave secret ficticia rechazada, publishable ficticia válida con singleton; cero fetch |
| Comparación SHA256 contra respaldo | UI, modelos y persistencia existentes intactos |
| `git diff --check` | Aprobado |
| `npm.cmd audit --json` | 7 vulnerabilidades: 1 moderada y 6 altas |

Las siete dependencias reportadas por audit son baseline-browser-mapping,
brace-expansion, browserslist, nanoid, postcss, source-map-js y vite; sus versiones
coinciden con las del respaldo anterior a esta fase. No se ejecutó audit fix ni
se actualizaron dependencias ajenas a la tarea. Revisarlas en trabajo separado.
El primer npm install restringido no avanzó; se interrumpió y se completó con
el permiso de red/caché del entorno.

No hay psql, Supabase CLI ni Docker disponibles en PATH. La migración recibió
revisión estática, pero no ejecución de SQL ni pruebas reales de RLS/concurrencia.
Las comprobaciones SQL son de forma básica, no validación competitiva completa.
No se probaron credenciales ni conectividad del proyecto. No se hizo prueba
visual nueva porque ningún archivo de interfaz cambió. Los datos del navegador
no están incluidos en el ZIP ni fueron leídos o alterados.

## Continuación: Fase 15.2

1. En StageStrike / ArikReyes's Project obtener URL y publishable key exactas;
   copiar .env.example a .env.local y completar únicamente esos valores. Nunca
   incluir contraseñas, secret keys o service_role en VITE_*. Reiniciar Vite.
   Esto por sí solo no habilitará acceso remoto ni es requisito para jugar local.
2. Preparar PostgreSQL/Supabase local o un entorno de pruebas autorizado y revisar
   la migración allí; probar constraints y denegación para anon/authenticated.
   No aplicar todavía a producción solo por existir este archivo.
3. Implementar Auth, perfiles y resolución segura de owner/admin/player, adaptador
   del modelo y transacción CAS con auditoría; generar tipos Database. Decidir
   asociación de inscritos invitados a cuentas, transporte de rulesets y si habrá
   lectura pública de presentación.
4. Probar aislamiento de torneos, elevación de roles, aceptación de reportes,
   ediciones simultáneas y rollback. Reemplazar deliberadamente las políticas de
   bloqueo solo cuando los permisos completos estén implementados y revisados.
5. Planear por separado exportación de localStorage, importación explícita,
   respaldo y reversión antes de cualquier migración de datos.

Fuentes oficiales utilizadas para claves y RLS:
[API keys](https://supabase.com/docs/guides/getting-started/api-keys),
[RLS](https://supabase.com/docs/guides/database/postgres/row-level-security).
