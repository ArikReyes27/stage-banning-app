// Optional real-browser integration check. Uses a new isolated profile, never user browser data.
// Run: node tests/browser-phase15-3.mjs (Chrome on Windows; no additional dependencies).
// Chrome needs permission to launch its GPU/render subprocesses outside restricted sandboxes.
import { spawn } from 'node:child_process'
import { mkdir, writeFile, readFile, readdir } from 'node:fs/promises'
import { resolve } from 'node:path'
import assert from 'node:assert/strict'

const artifactRoot = resolve('node_modules/.tmp/phase15-3-browser')
await mkdir(artifactRoot, { recursive: true })
const server = spawn(process.execPath, ['node_modules/vite/bin/vite.js', '--mode', 'auth-tests', '--host', '127.0.0.1', '--port', '4301', '--strictPort'], { windowsHide: true, stdio: 'pipe', env: { ...process.env, VITE_AUTH_TEST_URL: 'https://abcdefghijklmnopqrst.supabase.co', VITE_AUTH_TEST_PUBLISHABLE_KEY: 'sb_publishable_fixture' } })
const browser = spawn('C:/Program Files/Google/Chrome/Application/chrome.exe', ['--headless=new', '--no-first-run', '--no-default-browser-check', '--disable-background-networking', '--disable-sync', '--remote-debugging-port=4302', `--user-data-dir=${resolve(artifactRoot, `profile-${Date.now()}`)}`, 'about:blank'], { windowsHide: true, stdio: 'pipe' })
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
const click = label => js(`(() => { const button = [...document.querySelectorAll('button')].find(b => b.textContent.trim() === ${JSON.stringify(label)}); if (!button || button.disabled) throw Error('Button unavailable: ' + ${JSON.stringify(label)}); button.click(); })()`)
const waitText = text => until(() => js(`document.body.innerText.includes(${JSON.stringify(text)})`), `Missing UI: ${text}`)
const saved = () => js(`JSON.parse(localStorage.getItem('stage-strike.top8.v1'))`)
async function setInput(selector, value) {
  await js(`(() => { const element = document.querySelector(${JSON.stringify(selector)}); if (!element) throw Error('Missing input'); const setter = Object.getOwnPropertyDescriptor(element.tagName === 'SELECT' ? HTMLSelectElement.prototype : HTMLInputElement.prototype, 'value').set; setter.call(element, ${JSON.stringify(value)}); element.dispatchEvent(new Event('input', {bubbles:true})); element.dispatchEvent(new Event('change', {bubbles:true})); })()`)
  await delay(100)
}

