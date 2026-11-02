# STAGE//STRIKE — Fase 13: Standings enfocados en Top 8

Respaldo previo: `stage-banning-before-phase13-20261018-123435.zip`, 47,077,294 bytes. No existía módulo de standings previo en el árbol de trabajo.

## Alcance aprobado
Top 8 como vista principal y presentación; clasificación completa como lista sencilla. PNG únicamente del Top 8, CSV completo. Posición, nickname y hasta tres personajes distintos por uso real. Respetar empates, provisional/final, DQ, BYEs y reset. No modificar el motor ni los resultados guardados. Sin push.

## Decisiones
- Personajes: contar cada juego no anulado de ambos jugadores, incluidos juegos de sets aún sin confirmar y juegos anteriores a DQ. No contar current, selecciones de roster, legacyScores ni resultados sin historial. Orden: usos descendentes, ID ascendente en empate; máximo tres.
- Posiciones: eliminaciones de la misma ronda real de Losers comparten puesto. Contar encuentros con dos fuentes ocupadas (sin BYEs) de rondas posteriores para determinar posiciones, independientemente del orden de confirmación. Finalista perdedor segundo y campeón primero solo cuando termina GF o RESET según corresponda.
- Activos: sin posición definitiva, identificados como En juego. No seleccionar ocho arbitrariamente cuando aún hay más de ocho activos. Si un empate cruza el corte del Top 8, conservar a todos los empatados.
- Top 8 se dibuja en un SVG común a pantalla y PNG, con imágenes locales incrustadas al exportar. La lista completa usa paginación de 50 y CSV de todos los participantes.

## Implementación completada

- `/tournament/standings`: Top 8 por defecto, botón Ver clasificación completa / Volver al Top 8, PNG del Top 8 y CSV completo. Accesos desde Home y Bracket.
- `/tournament/standings/presentation`: Top 8 de solo lectura, sin botones de administración/exportación, sin navegación global. La presentación del bracket conserva su ruta anterior.
- Diseño oscuro cyan/violeta, primer puesto destacado en dorado, render grande del principal y hasta tres iconos únicos ordenados por uso. Los nicknames largos se distribuyen hasta en cuatro líneas, sin recortar su contenido en el PNG.
- Lista completa: posición, nickname, icono principal y hasta otros dos pequeños; 50 filas por página. CSV siempre incluye a todos, no solo la página visible. BOM UTF-8, escapado de comillas y protección de prefijos de fórmula.
- PNG de 1600×1140 para hasta ocho participantes, ampliado verticalmente si un empate cruza el corte. No se exporta la clasificación completa como imagen. SVG compartido entre UI/exportación, imágenes locales incrustadas, sin dependencias nuevas.
- En móvil, el póster se adapta al ancho y se acompaña de un resumen legible con nombres completos e iconos.
- Standings es una proyección de lectura; no guarda campos derivados ni cambia el esquema de persistencia. Recarga y eventos de almacenamiento recalculan los resultados. Las correcciones/reversiones eliminan automáticamente los puestos o usos históricos que ya no corresponden.

## Archivos

Creados:
- `src/utils/tournamentStandings.ts`
- `src/utils/standingsImage.ts`
- `src/components/tournament/TopEightPoster.tsx`
- `src/pages/StandingsPage.tsx`
- `src/styles/standings.css`
- `tests/standings.test.mjs`
- `tests/browser-phase13.mjs`
- `src/PROMPT_FASE_13.md`

Modificados:
- `src/app/routes.tsx`: dos rutas de standings.
- `src/components/layout/AppShell.tsx`: ocultar navegación en la presentación de standings.
- `src/pages/HomePage.tsx`: acceso secundario Standings · Top 8.
- `src/pages/TournamentAdminPage.tsx`: acceso Standings · Top 8.
- `tests/tournament-render.test.mjs`: actualizar expectativas de Home y comprobar presentación de standings sin administración.

Comparación SHA-256 con todos los archivos del respaldo: únicamente cambiaron esos cinco archivos existentes; no faltó ningún archivo. Motor, VS, DQ, BYEs, rulesets, historial y almacenamiento permanecen idénticos. No se tocaron los datos personales del navegador ni se hizo push.

