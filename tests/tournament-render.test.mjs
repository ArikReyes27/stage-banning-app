import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, existsSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createRequire } from 'node:module'
import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import ts from 'typescript'
import { createTournament, MATCHES, proposeResult } from '../src/utils/doubleElimination.ts'
import { TOURNAMENT_STORAGE_KEY } from '../src/utils/tournamentStorage.ts'
import { proposeMatchAction } from '../src/utils/matchSession.ts'
import { resolveBracket } from '../src/utils/doubleElimination.ts'
import { REGISTRATION_KEY, importNames, emptyRegistration } from '../src/utils/registration.ts'
import { createScalableTournament, drawTournament } from '../src/utils/tournamentSetup.ts'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const require = createRequire(import.meta.url)
// Compile our TSX in memory for React server rendering. No generated artifacts or added libraries.
function renderer(tournament, pathname = '/tournament/presentation', registration = emptyRegistration()) {
  const cache = new Map()
  const window = {
    location: { pathname },
    localStorage: { getItem: (key) => key === TOURNAMENT_STORAGE_KEY ? JSON.stringify(tournament) : key === REGISTRATION_KEY ? JSON.stringify(registration) : null },
  }
  function load(path) {
    if (path.endsWith('.css')) return {}
    const full = ['', '.ts', '.tsx'].map((suffix) => path + suffix).find(existsSync)
    if (!full) throw new Error(`Missing module: ${path}`)
    if (cache.has(full)) return cache.get(full).exports
    const module = { exports: {} }; cache.set(full, module)
    // This renderer represents normal local mode; Vite replaces import.meta.env in the app.
    const source = ts.transpileModule(readFileSync(full, 'utf8').replaceAll('import.meta.env', '({MODE:"development",DEV:true})'), {
      compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true },
    }).outputText
    const localRequire = (id) => id.startsWith('.') ? load(resolve(dirname(full), id)) : require(id)
    new Function('require', 'module', 'exports', 'window', source)(localRequire, module, module.exports, window)
    return module.exports
  }
  return (path, component, props = {}) => renderToStaticMarkup(React.createElement(load(resolve(root, path))[component], props))
}
function fixture() {
  const t = createTournament()
  t.participants.forEach((p, i) => { p.nickname = `Alias ${i + 1}`; p.characterIds = ['mario'] })
  t.status = 'started'; t.seeds = t.participants.map((p) => p.id)
  return t
}

test('registration page paginates large rosters and offers independent import/export and bracket access', () => {
  const registration = importNames(emptyRegistration(), Array.from({ length: 128 }, (_, i) => `Registered ${i + 1}`), 'add')
  const html = renderer(fixture(), '/registration', registration)('src/pages/RegistrationPage.tsx', 'RegistrationPage')
  assert.match(html, /Registro de participantes/)
  assert.match(html, /Participantes · 128/)
  assert.equal((html.match(/type="checkbox"/g) ?? []).length, 25)
  assert.match(html, /Registered 25/); assert.doesNotMatch(html, /Registered 26/)
  for (const label of ['Pegar lista', 'Importar archivo', 'Descargar plantilla', 'Exportar registro', 'Ir al bracket']) assert.ok(html.includes(label))
  assert.doesNotMatch(html, /Usar los 8 seleccionados/)
  assert.doesNotMatch(html, /type="email"|type="password"|Personaje principal/)
})

test('empty registration is understandable and bracket exposes registration navigation', () => {
  const html = renderer(fixture(), '/registration')('src/pages/RegistrationPage.tsx', 'RegistrationPage')
  assert.match(html, /Aún no hay participantes/)
  const bracket = renderer(fixture())('src/pages/TournamentAdminPage.tsx', 'TournamentAdminPage')
  assert.match(bracket, /Registro · elegir participantes/)
})

