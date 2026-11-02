# Fase 7 — segunda parte integrada (17 de octubre de 2026)

Estado actual: importación base y visualización de iconos implementadas con autorización expresa del usuario. El análisis original se conserva debajo como registro histórico; sus restricciones de «solo documentación» y sus rutas propuestas describen la primera entrega, no el estado actual.

## Respaldo previo

Antes de modificar código o importar recursos se creó stage-banning-before-phase7-20261017-115301.zip (7,784,698 bytes). Incluye los archivos de trabajo, también los cambios sin commit, excluyendo .git, node_modules, dist y archivos ZIP previos. No se hizo commit ni push.

## Recursos realmente integrados

- 86 iconos y 86 renders base: 172 PNG, todos procedentes del índice 0.
- Rutas: public/images/characters/icons/<id>/00.png y public/images/characters/renders/<id>/00.png.
- src/data/characterAssets.ts relaciona los 86 IDs con sus recursos, sus carpetas de origen y las 670 variantes disponibles para esas entradas. Solo las 86 variantes base tienen availableLocally: true; las otras 584 permanecen en el origen.
- Las 24 variantes de las tres carpetas de Pokémon adicionales no se copiaron. Sus carpetas están referenciadas en sourceForms de pokemon-trainer; junto con las 670 variantes del catálogo forman las 694 parejas originales.
- docs/phase7-assets-inventory.json registra las 172 copias, rutas de origen y destino, dimensiones, bytes y SHA-256 antes/después.
- No se importaron variantes alternativas ni se sobrescribieron imágenes existentes. Se comprobó la ausencia de destinos antes de copiar y se usó creación exclusiva.

## Optimización comprobada

Se recomprimieron únicamente los datos IDAT de los PNG con DEFLATE nivel 9, conservando todos los demás chunks, dimensiones, valores de píxel y transparencia. Se compararon los datos descomprimidos antes/después. Si la recompresión no reducía el tamaño, se conservó el archivo original sin cambios.

161 archivos resultaron más pequeños; 11 conservaron sus bytes originales. Total previo: 43,166,803 bytes. Total integrado: 39,160,719 bytes (37.35 MiB). Ahorro: 4,006,084 bytes, aproximadamente 9.28 %. Se verificaron los hashes de las copias y que los 172 archivos fuente utilizados seguían intactos.

## Integración visual y compatibilidad

src/data/characters.ts mantiene las mismas 86 entradas y sus IDs, y obtiene icon del manifiesto. CharacterIcon conserva el fallback SVG y ahora declara dimensiones 32×32 y decodificación asíncrona. ParticipantForm reutiliza CharacterIcon junto al selector nativo para mostrar el personaje elegido; las opciones desplegadas continúan siendo texto por compatibilidad con el control nativo. MatchCard y MatchEditor ya reutilizaban CharacterIcon y reciben las imágenes sin cambiar su lógica.

No se modificaron almacenamiento, validación, formato del torneo, resultados, Stage Banning, rulesets, página principal ni pantallas VS. No se asignaron renders recortados a VS. El manifiesto marca fullBodyRender: null para todas las entradas; los renders se guardan como recursos de encuadre no verificado o recortado, no como cuerpo completo. Se mantienen los placeholders existentes.

## Archivos de esta entrega

- Agregados: 172 PNG en icons y renders; src/data/characterAssets.ts; docs/phase7-assets-inventory.json; tests/character-assets.test.mjs; respaldo ZIP local.
- Actualizados: src/data/characters.ts; src/components/tournament/CharacterIcon.tsx; src/components/tournament/ParticipantForm.tsx; tests/tournament-render.test.mjs; public/images/characters/README.md; este documento.
- Los demás cambios que ya existían en el directorio de trabajo son anteriores a esta entrega.

## Validación

- npx tsc -b: correcto.
- npm run lint: correcto.
- npm test: 24 pruebas aprobadas, ninguna fallida. Incluyen progresión Winners/Losers, reset, importación/exportación, persistencia, presentación, selecciones guardadas con DLC y existencia/hash/dimensiones de las 172 imágenes.
- npm.cmd run build: correcto. Vite avisa de un chunk JavaScript de 513.92 kB (135.31 kB gzip), por encima de su umbral de 500 kB; es una advertencia no bloqueante. No se cambiaron límites ni configuración de build para ocultarla.
- La comprobación del renderizado se realizó con las pruebas React de servidor; no se afirma una revisión visual interactiva en navegador.
- Incidencias de herramientas resueltas sin cambiar configuración: Python no estaba instalado, por lo que la optimización se hizo con Node y zlib; npm.ps1 fue bloqueado al lanzar el build, por lo que se utilizó npm.cmd.

