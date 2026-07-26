Quiero que implementes la Fase 5B: selector visual de stages para crear y editar rulesets.

Contexto:
Estoy creando una web app de stage banning para Super Smash Bros. Ultimate usando React + TypeScript + Vite + Tailwind CSS + Framer Motion.

El proyecto ya tiene:

- Home funcional.
- Detalle de rulesets.
- Crear/editar/eliminar rulesets custom.
- localStorage para rulesets custom.
- Catálogo competitivo de 10 stages.
- Imágenes reales en public/images/stages/.
- Cards visuales de stages con imagen/fallback.
- Shine City corregido.
- Sesión visual básica.
- Estilo oscuro/futurista/neón.

Objetivo de esta fase:
Mejorar la experiencia de crear y editar rulesets para que la selección de stages sea visual, cómoda y clara.

No implementes todavía:

- RPS guiado.
- BO3 / BO5.
- marcador visual.
- avance automático de games.
- motor completo de stage banning.

Eso vendrá en fases siguientes.

Antes de modificar:

- Revisa la estructura actual del proyecto.
- Reutiliza lo que ya funciona.
- No rehagas toda la app.
- No rompas Home, detalle, sesión visual, crear/editar/eliminar rulesets ni localStorage.
- Mantén TypeScript sin errores.

Catálogo:
Usa el catálogo de stages existente como única fuente de verdad.

Debe incluir estos 10 stages con imágenes reales:

- Final Destination
- Battlefield
- Small Battlefield
- Pokémon Stadium 2
- Hollow Bastion
- Town and City
- Smashville
- Kalos Pokémon League
- Yoshi's Story
- Lylat Cruise

Objetivo UX:
En crear y editar ruleset, el usuario debe poder elegir stages desde una interfaz visual.

Quiero mantener la idea de:

- Asignar starters.
- Asignar counterpicks.

La experiencia debe ser clara:

1. El usuario elige si está asignando starters o counterpicks.
2. Ve un grid visual con todos los stages del catálogo.
3. Toca/clickea una card para agregarla o quitarla de la sección activa.
4. La card muestra imagen y nombre.
5. La UI deja claro si un stage está:
   - sin seleccionar
   - asignado como starter
   - asignado como counterpick
   - no disponible para la sección actual porque ya está en la otra sección

Comportamiento:

- Si el modo activo es "Asignar starters", al tocar un stage:
  - si no está seleccionado, se agrega a starters
  - si ya está en starters, se quita de starters
  - si está en counterpicks, no se duplica; debe mostrar estado de bloqueo o permitir moverlo con una acción clara, pero evita duplicados
- Si el modo activo es "Asignar counterpicks", al tocar un stage:
  - si no está seleccionado, se agrega a counterpicks
  - si ya está en counterpicks, se quita de counterpicks
  - si está en starters, no se duplica; debe mostrar estado de bloqueo o permitir moverlo con una acción clara, pero evita duplicados

Recomendación:
Para mantenerlo simple, no muevas automáticamente un stage de starters a counterpicks o viceversa.
Si un stage ya está en la otra sección, muéstralo bloqueado con una etiqueta tipo:

- “Starter”
- “Counterpick”
- “Ya asignado”

Diseño:
El selector visual debe sentirse como parte de la app:

- fondo oscuro
- glassmorphism
- bordes suaves
- acentos neón moderados
- imágenes protagonistas
- texto mínimo
- mobile-first
- buen grid en desktop
- tarjetas cómodas para tocar en celular
- animaciones suaves con Framer Motion

Componentes sugeridos:
Puedes crear o mejorar:

- src/components/stages/StagePicker.tsx
- src/components/stages/StageSelectCard.tsx
- src/components/rulesets/RulesetForm.tsx
- src/components/rulesets/StageListEditor.tsx
- src/components/ui/SegmentedControl.tsx
- src/components/ui/Badge.tsx

