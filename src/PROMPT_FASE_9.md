# STAGE BANNING — FASE 9

## Mejoras del VS, marcador interactivo, gestión de partidas y DQ

Proyecto: `C:\Users\Arik\Desktop\Proyectos\stage-banning-app`.

Objetivo: perfeccionar la administración presencial sobre el motor de Fase 8, sin reconstruir el bracket ni cambiar la composición VS aprobada.

## Preparación y respaldo

Se revisaron componentes de torneo/VS, modelos, resultados, progresión, persistencia, validación, rutas y pruebas existentes. Respaldo previo: `stage-banning-before-phase9-20261017-132855.zip` (46,987,770 bytes), incluyendo cambios locales sin commit; excluye `.git`, `node_modules`, `dist` y ZIP anteriores. No hacer push.

## Tareas

1. Iconos de victoria interactivos en administración BO3/BO5, derivados del mismo resultado y con guardado automático.
2. Eliminar el requisito de Start Match/Reanudar por cada victoria; mantener apertura y visibilidad sin efectos sobre datos.
3. Acceso Abrir VS en el editor y tarjetas de todas las rondas, con bloqueo de edición para encuentros incompletos.
4. DQ manual por encuentro, selección de un único participante, motivo opcional y confirmación, sin marcadores ficticios.
5. Reversión explícita de DQ con confirmación de resultados dependientes afectados.
6. Estados textuales y visuales claros, acceso a uno o varios encuentros activos e historial legible por jugador.
7. Validación y persistencia compatibles con JSON anteriores; pruebas de doble eliminación, GF/RESET y correcciones.

## Decisiones

- El resultado especial se representa con `outcome: { type: 'dq', loser, recordedAt, reason? }`; `scores` conserva las victorias reales. El DQ está confirmado y `winnerSlot` resuelve al rival sin fabricar juegos.
- La reversión retira el DQ y deja el marcador real sin confirmar. Los descendientes se invalidan mediante el motor existente; no se restauran automáticamente resultados descartados.
- Un clic en cualquier icono pendiente suma exactamente una victoria, sin llenar saltos. En uno iluminado reduce a la cantidad de iconos anteriores (primer icono → 0, segundo → 1, tercero → 2), con confirmación.
- Las victorias detalladas retiradas se conservan con `voided: true`, no suman y pueden consultarse. Los datos históricos que nunca se guardaron no se reconstruyen.
- Abrir VS es una lectura; registrar una victoria marca el encuentro en curso, conserva su primera fecha de inicio y no exige reanudar cada juego.
- Las pantallas finalizadas abren en consulta; las correcciones normales requieren activar el modo de corrección. El DQ se revierte mediante su acción explícita.
- No hay cronómetro en el modelo del enfrentamiento de Fase 8, solo `startedAt`; se conserva. El cronómetro del flujo independiente de Stage Banning no se modifica.

## Restricciones

No modificar HomePage, rulesets, Stage Banning, tamaño de bracket, catálogo ni imágenes. No añadir skins, dependencias, Supabase, autenticación, servidor ni sincronización entre dispositivos. No borrar torneos guardados ni hacer push.

## Resultados y validación

Estado final: implementación completada y verificada automáticamente. Al retomar tras la interrupción se comprobó que los cambios de código ya estaban guardados; se conservaron y se completaron las verificaciones finales y esta documentación, sin repetir la implementación.

| Comprobación | Resultado |
| --- | --- |
| `npm.cmd test` | 59 pruebas aprobadas; 0 fallos |
| `npx.cmd tsc -b` | Correcto |
| `npm.cmd run lint` | Correcto |
| `npm.cmd run build` | Correcto |
| `git diff --check` | Sin errores de whitespace; avisos de normalización LF/CRLF de Git |

Vite emite una advertencia no bloqueante por un chunk JavaScript de 543.91 kB (143.06 kB gzip), superior al umbral de 500 kB. No se cambió el umbral para ocultarla. El build genera los artefactos habituales de `dist`.

La comparación SHA-256 de los archivos existentes contra el respaldo previo identifica exactamente los 15 archivos modificados enumerados abajo. No falta ningún archivo del respaldo. Los otros cambios que Git muestra en el directorio de trabajo son anteriores a esta fase. HomePage, rulesets, Stage Banning, rutas, almacenamiento base, recursos gráficos y manifiesto de personajes no se modificaron en Fase 9.

### Cobertura automatizada