## Cómo comprobarlo visualmente

1. Ejecutar npm.cmd run dev y abrir /tournament en la dirección local indicada por Vite.
2. En un torneo nuevo o todavía editable, elegir personajes: el icono aparece junto a cada selector. Probar Mario, Piranha Plant, Sora y Pyra / Mythra.
3. Con los ocho participantes completos, generar el bracket y comprobar los iconos en cada tarjeta. Para un torneo ya guardado, basta abrirlo: no es necesario reiniciarlo ni volver a sortear.
4. Abrir /tournament/presentation y confirmar los iconos de los mismos participantes.
5. Recargar la página y comprobar que se conserva el torneo. No reiniciar un torneo real para realizar esta prueba.
6. Los slots sin participante mantienen su placeholder. Los renders no se presentan en VS.

Siguiente paso recomendado: revisión visual interactiva en móvil y escritorio, etiquetado de variantes y búsqueda de imágenes apropiadas de cuerpo completo si se requiere ampliar VS. No copiar automáticamente el resto de variantes.

---

# Registro histórico: análisis previo a la autorización

Quiero que prepares la Fase 7: integración de recursos visuales de personajes de Super Smash Bros. Ultimate.

Contexto:
El proyecto Stage Banning utiliza React + TypeScript + Vite + Tailwind CSS + Framer Motion. El catálogo del bracket está definido en src/data/characters.ts.

Origen:
C:\Users\Arik\Downloads\thumbnail-generator-master\thumbnail-generator-master\res\fighters

Proyecto:
C:\Users\Arik\Desktop\Proyectos\stage-banning-app

Objetivo de esta fase:
Analizar los recursos disponibles y proponer su organización y asociación al catálogo existente, conservando todos los originales.

Estado: análisis y documentación terminados; copia e integración pendientes de autorización expresa.
Fecha del análisis: 17 de octubre de 2026.

---

# Alcance autorizado y restricciones

En esta entrega, crear únicamente src/PROMPT_FASE_7_ASSETS.md y realizar lecturas de análisis.

- No copiar, mover, renombrar, convertir ni eliminar imágenes.
- No sobrescribir recursos existentes ni modificar el origen.
- No modificar el bracket, sus componentes, Stage Banning ni las pantallas VS.
- No cambiar IDs del catálogo, rutas de la aplicación ni datos de localStorage.
- La estructura propuesta abajo es documental: no implica permiso para implementarla.
- Mostrar resultados y esperar autorización antes de copiar imágenes o modificar componentes. La autorización para copiar no debe interpretarse como autorización para cambiar pantallas.

# Objetivos principales

1. Analizar todas las carpetas de personajes.
2. Identificar iconos y renders, comprobando si muestran cuerpo completo.
3. Identificar variantes de colores y trajes alternativos.
4. Comprobar qué personajes DLC están incluidos.
5. Preparar la organización en public/images/characters/icons y public/images/characters/renders.
6. Proponer una asociación consistente al catálogo del bracket.
7. Evitar duplicados y archivos innecesarios en el destino.
8. Conservar todos los archivos originales.

---

# Método y grado de verificación

La ejecución inicial recorrió todas las carpetas, leyó los archivos, comprobó las cabeceras y dimensiones PNG y calculó SHA-256 de los 1,388 archivos. Comparó las carpetas con las 86 entradas del catálogo y revisó sus consumidores. Se inspeccionaron visualmente seis renders: mario/render0.png, pyramythra/render0.png, pokemontrainer/render0.png y miigunner/render1.png, render2.png y render3.png.

Al retomar la tarea, se comprobó que este documento no existía y se confirmaron mediante listados los 89 directorios, los 1,388 PNG, la cobertura de las 86 entradas, las excepciones Mii y los destinos vacíos. Se conservaron los resultados anteriores sin repetir el cálculo de hashes ni la lectura completa de imágenes. Las métricas de bytes y dimensiones siguientes proceden de la ejecución inicial.

Limitación: no se inspeccionaron visualmente las 1,388 imágenes ni se decodificaron todas para comprobar integridad gráfica. La ausencia de duplicados se refiere a igualdad binaria por SHA-256; no descarta imágenes visualmente equivalentes con distinta codificación. No se verificó la correspondencia visual de cada pareja icono/render ni se asignaron nombres de colores a todas las variantes.

