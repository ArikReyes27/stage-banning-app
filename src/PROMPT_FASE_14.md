# STAGE//STRIKE — Fase 14

## Objetivo y alcance

Extender la aplicación existente con selección rápida de personajes, sugerencias entre rondas, variantes locales y un podio destacado. Se conservan localStorage, esquemas 1/2, reglas competitivas, algoritmo de doble eliminación, distribución Top 32, registro, Stage Banning y exportaciones. No se implementó Supabase, autenticación ni permisos. No se hizo push.

## Preparación

- Se revisaron git status, modelos, resolución del bracket, editor, VS, presentación, persistencia y validación JSON, Standings, exportador SVG/PNG, catálogo y pruebas anteriores.
- No se encontraron AGENTS.md en el proyecto. El árbol ya contenía cambios y archivos sin seguimiento de fases anteriores; se conservaron.
- Respaldo previo: `stage-banning-before-phase14-20261021-231415.zip`, en la raíz. Excluye `.git`, dependencias, dist, perfiles de pruebas y respaldos ZIP anteriores. No accede al localStorage del usuario.

## Selección y sincronización

- `CharacterPicker` abre desde el icono del jugador y reutiliza `CharacterSearch` y el catálogo único de 86 personajes.
- Búsqueda parcial normalizada, sin distinguir mayúsculas ni acentos. So encuentra Sonic/Sora; Clo encuentra Cloud. Tab, Enter, flechas, Home/End y Escape permiten navegar y cerrar. Se enfoca el buscador al abrir y se devuelve el foco al icono al seleccionar/cerrar.
- `MatchResult.prepared` guarda la selección cuando todavía no existe sesión detallada. No crea juegos, no modifica puntuaciones ni confirmaciones y conserva el editor manual BO3/BO5.
- Al iniciar una sesión detallada, `prepared` se transfiere a `details.current` y se elimina: existe una sola configuración actual. Editor y VS usan las mismas acciones, validación y persistencia.
- El panel no se remonta al cambiar únicamente la selección: conserva el foco y los marcadores pendientes de guardar. Cambios competitivos externos sí refrescan su estado.
- Bracket y editor usan la misma proyección visual que VS. En sets terminados se muestra el último juego; las correcciones se realizan mediante el historial existente del VS.
- Los eventos de almacenamiento existentes sincronizan las pestañas. Se mantiene la limitación anterior de localStorage: no hay resolución transaccional de ediciones simultáneas.

## Sugerencias por participante

`resolveBracket` calcula `suggested` como proyección de lectura, sin escribir resultados. Sigue la fuente entrante de cada jugador y busca su ID dentro del encuentro previo; no presupone que conserve el mismo lado.

Orden: último juego no retirado con personaje válido del encuentro anterior; configuración preparada/actual de ese encuentro; sugerencia heredada a través de BYEs; personaje del registro; icono genérico. El recorrido causal evita usar elecciones de rondas posteriores para reescribir rondas anteriores. Los juegos registrados tienen prioridad aunque el set previo termine por DQ. Las elecciones de un nuevo encuentro prevalecen sobre su sugerencia.

La reversión de resultados conserva las invalidaciones existentes y elimina también selecciones de encuentros dependientes invalidados, evitando asignarlas al nuevo ocupante. Se cubren Winners, Losers, finales, Reset, BYEs y rivales pendientes. La selección administrativa requiere dos participantes, igual que el editor previo.

## Historial competitivo

Solo `details.games` no retirados alimenta Standings. `prepared`, `suggested` y `details.current` nunca cuentan como uso. Registrar una victoria toma una instantánea del personaje y variante; las selecciones siguientes no la modifican. Las variantes no crean IDs competitivos nuevos. Se mantiene frecuencia real, máximo tres personajes únicos y posiciones oficiales.

Los nuevos campos son opcionales y se validan/copían por lista permitida. Los JSON anteriores siguen cargando sin una migración destructiva ni cambio de versión. Las URLs nunca se importan como datos de torneo.

## Recursos y variantes

Se inspeccionó la carpeta original `C:/Users/Arik/Downloads/thumbnail-generator-master/thumbnail-generator-master/res/fighters`. Sonic contiene ocho pares reales `icon0..7.png` y `render0..7.png`. Se copiaron únicamente los siete pares alternativos (14 PNG) a `public/images/characters/{icons,renders}/sonic/01..07.png`; el par base ya existía.

