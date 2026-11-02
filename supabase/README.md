# Supabase — preparación, fase 15.1

Revisión siguiente: [Fase 15.4A — propiedad, roles e invitaciones](../src/PROMPT_FASE_15_4A.md).
SQL preparado, pendiente de ejecución manual solo en stage-strike-tests.

Continuación actual: [Fase 15.3 — cuentas aisladas y perfiles propios](PHASE15_3.md).

Revisión posterior: [Fase 15.2 — validación y pasos pendientes](PHASE15_2.md).
Para el proyecto dedicado `stage-strike-tests`, usar las
[instrucciones y scripts del SQL Editor](sql-editor/README.md).
Su ejecución será manual; no se ha ejecutado nada remotamente.
Incluye correcciones al CHECK JSONB y pruebas SQL locales aún no ejecutadas.
El esquema todavía no está aprobado para aplicarse al proyecto real.

La migración es un borrador versionado; **no se ha aplicado**. No ejecutar SQL
alojado, `db push` ni `db reset` durante esta fase. El cliente no se importa en
ninguna pantalla ni hook. localStorage continúa siendo la única persistencia.

## Correspondencia con los modelos reales

| Modelo actual | Destino futuro |
| --- | --- |
| `Registration` (`stage-strike.registration.v1`), lista global local de IDs y nicknames | Selección explícita hacia `tournament_participants`; no importar automáticamente todo el registro a cada torneo |
| `Tournament` v1 (Top 8) / v2 (escalable) | Metadatos nuevos en `tournaments`; estado competitivo en `tournament_brackets.state` |
| `Participant` | `tournament_participants`: ID textual original, nickname, `character_ids`; `in_bracket` distingue inscritos de seleccionados |
| Orden de `Tournament.participants` | `roster_order`, orden ascendente al reconstruir el array, filtrando `in_bracket` |
| `MatchDefinition`, `MatchSource`, `MatchId` | `state.structure` opcional v1, obligatoria v2; IDs Wn/Ln/GF/RESET y fuentes seed/winner/loser conservadas |
| `MatchResult`, `MatchDetails`, `MatchGame` | `state.results`: BO3/BO5, confirmación, DQ, preparación, scores legacy, juegos anulados, variantes, escenario y rulesetId |
| Standings, campeón, BYEs y encuentros resueltos | Proyecciones de `resolveBracket` / `tournamentStandings`; sin tablas duplicadas |
| Presentación de Bracket, VS y Standings | Lecturas del mismo modelo; sin estado persistido propio ni acceso público habilitado |

`state` equivale a `Omit<Tournament, 'participants'>`: incluye `schemaVersion`,
`status`, `seeds`, `results` y los opcionales `structure`, `priorities`,
`previousSeeds`, `completionOrder`. No repetir status/resultados en otras tablas.
Los IDs vacíos de seeds representan BYEs. La revisión SQL no es schemaVersion.
El adaptador futuro reconstruirá el Tournament y usará `parseTournament` antes de
aceptar datos. Las restricciones JSONB actuales solo verifican forma básica;
no sustituyen validación de dependencias, catálogo de personajes ni reglas de juego.
No se inventa historial para resultados legacy. Los rulesets locales referidos
por `rulesetId` necesitan una estrategia de transporte posterior.

El registro local es independiente del torneo y puede diferir de su snapshot:
la futura importación debe resolver nicknames divergentes de forma explícita.
El esquema no crea todavía un directorio global remoto. `profile_id` enlaza
opcionalmente una inscripción con Auth y no concede permisos. La membresía es
independiente (un administrador puede no competir). El rol efectivo `owner` se
obtiene de `tournaments.owner_id`; `admin`/`player` viven en la tabla de miembros.
Resolver owner primero evita dos fuentes de verdad. No deducir ownership de
`user_metadata` ni permitir autoasignación de roles. No se crean perfiles con
triggers de Auth todavía ni se almacena email o contraseña en estas tablas.

## Escrituras concurrentes: contrato obligatorio antes de habilitarlas

La fase 15.1 no ofrece ninguna ruta de escritura. Una migración posterior debe
implementar una única operación transaccional autorizada que:

1. Obtenga al actor de `auth.uid()` y verifique owner/admin dentro de la transacción.
2. Bloquee la fila del torneo (`SELECT ... FOR UPDATE`), también para cambios de
   participantes, miembros o propietario; compare `expected_revision` con la actual.
