# STAGE//STRIKE — Fase 10: registro independiente de participantes

## Objetivo y alcance

Crear `/registration`, con registro individual, lista pegada, importación y exportación XLSX/CSV/TXT, vista previa, gestión de duplicados y selección explícita de ocho participantes para el Top 8 existente. Mantener independientes registro, torneo, resultados y VS. No modificar HomePage, rulesets, Stage Banning, VS ni el algoritmo de doble eliminación. No implementar Supabase, autenticación ni brackets variables. No hacer push.

## Revisión previa y respaldo

Se revisaron rutas, AppShell, ParticipantForm, modelos, validación/importación JSON del torneo, useTournament, almacenamiento y pruebas del motor/VS. El motor requiere exactamente ocho participantes, alias de hasta 32 caracteres y personaje antes de sortear. El registro no requiere personaje ni comparte su almacenamiento.

Respaldo previo: `stage-banning-before-phase10-20261017-203411.zip` (47,003,450 bytes). Incluye el árbol de trabajo y cambios sin commit de fases anteriores; excluye `.git`, `node_modules`, `dist` y ZIP anteriores. No se descartó ni sobrescribió trabajo previo.

## Implementación y decisiones

- Registro versionado `{schemaVersion: 1, participants: [{id, nickname}]}` bajo `stage-strike.registration.v1`. El torneo conserva `stage-strike.top8.v1` y su esquema sin cambios.
- UUID estable al agregar. Editar conserva ID. Reemplazar una lista reutiliza IDs de coincidencias con el registro actual. Eliminar y volver a registrar posteriormente crea una identidad nueva.
- Sin límite de cantidad en el modelo. Nicknames de 1–128 caracteres, sin controles, limpiados únicamente en extremos. Duplicados por minúsculas y espacios consecutivos normalizados, sin cambiar el texto visible. No se unifican acentos ni nombres parecidos.
- Lectura, validación, cambios, persistencia y conversión de archivos fuera del componente. Guardado automático únicamente tras acciones confirmadas. Un error de lectura no sobrescribe el dato; un fallo de escritura conserva el guardado anterior. Evento `storage` y comprobación de estado antes de guardar evitan sobrescrituras obvias de otra pestaña; localStorage no aporta transacciones entre pestañas.
- Lista y vista previa paginadas a 25 filas. Búsqueda, selección por página, selección que persiste entre páginas, edición y eliminación individual/múltiple con confirmación.
- Pegar/importar nunca guarda directamente. La vista previa indica nuevos, repetidos en la lista y ya registrados. Agregar omite duplicados. Reemplazar informa el total único resultante y exige una segunda confirmación explícita.
- Importación exclusivamente local; no se transmiten archivos. CSV: UTF-8/BOM, coma/punto y coma/tabulador, `sep=`, comillas escapadas y registros entrecomillados. Saltos de línea dentro del nickname se rechazan por validación, no se dividen accidentalmente. TXT: un alias por línea; líneas vacías ignoradas.
- XLSX: una hoja; encabezado Nickname detectado en cualquier columna, o una columna sin encabezado. Números simples se convierten a texto; para conservar ceros iniciales hay que guardar la celda como texto. Filas vacías ignoradas. Fórmulas se rechazan incluso con resultado almacenado; no se calculan. Objetos, hipervínculos y fechas en Nickname se rechazan. No se ejecutan macros, enlaces ni contenido activo.
- Límite por archivo: 5 MB. Inspección previa del directorio ZIP, hasta 25 MB declarados descomprimidos y 2,000 entradas; se rechazan paquetes cifrados, vínculos externos, macros y objetos incrustados. Archivos corruptos o con varias hojas reciben un error. Son límites de recursos de importación, no de cantidad de participantes del registro.
- ExcelJS 4.4.0 es la única dependencia directa añadida. Se carga mediante importación dinámica solo al leer/generar XLSX. Documentación consultada: https://github.com/exceljs/exceljs . Override de su dependencia uuid a `^11.1.1` para evitar la vulnerabilidad reportada por npm; comprobado mediante pruebas de lectura/escritura. No se ejecutó un `npm audit fix` general sobre dependencias ajenas a esta fase.
- Exportación XLSX con cadenas explícitas (no fórmulas), CSV UTF-8 con campos entrecomillados y apóstrofo protector para prefijos `=`, `+`, `-`, `@`. TXT conserva los nicknames exactos. El apóstrofo protector de CSV puede permanecer al reimportar: no se elimina automáticamente porque podría ser parte del nickname. XLSX/TXT son las opciones para una copia textual fiel.
- Plantilla XLSX: hoja `Participantes`, A1 `Nickname`, filas 2–33 con formato texto. Los archivos exportados contienen solo nicknames, no IDs ni otros datos técnicos; son respaldo de la lista, no un respaldo de identidad interna.

## Integración segura con Top 8

Acceso Registro en navegación y `Registro · elegir participantes` en Bracket. Seleccionar exactamente ocho personas y pulsar `Usar los 8 seleccionados`. La confirmación muestra los nombres y advierte que reemplaza el torneo local actual: exportar primero su JSON si se desea conservarlo. Cancelar no hace cambios. El registro completo permanece intacto.

