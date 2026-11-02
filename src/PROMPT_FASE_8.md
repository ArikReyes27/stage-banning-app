# STAGE BANNING — FASE 8

## Pantalla VS interactiva, presentación y marcador visual de victorias

Proyecto: `C:\Users\Arik\Desktop\Proyectos\stage-banning-app`.

Fecha: 17 de octubre de 2026.

Estado: implementación completada; resultados de comprobaciones al final. La revisión visual interactiva queda pendiente porque no hay navegador conectado a las herramientas de esta sesión.

---

# Objetivos y alcance autorizado

Implementar un VS original en composición horizontal 16:9, con identidad oscura, cyan/violeta, renders base, escenario desenfocado, nombres, ronda, formato y juego actual. Reutilizar catálogo, resultados, persistencia y componentes de la aplicación. Respetar reduced motion.

Permitir desde administración: iniciar/pausar/reanudar un encuentro, buscar personajes, seleccionar escenario manualmente por juego, registrar victorias, corregir historial y confirmar el resultado final. Ofrecer una presentación sin controles administrativos y controles de visibilidad/pantalla completa que no reinicien datos.

Conservar HomePage, rulesets y flujo independiente de Stage Banning. No descargar imágenes, añadir skins, dependencias, servidor, base de datos ni sincronización entre dispositivos. No hacer push.

# Revisión previa y respaldo

Se revisaron `types/tournament.ts`, `doubleElimination.ts`, `tournamentResults.ts`, `tournamentValidation.ts`, `tournamentStorage.ts`, `useTournament.ts`, páginas del torneo, `BracketBoard`, `MatchCard`, `MatchEditor`, catálogo de personajes/manifiesto, catálogo de escenarios y `useRulesets`.

El proyecto ya tenía doble eliminación de ocho participantes, resultados agregados BO3/BO5, confirmación e invalidación de descendientes, importación/exportación JSON, sincronización entre pestañas mediante eventos storage, presentación del bracket e iconos de personajes. No tenía VS ni historial de juegos del torneo.

Antes de los cambios se creó `stage-banning-before-phase8-20261017-122910.zip` (46,964,829 bytes), incluyendo los archivos de trabajo y cambios previos sin commit. Se excluyeron `.git`, `node_modules`, `dist` y ZIP anteriores. No se realizó commit ni push.

# Disponibilidad del VS

- Administración: `/tournament/match/<matchId>`.
- Presentación: `/tournament/match/<matchId>/presentation`.
- Ejemplo: `/tournament/match/W1` y `/tournament/match/W1/presentation`.
- Cada tarjeta administrativa dispone de **Mostrar VS**, incluso para ver un encuentro aún sin participantes definidos.
- **Start Match** aparece cuando el torneo ha iniciado, los dos participantes están definidos y el set no ha terminado. Inicia o reanuda el encuentro y abre VS.
- W1–W7, L1–L6, GF y RESET usan la misma implementación. RESET solo se habilita cuando el motor existente lo exige.
- Abrir manualmente VS es una lectura: no registra victorias ni inicia juegos.
- El editor agregado anterior se conserva para resultados sin detalle. Una vez que hay historial, la tarjeta dirige al VS y el motor impide reemplazarlo accidentalmente por un marcador sin historial.

Alcance del formato: el motor existente continúa siendo de ocho participantes. “Todos los enfrentamientos” se implementa para todas las rondas del bracket existente, incluidas finales y reset, sin restringir el VS a ciertas tarjetas. No se añadió un generador de brackets para 16/32 participantes ni un segundo modo de torneo. `VersusPresentation` recibe un encuentro resuelto y no depende del número de participantes.

# Diseño visual implementado

