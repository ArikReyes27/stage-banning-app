export const MAX_IMPORT_BYTES = 5 * 1024 * 1024
export function parseCSV(text: string): string[][] {
  text = text.replace(/^\uFEFF/, '')
  const sep = text.match(/^sep=([;,\t])\r?\n/i)
  if (sep) text = text.slice(sep[0].length)
  text = text.replace(/^(?:[ \t]*\r?\n)+/, '')
  // Count delimiters outside quotes in the first record.
  const counts: Record<string, number> = { ',': 0, ';': 0, '\t': 0 }
  let quoted = false
  for (let i = 0; i < text.length; i++) {
    const c = text[i]
    if (c === '"') { if (quoted && text[i + 1] === '"') i++; else quoted = !quoted }
    else if (!quoted && (c === '\n' || c === '\r')) break
    else if (!quoted && c in counts) counts[c]++
  }
  const delimiter = sep?.[1] ?? Object.keys(counts).sort((a, b) => counts[b] - counts[a])[0]
  const rows: string[][] = []; let row: string[] = [], field = '', inQuote = false, closed = false
  const cell = () => { row.push(field); field = ''; closed = false }
  for (let i = 0; i < text.length; i++) {
    const c = text[i]
    if (inQuote) {
      if (c === '"') { if (text[i + 1] === '"') { field += '"'; i++ } else { inQuote = false; closed = true } }
      else field += c
    } else if (c === delimiter) cell()
    else if (c === '\r' || c === '\n') { cell(); rows.push(row); row = []; if (c === '\r' && text[i + 1] === '\n') i++ }
    else if (c === '"' && field === '' && !closed) inQuote = true
    else { if (closed || c === '"') throw new Error('CSV inválido: revisa las comillas.'); field += c }
  }
  if (inQuote) throw new Error('CSV inválido: falta cerrar un campo entrecomillado.')
  cell(); rows.push(row)
  return rows
}
export function namesFromRows(input: unknown[][]): string[] {
  const rows = input.filter(row => row.some(v => v !== null && v !== undefined && String(v).trim() !== ''))
  if (!rows.length) throw new Error('El archivo está vacío.')
  const headers = rows[0].flatMap((v, i) => typeof v === 'string' && v.trim().toLowerCase() === 'nickname' ? [i] : [])
  if (headers.length > 1) throw new Error('Hay más de una columna Nickname.')
  const column = headers[0] ?? 0
  if (!headers.length && rows.some(row => row.slice(1).some(v => v != null && String(v).trim()))) throw new Error('Utiliza una sola columna o un encabezado Nickname.')
  return (headers.length ? rows.slice(1) : rows).map(row => {
    const value = row[column]
    if (value == null || value === '') return ''
    if (typeof value !== 'string' && typeof value !== 'number') throw new Error('La columna Nickname debe contener texto, sin fórmulas ni objetos.')
    return String(value)
  }).filter(n => n.trim())
}
// Inspect ZIP central directory before decompression; reject oversized/active packages.
export function inspectXlsx(data: ArrayBuffer) {
  const view = new DataView(data), bytes = new Uint8Array(data)
  let end = -1
  for (let i = bytes.length - 22; i >= Math.max(0, bytes.length - 65557); i--) if (view.getUint32(i, true) === 0x06054b50) { end = i; break }
  if (end < 0) throw new Error('El archivo no es un XLSX válido.')
  const count = view.getUint16(end + 10, true)
  let offset = view.getUint32(end + 16, true), total = 0
  if (count > 2000 || view.getUint16(end + 4, true) !== 0) throw new Error('El libro es demasiado complejo.')
  for (let i = 0; i < count; i++) {
    if (offset + 46 > bytes.length || view.getUint32(offset, true) !== 0x02014b50) throw new Error('XLSX dañado.')
    total += view.getUint32(offset + 24, true)
    if (total > 25 * 1024 * 1024) throw new Error('El libro supera 25 MB descomprimido. Utiliza una hoja sencilla.')
    const length = view.getUint16(offset + 28, true)
    const name = new TextDecoder().decode(bytes.slice(offset + 46, offset + 46 + length))
    if (/vbaProject|externalLinks|embeddings|activeX/i.test(name) || view.getUint16(offset + 8, true) & 1) throw new Error('No se admiten libros cifrados, macros ni contenido activo o vinculado.')
    offset += 46 + length + view.getUint16(offset + 30, true) + view.getUint16(offset + 32, true)
  }
}
export async function readRegistrationFile(file: { name: string; size: number; arrayBuffer(): Promise<ArrayBuffer> }): Promise<string[]> {
  if (!file.size || file.size > MAX_IMPORT_BYTES) throw new Error('Selecciona un archivo no vacío de hasta 5 MB.')
  const ext = file.name.split('.').pop()?.toLowerCase()
  if (!['xlsx', 'csv', 'txt'].includes(ext ?? '')) throw new Error('Utiliza un archivo XLSX, CSV o TXT.')
  const data = await file.arrayBuffer()
  if (ext !== 'xlsx') {
    let text: string
    try { text = new TextDecoder('utf-8', { fatal: true }).decode(data) } catch { throw new Error('Guarda el archivo de texto como UTF-8.') }
    return ext === 'csv' ? namesFromRows(parseCSV(text)) : text.replace(/^\uFEFF/, '').split(/\r\n|\n|\r/).filter(n => n.trim())
  }
  inspectXlsx(data)
  const { default: ExcelJS } = await import('exceljs')
  const workbook = new ExcelJS.Workbook()
  try { await workbook.xlsx.load(data) } catch { throw new Error('No se pudo leer el libro. Comprueba que sea un XLSX sin contraseña.') }
  if (workbook.worksheets.length !== 1) throw new Error('Utiliza un libro con una sola hoja de participantes.')
  const rows: unknown[][] = []
  workbook.worksheets[0].eachRow(row => {
    const values: unknown[] = []
    row.eachCell((cell, column) => {
      if (cell.type === ExcelJS.ValueType.Formula) throw new Error('No se admiten fórmulas. Pega los nicknames como valores de texto.')
      values[column - 1] = cell.value
    })
    rows.push(values)
  })
  return namesFromRows(rows)
}
export function exportText(names: string[], format: 'csv' | 'txt') {
  if (format === 'txt') return names.join('\r\n')
  const safe = (s: string) => /^[\s]*[=+\-@]/u.test(s) ? `'${s}` : s
  return '\uFEFF' + ['Nickname', ...names.map(safe)].map(s => `"${s.replace(/"/g, '""')}"`).join('\r\n')
}
export async function exportXlsx(names: string[], template = false): Promise<Blob> {
  const { default: ExcelJS } = await import('exceljs')
  const workbook = new ExcelJS.Workbook(), sheet = workbook.addWorksheet('Participantes')
  sheet.getColumn(1).width = 32
  sheet.addRow(['Nickname'])
  for (const name of names) sheet.addRow([name]) // String values, never formula objects.
  if (template) for (let i = 2; i <= 33; i++) { sheet.getCell(`A${i}`).numFmt = '@' }
  const buffer = await workbook.xlsx.writeBuffer()
  return new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
}
export function downloadRegistration(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob), link = document.createElement('a')
  link.href = url; link.download = filename; link.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
