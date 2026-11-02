export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob), link = document.createElement('a')
  link.href = url; link.download = filename; link.click()
  window.setTimeout(() => URL.revokeObjectURL(url), 1000)
}

export async function topEightPng(source: SVGSVGElement): Promise<{ blob: Blob; missingImages: number }> {
  await document.fonts.ready
  const svg = source.cloneNode(true) as SVGSVGElement
  const { width, height } = source.viewBox.baseVal
  svg.setAttribute('width', String(width)); svg.setAttribute('height', String(height))
  svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg')
  const embedded = new Map<string, Promise<string>>()
  let missingImages = 0
  await Promise.all([...svg.querySelectorAll('image')].map(async image => {
    const href = image.getAttribute('href')
    if (!href) { image.remove(); return }
    if (!embedded.has(href)) embedded.set(href, (async () => {
      const url = new URL(href, location.href)
      if (url.origin !== location.origin) throw new Error('Imagen fuera del catálogo local.')
      const response = await fetch(url, { signal: AbortSignal.timeout(10000) })
      if (!response.ok) throw new Error('Imagen no disponible.')
      const blob = await response.blob()
      return new Promise<string>((resolve, reject) => {
        const reader = new FileReader(); reader.onload = () => resolve(reader.result as string); reader.onerror = reject; reader.readAsDataURL(blob)
      })
    })())
    try { image.setAttribute('href', await embedded.get(href)!) }
    catch { missingImages++; image.remove() }
  }))
  const url = URL.createObjectURL(new Blob([new XMLSerializer().serializeToString(svg)], { type: 'image/svg+xml;charset=utf-8' }))
  try {
    const image = new Image(); image.src = url; await image.decode()
    const canvas = document.createElement('canvas'); canvas.width = width; canvas.height = height
    const context = canvas.getContext('2d')
    if (!context) throw new Error('No se pudo crear la imagen.')
    context.drawImage(image, 0, 0)
    const blob = await new Promise<Blob>((resolve, reject) => canvas.toBlob(value => value ? resolve(value) : reject(new Error('No se pudo exportar el PNG.')), 'image/png'))
    return { blob, missingImages }
  } finally { URL.revokeObjectURL(url) }
}
