import test from 'node:test'
import assert from 'node:assert/strict'
import {
  managedTournaments, validAccountId, checkedRevision, tournamentError,
  createRemoteTournament, inviteAdministrator, revokeAdministrator, acceptAdminInvitation,
  loadTournamentAccess, loadTournamentDashboard,
} from '../src/lib/remoteTournaments.ts'

const self='154b0000-0000-0000-0000-000000000001', other='154b0000-0000-0000-0000-000000000002'
const row=(id,owner_id)=>({id,owner_id,name:id,created_at:'2026-10-31T00:00:00Z'})
test('dashboard excludes players/foreign accounts, includes own and shared admin, prioritizes owner',()=>{
  const rows=[row('own',self),row('shared',other),row('player',other),row('foreign',other)]
  const members=[{tournament_id:'own',profile_id:self,role:'player'}, {tournament_id:'shared',profile_id:self,role:'admin'}, {tournament_id:'player',profile_id:self,role:'player'}, {tournament_id:'foreign',profile_id:other,role:'admin'}]
  assert.deepEqual(managedTournaments(rows,members,self).map(t=>[t.id,t.role]),[['own','owner'],['shared','admin']])
})
test('UUID and revision validation reject nicknames, emails and unsafe bigint conversions',()=>{
  assert.ok(validAccountId(self)); assert.ok(!validAccountId('Owner')); assert.ok(!validAccountId('person@example.test'))
  assert.equal(checkedRevision('12'),12)
  for(const invalid of [null,undefined,'',-1,1.5,'9007199254740993',NaN]) assert.throws(()=>checkedRevision(invalid))
})
function rpcClient(responses) {
  const calls=[]
  return {calls, async rpc(name,args){calls.push({name,args});return responses.shift()??{data:1,error:null}}}
}
test('creation sends only name; invites/revocations use UUID and captured revision, no owner claims',async()=>{
  const c=rpcClient([])
  await createRemoteTournament(c,'  Test  ')
  await inviteAdministrator(c,'t',4,other)
  await revokeAdministrator(c,'t',5,other)
  assert.deepEqual(c.calls,[
    {name:'ss_create_tournament',args:{p_name:'Test'}},
    {name:'ss_invite_admin',args:{p_tournament:'t',p_expected:4,p_invitee:other}},
    {name:'ss_revoke_admin',args:{p_tournament:'t',p_expected:5,p_profile:other}},
  ])
  await assert.rejects(inviteAdministrator(c,'t',5,'nickname'))
  await assert.rejects(createRemoteTournament(c,' '))
  assert.equal(c.calls.length,3)
})
test('acceptance obtains recipient-scoped revision and surfaces a race without retries',async()=>{
  const c=rpcClient([{data:8,error:null},{data:null,error:{code:'40001',message:'RAW_SECRET'}}])
  await assert.rejects(acceptAdminInvitation(c,'invite'),e=>e.code==='40001')
  assert.deepEqual(c.calls,[{name:'ss_invitation_revision',args:{p_invitation:'invite'}},{name:'ss_accept_admin_invitation',args:{p_invitation:'invite',p_expected:8}}])
  assert.match(tournamentError({code:'40001'}),/Actualiza/)
  assert.ok(!tournamentError({message:'RAW_SECRET'}).includes('RAW_SECRET'))
})
function readClient(tables) {
  const requests=[]
  return {requests,from(table){
    const request={table,filters:[]};requests.push(request)
    const query={
      select(columns){request.columns=columns;return query},
      order(){return query},eq(key,value){request.filters.push([key,value]);return query},
      async range(start,end){const rows=(tables[table]??[]).filter(row=>request.filters.every(([k,v])=>row[k]===v));return {data:rows.slice(start,Math.min(end+1,start+1)),count:rows.length,error:null}},
      async single(){return {data:tables[table][0],error:null}},
    };return query
  }}
}
test('read-only dashboard pagination scopes membership/invitations to current UUID',async()=>{
  const c=readClient({tournaments:[row('a',self),row('b',self),row('foreign',other)],tournament_members:[],tournament_admin_invitations:[{id:'own',invitee_id:self,status:'pending'},{id:'foreign',invitee_id:other,status:'pending'}]})
  const result=await loadTournamentDashboard(c,self)
  assert.equal(result.tournaments.length,2)
  assert.deepEqual(result.invitations.map(i=>i.id),['own'])
  assert.ok(!c.requests.some(r=>r.table==='profiles'))
})
test('admin details read revision only and never enumerate private invitations for a coadmin',async()=>{
  const c=readClient({tournament_brackets:[{revision:10}],tournament_members:[]})
  const result=await loadTournamentAccess(c,{...row('t',other),role:'admin'})
  assert.equal(result.revision,10)
  assert.equal(c.requests.find(r=>r.table==='tournament_brackets').columns,'revision')
  assert.ok(!c.requests.some(r=>r.table==='tournament_admin_invitations'))
})
