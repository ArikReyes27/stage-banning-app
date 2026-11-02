import { useState } from 'react'
import { getCharacter } from '../../data/characters'

export function CharacterIcon({ characterId }: { characterId?: string }) {
  const character = getCharacter(characterId ?? '')
  const [failedId, setFailedId] = useState<string>()
  return (
    <span className="character-icon" title={character?.name ?? 'Sin personaje'}>
      {character && failedId !== character.id ? (
        <img src={character.icon} alt={character.name} width={32} height={32}
          decoding="async" onError={() => setFailedId(character.id)} />
      ) : (
        <svg viewBox="0 0 32 32" role="img" aria-label={character?.name ?? 'Sin personaje'}>
          <circle cx="16" cy="11" r="5" fill="currentColor" />
          <path d="M6 28v-3a10 10 0 0 1 20 0v3Z" fill="currentColor" />
        </svg>
      )}
    </span>
  )
}