- Iconos BO3/BO5: un clic pendiente suma solo una victoria, reducción por posición, límites y confirmación final.
- Historial de personajes/escenarios, registros retirados, mantenimiento de la primera fecha de inicio y victorias sin repetir Start Match.
- Lecturas repetidas de VS sin mutaciones, guardado/carga local y compatibilidad con JSON anteriores.
- DQ en Winners, Losers, ambos posibles DQ de Grand Final y ambos de Reset.
- Reversión con lista de dependencias, conservación de encuentros independientes y rechazo de DQ en encuentros incompletos o no habilitados.
- Rechazo de datos DQ inválidos, ambos participantes como perdedores y sobrescritura ordinaria de un DQ sin reversión explícita.
- Estados y descubrimiento de varios encuentros activos sin escoger uno arbitrariamente.
- Renderizado React de iconos administrativos, presentación sin acciones de edición, resultados finalizados en consulta, editores de todas las rondas, etiquetas W/L/DQ e historial por jugador.
- Se mantienen las pruebas anteriores del motor de doble eliminación, persistencia, importación/exportación y assets.

En la primera ejecución se corrigió una regla de lint sobre una expresión regular de caracteres de control. Se actualizaron las expectativas de cuatro pruebas de Fase 8 que exigían el paso Start Match o sus textos antiguos, y se añadieron pruebas del flujo nuevo. No quedan errores en la ejecución final.

## Uso del marcador y acceso al VS

1. Ejecutar `npm.cmd run dev` y abrir `/tournament`.
2. Pulsar **Abrir VS** bajo cualquier tarjeta o dentro de su editor. Las rutas siguen siendo `/tournament/match/<id>` y `/tournament/match/<id>/presentation`.
3. Si el editor agregado tiene cambios válidos sin guardar, Abrir VS los guarda mediante el motor existente; pide confirmación si se altera un resultado confirmado o sus dependencias. Si no se puede guardar o el resultado es inválido, no navega.
4. Con ambos participantes definidos y el torneo iniciado, los iconos administrativos están habilitados. No es necesario marcar el encuentro en curso antes de registrar una victoria.
5. Un clic en cualquier icono apagado suma **una** victoria. Los espacios se iluminan consecutivamente; no se crean varios juegos al pulsar un espacio posterior.
6. Un clic en un icono iluminado propone reducir hasta la cantidad de iconos que lo preceden: primero → 0, segundo → 1, tercero → 2. Se pide confirmación y se conservan los registros detallados retirados para consulta. Las victorias del rival no se eliminan.
7. Al alcanzar el objetivo aparece **Ganador provisional** y **Confirmar ganador** junto al VS, también en pantalla completa. El avance no se aplica hasta confirmar.
8. Los resultados finalizados abren en consulta. **Corregir resultado** habilita las acciones administrativas normales, manteniendo las confirmaciones pertinentes.

Los iconos siguen mostrando el personaje de cada victoria registrada. Las victorias agregadas de torneos antiguos no contienen ese dato; no se fabrican juegos ni escenarios para completarlas. Los espacios pendientes utilizan el personaje seleccionado para el juego actual.

**Marcar en curso** queda como acción opcional para señalar el primer inicio, no como requisito de edición. Pausar tampoco bloquea una corrección ni exige reanudar antes de registrar la siguiente victoria. Abrir/cerrar VS, ocultarlo o regresar al bracket no inicia ni reinicia el encuentro.

## Aplicar y revertir DQ

El editor y el VS administrativo incluyen **DQ / Descalificar**, diferenciado mediante estilo de peligro. Al desplegarlo:

1. Elegir el participante descalificado; no hay una selección inicial implícita.
2. Escribir opcionalmente un motivo de hasta 160 caracteres.
3. Pulsar **Confirmar DQ…** y aceptar la ventana de confirmación, que identifica al descalificado, al rival ganador y los resultados posteriores afectados, si existen.

Si el editor agregado tiene cambios sin guardar, primero solicita guardarlos para no perderlos al aplicar DQ. El DQ conserva las victorias y juegos realmente registrados, añade tipo especial, fecha/hora y motivo, y confirma al rival usando el motor habitual. No se asigna un resultado ficticio 2–0/3–0.

En Winners cuenta como derrota del encuentro y el jugador baja a Losers; en Losers queda eliminado. En GF, un DQ del finalista de Winners habilita Reset; un DQ del finalista de Losers termina el torneo. En Reset, gana el rival del descalificado. No se implementó DQ global ni automático.

**Revertir DQ** muestra qué resultados dependientes se invalidarán y solicita confirmación. Conserva el marcador real y sus juegos, retira el tipo DQ y deja el resultado sin confirmar. No restaura automáticamente resultados dependientes descartados ni añade victorias. Para cambiar el participante descalificado, primero se revierte y después se registra el DQ correcto.

