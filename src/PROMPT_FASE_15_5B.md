# STAGE//STRIKE — Fase 15.5B

## Flujo del organizador

En `npm run dev:auth-tests` → `http://127.0.0.1:5174`, abrir **Mis torneos**, escribir el nombre, crear y pulsar **Abrir torneo**. La RPC existente asigna owner desde Auth. La aplicación prepara un espacio local vacío: no copia los datos globales ni los de otros eventos. Si falla el almacenamiento tras crear el remoto, se informa que debe abrirse el torneo existente, sin crearlo otra vez.

Registro, Bracket, VS y Standings usan ese mismo espacio. Encima de Registro y Bracket se muestra **Torneo actual** y un selector con los torneos administrables y la opción **Local anterior (sin vínculo)**. Cambiar requiere confirmar el descarte de formularios no guardados, conserva los datos guardados y abre Registro del destino. No requiere exportar/importar archivos. El UUID va en `?event=…` y se conserva durante la navegación y recarga, incluidas las presentaciones de VS. No es una credencial: se vuelve a comprobar la cuenta y su acceso.

Registro conserva agregar, editar, eliminar, pegar, importar Excel/CSV/TXT y exportar. No exige cuentas a participantes. En Bracket se eligen los registrados del evento y se prepara su copia competitiva. Cambiar después el registro no altera automáticamente un bracket ya creado. La opción existente de nuevo torneo dentro de Bracket reemplaza solo el bracket local del evento seleccionado, con confirmación y respaldo; no crea otro remoto.

## Almacenamiento y compatibilidad

Una clave por **proyecto de pruebas + UUID Auth + UUID de torneo**:

`stage-strike.workspace.v1:<project>:<account>:<tournament>`

Contiene `{version:1, registration, tournament}`, donde tournament es el JSON v1/v2 original compatible, o `null` mientras no se haya preparado un bracket. Una escritura atómica conserva ambas partes sin mezclar eventos. El editor vacío usa su representación inicial habitual, sin copiar ni persistir participantes de otro torneo.

Seeds, estructura Winners/Losers, BO3/BO5, personajes, juegos/historial, DQ, GF/Reset y completionOrder permanecen dentro de Tournament. Standings continúa derivándose de él. No se rediseñaron Top 32, VS o Standings ni se cambiaron los formatos de exportación/importación anteriores.

Antes de inicializar espacios se conserva una copia exacta de las dos claves globales en `stage-strike.legacy-backup.v1`. Los originales `stage-strike.top8.v1` y `stage-strike.registration.v1` no se borran ni se asignan a los remotos. Cada guardado conserva la versión previa del espacio en `<key>:backup`. Una recuperación/importación JSON crea además `<key>:before-import:<timestamp>`; los cambios de roster del bracket y su reinicio crean `<key>:before-replace:<timestamp>`. El respaldo debe guardarse primero; ante falta de espacio se rechaza el cambio. Los checkpoints no se eliminan automáticamente.

**Recuperación:** elegir Local anterior para seguir trabajando con los datos originales. Para copiarlos a un evento, abrir ese evento → **Recuperar datos locales anteriores** → **Vista previa de datos antiguos** → revisar cantidad, nombres y resultados → confirmar recuperación. Reemplaza únicamente el destino indicado, respaldándolo; el original permanece. **Vista previa del respaldo anterior** permite revisar y restaurar la versión inmediatamente anterior del espacio. Los checkpoints adicionales quedan almacenados para recuperación asistida; no hay un explorador de todos ellos en esta fase.

También siguen disponibles las importaciones normales desde Registro y Bracket. El importador JSON de Bracket muestra cantidad de participantes/resultados y confirma el reemplazo; no modifica el registro independiente. Para trasladar el registro completo, usar sus exportaciones/importaciones existentes. Puertos y orígenes distintos tienen almacenamiento distinto: si los datos viejos están en 5173, exportarlos allí e importarlos explícitamente en 5174.

## Cambios rápidos, pestañas y acceso

El cambio de UUID desmonta el editor anterior. Los callbacks pendientes de ese editor no pueden escribir en el siguiente. Los hooks leen a través de un contexto fijo de almacenamiento y detectan cambios ajenos. Web Locks permite una sola pestaña editora por espacio: otra pestaña lo muestra en solo lectura y recibe actualizaciones locales. Para tomar la edición, cerrar la primera y reabrir la segunda. Si el navegador no admite Web Locks, no se habilita la edición del espacio; el modo local anterior sigue disponible.

