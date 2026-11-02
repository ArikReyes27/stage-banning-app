// Optional real-browser integration check. Uses a new isolated profile, never user browser data.
// Run: node tests/browser-phase13.mjs (Chrome on Windows; no additional dependencies).
// Chrome needs permission to launch its GPU/render subprocesses outside restricted sandboxes.
import { spawn } from 'node:child_process'
import { mkdir, writeFile, readFile, readdir } from 'node:fs/promises'
import { resolve } from 'node:path'
import assert from 'node:assert/strict'

const artifactRoot = resolve('node_modules/.tmp/phase13-browser')
await mkdir(artifactRoot, { recursive: true })
const server = spawn(process.execPath, ['node_modules/vite/bin/vite.js', '--host', '127.0.0.1', '--port', '4195', '--strictPort'], { windowsHide: true, stdio: 'pipe' })
const browser = spawn('C:/Program Files/Google/Chrome/Application/chrome.exe', ['--headless=new', '--no-first-run', '--no-default-browser-check', '--disable-background-networking', '--disable-sync', '--remote-debugging-port=4196', `--user-data-dir=${resolve(artifactRoot, `profile-${Date.now()}`)}`, 'about:blank'], { windowsHide: true, stdio: 'pipe' })
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
try {
  await until(async () => (await fetch('http://127.0.0.1:4195')).ok, 'Vite did not start')
  const tabs = await until(async () => {
    const pages = (await (await fetch('http://127.0.0.1:4196/json/list')).json()).filter(t => t.type === 'page')
    return pages.length ? pages : undefined
  }, 'Chrome did not start; inspect browser stderr for GPU/process permission failures')
  socket = new WebSocket(tabs[0].webSocketDebuggerUrl)
  await new Promise((resolve, reject) => { socket.addEventListener('open', resolve, { once: true }); socket.addEventListener('error', reject, { once: true }) })
  socket.addEventListener('message', e => {
    const data = JSON.parse(e.data)
    if (data.id) { const job = pending.get(data.id); pending.delete(data.id); if (data.error) job?.reject(new Error(data.error.message)); else job?.resolve(data.result) }
    if (data.method === 'Page.javascriptDialogOpening') void send('Page.handleJavaScriptDialog', { accept: confirmDialog })
    if (data.method === 'Runtime.exceptionThrown') exceptions.push(data.params.exceptionDetails)
  })
  await send('Page.enable'); await send('Runtime.enable')
  await send('Emulation.setDeviceMetricsOverride', { width: 1440, height: 1000, deviceScaleFactor: 1, mobile: false })
  const downloads = resolve(artifactRoot, `downloads-${Date.now()}`)
  await mkdir(downloads, { recursive: true })
  await send('Browser.setDownloadBehavior', { behavior: 'allow', downloadPath: downloads })
  const open = async (path = '/tournament/standings') => { await loadPage('Page.navigate', { url: `http://127.0.0.1:4195${path}` }); await waitText('Top 8 del torneo') }
  const screenshot = async name => { const shot = await send('Page.captureScreenshot', { format:'png' }); await writeFile(resolve(artifactRoot,name+'.png'),Buffer.from(shot.data,'base64')) }
  await open()
  await waitText('Top 8 por definir')
  assert.equal(await saved(), null)
  await js(`(async () => {
    const {createScalableTournament,drawTournament}=await import('/src/utils/tournamentSetup.ts');
    const {resolveBracket,getChampion}=await import('/src/utils/doubleElimination.ts');
    const {proposeMatchAction}=await import('/src/utils/matchSession.ts');
    const {saveTournament}=await import('/src/utils/tournamentStorage.ts');
    let t={...drawTournament(createScalableTournament(Array.from({length:20},(_,i)=>({id:'r'+i,nickname:['Arik','NOVA','Kuro','Luna','Zero','Echo','Raven','NovaFox'][i%8]+' '+(i+1)}))),()=>.5),status:'started'}, step=0;
    const chars=['mario','sora','link','samus','fox','kirby','kazuya','peach'];
    while(!getChampion(t)) {
      const m=resolveBracket(t).find(m=>m.enabled&&!m.settled&&m.players.every(Boolean));
      const winner=m.id==='GF'?1:0;
      for(let game=0;game<2;game++) {
        t=proposeMatchAction(t,m.id,{type:'setup',setup:{characterIds:[chars[(step+game)%8],chars[(step+game+1)%8]]}}).tournament;
        t=proposeMatchAction(t,m.id,{type:'win',winner}).tournament;
      }
      t=proposeMatchAction(t,m.id,{type:'confirm'}).tournament; step++;
      if(step>40) throw Error('Simulation stalled');
    }
    saveTournament(localStorage,t);
  })()`)
  await open(); await waitText('Resultados finales')
  await delay(500)
  const original = await saved()
  assert.deepEqual(await js(`(async()=>{const {tournamentStandings}=await import('/src/utils/tournamentStandings.ts');return tournamentStandings(JSON.parse(localStorage.getItem('stage-strike.top8.v1'))).top.map(r=>r.position)})()`),[1,2,3,4,5,5,7,7])
  await screenshot('top8-desktop')
  await click('Exportar Top 8 a PNG'); await waitText('Top 8 exportado a PNG.')
  const pngName=await until(async()=> (await readdir(downloads)).find(name=>name.endsWith('.png')), 'PNG download missing')
  const png=await readFile(resolve(downloads,pngName))
  assert.deepEqual([...png.subarray(0,8)],[137,80,78,71,13,10,26,10])
  assert.equal(png.readUInt32BE(16),1600);assert.equal(png.readUInt32BE(20),1140)
  await writeFile(resolve(artifactRoot,'top8-export.png'),png)
  await click('Ver clasificación completa'); await waitText('Clasificación completa')
  assert.equal(await js(`document.querySelectorAll('tbody tr').length`),20)
  assert.equal(await js(`!!document.querySelector('.top-eight-poster')`),false)
  assert.ok(await js(`[...document.querySelectorAll('tbody tr')].every(r=>r.querySelectorAll('img').length<=3)`))
  await click('Exportar clasificación completa CSV')
  const csvName=await until(async()=> (await readdir(downloads)).find(name=>name.endsWith('.csv')), 'CSV missing')
  const csv=await readFile(resolve(downloads,csvName),'utf8')
  assert.equal(csv.split('\r\n').length,21)
  await screenshot('full-desktop')
  await click('Volver al Top 8'); await waitText('Top 8 del torneo')
  await click('Presentar Top 8'); await waitText('Solo lectura')
  assert.equal(await js(`document.querySelectorAll('button,input,nav').length`),0)
  assert.deepEqual(await saved(),original,'presentation must not write storage')
  await screenshot('presentation-desktop')
  await send('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:true})
  await open(); await delay(300); await screenshot('top8-mobile')
  assert.ok(await js(`document.documentElement.scrollWidth<=innerWidth`))
  assert.equal(await js(`document.querySelectorAll('.standings-mobile-summary li').length`),8)
  await click('Ver clasificación completa'); await screenshot('full-mobile')
  assert.ok(await js(`document.documentElement.scrollWidth<=innerWidth`))
  assert.deepEqual(await saved(),original,'navigation and exports must not write storage')
  // Live storage update from another tab must recalculate the read-only presentation.
  await open('/tournament/standings/presentation')
  await js(`(async()=>{const {proposeMatchAction}=await import('/src/utils/matchSession.ts');const t=JSON.parse(localStorage.getItem('stage-strike.top8.v1'));const next=proposeMatchAction(t,'RESET',{type:'icon',slot:0,index:0}).tournament;localStorage.setItem('stage-strike.top8.v1',JSON.stringify(next));window.dispatchEvent(new StorageEvent('storage',{key:'stage-strike.top8.v1'}));})()`)
  await waitText('Resultados provisionales')
  assert.equal(await js(`document.querySelector('.top-eight-poster').textContent.includes('CLASIFICACIÓN FINAL')`),false)
  const longNickname = 'Nickname competitivo de prueba '.repeat(4).slice(0,120).trim()
  const longTournament = structuredClone(original)
  longTournament.participants[0].nickname = longNickname
  await js(`localStorage.setItem('stage-strike.top8.v1',${JSON.stringify(JSON.stringify(longTournament))})`)
  await open()
  assert.ok(await js(`document.querySelector('.top-eight-poster').textContent.includes(${JSON.stringify(longNickname)})`),'PNG source must retain complete nickname')
  const longPng = await js(`(async()=>{const {topEightPng}=await import('/src/utils/standingsImage.ts');const {blob}=await topEightPng(document.querySelector('.top-eight-poster'));return await new Promise(resolve=>{const r=new FileReader();r.onload=()=>resolve(r.result.split(',')[1]);r.readAsDataURL(blob)})})()`)
  await writeFile(resolve(artifactRoot,'top8-long-name.png'),Buffer.from(longPng,'base64'))
  await send('Network.enable'); await send('Network.setCacheDisabled',{cacheDisabled:true})
  await send('Network.setBlockedURLs',{urls:['*images/characters/*']})
  const missing = await js(`(async()=>{const {topEightPng}=await import('/src/utils/standingsImage.ts');const {blob,missingImages}=await topEightPng(document.querySelector('.top-eight-poster'));return {missingImages,size:blob.size,type:blob.type}})()`)
  assert.ok(missing.missingImages>0);assert.ok(missing.size>0);assert.equal(missing.type,'image/png')
  await send('Network.setBlockedURLs',{urls:[]})
  // Test a large list without manufacturing an arbitrary Top 8.
  await js(`(async()=>{const {createScalableTournament,drawTournament}=await import('/src/utils/tournamentSetup.ts');const {saveTournament}=await import('/src/utils/tournamentStorage.ts');saveTournament(localStorage,{...drawTournament(createScalableTournament(Array.from({length:128},(_,i)=>({id:'large'+i,nickname:'Player '+i})))),status:'started'});})()`)
  await open(); await waitText('Top 8 por definir'); await click('Ver clasificación completa')
  assert.equal(await js(`document.querySelectorAll('tbody tr').length`),50)
  await click('Siguiente'); await waitText('Página 2 de 3'); await click('Siguiente'); await waitText('Página 3 de 3')
  assert.equal(await js(`document.querySelectorAll('tbody tr').length`),28)
  assert.equal(exceptions.length,0,JSON.stringify(exceptions))
  console.log('Phase 13 passed: final Top8/ties, actual PNG 1600x1140, complete CSV, read-only presentation/live correction, mobile, 128 pagination and unchanged stored results.')
  console.log(`Screenshots and exported PNG: ${artifactRoot}`)
} catch (e) {
  console.error(serverLog, browserLog.slice(-1500)); throw e
} finally {
  if (socket?.readyState === WebSocket.OPEN) { try { await send('Browser.close') } catch { /* Already closed. */ } socket.close() }
  server.kill(); browser.kill()
}
