Quiero que actúes como un desarrollador senior frontend/product engineer.

Estoy construyendo una web app para mi comunidad competitiva de **Super Smash Bros. Ultimate**. La app será una herramienta moderna de **stage banning** basada en rulesets de comunidades, con una interfaz mobile-first, vistosa, futurista y cómoda de usar durante sets presenciales.

## Stack técnico deseado

Usa preferentemente:

- React
- TypeScript
- Vite
- Tailwind CSS
- Framer Motion
- Arquitectura modular y limpia
- Componentes reutilizables
- Estado local bien organizado
- Persistencia local con `localStorage` para el MVP
- Diseño responsive mobile-first
- Buen soporte desktop

No uses assets protegidos de Nintendo, Smash Bros. o personajes oficiales. El diseño puede estar inspirado en el ambiente competitivo, neón, futurista, arcade/eSports, pero sin copiar arte, logos ni assets protegidos.

---

# Objetivo principal del MVP

Crear una web app funcional para hacer sesiones de stage banning en un solo dispositivo.

El MVP debe priorizar:

1. Home con buscador de rulesets.
2. Cards bonitas de rulesets predeterminados o creados por usuarios.
3. Opción para crear nuevo ruleset.
4. Vista de detalle del ruleset.
5. Sesión de baneo de escenarios en un solo dispositivo.
6. Configuración de jugadores.
7. Opción de elegir BO3 o BO5 dentro de la sesión, no solo dentro del ruleset.
8. Flujo guiado por turnos para banear y escoger escenarios.
9. Starter stages activos en Game 1.
10. Counterpicks visibles pero bloqueados en gris durante Game 1.
11. Counterpicks desbloqueados automáticamente desde Game 2.
12. Bans marcados con borde rojo neón.
13. Stage elegido marcado con borde verde neón.
14. Marcador del set y reporte de ganador por game.
15. La app debe indicar automáticamente:
    - A quién le toca banear.
    - Cuántos escenarios debe banear.
    - Quién debe escoger stage.
    - Qué acción sigue.

16. UX profesional, clara, cómoda para celular y desktop.
17. Diseño moderno, vistoso, futurista, inspirado en el ambiente competitivo de Smash Ultimate.

---

# Concepto de producto

La app debe servir para que dos jugadores puedan abrir la herramienta en un celular o laptop y seguir el proceso de stage striking/banning sin confusión.

Debe sentirse como una herramienta profesional de torneo:

- Clara.
- Rápida.
- Visual.
- Sin texto innecesario.
- Con estados muy evidentes.
- Con animaciones suaves.
- Con feedback visual cuando se banea, se escoge o se termina un game.
- Con un flujo guiado para evitar que los jugadores tengan que recordar el ruleset.

---

# Ruleset de ejemplo inicial

Incluye como ruleset predeterminado:

## Shine City

Starter stages:

- Battlefield
- Small Battlefield
- Pokémon Stadium 2
- Hollow Bastion
- Final Destination

Counterpicks:

- Deben ser configurables.
- Puedes agregar algunos placeholders razonables para el MVP, por ejemplo:
  - Town and City
  - Smashville
  - Kalos Pokémon League
  - Lylat Cruise
  - Yoshi’s Story

Reglas del flujo:

## Game 1

- Solo los starter stages están activos.
- Los counterpicks deben aparecer visibles, pero bloqueados en gris.
- Debe existir un flujo tipo RPS o selección inicial para decidir quién empieza.
- Un jugador banea.
- El otro jugador banea.
- Luego alguien escoge stage según la configuración del ruleset.
- La app debe mostrar paso a paso qué jugador actúa.

## Game 2 en adelante

- Los counterpicks se desbloquean automáticamente.
- El ganador del game anterior banea cierta cantidad de escenarios.
- El perdedor del game anterior escoge stage.
- La app debe permitir reportar quién ganó cada game.
- El marcador del set debe actualizarse.
- La sesión termina automáticamente cuando alguien gana:
  - 2 games en BO3.
  - 3 games en BO5.

---

# Requisito importante: BO3 / BO5 dentro de la sesión