- Composición 16:9 con contenedores de retrato a izquierda/derecha, acentos cyan/violeta, VS central, bordes redondeados y textos legibles.
- Renders existentes en `object-fit: contain`, sin deformación ni intento de completar el cuerpo recortado. Se presentan como retratos.
- Un único escenario por composición, con imagen desenfocada y overlay oscuro. Cuando falta escenario, no tiene imagen del catálogo o falla la carga, permanece el fondo degradado.
- Nickname, personaje, ronda, ID de encuentro, BO3/BO5, juego y escenario visibles.
- Entrada suave de ambos jugadores, aparición del VS, transición del fondo e iluminación de victorias mediante CSS. Se desactivan con `prefers-reduced-motion`.
- Si falta un render o falla su carga, se usa una silueta. Los iconos conservan el fallback SVG de `CharacterIcon`.
- No se copiaron barras, etiquetas ni HUD oficial de SSBU.

# Marcador e historial: una sola fuente de verdad

`MatchResult` conserva `format`, `scores` y `confirmed`, y admite `details` opcional:

```text
details:
  legacyScores: [victorias anteriores P1, victorias anteriores P2]
  games:
    - characterIds: [personaje P1, personaje P2]
      stage?: { id, name }
      winner: 0 | 1
  current:
    characterIds: [personaje P1, personaje P2]
    stage?: { id, name }
  status: ready | in-progress | paused
  startedAt?: fecha ISO del primer inicio
  rulesetId?: ID del pool elegido
```

`scores` se recalcula como `legacyScores + victorias de games` en cada acción. La validación rechaza cualquier discrepancia al importar o guardar. Los iconos se derivan de este resultado, nunca de un contador React independiente.

- BO3: dos iconos por jugador. BO5: tres.
- Pendientes: opacidad 0.25 y personaje del juego actual.
- Ganados: colores originales, marca de victoria y animación breve.
- Cada victoria detallada usa el personaje que tenía ese jugador en ese juego, aunque después cambie.
- No se alteran los personajes del registro general del participante por cambiar personaje en un juego.
- Los sets antiguos no registraban los personajes de cada victoria; sus iconos usan el personaje original del participante, con indicación accesible y aviso en el historial de que el personaje histórico no se conoce.

# Administración del juego

1. Abrir VS, elegir BO3/BO5 y configurar personajes/escenario.
2. Usar **Start Match / Reanudar juego**. Configurar datos no inicia el juego.
3. Durante el juego se pueden cambiar personajes o escenario.
4. Pulsar **Registrar victoria · [nickname]**. Se guarda una instantánea de ambos personajes, escenario y ganador.
5. El siguiente juego queda listo, con los mismos personajes y sin escenario seleccionado. El escenario anterior permanece en el historial. Debe iniciarse explícitamente antes de registrar otra victoria.
6. Al alcanzar dos/tres victorias se bloquean victorias adicionales y se muestra **Confirmar resultado final y avanzar**. No hay avance automático del bracket.
7. La confirmación solicita aprobación y pasa por `proposeResult`, conservando el motor Winners/Losers y Grand Final Reset.

El selector de personajes contiene búsqueda instantánea sin distinción de mayúsculas o acentos, iconos, nombre, selección actual y las 86 entradas. No hay selector de colores.

# Escenarios y rulesets

Se lee el catálogo existente y los rulesets predeterminados/custom mediante `useRulesets`, sin escribirlos. El administrador puede elegir todo el catálogo o un pool de ruleset. La selección es manual y no ejecuta bans ni comunica el bracket con la sesión de Stage Banning.

Cada juego conserva `{ id, name }` del escenario. Si un ruleset custom deja de estar disponible, se usa el catálogo y se conserva la selección guardada; el historial no depende de que siga existiendo ese ruleset. Un escenario custom sin imagen utiliza degradado, sin descargar recursos externos.

# Correcciones y estabilidad