Al abrir rutas de un evento se consulta Auth y el listado permitido por RLS. Solo owner/admin entra. Se revalida al recuperar foco y cada 60 segundos; al perder acceso o cerrar sesión se desmonta el editor. No es Realtime y una revocación puede tardar hasta esa comprobación en reflejarse en la interfaz local. Toda operación remota sigue siendo validada inmediatamente por PostgreSQL. Una URL o nickname no concede autoridad.

Las cuentas están separadas también en el mismo navegador: el coadministrador tiene su propia copia local, inicialmente vacía. Eso evita que otra sesión herede datos del propietario, pero **no comparte resultados entre cuentas**, aunque usen el mismo dispositivo. El almacenamiento local no es cifrado ni constituye una barrera frente a alguien con acceso directo a las herramientas del navegador. No se borra al cerrar sesión; volver a entrar con la misma cuenta y abrir el mismo evento recupera los datos. Tras cerrar el navegador puede ser necesario volver a iniciar sesión, según el Auth de pruebas existente.

## Supabase: qué está guardado y qué no

Crear guarda nombre, owner y estructura vacía mediante la RPC existente. Registro y todas las operaciones competitivas posteriores son locales al evento. **Datos en nube** ahora obtiene la vista previa exclusivamente del espacio de ese UUID y cuenta; ya no lee el torneo global compartido.

Consultar snapshot muestra únicamente lo efectivamente devuelto por Supabase y su revisión. Guardar un borrador sigue siendo una acción explícita con respaldo y confirmación, limitada por 15.5A a un destino remoto vacío y borradores compatibles, sin personajes, prioridades, sorteo ni resultados. No se marca un espacio local como sincronizado por el mero hecho de crear el torneo o consultar un snapshot. Los estados avanzados se conservan localmente y la interfaz indica que el guardado competitivo en nube aún no está disponible.

En otro dispositivo/cuenta, la apertura crea un espacio vacío independiente; no descarga ni reemplaza automáticamente el snapshot remoto. Puede consultarse y descargarse el JSON remoto para importarlo explícitamente. Sigue pendiente el validador competitivo completo del servidor, guardado transaccional de resultados, resolución de conflictos, apertura remota integrada y sincronización entre dispositivos. No se habilitaron JSONB arbitrario, service_role ni Realtime.

## Archivos y comprobaciones

- `src/lib/tournamentWorkspace.ts`: clave estable, sobre local, respaldos y adaptador de almacenamiento.
- `src/hooks/workspaceContext.ts`, `useTournament.ts`, `useRegistration.ts`: contexto fijo y protección de callbacks/ediciones.
- `src/components/tournament/TournamentWorkspace.tsx`: selector, acceso, exclusión de pestañas y recuperación explícita.
- Rutas/navegación, MyTournaments, CloudDraftPanel y textos de Registro/Bracket: integración del contexto. No se cambió `.env.local` ni la configuración aislada de pruebas.
- `tests/tournament-workspace.test.mjs`: 16/32, juegos/DQ, persistencia, separación de cuentas, datos antiguos, backups, cuota y corrupción.
- `tests/browser-phase15-5b.mjs` + `browser-workspace-flow.mjs`: perfil temporal con toda la red Supabase simulada. Creación vacía, Registro real, preparar/sortear/iniciar bracket, DQ mediante VS, cambio/recarga, Standings, preview aislada, recuperación antigua, importación JSON, owner/admin y bloqueo de ajeno. Comprueba el bloqueo activo de Web Locks y diseño móvil.
- Se adaptaron los tests de navegador 15.4B/15.5A al espacio nuevo; siguen verificando que las claves globales antiguas no cambien. El renderer de pruebas usa explícitamente el entorno local de Vite.

Validación: 152 tests, TypeScript (`tsc -b` incluido en build), lint y build. Build mantiene el aviso de chunks grandes. Navegador 15.5A comprueba regresión de carga inicial/invitaciones/revocación; navegador 15.5B comprueba el flujo nuevo. No se ejecutó SQL ni se contactó Supabase real; los cuatro torneos existentes no fueron modificados. Esta fase no requiere migraciones nuevas y depende de las RPC previas ya revisadas.

Pendiente de comprobación manual: usar las cuentas reales en stage-strike-tests, cerrar completamente y reabrir el navegador, entrar con la misma cuenta y comprobar ambos eventos; probar dos pestañas reales, revocación de admin y fallo de cuota en un entorno desechable. La automatización comprobó recarga/navegación y nueva lectura del almacenamiento, no un reinicio físico del equipo. Sin push.
