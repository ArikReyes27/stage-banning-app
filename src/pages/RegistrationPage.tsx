import { useMemo, useRef, useState } from 'react'
import { navigateTo } from '../app/navigation'
import { useRegistration } from '../hooks/useRegistration'
import { useWorkspace } from '../hooks/workspaceContext'
import { editRegistered, importNames, nicknameKey, previewNames, removeRegistered } from '../utils/registration'
import { downloadRegistration, exportText, exportXlsx, readRegistrationFile } from '../utils/registrationFiles'
import '../styles/tournament.css'
import '../styles/registration.css'

export function RegistrationPage() {
  const workspace = useWorkspace()
  const { registration, error, save } = useRegistration()
  const [nickname, setNickname] = useState(''), [paste, setPaste] = useState(''), [query, setQuery] = useState('')
  const [names, setNames] = useState<string[] | null>(null), [mode, setMode] = useState<'add' | 'replace'>('add')
  const [selected, setSelected] = useState<string[]>([]), [page, setPage] = useState(0), [previewPage, setPreviewPage] = useState(0)
  const [editing, setEditing] = useState<string>(), [editName, setEditName] = useState('')
  const [notice, setNotice] = useState(''), [busy, setBusy] = useState(false)
  const file = useRef<HTMLInputElement>(null)
  const run = (action: () => void) => { try { action() } catch (e) { setNotice(e instanceof Error ? e.message : 'No se pudo completar la operación.') } }
  const asyncRun = async (action: () => Promise<void>) => {
    setBusy(true); setNotice('')
    try { await action() } catch (e) { setNotice(e instanceof Error ? e.message : 'No se pudo leer o generar el archivo.') }
    finally { setBusy(false) }
  }
  const preview = useMemo(() => names ? previewNames(names, registration) : null, [names, registration])
  const filtered = useMemo(() => registration.participants.filter(p => nicknameKey(p.nickname).includes(nicknameKey(query))), [registration, query])
  const currentPage = Math.min(page, Math.max(0, Math.ceil(filtered.length / 25) - 1))
  const visible = filtered.slice(currentPage * 25, (currentPage + 1) * 25)
  const selection = useMemo(() => {
    const ids = new Set(registration.participants.map(p => p.id))
    return selected.filter(id => ids.has(id))
  }, [selected, registration])
  const review = (values: string[]) => { previewNames(values, registration); setNames(values); setMode('add'); setPreviewPage(0) }
  const remove = (ids: string[]) => run(() => {
    if (!window.confirm(`¿Eliminar ${ids.length} participante(s) del registro? Los torneos existentes no cambiarán.`)) return
    save(removeRegistered(registration, ids)); setSelected(selected.filter(id => !ids.includes(id))); setNotice('Participantes eliminados del registro.')
  })
  return <main className="registration-page mx-auto max-w-6xl px-4 py-8 sm:px-6">
    <header className="mb-6"><p className="text-xs font-bold tracking-widest text-cyan-300">STAGE//STRIKE</p><h1 className="mt-2 text-3xl font-black sm:text-4xl">Registro de participantes</h1><p className="mt-2 text-slate-400">{workspace ? `Lista exclusiva de ${workspace.name}. Preparar el bracket copia los participantes elegidos; editar esta lista no cambia un bracket ya creado.` : 'Prepara tu lista. Los torneos se gestionan por separado.'}</p></header>
    {error && <p role="alert">{error}</p>}
    {notice && <p className="registration-notice" role="status">{notice}</p>}
    {busy && <p role="status">Procesando archivo…</p>}
    <fieldset disabled={busy || !!error} className="min-w-0 space-y-5">
      <section className="glass-panel rounded-3xl p-5">
        <h2 className="text-xl font-bold">Agregar participante</h2>
        <form className="mt-3 flex flex-wrap gap-3" onSubmit={e => { e.preventDefault(); run(() => {
          const p = previewNames([nickname], registration)
          if (!p.newCount) throw new Error('Ese nickname ya está registrado.')
          save(importNames(registration, [nickname], 'add')); setNickname(''); setNotice('Participante agregado.')
        }) }}>
          <label className="min-w-0 flex-1">Nickname<input className="form-control mt-1" required maxLength={128} value={nickname} onChange={e => setNickname(e.target.value)} autoComplete="off" /></label>
          <button className="bracket-button primary self-end" type="submit">Agregar</button>
        </form>
      </section>
      <section className="glass-panel rounded-3xl p-5">
        <details><summary className="cursor-pointer text-xl font-bold">Pegar lista</summary>
          <label className="mt-3 block">Un nickname por línea<textarea className="form-control mt-2" rows={6} value={paste} onChange={e => setPaste(e.target.value)} /></label>
          <button className="bracket-button primary mt-3" onClick={() => run(() => review(paste.split(/\r\n|\n|\r/)))}>Revisar lista</button>
        </details>
        <div className="mt-4 flex flex-wrap gap-3">
          <button className="bracket-button" onClick={() => file.current?.click()}>Importar archivo</button>
          <button className="bracket-button" onClick={() => void asyncRun(async () => downloadRegistration(await exportXlsx([], true), 'plantilla-participantes.xlsx'))}>Descargar plantilla</button>
          <input ref={file} type="file" className="sr-only" tabIndex={-1} aria-label="Importar participantes" accept=".xlsx,.csv,.txt" onChange={e => {
            const chosen = e.target.files?.[0]; e.target.value = ''
            if (chosen) { setNames(null); void asyncRun(async () => review(await readRegistrationFile(chosen))) }
          }} />
        </div><p className="mt-3 text-sm text-slate-400">Excel, CSV UTF-8 o TXT · hasta 5 MB · una hoja, columna Nickname o lista sin encabezado.</p>
      </section>
      {preview && <section className="glass-panel rounded-3xl p-5" aria-label="Vista previa de importación">
        <h2 className="text-xl font-bold">Revisar antes de guardar</h2>
        <p className="my-3">{preview.rows.length} detectados · {preview.newCount} nuevos · {preview.duplicateCount} repetidos</p>
        <ul className="registration-preview">{preview.rows.slice(previewPage * 25, (previewPage + 1) * 25).map((r, i) => <li key={i}>{r.nickname} <span className="text-slate-400">{r.repeated ? 'Repetido en lista' : r.registered ? 'Ya registrado' : 'Nuevo'}</span></li>)}</ul>
        <div className="my-3 flex gap-2"><button className="bracket-button" disabled={!previewPage} onClick={() => setPreviewPage(previewPage - 1)}>Anterior</button><button className="bracket-button" disabled={(previewPage + 1) * 25 >= preview.rows.length} onClick={() => setPreviewPage(previewPage + 1)}>Siguiente</button></div>
        <label className="block">Cómo importar<select className="form-control mt-2" value={mode} onChange={e => setMode(e.target.value as 'add' | 'replace')}><option value="add">Agregar solamente participantes nuevos</option><option value="replace">Reemplazar el registro completo</option></select></label>
        <p className="my-3 text-sm text-slate-400">{mode === 'replace' ? `El registro quedará con ${preview.rows.filter(r => !r.repeated).length} participantes únicos. Se retirarán los demás del registro. Los torneos no cambiarán.` : 'Los participantes existentes se conservarán.'}</p>
        <div className="flex flex-wrap gap-3"><button className="bracket-button primary" onClick={() => run(() => {
          if (mode === 'replace' && !window.confirm('¿Reemplazar TODO el registro con esta lista? Los participantes ausentes se retirarán del registro. Los torneos existentes no se modificarán.')) return
          save(importNames(registration, names!, mode)); setNames(null); setSelected([]); setNotice('Lista guardada.'); setPage(0)
        })}>Confirmar importación</button><button className="bracket-button" onClick={() => setNames(null)}>Cancelar</button></div>
      </section>}
      <section className="glass-panel registration-roster rounded-3xl p-5">
        <div className="registration-toolbar" role="region" aria-label="Acciones de participantes">
        <div className="flex flex-wrap items-center justify-between gap-2"><h2 className="text-xl font-bold">Participantes · {registration.participants.length}</h2><span role="status" className="text-sm font-bold text-cyan-200">{selection.length} seleccionados</span></div>
        <div className="mt-3 flex flex-wrap gap-2">
          <button className="bracket-button" disabled={!visible.length} onClick={() => setSelected([...new Set([...selection, ...visible.map(p => p.id)])])}>Seleccionar página</button>
          <button className="bracket-button" disabled={!registration.participants.length} onClick={() => setSelected(registration.participants.map(p => p.id))}>Seleccionar todos</button>
          <button className="bracket-button" disabled={!selection.length} onClick={() => setSelected([])}>Limpiar selección</button>
        </div>
        <p className="mt-2 text-xs text-slate-400">Página: {visible.length} visibles · Todos: {registration.participants.length} registrados, incluso fuera de la búsqueda.</p>
        </div>
        <label className="mt-4 block">Buscar nickname<input className="form-control mt-1" value={query} onChange={e => { setQuery(e.target.value); setPage(0) }} /></label>
        {!filtered.length && <p className="py-6 text-slate-400">{registration.participants.length ? 'No hay coincidencias.' : 'Aún no hay participantes. Agrega un nickname o importa una lista.'}</p>}
        <ol className="registration-list">{visible.map((p, index) => <li key={p.id}>
          <input type="checkbox" aria-label={`Seleccionar ${p.nickname}`} checked={selection.includes(p.id)} onChange={e => setSelected(e.target.checked ? [...selection, p.id] : selection.filter(id => id !== p.id))} />
          <span className="text-slate-500">{currentPage * 25 + index + 1}.</span>
          {editing === p.id ? <form className="flex min-w-0 flex-1 flex-wrap gap-2" onSubmit={e => { e.preventDefault(); run(() => { save(editRegistered(registration, p.id, editName)); setEditing(undefined); setNotice('Nickname actualizado. Los torneos conservan su copia anterior.') }) }}><input aria-label="Editar nickname" className="form-control min-w-0 flex-1" required maxLength={128} value={editName} onChange={e => setEditName(e.target.value)} /><button className="bracket-button primary">Guardar</button><button type="button" className="bracket-button" onClick={() => setEditing(undefined)}>Cancelar</button></form> : <><span className="min-w-0 flex-1 break-words font-bold">{p.nickname}</span><button className="bracket-button" aria-label={`Editar ${p.nickname}`} onClick={() => { setEditing(p.id); setEditName(p.nickname) }}>Editar</button><button className="bracket-button danger" aria-label={`Eliminar ${p.nickname}`} onClick={() => remove([p.id])}>Eliminar</button></>}
        </li>)}</ol>
        <div className="mt-4 flex flex-wrap items-center gap-3"><button className="bracket-button" disabled={!currentPage} onClick={() => setPage(currentPage - 1)}>Anterior</button><span>Página {currentPage + 1} de {Math.max(1, Math.ceil(filtered.length / 25))}</span><button className="bracket-button" disabled={(currentPage + 1) * 25 >= filtered.length} onClick={() => setPage(currentPage + 1)}>Siguiente</button></div>
        <div className="mt-5 border-t border-rose-300/15 pt-4"><button className="bracket-button danger" disabled={!selection.length} onClick={() => remove(selection)}>Eliminar seleccionados</button><p className="mt-2 text-xs text-slate-400">Requiere confirmación. Los torneos existentes se conservan.</p></div>
      </section>
      <section className="glass-panel rounded-3xl p-5"><h2 className="text-xl font-bold">Exportar registro</h2><div className="mt-3 flex flex-wrap gap-3">{(['xlsx', 'csv', 'txt'] as const).map(format => <button key={format} className="bracket-button" onClick={() => void asyncRun(async () => {
        const values = registration.participants.map(p => p.nickname)
        downloadRegistration(format === 'xlsx' ? await exportXlsx(values) : new Blob([exportText(values, format)], { type: 'text/plain;charset=utf-8' }), `participantes.${format}`)
      })}>{format.toUpperCase()}</button>)}</div><p className="mt-3 text-sm text-slate-400">Descarga una copia de los nicknames. Excel y TXT conservan el texto exacto; CSV protege los prefijos de fórmula con un apóstrofo.</p></section>
      <section className="glass-panel rounded-3xl p-5"><h2 className="text-xl font-bold">Preparar torneo</h2><p className="my-3 text-slate-400">En Bracket puedes seleccionar dos o más participantes del registro, asignar seeds y revisar los cruces. La lista completa se conserva.</p>
        <button className="bracket-button primary" onClick={() => navigateTo('/tournament')}>Ir al bracket</button>
        <p className="mt-3 text-sm text-slate-400">Los personajes se eligen dentro de cada encuentro. Crear un torneo requiere confirmación y no modifica el registro.</p>
      </section>
    </fieldset>
  </main>
}
