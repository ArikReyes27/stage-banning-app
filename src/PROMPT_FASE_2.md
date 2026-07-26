Quiero que mejores y completes la Fase 2: Home y exploración de rulesets del proyecto.

Contexto:
Estoy creando una web app de stage banning para Super Smash Bros. Ultimate usando React + TypeScript + Vite + Tailwind CSS + Framer Motion.

El proyecto ya tiene una estructura base creada por Codex:

- Tipos principales.
- Tailwind configurado.
- Framer Motion instalado.
- Navegación básica.
- Rulesets mock, incluyendo Shine City.
- Home y detalle básico de ruleset.

Objetivo:
Mejorar la Home y la experiencia de exploración de rulesets sin implementar todavía el motor completo de stage banning.

Importante:
No reescribas toda la app si ya existe una implementación funcional. Primero revisa la estructura actual y reutiliza lo que ya sirve. Refactoriza solo donde ayude a mantener el código limpio.

Implementa:

1. Pantalla Home visualmente atractiva.
2. Buscador de rulesets.
3. Cards modernas de rulesets.
4. Mostrar rulesets predeterminados y rulesets creados por usuario.
5. Persistencia inicial con localStorage para rulesets de usuario.
6. Botones para:
   - Ver detalle del ruleset.
   - Iniciar sesión de baneo.
   - Crear nuevo ruleset.

No implementes todavía toda la lógica profunda de creación, detalle o sesión. En esta fase pueden existir pantallas placeholder si todavía no están listas, pero los botones deben navegar o cambiar de vista correctamente.

Home:

Crea o mejora una sección hero con:

- Título llamativo.
- Subtítulo breve.
- Descripción clara de la app.
- Botón principal: “Crear ruleset”.
- Botón secundario: “Explorar rulesets” o scroll hacia la lista.
- Estilo oscuro, competitivo, moderno y futurista.
- Gradientes sutiles.
- Efectos glassmorphism.
- Detalles tipo neón sin exagerar.

Copy sugerido:

Título:
“Stage banning para comunidades competitivas”

Subtítulo:
“Configura rulesets, guía bans por turnos y juega sets de Smash Ultimate sin confusión.”

Descripción:
“Una herramienta mobile-first para seguir procesos de strike, ban y counterpick desde un solo dispositivo.”

Puedes mejorar el copy si ayuda a que la UI se sienta más profesional.

Buscador de rulesets:

Agrega o mejora un buscador en la Home.

Debe filtrar por:

- Nombre del ruleset.
- Comunidad.
- Descripción.
- Nombres de stages.

Comportamiento:

- Filtrado en tiempo real.
- Ignorar mayúsculas/minúsculas.
- Mostrar empty state visual si no hay resultados.
- Buen diseño en mobile y desktop.
- El buscador debe estar conectado a la lista de cards.
- Usa useMemo para el filtrado si tiene sentido.

Cards de rulesets:

Crea o mejora un componente reutilizable, por ejemplo:
src/components/rulesets/RulesetCard.tsx

Cada card debe mostrar:

- Nombre del ruleset.
- Comunidad.
- Descripción corta.
- Número de starter stages.
- Número de counterpicks.
- Total de stages.
- Resumen pequeño de reglas:
  - Game 1: starters only.
  - Game 2+: counterpicks unlocked.
- Botón “Ver ruleset”.
- Botón “Iniciar baneo”.

Diseño de card:

- Fondo oscuro con glassmorphism.
- Bordes suaves.
- Sombra.
- Hover en desktop.
- Tap feedback en mobile.
- Animaciones suaves con Framer Motion.
- Detalles visuales con acentos neón.
- Que no parezca una card genérica.

Rulesets disponibles:

La Home debe combinar:

1. Rulesets predeterminados desde defaultRulesets.
2. Rulesets creados por usuario desde localStorage.

Si todavía no existe el hook, crea:
src/hooks/useRulesets.ts

Este hook debe:

- Leer rulesets default.
- Leer rulesets custom de localStorage.
- Combinar ambos en una lista.
- Exponer la lista de rulesets.
- Dejar preparada una función para agregar rulesets más adelante.
- Evitar duplicados de ID si es posible.
- Al leer localStorage, manejar errores con try/catch.
- Si el contenido de localStorage no es válido, usar un array vacío de custom rulesets.

También puedes crear o reutilizar:
src/hooks/useLocalStorage.ts

Rutas y navegación:

Puedes instalar y configurar react-router-dom si todavía no existe, porque esta fase ya necesita rutas reales.

Rutas esperadas:

- Ver detalle: /rulesets/:rulesetId
- Iniciar baneo: /session/setup/:rulesetId
- Crear nuevo ruleset: /rulesets/new

Si las pantallas finales todavía no están implementadas, crea placeholders simples para evitar errores de navegación.

Componentes sugeridos:

Puedes crear o mejorar:

- src/pages/HomePage.tsx
- src/components/rulesets/RulesetCard.tsx
- src/components/rulesets/RulesetSearch.tsx
- src/components/rulesets/RulesetGrid.tsx
- src/components/ui/Button.tsx
- src/components/ui/Badge.tsx
- src/hooks/useRulesets.ts
- src/hooks/useLocalStorage.ts

No es obligatorio usar exactamente estos nombres si ya existe otra estructura, pero mantén el código modular y limpio.

Detalles visuales:

El estilo debe sentirse como una herramienta competitiva gaming/eSports, no como una app administrativa genérica.

Usa:

- Fondo oscuro.
- Gradientes.
- Bordes semi-transparentes.
- Cards tipo glass.
- Acentos neón.
- Animaciones sutiles.
- Layout cómodo para celular.
- En desktop, grid de cards con buen espaciado.
- Tipografía clara y legible.
- Estados hover/focus accesibles.

Evita:

- Colores planos genéricos.
- Formularios sin estilo.
- Botones aburridos.
- Interfaces demasiado cargadas.
- Assets protegidos de Nintendo, Smash Bros. o personajes oficiales.

Requisitos técnicos:

- Mantén TypeScript sin errores.
- No rompas la navegación existente.
- Evita lógica duplicada.
- No pongas toda la lógica dentro de HomePage.
- Usa componentes reutilizables.
- Usa Framer Motion para animaciones ligeras.
- Usa Tailwind para estilos.
- Mantén la app responsive.
- No implementes el motor completo de stage banning.
- No implementes el formulario avanzado de crear ruleset.
- No implementes el módulo Top 8 / Top 16.

Criterios de aceptación:

Esta fase estará completa cuando:

1. La Home se vea moderna y profesional.
2. Se muestren los rulesets default.
3. El ruleset Shine City aparezca como card.
4. El buscador filtre correctamente.
5. Las cards muestren comunidad, descripción y conteos de stages.
6. Los botones naveguen a rutas válidas o pantallas placeholder válidas.
7. Los custom rulesets se puedan leer desde localStorage aunque todavía no exista el formulario final.
8. La app compile sin errores.
9. La UI funcione bien en mobile y desktop.

Al terminar:

- Ejecuta npm run build.
- Ejecuta npm run lint si existe script de lint.
- Corrige errores antes de finalizar.
- Resume archivos creados.
- Resume archivos modificados.
- Explica qué quedó funcionando.
- Sugiere qué debería hacerse en la Fase 3.
