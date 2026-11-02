# STAGE//STRIKE — Fase 15.5A

## Alcance implementado

Persistencia limitada a **carga inicial segura de borradores** y lectura para owner/admin. No hay guardado de resultados competitivos: el validador completo del servidor sigue cerrado (`0A000`). No se convierte un torneo avanzado en borrador ni se eliminan campos para permitir su carga.

En `auth-tests`, Mis torneos → **Datos en nube** permite consultar un snapshot, previsualizar el torneo local o un archivo JSON, descargar el respaldo original y confirmar una carga inicial hacia un remoto vacío. Nunca se sobrescribe un remoto con datos, incluso con una revisión actualizada. El respaldo conserva los bytes del JSON original; el usuario confirma que lo guardó (el navegador no puede garantizar la conservación del archivo).

Subconjunto aceptado por el servidor:

- JSON v1: exactamente 8 participantes. JSON v2: 2–128 participantes y estructura canónica de doble eliminación, incluyendo GF y RESET.
- Estado `draft`, seeds vacíos, results vacío, completionOrder vacío en v2; prioridades ausentes o vacías.
- IDs originales, orden estable y nicknames completos y distintos; personajes vacíos. El catálogo de personajes todavía no se valida en servidor, por lo que sus selecciones bloquean la carga, sin borrarlas.
- Sin campos desconocidos; máximo 1 MiB de JSONB serializado en servidor. La lectura del archivo local mantiene el límite existente de 10 MB, pero el servidor puede rechazar un documento mayor que su propio límite.
- Los borradores v1 antiguos con nicknames vacíos o repetidos se pueden respaldar, pero deben completarse localmente antes de cargarse. Los torneos sorteados/iniciados no se suben en esta fase.

La vinculación se registra remotamente como UUID `import_id` en la auditoría, junto al UUID del torneo, revisión y snapshot inicial. Los IDs de participantes se preservan: no se regeneran por nickname ni se vinculan a cuentas Auth. No se agrega un marcador a localStorage ni sincronización automática. Tampoco se promete deduplicar un mismo archivo importado voluntariamente en dos torneos remotos distintos; se impide duplicar/reemplazar participantes dentro del destino.

## Modelos y seguridad

Se reutilizan las siete tablas originales; la tabla de invitaciones existente permanece intacta. `tournament_participants` guarda los participantes seleccionados del Tournament, con `profile_id = null`, orden y `in_bracket = true`. No se importa por separado la lista local de Registro que no esté incluida en ese Tournament.

`tournament_brackets.state` conserva `Tournament` sin participants. Resultados, historial de juegos/anulaciones, DQ, seeds/BYEs, estructura, prioridades, previousSeeds y completionOrder siguen teniendo esa ubicación canónica. Standings se calcula a partir de esos datos; no se crea una segunda tabla de resultados o standings. Los adaptadores de lectura/exportación prueban la conservación del estado competitivo admitido por el formato local, aunque sus escrituras continúan deshabilitadas.

La nueva RPC `ss_initialize_tournament_draft` valida la cuenta confirmada, owner/admin real, bloqueo de fila compartido con las operaciones 15.4A, revisión esperada, destino realmente vacío y todo el subconjunto permitido. Inserta roster, estado, revisión y auditoría en una transacción. Un fallo revierte todo. Un conflicto devuelve `40001`; no hay reintento automático. Un destino ocupado devuelve `55000`; contenido inválido, `22023`; falta de permisos, `42501`.

`ss_read_tournament_snapshot` consulta roster completo, estado, revisión e import_id en un único SELECT, con autorización owner/admin. Evita combinar lecturas de distintas revisiones. Permite descargar el snapshot completo, o un JSON compatible con el importador local cuando no se pierdan datos. Si hay información de inscripción que no cabe en Tournament, se bloquea esa conversión y permanece disponible el snapshot completo.

No se agregan grants DML ni políticas RLS más permisivas. Las funciones privadas no son ejecutables por clientes. Se mantiene intacto `ss_private.validate_competitive_state`, y no se utiliza service_role. La configuración sigue siendo la existente de `config/auth-tests`, con referencia permitida y cliente aislado; `.env.local` principal no se modifica. No hay llamadas remotas realizadas por este trabajo.

## Archivos