No es obligatorio usar exactamente estos nombres si ya existe otra estructura, pero mantén el código modular.

Detalles visuales de las cards:
Cada stage en el selector debe mostrar:

- imagen real del stage
- nombre debajo o como overlay legible
- borde de estado
- etiqueta pequeña si ya es starter/counterpick
- feedback visual al seleccionar/deseleccionar
- fallback si la imagen falla

Estados visuales:

- Sin seleccionar:
  - borde sutil
  - imagen normal
- Starter:
  - borde neón cyan o verde
  - etiqueta “Starter”
- Counterpick:
  - borde neón morado o rosa
  - etiqueta “Counterpick”
- Bloqueado por estar en otra sección:
  - opacidad reducida
  - etiqueta “Ya asignado”
  - no debe duplicarse

Resumen de selección:
En el formulario, muestra un resumen visual:

- número de starters seleccionados
- número de counterpicks seleccionados
- mini lista o chips visuales de los stages seleccionados
- advertencias si faltan starters
- mensaje si no hay counterpicks

Validaciones:
Mantén y/o mejora estas validaciones:

- Nombre requerido.
- Comunidad requerida.
- Al menos 3 starters.
- No duplicados dentro de starters.
- No duplicados dentro de counterpicks.
- No duplicados entre starters y counterpicks.
- Game 1 debe dejar al menos 1 starter disponible después de los bans.
- Bans no negativos.
- Bans enteros.

Importante:
No uses solamente alert para errores.
Muestra errores en la UI.

Crear ruleset:
En /rulesets/new:

- El selector visual debe aparecer para elegir starters y counterpicks.
- El usuario debe poder guardar un ruleset válido.
- Después de guardar, debe aparecer en Home.
- Debe guardarse en localStorage.

Editar ruleset:
En /rulesets/:rulesetId/edit:

- El selector visual debe cargar los stages actuales del ruleset.
- Debe permitir modificar starters/counterpicks visualmente.
- Debe guardar cambios en localStorage.
- Debe mantener el mismo id.
- Debe actualizar updatedAt si existe esa estructura.
- No debe permitir editar rulesets default.

Compatibilidad:
Si antes existían inputs manuales para agregar stages:

- Puedes reemplazarlos por el selector visual.
- O puedes dejarlos como opción secundaria si no estorban.
- Pero la experiencia principal debe ser visual.

Requisitos técnicos:

- Mantén TypeScript sin errores.
- No dupliques datos del catálogo.
- No rompas localStorage.
- No borres rulesets custom existentes.
- No cambies innecesariamente la estructura de datos.
- Si necesitas adaptar rulesets antiguos guardados en localStorage, hazlo de forma segura.
- Usa helpers si hace falta para normalizar stages.
- No metas toda la lógica dentro de una sola página.

Criterios de aceptación:
Esta fase estará completa cuando:

1. Crear ruleset permita elegir starters visualmente.
2. Crear ruleset permita elegir counterpicks visualmente.
3. Editar ruleset cargue la selección actual.
4. Editar ruleset permita cambiar starters/counterpicks visualmente.
5. No se puedan duplicar stages entre starters y counterpicks.
6. Las imágenes reales aparezcan en el selector.
7. El catálogo completo de 10 stages esté disponible para rulesets custom.
8. El resumen de selección sea claro.
9. Las validaciones sigan funcionando.
10. Los custom rulesets se guarden correctamente en localStorage.
11. La Home y el detalle sigan funcionando.
12. npm run build funcione.
13. npm run lint funcione si existe el script.

Verificación final:
Al terminar:

1. Ejecuta npm run build.
2. Ejecuta npm run lint solo si existe ese script.
3. Corrige cualquier error antes de finalizar.
4. Resume:
   - archivos creados
   - archivos modificados
   - cómo quedó el selector visual
   - cómo se evitan duplicados
   - cómo queda crear/editar rulesets
   - qué debería hacerse en Fase 5C