# Inventario verificado

| Dato | Resultado |
| --- | --- |
| Carpetas de personajes | 89 |
| Archivos PNG | 1,388 |
| Iconos | 694 |
| Renders | 694 |
| Tamaño total | 339,962,802 bytes (aprox. 324.21 MiB) |
| Entradas del catálogo con carpeta correspondiente | 86 de 86 |
| Carpetas adicionales al catálogo | charizard, ivysaur, squirtle |
| Grupos de archivos binariamente idénticos | 0, según SHA-256 inicial |
| Archivos fuera del patrón iconN.png / renderN.png | 0 |
| Iconos sin render del mismo índice | 0 |

En 86 carpetas existen ocho parejas, con índices 0–7. Las excepciones son Mii Brawler y Mii Swordfighter, con una pareja cada uno (0), y Mii Gunner, con cuatro parejas (0–3). Estos índices describen los archivos de esta colección; no deben asumirse automáticamente como índices oficiales de traje del juego, especialmente en los Mii.

# Tipos de imágenes y tamaños

| Tipo | Patrón | Dimensiones verificadas | Uso propuesto |
| --- | --- | --- | --- |
| Iconos | icon0.png a icon7.png, salvo Mii | Todos 32×32 px | Identificación compacta de personajes |
| Renders habituales | renderN.png | 640×640 px | Retratos grandes, sujetos a revisión del encuadre |
| Captain Falcon | render0.png a render7.png | 800×800 px | Igual uso, conservando resolución |
| Cloud | render0.png a render7.png | 974×974 px en índices pares; 972×972 px en impares | Igual uso, sin forzar dimensiones únicas |
| Zelda | render0.png a render7.png | 693×693 px | Igual uso |

Hallazgo visual importante: los seis renders examinados presentan recortes del personaje. Mario no muestra el cuerpo entero; Pokémon Trainer muestra al entrenador recortado; Pyra/Mythra es una composición conjunta recortada. Los trajes Mii examinados también están recortados. No presentar esta colección como un conjunto verificado de renders de cuerpo completo. El nombre renderN.png y una imagen cuadrada no garantizan ese contenido.

No se ha confirmado la disponibilidad de cuerpo completo para cada personaje. Si las futuras pantallas VS lo requieren, será necesario revisar el resto y localizar otra fuente para los faltantes. No generar ni reconstruir partes del cuerpo en esta fase.

# Variantes y trajes alternativos

- Cada índice existente tiene icono y render asociados por nombre. Mantener el índice original y no renumerarlo.
- La existencia de ocho índices está verificada por archivos; la clasificación individual como recolor, traje, género o personaje alternativo queda pendiente de revisión visual.
- Mii Brawler: únicamente icon0.png y render0.png.
- Mii Swordfighter: únicamente icon0.png y render0.png.
- Mii Gunner: cuatro parejas. Se identificaron visualmente render1 como Sans, render2 como Cuphead y render3 como Vault Boy. No convertir estos trajes en nuevas entradas del roster. Su icono correspondiente existe, pero su correspondencia visual no se revisó.
- Pyra/Mythra: ocho parejas y una sola carpeta. render0 muestra a ambas juntas; no se verificaron recursos separados para cada una.
- Pokémon Trainer: ocho parejas propias y tres carpetas adicionales para sus Pokémon. render0 del entrenador no es una composición de los tres Pokémon.
- Antes de asignar etiquetas semánticas, revisar las series de Bowser Jr., Hero, Steve, Olimar, Cloud, Bayonetta, Wario, Sora, Robin, Corrin, Byleth, Villager, Inkling, Wii Fit Trainer y Pokémon Trainer. No dar por verificadas identidades, colores ni orden basándose solo en conocimiento del juego.

Para etiquetas provisionales usar “Variante 0”, “Variante 1”, etc.; defaultVariantId 00 sería una convención propuesta basada en el índice 0, no una certificación visual de todos los trajes predeterminados.

# Cobertura DLC

Se verificó la presencia de las siguientes doce entradas DLC del catálogo, todas con ocho iconos y ocho renders, índices 0–7. Pyra/Mythra permanece como una selección conjunta. La cobertura es de archivos; no certifica cuerpo completo ni cada etiqueta de traje.

