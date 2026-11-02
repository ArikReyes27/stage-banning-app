import { lifecycleFlow } from './browser-lifecycle-flow.mjs'
import { workspaceFlow } from './browser-workspace-flow.mjs'
// Optional real-browser integration check. Uses a new isolated profile, never user browser data.
// Run: node tests/browser-phase15-5c.mjs (Chrome on Windows; no additional dependencies).
// Chrome needs permission to launch its GPU/render subprocesses outside restricted sandboxes.
import { spawn } from 'node:child_process'
import { mkdir, writeFile, readFile, readdir } from 'node:fs/promises'
import { resolve } from 'node:path'
import assert from 'node:assert/strict'

const artifactRoot = resolve('node_modules/.tmp/phase15-5c-browser')
await mkdir(artifactRoot, { recursive: true })
const server = spawn(process.execPath, ['node_modules/vite/bin/vite.js', '--mode', 'auth-tests', '--host', '127.0.0.1', '--port', '4401', '--strictPort'], { windowsHide: true, stdio: 'pipe', env: { ...process.env, VITE_AUTH_TEST_URL: 'https://abcdefghijklmnopqrst.supabase.co', VITE_AUTH_TEST_PUBLISHABLE_KEY: 'sb_publishable_fixture' } })
const browser = spawn('C:/Program Files/Google/Chrome/Application/chrome.exe', ['--headless=new', '--no-first-run', '--no-default-browser-check', '--disable-background-networking', '--disable-sync', '--remote-debugging-port=4402', `--user-data-dir=${resolve(artifactRoot, `profile-${Date.now()}`)}`, 'about:blank'], { windowsHide: true, stdio: 'pipe' })
let serverLog = '', browserLog = '', socket
server.stderr.on('data', d => { serverLog += d }); browser.stderr.on('data', d => { browserLog += d })
const delay = ms => new Promise(r => setTimeout(r, ms))
async function until(fn, message) { for (let i = 0; i < 150; i++) { try { const value = await fn(); if (value) return value } catch { /* Wait for startup/render. */ } await delay(100) } throw new Error(message) }
let seq = 0, confirmDialog = true
const pending = new Map(), exceptions = []
function send(method, params = {}) {
  return new Promise((resolve, reject) => {
    const id = ++seq
    const timeout = setTimeout(() => { pending.delete(id); reject(new Error(`CDP timeout: ${method}`)) }, 15000)
    pending.set(id, { resolve: value => { clearTimeout(timeout); resolve(value) }, reject })
    socket.send(JSON.stringify({ id, method, params }))
  })
}
async function js(expression) {
  const result = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true })
  if (result.exceptionDetails) throw new Error(result.exceptionDetails.exception?.description ?? result.exceptionDetails.text)
  return result.result.value
}
async function loadPage(method, params = {}) {
  // Existing text can belong to the old document while CDP reload is still pending.
  let listener, timeout
  const loaded = new Promise((resolve, reject) => {
    listener = event => { if (JSON.parse(event.data).method === 'Page.loadEventFired') resolve() }
    socket.addEventListener('message', listener)
    timeout = setTimeout(() => reject(new Error(`Page load timeout: ${method}`)), 15000)
  })
  try { await Promise.all([send(method, params), loaded]) }
  finally { clearTimeout(timeout); socket.removeEventListener('message', listener) }
}
const click = async label => { await until(()=>js(`!![...document.querySelectorAll("button")].find(b=>b.textContent.trim()===${JSON.stringify(label)}&&!b.disabled)`), "Button unavailable: "+label); return js(`(() => { const button = [...document.querySelectorAll('button')].find(b => b.textContent.trim() === ${JSON.stringify(label)}); if (!button || button.disabled) throw Error('Button unavailable: ' + ${JSON.stringify(label)}); button.click(); })()`); }
const waitText = text => until(() => js(`document.body.innerText.includes(${JSON.stringify(text)})`), `Missing UI: ${text}`)
const saved = () => js(`JSON.parse(localStorage.getItem('stage-strike.top8.v1'))`)
async function setInput(selector, value) {
  await js(`(() => { const element = document.querySelector(${JSON.stringify(selector)}); if (!element) throw Error('Missing input'); const setter = Object.getOwnPropertyDescriptor(element.tagName === 'SELECT' ? HTMLSelectElement.prototype : element.tagName === 'TEXTAREA' ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype, 'value').set; setter.call(element, ${JSON.stringify(value)}); element.dispatchEvent(new Event('input', {bubbles:true})); element.dispatchEvent(new Event('change', {bubbles:true})); })()`)
  await delay(100)
}