La elección de BO3 o BO5 no debe estar fija únicamente en el ruleset.

Dentro de la sesión de baneo, antes o durante la configuración inicial, debe existir una opción clara para elegir:

- Best of 3
- Best of 5

Esto debe afectar automáticamente:

- El número de games necesarios para ganar.
- El marcador.
- La condición de finalización del set.
- El texto de la interfaz.

---

# Modelo de datos sugerido

Puedes ajustar la estructura si encuentras una mejor, pero propón algo similar:

```ts
type StageType = "starter" | "counterpick";

type Stage = {
  id: string;
  name: string;
  type: StageType;
  image?: string;
};

type Ruleset = {
  id: string;
  name: string;
  community: string;
  description?: string;
  stages: Stage[];
  gameOneFlow: {
    enabledStages: "startersOnly";
    firstBanCount: number;
    secondBanCount: number;
    pickerRule: "player1" | "player2" | "rpsWinner" | "rpsLoser" | "custom";
  };
  laterGamesFlow: {
    winnerBanCount: number;
    loserPicks: boolean;
    counterpicksUnlocked: boolean;
  };
};

type Player = {
  id: "player1" | "player2";
  name: string;
};

type SetFormat = "BO3" | "BO5";

type StageStatus = "available" | "locked" | "banned" | "picked";

type GameResult = {
  gameNumber: number;
  stageId: string;
  winnerId: Player["id"];
};

type SessionState = {
  rulesetId: string;
  players: Player[];
  setFormat: SetFormat;
  currentGame: number;
  score: {
    player1: number;
    player2: number;
  };
  stageStatuses: Record<string, StageStatus>;
  currentTurn: {
    playerId: Player["id"];
    action: "ban" | "pick" | "reportWinner";
    remainingActions: number;
  };
  selectedStageId?: string;
  gameResults: GameResult[];
  previousGameWinnerId?: Player["id"];
  previousGameLoserId?: Player["id"];
  isSetComplete: boolean;
};
```

---

# Pantallas principales

## 1. Home

Debe incluir:

- Hero visual moderno.
- Título claro de la app.
- Subtítulo explicando que es una herramienta de stage banning para comunidades de Smash Ultimate.
- Buscador de rulesets.
- Sección de rulesets destacados.
- Cards de rulesets.
- Botón para crear nuevo ruleset.
- Botón para iniciar sesión rápida con un ruleset.

La Home debe verse bien en celular y desktop.

---

## 2. Ruleset Cards

Cada card debe mostrar:

- Nombre del ruleset.
- Comunidad.
- Número de starters.
- Número de counterpicks.
- Descripción corta.
- Botón “Ver ruleset”.
- Botón “Iniciar baneo”.
- Estilo visual con glassmorphism, bordes suaves, sombras, neón moderado y animaciones hover/tap.

---

## 3. Crear nuevo ruleset

Crear una vista o modal para añadir un ruleset nuevo.

Debe permitir:

- Nombre del ruleset.
- Nombre de la comunidad.
- Descripción.
- Agregar starters.
- Agregar counterpicks.
- Configurar número de bans en Game 1.
- Configurar número de bans en Game 2+.
- Guardar en localStorage.

Para el MVP no hace falta backend.

---

## 4. Detalle de ruleset

Debe mostrar:

- Nombre.
- Comunidad.
- Descripción.
- Lista de starter stages.
- Lista de counterpicks.
- Resumen de reglas para Game 1.
- Resumen de reglas para Game 2+.
- Botón para iniciar sesión.
- Botón para editar ruleset si es creado por usuario.

---

## 5. Configuración de sesión

Antes de empezar el baneo, pedir:

- Nombre de Player 1.
- Nombre de Player 2.
- Formato del set:
  - BO3
  - BO5

- Resultado o selección del RPS:
  - Ganó Player 1
  - Ganó Player 2

Después de esto, iniciar el flujo del Game 1.

---

## 6. Sesión de stage banning

Esta es la pantalla más importante.

Debe incluir:

### Header de sesión

- Nombre del ruleset.
- Game actual.
- Formato BO3/BO5.
- Marcador:
  - Player 1: número de games ganados.
  - Player 2: número de games ganados.

