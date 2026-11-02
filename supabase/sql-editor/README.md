# Ejecución manual — solo stage-strike-tests

Fase 15.4A: revisar la [migración de seguridad](../migrations/20261031000000_tournament_security.sql),
después `05_verify_tournament_security.sql` y las
[pruebas de concurrencia](../tests/phase15_4a_concurrency.md). Instrucciones y
límites en [PROMPT_FASE_15_4A](../../src/PROMPT_FASE_15_4A.md). No ejecutados aún.

Fase 15.3: después de completar 01/02, revisar los scripts **03/04** siguiendo
[la guía de Auth](../PHASE15_3.md). 02 corresponde al bloqueo inicial de perfiles;
después de 03, usar 04 para validar la excepción de acceso al perfil propio.

Scripts preparados y revisados estáticamente; **todavía no ejecutados**.
No usar el proyecto principal ni cambiar `.env.local`. No requieren claves,
tokens, extensiones, psql, instalación local, login ni Realtime.

## 1. Aplicar esquema una sola vez

En Supabase Dashboard selecciona **stage-strike-tests**. Verifica tanto el nombre
como su referencia de proyecto en la URL del Dashboard; no basta con el nombre
de la base (`postgres` también existe en otros proyectos).

Abre `01_apply_test_schema.sql`, copia **todo** a una consulta nueva del SQL Editor,
con rol **postgres**. Tras verificar el proyecto, cambia el literal
`'CONFIRM_TEST_PROJECT'` por `'stage-strike-tests'` y ejecuta todo, sin selección parcial.
La confirmación es manual: el script no puede autenticar el nombre del proyecto.

Resultado esperado:

```text
SCHEMA_APPLIED: 7 tables, client access locked
```

El script incorpora exactamente el DDL de la migración versionada, precedido
de comprobaciones. Usa los roles y `auth.users` de Supabase, no los recrea.
Si cualquiera de las siete tablas ya existe, aborta sin reemplazarla.
Si ya aplicaste esta migración con éxito, omite este paso; no borres tablas
para volver a ejecutarlo. El esquema queda persistido, vacío y bloqueado.

## 2. Ejecutar pruebas

Abre `02_verify_test_schema.sql`, copia **todo** a otra consulta del SQL Editor,
en el mismo proyecto y rol. Repite la confirmación del literal y ejecuta todo.
**Conserva el ROLLBACK final; nunca lo cambies por COMMIT.**

Resultado esperado, sin ningún error:

```text
PASS: constraints + ACL + RLS (7 tables, anon and 4 authenticated identities); fixtures rolled back
```

La prueba exige las siete tablas vacías, usa cuatro UUID de fixtures reservados
y aborta si ya existen en Auth. Nunca actualiza ni elimina usuarios existentes.
Inserta temporalmente solo IDs en `auth.users`: prueba FKs y `auth.uid()`, no
creación de cuentas mediante GoTrue, identidades, contraseñas o sesiones reales.
También aborta ante triggers de usuario habilitados en Auth/tablas de aplicación,
para revisarlos antes de que puedan producir efectos adicionales.

Los datos, funciones temporales, permisos y políticas de prueba se revierten.
La prueba toma bloqueos breves sobre las siete tablas y tiene timeout; es para
el proyecto dedicado de pruebas. No elimina esquemas, tablas ni roles.
El SQL Editor puede advertir sobre UPDATE/DELETE/ALTER: pertenecen a estas pruebas
transaccionales. Revisa el archivo completo y el proyecto seleccionado antes de ejecutar.

## Qué demuestra un PASS

- Las relaciones y restricciones probadas rechazan datos inválidos con los
  SQLSTATE previstos (23503, 23505, 23514).
- `anon` y `authenticated` tienen privilegios revocados; DML falla con 42501.
- Se usa `SET LOCAL ROLE`, se comprueba `current_user`, se fijan claims sintéticos
  y se comprueba `auth.uid()`. Los helpers son SECURITY INVOKER, no DEFINER.
- Se simulan owner, admin, player y ajeno. En esta fase **todos están bloqueados**.
- Separadamente, con grants y política permisiva solo dentro de la transacción,
  RLS sigue ocultando filas y bloqueando escrituras en las siete tablas.
- Un control positivo cambia temporalmente la política restrictiva y exige ver
  los fixtures: no se confunde «tabla vacía» con «RLS funciona».

No demuestra aún permisos operativos por torneo, bootstrap del owner, CAS,
concurrencia, login ni acceso HTTP/PostgREST. Esas funciones no están implementadas.
No autoriza aplicar el esquema al proyecto principal.

## Si aparece un error

No continúes al siguiente paso ni interpretes mensajes previos como éxito.
Conserva el error y SQLSTATE para revisarlos; no envíes claves ni tokens.
Si la sesión queda en transacción abortada, ejecuta únicamente `ROLLBACK;` en
esa sesión antes de reintentar. No uses DROP, CASCADE ni desactives los guardas
para forzar el paso. Las pruebas son repetibles tras revertir; la migración no.

`../tests/phase15_2.sql` sigue siendo exclusivamente para **psql local**;
no pegarlo en el SQL Editor (contiene metacomandos y fixtures de esquema Auth).

Referencias oficiales consultadas:
[pruebas de roles y claims](https://supabase.com/docs/guides/local-development/testing/overview),
[SET ROLE](https://www.postgresql.org/docs/18/sql-set-role.html).
