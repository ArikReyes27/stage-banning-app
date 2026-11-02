# STAGE//STRIKE — Fase 14.1

## Alcance

Editor rápido con iconos del motor VS, correcciones seguras, historial plegable y récord de sets derivado en Top 8/PNG. Conservar Top 32, podio, recursos, persistencia y reglas.

## Revisión inicial

Se revisaron Git, Fase 14, editor, historial, DQ, acciones VS, resolución del bracket y Standings. No hay AGENTS.md en el proyecto. Existen cambios previos sin commit; se conservan. El panel anterior usaba `protectedHistory` para reemplazar los controles por consulta cuando existía `details` o DQ. Era una protección contra guardar un marcador sin historial, no una diferencia competitiva entre W15, L14 y Reset.

## Decisiones

- Reutilizar `proposeMatchAction` y `victoryIcons`. No duplicar el motor de puntuación.
- Ediciones de sets sin confirmar guardan cada acción, como VS. Guardar progreso permite guardar/cerrar sin avanzar. Confirmar ganador valida el final y solicita confirmación.
- Sets confirmados empiezan en consulta. Corregir encuentro habilita un borrador local; solo se aplica al guardar/confirmar. Comparar el resultado final con el original permite conservar dependencias si continúa el mismo ganador. Advertir antes de invalidar cuando cambie o desaparezca el ganador.
- Historial plegable, registros retirados conservados. No añadir escenarios, bans o rulesets al panel.
- Récord: sets confirmados vigentes con dos jugadores, excluyendo DQ y BYEs. GF y Reset cuentan separadamente. Aceptar resultados históricos manuales confirmados, sin fabricar detalle por juego.
- Fondos temáticos pendientes; no agregar imágenes ni arquitectura anticipada.

## Respaldo

`stage-banning-before-phase14-1-20261022-005308.zip`, en la raíz del proyecto. Excluye `.git`, node_modules, dist, perfiles de prueba, logs y respaldos ZIP anteriores. No se modificó el almacenamiento del usuario ni se hizo push.

## Implementación

`VictoryIcons` es compartido por VS y panel. BO3 muestra dos iconos por jugador; BO5, tres. Un icono apagado añade exactamente una victoria aunque se pulse el último; uno encendido retira ese y los posteriores de ese jugador. No cambia los juegos del rival. Los botones tienen nombre accesible, estado `aria-pressed`, foco visible, tamaño de 46 px y transición desactivada con reduced motion.

La selección principal sigue usando `CharacterPicker`/`CharacterSearch`; no comparte eventos con las victorias. Conserva búsqueda, teclado, variantes y sugerencias. Ninguna selección cuenta como juego hasta registrar una victoria.

Los encuentros no confirmados persisten cada operación, como VS; Guardar progreso guarda y cierra sin confirmar al ganador. El progreso sobrevive a cerrar, recargar y abrir VS. No existe un segundo marcador persistente.

En encuentros confirmados los iconos son de consulta. Corregir encuentro abre una copia local del resultado. El borrador aplica las mismas acciones competitivas, pero no persiste sus invalidaciones intermedias. `proposeQuickCommit` compara el resultado final con el torneo vigente: si sigue existiendo el mismo ganador, conserva confirmación y dependencias; si cambia o deja de existir, utiliza `proposeResult` y muestra los encuentros que se invalidarán antes de guardar. Cancelar la confirmación no modifica el torneo. Cerrar con corrección pendiente pide descartarla. Los cambios de otra pestaña bloquean la escritura del borrador obsoleto hasta descartarlo.

DQ/reversión mantienen las operaciones y advertencias existentes. Es necesario guardar o descartar una corrección pendiente antes de aplicar DQ. En un set finalizado primero se entra explícitamente en modo corrección.

El historial usa `<details>/<summary>` con registros activos/retirados y scroll interno. Retirar victorias conserva las instantáneas con `voided`; estas dejan de sumar marcador y personajes usados. Nuevos juegos usan la configuración actual del motor, incluido un escenario previamente preparado en VS si lo había. Sin escenario preparado quedan como «Escenario no registrado». No se inventan escenarios ni se agrega su selector al panel. Los marcadores antiguos siguen siendo `legacyScores`: no se reconstruyen juegos, personajes o escenarios inexistentes.

## Récord y presentación

`tournamentStandings` deriva `setWins`/`setLosses` en cada lectura. Cuenta una victoria y una derrota por set confirmado vigente, con ganador/perdedor resueltos y dos participantes. Excluye BYEs, DQ (incluso si hubo juegos antes del DQ), resultados provisionales y encuentros invalidados. La clasificación competitiva sigue contando DQ para avanzar/eliminar: el récord de sets disputados es una medida distinta. GF y Reset aportan un set cada uno si fueron confirmados sin DQ. Los resultados manuales históricos confirmados sí cuentan como sets, sin deducir sus juegos individuales.

