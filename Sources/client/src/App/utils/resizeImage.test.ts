import { afterEach, describe, expect, it, vi } from 'vitest'
import { resizeImage } from './resizeImage'

const file = new File(['x'], 'photo.png', { type: 'image/png' })

// Simule le décodage de l'image et le canvas, que jsdom n'implémente pas
const mockCanvas = (width: number, height: number, blob: Blob | null) => {
  const bitmap = { width, height, close: vi.fn() }
  vi.stubGlobal('createImageBitmap', vi.fn().mockResolvedValue(bitmap))
  const drawImage = vi.fn()
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue({ drawImage } as never)
  const toBlob = vi
    .spyOn(HTMLCanvasElement.prototype, 'toBlob')
    .mockImplementation((cb: BlobCallback) => cb(blob))
  return { bitmap, drawImage, toBlob }
}

afterEach(() => {
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

describe('resizeImage', () => {
  it('réduit le plus grand côté à maxSize en conservant les proportions, en JPEG', async () => {
    const jpeg = new Blob(['jpeg'], { type: 'image/jpeg' })
    const { bitmap, drawImage, toBlob } = mockCanvas(4000, 3000, jpeg)

    expect(await resizeImage(file)).toBe(jpeg)
    expect(drawImage).toHaveBeenCalledWith(bitmap, 0, 0, 1600, 1200)
    expect(toBlob).toHaveBeenCalledWith(expect.any(Function), 'image/jpeg', 0.8)
    expect(bitmap.close).toHaveBeenCalled()
  })

  it("n'agrandit pas une petite image", async () => {
    const { drawImage } = mockCanvas(800, 600, new Blob(['jpeg']))
    await resizeImage(file)
    expect(drawImage).toHaveBeenCalledWith(expect.anything(), 0, 0, 800, 600)
  })

  it('renvoie le fichier original si le canvas ne produit rien', async () => {
    mockCanvas(800, 600, null)
    expect(await resizeImage(file)).toBe(file)
  })

  it("renvoie le fichier original si l'image n'est pas décodable", async () => {
    vi.stubGlobal('createImageBitmap', vi.fn().mockRejectedValue(new Error('format inconnu')))
    expect(await resizeImage(file)).toBe(file)
  })
})
