# Carrera real en dos sesiones — solo stage-strike-tests

Pendiente de ejecución manual después de migración 15.4A y test 05. No equivale
a la prueba secuencial de revisión obsoleta. Usar dos consultas independientes
del SQL Editor. El setup confirma tres usuarios ficticios y un torneo; el cleanup
solo elimina esos fixtures. No usa credenciales ni usuarios existentes.

## Preparar una vez, como postgres

Confirmar proyecto/referencia y sustituir `CONFIRM_TEST_PROJECT`.

```sql
begin;
do $$ declare t uuid; i uuid; begin
  if 'CONFIRM_TEST_PROJECT'<>'stage-strike-tests' or current_user<>'postgres' then raise exception 'Confirm test project'; end if;
  if exists(select from auth.users where id::text like '154b0000-0000-0000-0000-%') then raise exception 'Fixture collision'; end if;
  if exists(select from pg_trigger where tgrelid in ('auth.users'::regclass,'public.profiles'::regclass) and not tgisinternal and tgenabled<>'D') then raise exception 'Review triggers'; end if;
  insert into auth.users(id,email_confirmed_at) select ('154b0000-0000-0000-0000-'||lpad(n::text,12,'0'))::uuid,now() from generate_series(1,3) n;
  insert into public.profiles(id,display_name) select ('154b0000-0000-0000-0000-'||lpad(n::text,12,'0'))::uuid,'Concurrency fixture '||n from generate_series(1,3) n;
  perform set_config('request.jwt.claim.sub','154b0000-0000-0000-0000-000000000001',true);
  t:=public.ss_create_tournament('15.4A concurrency fixture');
  i:=public.ss_invite_admin(t,1,'154b0000-0000-0000-0000-000000000002');
  perform set_config('request.jwt.claim.sub','154b0000-0000-0000-0000-000000000002',true);
  perform public.ss_accept_admin_invitation(i,2);
  perform set_config('request.jwt.claim.sub','154b0000-0000-0000-0000-000000000001',true);
  i:=public.ss_invite_admin(t,3,'154b0000-0000-0000-0000-000000000003');
  perform set_config('request.jwt.claim.sub','154b0000-0000-0000-0000-000000000003',true);
  perform public.ss_accept_admin_invitation(i,4);
end $$;
commit;
```

## Sesión A: ejecutar completa

```sql
begin;
set local role authenticated;
set local request.jwt.claim.sub='154b0000-0000-0000-0000-000000000002';
select current_user,auth.uid(); -- authenticated / fixture 2
select public.ss_rename_tournament(
 (select id from public.tournaments where owner_id='154b0000-0000-0000-0000-000000000001'),5,'Concurrency A');
select pg_sleep(10); -- iniciar B durante esta espera
commit;
```

## Sesión B: ejecutar durante la espera de A

```sql
begin;
set local statement_timeout='30s';
set local role authenticated;
set local request.jwt.claim.sub='154b0000-0000-0000-0000-000000000003';
select current_user,auth.uid(); -- authenticated / fixture 3
select public.ss_rename_tournament(
 (select id from public.tournaments where owner_id='154b0000-0000-0000-0000-000000000001'),5,'Concurrency B');
commit;
```

Esperado: A devuelve 6; B espera el bloqueo y falla con **40001**, sin guardar B
ni auditoría extra. Ejecutar `ROLLBACK;` en B tras el error. Verificar como postgres:

```sql
select t.name,b.revision,(select count(*) from public.tournament_revisions r where r.tournament_id=t.id) as audit_rows
from public.tournaments t join public.tournament_brackets b on b.tournament_id=t.id
where t.owner_id='154b0000-0000-0000-0000-000000000001';
-- Concurrency A / 6 / 6
```

También probar revocación contra edición con setup nuevo: A como owner llama
`ss_revoke_admin(t,5,fixture3)` y espera antes de COMMIT; B como fixture3 intenta
renombrar con revisión 5. Tras desbloquearse debe recibir **42501**, no escribir.
Si la edición adquiere primero el bloqueo, puede confirmar antes de la revocación;
el owner recibirá conflicto y deberá recargar antes de revocar. Esta es la
semántica de serialización esperada, no cancelación retroactiva de operaciones.

## Limpieza dirigida, como postgres (solo tras cerrar A/B)

```sql
begin;
do $$ begin
  if 'CONFIRM_TEST_PROJECT'<>'stage-strike-tests' or current_user<>'postgres' then raise exception 'Confirm test project'; end if;
  if (select count(*) from public.tournaments where owner_id='154b0000-0000-0000-0000-000000000001')<>1 then raise exception 'Unexpected fixtures; review manually'; end if;
end $$;
delete from public.tournaments where owner_id='154b0000-0000-0000-0000-000000000001';
delete from auth.users where id in ('154b0000-0000-0000-0000-000000000001','154b0000-0000-0000-0000-000000000002','154b0000-0000-0000-0000-000000000003');
commit;
```

No ejecutar otros borrados ni desactivar constraints si la limpieza falla.