El Top 8 conserva tarjetas, podio 2–1–3, renders, insignias, colores y empates oficiales. Añade `SETS G-P` y aumenta moderadamente los números (#1: 82, #2/#3: 74, resto: 50 unidades SVG). Mantiene 1600 × 1140 para ocho participantes. El SVG común asegura que el PNG contiene el récord y las decoraciones; el detalle móvil también incluye el récord. CSV mantiene su formato anterior y todos los participantes.

## Archivos creados/modificados

Creados:
- `src/utils/quickMatchEditor.ts`
- `src/components/tournament/VictoryIcons.tsx`
- `tests/quick-editor.test.mjs`
- `tests/browser-phase14-1.mjs`
- `src/PROMPT_FASE_14_1.md`
- Evidencias en `docs/phase14-1/`

Modificados:
- `src/components/tournament/MatchEditor.tsx`
- `src/components/tournament/VersusPresentation.tsx`
- `src/components/tournament/TopEightPoster.tsx`
- `src/pages/TournamentAdminPage.tsx`
- `src/pages/StandingsPage.tsx`
- `src/utils/tournamentStandings.ts`
- `src/styles/tournament.css`
- `src/styles/standings.css`
- `tests/browser-phase14.mjs` (actualizar expectativas del antiguo selector numérico, retirado por esta fase)

## Verificación

- Suite completa anterior: 121 pruebas aprobadas antes de añadir nuevas pruebas.
- Pruebas nuevas: BO3/BO5, iconos sin huecos, máximo de victorias, persistencia, escenarios y personajes inmutables, registros retirados, borrador aislado, mismo/cambio de ganador y dependencias, marcadores legacy, récords 8/16/32/64/128, BYEs/DQ, GF/Reset, empates y CSV.
- Navegador Chrome con perfil temporal: selección/búsqueda/teclado y colores Sonic, panel→VS→panel, guardado parcial, consulta de confirmados, correcciones y cancelación de invalidaciones, reproducción explícita de W15 con historial retirado, escritorio/móvil, PNG real 1600 × 1140 con ocho récords, nombres largos, CSV completo, presentación de lectura y paginación de 128.
- El primer Chrome restringido no pudo iniciar su proceso GPU; se repitió fuera del sandbox con autorización. Ese fallo fue del entorno, no del código.
- Inspección visual de W15 escritorio/móvil y PNG exportado: nombres, números, insignias y récord sin superposición. El editor móvil conserva scroll vertical.
- Resultado final: `npm.cmd test` — **131/131 aprobadas**; `npx.cmd tsc -b`, `npm.cmd run lint` y `npm.cmd run build` — correctos. Build conserva el aviso de chunks mayores de 500 kB, sin errores.
- `node tests/browser-phase14-1.mjs` — aprobado. Incluye activación de victorias con Space y bloqueo/descarte de una corrección obsoleta tras un evento de almacenamiento de otra vista.

## Evidencia visual

- [W15 con edición rápida e historial retirado](../docs/phase14-1/w15-quick-desktop.png)
- [W15 móvil](../docs/phase14-1/w15-quick-mobile.png)
- [Consulta de un set confirmado](../docs/phase14-1/quick-confirmed-desktop.png)
- [Historial con victorias retiradas](../docs/phase14-1/quick-retired-history.png)
- [PNG exportado con récords](../docs/phase14-1/top8-export.png)
- [Top 8 móvil](../docs/phase14-1/top8-mobile.png)
- [PNG con nickname largo](../docs/phase14-1/top8-long-name.png)

Se abrió el ZIP y se comprobó que contiene el editor previo con `protectedHistory`, anterior a los cambios de esta fase.

## Ajuste visual posterior solicitado

El récord `SETS` queda visible únicamente en posiciones oficiales 1–3, tanto en SVG/PNG como en el detalle móvil. Top 4–8 conserva nickname, personaje principal e iconos sin récord ni texto de relleno. Se aumentan sus números de 50 a 56 unidades SVG y los renders de 215 × 230 a 228 × 244; se redistribuyen márgenes del bloque inferior sin cambiar altura de tarjetas. El podio conserva exactamente su composición y sus récords. El cálculo competitivo y CSV no cambian. La verificación de navegador ahora espera tres récords en el PNG final.

Evidencia actualizada: [PNG ajustado](../docs/phase14-1/top8-refined.png) y [vista móvil](../docs/phase14-1/top8-refined-mobile.png). Verificación de navegador aprobada, incluida exportación PNG/CSV. Un primer recorrido falló al accionar la paginación; la repetición completa pasó.

## Limitaciones

- La edición rápida corrige victorias; para corregir metadatos específicos de un juego histórico (personajes/escenario) se conserva el editor detallado del VS. El historial rápido permanece consultable.
- La reducción de victorias legacy corrige el agregado: el sistema anterior nunca almacenó los juegos individuales y no se fabrican registros retrospectivos.
- Las correcciones confirmadas son borradores de memoria hasta guardar; se advierte al cerrar el panel, pero recargar directamente el navegador descarta ese borrador y conserva el resultado guardado.
- localStorage sigue sin transacciones multiusuario. Se detectan cambios del mismo encuentro mientras se corrige; no se implementó sincronización de servidor.
- Fondos temáticos continúan pendientes de imágenes proporcionadas por el usuario. Sin Supabase, autenticación, roles ni recursos nuevos.
