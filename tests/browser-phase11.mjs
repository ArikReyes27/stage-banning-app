// Optional real-browser integration check. Uses a new isolated profile, never user browser data.
// Run: node tests/browser-phase11.mjs (Chrome on Windows; no additional dependencies).
// Chrome needs permission to launch its GPU/render subprocesses outside restricted sandboxes.
import { spawn } from 'node:child_process'
import { mkdir, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import assert from 'node:assert/strict'

const artifactRoot = resolve('node_modules/.tmp/phase11-browser')
await mkdir(artifactRoot, { recursive: true })
const server = spawn(process.execPath, ['node_modules/vite/bin/vite.js', '--host', '127.0.0.1', '--port', '4175', '--strictPort'], { windowsHide: true, stdio: 'pipe' })
const browser = spawn('C:/Program Files/Google/Chrome/Application/chrome.exe', ['--headless=new', '--no-first-run', '--no-default-browser-check', '--disable-background-networking', '--disable-sync', '--remote-debugging-port=4176', `--user-data-dir=${resolve(artifactRoot, `profile-${Date.now()}`)}`, 'about:blank'], { windowsHide: true, stdio: 'pipe' })
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
  await until(async () => (await fetch('http://127.0.0.1:4175')).ok, 'Vite did not start')
  const tabs = await until(async () => {
    const pages = (await (await fetch('http://127.0.0.1:4176/json/list')).json()).filter(t => t.type === 'page')
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
  await loadPage('Page.navigate', { url: 'http://127.0.0.1:4175/tournament' })
  await waitText('Seleccionar participantes / Nuevo torneo')
  await js(`localStorage.setItem('stage-strike.registration.v1', JSON.stringify({schemaVersion:1, participants:Array.from({length:20}, (_,i)=>({id:'r'+i,nickname:'Player '+(i+1)}))}))`)
  await loadPage('Page.reload'); await waitText('Seleccionar todos')
  await click('Seleccionar todos'); await click('Revisar selección')
  await waitText('Exportar torneo actual a JSON')
  confirmDialog = false; await click('Confirmar nuevo torneo'); await delay(250)
  assert.equal(await saved(), null, 'cancel must not overwrite storage')
  confirmDialog = true; await click('Confirmar nuevo torneo')
  await until(async () => (await saved())?.participants.length === 20, 'new roster not saved')
  await setInput('[aria-label="Seed de Player 1"]', '1')
  await setInput('[aria-label="Seed de Player 2"]', '2')
  await click('Generar bracket'); await waitText('Iniciar torneo')
  const drawn = await saved()
  assert.equal(drawn.seeds.length, 32); assert.equal(drawn.seeds.filter(Boolean).length, 20)
  assert.notEqual(Math.floor(drawn.seeds.indexOf('r0') / 16), Math.floor(drawn.seeds.indexOf('r1') / 16))
  await click('Volver a sortear'); await click('Restaurar distribución anterior')
  assert.deepEqual((await saved()).seeds, drawn.seeds)
  await click('Iniciar torneo'); await until(async () => (await saved())?.status === 'started', 'start failed')
  assert.equal(await js(`[...document.querySelectorAll('button')].some(b => b.textContent.trim() === 'Volver a sortear')`), false)
  const matchId = await js(`(() => { const buttons=[...document.querySelectorAll('button[aria-label^="Editar "]')]; return buttons[0]?.getAttribute('aria-label').split(', ')[1].split(':')[0]; })()`)
  assert.ok(matchId)
  await js(`document.querySelector('button[aria-label^="Editar "]').click()`)
  await waitText('Abrir VS')
  await js(`document.querySelector('dialog button') ? [...document.querySelectorAll('dialog button')].find(b=>b.textContent.trim()==='Abrir VS').click() : (()=>{throw Error('Missing editor VS')})()`)
  await waitText('Control del set')
  await js(`(() => {const select=[...document.querySelectorAll('.vs-controls select')].find(s=>s.parentElement.textContent.includes('Escenario del juego')); Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype,'value').set.call(select,'battlefield'); select.dispatchEvent(new Event('change',{bubbles:true}));})()`)
  await js(`document.querySelector('button[aria-label^="Registrar una victoria"]').click()`)
  await until(async () => (await saved())?.results[matchId]?.scores[0] === 1, 'interactive win failed without initial characters')
  assert.equal((await saved()).results[matchId].details.games[0].stage.id, 'battlefield')
  const beforeHide = await saved()
  await click('Ocultar VS'); await click('Mostrar VS')
  assert.deepEqual(await saved(), beforeHide)
  await loadPage('Page.reload'); await waitText('Control del set'); assert.deepEqual(await saved(), beforeHide)
  await click('DQ / Descalificar')
  await waitText('Confirmar DQ…')
  await js(`(() => {const select=document.querySelector('.dq-controls select'); Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype,'value').set.call(select,'1'); select.dispatchEvent(new Event('change',{bubbles:true}));})()`)
  await click('Confirmar DQ…'); await until(async () => (await saved())?.results[matchId]?.outcome?.type === 'dq', 'DQ failed')
  await click('Revertir DQ'); await until(async () => !(await saved())?.results[matchId]?.outcome, 'DQ reversal failed')
  await js(`document.querySelector('button[aria-label^="Registrar una victoria"]').click()`)
  await click('Confirmar ganador'); await until(async () => (await saved())?.results[matchId]?.confirmed, 'confirmation failed')
  await click('Volver al bracket'); await waitText('Bracket completo')
  const desktop = await send('Page.captureScreenshot', { format: 'png' }); await writeFile(resolve(artifactRoot, 'desktop.png'), Buffer.from(desktop.data, 'base64'))
  await send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 1, mobile: true })
  await delay(150)
  assert.ok(await js('document.documentElement.scrollWidth <= window.innerWidth + 2'), 'mobile viewport overflows')
  const mobile = await send('Page.captureScreenshot', { format: 'png' }); await writeFile(resolve(artifactRoot, 'mobile.png'), Buffer.from(mobile.data, 'base64'))
  const original = await saved()
  await loadPage('Page.navigate', { url: `http://127.0.0.1:4175/tournament/match/${matchId}/presentation` })
  await waitText('VS')
  assert.equal(await js(`!!document.querySelector('button[aria-label^="Registrar una victoria"]')`), false)
  assert.deepEqual(await saved(), original)
  // Additional fixtures live only in this disposable profile. Exercise the real UI filters
  // after advancing the production engine to each elimination threshold.
  await send('Emulation.setDeviceMetricsOverride', { width: 1440, height: 1000, deviceScaleFactor: 1, mobile: false })
  for (const count of [20, 128]) {
    await js(`(async () => {
      const { createScalableTournament, drawTournament } = await import('/src/utils/tournamentSetup.ts');
      const { saveTournament } = await import('/src/utils/tournamentStorage.ts');
      const roster = Array.from({length:${count}}, (_,i)=>({id:'visual'+i,nickname:'Visual '+(i+1)}));
      saveTournament(localStorage, {...drawTournament(createScalableTournament(roster), () => .5), status:'started'});
    })()`)
    await loadPage('Page.navigate', { url: 'http://127.0.0.1:4175/tournament' })
    await waitText(`${count} participantes sin eliminar`)
    assert.ok(await js(`document.querySelectorAll('.match-card').length <= 32`))
    await click('Encuentros siguientes'); await waitText('Página 2 de')
    await click('Encuentros anteriores'); await waitText('Página 1 de')
    const shot = await send('Page.captureScreenshot', { format: 'png' })
    await writeFile(resolve(artifactRoot, `bracket-${count}.png`), Buffer.from(shot.data, 'base64'))
    if (count === 20) {
      await js(`document.querySelector('.bracket-board input[type="checkbox"]').click()`)
      await waitText('BYE')
      assert.equal(await js(`!![...document.querySelectorAll('button')].find(b => b.textContent.trim()==='Top 16 · pendiente')?.disabled`), true)
    }
    for (const size of [128, 64, 32, 16, 8].filter(n => n <= count)) {
      await js(`(async () => {
        const { resolveBracket, proposeResult } = await import('/src/utils/doubleElimination.ts');
        const { tournamentProgress } = await import('/src/utils/tournamentPhases.ts');
        const { loadTournament, saveTournament } = await import('/src/utils/tournamentStorage.ts');
        let t = loadTournament(localStorage).tournament, steps = 0;
        while (tournamentProgress(t).alive > ${size}) {
          const m = resolveBracket(t).find(m => m.enabled && !m.settled && m.players.every(Boolean));
          if (!m || ++steps > ${count} * 2) throw Error('Progression stalled');
          t = proposeResult(t, m.id, {format:'BO3', scores:[2,0], confirmed:true}).tournament;
        }
        saveTournament(localStorage,t);
      })()`)
      await loadPage('Page.reload'); await waitText(`${size} participantes sin eliminar`)
      const beforeFilter = await saved()
      await click(`Top ${size}`); await waitText(`Top ${size} · participantes y derrotas al entrar`)
      assert.equal(await js(`document.querySelectorAll('.bracket-board details li').length`), size)
      assert.equal(await js(`[...document.querySelectorAll('.match-state')].some(e => e.textContent.includes('automático'))`), false)
      await setInput('.bracket-board select', 'losers')
      assert.equal(await js(`!!document.querySelector('.bracket-section.text-cyan-200')`), false)
      await setInput('.bracket-board select', 'all')
      await setInput('.bracket-board input[placeholder="W1, L5 o nickname"]', 'nonexistent-player')
      await waitText('No hay encuentros en esta selección.')
      await setInput('.bracket-board input[placeholder="W1, L5 o nickname"]', '')
      assert.deepEqual(await saved(), beforeFilter, 'navigation must not mutate tournament')
    }
  }
  assert.equal(exceptions.length, 0, JSON.stringify(exceptions))
  console.log('Phase 11 browser workflow passed: selection/cancel, seeds/draw/restore/start, editor/VS, stage, icons, hide/reload, DQ/reversal/confirm, mobile and presentation.')
  console.log(`Screenshots: ${artifactRoot}`)
  console.log('20/128 browser checks passed: pagination, BYEs, Top thresholds, phase rosters, section/search filters and unchanged storage on navigation.')
} catch (e) {
  console.error(serverLog, browserLog.slice(-1500)); throw e
} finally {
  if (socket?.readyState === WebSocket.OPEN) { try { await send('Browser.close') } catch { /* Already closed. */ } socket.close() }
  server.kill(); browser.kill()
}
