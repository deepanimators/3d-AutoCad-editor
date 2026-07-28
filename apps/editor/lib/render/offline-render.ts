export async function captureViewerRender(width: number, height: number): Promise<Blob> {
  const canvas = document.querySelector('canvas') as HTMLCanvasElement | null
  if (!canvas) throw new Error('No canvas found')
  return new Promise((resolve, reject) => {
    const offscreen = document.createElement('canvas')
    offscreen.width = width
    offscreen.height = height
    const ctx = offscreen.getContext('2d')
    if (!ctx) {
      reject(new Error('no 2d context'))
      return
    }
    ctx.drawImage(canvas, 0, 0, width, height)
    offscreen.toBlob((blob) => {
      if (!blob) {
        reject(new Error('toBlob failed'))
        return
      }
      resolve(blob)
    }, 'image/png')
  })
}