// Every non-local network request is intercepted. No real credentials/accounts.
const A='154b0000-0000-0000-0000-000000000001', B='154b0000-0000-0000-0000-000000000002', X='154b0000-0000-0000-0000-000000000003'
const playerT='154b0000-1111-0000-0000-000000000001', foreignT='154b0000-1111-0000-0000-000000000002', ownT='154b0000-1111-0000-0000-000000000003'
let identity=null, rejectConflict=false
const rows=[{id:playerT,owner_id:X,name:'PLAYER_ONLY_HIDDEN',created_at:'2026-10-31'}, {id:foreignT,owner_id:X,name:'FOREIGN_HIDDEN',created_at:'2026-10-31'}]
const members=[{tournament_id:playerT,profile_id:A,role:'player'}], invites=[], revisions=new Map()
const calls=[], unexpected=[]
const user=id=>({id,aud:'authenticated',role:'authenticated',email:id===A?'a@example.invalid':'b@example.invalid',user_metadata:{nickname:'Fixture'},app_metadata:{provider:'email'},created_at:new Date().toISOString()})
const token=id=>({access_token:Buffer.from('{"alg":"HS256"}').toString('base64url')+'.'+Buffer.from(JSON.stringify({sub:id,exp:Math.floor(Date.now()/1000)+3600})).toString('base64url')+'.fixture',refresh_token:'fixture-refresh',token_type:'bearer',expires_in:3600,user:user(id)})
const visible=t=>t.owner_id===identity||members.some(m=>m.tournament_id===t.id&&m.profile_id===identity)
async function intercept({requestId,request}) {
  const url=new URL(request.url)
  const fulfill=(body,status=200,type='application/json',count=null)=>send('Fetch.fulfillRequest',{requestId,responseCode:status,responseHeaders:[{name:'Content-Type',value:type},{name:'Access-Control-Allow-Origin',value:'http://127.0.0.1:4401'},{name:'Access-Control-Allow-Headers',value:'*'},{name:'Access-Control-Allow-Methods',value:'GET,POST,OPTIONS'},{name:'Access-Control-Expose-Headers',value:'Content-Range'},...(count===null?[]:[{name:'Content-Range',value:`0-${Math.max(0,count-1)}/${count}`}])],body:Buffer.from(typeof body==='string'?body:JSON.stringify(body)).toString('base64')})
  if(url.hostname==='127.0.0.1') {
    if(url.pathname==='/src/lib/authTestProject.ts')return fulfill("export const AUTH_TEST_PROJECT_REF='abcdefghijklmnopqrst'",200,'application/javascript')
    return send('Fetch.continueRequest',{requestId})
  }
  if(url.origin!=='https://abcdefghijklmnopqrst.supabase.co'){unexpected.push('foreign origin');return send('Fetch.failRequest',{requestId,errorReason:'BlockedByClient'})}
  if(request.method==='OPTIONS')return fulfill('',204)
  const body=request.postData?JSON.parse(request.postData):{}
  if(url.pathname==='/auth/v1/token'){identity=body.email==='b@example.invalid'?B:A;return fulfill(token(identity))}
  if(url.pathname==='/auth/v1/logout'){identity=null;return fulfill('',204)}
  const fail=code=>fulfill({code,message:'RAW_ERROR_PRIVATE'},code==='42501'?403:400)
  if(url.pathname.startsWith('/rest/v1/rpc/')) {
    const name=url.pathname.split('/').at(-1);calls.push({name,args:body})
    if(!identity)return fail('42501')
    if(name==='ss_create_tournament'){
      assert.deepEqual(Object.keys(body),['p_name']);const created='154b0000-1111-0000-0000-'+String(rows.length+1).padStart(12,'0');rows.push({id:created,owner_id:identity,name:body.p_name,created_at:'2026-10-31',archived_at:null});revisions.set(created,1);return fulfill(JSON.stringify(created))
    }
    if(name==='ss_invitation_revision'){
      const inv=invites.find(i=>i.id===body.p_invitation&&i.invitee_id===identity&&i.status==='pending');return inv?fulfill(revisions.get(inv.tournament_id)):fail('42501')
    }
    if(name==='ss_accept_admin_invitation'){
      const inv=invites.find(i=>i.id===body.p_invitation&&i.invitee_id===identity&&i.status==='pending')
      if(!inv)return fail('42501')
      if(body.p_expected!==revisions.get(inv.tournament_id))return fail('40001')
      members.push({tournament_id:inv.tournament_id,profile_id:identity,role:'admin'});inv.status='accepted';revisions.set(inv.tournament_id,body.p_expected+1);return fulfill(body.p_expected+1)
    }
    const t=rows.find(t=>t.id===body.p_tournament)
    if(!t||t.owner_id!==identity)return fail('42501')
    if(name==='ss_tournament_lifecycle_review')return fulfill({version:15503,archived_at:t.archived_at,snapshot:{id:t.id,name:t.name,revision:String(revisions.get(t.id)),import_id:null,roster:[],state:{schemaVersion:2,status:'draft',seeds:[],results:{},structure:[],completionOrder:[]}}})
    if(rejectConflict){rejectConflict=false;return fail('40001')}
    if(body.p_expected!==revisions.get(t.id))return fail('40001')
    if(name==='ss_rename_tournament'){t.name=body.p_name;revisions.set(t.id,body.p_expected+1);return fulfill(body.p_expected+1)}
    if(name==='ss_set_tournament_archived'){t.archived_at=body.p_archived?new Date().toISOString():null;revisions.set(t.id,body.p_expected+1);return fulfill(body.p_expected+1)}
    if(name==='ss_delete_tournament'){if(body.p_confirmation!==t.name)return fail('22023');rows.splice(rows.indexOf(t),1);return fulfill({deleted_id:t.id,revision:String(body.p_expected+1)})}
    if(name==='ss_invite_admin'){
      assert.equal(body.p_invitee,B)
      const id='154b0000-2222-0000-0000-000000000001'
      invites.push({id,tournament_id:t.id,invitee_id:B,invited_by:identity,status:'pending',expires_at:new Date(Date.now()+86400000).toISOString()});revisions.set(t.id,body.p_expected+1);return fulfill(JSON.stringify(id))
    }
    if(name==='ss_revoke_admin'){
      for(let i=members.length-1;i>=0;i--)if(members[i].tournament_id===t.id&&members[i].profile_id===body.p_profile)members.splice(i,1)
      for(const inv of invites)if(inv.tournament_id===t.id&&inv.invitee_id===body.p_profile&&inv.status==='pending')inv.status='revoked'
      revisions.set(t.id,body.p_expected+1);return fulfill(body.p_expected+1)
    }
    unexpected.push('unexpected RPC');return fail('42501')
  }
  if(url.pathname.startsWith('/rest/v1/')) {
    assert.equal(request.method,'GET','No direct table writes')
    const table=url.pathname.split('/').at(-1)
    let data=[]
    if(table==='tournaments')data=rows.filter(visible)
    else if(table==='tournament_members')data=members.filter(m=>rows.some(t=>t.id===m.tournament_id&&visible(t)))
    else if(table==='tournament_admin_invitations')data=invites.filter(i=>i.invitee_id===identity||rows.some(t=>t.id===i.tournament_id&&t.owner_id===identity))
    else if(table==='tournament_brackets'){assert.equal(url.searchParams.get('select'),'revision');data=rows.filter(visible).map(t=>({tournament_id:t.id,revision:revisions.get(t.id)??1}))}
    else if(table==='profiles')data=[{id:identity,display_name:'Fixture'}]
    else {unexpected.push('unexpected table');return fail('42501')}
    for(const [key,value]of url.searchParams)if(value.startsWith('eq.'))data=data.filter(r=>r[key]===value.slice(3))
    const count=data.length,offset=Number(url.searchParams.get('offset')??0),limit=Number(url.searchParams.get('limit')??200)
    data=data.slice(offset,offset+limit)
    const single=Object.entries(request.headers).some(([k,v])=>k.toLowerCase()==='accept'&&v.includes('vnd.pgrst.object'))
    return fulfill(single?data[0]??null:data,200,'application/json',count)
  }
  unexpected.push('unexpected request');return fail('42501')
}
try {
  await until(async()=>(await fetch('http://127.0.0.1:4401')).ok,'Vite startup')
  const tab=await until(async()=>(await(await fetch('http://127.0.0.1:4402/json/list')).json()).find(t=>t.type==='page'),'Chrome startup')
  socket=new WebSocket(tab.webSocketDebuggerUrl)
  await new Promise((resolve,reject)=>{socket.addEventListener('open',resolve,{once:true});socket.addEventListener('error',reject,{once:true})})
  socket.addEventListener('message',e=>{
    const d=JSON.parse(e.data)
    if(d.id){const job=pending.get(d.id);pending.delete(d.id);if(d.error)job?.reject(new Error(d.error.message));else job?.resolve(d.result)}
    if(d.method==='Runtime.exceptionThrown')exceptions.push(d.params.exceptionDetails)
    if(d.method==='Fetch.requestPaused')void intercept(d.params).catch(()=>unexpected.push('interception failure'))
    if(d.method==='Page.javascriptDialogOpening')void send('Page.handleJavaScriptDialog',{accept:confirmDialog})
  })
  await send('Page.enable');await send('Runtime.enable');await send('Fetch.enable',{patterns:[{urlPattern:'*',requestStage:'Request'}]})
  await send('Emulation.setDeviceMetricsOverride',{width:1280,height:1000,deviceScaleFactor:1,mobile:false})
  const open=path=>loadPage('Page.navigate',{url:'http://127.0.0.1:4401'+path})
  await open('/my-tournaments');await waitText('Inicia sesión para administrar')
  assert.equal(calls.length,0)
  const baseline=await js('JSON.stringify({...localStorage})')
  async function login(email) {
    await open('/account');await waitText('Iniciar sesión');await setInput('[name=email]',email);await setInput('[name=password]','fixture-password-123');await click('Entrar');await waitText('Sesión iniciada');await click('Mis torneos');await until(()=>js("!document.body.innerText.includes('Cargando torneos e invitaciones') && !!document.querySelector('[name=remote-tournament-name]')"),'dashboard loaded')
  }
  async function logout(){await click('Cuenta');await waitText('Sesión iniciada');await click('Cerrar sesión');await waitText('Sesión cerrada')}
  await workspaceFlow({js,click,waitText,setInput,open,login,logout,loadPage,until,send,writeFile,resolve,artifactRoot,A,B,calls,rows,members})
  await lifecycleFlow({js,click,waitText,setInput,open,login,logout,until,send,writeFile,readFile,resolve,artifactRoot,A,calls,rows,revisions})
  assert.deepEqual(unexpected,[]);assert.equal(exceptions.length,0)
} catch(error) { console.error(await js('document.body.innerText').catch(()=>'')); throw error; } finally {
  if(socket?.readyState===WebSocket.OPEN){try{await send('Browser.close')}catch{}socket.close()}
  server.kill();browser.kill()
}

