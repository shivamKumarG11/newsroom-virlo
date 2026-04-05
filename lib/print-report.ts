/**
 * lib/print-report.ts
 * Generates a PDF using jsPDF and opens it in the browser PDF viewer.
 */

export interface PrintReportData {
  topic: string
  digest: string
  editorial: string
  qa: { q: string; a: string }[]
  model: string
  imageUrls?: string[]
  sources?: { title: string; source: string; url: string }[]
  generatedAt?: string
}

// ── Helpers ────────────────────────────────────────────────────────────────────

function stripMarkdown(md: string): string {
  return (md ?? '')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/\*(.+?)\*/g, '$1')
    .replace(/^[-*]\s+/gm, '• ')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/---+/g, '')
    .trim()
}

function wrapText(doc: import('jspdf').jsPDF, text: string, maxWidth: number): string[] {
  if (!text?.trim()) return []
  const lines = doc.splitTextToSize(text, maxWidth)
  return Array.isArray(lines) ? lines : [String(lines)]
}

function renderBlock(
  doc: import('jspdf').jsPDF,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  pageH: number,
  marginBottom = 14,
  lineHeight = 6,
): number {
  const lines = wrapText(doc, text, maxWidth)
  if (lines.length === 0) return y + marginBottom
  for (const line of lines) {
    if (y + lineHeight > pageH - 20) { doc.addPage(); y = 24 }
    doc.text(line, x, y)
    y += lineHeight
  }
  return y + marginBottom
}

// ── Image proxy loader ─────────────────────────────────────────────────────────

async function loadImageDataUrl(url: string): Promise<string | null> {
  try {
    const res = await fetch(`/api/image-proxy?url=${encodeURIComponent(url)}`)
    if (!res.ok) return null
    const json = await res.json() as { dataUrl?: string }
    const dataUrl = json.dataUrl
    if (!dataUrl || !dataUrl.startsWith('data:image/')) return null
    return dataUrl
  } catch {
    return null
  }
}

function detectFormat(dataUrl: string): 'PNG' | 'JPEG' | null {
  if (dataUrl.startsWith('data:image/png')) return 'PNG'
  if (dataUrl.startsWith('data:image/jpeg') || dataUrl.startsWith('data:image/jpg')) return 'JPEG'
  // webp and other formats: try JPEG as fallback (jsPDF handles it on most browsers)
  if (dataUrl.startsWith('data:image/webp') || dataUrl.startsWith('data:image/gif')) return 'JPEG'
  return null
}

// ── Main export ────────────────────────────────────────────────────────────────