test('home exposes tournament navigation, existing ruleset library and only one initial stage image', () => {
  const html = renderer(fixture(), '/')('src/pages/HomePage.tsx', 'HomePage')
  for (const label of ['Tu torneo. Tus reglas.', 'Tu escenario.', 'Registrar jugadores', 'Administrar torneo', 'Elegir ruleset', 'Presentación del torneo', 'Encuentra tu ruleset']) assert.ok(html.includes(label))
  for (const href of ['/registration', '/tournament', '/#rulesets', '/rulesets/new', '/tournament/presentation']) assert.ok(html.includes(`href="${href}"`))
  assert.equal((html.match(/class="home-action-button focus-ring"/g) ?? []).length, 3)
  assert.equal((html.match(/src="\/images\/stages\//g) ?? []).length, 1)
  assert.ok(html.includes('href="/tournament/standings"'))
  assert.doesNotMatch(html, /Supabase/)
})

for (const count of [8, 32, 64, 128]) test(`registry toolbar: ${count} players, explicit page/all selection and separate deletion`, () => {
  const registration = importNames(emptyRegistration(), Array.from({ length: count }, (_, i) => `Player ${i + 1}`), 'add')
  const html = renderer(fixture(), '/registration', registration)('src/pages/RegistrationPage.tsx', 'RegistrationPage')
  assert.ok(html.includes(`Participantes · ${count}`))
  for (const label of ['0 seleccionados', 'Seleccionar página', 'Seleccionar todos', 'Limpiar selección']) assert.ok(html.includes(label))
  assert.equal((html.match(/type="checkbox"/g) ?? []).length, Math.min(count, 25))
  assert.ok(html.indexOf('Eliminar seleccionados') > html.indexOf('</ol>'))
})

test('standings default to Top 8, offer full list/exports, and presentation has no administrative controls', () => {
  const t = fixture()
  const admin = renderer(t, '/tournament/standings')('src/pages/StandingsPage.tsx', 'StandingsPage')
  assert.match(admin, /Top 8 del torneo/)
  assert.match(admin, /Ver clasificación completa/)
  assert.match(admin, /Exportar Top 8 a PNG/)
  assert.match(admin, /Exportar clasificación completa CSV/)
  assert.doesNotMatch(admin, /<table/)
  const presentation = renderer(t, '/tournament/standings/presentation')('src/pages/StandingsPage.tsx', 'StandingsPage', {presentation:true})
  assert.match(presentation, /Solo lectura/)
  assert.match(presentation, /top-eight-poster/)
  assert.doesNotMatch(presentation, /<button|<input|<table/)
  const shell = renderer(t, '/tournament/standings/presentation')('src/components/layout/AppShell.tsx', 'AppShell', {children:presentation})
  assert.doesNotMatch(shell, /Navegación principal|Crear ruleset/)
})

test('scalable setup does not request characters and large presentation renders at most 32 cards', () => {
  const roster = Array.from({ length: 129 }, (_, i) => ({ id: `r${i}`, nickname: `Registered ${i}` }))
  const t = drawTournament(createScalableTournament(roster), () => .5)
  const render = renderer(t, '/tournament', { schemaVersion: 1, participants: roster })
  const setup = render('src/pages/TournamentAdminPage.tsx', 'TournamentAdminPage')
  assert.match(setup, /Seed de Registered 0/)
  assert.match(setup, /Iniciar torneo/)
  assert.match(setup, /Intercambiar posiciones/)
  assert.doesNotMatch(setup, /Personaje principal|Seleccionar personaje/)
  const presentation = render('src/pages/TournamentPresentationPage.tsx', 'TournamentPresentationPage')
  assert.ok((presentation.match(/class="match-card"/g) ?? []).length <= 32)
  assert.match(presentation, /Top 128 · pendiente/)
  assert.match(presentation, /Top 8 · pendiente/)
  assert.match(presentation, /Localizar encuentro/)
  assert.doesNotMatch(presentation, /DQ \/ Descalificar|Registrar una victoria|Editar marcador/)
})

test('large-roster first-round VS uses existing characters, score buttons, DQ and read-only presentation', () => {
  const t = { ...drawTournament(createScalableTournament(Array.from({ length: 128 }, (_, i) => ({ id: `r${i}`, nickname: `Alias ${i}` })))), status: 'started' }
  const matchId = 'W60'
  const render = renderer(t, `/tournament/match/${matchId}`)
  const admin = render('src/pages/MatchVSPage.tsx', 'MatchVSPage', { matchId })
  assert.match(admin, /VS W60/)
  assert.match(admin, /Registrar una victoria/)
  assert.match(admin, /DQ \/ Descalificar/)
  assert.match(admin, /Sin personaje/)
  const presentation = render('src/pages/MatchVSPage.tsx', 'MatchVSPage', { matchId, presentation: true })
  assert.doesNotMatch(presentation, /Registrar una victoria|DQ \/ Descalificar/)
})

test('presentation renders stored roster and rounds without any editing controls', () => {
  const html = renderer(fixture())('src/pages/TournamentPresentationPage.tsx', 'TournamentPresentationPage')
  assert.match(html, /Alias 1/)
  assert.match(html, /Winners Semifinals/)
  assert.match(html, /Losers Final/)
  assert.doesNotMatch(html, /<button|<input|<select|Grand Final Reset/)
  assert.match(html, /\/images\/characters\/icons\/mario\/00.png/)
  assert.match(html, /<svg/)
})

test('only ready matches have edit buttons and unconfirmed results remain neutral', () => {
  const t = proposeResult(fixture(), 'W1', { format: 'BO3', scores: [2, 1], confirmed: false }).tournament
  const html = renderer(t)('src/components/tournament/BracketBoard.tsx', 'BracketBoard', { tournament: t, onEdit: () => {} })
  assert.equal((html.match(/<button/g) ?? []).length, 4)
  assert.doesNotMatch(html, /match-player win|match-player loss/)
  const confirmed = proposeResult(t, 'W1', { ...t.results.W1, confirmed: true }).tournament
  const completedHtml = renderer(confirmed)('src/components/tournament/BracketBoard.tsx', 'BracketBoard', { tournament: confirmed })
  assert.match(completedHtml, /match-player win/)
  assert.match(completedHtml, /match-player loss/)
  assert.match(completedHtml, /aria-label="Ganador"/)
  assert.match(completedHtml, /aria-label="Perdedor"/)
})

test('reset card is rendered only after Losers finalist wins Grand Final', () => {
  let t = fixture()
  for (const m of MATCHES.filter((m) => m.id !== 'RESET')) {
    t = proposeResult(t, m.id, { format: 'BO3', scores: m.id === 'GF' ? [0, 2] : [2, 0], confirmed: true }).tournament
  }
  const html = renderer(t)('src/pages/TournamentPresentationPage.tsx', 'TournamentPresentationPage')
  assert.match(html, /Grand Final Reset/)
  assert.doesNotMatch(html, /<button/)
})

test('registration has exactly eight aliases and character selects, no personal contact fields', () => {
  const t = createTournament()
  const html = renderer(t)('src/components/tournament/ParticipantForm.tsx', 'ParticipantForm', { tournament: t, onSave: () => {} })
  assert.equal((html.match(/<input/g) ?? []).length, 8)
  assert.equal((html.match(/<select/g) ?? []).length, 8)
  assert.doesNotMatch(html, /type="email"|type="tel"/)
  assert.match(html, /Generar bracket/)
})

test('registration shows icons for existing saved selections, including DLC and grouped fighters', () => {
  const t = fixture()
  const ids = ['mario', 'piranha-plant', 'sora', 'pyra-mythra', 'pokemon-trainer', 'mii-gunner', 'banjo-and-kazooie', 'kazuya']
  t.participants.forEach((p, i) => { p.characterIds = [ids[i]] })
  const html = renderer(t)('src/components/tournament/ParticipantForm.tsx', 'ParticipantForm', { tournament: t, onSave: () => {} })
  for (const id of ids) assert.ok(html.includes(`/images/characters/icons/${id}/00.png`))
  assert.doesNotMatch(html, /\/images\/characters\/renders\//)
})

test('global shell hides management links in presentation, but keeps normal navigation elsewhere', () => {
  const presentation = renderer(fixture())('src/components/layout/AppShell.tsx', 'AppShell', { children: 'Bracket' })
  assert.doesNotMatch(presentation, /Crear ruleset|Navegación principal/)
  const normal = renderer(fixture(), '/tournament')('src/components/layout/AppShell.tsx', 'AppShell', { children: 'Bracket' })
  assert.match(normal, /Navegación principal/)
  assert.match(normal, /Bracket/)
})

test('aliases are rendered as escaped text', () => {
  const t = fixture(); t.participants[0].nickname = '<img src=x onerror=alert(1)>'
  const html = renderer(t)('src/pages/TournamentPresentationPage.tsx', 'TournamentPresentationPage')
  assert.match(html, /&lt;img/)
  assert.doesNotMatch(html, /<img src="?x/)
})

test('VS uses one stage background, historical victory icons and no editing controls', () => {
  let t = fixture()
  const act = action => { t = proposeMatchAction(t, 'W1', action).tournament }
  act({ type: 'format', format: 'BO5' })
  act({ type: 'setup', setup: { characterIds: ['sora', 'kazuya'], stage: { id: 'battlefield', name: 'Battlefield' } } })
  act({ type: 'start' }); act({ type: 'win', winner: 0 })
  act({ type: 'setup', setup: { characterIds: ['link', 'peach'], stage: { id: 'smashville', name: 'Smashville' } } })
  const match = resolveBracket(t).find(m => m.id === 'W1')
  const html = renderer(t)('src/components/tournament/VersusPresentation.tsx', 'VersusPresentation', { match })
  assert.equal((html.match(/class="vs-stage"/g) ?? []).length, 1)
  assert.match(html, /smashville.jpg/)
  assert.doesNotMatch(html, /battlefield.jpg/)
  assert.equal((html.match(/vs-victory is-won/g) ?? []).length, 1)
  assert.equal((html.match(/vs-victory is-pending/g) ?? []).length, 5)
  assert.match(html, /icons\/sora\/00.png/)
  assert.match(html, /renders\/link\/00.png/)
  assert.doesNotMatch(html, /<button|<input|<select/)
  assert.match(html, /Juego 2/)
})

test('VS safely renders missing players and image assets with placeholders', () => {
  const t = fixture()
  const match = resolveBracket(t).find(m => m.id === 'W5')
  const html = renderer(t)('src/components/tournament/VersusPresentation.tsx', 'VersusPresentation', { match })
  assert.equal((html.match(/vs-placeholder/g) ?? []).length, 2)
  assert.doesNotMatch(html, /class="vs-stage"|src="undefined"/)
  assert.match(html, /Escenario por definir/)
  assert.match(html, /imagen no disponible/)
})

test('every enabled match exposes VS and only ready matches can start', () => {
  const t = fixture()
  const html = renderer(t)('src/components/tournament/BracketBoard.tsx', 'BracketBoard', {
    tournament: t, onVS: () => {}, onStart: () => {},
  })
  assert.equal((html.match(/Abrir VS/g) ?? []).length, 14)
  assert.equal((html.match(/Marcar en curso/g) ?? []).length, 4)
})

test('VS page presentation is read-only and opening either mode does not change the tournament', () => {
  const t = fixture()
  const original = JSON.stringify(t)
  const render = renderer(t, '/tournament/match/W1/presentation')
  const html = render('src/pages/MatchVSPage.tsx', 'MatchVSPage', { matchId: 'W1', presentation: true })
  assert.doesNotMatch(html, /Registrar victoria|Confirmar resultado|Control del set|<input|<select/)
  assert.match(html, /Ocultar VS/)
  const shell = render('src/components/layout/AppShell.tsx', 'AppShell', { children: html })
  assert.doesNotMatch(shell, /Crear ruleset|Navegación principal|Ruleset explorer/)
  assert.equal(JSON.stringify(t), original)
})

test('administrative VS exposes searchable roster and manual stages without creating a result on mount', () => {
  const t = fixture()
  const html = renderer(t, '/tournament/match/W1')('src/pages/MatchVSPage.tsx', 'MatchVSPage', { matchId: 'W1' })
  assert.equal((html.match(/type="search"/g) ?? []).length, 2)
  assert.equal((html.match(/class="vs-character-option"/g) ?? []).length, 172)
  assert.match(html, /Escenario del juego/)
  assert.match(html, /Pool de escenarios/)
  assert.match(html, /Piranha Plant/)
  assert.match(html, /Marcar en curso/)
  assert.deepEqual(t.results, {})
})

test('VS icon buttons exist only in administrative editable views, and DQ stays read-only in presentation', () => {
  let t = fixture()
  let match = resolveBracket(t).find(m => m.id === 'W1')
  const admin = renderer(t)('src/components/tournament/VersusPresentation.tsx', 'VersusPresentation', { match, onVictoryIcon: () => {} })
  assert.equal((admin.match(/<button type="button" class="vs-victory is-pending"/g) ?? []).length, 4)
  assert.match(admin, /aria-label="Registrar una victoria para Alias 1"/)
  const projection = renderer(t)('src/components/tournament/VersusPresentation.tsx', 'VersusPresentation', { match })
  assert.doesNotMatch(projection, /<button/)
  t = proposeMatchAction(t, 'W1', { type: 'dq', loser: 0, reason: 'Ausente' }).tournament
  match = resolveBracket(t).find(m => m.id === 'W1')
  const dq = renderer(t)('src/components/tournament/VersusPresentation.tsx', 'VersusPresentation', { match, onVictoryIcon: () => {} })
  assert.match(dq, /L \/ DQ/); assert.match(dq, /Ganador por DQ/)
  assert.doesNotMatch(dq, /<button/)
  const page = renderer(t)('src/pages/MatchVSPage.tsx', 'MatchVSPage', { matchId: 'W1', presentation: true })
  assert.doesNotMatch(page, /Descalificar|Revertir DQ|Corregir resultado|Registrar una victoria/)
})

test('illuminated icon exposes a correction action and completed VS opens in consultation', () => {
  let t = proposeMatchAction(fixture(), 'W1', { type: 'win', winner: 0 }).tournament
  const match = resolveBracket(t).find(m => m.id === 'W1')
  const html = renderer(t)('src/components/tournament/VersusPresentation.tsx', 'VersusPresentation', { match, onVictoryIcon: () => {} })
  assert.match(html, /aria-label="Reducir victorias de Alias 1 a 0"/)
  t = proposeMatchAction(t, 'W1', { type: 'win', winner: 0 }).tournament
  const provisional = renderer(t)('src/pages/MatchVSPage.tsx', 'MatchVSPage', { matchId: 'W1' })
  assert.match(provisional, /Ganador provisional: Alias 1/)
  assert.match(provisional, /Confirmar ganador/)
  t = proposeMatchAction(t, 'W1', { type: 'confirm' }).tournament
  const completed = renderer(t)('src/pages/MatchVSPage.tsx', 'MatchVSPage', { matchId: 'W1' })
  assert.match(completed, /Corregir resultado/)
  assert.doesNotMatch(completed, /<button[^>]*class="vs-victory/)
})

test('all available round editors expose Abrir VS and DQ; history shows per-player details', () => {
  let t = fixture()
  for (const definition of MATCHES) {
    const html = renderer(t)('src/components/tournament/MatchEditor.tsx', 'MatchEditor', {
      tournament: t, matchId: definition.id, onSave: () => {}, onClose: () => {},
    })
    assert.match(html, /Abrir VS/)
    assert.match(html, /DQ \/ Descalificar/)
    t = proposeResult(t, definition.id, { format: 'BO3', scores: definition.id === 'GF' ? [0, 2] : [2, 0], confirmed: true }).tournament
  }
  let h = proposeMatchAction(fixture(), 'W1', { type: 'setup', setup: { characterIds: ['sonic', 'zero-suit-samus'], stage: { id: 'hollow-bastion', name: 'Hollow Bastion' } } }).tournament
  h = proposeMatchAction(h, 'W1', { type: 'win', winner: 1 }).tournament
  h = proposeMatchAction(h, 'W1', { type: 'icon', slot: 1, index: 0 }).tournament
  const history = renderer(h)('src/components/tournament/MatchHistory.tsx', 'MatchHistory', { match: resolveBracket(h)[0] })
  assert.match(history, /Alias 1 — Sonic/)
  assert.match(history, /Alias 2 — Zero Suit Samus/)
  assert.match(history, /Hollow Bastion/)
  assert.match(history, /Victoria retirada/)
  assert.match(history, /Estado: En curso/)
})

test('active-match menu lists concurrent matches and DQ cards identify winner and loser explicitly', () => {
  let t = proposeMatchAction(fixture(), 'W1', { type: 'win', winner: 0 }).tournament
  t = proposeMatchAction(t, 'W2', { type: 'start' }).tournament
  const html = renderer(t)('src/components/tournament/ActiveMatchLink.tsx', 'ActiveMatchLink', { tournament: t })
  assert.match(html, /2 encuentros/)
  assert.match(html, /W1 · Alias 1 vs Alias 2/)
  assert.match(html, /W2 · Alias 3 vs Alias 4/)
  t = proposeMatchAction(t, 'W1', { type: 'dq', loser: 0 }).tournament
  const card = renderer(t)('src/components/tournament/MatchCard.tsx', 'MatchCard', { match: resolveBracket(t)[0] })
  assert.match(card, /Finalizado por DQ/)
  assert.match(card, /L\/DQ/)
  assert.match(card, /aria-label="Ganador"/)
  assert.match(card, /Victorias reales antes del DQ/)
})
