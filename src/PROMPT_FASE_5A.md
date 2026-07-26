Quiero que implementes la Fase 5A: catálogo competitivo ampliado e imágenes reales de stages.

Contexto:
Estoy creando una web app de stage banning para Super Smash Bros. Ultimate usando React + TypeScript + Vite + Tailwind CSS + Framer Motion.

El proyecto ya tiene:

- Home funcional.
- Detalle de rulesets.
- Crear/editar/eliminar rulesets custom.
- Sesión visual básica.
- Catálogo visual de stages o base similar.
- Cards de stages con fallback visual.
- Estilo oscuro/futurista/neón.

Objetivo de esta fase:
Conectar correctamente las imágenes reales de stages, ampliar el catálogo competitivo a 10 stages y asegurar que Shine City use solo los stages correctos.

No implementes todavía:

- RPS guiado.
- BO3 / BO5.
- marcador visual.
- avance automático de games.
- selector visual avanzado nuevo si no es necesario.

Eso vendrá en fases siguientes.

Antes de modificar:

- Revisa la estructura actual del proyecto.
- Reutiliza lo que ya funciona.
- No rehagas toda la app.
- No rompas Home, detalle, crear/editar ruleset ni sesión visual.

Imágenes disponibles:
Las imágenes reales ya existen en:

public/images/stages/

Archivos disponibles:

- battlefield.jpg
- final-destination.jpg
- hollow-bastion.jpg
- kalos-pokemon-league.jpg
- lylat-cruise.jpg
- pokemon-stadium-2.jpg
- small-battlefield.jpg
- smashville.jpg
- town-and-city.jpg
- yoshis-story.jpg

Asegúrate de que el catálogo apunte exactamente a estas rutas públicas:

- /images/stages/battlefield.jpg
- /images/stages/final-destination.jpg
- /images/stages/hollow-bastion.jpg
- /images/stages/kalos-pokemon-league.jpg
- /images/stages/lylat-cruise.jpg
- /images/stages/pokemon-stadium-2.jpg
- /images/stages/small-battlefield.jpg
- /images/stages/smashville.jpg
- /images/stages/town-and-city.jpg
- /images/stages/yoshis-story.jpg

Catálogo competitivo:
Amplía o corrige el catálogo de stages para incluir exactamente estos 10 stages competitivos, con nombres en inglés:

1. Final Destination
2. Battlefield
3. Small Battlefield
4. Pokémon Stadium 2
5. Hollow Bastion
6. Town and City
7. Smashville
8. Kalos Pokémon League
9. Yoshi's Story
10. Lylat Cruise

Requisitos del catálogo:
Cada stage debe tener al menos:

- id estable
- name
- image
- isCompetitive: true

Usa ids consistentes, por ejemplo:

- final-destination
- battlefield
- small-battlefield
- pokemon-stadium-2
- hollow-bastion
- town-and-city
- smashville
- kalos-pokemon-league
- yoshis-story
- lylat-cruise

Shine City:
Ajusta el ruleset default Shine City para que use exactamente estos stages:

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

Importante:

- Yoshi's Story debe existir en el catálogo general.
- Lylat Cruise debe existir en el catálogo general.
- Pero Yoshi's Story NO debe estar en Shine City.
- Lylat Cruise NO debe estar en Shine City.

Visual:
Asegúrate de que las imágenes reales aparezcan en:

- detalle de ruleset
- cards de stages
- sesión visual básica
- cualquier selector visual de stages que ya exista

Fallback:
Mantén el fallback visual existente o implementa uno si hace falta.
Si una imagen falla o no existe:

- la app no debe romperse
- debe mostrar un placeholder elegante con gradiente y el nombre del stage

Crear/editar rulesets:
Si ya existe selección visual de stages:

- asegúrate de que use el catálogo completo de 10 stages
- asegúrate de que muestre las imágenes reales
- no rompas validaciones existentes
- no permitas duplicados entre starters y counterpicks

Si todavía no existe una selección visual avanzada:

- no implementes una reestructuración grande todavía
- solo deja el catálogo y las imágenes listos para la Fase 5B

Requisitos técnicos:

- Mantén TypeScript sin errores.
- No rompas rutas existentes.
- No dupliques datos innecesariamente.
- Usa una única fuente de verdad para el catálogo si es posible.
- Respeta los tipos existentes.
- Mantén compatibilidad con localStorage.
- No elimines rulesets custom del usuario.
- No cambies el diseño general salvo para mejorar las imágenes de stages.

Criterios de aceptación:
Esta fase estará completa cuando:

1. El catálogo tenga los 10 stages competitivos.
2. Todos los stages tengan image apuntando a /images/stages/archivo.jpg.
3. Las imágenes reales se vean en la UI donde aparecen stages.
4. Shine City tenga exactamente 5 starters y 3 counterpicks.
5. Shine City NO incluya Yoshi's Story ni Lylat Cruise.
6. Yoshi's Story y Lylat Cruise sí aparezcan disponibles para crear/editar otros rulesets si el selector actual lo permite.
7. La sesión visual básica muestre imágenes reales o fallback correcto.
8. npm run build funcione sin errores.
9. npm run lint funcione si existe el script.

Verificación final:
Al terminar:

1. Ejecuta npm run build.
2. Ejecuta npm run lint solo si existe ese script.
3. Corrige cualquier error antes de finalizar.
4. Resume:
   - archivos creados
   - archivos modificados
   - cómo quedó el catálogo de stages
   - cómo quedaron las imágenes
   - cómo quedó Shine City
   - qué debería hacerse en Fase 5B
