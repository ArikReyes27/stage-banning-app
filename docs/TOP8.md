# Top 8 — doble eliminación local

## Acceso

Ejecuta `npm run dev`. En la dirección que indique Vite, abre `/tournament`
para administrar o `/tournament/presentation` para presentar. El acceso **Top 8**
está en la navegación compartida. HomePage, los rulesets y la sesión de baneo
permanecen independientes.

## Operación

1. Registra ocho alias diferentes y un personaje por participante.
2. Genera el bracket. Puedes volver a sortear o editar participantes antes de iniciar.
   Editar un participante descarta el sorteo previo.
3. Inicia el torneo. Abre un encuentro con ambos participantes definidos.
4. Elige BO3 o BO5, registra juegos ganados y guarda el marcador parcial o confirma
   el ganador. Un marcador terminal sin confirmar no hace avanzar jugadores.
5. Al corregir un ganador anterior, revisa los códigos de encuentros que se invalidarán.
   Cancelar conserva el torneo intacto. Corregir solamente el marcador o el formato,
   conservando el ganador confirmado, mantiene las rondas posteriores.
6. Si el finalista de Losers gana Grand Final, aparece Grand Final Reset.
7. Exporta JSON como respaldo. Importar valida primero y pide confirmar el reemplazo.
   El reinicio completo y un nuevo sorteo después de iniciar requieren confirmación.

Cambiar de formato en el panel pone sus marcadores a cero; no modifica lo guardado
hasta pulsar Guardar marcador o Confirmar ganador. Cerrar el panel descarta los cambios
que todavía no se hayan guardado.

## Conexiones

| Encuentro | Participante A | Participante B |
| --- | --- | --- |
| W1–W4 | Pares consecutivos del sorteo | |
| W5 | Ganador W1 | Ganador W2 |
| W6 | Ganador W3 | Ganador W4 |
| W7 | Ganador W5 | Ganador W6 |
| L1 | Perdedor W1 | Perdedor W2 |
| L2 | Perdedor W3 | Perdedor W4 |
| L3 | Ganador L1 | Perdedor W6 |
| L4 | Ganador L2 | Perdedor W5 |
| L5 | Ganador L3 | Ganador L4 |
| L6 | Ganador L5 | Perdedor W7 |
| GF | Ganador W7 | Ganador L6 |
| RESET | Perdedor GF | Ganador GF |

Las caídas de semifinales se cruzan para evitar una revancha inmediata del primer
encuentro. No se almacenan participantes derivados dentro de los encuentros.

## Persistencia y límites

- Un torneo por navegador/origen, clave `stage-strike.top8.v1`, esquema versión 1.
- Se guarda cada cambio aplicado. Al recargar se valida y reconstruye el bracket.
- Un dato corrupto no se sobrescribe automáticamente; se muestra una advertencia.
- Si localStorage falla, la interfaz conserva el estado en memoria y pide exportarlo.
- Pestañas del mismo origen reciben eventos `storage`. Evita dos administradores
  editando simultáneamente: no hay resolución de conflictos.
- No hay backend, autenticación ni sincronización entre dispositivos. Presentación
  es una vista sin controles, no una barrera de seguridad.
- Cambiar puerto, navegador u origen utiliza otro almacenamiento; transfiere el JSON.
- Catálogo local de personajes; iconos pendientes en `public/images/characters/`.
  Mientras falte un PNG se utiliza una silueta uniforme. Nunca se solicitan URLs externas.
- Modelo de personajes en array, actualmente limitado a uno por jugador.
- Bracket de ocho jugadores, sin byes, descalificaciones, ranking final ni integración
  con baneo. Los ganadores se registran por marcador de juegos.
- Conectores dentro de cada sección; los cruces entre secciones se identifican por
  códigos. Las secciones se desplazan horizontalmente cuando no caben.

## Verificación

Requiere Node 22.6+ para las pruebas TypeScript sin dependencias adicionales.

```text
npm test
npx tsc -b
npm run lint
npm run build
```

Las pruebas cubren sorteo, Winners/Losers, eliminación, GF normal/reset, BO3/BO5,
corrección e invalidación, importación/exportación, almacenamiento, 128 torneos
completos y renderizado React de presentación/registro/tarjetas.

Prueba manual recomendada: completar un torneo con GF normal y otro con reset;
guardar un parcial y refrescar; cancelar y aceptar una corrección de W1 con rondas
posteriores; exportar, reiniciar e importar; comprobar teclado, confirmaciones,
desplazamiento y legibilidad en 1920×1080 y móvil. F11 permite aprovechar la pantalla.
