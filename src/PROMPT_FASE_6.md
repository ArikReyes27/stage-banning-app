Quiero que implementes la Fase 6: pulido visual, UX y QA del MVP.

Contexto:
Estoy creando una web app de stage banning para Super Smash Bros. Ultimate usando React + TypeScript + Vite + Tailwind CSS + Framer Motion.

El proyecto ya tiene:

- Home funcional.
- Detalle de rulesets.
- Crear/editar/eliminar rulesets custom.
- localStorage para rulesets custom.
- Catálogo competitivo de 10 stages con imágenes reales.
- Selector visual de stages para crear/editar rulesets.
- Sesión guiada con:
  - Jugador 1 y Jugador 2.
  - Best of 3 / Best of 5.
  - RPS.
  - Secuencia guiada de bans.
  - Counterpicks bloqueados en Game 1.
  - Counterpicks desbloqueados desde Game 2.
  - Stages baneados no elegibles.
  - Marcador visual.
  - Reporte de ganador por game.
  - Avance automático entre games.
  - Finalización automática del set.
- Estilo oscuro/futurista/neón.

Objetivo de esta fase:
Pulir el MVP para que se sienta más profesional, claro, estable y cómodo de usar en mobile y desktop.

No implementes todavía:

- base de datos
- usuarios/cuentas
- favoritos
- compartir online
- Top 8 / Top 16
- DSR avanzado
- reglas competitivas complejas nuevas

Esta fase debe enfocarse en mejorar lo que ya existe, no en agregar módulos grandes.

Antes de modificar:

- Revisa la estructura actual del proyecto.
- Reutiliza lo que ya funciona.
- No rehagas toda la app.
- No cambies la lógica principal si ya funciona.
- No borres rulesets custom del usuario.
- Mantén TypeScript sin errores.
- Mantén compatibilidad con localStorage.
- Mantén rutas existentes funcionando.

---

# Objetivos principales

Pulir:

1. Home.
2. Cards de rulesets.
3. Detalle de ruleset.
4. Crear/editar ruleset.
5. Selector visual de stages.
6. Sesión de baneo.
7. Marcador visual.
8. Estados vacíos.
9. Errores y validaciones.
10. Responsive mobile/desktop.
11. Accesibilidad básica.
12. Textos de ayuda.

---

# Home

Mejora la Home si hace falta:

- Hero más limpio y llamativo.
- Mejor jerarquía visual.
- Mejor espaciado en mobile.
- Mejor grid en desktop.
- Cards de rulesets consistentes.
- Buscador más claro.
- Empty state si no hay resultados.
- Botones con mejor feedback visual.
- Microanimaciones sutiles.

No cambies el concepto general si ya funciona.

---

# Cards de rulesets

Pulir cards:

- Mejor distribución de nombre, comunidad y descripción.
- Mostrar conteos de stages de forma visual.
- Badges más bonitos para starters/counterpicks.
- Botones claros:
  - Ver ruleset
  - Iniciar baneo
- Hover/tap feedback.
- Asegurar que en mobile no se vea apretado.
- Evitar exceso de texto.

---

# Detalle de ruleset

Pulir:

- Stages con imagen deben verse protagonistas.
- Starters y counterpicks deben distinguirse claramente.
- Reglas Game 1 y Game 2+ deben entenderse rápido.
- Botones principales bien ubicados.
- Botón editar/eliminar solo para custom rulesets.
- Mejor visual para default/custom.
- Mejor empty state si un ruleset no existe.
- Evitar que el detalle parezca una lista de texto.

---

# Crear/editar ruleset

Pulir formulario:

- Inputs más cómodos en celular.
- Labels claros.
- Errores visibles y específicos.
- Mejor separación entre:
  - información básica
  - selección de stages
  - reglas Game 1
  - reglas Game 2+
- Selector visual de stages más claro.
- Resumen de selección más útil.
- Botones de guardar/cancelar bien ubicados.
- Prevenir errores comunes con mensajes claros.

No cambies la lógica de guardado si ya funciona.

---

# Selector visual de stages

Pulir:

- Cards de stage más consistentes.
- Estados visuales claros:
  - sin seleccionar
  - starter
  - counterpick
  - bloqueado / ya asignado
