Quiero que implementes la Fase 5C: configuración de sesión, RPS y flujo guiado de bans.

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
- Sesión visual básica con cards de stages.
- Estilo oscuro/futurista/neón.

Objetivo de esta fase:
Mejorar la sesión de baneo para que sea guiada, clara y respete reglas básicas de interacción.

Esta fase debe corregir estos problemas actuales:

1. En la sesión se pueden banear demasiados stages sin respetar una secuencia.
2. En modo elegir stage se puede seleccionar un stage baneado.
3. Al elegir un stage baneado, parece desbloquearse o cambiar de estado incorrectamente.
4. Counterpicks deben estar visibles pero bloqueados en Game 1.

No implementes todavía:

- marcador visual completo con slots de victorias
- reporte de ganador del game
- avance automático real a Game 2, 3, 4 o 5
- finalización automática del set

Eso vendrá en Fase 5D.

Antes de modificar:

- Revisa la estructura actual del proyecto.
- Reutiliza lo que ya funciona.
- No rehagas toda la app.
- No rompas Home, detalle, crear/editar ruleset ni localStorage.
- Mantén TypeScript sin errores.

---

# Configuración de sesión

En la ruta de inicio de sesión o sesión setup, agrega o mejora un panel de configuración con:

1. Nombre de Jugador 1.
2. Nombre de Jugador 2.
3. Selector de formato:
   - Best of 3
   - Best of 5

El formato debe elegirse dentro de la sesión, no solamente dentro del ruleset.

Valores:

- Best of 3 significa first to 2.
- Best of 5 significa first to 3.

Si ya existe una pantalla de setup, úsala.
Si actualmente la sesión entra directo al tablero, agrega el panel en la misma pantalla antes o encima del tablero, sin romper rutas.

Valores default:

- Player 1
- Player 2
- Best of 3

---

# Panel superior de sesión

En la sesión visual, agrega o mejora un panel superior que muestre claramente:

- Nombre del ruleset.
- Game actual: por ahora Game 1.
- Formato del set: Best of 3 o Best of 5.
- Objetivo: First to 2 o First to 3.
- Nombres de Jugador 1 y Jugador 2.
- Estado del RPS.
- Turno actual.

Debe verse moderno, claro y visual, no como formulario genérico.

---

# RPS / piedra papel o tijera

Antes de permitir bans, la app debe pedir quién ganó RPS.

Muestra una sección clara:

“Piedra, papel o tijera”
“¿Quién ganó?”

Botones:

- Ganó Jugador 1
- Ganó Jugador 2

Después de elegir ganador:

- guarda el ganador de RPS
- inicia el flujo de striking
- muestra instrucción clara del turno actual

Ejemplo:

- “Arik ganó RPS.”
- “Arik empieza el striking.”
- “Arik debe banear 1 stage.”

Si no se ha elegido ganador de RPS:

- los stages no deben poder banearse ni elegirse
- muestra un mensaje visual: “Elige ganador de RPS para comenzar”

---

# Secuencia de bans de Game 1

Implementa una secuencia guiada de bans para Game 1 basada en la configuración del ruleset.

Usa los datos existentes del ruleset si ya tiene estructura de Game 1.
Si hace falta, usa estos campos o adapta a la estructura actual:

- firstBanCount
- secondBanCount
- pickerRule

Comportamiento recomendado para Game 1:

1. Ganador de RPS banea firstBanCount stages.
2. El otro jugador banea secondBanCount stages.
3. Después de los bans, el ganador de RPS elige stage entre los stages disponibles.

Importante:
Si el ruleset tiene otra lógica ya definida, respétala si es clara.
Pero evita que el usuario pueda banear ilimitadamente.

Instrucciones dinámicas:
Muestra algo como:

- “Arik debe banear 1 stage.”
- “Luis debe banear 2 stages.”
- “Arik debe elegir el stage de Game 1.”

También muestra progreso:

- bans restantes del turno actual
- fase actual: RPS, Ban, Pick

---

# Reglas de interacción de stages

Estas reglas son obligatorias:

## Stage disponible

- Puede ser baneado en modo ban.
- Puede ser elegido en modo elegir stage.
- Debe verse normal.

## Stage baneado

- No puede volver a tocarse para desbanearse durante el flujo guiado.
- No puede elegirse como stage.
- Debe verse con borde neón rojo, overlay o etiqueta “Baneado”.

## Stage elegido

- Debe verse con borde neón verde o estado destacado.
- Después de elegirlo, la fase de Game 1 queda completa.
- No debe cambiarse accidentalmente tocando otros stages, salvo que haya botón de reiniciar.