- Disponible: Sonic, colores 1–8, con miniaturas administrativas y render público.
- Resto del catálogo: variante base; las variantes de origen no desplegadas permanecen como metadatos. No se afirma compatibilidad completa sin inspeccionar cada par.
- `variantIds` es independiente de `characterIds`, persiste por juego y selección, se reinicia al cambiar personaje y se hereda con la sugerencia.
- Variantes no disponibles usan el render base. Un error de carga de un render alternativo intenta el base. No se aplican filtros de color ni se descargan imágenes.

## Podio y exportación

`TopEightPoster` conserva el SVG común para pantalla y PNG: segundo–primero–tercero, campeón ligeramente elevado, corona geométrica, insignias diferentes, bordes y halo discreto dorado/platino/bronce. Usa los renders existentes y no añade animaciones. El PNG conserva 1600 × 1140, nombres completos, posiciones y hasta tres iconos. En móvil se complementa con tarjetas legibles, render e insignia. CSV y clasificación completa permanecen disponibles.

## Fondos futuros y base de datos

No se añadieron fondos ni recursos generados. Cuando se proporcionen imágenes, puede añadirse un campo opcional `background` al manifiesto local `CharacterAssets`; VS y Standings lo consultarán por ID con fallback al fondo actual. No necesita modificar datos competitivos ni almacenar URLs arbitrarias en torneos. No se anticipó otra arquitectura.

Las acciones puras y las proyecciones siguen separadas de `useTournament`/almacenamiento. En una futura integración, el servidor deberá comprobar propietario, coadministradores, reportes y permisos; ocultar controles no sustituirá esa validación.

## Archivos de esta fase

- Modelos/motor: `types/tournament.ts`, `utils/doubleElimination.ts`, `utils/matchSession.ts`, `utils/tournamentResults.ts`.
- Catálogo visual: `data/characterAssets.ts`, nuevo `data/characterVariants.ts`; 14 PNG de Sonic indicados arriba.
- Componentes: nuevo `components/tournament/CharacterPicker.tsx`; `CharacterSearch.tsx`, `MatchEditor.tsx`, `MatchCard.tsx`, `MatchVSControls.tsx`, `VersusPresentation.tsx`, `TopEightPoster.tsx`.
- Páginas/estilos: `pages/TournamentAdminPage.tsx`, `pages/StandingsPage.tsx`, `styles/tournament.css`, `styles/standings.css`.
- Pruebas: nuevo `tests/characters-phase14.test.mjs`, nuevo `tests/browser-phase14.mjs`; actualización de expectativas en `tests/character-assets.test.mjs` y `tests/scalable-tournament.test.mjs`.
- Documentación/evidencia: este archivo y `docs/phase14/`.

## Verificación

- `npm.cmd test`: 121 pruebas aprobadas. Incluye selección sin historial, persistencia JSON, separación de instantáneas, cambios explícitos, Winners/Losers, DQ/reversión, BYEs, Reset y tamaños 8/16/32/64/128; suites anteriores de registro, resultados, render, Standings y exportación.
- `npx.cmd tsc -b`, `npm.cmd run lint`, `npm.cmd run build`: aprobados. Build mantiene advertencia de bundles superiores a 500 kB; no bloquea la compilación.
- `node tests/browser-phase13.mjs`: aprobado; PNG real, CSV, presentación de lectura, actualización por storage, móvil y paginación 128.
- `node tests/browser-phase14.mjs`: aprobado; búsqueda So/SONIC/Clo, flechas y Enter, variante persistida/render VS, sincronización VS→editor, editor móvil, insignias del podio y toda la verificación de exportación anterior. Chrome se ejecuta con perfil temporal aislado. El primer lanzamiento restringido falló por GPU del sandbox, no por código; se repitió con autorización fuera del sandbox.
- Se inspeccionaron las capturas del editor móvil, Top 8 móvil y PNG exportado; se ajustó el selector móvil para que todos sus controles quepan en la pantalla.

## Límites deliberados

Solo Sonic tiene colores alternativos integrados. El modo presentación no permite editar. Los resultados manuales históricos no permiten inferir qué personajes se jugaron. Las sugerencias son derivadas y no constituyen auditoría; no se añade una cronología global ficticia. Los fondos temáticos, Supabase y permisos de servidor siguen pendientes para sus fases correspondientes.

## Evidencia visual de entrega

- [PNG real del Top 8](../docs/phase14/top8-export.png)
- [Top 8 móvil](../docs/phase14/top8-mobile.png)
- [Editor escritorio](../docs/phase14/character-editor-desktop.png)
- [Selector móvil](../docs/phase14/character-editor-mobile.png)

El ZIP fue abierto y verificado: 318 entradas; el modelo respaldado todavía no contiene `prepared`, confirmando que corresponde al estado anterior a esta fase.
