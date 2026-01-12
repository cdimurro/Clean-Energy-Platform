/**
 * TRL Progression Chart Component
 *
 * Displays historical TRL progression over time with milestones.
 */

'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'
import type { TRLLevel, TRLSublevel, TRLProgressPoint, TRLMilestone } from '@/types/trl'

interface TRLProgressionChartProps {
  progressPoints: TRLProgressPoint[]
  milestones?: TRLMilestone[]
  targetTRL?: TRLLevel
  className?: string
}

const TRL_COLORS: Record<TRLLevel, string> = {
  1: '#6b7280', // gray
  2: '#4b5563',
  3: '#3b82f6', // blue
  4: '#2563eb',
  5: '#6366f1', // indigo
  6: '#8b5cf6', // purple
  7: '#f59e0b', // amber
  8: '#f97316', // orange
  9: '#22c55e', // green
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function getNumericTRL(level: TRLLevel, sublevel: TRLSublevel): number {
  const sublevelValue = sublevel === 'a' ? 0 : sublevel === 'b' ? 0.33 : 0.67
  return level + sublevelValue
}

export function TRLProgressionChart({
  progressPoints,
  milestones = [],
  targetTRL,
  className,
}: TRLProgressionChartProps) {
  const chartRef = React.useRef<HTMLDivElement>(null)
  const [dimensions, setDimensions] = React.useState({ width: 0, height: 0 })

  React.useEffect(() => {
    if (!chartRef.current) return

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setDimensions({
          width: entry.contentRect.width,
          height: entry.contentRect.height,
        })
      }
    })

    resizeObserver.observe(chartRef.current)
    return () => resizeObserver.disconnect()
  }, [])

  if (progressPoints.length === 0) {
    return (
      <div className={cn('flex items-center justify-center h-48 bg-background-surface rounded-lg', className)}>
        <p className="text-foreground-muted">No progression data available</p>
      </div>
    )
  }

  const sortedPoints = [...progressPoints].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  )

  const minDate = new Date(sortedPoints[0].timestamp).getTime()
  const maxDate = new Date(sortedPoints[sortedPoints.length - 1].timestamp).getTime()
  const dateRange = maxDate - minDate || 1

  const padding = { top: 20, right: 20, bottom: 40, left: 50 }
  const chartWidth = dimensions.width - padding.left - padding.right
  const chartHeight = dimensions.height - padding.top - padding.bottom

  const getX = (timestamp: string) => {
    const date = new Date(timestamp).getTime()
    return padding.left + ((date - minDate) / dateRange) * chartWidth
  }

  const getY = (score: { level: TRLLevel; sublevel: TRLSublevel }) => {
    const numericTRL = getNumericTRL(score.level, score.sublevel)
    // Invert Y axis (higher TRL at top)
    return padding.top + (1 - (numericTRL - 1) / 8) * chartHeight
  }

  // Generate path data for the line
  const pathData = sortedPoints
    .map((point, idx) => {
      const x = getX(point.timestamp)
      const y = getY(point.score)
      return `${idx === 0 ? 'M' : 'L'} ${x} ${y}`
    })
    .join(' ')

  // Y-axis labels (TRL 1-9)
  const yAxisLabels = [1, 2, 3, 4, 5, 6, 7, 8, 9] as TRLLevel[]

  return (
    <div ref={chartRef} className={cn('w-full h-64', className)}>
      {dimensions.width > 0 && (
        <svg width={dimensions.width} height={dimensions.height}>
          {/* Grid lines */}
          <g className="text-border">
            {yAxisLabels.map((level) => {
              const y = getY({ level, sublevel: 'a' })
              return (
                <line
                  key={level}
                  x1={padding.left}
                  y1={y}
                  x2={dimensions.width - padding.right}
                  y2={y}
                  stroke="currentColor"
                  strokeDasharray="4 4"
                  strokeOpacity={0.3}
                />
              )
            })}
          </g>

          {/* Target TRL line */}
          {targetTRL && (
            <line
              x1={padding.left}
              y1={getY({ level: targetTRL, sublevel: 'a' })}
              x2={dimensions.width - padding.right}
              y2={getY({ level: targetTRL, sublevel: 'a' })}
              stroke="#22c55e"
              strokeWidth={2}
              strokeDasharray="8 4"
              strokeOpacity={0.5}
            />
          )}

          {/* Progress line */}
          <path
            d={pathData}
            fill="none"
            stroke="url(#progressGradient)"
            strokeWidth={3}
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Gradient definition */}
          <defs>
            <linearGradient id="progressGradient" x1="0%" y1="100%" x2="0%" y2="0%">
              <stop offset="0%" stopColor={TRL_COLORS[1]} />
              <stop offset="33%" stopColor={TRL_COLORS[4]} />
              <stop offset="66%" stopColor={TRL_COLORS[7]} />
              <stop offset="100%" stopColor={TRL_COLORS[9]} />
            </linearGradient>
          </defs>

          {/* Data points */}
          {sortedPoints.map((point, idx) => {
            const x = getX(point.timestamp)
            const y = getY(point.score)
            const color = TRL_COLORS[point.score.level]

            return (
              <g key={idx}>
                <circle
                  cx={x}
                  cy={y}
                  r={6}
                  fill={color}
                  stroke="white"
                  strokeWidth={2}
                  className="cursor-pointer hover:r-8 transition-all"
                />
                {/* Tooltip on hover would go here */}
              </g>
            )
          })}

          {/* Milestones */}
          {milestones
            .filter((m) => m.completedAt)
            .map((milestone, idx) => {
              const x = getX(milestone.completedAt!)
              const y = getY({ level: milestone.targetTRL, sublevel: 'a' })

              return (
                <g key={`milestone-${idx}`}>
                  <rect
                    x={x - 4}
                    y={y - 4}
                    width={8}
                    height={8}
                    fill="#8b5cf6"
                    transform={`rotate(45 ${x} ${y})`}
                    className="cursor-pointer"
                  />
                </g>
              )
            })}

          {/* Y-axis labels */}
          {yAxisLabels.map((level) => {
            const y = getY({ level, sublevel: 'a' })
            return (
              <text
                key={level}
                x={padding.left - 10}
                y={y}
                textAnchor="end"
                dominantBaseline="middle"
                className="fill-foreground-muted text-xs"
              >
                {level}
              </text>
            )
          })}

          {/* Y-axis title */}
          <text
            x={15}
            y={dimensions.height / 2}
            textAnchor="middle"
            dominantBaseline="middle"
            transform={`rotate(-90 15 ${dimensions.height / 2})`}
            className="fill-foreground-muted text-xs"
          >
            TRL Level
          </text>

          {/* X-axis labels */}
          <text
            x={padding.left}
            y={dimensions.height - 10}
            textAnchor="start"
            className="fill-foreground-muted text-xs"
          >
            {formatDate(sortedPoints[0].timestamp)}
          </text>
          <text
            x={dimensions.width - padding.right}
            y={dimensions.height - 10}
            textAnchor="end"
            className="fill-foreground-muted text-xs"
          >
            {formatDate(sortedPoints[sortedPoints.length - 1].timestamp)}
          </text>
        </svg>
      )}
    </div>
  )
}

