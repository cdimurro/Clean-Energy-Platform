/**
 * Assessment PDF Generation API
 *
 * POST: Generate a professional PDF report for an assessment
 * Saves to the reports folder and returns the PDF
 */

import { NextRequest, NextResponse } from 'next/server'
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import { writeFileSync, mkdirSync, existsSync } from 'fs'
import { join } from 'path'

// Force Node.js runtime for fs operations
export const runtime = 'nodejs'

// Type for lastAutoTable property added by jspdf-autotable
type DocWithAutoTable = jsPDF & { lastAutoTable: { finalY: number } }

interface AssessmentData {
  id: string
  title: string
  description: string
  status: string
  rating?: string
  createdAt: string
  components: Array<{
    name: string
    description: string
    status: string
    progress: number
  }>
}

interface ResultsData {
  rating: string
  ratingJustification: string
  summary: {
    keyStrengths: string[]
    keyRisks: string[]
    nextSteps: string[]
  }
  metrics: Record<string, { value: string; benchmark: string }>
  claimsMatrix: Array<{
    claim: string
    validated: boolean
    confidence: string
    note: string
  }>
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { assessment, results } = body as { assessment: AssessmentData; results: ResultsData }

    // Create PDF
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    })

    const pageWidth = doc.internal.pageSize.getWidth()
    const margin = 20
    const contentWidth = pageWidth - 2 * margin
    let yPos = 20

    // Colors
    const primaryColor: [number, number, number] = [51, 65, 85] // slate-700
    const accentColor: [number, number, number] = [37, 99, 235] // blue-600
    const successColor: [number, number, number] = [34, 197, 94] // green-500
    const warningColor: [number, number, number] = [245, 158, 11] // amber-500
    const textColor: [number, number, number] = [15, 23, 42] // slate-900
    const mutedColor: [number, number, number] = [100, 116, 139] // slate-500

    // Helper functions
    const addHeader = (text: string, size: number = 16) => {
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(size)
      doc.setTextColor(...primaryColor)
      doc.text(text, margin, yPos)
      yPos += size * 0.5 + 5
    }

    const addText = (text: string, size: number = 10, color: [number, number, number] = textColor) => {
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(size)
      doc.setTextColor(...color)
      const lines = doc.splitTextToSize(text, contentWidth)
      doc.text(lines, margin, yPos)
      yPos += lines.length * size * 0.4 + 3
    }

    const addDivider = () => {
      yPos += 3
      doc.setDrawColor(...mutedColor)
      doc.setLineWidth(0.3)
      doc.line(margin, yPos, pageWidth - margin, yPos)
      yPos += 8
    }

    const checkNewPage = (requiredSpace: number = 40) => {
      if (yPos + requiredSpace > doc.internal.pageSize.getHeight() - 20) {
        doc.addPage()
        yPos = 20
      }
    }

    // ===== COVER PAGE =====
    // Logo/Title area
    doc.setFillColor(...primaryColor)
    doc.rect(0, 0, pageWidth, 60, 'F')

    doc.setFont('helvetica', 'bold')
    doc.setFontSize(28)
    doc.setTextColor(255, 255, 255)
    doc.text('EXERGY LAB', margin, 35)

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(12)
    doc.text('Clean Energy Technology Assessment', margin, 48)

    yPos = 80

    // Assessment Title
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(24)
    doc.setTextColor(...textColor)
    doc.text(assessment.title || 'Technology Assessment Report', margin, yPos)
    yPos += 15

    // Rating Badge
    const ratingColors: Record<string, [number, number, number]> = {
      promising: successColor,
      conditional: warningColor,
      concerning: [239, 68, 68] as [number, number, number],
    }
    const ratingColor = ratingColors[results.rating] || successColor

    doc.setFillColor(...ratingColor)
    doc.roundedRect(margin, yPos, 50, 12, 2, 2, 'F')
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(10)
    doc.setTextColor(255, 255, 255)
    doc.text(results.rating?.toUpperCase() || 'PROMISING', margin + 5, yPos + 8)
    yPos += 25

    // Report Info
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(10)
    doc.setTextColor(...mutedColor)
    doc.text(`Assessment ID: ${id}`, margin, yPos)
    yPos += 6
    doc.text(`Generated: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`, margin, yPos)
    yPos += 20

    // Description
    addText(assessment.description || 'No description provided.', 11)

    // New page for content
    doc.addPage()
    yPos = 20

    // ===== EXECUTIVE SUMMARY =====
    addHeader('Executive Summary', 18)
    addText(results.ratingJustification)
    addDivider()

    // ===== KEY METRICS =====
    checkNewPage(50)
    addHeader('Key Metrics')

    const metricsData = Object.entries(results.metrics).map(([key, metric]) => [
      key.toUpperCase(),
      metric.value,
      metric.benchmark
    ])

    autoTable(doc, {
      startY: yPos,
      head: [['Metric', 'Value', 'Benchmark']],
      body: metricsData,
      theme: 'grid',
      headStyles: { fillColor: primaryColor, textColor: [255, 255, 255] },
      bodyStyles: { textColor },
      alternateRowStyles: { fillColor: [248, 250, 252] },
      margin: { left: margin, right: margin },
    })
    yPos = (doc as DocWithAutoTable).lastAutoTable.finalY + 15

    // ===== KEY STRENGTHS =====
    checkNewPage(60)
    addHeader('Key Strengths')
    results.summary.keyStrengths.forEach((strength) => {
      doc.setFillColor(...successColor)
      doc.circle(margin + 2, yPos - 2, 1.5, 'F')
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(10)
      doc.setTextColor(...textColor)
      const lines = doc.splitTextToSize(strength, contentWidth - 10)
      doc.text(lines, margin + 8, yPos)
      yPos += lines.length * 5 + 3
    })
    yPos += 5

    // ===== KEY RISKS =====
    checkNewPage(60)
    addHeader('Key Risks')
    results.summary.keyRisks.forEach((risk) => {
      doc.setFillColor(...warningColor)
      doc.circle(margin + 2, yPos - 2, 1.5, 'F')
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(10)
      doc.setTextColor(...textColor)
      const lines = doc.splitTextToSize(risk, contentWidth - 10)
      doc.text(lines, margin + 8, yPos)
      yPos += lines.length * 5 + 3
    })
    yPos += 5

    // ===== RECOMMENDED NEXT STEPS =====
    checkNewPage(60)
    addHeader('Recommended Next Steps')
    results.summary.nextSteps.forEach((step, index) => {
      doc.setFillColor(...accentColor)
      doc.circle(margin + 2, yPos - 2, 4, 'F')
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(9)
      doc.setTextColor(255, 255, 255)
      doc.text(String(index + 1), margin + 0.5, yPos)
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(10)
      doc.setTextColor(...textColor)
      const lines = doc.splitTextToSize(step, contentWidth - 12)
      doc.text(lines, margin + 10, yPos)
      yPos += lines.length * 5 + 5
    })

    // ===== CLAIMS VALIDATION MATRIX =====
    doc.addPage()
    yPos = 20
    addHeader('Claims Validation Matrix', 18)
    yPos += 5

    const claimsData = results.claimsMatrix.map((claim) => [
      claim.claim,
      claim.validated ? 'YES' : 'NO',
      claim.confidence.toUpperCase(),
      claim.note
    ])

    autoTable(doc, {
      startY: yPos,
      head: [['Claim', 'Validated', 'Confidence', 'Notes']],
      body: claimsData,
      theme: 'grid',
      headStyles: { fillColor: primaryColor, textColor: [255, 255, 255] },
      bodyStyles: { textColor, fontSize: 9 },
      alternateRowStyles: { fillColor: [248, 250, 252] },
      margin: { left: margin, right: margin },
      columnStyles: {
        0: { cellWidth: 45 },
        1: { cellWidth: 20 },
        2: { cellWidth: 25 },
        3: { cellWidth: 'auto' },
      },
    })
    yPos = (doc as DocWithAutoTable).lastAutoTable.finalY + 15

    // ===== ASSESSMENT COMPONENTS =====
    checkNewPage(80)
    addHeader('Assessment Components')

    const componentsData = assessment.components.map((comp, i) => [
      String(i + 1),
      comp.name,
      comp.description,
      comp.status === 'complete' ? 'Complete' : comp.status
    ])

    autoTable(doc, {
      startY: yPos,
      head: [['#', 'Component', 'Description', 'Status']],
      body: componentsData,
      theme: 'grid',
      headStyles: { fillColor: primaryColor, textColor: [255, 255, 255] },
      bodyStyles: { textColor, fontSize: 9 },
      alternateRowStyles: { fillColor: [248, 250, 252] },
      margin: { left: margin, right: margin },
      columnStyles: {
        0: { cellWidth: 10 },
        1: { cellWidth: 40 },
        2: { cellWidth: 'auto' },
        3: { cellWidth: 25 },
      },
    })

    // ===== FOOTER ON ALL PAGES =====
    const pageCount = doc.getNumberOfPages()
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i)
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(8)
      doc.setTextColor(...mutedColor)
      doc.text(
        `Exergy Lab Assessment Report | Page ${i} of ${pageCount}`,
        pageWidth / 2,
        doc.internal.pageSize.getHeight() - 10,
        { align: 'center' }
      )
    }

    // Generate PDF buffer
    const pdfBuffer = Buffer.from(doc.output('arraybuffer'))

    // Save to reports folder
    const reportsDir = join(process.cwd(), 'reports')
    if (!existsSync(reportsDir)) {
      mkdirSync(reportsDir, { recursive: true })
    }

    const sanitizedTitle = (assessment.title || 'assessment')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .slice(0, 50)
    const timestamp = new Date().toISOString().split('T')[0]
    const filename = `${sanitizedTitle}-${timestamp}.pdf`
    const filePath = join(reportsDir, filename)

    writeFileSync(filePath, pdfBuffer)
    console.log(`[PDF] Report saved to: ${filePath}`)

    // Return PDF response
    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'X-Report-Path': filePath,
      },
    })
  } catch (error) {
    console.error('[PDF API] Error generating PDF:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    const errorStack = error instanceof Error ? error.stack : ''
    console.error('[PDF API] Stack:', errorStack)
    return NextResponse.json(
      { error: 'Failed to generate PDF', details: errorMessage },
      { status: 500 }
    )
  }
}
