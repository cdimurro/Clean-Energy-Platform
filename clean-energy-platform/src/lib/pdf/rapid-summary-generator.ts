/**
 * Rapid Summary PDF Generator
 *
 * Generates a 2-page executive summary for Quick TRL Assessment product.
 * Designed for investor due diligence with clear traffic light rating.
 *
 * Output:
 * - Page 1: Rating, TRL, Recommendation, Top Risks
 * - Page 2: Key Metrics, Executive Summary
 *
 * Target: $5K-$15K investor due diligence product
 */

import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import type {
  RapidAssessmentResult,
  TrafficLightRating,
  TechnicalRisk,
} from '../ai/agents/assessment/rapid-orchestrator'
import {
  COLORS,
  FONT_SIZES,
  registerCustomFonts,
  FONT_FAMILIES,
} from './shared-styles'

// ============================================================================
// Types
// ============================================================================

interface RapidSummaryConfig {
  companyLogo?: string // base64 encoded logo
  investorName?: string
  reportDate?: string
  confidentiality?: string
}

// ============================================================================
// Colors
// ============================================================================

const RATING_COLORS = {
  GREEN: { bg: [34, 197, 94] as [number, number, number], text: [255, 255, 255] as [number, number, number] },
  YELLOW: { bg: [250, 204, 21] as [number, number, number], text: [0, 0, 0] as [number, number, number] },
  RED: { bg: [239, 68, 68] as [number, number, number], text: [255, 255, 255] as [number, number, number] },
}

const SEVERITY_COLORS = {
  critical: [239, 68, 68] as [number, number, number],
  high: [249, 115, 22] as [number, number, number],
  medium: [234, 179, 8] as [number, number, number],
  low: [59, 130, 246] as [number, number, number],
}

// ============================================================================
// Generator Class
// ============================================================================

export class RapidSummaryGenerator {
  private doc: jsPDF
  private pageWidth: number
  private pageHeight: number
  private margin = 15
  private currentY = 15