### Indicador de turno

Debe ser muy claro y grande:

Ejemplos:

- “Le toca banear a Player 1”
- “Player 2 debe banear 2 escenarios”
- “Player 1 debe escoger stage”
- “Reporta el ganador del Game 1”

### Grid de stages

Cada stage debe mostrarse como una card o tile.

Estados visuales:

- Disponible: normal.
- Bloqueado: gris, opacidad baja, cursor deshabilitado.
- Baneado: borde rojo neón, overlay “BANNED”.
- Escogido: borde verde neón, overlay “PICKED”.
- Hover/tap: animación ligera.

Reglas visuales:

- En Game 1:
  - Starters activos.
  - Counterpicks visibles pero bloqueados en gris.

- En Game 2+:
  - Starters y counterpicks disponibles, salvo los baneados durante ese game.

- Al iniciar cada game, los bans temporales deben reiniciarse.
- El stage elegido debe registrarse en el historial del game.

### Acciones

- Botón para confirmar bans cuando aplique.
- Botón para confirmar stage elegido.
- Botones para reportar ganador:
  - “Ganó Player 1”
  - “Ganó Player 2”

- Botón para reiniciar sesión.
- Botón para volver a Home.

---

# Lógica del flujo

Implementa una lógica clara, idealmente separada en hooks o utilidades.

Sugerencia:

- `useRulesets`
- `useStageBanSession`
- `useLocalStorage`
- `getAvailableStagesForGame`
- `getNextTurn`
- `applyBan`
- `applyPick`
- `reportGameWinner`
- `isSetOver`

La app debe evitar acciones inválidas:

- No se puede banear un stage bloqueado.
- No se puede escoger un stage bloqueado.
- No se puede banear un stage ya baneado.
- No se puede escoger un stage ya baneado.
- No se puede reportar ganador antes de escoger stage.
- No se puede continuar el set si ya terminó.

---

# Diseño visual

Quiero un diseño moderno, futurista y competitivo.

Inspiración visual:

- Neón rojo para bans.
- Neón verde para picks.
- Fondos oscuros.
- Gradientes sutiles.
- Glassmorphism.
- Bordes brillantes.
- Cards con profundidad.
- Animaciones suaves con Framer Motion.
- Microinteracciones al tocar o seleccionar stages.
- UI clara en mobile.
- Buen layout desktop con más espacio visual.

No debe parecer una app genérica de formularios.

Debe sentirse como una herramienta para una comunidad competitiva de videojuegos.

---

# Arquitectura sugerida de carpetas

Propón e implementa algo parecido:

```txt
src/
  app/
    App.tsx
    routes.tsx
  components/
    layout/
    ui/
    rulesets/
    session/
    stages/
  data/
    defaultRulesets.ts
  hooks/
    useLocalStorage.ts
    useRulesets.ts
    useStageBanSession.ts
  types/
    ruleset.ts
    session.ts
  utils/
    stageFlow.ts
    setFormat.ts
  pages/
    HomePage.tsx
    RulesetDetailPage.tsx
    CreateRulesetPage.tsx
    SessionSetupPage.tsx
    StageBanSessionPage.tsx
  styles/
    globals.css
```

Puedes simplificar si lo consideras necesario, pero mantén una estructura escalable.

---

# Fases de desarrollo

Trabaja por fases. No intentes hacer todo de forma caótica.

## Fase 1: Setup y estructura base

- Crear proyecto con Vite, React y TypeScript.
- Configurar Tailwind CSS.
- Configurar Framer Motion.
- Crear layout base.
- Crear navegación básica entre pantallas.
- Crear tipos principales.
- Crear data inicial del ruleset Shine City.

Entregable: app corriendo con Home básica y navegación.

---

## Fase 2: Home y rulesets

- Diseñar Home.
- Crear buscador de rulesets.
- Crear cards visuales.
- Mostrar rulesets default y rulesets creados por usuario.
- Persistir rulesets de usuario en localStorage.
- Botón para crear ruleset.
- Botón para ver detalle.
- Botón para iniciar sesión.