/**
 * Compact timeline showing key TRL transitions
 */
interface TRLTimelineProps {
  progressPoints: TRLProgressPoint[]
  className?: string
}

export function TRLTimeline({ progressPoints, className }: TRLTimelineProps) {
  const sortedPoints = [...progressPoints].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  )

  // Only show points where level changed
  const significantPoints = sortedPoints.filter((point, idx, arr) => {
    if (idx === 0) return true
    return point.score.level !== arr[idx - 1].score.level
  })

  return (
    <div className={cn('relative', className)}>
      {/* Timeline line */}
      <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border" />

      {/* Timeline items */}
      <div className="space-y-4">
        {significantPoints.map((point, idx) => {
          const color = TRL_COLORS[point.score.level]

          return (
            <div key={idx} className="relative flex items-start gap-4 pl-10">
              {/* Dot */}
              <div
                className="absolute left-2 w-5 h-5 rounded-full border-2 border-background"
                style={{ backgroundColor: color }}
              />

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-foreground">
                    TRL {point.score.level}
                    {point.score.sublevel}
                  </span>
                  <span className="text-sm text-foreground-muted">
                    {formatDate(point.timestamp)}
                  </span>
                </div>
                {point.milestone && (
                  <p className="text-sm text-foreground-muted mt-0.5">
                    {point.milestone}
                  </p>
                )}
                {point.notes && (
                  <p className="text-sm text-foreground-muted mt-0.5">
                    {point.notes}
                  </p>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
