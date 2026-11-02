# STAGE//STRIKE — Fase 15.6 (sincronización segura) — A0: contratos y vectores

Alcance de A0: **solo documentación y vectores de prueba**. No cambia interfaz, comportamiento, migraciones ni Supabase. Todo se valida únicamente contra `stage-strike-tests`. Punto de partida: checkpoint `021c682`.

## 1. Decisiones tomadas (producto)

1. Dos modos: **local independiente** (sin cuenta ni conexión, como hoy) y **torneo publicado en Supabase**.
2. La **primera publicación es explícita**, con confirmación del organizador.
3. Ya publicado, **Supabase es la fuente de verdad** de participantes, bracket y resultados compartidos. Los cambios autorizados se guardan como **operaciones remotas** (no se republica el torneo completo tras cada combate).
4. **Nunca se fusiona automáticamente** un estado local antiguo con uno remoto. Una revisión obsoleta se detecta (`40001`) y requiere resolución explícita (recargar remoto, o publicar copia aparte).
5. El modo local sigue funcionando sin conexión y sin cuenta.

## 2. Reglas YA implementadas en el motor TypeScript (fuente: `src/utils`)

Los vectores (`tests/fixtures/phase15-6-vectors.json`) fijan estas reglas tal cual existen hoy. El futuro validador SQL debe coincidir; no se inventan reglas nuevas aquí.

**Estructura** (`bracketStructure.ts`, schemaVersion 2)
- Tamaño de bracket = potencia de 2 ≥ n (n ≥ 2). Partidas: `2·size − 1` (size 2: 3). Winners `size−1`, Losers `size−2`, más `GF` y `RESET` siempre al final.
- IDs `W#`, `L#`, `GF`, `RESET` en orden topológico: cada fuente `{match}` aparece antes. Cada slot de seed `0..size−1` se usa exactamente una vez.
- `size = 2`: sin Losers; `GF` = `[ganador W1, perdedor W1]`.
- schemaVersion 1 es el bracket fijo de 8 (`MATCHES`) y no admite BYEs.

**Sorteo y seeds** (`tournamentSetup.ts`)
- `seeds` tiene longitud `size`; los huecos son `''` (BYE): exactamente `size − n`. `seedOrder` pliega las posiciones para que los seeds altos reciban los BYE; ninguna partida de primera ronda queda con dos huecos.
- Prioridades (`priorities`): rangos únicos 1..n; el resto se baraja con una fuente aleatoria. `drawTournament` no se permite con el torneo `started`.
- `status`: `draft → ready` (al sortear) `→ started` (confirmación del organizador en la UI). No hay vuelta atrás a sorteo.

**Resolución** (`resolveBracket`)
- BYE: si las fuentes están resueltas y falta un jugador, la partida es `automatic` y `settled`; avanza el único jugador. Nunca se registra resultado.
- `RESET` está habilitada solo si el ganador de `GF` es el jugador del slot 1 (el que viene de Losers). Si no, queda sin jugadores.
- Campeón = ganador de `RESET` si está habilitada; si no, de `GF`.

**Resultados** (`tournamentResults.ts`, `proposeResult`)
- Formatos `BO3` (objetivo 2) y `BO5` (objetivo 3). Marcadores enteros `0..objetivo`; a lo sumo un lado alcanza el objetivo; `confirmed` exige ganador (salvo DQ).
- DQ: `outcome {type:'dq', loser 0|1, recordedAt ISO, reason ≤160 sin control}` exige `confirmed`; el ganador es el slot opuesto al `loser`. El marcador puede ser `[0,0]`.
- `details`: `legacyScores` + `games[]` (≤64) deben sumar exactamente `scores`; juegos `voided` no cuentan; ningún juego tras alcanzar el objetivo.
- Solo con `status === 'started'`; solo en partidas habilitadas con **ambos** jugadores definidos y distintos (BYE y `RESET` sin habilitar se rechazan).
- Cambiar quién gana/pierde invalida en cascada todos los descendientes con resultado (`descendants`); cambiar solo el marcador conservando ganador no invalida. Un resultado no confirmado (sin ganador) también invalida descendientes y sale de `completionOrder`.
- Un resultado con `details` no se puede reemplazar por uno sin `details` ("corrígelo desde VS"). Un DQ no se puede sobrescribir sin `revertDQ: true`.
- `completionOrder` (v2): se conserva el orden de los confirmados y se añade el nuevo al final; se purga lo invalidado.
- `swapPositions` (cambio de posiciones, también iniciado): invalida las partidas de los slots tocados y sus descendientes y las saca de `completionOrder`.

**No existe en el motor** (decisiones pendientes, ver §6): historial de correcciones propias, bloqueo de correcciones tras jugarse partidas posteriores (solo cascada), límites por rol, validación del stage contra un ruleset en el resultado.

Nota: `rulesetValidation.ts` valida rulesets de baneo de stages (starters, bans, nombres) y **no participa** en la validez competitiva de un bracket. El resultado solo valida la forma del stage (`id`/`name` ≤128). No se usa como fuente de reglas en 15.6.

## 3. Contratos propuestos de operaciones (solo diseño, sin implementar)

Todas: `security definer`, `search_path=''`, solo `authenticated`; abren con `ss_private.lock_tournament(p, false)` (propietario o admin; bloquea la fila); reciben `p_tournament uuid` y `p_expected bigint`; avanzan la revisión con `ss_private.audit` (`40001` si está obsoleta). Sin DML directo ni Realtime.

