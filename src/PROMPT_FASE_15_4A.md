# STAGE//STRIKE — Fase 15.4A

## Entrega y límites

Preparación SQL versionada, sin ejecución remota ni conexión de pantallas a RPCs.
El usuario informó que Auth real y SQL 01–04 pasaron en stage-strike-tests.
La única modificación funcional de la aplicación es mostrar/ocultar contraseña.
No se modificaron `.env.local`, configuración de pruebas, módulos competitivos,
exportaciones, resultados ni almacenamiento local. No hubo push.

## Archivos que revisar y orden manual

1. `supabase/migrations/20261031000000_tournament_security.sql`: copiar completo
   al SQL Editor **solo stage-strike-tests**, rol postgres. Verificar nombre y
   referencia en Dashboard antes de sustituir `CONFIRM_TEST_PROJECT` por
   `stage-strike-tests`. El texto es una confirmación humana, no detección del host.
   Ejecutar una sola vez, después de 03/04. Esperado: `SECURITY_PREPARED...`.
2. `supabase/sql-editor/05_verify_tournament_security.sql`: misma confirmación,
   ejecutar completo conservando ROLLBACK. Esperado: `PASS: owners, admins...`.
   Crea usuarios y torneos de prueba aislados, rechaza colisiones/triggers Auth
   personalizados y revierte fixtures. No utiliza cuentas existentes.
3. `supabase/tests/phase15_4a_concurrency.md`: procedimiento separado de dos
   sesiones, con setup confirmado y cleanup dirigido de sus propios fixtures.
   Es la comprobación pendiente de bloqueo real, además del conflicto secuencial.

No volver a ejecutar los tests 02/04 como si el esquema siguiera bloqueando todas
las lecturas: esta fase habilita lecturas privadas de cinco tablas de torneos.
Ante error, detenerse y revisar; no borrar objetos para forzar la migración.
No aplicar nada al proyecto principal.

## Seguridad preparada

- `ss_create_tournament(name)` no recibe owner ni JSONB: obtiene `auth.uid()`,
  comprueba cuenta verificada/no anónima/no bloqueada/no borrada y crea metadatos,
  estado draft vacío y primera auditoría atómicamente. Si falta perfil crea uno
  propio con nickname neutro `Jugador`. Un usuario puede crear varios torneos.
  El draft inicial es un contenedor remoto: todavía no es un Tournament exportable
  al modelo local (faltan participantes/estructura canónica). No se importa al juego.
- Owner vive exclusivamente en `tournaments.owner_id`. No existe RPC para cambiarlo
  ni INSERT/UPDATE directo para clientes. Metadata, nickname, email o parámetros
  de interfaz no conceden autoridad. No se implementó transferencia de propiedad.
- `ss_tournament_role(id)` obtiene la identidad de Auth y prioriza owner, luego
  admin/player. Es SECURITY DEFINER para evitar recursión RLS; no recibe actor.
- Cinco tablas permiten SELECT solo a owner/admin/player del torneo mediante RLS
  restrictivo y permisivo: tournaments, participants, members, brackets, revisions.
  Anon y ajenos no acceden. No hay lecturas públicas. `result_reports` sigue totalmente
  bloqueada. Los clientes no reciben privilegios DML en ninguna tabla de torneos.
- Todas las funciones privilegiadas fijan search_path vacío y cualifican objetos.
  Se revocan EXECUTE por defecto de PUBLIC/anon/authenticated/service_role y se
  concede a authenticated solo la lista pública de RPCs. Los helpers están en
  `ss_private`, sin USAGE ni EXECUTE para clientes; no agregar ese schema a la API.
  El propietario SQL postgres tiene BYPASSRLS y cada RPC revalida permisos.
  Como siempre, un operador privilegiado puede eludir controles; no hay promesa
  de seguridad frente al administrador SQL del proyecto.

## Invitaciones a cuentas, no enlaces de acceso

`ss_invite_admin(tournament, expected_revision, invitee_uuid)` es exclusiva del
owner; requiere otra cuenta verificada con perfil y no confía en metadata.
No se implementó búsqueda por correo ni directorio público: la futura interfaz
debe resolver la cuenta de destino de manera consentida y no enumerar usuarios.

La invitación persiste en una nueva tabla, ligada a UUID de cuenta y torneo,
caduca en siete días y admite una sola pendiente por destinatario/torneo.
Solo el owner y destinatario pueden leerla. No otorga acceso al torneo mientras
esté pendiente; conocer su UUID/enlace no permite aceptarla como otra cuenta.