## Stage bloqueado

- No puede banearse.
- No puede elegirse.
- Debe verse grisado o con opacidad reducida.
- En Game 1, todos los counterpicks deben estar bloqueados.
- En Game 1, los counterpicks deben seguir visibles, pero no interactivos.

---

# Modos: ban y elegir stage

Si actualmente existen botones “Modo ban” y “Elegir stage”, cambia su rol:

- Deben funcionar principalmente como indicadores de la fase actual.
- No deben permitir saltarse la secuencia.
- El modo actual debe venir de la lógica de sesión.

Por ejemplo:

- Si la fase actual es ban, resalta “Modo ban”.
- Si la fase actual es pick, resalta “Elegir stage”.
- No permitas que el usuario elija manualmente un stage si todavía está en fase de ban.
- No permitas banear si está en fase de pick.

Si es más simple, puedes deshabilitar el cambio manual de modo y mostrarlo como estado visual.

---

# Después de elegir stage

Cuando el usuario elige el stage final de Game 1:

- Muestra una sección de resumen:
  - Stage elegido
  - Imagen del stage
  - Nombre del stage
  - Botón “Confirmar stage”
  - Botón “Reiniciar Game 1” o “Reiniciar sesión”

Por ahora NO avances automáticamente a Game 2.
Eso se implementará en Fase 5D.

Debe quedar claro que Game 1 ya está listo para jugarse.

---

# Counterpicks

En Game 1:

- starters activos
- counterpicks visibles pero bloqueados

En Game 2+:

- deja preparada la lógica o helper para desbloquear counterpicks
- pero no implementes todavía avance automático a Game 2 si no es parte actual del proyecto

---

# Diseño visual

Mantén y mejora:

- fondo oscuro
- cards glass
- acentos neón moderados
- imágenes protagonistas
- instrucciones cortas
- textos mínimos pero claros
- mobile-first
- botones grandes y cómodos
- animaciones suaves con Framer Motion

La sesión debe guiar a gente nueva sin sentirse infantil ni sobreexplicada.

---

# Componentes sugeridos

Puedes crear o mejorar:

- src/pages/SessionSetupPage.tsx
- src/pages/BanSessionPage.tsx
- src/components/session/PlayerSetupPanel.tsx
- src/components/session/SetFormatSelector.tsx
- src/components/session/RpsPanel.tsx
- src/components/session/SessionHeader.tsx
- src/components/session/TurnInstructionCard.tsx
- src/components/session/SessionStageCard.tsx
- src/components/session/SessionStageGrid.tsx
- src/hooks/useBanSession.ts
- src/utils/sessionFlow.ts

No es obligatorio usar exactamente estos nombres si ya existe otra estructura, pero mantén modularidad y claridad.

---

# Estado interno recomendado

Puedes usar estado local de React.

Modelo conceptual:

- player1Name
- player2Name
- setFormat: "BO3" | "BO5"
- currentGame: 1
- rpsWinnerId
- phase: "rps" | "ban" | "pick" | "complete"
- currentActorId
- banSteps
- currentBanStepIndex
- remainingBansInStep
- bannedStageIds
- selectedStageId

Mantén el estado simple y legible.

---

# Criterios de aceptación

Esta fase estará completa cuando:

1. La sesión pida o muestre Jugador 1 y Jugador 2.
2. La sesión tenga selector Best of 3 / Best of 5.
3. Se muestre First to 2 o First to 3 según el formato.
4. Antes de banear, se pida ganador de RPS.
5. No se pueda banear ni elegir antes de seleccionar ganador de RPS.
6. Game 1 respete una secuencia limitada de bans.
7. El usuario no pueda banear ilimitadamente.
8. Un stage baneado no pueda elegirse.
9. Un stage bloqueado no pueda banearse ni elegirse.
10. Counterpicks estén visibles pero bloqueados en Game 1.
11. El modo ban/elegir stage refleje la fase actual y no permita saltarse pasos.
12. Al elegir stage, se muestre resumen de stage elegido.
13. npm run build funcione.
14. npm run lint funcione si existe script.

Verificación final:
Al terminar:

1. Ejecuta npm run build.
2. Ejecuta npm run lint solo si existe ese script.
3. Corrige cualquier error antes de finalizar.
4. Resume:
   - archivos creados
   - archivos modificados
   - qué bugs se corrigieron
   - cómo funciona ahora el RPS
   - cómo funciona la secuencia de bans
   - qué debería hacerse en Fase 5D