- **Corregir juego** permite corregir ganador, personajes y escenario de cualquier juego detallado.
- Las correcciones de personaje/escenario mantienen una confirmación existente si no cambia el resultado.
- Cambiar victorias puede retirar la confirmación e invalidar encuentros dependientes. Antes de guardar se muestra la lista y se pide confirmación, igual que en el motor anterior.
- No se borran juegos posteriores silenciosamente para acomodar un final anticipado. Una secuencia imposible se rechaza. El administrador puede deshacer explícitamente el último juego y corregir después.
- Deshacer restaura personajes y escenario del juego retirado como configuración actual.
- Un cambio de formato conserva juegos y victorias, retira la confirmación cuando corresponde y se rechaza si la secuencia no cabe en el formato nuevo. No reinicia marcadores.
- Los marcadores antiguos tienen una sección de corrección de victorias históricas; no se inventan juegos para ellos.

# Persistencia y compatibilidad

Se conserva `schemaVersion: 1` como extensión aditiva opcional y la clave `stage-strike.top8.v1`. La lectura de un torneo anterior no escribe ni migra por sí misma. La primera acción VS añade `details`, trasladando las victorias anteriores a `legacyScores`, sin fabricar orden, escenarios ni personajes ganadores.

`parseTournament` y `exportTournament` validan el historial y copian solamente campos permitidos. No se aceptan URLs de imágenes arbitrarias desde JSON. Los archivos anteriores siguen siendo importables; los nuevos conservan todo el detalle al exportar/importar.

Mostrar/ocultar solo controla visibilidad local. Volver al bracket, abrir presentación, montar/desmontar o recargar no modifica el encuentro. No se incorporó un cronómetro nuevo: `startedAt` es solo la fecha del primer inicio y no se reinicia al reabrir.

Las acciones de dominio son funciones puras en `matchSession.ts`; almacenamiento y sincronización siguen en el hook/repositorio existente, permitiendo sustituir ese transporte en una fase futura. Se conservan los eventos storage para actualizar la presentación en otra pestaña del mismo origen. No hay servidor ni sincronización entre dispositivos; se recomienda una sola pestaña administradora.

Si falla localStorage, aparece un error y un botón para descargar el torneo en memoria como JSON desde VS. Un Start Match desde el bracket no navega si no logra persistir. La presentación no puede recibir cambios que el navegador no haya podido guardar.

# Presentación y pantalla completa

**Abrir presentación ↗** abre otra pestaña con la misma información. No contiene búsqueda, selector, edición, registro de victorias ni confirmación. La cabecera/footer globales se ocultan en las rutas de presentación.

Controles de vista: Mostrar/Ocultar VS, Volver al bracket y Pantalla completa/Salir. En pantalla completa los controles se ocultan visualmente y aparecen al pasar el puntero o darles foco con Tab; Escape permite salir. Estos controles no cambian resultados. Si el navegador no admite fullscreen se muestra un aviso.

La visibilidad es local a cada vista: ocultar el VS administrativo no oculta automáticamente otra pestaña de presentación. Los datos del encuentro sí se sincronizan.

# Archivos creados

- `src/pages/MatchVSPage.tsx`.
- `src/components/tournament/VersusPresentation.tsx`.
- `src/components/tournament/MatchVSControls.tsx`.
- `src/components/tournament/CharacterSearch.tsx`.
- `src/utils/matchSession.ts`.
- `src/styles/versus.css`.
- `tests/match-session.test.mjs`.
- `src/PROMPT_FASE_8.md`.
- Respaldo ZIP local mencionado arriba.

# Archivos modificados

- `src/types/tournament.ts`: detalle por juego opcional.
- `src/utils/tournamentResults.ts`: validación, suma del historial y copia segura.
- `src/utils/tournamentValidation.ts`: persistencia del detalle compatible con v1.
- `src/utils/doubleElimination.ts`: copia del resultado completo y protección del historial; no se cambian cruces ni algoritmo.
- `src/hooks/useTournament.ts`: devuelve si el guardado tuvo éxito.
- `src/app/routes.tsx`: rutas VS administrativa/presentación.
- `src/components/layout/AppShell.tsx`: presentación sin navegación general.
- `src/pages/TournamentAdminPage.tsx`: accesos e inicio de encuentros.
- `src/components/tournament/BracketBoard.tsx`: accesos bajo las tarjetas, sin anidar botones.
- `src/components/tournament/MatchCard.tsx`: estado en curso/pausa/por confirmar.
- `tests/tournament-render.test.mjs`: pruebas de composición, iconos, placeholders, accesos y modo presentación.

