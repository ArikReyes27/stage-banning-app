import { useId } from 'react'
import type { tournamentStandings } from '../../utils/tournamentStandings'
import { getCharacter } from '../../data/characters'
import { characterAssets } from '../../data/characterAssets'

type Props = { standings: ReturnType<typeof tournamentStandings> }
function nicknameLines(text: string, podium: boolean) {
  const chars = Array.from(text), lines = Math.min(4, Math.max(1, Math.ceil(chars.length / (podium ? 24 : 18))))
  const length = Math.ceil(chars.length / lines)
  const font = Math.min(podium ? 32 : 23, 58 / lines, (podium ? 430 : 234) / Math.max(1, length))
  return { font, lines: Array.from({ length: lines }, (_, i) => chars.slice(i * length, (i + 1) * length).join('')) }
}

// One SVG is both the on-screen design and the source of the PNG export.
export function TopEightPoster({ standings }: Props) {
  const uid = useId().replaceAll(':', ''), rows = standings.top
  const height = rows.length > 8 ? 1140 + Math.ceil((rows.length - 8) / 5) * 360 : 1140
  return <svg className="top-eight-poster" xmlns="http://www.w3.org/2000/svg" viewBox={`0 0 1600 ${height}`} role="img" aria-labelledby={`${uid}-title ${uid}-desc`}>
    <title id={`${uid}-title`}>STAGE//STRIKE · Top 8 {standings.final ? 'final' : 'provisional'}</title>
    <desc id={`${uid}-desc`}>{rows.length ? rows.map(r => `${r.position ? `Puesto ${r.position}` : 'En juego'}: ${r.nickname}. ${r.characters.map(c => getCharacter(c.id)?.name).join(', ') || 'Sin historial de personajes'}`).join('; ') : `Top 8 por definir. ${standings.alive} participantes en juego.`}</desc>
    <defs>
      <linearGradient id={`${uid}-bg`} x2="1" y2="1"><stop stopColor="#071b2c"/><stop offset=".6" stopColor="#101024"/><stop offset="1" stopColor="#211238"/></linearGradient>
      <linearGradient id={`${uid}-card`} x2="1" y2="1"><stop stopColor="#172d43"/><stop offset="1" stopColor="#101224"/></linearGradient>
      <linearGradient id={`${uid}-gold`} x2="1" y2="1"><stop stopColor="#413421"/><stop offset="1" stopColor="#171827"/></linearGradient>
    </defs>
    <rect width="1600" height={height} rx="28" fill={`url(#${uid}-bg)`}/>
    <path d="M64 68l16-9 16 9-16 9-16-9Zm0 10 16 9 16-9M64 88l16 9 16-9" fill="none" stroke="#67e8f9" strokeWidth="2"/>
    <g fontFamily="Inter, Segoe UI, Arial, sans-serif">
      <text x="112" y="88" fill="#e2e8f0" fontSize="26" fontWeight="800" letterSpacing="3">STAGE//STRIKE</text>
      <text x="64" y="190" fill="#f8fafc" fontSize="90" fontWeight="900" letterSpacing="-4">TOP <tspan fill="#67e8f9">8</tspan></text>
      <text x="1536" y="100" textAnchor="end" fill={standings.final ? '#a7f3d0' : '#c4b5fd'} fontSize="24" fontWeight="700">{standings.final ? 'CLASIFICACIÓN FINAL' : 'CLASIFICACIÓN PROVISIONAL'}</text>
      <text x="1536" y="150" textAnchor="end" fill="#b8c6dc" fontSize="23">Super Smash Bros. Ultimate</text>
      <text x="64" y="235" fill="#b8c6dc" fontSize="22">{standings.final ? 'El torneo terminó. Estos son sus protagonistas.' : rows.length ? 'Posiciones confirmadas y jugadores aún en competencia.' : 'El Top 8 se mostrará cuando queden ocho participantes en juego.'}</text>
      {!rows.length && <g><rect x="64" y="300" width="1472" height="620" rx="24" fill="#101a2d" stroke="#334155"/><text x="800" y="580" textAnchor="middle" fill="#c4b5fd" fontSize="48" fontWeight="700">Top 8 por definir</text><text x="800" y="645" textAnchor="middle" fill="#b8c6dc" fontSize="28">{standings.started ? `${standings.alive} participantes siguen en juego` : 'El torneo todavía no ha comenzado'}</text></g>}
      {rows.map((row, i) => {
        const podium = i < 3, width = podium ? 474 : 278, cardHeight = podium ? 430 : 340
        const podiumIndex = row.position === 1 ? 1 : row.position === 2 ? 0 : i
        const medal = row.position && row.position <= 3 ? ['', '#fcd34d', '#cbd5e1', '#d6996a'][row.position] : undefined
        const x = podium ? 64 + podiumIndex * 499 : 64 + ((i - 3) % 5) * 298
        const y = podium ? (row.position === 1 ? 275 : 300) : 750 + Math.floor((i - 3) / 5) * 360
        const main = getCharacter(row.characters[0]?.id ?? ''), render = main ? characterAssets[main.id]?.render : undefined
        const nickname = nicknameLines(row.nickname, podium)
        return <g key={row.id} transform={`translate(${x} ${y})`}>
          <title>{row.nickname}{row.position ? ` · Puesto ${row.position}` : ' · En juego'}</title>
          <defs><clipPath id={`${uid}-clip-${i}`}><rect width={width} height={cardHeight} rx="22"/></clipPath></defs>
          <rect width={width} height={cardHeight} rx="22" fill={`url(#${uid}-${row.position === 1 ? 'gold' : 'card'})`} stroke={medal ?? '#435575'} strokeWidth={medal ? 3 : 2}/>
          {medal && <rect x="-5" y="-5" width={width + 10} height={cardHeight + 10} rx="27" fill="none" stroke={medal} strokeWidth="9" opacity=".1"/>}
          <g clipPath={`url(#${uid}-clip-${i})`}>
            {render ? <image href={render} x={podium ? 110 : 48} y={podium ? 12 : 8} width={podium ? 350 : 228} height={podium ? 305 : 244} preserveAspectRatio="xMidYMid meet" onError={e => { e.currentTarget.style.display = 'none' }}/> : <text x={width / 2} y={podium ? 190 : 155} fill="#64748b" textAnchor="middle" fontSize="90">?</text>}
            <rect y={cardHeight - (podium ? 165 : 155)} width={width} height={podium ? 165 : 155} fill="#091120"/>
          </g>
          <text x="24" y={podium ? 92 : 74} fill={medal ?? '#67e8f9'} fontSize={row.position === 1 ? 82 : podium ? 74 : 56} fontWeight="900">{row.position ? `#${row.position}` : '—'}</text>
          {!row.position && <text x="24" y={podium ? 115 : 94} fill="#c4b5fd" fontSize="16">EN JUEGO</text>}
          {medal && <g fill={medal} aria-label={row.position === 1 ? 'Campeón' : row.position === 2 ? 'Subcampeón' : 'Tercer lugar'}>
            {row.position === 1 ? <path d="M22 130l8 25h40l8-25-16 10-12-22-12 22Z M30 162h40" stroke={medal} strokeWidth="3"/> : <g><path d="M30 125h15l5 20-12 10Z M50 125h15l-3 30-12-10Z" opacity=".7"/><circle cx="47" cy="157" r="17"/><text x="47" y="164" textAnchor="middle" fill="#101224" fontSize="20" fontWeight="900">{row.position}</text></g>}
            <rect x="14" y="211" width="201" height="33" rx="8" fill="#091120" opacity=".92"/><text x="22" y="234" fontSize="18" fontWeight="800" letterSpacing="1">{row.position === 1 ? 'CAMPEÓN' : row.position === 2 ? 'SUBCAMPEÓN' : 'TERCER LUGAR'}</text>
          </g>}
          <text fill="#f8fafc" fontWeight="800" fontSize={nickname.font}>{nickname.lines.map((line, lineIndex) => <tspan key={lineIndex} x="22" y={nickname.lines.length === 1 ? cardHeight - (podium ? 104 : 100) : cardHeight - (podium ? 157 : 151) + nickname.font * (lineIndex + 1)}>{line}</tspan>)}</text>
          <text x="22" y={cardHeight - (podium ? 72 : 66)} fill="#cbd5e1" fontSize={podium ? 21 : 17}>{main?.name ?? 'Sin historial de personajes'}</text>
          {row.characters.map((character, j) => <g key={character.id} transform={`translate(${22 + j * 58} ${cardHeight - (podium ? 65 : 51)})`}>
            <title>{`${j === 0 ? 'Principal' : j === 1 ? 'Secundario' : 'Tercero'}: ${getCharacter(character.id)?.name} · ${character.uses} juegos`}</title>
            <rect width="44" height="40" rx="8" fill={j === 0 ? '#16485b' : '#1e293b'} stroke={j === 0 ? '#67e8f9' : '#475569'}/>
            <image href={getCharacter(character.id)?.icon} x="6" y="4" width="32" height="32" onError={e => { e.currentTarget.style.display = 'none' }}/>
          </g>)}
          {medal && <text x={width - 22} y={cardHeight - 36} textAnchor="end" fill={medal} fontSize="21" fontWeight="700">SETS {row.setWins}-{row.setLosses}</text>}
        </g>
      })}
      <text x="64" y={height - 16} fill="#a7b5cb" fontSize="17">Máximo tres personajes por uso real · Empates oficiales · Sets confirmados, sin DQ ni BYEs</text>
    </g>
  </svg>
}