| Entrada del catálogo | Carpeta de origen |
| --- | --- |
| piranha-plant | pirahnaplant |
| joker | joker |
| hero | hero |
| banjo-and-kazooie | banjoandkazooie |
| terry | terry |
| byleth | byleth |
| min-min | minmin |
| steve | steve |
| sephiroth | sephiroth |
| pyra-mythra | pyramythra |
| kazuya | kazuya |
| sora | sora |

No falta una carpeta correspondiente a una entrada DLC del catálogo actual. Esto no significa que esté incluida la colección completa de trajes DLC para Mii.

---

# Estado del proyecto y compatibilidad

src/data/characters.ts contiene 86 IDs estables. Actualmente construye icon como /images/characters/<id>.png. CharacterIcon.tsx consume character.icon y tiene manejo de error; ParticipantForm, MatchCard y MatchEditor utilizan ese componente. La validación del torneo depende de getCharacter y characterIds.

public/images/characters/icons y public/images/characters/renders ya existen y se confirmaron vacías al retomar. public/images/characters/README.md describe todavía archivos planos como mario.png y el placeholder. No se modificó ninguno de estos archivos o directorios.

Copiar imágenes a las subcarpetas propuestas por sí solo no conectará el catálogo: tras autorización para integración, habrá que actualizar las rutas o incorporar un manifiesto compatible y actualizar la documentación. No duplicar archivos en la raíz como solución temporal.

# Estructura recomendada (propuesta, no ejecutada)

Usar los IDs actuales del catálogo como nombres canónicos y separar tipo de imagen y variante:

~~~text
public/images/characters/
  icons/
    mario/00.png
    mario/01.png
    piranha-plant/00.png
    pyra-mythra/00.png
    pokemon-trainer/00.png
    pokemon-trainer/forms/charizard/00.png
  renders/
    mario/00.png
    mario/01.png
    piranha-plant/00.png
    pyra-mythra/00.png
    pokemon-trainer/00.png
    pokemon-trainer/forms/charizard/00.png
~~~

Regla: <carpetaOrigen>/iconN.png se asociaría a icons/<idCatalogo>/<NN>.png, y renderN.png a renders/<idCatalogo>/<NN>.png. NN es el índice de origen con dos dígitos (00–07; Mii Gunner 00–03). Cambiar el nombre únicamente de la futura copia, nunca del original.

Las carpetas charizard, ivysaur y squirtle se pueden registrar como formas asociadas a pokemon-trainer bajo forms/<forma>/, solo si se autoriza su uso. No añadir tres entradas nuevas al bracket ni copiar estos extras por defecto.

Proponer un manifiesto separado, por ejemplo src/data/characterAssets.ts, sin crearlo todavía. Cada entrada debería guardar characterId, sourceFolder, defaultVariantId y variants. Cada variante debería registrar id, sourceIndex, label opcional, icon y render; las formas podrían ir en forms. El inventario de importación debería conservar sourcePath, destinationPath, SHA-256, bytes y dimensiones para trazabilidad, sin exponer rutas absolutas locales en el bundle de la aplicación.

Preservar character.id, character.name y el contrato character.icon durante una futura integración. character.icon podría resolver la variante predeterminada del manifiesto. No modificar el esquema persistido de participantes para preparar assets.

# Asociación completa de carpetas al catálogo

La tabla siguiente cubre las 89 carpetas analizadas. La asociación se basa en los IDs existentes, no en nombres visibles traducidos. La mayoría coincide al quitar guiones; conservar una tabla explícita para evitar depender de esa transformación en ejecución. Atención al error ortográfico de origen pirahnaplant: el ID correcto del catálogo es piranha-plant.