  constructor() {
    this.doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    })
    this.pageWidth = this.doc.internal.pageSize.getWidth()
    this.pageHeight = this.doc.internal.pageSize.getHeight()

    // Register custom fonts
    registerCustomFonts(this.doc)
  }

  /**
   * Generate the rapid summary PDF
   */
  async generate(
    result: RapidAssessmentResult,
    technologyName: string,
    config: RapidSummaryConfig = {}
  ): Promise<Blob> {
    // Page 1: Rating Overview
    this.generatePage1(result, technologyName, config)

    // Page 2: Details
    this.doc.addPage()
    this.currentY = this.margin
    this.generatePage2(result, config)

    // Add footer to both pages
    this.addFooter(config)

    return this.doc.output('blob')
  }

  // ==========================================================================
  // Page 1: Rating Overview
  // ==========================================================================

  private generatePage1(
    result: RapidAssessmentResult,
    technologyName: string,
    config: RapidSummaryConfig
  ): void {
    // Header
    this.addHeader('Quick TRL Assessment', config)

    // Technology Name
    this.doc.setFont(FONT_FAMILIES.body, 'bold')
    this.doc.setFontSize(20)
    this.doc.setTextColor(COLORS.text[0], COLORS.text[1], COLORS.text[2])
    this.doc.text(technologyName, this.pageWidth / 2, this.currentY, { align: 'center' })
    this.currentY += 12

    // Date
    this.doc.setFont(FONT_FAMILIES.body, 'normal')
    this.doc.setFontSize(10)
    this.doc.setTextColor(COLORS.textMuted[0], COLORS.textMuted[1], COLORS.textMuted[2])
    const dateStr = config.reportDate || new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
    this.doc.text(`Assessment Date: ${dateStr}`, this.pageWidth / 2, this.currentY, { align: 'center' })
    this.currentY += 15

    // Main Rating Section (3 columns)
    const colWidth = (this.pageWidth - this.margin * 2 - 20) / 3
    const startX = this.margin
    const boxHeight = 55

    // Traffic Light Rating
    this.drawRatingBox(
      startX,
      this.currentY,
      colWidth,
      boxHeight,
      result.rating,
      result.ratingJustification
    )

    // TRL Score
    this.drawTRLBox(
      startX + colWidth + 10,
      this.currentY,
      colWidth,
      boxHeight,
      result.trl,
      result.trlConfidence
    )

    // Recommendation
    this.drawRecommendationBox(
      startX + (colWidth + 10) * 2,
      this.currentY,
      colWidth,
      boxHeight,
      result.recommendation
    )

    this.currentY += boxHeight + 15

    // Red Flags Alert (if any)
    if (result.redFlags.hasRedFlags) {
      this.drawRedFlagsAlert(result.redFlags)
    }

    // Top 5 Risks Table
    this.drawRisksTable(result.topRisks.slice(0, 5))
  }

  // ==========================================================================
  // Page 2: Details
  // ==========================================================================

  private generatePage2(result: RapidAssessmentResult, config: RapidSummaryConfig): void {
    // Header
    this.addHeader('Assessment Details', config)

    // Key Metrics (if available)
    if (result.keyMetrics.length > 0) {
      this.doc.setFont(FONT_FAMILIES.body, 'bold')
      this.doc.setFontSize(14)
      this.doc.setTextColor(COLORS.text[0], COLORS.text[1], COLORS.text[2])
      this.doc.text('Key Metrics', this.margin, this.currentY)
      this.currentY += 8

      this.drawMetricsTable(result.keyMetrics)
      this.currentY += 10
    }

    // Executive Summary
    this.doc.setFont(FONT_FAMILIES.body, 'bold')
    this.doc.setFontSize(14)
    this.doc.setTextColor(COLORS.text[0], COLORS.text[1], COLORS.text[2])
    this.doc.text('Executive Summary', this.margin, this.currentY)
    this.currentY += 8

    this.doc.setFont(FONT_FAMILIES.body, 'normal')
    this.doc.setFontSize(10)
    this.doc.setTextColor(COLORS.text[0], COLORS.text[1], COLORS.text[2])

    const summaryLines = this.doc.splitTextToSize(
      result.executiveSummary.replace(/\*\*/g, '').replace(/\n\n/g, '\n'),
      this.pageWidth - this.margin * 2
    )
    this.doc.text(summaryLines, this.margin, this.currentY)
    this.currentY += summaryLines.length * 5 + 15

    // Recommendation Rationale
    this.doc.setFont(FONT_FAMILIES.body, 'bold')
    this.doc.setFontSize(14)
    this.doc.text('Recommendation Rationale', this.margin, this.currentY)
    this.currentY += 8

    this.doc.setFont(FONT_FAMILIES.body, 'normal')
    this.doc.setFontSize(10)
    const rationaleLines = this.doc.splitTextToSize(
      result.recommendationRationale,
      this.pageWidth - this.margin * 2
    )
    this.doc.text(rationaleLines, this.margin, this.currentY)
    this.currentY += rationaleLines.length * 5 + 15

    // TRL Justification
    this.doc.setFont(FONT_FAMILIES.body, 'bold')
    this.doc.setFontSize(14)
    this.doc.text('TRL Assessment Justification', this.margin, this.currentY)
    this.currentY += 8

    this.doc.setFont(FONT_FAMILIES.body, 'normal')
    this.doc.setFontSize(10)
    const trlLines = this.doc.splitTextToSize(
      result.trlJustification,
      this.pageWidth - this.margin * 2
    )
    this.doc.text(trlLines, this.margin, this.currentY)
    this.currentY += trlLines.length * 5 + 15

    // Next Steps
    this.drawNextSteps(result.recommendation)
  }

  // ==========================================================================
  // Drawing Helpers
  // ==========================================================================

  private addHeader(title: string, config: RapidSummaryConfig): void {
    // Title bar
    this.doc.setFillColor(COLORS.primary[0], COLORS.primary[1], COLORS.primary[2])
    this.doc.rect(0, 0, this.pageWidth, 25, 'F')

    // Title
    this.doc.setFont(FONT_FAMILIES.heading, 'bold')
    this.doc.setFontSize(16)
    this.doc.setTextColor(255, 255, 255)
    this.doc.text(title, this.margin, 16)

    // Investor name if provided
    if (config.investorName) {
      this.doc.setFontSize(10)
      this.doc.text(`Prepared for: ${config.investorName}`, this.pageWidth - this.margin, 16, { align: 'right' })
    }

    this.currentY = 35
  }

  private drawRatingBox(
    x: number,
    y: number,
    width: number,
    height: number,
    rating: TrafficLightRating,
    justification: string
  ): void {
    const colors = RATING_COLORS[rating]

    // Box background
    this.doc.setFillColor(colors.bg[0], colors.bg[1], colors.bg[2])
    this.doc.roundedRect(x, y, width, height, 3, 3, 'F')

    // Label
    this.doc.setFont(FONT_FAMILIES.body, 'normal')
    this.doc.setFontSize(9)
    this.doc.setTextColor(colors.text[0], colors.text[1], colors.text[2])
    this.doc.text('RATING', x + width / 2, y + 10, { align: 'center' })

    // Rating value
    this.doc.setFont(FONT_FAMILIES.heading, 'bold')
    this.doc.setFontSize(24)
    this.doc.text(rating, x + width / 2, y + 28, { align: 'center' })

    // Justification (truncated)
    this.doc.setFont(FONT_FAMILIES.body, 'normal')
    this.doc.setFontSize(7)
    const truncated = justification.length > 80 ? justification.slice(0, 77) + '...' : justification
    const lines = this.doc.splitTextToSize(truncated, width - 8)
    this.doc.text(lines.slice(0, 3), x + width / 2, y + 38, { align: 'center' })
  }

  private drawTRLBox(
    x: number,
    y: number,
    width: number,
    height: number,
    trl: number,
    confidence: 'high' | 'medium' | 'low'
  ): void {
    // Box background
    this.doc.setFillColor(COLORS.background[0], COLORS.background[1], COLORS.background[2])
    this.doc.setDrawColor(COLORS.border[0], COLORS.border[1], COLORS.border[2])
    this.doc.roundedRect(x, y, width, height, 3, 3, 'FD')

    // Label
    this.doc.setFont(FONT_FAMILIES.body, 'normal')
    this.doc.setFontSize(9)
    this.doc.setTextColor(COLORS.textMuted[0], COLORS.textMuted[1], COLORS.textMuted[2])
    this.doc.text('TRL SCORE', x + width / 2, y + 10, { align: 'center' })

    // TRL value
    this.doc.setFont(FONT_FAMILIES.heading, 'bold')
    this.doc.setFontSize(28)
    this.doc.setTextColor(COLORS.primary[0], COLORS.primary[1], COLORS.primary[2])
    this.doc.text(`${trl}/9`, x + width / 2, y + 30, { align: 'center' })

    // TRL Stage
    const stages = ['', 'Research', 'Research', 'Development', 'Development', 'Demo', 'Demo', 'Pre-Commercial', 'Pre-Commercial', 'Commercial']
    this.doc.setFont(FONT_FAMILIES.body, 'normal')
    this.doc.setFontSize(9)
    this.doc.setTextColor(COLORS.text[0], COLORS.text[1], COLORS.text[2])
    this.doc.text(stages[trl] || 'Unknown', x + width / 2, y + 40, { align: 'center' })

    // Confidence
    const confColor = confidence === 'high' ? [34, 197, 94] : confidence === 'medium' ? [234, 179, 8] : [239, 68, 68]
    this.doc.setFontSize(8)
    this.doc.setTextColor(confColor[0], confColor[1], confColor[2])
    this.doc.text(`Confidence: ${confidence}`, x + width / 2, y + 50, { align: 'center' })
  }

  private drawRecommendationBox(
    x: number,
    y: number,
    width: number,
    height: number,
    recommendation: RapidAssessmentResult['recommendation']
  ): void {
    const config = {
      PROCEED: { color: [34, 197, 94] as [number, number, number], label: 'PROCEED' },
      PROCEED_WITH_CAUTION: { color: [234, 179, 8] as [number, number, number], label: 'CAUTION' },
      DO_NOT_PROCEED: { color: [239, 68, 68] as [number, number, number], label: 'PASS' },
    }
    const rec = config[recommendation]

    // Box background
    this.doc.setFillColor(rec.color[0], rec.color[1], rec.color[2])
    this.doc.roundedRect(x, y, width, height, 3, 3, 'F')

    // Label
    this.doc.setFont(FONT_FAMILIES.body, 'normal')
    this.doc.setFontSize(9)
    this.doc.setTextColor(255, 255, 255)
    this.doc.text('RECOMMENDATION', x + width / 2, y + 10, { align: 'center' })

    // Recommendation value
    this.doc.setFont(FONT_FAMILIES.heading, 'bold')
    this.doc.setFontSize(18)
    this.doc.text(rec.label, x + width / 2, y + 28, { align: 'center' })

    // Subtext
    this.doc.setFont(FONT_FAMILIES.body, 'normal')
    this.doc.setFontSize(8)
    const subtext = {
      PROCEED: 'Proceed to full diligence',
      PROCEED_WITH_CAUTION: 'Further investigation needed',
      DO_NOT_PROCEED: 'Critical issues identified',
    }
    this.doc.text(subtext[recommendation], x + width / 2, y + 40, { align: 'center' })
  }

  private drawRedFlagsAlert(redFlags: RapidAssessmentResult['redFlags']): void {
    const alertHeight = 20

    this.doc.setFillColor(254, 226, 226) // Red-100
    this.doc.setDrawColor(239, 68, 68) // Red-500
    this.doc.roundedRect(this.margin, this.currentY, this.pageWidth - this.margin * 2, alertHeight, 2, 2, 'FD')

    this.doc.setFont(FONT_FAMILIES.body, 'bold')
    this.doc.setFontSize(10)
    this.doc.setTextColor(185, 28, 28) // Red-700
    this.doc.text('PHYSICS VIOLATIONS DETECTED', this.margin + 5, this.currentY + 8)

    this.doc.setFont(FONT_FAMILIES.body, 'normal')
    this.doc.setFontSize(9)
    const summary = redFlags.summary.length > 100 ? redFlags.summary.slice(0, 97) + '...' : redFlags.summary
    this.doc.text(summary, this.margin + 5, this.currentY + 15)

    this.currentY += alertHeight + 10
  }

  private drawRisksTable(risks: TechnicalRisk[]): void {
    this.doc.setFont(FONT_FAMILIES.body, 'bold')
    this.doc.setFontSize(14)
    this.doc.setTextColor(COLORS.text[0], COLORS.text[1], COLORS.text[2])
    this.doc.text('Top Technical Risks', this.margin, this.currentY)
    this.currentY += 5

    const tableData = risks.map((risk, index) => [
      `${index + 1}`,
      risk.severity.toUpperCase(),
      risk.category,
      risk.risk.length > 60 ? risk.risk.slice(0, 57) + '...' : risk.risk,
    ])

    autoTable(this.doc, {
      startY: this.currentY,
      head: [['#', 'Severity', 'Category', 'Risk Description']],
      body: tableData,
      theme: 'grid',
      headStyles: {
        fillColor: [COLORS.primary[0], COLORS.primary[1], COLORS.primary[2]],
        textColor: [255, 255, 255],
        fontSize: 9,
        fontStyle: 'bold',
      },
      bodyStyles: {
        fontSize: 8,
        cellPadding: 3,
      },
      columnStyles: {
        0: { cellWidth: 10, halign: 'center' },
        1: { cellWidth: 20, halign: 'center' },
        2: { cellWidth: 25 },
        3: { cellWidth: 'auto' },
      },
      didParseCell: (data) => {
        if (data.section === 'body' && data.column.index === 1) {
          const severity = data.cell.raw as string
          if (severity === 'CRITICAL') {
            data.cell.styles.fillColor = [254, 226, 226]
            data.cell.styles.textColor = [185, 28, 28]
          } else if (severity === 'HIGH') {
            data.cell.styles.fillColor = [255, 237, 213]
            data.cell.styles.textColor = [154, 52, 18]
          } else if (severity === 'MEDIUM') {
            data.cell.styles.fillColor = [254, 249, 195]
            data.cell.styles.textColor = [133, 77, 14]
          } else if (severity === 'LOW') {
            data.cell.styles.fillColor = [219, 234, 254]
            data.cell.styles.textColor = [30, 64, 175]
          }
        }
      },
      margin: { left: this.margin, right: this.margin },
    })

    this.currentY = (this.doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 5
  }

  private drawMetricsTable(metrics: RapidAssessmentResult['keyMetrics']): void {
    const tableData = metrics.slice(0, 6).map(m => [
      m.name,
      m.value,
      m.benchmark || '-',
      m.status.replace(/_/g, ' '),
    ])

    autoTable(this.doc, {
      startY: this.currentY,
      head: [['Metric', 'Value', 'Benchmark', 'Status']],
      body: tableData,
      theme: 'grid',
      headStyles: {
        fillColor: [COLORS.primary[0], COLORS.primary[1], COLORS.primary[2]],
        textColor: [255, 255, 255],
        fontSize: 9,
        fontStyle: 'bold',
      },
      bodyStyles: {
        fontSize: 8,
        cellPadding: 3,
      },
      margin: { left: this.margin, right: this.margin },
    })

    this.currentY = (this.doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 5
  }

  private drawNextSteps(recommendation: RapidAssessmentResult['recommendation']): void {
    const steps = {
      PROCEED: [
        'Schedule call with management team',
        'Request detailed financial projections',
        'Conduct full technical due diligence',
        'Evaluate competitive landscape',
      ],
      PROCEED_WITH_CAUTION: [
        'Request additional technical documentation',
        'Engage third-party expert for deep validation',
        'Investigate identified risk areas',
        'Reassess after resolving key concerns',
      ],
      DO_NOT_PROCEED: [
        'Document reasons for passing',
        'Archive assessment for future reference',
        'Consider monitoring for technology improvements',
        'No further action recommended at this time',
      ],
    }

    if (this.currentY > this.pageHeight - 60) return // Skip if not enough space

    this.doc.setFont(FONT_FAMILIES.body, 'bold')
    this.doc.setFontSize(14)
    this.doc.setTextColor(COLORS.text[0], COLORS.text[1], COLORS.text[2])
    this.doc.text('Recommended Next Steps', this.margin, this.currentY)
    this.currentY += 8

    this.doc.setFont(FONT_FAMILIES.body, 'normal')
    this.doc.setFontSize(10)

    steps[recommendation].forEach((step, index) => {
      this.doc.text(`${index + 1}. ${step}`, this.margin + 5, this.currentY)
      this.currentY += 6
    })
  }

  private addFooter(config: RapidSummaryConfig): void {
    const totalPages = this.doc.getNumberOfPages()

    for (let i = 1; i <= totalPages; i++) {
      this.doc.setPage(i)

      // Footer line
      this.doc.setDrawColor(COLORS.border[0], COLORS.border[1], COLORS.border[2])
      this.doc.line(this.margin, this.pageHeight - 15, this.pageWidth - this.margin, this.pageHeight - 15)

      // Confidentiality
      this.doc.setFont(FONT_FAMILIES.body, 'normal')
      this.doc.setFontSize(8)
      this.doc.setTextColor(COLORS.textMuted[0], COLORS.textMuted[1], COLORS.textMuted[2])
      const confidentiality = config.confidentiality || 'CONFIDENTIAL - For intended recipient only'
      this.doc.text(confidentiality, this.margin, this.pageHeight - 10)

      // Page number
      this.doc.text(`Page ${i} of ${totalPages}`, this.pageWidth - this.margin, this.pageHeight - 10, { align: 'right' })

      // Generator credit
      this.doc.text('Generated by Clean Energy Platform', this.pageWidth / 2, this.pageHeight - 10, { align: 'center' })
    }
  }
}

// ============================================================================
// Convenience Function
// ============================================================================

/**
 * Generate a rapid summary PDF
 */
export async function generateRapidSummaryPdf(
  result: RapidAssessmentResult,
  technologyName: string,
  config?: RapidSummaryConfig
): Promise<Blob> {
  const generator = new RapidSummaryGenerator()
  return generator.generate(result, technologyName, config)
}
