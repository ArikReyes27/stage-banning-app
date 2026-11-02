# Fase 15.2 — revisión de base de datos

## Continuación: proyecto stage-strike-tests

Ya existe un proyecto Supabase dedicado de pruebas. La ruta actual de validación
manual está en [sql-editor/README.md](sql-editor/README.md), con scripts separados
para aplicar la migración y probarla usando Auth/roles reales. No se han ejecutado
remotamente. Las instrucciones locales siguientes quedan como alternativa;
la falta de PostgreSQL local ya no impide ejecutar manualmente esa nueva ruta.
La aprobación del proyecto principal continúa pendiente.

## Dictamen

**Pendiente de validación ejecutable; no aplicar todavía al proyecto real.**
La revisión estática no detectó errores de sintaxis en el DDL. No equivale a
compilarlo con PostgreSQL. No hay PostgreSQL, psql, initdb, pg_ctl, Supabase CLI
ni Docker ejecutables en PATH. La carpeta `C:\Program Files\PostgreSQL\18`
existe, pero no contiene los ejecutables buscados. No se instaló software.
No se accedió a Supabase remoto ni a credenciales o datos del navegador.

## Siete tablas revisadas

| Tabla | Integridad y alcance |
| --- | --- |
| profiles | PK/FK a auth.users; borrado en cascada. Nombre opcional. |
| tournaments | Owner obligatorio y FK a profiles con RESTRICT; nombre no vacío. |
| tournament_participants | PK e índice de orden únicos por torneo; un mismo ID local puede existir en torneos diferentes. Perfil opcional, SET NULL al borrarlo; no concede permisos. |
| tournament_members | Una membresía por perfil/torneo, roles admin/player; owner se deriva exclusivamente de tournaments.owner_id. |
| tournament_brackets | Como máximo un estado por torneo; revisión no negativa; JSONB con forma básica. No exige que cada torneo tenga bracket: eso requiere creación atómica futura. |
| tournament_revisions | Revisión positiva única por torneo; delta objeto; actor puede quedar NULL tras borrado. Append-only es intención de la API futura, no protección ante el operador SQL. |
| result_reports | Propuesta separada del resultado oficial; FK de autor/revisor; pendiente sin revisión, aceptada/rechazada con revisor y fecha. Match y pertenencia del reportante requieren validación futura. |

Los hijos se eliminan con el torneo. Borrar un perfil propietario o autor/revisor
referenciado se bloquea con RESTRICT; antes de borrar cuentas habrá que resolver
transferencia y retención de historial. No se implementó esa política aquí.
Se permiten miembros no inscritos y participantes invitados sin cuenta.
El esquema permite que un owner tenga también fila admin/player: el resolver
debe priorizar owner; esa fila no otorga ni revoca ownership.

Las siete tablas tienen ENABLE y FORCE RLS, REVOKE de PUBLIC/anon/authenticated
y una política restrictiva false para estos roles. No hay RPC ni grants de
escritura para clientes. Por tanto ni owner, admin ni player pueden escribir
todavía desde la aplicación. Superusuarios y BYPASSRLS siguen siendo privilegiados;
RLS no protege contra un operador administrativo. No existen roles de aplicación
con privilegios efectivos por torneo hasta implementar y probar la API futura.

## Corrección

El CHECK comparaba `schemaVersion` con `->>`, aceptando indebidamente la cadena
JSON `"1"` o `"2"`. Ahora compara números JSONB. También exige arrays de
`structure` y `completionOrder` para v2 y valida su tipo cuando están presentes
en v1. El `IS TRUE` exterior rechaza campos requeridos ausentes o null.
Esto no valida contenido competitivo, catálogo, dependencias, semillas,
ganadores, reportes propios ni correspondencia entre roster y estado.
La API deberá reconstruir y validar el Tournament completo antes de escribir.

## Primer propietario: contrato de implementación

No habrá un «primer usuario que reclame un torneo». Para crear un torneo nuevo,
una operación futura debe exigir sesión verificada, obtener el actor mediante
`auth.uid()` (rechazar NULL), crear su perfil si falta y usar ese mismo UUID como
owner. Nunca aceptar owner_id/actor_id/roles desde el payload ni user_metadata.
Crear torneo, roster y bracket revisión 0 en una sola transacción; un fallo
revierte todo. La importación local será explícita y usará la misma operación.
Si se restringe quién puede crear torneos, comprobar una autorización administrada
en servidor; no otorgarla al primer visitante. Esto aún no está implementado.