| Carpeta de origen | ID del catálogo / asociación propuesta | Iconos | Renders | Índices |
| --- | --- | ---: | ---: | --- |
| banjoandkazooie | banjo-and-kazooie | 8 | 8 | 0–7 |
| bayonetta | bayonetta | 8 | 8 | 0–7 |
| bowser | bowser | 8 | 8 | 0–7 |
| bowserjr | bowser-jr | 8 | 8 | 0–7 |
| byleth | byleth | 8 | 8 | 0–7 |
| captainfalcon | captain-falcon | 8 | 8 | 0–7 |
| charizard | pokemon-trainer → forma charizard | 8 | 8 | 0–7 |
| chrom | chrom | 8 | 8 | 0–7 |
| cloud | cloud | 8 | 8 | 0–7 |
| corrin | corrin | 8 | 8 | 0–7 |
| daisy | daisy | 8 | 8 | 0–7 |
| darkpit | dark-pit | 8 | 8 | 0–7 |
| darksamus | dark-samus | 8 | 8 | 0–7 |
| diddykong | diddy-kong | 8 | 8 | 0–7 |
| donkeykong | donkey-kong | 8 | 8 | 0–7 |
| drmario | dr-mario | 8 | 8 | 0–7 |
| duckhunt | duck-hunt | 8 | 8 | 0–7 |
| falco | falco | 8 | 8 | 0–7 |
| fox | fox | 8 | 8 | 0–7 |
| ganondorf | ganondorf | 8 | 8 | 0–7 |
| greninja | greninja | 8 | 8 | 0–7 |
| hero | hero | 8 | 8 | 0–7 |
| iceclimbers | ice-climbers | 8 | 8 | 0–7 |
| ike | ike | 8 | 8 | 0–7 |
| incineroar | incineroar | 8 | 8 | 0–7 |
| inkling | inkling | 8 | 8 | 0–7 |
| isabelle | isabelle | 8 | 8 | 0–7 |
| ivysaur | pokemon-trainer → forma ivysaur | 8 | 8 | 0–7 |
| jigglypuff | jigglypuff | 8 | 8 | 0–7 |
| joker | joker | 8 | 8 | 0–7 |
| kazuya | kazuya | 8 | 8 | 0–7 |
| ken | ken | 8 | 8 | 0–7 |
| kingdedede | king-dedede | 8 | 8 | 0–7 |
| kingkrool | king-k-rool | 8 | 8 | 0–7 |
| kirby | kirby | 8 | 8 | 0–7 |
| link | link | 8 | 8 | 0–7 |
| littlemac | little-mac | 8 | 8 | 0–7 |
| lucario | lucario | 8 | 8 | 0–7 |
| lucas | lucas | 8 | 8 | 0–7 |
| lucina | lucina | 8 | 8 | 0–7 |
| luigi | luigi | 8 | 8 | 0–7 |
| mario | mario | 8 | 8 | 0–7 |
| marth | marth | 8 | 8 | 0–7 |
| megaman | mega-man | 8 | 8 | 0–7 |
| metaknight | meta-knight | 8 | 8 | 0–7 |
| mewtwo | mewtwo | 8 | 8 | 0–7 |
| miibrawler | mii-brawler | 1 | 1 | 0 |
| miigunner | mii-gunner | 4 | 4 | 0–3 |
| miiswordfighter | mii-swordfighter | 1 | 1 | 0 |
| minmin | min-min | 8 | 8 | 0–7 |
| mrgameandwatch | mr-game-and-watch | 8 | 8 | 0–7 |
| ness | ness | 8 | 8 | 0–7 |
| olimar | olimar | 8 | 8 | 0–7 |
| pacman | pac-man | 8 | 8 | 0–7 |
| palutena | palutena | 8 | 8 | 0–7 |
| peach | peach | 8 | 8 | 0–7 |
| pichu | pichu | 8 | 8 | 0–7 |
| pikachu | pikachu | 8 | 8 | 0–7 |
| pirahnaplant | piranha-plant | 8 | 8 | 0–7 |
| pit | pit | 8 | 8 | 0–7 |
| pokemontrainer | pokemon-trainer | 8 | 8 | 0–7 |
| pyramythra | pyra-mythra | 8 | 8 | 0–7 |
| richter | richter | 8 | 8 | 0–7 |
| ridley | ridley | 8 | 8 | 0–7 |
| rob | rob | 8 | 8 | 0–7 |
| robin | robin | 8 | 8 | 0–7 |
| rosalinaandluma | rosalina-and-luma | 8 | 8 | 0–7 |
| roy | roy | 8 | 8 | 0–7 |
| ryu | ryu | 8 | 8 | 0–7 |
| samus | samus | 8 | 8 | 0–7 |
| sephiroth | sephiroth | 8 | 8 | 0–7 |
| sheik | sheik | 8 | 8 | 0–7 |
| shulk | shulk | 8 | 8 | 0–7 |
| simon | simon | 8 | 8 | 0–7 |
| snake | snake | 8 | 8 | 0–7 |
| sonic | sonic | 8 | 8 | 0–7 |
| sora | sora | 8 | 8 | 0–7 |
| squirtle | pokemon-trainer → forma squirtle | 8 | 8 | 0–7 |
| steve | steve | 8 | 8 | 0–7 |
| terry | terry | 8 | 8 | 0–7 |
| toonlink | toon-link | 8 | 8 | 0–7 |
| villager | villager | 8 | 8 | 0–7 |
| wario | wario | 8 | 8 | 0–7 |
| wiifittrainer | wii-fit-trainer | 8 | 8 | 0–7 |
| wolf | wolf | 8 | 8 | 0–7 |
| yoshi | yoshi | 8 | 8 | 0–7 |
| younglink | young-link | 8 | 8 | 0–7 |
| zelda | zelda | 8 | 8 | 0–7 |
| zerosuitsamus | zero-suit-samus | 8 | 8 | 0–7 |

