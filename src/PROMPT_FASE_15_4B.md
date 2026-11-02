# STAGE//STRIKE — Fase 15.4B

## Resultado

Página `/my-tournaments` y enlace **Mis torneos** disponibles únicamente en
`auth-tests` de desarrollo. Usa el cliente aislado existente, su referencia
permitida y sessionStorage. No se modificaron variables de entorno, SQL,
credenciales, bracket, VS, Standings, Stage Banning, Registro, Rulesets ni
exportaciones. No hay sincronización de resultados ni escrituras directas en
tablas. No se hizo push ni se ejecutaron operaciones contra Supabase remoto.

El usuario informó que la migración 15.4A y su prueba 05 pasaron en
`stage-strike-tests`. Esta fase consume ese contrato sin nuevos scripts SQL.

## Archivos

- `src/pages/MyTournamentsPage.tsx`: sesión, listado, creación, administración,
  invitaciones recibidas, confirmaciones de revocación y estados de carga/error.
- `src/lib/remoteTournaments.ts`: consultas paginadas y wrappers limitados de RPC.
- `src/app/routes.tsx` y `src/components/layout/AppShell.tsx`: ruta lazy y navegación
  condicional del modo de pruebas. En modo local normal no aparece el enlace y
  la ruta no activa el módulo remoto.
- `tests/remote-tournaments.test.mjs`: pruebas de permisos de listado, contrato
  RPC, UUID, revisión, conflictos, privacidad de lecturas y paginación.
- `tests/browser-phase15-4b.mjs`: flujo de dos cuentas con respuestas simuladas,
  sin tráfico Supabase real; usa un perfil Chrome independiente.

## Operaciones y permisos

Crear envía solo el nombre a `ss_create_tournament`; nunca envía owner_id.
PostgreSQL asigna el propietario desde auth.uid(). El listado combina torneos
visibles por RLS con membresías de la propia cuenta: incluye owner y admin,
excluye player y ajenos. Owner tiene prioridad sobre cualquier membresía residual.
No se interpreta nickname, correo ni user_metadata como autorización.

La sección Administradores lee miembros admin y solo el número de revisión del
bracket, sin descargar ni reemplazar su estado JSONB. El owner puede invitar con
`ss_invite_admin` y revocar/cancelar con `ss_revoke_admin`. Los demás ven solo la
lista permitida. El propietario no aparece como un admin revocable.

Antes de revocar hay confirmación nativa que identifica cuenta y torneo; cancelar
no envía solicitudes. Revocar también cancela invitaciones pendientes de la cuenta,
según el contrato SQL existente. Se utiliza la revisión que se mostró/cargó, no se
ocultan conflictos sustituyéndola automáticamente por una nueva.

El destinatario consulta sus propias invitaciones pendientes y acepta mediante
`ss_invitation_revision` seguido de `ss_accept_admin_invitation`. No puede leer el
nombre del torneo antes de aceptar bajo el RLS actual: se muestran los UUID de
torneo e invitador, sin crear una consulta privilegiada para revelar metadatos.
Las invitaciones caducadas se identifican al actualizar; el servidor decide siempre
si aún son válidas al aceptar.

Todas las escrituras usan RPC. Los botones de owner son solo una ayuda de interfaz:
la autorización efectiva y la revisión se comprueban en las funciones SQL. Si una
cuenta pierde permisos mientras la página sigue abierta, la siguiente lectura u
operación se rechaza por RLS/RPC. No hay Realtime; usar **Actualizar lista**.

## Localización de destinatarios: limitación explícita

**No existe una búsqueda segura por correo/nickname en el contrato actual.**
No se consultan perfiles ajenos, no se lista auth.users y no se incorpora una clave
privilegiada. Esa búsqueda queda bloqueada hasta diseñar y revisar una operación
servidor que respete privacidad y evite enumeración.

Para esta primera interfaz se permite la alternativa segura ya admitida por
`ss_invite_admin`: la persona comparte voluntariamente su UUID, visible como
**Tu identificador de cuenta** en Mis torneos. El UUID no es una credencial y
conocerlo no concede permisos. La cuenta debe estar verificada y haber guardado
su perfil en Cuenta. La invitación solo concede admin tras aceptación autenticada
por el UUID destinatario exacto. No se concede acceso por compartir un enlace.

## Errores, sesión y concurrencia

Sesión requerida sin bloquear páginas locales. Al cambiar de identidad o cerrar
sesión se desmonta el estado privado; no se guarda listado, selección o roles en
localStorage. Respuestas tardías se descartan al desmontar o reemplazar una carga.
Los callbacks Auth son síncronos y las consultas van fuera de ellos.

Se bloquean envíos dobles. Tras una escritura confirmada se actualizan listados y
revisión. Ante error RPC se exige actualizar antes de repetir; 40001 no se reintenta
automáticamente. Un fallo de red puede significar respuesta perdida tras commit:
el mensaje exige revisar la lista antes de repetir para no duplicar un torneo.
No se promete idempotencia de creación porque la RPC actual no tiene ese contrato.

Los errores se traducen por códigos, sin mostrar mensajes crudos, tokens ni datos
privados. Revisiones bigint fuera del rango entero seguro de JavaScript se rechazan,
en lugar de enviar una revisión redondeada.

## Prueba manual con dos cuentas en stage-strike-tests

1. Ejecutar `npm.cmd run dev:auth-tests`. Abrir
   `http://127.0.0.1:5174/account` en dos navegadores o perfiles separados (por
   ejemplo normal e incógnito). No duplicar una pestaña para cambiar de identidad:
   algunos navegadores copian sessionStorage al duplicarla.
2. Iniciar sesión con A y B; ambas cuentas deben confirmar correo y guardar su
   nickname en Cuenta. En B abrir **Mis torneos** y copiar su UUID visible.
3. En A abrir **Mis torneos → Crear torneo**. Debe figurar como **Propietario**.
4. A: **Administradores**, pegar UUID de B y pulsar **Invitar coadministrador**.
5. B: **Actualizar lista → Invitaciones recibidas → Aceptar invitación**.
   El torneo aparecerá como **Coadministrador**. B no debe tener controles para
   invitar ni revocar, ni opciones de edición remota del bracket.
6. A: **Actualizar lista → Administradores → Revocar administración**. Probar
   primero cancelar: B debe conservar acceso. Después confirmar la revocación.
   B actualiza y el torneo debe desaparecer de su lista administrable.
7. Si A no actualiza después de una aceptación/cambio concurrente y usa una
   revisión antigua, debe aparecer el mensaje de conflicto. Actualizar y revisar
   antes de volver a confirmar. No se debe sobrescribir el cambio ajeno.
8. Abrir Registro, bracket local, VS, Standings y Stage Banning sin iniciar sesión;
   sus datos y funcionamiento no dependen de esta página.

## Verificación realizada

- **142/142 pruebas** aprobadas, incluyendo las 136 previas.
- TypeScript (`tsc -b`), lint y build aprobados; persiste el aviso de bundles grandes.
- Chrome aislado: bloqueo sin sesión, dos cuentas, exclusión de player/ajenos,
  creación sin owner_id, doble envío, rechazo de nickname como destinatario,
  invitación/aceptación, controles owner/admin, cancelación de revocación,
  conflicto sin reintento, revocación efectiva y localStorage intacto.
- Capturas de escritorio/móvil revisadas; sin desbordamiento horizontal.
- Ninguna petición del test salió a Supabase real: todas fueron interceptadas.
  El flujo real con dos cuentas y RLS del proyecto queda para la prueba manual.
