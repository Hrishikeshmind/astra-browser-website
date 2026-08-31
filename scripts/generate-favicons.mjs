/**
 * Generate favicon assets from src/assets/logo.png
 * Run: node scripts/generate-favicons.mjs
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')
const logoPath = join(root, 'src/assets/logo.png')
const publicDir = join(root, 'public')

const sizes = [16, 32, 48, 180, 192, 512]

for (const size of sizes) {
  const suffix = size === 180 ? 'apple-touch-icon' : `favicon-${size}x${size}`
  await sharp(logoPath)
    .resize(size, size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toFile(join(publicDir, `${suffix}.png`))
}

// Multi-size ICO (16 + 32 + 48) via PNG buffers embedded in ICO container
const icoSizes = [16, 32, 48]
const pngBuffers = await Promise.all(
  icoSizes.map(size =>
    sharp(logoPath)
      .resize(size, size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png()
      .toBuffer()
  )
)

writeFileSync(join(publicDir, 'favicon.ico'), buildIco(pngBuffers, icoSizes))

// SVG favicon with embedded PNG for crisp scaling
const png32 = readFileSync(join(publicDir, 'favicon-32x32.png'))
const base64 = png32.toString('base64')
const svg = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 32 32"><image width="32" height="32" xlink:href="data:image/png;base64,${base64}"/></svg>`
writeFileSync(join(publicDir, 'favicon.svg'), svg)

console.log('Favicons generated in public/')

/** Minimal ICO writer for PNG-embedded icons */
function buildIco(pngBuffers, sizes) {
  const count = pngBuffers.length
  const headerSize = 6 + count * 16
  let offset = headerSize
  const entries = []

  for (let i = 0; i < count; i++) {
    const buf = pngBuffers[i]
    entries.push({ size: sizes[i], offset, length: buf.length, buf })
    offset += buf.length
  }

  const total = offset
  const out = Buffer.alloc(total)
  out.writeUInt16LE(0, 0)
  out.writeUInt16LE(1, 2)
  out.writeUInt16LE(count, 4)

  let entryOffset = 6
  for (const entry of entries) {
    out.writeUInt8(entry.size === 256 ? 0 : entry.size, entryOffset)
    out.writeUInt8(entry.size === 256 ? 0 : entry.size, entryOffset + 1)
    out.writeUInt8(0, entryOffset + 2)
    out.writeUInt8(0, entryOffset + 3)
    out.writeUInt16LE(1, entryOffset + 4)
    out.writeUInt16LE(32, entryOffset + 6)
    out.writeUInt32LE(entry.length, entryOffset + 8)
    out.writeUInt32LE(entry.offset, entryOffset + 12)
    entryOffset += 16
  }

  let dataOffset = headerSize
  for (const entry of entries) {
    entry.buf.copy(out, dataOffset)
    dataOffset += entry.length
  }

  return out
}