export async function printReport(data: PrintReportData): Promise<void> {
  const { jsPDF } = await import('jspdf')

  const doc = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' })

  const pageW = doc.internal.pageSize.getWidth()
  const pageH = doc.internal.pageSize.getHeight()
  const marginL = 18
  const marginR = 18
  const contentW = pageW - marginL - marginR

  const date = data.generatedAt
    ? new Date(data.generatedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })

  let y = 20

  // ── Header ──────────────────────────────────────────────────────────────────

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(7)
  doc.setTextColor(150, 150, 150)
  doc.text('AI-VANTAGE · INTELLIGENCE REPORT', marginL, y)
  y += 6

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(18)
  doc.setTextColor(10, 10, 10)
  y = renderBlock(doc, data.topic ?? 'Intelligence Report', marginL, y, contentW, pageH, 4, 9)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7.5)
  doc.setTextColor(130, 130, 130)
  doc.text(`Generated ${date}  ·  ${data.model ?? 'AI'}`, marginL, y)
  y += 4

  doc.setDrawColor(200, 200, 200)
  doc.setLineWidth(0.3)
  doc.line(marginL, y, pageW - marginR, y)
  y += 10

  // ── Images strip ────────────────────────────────────────────────────────────

  const imageUrls = (data.imageUrls ?? []).filter(Boolean).slice(0, 3)
  if (imageUrls.length > 0) {
    const imgH = 38
    const gap = 4
    const imgW = (contentW - gap * (imageUrls.length - 1)) / imageUrls.length
    const imgX = imageUrls.map((_, i) => marginL + i * (imgW + gap))

    const dataUrls = await Promise.all(imageUrls.map(loadImageDataUrl))
    let loadedAny = false

    for (let i = 0; i < dataUrls.length; i++) {
      const d = dataUrls[i]
      if (!d) continue
      const fmt = detectFormat(d)
      if (!fmt) continue
      try {
        doc.addImage(d, fmt, imgX[i], y, imgW, imgH)
        loadedAny = true
      } catch (e) {
        console.warn('[PDF] addImage failed:', e)
      }
    }
    if (loadedAny) y += imgH + 10
  }

  // ── Section helper ───────────────────────────────────────────────────────────

  function sectionLabel(label: string) {
    if (y + 14 > pageH - 20) { doc.addPage(); y = 24 }
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(7)
    doc.setTextColor(170, 170, 170)
    doc.text(label.toUpperCase(), marginL, y)
    y += 3
    doc.setDrawColor(230, 230, 230)
    doc.setLineWidth(0.2)
    doc.line(marginL, y, pageW - marginR, y)
    y += 7
  }

  // ── Digest ───────────────────────────────────────────────────────────────────

  sectionLabel('200-Word Intelligence Digest')
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.setTextColor(30, 30, 30)
  y = renderBlock(doc, stripMarkdown(data.digest ?? ''), marginL, y, contentW, pageH, 14, 5.5)

  // ── Editorial ────────────────────────────────────────────────────────────────

  sectionLabel('Editorial Analysis')

  // Normalize line endings (handles \r\n from Windows, \r from old Mac)
  const editorialLines = (data.editorial ?? '').split(/\r?\n/)
  for (const raw of editorialLines) {
    const line = raw.trim()
    if (!line) continue
    if (y + 8 > pageH - 20) { doc.addPage(); y = 24 }

    if (line.startsWith('## ')) {
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(10)
      doc.setTextColor(10, 10, 10)
      y = renderBlock(doc, line.slice(3), marginL, y, contentW, pageH, 3, 6)
    } else if (line.startsWith('- ') || line.startsWith('* ')) {
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(9.5)
      doc.setTextColor(50, 50, 50)
      y = renderBlock(doc, '• ' + stripMarkdown(line.slice(2)), marginL + 3, y, contentW - 3, pageH, 1, 5.5)
    } else if (line === '---') {
      doc.setDrawColor(220, 220, 220)
      doc.line(marginL, y, pageW - marginR, y)
      y += 6
    } else {
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(9.5)
      doc.setTextColor(50, 50, 50)
      y = renderBlock(doc, stripMarkdown(line), marginL, y, contentW, pageH, 2, 5.5)
    }
  }
  y += 10

  // ── Q&A ──────────────────────────────────────────────────────────────────────

  const qaItems = (data.qa ?? []).filter(item => item?.q && item?.a)
  sectionLabel(`Q & A — ${qaItems.length} Questions`)

  for (let i = 0; i < qaItems.length; i++) {
    const item = qaItems[i]
    if (!item?.q || !item?.a) continue
    if (y + 20 > pageH - 20) { doc.addPage(); y = 24 }

    doc.setFont('helvetica', 'bold')
    doc.setFontSize(10)
    doc.setTextColor(10, 10, 10)
    y = renderBlock(doc, `Q${i + 1}  ${item.q}`, marginL, y, contentW, pageH, 2, 5.5)

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9.5)
    doc.setTextColor(80, 80, 80)
    y = renderBlock(doc, item.a, marginL + 5, y, contentW - 5, pageH, 8, 5.5)
  }

  // ── Sources ──────────────────────────────────────────────────────────────────

  const sources = (data.sources ?? []).filter(s => s?.title || s?.source)
  if (sources.length > 0) {
    sectionLabel('Sources')
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8.5)
    doc.setTextColor(100, 100, 100)

    for (const s of sources) {
      if (y + 8 > pageH - 20) { doc.addPage(); y = 24 }
      const label = [s.source, s.title].filter(Boolean).join('  —  ')
      y = renderBlock(doc, label, marginL, y, contentW, pageH, 2, 5)
      if (s.url?.trim()) {
        doc.setTextColor(100, 140, 100)
        y = renderBlock(doc, s.url.trim(), marginL + 3, y, contentW - 3, pageH, 4, 4.5)
        doc.setTextColor(100, 100, 100)
      }
    }
    y += 6
  }

  // ── Footer on every page ─────────────────────────────────────────────────────

  const totalPages = (doc.internal as { getNumberOfPages: () => number }).getNumberOfPages()
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(7)
    doc.setTextColor(180, 180, 180)
    doc.text('AI-Vantage Intelligence', marginL, pageH - 8)
    doc.text(`Page ${p} of ${totalPages}`, pageW - marginR, pageH - 8, { align: 'right' })
  }

  // ── Open in browser PDF viewer ───────────────────────────────────────────────

  const blob = doc.output('blob')
  const pdfUrl = URL.createObjectURL(blob)
  const opened = window.open(pdfUrl, '_blank')
  if (!opened) {
    // Popup blocked — fall back to direct download
    const a = document.createElement('a')
    a.href = pdfUrl
    a.download = `${(data.topic ?? 'report').slice(0, 60).replace(/[^a-z0-9]/gi, '-')}.pdf`
    a.click()
  }
}
