Quiero que implementes la Fase 4: sistema visual de stages e interfaz gráfica de rulesets/sesión del proyecto.

Contexto:
Estoy creando una web app de stage banning para Super Smash Bros. Ultimate usando React + TypeScript + Vite + Tailwind CSS + Framer Motion.

El proyecto ya debería tener implementado:

- estructura base modular
- Home funcional
- cards de rulesets
- detalle de ruleset
- creación/edición/eliminación de rulesets custom
- localStorage para rulesets custom
- navegación/rutas ya funcionando
- base visual futurista/oscura/neón

Objetivo de esta fase:
Quiero mejorar la experiencia visual de los stages y de los rulesets.

El objetivo principal es que los stages se vean como tarjetas con imagen, no solamente como texto, y que tanto en el detalle del ruleset como en la futura sesión de baneo la interfaz sea mucho más visual, moderna y fácil de entender de un vistazo.

Antes de modificar:

- Revisa la estructura actual del proyecto.
- Reutiliza lo que ya funciona.
- No rehagas toda la app si no es necesario.
- Refactoriza solo donde ayude a mejorar claridad, mantenibilidad o consistencia visual.

Referencia visual:
Existe una imagen de referencia en:

references/shine-city-reference.jpg

Úsala solo como referencia conceptual del contenido y la organización visual.
No copies el diseño literalmente.
Adapta la idea al estilo visual ya existente de la app:

- moderno
- neón
- elegante
- limpio
- con poco texto
- con imágenes de stages como protagonistas

Objetivos concretos:

1. Crear o mejorar un catálogo visual de stages competitivos.
2. Que los stages tengan:
   - id
   - name
   - image
   - isCompetitive
   - metadata adicional si hace falta
3. Ajustar el ruleset default Shine City con los stages correctos.
4. Que el detalle del ruleset muestre stages con imagen + nombre debajo.
5. Que crear/editar ruleset permita elegir stages desde una UI visual.
6. Que la sesión de baneo, o su base visual si todavía no existe completa, muestre stages como cards con imagen.
7. Que existan estados visuales claros:
   - disponible
   - baneado
   - seleccionado
   - bloqueado
8. Reducir texto visual innecesario y apoyarse más en imágenes, secciones, colores e íconos.
9. Mantener el estilo oscuro, futurista, gaming/eSports, glassmorphism y neón moderado.

Catálogo de stages competitivos:

Crea o mejora una fuente de verdad para los stages competitivos.

Archivo sugerido:
src/data/stageCatalog.ts

Cada stage debe tener al menos:

- id
- name
- image
- isCompetitive

Incluye como mínimo estos stages competitivos:

- Pokémon Stadium 2
- Battlefield
- Final Destination
- Hollow Bastion
- Small Battlefield
- Town and City
- Smashville
- Kalos Pokémon League

Si actualmente hay otros stages mock en el proyecto, puedes mantenerlos solo si no rompen nada, pero la experiencia principal debe centrarse en este pool competitivo.

Assets de imagen:

Organiza las rutas de imágenes de stages apuntando a:

public/images/stages/

Usa nombres consistentes como:

public/images/stages/pokemon-stadium-2.jpg
public/images/stages/battlefield.jpg
public/images/stages/final-destination.jpg
public/images/stages/hollow-bastion.jpg
public/images/stages/small-battlefield.jpg
public/images/stages/town-and-city.jpg
public/images/stages/smashville.jpg
public/images/stages/kalos-pokemon-league.jpg

Importante:
Si alguna imagen no existe todavía, la app NO debe romperse.

Implementa un fallback visual elegante:

- gradiente
- nombre del stage centrado
- estilo consistente con el tema visual

Shine City default ruleset:

Ajusta el ruleset default Shine City para que use:

Starters:

- Pokémon Stadium 2
- Battlefield
- Final Destination
- Hollow Bastion
- Small Battlefield

Counterpicks:

- Town and City
- Smashville
- Kalos Pokémon League

Asegúrate de que Lylat / Lylat Cruise NO forme parte de Shine City si actualmente aparece por error.

Reglas visuales de Shine City:

En el detalle del ruleset, muestra un resumen más visual del ruleset Shine City inspirado en la referencia:

Game 1:

- starters only
- striking
- ganador de RPS / piedra-papel-tijera inicia la secuencia correspondiente

Games siguientes:

- ganador banea
- perdedor escoge
- counterpicks desbloqueados

No copies literalmente el cartel de la foto.
Sí quiero que se entienda de forma visual y compacta.

Puedes incluir:

- íconos de manos/RPS si puedes hacerlo sin assets externos complicados
- flechas
- mini resumen de Game 1
- mini resumen de Games 2+
- texto mínimo y claro

Visualización de stages en detalle de ruleset:

Mejora la página de detalle para que:

1. Los starters se muestren como grid de cards con imagen.
2. Los counterpicks se muestren como grid de cards con imagen.
3. Debajo de cada imagen aparezca el nombre del stage.
4. Se distingan visualmente starters y counterpicks.
5. La sección se vea visual, limpia y responsive.

Crea o mejora componentes como:

- src/components/stages/StageThumbnailCard.tsx
- src/components/stages/StageGrid.tsx