---

# Evitar duplicados y archivos innecesarios

No se encontraron duplicados binarios en el origen. Las variantes no deben eliminarse por parecer similares ni por compartir personaje. Todos los originales se conservan independientemente de qué se importe.

Propuesta inicial: importar solo la pareja de índice 0 de cada una de las 86 entradas del catálogo, si el usuario lo aprueba. Serían 172 PNG y 43,166,803 bytes (aprox. 41.17 MiB), según el inventario inicial. Esto reduciría el contenido desplegado respecto a copiar las 694 parejas. Importar variantes y formas adicionales únicamente cuando exista un uso autorizado.

Antes de cualquier copia autorizada:

1. Revisar que origen y destino no hayan cambiado y generar una lista exacta de archivos a copiar.
2. Comparar rutas y hashes con los recursos existentes. Saltar archivos idénticos; detenerse y reportar cualquier colisión con contenido distinto, sin sobrescribir.
3. Copiar únicamente los PNG seleccionados; no incluir archivos temporales ni carpetas ajenas al inventario.
4. Verificar hash, número de archivos y bytes de las copias frente al origen.
5. No crear copias paralelas para default y variante 00: ambos deben apuntar al mismo recurso.
6. Mantener cualquier conversión u optimización fuera del alcance hasta acordarla; no alterar originales.

# Recursos faltantes y limitaciones

- No faltan carpetas para las 86 selecciones actuales; esto no equivale a tener ocho variantes para todos los Mii.
- Mii Brawler y Mii Swordfighter solo aportan una pareja; Mii Gunner aporta cuatro. No inventar variantes ausentes.
- No hay una colección verificada de ilustraciones de cuerpo completo. Los renders examinados son recortados.
- No hay carpetas separadas pyra y mythra en el origen analizado; no se ha comprobado si alguna variante contiene una sola de ellas.
- Los iconos de 32×32 tienen resolución limitada para mostrarse grandes. No prometer calidad de retrato a partir de estos archivos.
- Faltan etiquetas semánticas verificadas para la mayoría de colores/trajes y una revisión visual de todas las parejas.
- No se verificaron transparencia y decodificación de cada PNG; las dimensiones proceden de cabeceras.
- No se realizó una búsqueda externa de recursos ni se confirmó la licencia o procedencia editorial de la colección.
- No se han integrado rutas nuevas: el catálogo sigue apuntando a las rutas planas originales.

# Criterios de aceptación de esta entrega

1. Existe este documento siguiendo la organización por contexto, objetivos, requisitos y verificación de los prompts anteriores.
2. Se documentan las 89 carpetas, 1,388 PNG, tipos, dimensiones y excepciones.
3. Se establece la cobertura de las 86 entradas y los DLC, sin confundir los tres Pokémon adicionales con selecciones nuevas.
4. Se distingue lo verificado por inventario de lo examinado visualmente y de lo pendiente.
5. Se propone una estructura compatible con los IDs actuales, sin implementarla.
6. Solo se crea este archivo: no se copian imágenes ni se modifica código o recursos existentes.
7. Se entregan resultados y recomendaciones al usuario; la siguiente operación de copia o integración requiere su autorización expresa.

# Verificación final y siguiente paso

Releer el documento guardado y comprobar su integridad. No es necesario ejecutar build o lint por una incorporación exclusivamente documental.

Entregar un resumen del inventario, la cobertura DLC, el problema de los renders recortados, las excepciones Mii y la estrategia de importación propuesta. Esperar autorización para el alcance exacto siguiente: copiar únicamente las 86 parejas iniciales, incluir variantes adicionales o buscar primero recursos de cuerpo completo. No interpretar la finalización de este análisis como permiso para modificar el bracket, Stage Banning o VS.
