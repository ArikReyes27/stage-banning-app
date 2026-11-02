// Optional real-browser integration check. Uses a new isolated profile, never user browser data.
// Run: node tests/browser-phase14-1.mjs (Chrome on Windows; no additional dependencies).
// Chrome needs permission to launch its GPU/render subprocesses outside restricted sandboxes.
import { spawn } from 'node:child_process'
import { mkdir, writeFile, readFile, readdir } from 'node:fs/promises'
import { resolve } from 'node:path'
import assert from 'node:assert/strict'

const artifactRoot = resolve('node_modules/.tmp/phase14-1-browser')
await mkdir(artifactRoot, { recursive: true })
const server = spawn(process.execPath, ['node_modules/vite/bin/vite.js', '--host', '127.0.0.1', '--port', '4201', '--strictPort'], { windowsHide: true, stdio: 'pipe' })
const browser = spawn('C:/Program Files/Google/Chrome/Application/chrome.exe', ['--headless=new', '--no-first-run', '--no-default-browser-check', '--disable-background-networking', '--disable-sync', '--remote-debugging-port=4202', `--user-data-dir=${resolve(artifactRoot, `profile-${Date.now()}`)}`, 'about:blank'], { windowsHide: true, stdio: 'pipe' })
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
  await until(async () => (await fetch('http://127.0.0.1:4201')).ok, 'Vite did not start')
  const tabs = await until(async () => {
    const pages = (await (await fetch('http://127.0.0.1:4202/json/list')).json()).filter(t => t.type === 'page')
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
  const open = async (path = '/tournament/standings') => { await loadPage('Page.navigate', { url: `http://127.0.0.1:4201${path}` }); await waitText('Top 8 del torneo') }
  const screenshot = async name => { const shot = await send('Page.captureScreenshot', { format:'png' }); await writeFile(resolve(artifactRoot,name+'.png'),Buffer.from(shot.data,'base64')) }
  await open()
  await waitText('Top 8 por definir')
  assert.equal(await saved(), null)

  await js("(async()=>{const {createTournament}=await import('/src/utils/doubleElimination.ts');const {saveTournament}=await import('/src/utils/tournamentStorage.ts');const t=createTournament();t.status='started';t.participants.forEach((p,i)=>{p.nickname='Player '+i;p.characterIds=['mario']});t.seeds=t.participants.map(p=>p.id);saveTournament(localStorage,t)})()")
  const admin=async()=>{await loadPage('Page.navigate',{url:'http://127.0.0.1:4201/tournament'});await until(()=>js("!!document.querySelector('.match-card.editable')"),'bracket ready')}
  const editor=async()=>{await js("document.querySelector('.match-card.editable').click()");await waitText('Encuentro W1')}
  const picker=async()=>{await js("document.querySelector('[aria-label=\"Cambiar personaje de Player 0\"]').click()");await until(()=>js("document.activeElement?.type==='search'"),'search focus')}
  await admin();await editor();await picker()
  await setInput('.character-picker-popover input','So')
  assert.deepEqual(await js("[...document.querySelectorAll('.character-picker-popover .vs-character-option')].map(b=>b.textContent.replaceAll('\u2713',''))"),['Sonic','Sora'])
  await setInput('.character-picker-popover input','SONIC')
  await send('Input.dispatchKeyEvent',{type:'keyDown',key:'ArrowDown',code:'ArrowDown',windowsVirtualKeyCode:40})
  assert.equal(await js("document.activeElement.className"),'vs-character-option')
  await send('Input.dispatchKeyEvent',{type:'keyDown',key:'Enter',code:'Enter',text:'\r',windowsVirtualKeyCode:13})
  await send('Input.dispatchKeyEvent',{type:'keyUp',key:'Enter',code:'Enter',windowsVirtualKeyCode:13})
  await until(async()=> (await saved()).results.W1?.prepared?.characterIds[0]==='sonic','Sonic selected: '+await js('document.body.innerText'))
  assert.equal((await saved()).results.W1.details,undefined)
  assert.equal(await js("document.querySelectorAll('dialog select').length"),0)
  await picker();await click('Color 4').catch(()=>js("document.querySelector('[aria-label=\"Color 4\"]').click()"));await click('Cerrar selector')
  await screenshot('character-editor-desktop')
  await click('Abrir VS');await until(()=>js("!!document.querySelector('.vs-portrait[src$=\"sonic/03.png\"]')"),'variant VS')
  await setInput('.vs-character-search input','Clo');await click('Cloud')
  assert.equal((await saved()).results.W1.details.current.characterIds[0],'cloud')
  await admin();await editor();assert.equal(await js("document.querySelector('[aria-label=\"Cambiar personaje de Player 0\"] img').alt"),'Cloud')
  await send('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:true});await picker();await screenshot('character-editor-mobile')
  assert.ok(await js("document.querySelector('.character-picker-popover').getBoundingClientRect().right<=innerWidth && document.querySelector('.character-picker-popover').getBoundingClientRect().bottom<=innerHeight"))
  await click('Cerrar selector');await click('Cerrar')
  await send('Emulation.setDeviceMetricsOverride',{width:1440,height:1000,deviceScaleFactor:1,mobile:false})


  await admin();await editor()
  const quick=async(slot,index)=>{await js("document.querySelectorAll('.quick-victories')["+slot+"].querySelectorAll('button')["+index+"].click()");await delay(100)}
  const lit=()=>js("[...document.querySelectorAll('.quick-victories')].map(row=>row.querySelectorAll('.is-won').length)")
  assert.deepEqual(await lit(),[0,0])
  await click('BO5 \u00b7 3 victorias');assert.equal(await js("document.querySelectorAll('.quick-victory').length"),6)
  await click('BO3 \u00b7 2 victorias');assert.equal(await js("document.querySelectorAll('.quick-victory').length"),4)
  await js("document.querySelectorAll('.quick-victories')[0].querySelectorAll('button')[1].focus()")
  await send('Input.dispatchKeyEvent',{type:'keyDown',key:' ',code:'Space',windowsVirtualKeyCode:32})
  await send('Input.dispatchKeyEvent',{type:'keyUp',key:' ',code:'Space',windowsVirtualKeyCode:32})
  await delay(100);await quick(1,1)
  assert.deepEqual(await lit(),[1,1]);assert.equal(await js("!!document.querySelector('.character-picker-popover')"),false)
  await click('Guardar progreso');await editor();assert.deepEqual(await lit(),[1,1])
  await click('Abrir VS');await until(()=>js("document.querySelectorAll('.vs-victory.is-won').length===2"),'panel score in VS')
  await js("document.querySelectorAll('.vs-victories')[0].querySelectorAll('button')[1].click()")
  await until(async()=> (await saved()).results.W1.scores[0]===2,'VS score saved')
  await admin();await editor();assert.deepEqual(await lit(),[2,1])
  await click('Confirmar ganador');await until(async()=> (await saved()).results.W1.confirmed,'confirmed')
  await editor();assert.equal(await js("document.querySelectorAll('.quick-victories button').length"),0)
  await screenshot('quick-confirmed-desktop')
  await click('Cerrar')
  await js("(async()=>{const {proposeMatchAction}=await import('/src/utils/matchSession.ts');const {saveTournament}=await import('/src/utils/tournamentStorage.ts');let t=JSON.parse(localStorage.getItem('stage-strike.top8.v1'));for(const id of ['W2','W5'])for(const action of [{type:'win',winner:0},{type:'win',winner:0},{type:'confirm'}])t=proposeMatchAction(t,id,action).tournament;saveTournament(localStorage,t)})()")
  await admin();await editor();const beforeCorrection=await saved()
  await click('Corregir encuentro');await quick(1,0)
  assert.deepEqual((await saved()).results,beforeCorrection.results,'draft must not mutate persisted results')
  await click('Guardar progreso');await until(async()=> (await saved()).results.W1.scores[1]===0,'same winner correction saved')
  assert.deepEqual((await saved()).results.W5,beforeCorrection.results.W5)
  await editor();await click('Corregir encuentro');await quick(0,0);await quick(1,0);await quick(1,1)
  confirmDialog=false;await click('Confirmar ganador');await delay(150)
  assert.ok((await saved()).results.W5,'cancel must preserve downstream')
  confirmDialog=true;await click('Confirmar ganador');await until(async()=> !(await saved()).results.W5,'changed winner invalidation')
  await admin();await editor();await js("document.querySelector('.quick-history').open=true")
  assert.ok(await js("document.querySelectorAll('.match-history-game.retired').length>=3"))
  await screenshot('quick-retired-history');await click('Cerrar')
  await editor();await click('Corregir encuentro');await quick(1,0)
  await js("(async()=>{const {proposeMatchAction}=await import('/src/utils/matchSession.ts');let t=JSON.parse(localStorage.getItem('stage-strike.top8.v1'));t=proposeMatchAction(t,'W1',{type:'undo'}).tournament;localStorage.setItem('stage-strike.top8.v1',JSON.stringify(t));window.dispatchEvent(new StorageEvent('storage',{key:'stage-strike.top8.v1'}))})()")
  await waitText('El resultado cambi\u00f3 en otra vista.');assert.equal(await js("[...document.querySelectorAll('dialog button')].find(b=>b.textContent==='Guardar progreso').disabled"),true)
  await click('Descartar correcci\u00f3n');await click('Cerrar')
  // Reproduce Winners Final W15 with history and retired records, using 16 players.
  await js("(async()=>{const {createScalableTournament,drawTournament}=await import('/src/utils/tournamentSetup.ts');const {resolveBracket}=await import('/src/utils/doubleElimination.ts');const {proposeMatchAction}=await import('/src/utils/matchSession.ts');const {saveTournament}=await import('/src/utils/tournamentStorage.ts');let t={...drawTournament(createScalableTournament(Array.from({length:16},(_,i)=>({id:'q'+i,nickname:'Competidor '+i}))),()=>.5),status:'started'};while(!resolveBracket(t).find(m=>m.id==='W15').players.every(Boolean)){const m=resolveBracket(t).find(m=>m.section==='winners'&&!m.settled&&m.players.every(Boolean));for(const action of [{type:'win',winner:0},{type:'win',winner:0},{type:'confirm'}])t=proposeMatchAction(t,m.id,action).tournament}for(const action of [{type:'select',setup:{characterIds:['sonic','cloud']}},{type:'win',winner:0},{type:'icon',slot:0,index:0},{type:'win',winner:1}])t=proposeMatchAction(t,'W15',action).tournament;saveTournament(localStorage,t)})()")
  await admin();await js("[...document.querySelectorAll('.match-card.editable')].find(b=>b.querySelector('.match-card-heading span').textContent==='W15').click()")
  await waitText('Encuentro W15');assert.deepEqual(await lit(),[0,1]);assert.equal(await js("document.querySelector('.quick-history').open"),false)
  await quick(0,0);assert.deepEqual(await lit(),[1,1]);await screenshot('w15-quick-desktop')
  await send('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:true});await screenshot('w15-quick-mobile')
  assert.ok(await js("document.querySelector('dialog').scrollWidth<=document.querySelector('dialog').clientWidth"))
  await click('Guardar progreso');await loadPage('Page.reload');assert.deepEqual((await saved()).results.W15.scores,[1,1])
  await send('Emulation.setDeviceMetricsOverride',{width:1440,height:1000,deviceScaleFactor:1,mobile:false})

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
  assert.equal(await js("document.querySelectorAll('.top-eight-poster [aria-label=\"Campe\u00f3n\"],.top-eight-poster [aria-label=\"Subcampe\u00f3n\"],.top-eight-poster [aria-label=\"Tercer lugar\"]').length"),3)
  assert.equal(await js("[...document.querySelectorAll('.top-eight-poster text')].filter(t=>t.textContent.startsWith('SETS ')).length"),3)
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
  console.log('Phase 14.1 passed: quick BO3/BO5, partial progress, confirmed corrections, invalidations, W15 retired history, character search/keyboard, variants, editor/VS sync, final Top8/ties, actual PNG 1600x1140, complete CSV, read-only presentation/live correction, mobile, 128 pagination and unchanged stored results.')
  console.log(`Screenshots and exported PNG: ${artifactRoot}`)
} catch (e) {
  console.error(serverLog, browserLog.slice(-1500)); throw e
} finally {
  if (socket?.readyState === WebSocket.OPEN) { try { await send('Browser.close') } catch { /* Already closed. */ } socket.close() }
  server.kill(); browser.kill()
}