Cada card debe tener:

- imagen destacada
- nombre del stage debajo
- esquinas redondeadas
- borde suave
- hover/tap feedback
- overlay sutil para legibilidad
- estilo neón/futurista sin exagerar

Crear y editar rulesets: selector visual de stages

En crear/editar ruleset, quiero cambiar la forma en la que se agregan stages.

En vez de depender principalmente de texto manual, quiero una experiencia visual.

Requisitos:

1. Permite elegir starters y counterpicks desde un catálogo visual.
2. Cada opción del catálogo debe verse con:
   - miniatura de imagen
   - nombre
3. Debe poder seleccionarse/deseleccionarse con click/tap.
4. Debe quedar claro qué stages están en:
   - starters
   - counterpicks
   - no seleccionados
5. No permitir duplicados entre starters y counterpicks.
6. Mantener las validaciones ya existentes.
7. Si actualmente existe input manual, puedes reemplazarlo por completo o dejarlo como soporte secundario, pero la experiencia principal debe ser visual.

Sesión de baneo: stages con imagen y estados visuales

Si ya existe una base de sesión de baneo, adáptala para que los stages se vean con imagen.

Si todavía no existe completa, crea una base visual sólida lista para conectar con la lógica futura.

En la sesión, cada stage debe mostrarse como una card con imagen y nombre.

Estados visuales:

Disponible:

- card normal
- borde sutil
- hover/tap state

Baneado:

- borde neón rojo
- overlay o indicador visual claro
- opcional: ícono X o etiqueta pequeña

Seleccionado/elegido:

- borde neón verde
- aspecto destacado

Bloqueado:

- grisado / opacidad reducida
- especialmente para counterpicks durante Game 1
- no debe poder seleccionarse si está bloqueado

Flujo visual esperado:

- En Game 1, solo starters activos.
- En Game 1, counterpicks visibles pero bloqueados en gris.
- En Games 2+, counterpicks desbloqueados.
- Mantén el comportamiento actual si ya existe lógica.
- Si falta lógica compleja, no inventes una implementación gigante; deja la base visual bien integrada y funcional con el estado actual.

Interacción:

- Las cards deben ser cómodas en celular.
- Deben poder tocarse fácilmente.
- El borde neón debe rodear la card completa.
- El nombre debe verse claramente.

Componentes sugeridos:

Puedes crear o mejorar:

- src/data/stageCatalog.ts
- src/components/stages/StageThumbnailCard.tsx
- src/components/stages/StageGrid.tsx
- src/components/stages/StagePicker.tsx
- src/components/rulesets/RulesetStageSection.tsx
- src/components/rulesets/RulesetOverviewVisual.tsx
- src/components/session/SessionStageCard.tsx
- src/components/session/SessionStageGrid.tsx
- src/pages/RulesetDetailPage.tsx
- src/pages/CreateRulesetPage.tsx
- src/pages/EditRulesetPage.tsx
- src/pages/SessionSetupPage.tsx
- src/pages/BanSessionPage.tsx

No es obligatorio usar exactamente esos nombres si ya existe otra estructura, pero mantén el código modular.

Estilo visual:

Mantén y mejora:

- fondo oscuro
- gradientes sutiles
- glassmorphism
- bordes semitransparentes
- neón moderado
- look moderno y competitivo
- cards elegantes
- responsive mobile-first
- desktop bien espaciado
- animaciones suaves con Framer Motion

Requisitos técnicos:

- Mantén TypeScript sin errores.
- No rompas rutas existentes.
- Reutiliza componentes si ya existen.
- No metas toda la lógica en una sola página.
- Usa Tailwind.
- Usa Framer Motion para microanimaciones.
- Si falta una imagen, usa fallback.
- Mantén compatibilidad con localStorage y rulesets custom.
- No rompas crear/editar/eliminar rulesets.
- No rompas Home ni detalle.

Criterios de aceptación:

Esta fase estará completa cuando:

1. Shine City muestre los stages correctos:
   Starters:
   - Pokémon Stadium 2
   - Battlefield
   - Final Destination
   - Hollow Bastion
   - Small Battlefield

   Counterpicks:
   - Town and City
   - Smashville
   - Kalos Pokémon League

2. Los stages se muestren con imagen + nombre en el detalle.
3. Crear/editar ruleset permita seleccionar stages visualmente.
4. La sesión de baneo, o su base visual actual, muestre stages como cards con imagen.
5. Los estados visuales sean claros:
   - disponible
   - baneado
   - seleccionado
   - bloqueado
6. En Game 1 los counterpicks se vean pero estén bloqueados.
7. La UI use menos texto y se apoye más en imágenes.
8. La app compile sin errores.
9. La experiencia siga funcionando bien en mobile y desktop.

Verificación final:

Al terminar:

1. Ejecuta npm run build.
2. Ejecuta npm run lint solo si existe ese script.
3. Corrige cualquier error antes de finalizar.
4. Resume:
   - archivos creados
   - archivos modificados
   - qué quedó funcionando
   - cómo quedó implementado el catálogo visual de stages
   - cómo quedó Shine City
   - qué debería hacerse en la siguiente fase