- Mejor feedback al tocar/clickear.
- Imágenes con buen recorte.
- Nombres legibles.
- Grid cómodo en mobile y desktop.
- Mensajes claros si faltan starters.
- Evitar duplicados.

---

# Sesión de baneo

Pulir la sesión:

- Panel superior más claro.
- Nombres de jugadores visibles.
- Best of 3 / Best of 5 claro.
- Game actual claro.
- RPS claro.
- Instrucción del turno actual muy visible.
- Modo actual claro:
  - RPS
  - Ban
  - Pick
  - Reportar ganador
  - Set terminado
- Bans restantes visibles.
- Counterpicks bloqueados en Game 1 fáciles de entender.
- Stage elegido destacado.
- Botones de reportar ganador claros.
- Botones de reiniciar con confirmación si aplica.

No permitas saltarse fases si ya está resuelto.

---

# Marcador visual

Pulir marcador:

- Mantener estilo sin números grandes como elemento principal.
- Slots/puntos/cristales deben verse premium.
- BO3 debe mostrar 2 slots por jugador.
- BO5 debe mostrar 3 slots por jugador.
- El ganador de cada game debe reflejarse inmediatamente.
- Set terminado debe verse claro.
- Historial de games compacto y legible.

---

# Accesibilidad básica

Mejora lo siguiente donde aplique:

- Focus visible en botones e inputs.
- Estados disabled claros.
- Labels asociados a inputs cuando sea posible.
- Contraste legible.
- Botones grandes para touch.
- Imágenes con alt descriptivo.
- No depender solo del color para indicar estado; usar también texto corto, ícono o badge.

---

# Responsive

Revisa mobile-first:

- No debe haber desbordamientos horizontales.
- Cards no deben quedar demasiado estrechas.
- Botones deben poder tocarse cómodamente.
- Header no debe romperse.
- La sesión debe ser usable en celular.
- En desktop, usa mejor el espacio con grids y paneles.

---

# QA de flujos principales

Revisa y corrige bugs obvios en:

1. Crear ruleset custom.
2. Editar ruleset custom.
3. Eliminar ruleset custom.
4. Buscar rulesets.
5. Ver detalle.
6. Iniciar baneo.
7. Elegir BO3 / BO5.
8. Elegir ganador de RPS.
9. Completar Game 1.
10. Avanzar a Game 2.
11. Reportar ganadores.
12. Terminar BO3.
13. Terminar BO5.
14. Reiniciar set.
15. Volver al ruleset.

No necesitas automatizar tests si no existe infraestructura, pero sí revisa la lógica y corrige problemas evidentes.

---

# Microcopy

Mejora textos cortos para que la app guíe sin saturar.

Usa frases cortas como:

- “Elige ganador de RPS para comenzar.”
- “Toca un stage para banearlo.”
- “Counterpicks se desbloquean desde Game 2.”
- “Reporta el ganador cuando termine el game.”
- “Set terminado.”

Evita párrafos largos.

---

# Requisitos técnicos

- Mantén TypeScript sin errores.
- Mantén build funcionando.
- Mantén lint funcionando si existe.
- No introduzcas dependencias nuevas salvo que sea realmente necesario.
- No borres datos del usuario.
- No rompas rutas existentes.
- Mantén componentes modulares.
- Evita lógica duplicada.
- Usa Tailwind y Framer Motion ya existentes.

---

# Criterios de aceptación

Esta fase estará completa cuando:

1. La app se vea más pulida y consistente.
2. Home y cards se vean mejor en mobile y desktop.
3. Crear/editar ruleset sea más claro.
4. Selector visual de stages sea más fácil de usar.
5. Sesión de baneo guíe mejor al usuario.
6. Marcador visual se vea más premium.
7. Errores y empty states sean claros.
8. No haya desbordes visuales obvios.
9. Los flujos principales sigan funcionando.
10. npm run build funcione.
11. npm run lint funcione si existe script.

Verificación final:
Al terminar:

1. Ejecuta npm run build.
2. Ejecuta npm run lint solo si existe ese script.
3. Corrige cualquier error antes de finalizar.
4. Resume:
   - archivos creados
   - archivos modificados
   - mejoras visuales realizadas
   - mejoras UX realizadas
   - bugs corregidos
   - qué debería hacerse en la siguiente fase