3. Valide el Tournament completo reconstruido y las dependencias de resultados.
4. Actualice con `WHERE tournament_id = ... AND revision = expected_revision`,
   incremente revision en uno y establezca actor/fecha desde el servidor.
5. Inserte el delta de auditoría con la misma revisión y confirme todo junto.
   Cualquier fallo revierte estado, inscripción, reporte y auditoría.

Cero filas actualizadas significa conflicto: recargar y pedir revisión humana,
sin reintentar automáticamente el JSONB completo. Dos resultados de partidos
distintos también compiten por la revisión global. Todas las mutaciones deben
usar este contrato, sin conceder UPDATE directo a clientes. Transferencias de
ownership y permisos usan el mismo bloqueo para evitar carreras de autorización.
La creación inicial de torneo, roster y bracket revisión 0 será atómica.

`tournament_revisions` reserva auditoría por deltas (valores antes/después,
acción y razón), no snapshots redundantes. Su carácter append-only será impuesto
por la futura API: nunca otorgar UPDATE/DELETE a clientes. No constituye todavía
un historial reconstruible ni protege frente al operador de la base.
`result_reports` almacena propuestas separadas de resultados oficiales; aceptar
requiere validar match, actor, revisión y resultado, y auditar dentro de la misma
transacción. No hay RPC implementada ni garantía de CAS para escrituras privilegiadas
manuales; por eso no se habilita ninguna escritura remota en esta fase.

## Seguridad y futura matriz de permisos

Hoy las siete tablas tienen ENABLE/FORCE RLS, política restrictiva `false` para
anon/authenticated y todos sus privilegios revocados (también PUBLIC).
No existe política permisiva: incluso con sesión Auth no hay lecturas/escrituras.
No se alteran grants globales de otros objetos del proyecto. Roles privilegiados
de administración pueden eludir RLS; sus claves nunca pertenecen al frontend.

| Actor futuro | Alcance propuesto, aún no habilitado |
| --- | --- |
| Anónimo | Ninguno; presentación pública requiere decisión y proyección segura aparte |
| Usuario autenticado ajeno | Solo su perfil; sin acceso a otros torneos |
| Player miembro | Lectura de su torneo y propuesta de resultados propios, validada contra la inscripción |
| Admin | Lectura y edición competitiva transaccional; no ownership ni elevación de roles |
| Owner | Gestión de torneo, miembros y transferencia explícita de propiedad |

La fase siguiente deberá reemplazar deliberadamente el bloqueo restrictivo y
añadir políticas mínimas, no simplemente sumar políticas permisivas (el bloqueo
`false` seguiría prevaleciendo). Las lecturas de membresía deben evitar recursión
RLS; cualquier helper privilegiado necesita search_path fijo y EXECUTE mínimo.
Los perfiles serán privados por defecto; el roster ya contiene el nickname de
competición. Probar aislamiento entre torneos, escalamiento de roles, reportes
ajenos, concurrencia y rollback antes de habilitar operaciones.

## Configuración manual futura

En StageStrike → ArikReyes's Project, obtener la URL exacta y la **publishable
key** `sb_publishable_...` desde Connect/API Keys. Copiar `.env.example` a
`.env.local`, completar solo esos dos valores y reiniciar Vite. No son necesarios
para usar la aplicación local. No usar secret keys, service_role ni contraseñas.
Vite incorpora variables VITE_* al bundle: ignorar el archivo en Git no las hace
secretas. El cliente rechaza claves que no tengan prefijo publishable; ese filtro
no puede impedir que Vite empaquete un secreto mal colocado en variables VITE_*.

`getSupabaseClient()` devuelve null sin configuración válida; inicializa un
singleton solo al invocarse. Auth persistente, renovación y detección de sesión
en URL están deshabilitadas. No hay consultas, canales realtime ni migraciones
automáticas. Generar tipos Database desde un entorno validado en una fase futura;
el cliente actual no promete tipos de tablas que aún no existen remotamente.

Referencias oficiales consultadas:

- [API keys](https://supabase.com/docs/guides/getting-started/api-keys)
- [Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security)
- [Securing your data](https://supabase.com/docs/guides/database/secure-data)
