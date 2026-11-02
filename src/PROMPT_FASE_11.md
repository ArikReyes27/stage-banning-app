# STAGE//STRIKE — Fase 11

## Alcance
Ampliar el motor existente a doble eliminación desde dos participantes, conservando VS, DQ, historial, correcciones y persistencia. Crear distribución aleatoria, seeding, intercambios controlados, BYEs y fases Top N basadas en eliminaciones reales. No cambiar HomePage, rulesets, Stage Banning ni servicios externos. Sin nuevas dependencias ni push.

## Respaldo y revisión
Respaldo previo: `stage-banning-before-phase11-20261017-225653.zip`, 47,043,234 bytes. Incluye trabajo sin commit de fases anteriores; excluye .git, node_modules, dist y ZIP previos. Revisados modelos, motor, resultados y DQ, matchSession, validación JSON, useTournament, almacenamiento, BracketBoard, tarjetas, editor, VS y registro Fase 10.

## Bloques
- A: terminado. Grafo dinámico Winners/Losers/GF/RESET, fuentes pendientes y BYEs automáticos.
- B: terminado. Selección del registro, sorteo, seeds separados, restauración e intercambios con invalidación de dependencias.
- C: terminado. Top 128/64/32/16/8 por segundas derrotas reales, snapshots de entrada, filtros, búsqueda y paginación de 32 tarjetas.
- D: terminado. Editor y VS, BO3/BO5, personajes por juego, escenarios, confirmación, DQ/reversión y presentación.
- E: terminado para el alcance comprobado abajo. Persistencia y compatibilidad schema 1/2, importación/exportación y validación final.

## Decisiones
Schema 1 se conserva para torneos antiguos sin reinterpretar sus seeds ni IDs. Schema 2 almacena el grafo generado y su orden de confirmaciones. IDs W/L secuenciales por ronda y GF/RESET. BYEs son resolución automática de fuentes, nunca resultados de juegos. Las fuentes pendientes se distinguen de las fuentes resueltas sin participante.

## Cierre de comprobaciones — 18 de octubre de 2026

Se retomó el árbol de trabajo existente, sin reiniciar la fase. Git tenía 12 archivos versionados modificados y archivos nuevos de varias fases (motor, componentes, páginas, estilos, assets, pruebas, documentación y respaldos). `git diff --stat` no incluye esos archivos nuevos: no representa por sí solo el alcance de Fase 11. Se conservaron todos esos cambios y el respaldo previo. No se hizo reset, limpieza, commit ni push; no se abrió ni modificó el perfil habitual del navegador.

### Resultado automatizado

- `npm test`: **94/94 pruebas aprobadas**, cero fallos, omitidas o canceladas. Incluye registro/importaciones, assets, motor anterior, motor escalable, render React, VS, resultados, DQ y almacenamiento.
- Simulaciones escalables: seis torneos completos por tamaño para 2, 7, 8, 12, 16, 20, 24, 32, 48, 64, 100, 128 y 129 participantes (78 torneos), con orden de encuentros aleatorio, BO3/BO5 y DQ. También pasan 128 simulaciones del motor anterior y recorridos detallados de VS para 2, 7, 20 y 129, incluyendo reset.
- Cada simulación comprueba ausencia de bloqueos, identidades únicas, ausencia de encuentros simultáneos incompatibles, exactamente dos derrotas por eliminado, campeón con menos de dos derrotas y 2N−2 encuentros reales (2N−1 con reset). Los BYEs no generan resultados ni derrotas.
- Seeds 1/2 en mitades opuestas, primeros cuatro en cuartos distintos, restauración de distribución, intercambios y preservación de resultados independientes: aprobados.
- Top N: snapshots con N jugadores, sin eliminados, sin BYEs ni encuentros previos a la fase. Ganar rondas de Winners no reduce participantes vivos. Revertir una eliminación recalcula/desactiva la fase correspondiente.
- `npx.cmd tsc -b`: aprobado. `npm.cmd run lint`: aprobado, también después de modificar el test de navegador. `npm.cmd run build`: aprobado. Se utilizaron ejecutables `.cmd` porque PowerShell bloquea los wrappers `.ps1` en este entorno.

| Participantes | Posiciones | BYEs iniciales en Winners | Fases disponibles al alcanzarlas |
| --- | --- | --- | --- |
| 8 | 8 | 0 | Top 8 |
| 20 | 32 | 12 | Top 16, Top 8 |
| 32 | 32 | 0 | Top 32, Top 16, Top 8 |
| 64 | 64 | 0 | Top 64, Top 32, Top 16, Top 8 |
| 128 | 128 | 0 | Top 128, Top 64, Top 32, Top 16, Top 8 |
| 129 | 256 | 127 | Top 128, Top 64, Top 32, Top 16, Top 8 |

El contador de pases automáticos de la interfaz incluye también los pases resueltos posteriormente en Losers: puede superar el número de BYEs iniciales de esta tabla.