## Comprobaciones reales — 18 de octubre de 2026

- `npm.cmd test`: **116/116 aprobadas**, cero fallos/omitidas/canceladas.
- `npx.cmd tsc -b`: aprobado.
- `npm.cmd run lint`: aprobado.
- `npm.cmd run build`: aprobado, con el aviso previo de chunks mayores de 500 kB.
- `git diff --check`: sin errores de whitespace; Git muestra avisos de conversión LF/CRLF del árbol existente.
- Standings automatizados para 2, 3, 7, 8, 20, 32, 64, 128 y 129 participantes, recorridos con distintos órdenes, DQ y finales. Validación de posiciones contra eliminaciones realmente registradas; round-trip JSON y lectura sin mutaciones.
- Top 8 clásico: posiciones `1, 2, 3, 4, 5, 5, 7, 7`. Caso de nueve jugadores con BYEs redistribuidos: `1, 2, 3, 4, 5, 5, 7, 8, 8`; se conservan ambos octavos en el póster.
- Provisional sin puestos inventados, resultado no confirmado sin eliminación, reset pendiente sin campeón, reversión de DQ y correcciones de resultados.
- Personajes de ambos lados del set, conteo de juegos válidos, juegos anulados excluidos, máximo tres distintos, empates deterministas por ID, current/roster/legacyScores sin usos inventados, DQ sin games ficticios. Schema 1 mantiene posiciones y muestra ausencia de historial cuando corresponde.
- CSV con todos los participantes, comillas, Unicode y prefijos de fórmula comprobado.
- `node tests/browser-phase13.mjs`: aprobado. Fixture aislado de 20, PNG descargado con firma PNG y dimensiones 1600×1140, CSV descargado con 20 filas, lista completa, presentación sin botones/input/nav, corrección recibida por evento de storage, móvil 390 px sin overflow, lista de 128 paginada 50/50/28. Exportación y navegación preservan exactamente el torneo guardado.
- PNG adicional con nickname de 120 caracteres comprobado sin recorte de contenido. Exportación con imágenes bloqueadas sigue generando un PNG y reporta las imágenes ausentes.
- `node tests/browser-phase11.mjs`: aprobado; selección, sorteo/seeds, restauración/inicio, editor/VS, escenario, victorias, DQ/reversión/confirmación, recarga, móvil, presentación y Top N para 20/128.
- Capturas desktop/móvil y PNG real inspeccionados visualmente. Cero excepciones JavaScript en el recorrido aprobado de Fase 13.

Artefactos en `node_modules/.tmp/phase13-browser/`: `top8-export.png`, `top8-long-name.png`, `top8-desktop.png`, `top8-mobile.png`, `full-desktop.png`, `full-mobile.png`, `presentation-desktop.png`. Descargas de test en subcarpetas independientes. Chrome usa un perfil temporal nuevo, ajeno al del usuario.

## Uso
Abrir Standings · Top 8 desde Home o Bracket. El Top 8 aparece cuando quedan como máximo ocho activos; antes muestra que está por definir. Pulsar Ver clasificación completa para consultar toda la lista. Exportar Top 8 a PNG conserva el diseño y la etiqueta provisional/final. Exportar clasificación completa CSV incluye todo el torneo. Presentar Top 8 abre la vista pública.

## Límites explícitos
- No se reconstruye historial de personajes a partir de un marcador antiguo: se muestra Sin historial. Un personaje elegido sin registrar un juego tampoco cuenta.
- Para no inventar posiciones, los jugadores activos aparecen En juego, sin número final. Un empate en el corte puede producir más de ocho participantes visibles.
- La clasificación sigue las rondas de eliminación del grafo existente; no cambia emparejamientos ni deshace DQ por su cuenta.
- Verificación visual en Chrome/Windows y móvil emulado, no dispositivos físicos ni otros navegadores. El test requiere puertos 4195/4196 libres.
- Continúa el aviso de tamaño de bundles. Sin autenticación, servicios externos ni sincronización entre dispositivos.