Entregable: Home funcional y visualmente atractiva.

---

## Fase 3: Crear y ver rulesets

- Implementar formulario para crear ruleset.
- Permitir agregar starters.
- Permitir agregar counterpicks.
- Permitir configurar bans Game 1 y Game 2+.
- Guardar ruleset.
- Implementar página de detalle del ruleset.

Entregable: CRUD básico local de rulesets.

---

## Fase 4: Configuración de sesión

- Crear pantalla para configurar Player 1 y Player 2.
- Seleccionar BO3 o BO5.
- Seleccionar ganador de RPS.
- Crear estado inicial de sesión.
- Navegar a la pantalla de baneo.

Entregable: sesión inicializable desde cualquier ruleset.

---

## Fase 5: Motor de stage banning

Implementar la lógica principal:

- Game 1 con starters activos.
- Counterpicks visibles pero bloqueados.
- Flujo de bans según ruleset.
- Flujo de pick.
- Game 2+ con counterpicks desbloqueados.
- Ganador banea.
- Perdedor escoge.
- Reinicio de bans por game.
- Registro del stage elegido.
- Reporte de ganador.
- Actualización de marcador.
- Detección de fin de set según BO3/BO5.

Entregable: stage banning funcional de principio a fin.

---

## Fase 6: UI avanzada de sesión

Mejorar la experiencia visual:

- Indicador grande de turno actual.
- Cards de stages con estados claros.
- Animaciones con Framer Motion.
- Borde rojo neón para bans.
- Borde verde neón para pick.
- Counterpicks en gris durante Game 1.
- Feedback visual al seleccionar.
- Mejoras de responsive design.

Entregable: sesión cómoda, clara y vistosa.

---

## Fase 7: Pulido del MVP

- Manejo de errores.
- Empty states.
- Confirmaciones ligeras.
- Botón para reiniciar sesión.
- Botón para volver a Home.
- Historial de games.
- Resumen final del set.
- Mejorar accesibilidad básica:
  - Botones claros.
  - Estados visibles.
  - Textos legibles.
  - Contraste suficiente.

Entregable: MVP usable para testear con mi comunidad.

---

# Módulo futuro: generador de imágenes Top 8 / Top 16

Este módulo NO es prioridad del MVP. Solo debe quedar planeado o preparado en arquitectura, no implementado todavía salvo que sobre tiempo.

La idea:

- No será un bracket como Start.gg o Challonge.
- Solo se ingresan:
  - Posición.
  - Jugador.
  - Main.
  - Color/skin del personaje.

- Selector de personaje con búsqueda.
- Selector de color/alt del personaje.
- Vista previa del gráfico.
- Descarga como PNG.
- Fondos temáticos por saga/personaje.
- Inspiración visual en stages relacionados.
- No usar assets protegidos sin permiso.
- Diseñar de manera que más adelante se puedan conectar assets propios, generados o autorizados.

Planea una ruta futura como:

```txt
/pages/TopCutGeneratorPage.tsx
/components/topcut/
```

Pero no le des prioridad sobre el stage banning.

---

# Criterios de calidad

La solución debe:

- Compilar sin errores TypeScript.
- Tener componentes limpios.
- Evitar lógica gigante dentro de componentes visuales.
- Separar lógica de sesión en hooks/utilidades.
- Ser fácil de extender.
- Ser responsive.
- Tener UI atractiva.
- Usar datos mock/locales inicialmente.
- No requerir backend.
- No usar imágenes protegidas.
- Mantener el MVP enfocado en el stage banning.

---

# Resultado esperado

Primero analiza el proyecto y propón un plan breve de implementación.

Luego implementa por fases.

En cada fase:

1. Explica qué vas a tocar.
2. Crea o modifica los archivos necesarios.
3. Mantén el proyecto compilable.
4. Evita romper funcionalidades anteriores.
5. Al terminar, resume qué quedó listo y qué sigue.

Prioriza funcionalidad real sobre placeholders decorativos, pero cuida mucho la UX visual.

El objetivo final es tener un MVP funcional y bonito para probar sesiones de stage banning de Super Smash Bros. Ultimate en celular y desktop.
