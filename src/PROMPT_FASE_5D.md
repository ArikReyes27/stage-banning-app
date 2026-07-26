Quiero que implementes la Fase 5D: marcador visual, reporte de ganador por game y avance real del set.

Contexto:
Estoy creando una web app de stage banning para Super Smash Bros. Ultimate usando React + TypeScript + Vite + Tailwind CSS + Framer Motion.

El proyecto ya tiene:

- Home funcional.
- Detalle de rulesets.
- Crear/editar/eliminar rulesets custom.
- localStorage para rulesets custom.
- Catálogo competitivo de 10 stages.
- Imágenes reales de stages.
- Selector visual para crear/editar rulesets.
- Sesión visual guiada con:
  - Jugador 1 y Jugador 2.
  - Selector Best of 3 / Best of 5.
  - RPS.
  - Secuencia limitada de bans.
  - Counterpicks bloqueados en Game 1.
  - Stages baneados no elegibles.
  - Resumen del stage elegido.
- Estilo oscuro/futurista/neón.

Objetivo de esta fase:
Completar el flujo del set para que la sesión pueda avanzar entre games, registrar ganadores y terminar correctamente en BO3 o BO5.

No implementes todavía:

- base de datos
- usuarios/cuentas
- favoritos
- compartir rulesets online
- Top 8 / Top 16
- lógica avanzada de DSR compleja

Eso vendrá en fases futuras.

Antes de modificar:

- Revisa la estructura actual del proyecto.
- Reutiliza lo que ya funciona.
- No rehagas toda la app.
- No rompas Home, detalle, crear/editar ruleset ni localStorage.
- Mantén TypeScript sin errores.
- Conserva el flujo guiado de Fase 5C.

---

# Marcador visual del set

Agrega un marcador visual en la sesión.

Debe mostrar:

- Jugador 1.
- Jugador 2.
- Game actual.
- Formato del set:
  - Best of 3
  - Best of 5
- Objetivo:
  - BO3 = First to 2
  - BO5 = First to 3
- Games ganados por cada jugador.

Importante:
No quiero que el marcador principal use números grandes.

Quiero un marcador visual con slots, puntos, cápsulas, diamantes, barras o cristales.

Ejemplo conceptual para BO3:

Jugador 1:
[lleno] [vacío]

Jugador 2:
[vacío] [vacío]

Ejemplo conceptual para BO5:

Jugador 1:
[lleno] [lleno] [vacío]

Jugador 2:
[lleno] [vacío] [vacío]

Puedes usar formas con CSS/Tailwind:

- cápsulas
- rombos
- cristales
- barras
- dots premium
- segmentos neón

El estado lleno debe verse claramente como game ganado.
El estado vacío debe verse como game pendiente.

---

# Reportar ganador del game

Después de que un stage fue elegido y confirmado para el game actual, muestra una sección clara:

- Stage elegido.
- Imagen del stage.
- Texto corto:
  - “Juega el game actual.”
  - “Cuando termine, reporta el ganador.”
- Botones:
  - “Ganó [Jugador 1]”
  - “Ganó [Jugador 2]”

Al tocar un ganador:

1. Suma una victoria de game al jugador correspondiente.
2. Guarda el resultado del game actual en un historial local del set.
3. Revisa si el set ya terminó.
4. Si el set no terminó:
   - avanza al siguiente game
   - limpia bans del game actual
   - limpia selectedStageId
   - reinicia la fase necesaria para el siguiente game
5. Si el set terminó:
   - muestra pantalla o panel de set terminado

---

# Avance entre games

El sistema debe avanzar correctamente:

## BO3

- Máximo posible: Game 3.
- El set termina cuando alguien llega a 2 games ganados.

## BO5

- Máximo posible: Game 5.
- El set termina cuando alguien llega a 3 games ganados.

Ejemplos:

- En BO3, si Jugador 1 gana Game 1 y Game 2, el set termina 2-0.
- En BO3, si van 1-1, se juega Game 3.
- En BO5, si alguien llega a 3 victorias, termina aunque no se hayan jugado 5 games.

---

# Flujo de Game 1 vs Game 2+

Mantén lo implementado en Fase 5C para Game 1:

- RPS.
- Striking inicial.
- Solo starters activos.
- Counterpicks visibles pero bloqueados.
- Secuencia limitada de bans.
- Pick del stage.

Ahora agrega flujo básico para Game 2+:

- Counterpicks desbloqueados.
- El pool disponible debe incluir starters + counterpicks.
- El ganador del game anterior debe banear según `laterGamesFlow.winnerBanCount` si existe.
- El perdedor del game anterior debe escoger stage si `laterGamesFlow.loserPicks` es true.
- Si el ruleset no tiene esos datos, usa defaults razonables:
  - winnerBanCount: 2
  - loserPicks: true
  - counterpicksUnlocked: true

