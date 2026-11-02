# Fase 15.3 — cuentas en stage-strike-tests

Implementación preparada. No se ejecutó SQL, registro de usuarios ni consultas
contra Supabase real durante este trabajo. El usuario informó que los scripts
01/02 de Fase 15.2 ya pasaron en el proyecto de pruebas.

## Aislamiento antes de activar Auth

1. Verifica el Project Reference **público** de `stage-strike-tests` en el Dashboard
   (identificador de 20 caracteres en la URL). En `src/lib/authTestProject.ts`, sustituye
   `UNCONFIGURED_TEST_PROJECT` por esa referencia. No uses la del proyecto principal.
   El nombre del proyecto no se puede deducir de una URL Supabase: este pin requiere
   verificación humana. Mientras no esté fijado, no se crea ningún cliente Auth.
2. Copia `config/auth-tests/.env.example` a `config/auth-tests/.env.local` y completa
   **solo** URL y publishable key del proyecto de pruebas. No copies ni edites el
   `.env.local` de la raíz. No uses secret keys, service_role o contraseñas de DB.
3. Ejecuta `npm run dev:auth-tests` y abre `http://127.0.0.1:5174/account`.
   Reinicia Vite después de configurar las variables.

Este modo tiene envDir separado y solo expone `VITE_AUTH_TEST_*`; no carga los
archivos `.env*` de la raíz. Valida modo de desarrollo, pin, origen HTTPS exacto,
formato publishable y ruta raíz. Un fetch adicional bloquea otros orígenes y
redirecciones HTTP. Nunca hay fallback a las variables del cliente anterior.
`npm run dev` y los builds de producción no habilitan Auth. Una configuración
incompleta, destino incorrecto o almacenamiento bloqueado deja el juego disponible
y muestra «Cuentas de prueba no disponibles». No son errores que autoricen usar
la configuración del proyecto principal.

## SQL manual, exclusivamente en pruebas

En el SQL Editor de **stage-strike-tests**, rol postgres, revisar y ejecutar en orden:

1. `sql-editor/03_profiles_auth_tests.sql`: copiar todo, sustituir el literal
   `CONFIRM_TEST_PROJECT` por `stage-strike-tests` tras verificar proyecto y referencia.
   Resultado: `PROFILES_READY: self-only nickname access; tournament tables remain locked`.
2. `sql-editor/04_verify_profiles_auth_tests.sql`: copiar todo y repetir la confirmación.
   Conservar el ROLLBACK. Resultado:
   `PASS: own profiles only; anon and tournament access blocked; fixtures rolled back`.

03 se aplica una sola vez y no modifica usuarios ni crea triggers Auth. Si existen
nicknames incompatibles con la nueva restricción, aborta sin reescribirlos.
04 crea dos fixtures Auth temporales, aborta si sus UUID existen o hay triggers
personalizados, usa roles reales y claims sintéticos, y revierte todo. No usa
usuarios existentes. No implica validación HTTP de GoTrue.
Si falla cualquiera, conservar el error para revisión; no borrar tablas ni forzar
permisos. Ejecutar ROLLBACK si la sesión quedó abortada.

**No volver a ejecutar 02 esperando PASS después de 03**: 02 verificaba que incluso
profiles estaba totalmente bloqueada. 04 valida la nueva excepción de perfiles.
No aplicar todavía estos scripts al proyecto principal.

## Cambios de seguridad de perfiles

- El modelo existente `profiles.display_name` almacena el nickname; no se añade
  una segunda columna ni se relaciona automáticamente con participantes locales.
- Authenticated puede SELECT propio, INSERT propio (id/display_name) y UPDATE
  únicamente display_name propio. No DELETE, cambios de id ni created_at.
- La política restrictiva de profiles sigue bloqueando anon. Para authenticated
  hay una barrera restrictiva `auth.uid() = id`, además de políticas permisivas
  por operación. El nickname es obligatorio, 1–32 caracteres y sin controles.
- Las otras seis tablas conservan REVOKE y bloqueo RLS. No se crean roles admin,
  memberships, torneos, reportes, RPCs privilegiadas, login de administradores
  ni Realtime. La información en user_metadata no otorga autorización.
- El nickname del registro se guarda como sugerencia en metadata de Auth; después
  de iniciar sesión se crea el perfil al pulsar «Guardar nickname». No hay trigger
  que pueda romper signup cuando la migración de perfiles aún no está aplicada.