### Investigación de tests/browser-phase11.mjs

Se reprodujeron dos problemas distintos:

1. **Entorno/navegador:** dentro del sandbox, Chrome cerró antes de cargar la aplicación con `GPU process exited unexpectedly`, código `-1073741790`, y `GPU process isn't usable`. Ejecutar el mismo test fuera del sandbox, con autorización y un perfil nuevo aislado, permitió completar el flujo. No fue un fallo del motor.
2. **Sincronización del test:** una repetición produjo `Button unavailable: Seleccionar todos`. `Page.reload` podía devolver antes de cambiar el documento; la espera por texto encontraba el DOM antiguo. Se añadió una espera explícita de `Page.loadEventFired` antes de comprobar la nueva UI. También se evita aceptar una lista de pestañas vacía y se muestran descripciones completas de excepciones JavaScript.

No se modificó código de la aplicación durante esta reanudación. Se amplió el mismo test para comprobar 20 y 128 participantes en navegador: paginación, mostrar BYEs, Top pendiente, todos los umbrales Top aplicables, lista de participantes de cada fase, filtro Losers, búsqueda vacía y ausencia de escrituras al navegar. Los estados para los umbrales se generan con el motor real dentro del perfil de prueba; no se pulsa manualmente cada encuentro de esos recorridos.

El flujo interactivo original comprueba selección/cancelación, seeds, sorteo/restauración/inicio, editor, VS sin personajes iniciales, escenario, victorias, ocultar/reabrir/recargar, DQ/reversión/confirmación, ancho móvil de 390 px y presentación sin controles de resultados. Cero excepciones JavaScript en los recorridos aprobados. Capturas en `node_modules/.tmp/phase11-browser/`: `desktop.png`, `mobile.png`, `bracket-20.png`, `bracket-128.png`.

### Compatibilidad y conservación

Las pruebas de schema 1 verifican resultados antiguos sin historial inventado, IDs originales, exportación/importación, recarga, DQ y correcciones. Schema 2 mantiene la clave existente `stage-strike.top8.v1`; el registro usa su propia clave y no se altera al guardar el torneo. Datos corruptos o almacenamiento inaccesible no se sobrescriben silenciosamente. Estas comprobaciones usan fixtures y almacenamiento aislado: no se afirma haber inspeccionado los torneos personales del navegador del usuario.

### Cómo probar visualmente sin afectar datos existentes

1. Ejecutar `npm.cmd run dev` y abrir la URL que muestre Vite en una ventana privada o perfil separado. Mantener esa ventana abierta durante la prueba.
2. En Registro, importar `docs/phase11-participantes-20.txt` o pegar 20 nicknames distintos (uno por línea). Revisar y confirmar la importación. Ir a Bracket, seleccionar los participantes y pulsar Revisar selección → Confirmar nuevo torneo.
3. Opcionalmente asignar seeds 1 y 2. Generar bracket: son 32 posiciones con 12 BYEs iniciales. Activar Mostrar pases automáticos para verlos; no registrarles marcadores. Revisar la distribución e Iniciar torneo.
4. Abrir un encuentro disponible → Abrir VS; registrar dos victorias en BO3 y Confirmar ganador. El ganador avanza en Winners y el perdedor cae a Losers. Una segunda derrota elimina. Top 16 se activa al quedar 16 vivos y Top 8 al quedar 8; no se activan solo por terminar una ronda de Winners. Probar DQ y Revertir DQ, y recargar para comprobar persistencia.
5. Para 128, usar otra ventana/perfil aislado o exportar el torneo de prueba de 20 antes de sustituirlo. Importar `docs/phase11-participantes-128.txt`, seleccionar exactamente esos 128 y repetir la creación. No hay BYEs iniciales. Top 128 está activo desde el inicio; Top 64/32/16/8 se activan con eliminaciones reales. Usar Encuentros siguientes, Sección, Ronda y Localizar encuentro: se muestran como máximo 32 tarjetas por página.
6. Comprobar Modo presentación y VS de presentación: muestran resultados sin permitir editarlos. El reset solo aparece cuando el finalista de Losers gana la primera Grand Final.

### Límites pendientes

- Build avisa de chunks mayores de 500 kB (bundle principal y ExcelJS); no impide compilar. Optimización de tamaño fuera del cierre de esta fase.
- La prueba de navegador requiere Chrome en la ruta Windows indicada, puertos 4175/4176 libres y permiso para iniciar subprocesos. No valida otros navegadores ni dispositivos físicos.
- Hasta 129 participantes comprobados en torneos completos; el registro soporta tamaños mayores, pero eso no equivale a certificar rendimiento del torneo a cualquier escala.
- Persistencia local: un torneo activo por origen/perfil. Exportar JSON antes de reemplazarlo. No hay sincronización entre dispositivos ni autenticación.
- Los Top disponibles son 128/64/32/16/8; no hay filtros Top 4/2. Las tarjetas están paginadas, no se dibuja todo un bracket de 128 simultáneamente.
