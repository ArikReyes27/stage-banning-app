# STAGE//STRIKE — Fase 15.5C

## Estado y continuidad

Se retomaron los archivos existentes después de la interrupción, sin revertir ni reconstruir las fases anteriores. Git conserva cambios históricos y muchos archivos todavía sin seguimiento; no se realizó commit ni push. Respaldo previo: `stage-banning-before-phase15-5c-20261102-001251.zip` (código, recursos, SQL y pruebas; excluye credenciales, dependencias y datos del navegador).

La regresión existente de 15.5B verifica dos espacios con 16/32 participantes, brackets, historial y DQ independientes. Se conserva el almacenamiento por proyecto/cuenta/UUID de torneo. Los nombres no se usan como claves ni como identidad de usuario.

## Interfaz preparada

En auth-tests, cada tarjeta de Mis torneos tiene un menú **⋯**: renombrar, archivar/restaurar y eliminar. Los filtros **Activos / Archivados / Todos** solo cambian la lista visible. Un archivado conserva datos, membresías, invitaciones y acceso; no equivale a borrar ni congela las operaciones existentes.

Los coadministradores ven las acciones deshabilitadas. El propietario abre un diálogo que obtiene una revisión actual mediante `ss_tournament_lifecycle_review`, contrato versión 15503. No se utiliza la RPC antigua de renombrado sin esa comprobación. Si falta la nueva columna, el listado usa el esquema anterior y deja las acciones bloqueadas. Si falta la RPC nueva, se muestra un error sin usar escrituras directas o alternativas inseguras.

Renombrar muestra el nombre actual y valida 1–200 caracteres, sin nombre vacío. El UUID permanece igual: sus participantes, bracket y resultados locales no cambian. Archivar/restaurar requiere confirmar el cambio. Todas las mutaciones utilizan la revisión capturada y un solo intento; ante conflicto o respuesta ambigua se pide actualizar la lista.

Eliminar exige descargar un respaldo, confirmar que se guardó y escribir exactamente el nombre actual, incluyendo mayúsculas y espacios. La advertencia distingue la eliminación remota permanente de las copias locales conservadas y explica que el snapshot remoto puede estar vacío o ser solo un borrador sin las partidas locales. Si cambia el espacio local después del respaldo, no se envía la eliminación.

El JSON descargado (`stage-strike-deletion-backup-v1`) contiene el snapshot remoto y `localWorkspaceRaw` de esa cuenta/dispositivo. **No es un respaldo completo de permisos, auditoría, invitaciones o datos en otros dispositivos**, ni se importa directamente como un Tournament normal. Antes de eliminar, se recomienda además exportar el JSON normal desde Bracket y el registro desde Registro si se quiere una recuperación sencilla con los importadores existentes. Se guarda otro recibo local `<workspaceKey>:before-delete:<timestamp>` antes de solicitar la eliminación. Si falla esa escritura, la eliminación no se solicita.

No se elimina ninguna clave local, ni siquiera la del evento eliminado. La copia queda conservada pero, al desaparecer el remoto, ya no se abre por Mis torneos porque la cuenta no puede demostrar acceso a ese UUID. Su recuperación requiere el respaldo/exportación; no se reasigna automáticamente a otro remoto. Otros eventos, datos globales anteriores, sesiones y rulesets permanecen intactos.

## SQL pendiente de aplicación manual

1. Revisar `supabase/migrations/20261102000000_tournament_lifecycle.sql`.
2. Confirmar visualmente en Dashboard que el proyecto es **stage-strike-tests**, nunca el principal. En la copia del SQL Editor sustituir `CONFIRM_TEST_PROJECT` por `stage-strike-tests`; ejecutar el archivo completo como postgres, una sola vez, después de 15.5A. El texto de confirmación no detecta automáticamente el destino.
3. Resultado esperado: `LIFECYCLE_READY…`.
4. Revisar y ejecutar completo `supabase/sql-editor/07_verify_tournament_lifecycle.sql` con la misma confirmación. Resultado esperado: `PASS 07… fixtures rolled back`.
5. Si cualquiera falla, detenerse y revisar el error. No retirar protecciones, no ejecutar partes sueltas ni repetir una migración ya confirmada como aplicada.

La migración agrega `tournaments.archived_at`. Sustituye `ss_rename_tournament` para exigir propietario bajo el bloqueo compartido de 15.4A. **La RPC antigua permitía renombrar a un admin; esa restricción de servidor no cambia hasta aplicar esta migración.** La interfaz nueva no habilita estas acciones antes del nuevo contrato.

`ss_set_tournament_archived` cambia solo el estado de archivo, revisión y auditoría en una transacción. `ss_delete_tournament` valida Auth confirmado, propietario, nombre exacto y revisión. Borra únicamente el UUID recibido y sus seis tablas hijas por FK `ON DELETE CASCADE`: participantes, miembros, bracket, revisiones, reportes e invitaciones. No elimina perfiles ni usuarios Auth. La auditoría del propio torneo también desaparece; archivar es la alternativa para conservarla.

La eliminación falla con `0A000` si el esquema ya no coincide con el grafo revisado de seis FK, existen dependencias adicionales, triggers no revisados, triggers internos desactivados, reglas, herencia/particiones o modo de replicación no previsto. No intenta modificar esos objetos para poder borrar. No se amplían las políticas RLS ni los grants DML. El validador competitivo permanece cerrado; no hay escrituras arbitrarias de JSONB ni Realtime.

La prueba 07 usa fixtures con UUID exclusivos, roles reales `authenticated` y `anon`, y ROLLBACK. Cubre owner/admin/player/ajeno, validaciones, revisión antigua, nombre exacto, archivo/restauración, bloqueo por trigger, cascadas y conservación de otro evento y cuentas. El trigger de prueba se crea dentro de la transacción y solo se retira ese mismo objeto nuevo. La prueba 05 se ajustó para simular CAS con dos pestañas del propietario: ya no exige el comportamiento antiguo de renombrado por admin.

## Validación y próximos pasos

- Tests locales: 156, incluyendo aislamiento 16/32 y contratos de lifecycle.
- TypeScript: `tsc -b` incluido en build. Lint y build; permanece el aviso de chunks grandes.
- `tests/browser-phase15-5c.mjs` reutiliza el flujo aislado 15.5B y agrega renombrado, filtros, archivo/restauración, conflicto, cancelación, respaldo y eliminación simulada sin alterar los datos locales u otro evento. Toda petición Supabase es interceptada: no usa cuentas ni datos reales.
- SQL revisado estáticamente; no ejecutado ni compilado en PostgreSQL. No hay psql/PostgreSQL/CLI Supabase disponibles localmente y no se instalaron herramientas. La prueba 07 y una carrera real entre sesiones quedan pendientes en stage-strike-tests.

Después de revisar/aplicar SQL y obtener PASS 07, iniciar `npm run dev:auth-tests`. Crear un **torneo nuevo desechable**, sin borrar los cuatro eventos existentes. Probar renombrado con datos locales, archivar y restaurar desde los filtros, revisar que el admin tenga las acciones bloqueadas, cancelar una eliminación y verificar que un nombre incorrecto no la permite. Solo en ese evento desechable, guardar el respaldo y probar la confirmación exacta. Comprobar otro torneo y el almacenamiento histórico antes/después. En el proyecto principal no hay nada que ejecutar.

No se aplicó SQL remoto, no se borraron eventos existentes y no se modificó `.env.local` ni la configuración de stage-strike-tests. Las pruebas reales de Supabase requieren la aplicación manual revisada de estos scripts.
