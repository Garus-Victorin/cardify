import JSZip from 'jszip'
import { fileToDataUrl } from './utils'

export async function extractPhotosFromZip(
  zipFile: File
): Promise<Map<string, string>> {
  const zip = await JSZip.loadAsync(zipFile)
  const photoMap = new Map<string, string>()

  const promises = Object.entries(zip.files).map(async ([name, file]) => {
    if (file.dir) return
    const ext = name.split('.').pop()?.toLowerCase()
    if (!['jpg', 'jpeg', 'png', 'webp'].includes(ext ?? '')) return

    const baseName = name.split('/').pop()?.replace(/\.[^.]+$/, '') ?? ''
    const blob = await file.async('blob')
    const objectFile = new File([blob], name, { type: `image/${ext}` })
    const dataUrl = await fileToDataUrl(objectFile)
    photoMap.set(baseName.toLowerCase(), dataUrl)
  })

  await Promise.all(promises)
  return photoMap
}