# Pruebas y verificación final

Resultados finales:

- `npm test`: **40 pruebas aprobadas, 0 fallos**.
- `npx tsc -b`: correcto.
- `npm run lint`: correcto.
- `npm.cmd run build`: correcto. Vite informa un chunk JS de 533.87 kB (140.43 kB gzip), por encima del umbral de 500 kB; advertencia no bloqueante. No se aumentó el umbral para ocultarla.
- `git diff --check`: sin errores; Git informa normalización LF/CRLF en archivos del directorio de trabajo.
- Comparación SHA-256 de los archivos existentes contra el ZIP previo: solo cambiaron los 11 archivos enumerados en “Archivos modificados”; no faltó ninguno. Home, rulesets, Stage Banning, imágenes, catálogo y manifiesto de Fase 7 permanecen intactos.

Pruebas añadidas para BO3/BO5, lectura/reapertura sin mutaciones, persistencia, personajes distintos por victoria, escenarios, correcciones, cambio de formato preservando juegos, confirmación, dependencias, GF/RESET, JSON anterior y rechazo de historiales inconsistentes. Pruebas de renderizado React para iconos opacos/iluminados, un único fondo, placeholders, accesos de todas las rondas, búsqueda administrativa con las 86 entradas por jugador y presentación sin controles administrativos.

La herramienta de navegador devolvió “Browser is not available: iab” y su inventario fue vacío. No se utilizó el navegador habitual ni se importó un torneo de prueba sobre datos del usuario. Las pruebas de lectura/renderizado no se presentan como una sesión E2E visual.

## Comprobación manual recomendada

1. Ejecutar `npm.cmd run dev`; abrir `/tournament`.
2. Con un torneo existente iniciado, abrir **Mostrar VS** sin pulsar Start Match. Comprobar que el marcador se conserva.
3. En un encuentro disponible, iniciar el juego, buscar “Sora”/“Kazuya”, elegir escenario y registrar una victoria.
4. Cambiar personaje para el siguiente juego. Comprobar que el primer icono ganado conserva el personaje anterior y los pendientes usan el nuevo.
5. Ocultar, mostrar, volver al bracket, reabrir y refrescar. Verificar personajes, escenario del juego actual, historial y estado.
6. Completar BO3/BO5: el bracket no avanza hasta confirmar. Probar cancelar la confirmación.
7. Corregir un juego; revisar actualización de iconos y advertencia de invalidación si existían dependencias.
8. Abrir presentación en otra pestaña y comprobar que recibe los cambios sin controles administrativos.
9. Probar pantalla completa, Escape, móvil, televisión/proyector, nicknames largos, reduced motion e imágenes que no carguen.
10. Probar GF ganado por Losers y el Reset con un torneo de prueba. No reiniciar un torneo real para hacer QA; exportar primero o usar otro perfil/origen.

# Limitaciones pendientes

- Revisión visual interactiva, teclado/fullscreen real y fallos de carga en navegador, pendiente por ausencia de navegador conectado. Existen fallbacks y pruebas de renderizado sin recursos conocidos.
- El formato del bracket permanece de ocho participantes; VS cubre todas sus rondas.
- Los resultados antiguos no pueden reconstruir personajes ni escenarios que nunca se guardaron.
- No se agregó cronómetro ni sincronización entre dispositivos; edición concurrente multiadministrador no está resuelta.
- Los renders son retratos recortados, no ilustraciones de cuerpo completo.
