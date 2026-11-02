// Optional real-browser integration check. Uses a new isolated profile, never user browser data.
// Run: node tests/browser-phase12.mjs (Chrome on Windows; no additional dependencies).
// Chrome needs permission to launch its GPU/render subprocesses outside restricted sandboxes.
import { spawn } from 'node:child_process'
import { mkdir, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import assert from 'node:assert/strict'

const artifactRoot = resolve('node_modules/.tmp/phase12-browser')
await mkdir(artifactRoot, { recursive: true })
const server = spawn(process.execPath, ['node_modules/vite/bin/vite.js', '--host', '127.0.0.1', '--port', '4185', '--strictPort'], { windowsHide: true, stdio: 'pipe' })
const browser = spawn('C:/Program Files/Google/Chrome/Application/chrome.exe', ['--headless=new', '--no-first-run', '--no-default-browser-check', '--disable-background-networking', '--disable-sync', '--remote-debugging-port=4186', `--user-data-dir=${resolve(artifactRoot, `profile-${Date.now()}`)}`, 'about:blank'], { windowsHide: true, stdio: 'pipe' })
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
  await until(async () => (await fetch('http://127.0.0.1:4185')).ok, 'Vite did not start')
  const tabs = await until(async () => {
    const pages = (await (await fetch('http://127.0.0.1:4186/json/list')).json()).filter(t => t.type === 'page')
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
  const home = async () => {
    await loadPage('Page.navigate', { url: 'http://127.0.0.1:4185/' })
    await waitText('Tu torneo. Tus reglas.')
  }
  const link = label => js(`(() => { const a=[...document.querySelectorAll('a')].find(a=>a.textContent.trim()===${JSON.stringify(label)}); if(!a) throw Error('Missing link'); a.click(); })()`)
  const snapshot = name => send('Page.captureScreenshot', { format: 'png' }).then(shot => writeFile(resolve(artifactRoot, name + '.png'), Buffer.from(shot.data, 'base64')))
  const imageSource = () => js(`document.querySelector('.stage-hero-current').getAttribute('src')`)
  const registry = () => js(`localStorage.getItem('stage-strike.registration.v1')`)
  await home()
  await delay(1500)
  assert.equal(await js(`performance.getEntriesByType('resource').filter(r=>r.name.includes('/images/stages/')).length`), 1, 'only first hero image loaded initially')
  assert.equal(await js(`document.querySelectorAll('.home-actions a').length`), 3)
  assert.ok(await js(`[...document.querySelectorAll('.home-actions a')].every(a=>a.getBoundingClientRect().height>=44)`))
  await snapshot('home-desktop')
  const initial = await imageSource()
  await until(async () => (await imageSource()) !== initial, 'background did not advance')
  await click('Pausar fondo')
  const paused = await imageSource(); await delay(7500); assert.equal(await imageSource(), paused)
  await click('Reanudar fondo')
  await send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] })
  await delay(7500); assert.equal(await imageSource(), paused, 'reduced motion must stop rotation')
  await send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'no-preference' }] })
  await js(`Object.defineProperty(document,'hidden',{configurable:true,get:()=>true}); document.dispatchEvent(new Event('visibilitychange'))`)
  await delay(7500); assert.equal(await imageSource(), paused, 'hidden tab must stop rotation')
  await js(`delete document.hidden; document.dispatchEvent(new Event('visibilitychange'))`)
  await until(async () => (await imageSource()) !== paused, 'rotation did not resume after visibility')
  console.log('Hero: lazy loading, automatic fade, pause, reduced motion and visibility checks passed.')
  await link('Registrar jugadores'); await waitText('Agregar participante')
  await click('Inicio'); await waitText('Tu torneo. Tus reglas.')
  await link('Administrar torneo'); await waitText('Seleccionar participantes / Nuevo torneo')
  await click('Rulesets'); await waitText('Encuentra tu ruleset')
  await until(() => js(`location.hash === '#rulesets' && document.activeElement.id === 'rulesets'`), 'ruleset deep link/focus failed')
  await click('Inicio'); await until(() => js(`!location.hash && window.scrollY < 10`), 'Inicio did not reset hash/scroll')
  await link('Elegir ruleset'); assert.equal(await js(`location.pathname`), '/')
  await link('Crear ruleset'); await until(() => js(`location.pathname === '/rulesets/new'`), 'create link failed')
  await home(); await link('Presentación del torneo'); await until(() => js(`location.pathname === '/tournament/presentation' && !document.querySelector('nav[aria-label="Navegación principal"]')`), 'presentation navigation leaked')
  assert.equal(await js(`!!document.querySelector('button[aria-label^="Editar "]')`), false)
  await home()
  await js(`document.querySelector('.home-actions a').focus()`)
  await send('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Enter', code: 'Enter', windowsVirtualKeyCode: 13 })
  await send('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Enter', code: 'Enter', windowsVirtualKeyCode: 13 })
  await waitText('Agregar participante')
  for (const count of [8, 32, 64, 128]) {
    await js(`localStorage.setItem('stage-strike.registration.v1',JSON.stringify({schemaVersion:1,participants:Array.from({length:${count}},(_,i)=>({id:'r'+i,nickname:'Player '+(i+1)}))}))`)
    await loadPage('Page.reload'); await waitText(`Participantes · ${count}`)
    const originalRegistry = await registry()
    await click('Seleccionar página'); await waitText(`${Math.min(count,25)} seleccionados`)
    await click('Seleccionar todos'); await waitText(`${count} seleccionados`)
    await click('Limpiar selección'); await waitText('0 seleccionados')
    await setInput('.registration-roster input:not([type="checkbox"])', 'Player 1')
    await click('Seleccionar página')
    assert.equal(await js(`document.querySelectorAll('.registration-list input:checked').length`), Math.min(25, 1 + (count >= 10 ? 10 : 0) + (count >= 100 ? count - 99 : 0)))
    await click('Seleccionar todos'); await waitText(`${count} seleccionados`)
    assert.equal(await registry(), originalRegistry, 'selection must not mutate IDs or persistence')
    await setInput('.registration-roster input:not([type="checkbox"])', '')
    confirmDialog = false; await click('Eliminar seleccionados'); await delay(100)
    assert.equal(await registry(), originalRegistry, 'cancelled deletion must preserve registry')
    confirmDialog = true
    await js(`window.scrollTo({top:document.querySelector('.registration-list li:last-child').getBoundingClientRect().top + window.scrollY - 500,behavior:'instant'})`)
    assert.ok(await js(`document.querySelector('.registration-toolbar').getBoundingClientRect().top >= 0`), 'toolbar not sticky')
    if (count === 128) await snapshot('registration-desktop')
    await loadPage('Page.reload'); await waitText(`Participantes · ${count}`)
    assert.equal(await registry(), originalRegistry, 'reload must preserve registry')
  }
  await send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 1, mobile: true })
  await js(`document.querySelector('.registration-roster').scrollIntoView({behavior:'instant'})`)
  await delay(300); await snapshot('registration-mobile')
  assert.ok(await js(`document.documentElement.scrollWidth <= innerWidth`), 'registration mobile overflow')
  await click('Seleccionar todos'); await waitText('128 seleccionados'); await click('Limpiar selección')
  await js(`window.scrollTo({top:document.querySelector('.registration-list li:nth-child(12)').getBoundingClientRect().top + window.scrollY - 300,behavior:'instant'})`)
  assert.ok(await js(`document.querySelector('.registration-toolbar').getBoundingClientRect().top <= 8 && document.querySelector('.registration-toolbar').getBoundingClientRect().top >= 0`), 'mobile toolbar not pinned')
  await snapshot('registration-mobile-sticky')
  await home(); await delay(1500); await snapshot('home-mobile')
  assert.ok(await js(`document.documentElement.scrollWidth <= innerWidth`), 'home mobile overflow')
  assert.ok(await js(`document.querySelectorAll('.home-actions a')[1].getBoundingClientRect().top > document.querySelectorAll('.home-actions a')[0].getBoundingClientRect().bottom`), 'mobile cards not stacked')
  await send('Emulation.setDeviceMetricsOverride', { width: 320, height: 700, deviceScaleFactor: 1, mobile: true })
  assert.ok(await js(`document.documentElement.scrollWidth <= innerWidth`), '320px home overflow')
  await send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 1, mobile: true })
  const tournamentBefore = await saved(), registryBefore = await registry()
  await link('Elegir ruleset')
  await js(`[...document.querySelectorAll('#rulesets button')].find(b=>b.textContent.includes('Iniciar baneo')).click()`)
  await waitText('¿Quién inicia?'); await click('Jugador 1')
  for (let turn = 0; turn < 4; turn++) {
    await until(() => js(`!!document.querySelector('.session-view button[aria-label^="Seleccionar "]')`), 'no available stage')
    await js(`document.querySelector('.session-view button[aria-label^="Seleccionar "]').click()`)
    await delay(100)
  }
  await waitText('Confirmar escenario'); await click('Confirmar escenario')
  await waitText('Ganó Jugador 1'); await click('Ganó Jugador 1'); await waitText('Juego 2')
  assert.deepEqual(await saved(), tournamentBefore, 'banning must not change tournament results')
  assert.equal(await registry(), registryBefore)
  console.log('Stage Banning: ruleset selection, first-player choice, bans, pick, stage confirmation and game result passed.')
  await send('Network.enable')
  await send('Network.setCacheDisabled', { cacheDisabled: true })
  await send('Network.setBlockedURLs', { urls: ['*images/stages/*'] })
  await home(); await delay(1500)
  assert.equal(await js(`getComputedStyle(document.querySelector('.stage-hero-current')).visibility`), 'hidden')
  assert.notEqual(await js(`getComputedStyle(document.querySelector('.stage-hero-background')).backgroundImage`), 'none')
  await snapshot('home-fallback')
  await send('Network.setBlockedURLs', { urls: [] })
  assert.equal(exceptions.length, 0, JSON.stringify(exceptions))
  console.log('Phase 12 passed: navigation/keyboard/presentation, registry 8/32/64/128, selections/cancel/persistence, sticky toolbar, desktop/mobile and image fallback.')
  console.log(`Screenshots: ${artifactRoot}`)
} catch (e) {
  console.error(serverLog, browserLog.slice(-1500)); throw e
} finally {
  if (socket?.readyState === WebSocket.OPEN) { try { await send('Browser.close') } catch { /* Already closed. */ } socket.close() }
  server.kill(); browser.kill()
}