Instrucciones dinámicas:

- “Game 2”
- “[Ganador anterior] banea 2 stages.”
- “[Perdedor anterior] elige stage.”
- “Counterpicks desbloqueados.”

---

# Reglas de interacción obligatorias

Estas reglas deben mantenerse en todos los games:

- Un stage baneado no puede elegirse.
- Un stage bloqueado no puede banearse.
- Un stage bloqueado no puede elegirse.
- Un stage elegido no debe cambiarse accidentalmente.
- Los bans se reinician por game.
- El stage elegido se reinicia por game.
- En Game 1 los counterpicks están bloqueados.
- En Game 2+ los counterpicks están desbloqueados si el ruleset lo permite.
- No permitir saltarse fases.

---

# Historial de games

Agrega un historial local del set.

Cada game registrado debe guardar algo equivalente a:

- gameNumber
- selectedStageId
- selectedStageName
- winnerId
- winnerName
- bannedStageIds

Muestra un resumen visual compacto del historial, por ejemplo:

- Game 1 · Pokémon Stadium 2 · Ganó Arik
- Game 2 · Smashville · Ganó Luis

Manténlo compacto, no debe ocupar demasiado.

---

# Set terminado

Cuando alguien gana el set:

Muestra un panel visual claro:

- “Set terminado”
- Ganador del set.
- Formato jugado.
- Marcador visual final.
- Historial de games.
- Botón “Reiniciar set”.
- Botón “Volver al ruleset”.

No avances a más games después de terminar el set.

---

# Reiniciar

Debe existir forma clara de reiniciar:

- Reiniciar game actual si aún no se reportó ganador.
- Reiniciar set completo.

Al reiniciar set:

- score vuelve a 0
- currentGame vuelve a 1
- historial se limpia
- RPS se reinicia
- bans se limpian
- selectedStageId se limpia
- set no queda terminado

---

# Diseño visual

Mantén y mejora:

- fondo oscuro
- glassmorphism
- acentos neón
- imágenes protagonistas
- instrucciones cortas
- botones grandes
- mobile-first
- buen diseño desktop
- microanimaciones con Framer Motion

La sesión debe sentirse como una herramienta competitiva premium, no como un formulario.

---

# Componentes sugeridos

Puedes crear o mejorar:

- src/components/session/SetScoreboard.tsx
- src/components/session/ScoreSlot.tsx
- src/components/session/GameResultPanel.tsx
- src/components/session/GameHistory.tsx
- src/components/session/SetCompletePanel.tsx
- src/hooks/useBanSession.ts
- src/utils/sessionFlow.ts
- src/pages/BanSessionPage.tsx
- src/pages/SessionSetupPage.tsx

No es obligatorio usar exactamente esos nombres si ya existe otra estructura, pero mantén modularidad.

---

# Estado interno recomendado

Puedes usar estado local de React.

Modelo conceptual:

- player1Name
- player2Name
- setFormat: "BO3" | "BO5"
- targetWins: 2 | 3
- currentGame
- player1Wins
- player2Wins
- gameHistory
- previousGameWinnerId
- previousGameLoserId
- phase:
  - "rps"
  - "ban"
  - "pick"
  - "stage-confirmed"
  - "game-result"
  - "set-complete"
- bannedStageIds
- selectedStageId
- setWinnerId

Adapta esto a la estructura actual si ya existe algo parecido.

---

# Criterios de aceptación

Esta fase estará completa cuando:

1. La sesión muestre un marcador visual para ambos jugadores.
2. El marcador use slots visuales y no números grandes como elemento principal.
3. BO3 muestre objetivo First to 2.
4. BO5 muestre objetivo First to 3.
5. Después de elegir stage, se pueda reportar ganador del game.
6. Al reportar ganador, el marcador se actualice.
7. Si nadie ha ganado el set, avance al siguiente game.
8. Game 2+ desbloquee counterpicks.
9. Game 2+ use bans del ganador anterior y pick del perdedor anterior.
10. Los bans se reinicien por game.
11. El stage elegido se reinicie por game.
12. El historial de games se muestre de forma compacta.
13. El set termine automáticamente al llegar a:
    - 2 victorias en BO3
    - 3 victorias en BO5
14. Al terminar el set, se muestre ganador final.
15. Exista botón para reiniciar set.
16. npm run build funcione.
17. npm run lint funcione si existe script.

Verificación final:
Al terminar:

1. Ejecuta npm run build.
2. Ejecuta npm run lint solo si existe ese script.
3. Corrige cualquier error antes de finalizar.
4. Resume:
   - archivos creados
   - archivos modificados
   - cómo quedó el marcador visual
   - cómo se reporta ganador de game
   - cómo avanza Game 2+
   - cómo termina el set
   - qué debería hacerse en la siguiente fase