- `supabase/migrations/20261101000000_safe_initial_drafts.sql`: funciones privadas de validación y dos RPC públicas limitadas.
- `supabase/sql-editor/06_verify_safe_initial_drafts.sql`: prueba transaccional con fixtures aisladas y ROLLBACK.
- `src/lib/cloudDrafts.ts`: vista previa, contrato RPC, adaptador de lectura y errores seguros.
- `src/components/tournament/CloudDraftPanel.tsx`: interfaz explícita de respaldo/carga/lectura.
- `src/pages/MyTournamentsPage.tsx`: acceso al panel desde cada torneo administrable.
- `tests/cloud-drafts.test.mjs`: compatibilidad, conservación, bloqueo de estados avanzados y conflictos.
- `tests/browser-phase15-5a.mjs`: navegador con perfil temporal, cuentas y red simuladas; ningún acceso Supabase real.

## Revisión y aplicación manual (todavía NO ejecutadas)

1. Abrir Dashboard y verificar visualmente **stage-strike-tests** y su referencia. Nunca usar ArikReyes's Project. Los scripts no pueden verificar el nombre del proyecto alojado: la confirmación literal es una barrera manual, no una detección del destino.
2. Revisar `supabase/migrations/20261101000000_safe_initial_drafts.sql`. En la copia del SQL Editor, sustituir `CONFIRM_TEST_PROJECT` por `stage-strike-tests`. Ejecutar el archivo completo como postgres, una sola vez, después de 15.4A/05. Resultado esperado: `SAFE_DRAFTS_READY…`.
3. Abrir `supabase/sql-editor/06_verify_safe_initial_drafts.sql`, confirmar el destino de la misma manera y ejecutar completo. Resultado esperado: `PASS 06… fixtures rolled back`. Si falla, detenerse y conservar el error; no quitar validaciones para lograr PASS. El script rechaza colisiones de fixtures y triggers Auth/profile no revisados. No elimina esquemas ni usuarios existentes; todas sus fixtures desaparecen con ROLLBACK.
4. Iniciar `npm run dev:auth-tests` y abrir `http://127.0.0.1:5174`. Usar la configuración pública de pruebas ya existente, sin copiar claves aquí.
5. Con A, crear un torneo remoto vacío e invitar a B. Con cualquiera de las dos cuentas autorizadas, abrir Datos en nube y consultar snapshot. Elegir un JSON de borrador compatible o Vista previa del torneo local. Descargar respaldo, revisar roster/destino, marcar confirmación y confirmar la carga. Esperar revisión nueva e identificador de vinculación.
6. Con B en otro navegador/dispositivo, consultar el mismo torneo y descargar torneo JSON. Respaldar primero cualquier torneo de ese dispositivo y usar después el importador local existente. Abrir Registro/Bracket/VS/Standings como siempre; la nube no se conecta a sus escrituras. Distintos puertos/orígenes tienen localStorage distinto: usar un archivo exportado si 5174 no contiene el torneo de 5173.
7. Comprobar que segundo intento al mismo destino se bloquea; usuario ajeno y admin revocado no pueden leer/escribir. Probar dos clientes con la misma revisión: solo uno debe guardar; el otro debe recibir conflicto sin reemplazar datos.

## Validación y pendientes

Pruebas automatizadas locales: 148 tests; TypeScript mediante `tsc -b` (incluido en build), lint y build. Build conserva el aviso de tamaño de chunks existente. La prueba de navegador comprueba respaldo/confirmación, conflicto sin reintento, descarga JSON, lectura del coadministrador, revocación, móvil y localStorage sin cambios en un perfil aislado.

SQL revisado estáticamente; **no validado en PostgreSQL ejecutándose**: no se encontraron PostgreSQL/psql ni CLI Supabase locales. No se instaló Docker ni herramientas. Prueba 06 preparada para roles reales authenticated/anon, ajeno/player, owner/admin/revocado, datos inválidos, revisión antigua, no duplicación, legado v1, auditoría y rollback tras fallo tardío. Incluye fixtures literales de topología generadas desde TypeScript para contrastar el generador SQL. Simula un cliente desactualizado secuencialmente; la carrera real de dos sesiones sigue pendiente en stage-strike-tests. No presentar el SQL como aprobado hasta ejecutar 06 allí.

Pendiente: validador competitivo completo (progresión de ganadores/perdedores, scores/formatos, dependencias, historial, DQ, BYEs, reset y consistencia de completionOrder), catálogo de personajes, prioridades, tamaños mayores, actualizaciones de torneos ya cargados, reconciliación de cambios y apertura remota integrada. Hasta entonces los resultados avanzados permanecen locales. No Realtime, cambios del Top 32/VS/Stage Banning/Standings/Rulesets, cambios de exportadores existentes ni push.