`ss_invitation_revision(invitation)` da al destinatario la revisión actual sin
abrir el bracket. `ss_accept_admin_invitation(invitation, expected_revision)`
verifica sujeto, estado pendiente, expiración e invitador propietario; acepta y
asigna admin en la misma transacción auditada. Reutilización, otra cuenta,
revocación o expiración se rechazan. La aceptación de un player lo promueve a admin.

`ss_revoke_admin(tournament, expected_revision, profile_uuid)` solo para owner:
elimina la membresía admin y cancela invitaciones pendientes del mismo destinatario.
No elimina una membresía player. Si el admin era competidor, su inscripción no se
borra; tras revocación no se restaura automáticamente el rol player. La política
futura de reinscripción puede resolverlo explícitamente. Owner no puede revocarse.
Admin no invita ni revoca a otros admins, player no edita ni se autoasigna roles.

## Transacciones y resultados competitivos

Todas las mutaciones implementadas bloquean primero la fila del torneo con
FOR UPDATE; después verifican permisos. Actualizan la revisión global mediante
comparación con expected_revision y escriben auditoría en la misma transacción.
La creación queda en revisión 1 con evento inicial. Invitaciones, aceptación,
revocación y cambios de nombre consumen revisiones. Un conflicto produce **40001**
y revierte el cambio completo. No reintentar automáticamente con el mismo snapshot.
Otros rechazos: 42501 permiso/identidad, 22023 argumento, 23505 invitación duplicada.

`ss_rename_tournament` permite al owner/admin editar el nombre, como operación
administrativa acotada y caso real de CAS. No se conectó a la interfaz.
La auditoría guarda actor del servidor, revisión y cambio; no hay UPDATE/DELETE
de auditoría para clientes. Los registros se eliminan si el operador borra el torneo
por la FK original: no es un archivo inmutable frente al operador SQL.

**No se habilita aún escritura de resultados ni snapshots arbitrarios.** El CHECK
JSONB existente no valida partidas habilitadas, dependencias, ganadores, DQ,
semillas, personajes, ni equivalencia v1/v2. Confiar en el validador del frontend
abriría un bypass. Se preparó `ss_private.commit_bracket`: bloqueo, autorización,
validación, CAS y auditoría atómicos; pero su validador servidor falla siempre con
**0A000** y el helper no tiene grants para clientes. Es una barrera intencional,
no una implementación de edición competitiva completa. Debe reemplazarse por
validación completa en servidor antes de exponer cualquier RPC de resultados.
El delta competitivo previsto usa before/after completo; decidir límites/coste
y deltas por partido junto con ese validador antes de habilitarlo.

Esto permite preparar la interfaz de creación/invitaciones tras aprobar SQL;
no permite todavía sincronizar los resultados del bracket local.

## Validación y pendientes

SQL revisado estáticamente, no ejecutado: no hay psql/PostgreSQL/Supabase CLI/Docker
utilizables localmente. No se instalaron herramientas. Test 05 prueba owner/ajeno,
múltiples torneos, admin/owner/player, metadata falsa, autoasignación, invitaciones
ajenas/reutilizadas/expiradas/canceladas, revocación, campos nulos, CAS obsoleto,
rollback de cambios/auditoría y denegación a anon. Cambia realmente SET LOCAL ROLE
y claims; las operaciones no se prueban solo como administrador SQL. La prueba
del helper deshabilitado sí usa postgres deliberadamente y exige 0A000.

Pendiente en stage-strike-tests: compilación del SQL, tests 05, carreras reales
del documento de concurrencia, permisos RPC vía PostgREST con cuentas reales.
No afirmar que pasaron hasta ver su resultado. El test no crea login ni UI de
invitaciones, enlaces, QR, Realtime, reportes player o migración de torneos.

## Mostrar contraseña

Botón de ojo nativo type=button con nombre accesible, aria-pressed y relación al
input. Contraseña oculta inicialmente y al cambiar de modo; clic/Enter alternan
el tipo sin cambiar el valor. Área táctil de 48 px. No cambia llamadas de Auth.
Prueba Chrome aislada ampliada para ambos formularios y móvil, sin cuentas reales.

Resultado local: **136/136 pruebas**, TypeScript (`tsc -b` dentro de build), lint y
build aprobados. Chrome aprobó ocultación inicial, mostrar por Enter, ocultar por
clic, conservación del texto en registro/login y área táctil móvil. Auth y rutas
locales siguieron pasando con respuestas simuladas. SQL permanece sin ejecutar.

Referencias oficiales: [funciones Supabase](https://supabase.com/docs/guides/database/functions),
[RLS](https://supabase.com/docs/guides/database/postgres/row-level-security),
[bloqueos PostgreSQL](https://www.postgresql.org/docs/17/explicit-locking.html).