## Estados, encuentro activo e historial

Las tarjetas mantienen su tamaño, iconos y conexiones. Sus etiquetas no dependen únicamente del color:

| Estado | Representación |
| --- | --- |
| Pendiente | Neutral; faltan participantes |
| Listo | Neutral; participantes definidos |
| En curso | Cyan |
| En pausa | Violeta |
| Ganador provisional | Cyan; pendiente de confirmar |
| Finalizado | Verde; resultado confirmado |
| Finalizado por DQ | Etiqueta DQ, W para el ganador y L/DQ para el descalificado |

En resultados por DQ, los números que permanezcan en la tarjeta son victorias reales anteriores, no el criterio que decidió el set. El VS identifica igualmente W y L/DQ.

**Continuar encuentro** abre el único encuentro activo. Si hay varios, **Ir al match activo** despliega todos para elegir explícitamente. También se incluyen los pausados y los que esperan confirmación final; los finalizados y los DQ quedan excluidos. La lista se deriva de resultados persistidos, sin guardar un segundo indicador de match activo.

**Historial del set** está disponible en el VS y en el editor de encuentros con detalle. Muestra estado, número del juego, escenario, nickname y personaje de cada participante y ganador. Los registros retirados aparecen separados visualmente con “Victoria retirada” y no suman. Los escenarios o detalles desconocidos se identifican como no registrados. Las correcciones detalladas se realizan desde VS.

## Persistencia y presentación

Se mantiene `schemaVersion: 1` como extensión aditiva opcional, la clave `stage-strike.top8.v1` y el mecanismo existente de localStorage/eventos storage. `copyResult` preserva los campos nuevos permitidos y la validación comprueba DQ, historial, registros retirados y coherencia de `scores`. Los archivos anteriores siguen siendo importables sin migración destructiva. No se tocaron datos del navegador del usuario durante las pruebas.

**Ocultar controles** retira también la interacción de los iconos. **Abrir presentación** usa una vista sin botones de victoria, edición o DQ. Pantalla completa y las animaciones existentes se conservan; los iconos administrativos son botones accesibles por teclado con foco visible. Se respeta `prefers-reduced-motion`.

## Archivos creados en Fase 9

- `src/PROMPT_FASE_9.md`.
- `src/components/tournament/DQControls.tsx`.
- `src/components/tournament/ActiveMatchLink.tsx`.
- `src/components/tournament/MatchHistory.tsx`.
- `tests/match-management.test.mjs`.
- `stage-banning-before-phase9-20261017-132855.zip` (respaldo local).

## Archivos modificados en Fase 9

- `src/types/tournament.ts`.
- `src/utils/tournamentResults.ts`.
- `src/utils/doubleElimination.ts`.
- `src/utils/matchSession.ts`.
- `src/components/tournament/BracketBoard.tsx`.
- `src/components/tournament/MatchCard.tsx`.
- `src/components/tournament/MatchEditor.tsx`.
- `src/components/tournament/MatchVSControls.tsx`.
- `src/components/tournament/VersusPresentation.tsx`.
- `src/pages/MatchVSPage.tsx`.
- `src/pages/TournamentAdminPage.tsx`.
- `src/styles/tournament.css`.
- `src/styles/versus.css`.
- `tests/match-session.test.mjs`.
- `tests/tournament-render.test.mjs`.

## Limitaciones y comprobación manual pendiente

- La herramienta de UI devolvió un inventario vacío de aplicaciones y navegadores al retomar. No se afirma una revisión visual interactiva ni E2E de clics, fullscreen o dispositivos móviles. Se verificaron lógica y renderizado React automáticamente.
- Comprobar manualmente un BO3 y un BO5: sumar con iconos, reducir, ocultar/reabrir VS y recargar; después aplicar/revertir DQ en un torneo de prueba, revisar historial y confirmar que presentación no permita editar.
- La edición simultánea desde varias pestañas administrativas no tiene resolución de conflictos; usar una sola pestaña administradora. No hay sincronización entre dispositivos.
- El validador admite hasta 64 registros detallados por set, incluidos los retirados, y mantiene el límite de importación JSON de 256 KB. No se eliminan registros automáticamente al llegar al límite.
- Las reversiones de DQ conservan los juegos, pero no constituyen un registro de auditoría de todos los DQ anteriores: el campo de DQ representa la decisión vigente.
- La advertencia de tamaño de bundle queda pendiente de optimización futura. No afecta la compilación.

No se hizo push ni se añadieron dependencias, imágenes, servicios o un nuevo tamaño de bracket.