Transferir propiedad requiere al owner actual, perfil destino válido y el mismo
bloqueo/revisión global que las demás mutaciones. Admin no puede nombrar admins,
transferir ownership ni elevarse. Player solo podrá proponer resultados de sus
partidos con vínculo de inscripción verificado. Una función SECURITY DEFINER
necesitará search_path fijo, objetos cualificados y EXECUTE revocado a PUBLIC,
con grants mínimos y validación explícita del actor.

## Resultados simultáneos

El esquema permite CAS, pero **no lo impone todavía**: revision por sí sola no
impide sobrescrituras privilegiadas. Toda mutación futura debe bloquear primero
la fila de tournaments con FOR UPDATE, resolver permisos después de adquirir el
bloqueo, comparar expected_revision, validar y actualizar bracket con comparación
de revisión. Debe incrementar una vez e insertar auditoría en la misma transacción.
Aceptar un reporte cambia también su estado dentro de esa transacción. Todos los
cambios de miembros, roster, owner y resultados deben usar el mismo bloqueo.
Dos envíos con revisión N: uno confirma N+1; el otro recibe conflicto y recarga,
sin sobrescribir ni reintentar automáticamente el snapshot. Revocar permisos en
paralelo también debe serializarse bajo ese bloqueo. No habilitar UPDATE directo.

## Pruebas añadidas y límites

`tests/phase15_2.sql` ejecuta la migración real en una base vacía de pruebas local,
con fixtures mínimos auth.users y roles API. Comprueba FKs, unicidad por torneo,
roles, ciclo de revisión de reportes, versiones JSON malformadas, ENABLE/FORCE,
denegación por ACL y, separadamente, RLS aun concediendo DML y una política
permisiva temporal. Comprueba las siete tablas con filas presentes. Las
alteraciones de prueba se revierten; el esquema inicial queda solo en esa base.
El archivo falla fuera de loopback o del nombre de base exigido.

**Estas pruebas no se ejecutaron** por falta de binarios. Tampoco se verificaron
Supabase Auth real, PostgREST, grants predeterminados del proyecto alojado, RLS
por roles futuros, bootstrap de owner ni carreras entre sesiones. Las dos últimas
requieren implementar la API antes de poder probar su comportamiento real.

## Pasos manuales siguientes

1. Autorizar/preparar PostgreSQL local (no es necesario Docker), preferiblemente
   versión compatible con el proyecto, con un cluster exclusivo de pruebas.
2. Crear una base vacía llamada `stage_strike_phase15_test` y ejecutar como su
   administrador local, sin usar variables ni credenciales de Supabase real:

   ```powershell
   psql -X -v ON_ERROR_STOP=1 -h 127.0.0.1 -U postgres -d stage_strike_phase15_test -f supabase/tests/phase15_2.sql
   ```

   Usar una base nueva para repetir: no ejecutar sobre una existente con datos.
   El usuario necesita crear roles y schema para los fixtures. El script no crea
   ni borra bases, ni cambia contraseñas ni instala herramientas.
3. Resolver cualquier fallo y probar después en un proyecto Supabase de pruebas
   autorizado para comprobar Auth/PostgREST y privilegios reales.
4. Solo entonces revisar y autorizar la aplicación del esquema bloqueado al
   proyecto real, comprobando antes que no existan esas siete tablas y preparando
   respaldo. Aplicarlo no habilitará lectura/escritura desde la aplicación.
5. Implementar en otra fase bootstrap, permisos y transacciones CAS; probar
   aislamiento, elevación de roles, concurrencia y rollback antes de abrir accesos.
   Login, Realtime e importación de datos locales siguen pendientes y separados.

Referencias: [RLS PostgreSQL](https://www.postgresql.org/docs/17/ddl-rowsecurity.html),
[RLS Supabase](https://supabase.com/docs/guides/database/postgres/row-level-security),
[funciones](https://supabase.com/docs/guides/database/functions).
