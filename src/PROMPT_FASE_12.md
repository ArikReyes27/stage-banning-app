# STAGE//STRIKE — Fase 12

## Preparación
Revisados HomePage, AppShell, rutas, navegación, estilos globales, Icon, RulesetGrid/Card, Registro y los diez JPG locales de escenarios. No hay AGENTS.md en el proyecto. Respaldo: `stage-banning-before-phase12-20261018-120728.zip` (47,065,437 bytes, 302 archivos). Incluye cambios sin commit, excluye .git, node_modules, dist y ZIP previos.

## Alcance
Home como centro de torneos, fondo local dinámico, navegación Inicio/Registro/Bracket/Rulesets y controles de selección del registro. Conservar biblioteca existente en /#rulesets. Sin modificar motor, resultados, DQ, VS, importadores, rulesets ni claves de almacenamiento. Sin push, servicios externos o dependencias nuevas.

## Implementación terminada

Home conserva el logotipo y el estilo oscuro/cyan/violeta. Encabezado: «Tu torneo. Tus reglas. Tu escenario.» Tres tarjetas con iconos del componente Icon, enlaces nativos con foco visible y acciones de al menos 48 px:

- Registrar jugadores → `/registration`.
- Administrar torneo → `/tournament`.
- Elegir ruleset → `/#rulesets`, biblioteca original con búsqueda y rulesets personalizados. No selecciona reglas ni abre una sesión arbitrariamente.

Accesos secundarios: explorar, crear ruleset y presentación del torneo. Navegación superior: Inicio, Registro, Bracket y Rulesets; en móvil se organiza en una fila compacta debajo del logotipo. Crear ruleset sigue en escritorio y en los accesos secundarios de Home. Las rutas existentes se conservan; el helper de navegación admite el ancla de la biblioteca y respeta movimiento reducido al desplazar. La biblioteca recibe el foco al acceder a ella para continuar con teclado.

### Fondo dinámico

Se usan exclusivamente `hollow-bastion.jpg` (123,601 bytes), `small-battlefield.jpg` (120,271 bytes) y `final-destination.jpg` (130,237 bytes), ya existentes. Se carga inicialmente una sola imagen; a los 7 segundos se solicita y decodifica la siguiente. El navegador reutiliza la caché. Se superponen como máximo dos imágenes durante un fundido de 1.2 segundos, sin movimiento de cámara ni cambios de tamaño del contenido. No se cargan de golpe los diez escenarios ni se añadieron librerías o assets.

Overlay oscuro y degradados cyan/azul/violeta mantienen la legibilidad. Si la primera imagen falla queda el degradado de respaldo y se oculta el elemento roto. Si falla una imagen posterior se conserva la última correcta y se intenta la siguiente en otro intervalo. `visibilitychange` detiene la programación al ocultar la pestaña; `prefers-reduced-motion` mantiene el fondo estático. También hay un botón Pausar/Reanudar fondo. Timers y listeners se limpian al salir de Home.

### Registro

Barra fija dentro de la sección de participantes, fondo opaco, total y contador de seleccionados con anuncio accesible. Seleccionar página agrega los hasta 25 resultados visibles sin perder selecciones previas; Seleccionar todos incluye el registro completo, incluso fuera de la búsqueda; Limpiar selección vacía únicamente la selección temporal. El texto explica esa diferencia.

Se conservan importación, pegado, búsqueda, edición, exportación y paginación inferior. Eliminar seleccionados está separado al pie de la lista y mantiene su confirmación. En pantallas de poca altura la barra deja de ser fija; en móvil los botones se distribuyen en filas sin desbordar y el margen de desplazamiento permite enfocar controles bajo la barra. No se cambió la lógica de importación ni la identidad de participantes. AppShell utiliza `overflow-x-clip` en lugar de crear un contenedor con overflow que impediría el comportamiento sticky.

## Archivos de esta fase

Modificados respecto del respaldo:

- `src/pages/HomePage.tsx`
- `src/components/layout/AppShell.tsx`
- `src/components/ui/Icon.tsx` (iconos de usuarios y trofeo)
- `src/app/navigation.ts`
- `src/pages/RegistrationPage.tsx`
- `src/styles/registration.css`
- `tests/tournament-render.test.mjs`

Creados:

- `src/components/layout/StageHeroBackground.tsx`
- `src/styles/home.css`
- `tests/browser-phase12.mjs`
- `src/PROMPT_FASE_12.md`
- Respaldo ZIP indicado arriba. Las capturas y perfiles temporales de pruebas quedan en `node_modules/.tmp/phase12-browser/`, fuera de los fuentes.

Se compararon mediante SHA-256 todos los archivos del respaldo contra el árbol actual. Solo cambiaron los siete archivos enumerados; no faltó ninguno. Motor, Winners/Losers, DQ, marcadores VS, importadores, imágenes, rulesets, hooks de almacenamiento y rutas permanecen idénticos al respaldo. No se hizo commit ni push.

## Resultados reales — 18 de octubre de 2026

- `npm.cmd test`: **99/99 aprobadas**, cero fallos, omisiones o cancelaciones. Las cinco comprobaciones nuevas cubren Home y registro de 8/32/64/128. Siguen pasando las simulaciones de doble eliminación, persistencia antigua/nueva, DQ, VS, render, assets y formatos de importación.
- `npx.cmd tsc -b`: aprobado.
- `npm.cmd run lint`: aprobado.
- `npm.cmd run build`: aprobado. Persiste la advertencia de chunks superiores a 500 kB (principal y ExcelJS), sin error de compilación.
- `node tests/browser-phase11.mjs`: aprobado después del rediseño. Flujo real de selección, sorteo, seeds, restauración, inicio, editor/VS, escenario, victorias, DQ/reversión, recarga, presentación y navegación Top de 20/128.
- `node tests/browser-phase12.mjs`: aprobado en Chrome con perfil aislado. Verifica una sola imagen inicial, cambio automático, pausa/reanudación, movimiento reducido emulado y visibilidad simulada mediante evento; rutas desde Home, acceso al ancla desde Bracket, foco/teclado, creación y presentación sin navegación administrativa.
- Registro en navegador para 8/32/64/128: seleccionar página/todos, limpiar, selección con búsqueda, cancelación de eliminación y conservación exacta de los datos/IDs al seleccionar y recargar.
- Responsive: capturas de escritorio 1440×1000 y móvil 390×844, más comprobación de Home a 320 px; sin overflow horizontal. Barra fija comprobada con desplazamiento en escritorio y móvil. Capturas inspeccionadas visualmente.
- Fallo de imágenes provocado mediante bloqueo de red: se muestra el degradado, sin icono de imagen rota y con accesos operativos.
- Stage Banning desde la biblioteca: elección del primer jugador, tres baneos y selección de escenario, confirmación, victoria del primer juego y avance a Juego 2. El registro y el torneo conservan exactamente sus datos.
- Cero excepciones JavaScript en los recorridos aprobados. Los datos del usuario no se abrieron ni modificaron: las pruebas usan perfiles y fixtures independientes.

Capturas: `home-desktop.png`, `home-mobile.png`, `home-fallback.png`, `registration-desktop.png`, `registration-mobile.png`, `registration-mobile-sticky.png` en `node_modules/.tmp/phase12-browser/`.

## Prueba manual

Ejecutar `npm.cmd run dev` y abrir la URL de Vite. Revisar los tres accesos, volver con Inicio y usar Rulesets desde otra página. En Home esperar 7 segundos, pausar y reanudar; activar movimiento reducido del sistema si se desea comprobar el fondo estático. En Registro importar una lista de prueba en una ventana privada, desplazarse por los 25 participantes de una página y comparar Seleccionar página con Seleccionar todos. Confirmar que el contador sigue visible y que Limpiar selección no borra participantes. Usar Presentación del torneo para revisar la vista pública sin administración.

## Limitaciones pendientes

- Se probó Chrome en Windows con tamaños móviles emulados, no Safari/Firefox ni dispositivos físicos. El test requiere Chrome en la ruta indicada, puertos 4185/4186 libres y permiso para sus subprocesos fuera del sandbox.
- Persisten el aviso de bundles grandes y la persistencia local por origen/perfil. No se implementaron Supabase, autenticación ni sincronización.
- No se rediseñó el bracket de gran tamaño ni se añadieron standings. La selección de Registro no crea ni altera automáticamente un torneo; la selección definitiva continúa en Bracket.
- El fondo utiliza tres imágenes elegidas del catálogo local; una conexión lenta puede retrasar el cambio hasta completar la decodificación, conservando el fondo anterior.
