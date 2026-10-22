import { type NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

// 50 MB is a generous upper bound for architectural PDF floor plans
const MAX_SIZE = 50 * 1024 * 1024

/**
 * POST /api/import/pdf-underlay
 *
 * Accepts a PDF file and returns page metadata (count + per-page dimensions
 * in points). The actual rasterisation is done client-side with pdfjs-dist to
 * avoid requiring node-canvas (a native module) on the server.
 *
 * Body: multipart/form-data
 *   file — the PDF file (required)
 *
 * Response: application/json
 *   { pageCount, pages: [{ width, height }] }
 *   width/height are in PDF points (1 pt = 1/72 inch)
 */
export async function POST(req: NextRequest) {
  let formData: FormData
  try {
    formData = await req.formData()
  } catch {
    return NextResponse.json({ error: 'Invalid multipart form data' }, { status: 400 })
  }

  const file = formData.get('file') as File | null
  if (!file) {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 })
  }

  if (!file.name.toLowerCase().endsWith('.pdf')) {
    return NextResponse.json({ error: 'Only PDF files are supported' }, { status: 415 })
  }

  if (file.size > MAX_SIZE) {
    return NextResponse.json(
      { error: `File exceeds the ${MAX_SIZE / (1024 * 1024)} MB size limit` },
      { status: 413 },
    )
  }

  // Read the raw bytes and verify the PDF magic bytes (%PDF-)
  const buffer = Buffer.from(await file.arrayBuffer())
  if (buffer.length < 5 || buffer.slice(0, 5).toString('ascii') !== '%PDF-') {
    return NextResponse.json({ error: 'File is not a valid PDF' }, { status: 415 })
  }

  // Parse the cross-reference table to extract page count and MediaBox dimensions.
  // We use pdfjs-dist (legacy/node build) for reliable parsing.
  let pageCount: number
  let pages: { width: number; height: number }[]
  try {
    // Dynamic import keeps the large pdfjs bundle out of the initial module graph.
    const { getDocument, GlobalWorkerOptions } = await import(
      'pdfjs-dist/legacy/build/pdf.mjs' as string
    )
    // Disable worker in Node.js context
    GlobalWorkerOptions.workerSrc = ''

    const pdf = await getDocument({
      data: new Uint8Array(buffer),
      useWorkerFetch: false,
      isEvalSupported: false,
      useSystemFonts: true,
    }).promise

    pageCount = pdf.numPages
    pages = await Promise.all(
      Array.from({ length: pageCount }, async (_, i) => {
        const page = await pdf.getPage(i + 1)
        const vp = page.getViewport({ scale: 1 })
        return { width: vp.width, height: vp.height }
      }),
    )
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to parse PDF'
    return NextResponse.json({ error: message }, { status: 422 })
  }

  return NextResponse.json({ pageCount, pages })
}
