Quiero que implementes la **Fase 3: Crear, ver, editar y eliminar rulesets custom** del proyecto.

Contexto:
Estoy creando una web app de stage banning para Super Smash Bros. Ultimate usando React + TypeScript + Vite + Tailwind CSS + Framer Motion.

El proyecto ya debería tener implementado lo siguiente:

- Estructura base modular.
- Tipos principales.
- Tailwind CSS configurado.
- Framer Motion instalado.
- React Router configurado o navegación equivalente funcional.
- Home funcional con hero, buscador y cards modernas.
- Lectura combinada de rulesets default y custom desde localStorage.
- Rulesets default, incluyendo Shine City.
- Rutas básicas para:
  - `/`
  - `/rulesets/:rulesetId`
  - `/rulesets/new`
  - `/session/setup/:rulesetId`

Objetivo de esta fase:
Completar el flujo local de gestión de rulesets personalizados:

1. Crear rulesets custom.
2. Guardarlos en localStorage.
3. Ver detalle de cualquier ruleset.
4. Editar rulesets custom.
5. Eliminar rulesets custom.
6. Impedir editar o eliminar rulesets default.
7. Mantener la UI visualmente consistente con la Home.
8. Mantener TypeScript sin errores.

Importante:
Antes de modificar, revisa la estructura actual del proyecto. No reescribas toda la app si ya hay componentes, hooks o páginas funcionales. Reutiliza y refactoriza solo donde ayude a mantener el código limpio.

No implementes todavía:

- El motor completo de stage banning.
- El flujo guiado por turnos.
- El marcador del set.
- El módulo Top 8 / Top 16.

Los botones de iniciar sesión pueden seguir apuntando a `/session/setup/:rulesetId`. Si esa pantalla todavía no está implementada, deja un placeholder simple.

---

# Modelo de datos

Usa los tipos existentes si ya están creados. No dupliques tipos innecesariamente.

Si hace falta ajustar o completar los tipos, usa una estructura compatible con algo como esto:

```ts
export type StageType = "starter" | "counterpick";

export type Stage = {
  id: string;
  name: string;
  type: StageType;
  image?: string;
};

export type RulesetSource = "default" | "custom";

export type Ruleset = {
  id: string;
  name: string;
  community: string;
  description?: string;
  source?: RulesetSource;
  stages: Stage[];
  gameOneFlow: {
    enabledStages: "startersOnly";
    firstBanCount: number;
    secondBanCount: number;
    pickerRule: "player1" | "player2" | "rpsWinner" | "rpsLoser";
  };
  laterGamesFlow: {
    winnerBanCount: number;
    loserPicks: boolean;
    counterpicksUnlocked: boolean;
  };
  createdAt?: string;
  updatedAt?: string;
};
```

Si el proyecto actualmente separa starters y counterpicks de otra forma, puedes mantener esa estructura, pero asegúrate de que el formulario, la Home y el detalle sigan funcionando.

---

# Página: Crear ruleset

Implementa o completa la ruta:

```txt
/rulesets/new
```

Archivo sugerido:

```txt
src/pages/CreateRulesetPage.tsx
```

Debe mostrar un formulario moderno, responsive y mobile-first.

El formulario debe incluir:

## Información básica

Campos:

- Nombre del ruleset.
- Comunidad.
- Descripción.

Validaciones:

- El nombre es obligatorio.
- La comunidad es obligatoria.
- La descripción puede ser opcional.

---

## Starter stages

Debe permitir:

- Ver la lista actual de starters.
- Agregar un starter escribiendo el nombre.
- Eliminar un starter.
- Evitar nombres vacíos.
- Evitar duplicados ignorando mayúsculas/minúsculas.
- Mostrar contador de starters.

Validaciones:

- Debe haber al menos 3 starter stages para guardar.
- Si hay menos de 5 starters, muestra una advertencia visual, pero no bloquees el guardado si ya hay al menos 3.

---

## Counterpick stages

Debe permitir:

- Ver la lista actual de counterpicks.
- Agregar un counterpick escribiendo el nombre.
- Eliminar un counterpick.
- Evitar nombres vacíos.
- Evitar duplicados ignorando mayúsculas/minúsculas.
- Mostrar contador de counterpicks.

Validaciones:

- Puede haber 0 counterpicks.
- Si no hay counterpicks, muestra un mensaje indicando que en Game 2+ no habrá stages extra.

---

# Configuración de reglas

El formulario debe tener una sección clara para reglas.

## Game 1

Campos:

- Cantidad de bans del primer jugador.
- Cantidad de bans del segundo jugador.
- Regla de quién escoge stage después de los bans.

Opciones visibles para el usuario:

- Ganador de RPS.
- Perdedor de RPS.
- Player 1.
- Player 2.

Valores internos:

```ts
"rpsWinner" | "rpsLoser" | "player1" | "player2";
```

Validaciones:

- Los bans deben ser números enteros.
- No deben ser negativos.
- No deben exceder el número de starter stages disponibles.
- El total de bans de Game 1 debe dejar al menos 1 starter disponible para escoger.

---

## Game 2 en adelante

Campos:

- Cantidad de bans del ganador del game anterior.
- Toggle o checkbox: “El perdedor escoge stage”.
- Toggle o checkbox: “Desbloquear counterpicks desde Game 2”.

Valores recomendados por defecto:

```ts
laterGamesFlow: {
  winnerBanCount: 2,
  loserPicks: true,
  counterpicksUnlocked: true
}
```

Validaciones:

- `winnerBanCount` debe ser entero.
- `winnerBanCount` no debe ser negativo.
- Si no hay suficientes stages para banear y escoger, muestra error o advertencia clara.

---

# Componente reutilizable de formulario

Si tiene sentido, crea un componente compartido:

```txt
src/components/rulesets/RulesetForm.tsx
```

Debe servir para crear y editar.

Props sugeridas:

```ts
type RulesetFormProps = {
  initialValue?: Ruleset;
  mode: "create" | "edit";
  onSubmit: (ruleset: Ruleset) => void;
  onCancel?: () => void;
};
```

Puedes adaptar la API si el proyecto actual lo requiere.

También puedes crear componentes internos como:

```txt
src/components/rulesets/StageListEditor.tsx
src/components/rulesets/RulesetRulesEditor.tsx
```

---

# Página: Detalle de ruleset

Implementa o completa la ruta:

```txt
/rulesets/:rulesetId
```

Archivo sugerido:

```txt
src/pages/RulesetDetailPage.tsx
```

Debe mostrar:

- Nombre del ruleset.
- Comunidad.
- Descripción.
- Badge indicando si es default o custom.
- Lista de starter stages.
- Lista de counterpicks.
- Resumen de reglas Game 1.
- Resumen de reglas Game 2+.
- Botón “Iniciar baneo”.
- Botón “Volver”.
- Si el ruleset es custom, botón “Editar ruleset”.
- Si el ruleset es custom, botón “Eliminar ruleset”.

Diseño:

- Debe ser visual, no solo texto plano.
- Usa cards, badges, secciones y buen espaciado.
- Debe funcionar bien en celular y desktop.
- Mantén el estilo oscuro/futurista/neón del proyecto.

---

# Página: Editar ruleset

Implementa la ruta:

```txt
/rulesets/:rulesetId/edit
```

Archivo sugerido:

```txt
src/pages/EditRulesetPage.tsx
```

Requisitos:

- Solo permitir editar rulesets custom.
- Si el usuario intenta editar un ruleset default:
  - Mostrar mensaje claro.
  - Ofrecer volver al detalle o a Home.

- Cargar los datos actuales en el formulario.
- Guardar cambios en localStorage.
- Actualizar `updatedAt`.
- Mantener el mismo `id`.
- Después de guardar, navegar al detalle del ruleset editado.

---

# Eliminar ruleset custom

En la página de detalle, para rulesets custom, agrega botón:

```txt
Eliminar ruleset
```

Comportamiento:

- Pedir confirmación con `window.confirm` o un modal simple si ya existe un componente reutilizable.
- Eliminar de localStorage.
- Navegar a Home.
- No permitir eliminar rulesets default.

---

# Hook useRulesets

Amplía o ajusta:

```txt
src/hooks/useRulesets.ts
```

Debe exponer algo equivalente a:

```ts
rulesets;
customRulesets;
defaultRulesets;
getRulesetById(id);
addRuleset(rulesetInput);
updateRuleset(id, updatedRuleset);
deleteRuleset(id);
```