const requests = [], unexpected = []
let profile = null
let profileDenied = true
let refreshExpired = false
const user = { id: '00000000-0000-0000-0000-000000001531', aud: 'authenticated', role: 'authenticated', email: 'fixture@example.invalid', user_metadata: { nickname: 'Fixture' }, app_metadata: { provider: 'email' }, created_at: new Date().toISOString() }
const token = () => ({ access_token: Buffer.from(JSON.stringify({alg:'HS256',typ:'JWT'})).toString('base64url')+'.'+Buffer.from(JSON.stringify({sub:user.id,exp:Math.floor(Date.now()/1000)+3600,aud:'authenticated',role:'authenticated'})).toString('base64url')+'.fixture', refresh_token:'fixture-refresh-only', token_type:'bearer', expires_in:3600, user })
async function intercept(event) {
  const {requestId,request}=event
  const url=new URL(request.url)
  const fulfill=(body,status=200,type='application/json')=>send('Fetch.fulfillRequest',{requestId,responseCode:status,responseHeaders:[{name:'Content-Type',value:type},{name:'Access-Control-Allow-Origin',value:'http://127.0.0.1:4301'},{name:'Access-Control-Allow-Headers',value:'*'},{name:'Access-Control-Allow-Methods',value:'GET,POST,PATCH,OPTIONS'}],body:Buffer.from(typeof body==='string'?body:JSON.stringify(body)).toString('base64')})
  if(url.hostname==='127.0.0.1') {
    if(url.pathname==='/src/lib/authTestProject.ts') return fulfill("export const AUTH_TEST_PROJECT_REF = 'abcdefghijklmnopqrst'",200,'application/javascript')
    return send('Fetch.continueRequest',{requestId})
  }
  if(url.origin!=='https://abcdefghijklmnopqrst.supabase.co') { unexpected.push(url.origin); return send('Fetch.failRequest',{requestId,errorReason:'BlockedByClient'}) }
  if(request.method==='OPTIONS') return fulfill('',204)
  requests.push(request.method+' '+url.pathname)
  const body=request.postData?JSON.parse(request.postData):{}
  if(url.pathname==='/auth/v1/signup') return fulfill(user)
  if(url.pathname==='/auth/v1/resend') return fulfill({})
  if(url.pathname==='/auth/v1/token') {
    if(url.searchParams.get('grant_type')==='refresh_token' && refreshExpired) return fulfill({error_code:'refresh_token_not_found',msg:'expired fixture'},400)
    return body.password==='wrong-password' ? fulfill({code:'invalid_credentials',error_code:'invalid_credentials',msg:'RAW_ERROR_SHOULD_NOT_RENDER'},400) : fulfill(token())
  }
  if(url.pathname==='/auth/v1/logout') return fulfill('',204)
  if(url.pathname==='/rest/v1/profiles') {
    if(profileDenied) return fulfill({code:'42501',message:'fixture permissions denied'},403)
    if(request.method==='GET') return fulfill(profile?[profile]:[])
    if(request.method==='PATCH') { if(profile) profile={...profile,...body}; return fulfill(profile?[{id:user.id}]:[]) }
    if(request.method==='POST') { assert.equal(body.id,user.id); profile={...body}; return fulfill('',201) }
  }
  unexpected.push(request.method+' '+url.pathname)
  return fulfill({code:'unexpected_mock_request'},500)
}
try {
  await until(async()=>(await fetch('http://127.0.0.1:4301')).ok,'Vite startup')
  const tabs=await until(async()=>{const p=await(await fetch('http://127.0.0.1:4302/json/list')).json();return p.find(t=>t.type==='page')},'Chrome startup')
  socket=new WebSocket(tabs.webSocketDebuggerUrl)
  await new Promise((resolve,reject)=>{socket.addEventListener('open',resolve,{once:true});socket.addEventListener('error',reject,{once:true})})
  socket.addEventListener('message',e=>{
    const d=JSON.parse(e.data)
    if(d.id){const job=pending.get(d.id);pending.delete(d.id);if(d.error)job?.reject(new Error(d.error.message));else job?.resolve(d.result)}
    if(d.method==='Runtime.exceptionThrown')exceptions.push(d.params.exceptionDetails)
    if(d.method==='Fetch.requestPaused')void intercept(d.params).catch(()=>unexpected.push('interception failure'))
  })
  await send('Page.enable');await send('Runtime.enable')
  await send('Fetch.enable',{patterns:[{urlPattern:'*',requestStage:'Request'}]})
  await send('Emulation.setDeviceMetricsOverride',{width:1280,height:900,deviceScaleFactor:1,mobile:false})
  await loadPage('Page.navigate',{url:'http://127.0.0.1:4301/account'})
  await waitText('Iniciar sesión')
  const desktop=await send('Page.captureScreenshot',{format:'png'});await writeFile(resolve(artifactRoot,'account-desktop.png'),Buffer.from(desktop.data,'base64'))
  const baseline=await js('JSON.stringify({...localStorage})')
  const checkEye = async () => {
    const before=await js("document.querySelector('[name=password]').value")
    assert.equal(await js("document.querySelector('[name=password]').type"),'password')
    await js("document.querySelector('[aria-label=\"Mostrar contraseña\"]').focus()")
    await send('Input.dispatchKeyEvent',{type:'keyDown',key:'Enter',code:'Enter',text:'\r',windowsVirtualKeyCode:13})
    await send('Input.dispatchKeyEvent',{type:'keyUp',key:'Enter',code:'Enter',windowsVirtualKeyCode:13})
    await until(()=>js("document.querySelector('[name=password]').type==='text'"),'keyboard eye reveals')
    assert.equal(await js("document.querySelector('[name=password]').value"),before)
    await js("document.querySelector('[aria-label=\"Ocultar contraseña\"]').click()")
    await until(()=>js("document.querySelector('[name=password]').type==='password'"),'eye conceals')
    assert.equal(await js("document.querySelector('[name=password]').value"),before)
  }
  await click('Crear cuenta');await setInput('[name=nickname]','Fixture');await setInput('[name=email]','fixture@example.invalid');await setInput('[name=password]','fixture-password-123')
  await checkEye()
  await click('Registrarme');await waitText('recibirás un correo de confirmación')
  assert.ok(requests.includes('POST /auth/v1/signup'))
  await click('Iniciar sesión');await setInput('[name=password]','wrong-password');await checkEye();await click('Entrar');await waitText('Correo o contraseña incorrectos')
  assert.equal(await js("document.body.innerText.includes('RAW_ERROR_SHOULD_NOT_RENDER')"),false)
  await setInput('[name=password]','fixture-password-123');await click('Entrar');await waitText('Sesión iniciada');await waitText('No se pudo cargar tu perfil')
  profileDenied=false;await click('Reintentar lectura');await waitText('Guarda tu nickname')
  assert.equal(await js("(async()=>{const {getAuthTestClient}=await import('/src/lib/authClient.ts');return !(await getAuthTestClient().auth.refreshSession()).error})()"),true)
  await setInput('[name=profile-nickname]','Mi alias');await click('Guardar nickname');await waitText('Nickname guardado')
  assert.equal(profile.display_name,'Mi alias')
  assert.equal(await js('JSON.stringify({...localStorage})'),baseline)
  await loadPage('Page.reload');await waitText('Sesión iniciada');await waitText('Perfil personal')
  assert.equal(await js("document.querySelector('[name=profile-nickname]').value"),'Mi alias')
  await send('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:true})
  assert.ok(await js('document.documentElement.scrollWidth<=innerWidth'))
  const shot=await send('Page.captureScreenshot',{format:'png'});await writeFile(resolve(artifactRoot,'account-mobile.png'),Buffer.from(shot.data,'base64'))
  await click('Cerrar sesión');await waitText('Sesión cerrada en este navegador')
  await setInput('[name=password]','mobile-fixture');await checkEye()
  assert.ok(await js("document.querySelector('[aria-controls=\"account-password\"]').getBoundingClientRect().width>=44"))
  assert.equal(await js("Object.keys(sessionStorage).some(k=>k.startsWith('stage-strike.auth-tests.')&&!k.endsWith('code-verifier'))"),false)
  assert.equal(await js('JSON.stringify({...localStorage})'),baseline)
  await setInput('[name=email]','fixture@example.invalid');await setInput('[name=password]','fixture-password-123');await click('Entrar');await waitText('Sesión iniciada')
  refreshExpired=true
  await js("(()=>{const key='stage-strike.auth-tests.abcdefghijklmnopqrst';const stored=JSON.parse(sessionStorage.getItem(key));stored.expires_at=Math.floor(Date.now()/1000)-60;sessionStorage.setItem(key,JSON.stringify(stored))})()")
  assert.equal(await js("(async()=>{const {getAuthTestClient}=await import('/src/lib/authClient.ts');return !!(await getAuthTestClient().auth.refreshSession()).error})()"),true)
  await waitText('Iniciar sesión')
  assert.equal(await js('JSON.stringify({...localStorage})'),baseline)
  // Local routes are not guarded by Auth; inspect without changing tournament state.
  for(const path of ['/registration','/tournament','/tournament/standings','/tournament/match/W1','/']) {
    await loadPage('Page.navigate',{url:'http://127.0.0.1:4301'+path})
    await until(()=>js('!!document.querySelector("main") || document.body.innerText.includes("STAGE//STRIKE")'),'local route rendered')
    assert.equal(await js("document.body.innerText.includes('Sesión iniciada')"),false)
  }
  assert.equal(exceptions.length,0,'No uncaught UI errors')
  assert.deepEqual(unexpected,[],'All non-local requests were mocked and restricted')
  assert.ok(requests.every(r=>r.includes('/auth/v1/')||r.includes('/rest/v1/profiles')))
  console.log('PASS: mocked signup/confirmation, login errors, session reload, profile create, logout, mobile layout and local routes. No remote requests executed.')
  console.log('Screenshot: '+resolve(artifactRoot,'account-mobile.png'))
} finally {
  if(socket?.readyState===WebSocket.OPEN){try{await send('Browser.close')}catch{}socket.close()}
  server.kill();browser.kill()
}