Se crea un borrador con los mismos IDs, copia de los nicknames y personajes vacíos. En Bracket se eligen personajes, se sortea y se inicia mediante el flujo anterior. No hay sorteo ni inicio automático. No se truncan alias mayores a 32 caracteres: se explica la limitación del Top 8 actual. Cambiar/eliminar/reemplazar registros después no cambia la copia del torneo ni sus resultados. Los participantes no elegidos permanecen registrados; nunca se seleccionan los primeros ocho silenciosamente.

## Uso y comprobación manual

1. Ejecutar `npm.cmd run dev`; abrir `/registration` desde Registro.
2. Agregar un nickname. Editarlo y verificar el contador. Probar duplicados con mayúsculas/espacios.
3. Abrir Pegar lista, pegar un nickname por línea y Revisar lista. Cancelar para comprobar que no cambió el registro; revisar de nuevo y confirmar.
4. Descargar plantilla, completarla como texto y usar Importar archivo. Probar XLSX, CSV UTF-8 y TXT. Revisar conteos y ambos modos; reemplazar requiere confirmación adicional.
5. Buscar, cambiar página, seleccionar varias filas y eliminar con confirmación. Exportar XLSX/CSV/TXT.
6. Cambiar de apartado/refrescar y verificar persistencia. Seleccionar ocho, confirmar nuevo Top 8 y completar personajes en Bracket. Verificar que los demás siguen en Registro.
7. Usar un torneo de prueba para reemplazos. Exportar su JSON, cancelar la creación y comprobar que sus resultados siguen intactos; importar/editar la lista nunca debe modificar ese torneo.

## Archivos

Creados:
- `src/PROMPT_FASE_10.md`
- `src/utils/registration.ts`
- `src/utils/registrationFiles.ts`
- `src/hooks/useRegistration.ts`
- `src/pages/RegistrationPage.tsx`
- `src/styles/registration.css`
- `tests/registration.test.mjs`
- ZIP de respaldo indicado arriba.

Modificados:
- `package.json`, `package-lock.json`: ExcelJS y override acotado.
- `src/app/routes.tsx`: ruta independiente.
- `src/components/layout/AppShell.tsx`: acceso Registro y ajuste de navegación móvil.
- `src/pages/TournamentAdminPage.tsx`: acceso al registro.
- `tests/tournament-render.test.mjs`: render de registro/paginación y acceso desde Bracket.

## Verificación

Resultados finales:

| Comando | Resultado |
| --- | --- |
| `npm.cmd test` | 71 pruebas aprobadas, 0 fallos |
| `npx.cmd tsc -b` | Correcto, salida 0 |
| `npm.cmd run lint` | Correcto, salida 0 |
| `npm.cmd run build` | Correcto, salida 0 |
| `git diff --check` | Sin errores de espacios; avisos de normalización LF/CRLF |

Build: bundle principal 564.17 kB (149.15 kB gzip) y ExcelJS diferido 929.91 kB (256.47 kB gzip). Vite advierte chunks mayores a 500 kB; no es un error. ExcelJS no se carga al abrir Registro ni durante operaciones TXT/CSV, sino al utilizar XLSX. No se ocultó el aviso cambiando el umbral.

Comparación SHA-256 contra el ZIP: solo cambiaron los seis archivos preexistentes enumerados arriba; no falta ningún archivo. Los seis paquetes reportados por auditoría npm conservan exactamente las versiones del respaldo previo. La instalación inicialmente falló por restricción de red; se completó con la autorización de npm. Para la comparación del respaldo se utilizó PowerShell/.NET y Node tras no encontrar Python; no se borró ni extrajo contenido sobre el proyecto.

Cobertura añadida: registro/edición/eliminación, IDs, duplicados, Unicode, pureza de vista previa, agregar/reemplazar, almacenamiento separado, listas 8/32/64/128/1024, CSV delimitadores/comillas/BOM, TXT, XLSX real y plantilla, rechazo de fórmulas/objetos/varias hojas/archivos inválidos o grandes, exportaciones, selección Top 8 compatible y render paginado. Se conserva la suite de regresión del torneo, doble eliminación, DQ y VS.

## Limitaciones y Fase 11

- Bracket sigue siendo Top 8; cantidades variables y su algoritmo corresponden a Fase 11.
- XLSX sencillo de una hoja, sin selección de hoja ni importación de formatos antiguos XLS/XLSM, archivos protegidos o fórmulas. Texto UTF-8; CSV antiguos ANSI deben convertirse.
- Persistencia limitada por cuota/disponibilidad de localStorage, sin sincronización ni garantía transaccional entre pestañas. No hay servidor.
- Copias XLSX/CSV/TXT guardan nicknames; al importar en un registro vacío se generan IDs nuevos. Los torneos conservan su propio JSON con identidades y resultados.
- No había navegador conectado (inventario de apps/browsers vacío). Se verifican lógica y render estático; revisión visual interactiva, descargas reales, móvil y navegación de teclado pendientes de comprobación manual.
- Auditoría npm: tras corregir uuid quedan 6 avisos (1 moderado, 5 altos) de dependencias previas de herramientas; no se amplía esta fase a una actualización general.