Notas:

- `defaultRulesets` no deben editarse ni borrarse.
- `customRulesets` sí deben editarse y borrarse.
- Al crear un ruleset, genera un `id` estable usando `crypto.randomUUID()` si está disponible, o un fallback seguro.
- Marca los rulesets creados como `source: "custom"`.
- Guarda custom rulesets en localStorage.
- Evita duplicados de ID.
- Mantén compatibilidad con lo implementado en Fase 2.
- Al leer localStorage, usa `try/catch`.
- Si localStorage tiene datos inválidos, usa un array vacío para custom rulesets y evita romper la app.

---

# Validaciones generales

Antes de guardar, valida:

- Nombre requerido.
- Comunidad requerida.
- Al menos 3 starters.
- No stages duplicados dentro de starters.
- No stages duplicados dentro de counterpicks.
- No stages duplicados entre starters y counterpicks.
- No stages sin nombre.
- Bans Game 1 válidos.
- Bans Game 2+ válidos.
- Debe quedar al menos un starter disponible para escoger después de los bans de Game 1.

Muestra errores de forma clara:

- Cerca del campo cuando sea posible.
- O en un panel superior de errores.
- No uses solamente `alert`.

Agrega feedback visual:

- Botón disabled si hay errores graves.
- Mensaje cuando no hay counterpicks.
- Mensaje cuando el ruleset fue guardado correctamente, si aplica.
- Estado para ruleset no encontrado.

---

# Diseño visual

Mantén la identidad visual del proyecto:

- Fondo oscuro.
- Cards tipo glassmorphism.
- Gradientes sutiles.
- Bordes semitransparentes.
- Acentos neón moderados.
- Botones claros.
- Badges para starters y counterpicks.
- Animaciones suaves con Framer Motion.
- Inputs grandes y cómodos para mobile.
- Buen responsive en desktop.

Evita que el formulario se sienta genérico o administrativo.

---

# Rutas y navegación

Asegúrate de que existan y funcionen:

```txt
/
 /rulesets/new
 /rulesets/:rulesetId
 /rulesets/:rulesetId/edit
 /session/setup/:rulesetId
```

Si `/session/setup/:rulesetId` todavía no está implementada, deja un placeholder simple que indique que se implementará en la Fase 4.

---

# Componentes sugeridos

Puedes crear o modificar:

```txt
src/pages/CreateRulesetPage.tsx
src/pages/EditRulesetPage.tsx
src/pages/RulesetDetailPage.tsx
src/components/rulesets/RulesetForm.tsx
src/components/rulesets/StageListEditor.tsx
src/components/rulesets/RulesetRulesEditor.tsx
src/components/ui/Button.tsx
src/components/ui/Input.tsx
src/components/ui/Textarea.tsx
src/components/ui/Badge.tsx
src/hooks/useRulesets.ts
src/hooks/useLocalStorage.ts
src/types/ruleset.ts
src/utils/rulesetValidation.ts
src/utils/id.ts
```

No es obligatorio usar exactamente estos nombres si ya existe otra estructura, pero mantén modularidad y claridad.

---

# Criterios de aceptación

Esta fase estará completa cuando:

1. Se pueda crear un ruleset custom desde `/rulesets/new`.
2. El ruleset se guarde en localStorage.
3. El ruleset nuevo aparezca en la Home.
4. Se pueda abrir el detalle de cualquier ruleset.
5. El detalle muestre starters, counterpicks y reglas.
6. Los rulesets custom se puedan editar.
7. Los rulesets default no se puedan editar.
8. Los rulesets custom se puedan eliminar.
9. Las validaciones impidan guardar datos inválidos.
10. La app compile sin errores de TypeScript.
11. La UI se mantenga responsive y visualmente consistente.
12. Los botones de iniciar baneo apunten a `/session/setup/:rulesetId`.

---

# Verificación final

Al terminar:

1. Ejecuta:

```bash
npm run build
```

2. Ejecuta también:

```bash
npm run lint
```

solo si existe ese script en `package.json`.

3. Corrige cualquier error antes de finalizar.

4. Resume:

- Archivos creados.
- Archivos modificados.
- Qué quedó funcionando.
- Validaciones implementadas.
- Qué debería hacerse en la Fase 4.