| Operación | Efecto | Estados |
|---|---|---|
| `ss_publish_tournament(p_tournament, p_expected, p_snapshot)` | Primera publicación explícita de participantes (y, si ya está sorteado, seeds/estructura) | borrador/ready |
| `ss_set_participants / ss_draw` | Participantes, prioridades, seeds (equivale a `drawTournament`/`swapPositions`) | draft/ready (swap: started con cascada) |
| `ss_start_tournament` | `ready → started`; congela participantes | ready |
| `ss_record_result(match, result)` | Equivale a `proposeResult` | started |
| `ss_record_dq(match, loser, reason)` | Resultado DQ con **hora del servidor** | started |
| `ss_correct_result(match, result, revert_dq, confirm_invalidations)` | Corrección; devuelve las invalidaciones, que el cliente debe confirmar | started |

El servidor **recalcula** progresión, `completionOrder`, ganadores y cascadas a partir del estado actual más la operación (nunca acepta un `state` completo del cliente). La respuesta incluye la nueva revisión y la lista de partidas invalidadas.

## 4. Invariantes (servidor)

1. Una sola autoridad: tras publicar, el estado remoto manda; el cliente solo lo refleja y mantiene una copia local de lectura/respaldo.
2. Cada escritura exitosa suma exactamente +1 a `revision` y deja una fila de auditoría de **la operación** (no snapshots completos).
3. Mismo `tournament_id` en todas las filas tocadas; nunca se acepta un torneo, partida o participante de otro UUID.
4. Participantes y estructura inmutables desde `started`, salvo `swapPositions` con cascada confirmada.
5. Estado, partida y jugadores se derivan del servidor; el cliente no envía ganador, perdedor, orden ni fechas.
6. Tamaños acotados (1 MB por petición, `games ≤ 64`, nicknames ≤ 128), sin claves desconocidas.
7. Revisión obsoleta ⇒ no se escribe nada y se informa; no hay reintentos automáticos ni fusión.
8. Conteo y estructura idénticos a los vectores del motor TS para todo n (2..128).

## 5. Vectores y pruebas

- `tests/helpers/phase15-6-vectors.mjs` genera vectores deterministas (PRNG sembrado `15601`) desde el motor TS: estructuras para n = 2,3,4,5,6,7,8,9,12,16,17,32,33,64,100,128; `seedOrder`; sorteos con BYEs y prioridades; brackets con BYE; BO3/BO5 válidos e inválidos; DQ; partidas completas (favorito y "upset en GF" con `RESET`) para n = 2..32; correcciones (mismo ganador, cambio de ganador, no confirmado, `details`, DQ, `swap`, no iniciado, `RESET` prematuro).
- `tests/fixtures/phase15-6-vectors.json` es el golden file. `tests/phase15-6-vectors.test.mjs` compara contra él y verifica invariantes independientes (conteo `2·size−1`, orden topológico, seeds únicos, BYEs, campeón y `completionOrder`). Tras un cambio **intencional** del motor: `UPDATE_VECTORS=1 node --experimental-strip-types --test tests/phase15-6-vectors.test.mjs` y revisar el diff.
- Futuro: la prueba SQL (08+) cargará estos mismos vectores y exigirá el mismo resultado.

## 6. Decisiones pendientes

1. ¿Los resultados aceptan personaje/stage/`details` desde el inicio o solo marcador + confirmación? (Recomendado: solo marcador en 15.6C; `details` en 15.6F con catálogo servidor.)
2. Correcciones con partidas posteriores ya jugadas: hoy el motor las **borra en cascada con confirmación**. ¿Se conserva o se bloquea en servidor salvo propietario?
3. ¿Quién puede `swapPositions` en `started` (propietario o admin)?
4. Alcance de `result_reports` (jugadores que reportan): fuera de 15.6 salvo decisión.
5. Auditoría: guardar operación + diferencia en vez de `before/after` completos (esquema actual de `ss_private.audit`).
6. Autoridad de participantes: tabla `tournament_participants` vs `state.participants` (evitar doble fuente).
7. Qué se hace con el estado local al publicar (conservar como copia, marcar "publicado", y cómo se rehidrata en otro equipo).
8. Catálogo de personajes/stages versionado en servidor y política de actualización.
9. Reglas de DQ: ¿límite de edición posterior, motivo obligatorio?
10. Formato por ronda: el motor permite cambiar BO3/BO5 por partida; ¿se restringe?

## 7. Riesgos

- **Divergencia motor TS / validador SQL** (principal): mitigada con vectores compartidos y pruebas de ambos lados.
- Crecimiento de `tournament_revisions` con snapshots completos (128 jugadores).
- Cascadas de corrección destructivas: exigir confirmación y devolver la lista antes de aplicar.
- Conflictos entre dos administradores (CAS) y UX de resolución explícita.
- Copias locales huérfanas tras eliminar un torneo remoto.
- Hora del cliente (`recordedAt`, `startedAt`) no confiable ⇒ el servidor la fija.
- Catálogo de personajes duplicado (cliente/servidor) hasta 15.6F.

## 8. Subfases siguientes (cada una con prueba SQL con ROLLBACK en stage-strike-tests)

- **A1** solo lectura: indicador de estado remoto/revisión en la UI; modo local intacto.
- **B** publicar + sorteo + inicio (`ss_publish_*`, `ss_start_tournament`).
- **C** `ss_record_result` (marcador y confirmación).
- **D** DQ y correcciones con cascada.
- **E** cliente: publicación explícita, cola de operaciones, pantalla de conflicto, prueba con dos cuentas.
- **F** personajes/stages/`details` con catálogo servidor.
