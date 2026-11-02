import test from 'node:test'
import assert from 'node:assert/strict'
import { emptyRegistration, importNames, previewNames, editRegistered, removeRegistered, loadRegistration, saveRegistration, REGISTRATION_KEY, registrationTop8, validateRegistration } from '../src/utils/registration.ts'
import { parseCSV, namesFromRows, readRegistrationFile, exportText, exportXlsx, inspectXlsx } from '../src/utils/registrationFiles.ts'
import { parseTournament, exportTournament } from '../src/utils/tournamentValidation.ts'
import { createTournament } from '../src/utils/doubleElimination.ts'

const fixture = (count = 8) => importNames(emptyRegistration(), Array.from({ length: count }, (_, i) => `Player ${i + 1}`), 'add')
const file = (name, value) => { const blob = value instanceof Blob ? value : new Blob([value]); return { name, size: blob.size, arrayBuffer: () => blob.arrayBuffer() } }
test('individual registration, stable IDs, editing, Unicode and deletion', () => {
  let r = importNames(emptyRegistration(), ['  Árïk 🦊  '], 'add')
  const id = r.participants[0].id
  assert.equal(r.participants[0].nickname, 'Árïk 🦊')
  r = editRegistered(r, id, 'New 名')
  assert.equal(r.participants[0].id, id)
  assert.equal(r.participants[0].nickname, 'New 名')
  assert.equal(removeRegistered(r, [id]).participants.length, 0)
  assert.throws(() => editRegistered(r, 'missing', 'Name'))
  assert.throws(() => editRegistered(r, id, ''))
})
test('preview is pure and detects intra-file/existing case/space duplicates without altering visible text', () => {
  const r = importNames(emptyRegistration(), ['Team  Arik'], 'add'), before = structuredClone(r)
  const p = previewNames([' team arik ', '新 人', '新   人', ''], r)
  assert.equal(p.newCount, 1); assert.equal(p.duplicateCount, 2)
  assert.deepEqual(r, before)
  assert.equal(importNames(r, ['Nuevo  Alias'], 'add').participants[1].nickname, 'Nuevo  Alias')
})
test('add and explicit replacement retain known IDs and reject invalid or duplicate edits', () => {
  const r = fixture(), names = [r.participants[0].nickname, 'New']
  assert.equal(importNames(r, names, 'add').participants.length, 9)
  const replaced = importNames(r, names, 'replace')
  assert.equal(replaced.participants.length, 2)
  assert.equal(replaced.participants[0].id, r.participants[0].id)
  assert.throws(() => editRegistered(r, r.participants[0].id, r.participants[1].nickname))
  assert.throws(() => previewNames(['bad\u0000name'], r))
  assert.throws(() => previewNames(['  '], r))
  assert.throws(() => validateRegistration({ schemaVersion: 2, participants: [] }))
})
test('local persistence is independent, supports 8/32/64/128/1024 players and detects invalid saved data', () => {
  const map = new Map([['stage-strike.top8.v1', 'old tournament']])
  const storage = { getItem: k => map.get(k) ?? null, setItem: (k, v) => map.set(k, v) }
  assert.deepEqual(loadRegistration(storage), emptyRegistration())
  for (const count of [8, 32, 64, 128, 1024]) { const r = fixture(count); saveRegistration(storage, r); assert.deepEqual(loadRegistration(storage), r) }
  assert.equal(map.get('stage-strike.top8.v1'), 'old tournament')
  storage.setItem(REGISTRATION_KEY, 'broken'); assert.throws(() => loadRegistration(storage)); assert.equal(map.get(REGISTRATION_KEY), 'broken')
})
test('TXT UTF-8 and CSV quoted fields, escaped quotes, Excel delimiters and headers', async () => {
  assert.deepEqual(await readRegistrationFile(file('a.txt', 'Árik\r\n\r\n名\n')), ['Árik', '名'])
  for (const delimiter of [',', ';', '\t']) {
    const text = `\uFEFFNickname${delimiter}Other\r\n"A, B"${delimiter}x\r\n"A ""B"""${delimiter}y`
    assert.deepEqual(namesFromRows(parseCSV(text)), ['A, B', 'A "B"'])
  }
  assert.deepEqual(namesFromRows(parseCSV('sep=;\r\nNickname;Other\nÁrik;x')), ['Árik'])
  assert.deepEqual(namesFromRows(parseCSV('Sharik\nF9')), ['Sharik', 'F9'])
  assert.throws(() => parseCSV('"broken'))
  assert.throws(() => namesFromRows(parseCSV('a,b\nx,y')))
  assert.throws(() => namesFromRows([['Nickname', 'Nickname']]))
  assert.throws(() => previewNames(namesFromRows(parseCSV('Nickname\n"line\nbreak"')), emptyRegistration()))
})
test('invalid, empty, oversized and non-UTF8 imports fail comprehensibly', async () => {
  await assert.rejects(readRegistrationFile(file('empty.csv', '')))
  await assert.rejects(readRegistrationFile(file('a.exe', 'abc')))
  await assert.rejects(readRegistrationFile({ name: 'a.xlsx', size: 6000000, arrayBuffer: async () => { throw new Error('Must not read') } }), /5 MB/)
  await assert.rejects(readRegistrationFile(file('a.txt', new Uint8Array([255, 255]))), /UTF-8/)
  await assert.rejects(readRegistrationFile(file('broken.xlsx', 'invalid')), /XLSX/)
  assert.throws(() => namesFromRows([[''], []]), /vacío/)
})
test('TXT preserves names; CSV quotes Unicode and neutralizes formula prefixes', () => {
  const names = ['Árïk', '=1+1', '+cmd', '-test', '@name', 'A,"B"']
  assert.equal(exportText(names, 'txt'), names.join('\r\n'))
  const parsed = namesFromRows(parseCSV(exportText(names, 'csv')))
  assert.deepEqual(parsed, ['Árïk', "'=1+1", "'+cmd", "'-test", "'@name", 'A,"B"'])
})
test('XLSX export round-trip preserves literal formula-like names and template sheet', async () => {
  const names = ['Árik 🦊', '=1+1', '0012', '名']
  const blob = await exportXlsx(names)
  assert.deepEqual(await readRegistrationFile(file('a.xlsx', blob)), names)
  const { default: ExcelJS } = await import('exceljs')
  const wb = new ExcelJS.Workbook(); await wb.xlsx.load(await (await exportXlsx([], true)).arrayBuffer())
  assert.equal(wb.worksheets[0].name, 'Participantes')
  assert.equal(wb.worksheets[0].getCell('A1').value, 'Nickname')
  assert.equal(wb.worksheets[0].getCell('A33').numFmt, '@')
})
test('XLSX formulas, unexpected objects/multiple sheets and inflated ZIP are rejected', async () => {
  const { default: ExcelJS } = await import('exceljs')
  const wb = new ExcelJS.Workbook(), sheet = wb.addWorksheet('Players')
  sheet.addRow(['Nickname']); sheet.addRow([{ formula: '1+1', result: 2 }])
  await assert.rejects(readRegistrationFile(file('formula.xlsx', await wb.xlsx.writeBuffer())), /fórmulas/)
  sheet.getCell('A2').value = { hyperlink: 'https://example.com', text: 'Link' }
  await assert.rejects(readRegistrationFile(file('link.xlsx', await wb.xlsx.writeBuffer())), /texto/)
  sheet.getCell('A2').value = 'Arik'; wb.addWorksheet('Other')
  await assert.rejects(readRegistrationFile(file('sheets.xlsx', await wb.xlsx.writeBuffer())), /sola hoja/)
  const data = await (await exportXlsx(['A'])).arrayBuffer(), view = new DataView(data)
  for (let i = 0; i < data.byteLength - 46; i++) if (view.getUint32(i, true) === 0x02014b50) { view.setUint32(i + 24, 30 * 1024 * 1024, true); break }
  assert.throws(() => inspectXlsx(data), /25 MB/)
})
test('Top8 selection is explicit, preserves IDs and existing tournaments and does not trim larger registry', () => {
  const r = fixture(128), before = structuredClone(r), old = createTournament(), oldJSON = exportTournament(old)
  const selected = r.participants.slice(8, 16).map(p => p.id), draft = registrationTop8(r, selected)
  assert.deepEqual(draft.participants.map(p => p.id), selected)
  assert.deepEqual(parseTournament(exportTournament(draft)), draft)
  assert.deepEqual(r, before); assert.equal(exportTournament(old), oldJSON)
  assert.throws(() => registrationTop8(r, selected.slice(1)))
  assert.throws(() => registrationTop8(r, Array(8).fill(selected[0])))
  assert.throws(() => registrationTop8(r, ['missing', ...selected.slice(1)]))
  const changed = editRegistered(r, selected[0], 'New Alias')
  assert.notEqual(changed.participants[8].nickname, draft.participants[0].nickname)
  assert.equal(changed.participants[8].id, draft.participants[0].id)
})