## Dashboard de Auth y prueba de cuentas

En **stage-strike-tests**, Authentication:

1. Habilitar proveedor Email, registro de nuevos usuarios y confirmación de correo.
   Configurar contraseña mínima de 12 caracteres (la UI también exige ese mínimo
   al registrarse; el Dashboard debe imponerlo para otros clientes API).
2. URL Configuration: Site URL `http://127.0.0.1:5174` y Redirect URL exacta
   `http://127.0.0.1:5174/account`. No añadir comodines de producción.
3. Configurar el envío de correo permitido para las cuentas de prueba. Si el
   servicio de correo por defecto limita destinatarios, usar direcciones autorizadas
   o configurar SMTP de pruebas; no desactivar la confirmación para ocultar el fallo.

En `/account`, crear una cuenta con correo de prueba, nickname y contraseña de
al menos 12 caracteres. Revisar el correo y confirmar. Volver a la aplicación e
iniciar sesión. El flujo PKCE puede completar la sesión al regresar en la misma
pestaña; si el enlace abre otra pestaña/navegador sin su verificador, iniciar sesión
con contraseña una vez confirmado el correo. «Reenviar confirmación» solicita
otro enlace sin revelar si una cuenta ya existe.

Guardar el nickname, recargar y comprobar que sigue visible. Cerrar sesión y
verificar que aparece el formulario; iniciar sesión con otra cuenta y comprobar
que ve únicamente su perfil. Registro/Bracket/VS/Standings/Stage Banning siguen
accesibles sin sesión; guardar nickname no cambia los participantes.

## Sesiones y errores

El SDK conserva tokens solo en **sessionStorage**, con clave exclusiva del proyecto
de pruebas, y renueva automáticamente mientras la app está abierta. No usa
localStorage ni modifica claves de torneos. Cerrar la pestaña finaliza la persistencia
de esa sesión; no promete sesión compartida entre pestañas. Logout es local a la
sesión y revoca su refresh token mediante Auth; si falla se informa y no se anuncia
un cierre exitoso. Los eventos SIGNED_OUT limpian la interfaz, incluida caducidad.

Tokens y contraseñas nunca se imprimen ni se guardan por la aplicación. Los errores
visibles se traducen desde códigos conocidos, sin mostrar mensajes crudos del SDK.
Las contraseñas se limpian tras éxito y al cambiar de formulario. Los callbacks
Auth son síncronos; las consultas de perfiles se hacen fuera del callback. Se
cancelan actualizaciones de componentes desmontados y se bloquean envíos dobles.
Las peticiones tienen timeout de 20 segundos. La sesión del navegador solo sirve
a la interfaz; Supabase valida el token y RLS en cada operación de perfiles.
sessionStorage sigue siendo accesible a JavaScript del origen, no es una cookie
HttpOnly; mantener la prevención de XSS y no añadir scripts externos no confiables.

## Verificación

- Pruebas unitarias: aislamiento de modo/origen/pin, rechazo de secretos,
  validación de nickname, errores sanitizados, creación concurrente de perfil y
  escrituras limitadas al nickname propio; suite previa de torneos intacta.
- Chrome aislado con todas las solicitudes Supabase interceptadas: signup con
  confirmación, error de login, login, recuperación tras recarga, perfiles sin
  permisos y reintento, renovación/caducidad, logout y rutas locales; layout móvil.
  No son pruebas end-to-end con un proyecto Supabase real.
- TypeScript, lint y build forman parte de los checks de entrega. La prueba SQL
  04 y el envío real de correo requieren ejecución manual, pendiente.

Resultado local: **136/136 pruebas aprobadas**, `tsc -b`, lint y build aprobados.
Chrome pasó con signup, login erróneo/correcto, perfil sin permisos y reintento,
renovación, sesión expirada, recarga y logout simulados. Se revisaron capturas de
escritorio y móvil. El build conserva el aviso de chunks mayores de 500 kB;
Auth se carga separadamente al abrir la pantalla de cuenta.

Referencias: [Auth con contraseña](https://supabase.com/docs/guides/auth/passwords),
[eventos Auth](https://supabase.com/docs/reference/javascript/auth-onauthstatechange),
[PKCE](https://supabase.com/docs/guides/auth/sessions/pkce-flow).
